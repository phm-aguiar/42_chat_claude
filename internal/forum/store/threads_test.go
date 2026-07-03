package store

import (
	"database/sql"
	"fmt"
	"testing"
	"time"

	"42chat/internal/forum/model"
)

func setupTestBoard(t *testing.T, db *sql.DB) (boardID string, cleanup func()) {
	t.Helper()

	boardStore := &BoardStore{DB: db}
	slug := fmt.Sprintf("test-board-%d", time.Now().UnixNano())
	b := &model.Board{
		Slug:        slug,
		Name:        "Test Board",
		Description: "For thread tests",
		OwnerID:     intPtr(42),
		SFW:         true,
		Theme:       "dark",
		IsLocked:    false,
	}

	if err := boardStore.Create(b); err != nil {
		t.Fatalf("Failed to create test board: %v", err)
	}

	cleanup = func() {
		db.Exec("DELETE FROM boards WHERE id = $1", b.ID)
	}

	return b.ID, cleanup
}

func TestThreadStore_Create_and_GetByID(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	boardID, cleanup := setupTestBoard(t, db)
	defer cleanup()

	store := &ThreadStore{DB: db}

	// Arrange
	title := fmt.Sprintf("Test Thread %d", time.Now().UnixNano())
	th := &model.Thread{
		BoardID:   boardID,
		AuthorID:  42,
		Title:     title,
		Content:   "This is test content",
		Tags:      []string{"test", "golang"},
		IsPinned:  false,
		IsLocked:  false,
		PostCount: 0,
	}

	// Cleanup
	t.Cleanup(func() {
		db.Exec("DELETE FROM threads WHERE id = $1", th.ID)
	})

	// Act: create
	if err := store.Create(th); err != nil {
		t.Fatalf("Create() = %v", err)
	}

	// Assert: ID and timestamps set
	if th.ID == "" {
		t.Error("Create() did not set ID")
	}
	if th.CreatedAt.IsZero() {
		t.Error("Create() did not set CreatedAt")
	}
	if th.LastPostAt.IsZero() {
		t.Error("Create() did not set LastPostAt")
	}

	// Act: retrieve
	retrieved, err := store.GetByID(th.ID)
	if err != nil {
		t.Fatalf("GetByID() = %v", err)
	}

	// Assert: fields match
	if retrieved.Title != title {
		t.Errorf("Title mismatch: got %q, want %q", retrieved.Title, title)
	}
	if len(retrieved.Tags) != 2 || retrieved.Tags[0] != "test" || retrieved.Tags[1] != "golang" {
		t.Errorf("Tags mismatch: got %v, want [test golang]", retrieved.Tags)
	}
	if retrieved.PostCount != 0 {
		t.Errorf("PostCount mismatch: got %d, want 0", retrieved.PostCount)
	}
}

func TestThreadStore_Create_ValidationShortTitle(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	boardID, cleanup := setupTestBoard(t, db)
	defer cleanup()

	store := &ThreadStore{DB: db}

	// Arrange: title too short (<3 chars)
	th := &model.Thread{
		BoardID:  boardID,
		AuthorID: 42,
		Title:    "ab", // too short
		Content:  "content",
	}

	// Act
	err := store.Create(th)

	// Assert
	if err == nil {
		t.Error("Create() with short title = nil, want error")
	}
}

func TestThreadStore_Create_ValidationLongTitle(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	boardID, cleanup := setupTestBoard(t, db)
	defer cleanup()

	store := &ThreadStore{DB: db}

	// Arrange: title too long (>200 chars)
	th := &model.Thread{
		BoardID:  boardID,
		AuthorID: 42,
		Title:    string(make([]byte, 201)), // > 200
		Content:  "content",
	}

	// Act
	err := store.Create(th)

	// Assert
	if err == nil {
		t.Error("Create() with long title = nil, want error")
	}
}

func TestThreadStore_Create_ValidationContentTooLong(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	boardID, cleanup := setupTestBoard(t, db)
	defer cleanup()

	store := &ThreadStore{DB: db}

	// Arrange: content > 10000 chars
	th := &model.Thread{
		BoardID:  boardID,
		AuthorID: 42,
		Title:    "Valid Title",
		Content:  string(make([]byte, 10001)), // > 10000
	}

	// Act
	err := store.Create(th)

	// Assert
	if err == nil {
		t.Error("Create() with long content = nil, want error")
	}
}

