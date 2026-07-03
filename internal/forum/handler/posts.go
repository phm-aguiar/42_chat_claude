package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"42chat/internal/auth"
	"42chat/internal/forum/model"
	"42chat/internal/forum/store"

	"github.com/go-chi/chi/v5"
)

// PostHandler contém as dependências dos handlers de posts.
type PostHandler struct {
	Posts   *store.PostStore
	Threads *store.ThreadStore
}

// === Post Handlers ===

// Create cria um novo post em um thread.
// POST /api/forum/threads/{id}/posts
// Requer autenticação; body: {content, reply_to?}
// Após criar com sucesso, bumpa o thread (incrementa last_post_at e post_count).
func (h *PostHandler) Create(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	threadID := chi.URLParam(r, "id")
	if threadID == "" {
		writeError(w, http.StatusBadRequest, "thread id is required", "MISSING_THREAD_ID")
		return
	}

	// Resolve thread — verifica existência e status locked
	thread, err := h.Threads.GetByID(threadID)
	if err != nil {
		writeError(w, http.StatusNotFound, "thread not found", "THREAD_NOT_FOUND")
		return
	}

	// Verifica se thread está locked
	if thread.IsLocked {
		writeError(w, http.StatusForbidden, "thread is locked", "THREAD_LOCKED")
		return
	}

	var req struct {
		Content string `json:"content"`
		ReplyTo *string `json:"reply_to"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	// Validar content: não vazio e ≤10000 chars
	if req.Content == "" {
		writeError(w, http.StatusBadRequest, "content cannot be empty", "INVALID_REQUEST")
		return
	}

	if len(req.Content) > 10000 {
		writeError(w, http.StatusBadRequest, "content exceeds maximum length of 10000 characters", "CONTENT_TOO_LONG")
		return
	}

	// Criar post
	post := &model.Post{
		ThreadID: threadID,
		AuthorID: claims.UserID,
		Content:  req.Content,
		ReplyTo:  req.ReplyTo,
	}

	if err := h.Posts.Create(post); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create post", "INTERNAL_ERROR")
		return
	}

	// Bump thread — incrementa last_post_at e post_count
	if err := h.Threads.Bump(threadID); err != nil {
		// Log o erro mas retorna 201 mesmo assim — post foi criado com sucesso
		log.Printf("warning: failed to bump thread %s after creating post: %v", threadID, err)
	}

	writeJSON(w, http.StatusCreated, post)
}

// ListByThread lista todos os posts de um thread.
// GET /api/forum/threads/{id}/posts
// Retorna posts ordenados cronologicamente (ascending), excluindo deletados.
func (h *PostHandler) ListByThread(w http.ResponseWriter, r *http.Request) {
	threadID := chi.URLParam(r, "id")
	if threadID == "" {
		writeError(w, http.StatusBadRequest, "thread id is required", "MISSING_THREAD_ID")
		return
	}

	// Verifica se thread existe
	_, err := h.Threads.GetByID(threadID)
	if err != nil {
		writeError(w, http.StatusNotFound, "thread not found", "THREAD_NOT_FOUND")
		return
	}

	posts, err := h.Posts.ListByThread(threadID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list posts", "INTERNAL_ERROR")
		return
	}

	// Retorna slice vazio se nenhum post encontrado, não null
	if posts == nil {
		posts = []model.Post{}
	}

	writeJSON(w, http.StatusOK, posts)
}

// Delete realiza soft delete de um post.
// DELETE /api/forum/posts/{id}
// Retorna 204 No Content.
func (h *PostHandler) Delete(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	postID := chi.URLParam(r, "id")
	if postID == "" {
		writeError(w, http.StatusBadRequest, "post id is required", "MISSING_POST_ID")
		return
	}

	// Soft delete do post
	if err := h.Posts.SoftDelete(postID); err != nil {
		// Se o erro for "post not found", retornar 404
		// Caso contrário, retornar 500
		if fmt.Sprint(err) == fmt.Sprintf("post not found: %s", postID) {
			writeError(w, http.StatusNotFound, "post not found", "POST_NOT_FOUND")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to delete post", "INTERNAL_ERROR")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
