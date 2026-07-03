# 42 Chat + Forum

Chat em tempo real + fórum tech para os ~300 alunos da 42 São Paulo. Substitui Slack/Discord com integração nativa à API da Intra. Monolito Go + React + PostgreSQL em host único.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Go 1.25, Chi router, gorilla/websocket, lib/pq |
| Frontend | React 18, Vite, Tailwind CSS, Shadcn/ui, Zustand, @mdx-js/react |
| Banco | PostgreSQL 16 (Docker) |
| Auth | OAuth2 42 Intra → JWT interno (12h) |
| Infra | Docker Compose, Nginx reverse proxy, servidor local (on-premise 42SP se aceito) |

## Dev

```bash
# Backend
go run ./cmd/server/main.go

# Frontend
cd frontend && npm run dev

# Tudo junto (Docker)
docker compose up

# Build checks obrigatórios antes de qualquer PR
go build ./...
go vet ./...
cd frontend && npm run build
```

Variáveis de ambiente: `.env` na raiz. `DEV_MODE=true` habilita `/api/auth/dev/login?login=marvin` (sem OAuth2 real).

## Estrutura

```
cmd/server/main.go               # Entrypoint Go (Chi router, migrations, seed)
internal/
  auth/handler.go                # OAuth2 callback + JWT geração; enriquece com /v2/users/:id/titles e /v2/users/:id/tags_users
  db/
    migrations/
      001_init.sql               # Tabelas: users, messages
      002_add_forum.sql          # Tabelas: boards, board_staff, threads, posts + ALTER users (title, skills)
    queries/users.go             # Upsert user + update title/skills
  ws/hub.go                      # WebSocket hub — broadcast sala "general"
  chat/handler.go                # Handlers de chat
  forum/
    model/                       # Structs Go: Board, Thread, Post, BoardStaff
    store/
      boards.go                  # CRUD boards + blacklist slugs reservados
      board_staff.go             # Add/Remove/GetRole staff
      threads.go                 # CRUD threads, bump order (last_post_at), GIN tags
      posts.go                   # CRUD posts, reply_to tree, soft delete
    handler/
      boards.go                  # POST/GET/PATCH/DELETE /api/forum/boards
      threads.go                 # POST/GET/PATCH/DELETE /api/forum/threads
      posts.go                   # POST/DELETE /api/forum/posts
    middleware/auth.go           # AuthRequired, ModOnly, AdminOnly, BoardOwner
    routes/routes.go             # Chi subrouter /api/forum
frontend/src/
  pages/forum/
    ForumList.tsx                # /forum — grid de boards
    BoardView.tsx                # /forum/{slug} — threads bump order
    ThreadView.tsx               # /forum/{slug}/thread/{id} — OP + respostas
    NewThread.tsx                # Criar thread (MDXEditor + TagInput)
  components/forum/
    BoardCard.tsx
    ThreadRow.tsx
    PostCard.tsx                 # Exibe avatar, login, title badge, conteúdo MDX
    ModControls.tsx              # Pin/Lock/Delete condicional por role
    MDXRenderer.tsx              # react-markdown + remark-gfm + rehype-highlight
    MDXEditor.tsx                # Textarea + preview + toolbar 7 botões
    TagInput.tsx                 # Autocomplete com skills do usuário
  stores/
    chatStore.ts
    forumStore.ts                # Boards, threads, posts, fetch*, create*, clearError
  lib/forumApi.ts                # API calls — IDs sempre como string UUID
  hooks/forum/
tests/
  forum_smoke_test.sh            # 11 integration tests
  internal/forum/handler/
    forum_test.go
    edge_test.go                 # Slug reservado, thread locked, content ≤10k
specs/features/                  # SDD: spec.md, plan.md, tasks.md por feature
```

## Banco de Dados

Migrations em `internal/db/migrations/` — rodadas automaticamente no startup.

**Tabelas existentes (001):** `users` (id INT da 42, login, image_url, current_host, level), `messages`

**Migration 002 (fórum):**
- `ALTER users ADD COLUMN title VARCHAR(100), skills TEXT[]`
- `boards` — slug UNIQUE, owner_id, sfw, theme, is_locked
- `board_staff` — PK composta (board_id, user_id), role: owner/mod/admin
- `threads` — bump order via `last_post_at`, `tags TEXT[]`, soft delete (`deleted_at`)
- `posts` — `reply_to UUID` (tree view), soft delete

