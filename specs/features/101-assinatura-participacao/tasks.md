---
graph-operators: enabled
heartbeat-threshold: 4
max-rounds: 40
feature: 101-assinatura-participacao
spec: specs/features/101-assinatura-participacao/spec.md
plan: specs/features/101-assinatura-participacao/plan.md
discovery: reports/101-assinatura-participacao-discovery.md
status: pending
---

# tasks.md: Feature 101 — Assinatura de Participação

> **Status:** planejado, ainda não implementado. Nenhum arquivo de código da
> assinatura existe (`internal/chat/stats.go`, `UserSignature.tsx`, etc a criar).
> Sem migration nova — reusa `messages` da migration 001.

---

## Fase 0: Descoberta

- [x] **T001:** Mapear pontos de extensão em `internal/ws/hub.go`, `internal/ws/client.go` e `internal/chat/handler.go` para o evento de stats
  - **Papel:** researcher
  - **agent:** researcher1
  - **depends_on:** []
  - **Paralelizável:** true
  - **Arquivos:** `internal/ws/hub.go`, `internal/ws/client.go`, `internal/chat/handler.go`
  - **Wiki-Keywords:** Hub, Broadcast, WebSocket, client, message-persist, handler

- [x] **T002:** Auditar feature 101 contra constitution.md; confirmar ausência de `room_id` e a estratégia de degradação (ADR-101.4)
  - **Papel:** analyst
  - **agent:** analyst1
  - **depends_on:** [T001]
  - **Paralelizável:** false
  - **Arquivos:** `.github/memory/constitution.md`, `reports/101-assinatura-participacao-discovery.md`
  - **Wiki-Keywords:** constitution, messages-schema, room_id, chat_id, active_rooms, Feature-103

---

## Fase 1: Backend — Stats

- [x] **T003:** Criar `internal/chat/stats.go` — query agregada em messages + cálculo de tier + degradação de active_rooms (ADR-101.4)
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T002]
  - **Paralelizável:** false
  - **Arquivos:** `internal/chat/stats.go`
  - **Wiki-Keywords:** lib/pq, COUNT, tier, active_rooms, deleted_at, SQL-agregado

- [x] **T004:** Adicionar handler `GET /api/users/{id}/stats` em `internal/chat/handler.go` — 200 com agregado, 404 para inexistente
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T003]
  - **Paralelizável:** false
  - **Arquivos:** `internal/chat/handler.go`
  - **Wiki-Keywords:** Chi, handler, JWT, 200, 404, USER_NOT_FOUND, tier_label

- [x] **T005:** Estender `internal/ws/hub.go` com `EmitStatsChanged(userID)` + debounce de 2s por usuário
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T002]
  - **Paralelizável:** true
  - **Arquivos:** `internal/ws/hub.go`
  - **Wiki-Keywords:** Hub, debounce, timer, user_stats_changed, RWMutex, race-condition

- [x] **T006:** Disparar `EmitStatsChanged` em `internal/ws/client.go` ao persistir mensagem
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T005]
  - **Paralelizável:** false
  - **Arquivos:** `internal/ws/client.go`
  - **Wiki-Keywords:** client, message-persist, EmitStatsChanged, WebSocket

---

## Fase 2: Frontend

- [x] **T007:** Criar `frontend/src/lib/tiers.ts` — mapa tier → label + cor DS42 e `frontend/src/lib/statsApi.ts` — GET /api/users/{id}/stats
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T002]
  - **Paralelizável:** true
  - **Arquivos:** `frontend/src/lib/tiers.ts`, `frontend/src/lib/statsApi.ts`
  - **Wiki-Keywords:** tier, novato, iniciante, participante, veterano, DS42, fetch

- [x] **T008:** Estender `frontend/src/stores/chatStore.ts` — cache de stats por user_id + invalidação
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T007]
  - **Paralelizável:** false
  - **Arquivos:** `frontend/src/stores/chatStore.ts`
  - **Wiki-Keywords:** Zustand, cache, user_id, invalidação, stats

