package auth

import (
	"context"
	"net/http"
	"strings"
)

type contextKey string

const claimsKey contextKey = "claims"

// JWTMiddleware valida o token Bearer no header Authorization.
// Injeta *Claims no contexto sob claimsKey.
// Retorna 401 se token ausente ou inválido.
func JWTMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")
			if header == "" {
				http.Error(w, `{"error":"token ausente","code":"MISSING_TOKEN"}`, http.StatusUnauthorized)
				return
			}

			parts := strings.SplitN(header, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
				http.Error(w, `{"error":"formato inválido","code":"INVALID_FORMAT"}`, http.StatusUnauthorized)
				return
			}

			claims, err := ParseJWT(parts[1])
			if err != nil {
				http.Error(w, `{"error":"token inválido","code":"INVALID_TOKEN"}`, http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), claimsKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetClaims extrai *Claims do contexto. Retorna nil se ausente.
func GetClaims(ctx context.Context) *Claims {
	v, _ := ctx.Value(claimsKey).(*Claims)
	return v
}
