package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"42chat/internal/auth"
	"42chat/internal/chat"
	"42chat/internal/db"
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
	r.Get("/ws", chatHandler.ServeWS)
	r.Get("/metrics", chatHandler.Metrics)

	// TODO: forum routes

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
