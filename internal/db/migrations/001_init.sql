-- Migration 001: tabelas base do 42 Chat Core
-- NÃO ALTERAR este arquivo — criar nova migration para mudanças futuras

CREATE TABLE IF NOT EXISTS users (
    id           INT PRIMARY KEY,
    login        VARCHAR(50) UNIQUE NOT NULL,
    image_url    TEXT,
    current_host VARCHAR(20),
    level        NUMERIC(4,2) DEFAULT 0,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    INT NOT NULL REFERENCES users(id),
    content    TEXT NOT NULL CHECK (char_length(content) <= 5000),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_created
    ON messages(created_at DESC)
    WHERE deleted_at IS NULL;
