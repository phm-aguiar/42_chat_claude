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

// testDBMessages retorna uma conexão para testes de mensagens.
// Se não disponível, salta os testes.
func testDBMessages(t *testing.T) *sql.DB {
	t.Helper()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		t.Skip("DATABASE_URL not set")
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		t.Skipf("DB open failed: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		db.Close()
		t.Skipf("DB unavailable: %v", err)
	}

	return db
}

func TestMessageStore_Send(t *testing.T) {
	db := testDBMessages(t)
	defer db.Close()

	// Arrange: create a chat first
	chatStore := &ChatStore{DB: db}
	chat := model.Chat{
		Type:  model.ChatTypeGroup,
		Topic: fmt.Sprintf("Send test %d", time.Now().UnixNano()),
	}

	result, err := chatStore.CreateChat(chat, nil)
	if err != nil {
		t.Fatalf("CreateChat() = %v", err)
	}
	chatID := result.ID

	// Cleanup
	t.Cleanup(func() {
		db.Exec("DELETE FROM messages WHERE chat_id = $1::uuid", chatID)
		db.Exec("DELETE FROM chat_members WHERE chat_id = $1", chatID)
		db.Exec("DELETE FROM chats WHERE id = $1", chatID)
	})

	msgStore := &MessageStore{DB: db}

	// Act: send a message
	ensureTestUsers(t, db, 7000)
	userID := 7000
	content := "Hello, World!"
	msg, err := msgStore.Send(chatID, userID, content)
	if err != nil {
		t.Fatalf("Send() = %v", err)
	}

	// Assert: message was created
	if msg.ID == "" {
		t.Error("Send(): ID not set")
	}
	if msg.Content != content {
		t.Errorf("Send(): Content mismatch: got %q, want %q", msg.Content, content)
	}
	if msg.ChatID != chatID {
		t.Errorf("Send(): ChatID mismatch: got %q, want %q", msg.ChatID, chatID)
	}
	if msg.UserID != userID {
		t.Errorf("Send(): UserID mismatch: got %d, want %d", msg.UserID, userID)
	}
	if msg.CreatedAt.IsZero() {
		t.Error("Send(): CreatedAt not set")
	}
}

func TestMessageStore_ListByChat(t *testing.T) {
	db := testDBMessages(t)
	defer db.Close()
	ensureTestUsers(t, db, 7001)

	// Arrange: create a chat and several messages
	chatStore := &ChatStore{DB: db}
	chat := model.Chat{
		Type:  model.ChatTypeGroup,
		Topic: fmt.Sprintf("List test %d", time.Now().UnixNano()),
	}

	result, err := chatStore.CreateChat(chat, nil)
	if err != nil {
		t.Fatalf("CreateChat() = %v", err)
	}
	chatID := result.ID

	// Cleanup
	t.Cleanup(func() {
		db.Exec("DELETE FROM messages WHERE chat_id = $1::uuid", chatID)
		db.Exec("DELETE FROM chat_members WHERE chat_id = $1", chatID)
		db.Exec("DELETE FROM chats WHERE id = $1", chatID)
	})

	msgStore := &MessageStore{DB: db}

	// Create 5 messages
	messageIDs := []string{}
	for i := 0; i < 5; i++ {
		msg, err := msgStore.Send(chatID, 7001, fmt.Sprintf("Message %d", i))
		if err != nil {
			t.Fatalf("Send() = %v", err)
		}
		messageIDs = append(messageIDs, msg.ID)
		time.Sleep(10 * time.Millisecond) // Ensure different timestamps
	}

	// Act: list messages with cursor
	now := time.Now().Add(1 * time.Second)
	messages, hasMore, err := msgStore.ListByChat(chatID, now, 10)
	if err != nil {
		t.Fatalf("ListByChat() = %v", err)
	}

	// Assert: should return all 5 messages, no more
	if len(messages) != 5 {
		t.Errorf("ListByChat(): expected 5 messages, got %d", len(messages))
	}
	if hasMore {
		t.Errorf("ListByChat(): hasMore should be false for 5 messages with limit 10")
	}

	// Test pagination: limit 3 should have hasMore=true
	messages2, hasMore2, err := msgStore.ListByChat(chatID, now, 3)
	if err != nil {
		t.Fatalf("ListByChat(limit=3) = %v", err)
	}

	if len(messages2) != 3 {
		t.Errorf("ListByChat(limit=3): expected 3 messages, got %d", len(messages2))
	}
	if !hasMore2 {
		t.Errorf("ListByChat(limit=3): hasMore should be true (2 more messages available)")
	}

	// Test cursor: before the first message timestamp should return fewer
	if len(messages) > 0 {
		beforeFirstMsg := messages[len(messages)-1].CreatedAt // Messages are in reverse order
		messages3, _, err := msgStore.ListByChat(chatID, beforeFirstMsg, 10)
		if err != nil {
			t.Fatalf("ListByChat(cursor) = %v", err)
		}

		if len(messages3) >= len(messages) {
			t.Errorf("ListByChat(cursor): messages before timestamp should be fewer")
		}
	}
}

