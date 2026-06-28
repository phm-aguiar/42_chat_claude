---
title: "Feature 102 — 42 Forum"
tags: [42, forum, sdd, feature, go, react, mdx]
category: projects
status: implemented
feature_id: 102
summary: >-
  Fórum tech assíncrono para alunos da 42. Modelo board/thread/post com
  identidade real, conteúdo MDX, PKs UUIDv7, moderação completa e design
  system oficial 42. Módulo monolítico reutilizando stack Go + Chi +
  PostgreSQL existente.
created: "2026-06-26"
rag_score: 0.5
updated: "2026-06-27"
provenance:
  extracted: 0.95
  inferred: 0.05
  ambiguous: 0.0
base_confidence: 0.98
lifecycle: verified
lifecycle_changed: 2026-06-26
tier: core
---

# Feature 102 — 42 Forum

> Fórum tech assíncrono para alunos da 42 compartilharem descobertas,
> aprendizados e conhecimento técnico. Inspirado no modelo board/thread/post
> de imageboards, mas com **identidade real** (login 42 visível) — sem
> anonimato. Conteúdo em **MDX** (Markdown + JSX) com syntax highlighting,
> imagens inline e embed de componentes React.

## Resumo

O 42 Forum é a terceira feature do framework SDD e o primeiro **módulo REST
puro** (sem WebSocket) construído dentro do monolito Go existente. Ele
implementa um fórum completo — boards categorizados por tema, threads com bump
order, posts com reply-to e conteúdo MDX — tudo com identidade real obrigatória
via OAuth2 42.

Ao contrário do chat em tempo real ([[projects/42_chat/features/feature-100-42-chat-core|Feature 100]]),
o fórum é **assíncrono e permanente**: uma thread de hoje pode ser consultada
daqui 6 meses. É o "lugar das coisas que merecem mais que 5 minutos de atenção".

27 tasks implementadas em 7 fases via LATTE. Coordenadas por subagentes: Dev
(implementação) e QA (testes). A feature está **✅ implementada** e valida a
capacidade do framework SDD de gerar módulos REST integrados com PKs UUIDv7 e
soft delete.

## Arquitetura

### Modelo de Domínio

```
Board (categoria)
  ├─ slug único (ex: /tech, /projects, /career)
  ├─ staff (owner, mod, admin) via board_staff
  └─ Threads (bump order, pinned no topo)
       ├─ OP (post inicial com título + conteúdo MDX)
       ├─ tags (TEXT[], GIN index)
       └─ Posts (respostas)
            ├─ reply-to opcional (tree view)
            └─ conteúdo MDX (≤ 10k chars)
```

- **Boards:** 5 seed boards iniciais + criação por admin. Slugs reservados
  bloqueados (admin, api, chat, etc.)
- **Threads:** Autor identificado, bump order via `last_post_at`, pin/lock por
  moderação. Tags com GIN index para busca futura.
- **Posts:** Autor identificado, reply-to opcional, soft delete.
- **Identidade real:** `author_id` NOT NULL em todas as tabelas, FK →
  `users(id)`. Login 42 + avatar + título (badge/flair) exibidos em cada post.

### PKs UUIDv7

Todas as chaves primárias do fórum (boards, threads, posts) usam **UUIDv7**
(time-sortable, geração client-side, sem enumeration attack). Nativo da stdlib
Go 1.25 (`uuid.NewV7()`).

### MDX

Conteúdo armazenado como texto puro no PostgreSQL, renderizado no frontend com
`@mdx-js/react` + `remark-gfm` + `rehype-highlight`. Editor com preview tabs,
toolbar (Bold, Italic, Code, Link, Image, List, Quote) e atalhos de teclado.

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
| PKs | UUIDv7 (stdlib Go) | Time-sortable, sem enumeration |
| Estado | Zustand | Gerenciamento de estado do fórum |
| Container | Docker Compose | Reuso, zero infra nova |

## ADRs — Decisões Arquiteturais

### ADR-1: Módulo monolítico

O fórum é um módulo dentro do mesmo processo Go, mesmo pool PostgreSQL, mesmo
middleware JWT, mesmo Docker Compose. **Zero infra nova.** Feature 100 e 101
já validam o padrão monolítico. O fórum é REST-only (sem WebSocket) — ainda
mais simples que o chat.

**Rejeitado:** Microsserviço separado (novo container, novo deploy, auth
cross-service — overengineering para ~300 alunos).

### ADR-2: UUIDv7

UUIDv7 em todas as PKs do fórum. Time-sortable (ordenação natural por criação),
sem enumeration attack, geração client-side sem round-trip ao banco.

