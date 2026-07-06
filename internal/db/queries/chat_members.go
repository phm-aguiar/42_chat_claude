package queries

import (
	"database/sql"
	"fmt"
)

// GetChatMemberIDs retorna a lista de IDs de usuários membros de um chat.
func GetChatMemberIDs(db *sql.DB, chatID string) ([]int, error) {
	rows, err := db.Query(`
		SELECT user_id FROM chat_members WHERE chat_id = $1
	`, chatID)
	if err != nil {
		return nil, fmt.Errorf("get chat member ids: %w", err)
	}
	defer rows.Close()

	var ids []int
	for rows.Next() {
		var userID int
		if err := rows.Scan(&userID); err != nil {
			return nil, fmt.Errorf("scan user id: %w", err)
		}
		ids = append(ids, userID)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return ids, nil
}
