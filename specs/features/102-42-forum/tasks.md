---
graph-operators: enabled
heartbeat-threshold: 4
max-rounds: 40
feature: 102-42-forum
spec: specs/features/102-42-forum/spec.md
plan: specs/features/102-42-forum/plan.md
discovery: reports/102-42-forum-discovery.md
status: pending
---

# tasks.md: Feature 102 — 42 Forum

> **Status:** planejado, ainda não implementado. 28 tasks prontas para execução LATTE.
> Nenhum arquivo de código do fórum existe ainda (`internal/forum/`, migration 002,
> `frontend/src/pages/forum/` a serem criados).

---

## Fase 0: Débito Técnico (Feature 101)

- [ ] **T028:** Corrigir DT-101.2 — remover avatar e login duplicados do `UserSignature.tsx`; manter apenas tier badge + contagem de mensagens
  - **Papel:** executor
  - **agent:** executor3
  - **depends_on:** []
  - **Paralelizável:** true
  - **Arquivos:** `frontend/src/components/chat/UserSignature.tsx`
  - **Wiki-Keywords:** UserSignature, DS42, tier-badge, layout, avatar-duplicado
  - **Contexto:** `MessageList.tsx` já exibe avatar e login no header de cada mensagem; `UserSignature` repete esses dados. Fix: remover `<img>` (avatar) e bloco de login do componente — manter só `<span>` do tier badge colorido e contagem `total_messages`. Ver DT-101.2 em `specs/features/101-assinatura-participacao/spec.md`.

---

## Fase 1: Fundação

- [ ] **T001:** Criar migration `002_add_forum.sql` — ALTER users (title, skills), tabelas boards/board_staff/threads/posts, índices GIN, seed 5 boards
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** []
  - **Paralelizável:** true
  - **Arquivos:** `internal/db/migrations/002_add_forum.sql`
  - **Wiki-Keywords:** migration, UUIDv7, soft-delete, GIN, bump-order, seed-boards, slugs-reservados

- [ ] **T002:** Criar Go models em `internal/forum/model/` — Board, Thread, Post, BoardStaff com UUIDv7
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** []
  - **Paralelizável:** true
  - **Arquivos:** `internal/forum/model/board.go`, `internal/forum/model/thread.go`, `internal/forum/model/post.go`, `internal/forum/model/board_staff.go`
  - **Wiki-Keywords:** UUIDv7, Go-struct, soft-delete, UUID-UnmarshalJSON, TEXT-array

- [ ] **T003:** Configurar Tailwind com Design System 42 (cores oficiais, Futura PT, border-radius:0)
  - **Papel:** executor
  - **agent:** executor3
  - **depends_on:** []
  - **Paralelizável:** true
  - **Arquivos:** `frontend/tailwind.config.ts`, `frontend/src/index.css`
  - **Wiki-Keywords:** DS42, design-system, Futura-PT, border-radius, Teal, Near-Black, Dark-Gray

---

## Fase 2: Store Layer

- [ ] **T004:** Criar `internal/forum/store/boards.go` — CRUD boards, validação slug, blacklist slugs reservados, SeedBoards
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T001, T002]
  - **Paralelizável:** true
  - **Arquivos:** `internal/forum/store/boards.go`
  - **Wiki-Keywords:** lib/pq, SQL, blacklist, slug-regex, seed-boards, board_staff

- [ ] **T005:** Criar `internal/forum/store/board_staff.go` — Add/Remove/GetRole
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T001, T002]
  - **Paralelizável:** true
  - **Arquivos:** `internal/forum/store/board_staff.go`
  - **Wiki-Keywords:** board_staff, role, owner, mod, admin, PK-composta

- [ ] **T006:** Criar `internal/forum/store/threads.go` — CRUD threads, bump order (`last_post_at`), GIN tags
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T001, T002]
  - **Paralelizável:** true
  - **Arquivos:** `internal/forum/store/threads.go`
  - **Wiki-Keywords:** bump-order, last_post_at, GIN, tags, soft-delete, is_pinned