- [x] **T009:** Criar `frontend/src/components/chat/UserSignature.tsx` — cartão inline (avatar, login, tier, total), altura fixa, placeholder novato
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T007]
  - **Paralelizável:** true
  - **Arquivos:** `frontend/src/components/chat/UserSignature.tsx`
  - **Wiki-Keywords:** DS42, avatar-fallback, tier-badge, layout-shift, border-radius-0, placeholder

- [x] **T010:** Montar `UserSignature` abaixo das mensagens em `frontend/src/components/chat/MessageList.tsx` (Chat.tsx delega via MessageList)
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T008, T009]
  - **Paralelizável:** false
  - **Arquivos:** `frontend/src/pages/Chat.tsx`
  - **Wiki-Keywords:** React, Chat, UserSignature, chatStore, mensagens

- [x] **T011:** Tratar `user_stats_changed` + re-fetch pós-reconexão em `frontend/src/hooks/useWebSocket.ts`
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T008]
  - **Paralelizável:** false
  - **Arquivos:** `frontend/src/hooks/useWebSocket.ts`
  - **Wiki-Keywords:** WebSocket, user_stats_changed, re-fetch, reconexão, invalidação

---

## Fase 3: Validação e Documentação

- [x] **T012:** Reescrever `acceptance/user-signature.feature` — id no path, active_rooms 0/1 pré-103 (alinhado ADR-101.4/101.5)
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T002]
  - **Paralelizável:** true
  - **Arquivos:** `specs/features/101-assinatura-participacao/acceptance/user-signature.feature`
  - **Wiki-Keywords:** Gherkin, BDD, godog, id-path, active_rooms, tier

- [x] **T013:** Testes Go: `go test -race ./internal/ws/...` (debounce) + `go test ./internal/chat/...` (stats, 404)
  - **Papel:** executor
  - **agent:** executor1
  - **depends_on:** [T004, T006]
  - **Paralelizável:** true
  - **Arquivos:** `internal/chat/stats_test.go`, `internal/ws/hub_test.go`
  - **Wiki-Keywords:** go-test, race-condition, httptest, debounce, tier, 404

- [x] **T014:** Build final: `go build ./...`, `go vet ./...`, `go test -race`, `tsc --noEmit`, `npm run build` — todos PASS
  - **Papel:** executor
  - **agent:** Lead
  - **depends_on:** [T010, T011, T013]
  - **Paralelizável:** false
  - **Arquivos:** `cmd/server/main.go`, `frontend/`
  - **Wiki-Keywords:** build, vet, npm-build, portões-constituição

- [x] **T015:** Atualizar vault wiki: `wiki-claude/projects/42_chat/features/feature-101-assinatura-participacao.md` refletindo o estado real
  - **Papel:** executor
  - **agent:** executor2
  - **depends_on:** [T014]
  - **Paralelizável:** false
  - **Arquivos:** `wiki-claude/projects/42_chat/features/feature-101-assinatura-participacao.md`
  - **Wiki-Keywords:** vault, wiki, ADR, tier, active_rooms, user_stats_changed

---

## Coordination Graph

G₀ (round 0):

- **nodes:** T001–T015
- **edges:**
  - T001 → T002
  - T002 → T003, T005, T007, T012
  - T003 → T004
  - T004 → T013
  - T005 → T006
  - T006 → T013
  - T007 → T008, T009
  - T008 → T010, T011
  - T009 → T010
  - T010 → T014
  - T011 → T014
  - T013 → T014
  - T014 → T015
- **assignments:**
  - T001: researcher1, T002: analyst1
  - T003: executor1, T004: executor1, T005: executor2, T006: executor2
  - T007: executor1, T008: executor1, T009: executor2, T010: executor2, T011: executor1
  - T012: executor2, T013: executor1, T014: Lead, T015: executor2
- **ready:** [T001]

### Caminho crítico

`T001 → T002 → T007 → T008 → T010 → T014 → T015`

7 rounds no caminho mais longo.

### Janelas de paralelismo

| Janela | Tasks simultâneas |
|--------|------------------|
| Após T002 | T003 ‖ T005 ‖ T007 ‖ T012 |
| Após T007 | T008 ‖ T009 |
| Após T004+T006 | T013 (com T010/T011 do frontend) |
