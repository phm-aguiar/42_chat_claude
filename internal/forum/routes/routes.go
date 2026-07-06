package routes

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"42chat/internal/auth"
	"42chat/internal/forum/handler"
	"42chat/internal/forum/middleware"
	"42chat/internal/forum/store"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
)

// RegisterForumRoutes monta todas as rotas do fórum no router principal.
// Instancia stores, handlers e middleware, e define a tabela de rotas.
func RegisterForumRoutes(r chi.Router, db *sql.DB) {
	// Instancia stores
	boardStore := &store.BoardStore{DB: db}
	boardStaffStore := &store.BoardStaffStore{DB: db}
	threadStore := &store.ThreadStore{DB: db}
	postStore := &store.PostStore{DB: db}

	// Instancia handlers
	boardHandler := &handler.BoardHandler{Store: boardStore}
	threadHandler := &handler.ThreadHandler{Threads: threadStore, Boards: boardStore}
	postHandler := &handler.PostHandler{Posts: postStore, Threads: threadStore}

	// Instancia middleware
	forumMw := middleware.New(db)

	// Monta subrouter /api/forum
	r.Route("/api/forum", func(r chi.Router) {
		// Middleware local do subrouter (logging)
		r.Use(chimw.Logger)

		// === Board Routes ===

		// GET /api/forum/boards — listagem (requer autenticação)
		r.With(auth.JWTMiddleware(), forumMw.AuthRequired).
			Get("/boards", boardHandler.List)

		// POST /api/forum/boards — criar board (JWT + AdminOnly)
		r.With(auth.JWTMiddleware(), forumMw.AdminOnly).
			Post("/boards", boardHandler.Create)

		// GET /api/forum/boards/{slug} — get único board (requer autenticação)
		r.With(auth.JWTMiddleware(), forumMw.AuthRequired).
			Get("/boards/{slug}", boardHandler.Get)

		// PATCH /api/forum/boards/{slug} — atualizar board (JWT + BoardOwner)
		r.With(auth.JWTMiddleware(), forumMw.BoardOwner).
			Patch("/boards/{slug}", boardHandler.Update)

		// DELETE /api/forum/boards/{slug} — deletar board (JWT + BoardOwner)
		r.With(auth.JWTMiddleware(), forumMw.BoardOwner).
			Delete("/boards/{slug}", boardHandler.Delete)

		// === Staff Routes (inline handlers) ===

		// POST /api/forum/boards/{slug}/staff — adicionar staff (JWT + BoardOwner)
		r.With(auth.JWTMiddleware(), forumMw.BoardOwner).
			Post("/boards/{slug}/staff", staffAdd(boardStore, boardStaffStore))

		// DELETE /api/forum/boards/{slug}/staff — remover staff (JWT + BoardOwner)
		// Body: {user_id}
		r.With(auth.JWTMiddleware(), forumMw.BoardOwner).
			Delete("/boards/{slug}/staff", staffRemove(boardStore, boardStaffStore))

		// === Thread Routes ===

		// GET /api/forum/boards/{slug}/threads — listagem de threads por board (requer autenticação)
		r.With(auth.JWTMiddleware(), forumMw.AuthRequired).
			Get("/boards/{slug}/threads", threadHandler.ListByBoard)

		// POST /api/forum/boards/{slug}/threads — criar thread (JWT + AuthRequired)
		r.With(auth.JWTMiddleware(), forumMw.AuthRequired).
			Post("/boards/{slug}/threads", threadHandler.Create)

		// GET /api/forum/threads/recent — threads recentes cross-board (requer autenticação)
		// Deve ser registrado ANTES de /threads/{id} para não colidir com o parâmetro
		r.With(auth.JWTMiddleware(), forumMw.AuthRequired).
			Get("/threads/recent", threadHandler.ListRecent)

		// GET /api/forum/threads/{id} — get único thread (requer autenticação)
		r.With(auth.JWTMiddleware(), forumMw.AuthRequired).
			Get("/threads/{id}", threadHandler.Get)

		// PATCH /api/forum/threads/{id} — atualizar thread (JWT + ModOnly)
		r.With(auth.JWTMiddleware(), forumMw.ModOnly).
			Patch("/threads/{id}", threadHandler.Update)

		// DELETE /api/forum/threads/{id} — deletar thread (JWT + ModOnly)
		r.With(auth.JWTMiddleware(), forumMw.ModOnly).
			Delete("/threads/{id}", threadHandler.Delete)

		// === Post Routes ===

		// GET /api/forum/threads/{id}/posts — listagem de posts por thread (requer autenticação)
		r.With(auth.JWTMiddleware(), forumMw.AuthRequired).
			Get("/threads/{id}/posts", postHandler.ListByThread)

		// POST /api/forum/threads/{id}/posts — criar post (JWT + AuthRequired)
		r.With(auth.JWTMiddleware(), forumMw.AuthRequired).
			Post("/threads/{id}/posts", postHandler.Create)

		// DELETE /api/forum/posts/{id} — deletar post (JWT + ModOnly)
		r.With(auth.JWTMiddleware(), forumMw.ModOnly).
			Delete("/posts/{id}", postHandler.Delete)
	})
}

