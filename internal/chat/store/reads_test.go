package store

import (
	"database/sql"
	"fmt"
	"testing"
	"time"

	"42chat/internal/chat/model"
	_ "github.com/lib/pq"
)

// ensureReadChatExists insere um chat de teste se não existir.
// Retorna o chat ID.
func ensureReadChatExists(t *testing.T, db *sql.DB, topic string) string {
	t.Helper()

	var chatID string
	err := db.QueryRow(`
		SELECT id FROM chats WHERE type = 'group' AND topic = $1 LIMIT 1
	`, topic).Scan(&chatID)

	if err == sql.ErrNoRows {
		// Create a new group chat
		chatID = model.NewID()
		_, err := db.Exec(`
			INSERT INTO chats (id, type, topic, created_at)
			VALUES ($1, 'group', $2, NOW())
		`, chatID, topic)
		if err != nil {
			t.Fatalf("ensureReadChatExists: create chat failed: %v", err)
		}
	} else if err != nil {
		t.Fatalf("ensureReadChatExists: query failed: %v", err)
	}

	return chatID
}

func TestReadStore_MarkRead_Upsert(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	store := &ReadStore{DB: db}
	ensureTestUsers(t, db, 8000)
	userID := 8000
	chatID := ensureReadChatExists(t, db, fmt.Sprintf("upsert-test-%d", time.Now().UnixNano()))

	t.Cleanup(func() {
		db.Exec("DELETE FROM chat_reads WHERE user_id = $1 AND chat_id = $2", userID, chatID)
		db.Exec("DELETE FROM chats WHERE id = $1", chatID)
	})

	// Act: First MarkRead
	err := store.MarkRead(chatID, userID)
	if err != nil {
		t.Fatalf("MarkRead(first) = %v", err)
	}

	var lastReadAt1 time.Time
	err = db.QueryRow(`
		SELECT last_read_at FROM chat_reads WHERE user_id = $1 AND chat_id = $2
	`, userID, chatID).Scan(&lastReadAt1)
	if err != nil {
		t.Fatalf("Query last_read_at(first) = %v", err)
	}

	// Sleep a bit to ensure different timestamp
	time.Sleep(100 * time.Millisecond)

	// Act: Second MarkRead (upsert)
	err = store.MarkRead(chatID, userID)
	if err != nil {
		t.Fatalf("MarkRead(second) = %v", err)
	}

	var lastReadAt2 time.Time
	err = db.QueryRow(`
		SELECT last_read_at FROM chat_reads WHERE user_id = $1 AND chat_id = $2
	`, userID, chatID).Scan(&lastReadAt2)
	if err != nil {
		t.Fatalf("Query last_read_at(second) = %v", err)
	}

	// Assert: second call should have updated the timestamp
	if !lastReadAt2.After(lastReadAt1) {
		t.Errorf("MarkRead(upsert): second call should update last_read_at, got same or older: %v vs %v", lastReadAt1, lastReadAt2)
	}
}

func TestReadStore_ListUserChatsWithUnread_BasicScenario(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	store := &ReadStore{DB: db}
	msgStore := &MessageStore{DB: db}
	chatStore := &ChatStore{DB: db}

	// Arrange: Create users A and B
	ensureTestUsers(t, db, 8001, 8002)
	userA := 8001
	userB := 8002

	// Create a group chat and add both users
	chat := model.Chat{
		Type:  model.ChatTypeGroup,
		Topic: fmt.Sprintf("unread-basic-%d", time.Now().UnixNano()),
	}

	result, err := chatStore.CreateChat(chat, []int{userA, userB})
	if err != nil {
		t.Fatalf("CreateChat() = %v", err)
	}
	chatID := result.ID

	t.Cleanup(func() {
		db.Exec("DELETE FROM chat_reads WHERE chat_id = $1", chatID)
		db.Exec("DELETE FROM messages WHERE chat_id = $1", chatID)
		db.Exec("DELETE FROM chat_members WHERE chat_id = $1", chatID)
		db.Exec("DELETE FROM chats WHERE id = $1", chatID)
	})

	// Mark the chat as read by user A (this sets last_read_at to NOW)
	err = store.MarkRead(chatID, userA)
	if err != nil {
		t.Fatalf("MarkRead(userA) = %v", err)
	}

	// Sleep to ensure messages are after the last_read_at
	time.Sleep(100 * time.Millisecond)

	// Send 3 messages from user B
	for i := 0; i < 3; i++ {
		_, err := msgStore.Send(chatID, userB, fmt.Sprintf("Message %d from B", i))
		if err != nil {
			t.Fatalf("Send(B, msg%d) = %v", i, err)
		}
	}

	// Act: List chats with unread for user A
	chatsWithUnread, err := store.ListUserChatsWithUnread(userA)
	if err != nil {
		t.Fatalf("ListUserChatsWithUnread(A) = %v", err)
	}

	// Assert: Find our test chat and verify unread count
	var testChat *model.ChatWithUnread
	for _, c := range chatsWithUnread {
		if c.ID == chatID {
			testChat = &c
			break
		}
	}

	if testChat == nil {
		t.Fatalf("ListUserChatsWithUnread(A): chat not found in list")
	}

	if testChat.UnreadCount != 3 {
		t.Errorf("ListUserChatsWithUnread(A): expected unread_count=3, got %d", testChat.UnreadCount)
	}

	// Act: Mark chat as read by user A again
	err = store.MarkRead(chatID, userA)
	if err != nil {
		t.Fatalf("MarkRead(userA, again) = %v", err)
	}

	// Act: List again
	chatsWithUnread2, err := store.ListUserChatsWithUnread(userA)
	if err != nil {
		t.Fatalf("ListUserChatsWithUnread(A, again) = %v", err)
	}

	// Assert: unread count should now be 0
	for _, c := range chatsWithUnread2 {
		if c.ID == chatID {
			if c.UnreadCount != 0 {
				t.Errorf("ListUserChatsWithUnread(A, after MarkRead): expected unread_count=0, got %d", c.UnreadCount)
			}
			break
		}
	}
}

