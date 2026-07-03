package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"42chat/internal/chat/model"
	"42chat/internal/chat/store"

	"github.com/go-chi/chi/v5"
)

// MemberHandler contém as dependências dos handlers de membros de chat.
type MemberHandler struct {
	Members *store.MemberStore
	Chats   *store.ChatStore
}

// Add trata POST /api/chats/{id}/members.
// Body: {user_id: int, role: string (opcional, default "member")}
// role não pode ser "owner" via API → 400
// Membro duplicado → 409 ALREADY_MEMBER
// Usuário inexistente → 404 USER_NOT_FOUND
// Sucesso → 201 com data do membro adicionado
func (h *MemberHandler) Add(w http.ResponseWriter, r *http.Request) {
	chatID := chi.URLParam(r, "id")
	if chatID == "" {
		writeError(w, http.StatusBadRequest, "chat id is required", "MISSING_CHAT_ID")
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

	// Se role não foi fornecido, usa default "member"
	if req.Role == "" {
		req.Role = model.RoleMember
	}

	// NUNCA aceitar "owner" via API
	if req.Role == model.RoleOwner {
		writeError(w, http.StatusBadRequest, "cannot set owner role via API", "FORBIDDEN_ROLE")
		return
	}

	// Adiciona membro
	if err := h.Members.Add(chatID, req.UserID, req.Role); err != nil {
		errStr := err.Error()
		// Duplicata (pq 23505 — UNIQUE violation)
		if strings.Contains(errStr, "23505") {
			writeError(w, http.StatusConflict, "user already a member of this chat", "ALREADY_MEMBER")
			return
		}
		// Usuário ou chat inexistente (pq 23503 — FK violation)
		if strings.Contains(errStr, "23503") {
			writeError(w, http.StatusNotFound, "user not found", "USER_NOT_FOUND")
			return
		}
		// Role inválido
		if strings.Contains(errStr, "invalid role") {
			writeError(w, http.StatusBadRequest, "invalid role", "INVALID_ROLE")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to add member", "INTERNAL_ERROR")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"chat_id": chatID,
		"user_id": req.UserID,
		"role":    req.Role,
	})
}

// Remove trata DELETE /api/chats/{id}/members/{user_id}.
// Não permite remover owner (403 CANNOT_REMOVE_OWNER)
// Membro não encontrado → 404
// Sucesso → 204 No Content
func (h *MemberHandler) Remove(w http.ResponseWriter, r *http.Request) {
	chatID := chi.URLParam(r, "id")
	if chatID == "" {
		writeError(w, http.StatusBadRequest, "chat id is required", "MISSING_CHAT_ID")
		return
	}

	userIDStr := chi.URLParam(r, "user_id")
	if userIDStr == "" {
		writeError(w, http.StatusBadRequest, "user_id is required", "MISSING_USER_ID")
		return
	}

	// Parse user_id
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid user_id format", "INVALID_USER_ID")
		return
	}

	// Verificar se o usuário a ser removido é owner — não pode remover owner
	role, err := h.Members.GetRole(chatID, userID)
	if err != nil {
		writeError(w, http.StatusNotFound, "chat member not found", "MEMBER_NOT_FOUND")
		return
	}

	if role == model.RoleOwner {
		writeError(w, http.StatusForbidden, "cannot remove chat owner", "CANNOT_REMOVE_OWNER")
		return
	}

	// Remove membro
	if err := h.Members.Remove(chatID, userID); err != nil {
		if strings.Contains(err.Error(), "not found") {
			writeError(w, http.StatusNotFound, "chat member not found", "MEMBER_NOT_FOUND")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to remove member", "INTERNAL_ERROR")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