// === Inline Staff Handlers ===

// staffAdd trata POST /api/forum/boards/{slug}/staff.
// Body: {user_id: int, role: string}
// Responde com 201 + struct do staff adicionado ou erro.
func staffAdd(boardStore *store.BoardStore, staffStore *store.BoardStaffStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		slug := chi.URLParam(r, "slug")
		if slug == "" {
			writeError(w, http.StatusBadRequest, "slug is required", "MISSING_SLUG")
			return
		}

		// Resolve board por slug
		board, err := boardStore.GetBySlug(slug)
		if err != nil {
			writeError(w, http.StatusNotFound, "board not found", "BOARD_NOT_FOUND")
			return
		}

		var req struct {
			UserID int    `json:"user_id"`
			Role   string `json:"role"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
			return
		}

		if req.UserID == 0 {
			writeError(w, http.StatusBadRequest, "user_id is required", "MISSING_USER_ID")
			return
		}

		if req.Role == "" {
			writeError(w, http.StatusBadRequest, "role is required", "MISSING_ROLE")
			return
		}

		// Adiciona staff
		if err := staffStore.Add(board.ID, req.UserID, req.Role); err != nil {
			// Valida se é erro de role inválido
			if err.Error() == "invalid role: "+req.Role+" (must be owner, mod, or admin)" {
				writeError(w, http.StatusBadRequest, "invalid role", "INVALID_ROLE")
				return
			}
			writeError(w, http.StatusInternalServerError, "failed to add staff", "INTERNAL_ERROR")
			return
		}

		writeJSON(w, http.StatusCreated, map[string]interface{}{
			"board_id": board.ID,
			"user_id":  req.UserID,
			"role":     req.Role,
		})
	}
}

// staffRemove trata DELETE /api/forum/boards/{slug}/staff.
// Body: {user_id: int}
// Responde com 204 No Content ou erro.
func staffRemove(boardStore *store.BoardStore, staffStore *store.BoardStaffStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		slug := chi.URLParam(r, "slug")
		if slug == "" {
			writeError(w, http.StatusBadRequest, "slug is required", "MISSING_SLUG")
			return
		}

		// Resolve board por slug
		board, err := boardStore.GetBySlug(slug)
		if err != nil {
			writeError(w, http.StatusNotFound, "board not found", "BOARD_NOT_FOUND")
			return
		}

		var req struct {
			UserID int `json:"user_id"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
			return
		}

		if req.UserID == 0 {
			writeError(w, http.StatusBadRequest, "user_id is required", "MISSING_USER_ID")
			return
		}

		// Remove staff
		if err := staffStore.Remove(board.ID, req.UserID); err != nil {
			if err.Error() == "board staff not found: board_id="+board.ID+", user_id="+string(rune(req.UserID)) {
				writeError(w, http.StatusNotFound, "staff not found", "STAFF_NOT_FOUND")
				return
			}
			writeError(w, http.StatusInternalServerError, "failed to remove staff", "INTERNAL_ERROR")
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

// === Response Helpers ===

// writeJSON escreve uma resposta JSON com status code.
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

// writeError escreve uma resposta de erro em formato padrão JSON.
func writeError(w http.ResponseWriter, status int, message, code string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{
		"error": message,
		"code":  code,
	})
}