**Rejeitado:** SERIAL/BIGSERIAL (expõe contagem de registros), UUIDv4 (não
time-sortable, índices B-tree fragmentados).

### ADR-3: MDX no frontend

MDX = Markdown + JSX. Posts podem conter componentes React interativos
(syntax highlighting, embeds, gráficos). Armazenado como texto puro no
PostgreSQL, renderizado no cliente. Única dependência nova no frontend.

**Rejeitado:** Markdown puro (sem embed interativo), HTML sanitizado (risco
XSS), SSR (desnecessário para conteúdo estático).

### ADR-4: Soft delete

`deleted_at` em threads e posts (mesmo padrão do chat — Feature 100). Audit
trail completo. Conteúdo restaurável. Expurgável via cron job após 12 meses.
Boards têm hard delete (CASCADE) com confirmação — board vazio sem threads
não tem valor de auditoria.

**Rejeitado:** Hard delete puro (sem audit trail), tabela de archive separada
(complexidade extra sem ganho).

### ADR-5: Bump order

Threads ordenadas por atividade recente (`last_post_at`), não por criação.
Cada novo post atualiza `last_post_at` da thread, trazendo-a ao topo. Pinned
threads sempre no topo via `ORDER BY is_pinned DESC, last_post_at DESC`.

**Rejeitado:** Ordenação por `created_at` (threads morrem na primeira página),
ordenação por popularidade (v2, precisa de métricas).

### ADR-6: Design system oficial 42 (Graphic Charter)

O graphic charter oficial da 42 (Agosto 2024) substitui o tema brutalista
custom da Feature 100. Cores exatas (`#1B1B1B`, `#00BABC`, `#202026`, etc.),
tipografia Futura PT, `border-radius: 0` em todos os componentes. Tailwind
configurado com `theme.extend.colors` mapeando as cores oficiais do arquivo
[[_raw/42-graphic-charter-software]].

**Rejeitado:** Herdar tema brutalista da Feature 100 (cores não-oficiais),
Shadcn/ui com tema default (visual genérico).

### ADR-7: Identidade real

Todo post tem autor identificado (login 42 + avatar + título/badge). Sem
anonimato, sem tripcodes, sem postagem como convidado. Consistente com a
[[projects/42_chat/features/feature-101-assinatura-participacao|Feature 101]]
(assinatura de participação). FK `author_id` é NOT NULL em todas as tabelas
do fórum.

**Rejeitado:** Anonimato opcional (estilo 4chan — incompatível com propósito
acadêmico), postagem como convidado (dificulta moderação).

### ADR-8: API 42 — títulos e skills

Durante o login OAuth2, backend busca `/v2/users/:id/titles` e
`/v2/users/:id/tags_users`. Títulos armazenados em `users.title`, skills em
`users.skills` (TEXT[]). Badge com título aparece ao lado do login nos posts.
Ao criar thread, input de tags oferece autocomplete com as skills do autor.

**Rejeitado:** Buscar sob demanda (rate limit na API 42), não exibir títulos
(perde integração com gamificação 42).

### ADR-9: Seed boards + slugs reservados

5 boards iniciais (`/tech`, `/projects`, `/career`, `/events`, `/random`)
criados via migration seed. Slugs reservados bloqueados no handler via regex
+ blacklist. Owner inicial atribuído dinamicamente.

**Rejeitado:** Board livre sem reserva de slugs (colisão com rotas da API),
admin global como role fixa no código (inflexível).

## Schema SQL

5 tabelas no banco PostgreSQL (migration `002_add_forum.sql`):

### 1. `boards` — Categorias do fórum

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID PK | UUIDv7 |
| `slug` | VARCHAR(50) UNIQUE | URI do board (ex: tech) |
| `name` | VARCHAR(100) | Nome humano |
| `description` | TEXT | Descrição do board |
| `owner_id` | INT FK → users | Dono do board |
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

PK composta: `(board_id, user_id)`. CHECK: role IN ('owner', 'mod', 'admin').

### 3. `threads` — Tópicos

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID PK | UUIDv7 |
| `board_id` | UUID FK → boards | Board |
| `author_id` | INT FK → users | Autor (OP) |
| `title` | VARCHAR(200) | Título (≥ 3 chars) |
| `content` | TEXT | Conteúdo MDX (≤ 10k chars) |
| `is_pinned` | BOOLEAN | Fixado no topo |
| `is_locked` | BOOLEAN | Fechado para novos posts |
| `post_count` | INT | Contagem total (default: 1) |
| `last_post_at` | TIMESTAMPTZ | Timestamp do bump |
| `tags` | TEXT[] | Tags (ex: {go, websocket}) |
| `created_at` | TIMESTAMPTZ | — |
| `updated_at` | TIMESTAMPTZ | — |
| `deleted_at` | TIMESTAMPTZ | Soft delete |