func TestReadStore_ListUserChatsWithUnread_General(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	store := &ReadStore{DB: db}
	msgStore := &MessageStore{DB: db}

	// Arrange: Create test users
	ensureTestUsers(t, db, 8003, 8004)
	userC := 8003
	userD := 8004

	// General chat ID (from migration 003)
	generalChatID := "00000000-0000-7000-8000-000000000001"

	// Clean any existing reads for our test users
	t.Cleanup(func() {
		db.Exec("DELETE FROM chat_reads WHERE user_id IN ($1, $2)", userC, userD)
	})

	// Before any mark read, general should have all messages from other users as unread
	// Send some messages from userD in general
	for i := 0; i < 2; i++ {
		_, err := msgStore.Send(generalChatID, userD, fmt.Sprintf("General message %d", i))
		if err != nil {
			t.Fatalf("Send(general, userD) = %v", err)
		}
	}

	time.Sleep(50 * time.Millisecond)

	// Act: List chats for user C (who has never read general before)
	chatsWithUnread, err := store.ListUserChatsWithUnread(userC)
	if err != nil {
		t.Fatalf("ListUserChatsWithUnread(userC) = %v", err)
	}

	// Assert: General should be in the list with unread messages from userD
	var generalChat *model.ChatWithUnread
	for _, c := range chatsWithUnread {
		if c.ID == generalChatID {
			generalChat = &c
			break
		}
	}

	if generalChat == nil {
		t.Fatalf("ListUserChatsWithUnread(userC): general chat not found in list")
	}

	if generalChat.UnreadCount < 2 {
		t.Errorf("ListUserChatsWithUnread(userC): expected unread_count >= 2, got %d", generalChat.UnreadCount)
	}

	// Act: Mark general as read
	err = store.MarkRead(generalChatID, userC)
	if err != nil {
		t.Fatalf("MarkRead(general, userC) = %v", err)
	}

	// Act: List again
	chatsWithUnread2, err := store.ListUserChatsWithUnread(userC)
	if err != nil {
		t.Fatalf("ListUserChatsWithUnread(userC, again) = %v", err)
	}

	// Assert: General unread count should now be 0
	for _, c := range chatsWithUnread2 {
		if c.ID == generalChatID {
			if c.UnreadCount != 0 {
				t.Errorf("ListUserChatsWithUnread(userC, after MarkRead): expected unread_count=0, got %d", c.UnreadCount)
			}
			break
		}
	}
}

