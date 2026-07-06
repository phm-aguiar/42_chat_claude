package model

import "time"

// Thread representa um tópico dentro de um board.
// Suporta soft delete (DeletedAt) e bump order via LastPostAt.
type Thread struct {
	ID             string     `json:"id"`              // UUID v7 do thread
	BoardID        string     `json:"board_id"`        // UUID do board pai
	AuthorID       int        `json:"author_id"`       // ID fixo da API 42
	AuthorLogin    string     `json:"author_login"`    // Login do autor (via JOIN users)
	AuthorImageURL string     `json:"author_image_url"` // Avatar URL do autor (COALESCE com default)
	Title          string     `json:"title"`
	Content        string     `json:"content"`
	Tags           []string   `json:"tags"`            // Array de skills/tags de busca (GIN index no DB)
	IsPinned       bool       `json:"is_pinned"`       // se true, fica no topo do board
	IsLocked       bool       `json:"is_locked"`       // se true, apenas mods/admins podem postar respostas
	PostCount      int        `json:"post_count"`      // contador de respostas
	LastPostAt     time.Time  `json:"last_post_at"`    // timestamp do último post (usado para bump order)
	CreatedAt      time.Time  `json:"created_at"`
	DeletedAt      *time.Time `json:"deleted_at,omitempty"` // soft delete
}

// ThreadWithBoard estende Thread com o slug do board, usado por ListRecent (cross-board).
type ThreadWithBoard struct {
	Thread
	BoardSlug string `json:"board_slug"` // Slug do board (ex: "tech", "projects")
}
