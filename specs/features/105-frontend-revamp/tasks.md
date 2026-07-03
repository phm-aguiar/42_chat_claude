---
graph-operators: enabled
heartbeat-threshold: 4
max-rounds: 40
feature: 105-frontend-revamp
spec: specs/features/105-frontend-revamp/spec.md
plan: specs/features/105-frontend-revamp/plan.md
---

# tasks.md: Feature 105 — Frontend Revamp

## Fase 0: Descoberta

- [ ] **T001:** Mapear router/App.tsx atual, inventário de estilos inline por tela, montagem de auth headers em forumApi/chatApi, e resolução de autor nos stores/handlers do fórum
  - **Papel:** researcher
  - **agent:** researcher1
  - **depends_on:** []
  - **Paralelizável:** true
  - **Arquivos:** `frontend/src/App.tsx`, `frontend/src/lib/forumApi.ts`, `frontend/src/lib/chatApi.ts`, `internal/forum/store/threads.go`, `internal/forum/store/posts.go`, `internal/forum/handler/`
  - **Wiki-Keywords:** router, inline-styles, auth-header, forum, autor, JOIN

- [ ] **T002:** Auditar plan 105 vs constitution; refinar contratos por executor (SQL do unread_count, assinatura NotifyUsers, mapa de rotas do router novo)
  - **Papel:** analyst
  - **agent:** analyst1
  - **depends_on:** [T001]
  - **Paralelizável:** false
  - **Arquivos:** `.github/memory/constitution.md`, `specs/features/105-frontend-revamp/plan.md`, `specs/tech-debt.md`
  - **Wiki-Keywords:** constitution, unread, NotifyUsers, route-guard, contratos

---

## Fase 1: Backend

- [ ] **T003:** Criar migration `004_chat_reads.sql` (tabela chat_reads, PK composta, FKs CASCADE, idempotente)
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T002]
  - **Paralelizável:** true
  - **Arquivos:** `internal/db/migrations/004_chat_reads.sql`
  - **Wiki-Keywords:** migration, chat_reads, last_read_at, idempotente

- [ ] **T004:** Criar `internal/chat/store/reads.go` — upsert leitura + unread_count por chat (general incluso, ignora deleted e mensagens próprias)
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T003]
  - **Paralelizável:** false
  - **Arquivos:** `internal/chat/store/reads.go`
  - **Wiki-Keywords:** unread, upsert, ON-CONFLICT, COALESCE, timestamptz

- [ ] **T005:** Hub — `usersIndex map[int]map[*Client]bool` + `NotifyUsers(userIDs, msg)` sob o mesmo mutex + testes `-race`
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T002]
  - **Paralelizável:** true
  - **Arquivos:** `internal/ws/hub.go`, `internal/ws/hub_test.go`
  - **Wiki-Keywords:** Hub, usersIndex, NotifyUsers, RWMutex, race-condition

- [ ] **T006:** Forum stores — JOIN users (author_login, author_image_url com COALESCE) em threads/posts + `ListRecent(limit)` cross-board
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T002]
  - **Paralelizável:** true
  - **Arquivos:** `internal/forum/store/threads.go`, `internal/forum/store/posts.go`, `internal/forum/model/thread.go`, `internal/forum/model/post.go`
  - **Wiki-Keywords:** JOIN, autor, COALESCE, ListRecent, cross-board

- [ ] **T007:** Forum handlers/rotas — `AuthRequired` nos GETs (ADR-105.4), campos de autor nos responses, rota `GET /api/forum/threads/recent`; atualizar `tests/forum_smoke_test.sh` (Bearer nos GETs + caso 401)
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T006]
  - **Paralelizável:** false
  - **Arquivos:** `internal/forum/handler/threads.go`, `internal/forum/handler/posts.go`, `internal/forum/handler/boards.go`, `internal/forum/routes/routes.go`, `tests/forum_smoke_test.sh`
  - **Wiki-Keywords:** AuthRequired, 401, smoke-test, recent-threads