Índices: `idx_threads_board_bump` (board_id, is_pinned DESC, last_post_at DESC
WHERE deleted_at IS NULL), `idx_threads_tags` (GIN on tags).

### 4. `posts` — Respostas

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID PK | UUIDv7 |
| `thread_id` | UUID FK → threads | Thread |
| `author_id` | INT FK → users | Autor |
| `content` | TEXT | Conteúdo MDX (≤ 10k chars) |
| `reply_to` | UUID FK → posts | Referência a reply (nullable) |
| `created_at` | TIMESTAMPTZ | — |
| `deleted_at` | TIMESTAMPTZ | Soft delete |

Índice: `idx_posts_thread_time` (thread_id, created_at WHERE deleted_at IS NULL).

### 5. `users` (alterado)

Colunas adicionadas pela migration 002:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `title` | VARCHAR(100) | Título 42 (ex: "Go Expert") — nullable |
| `skills` | TEXT[] | Skills 42 (ex: {go, web, algorithms}) — nullable |

## Rotas REST

18 endpoints sob o prefixo `/api/forum`, montados como Chi subrouter em
`cmd/server/main.go`.

### Rotas públicas (sem autenticação)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/forum/boards` | Lista boards públicos |
| `GET` | `/api/forum/boards/{slug}` | Detalhe do board + threads |
| `GET` | `/api/forum/boards/{slug}/threads` | Threads paginadas (bump order) |
| `GET` | `/api/forum/threads/{id}` | Thread + posts |

### Rotas autenticadas (JWT)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/forum/boards/{slug}/threads` | Criar thread |
| `POST` | `/api/forum/threads/{id}/posts` | Criar post (reply) |

### Rotas de moderação (mod, admin ou owner do board)

| Método | Rota | Descrição |
|--------|------|-----------|
| `PATCH` | `/api/forum/threads/{id}` | Pin/lock/unlock thread |
| `DELETE` | `/api/forum/threads/{id}` | Soft delete thread |
| `DELETE` | `/api/forum/posts/{id}` | Soft delete post |

### Rotas de administração global (admin)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/forum/boards` | Criar board |
| `GET` | `/api/forum/board-suggestions` | Listar sugestões pendentes |

### Rotas do owner do board

| Método | Rota | Descrição |
|--------|------|-----------|
| `PATCH` | `/api/forum/boards/{slug}` | Editar settings do board |
| `DELETE` | `/api/forum/boards/{slug}` | Deletar board (CASCADE) |

### Rotas de staff (owner/admin)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/forum/boards/{slug}/staff` | Adicionar staff |
| `DELETE` | `/api/forum/boards/{slug}/staff/{userId}` | Remover staff |

### Rotas de sugestão (usuário)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/forum/board-suggestions` | Sugerir novo board |

### Rotas de perfil (API 42)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/users/me/titles` | Títulos 42 do usuário |
| `GET` | `/api/users/me/skills` | Skills 42 do usuário |

## Design System

O fórum adota o **design system oficial da 42** conforme a
[[_raw/42-graphic-charter-software|Graphic Charter (Agosto 2024)]],
substituindo o tema brutalista custom da Feature 100.

### Cores oficiais

| Nome | Hex | Uso |
|------|-----|-----|
| Black | `#1B1B1B` | Logotipo, títulos, textos |
| White | `#FFFFFF` | Fundos claros, logotipo |
| Near Black | `#202026` | Fundo principal escuro |
| Dark Gray | `#29292E` | Superfícies, cards |
| Mid Gray | `#5B5B60` | Texto secundário, bordas |
| Light Gray | `#E3E3E3` | Fundo claro |
| 42 Teal | `#00BABC` | Ações, links, destaque |
| CG Blue | `#04809F` | Ações secundárias |
| Dark Navy | `#173D7A` | Fundos escuros |
| Green | `#2DD57A` | Sucesso, confirm |
| Pink | `#EC3391` | Destaque, warning |

### Tipografia

**Futura PT** (Light 300, Book 400, Heavy 700 + obliques). Licença Adobe Fonts.

### Regras de UI

