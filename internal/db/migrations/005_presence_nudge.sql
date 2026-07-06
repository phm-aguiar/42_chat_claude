-- Migration 005: presença e cutucar (status + nudge kind)
-- Adiciona suporte para presença de usuário e mensagens de cutucar (nudges)
-- NÃO ALTERAR este arquivo — criar nova migration para mudanças futuras

-- Enriquece tabela users com status de presença
-- Status escolhido pelo usuário; vira 'offline' se sem conexão no hub ou se escolhido = invisible/offline
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(16) NOT NULL DEFAULT 'online';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_status_check'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_status_check
            CHECK (status IN ('online', 'away', 'busy', 'invisible', 'offline'));
    END IF;
END $$;

-- Enriquece tabela messages com tipo de mensagem (text ou nudge)
-- kind='nudge' é usado para cutucar (👋) numa 1:1; texto é sempre 'text'
ALTER TABLE messages ADD COLUMN IF NOT EXISTS kind VARCHAR(16) NOT NULL DEFAULT 'text';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'messages_kind_check'
    ) THEN
        ALTER TABLE messages ADD CONSTRAINT messages_kind_check
            CHECK (kind IN ('text', 'nudge'));
    END IF;
END $$;
