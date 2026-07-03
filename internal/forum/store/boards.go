package store

import (
	"database/sql"
	"fmt"
	"regexp"
	"time"

	"42chat/internal/forum/model"
)

// ReservedSlugs contém slugs que não podem ser usados (reservados).
var ReservedSlugs = []string{
	"admin",
	"api",
	"chat",
	"forum",
	"static",
	"health",
}

// BoardStore encapsula operações CRUD em boards.
type BoardStore struct {
	DB *sql.DB
}

// slugRegex valida slugs: lowercase alphanumeric, underscore, hyphen; deve começar e terminar com alphanumeric.
var slugRegex = regexp.MustCompile(`^[a-z0-9]([a-z0-9_-]*[a-z0-9])?$`)

// ValidateSlug verifica se o slug está no formato válido e não é reservado.
func ValidateSlug(slug string) error {
	if slug == "" {
		return fmt.Errorf("slug cannot be empty")
	}

	if !slugRegex.MatchString(slug) {
		return fmt.Errorf("slug must match pattern: lowercase alphanumeric, underscore, hyphen; start and end with alphanumeric")
	}

	for _, reserved := range ReservedSlugs {
		if slug == reserved {
			return fmt.Errorf("slug is reserved: %s", slug)
		}
	}

	return nil
}

// Create insere um novo board no banco. Valida slug, gera ID e popula CreatedAt.
func (s *BoardStore) Create(b *model.Board) error {
	if err := ValidateSlug(b.Slug); err != nil {
		return fmt.Errorf("validate slug: %w", err)
	}

	if b.ID == "" {
		b.ID = model.NewID()
	}

	b.CreatedAt = time.Now()

	_, err := s.DB.Exec(`
		INSERT INTO boards (id, slug, name, description, owner_id, sfw, theme, is_locked, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`, b.ID, b.Slug, b.Name, b.Description, b.OwnerID, b.SFW, b.Theme, b.IsLocked, b.CreatedAt)

	if err != nil {
		return fmt.Errorf("create board: %w", err)
	}

	return nil
}

// GetBySlug retorna um board pelo slug único.
func (s *BoardStore) GetBySlug(slug string) (*model.Board, error) {
	var b model.Board
	err := s.DB.QueryRow(`
		SELECT id, slug, name, description, owner_id, sfw, theme, is_locked, created_at
		FROM boards WHERE slug = $1
	`, slug).Scan(&b.ID, &b.Slug, &b.Name, &b.Description, &b.OwnerID, &b.SFW, &b.Theme, &b.IsLocked, &b.CreatedAt)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("board not found: %s", slug)
	}
	if err != nil {
		return nil, fmt.Errorf("get board by slug: %w", err)
	}

	return &b, nil
}

// List retorna todos os boards ordenados por criação.
func (s *BoardStore) List() ([]model.Board, error) {
	rows, err := s.DB.Query(`
		SELECT id, slug, name, description, owner_id, sfw, theme, is_locked, created_at
		FROM boards
		ORDER BY created_at ASC
	`)

	if err != nil {
		return nil, fmt.Errorf("list boards: %w", err)
	}
	defer rows.Close()

	var boards []model.Board
	for rows.Next() {
		var b model.Board
		err := rows.Scan(&b.ID, &b.Slug, &b.Name, &b.Description, &b.OwnerID, &b.SFW, &b.Theme, &b.IsLocked, &b.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("scan board: %w", err)
		}
		boards = append(boards, b)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return boards, nil
}

// Update atualiza name, description, sfw, theme, is_locked de um board pelo ID.
func (s *BoardStore) Update(b *model.Board) error {
	if b.ID == "" {
		return fmt.Errorf("board ID cannot be empty")
	}

	_, err := s.DB.Exec(`
		UPDATE boards
		SET name = $1, description = $2, sfw = $3, theme = $4, is_locked = $5
		WHERE id = $6
	`, b.Name, b.Description, b.SFW, b.Theme, b.IsLocked, b.ID)

	if err != nil {
		return fmt.Errorf("update board: %w", err)
	}

	return nil
}

// Delete realiza hard delete de um board (CASCADE cuida de threads/posts).
// A confirmação é responsabilidade do handler, não do store.
func (s *BoardStore) Delete(id string) error {
	if id == "" {
		return fmt.Errorf("board ID cannot be empty")
	}

	_, err := s.DB.Exec(`DELETE FROM boards WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete board: %w", err)
	}

	return nil
}

// SeedBoards atribui ownership aos 5 boards iniciais.
// Para cada board sem staff, insere (board_id, adminID, 'owner') em board_staff
// e seta owner_id = adminID no board com owner_id NULL.
func (s *BoardStore) SeedBoards(adminID int) error {
	// Primeiro, atualiza owner_id dos boards com owner_id NULL para adminID
	_, err := s.DB.Exec(`
		UPDATE boards
		SET owner_id = $1
		WHERE owner_id IS NULL
	`, adminID)

	if err != nil {
		return fmt.Errorf("update board owner_id: %w", err)
	}

	// Depois, insere staff entries com ON CONFLICT DO NOTHING
	// (previne erro se já existir staff para esse board)
	_, err = s.DB.Exec(`
		INSERT INTO board_staff (board_id, user_id, role)
		SELECT id, $1, 'owner' FROM boards WHERE owner_id = $1
		ON CONFLICT (board_id, user_id) DO NOTHING
	`, adminID)

	if err != nil {
		return fmt.Errorf("seed board_staff: %w", err)
	}

	return nil
}