PKs do fórum: UUIDv7 via `uuid.NewV7()` (stdlib Go 1.25) — time-sortable, sem enumeration attack.

**Índices críticos:**
```sql
CREATE INDEX idx_threads_board_bump ON threads(board_id, is_pinned DESC, last_post_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_threads_tags ON threads USING GIN(tags);
CREATE INDEX idx_posts_thread_time ON posts(thread_id, created_at) WHERE deleted_at IS NULL;
```

## API REST

Prefixo: `/api/forum/`

| Método | Rota | Auth |
|--------|------|------|
| GET | `/api/forum/boards` | Opcional |
| POST | `/api/forum/boards` | Admin |
| GET/PATCH/DELETE | `/api/forum/boards/{slug}` | Opcional / Owner+Admin |
| GET/POST | `/api/forum/boards/{slug}/threads` | Opcional / User |
| GET/PATCH/DELETE | `/api/forum/threads/{id}` | Opcional / Mod+Admin |
| POST | `/api/forum/threads/{id}/posts` | User |
| DELETE | `/api/forum/posts/{id}` | Mod+Admin |
| POST/DELETE | `/api/forum/boards/{slug}/staff` | Owner+Admin |

Erro padrão: `{ "error": "mensagem", "code": "SNAKE_CODE" }`

IDs em toda API: strings UUID (nunca array de bytes).

## Convenções

**Go:**
- Middleware chain: `AuthRequired` → `ModOnly` / `AdminOnly` / `BoardOwner`
- Soft delete: nunca hard delete em threads/posts — usar `deleted_at = NOW()`
- Boards: hard delete com CASCADE (confirmação obrigatória no handler)
- Bump: a cada novo post, `UPDATE threads SET last_post_at = NOW(), post_count = post_count + 1`
- Slugs válidos: `^[a-z0-9]([a-z0-9_-]*[a-z0-9])?$`; reservados: `admin`, `api`, `chat`, `forum`, `static`, `health`

**React:**
- IDs: sempre `string` — converter antes de fetch e push de URL (ver `forumApi.ts`)
- Avatar: `onError` → fallback `/assets/default-avatar.png`
- MDX: conteúdo armazenado como texto puro, renderizado no cliente com `MDXRenderer`
- Zustand: `forumStore` — nunca acessar API diretamente nos componentes

**Design System (42 Graphic Charter oficial):**
- Cores primárias: Black `#1B1B1B`, White `#FFFFFF`
- UI: Dark Navy `#173D7A`, Near Black `#202026`, Dark Gray `#29292E`, Teal `#00BABC`, CG Blue `#04809F`, Green `#2DD57A`, Pink `#EC3391`
- Tipografia: Futura PT (Light 300, Book 400, Heavy 700). Fallback: `ui-sans-serif`
- `border-radius: 0` em todos os componentes — flat design, cantos retos
- Paleta "Sleek": telas institucionais. Paleta "Minimalist": threads/leitura

**Segurança:**
- Credenciais NUNCA no código — apenas via env vars (`.env`, Docker secrets)
- `JWT_SECRET`, `DATABASE_URL`, `FORTYTWO_CLIENT_SECRET` obrigatórios em produção
- `FORUM_ADMIN_ID` define o admin inicial via env var

## Features

| ID | Feature | Status |
|----|---------|--------|
| 100 | Chat core (Go + WS + PostgreSQL + OAuth2) | ✅ Implementado |
| 101 | Assinatura de participação (UserSignature + stats) | ✅ Implementado via LATTE (builds/testes PASS; falta teste de carga + integração DB ao vivo) |
| 102 | Fórum (boards → threads → posts, MDX, moderação) | ✅ Implementado via LATTE (2026-07-02: 28/28 tasks, smoke 11/11, testes store live PASS) |
| 103 | Expansão de mensageria (chats tipados, rooms, typing, emoticons) | ✅ Implementado via LATTE (2026-07-03: 21/21 tasks, smoke fórum 11/11, `-race` PASS, migration 003 validada em banco limpo) |

