---
graph-operators: enabled
heartbeat-threshold: 4
max-rounds: 40
feature: 103-ms-graph-messaging
spec: specs/features/103-ms-graph-messaging/spec.md
plan: specs/features/103-ms-graph-messaging/plan.md
discovery: reports/103-ms-graph-messaging-discovery.md
---

# tasks.md: Feature 103 — Expansão de Mensageria

## Fase 0: Descoberta

- [x] **T001:** Mapear impactos do hub refactor em `internal/ws/hub.go` e `internal/ws/handler.go`
  - **Papel:** researcher
  - **agent:** researcher1
  - **depends_on:** []
  - **Paralelizável:** true
  - **Arquivos:** `internal/ws/hub.go`, `internal/ws/handler.go`
  - **Wiki-Keywords:** Hub, rooms, broadcast, goroutine, RWMutex, WebSocket

- [x] **T002:** Auditar feature 103 contra constitution.md; mapear fronteira entre hub global e rooms
  - **Papel:** analyst
  - **agent:** analyst1
  - **depends_on:** [T001]
  - **Paralelizável:** false
  - **Arquivos:** `.github/memory/constitution.md`, `reports/103-ms-graph-messaging-discovery.md`
  - **Wiki-Keywords:** constitution, soft-delete, UUIDv7, migrations, monolito

---

## Fase 1: Fundação

- [x] **T003:** Criar migration `003_chat_resources.sql` (chats, chat_members, ALTER messages + backfill + índices)
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T002]
  - **Paralelizável:** false
  - **Arquivos:** `internal/db/migrations/003_chat_resources.sql`
  - **Wiki-Keywords:** migration, UUIDv7, backfill, chat_id, GENERAL_UUID, soft-delete

- [x] **T004:** Criar Go models `Chat` e `ChatMember` em `internal/chat/model/`
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T003]
  - **Paralelizável:** false
  - **Arquivos:** `internal/chat/model/chat.go`
  - **Wiki-Keywords:** UUIDv7, Chat, ChatMember, role, oneOnOne, group

- [x] **T005:** Criar arquivos Gherkin de acceptance: `chat_lifecycle.feature`, `messaging.feature`, `typing_indicator.feature`, `emoticons.feature`
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T002]
  - **Paralelizável:** true
  - **Arquivos:** `specs/features/103-ms-graph-messaging/acceptance/chat_lifecycle.feature`, `specs/features/103-ms-graph-messaging/acceptance/messaging.feature`, `specs/features/103-ms-graph-messaging/acceptance/typing_indicator.feature`, `specs/features/103-ms-graph-messaging/acceptance/emoticons.feature`
  - **Wiki-Keywords:** Gherkin, BDD, godog, Scenario, Feature, typing-indicator, emoticons

---

## Fase 2: Backend — Stores

- [x] **T006:** Criar `internal/chat/store/chats.go` — CRUD chats + listar chats do usuário
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T004]
  - **Paralelizável:** true
  - **Arquivos:** `internal/chat/store/chats.go`
  - **Wiki-Keywords:** lib/pq, SQL, chat, CRUD, UUIDv7, oneOnOne, group

- [x] **T007:** Criar `internal/chat/store/members.go` — add/remove membro, get role
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T004]
  - **Paralelizável:** true
  - **Arquivos:** `internal/chat/store/members.go`
  - **Wiki-Keywords:** chat_members, role, owner, mod, member, UNIQUE-constraint

- [x] **T008:** Criar `internal/chat/store/messages.go` — list by chat_id (cursor), send, soft delete
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T004]
  - **Paralelizável:** true
  - **Arquivos:** `internal/chat/store/messages.go`
  - **Wiki-Keywords:** paginação, cursor, before, limit, soft-delete, deleted_at, chat_id

---

## Fase 3: Backend — Handlers + Hub

- [x] **T009:** Criar `internal/chat/handler/chats.go` — POST /api/chats, GET /api/chats, GET /api/chats/{id}
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T006, T007]
  - **Paralelizável:** false
  - **Arquivos:** `internal/chat/handler/chats.go`
  - **Wiki-Keywords:** Chi, handler, JWT, auth, oneOnOne, group, 201, 404, 409

- [x] **T010:** Criar `internal/chat/handler/messages.go` — GET/POST /api/chats/{id}/messages, DELETE /api/messages/{id}
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T008, T007]
  - **Paralelizável:** false
  - **Arquivos:** `internal/chat/handler/messages.go`
  - **Wiki-Keywords:** paginação, cursor, has_more, next_before, soft-delete, tombstone, mod

- [x] **T011:** Refatorar `internal/ws/hub.go` — adicionar rooms, `BroadcastToRoom`, manter backward compat
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T002]
  - **Paralelizável:** false
  - **Arquivos:** `internal/ws/hub.go`, `internal/ws/client.go`
  - **Wiki-Keywords:** Hub, rooms, map, RWMutex, BroadcastToRoom, GENERAL_UUID, race-condition

- [x] **T012:** Atualizar `internal/chat/handler.go` (ServeWS) — extrair `chat_id` da query string (sem `chat_id` → GENERAL_UUID); join/leave por room; `queries.SaveMessage`/`GetMessages` com `chat_id`
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T011]
  - **Paralelizável:** false
  - **Arquivos:** `internal/chat/handler.go`, `internal/db/queries/messages.go`
  - **Wiki-Keywords:** WebSocket, chat_id, query-param, backward-compat, GENERAL_UUID, JWT

