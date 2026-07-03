-- Migration 003: chat resources (chats, chat_members, chat_id backfill)
-- Adiciona suporte para typed chat rooms (general, group, oneOnOne) com soft-delete
-- NÃO ALTERAR este arquivo — criar nova migration para mudanças futuras

-- Tabela: salas de chat tipadas (general, group, oneOnOne)
CREATE TABLE IF NOT EXISTS chats (
    id         UUID PRIMARY KEY,
    type       VARCHAR(20) NOT NULL CHECK (type IN ('oneOnOne', 'group', 'general')),
    topic      TEXT,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela: membros de um chat com roles (owner, mod, member)
CREATE TABLE IF NOT EXISTS chat_members (
    chat_id   UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role      VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'mod', 'member')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (chat_id, user_id)
);

-- Seed: sala "general" (ID fixo para sincronização com internal/ws/hub.go GeneralChatID)
-- SYNC: internal/ws/hub.go GeneralChatID = 00000000-0000-7000-8000-000000000001
INSERT INTO chats (id, type, topic, created_by, created_at)
VALUES ('00000000-0000-7000-8000-000000000001'::UUID, 'general', 'general', NULL, NOW())
ON CONFLICT (id) DO NOTHING;

-- Backfill messages.chat_id
ALTER TABLE messages ADD COLUMN IF NOT EXISTS chat_id UUID;

-- Atualiza mensagens sem chat_id para o chat "general"
UPDATE messages SET chat_id = '00000000-0000-7000-8000-000000000001'::UUID WHERE chat_id IS NULL;

-- Torna chat_id obrigatório
ALTER TABLE messages ALTER COLUMN chat_id SET NOT NULL;

-- FK: evita duplicate constraint error via DO block (idempotente)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_messages_chat'
    ) THEN
        ALTER TABLE messages ADD CONSTRAINT fk_messages_chat
            FOREIGN KEY (chat_id) REFERENCES chats(id);
    END IF;
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_messages_chat_time
    ON messages(chat_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_chat_members_user
    ON chat_members(user_id);