- [ ] **T008:** Chat handlers — `POST /api/chats/{id}/read` (204), `unread_count` no `GET /api/chats`, emissão de `chat_activity` para membros fora da room (general excluído) nos caminhos WS e REST
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T004, T005]
  - **Paralelizável:** false
  - **Arquivos:** `internal/chat/handler/reads.go`, `internal/chat/handler/chats.go`, `internal/chat/handler/messages.go`, `internal/chat/routes/routes.go`, `internal/ws/client.go`
  - **Wiki-Keywords:** chat_activity, unread_count, mark-read, NotifyUsers, GENERAL_UUID

---

## Fase 2: Frontend — Fundação

- [ ] **T009:** Tokens no `tailwind.config.ts` (surface/text/accent/status, ADR-105.1) + `lib/http.ts` (fetch wrapper: Bearer + 401 → /login) + migrar forumApi/chatApi para o wrapper
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T002]
  - **Paralelizável:** true
  - **Arquivos:** `frontend/tailwind.config.ts`, `frontend/src/lib/http.ts`, `frontend/src/lib/forumApi.ts`, `frontend/src/lib/chatApi.ts`
  - **Wiki-Keywords:** tokens, Tailwind, fetch-wrapper, 401, interceptor

- [ ] **T010:** Componentes `frontend/src/components/ui/` — Button, Card, Input, Badge, EmptyState, Avatar (fallback iniciais), PageHeader — só tokens, zero hex solto, border-radius 0
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T009]
  - **Paralelizável:** false
  - **Arquivos:** `frontend/src/components/ui/Button.tsx`, `frontend/src/components/ui/Card.tsx`, `frontend/src/components/ui/Input.tsx`, `frontend/src/components/ui/Badge.tsx`, `frontend/src/components/ui/EmptyState.tsx`, `frontend/src/components/ui/Avatar.tsx`, `frontend/src/components/ui/PageHeader.tsx`
  - **Wiki-Keywords:** design-system, componentes, Avatar-fallback, contraste-AA, DS42

- [ ] **T011:** `RequireAuth` + reestruturação do router em `App.tsx` + `layouts/AppShell.tsx` (navegação lateral Hub/Chat/Fórum com badge agregado, header contextual único — DT-02)
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T010]
  - **Paralelizável:** false
  - **Arquivos:** `frontend/src/components/RequireAuth.tsx`, `frontend/src/layouts/AppShell.tsx`, `frontend/src/App.tsx`
  - **Wiki-Keywords:** route-guard, AppShell, Outlet, sidebar, header-contextual

---

## Fase 3: Páginas

- [ ] **T012:** `pages/Hub.tsx` — saudação (login/avatar/level), atalhos Chat/Fórum, threads recentes, online agora, chats recentes com badge; EmptyStates
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T011, T007]
  - **Paralelizável:** true
  - **Arquivos:** `frontend/src/pages/Hub.tsx`
  - **Wiki-Keywords:** hub, atividade, threads-recentes, online, EmptyState

- [ ] **T013:** Chat redesign — Chat.tsx + ChatList unificados no shell (DT-02), badges de não-lidas + mark-read ao abrir, evento `chat_activity` no hook, typing por identidade do JWT (DT-06), estados vazios
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T011, T008]
  - **Paralelizável:** true
  - **Arquivos:** `frontend/src/pages/Chat.tsx`, `frontend/src/pages/chat/ChatList.tsx`, `frontend/src/stores/chatStore.ts`, `frontend/src/hooks/useWebSocket.ts`, `frontend/src/components/chat/MessageList.tsx`, `frontend/src/components/chat/MessageInput.tsx`, `frontend/src/components/chat/TypingIndicator.tsx`, `frontend/src/components/chat/OnlineSidebar.tsx`
  - **Wiki-Keywords:** unread-badge, mark-read, chat_activity, typing, JWT-identity

