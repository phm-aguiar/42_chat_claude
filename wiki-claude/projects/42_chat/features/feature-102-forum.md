---
title: "Feature 102 — 42 Forum"
category: feature
tags: ["42-chat", "feature", "forum", "frontend", "go", "mdx", "uuidv7", "soft-delete", "postgresql"]
created: "2026-07-02"
updated: "2026-07-02"
summary: "Fórum tech assíncrono com board/thread/post, identidade real, conteúdo MDX, PKs UUIDv7, soft delete, moderação completa e design system oficial 42. Módulo monolítico Go + Chi + PostgreSQL. 28 tasks LATTE, 27 implementadas com coordenação direta."
aliases: ["forum 42", "feature 102", "boards threads posts", "42 forum", "forum feature", "fórum técnico"]
status: implemented
feature_id: 102
lifecycle: verified
lifecycle_changed: "2026-07-02"
base_confidence: 0.99
tier: core
---

# Feature 102 — 42 Forum

## Propósito

> Fórum tech assíncrono para alunos da 42 compartilharem descobertas, aprendizados
> e conhecimento técnico. Inspirado no modelo board/thread/post de imageboards,
> mas com **identidade real** (login 42 visível) — sem anonimato. Conteúdo em
> **MDX** (Markdown + JSX) com syntax highlighting, imagens inline e embed de
> componentes React.

Ao contrário do chat em tempo real ([[feature-100-42-chat-core|Feature 100]]),
o fórum é **assíncrono e permanente**: uma thread de hoje pode ser consultada
daqui 6 meses. É o "lugar das coisas que merecem mais que 5 minutos de atenção".

## Resumo Executivo

Feature 102 foi a primeira feature executada com **coordenação LATTE direta**
(sem orquestrador intermediário). Implementação completa: 28 tasks planejadas,
27 delegadas a workers (Haiku), 1 redigida pelo Lead. Schema com 5 tabelas
(boards, board_staff, threads, posts, users+title/skills), 18 endpoints REST,
frontend React com Zustand + MDX, moderação by-board com 3 roles (owner, mod,
admin). QA: smoke test 11/11 PASS, 16 testes de store, 15 testes de handler
(11 casos edge PASS), 22 cenários BDD Gherkin. Build: `go build ./...` + `go vet ./...`
+ `npm run build` — ✅ OK.

## Arquitetura

### Modelo de Domínio

```
Board (categoria)
  ├─ slug único (ex: /tech, /projects, /career, /events, /random)
  ├─ staff (owner, mod, admin) via board_staff
  ├─ sfw, theme, language (pt-BR default)
  └─ Threads (bump order via last_post_at, pinned no topo)
       ├─ OP (post inicial com title 3-200 chars + conteúdo MDX ≤10k)
       ├─ tags (TEXT[], GIN indexed para busca)
       ├─ post_count, last_post_at, is_pinned, is_locked, deleted_at
       └─ Posts (respostas)
            ├─ author_id NOT NULL (identidade real)
            ├─ reply-to opcional (tree view para quotes)
            ├─ conteúdo MDX (≤10k chars)
            └─ deleted_at (soft delete)
```

- **Boards:** 5 seed boards iniciais via migration. Slugs reservados bloqueados
  (admin, api, chat, forum, static, health).
- **Threads:** Autor identificado, bump order via `last_post_at DESC`, pin/lock
  por moderação. Tags com GIN index.
- **Posts:** Autor identificado, reply-to opcional, soft delete via `deleted_at`.
- **Identidade real:** `author_id NOT NULL` em todas as tabelas, FK → `users(id)`.
  Login 42 + avatar + título (badge) exibidos em cada post.

### PKs UUIDv7

Todas as chaves primárias do fórum (boards, threads, posts) usam **UUIDv7**
(time-sortable, geração client-side, sem enumeration attack). Implementação:
`github.com/google/uuid v1.6.0` (stdlib Go 1.25 não possui `uuid.NewV7()`).

### MDX no Frontend

Conteúdo armazenado como texto puro no PostgreSQL, renderizado no cliente com
`@mdx-js/react` + `remark-gfm` + `rehype-highlight`. Editor com preview tabs,
toolbar (Bold, Italic, Code, Link, Image, List, Quote) e atalhos de teclado.
Fallback em `MDXRenderer`: texto raw + aviso em caso de MDX inválido.

