# Plan: Feature 102 — 42 Forum

## Metadados

- **Feature:** 102-42-forum
- **Spec:** `specs/features/102-42-forum/spec.md`
- **Discovery:** `reports/102-42-forum-discovery.md`
- **Data:** 2026-06-21
- **Status:** ready-for-tasks (não implementado)

---

## 1. Stack e Dependências

Sem novas libs no backend. Uma dependência nova no frontend:

| Componente | Tecnologia | Notas |
|-----------|-----------|-------|
| Backend | Go 1.25, Chi, lib/pq | Zero dependência nova |
| Banco | PostgreSQL 16 | Migration 002 acrescenta 5 tabelas |
| UUID | `google/uuid` (v7) | `uuid.NewV7()` para boards, threads, posts |
| Frontend | React 18, Zustand, Tailwind | Herança Feature 100 |
| MDX | `@mdx-js/react`, `remark-gfm`, `rehype-highlight` | Única dependência nova frontend |
| Testes | `go test`, shell (curl) | BDD para acceptance tests |

---

## 2. ADRs Formalizadas

### ADR-102.1 — Módulo monolítico (zero infra nova)

**Status:** accepted

**Contexto:** Fórum poderia ser serviço separado (Discourse, NodeBB, jschan com MongoDB+Redis).

**Opções:**
- A: Módulo Go dentro do mesmo processo — migration 002 no mesmo PostgreSQL *(escolhida)*
- B: jschan como serviço separado — MongoDB + Redis + Node.js
- C: Discourse — Ruby, outro banco, outro servidor

**Decisão:** Opção A. O fórum é um Chi subrouter (`/api/forum`) montado no main.go existente.
Mesmo pool PostgreSQL, mesmo middleware JWT, mesmo Docker Compose. Zero infra nova.

**Consequências:**
- (+) Deploy idêntico ao chat — `go build ./...` + `npm run build` suficientes
- (+) Auth JWT reutilizada sem mudanças nos middlewares existentes
- (-) Falha no servidor Go afeta chat e fórum simultaneamente — aceitável no monolito

---

### ADR-102.2 — UUIDv7 para PKs do fórum

**Status:** accepted

**Contexto:** Tabelas do chat (Feature 100) usam `gen_random_uuid()` (UUIDv4). Fórum é módulo novo.

**Opções:**
- A: UUIDv7 via `uuid.NewV7()` (stdlib Go 1.25) *(escolhida)*
- B: SERIAL/BIGSERIAL — incrementa, enumeration attack
- C: UUIDv4 — não time-sortable, índices B-tree fragmentados

**Decisão:** UUIDv7. Time-sortable (ordenação natural por criação), sem enumeration attack,
geração client-side sem round-trip ao banco. Nativo na stdlib Go 1.25.

**Consequências:**
- (+) IDs são opaque — sem vazamento de contagem total de registros
- (+) Sort natural via UUID prefix sem índice extra de created_at
- (-) 16 bytes vs 8 bytes (BIGINT) — aceitável em escala de 300 alunos

---

### ADR-102.3 — MDX no frontend (texto puro no banco)

**Status:** accepted

**Contexto:** Posts técnicos precisam de code blocks, imagens, links formatados. Imageboards usam markup próprio.

**Opções:**
- A: MDX armazenado como texto puro, renderizado no cliente com `@mdx-js/react` *(escolhida)*
- B: HTML sanitizado no backend — risco XSS, coluna `body_html` extra no schema
- C: Markdown puro — sem embed de componentes React interativos

**Decisão:** Texto puro no banco, `@mdx-js/react` + `remark-gfm` + `rehype-highlight` no frontend.
`MDXRenderer` captura erros e exibe texto raw como fallback.

**Consequências:**
- (+) Zero risco XSS no backend — conteúdo nunca interpretado como HTML pelo servidor
- (+) Componentes React customizados (syntax highlight nativo, embeds futuros)
- (-) `@mdx-js/react` + plugins adiciona ~50KB ao bundle — aceitável

---

### ADR-102.4 — Soft delete em threads/posts; hard delete em boards

**Status:** accepted

**Contexto:** Moderação precisa apagar conteúdo preservando audit trail.

**Opções:**
- A: `deleted_at = NOW()` em threads e posts; hard delete com CASCADE em boards *(escolhida)*
- B: Hard delete puro em tudo — sem audit trail
- C: Tabela de archive separada — complexidade extra sem ganho no escopo v1

**Decisão:** Opção A. Mesmo padrão da Feature 100 (mensagens). `WHERE deleted_at IS NULL`
nos índices evita penalty de performance. Board hard delete com CASCADE e confirmação explícita.

**Consequências:**
- (+) Conteúdo de threads restaurável por até 12 meses (cron expurgo futuro)
- (+) `reply_to` de post deletado continua funcional — referência existe no banco
- (-) Queries precisam de cláusula `WHERE deleted_at IS NULL` — coberto pelos índices compostos

---

### ADR-102.5 — Bump order via `last_post_at`

