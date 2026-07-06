package ws

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"time"

	"42chat/internal/db/queries"

	"github.com/gorilla/websocket"
	"golang.org/x/time/rate"
)

const (
	maxMessageSize = 6144
	pongWait       = 60 * time.Second
	writeWait      = 10 * time.Second
	pingPeriod     = 30 * time.Second // < pongWait
)

// Client representa uma conexão WebSocket ativa.
type Client struct {
	hub        *Hub
	conn       *websocket.Conn
	send       chan []byte // buffer 256
	limiter    *rate.Limiter
	violations int
	userID     int
	login      string
	roomID     string // ID da room (chat) que este cliente está conectado
	db         *sql.DB
}

// NewClient cria um client com rate limiter: 10 msgs/s, burst 10 (ADR-008).
func NewClient(hub *Hub, conn *websocket.Conn, userID int, login string, db *sql.DB, roomID string) *Client {
	return &Client{
		hub:     hub,
		conn:    conn,
		send:    make(chan []byte, 256),
		limiter: rate.NewLimiter(10, 10),
		userID:  userID,
		login:   login,
		roomID:  roomID,
		db:      db,
	}
}

// readPump lê mensagens do WebSocket e envia para broadcast.
// Desconecta o cliente após 3 violações de rate limit.
func (c *Client) readPump(ctx context.Context) {
	defer func() {
		c.hub.Unregister(c)
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

		_, raw, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("ws read error: %v", err)
			}
			return
		}

		if !c.limiter.Allow() {
			c.violations++
			if c.violations >= 3 {
				log.Printf("ws rate limit: desconectando cliente após %d violações", c.violations)
				return
			}
			continue
		}

		// Parseia e persiste — apenas mensagens de chat chegam aqui
		var incoming struct {
			Type    string `json:"type"`
			Content string `json:"content"`
		}
		if err := json.Unmarshal(raw, &incoming); err != nil || incoming.Type != "message" || incoming.Content == "" {
			continue
		}

		msg, err := queries.SaveMessage(c.db, c.userID, c.roomID, incoming.Content)
		if err != nil {
			log.Printf("ws save message: %v", err)
			continue
		}

		c.hub.EmitStatsChanged(c.userID)

		// Enriquece payload com chat_id da conexão (fixa, imutável)
		msgMap := make(map[string]any)
		msgBytes, _ := json.Marshal(msg)
		json.Unmarshal(msgBytes, &msgMap)
		msgMap["chat_id"] = c.roomID

		enriched, _ := json.Marshal(msgMap)
		c.hub.BroadcastToRoom(c.roomID, enriched)

		// Emitir chat_activity para membros (se não for general)
		if c.roomID != GeneralChatID {
			memberIDs, err := queries.GetChatMemberIDs(c.db, c.roomID)
			if err == nil && len(memberIDs) > 0 {
				// Filtrar para excluir o remetente
				var targetIDs []int
				for _, id := range memberIDs {
					if id != c.userID {
						targetIDs = append(targetIDs, id)
					}
				}
				// Emitir notificação se houver membros para notificar
				if len(targetIDs) > 0 {
					payload, _ := json.Marshal(map[string]string{
						"type":    "chat_activity",
						"chat_id": c.roomID,
					})
					c.hub.NotifyUsers(targetIDs, payload)
				}
			}
		}
	}
}

// writePump envia mensagens do canal send para o WebSocket.
// Mantém a conexão viva com pings periódicos.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case msg, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// WritePump inicia a goroutine writePump (exported para uso em handlers).
func (c *Client) WritePump() {
	c.writePump()
}

// ReadPump inicia a goroutine readPump (exported para uso em handlers).
func (c *Client) ReadPump(ctx context.Context) {
	c.readPump(ctx)
}
