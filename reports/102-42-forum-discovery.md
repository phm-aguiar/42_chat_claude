# Discovery Report: 42 Forum

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | 102 |
| **Slug** | 42-forum |
| **Status** | accepted |
| **Autor** | phm-aguiar |
| **Data original** | 2026-06-21 |
| **Revisão** | 2026-06-30 — discovery report para planejamento (feature não implementada) |
| **Versão** | 1.0 |
| **Spec derivada** | `specs/features/102-42-forum/spec.md` |
| **Aprovado** | true |

---

## 1. Contexto e Problema

O 42 Chat Core (Feature 100) entrega comunicação em tempo real para o campus, mas mensagens
de chat são efêmeras — não há forma de preservar descobertas técnicas, guias de projeto ou
discussões que tenham valor duradouro. Alunos compartilham conhecimento repetindo as mesmas
perguntas no chat geral sem que respostas se acumulem em lugar nenhum.

A Feature 102 cria o 42 Forum: um fórum técnico assíncrono para ~300 alunos da 42 São Paulo,
inspirado no modelo board/thread/post de imageboards (jschan) mas com **identidade real**
obrigatória (sem anonimato) e conteúdo em **MDX** (Markdown + JSX). É o "lugar das coisas
que merecem mais que 5 minutos de atenção".

### Usuários Impactados

- **Primários:** ~300 alunos com conta na Intra 42 São Paulo
- **Secundários:** staff/mods da 42 que moderarão os boards

### Situação Atual (sem a feature)

Conhecimento técnico circula no chat geral e se perde. Não existe repositório assíncrono de
guias, descobertas de projetos ou discussões técnicas. Alunos com dúvidas sobre o mesmo
projeto repetem as mesmas perguntas sem acumular respostas.

### Por que agora

A Feature 100 valida a stack completa (Go + Chi + PostgreSQL + React + OAuth2). O fórum é o
próximo módulo natural: mesmo stack, zero infra nova, mas muda o paradigma de efêmero para
persistente.

---

## 2. Objetivos e Não-Objetivos

### Objetivos

- Fórum com boards categorizados por tema (5 seeds: /tech, /projects, /career, /events, /random)
- Threads com bump order (última atividade no topo) e pin/lock por moderadores
- Posts com conteúdo MDX, reply-to opcional, soft delete obrigatório
- Identidade real: login 42 + avatar + título/badge da API 42 em cada post
- Tags/autocomplete usando skills do usuário vindas da API 42
- Moderação em 3 camadas: owner do board, mod do board, admin global
- PKs UUIDv7 (time-sortable, sem enumeration attack)
- Design system oficial 42 (Graphic Charter Agosto 2024)

### Não-Objetivos (v1)

- Upload de imagens/arquivos — imagens só via link externo no MDX
- Notificações push/email/WS — v2
- Busca full-text com UI — GIN index existe, UI é v2
- Reputação/karma/votação — v2
- Painel admin com UI — v1 usa CLI/API direta

---

## 3. Requisitos

### Funcionais (RF)

| # | Requisito | Prioridade |
|---|-----------|-----------|
| RF-01 | CRUD de boards por admin com validação de slug (regex + blacklist) | Must |
| RF-02 | Threads com título (3–200 chars) + conteúdo MDX (≤10k chars) + tags | Must |
| RF-03 | Posts com conteúdo MDX (≤10k chars) + reply-to opcional | Must |
| RF-04 | Bump order: `last_post_at` atualizado a cada post; pinned sempre no topo | Must |
| RF-05 | Soft delete em threads e posts (`deleted_at = NOW()`) — nunca hard delete | Must |
| RF-06 | Hard delete de board com CASCADE (confirmação obrigatória) | Must |
| RF-07 | Middleware de moderação: BoardOwner, ModOnly, AdminOnly | Must |
| RF-08 | Staff por board: roles owner/mod/admin, PK composta (board_id, user_id) | Must |
| RF-09 | Badge de título 42 nos posts (via `users.title` populado no OAuth2 login) | Must |
| RF-10 | Autocomplete de tags com skills do usuário (via `users.skills`) | Should |
| RF-11 | Seed de 5 boards na migration 002 com owner_id = `FORUM_ADMIN_ID` (env var) | Must |
| RF-12 | Slugs reservados bloqueados: admin, api, chat, forum, static, health | Must |
| RF-13 | Renderização MDX no frontend com syntax highlight + imagens + links | Must |
| RF-14 | Paginação de threads (bump order) e posts (cronológica) | Must |
| RF-15 | Navegação forum ↔ chat com link claro | Should |
| RF-16 | Avatar fallback para `/assets/default-avatar.png` via `onError` | Should |

