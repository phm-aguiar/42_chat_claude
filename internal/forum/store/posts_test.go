package store

import (
	"database/sql"
	"fmt"
	"testing"
	"time"

	"42chat/internal/forum/model"
)

func setupTestThread(t *testing.T, db *sql.DB) (threadID string, cleanup func()) {
	t.Helper()

	boardStore := &BoardStore{DB: db}
	slug := fmt.Sprintf("test-board-%d", time.Now().UnixNano())
	b := &model.Board{
		Slug:        slug,
		Name:        "Test Board",
		Description: "For post tests",
		OwnerID:     intPtr(42),
		SFW:         true,
		Theme:       "dark",
		IsLocked:    false,
	}

	if err := boardStore.Create(b); err != nil {
		t.Fatalf("Failed to create test board: %v", err)
	}

	threadStore := &ThreadStore{DB: db}
	th := &model.Thread{
		BoardID:   b.ID,
		AuthorID:  42,
		Title:     fmt.Sprintf("Test Thread %d", time.Now().UnixNano()),
		Content:   "Thread for post tests",
		IsPinned:  false,
		IsLocked:  false,
		PostCount: 0,
	}

	if err := threadStore.Create(th); err != nil {
		t.Fatalf("Failed to create test thread: %v", err)
	}

	cleanup = func() {
		db.Exec("DELETE FROM posts WHERE thread_id = $1", th.ID)
		db.Exec("DELETE FROM threads WHERE id = $1", th.ID)
		db.Exec("DELETE FROM boards WHERE id = $1", b.ID)
	}

	return th.ID, cleanup
}

func TestPostStore_Create_and_GetByID(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	threadID, cleanup := setupTestThread(t, db)
	defer cleanup()

	store := &PostStore{DB: db}

	// Arrange
	p := &model.Post{
		ThreadID: threadID,
		AuthorID: 42,
		Content:  "This is a test post",
	}

	// Cleanup: delete post after test
	t.Cleanup(func() {
		db.Exec("DELETE FROM posts WHERE id = $1", p.ID)
	})

	// Act: create
	if err := store.Create(p); err != nil {
		t.Fatalf("Create() = %v", err)
	}

	// Assert: ID and CreatedAt were set
	if p.ID == "" {
		t.Error("Create() did not set ID")
	}
	if p.CreatedAt.IsZero() {
		t.Error("Create() did not set CreatedAt")
	}

	// Act: retrieve
	retrieved, err := store.GetByID(p.ID)
	if err != nil {
		t.Fatalf("GetByID() = %v", err)
	}

	// Assert: fields match
	if retrieved.ID != p.ID {
		t.Errorf("ID mismatch: got %q, want %q", retrieved.ID, p.ID)
	}
	if retrieved.Content != "This is a test post" {
		t.Errorf("Content mismatch: got %q, want %q", retrieved.Content, "This is a test post")
	}
	if retrieved.AuthorID != 42 {
		t.Errorf("AuthorID mismatch: got %d, want 42", retrieved.AuthorID)
	}
	if retrieved.ThreadID != threadID {
		t.Errorf("ThreadID mismatch: got %q, want %q", retrieved.ThreadID, threadID)
	}
}

func TestPostStore_Create_EmptyContent(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	threadID, cleanup := setupTestThread(t, db)
	defer cleanup()

	store := &PostStore{DB: db}

	// Arrange: post with empty content
	p := &model.Post{
		ThreadID: threadID,
		AuthorID: 42,
		Content:  "", // empty
	}

	// Act
	err := store.Create(p)

	// Assert: error expected
	if err == nil {
		t.Error("Create() with empty content = nil, want error")
	}
}

func TestPostStore_Create_ContentTooLong(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	threadID, cleanup := setupTestThread(t, db)
	defer cleanup()

	store := &PostStore{DB: db}

	// Arrange: content > 10000 chars
	p := &model.Post{
		ThreadID: threadID,
		AuthorID: 42,
		Content:  string(make([]byte, 10001)), // > 10000
	}

	// Act
	err := store.Create(p)

	// Assert: error expected
	if err == nil {
		t.Error("Create() with long content = nil, want error")
	}
}

