package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"42chat/internal/auth"
	"42chat/internal/chat/model"
	"42chat/internal/chat/store"

	"github.com/go-chi/chi/v5"
)

// ChatHandler contém as dependências dos handlers de chats.
type ChatHandler struct {
	Chats   *store.ChatStore
	Members *store.MemberStore
	Reads   *store.ReadStore
}

// === Response Helpers (não exportados) ===

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

// === Chat Handlers ===

// Create cria um novo chat (oneOnOne ou group).
// POST /api/chats
// Requer autenticação; body: {type, topic, members}
func (h *ChatHandler) Create(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	var req struct {
		Type    string `json:"type"`
		Topic   string `json:"topic"`
		Members []int  `json:"members"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	// Validar type (não pode ser "general")
	if !model.ValidChatType(req.Type) || req.Type == model.ChatTypeGeneral {
		writeError(w, http.StatusBadRequest, "invalid chat type", "INVALID_CHAT_TYPE")
		return
	}

	// Validar members (não vazio)
	if len(req.Members) == 0 {
		writeError(w, http.StatusBadRequest, "members list cannot be empty", "EMPTY_MEMBERS")
		return
	}

	// Se oneOnOne, deve ter exatamente 1 outro membro
	if req.Type == model.ChatTypeOneOnOne {
		if len(req.Members) != 1 {
			writeError(w, http.StatusBadRequest, "oneOnOne chat must have exactly one other member", "INVALID_MEMBERS_COUNT")
			return
		}

		// Verificar se oneOnOne já existe
		_, found, err := h.Chats.FindOneOnOne(claims.UserID, req.Members[0])
		if err != nil {
			writeError(w, http.StatusInternalServerError, "error checking existing chat", "INTERNAL_ERROR")
			return
		}
		if found {
			writeError(w, http.StatusConflict, "oneOnOne chat already exists", "CHAT_EXISTS")
			return
		}
	}

	// Criar chat
	chat := model.Chat{
		Type:      req.Type,
		Topic:     req.Topic,
		CreatedBy: &claims.UserID,
	}

	createdChat, err := h.Chats.CreateChat(chat, req.Members)
	if err != nil {
		// Detectar FK violation (user inexistente)
		if strings.Contains(err.Error(), "foreign key") || strings.Contains(err.Error(), "23503") {
			writeError(w, http.StatusNotFound, "one or more users not found", "USER_NOT_FOUND")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to create chat", "INTERNAL_ERROR")
		return
	}

	// Obter membros do chat criado
	members, err := h.Chats.GetChatMembers(createdChat.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch chat members", "INTERNAL_ERROR")
		return
	}

	// Preparar response com membros em formato simplificado
	response := map[string]any{
		"id":         createdChat.ID,
		"type":       createdChat.Type,
		"topic":      createdChat.Topic,
		"created_by": createdChat.CreatedBy,
		"created_at": createdChat.CreatedAt,
		"members": func() []map[string]any {
			var result []map[string]any
			for _, m := range members {
				result = append(result, map[string]any{
					"user_id": m.UserID,
					"role":    m.Role,
				})
			}
			return result
		}(),
	}

	writeJSON(w, http.StatusCreated, response)
}

// List retorna todos os chats do usuário autenticado com contagem de mensagens não lidas.
// GET /api/chats
func (h *ChatHandler) List(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	chats, err := h.Reads.ListUserChatsWithUnread(claims.UserID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list chats", "INTERNAL_ERROR")
		return
	}

	if chats == nil {
		chats = []model.ChatWithUnread{}
	}

	writeJSON(w, http.StatusOK, chats)
}

// Get retorna um chat específico com seus membros.
// GET /api/chats/{id}
func (h *ChatHandler) Get(w http.ResponseWriter, r *http.Request) {
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

	// Validar UUID parse (simples check: se é uma string não-vazia, aceita; formato rigoroso será validado na app)
	// Para validação rigorosa, poderia fazer parse com uuid.Parse, mas mantendo simples por enquanto

	// Buscar chat
	chat, err := h.Chats.GetChat(chatID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			writeError(w, http.StatusNotFound, "chat not found", "CHAT_NOT_FOUND")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to fetch chat", "INTERNAL_ERROR")
		return
	}

	// Validação defensiva: verificar se usuário é membro
	isMember, err := h.Members.IsMember(chatID, claims.UserID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to check membership", "INTERNAL_ERROR")
		return
	}
	if !isMember {
		writeError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
		return
	}

	// Obter membros
	members, err := h.Chats.GetChatMembers(chatID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch chat members", "INTERNAL_ERROR")
		return
	}

	// Preparar response
	response := map[string]any{
		"id":         chat.ID,
		"type":       chat.Type,
		"topic":      chat.Topic,
		"created_by": chat.CreatedBy,
		"created_at": chat.CreatedAt,
		"members": func() []map[string]any {
			var result []map[string]any
			for _, m := range members {
				result = append(result, map[string]any{
					"user_id": m.UserID,
					"role":    m.Role,
				})
			}
			return result
		}(),
	}

	writeJSON(w, http.StatusOK, response)
}