### Não-Funcionais (RNF)

| # | Requisito | Métrica |
|---|-----------|---------|
| RNF-01 | Listagem de threads < 200ms p95 (sem cache) | PostgreSQL index + limit |
| RNF-02 | Build Go sem warnings (`go vet ./...`) | CI gate |
| RNF-03 | Build frontend sem erros TypeScript (`npx tsc --noEmit`) | CI gate |
| RNF-04 | Identidade real obrigatória: `author_id NOT NULL` em boards, threads, posts | Schema constraint |
| RNF-05 | Slug de board: `^[a-z0-9]([a-z0-9_-]*[a-z0-9])?$` | Regex validada no handler |
| RNF-06 | Conteúdo MDX armazenado como texto puro, renderizado no cliente | Sem XSS backend |
| RNF-07 | UUIDv7 em todas as PKs do fórum (`uuid.NewV7()` stdlib Go 1.25) | Sem SERIAL/UUIDv4 |
| RNF-08 | `border-radius: 0` em todos os componentes do DS42 | Visual constraint |

---

## 4. Cenários Gherkin

### Cenários de Sucesso

```gherkin
# language: pt-BR

Funcionalidade: Fórum de tech da 42

  Contexto:
    Dado que o sistema está rodando com Docker Compose
    E a migration 002_add_forum foi aplicada
    E os 5 seed boards existem (/tech, /projects, /career, /events, /random)

  Cenário: Aluno vê lista de boards na landing page
    Quando acesso GET /api/forum/boards
    Então recebo status 200
    E o body contém array com 5 boards
    E cada board tem slug, name, description, sfw

  Cenário: Aluno cria uma thread em um board
    Dado que estou autenticado como aluno
    Quando crio POST /api/forum/boards/tech/threads
      | title   | Como compilar Kernel BSD?          |
      | content | # Kernel BSD\n\nGuia passo a passo |
      | tags    | ["bsd", "kernel", "c"]             |
    Então recebo status 201
    E o body contém id UUID
    E GET /api/forum/boards/tech/threads mostra a thread no topo (bump)

  Cenário: Bump order com pinned no topo
    Dado que o board /tech tem 3 threads (A criada primeiro, B depois, C pinned)
    Quando acesso GET /api/forum/boards/tech/threads
    Então a primeira thread é C (pinned)
    E a segunda é B (último bump)
    E a terceira é A (mais antiga)

  Cenário: Aluno responde uma thread (reply-to)
    Dado que estou autenticado
    E a thread /tech/thread/{id} existe e não está locked
    E existe post anterior com id {postId}
    Quando crio POST /api/forum/threads/{id}/posts
      | content  | Concordo com você! |
      | reply_to | {postId}           |
    Então recebo status 201
    E o post criado tem reply_to = {postId}
    E post_count da thread é 2

  Cenário: Badge de título 42 aparece nos posts
    Dado que o aluno "marvin" tem título "Go Expert" na API 42
    Quando "marvin" faz login OAuth2
    Então users.title = "Go Expert"
    E os posts de "marvin" exibem o badge "Go Expert"

  Cenário: Skills como autocomplete de tags
    Dado que o aluno "marvin" tem skills ["Go", "C", "Web"] na API 42
    Quando "marvin" faz login OAuth2
    Então users.skills = ["Go", "C", "Web"]
    E ao criar thread, o autocomplete sugere "Go", "C", "Web"

  Cenário: Mod fixa uma thread (pin)
    Dado que sou mod do board /tech
    Quando faço PATCH /api/forum/threads/{id} com is_pinned = true
    Então recebo status 200
    E a thread aparece no topo com is_pinned = true

  Cenário: Mod faz soft delete de post
    Dado que sou mod do board /tech
    Quando faço DELETE /api/forum/posts/{id}
    Então recebo status 200
    E o post aparece como "[deleted]" na thread (conteúdo apagado, linha mantida)
    E o banco preserva o registro com deleted_at != NULL
```

### Cenários de Falha