- [ ] **T007:** Criar `internal/forum/store/posts.go` — CRUD posts, reply-to tree, soft delete
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T001, T002]
  - **Paralelizável:** true
  - **Arquivos:** `internal/forum/store/posts.go`
  - **Wiki-Keywords:** reply-to, soft-delete, deleted_at, post_count, bump

---

## Fase 3: Handlers + Middleware + Rotas

- [ ] **T008:** Criar `internal/forum/handler/boards.go` — POST/GET/PATCH/DELETE /api/forum/boards
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T004, T005]
  - **Paralelizável:** true
  - **Arquivos:** `internal/forum/handler/boards.go`
  - **Wiki-Keywords:** Chi, handler, JWT, slug-validation, 400, 403, 404, hard-delete-cascade

- [ ] **T009:** Criar `internal/forum/handler/threads.go` — POST/GET/PATCH/DELETE /api/forum/threads + /boards/{slug}/threads
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T006]
  - **Paralelizável:** true
  - **Arquivos:** `internal/forum/handler/threads.go`
  - **Wiki-Keywords:** Chi, handler, bump-order, is_pinned, is_locked, soft-delete, 201, 403

- [ ] **T010:** Criar `internal/forum/handler/posts.go` — POST /api/forum/threads/{id}/posts, DELETE /api/forum/posts/{id}
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T007]
  - **Paralelizável:** false
  - **Arquivos:** `internal/forum/handler/posts.go`
  - **Wiki-Keywords:** Chi, handler, reply-to, THREAD_LOCKED, soft-delete, 403, 201

- [ ] **T011:** Criar `internal/forum/middleware/auth.go` — AuthRequired, ModOnly, AdminOnly, BoardOwner; getBoardID resolve UUID de thread também
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T004, T005]
  - **Paralelizável:** true
  - **Arquivos:** `internal/forum/middleware/auth.go`
  - **Wiki-Keywords:** middleware, JWT, role, getBoardID, UUID-thread, 401, 403

- [ ] **T012:** Criar `internal/forum/routes/routes.go` + montar subrouter em `cmd/server/main.go` com JWT middleware em todas as rotas autenticadas
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T008, T009, T010, T011]
  - **Paralelizável:** false
  - **Arquivos:** `internal/forum/routes/routes.go`, `cmd/server/main.go`
  - **Wiki-Keywords:** Chi, subrouter, mount, JWT-middleware, RegisterForumRoutes

---

## Fase 4: Frontend

- [ ] **T013:** Criar `frontend/src/stores/forumStore.ts` — boards, threads, posts, fetchBoards, fetchThreads, createThread, clearError
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T012]
  - **Paralelizável:** true
  - **Arquivos:** `frontend/src/stores/forumStore.ts`, `frontend/src/lib/forumApi.ts`
  - **Wiki-Keywords:** Zustand, forumStore, forumApi, IDs-como-string, UUID, fetch

- [ ] **T014:** Criar `frontend/src/components/forum/MDXRenderer.tsx` e `MDXEditor.tsx` — renderização + editor com preview + toolbar
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T003]
  - **Paralelizável:** true
  - **Arquivos:** `frontend/src/components/forum/MDXRenderer.tsx`, `frontend/src/components/forum/MDXEditor.tsx`
  - **Wiki-Keywords:** MDX, react-markdown, remark-gfm, rehype-highlight, preview, toolbar, fallback

- [ ] **T015:** Criar `frontend/src/components/forum/PostCard.tsx` — avatar, login, badge de título, conteúdo MDX, reply-to
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T014]
  - **Paralelizável:** true
  - **Arquivos:** `frontend/src/components/forum/PostCard.tsx`
  - **Wiki-Keywords:** DS42, avatar-fallback, title-badge, reply-to, MDXRenderer

