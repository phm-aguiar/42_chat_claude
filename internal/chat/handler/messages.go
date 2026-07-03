package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"42chat/internal/auth"
	"42chat/internal/chat/model"
	"42chat/internal/chat/store"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// MessageHandler contém as dependências dos handlers de mensagens.
type MessageHandler struct {
	Messages *store.MessageStore
	Members  *store.MemberStore
}

// === Response Helpers (não exportados, prefixo specific para evitar conflito com chats.go) ===

// writeMsgJSON escreve uma resposta JSON com status code.
func writeMsgJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

// writeMsgError escreve uma resposta de erro em formato padrão JSON.
func writeMsgError(w http.ResponseWriter, status int, message, code string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{
		"error": message,
		"code":  code,
	})
}

// === Message Handlers ===

// ListByChatID lista mensagens de um chat com cursor pagination.
// GET /api/chats/{id}/messages
// Query params: ?before=<RFC3339>&limit=50 (limit max 100, default 50)
// before ausente → NOW(); before inválido → 400
// Response 200: {"messages": [...], "has_more": bool, "next_before": "..."}
// next_before retorna apenas se has_more=true
func (h *MessageHandler) ListByChatID(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r.Context())
	if claims == nil {
		writeMsgError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	chatID := chi.URLParam(r, "id")
	if chatID == "" {
		writeMsgError(w, http.StatusBadRequest, "chat id is required", "MISSING_CHAT_ID")
		return
	}

	// Validar chat_id como UUID
	if _, err := uuid.Parse(chatID); err != nil {
		writeMsgError(w, http.StatusBadRequest, "invalid chat id", "INVALID_CHAT_ID")
		return
	}

	// Autorização: verificar se é membro do chat
	isMember, err := h.Members.IsMember(chatID, claims.UserID)
	if err != nil {
		writeMsgError(w, http.StatusInternalServerError, "failed to verify membership", "INTERNAL_ERROR")
		return
	}
	if !isMember {
		writeMsgError(w, http.StatusForbidden, "not a member of this chat", "NOT_A_MEMBER")
		return
	}

	// Parse query params
	beforeStr := r.URL.Query().Get("before")
	limitStr := r.URL.Query().Get("limit")

	// before: default NOW, ou parse RFC3339
	before := time.Now()
	if beforeStr != "" {
		parsedBefore, err := time.Parse(time.RFC3339, beforeStr)
		if err != nil {
			writeMsgError(w, http.StatusBadRequest, "invalid before timestamp", "INVALID_TIMESTAMP")
			return
		}
		before = parsedBefore
	}

	// limit: default 50, parse int, clamp [1, 100]
	limit := 50
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	// Buscar mensagens
	messages, hasMore, err := h.Messages.ListByChat(chatID, before, limit)
	if err != nil {
		writeMsgError(w, http.StatusInternalServerError, "failed to list messages", "INTERNAL_ERROR")
		return
	}

	// Construir response
	resp := map[string]any{
		"messages":  messages,
		"has_more":  hasMore,
	}

	// Adicionar next_before apenas se has_more=true
	if hasMore && len(messages) > 0 {
		// A última mensagem (mais antiga da página) tem o timestamp que deve ser o next_before
		lastMsg := messages[len(messages)-1]
		resp["next_before"] = lastMsg.CreatedAt.Format(time.RFC3339)
	}

	writeMsgJSON(w, http.StatusOK, resp)
}

// SendMessage envia uma mensagem em um chat.
// POST /api/chats/{id}/messages
// Body: {"content": "..."}
// Content vazio ou > 5000 chars → 400
// Response 201 com a mensagem criada (enriquecida)
func (h *MessageHandler) SendMessage(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r.Context())
	if claims == nil {
		writeMsgError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	chatID := chi.URLParam(r, "id")
	if chatID == "" {
		writeMsgError(w, http.StatusBadRequest, "chat id is required", "MISSING_CHAT_ID")
		return
	}

	// Validar chat_id como UUID
	if _, err := uuid.Parse(chatID); err != nil {
		writeMsgError(w, http.StatusBadRequest, "invalid chat id", "INVALID_CHAT_ID")
		return
	}

	// Autorização: verificar se é membro do chat
	isMember, err := h.Members.IsMember(chatID, claims.UserID)
	if err != nil {
		writeMsgError(w, http.StatusInternalServerError, "failed to verify membership", "INTERNAL_ERROR")
		return
	}
	if !isMember {
		writeMsgError(w, http.StatusForbidden, "not a member of this chat", "NOT_A_MEMBER")
		return
	}

	// Parse request body
	var req struct {
		Content string `json:"content"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeMsgError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	// Validação: content não vazio e ≤ 5000 chars
	if req.Content == "" {
		writeMsgError(w, http.StatusBadRequest, "content cannot be empty", "INVALID_REQUEST")
		return
	}

	if len(req.Content) > 5000 {
		writeMsgError(w, http.StatusBadRequest, "content exceeds maximum length of 5000 characters", "CONTENT_TOO_LONG")
		return
	}

	// Criar mensagem via store
	msg, err := h.Messages.Send(chatID, claims.UserID, req.Content)
	if err != nil {
		writeMsgError(w, http.StatusInternalServerError, "failed to send message", "INTERNAL_ERROR")
		return
	}

	writeMsgJSON(w, http.StatusCreated, msg)
}

// DeleteMessage realiza soft delete de uma mensagem.
// DELETE /api/messages/{id}
// Autorização: mod/admin do chat — validação defensiva via GetRole.
// Consulta chat_id da mensagem, valida role, depois soft delete.
// Response 204 No Content.
func (h *MessageHandler) DeleteMessage(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r.Context())
	if claims == nil {
		writeMsgError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	messageID := chi.URLParam(r, "id")
	if messageID == "" {
		writeMsgError(w, http.StatusBadRequest, "message id is required", "MISSING_MESSAGE_ID")
		return
	}

	// Validar message_id como UUID
	if _, err := uuid.Parse(messageID); err != nil {
		writeMsgError(w, http.StatusBadRequest, "invalid message id", "INVALID_MESSAGE_ID")
		return
	}

	// Autorização: apenas owner/mod do chat podem deletar mensagens
	chatID, err := h.Messages.GetChatID(messageID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeMsgError(w, http.StatusNotFound, "message not found", "MESSAGE_NOT_FOUND")
			return
		}
		writeMsgError(w, http.StatusInternalServerError, "failed to delete message", "INTERNAL_ERROR")
		return
	}
	role, err := h.Members.GetRole(chatID, claims.UserID)
	if err != nil || (role != model.RoleOwner && role != model.RoleMod) {
		writeMsgError(w, http.StatusForbidden, "only chat owner or mod can delete messages", "FORBIDDEN")
		return
	}

	// Soft delete da mensagem
	if err := h.Messages.SoftDelete(messageID); err != nil {
		// Se erro é "message not found", retornar 404
		// Caso contrário, retornar 500
		if err.Error() == "message not found or already deleted" {
			writeMsgError(w, http.StatusNotFound, "message not found", "MESSAGE_NOT_FOUND")
			return
		}
		writeMsgError(w, http.StatusInternalServerError, "failed to delete message", "INTERNAL_ERROR")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