func TestThreadStore_ListByBoard_OrderBumpPinned(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	boardID, cleanup := setupTestBoard(t, db)
	defer cleanup()

	store := &ThreadStore{DB: db}

	// Arrange: create 3 threads
	baseTime := time.Now()

	th1 := &model.Thread{
		BoardID:   boardID,
		AuthorID:  42,
		Title:     fmt.Sprintf("Thread 1 %d", time.Now().UnixNano()),
		Content:   "content",
		IsPinned:  false,
		PostCount: 0,
	}
	if err := store.Create(th1); err != nil {
		t.Fatalf("Create th1 = %v", err)
	}
	t.Cleanup(func() { db.Exec("DELETE FROM threads WHERE id = $1", th1.ID) })

	// Sleep to ensure different LastPostAt
	time.Sleep(10 * time.Millisecond)

	th2 := &model.Thread{
		BoardID:   boardID,
		AuthorID:  42,
		Title:     fmt.Sprintf("Thread 2 %d", time.Now().UnixNano()),
		Content:   "content",
		IsPinned:  false,
		PostCount: 0,
	}
	if err := store.Create(th2); err != nil {
		t.Fatalf("Create th2 = %v", err)
	}
	t.Cleanup(func() { db.Exec("DELETE FROM threads WHERE id = $1", th2.ID) })

	time.Sleep(10 * time.Millisecond)

	th3 := &model.Thread{
		BoardID:   boardID,
		AuthorID:  42,
		Title:     fmt.Sprintf("Thread 3 %d", time.Now().UnixNano()),
		Content:   "content",
		IsPinned:  true, // pinned
		PostCount: 0,
	}
	if err := store.Create(th3); err != nil {
		t.Fatalf("Create th3 = %v", err)
	}
	t.Cleanup(func() { db.Exec("DELETE FROM threads WHERE id = $1", th3.ID) })

	// Act
	threads, err := store.ListByBoard(boardID, 10, 0)
	if err != nil {
		t.Fatalf("ListByBoard() = %v", err)
	}

	// Assert: th3 (pinned) should be first
	if len(threads) < 3 {
		t.Errorf("Expected at least 3 threads, got %d", len(threads))
	} else {
		if threads[0].ID != th3.ID {
			t.Errorf("First thread (pinned) mismatch: got %s, want %s", threads[0].ID, th3.ID)
		}
		// th2 should be before th1 due to more recent LastPostAt
		if len(threads) >= 3 && threads[1].ID == th1.ID && threads[2].ID == th2.ID {
			t.Errorf("Bump order wrong: th2 should be before th1 (more recent)")
		}
	}

	_ = baseTime // avoid unused warning
}

func TestThreadStore_ListByBoard_ExcludeSoftDeleted(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	boardID, cleanup := setupTestBoard(t, db)
	defer cleanup()

	store := &ThreadStore{DB: db}

	// Arrange: create 2 threads, soft delete one
	th1 := &model.Thread{
		BoardID:   boardID,
		AuthorID:  42,
		Title:     fmt.Sprintf("Active %d", time.Now().UnixNano()),
		Content:   "active content",
		PostCount: 0,
	}
	if err := store.Create(th1); err != nil {
		t.Fatalf("Create th1 = %v", err)
	}
	t.Cleanup(func() { db.Exec("DELETE FROM threads WHERE id = $1", th1.ID) })

	th2 := &model.Thread{
		BoardID:   boardID,
		AuthorID:  42,
		Title:     fmt.Sprintf("Deleted %d", time.Now().UnixNano()),
		Content:   "deleted content",
		PostCount: 0,
	}
	if err := store.Create(th2); err != nil {
		t.Fatalf("Create th2 = %v", err)
	}
	t.Cleanup(func() { db.Exec("DELETE FROM threads WHERE id = $1", th2.ID) })

	// Act: soft delete th2
	if err := store.SoftDelete(th2.ID); err != nil {
		t.Fatalf("SoftDelete() = %v", err)
	}

	// Act: list
	threads, err := store.ListByBoard(boardID, 10, 0)
	if err != nil {
		t.Fatalf("ListByBoard() = %v", err)
	}

	// Assert: th2 should not appear
	for _, th := range threads {
		if th.ID == th2.ID {
			t.Error("Soft-deleted thread appeared in list")
		}
	}
}

