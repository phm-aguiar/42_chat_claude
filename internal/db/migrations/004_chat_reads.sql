-- Migration 004: chat reads tracking (last_read_at per user-chat)
-- Rastreia o último momento que um usuário leu uma chat, para detecção de mensagens não lidas
-- NÃO ALTERAR este arquivo — criar nova migration para mudanças futuras

-- Tabela: rastreamento de leitura de chats por usuário
CREATE TABLE IF NOT EXISTS chat_reads (
    user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chat_id      UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, chat_id)
);
