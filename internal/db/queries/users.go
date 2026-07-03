package queries

import (
	"database/sql"
	"fmt"

	"github.com/lib/pq"
)

// User representa um aluno da 42 autenticado.
type User struct {
	ID          int     `json:"id"`
	Login       string  `json:"login"`
	ImageURL    string  `json:"image_url"`
	CurrentHost string  `json:"current_host"`
	Level       float64 `json:"level"`
}

// UpsertUser insere ou atualiza um usuário pelo id da API 42.
// Usa INSERT ... ON CONFLICT para idempotência.
func UpsertUser(db *sql.DB, u User) error {
	_, err := db.Exec(`
		INSERT INTO users (id, login, image_url, current_host, level)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (id) DO UPDATE SET
			login        = EXCLUDED.login,
			image_url    = EXCLUDED.image_url,
			current_host = EXCLUDED.current_host,
			level        = EXCLUDED.level
	`, u.ID, u.Login, u.ImageURL, u.CurrentHost, u.Level)
	if err != nil {
		return fmt.Errorf("upsert user: %w", err)
	}
	return nil
}

// GetUserByID busca um usuário pelo id inteiro da API 42.
func GetUserByID(db *sql.DB, id int) (User, error) {
	var u User
	err := db.QueryRow(`
		SELECT id, login, image_url, current_host, level
		FROM users WHERE id = $1
	`, id).Scan(&u.ID, &u.Login, &u.ImageURL, &u.CurrentHost, &u.Level)
	if err == sql.ErrNoRows {
		return User{}, fmt.Errorf("user not found: %d", id)
	}
	if err != nil {
		return User{}, fmt.Errorf("get user: %w", err)
	}
	return u, nil
}

// UpdateTitleSkills atualiza título e skills de um usuário.
// Ambos os campos são opcionais; passa-se strings vazias para não alterar.
func UpdateTitleSkills(db *sql.DB, userID int, title string, skills []string) error {
	_, err := db.Exec(`
		UPDATE users
		SET title = $2, skills = $3
		WHERE id = $1
	`, userID, title, pq.Array(skills))
	if err != nil {
		return fmt.Errorf("update title/skills: %w", err)
	}
	return nil
}
