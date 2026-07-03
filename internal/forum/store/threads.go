package store

import (
	"database/sql"
	"fmt"
	"time"

	"42chat/internal/forum/model"
	"github.com/lib/pq"
)

// ThreadStore encapsula operações CRUD em threads.
type ThreadStore struct {
	DB *sql.DB
}

// Create insere um novo thread no banco. Valida title (3-200) e content (≤10000), gera ID.
func (s *ThreadStore) Create(t *model.Thread) error {
	// Validações
	if len(t.Title) < 3 || len(t.Title) > 200 {
		return fmt.Errorf("title must be 3-200 characters, got %d", len(t.Title))
	}

	if len(t.Content) > 10000 {
		return fmt.Errorf("content must be ≤10000 characters, got %d", len(t.Content))
	}

	if t.BoardID == "" {
		return fmt.Errorf("board_id cannot be empty")
	}

	if t.AuthorID == 0 {
		return fmt.Errorf("author_id cannot be zero")
	}

	// Gera ID e timestamps
	if t.ID == "" {
		t.ID = model.NewID()
	}

	t.CreatedAt = time.Now()
	t.LastPostAt = time.Now()

	_, err := s.DB.Exec(`
		INSERT INTO threads (id, board_id, author_id, title, content, tags, is_pinned, is_locked, post_count, last_post_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`, t.ID, t.BoardID, t.AuthorID, t.Title, t.Content, pq.Array(t.Tags), t.IsPinned, t.IsLocked, t.PostCount, t.LastPostAt, t.CreatedAt)

	if err != nil {
		return fmt.Errorf("create thread: %w", err)
	}

	return nil
}

// GetByID retorna um thread pelo ID, excluindo threads deletados (deleted_at IS NOT NULL).
func (s *ThreadStore) GetByID(id string) (*model.Thread, error) {
	var t model.Thread
	err := s.DB.QueryRow(`
		SELECT id, board_id, author_id, title, content, tags, is_pinned, is_locked, post_count, last_post_at, created_at, deleted_at
		FROM threads
		WHERE id = $1 AND deleted_at IS NULL
	`, id).Scan(&t.ID, &t.BoardID, &t.AuthorID, &t.Title, &t.Content, pq.Array(&t.Tags), &t.IsPinned, &t.IsLocked, &t.PostCount, &t.LastPostAt, &t.CreatedAt, &t.DeletedAt)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("thread not found: %s", id)
	}
	if err != nil {
		return nil, fmt.Errorf("get thread by id: %w", err)
	}

	return &t, nil
}

// ListByBoard retorna threads de um board ordenados por bump (pinned primeiro, depois por last_post_at DESC).
// Exclui threads deletados. Usa LIMIT e OFFSET para paginação.
func (s *ThreadStore) ListByBoard(boardID string, limit, offset int) ([]model.Thread, error) {
	rows, err := s.DB.Query(`
		SELECT id, board_id, author_id, title, content, tags, is_pinned, is_locked, post_count, last_post_at, created_at, deleted_at
		FROM threads
		WHERE board_id = $1 AND deleted_at IS NULL
		ORDER BY is_pinned DESC, last_post_at DESC
		LIMIT $2 OFFSET $3
	`, boardID, limit, offset)

	if err != nil {
		return nil, fmt.Errorf("list threads by board: %w", err)
	}
	defer rows.Close()

	var threads []model.Thread
	for rows.Next() {
		var t model.Thread
		err := rows.Scan(&t.ID, &t.BoardID, &t.AuthorID, &t.Title, &t.Content, pq.Array(&t.Tags), &t.IsPinned, &t.IsLocked, &t.PostCount, &t.LastPostAt, &t.CreatedAt, &t.DeletedAt)
		if err != nil {
			return nil, fmt.Errorf("scan thread: %w", err)
		}
		threads = append(threads, t)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return threads, nil
}

// Update atualiza title, content, tags, is_pinned, is_locked de um thread pelo ID.
func (s *ThreadStore) Update(t *model.Thread) error {
	if t.ID == "" {
		return fmt.Errorf("thread ID cannot be empty")
	}

	if len(t.Title) < 3 || len(t.Title) > 200 {
		return fmt.Errorf("title must be 3-200 characters, got %d", len(t.Title))
	}

	if len(t.Content) > 10000 {
		return fmt.Errorf("content must be ≤10000 characters, got %d", len(t.Content))
	}

	_, err := s.DB.Exec(`
		UPDATE threads
		SET title = $1, content = $2, tags = $3, is_pinned = $4, is_locked = $5
		WHERE id = $6
	`, t.Title, t.Content, pq.Array(t.Tags), t.IsPinned, t.IsLocked, t.ID)

	if err != nil {
		return fmt.Errorf("update thread: %w", err)
	}

	return nil
}

// SoftDelete marca um thread como deletado via deleted_at = NOW(). Nunca faz hard delete.
func (s *ThreadStore) SoftDelete(id string) error {
	if id == "" {
		return fmt.Errorf("thread ID cannot be empty")
	}

	_, err := s.DB.Exec(`
		UPDATE threads
		SET deleted_at = NOW()
		WHERE id = $1
	`, id)

	if err != nil {
		return fmt.Errorf("soft delete thread: %w", err)
	}

	return nil
}

// Bump atualiza last_post_at = NOW() e incrementa post_count de um thread.
// Chamado sempre que um novo post é criado num thread para manter a ordem de bump.
func (s *ThreadStore) Bump(id string) error {
	if id == "" {
		return fmt.Errorf("thread ID cannot be empty")
	}

	_, err := s.DB.Exec(`
		UPDATE threads
		SET last_post_at = NOW(), post_count = post_count + 1
		WHERE id = $1
	`, id)

	if err != nil {
		return fmt.Errorf("bump thread: %w", err)
	}

	return nil
}
