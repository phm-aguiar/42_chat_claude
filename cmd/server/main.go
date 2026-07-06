package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"42chat/internal/auth"
	"42chat/internal/chat"
	chathandler "42chat/internal/chat/handler"
	"42chat/internal/chat/routes"
	chatstore "42chat/internal/chat/store"
	"42chat/internal/db"
	forumroutes "42chat/internal/forum/routes"
	"42chat/internal/forum/store"
	"42chat/internal/ws"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	// Connect to database
	database, err := db.Connect()
	if err != nil {
		log.Fatalf("db: %v", err)
	}
	defer database.Close()

	// Auth routes
	authHandler := &auth.Handler{DB: database}
	r.Get("/api/auth/42/callback", authHandler.Callback)
	r.Get("/api/auth/dev/login", authHandler.DevLogin)

	// Graceful shutdown with signal context (ADR-006)
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// WebSocket Hub
	hub := ws.NewHub()
	go hub.Run(ctx)

	// Chat handler
	chatHandler := &chat.Handler{DB: database, Hub: hub}
	r.With(auth.JWTMiddleware()).Get("/api/messages", chatHandler.GetMessages)
	r.With(auth.JWTMiddleware()).Get("/api/users/{id}", chatHandler.GetUser)
	r.With(auth.JWTMiddleware()).Get("/api/users/{id}/stats", chatHandler.HandleUserStats)
	r.Get("/ws", chatHandler.ServeWS)
	r.Get("/metrics", chatHandler.Metrics)

	// Chat stores (typic ed chats, members, messages, reads)
	chats := &chatstore.ChatStore{DB: database}
	members := &chatstore.MemberStore{DB: database}
	messages := &chatstore.MessageStore{DB: database}
	reads := &chatstore.ReadStore{DB: database}

	// Chat subrouter /api/chats
	r.Mount("/api/chats", routes.Routes(chats, members, messages, reads, hub))

	// Chat message deletion (DELETE /api/messages/{id}) — registered at root for consistency with GET /api/messages
	chatMsgHandler := &chathandler.MessageHandler{Messages: messages, Members: members}
	r.With(auth.JWTMiddleware()).Delete("/api/messages/{id}", chatMsgHandler.DeleteMessage)

	// Forum routes
	forumroutes.RegisterForumRoutes(r, database)

	// Seed initial boards if FORUM_ADMIN_ID is set
	forumAdminIDStr := os.Getenv("FORUM_ADMIN_ID")
	if forumAdminIDStr != "" {
		if adminID, err := strconv.Atoi(forumAdminIDStr); err == nil && adminID > 0 {
			boardStore := &store.BoardStore{DB: database}
			if err := boardStore.SeedBoards(adminID); err != nil {
				log.Printf("warning: failed to seed boards: %v", err)
			} else {
				log.Printf("forum: seeded initial boards with admin_id=%d", adminID)
			}
		}
	}

	addr := ":" + port
	log.Printf("Starting server on %s", addr)

	// Cron LGPD: hard delete de mensagens > 6 meses (Art. 15 LGPD)
	// Único hard DELETE permitido no projeto
	lgpdTicker := time.NewTicker(24 * time.Hour)
	defer lgpdTicker.Stop()
	go func() {
		for {
			select {
			case <-lgpdTicker.C:
				_, err := database.Exec(
					`DELETE FROM messages WHERE created_at < NOW() - INTERVAL '6 months'`,
				)
				if err != nil {
					log.Printf("lgpd cron error: %v", err)
				} else {
					log.Println("lgpd cron: cleanup executed")
				}
			case <-ctx.Done():
				return
			}
		}
	}()

	// HTTP server
	srv := &http.Server{
		Addr:    addr,
		Handler: r,
	}

	// Start server in background
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Fprintf(os.Stderr, "Error starting server: %v\n", err)
		}
	}()

	// Block until shutdown signal
	<-ctx.Done()

	// Graceful shutdown sequence (ADR-006)
	log.Println("shutdown: broadcast enviado")
	hub.Shutdown()
	time.Sleep(500 * time.Millisecond)

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown error: %v", err)
	}
	database.Close()
	log.Println("shutdown: completo")
}