- [x] **T013:** Criar `internal/chat/handler/members.go` + middleware `ChatMember`, `ChatModOnly` + rotas Chi `/api/chat`
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T009, T010]
  - **Paralelizável:** false
  - **Arquivos:** `internal/chat/handler/members.go`, `internal/chat/middleware/auth.go`, `internal/chat/routes/routes.go`
  - **Wiki-Keywords:** Chi, middleware, member, mod, auth, 403, subrouter

- [x] **T014:** Registrar subrouter `/api/chat` em `cmd/server/main.go`
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T013]
  - **Paralelizável:** false
  - **Arquivos:** `cmd/server/main.go`
  - **Wiki-Keywords:** Chi, router, mount, subrouter, main

---

## Fase 4: Frontend

- [x] **T015:** Criar `frontend/src/lib/emoticons.ts` — mapa de emoticons + função `parseEmoticons(text)`
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T002]
  - **Paralelizável:** true
  - **Arquivos:** `frontend/src/lib/emoticons.ts`
  - **Wiki-Keywords:** emoticons, regex, MSN, frontend-parsing, React

- [x] **T016:** Atualizar `frontend/src/stores/chatStore.ts` — suporte multi-chat, typing state, `activeChat`
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T014]
  - **Paralelizável:** false
  - **Arquivos:** `frontend/src/stores/chatStore.ts`
  - **Wiki-Keywords:** Zustand, chatStore, multi-chat, activeChat, typing, fetchHistory, dedup

- [x] **T017:** Criar `frontend/src/pages/chat/ChatList.tsx` — lista de chats do usuário (sidebar esquerda)
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T016]
  - **Paralelizável:** true
  - **Arquivos:** `frontend/src/pages/chat/ChatList.tsx`
  - **Wiki-Keywords:** React, Tailwind, sidebar, oneOnOne, group, general, DS42

- [x] **T018:** Atualizar `frontend/src/pages/chat/Chat.tsx` (ChatWindow) — typing indicator + emoticons + chat_id no WS
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T016, T015]
  - **Paralelizável:** true
  - **Arquivos:** `frontend/src/pages/chat/Chat.tsx`, `frontend/src/components/chat/TypingIndicator.tsx`
  - **Wiki-Keywords:** React, WebSocket, chat_id, TypingIndicator, debounce, emoticons, DS42

---

## Fase 5: Validação e Documentação

- [x] **T019:** Testes unitários Go: `go test -race ./internal/ws/...` + `go test ./internal/chat/...`
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T012, T013]
  - **Paralelizável:** true
  - **Arquivos:** `internal/ws/hub_test.go`, `internal/chat/store/chats_test.go`, `internal/chat/store/messages_test.go`
  - **Wiki-Keywords:** go-test, race-condition, httptest, godog, TDD, RED-GREEN

- [x] **T020:** Verificar regressão Feature 100/102: rodar `tests/forum_smoke_test.sh` + validar `/ws?token` sem chat_id
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T018, T019]
  - **Paralelizável:** true
  - **Arquivos:** `tests/forum_smoke_test.sh`
  - **Wiki-Keywords:** smoke-test, regressão, Feature-100, backward-compat, GENERAL_UUID

- [x] **T021:** Build final: `go build ./...`, `go vet ./...`, `cd frontend && npm run build`
  - **Papel:** executor
  - **agent:** Lead
  - **depends_on:** [T019, T020]
  - **Paralelizável:** false
  - **Arquivos:** `cmd/server/main.go`, `frontend/`
  - **Wiki-Keywords:** build, vet, npm-build, CI, portões-constituição

---

## Coordination Graph

G₀ (round 0):

- **nodes:** T001, T002, T003, T004, T005, T006, T007, T008, T009, T010, T011, T012, T013, T014, T015, T016, T017, T018, T019, T020, T021
- **edges:**
  - T001 → T002
  - T002 → T003
  - T002 → T005
  - T002 → T011
  - T002 → T015
  - T003 → T004
  - T004 → T006
  - T004 → T007
  - T004 → T008
  - T006 → T009
  - T007 → T009
  - T007 → T010
  - T008 → T010
  - T009 → T013
  - T010 → T013
  - T011 → T012
  - T012 → T013
  - T013 → T014
  - T014 → T016
  - T015 → T018
  - T016 → T017
  - T016 → T018
  - T012 → T019
  - T013 → T019
  - T018 → T020
  - T019 → T020
  - T019 → T021
  - T020 → T021
- **assignments:**
  - T001: researcher1
  - T002: analyst1
  - T003: executor1
  - T004: executor1
  - T005: executor2
  - T006: executor1
  - T007: executor2
  - T008: executor1
  - T009: executor1
  - T010: executor2
  - T011: executor1
  - T012: executor1
  - T013: executor2
  - T014: executor1
  - T015: executor2
  - T016: executor1
  - T017: executor2
  - T018: executor1
  - T019: executor1
  - T020: executor2
  - T021: Lead
- **ready:** [T001, T005]

### Caminho crítico

`T001 → T002 → T011 → T012 → T013 → T014 → T016 → T018 → T020 → T021`

10 rounds no caminho mais longo. Com parallelismo nas fases 2–3, estimado em 8–10 rounds totais.

### Janelas de paralelismo

| Janela | Tasks simultâneas |
|--------|------------------|
| Após T002 | T003 ‖ T005 ‖ T011 ‖ T015 |
| Após T004 | T006 ‖ T007 ‖ T008 |
| Após T013+T012 | T019 ‖ T017 (com T016) |
| Após T018+T019 | T020 |
