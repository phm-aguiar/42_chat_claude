package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"42chat/internal/auth"
	"42chat/internal/forum/model"
	"42chat/internal/forum/store"

	"github.com/go-chi/chi/v5"
)

// ThreadHandler contém as dependências dos handlers de threads.
type ThreadHandler struct {
	Threads *store.ThreadStore
	Boards  *store.BoardStore
}

// Create cria um novo thread em um board.
// POST /api/forum/boards/{slug}/threads
// Requer autenticação. Board deve existir e não estar locked.
// Body: {title, content, tags}
// Response: 201 com o thread criado, ou 400/403/404 conforme contrato.
func (h *ThreadHandler) Create(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	slug := chi.URLParam(r, "slug")
	if slug == "" {
		writeError(w, http.StatusBadRequest, "slug is required", "MISSING_SLUG")
		return
	}

	// Resolve board por slug
	board, err := h.Boards.GetBySlug(slug)
	if err != nil {
		writeError(w, http.StatusNotFound, "board not found", "BOARD_NOT_FOUND")
		return
	}

	// Valida se board está locked
	if board.IsLocked {
		writeError(w, http.StatusForbidden, "board is locked", "BOARD_LOCKED")
		return
	}

	var req struct {
		Title   string   `json:"title"`
		Content string   `json:"content"`
		Tags    []string `json:"tags"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	// Validações de negócio (serão repetidas no store, mas aqui geramos erro HTTP específico)
	if len(req.Title) < 3 || len(req.Title) > 200 {
		writeError(w, http.StatusBadRequest, "title must be 3-200 characters", "INVALID_TITLE")
		return
	}

	if len(req.Content) > 10000 {
		writeError(w, http.StatusBadRequest, "content must be ≤10000 characters", "CONTENT_TOO_LONG")
		return
	}

	// Cria thread com dados do request + auth
	thread := &model.Thread{
		BoardID:  board.ID,
		AuthorID: claims.UserID,
		Title:    req.Title,
		Content:  req.Content,
		Tags:     req.Tags,
		IsPinned: false,
		IsLocked: false,
		PostCount: 0,
	}

	if err := h.Threads.Create(thread); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create thread", "INTERNAL_ERROR")
		return
	}

	writeJSON(w, http.StatusCreated, thread)
}

// ListByBoard retorna threads de um board em bump order.
// GET /api/forum/boards/{slug}/threads?limit=&offset=
// Query params: limit (default 20, max 100), offset (default 0)
// Response: 200 com array de threads.
func (h *ThreadHandler) ListByBoard(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	if slug == "" {
		writeError(w, http.StatusBadRequest, "slug is required", "MISSING_SLUG")
		return
	}

	// Resolve board por slug
	board, err := h.Boards.GetBySlug(slug)
	if err != nil {
		writeError(w, http.StatusNotFound, "board not found", "BOARD_NOT_FOUND")
		return
	}

	// Parse query params
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	limit := 20
	offset := 0

	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	if offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	// Busca threads do board
	threads, err := h.Threads.ListByBoard(board.ID, limit, offset)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list threads", "INTERNAL_ERROR")
		return
	}

	if threads == nil {
		threads = []model.Thread{}
	}

	writeJSON(w, http.StatusOK, threads)
}

// Get retorna um thread específico pelo ID.
// GET /api/forum/threads/{id}
// Response: 200 com o thread, ou 404 THREAD_NOT_FOUND.
func (h *ThreadHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "thread id is required", "MISSING_ID")
		return
	}

	thread, err := h.Threads.GetByID(id)
	if err != nil {
		writeError(w, http.StatusNotFound, "thread not found", "THREAD_NOT_FOUND")
		return
	}

	writeJSON(w, http.StatusOK, thread)
}

// Update atualiza um thread com campos parciais.
// PATCH /api/forum/threads/{id}
// Campos parciais suportados: is_pinned, is_locked (mod/admin), title, content, tags (autor/mod/admin)
// Response: 200 com o thread atualizado, ou 404 THREAD_NOT_FOUND.
func (h *ThreadHandler) Update(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "thread id is required", "MISSING_ID")
		return
	}

	// Busca thread atual
	thread, err := h.Threads.GetByID(id)
	if err != nil {
		writeError(w, http.StatusNotFound, "thread not found", "THREAD_NOT_FOUND")
		return
	}

	var req struct {
		Title    *string   `json:"title"`
		Content  *string   `json:"content"`
		Tags     *[]string `json:"tags"`
		IsPinned *bool     `json:"is_pinned"`
		IsLocked *bool     `json:"is_locked"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	// Aplicar mudanças parciais
	if req.Title != nil {
		if len(*req.Title) < 3 || len(*req.Title) > 200 {
			writeError(w, http.StatusBadRequest, "title must be 3-200 characters", "INVALID_TITLE")
			return
		}
		thread.Title = *req.Title
	}

	if req.Content != nil {
		if len(*req.Content) > 10000 {
			writeError(w, http.StatusBadRequest, "content must be ≤10000 characters", "CONTENT_TOO_LONG")
			return
		}
		thread.Content = *req.Content
	}

	if req.Tags != nil {
		thread.Tags = *req.Tags
	}

	if req.IsPinned != nil {
		thread.IsPinned = *req.IsPinned
	}

	if req.IsLocked != nil {
		thread.IsLocked = *req.IsLocked
	}

	// Persiste atualização
	if err := h.Threads.Update(thread); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update thread", "INTERNAL_ERROR")
		return
	}

	writeJSON(w, http.StatusOK, thread)
}

// Delete realiza soft delete de um thread.
// DELETE /api/forum/threads/{id}
// Response: 204 No Content.
func (h *ThreadHandler) Delete(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "thread id is required", "MISSING_ID")
		return
	}

	// Verifica se thread existe antes de deletar
	thread, err := h.Threads.GetByID(id)
	if err != nil {
		writeError(w, http.StatusNotFound, "thread not found", "THREAD_NOT_FOUND")
		return
	}

	// Soft delete
	if err := h.Threads.SoftDelete(thread.ID); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete thread", "INTERNAL_ERROR")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ListRecent retorna threads recentes cross-board.
// GET /api/forum/threads/recent?limit=10
// Query params: limit (default 10, clamp 1-50)
// Response: 200 com array de threads com board_slug.
func (h *ThreadHandler) ListRecent(w http.ResponseWriter, r *http.Request) {
	// Parse query params
	limitStr := r.URL.Query().Get("limit")
	limit := 10

	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l >= 1 && l <= 50 {
			limit = l
		}
	}

	// Busca threads recentes
	threads, err := h.Threads.ListRecent(limit)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list recent threads", "INTERNAL_ERROR")
		return
	}

	if threads == nil {
		threads = []model.ThreadWithBoard{}
	}

	writeJSON(w, http.StatusOK, threads)
}
