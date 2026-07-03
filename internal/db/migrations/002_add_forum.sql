-- Migration 002: fórum (boards, threads, posts, staff)
-- Adiciona suporte para fórum temático com tópicos, respostas e moderação
-- NÃO ALTERAR este arquivo — criar nova migration para mudanças futuras

-- Enriquece tabela users com metadados de fórum
ALTER TABLE users ADD COLUMN IF NOT EXISTS title VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills TEXT[];

-- Tabela: categories do fórum (ex: /tech, /projects, /career)
CREATE TABLE IF NOT EXISTS boards (
    id           UUID PRIMARY KEY,
    slug         VARCHAR(100) UNIQUE NOT NULL,
    name         VARCHAR(200) NOT NULL,
    description  TEXT,
    owner_id     INT REFERENCES users(id) ON DELETE SET NULL,
    sfw          BOOLEAN NOT NULL DEFAULT true,
    theme        VARCHAR(50),
    is_locked    BOOLEAN NOT NULL DEFAULT false,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela: staff de moderação por board (owner, mod, admin)
CREATE TABLE IF NOT EXISTS board_staff (
    board_id     UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role         VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'mod', 'admin')),
    PRIMARY KEY (board_id, user_id)
);

-- Tabela: tópicos (threads) dentro de um board
CREATE TABLE IF NOT EXISTS threads (
    id           UUID PRIMARY KEY,
    board_id     UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    author_id    INT REFERENCES users(id) ON DELETE SET NULL,
    title        VARCHAR(200) NOT NULL,
    content      TEXT NOT NULL,
    tags         TEXT[] DEFAULT '{}',
    is_pinned    BOOLEAN NOT NULL DEFAULT false,
    is_locked    BOOLEAN NOT NULL DEFAULT false,
    post_count   INT NOT NULL DEFAULT 0,
    last_post_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at   TIMESTAMPTZ
);

-- Tabela: posts (respostas) dentro de um thread
CREATE TABLE IF NOT EXISTS posts (
    id           UUID PRIMARY KEY,
    thread_id    UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    author_id    INT REFERENCES users(id) ON DELETE SET NULL,
    reply_to     UUID REFERENCES posts(id) ON DELETE SET NULL,
    content      TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at   TIMESTAMPTZ
);

-- Índices para performance
-- Bump order: threads mais recentes primeiro, pinned no topo
CREATE INDEX IF NOT EXISTS idx_threads_board_bump
    ON threads(board_id, is_pinned DESC, last_post_at DESC)
    WHERE deleted_at IS NULL;

-- Full-text search em tags (GIN = Generalized Inverted Index para arrays)
CREATE INDEX IF NOT EXISTS idx_threads_tags
    ON threads USING GIN(tags);

-- Timeline de posts num thread
CREATE INDEX IF NOT EXISTS idx_posts_thread_time
    ON posts(thread_id, created_at)
    WHERE deleted_at IS NULL;

-- Seed: 5 boards iniciais
INSERT INTO boards (id, slug, name, description, owner_id, sfw, theme, is_locked, created_at)
VALUES
    (gen_random_uuid(), 'tech', 'Tecnologia & Inovação', 'Discussões sobre stack, arquitetura, DevOps, AI', NULL, true, 'sleek', false, NOW()),
    (gen_random_uuid(), 'projects', 'Projetos 42', 'Compartilhamento de projetos, reviews, dúvidas técnicas', NULL, true, 'sleek', false, NOW()),
    (gen_random_uuid(), 'career', 'Carreira & Oportunidades', 'Vagas, mentorias, histórias de sucesso', NULL, true, 'sleek', false, NOW()),
    (gen_random_uuid(), 'events', 'Eventos & Encontros', 'Hackathons, palestras, meetups, social', NULL, true, 'sleek', false, NOW()),
    (gen_random_uuid(), 'random', 'Aleatório & Off-topic', 'Memes, discussões livres, anúncios comunitários', NULL, true, 'minimalist', false, NOW())
ON CONFLICT (slug) DO NOTHING;
