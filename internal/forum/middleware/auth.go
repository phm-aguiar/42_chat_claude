package middleware

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"42chat/internal/auth"
	"42chat/internal/forum/model"
	"42chat/internal/forum/store"
	"github.com/go-chi/chi/v5"
)

// ForumMiddleware contém as dependências de autenticação e autorização para o fórum.
type ForumMiddleware struct {
	Boards  *store.BoardStore
	Staff   *store.BoardStaffStore
	DB      *sql.DB
	AdminID int
}

// New constrói um novo ForumMiddleware.
// Lê FORUM_ADMIN_ID do ambiente; AdminID=0 significa sem admin global.
func New(db *sql.DB) *ForumMiddleware {
	adminIDStr := os.Getenv("FORUM_ADMIN_ID")
	adminID := 0
	if adminIDStr != "" {
		if parsed, err := strconv.Atoi(adminIDStr); err == nil {
			adminID = parsed
		}
	}

	return &ForumMiddleware{
		Boards:  &store.BoardStore{DB: db},
		Staff:   &store.BoardStaffStore{DB: db},
		DB:      db,
		AdminID: adminID,
	}
}

// errorResponse escreve um erro JSON no formato padrão.
func errorResponse(w http.ResponseWriter, statusCode int, message, code string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{
		"error": message,
		"code":  code,
	})
}

// AuthRequired exige que o usuário esteja autenticado.
// Retorna 401 UNAUTHORIZED se as claims não estiverem no contexto.
func (fm *ForumMiddleware) AuthRequired(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims := auth.GetClaims(r.Context())
		if claims == nil {
			errorResponse(w, http.StatusUnauthorized, "login necessário", "UNAUTHORIZED")
			return
		}
		next.ServeHTTP(w, r)
	})
}

// resolveBoardID resolve o board_id a partir dos URL params.
// Procura por {slug} na rota; se não encontrar, procura por {id} (thread_id) e consulta o banco.
// Retorna (boardID string, error).
func (fm *ForumMiddleware) resolveBoardID(r *http.Request) (string, error) {
	// Tenta {slug}
	slug := chi.URLParam(r, "slug")
	if slug != "" {
		board, err := fm.Boards.GetBySlug(slug)
		if err != nil {
			return "", fmt.Errorf("resolve board by slug: %w", err)
		}
		return board.ID, nil
	}

	// Tenta {id} (thread_id)
	threadID := chi.URLParam(r, "id")
	if threadID != "" {
		var boardID string
		err := fm.DB.QueryRow(`
			SELECT board_id FROM threads WHERE id = $1
		`, threadID).Scan(&boardID)
		if err == sql.ErrNoRows {
			return "", fmt.Errorf("thread not found: %s", threadID)
		}
		if err != nil {
			return "", fmt.Errorf("resolve board by thread: %w", err)
		}
		return boardID, nil
	}

	return "", fmt.Errorf("resolveBoardID: neither slug nor id found in URL params")
}

// roleFor determina o role de um usuário em um board.
// Se o usuário é admin global (AdminID > 0 e matches), retorna "admin".
// Caso contrário, consulta board_staff; retorna "" se não for staff.
func (fm *ForumMiddleware) roleFor(ctx *http.Request, boardID string, userID int) (string, error) {
	// Admin global sempre retorna "admin"
	if fm.AdminID > 0 && userID == fm.AdminID {
		return model.RoleAdmin, nil
	}

	// Consulta board_staff
	role, err := fm.Staff.GetRole(boardID, userID)
	if err != nil {
		return "", fmt.Errorf("get role: %w", err)
	}

	return role, nil
}

// ModOnly requer que o usuário seja owner, mod ou admin no board.
// Retorna 403 FORBIDDEN caso contrário.
func (fm *ForumMiddleware) ModOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims := auth.GetClaims(r.Context())
		if claims == nil {
			errorResponse(w, http.StatusUnauthorized, "login necessário", "UNAUTHORIZED")
			return
		}

		boardID, err := fm.resolveBoardID(r)
		if err != nil {
			errorResponse(w, http.StatusBadRequest, fmt.Sprintf("invalid board reference: %v", err), "INVALID_BOARD")
			return
		}

		role, err := fm.roleFor(r, boardID, claims.UserID)
		if err != nil {
			errorResponse(w, http.StatusInternalServerError, "erro ao verificar role", "ROLE_CHECK_ERROR")
			return
		}

		// Verifica se é owner, mod ou admin
		switch role {
		case model.RoleOwner, model.RoleMod, model.RoleAdmin:
			next.ServeHTTP(w, r)
		default:
			errorResponse(w, http.StatusForbidden, "acesso restrito: moderador ou admin necessário", "FORBIDDEN")
		}
	})
}

// AdminOnly requer que o usuário seja admin no board ou admin global.
// Retorna 403 FORBIDDEN caso contrário.
func (fm *ForumMiddleware) AdminOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims := auth.GetClaims(r.Context())
		if claims == nil {
			errorResponse(w, http.StatusUnauthorized, "login necessário", "UNAUTHORIZED")
			return
		}

		boardID, err := fm.resolveBoardID(r)
		if err != nil {
			errorResponse(w, http.StatusBadRequest, fmt.Sprintf("invalid board reference: %v", err), "INVALID_BOARD")
			return
		}

		role, err := fm.roleFor(r, boardID, claims.UserID)
		if err != nil {
			errorResponse(w, http.StatusInternalServerError, "erro ao verificar role", "ROLE_CHECK_ERROR")
			return
		}

		// Verifica se é admin
		if role != model.RoleAdmin {
			errorResponse(w, http.StatusForbidden, "acesso restrito: admin necessário", "FORBIDDEN")
			return
		}

		next.ServeHTTP(w, r)
	})
}

// BoardOwner requer que o usuário seja owner do board.
// Retorna 403 FORBIDDEN caso contrário.
func (fm *ForumMiddleware) BoardOwner(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims := auth.GetClaims(r.Context())
		if claims == nil {
			errorResponse(w, http.StatusUnauthorized, "login necessário", "UNAUTHORIZED")
			return
		}

		boardID, err := fm.resolveBoardID(r)
		if err != nil {
			errorResponse(w, http.StatusBadRequest, fmt.Sprintf("invalid board reference: %v", err), "INVALID_BOARD")
			return
		}

		role, err := fm.roleFor(r, boardID, claims.UserID)
		if err != nil {
			errorResponse(w, http.StatusInternalServerError, "erro ao verificar role", "ROLE_CHECK_ERROR")
			return
		}

		// Verifica se é owner
		if role != model.RoleOwner {
			errorResponse(w, http.StatusForbidden, "acesso restrito: owner necessário", "FORBIDDEN")
			return
		}

		next.ServeHTTP(w, r)
	})
}