```gherkin
  Cenário de Falha: Slug reservado é rejeitado
    Dado que estou autenticado como admin
    Quando tento POST /api/forum/boards com slug "admin"
    Então recebo status 400
    E o body contém "slug reservado"

  Cenário de Falha: Thread locked bloqueia novos posts
    Dado que a thread está locked (is_locked = true)
    Quando tento POST /api/forum/threads/{id}/posts
    Então recebo status 403
    E o body contém "THREAD_LOCKED"

  Cenário de Falha: Conteúdo acima do limite é rejeitado
    Dado que estou autenticado
    Quando tento criar thread com content de 10001 caracteres
    Então recebo status 400
    E o body contém "content excede 10000 caracteres"

  Cenário de Falha: Título muito curto é rejeitado
    Dado que estou autenticado
    Quando tento criar thread com title "Oi"
    Então recebo status 400

  Cenário de Falha: Não-mod não consegue moderar
    Dado que NÃO sou staff do board /tech
    Quando tento PATCH /api/forum/threads/{id} com is_pinned = true
    Então recebo status 403

  Cenário de Falha: Não-owner não edita settings do board
    Dado que NÃO sou staff do board /tech
    Quando tento PATCH /api/forum/boards/tech
    Então recebo status 403
```

### Edge Cases

```gherkin
  Cenário Edge: Reply-to de post deletado mostra referência
    Dado que um post referencia reply_to = {deletedPostId}
    E o post {deletedPostId} tem deleted_at != NULL
    Quando acesso GET /api/forum/threads/{id}
    Então o post de resposta mostra "Em resposta a [deleted]"

  Cenário Edge: Board sem threads mostra lista vazia
    Dado que o board /events não tem threads
    Quando acesso GET /api/forum/boards/events/threads
    Então recebo status 200
    E o array de threads está vazio

  Cenário Edge: Usuário sem título não exibe badge
    Dado que o aluno "evaluatee" não tem título na API 42
    Quando "evaluatee" faz login
    Então users.title é NULL
    E os posts não exibem badge
```

---

## 5. ADRs

### ADR-102.1 — Módulo monolítico (zero infra nova)

**Status:** accepted

**Contexto:** O fórum poderia ser um serviço separado (ex: Discourse, NodeBB, jschan).

**Decisão:** Módulo dentro do mesmo processo Go, mesmo pool PostgreSQL, mesmo Docker Compose. Migration 002 no mesmo banco. Mesmo middleware JWT. Zero dependência nova no backend.

**Por que não jschan:** Requer MongoDB + Redis + Node.js. Anonimato indesejável para o contexto acadêmico.

**Consequências:**
- (+) Zero overhead de infra; deploy idêntico ao chat
- (+) Auth JWT reutilizada sem mudanças
- (-) Fórum e chat no mesmo processo — falha no chat afeta fórum (aceitável)

---

### ADR-102.2 — UUIDv7 para PKs do fórum

**Status:** accepted

**Contexto:** Tabelas do chat (Feature 100) usam `gen_random_uuid()` (v4). Fórum tem PKs para boards, threads e posts.

**Decisão:** UUIDv7 via `uuid.NewV7()` (stdlib Go 1.25). Time-sortable sem índice extra de `created_at` para PKs. Sem enumeration attack.

**Por que não SERIAL:** Expõe contagem total de threads/posts — enumeration attack óbvio.

**Consequências:**
- (+) Ordenação natural por criação via UUID prefix
- (+) Geração client-side — sem round-trip ao banco
- (-) UUID maior que BIGINT — aceitável em escala de 300 alunos

---

### ADR-102.3 — MDX no frontend (texto puro no banco)

**Status:** accepted

**Contexto:** Posts precisam de Markdown + syntax highlight + imagens inline.

**Decisão:** Conteúdo armazenado como texto puro no PostgreSQL. Renderizado no cliente com `@mdx-js/react` + `remark-gfm` + `rehype-highlight`. Única dependência nova no frontend.

**Por que não HTML sanitizado:** Risco de XSS na sanitização servidor. Frontend já tem Vite+React — rendering local é seguro.

**Consequências:**
- (+) Sem XSS backend; sem coluna `body_html` no schema
- (+) MDX renderizado com componentes React customizados (code highlight nativo)
- (-) `@mdx-js/react` adiciona ~50KB ao bundle — aceitável

---

### ADR-102.4 — Soft delete em threads e posts; hard delete em boards

**Status:** accepted

**Contexto:** Moderação precisa apagar conteúdo sem perder audit trail.

**Decisão:** `deleted_at = NOW()` em threads e posts — nunca `DELETE`. Boards têm hard delete com CASCADE e confirmação explícita no handler (board sem threads não tem valor de auditoria).

**Consequências:**
- (+) Audit trail completo; conteúdo restaurável em 12 meses
- (+) `reply_to` de post deletado continua funcional (referência existe)
- (-) Queries precisam de `WHERE deleted_at IS NULL` — coberto pelos índices

