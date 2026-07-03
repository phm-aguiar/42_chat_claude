package middleware

import (
	"encoding/json"
	"net/http"

	"42chat/internal/auth"
	"42chat/internal/chat/model"
	"42chat/internal/chat/store"

	"github.com/go-chi/chi/v5"
)

// ChatMiddleware contém as dependências de autenticação e autorização para chat.
type ChatMiddleware struct {
	Members *store.MemberStore
}

// New constrói um novo ChatMiddleware.
func New(members *store.MemberStore) *ChatMiddleware {
	return &ChatMiddleware{
		Members: members,
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

// ChatMember verifica se o usuário é membro do chat.
// Retorna 401 UNAUTHORIZED se sem claims, 403 NOT_A_MEMBER se não é membro.
func (cm *ChatMiddleware) ChatMember(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims := auth.GetClaims(r.Context())
		if claims == nil {
			errorResponse(w, http.StatusUnauthorized, "login necessário", "UNAUTHORIZED")
			return
		}

		chatID := chi.URLParam(r, "id")
		if chatID == "" {
			errorResponse(w, http.StatusBadRequest, "chat id is required", "MISSING_CHAT_ID")
			return
		}

		isMember, err := cm.Members.IsMember(chatID, claims.UserID)
		if err != nil {
			errorResponse(w, http.StatusInternalServerError, "erro ao verificar membership", "MEMBERSHIP_CHECK_ERROR")
			return
		}

		if !isMember {
			errorResponse(w, http.StatusForbidden, "você não é membro deste chat", "NOT_A_MEMBER")
			return
		}

		next.ServeHTTP(w, r)
	})
}

// ChatModOnly verifica se o usuário é owner ou mod do chat.
// Retorna 401 UNAUTHORIZED se sem claims, 403 FORBIDDEN se não tem permissão.
func (cm *ChatMiddleware) ChatModOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims := auth.GetClaims(r.Context())
		if claims == nil {
			errorResponse(w, http.StatusUnauthorized, "login necessário", "UNAUTHORIZED")
			return
		}

		chatID := chi.URLParam(r, "id")
		if chatID == "" {
			errorResponse(w, http.StatusBadRequest, "chat id is required", "MISSING_CHAT_ID")
			return
		}

		role, err := cm.Members.GetRole(chatID, claims.UserID)
		if err != nil {
			// GetRole retorna sql.ErrNoRows se não for membro, ou outro erro
			errorResponse(w, http.StatusForbidden, "acesso restrito: moderador necessário", "FORBIDDEN")
			return
		}

		// Verifica se é owner ou mod
		switch role {
		case model.RoleOwner, model.RoleMod:
			next.ServeHTTP(w, r)
		default:
			errorResponse(w, http.StatusForbidden, "acesso restrito: moderador necessário", "FORBIDDEN")
		}
	})
}
