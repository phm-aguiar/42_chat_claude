package store

import (
	"database/sql"
	"fmt"

	"42chat/internal/chat/model"
)

// MemberStore gerencia membros de chats (chat_members).
type MemberStore struct {
	DB *sql.DB
}

// Add inserts a new member into a chat with a specific role.
// Returns an error if:
// - role is invalid
// - member already exists (PK violation, lib/pq code 23505) — handler maps to 409
// - user or chat doesn't exist (FK violation) — handler maps to 404
func (s *MemberStore) Add(chatID string, userID int, role string) error {
	if !model.ValidRole(role) {
		return fmt.Errorf("invalid role: %s (must be owner, mod, or member)", role)
	}

	_, err := s.DB.Exec(`
		INSERT INTO chat_members (chat_id, user_id, role, joined_at)
		VALUES ($1, $2, $3, NOW())
	`, chatID, userID, role)
	if err != nil {
		return fmt.Errorf("add chat member: %w", err)
	}
	return nil
}

// Remove deletes a member from a chat.
// Returns an error if the member doesn't exist (rows affected = 0).
func (s *MemberStore) Remove(chatID string, userID int) error {
	result, err := s.DB.Exec(`
		DELETE FROM chat_members
		WHERE chat_id = $1 AND user_id = $2
	`, chatID, userID)
	if err != nil {
		return fmt.Errorf("remove chat member: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("rows affected: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("chat member not found: chat_id=%s, user_id=%d", chatID, userID)
	}
	return nil
}

// GetRole returns the role of a user in a chat.
// Returns the role string if found, or sql.ErrNoRows if not a member.
// Used by middleware ChatMember/ChatModOnly (T013).
func (s *MemberStore) GetRole(chatID string, userID int) (string, error) {
	var role string
	err := s.DB.QueryRow(`
		SELECT role FROM chat_members
		WHERE chat_id = $1 AND user_id = $2
	`, chatID, userID).Scan(&role)
	if err == sql.ErrNoRows {
		return "", sql.ErrNoRows
	}
	if err != nil {
		return "", fmt.Errorf("get chat member role: %w", err)
	}
	return role, nil
}

// IsMember checks if a user is a member of a chat.
// Returns true if:
// - chat type is 'general' (all users are implicitly members), OR
// - user is explicitly in chat_members table
func (s *MemberStore) IsMember(chatID string, userID int) (bool, error) {
	var isMember bool
	err := s.DB.QueryRow(`
		SELECT EXISTS (
			SELECT 1 FROM chats WHERE id = $1 AND type = 'general'
		) OR EXISTS (
			SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2
		)
	`, chatID, userID).Scan(&isMember)
	if err != nil {
		return false, fmt.Errorf("is member: %w", err)
	}
	return isMember, nil
}
