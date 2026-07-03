package store

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"testing"
	"time"

	"42chat/internal/forum/model"
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

func TestValidateSlug_Valid(t *testing.T) {
	testCases := []struct {
		name string
		slug string
	}{
		{"single char", "a"},
		{"two chars", "ab"},
		{"with numbers", "tech42"},
		{"with underscore", "tech_talk"},
		{"with hyphen", "tech-talk"},
		{"mixed", "learn-go_v2"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			if err := ValidateSlug(tc.slug); err != nil {
				t.Errorf("ValidateSlug(%q) = %v, want nil", tc.slug, err)
			}
		})
	}
}

func TestValidateSlug_Invalid(t *testing.T) {
	testCases := []struct {
		name string
		slug string
	}{
		{"empty", ""},
		{"uppercase", "Tech"},
		{"space", "tech talk"},
		{"special char", "tech!"},
		{"start underscore", "_tech"},
		{"end underscore", "tech_"},
		{"start hyphen", "-tech"},
		{"end hyphen", "tech-"},
		{"only special", "___"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			if err := ValidateSlug(tc.slug); err == nil {
				t.Errorf("ValidateSlug(%q) = nil, want error", tc.slug)
			}
		})
	}
}

func TestValidateSlug_Reserved(t *testing.T) {
	reserved := []string{"admin", "api", "chat", "forum", "static", "health"}
	for _, slug := range reserved {
		t.Run(slug, func(t *testing.T) {
			if err := ValidateSlug(slug); err == nil {
				t.Errorf("ValidateSlug(%q) = nil, want reserved error", slug)
			}
		})
	}
}

func TestBoardStore_Create_and_GetBySlug(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	store := &BoardStore{DB: db}

	// Arrange: create board with unique slug
	slug := fmt.Sprintf("test-board-%d", time.Now().UnixNano())
	b := &model.Board{
		Slug:        slug,
		Name:        "Test Board",
		Description: "A test board",
		OwnerID:     intPtr(42),
		SFW:         true,
		Theme:       "dark",
		IsLocked:    false,
	}

	// Cleanup: delete board after test
	t.Cleanup(func() {
		db.Exec("DELETE FROM boards WHERE id = $1", b.ID)
	})

	// Act: create
	if err := store.Create(b); err != nil {
		t.Fatalf("Create() = %v", err)
	}

	// Assert: ID and CreatedAt were set
	if b.ID == "" {
		t.Error("Create() did not set ID")
	}
	if b.CreatedAt.IsZero() {
		t.Error("Create() did not set CreatedAt")
	}

	// Act: retrieve
	retrieved, err := store.GetBySlug(slug)
	if err != nil {
		t.Fatalf("GetBySlug() = %v", err)
	}

	// Assert: fields match
	if retrieved.ID != b.ID {
		t.Errorf("ID mismatch: got %q, want %q", retrieved.ID, b.ID)
	}
	if retrieved.Name != "Test Board" {
		t.Errorf("Name mismatch: got %q, want %q", retrieved.Name, "Test Board")
	}
	if retrieved.SFW != true {
		t.Errorf("SFW mismatch: got %v, want true", retrieved.SFW)
	}
}

func TestBoardStore_Create_DuplicateSlug(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	store := &BoardStore{DB: db}
	slug := fmt.Sprintf("dup-board-%d", time.Now().UnixNano())

	// Create first board
	b1 := &model.Board{
		Slug:     slug,
		Name:     "Board 1",
		OwnerID:  intPtr(42),
		SFW:      true,
		Theme:    "dark",
		IsLocked: false,
	}
	if err := store.Create(b1); err != nil {
		t.Fatalf("First Create() = %v", err)
	}
	t.Cleanup(func() {
		db.Exec("DELETE FROM boards WHERE id = $1", b1.ID)
	})

	// Try to create second board with same slug
	b2 := &model.Board{
		Slug:     slug,
		Name:     "Board 2",
		OwnerID:  intPtr(42),
		SFW:      true,
		Theme:    "dark",
		IsLocked: false,
	}

	// Act
	err := store.Create(b2)

	// Assert: error expected
	if err == nil {
		t.Error("Create() with duplicate slug = nil, want error")
		db.Exec("DELETE FROM boards WHERE id = $1", b2.ID)
	}
}