**Status:** accepted

**Contexto:** Imageboards usam bump order por atividade recente. Fórum deve manter o padrão.

**Decisão:** A cada novo post: `UPDATE threads SET last_post_at = NOW(), post_count = post_count + 1`.
Índice composto: `(board_id, is_pinned DESC, last_post_at DESC) WHERE deleted_at IS NULL`.
Pinned threads sempre no topo via cláusula `ORDER BY is_pinned DESC, last_post_at DESC`.

**Consequências:**
- (+) Threads ativas são naturalmente visíveis — não morrem na primeira página
- (+) Um único índice cobre bump order + pinned + soft delete
- (-) UPDATE extra por post — negligível em escala de 300 alunos

---

### ADR-102.6 — Design System oficial 42 (Graphic Charter Agosto 2024)

**Status:** accepted

**Contexto:** Feature 100 usou tema brutalista custom. Fórum deve ter visual institucional.

**Decisão:** Graphic Charter oficial como lei. Cores: `#1B1B1B` (Black), `#FFFFFF` (White),
`#173D7A` (Dark Navy), `#202026` (Near Black), `#29292E` (Dark Gray), `#00BABC` (Teal),
`#04809F` (CG Blue), `#2DD57A` (Green), `#EC3391` (Pink). Tipografia: Futura PT.
`border-radius: 0` em todos os componentes. Tailwind configurado com `theme.extend.colors`.

**Consequências:**
- (+) Visual consistente com identidade da 42
- (-) Futura PT requer licença Adobe Fonts (DT-F03) — fallback `ui-sans-serif` documentado

---

### ADR-102.7 — Identidade real obrigatória

**Status:** accepted

**Contexto:** Imageboards permitem anonimato. Fórum 42 é acadêmico e requer rastreabilidade.

**Decisão:** `author_id NOT NULL` em todas as tabelas do fórum. FK → `users(id)`. Sem tripcodes,
sem postagem como convidado. Exibição: login 42 + avatar + badge de título.

**Consequências:**
- (+) Moderação direta — cada post tem autor rastreável
- (+) Consistência com Feature 101 (assinatura de participação)
- (-) Sem privacidade em posts técnicos — aceitável no contexto acadêmico fechado

---

### ADR-102.8 — API 42: títulos e skills buscados no login OAuth2

**Status:** accepted

**Contexto:** API 42 expõe títulos e skills. Busca sob demanda sujeita a rate limit.

**Decisão:** No OAuth2 callback (`/api/auth/42/callback`), backend faz GET síncrono em
`/v2/users/:id/titles` e `/v2/users/:id/tags_users`. Salva em `users.title` e `users.skills`.
Não busca novamente até próximo login.

**Consequências:**
- (+) Badge de título nos posts sem API call extra por request
- (+) Autocomplete de tags com skills reais sem latência adicional
- (-) Dado pode ficar stale entre logins — refrescado no próximo OAuth2 login

---

### ADR-102.9 — Seed boards + blacklist de slugs reservados

**Status:** accepted

**Contexto:** Fórum precisa de boards iniciais. Slugs colidem com rotas da aplicação.

**Decisão:** Migration 002 semeia 5 boards (`/tech`, `/projects`, `/career`, `/events`, `/random`).
Slugs `admin`, `api`, `chat`, `forum`, `static`, `health` bloqueados via regex + blacklist no handler.
Owner inicial: `FORUM_ADMIN_ID` (env var obrigatória).

**Consequências:**
- (+) Fórum funcional imediatamente após migration sem configuração manual
- (+) Sem colisão com rotas da API Go
- (-) Adicionar slug reservado para nova feature requer deploy — aceitável

---

## 3. Contratos de API

### POST /api/forum/boards/{slug}/threads

**Request:**
```json
{
  "title": "string (3–200 chars)",
  "content": "string (≤10000 chars, MDX)",
  "tags": ["go", "websocket"]
}
```

**Response 201:**
```json
{
  "id": "uuid-v7",
  "board_id": "uuid-v7",
  "author_id": 42,
  "title": "Como compilar Kernel BSD?",
  "content": "# Kernel BSD\n\nGuia...",
  "is_pinned": false,
  "is_locked": false,
  "post_count": 1,
  "tags": ["bsd", "kernel", "c"],
  "created_at": "2026-06-21T..."
}
```

**Erros:**
- `400` — title < 3 ou > 200 chars, content > 10000 chars
- `401` — sem JWT
- `403` — board locked
- `404` — board não encontrado

---

### POST /api/forum/threads/{id}/posts

**Request:**
```json
{
  "content": "string (≤10000 chars, MDX)",
  "reply_to": "uuid-opcional"
}
```

**Response 201:**
```json
{
  "id": "uuid-v7",
  "thread_id": "uuid-v7",
  "author_id": 42,
  "content": "Concordo!",
  "reply_to": null,
  "created_at": "2026-06-21T..."
}
```

**Erros:**
- `400` — content > 10000 chars
- `403` — thread locked (code: `THREAD_LOCKED`)
- `404` — thread não encontrada