func TestMessageStore_GetChatID(t *testing.T) {
	db := testDBMessages(t)
	defer db.Close()
	ensureTestUsers(t, db, 7002)

	// Arrange: create a chat and message
	chatStore := &ChatStore{DB: db}
	chat := model.Chat{
		Type:  model.ChatTypeGroup,
		Topic: fmt.Sprintf("GetChatID test %d", time.Now().UnixNano()),
	}

	result, err := chatStore.CreateChat(chat, nil)
	if err != nil {
		t.Fatalf("CreateChat() = %v", err)
	}
	chatID := result.ID

	// Cleanup
	t.Cleanup(func() {
		db.Exec("DELETE FROM messages WHERE chat_id = $1::uuid", chatID)
		db.Exec("DELETE FROM chat_members WHERE chat_id = $1", chatID)
		db.Exec("DELETE FROM chats WHERE id = $1", chatID)
	})

	msgStore := &MessageStore{DB: db}

	// Create a message
	msg, err := msgStore.Send(chatID, 7002, "Test message")
	if err != nil {
		t.Fatalf("Send() = %v", err)
	}

	// Act: get chat ID by message ID
	retrievedChatID, err := msgStore.GetChatID(msg.ID)
	if err != nil {
		t.Fatalf("GetChatID() = %v", err)
	}

	// Assert: chat ID should match
	if retrievedChatID != chatID {
		t.Errorf("GetChatID(): expected %q, got %q", chatID, retrievedChatID)
	}

	// Test with non-existent message
	_, err = msgStore.GetChatID("00000000-0000-0000-0000-000000000000")
	if err != sql.ErrNoRows {
		t.Errorf("GetChatID(non-existent): expected sql.ErrNoRows, got %v", err)
	}
}

func TestMessageStore_SoftDelete(t *testing.T) {
	db := testDBMessages(t)
	defer db.Close()
	ensureTestUsers(t, db, 7003)

	// Arrange: create a chat and message
	chatStore := &ChatStore{DB: db}
	chat := model.Chat{
		Type:  model.ChatTypeGroup,
		Topic: fmt.Sprintf("SoftDelete test %d", time.Now().UnixNano()),
	}

	result, err := chatStore.CreateChat(chat, nil)
	if err != nil {
		t.Fatalf("CreateChat() = %v", err)
	}
	chatID := result.ID

	// Cleanup
	t.Cleanup(func() {
		db.Exec("DELETE FROM messages WHERE chat_id = $1::uuid", chatID)
		db.Exec("DELETE FROM chat_members WHERE chat_id = $1", chatID)
		db.Exec("DELETE FROM chats WHERE id = $1", chatID)
	})

	msgStore := &MessageStore{DB: db}

	// Create a message
	msg, err := msgStore.Send(chatID, 7003, "To be deleted")
	if err != nil {
		t.Fatalf("Send() = %v", err)
	}

	// Act: soft delete the message
	err = msgStore.SoftDelete(msg.ID)
	if err != nil {
		t.Fatalf("SoftDelete() = %v", err)
	}

	// Assert: message should appear as tombstone in ListByChat
	now := time.Now().Add(1 * time.Second)
	messages, _, err := msgStore.ListByChat(chatID, now, 10)
	if err != nil {
		t.Fatalf("ListByChat() = %v", err)
	}

	if len(messages) != 1 {
		t.Fatalf("ListByChat(): expected 1 message, got %d", len(messages))
	}

	if messages[0].Content != "[mensagem removida]" {
		t.Errorf("SoftDelete(): expected tombstone content, got %q", messages[0].Content)
	}

	// Try to soft delete again - should fail
	err = msgStore.SoftDelete(msg.ID)
	if err == nil {
		t.Error("SoftDelete(already deleted): should return error")
	}
}

func TestMessageStore_ListByChat_DefaultLimit(t *testing.T) {
	db := testDBMessages(t)
	defer db.Close()
	ensureTestUsers(t, db, 7004)

	// Arrange: create a chat and messages
	chatStore := &ChatStore{DB: db}
	chat := model.Chat{
		Type:  model.ChatTypeGroup,
		Topic: fmt.Sprintf("DefaultLimit test %d", time.Now().UnixNano()),
	}

	result, err := chatStore.CreateChat(chat, nil)
	if err != nil {
		t.Fatalf("CreateChat() = %v", err)
	}
	chatID := result.ID

	// Cleanup
	t.Cleanup(func() {
		db.Exec("DELETE FROM messages WHERE chat_id = $1::uuid", chatID)
		db.Exec("DELETE FROM chat_members WHERE chat_id = $1", chatID)
		db.Exec("DELETE FROM chats WHERE id = $1", chatID)
	})

	msgStore := &MessageStore{DB: db}

	// Create 10 messages
	for i := 0; i < 10; i++ {
		_, err := msgStore.Send(chatID, 7004, fmt.Sprintf("Message %d", i))
		if err != nil {
			t.Fatalf("Send() = %v", err)
		}
		time.Sleep(5 * time.Millisecond)
	}

	// Act: list with invalid limit (should use default 50)
	now := time.Now().Add(1 * time.Second)
	messages, _, err := msgStore.ListByChat(chatID, now, -1)
	if err != nil {
		t.Fatalf("ListByChat(limit=-1) = %v", err)
	}

	// Assert: should get all 10 messages (default limit is 50)
	if len(messages) != 10 {
		t.Errorf("ListByChat(default limit): expected 10 messages, got %d", len(messages))
	}

	// Test with limit > 100 (should clamp to 100, but won't matter here)
	messages2, _, err := msgStore.ListByChat(chatID, now, 150)
	if err != nil {
		t.Fatalf("ListByChat(limit=150) = %v", err)
	}

	if len(messages2) != 10 {
		t.Errorf("ListByChat(limit=150): expected 10 messages, got %d", len(messages2))
	}
}