func TestBoardStore_List_ContainsSeeds(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	store := &BoardStore{DB: db}

	// Act
	boards, err := store.List()
	if err != nil {
		t.Fatalf("List() = %v", err)
	}

	// Assert: at least the 5 seed boards should exist
	slugs := make(map[string]bool)
	for _, b := range boards {
		slugs[b.Slug] = true
	}

	expectedSlugs := []string{"tech", "projects", "career", "events", "random"}
	for _, slug := range expectedSlugs {
		if !slugs[slug] {
			t.Errorf("Seed board %q not found in list", slug)
		}
	}
}

func TestBoardStore_Update(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	store := &BoardStore{DB: db}

	// Create board
	slug := fmt.Sprintf("update-board-%d", time.Now().UnixNano())
	b := &model.Board{
		Slug:        slug,
		Name:        "Original Name",
		Description: "Original Description",
		OwnerID:     intPtr(42),
		SFW:         true,
		Theme:       "dark",
		IsLocked:    false,
	}
	if err := store.Create(b); err != nil {
		t.Fatalf("Create() = %v", err)
	}
	t.Cleanup(func() {
		db.Exec("DELETE FROM boards WHERE id = $1", b.ID)
	})

	// Act: update
	b.Name = "Updated Name"
	b.Description = "Updated Description"
	b.IsLocked = true

	if err := store.Update(b); err != nil {
		t.Fatalf("Update() = %v", err)
	}

	// Assert: retrieve and verify
	retrieved, err := store.GetBySlug(slug)
	if err != nil {
		t.Fatalf("GetBySlug() = %v", err)
	}

	if retrieved.Name != "Updated Name" {
		t.Errorf("Name after update: got %q, want %q", retrieved.Name, "Updated Name")
	}
	if retrieved.IsLocked != true {
		t.Errorf("IsLocked after update: got %v, want true", retrieved.IsLocked)
	}
}

func TestBoardStore_Delete_Hard(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	store := &BoardStore{DB: db}

	// Create board
	slug := fmt.Sprintf("delete-board-%d", time.Now().UnixNano())
	b := &model.Board{
		Slug:     slug,
		Name:     "To Delete",
		OwnerID:  intPtr(42),
		SFW:      true,
		Theme:    "dark",
		IsLocked: false,
	}
	if err := store.Create(b); err != nil {
		t.Fatalf("Create() = %v", err)
	}

	// Act: delete
	if err := store.Delete(b.ID); err != nil {
		t.Fatalf("Delete() = %v", err)
	}

	// Assert: should not be found
	_, err := store.GetBySlug(slug)
	if err == nil {
		t.Error("GetBySlug() after delete = nil, want error")
	}
}

func TestBoardStore_SeedBoards_Idempotent(t *testing.T) {
	db := testDB(t)
	defer db.Close()

	store := &BoardStore{DB: db}

	adminID := 42

	// Act: seed twice
	if err := store.SeedBoards(adminID); err != nil {
		t.Fatalf("First SeedBoards() = %v", err)
	}

	if err := store.SeedBoards(adminID); err != nil {
		t.Fatalf("Second SeedBoards() = %v", err)
	}

	// Assert: should not error, and boards should have owner set
	boards, err := store.List()
	if err != nil {
		t.Fatalf("List() = %v", err)
	}

	expectedSlugs := []string{"tech", "projects", "career", "events", "random"}
	for _, slug := range expectedSlugs {
		found := false
		for _, b := range boards {
			if b.Slug == slug {
				found = true
				if b.OwnerID == nil || *b.OwnerID != adminID {
					t.Errorf("Board %q: owner_id not set to %d", slug, adminID)
				}
				break
			}
		}
		if !found {
			t.Errorf("Seed board %q not found", slug)
		}
	}
}

// Helper
func intPtr(i int) *int {
	return &i
}