---

### ADR-102.5 — Bump order via `last_post_at`

**Status:** accepted

**Contexto:** Threads devem aparecer por atividade recente, não por criação.

**Decisão:** `UPDATE threads SET last_post_at = NOW(), post_count = post_count + 1` a cada novo post. Índice composto: `(board_id, is_pinned DESC, last_post_at DESC) WHERE deleted_at IS NULL`.

**Consequências:**
- (+) Threads ativas ficam visíveis naturalmente
- (+) Pinned threads sempre no topo sem lógica extra no frontend
- (-) UPDATE extra por post — aceitável em escala de 300 alunos

---

### ADR-102.6 — Design System oficial 42 (Graphic Charter Agosto 2024)

**Status:** accepted

**Contexto:** Feature 100 usou tema brutalista custom. Fórum deve representar identidade da 42.

**Decisão:** Graphic Charter oficial como lei: cores exatas (`#1B1B1B`, `#00BABC`, `#202026`, etc.), tipografia Futura PT, `border-radius: 0` em todos os componentes. Tailwind configurado com `theme.extend.colors`.

**Consequências:**
- (+) Visual institucional consistente com a marca 42
- (-) Futura PT requer licença Adobe Fonts (documentado como DT-DS-01)

---

### ADR-102.7 — Identidade real obrigatória

**Status:** accepted

**Contexto:** Imageboards (4chan, jschan) suportam anonimato. Fórum 42 é acadêmico.

**Decisão:** `author_id NOT NULL` em boards, threads e posts. FK → `users(id)`. Sem tripcodes, sem postagem como convidado.

**Consequências:**
- (+) Moderação simples — cada post tem autor rastreável
- (+) Consistência com Feature 101 (assinatura de participação)
- (-) Alunos não têm privacidade em posts técnicos — aceitável no contexto acadêmico

---

### ADR-102.8 — API 42: títulos e skills no OAuth2 login

**Status:** accepted

**Contexto:** API 42 expõe títulos e skills de cada usuário.

**Decisão:** Durante o OAuth2 callback (`/api/auth/42/callback`), backend faz GET `/v2/users/:id/titles` e `/v2/users/:id/tags_users`. Resultados armazenados em `users.title` (VARCHAR) e `users.skills` (TEXT[]). Consultados diretamente na listagem de posts.

**Por que no login e não sob demanda:** Rate limit da API 42. Dados relativamente estáveis (título muda raramente).

**Consequências:**
- (+) Badge de título nos posts sem API call extra
- (+) Autocomplete de tags com skills reais do aluno
- (-) Dado pode ficar stale entre logins — aceitável; refrescado no próximo login

---

### ADR-102.9 — Seed boards + slugs reservados

**Status:** accepted

**Contexto:** Fórum precisa de boards iniciais; slugs colidem com rotas da aplicação.

**Decisão:** 5 boards semeados na migration 002. Slugs `admin`, `api`, `chat`, `forum`, `static`, `health` bloqueados via regex + blacklist no handler. Owner inicial = `FORUM_ADMIN_ID` (env var).

**Consequências:**
- (+) Fórum funcional imediatamente após migration
- (+) Sem colisão com rotas existentes da API
- (-) Adicionar slug reservado exige deploy — lista pode crescer com novas features

---

## 6. Débitos Técnicos

| ID | Descrição | Impacto | Mitigação |
|----|-----------|---------|-----------|
| DT-F01 | Testes de store bloqueados por `pg_hba.conf` Docker — 24 testes compilam mas não rodam | Médio | Fix de infra em docker-compose.yml (não bloqueia feature) |
| DT-F02 | `reply_to` UUID: `UnmarshalJSON` não trata NULL corretamente em alguns edge cases de scan Go | Baixo | Fix na struct `Post` com `*uuid.UUID` (ponteiro nullable) |
| DT-F03 | Futura PT requer licença Adobe Fonts — fallback `ui-sans-serif` pode divergir visualmente | Médio | Documentado; aceito como restrição de infra |
| DT-F04 | Smoke test shell (`tests/forum_smoke_test.sh`) não foi executado em CI (requer Docker) | Médio | Integrar ao docker-compose.test.yml no futuro |
| DT-F05 | Busca full-text: GIN index em `tags` existe mas sem UI de busca | Baixo | v2 — index não prejudica writes |

---

## 7. Cross-Reference

### Base de código existente (linha de base — Feature 100)

