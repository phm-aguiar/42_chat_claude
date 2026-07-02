package ws

import (
	"context"
	"encoding/json"
	"sync"
	"time"
)

// Hub gerencia todas as conexões WebSocket ativas.
// ADR-001: modelo híbrido — RWMutex no mapa + send chan por client.
type Hub struct {
	clients       map[*Client]bool
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
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
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
