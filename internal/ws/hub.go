package ws

import (
	"context"
	"encoding/json"
	"sync"
	"time"
)

// GeneralChatID é a room padrão para o chat global (feature 100).
// SYNC: internal/db/migrations/003_chat_resources.sql
const GeneralChatID = "00000000-0000-7000-8000-000000000001"

// Hub gerencia todas as conexões WebSocket ativas.
// ADR-001: modelo híbrido — RWMutex no mapa + send chan por client.
// ADR-105.3: usersIndex para notificação direcionada.
type Hub struct {
	clients       map[*Client]bool
	rooms         map[string]map[*Client]bool // roomID -> (clients), protegido por mu
	usersIndex    map[int]map[*Client]bool    // userID -> (clients ativas do usuário), protegido por mu
	mu            sync.RWMutex
	register      chan *Client
	unregister    chan *Client
	broadcast     chan []byte
	statsDebounce map[int]*time.Timer
	statsMu       sync.Mutex
}

// NewHub cria e retorna um Hub pronto para uso.
func NewHub() *Hub {
	return &Hub{
		clients:       make(map[*Client]bool),
		rooms:         make(map[string]map[*Client]bool),
		usersIndex:    make(map[int]map[*Client]bool),
		register:      make(chan *Client, 16),
		unregister:    make(chan *Client, 16),
		broadcast:     make(chan []byte, 256),
		statsDebounce: make(map[int]*time.Timer),
	}
}

// Run executa o loop central do Hub. Deve rodar em goroutine dedicada.
// Respeita ctx para graceful shutdown.
func (h *Hub) Run(ctx context.Context) {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			// Lazy creation: adiciona cliente à room dele
			if h.rooms[client.roomID] == nil {
				h.rooms[client.roomID] = make(map[*Client]bool)
			}
			h.rooms[client.roomID][client] = true
			// ADR-105.3: adicionar ao índice de usuários
			if h.usersIndex[client.userID] == nil {
				h.usersIndex[client.userID] = make(map[*Client]bool)
			}
			h.usersIndex[client.userID][client] = true
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				// Remove da room
				if room, ok := h.rooms[client.roomID]; ok {
					delete(room, client)
					// GC: remove room vazia se não for general
					if len(room) == 0 && client.roomID != GeneralChatID {
						delete(h.rooms, client.roomID)
					}
				}
				// ADR-105.3: remover do índice de usuários
				if userClients, ok := h.usersIndex[client.userID]; ok {
					delete(userClients, client)
					// GC: remove submapa se vazio
					if len(userClients) == 0 {
						delete(h.usersIndex, client.userID)
					}
				}
			}
			h.mu.Unlock()

		case msg := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- msg:
				default:
					// canal cheio — desconecta sem bloquear o broadcast
					go func(c *Client) {
						h.unregister <- c
					}(client)
				}
			}
			h.mu.RUnlock()

		case <-ctx.Done():
			return
		}
	}
}

// Broadcast envia uma mensagem para todos os clients conectados.
func (h *Hub) Broadcast(msg []byte) {
	h.broadcast <- msg
}

// BroadcastToRoom envia uma mensagem para todos os clients em uma room específica.
// Implementa o mesmo padrão non-blocking + unregister assíncrono do Broadcast global.
func (h *Hub) BroadcastToRoom(roomID string, msg []byte) {
	h.mu.RLock()
	roomClients := h.rooms[roomID]
	h.mu.RUnlock()

	for client := range roomClients {
		select {
		case client.send <- msg:
		default:
			// canal cheio — desconecta sem bloquear o broadcast
			go func(c *Client) {
				h.unregister <- c
			}(client)
		}
	}
}

// NotifyUsers envia msg para todas as conexões ativas dos userIDs informados,
// independente da room. Non-blocking, com unregister assíncrono em caso de falha.
// ADR-105.3: suporta notificação direcionada cross-room (e.g., friend_online, stats_changed).
// NOTA: select com default é non-blocking, portanto seguro manter o RLock durante send.
func (h *Hub) NotifyUsers(userIDs []int, msg []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, uid := range userIDs {
		for client := range h.usersIndex[uid] {
			select {
			case client.send <- msg:
			default:
				// canal cheio — desconecta sem bloquear
				go func(c *Client) {
					h.unregister <- c
				}(client)
			}
		}
	}
}

// Shutdown notifica todos os clients com evento de sistema e aguarda drenagem.
func (h *Hub) Shutdown() {
	payload, _ := json.Marshal(map[string]string{
		"type":    "system",
		"content": "shutdown",
	})

	h.mu.RLock()
	for client := range h.clients {
		select {
		case client.send <- payload:
		default:
		}
	}
	h.mu.RUnlock()
}

// ClientCount retorna o número de clients conectados.
// Usado pelo endpoint /metrics (T016).
func (h *Hub) ClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

// EmitStatsChanged agenda a emissão de um evento user_stats_changed para o
// usuário, com debounce de 2s: chamadas repetidas dentro da janela reiniciam o timer.
func (h *Hub) EmitStatsChanged(userID int) {
	h.statsMu.Lock()
	defer h.statsMu.Unlock()
	if t, ok := h.statsDebounce[userID]; ok {
		t.Stop()
	}
	h.statsDebounce[userID] = time.AfterFunc(2*time.Second, func() {
		msg, _ := json.Marshal(map[string]any{
			"type":    "user_stats_changed",
			"user_id": userID,
		})
		h.Broadcast(msg)
	})
}

// Register registra um client no Hub.
func (h *Hub) Register(c *Client) {
	h.register <- c
}

// Unregister remove um client do Hub.
func (h *Hub) Unregister(c *Client) {
	h.unregister <- c
}