- **border-radius: 0** em todos os componentes — flat design, cantos secos
- **Margem de segurança do logo:** altura do logo ÷ 2
- **Logotipo:** somente preto (`#1B1B1B`) ou branco (`#FFFFFF`)
- **Paleta "Sleek":** 42 Blue + Dark Slate Gray + Cadet Gray + Light Cobalt
  Blue — telas institucionais
- **Paleta "Minimalist":** 42 Blue + Bubbles + Bright Gray — áreas de leitura
  e threads

## Tasks (27 — DAG LATTE)

| Fase | Tasks | Descrição |
|------|-------|-----------|
| Fase 1 | T001–T003 | Fundação: migration SQL, modelos Go, Tailwind config |
| Fase 2 | T004–T007 | Store layer: boards, board_staff, threads, posts |
| Fase 3 | T008–T012 | Handlers HTTP + middleware + montagem de rotas |
| Fase 4 | T013–T019 | Frontend: páginas, componentes MDX, Zustand store |
| Fase 5 | T020–T021 | Integração API 42: títulos, skills, autocomplete |
| Fase 6 | T022–T025 | QA: smoke test, unitários, borda, BDD (.feature) |
| Fase 7 | T026–T027 | Wiki (esta página) + métricas LATTE |

> Ver [[specs/features/102-42-forum/tasks]] para o DAG completo com
> dependências e paralelismo.

## Métricas LATTE (Execução Real)

Feature 102 foi a primeira feature executada com LATTE coordination graph — validação empírica do framework.

| Métrica | Valor | Comparação (Paper LATTE) |
|---------|-------|--------------------------|
| Tasks concluídas | 27/27 (100%) | ~80% (paper) |
| Fases | 7 | — |
| Subagentes spawnados | 25 (leaf) | — |
| Batches paralelos | 12 | — |
| Paralelismo máximo | 3∥ | — |
| Wall-clock total | ~55 min | 3.5 min (paper, escopo menor) |
| Overwrites detectados | 5 arquivos | 4.3 (paper) |
| **Overwrite rate** | **11.1% (5/45 arquivos)** | **−78% vs baseline estático** |

### Overwrites — Causa Raiz

Todos os 5 overwrites ocorreram na **Fase 6 (QA / smoke test)**:

| Arquivo | Task original | Sobrescrito por | Causa |
|---------|--------------|-----------------|-------|
| `internal/forum/store/boards.go` | T004 | T022 (smoke) | SeedBoards sem board_staff |
| `internal/forum/middleware/auth.go` | T011 | T022 | getBoardID não resolvia thread UUIDs |
| `internal/forum/routes/routes.go` | T012 | T022 | JWT middleware ausente nas rotas |
| `cmd/server/main.go` | T012 | T022 | Novos parâmetros em RegisterForumRoutes |
| `frontend/src/components/forum/PostCard.tsx` | T015 | T021 | authorTitle prop + badge |

### Lições para o Framework

1. **T022 (smoke test) foi o maior valor** — descobriu 3 bugs críticos que tasks isoladas não pegariam. ^[inferred]
2. **Fase 3 (handlers) foi o gargalo** — 389s, maior complexidade e mais API calls
3. **Batch de 3 subagentes funcionou** — zero conflitos de arquivo com paralelismo 3∥
4. **tasks.md precisou de 5 correções manuais** — editor de markdown em tabelas é frágil para marcar [x]

### Qualidade do Código

| Verificação | Resultado |
|-------------|-----------|
| `go build ./...` | ✅ PASS |
| `go vet ./...` | ✅ PASS |
| `npx tsc --noEmit` | ✅ PASS |
| `npx vite build` | ✅ PASS |
| Testes handler edge | 11/11 PASS |
| Testes integração | 11/11 PASS |

## Relacionados

- [[projects/42_chat/features/feature-100-42-chat-core|Feature 100 — 42 Chat Core]] — Dependência: auth JWT, PostgreSQL, Docker
- [[projects/42_chat/features/feature-101-assinatura-participacao|Feature 101 — Assinatura de Participação]] — Identidade real consistente
- [[projects/42_chat/features/feature-004-sdd-tasks-dag|Feature 004 — Tasks DAG]] — Formato DAG usado no tasks.md
- [[_raw/42-graphic-charter-software|42 Graphic Charter — Software & UI]] — Design system oficial
- [[sdd]] — Metodologia SDD
- [[specs/features/102-42-forum/spec]] — Spec completa
- [[specs/features/102-42-forum/plan]] — Plano de implementação
- [[specs/features/102-42-forum/tasks]] — DAG de 27 tasks
- [[specs/features/102-42-forum/acceptance/forum.feature]] — 22 cenários BDD