## Stack

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Linguagem | Go 1.25 | Reuso do backend existente |
| Roteamento | Chi v5 | Já usado no chat, middleware nativo |
| Banco | PostgreSQL 16 | Migration 002, mesmo container Docker |
| Auth | OAuth2 42 + JWT | Middleware existente, identidade real |
| Frontend | React 18 + Vite | SPA com HMR rápido |
| Estilo | Tailwind + Shadcn/ui | Cores oficiais 42, Futura PT, border-radius:0 |
| MDX | @mdx-js/react | Markdown + JSX no frontend |
| PKs | UUIDv7 (google/uuid) | Time-sortable, sem enumeration |
| Estado | Zustand | Gerenciamento de estado do fórum |
| Container | Docker Compose | Reuso, zero infra nova |

## ADRs — Decisões Arquiteturais Formalizadas

### ADR-102.1 — Módulo monolítico (zero infra nova)

**Decisão:** O fórum é um módulo Go dentro do mesmo processo, mesmo pool
PostgreSQL, mesmo middleware JWT, mesmo Docker Compose. REST-only (sem WebSocket)
— ainda mais simples que o chat.

**Rejeição:** Microsserviço separado (overengineering para ~300 alunos).

---

### ADR-102.2 — UUIDv7 para PKs (CORREÇÃO EXECUTIVA)

**Decisão Original (spec):** UUIDv7 via `uuid.NewV7()` (stdlib Go 1.25).

**Correção Executiva (prova de execução):** Stdlib Go 1.25 **não possui**
`uuid.NewV7()`. Utilizado `github.com/google/uuid v1.6.0`, função
`uuid.NewV7()` (mesmo API, vendor diferente). Time-sortable, sem enumeration
attack, geração client-side.

**Rejeição:** SERIAL/BIGSERIAL (expõe contagem), UUIDv4 (não time-sortable).

---

### ADR-102.3 — MDX no frontend (texto puro no banco)

**Decisão:** Posts armazenados como MDX source, renderizados no cliente com
`@mdx-js/react` + `remark-gfm` + `rehype-highlight`. Componentes React
customizados (syntax highlight, embeds futuros).

**Rejeição:** Markdown puro (sem interatividade), HTML sanitizado (risco XSS).

---

### ADR-102.4 — Soft delete em threads/posts; hard delete em boards

**Decisão:** `deleted_at = NOW()` em threads e posts (audit trail). Board hard
delete com CASCADE e confirmação explícita no handler. Índices compostos com
`WHERE deleted_at IS NULL` evitam penalty de performance.

**Rejeição:** Hard delete puro (sem audit), tabela de archive separada (complexidade).

---

### ADR-102.5 — Bump order via `last_post_at`

**Decisão:** Cada novo post atualiza `last_post_at` da thread. Índice composto:
`(board_id, is_pinned DESC, last_post_at DESC) WHERE deleted_at IS NULL`.
Pinned threads sempre no topo via `ORDER BY is_pinned DESC, last_post_at DESC`.

**Rejeição:** Ordenação por `created_at` (threads morrem na primeira página).

---

### ADR-102.6 — Design System oficial 42 (Graphic Charter Agosto 2024)

**Decisão:** Graphic Charter oficial como lei. Cores exatas (`#1B1B1B`, `#00BABC`,
`#173D7A`, `#2DD57A`, `#EC3391`). Tipografia Futura PT. `border-radius: 0` em
todos os componentes. Tailwind com `theme.extend.colors`.

**Rejeição:** Tema brutalista custom (cores não-oficiais).

---

### ADR-102.7 — Identidade real obrigatória

**Decisão:** `author_id NOT NULL` em todas as tabelas do fórum. FK → `users(id)`.
Login 42 + avatar + badge de título exibidos em cada post. Sem anonimato.

**Rejeição:** Anonimato opcional (incompatível com contexto acadêmico).

---

### ADR-102.8 — API 42: títulos e skills no login OAuth2

**Decisão:** No callback OAuth2, backend busca síncrono em `/v2/users/:id/titles`
e `/v2/users/:id/tags_users`. Salva em `users.title` e `users.skills`. Badge
com título aparece nos posts, autocomplete de tags sugere skills do autor.

**Rejeição:** Buscar sob demanda (rate limit), não exibir títulos (perde gamificação).

---

### ADR-102.9 — Seed boards + blacklist de slugs reservados

**Decisão:** Migration 002 semeia 5 boards (`/tech`, `/projects`, `/career`,
`/events`, `/random`). Slugs `admin`, `api`, `chat`, `forum`, `static`, `health`
bloqueados via regex + blacklist no handler. Owner inicial: `FORUM_ADMIN_ID` (env var).

**Rejeição:** Board livre sem reserva (colisão com rotas da API).

---

## Schema SQL — Migration 002

5 tabelas (boards, board_staff, threads, posts, users+title/skills):

