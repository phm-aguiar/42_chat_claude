package store

import (
	"database/sql"
	"fmt"
	"time"

	"42chat/internal/db/queries"
)

// MessageStore encapsula operações CRUD em mensagens de chat.
type MessageStore struct {
	DB *sql.DB
}

// ListByChat lista mensagens de um chat com cursor pagination.
// Mensagens deletadas (deleted_at != NULL) retornam como tombstone com content = "[mensagem removida]".
// before: timestamp cursor — retorna mensagens criadas ANTES deste instante
// limit: máximo de mensagens a retornar (clamped a [1, 100], default 50)
// Retorna (messages, has_more, error).
// has_more indica se existem mais mensagens além do limit.
func (s *MessageStore) ListByChat(chatID string, before time.Time, limit int) ([]queries.Message, bool, error) {
	// Clamp limit
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	// Busca limit+1 para calcular has_more
	rows, err := s.DB.Query(`
		SELECT m.id::text, m.user_id, m.chat_id::text, u.login, COALESCE(u.image_url, ''),
		       CASE WHEN m.deleted_at IS NOT NULL THEN '[mensagem removida]'
		            ELSE m.content END AS content,
		       m.created_at
		FROM messages m
		JOIN users u ON u.id = m.user_id
		WHERE m.chat_id = $1::uuid AND m.created_at < $2::timestamptz
		ORDER BY m.created_at DESC
		LIMIT $3
	`, chatID, before, limit+1)

	if err != nil {
		return nil, false, fmt.Errorf("list messages by chat: %w", err)
	}
	defer rows.Close()

	var messages []queries.Message
	for rows.Next() {
		var msg queries.Message
		if err := rows.Scan(&msg.ID, &msg.UserID, &msg.ChatID, &msg.Login, &msg.ImageURL, &msg.Content, &msg.CreatedAt); err != nil {
			return nil, false, fmt.Errorf("scan message: %w", err)
		}
		messages = append(messages, msg)
	}

	if err := rows.Err(); err != nil {
		return nil, false, fmt.Errorf("rows error: %w", err)
	}

	// Calcular has_more e remover o (limit+1)-ésimo elemento se existir
	has_more := false
	if len(messages) > limit {
		has_more = true
		messages = messages[:limit]
	}

	return messages, has_more, nil
}

// Send insere uma nova mensagem e retorna com dados do usuário enriquecidos (login, image_url).
func (s *MessageStore) Send(chatID string, userID int, content string) (queries.Message, error) {
	var msg queries.Message
	err := s.DB.QueryRow(`
		INSERT INTO messages (user_id, chat_id, content)
		VALUES ($1, $2::uuid, $3)
		RETURNING id::text, user_id, chat_id::text, content, created_at
	`, userID, chatID, content).Scan(&msg.ID, &msg.UserID, &msg.ChatID, &msg.Content, &msg.CreatedAt)

	if err != nil {
		return queries.Message{}, fmt.Errorf("send message: %w", err)
	}

	// Enriquecer com dados do usuário
	u, err := queries.GetUserByID(s.DB, userID)
	if err == nil {
		msg.Login = u.Login
		msg.ImageURL = u.ImageURL
	}

	return msg, nil
}

// GetChatID retorna o chat_id de uma mensagem (inclusive soft-deletadas).
// Retorna sql.ErrNoRows se a mensagem não existir.
func (s *MessageStore) GetChatID(messageID string) (string, error) {
	var chatID string
	err := s.DB.QueryRow(`SELECT chat_id::text FROM messages WHERE id = $1::uuid`, messageID).Scan(&chatID)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", sql.ErrNoRows
		}
		return "", fmt.Errorf("get message chat_id: %w", err)
	}
	return chatID, nil
}

// SoftDelete marca uma mensagem como deletada via deleted_at = NOW().
// Retorna erro se a mensagem não existir ou já estiver deletada.
func (s *MessageStore) SoftDelete(messageID string) error {
	result, err := s.DB.Exec(`
		UPDATE messages
		SET deleted_at = NOW()
		WHERE id = $1::uuid AND deleted_at IS NULL
	`, messageID)

	if err != nil {
		return fmt.Errorf("soft delete message: %w", err)
	}

	n, _ := result.RowsAffected()
	if n == 0 {
		return fmt.Errorf("message not found or already deleted")
	}

	return nil
}
