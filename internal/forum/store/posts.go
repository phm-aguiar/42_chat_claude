package store

import (
	"database/sql"
	"fmt"
	"time"

	"42chat/internal/forum/model"
)

// PostStore encapsula operações CRUD em posts (respostas em threads).
type PostStore struct {
	DB *sql.DB
}

// Create insere um novo post no banco. Valida conteúdo não-vazio e ≤10000 chars,
// gera ID e popula CreatedAt. Se ReplyTo != nil, o INSERT falhará naturalmente
// por FK constraint se o post pai não existir.
func (s *PostStore) Create(p *model.Post) error {
	if p.Content == "" {
		return fmt.Errorf("content cannot be empty")
	}

	if len(p.Content) > 10000 {
		return fmt.Errorf("content exceeds maximum length of 10000 characters")
	}

	if p.ID == "" {
		p.ID = model.NewID()
	}

	p.CreatedAt = time.Now()

	_, err := s.DB.Exec(`
		INSERT INTO posts (id, thread_id, author_id, reply_to, content, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, p.ID, p.ThreadID, p.AuthorID, p.ReplyTo, p.Content, p.CreatedAt)

	if err != nil {
		return fmt.Errorf("create post: %w", err)
	}

	return nil
}

// GetByID retorna um post pelo ID, excluindo posts deletados.
func (s *PostStore) GetByID(id string) (*model.Post, error) {
	var p model.Post
	var deletedAt sql.NullTime
	var replyTo sql.NullString

	err := s.DB.QueryRow(`
		SELECT id, thread_id, author_id, reply_to, content, created_at, deleted_at
		FROM posts
		WHERE id = $1 AND deleted_at IS NULL
	`, id).Scan(&p.ID, &p.ThreadID, &p.AuthorID, &replyTo, &p.Content, &p.CreatedAt, &deletedAt)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("post not found: %s", id)
	}
	if err != nil {
		return nil, fmt.Errorf("get post by id: %w", err)
	}

	// Handle nullable ReplyTo
	if replyTo.Valid {
		p.ReplyTo = &replyTo.String
	}

	// Handle nullable DeletedAt (shouldn't occur since WHERE deleted_at IS NULL, but be safe)
	if deletedAt.Valid {
		p.DeletedAt = &deletedAt.Time
	}

	return &p, nil
}

// ListByThread retorna todos os posts de um thread, excluindo deletados,
// ordenados por created_at ASC (compatível com índice idx_posts_thread_time).
func (s *PostStore) ListByThread(threadID string) ([]model.Post, error) {
	rows, err := s.DB.Query(`
		SELECT id, thread_id, author_id, reply_to, content, created_at, deleted_at
		FROM posts
		WHERE thread_id = $1 AND deleted_at IS NULL
		ORDER BY created_at ASC
	`, threadID)

	if err != nil {
		return nil, fmt.Errorf("list posts by thread: %w", err)
	}
	defer rows.Close()

	var posts []model.Post
	for rows.Next() {
		var p model.Post
		var deletedAt sql.NullTime
		var replyTo sql.NullString

		err := rows.Scan(&p.ID, &p.ThreadID, &p.AuthorID, &replyTo, &p.Content, &p.CreatedAt, &deletedAt)
		if err != nil {
			return nil, fmt.Errorf("scan post: %w", err)
		}

		// Handle nullable ReplyTo
		if replyTo.Valid {
			p.ReplyTo = &replyTo.String
		}

		// Handle nullable DeletedAt (shouldn't occur since WHERE deleted_at IS NULL, but be safe)
		if deletedAt.Valid {
			p.DeletedAt = &deletedAt.Time
		}

		posts = append(posts, p)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return posts, nil
}

// SoftDelete marca um post como deletado via deleted_at = NOW().
// Nunca faz hard delete — mantém auditoria e integridade de reply-to tree.
func (s *PostStore) SoftDelete(id string) error {
	if id == "" {
		return fmt.Errorf("post ID cannot be empty")
	}

	_, err := s.DB.Exec(`
		UPDATE posts
		SET deleted_at = NOW()
		WHERE id = $1
	`, id)

	if err != nil {
		return fmt.Errorf("soft delete post: %w", err)
	}

	return nil
}