func TestPostStore_ListByThread_ChronologicalOrder(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	threadID, cleanup := setupTestThread(t, db)
	defer cleanup()

	store := &PostStore{DB: db}

	// Arrange: create 3 posts with delays
	p1 := &model.Post{
		ThreadID: threadID,
		AuthorID: 42,
		Content:  "First post",
	}

	if err := store.Create(p1); err != nil {
		t.Fatalf("Create p1 = %v", err)
	}
	t.Cleanup(func() { db.Exec("DELETE FROM posts WHERE id = $1", p1.ID) })

	time.Sleep(10 * time.Millisecond)

	p2 := &model.Post{
		ThreadID: threadID,
		AuthorID: 42,
		Content:  "Second post",
	}

	if err := store.Create(p2); err != nil {
		t.Fatalf("Create p2 = %v", err)
	}
	t.Cleanup(func() { db.Exec("DELETE FROM posts WHERE id = $1", p2.ID) })

	time.Sleep(10 * time.Millisecond)

	p3 := &model.Post{
		ThreadID: threadID,
		AuthorID: 42,
		Content:  "Third post",
	}

	if err := store.Create(p3); err != nil {
		t.Fatalf("Create p3 = %v", err)
	}
	t.Cleanup(func() { db.Exec("DELETE FROM posts WHERE id = $1", p3.ID) })

	// Act: list
	posts, err := store.ListByThread(threadID)
	if err != nil {
		t.Fatalf("ListByThread() = %v", err)
	}

	// Assert: posts in chronological order
	if len(posts) < 3 {
		t.Errorf("Expected at least 3 posts, got %d", len(posts))
	} else {
		if posts[0].ID != p1.ID {
			t.Errorf("First post mismatch: got %s, want %s", posts[0].ID, p1.ID)
		}
		if posts[1].ID != p2.ID {
			t.Errorf("Second post mismatch: got %s, want %s", posts[1].ID, p2.ID)
		}
		if posts[2].ID != p3.ID {
			t.Errorf("Third post mismatch: got %s, want %s", posts[2].ID, p3.ID)
		}
	}
}

func TestPostStore_Create_InvalidReplyToFK(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	threadID, cleanup := setupTestThread(t, db)
	defer cleanup()

	store := &PostStore{DB: db}

	// Arrange: post with invalid reply_to (non-existent post ID)
	invalidReplyTo := "00000000-0000-0000-0000-000000000000" // doesn't exist
	p := &model.Post{
		ThreadID: threadID,
		AuthorID: 42,
		Content:  "Reply to non-existent",
		ReplyTo:  &invalidReplyTo,
	}

	// Cleanup: if somehow it gets created, delete it
	t.Cleanup(func() {
		if p.ID != "" {
			db.Exec("DELETE FROM posts WHERE id = $1", p.ID)
		}
	})

	// Act
	err := store.Create(p)

	// Assert: FK constraint error expected
	if err == nil {
		t.Error("Create() with invalid reply_to FK = nil, want error")
	}
}

func TestPostStore_SoftDelete_RemovesFromList(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	threadID, cleanup := setupTestThread(t, db)
	defer cleanup()

	store := &PostStore{DB: db}

	// Arrange: create 2 posts
	p1 := &model.Post{
		ThreadID: threadID,
		AuthorID: 42,
		Content:  "Active post",
	}

	if err := store.Create(p1); err != nil {
		t.Fatalf("Create p1 = %v", err)
	}
	t.Cleanup(func() { db.Exec("DELETE FROM posts WHERE id = $1", p1.ID) })

	p2 := &model.Post{
		ThreadID: threadID,
		AuthorID: 42,
		Content:  "Deleted post",
	}

	if err := store.Create(p2); err != nil {
		t.Fatalf("Create p2 = %v", err)
	}
	t.Cleanup(func() { db.Exec("DELETE FROM posts WHERE id = $1", p2.ID) })

	// Act: soft delete p2
	if err := store.SoftDelete(p2.ID); err != nil {
		t.Fatalf("SoftDelete() = %v", err)
	}

	// Act: list
	posts, err := store.ListByThread(threadID)
	if err != nil {
		t.Fatalf("ListByThread() = %v", err)
	}

	// Assert: p2 should not appear
	for _, p := range posts {
		if p.ID == p2.ID {
			t.Error("Soft-deleted post appeared in list")
		}
	}

	// Assert: p1 should still be there
	found := false
	for _, p := range posts {
		if p.ID == p1.ID {
			found = true
			break
		}
	}
	if !found {
		t.Error("Active post not found in list")
	}
}

func TestPostStore_GetByID_NotFound(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	store := &PostStore{DB: db}

	// Act: try to get non-existent post
	_, err := store.GetByID("00000000-0000-0000-0000-000000000000")

	// Assert: error expected
	if err == nil {
		t.Error("GetByID() with non-existent ID = nil, want error")
	}
}
