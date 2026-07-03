package store

import (
	"database/sql"
	"fmt"
	"time"

	"42chat/internal/chat/model"
)

// ChatStore encapsula operações CRUD em chats e membros.
type ChatStore struct {
	DB *sql.DB
}

// CreateChat insere um novo chat e seus membros em transação.
// Se chat.ID estiver vazio, gera um UUID v7.
// O criador (chat.CreatedBy) é inserido como owner.
// Os demais memberIDs são inseridos como member.
// Retorna o chat criado com ID e CreatedAt preenchidos.
func (s *ChatStore) CreateChat(chat model.Chat, memberIDs []int) (model.Chat, error) {
	// Gera ID se não fornecido
	if chat.ID == "" {
		chat.ID = model.NewID()
	}

	chat.CreatedAt = time.Now()

	// Inicia transação
	tx, err := s.DB.Begin()
	if err != nil {
		return model.Chat{}, fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Insere o chat
	_, err = tx.Exec(`
		INSERT INTO chats (id, type, topic, created_by, created_at)
		VALUES ($1, $2, $3, $4, $5)
	`, chat.ID, chat.Type, chat.Topic, chat.CreatedBy, chat.CreatedAt)

	if err != nil {
		return model.Chat{}, fmt.Errorf("insert chat: %w", err)
	}

	// Insere o criador como owner (se CreatedBy não for nil)
	if chat.CreatedBy != nil {
		_, err = tx.Exec(`
			INSERT INTO chat_members (chat_id, user_id, role, joined_at)
			VALUES ($1, $2, $3, $4)
		`, chat.ID, *chat.CreatedBy, model.RoleOwner, chat.CreatedAt)

		if err != nil {
			return model.Chat{}, fmt.Errorf("insert creator as owner: %w", err)
		}
	}

	// Insere demais membros com role "member"
	for _, userID := range memberIDs {
		// Se o criador está nos memberIDs, pula (já foi inserido como owner)
		if chat.CreatedBy != nil && *chat.CreatedBy == userID {
			continue
		}

		_, err = tx.Exec(`
			INSERT INTO chat_members (chat_id, user_id, role, joined_at)
			VALUES ($1, $2, $3, $4)
		`, chat.ID, userID, model.RoleMember, chat.CreatedAt)

		if err != nil {
			return model.Chat{}, fmt.Errorf("insert member %d: %w", userID, err)
		}
	}

	// Commita transação
	if err := tx.Commit(); err != nil {
		return model.Chat{}, fmt.Errorf("commit transaction: %w", err)
	}

	return chat, nil
}

// FindOneOnOne procura por um chat oneOnOne já existente entre dois usuários.
// Retorna (chat, found=true, nil) se encontrado, (zero, false, nil) se não encontrado.
// Erro apenas para problemas de DB.
func (s *ChatStore) FindOneOnOne(userA, userB int) (model.Chat, bool, error) {
	var chat model.Chat

	// Busca um chat tipo oneOnOne com exatamente esses dois membros
	err := s.DB.QueryRow(`
		SELECT c.id, c.type, c.topic, c.created_by, c.created_at
		FROM chats c
		WHERE c.type = 'oneOnOne'
		AND (
			SELECT COUNT(DISTINCT user_id)
			FROM chat_members
			WHERE chat_id = c.id
		) = 2
		AND EXISTS (
			SELECT 1 FROM chat_members
			WHERE chat_id = c.id AND user_id = $1
		)
		AND EXISTS (
			SELECT 1 FROM chat_members
			WHERE chat_id = c.id AND user_id = $2
		)
		LIMIT 1
	`, userA, userB).Scan(&chat.ID, &chat.Type, &chat.Topic, &chat.CreatedBy, &chat.CreatedAt)

	if err == sql.ErrNoRows {
		return model.Chat{}, false, nil
	}
	if err != nil {
		return model.Chat{}, false, fmt.Errorf("find one-on-one: %w", err)
	}

	return chat, true, nil
}

// GetChat retorna um chat pelo ID (inclui o chat "general").
func (s *ChatStore) GetChat(id string) (model.Chat, error) {
	var chat model.Chat

	err := s.DB.QueryRow(`
		SELECT id, type, topic, created_by, created_at
		FROM chats
		WHERE id = $1
	`, id).Scan(&chat.ID, &chat.Type, &chat.Topic, &chat.CreatedBy, &chat.CreatedAt)

	if err == sql.ErrNoRows {
		return model.Chat{}, fmt.Errorf("chat not found: %s", id)
	}
	if err != nil {
		return model.Chat{}, fmt.Errorf("get chat: %w", err)
	}

	return chat, nil
}

// ListUserChats retorna todos os chats dos quais o usuário é membro.
// SEMPRE inclui o chat "general" (todos participam do general), mesmo sem membership explícita.
func (s *ChatStore) ListUserChats(userID int) ([]model.Chat, error) {
	rows, err := s.DB.Query(`
		SELECT DISTINCT c.id, c.type, c.topic, c.created_by, c.created_at
		FROM chats c
		WHERE c.type = 'general'
		OR EXISTS (
			SELECT 1 FROM chat_members
			WHERE chat_id = c.id AND user_id = $1
		)
		ORDER BY c.created_at ASC
	`, userID)

	if err != nil {
		return nil, fmt.Errorf("list user chats: %w", err)
	}
	defer rows.Close()

	var chats []model.Chat
	for rows.Next() {
		var chat model.Chat
		err := rows.Scan(&chat.ID, &chat.Type, &chat.Topic, &chat.CreatedBy, &chat.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("scan chat: %w", err)
		}
		chats = append(chats, chat)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return chats, nil
}

// GetChatMembers retorna todos os membros de um chat com seus roles.
func (s *ChatStore) GetChatMembers(chatID string) ([]model.ChatMember, error) {
	rows, err := s.DB.Query(`
		SELECT chat_id, user_id, role, joined_at
		FROM chat_members
		WHERE chat_id = $1
		ORDER BY joined_at ASC
	`, chatID)

	if err != nil {
		return nil, fmt.Errorf("get chat members: %w", err)
	}
	defer rows.Close()

	var members []model.ChatMember
	for rows.Next() {
		var member model.ChatMember
		err := rows.Scan(&member.ChatID, &member.UserID, &member.Role, &member.JoinedAt)
		if err != nil {
			return nil, fmt.Errorf("scan member: %w", err)
		}
		members = append(members, member)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return members, nil
}
