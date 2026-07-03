package store

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"testing"
	"time"

	"42chat/internal/chat/model"
	_ "github.com/lib/pq"
)

// testDB retorna uma conexão para testes. Se não disponível, salta os testes.
// Lê DATABASE_URL do env com timeout 2s.
func testDB(t *testing.T) *sql.DB {
	t.Helper()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		t.Skip("DATABASE_URL not set")
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		t.Skipf("DB open failed: %v", err)
	}

	// Timeout 2s para Ping
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		db.Close()
		t.Skipf("DB unavailable: %v", err)
	}

	return db
}

// ensureTestUsers faz upsert de usuários de teste (FK users.id) e agenda a limpeza.
// Logins usam prefixo test_u<id> para não colidir com dados reais.
func ensureTestUsers(t *testing.T, db *sql.DB, ids ...int) {
	t.Helper()
	for _, id := range ids {
		_, err := db.Exec(`
			INSERT INTO users (id, login) VALUES ($1, $2)
			ON CONFLICT (id) DO NOTHING
		`, id, fmt.Sprintf("test_u%d", id))
		if err != nil {
			t.Fatalf("ensureTestUsers(%d): %v", id, err)
		}
	}
	t.Cleanup(func() {
		for _, id := range ids {
			db.Exec("DELETE FROM chat_members WHERE user_id = $1", id)
			db.Exec("DELETE FROM messages WHERE user_id = $1", id)
			db.Exec("DELETE FROM chats WHERE created_by = $1", id)
			db.Exec("DELETE FROM users WHERE id = $1 AND login LIKE 'test_u%'", id)
		}
	})
}

func TestChatStore_CreateChat(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	store := &ChatStore{DB: db}

	// Arrange: create a group chat
	ensureTestUsers(t, db, 42, 100, 101, 102)
	creatorID := 42
	chat := model.Chat{
		Type:      model.ChatTypeGroup,
		Topic:     "Test Group",
		CreatedBy: &creatorID,
	}

	memberIDs := []int{100, 101, 102}

	// Cleanup
	t.Cleanup(func() {
		db.Exec("DELETE FROM chat_members WHERE chat_id = $1", chat.ID)
		db.Exec("DELETE FROM chats WHERE id = $1", chat.ID)
	})

	// Act: create chat
	result, err := store.CreateChat(chat, memberIDs)
	if err != nil {
		t.Fatalf("CreateChat() = %v", err)
	}

	// Assert: ID and CreatedAt were set
	if result.ID == "" {
		t.Error("CreateChat() did not set ID")
	}
	if result.CreatedAt.IsZero() {
		t.Error("CreateChat() did not set CreatedAt")
	}

	// Store the ID for cleanup
	chat.ID = result.ID

	// Verify the chat exists in DB
	retrieved, err := store.GetChat(result.ID)
	if err != nil {
		t.Fatalf("GetChat() = %v", err)
	}

	if retrieved.ID != result.ID {
		t.Errorf("ID mismatch: got %q, want %q", retrieved.ID, result.ID)
	}
	if retrieved.Type != model.ChatTypeGroup {
		t.Errorf("Type mismatch: got %q, want %q", retrieved.Type, model.ChatTypeGroup)
	}
	if retrieved.Topic != "Test Group" {
		t.Errorf("Topic mismatch: got %q, want %q", retrieved.Topic, "Test Group")
	}

	// Verify members were created (creator + memberIDs)
	members, err := store.GetChatMembers(result.ID)
	if err != nil {
		t.Fatalf("GetChatMembers() = %v", err)
	}

	// Should have 4 members: creator + 3 members (but creator might be in memberIDs)
	// Create expects 1 (creator as owner) + (memberIDs without duplicate)
	expectedCount := 4 // creatorID + 3 others
	if len(members) != expectedCount {
		t.Errorf("Members count: got %d, want %d", len(members), expectedCount)
	}

	// Verify creator is an owner
	foundOwner := false
	for _, m := range members {
		if m.UserID == creatorID && m.Role == model.RoleOwner {
			foundOwner = true
			break
		}
	}
	if !foundOwner {
		t.Errorf("Creator should be an owner")
	}
}