Specs completas em `specs/features/<id>-<nome>/`: `spec.md`, `plan.md`, `tasks.md`, `acceptance/*.feature`

## Seed Boards Iniciais (migration 002)

`/tech`, `/projects`, `/career`, `/events`, `/random`

Owner inicial: usuário com id = `FORUM_ADMIN_ID` (env var).

---

## Onboarding (primeira ação ao entrar no repo)

1. Leia `.github/memory/constitution.md` — portões de qualidade, restrições, anti-padrões
2. Leia `llms.txt` — entry point com paths de todos os specs, wiki, papers e referências
3. Leia `wiki-claude/index.md` — inventário completo do vault

## Fluxo SDD

Toda feature segue: brainstorm → spec → plan → tasks → **coordenação direta**.
Artefatos em `specs/features/<NNN>-<slug>/`. Pipeline imutável — pular etapas é proibido.

- `spec.md`: **HARD-GATE:** `Aprovado: true` antes de implementar
- `plan.md`: ADRs, contratos, auditoria de constituição
- `tasks.md`: DAG atômico. Se `graph-operators: enabled` → LATTE (7 operadores)
- Skill mestre: `/sdd`

### Coordenação Direta — Protocolo LATTE

A execução de `tasks.md` é coordenada pela sessão principal (Lead) com workers `researcher`/`analyst`/`executor` via `Agent`.
**Protocolo completo (Algorithm A4.5, 7 operadores, heartbeat, budget): skill `/sdd`, modo `coordinate`.** Carregue a skill antes de implementar qualquer feature.

## Wiki (`wiki-claude/`)

Consulta (agentes fazem isso antes de agir — wiki-first):
```bash
python3 .claude/skills/wiki/experiential_memory/cli_query.py --semantic "<query>" --hybrid --top-k 5
```

Manutenção (após grandes mudanças no vault):
```bash
python3 .claude/skills/wiki/experiential_memory/cli_index.py --full --wiki-dir wiki-claude  # reindexar
python3 .claude/skills/wiki/experiential_memory/cli_distill.py                              # destilar chunks redundantes
python3 .claude/skills/wiki/experiential_memory/normalize_frontmatter.py                    # frontmatter mínimo em docs sem YAML
```

Template de frontmatter: `wiki-claude/_meta/template.md`. Config de chunking: `wiki-claude/_meta/chunking.yaml`

## Git

### Antes de todo commit
```bash
go build ./... && go vet ./...
# Se tocou frontend: cd frontend && npm run build
# Se tocou wiki-claude/: reindexar (ver seção Wiki)
```

### Nunca commitar
- `.env`, credenciais, tokens, secrets
- `~/.claude/wiki_index.db` (cache local, reconstruível)
- `*.bak` de chunking (adicione ao `.gitignore`)

### Sempre commitar
- `specs/features/*/` (spec, plan, tasks)
- `wiki-claude/` (vault completo — é código, não documentação)
- `.claude/skills/` (skills versionadas)
- `.claude/agents/` (agentes versionados)
- `.github/memory/` (constitution, tech)
- `CLAUDE.md`, `llms.txt`

### Convenção de commits
- `feat:` nova feature ou capacidade
- `fix:` correção de bug
- `chore:` manutenção (wiki, skills, config)
- `docs:` documentação pura (spec, plan, ADRs)

## Skills SDD

| Comando | Função |
|---|---|
| `/sdd` | Pipeline completo — dispatcher 9 modos (inclui `coordinate` = execução LATTE) |
| `/sdd-brainstorm` | Entrevista interativa + cross-ref wiki/código → `reports/<id>-discovery.md` (ADR+PRD, quality score ≥ 20/25) |
| `/sdd-generate-spec` | `reports/<id>-discovery.md` → `specs/features/<id>/spec.md` (condensado, pipeline-compatible) |
| `/sdd-explore-tech` | Detecta stack → tech.md |
| `/sdd-init-repo` | Inicializa estrutura SDD |
| `/sdd-generate-plan` | spec.md → plan.md (4 seções + ADRs) |
| `/sdd-generate-tasks` | spec+plan → tasks.md (DAG + LATTE + Wiki-Keywords) |
| `/sdd-validate` | Auditoria PASS/FAIL/WARN |
| `/sdd-refactor-artifact` | Normaliza artefato para template canônico |
