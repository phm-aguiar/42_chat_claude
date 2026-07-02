package chat

import (
	"database/sql"
	"time"
)

type UserStats struct {
	UserID        int    `json:"user_id"`
	Login         string `json:"login"`
	ImageURL      string `json:"image_url"`
	TotalMessages int    `json:"total_messages"`
	ActiveRooms   int    `json:"active_rooms"`
	Tier          int    `json:"tier"`
	TierLabel     string `json:"tier_label"`
	MemberSince   string `json:"member_since"`
}

// calcTier deriva o tier e o rótulo a partir do total de mensagens.
// 0 = novato, 1-50 = iniciante, 51-200 = participante, 201+ = veterano.
func calcTier(total int) (int, string) {
	switch {
	case total == 0:
		return 0, "novato"
	case total >= 1 && total <= 50:
		return 1, "iniciante"
	case total >= 51 && total <= 200:
		return 2, "participante"
	default: // total >= 201
		return 3, "veterano"
	}
}

// GetUserStats agrega stats do usuário a partir da tabela messages.
// Retorna sql.ErrNoRows se o usuário não existir.
func GetUserStats(db *sql.DB, userID int) (*UserStats, error) {
	query := `
SELECT
    u.id, u.login,
    COALESCE(u.image_url, '') AS image_url,
    u.created_at,
    COUNT(m.id)                                      AS total_messages,
    CASE WHEN COUNT(m.id) > 0 THEN 1 ELSE 0 END      AS active_rooms
FROM users u
LEFT JOIN messages m ON m.user_id = u.id AND m.deleted_at IS NULL
WHERE u.id = $1
GROUP BY u.id, u.login, u.image_url, u.created_at;
`

	var stats UserStats
	var createdAt time.Time

	err := db.QueryRow(query, userID).Scan(
		&stats.UserID,
		&stats.Login,
		&stats.ImageURL,
		&createdAt,
		&stats.TotalMessages,
		&stats.ActiveRooms,
	)

	if err != nil {
		return nil, err
	}

	stats.MemberSince = createdAt.Format(time.RFC3339)
	stats.Tier, stats.TierLabel = calcTier(stats.TotalMessages)

	return &stats, nil
}
