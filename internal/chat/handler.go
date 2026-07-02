package chat

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"os"
	"runtime"
	"strconv"
	"strings"
	"time"

	"42chat/internal/auth"
	"42chat/internal/db/queries"
	"42chat/internal/ws"

	"github.com/go-chi/chi/v5"
	"github.com/gorilla/websocket"
)

// Handler contém as dependências dos handlers de chat.
type Handler struct {
	DB  *sql.DB
	Hub *ws.Hub
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		if origin == "" {
			return true
		}
		allowed := os.Getenv("WS_ALLOWED_ORIGINS")
		if allowed == "" || allowed == "*" {
			return true
		}
		for _, o := range strings.Split(allowed, ",") {
			if strings.TrimSpace(o) == origin {
				return true
			}
		}
		return false
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// GetMessages retorna histórico de mensagens com cursor pagination.
// GET /api/messages?before=<timestamp>&limit=<n>
func (h *Handler) GetMessages(w http.ResponseWriter, r *http.Request) {
	before := time.Now().UTC()
	if b := r.URL.Query().Get("before"); b != "" {
		if t, err := time.Parse(time.RFC3339Nano, b); err == nil {
			before = t
		}
	}

	limit := 50
	if l := r.URL.Query().Get("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil && n > 0 && n <= 100 {
			limit = n
		}
	}

	msgs, err := queries.GetMessages(h.DB, before, limit)
	if err != nil {
		http.Error(w, `{"error":"erro interno","code":"DB_ERROR"}`, http.StatusInternalServerError)
		return
	}
	if msgs == nil {
		msgs = []queries.Message{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(msgs)
}

// GetUser retorna dados de um usuário pelo ID.
// GET /api/users/{id}
func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error":"id inválido","code":"INVALID_ID"}`, http.StatusBadRequest)
		return
	}

	user, err := queries.GetUserByID(h.DB, id)
	if err != nil {
		http.Error(w, `{"error":"não encontrado","code":"NOT_FOUND"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// HandleUserStats retorna os stats de participação do usuário.
// GET /api/users/{id}/stats
func (h *Handler) HandleUserStats(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error":"id inválido","code":"INVALID_ID"}`, http.StatusBadRequest)
		return
	}

	stats, err := GetUserStats(h.DB, id)
	if err == sql.ErrNoRows {
		http.Error(w, `{"error":"usuário não encontrado","code":"USER_NOT_FOUND"}`, http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, `{"error":"erro interno","code":"INTERNAL_ERROR"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// ServeWS faz o upgrade da conexão para WebSocket.
// GET /ws?token=<jwt>
// Token aceito via query param (header não acessível na conexão WS inicial).
func (h *Handler) ServeWS(w http.ResponseWriter, r *http.Request) {
	// Valida JWT do query param (fallback para WS onde o header é difícil de setar)
	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, `{"error":"token ausente","code":"MISSING_TOKEN"}`, http.StatusUnauthorized)
		return
	}

	claims, err := auth.ParseJWT(token)
	if err != nil {
		http.Error(w, `{"error":"token inválido","code":"INVALID_TOKEN"}`, http.StatusUnauthorized)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	client := ws.NewClient(h.Hub, conn, claims.UserID, claims.Login, h.DB)
	h.Hub.Register(client)

	// Broadcast de entrada
	joinMsg, _ := json.Marshal(map[string]string{
		"type":    "join",
		"login":   claims.Login,
		"content": claims.Login + " entrou no chat",
	})
	h.Hub.Broadcast(joinMsg)

	// Inicia pumps em goroutines
	go client.WritePump()
	go func() {
		defer func() {
			leaveMsg, _ := json.Marshal(map[string]string{
				"type":    "leave",
				"login":   claims.Login,
				"content": claims.Login + " saiu do chat",
			})
			h.Hub.Broadcast(leaveMsg)
		}()
		// context.Background: r.Context() é cancelado quando ServeWS retorna,
		// o que encerraria readPump imediatamente. A vida do WS é gerenciada
		// pelo próprio conn — hub.Shutdown() fecha via writePump no graceful shutdown.
		client.ReadPump(context.Background())
	}()
}

// Metrics retorna métricas básicas do servidor.
// GET /metrics
func (h *Handler) Metrics(w http.ResponseWriter, r *http.Request) {
	stats := h.DB.Stats()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"goroutines":          runtime.NumGoroutine(),
		"db_open_connections": stats.OpenConnections,
		"ws_active_clients":   h.Hub.ClientCount(),
	})
}
