package handler

import (
	"net/http"

	"42chat/internal/auth"
	"42chat/internal/chat/store"

	"github.com/go-chi/chi/v5"
)

// ReadHandler contém as dependências dos handlers de read tracking.
type ReadHandler struct {
	Reads *store.ReadStore
}

// MarkRead marca um chat como lido pelo usuário.
// POST /api/chats/{id}/read
// Resposta: 204 No Content (sucesso) ou erro JSON padrão.
func (h *ReadHandler) MarkRead(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	chatID := chi.URLParam(r, "id")
	if chatID == "" {
		writeError(w, http.StatusBadRequest, "chat id is required", "MISSING_CHAT_ID")
		return
	}

	// Marcar como lido
	if err := h.Reads.MarkRead(chatID, claims.UserID); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to mark chat as read", "INTERNAL_ERROR")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
