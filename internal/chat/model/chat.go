package model

import (
	"time"

	"github.com/google/uuid"
)

// Chat types
const (
	ChatTypeOneOnOne = "oneOnOne"
	ChatTypeGroup    = "group"
	ChatTypeGeneral  = "general"
)

// Chat roles
const (
	RoleOwner  = "owner"
	RoleMod    = "mod"
	RoleMember = "member"
)

// NewID gera um UUID v7 (time-sortable) como string.
// UUIDs v7 incluem timestamp e são resistentes a ataques de enumeração.
func NewID() string {
	return uuid.Must(uuid.NewV7()).String()
}

// ValidChatType retorna true se o tipo de chat é válido.
func ValidChatType(t string) bool {
	return t == ChatTypeOneOnOne || t == ChatTypeGroup || t == ChatTypeGeneral
}

// ValidRole retorna true se o role é válido.
func ValidRole(r string) bool {
	return r == RoleOwner || r == RoleMod || r == RoleMember
}

// Chat representa uma conversa (chat) no 42 Chat.
// Pode ser uma conversa 1:1, um grupo, ou a sala geral.
// Suporta soft delete (futuro) e controle de membros com roles.
type Chat struct {
	ID        string     `json:"id"`         // UUID v7 do chat
	Type      string     `json:"type"`       // oneOnOne | group | general
	Topic     string     `json:"topic"`      // nome/assunto (pode ser vazio)
	CreatedBy *int       `json:"created_by"` // nullable: ID 42 do criador (NULL para "general")
	CreatedAt time.Time  `json:"created_at"`
}

// ChatMember representa um membro de um chat com seu role (permissão).
// PK composta no banco: (chat_id, user_id).
type ChatMember struct {
	ChatID   string    `json:"chat_id"`   // UUID do chat
	UserID   int       `json:"user_id"`   // ID fixo da API 42
	Role     string    `json:"role"`      // owner | mod | member
	JoinedAt time.Time `json:"joined_at"`
}