---

### GET /api/forum/boards/{slug}/threads

**Query params:** `?page=1&limit=20` (bump order default)

**Response 200:**
```json
{
  "threads": [
    {
      "id": "uuid-v7",
      "title": "Como compilar Kernel BSD?",
      "author_login": "marvin",
      "author_title": "Go Expert",
      "author_image_url": "https://...",
      "is_pinned": false,
      "is_locked": false,
      "post_count": 3,
      "tags": ["bsd", "kernel"],
      "last_post_at": "2026-06-21T...",
      "created_at": "2026-06-21T..."
    }
  ]
}
```

---

## 4. Schema SQL — Migration 002

### Ordem de operações

```sql
-- 1. Adicionar colunas em users
ALTER TABLE users ADD COLUMN IF NOT EXISTS title VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills TEXT[];

-- 2. Criar tabelas do fórum
CREATE TABLE boards (...);
CREATE TABLE board_staff (...);
CREATE TABLE threads (...);
CREATE TABLE posts (...);

-- 3. Índices críticos
CREATE INDEX idx_threads_board_bump ON threads(board_id, is_pinned DESC, last_post_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_threads_tags ON threads USING GIN(tags);
CREATE INDEX idx_posts_thread_time ON posts(thread_id, created_at)
  WHERE deleted_at IS NULL;

-- 4. Seed boards
INSERT INTO boards (id, slug, name, ...) VALUES
  (uuid_generate_v4(), 'tech', 'Technology', ...),
  (uuid_generate_v4(), 'projects', 'Projects', ...),
  ...
```

### Middleware chain

```
AuthRequired → BoardOwner (owner)
AuthRequired → ModOnly (owner + mod + admin)
AuthRequired → AdminOnly (admin global)
(público) → sem middleware
```

---

## 5. Estrutura de Arquivos

```
internal/
  forum/
    model/                    # Board, Thread, Post, BoardStaff
    store/
      boards.go               # CRUD + blacklist slugs
      board_staff.go          # Add/Remove/GetRole
      threads.go              # CRUD + bump + GIN tags
      posts.go                # CRUD + reply-to + soft delete
    handler/
      boards.go               # POST/GET/PATCH/DELETE /api/forum/boards
      threads.go              # POST/GET/PATCH/DELETE /api/forum/threads
      posts.go                # POST/DELETE /api/forum/posts
    middleware/
      auth.go                 # AuthRequired, ModOnly, AdminOnly, BoardOwner
    routes/
      routes.go               # Chi subrouter /api/forum
  db/migrations/
    002_add_forum.sql         # Schema + seed + índices
  auth/
    handler.go                # Enriquecido: busca titles + skills no callback

frontend/src/
  pages/forum/
    ForumList.tsx             # /forum — grid de boards
    BoardView.tsx             # /forum/{slug} — threads bump order
    ThreadView.tsx            # /forum/{slug}/thread/{id} — OP + respostas
    NewThread.tsx             # Criar thread (MDXEditor + TagInput)
  components/forum/
    BoardCard.tsx
    ThreadRow.tsx
    PostCard.tsx              # Avatar, login, badge, MDX
    ModControls.tsx           # Pin/Lock/Delete condicional por role
    MDXRenderer.tsx           # react-markdown + remark-gfm + rehype-highlight
    MDXEditor.tsx             # Textarea + preview + toolbar
    TagInput.tsx              # Autocomplete com skills do usuário
  stores/
    forumStore.ts             # Boards, threads, posts, fetch*, create*
  lib/
    forumApi.ts               # API calls — IDs sempre como string UUID

tests/
  forum_smoke_test.sh         # 11 testes de integração via curl
  internal/forum/handler/
    forum_test.go
    edge_test.go              # Slug reservado, thread locked, content ≤10k
```

---

## 6. Estratégia de Testes

### Por task (TDD)

RED → GREEN → REFACTOR:
1. **RED:** escreve handler test que falha
2. **GREEN:** implementação mínima para passar
3. **REFACTOR:** extrai helpers, remove duplicação

### Camadas

| Camada | Ferramenta | O que cobre |
|--------|-----------|-------------|
| Unit (store) | `go test` | SQL queries, validações |
| Integration (handler) | `go test` + httptest | endpoints completos com banco real |
| BDD (acceptance) | godog | cenários Gherkin do forum.feature |
| Smoke | `tests/forum_smoke_test.sh` | CRUD end-to-end via curl |
| Build | `go build`, `go vet`, `npm run build` | compilação sem erro |

---

## 7. Riscos Residuais

| Risco | Mitigação |
|-------|-----------|
| MDX malformado crasha frontend | `MDXRenderer` com try/catch exibe texto raw |
| getBoardID não resolve UUID de thread | Corrigido em T022 (smoke test revelou o bug) |
| Store tests bloqueados por pg_hba | DT-F01 — infra fix separado, não bloqueia feature |
| Hard delete de board apaga todos os posts | Handler exige confirmação explícita |