- [ ] **T016:** Criar `frontend/src/pages/forum/ForumList.tsx` e `BoardCard.tsx` — grid de boards, navegação para /forum/{slug}
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T013]
  - **Paralelizável:** true
  - **Arquivos:** `frontend/src/pages/forum/ForumList.tsx`, `frontend/src/components/forum/BoardCard.tsx`
  - **Wiki-Keywords:** DS42, React, forumStore, Tailwind, border-radius-0

- [ ] **T017:** Criar `frontend/src/pages/forum/BoardView.tsx` e `ThreadRow.tsx` — lista de threads em bump order
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T013]
  - **Paralelizável:** true
  - **Arquivos:** `frontend/src/pages/forum/BoardView.tsx`, `frontend/src/components/forum/ThreadRow.tsx`
  - **Wiki-Keywords:** DS42, bump-order, is_pinned, tags, forumStore

- [ ] **T018:** Criar `frontend/src/pages/forum/ThreadView.tsx` — OP + posts em árvore, error handling sem loop de renderização
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T015, T013]
  - **Paralelizável:** false
  - **Arquivos:** `frontend/src/pages/forum/ThreadView.tsx`
  - **Wiki-Keywords:** DS42, reply-to, error-boundary, post-tree, MDXRenderer

- [ ] **T019:** Criar `frontend/src/pages/forum/NewThread.tsx` e `TagInput.tsx` — formulário de criação com autocomplete de skills
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T014, T013]
  - **Paralelizável:** true
  - **Arquivos:** `frontend/src/pages/forum/NewThread.tsx`, `frontend/src/components/forum/TagInput.tsx`
  - **Wiki-Keywords:** MDXEditor, TagInput, autocomplete, skills, Zustand, forumStore

---

## Fase 5: Integração API 42 + Moderação

- [ ] **T020:** Atualizar `internal/auth/handler.go` — buscar `/v2/users/:id/titles` e `/v2/users/:id/tags_users` no OAuth2 callback; salvar em `users.title` e `users.skills`
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T001]
  - **Paralelizável:** false
  - **Arquivos:** `internal/auth/handler.go`, `internal/db/queries/users.go`
  - **Wiki-Keywords:** API-42, OAuth2, titles, tags_users, upsert, skills, title-badge

- [ ] **T021:** Criar `frontend/src/components/forum/ModControls.tsx` — Pin/Lock/Delete condicional por role (mod/owner/admin)
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T013]
  - **Paralelizável:** true
  - **Arquivos:** `frontend/src/components/forum/ModControls.tsx`
  - **Wiki-Keywords:** role, mod, owner, admin, PATCH, DELETE, forumStore, DS42

---

## Fase 6: QA

- [ ] **T022:** Rodar smoke test `tests/forum_smoke_test.sh` — 11 cenários via curl. Corrigir bugs encontrados: SeedBoards sem board_staff, getBoardID sem thread UUID, JWT middleware ausente nas rotas
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T012]
  - **Paralelizável:** false
  - **Arquivos:** `tests/forum_smoke_test.sh`, `internal/forum/store/boards.go`, `internal/forum/middleware/auth.go`, `internal/forum/routes/routes.go`, `cmd/server/main.go`
  - **Wiki-Keywords:** smoke-test, curl, regressão, board_staff, getBoardID, JWT-middleware

- [ ] **T023:** Testes unitários store: `go test ./internal/forum/...` — 24 testes (compilam; skip por pg_hba Docker)
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T004, T005, T006, T007]
  - **Paralelizável:** true
  - **Arquivos:** `internal/forum/store/boards_test.go`, `internal/forum/store/threads_test.go`, `internal/forum/store/posts_test.go`
  - **Wiki-Keywords:** go-test, lib/pq, SQL, pg_hba, Docker, DB-auth

