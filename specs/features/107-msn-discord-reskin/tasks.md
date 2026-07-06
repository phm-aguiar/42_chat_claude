---
graph-operators: enabled
heartbeat-threshold: 4
max-rounds: 40
feature: 107-msn-discord-reskin
spec: specs/features/107-msn-discord-reskin/spec.md
plan: specs/features/107-msn-discord-reskin/plan.md
---

# tasks.md: Feature 107 — Reskin MSN/Discord + Presença e Cutucar

## Fase 1: Fundação (paralela — backend × frontend disjuntos)

- [x] **T101:** Migration 005 (`users.status`, `messages.kind`) + stores: `UpdateUserStatus`, `GetUserStatuses(ids)`, `SaveMessage`/GETs propagam `kind`
  - **Papel:** executor · **agent:** executor1 · **depends_on:** [] · **Paralelizável:** true
  - **Arquivos:** `internal/db/migrations/005_presence_nudge.sql`, `internal/db/queries/users.go`, `internal/db/queries/*message*`, `internal/chat/store/messages.go`, `internal/chat/model/*`
- [x] **T102:** Tokens v2 no `tailwind.config.ts` (ADR-107.1) + `index.css` (remove radius-0 global, `.bg-gradient-accent`, body novo) + Google Fonts no `index.html` + sed `accent-teal→accent-primary`, `accent-navy→accent-secondary`, `42-black/42-white→tokens` + remoção dos blocos legados `42-*`/`ft.*`
  - **Papel:** executor · **agent:** executor2 · **depends_on:** [] · **Paralelizável:** true
  - **Arquivos:** `frontend/tailwind.config.ts`, `frontend/src/index.css`, `frontend/index.html`, todos os `.tsx` com classes legadas (mecânico)

## Fase 2: Presença e Cutucar (backend)

- [ ] **T103:** Hub/WS — evento `presence` (1ª/última conexão, efetiva conforme ADR-107.2), `OnlineUserIDs()`, typing relay (ADR-107.3), nudge inbound com cooldown 10s + persistência kind='nudge' (ADR-107.4); `go test -race ./internal/ws/`
  - **Papel:** executor · **agent:** executor1 · **depends_on:** [T101] · **Paralelizável:** false (dono de internal/ws)
  - **Arquivos:** `internal/ws/hub.go`, `internal/ws/client.go`, `internal/ws/hub_test.go`
- [ ] **T104:** REST presença — `PATCH /api/users/me/status` (+ broadcast presence), `GET /api/users/presence` (snapshot); `GET /api/chats` com `peer` (ADR-107.5)
  - **Papel:** executor · **agent:** executor2 · **depends_on:** [T101, T103] · **Paralelizável:** true
  - **Arquivos:** `internal/users/` (novo handler/rotas) ou `internal/chat/handler/`, `cmd/server/main.go`, `internal/chat/store/chats.go`, `internal/chat/model/*`

## Fase 3: Componentes e Shell

- [x] **T105:** ui/ v2 (Button gradiente/radius, Avatar circular + `StatusDot` novo, Badge, Card, Input, EmptyState, PageHeader) + AppShell v2 (title bar + rail 72px, ADR-107.6) + `AuthUser.current_host?`
  - **Papel:** executor · **agent:** executor3 · **depends_on:** [T102] · **Paralelizável:** true
  - **Arquivos:** `frontend/src/components/ui/*`, `frontend/src/layouts/AppShell.tsx`, `frontend/src/lib/auth.ts`

## Fase 4: Telas

- [ ] **T106:** Chat = mockup (sidebar 288 com busca/cartão próprio/menu status/grupos por presença; bolhas; header com cutucar; barra emoticons; "> send") + `useWebSocket` (presence/typing real/nudge+shake) + `chatStore` (presenceByUser, setOwnStatus→PATCH, peer)
  - **Papel:** executor · **agent:** executor1 · **depends_on:** [T103, T104, T105] · **Paralelizável:** true
  - **Arquivos:** `frontend/src/pages/Chat.tsx`, `frontend/src/pages/chat/ChatList.tsx`, `frontend/src/components/chat/*`, `frontend/src/stores/chatStore.ts`, `frontend/src/hooks/useWebSocket.ts`, `frontend/src/lib/chatApi.ts`
- [ ] **T107:** Hub + Login/Callback no reskin (radius, gradiente, labels mono)
  - **Papel:** executor · **agent:** executor2 · **depends_on:** [T105] · **Paralelizável:** true
  - **Arquivos:** `frontend/src/pages/Hub.tsx`, `frontend/src/pages/LoginPage.tsx`, `frontend/src/pages/CallbackPage.tsx`
- [ ] **T108:** Fórum no reskin (radius/gradiente/mono; classes legadas já migradas no T102 — aqui é polish visual)
  - **Papel:** executor · **agent:** executor3 · **depends_on:** [T105] · **Paralelizável:** true
  - **Arquivos:** `frontend/src/pages/forum/*`, `frontend/src/components/forum/*`

## Fase 5: Validação

- [ ] **T109:** Testes Go live — status upsert/efetiva, nudge (persistência kind, cooldown), peer no ListUserChats; `-race` no ws
  - **Papel:** executor · **agent:** executor2 · **depends_on:** [T103, T104] · **Paralelizável:** true
  - **Arquivos:** `internal/chat/store/*_test.go`, `internal/ws/hub_test.go`
- [ ] **T110:** Fechamento (Lead): portões completos, smoke 12/12, rebuild nginx (`docker compose up --build -d`) com bundle novo (inclui fix Tailwind v4 + .env), verificação visual dos critérios 1–8, CLAUDE.md (tabela features + seção design), fechamento tasks.md
  - **Papel:** Lead · **depends_on:** [T106, T107, T108, T109] · **Paralelizável:** false