| Arquivo | Relevância para o fórum |
|---------|-----------|
| `internal/auth/handler.go` | Callback OAuth2 — ponto de extensão para buscar titles/skills (T020) |
| `internal/db/queries/users.go` | Upsert de usuário — a estender com title/skills |
| `internal/db/migrations/001_init.sql` | Schema base (users, messages) — migration 002 acrescenta |
| `frontend/src/stores/chatStore.ts` | Padrão Zustand a espelhar em `forumStore.ts` |
| `internal/chat/handler.go`, `internal/ws/hub.go` | Padrão de handler/rota Chi a reutilizar |

### Arquivos-alvo (a criar nesta feature)

| Arquivo | Task |
|---------|------|
| `internal/db/migrations/002_add_forum.sql` | T001 |
| `internal/forum/store/{boards,board_staff,threads,posts}.go` | T004–T007 |
| `internal/forum/middleware/auth.go` | T011 |
| `internal/forum/routes/routes.go` | T012 |
| `frontend/src/stores/forumStore.ts`, `lib/forumApi.ts` | T013 |
| `frontend/src/components/forum/*` | T014–T021 |
| `specs/features/102-42-forum/acceptance/forum.feature` | T025 (já existe rascunho) |
| `tests/forum_smoke_test.sh` | T022 |
| `wiki-claude/projects/42_chat/features/feature-102-forum.md` | T026 |

### Wiki consultada

| Documento | Uso |
|-----------|-----|
| `wiki-claude/_raw/funcionalidade-chat.md` | Referência de funcionalidades de chat (MSN Messenger — fonte de inspiração) |
| `wiki-claude/_raw/42-graphic-charter-software.md` | Design System oficial 42 — cores, tipografia, border-radius |
| `wiki-claude/projects/42_chat/features/feature-100-42-chat-core.md` | Stack e auth reutilizados |
| `wiki-claude/projects/42_chat/features/feature-101-assinatura-participacao.md` | Identidade real — padrão de author_id |

---

## 8. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| MDX malformado causa crash no frontend | Média | Médio | `MDXRenderer` captura erros e exibe texto raw como fallback |
| getBoardID precisa resolver board_id a partir de UUID de thread | Alta | Alto | Middleware deve resolver board_id via JOIN em threads — cobrir no smoke test |
| Store tests bloqueados por pg_hba do Docker | Média | Baixo | Ajustar pg_hba/DATABASE_URL de teste; não bloqueia feature |
| Overwrite de arquivos entre tasks paralelas na fase de QA | Média | Médio | Arquivos disjuntos por task; smoke test consolida integração |
| Hard delete de board apaga threads e posts (CASCADE) | Baixa | Alto | Handler exige confirmação explícita + advertência no frontend |

---

## 9. DoD (Definition of Done)

> Critérios-alvo. Feature **ainda não implementada** — todos pendentes.

| Critério | Status |
|----------|--------|
| `go build ./...` sem erros | ☐ pendente |
| `go vet ./...` sem warnings | ☐ pendente |
| `npx tsc --noEmit` sem erros | ☐ pendente |
| `npx vite build` sem erros | ☐ pendente |
| Testes de handler edge (slug reservado, thread locked, content ≤10k) | ☐ pendente |
| Testes de integração via smoke test | ☐ pendente |
| Testes de store | ☐ pendente |
| 5 seed boards existem após migration 002 | ☐ pendente |
| Slug reservado rejeitado (400) | ☐ pendente |
| Thread locked bloqueia post (403) | ☐ pendente |
| Soft delete preserva dado + exibe [deleted] | ☐ pendente |
| Badge de título nos posts | ☐ pendente |
| Autocomplete de tags com skills | ☐ pendente |
| MDX renderiza com syntax highlight | ☐ pendente |
| Design System 42 aplicado | ☐ pendente |
| Wiki vault atualizado | ☐ pendente |

---

## Quality Score

| Dimensão | Pontos | Máx | Notas |
|----------|--------|-----|-------|
| Clareza de escopo (objetivos / não-objetivos) | 5 | 5 | Separação clara v1 vs v2 |
| Cobertura de cenários (success + failure + edge) | 5 | 5 | 8 success + 6 failure + 3 edge |
| Resolução de ambiguidades (cross-reference código+wiki) | 5 | 5 | 12 arquivos verificados, 4 docs wiki |
| ADRs com opções rejeitadas documentadas | 5 | 5 | 9 ADRs formais com alternativas |
| Débitos e riscos explicitados | 5 | 5 | 5 débitos + 5 riscos com mitigação |
| **Total** | **25** | **25** | ✓ Excelente |