func TestThreadStore_SoftDelete(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	boardID, cleanup := setupTestBoard(t, db)
	defer cleanup()

	store := &ThreadStore{DB: db}

	// Arrange
	th := &model.Thread{
		BoardID:   boardID,
		AuthorID:  42,
		Title:     fmt.Sprintf("To Delete %d", time.Now().UnixNano()),
		Content:   "content",
		PostCount: 0,
	}
	if err := store.Create(th); err != nil {
		t.Fatalf("Create() = %v", err)
	}
	t.Cleanup(func() { db.Exec("DELETE FROM threads WHERE id = $1", th.ID) })

	// Act: soft delete
	if err := store.SoftDelete(th.ID); err != nil {
		t.Fatalf("SoftDelete() = %v", err)
	}

	// Assert: GetByID should fail
	_, err := store.GetByID(th.ID)
	if err == nil {
		t.Error("GetByID() after soft delete = nil, want error")
	}
}

func TestThreadStore_Bump(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	boardID, cleanup := setupTestBoard(t, db)
	defer cleanup()

	store := &ThreadStore{DB: db}

	// Arrange
	th := &model.Thread{
		BoardID:   boardID,
		AuthorID:  42,
		Title:     fmt.Sprintf("Bumpable %d", time.Now().UnixNano()),
		Content:   "content",
		PostCount: 0,
	}
	if err := store.Create(th); err != nil {
		t.Fatalf("Create() = %v", err)
	}
	t.Cleanup(func() { db.Exec("DELETE FROM threads WHERE id = $1", th.ID) })

	originalLastPostAt := th.LastPostAt
	time.Sleep(10 * time.Millisecond)

	// Act: bump
	if err := store.Bump(th.ID); err != nil {
		t.Fatalf("Bump() = %v", err)
	}

	// Assert: retrieve and check
	bumped, err := store.GetByID(th.ID)
	if err != nil {
		t.Fatalf("GetByID() after bump = %v", err)
	}

	if bumped.LastPostAt.Before(originalLastPostAt) {
		t.Errorf("LastPostAt not updated: got %v, want > %v", bumped.LastPostAt, originalLastPostAt)
	}

	if bumped.PostCount != 1 {
		t.Errorf("PostCount mismatch: got %d, want 1", bumped.PostCount)
	}
}

func TestThreadStore_Update(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	boardID, cleanup := setupTestBoard(t, db)
	defer cleanup()

	store := &ThreadStore{DB: db}

	// Arrange: create thread
	th := &model.Thread{
		BoardID:   boardID,
		AuthorID:  42,
		Title:     fmt.Sprintf("Original %d", time.Now().UnixNano()),
		Content:   "original",
		Tags:      []string{"old"},
		IsPinned:  false,
		IsLocked:  false,
		PostCount: 5,
	}
	if err := store.Create(th); err != nil {
		t.Fatalf("Create() = %v", err)
	}
	t.Cleanup(func() { db.Exec("DELETE FROM threads WHERE id = $1", th.ID) })

	// Act: update
	th.Title = "Updated Title"
	th.Content = "updated content"
	th.Tags = []string{"new", "tags"}
	th.IsPinned = true
	th.IsLocked = true

	if err := store.Update(th); err != nil {
		t.Fatalf("Update() = %v", err)
	}

	// Assert: retrieve and check
	updated, err := store.GetByID(th.ID)
	if err != nil {
		t.Fatalf("GetByID() = %v", err)
	}

	if updated.Title != "Updated Title" {
		t.Errorf("Title mismatch: got %q, want %q", updated.Title, "Updated Title")
	}
	if updated.IsPinned != true {
		t.Errorf("IsPinned mismatch: got %v, want true", updated.IsPinned)
	}
	if len(updated.Tags) != 2 {
		t.Errorf("Tags length mismatch: got %d, want 2", len(updated.Tags))
	}

	// PostCount should not be updated by Update()
	if updated.PostCount != 5 {
		t.Errorf("PostCount should not change: got %d, want 5", updated.PostCount)
	}
}
