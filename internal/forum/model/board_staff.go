package model

const (
	RoleOwner = "owner"
	RoleMod   = "mod"
	RoleAdmin = "admin"
)

// BoardStaff representa um membro da staff de um board (moderador ou admin).
// Usa PK composta (board_id, user_id) no banco.
type BoardStaff struct {
	BoardID string `json:"board_id"` // UUID do board
	UserID  int    `json:"user_id"`  // ID fixo da API 42
	Role    string `json:"role"`     // owner | mod | admin
}