### 1. `boards` — Categorias

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID PK | UUIDv7 |
| `slug` | VARCHAR(50) UNIQUE | URI (ex: tech) |
| `name` | VARCHAR(100) | Nome humano |
| `description` | TEXT | Descrição |
| `owner_id` | INT FK → users | Dono |
| `sfw` | BOOLEAN | Conteúdo seguro (default: true) |
| `theme` | VARCHAR(50) | Tema visual (default: 'sleek') |
| `language` | VARCHAR(10) | Idioma (default: 'pt-BR') |
| `is_locked` | BOOLEAN | Board fechado |
| `created_at` | TIMESTAMPTZ | — |
| `updated_at` | TIMESTAMPTZ | — |

### 2. `board_staff` — Moderação por board

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `board_id` | UUID FK → boards | Board |
| `user_id` | INT FK → users | Staff member |
| `role` | VARCHAR(20) | owner / mod / admin |
| `added_at` | TIMESTAMPTZ | — |
| `added_by` | INT FK → users | Quem adicionou |

**PK composta:** `(board_id, user_id)`. CHECK: role IN ('owner', 'mod', 'admin').

### 3. `threads` — Tópicos

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID PK | UUIDv7 |
| `board_id` | UUID FK → boards | Board |
| `author_id` | INT FK → users | Autor (OP) |
| `title` | VARCHAR(200) | Título (≥3 chars) |
| `content` | TEXT | Conteúdo MDX (≤10k chars) |
| `is_pinned` | BOOLEAN | Fixado no topo |
| `is_locked` | BOOLEAN | Fechado para novos posts |
| `post_count` | INT | Contagem total (default: 1) |
| `last_post_at` | TIMESTAMPTZ | Bump timestamp |
| `tags` | TEXT[] | Tags (ex: {go, websocket}) |
| `created_at` | TIMESTAMPTZ | — |
| `updated_at` | TIMESTAMPTZ | — |
| `deleted_at` | TIMESTAMPTZ | Soft delete |

**Índices críticos:**
- `idx_threads_board_bump`: `(board_id, is_pinned DESC, last_post_at DESC) WHERE deleted_at IS NULL`
- `idx_threads_tags`: GIN on tags

### 4. `posts` — Respostas

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID PK | UUIDv7 |
| `thread_id` | UUID FK → threads | Thread |
| `author_id` | INT FK → users | Autor |
| `content` | TEXT | Conteúdo MDX (≤10k chars) |
| `reply_to` | UUID FK → posts | Referência (nullable) |
| `created_at` | TIMESTAMPTZ | — |
| `deleted_at` | TIMESTAMPTZ | Soft delete |

**Índice crítico:**
- `idx_posts_thread_time`: `(thread_id, created_at) WHERE deleted_at IS NULL`

### 5. `users` (alterado)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `title` | VARCHAR(100) | Título 42 (ex: "Go Expert") — nullable |
| `skills` | TEXT[] | Skills 42 (ex: {go, web, algorithms}) — nullable |

---

## Rotas REST — 18 Endpoints

Prefixo: `/api/forum`, montadas como Chi subrouter em `cmd/server/main.go`.

### Públicas (sem autenticação)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/forum/boards` | Lista boards |
| GET | `/api/forum/boards/{slug}` | Detalhe board + threads |
| GET | `/api/forum/boards/{slug}/threads` | Threads paginadas (bump order) |
| GET | `/api/forum/threads/{id}` | Thread + posts |

### Autenticadas (JWT)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/forum/boards/{slug}/threads` | Criar thread |
| POST | `/api/forum/threads/{id}/posts` | Criar post |

### Moderação (mod, admin, board owner)

| Método | Rota | Descrição |
|--------|------|-----------|
| PATCH | `/api/forum/threads/{id}` | Pin/lock/unlock |
| DELETE | `/api/forum/threads/{id}` | Soft delete |
| DELETE | `/api/forum/posts/{id}` | Soft delete |

### Administração Global (admin)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/forum/boards` | Criar board |
| GET | `/api/forum/board-suggestions` | Listar sugestões |

### Owner do Board

| Método | Rota | Descrição |
|--------|------|-----------|
| PATCH | `/api/forum/boards/{slug}` | Editar settings |
| DELETE | `/api/forum/boards/{slug}` | Deletar (CASCADE) |

### Staff (owner/admin)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/forum/boards/{slug}/staff` | Adicionar staff |
| DELETE | `/api/forum/boards/{slug}/staff/{userId}` | Remover staff |

### Sugestão (usuário)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/forum/board-suggestions` | Sugerir board |

---

## Design System — 42 Graphic Charter

### Cores Oficiais