- [ ] **T024:** Testes de borda handler: `go test ./internal/forum/handler/...` — slug reservado, thread locked, content ≤10k (11/11 PASS)
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T008, T009, T010]
  - **Paralelizável:** true
  - **Arquivos:** `tests/internal/forum/handler/forum_test.go`, `tests/internal/forum/handler/edge_test.go`
  - **Wiki-Keywords:** go-test, httptest, edge-case, slug-reservado, THREAD_LOCKED, content-limit

- [ ] **T025:** Escrever `specs/features/102-42-forum/acceptance/forum.feature` — 22 cenários BDD (Gherkin PT-BR)
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T022]
  - **Paralelizável:** true
  - **Arquivos:** `specs/features/102-42-forum/acceptance/forum.feature`
  - **Wiki-Keywords:** Gherkin, BDD, Scenario, Feature, godog, PT-BR

---

## Fase 7: Documentação

- [ ] **T026:** Atualizar vault wiki: criar `wiki-claude/projects/42_chat/features/feature-102-forum.md` com ADRs, schema, métricas LATTE
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T022, T023, T024]
  - **Paralelizável:** true
  - **Arquivos:** `wiki-claude/projects/42_chat/features/feature-102-forum.md`
  - **Wiki-Keywords:** vault, wiki, ADR, métricas-LATTE, UUIDv7, MDX, DS42

- [ ] **T027:** Registrar métricas de execução LATTE em `specs/features/102-42-forum/metrics.md`
  - **Papel:** Lead
  - **agent:** Lead
  - **depends_on:** [T026]
  - **Paralelizável:** false
  - **Arquivos:** `specs/features/102-42-forum/metrics.md`
  - **Wiki-Keywords:** LATTE, métricas, overwrites, wall-clock, batches, paralelismo

---

## Coordination Graph

G₀ (round 0):

- **nodes:** T001–T028
- **edges:**
  - T001 → T004, T005, T006, T007, T020
  - T002 → T004, T005, T006, T007
  - T003 → T014, T016
  - T004 → T008, T011
  - T005 → T008, T011
  - T006 → T009
  - T007 → T010
  - T008 → T012
  - T009 → T012
  - T010 → T012
  - T011 → T012
  - T012 → T013, T022
  - T013 → T015, T016, T017, T018, T019, T021
  - T014 → T015, T019
  - T015 → T018
  - T020 → T021
  - T022 → T025, T026
  - T004 → T023
  - T005 → T023
  - T006 → T023
  - T007 → T023
  - T008 → T024
  - T009 → T024
  - T010 → T024
  - T022 → T023
  - T023 → T026
  - T024 → T026
  - T026 → T027
- **assignments:**
  - T028: executor3
  - T001: executor1, T002: executor2, T003: executor3
  - T004: executor1, T005: executor2, T006: executor1, T007: executor2
  - T008: executor1, T009: executor2, T010: executor1, T011: executor2, T012: executor1
  - T013: executor1, T014: executor2, T015: executor1, T016: executor2
  - T017: executor1, T018: executor2, T019: executor1, T020: executor1, T021: executor2
  - T022: executor1, T023: executor2, T024: executor1, T025: executor2
  - T026: executor1, T027: Lead
- **ready:** [T001, T002, T003, T028] — frontier inicial (sem dependências)

### Caminho crítico

`T001 → T004 → T008 → T012 → T013 → T018 → T022 → T026 → T027`

9 rounds no caminho mais longo. Estimado com batches de 3∥ em paralelo em 7 fases.

### Janelas de paralelismo

| Janela | Tasks simultâneas |
|--------|------------------|
| Round 0 | T001 ‖ T002 ‖ T003 |
| Após T001+T002 | T004 ‖ T005 ‖ T006 ‖ T007 |
| Após T004+T005 | T008 ‖ T009 ‖ T011 |
| Após T012 | T013 ‖ T020 |
| Após T013 | T015 ‖ T016 ‖ T017 ‖ T019 ‖ T021 |
| Após T022 | T023 ‖ T024 ‖ T025 |
