package queries

import (
	"database/sql"
	"fmt"
	"time"
)

// Message representa uma mensagem do chat.
type Message struct {
	ID        string    `json:"id"`        // UUID como string — nunca []byte
	UserID    int       `json:"user_id"`
	Login     string    `json:"login"`
	ImageURL  string    `json:"image_url"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

// SaveMessage persiste uma mensagem e retorna o registro completo com dados do usuário.
// Usa JOIN para popular login e image_url inline.
func SaveMessage(db *sql.DB, userID int, content string) (Message, error) {
	var msg Message
	err := db.QueryRow(`
		INSERT INTO messages (user_id, content)
		VALUES ($1, $2)
		RETURNING id::text, user_id, content, created_at
	`, userID, content).Scan(&msg.ID, &msg.UserID, &msg.Content, &msg.CreatedAt)
	if err != nil {
		return Message{}, fmt.Errorf("save message: %w", err)
	}

	// Busca dados do usuário para popular a response
	u, err := GetUserByID(db, userID)
	if err == nil {
		msg.Login = u.Login
		msg.ImageURL = u.ImageURL
	}
	return msg, nil
}

// GetMessages busca mensagens com cursor pagination.
// before: timestamp cursor (mensagens criadas ANTES deste instante)
// limit: máximo de mensagens a retornar
// Retorna em ordem DESC (mais recente primeiro) conforme ADR cursor pagination.
func GetMessages(db *sql.DB, before time.Time, limit int) ([]Message, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	rows, err := db.Query(`
		SELECT m.id::text, m.user_id, u.login, u.image_url, m.content, m.created_at
		FROM messages m
		JOIN users u ON u.id = m.user_id
		WHERE m.created_at < $1
		  AND m.deleted_at IS NULL
		ORDER BY m.created_at DESC
		LIMIT $2
	`, before, limit)
	if err != nil {
		return nil, fmt.Errorf("get messages: %w", err)
	}
	defer rows.Close()

	var msgs []Message
	for rows.Next() {
		var msg Message
		if err := rows.Scan(&msg.ID, &msg.UserID, &msg.Login, &msg.ImageURL, &msg.Content, &msg.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan message: %w", err)
		}
		msgs = append(msgs, msg)
	}
	return msgs, rows.Err()
}

// SoftDeleteMessage marca uma mensagem como deletada (soft delete).
// Só deleta se userID for o dono — proteção nativa na query.
func SoftDeleteMessage(db *sql.DB, id string, userID int) error {
	result, err := db.Exec(`
		UPDATE messages SET deleted_at = NOW()
		WHERE id = $1::uuid AND user_id = $2 AND deleted_at IS NULL
	`, id, userID)
	if err != nil {
		return fmt.Errorf("soft delete message: %w", err)
	}
	n, _ := result.RowsAffected()
	if n == 0 {
		return fmt.Errorf("message not found or already deleted")
	}
	return nil
}