- [ ] **T014:** Fórum redesign — ForumList/BoardView/ThreadView/NewThread no design system + autores reais com Avatar (DT-04)
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T011, T007]
  - **Paralelizável:** true
  - **Arquivos:** `frontend/src/pages/forum/ForumList.tsx`, `frontend/src/pages/forum/BoardView.tsx`, `frontend/src/pages/forum/ThreadView.tsx`, `frontend/src/pages/forum/NewThread.tsx`, `frontend/src/components/forum/BoardCard.tsx`, `frontend/src/components/forum/ThreadRow.tsx`, `frontend/src/components/forum/PostCard.tsx`, `frontend/src/stores/forumStore.ts`
  - **Wiki-Keywords:** forum, autor, Avatar, design-system, redesign

- [ ] **T015:** LoginPage/CallbackPage redesign + botão dev-login quando `VITE_DEV_MODE=true` + alinhar env com backend (DT-07)
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T011]
  - **Paralelizável:** true
  - **Arquivos:** `frontend/src/pages/LoginPage.tsx`, `frontend/src/pages/CallbackPage.tsx`, `.env.example`
  - **Wiki-Keywords:** login, OAuth2, dev-login, VITE_DEV_MODE

---

## Fase 4: Validação

- [ ] **T016:** Testes Go — `go test -race ./internal/ws/...` (usersIndex/NotifyUsers) + store live `reads_test.go` (upsert, unread com general e soft-deleted)
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T008]
  - **Paralelizável:** true
  - **Arquivos:** `internal/chat/store/reads_test.go`
  - **Wiki-Keywords:** go-test, race, live-DB, ensureTestUsers, unread

- [ ] **T017:** Regressão + acceptance — smoke fórum atualizado verde (12 casos), roteiro E2E manual do fluxo completo (login → hub → badge cross-room → fórum autenticado) em `acceptance/e2e-roteiro.md`, validação `docker compose down -v && up --build`
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T012, T013, T014, T015, T016]
  - **Paralelizável:** false
  - **Arquivos:** `tests/forum_smoke_test.sh`, `specs/features/105-frontend-revamp/acceptance/e2e-roteiro.md`
  - **Wiki-Keywords:** smoke-test, regressão, E2E, migration-limpa, badge

- [ ] **T018:** Build final: `go build ./...`, `go vet ./...`, `go test ./...`, `cd frontend && npm run build` + fechamento do tasks.md
  - **Papel:** executor
  - **agent:** Lead
  - **depends_on:** [T017]
  - **Paralelizável:** false
  - **Arquivos:** `cmd/server/main.go`, `frontend/`
  - **Wiki-Keywords:** build, vet, portões-constituição

---

## Coordination Graph

G₀ (round 0):

- **nodes:** T001..T018
- **edges:**
  - T001 → T002
  - T002 → T003, T002 → T005, T002 → T006, T002 → T009
  - T003 → T004
  - T004 → T008
  - T005 → T008
  - T006 → T007
  - T007 → T012, T007 → T014
  - T008 → T013, T008 → T016
  - T009 → T010
  - T010 → T011
  - T011 → T012, T011 → T013, T011 → T014, T011 → T015
  - T012 → T017, T013 → T017, T014 → T017, T015 → T017, T016 → T017
  - T017 → T018
- **assignments:** T001 researcher1 · T002 analyst1 · T003/T004/T006/T008/T011/T013/T015/T017 executor1 · T005/T007/T009/T010/T012/T014/T016 executor2 · T018 Lead
- **ready:** [T001]

### Caminho crítico

`T001 → T002 → T009 → T010 → T011 → T013 → T017 → T018` (8 rounds; T008 converge em T013)

### Janelas de paralelismo

| Janela | Tasks simultâneas (arquivos disjuntos) |
|--------|----------------------------------------|
| Após T002 | T003 ‖ T005 ‖ T006 ‖ T009 (janela ≤3: T009 na fila) |
| Meio | T004 ‖ T007 ‖ T010 |
| Após T011 | T012 ‖ T013 ‖ T014 ‖ T015 (janela ≤3) |
| Final | T016 → T017 → T018 |

### Validação do DAG

- Ciclos: nenhum (ordenação topológica válida)
- Dependências quebradas: nenhuma (todos os IDs existem)
- Órfãs: nenhuma (todas alcançáveis de T001 e todas alcançam T018)
- Conflitos de arquivo em janelas paralelas: nenhum (verificado por janela)