func TestChatStore_FindOneOnOne(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	store := &ChatStore{DB: db}

	// Arrange: create a oneOnOne chat
	ensureTestUsers(t, db, 1000, 2000)
	userA := 1000
	userB := 2000

	// Purga 1:1 órfãos entre os users de teste (estado residual de runs anteriores)
	db.Exec(`
		DELETE FROM chats WHERE type = 'oneOnOne' AND id IN (
			SELECT chat_id FROM chat_members WHERE user_id IN ($1, $2)
			GROUP BY chat_id HAVING COUNT(DISTINCT user_id) = 2
		)
	`, userA, userB)

	chat := model.Chat{
		Type: model.ChatTypeOneOnOne,
	}

	// Cleanup
	t.Cleanup(func() {
		if chat.ID != "" {
			db.Exec("DELETE FROM chat_members WHERE chat_id = $1", chat.ID)
			db.Exec("DELETE FROM chats WHERE id = $1", chat.ID)
		}
	})

	// Create the oneOnOne chat
	result, err := store.CreateChat(chat, []int{userA, userB})
	if err != nil {
		t.Fatalf("CreateChat() = %v", err)
	}
	chat.ID = result.ID

	// Act: find the oneOnOne chat
	found, exists, err := store.FindOneOnOne(userA, userB)
	if err != nil {
		t.Fatalf("FindOneOnOne() = %v", err)
	}

	// Assert: chat should be found
	if !exists {
		t.Error("FindOneOnOne: expected to find chat, but not found")
	}
	if found.ID != chat.ID {
		t.Errorf("FindOneOnOne: ID mismatch: got %q, want %q", found.ID, chat.ID)
	}
	if found.Type != model.ChatTypeOneOnOne {
		t.Errorf("FindOneOnOne: Type mismatch: got %q, want %q", found.Type, model.ChatTypeOneOnOne)
	}

	// Test with reversed userIDs
	found2, exists2, err := store.FindOneOnOne(userB, userA)
	if err != nil {
		t.Fatalf("FindOneOnOne(reversed) = %v", err)
	}
	if !exists2 {
		t.Error("FindOneOnOne(reversed): expected to find chat with reversed user IDs")
	}
	if found2.ID != chat.ID {
		t.Errorf("FindOneOnOne(reversed): ID mismatch")
	}

	// Test with non-existent users
	notFound, exists3, err := store.FindOneOnOne(999, 888)
	if err != nil {
		t.Fatalf("FindOneOnOne(non-existent) = %v", err)
	}
	if exists3 {
		t.Errorf("FindOneOnOne: should not find chat for non-existent users")
	}
	if notFound.ID != "" {
		t.Errorf("FindOneOnOne: should return zero chat when not found")
	}
}

func TestChatStore_ListUserChats(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	store := &ChatStore{DB: db}

	// Arrange: create a user and several chats
	ensureTestUsers(t, db, 5000)
	userID := 5000
	testChatID1 := ""
	testChatID2 := ""

	// Create group chat with user
	chat1 := model.Chat{
		Type:  model.ChatTypeGroup,
		Topic: fmt.Sprintf("Group %d", time.Now().UnixNano()),
	}
	result1, err := store.CreateChat(chat1, []int{userID})
	if err != nil {
		t.Fatalf("CreateChat 1 = %v", err)
	}
	testChatID1 = result1.ID

	// Create another group chat with user
	chat2 := model.Chat{
		Type:  model.ChatTypeGroup,
		Topic: fmt.Sprintf("Group 2 %d", time.Now().UnixNano()),
	}
	result2, err := store.CreateChat(chat2, []int{userID})
	if err != nil {
		t.Fatalf("CreateChat 2 = %v", err)
	}
	testChatID2 = result2.ID

	// Cleanup
	t.Cleanup(func() {
		if testChatID1 != "" {
			db.Exec("DELETE FROM chat_members WHERE chat_id = $1", testChatID1)
			db.Exec("DELETE FROM chats WHERE id = $1", testChatID1)
		}
		if testChatID2 != "" {
			db.Exec("DELETE FROM chat_members WHERE chat_id = $1", testChatID2)
			db.Exec("DELETE FROM chats WHERE id = $1", testChatID2)
		}
	})

	// Act: list user's chats
	chats, err := store.ListUserChats(userID)
	if err != nil {
		t.Fatalf("ListUserChats() = %v", err)
	}

	// Assert: should contain the created chats and general
	foundChat1 := false
	foundChat2 := false
	foundGeneral := false

	for _, c := range chats {
		if c.ID == testChatID1 {
			foundChat1 = true
		}
		if c.ID == testChatID2 {
			foundChat2 = true
		}
		if c.Type == model.ChatTypeGeneral {
			foundGeneral = true
		}
	}

	if !foundChat1 {
		t.Errorf("ListUserChats: should contain chat1")
	}
	if !foundChat2 {
		t.Errorf("ListUserChats: should contain chat2")
	}
	if !foundGeneral {
		t.Errorf("ListUserChats: should always include general chat")
	}
}

func TestChatStore_GetChat_NotFound(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	store := &ChatStore{DB: db}

	// Act: try to get a non-existent chat
	_, err := store.GetChat("00000000-0000-0000-0000-000000000000")

	// Assert: should return an error
	if err == nil {
		t.Error("GetChat: should return error for non-existent chat")
	}
}

func TestChatStore_GetChatMembers(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	store := &ChatStore{DB: db}

	// Arrange: create a chat with multiple members
	ensureTestUsers(t, db, 6000, 6001, 6002)
	creatorID := 6000
	chat := model.Chat{
		Type:      model.ChatTypeGroup,
		Topic:     fmt.Sprintf("Members test %d", time.Now().UnixNano()),
		CreatedBy: &creatorID,
	}

	memberIDs := []int{6001, 6002}

	result, err := store.CreateChat(chat, memberIDs)
	if err != nil {
		t.Fatalf("CreateChat() = %v", err)
	}
	chat.ID = result.ID

	// Cleanup
	t.Cleanup(func() {
		db.Exec("DELETE FROM chat_members WHERE chat_id = $1", chat.ID)
		db.Exec("DELETE FROM chats WHERE id = $1", chat.ID)
	})

	// Act: get members
	members, err := store.GetChatMembers(chat.ID)
	if err != nil {
		t.Fatalf("GetChatMembers() = %v", err)
	}

	// Assert: should have 3 members (creator + 2 others)
	if len(members) != 3 {
		t.Errorf("GetChatMembers: expected 3 members, got %d", len(members))
	}

	// Verify roles
	creatorFound := false
	for _, m := range members {
		if m.UserID == creatorID && m.Role == model.RoleOwner {
			creatorFound = true
		}
	}
	if !creatorFound {
		t.Errorf("GetChatMembers: creator should be owner")
	}
}