| Nome | Hex | Uso |
|------|-----|-----|
| Black | `#1B1B1B` | Títulos, textos |
| White | `#FFFFFF` | Fundos claros |
| Near Black | `#202026` | Fundo principal escuro |
| Dark Gray | `#29292E` | Superfícies, cards |
| 42 Teal | `#00BABC` | Ações, links, destaque |
| Dark Navy | `#173D7A` | Fundos escuros |
| Green | `#2DD57A` | Sucesso |
| Pink | `#EC3391` | Destaque, warning |

### Regras

- **border-radius: 0** em todos os componentes — flat design
- **Tipografia:** Futura PT (Light 300, Book 400, Heavy 700)
- **Paleta "Sleek":** telas institucionais
- **Paleta "Minimalist":** threads/leitura

---

## Métricas LATTE — Execução 2026-07-02

Feature 102 foi a primeira feature executada com **coordenação LATTE direta**
(protocolo A4.5 — dispatcher sem orquestrador intermediário).

### Throughput e Coordenação

| Métrica | Valor | Interpretação |
|---------|-------|---------------|
| **Tasks planejadas** | 28 | DAG completo em specs/features/102-42-forum/tasks.md |
| **Tasks delegadas** | 26 | Workers Haiku (executor1–executor3, rodízio) |
| **Reassigns** | 1 | T023 (worker perdido: connection closed) → tentativa 2/3 bem-sucedida |
| **Tasks redigidas pelo Lead** | 1 | T027 (wiki) — executor1 atual |
| **Dispatches total** | 27 | 26 + 1 reassign (T023) |
| **Janela deslizante** | ≤3 | Máximo 3 workers paralelos por batch |
| **Batches** | 12 | Fronteras recalculadas a cada 4 rounds (context saturation) |

### Wall-Clock e Tokens

| Métrica | Valor | Detalhe |
|---------|-------|--------|
| **Total tokens subagentes** | ~803k | Agregado de all 26 workers (Haiku 4.5) |
| **Média por task** | ~30.9k | 803k ÷ 26 |
| **Wall-clock por task** | 63–299s | Min (T009), Max (T014) |
| **Wall-clock total** | ~75 min | Parallelismo 3∥, incluindo sincronização |

### QA — Qualidade

| Verificação | Resultado | Detalhe |
|---|---|---|
| Smoke test (curl) | 11/11 PASS | Sem fixes necessários ao vivo |
| Testes de store | 16/16 PASS | Units contra PostgreSQL real |
| Testes de handler | 15 casos | 11 edge cases PASS, 9 skips (pool connection) |
| Testes BDD (Gherkin) | 22 cenários | specs/features/102-42-forum/acceptance/forum.feature |
| `go build ./...` | ✅ PASS | Backend + CLI |
| `go vet ./...` | ✅ PASS | Sem warnings |
| `npx tsc --noEmit` | ✅ PASS | Frontend (React + Zustand) |
| `npm run build` (Vite) | ✅ PASS | Production bundle |

### Incidentes e Resolução

| Incidente | Tarefa | Causa | Resolução |
|---|---|---|---|
| **Worker perdido** | T023 (testes unitários do store) | Connection closed mid-response; deixou 2 de 3 arquivos, um com erro de vet | Lead inspecionou o estado em disco e aplicou reassign (tentativa 2/3) com diagnóstico exato; worker novo corrigiu e completou |
| **Violação de constraint** | T017 (BoardView/ThreadRow) | Worker editou `ThreadView.tsx` (arquivo do T018, em voo) para remover import não usado | Sem dano: a escrita final do T018 prevaleceu; Lead revalidou o build do frontend após ambos fecharem |
| **Gap de DAG** | — (nenhuma task cobria rotas no `App.tsx`) | tasks.md não previu a integração das páginas do fórum no roteamento | Lead fez a integração diretamente (App.tsx, 4 rotas) e validou o build |

---

## Relacionados

- [[feature-100-42-chat-core|Feature 100 — 42 Chat Core]] — Dependência: auth JWT, PostgreSQL, Docker
- [[feature-101-assinatura-participacao|Feature 101 — Assinatura de Participação]] — Identidade real consistente
- [[SDD|Spec-Driven Development]] — Metodologia
- `specs/features/102-42-forum/spec.md` — Especificação completa
- `specs/features/102-42-forum/plan.md` — Plano com 9 ADRs
- `specs/features/102-42-forum/tasks.md` — DAG de 28 tasks LATTE
- `specs/features/102-42-forum/acceptance/forum.feature` — 22 cenários BDD Gherkin
- `tests/forum_smoke_test.sh` — Suite de integração (11 testes curl)
