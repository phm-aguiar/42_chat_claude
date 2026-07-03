package model

import "time"

// Post representa uma resposta em um thread ou outra resposta (reply).
// Suporta soft delete e reply-to tree structure via ReplyTo.
type Post struct {
	ID        string     `json:"id"`         // UUID v7 do post
	ThreadID  string     `json:"thread_id"`  // UUID do thread pai
	AuthorID  int        `json:"author_id"`  // ID fixo da API 42
	ReplyTo   *string    `json:"reply_to,omitempty"` // UUID do post que este responde (nullable)
	Content   string     `json:"content"`
	CreatedAt time.Time  `json:"created_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"` // soft delete
}
