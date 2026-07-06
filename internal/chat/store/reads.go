package store

import (
	"database/sql"
	"fmt"

	"42chat/internal/chat/model"
)

// ReadStore encapsula operações de rastreamento de leitura de chats.
type ReadStore struct {
	DB *sql.DB
}

// MarkRead marca um chat como lido pelo usuário no momento atual.
// Se o registro já existe, atualiza o last_read_at para NOW().
// Se não existe, insere um novo registro.
func (s *ReadStore) MarkRead(chatID string, userID int) error {
	_, err := s.DB.Exec(`
		INSERT INTO chat_reads (user_id, chat_id, last_read_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT (user_id, chat_id) DO UPDATE SET last_read_at = NOW()
	`, userID, chatID)

	if err != nil {
		return fmt.Errorf("mark read: %w", err)
	}

	return nil
}

// ListUserChatsWithUnread retorna todos os chats dos quais o usuário é membro,
// com a contagem de mensagens não lidas em cada chat.
// SEMPRE inclui o chat "general" (todos participam do general), mesmo sem membership explícita.
// Mensagens são consideradas não-lidas se:
// - deleted_at IS NULL (não foram deletadas)
// - user_id != userID (não foram enviadas pelo próprio usuário)
// - created_at > last_read_at do usuário naquele chat (foram enviadas após a última leitura)
// Se o usuário nunca leu um chat, todas as mensagens são consideradas não-lidas.
func (s *ReadStore) ListUserChatsWithUnread(userID int) ([]model.ChatWithUnread, error) {
	rows, err := s.DB.Query(`
		SELECT
			c.id, c.type, c.topic, c.created_by, c.created_at,
			COALESCE((
				SELECT COUNT(*) FROM messages m
				WHERE m.chat_id = c.id
					AND m.deleted_at IS NULL
					AND m.user_id != $1
					AND m.created_at > COALESCE(
						(SELECT cr.last_read_at FROM chat_reads cr
						 WHERE cr.chat_id = c.id AND cr.user_id = $1),
						'-infinity'::timestamptz)
			), 0) AS unread_count
		FROM chats c
		WHERE c.type = 'general'
			OR EXISTS (
				SELECT 1 FROM chat_members
				WHERE chat_id = c.id AND user_id = $1
			)
		ORDER BY c.created_at ASC
	`, userID)

	if err != nil {
		return nil, fmt.Errorf("list user chats with unread: %w", err)
	}
	defer rows.Close()

	var chats []model.ChatWithUnread
	for rows.Next() {
		var cwu model.ChatWithUnread
		err := rows.Scan(
			&cwu.ID, &cwu.Type, &cwu.Topic, &cwu.CreatedBy, &cwu.CreatedAt,
			&cwu.UnreadCount,
		)
		if err != nil {
			return nil, fmt.Errorf("scan chat with unread: %w", err)
		}
		chats = append(chats, cwu)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return chats, nil
}
