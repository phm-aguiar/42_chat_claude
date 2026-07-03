package model

import "time"

// Board representa um fórum dentro do 42 Chat.
// É o container de tópicos e segue slugs únicos e reservados.
type Board struct {
	ID          string    `json:"id"`
	Slug        string    `json:"slug"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	OwnerID     *int      `json:"owner_id"`     // nullable: pode ser criado por admin sem owner específico
	SFW         bool      `json:"sfw"`          // Safe For Work
	Theme       string    `json:"theme"`        // nome do tema (ex: "dark", "light", ou paleta)
	IsLocked    bool      `json:"is_locked"`    // se true, apenas moderadores/admin podem postar
	CreatedAt   time.Time `json:"created_at"`
}
