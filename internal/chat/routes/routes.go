package routes

import (
	"42chat/internal/auth"
	"42chat/internal/chat/handler"
	"42chat/internal/chat/middleware"
	"42chat/internal/chat/store"
	"42chat/internal/ws"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
)

// Routes monta todas as rotas de chat em um subrouter.
// Instancia stores, handlers e middleware, e define a tabela de rotas.
// Retorna um chi.Router pronto para ser montado em /api/chats.
func Routes(chats *store.ChatStore, members *store.MemberStore, messages *store.MessageStore, reads *store.ReadStore, hub *ws.Hub) chi.Router {
	r := chi.NewRouter()

	// Middleware local do subrouter (logging)
	r.Use(chimw.Logger)

	// Instancia handlers
	chatHandler := &handler.ChatHandler{Chats: chats, Members: members, Reads: reads}
	messageHandler := &handler.MessageHandler{Messages: messages, Members: members, Chats: chats, Hub: hub}
	memberHandler := &handler.MemberHandler{Members: members, Chats: chats}
	readHandler := &handler.ReadHandler{Reads: reads}

	// Instancia middleware
	chatMw := middleware.New(members)

	// === Chat Routes ===

	// POST /api/chats — criar chat (JWT + AuthRequired)
	r.With(auth.JWTMiddleware()).
		Post("/", chatHandler.Create)

	// GET /api/chats — listar chats (JWT + AuthRequired)
	r.With(auth.JWTMiddleware()).
		Get("/", chatHandler.List)

	// GET /api/chats/{id} — get chat (JWT + ChatMember)
	r.With(auth.JWTMiddleware(), chatMw.ChatMember).
		Get("/{id}", chatHandler.Get)

	// === Message Routes ===

	// GET /api/chats/{id}/messages — listar mensagens (JWT + ChatMember)
	r.With(auth.JWTMiddleware(), chatMw.ChatMember).
		Get("/{id}/messages", messageHandler.ListByChatID)

	// POST /api/chats/{id}/messages — enviar mensagem (JWT + ChatMember)
	r.With(auth.JWTMiddleware(), chatMw.ChatMember).
		Post("/{id}/messages", messageHandler.SendMessage)

	// POST /api/chats/{id}/read — marcar chat como lido (JWT + ChatMember)
	r.With(auth.JWTMiddleware(), chatMw.ChatMember).
		Post("/{id}/read", readHandler.MarkRead)

	// NOTE: DELETE /api/messages/{id} é registrado no main.go (não no subrouter)
	// para manter consistência com GET /api/messages que está no root

	// === Member Routes ===

	// POST /api/chats/{id}/members — adicionar membro (JWT + ChatModOnly)
	r.With(auth.JWTMiddleware(), chatMw.ChatModOnly).
		Post("/{id}/members", memberHandler.Add)

	// DELETE /api/chats/{id}/members/{user_id} — remover membro (JWT + ChatModOnly)
	r.With(auth.JWTMiddleware(), chatMw.ChatModOnly).
		Delete("/{id}/members/{user_id}", memberHandler.Remove)

	return r
}

// === Response Helpers (reuso de chats.go se existir, fallback local) ===

// writeJSON escreve uma resposta JSON com status code.
// NOTA: Este arquivo não usa helpers pois as rotas são apenas mounting.
// Se necessário, importar helpers existentes em handler/chats.go.

// writeError escreve uma resposta de erro em formato padrão JSON.
// NOTA: Este arquivo não usa helpers pois as rotas são apenas mounting.
// Se necessário, importar helpers existentes em handler/chats.go.
