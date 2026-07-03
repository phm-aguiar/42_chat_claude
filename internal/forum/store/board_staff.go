package store

import (
	"database/sql"
	"fmt"

	"42chat/internal/forum/model"
)

// BoardStaffStore gerencia operações CRUD de staff (moderadores/admins) de boards.
type BoardStaffStore struct {
	DB *sql.DB
}

// Add insere ou atualiza um membro da staff de um board.
// Se o membro já existir, atualiza o role.
// Valida role contra as constantes do model.
func (s *BoardStaffStore) Add(boardID string, userID int, role string) error {
	// Validar role
	if err := staffValidateRole(role); err != nil {
		return err
	}

	_, err := s.DB.Exec(`
		INSERT INTO board_staff (board_id, user_id, role)
		VALUES ($1, $2, $3)
		ON CONFLICT (board_id, user_id) DO UPDATE SET
			role = EXCLUDED.role
	`, boardID, userID, role)
	if err != nil {
		return fmt.Errorf("add board staff: %w", err)
	}
	return nil
}

// Remove deleta um membro da staff de um board.
func (s *BoardStaffStore) Remove(boardID string, userID int) error {
	result, err := s.DB.Exec(`
		DELETE FROM board_staff
		WHERE board_id = $1 AND user_id = $2
	`, boardID, userID)
	if err != nil {
		return fmt.Errorf("remove board staff: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("rows affected: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("board staff not found: board_id=%s, user_id=%d", boardID, userID)
	}
	return nil
}

// GetRole retorna o role de um usuário em um board.
// Se o usuário não for staff, retorna "" sem erro.
func (s *BoardStaffStore) GetRole(boardID string, userID int) (string, error) {
	var role string
	err := s.DB.QueryRow(`
		SELECT role FROM board_staff
		WHERE board_id = $1 AND user_id = $2
	`, boardID, userID).Scan(&role)
	if err == sql.ErrNoRows {
		return "", nil // não é staff, sem erro
	}
	if err != nil {
		return "", fmt.Errorf("get board staff role: %w", err)
	}
	return role, nil
}

// ListByBoard retorna todos os membros da staff de um board.
func (s *BoardStaffStore) ListByBoard(boardID string) ([]model.BoardStaff, error) {
	rows, err := s.DB.Query(`
		SELECT board_id, user_id, role FROM board_staff
		WHERE board_id = $1
		ORDER BY user_id ASC
	`, boardID)
	if err != nil {
		return nil, fmt.Errorf("list board staff: %w", err)
	}
	defer rows.Close()

	var staff []model.BoardStaff
	for rows.Next() {
		var bs model.BoardStaff
		if err := rows.Scan(&bs.BoardID, &bs.UserID, &bs.Role); err != nil {
			return nil, fmt.Errorf("scan board staff: %w", err)
		}
		staff = append(staff, bs)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}
	return staff, nil
}

// staffValidateRole valida se o role é um dos valores permitidos.
// Privado com prefixo 'staff' para evitar colisões com outros workers.
func staffValidateRole(role string) error {
	switch role {
	case model.RoleOwner, model.RoleMod, model.RoleAdmin:
		return nil
	default:
		return fmt.Errorf("invalid role: %s (must be owner, mod, or admin)", role)
	}
}