func TestReadStore_ListUserChatsWithUnread_OwnMessagesNotCounted(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	store := &ReadStore{DB: db}
	msgStore := &MessageStore{DB: db}
	chatStore := &ChatStore{DB: db}

	// Arrange: Create user E
	ensureTestUsers(t, db, 8005, 8006)
	userE := 8005
	userF := 8006

	// Create a group chat
	chat := model.Chat{
		Type:  model.ChatTypeGroup,
		Topic: fmt.Sprintf("own-messages-%d", time.Now().UnixNano()),
	}

	result, err := chatStore.CreateChat(chat, []int{userE, userF})
	if err != nil {
		t.Fatalf("CreateChat() = %v", err)
	}
	chatID := result.ID

	t.Cleanup(func() {
		db.Exec("DELETE FROM chat_reads WHERE chat_id = $1", chatID)
		db.Exec("DELETE FROM messages WHERE chat_id = $1", chatID)
		db.Exec("DELETE FROM chat_members WHERE chat_id = $1", chatID)
		db.Exec("DELETE FROM chats WHERE id = $1", chatID)
	})

	// Mark read by userE
	err = store.MarkRead(chatID, userE)
	if err != nil {
		t.Fatalf("MarkRead(userE) = %v", err)
	}

	time.Sleep(50 * time.Millisecond)

	// Send 2 messages from userE (own messages) and 2 from userF
	_, err = msgStore.Send(chatID, userE, "My message 1")
	if err != nil {
		t.Fatalf("Send(E, msg1) = %v", err)
	}

	_, err = msgStore.Send(chatID, userF, "F's message 1")
	if err != nil {
		t.Fatalf("Send(F, msg1) = %v", err)
	}

	_, err = msgStore.Send(chatID, userE, "My message 2")
	if err != nil {
		t.Fatalf("Send(E, msg2) = %v", err)
	}

	_, err = msgStore.Send(chatID, userF, "F's message 2")
	if err != nil {
		t.Fatalf("Send(F, msg2) = %v", err)
	}

	// Act: List with unread for userE
	chatsWithUnread, err := store.ListUserChatsWithUnread(userE)
	if err != nil {
		t.Fatalf("ListUserChatsWithUnread(E) = %v", err)
	}

	// Assert: Only messages from userF should count (2, not 4)
	var testChat *model.ChatWithUnread
	for _, c := range chatsWithUnread {
		if c.ID == chatID {
			testChat = &c
			break
		}
	}

	if testChat == nil {
		t.Fatalf("ListUserChatsWithUnread(E): chat not found")
	}

	if testChat.UnreadCount != 2 {
		t.Errorf("ListUserChatsWithUnread(E): expected unread_count=2 (only F's messages), got %d", testChat.UnreadCount)
	}
}

func TestReadStore_ListUserChatsWithUnread_SoftDeletedNotCounted(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	store := &ReadStore{DB: db}
	msgStore := &MessageStore{DB: db}
	chatStore := &ChatStore{DB: db}

	// Arrange: Create users G and H
	ensureTestUsers(t, db, 8007, 8008)
	userG := 8007
	userH := 8008

	// Create a group chat
	chat := model.Chat{
		Type:  model.ChatTypeGroup,
		Topic: fmt.Sprintf("soft-delete-%d", time.Now().UnixNano()),
	}

	result, err := chatStore.CreateChat(chat, []int{userG, userH})
	if err != nil {
		t.Fatalf("CreateChat() = %v", err)
	}
	chatID := result.ID

	t.Cleanup(func() {
		db.Exec("DELETE FROM chat_reads WHERE chat_id = $1", chatID)
		db.Exec("DELETE FROM messages WHERE chat_id = $1", chatID)
		db.Exec("DELETE FROM chat_members WHERE chat_id = $1", chatID)
		db.Exec("DELETE FROM chats WHERE id = $1", chatID)
	})

	// Mark read by userG
	err = store.MarkRead(chatID, userG)
	if err != nil {
		t.Fatalf("MarkRead(userG) = %v", err)
	}

	time.Sleep(50 * time.Millisecond)

	// Send 3 messages from userH
	_, err = msgStore.Send(chatID, userH, "Message 1")
	if err != nil {
		t.Fatalf("Send(H, msg1) = %v", err)
	}

	msg2, err := msgStore.Send(chatID, userH, "Message 2")
	if err != nil {
		t.Fatalf("Send(H, msg2) = %v", err)
	}

	_, err = msgStore.Send(chatID, userH, "Message 3")
	if err != nil {
		t.Fatalf("Send(H, msg3) = %v", err)
	}

	// Soft delete msg2
	err = msgStore.SoftDelete(msg2.ID)
	if err != nil {
		t.Fatalf("SoftDelete(msg2) = %v", err)
	}

	// Act: List with unread for userG
	chatsWithUnread, err := store.ListUserChatsWithUnread(userG)
	if err != nil {
		t.Fatalf("ListUserChatsWithUnread(G) = %v", err)
	}

	// Assert: Only non-deleted messages should count (2, not 3)
	var testChat *model.ChatWithUnread
	for _, c := range chatsWithUnread {
		if c.ID == chatID {
			testChat = &c
			break
		}
	}

	if testChat == nil {
		t.Fatalf("ListUserChatsWithUnread(G): chat not found")
	}

	if testChat.UnreadCount != 2 {
		t.Errorf("ListUserChatsWithUnread(G): expected unread_count=2 (msg1 + msg3, not deleted msg2), got %d", testChat.UnreadCount)
	}
}
