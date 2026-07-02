---
title: "Feature 101 — Assinatura de Participação"
category: feature
tags: ["42-chat", "backend", "feature", "frontend", "methodology"]
sources:
  - specs/features/101-assinatura-participacao/spec.md
  - specs/features/101-assinatura-participacao/plan.md
  - specs/features/101-assinatura-participacao/tasks.md
  - reports/101-assinatura-participacao-discovery.md
created: "2026-06-18T04:00:00Z"
rag_score: 0.4836
updated: "2026-06-30"
summary: >-
  Componente UserSignature inline abaixo de mensagens exibindo stats de engajamento
  (total de mensagens, salas ativas, tier de participação), alimentado por API on-demand
  + WebSocket push com debounce. Tiers: novato (0) → iniciante (1-50) → participante (51-200) → veterano (201+).
  Implementado com stats agregados via SQL, sem tabela materializada.
provenance:
  extracted: 0.9
  inferred: 0.1
  ambiguous: 0.0
base_confidence: 0.95
lifecycle: implemented
lifecycle_changed: 2026-06-30
tier: core
---

# Feature 101 — Assinatura de Participação

## Visão Geral

Componente `UserSignature` reutilizável exibido inline abaixo de cada mensagem no chat,
mostrando avatar, login, tier de participação e total de mensagens. O campo `active_rooms`
retorna 1 se o usuário tem ≥1 mensagem, senão 0 — até a [[Feature 103]] adicionar salas
múltiplas (campo então refletirá `COUNT(DISTINCT chat_id)`). Stats são computados via query
agregada em tempo real e atualizam via WebSocket com debounce de 2s.

## Artefatos SDD

- `specs/features/101-assinatura-participacao/spec.md` (Spec)
- `specs/features/101-assinatura-participacao/plan.md` (Plan)
- `specs/features/101-assinatura-participacao/tasks.md` (Tasks)

## Arquitetura

### Stack

- **Backend:** Go 1.25 + Chi router, `internal/chat/stats.go` (query agregada + cálculo de tier), `internal/chat/handler.go` (endpoint REST)
- **WebSocket:** Hub com `EmitStatsChanged(userID)` e debounce de 2s em memória
- **Frontend:** React 18 + TypeScript, `UserSignature.tsx` (cartão), `useWebSocket.ts` (event handler), `chatStore.ts` (cache)
- **Testes:** Unit (Go), integration (httptest), BDD com godog

### Tiers de Participação

| Tier | Total Mensagens | Label | Numerador |
|------|-----------------|-------|-----------|
| novato | 0 | novato | 0 |
| iniciante | 1–50 | iniciante | 1 |
| participante | 51–200 | participante | 2 |
| veterano | 201+ | veterano | 3 |

## Endpoints

### GET /api/users/{id}/stats

**Auth:** JWT (qualquer usuário autenticado)

**Response 200:**
```json
{
  "user_id": 42,
  "login": "marvin",
  "image_url": "https://cdn.intra.42.fr/users/marvin.jpg",
  "total_messages": 55,
  "active_rooms": 1,
  "tier": 2,
  "tier_label": "participante",
  "member_since": "2026-06-14T10:00:00Z"
}
```

**Response 404:** `id` não corresponde a nenhum usuário
```json
{ "error": "usuário não encontrado", "code": "USER_NOT_FOUND" }
```

**Nota:** `active_rooms` retorna 0 ou 1 até a [[Feature 103]] adicionar multiplas salas. Após a Feature 103, será `COUNT(DISTINCT chat_id)` sem mudança no contrato JSON.

## Evento WebSocket

**Outbound (server → clients):**
```json
{
  "type": "user_stats_changed",
  "user_id": 42
}
```

Emitido após persistir mensagem, respeitando debounce de 2s por `user_id`. O frontend, ao receber,
invalida o cache local do autor e re-fetcha `GET /api/users/{id}/stats` para atualizar a assinatura.

## Arquivos Principais

| Arquivo | Função |
|---------|--------|
| `internal/chat/stats.go` | Query SQL agregada + `calcTier()`, `GetUserStats()` |
| `internal/chat/handler.go` | Handler `GET /api/users/{id}/stats` |
| `internal/ws/hub.go` | `EmitStatsChanged(userID)` com debounce 2s em memória |
| `internal/ws/client.go` | Dispara `EmitStatsChanged()` ao persistir mensagem |
| `frontend/src/components/chat/UserSignature.tsx` | Cartão inline: avatar, login, tier, total (altura fixa 64px) |
| `frontend/src/lib/tiers.ts` | TIER_MAP, `getTier()` |
| `frontend/src/lib/statsApi.ts` | `fetchUserStats(id)` |
| `frontend/src/stores/chatStore.ts` | `statsCache`, `fetchStats()`, `invalidateStats()` |
| `frontend/src/hooks/useWebSocket.ts` | Handler de `user_stats_changed`, re-fetch pós-reconexão |
| `frontend/src/components/chat/MessageList.tsx` | Montagem do UserSignature abaixo de cada mensagem |
| `internal/chat/stats_test.go` | Unit: table-driven de `calcTier()` |
| `internal/ws/hub_test.go` | Unit: debounce com `-race` |
| `specs/features/101-assinatura-participacao/acceptance/user-signature.feature` | 20 cenários BDD (id no path) |

## Status

✅ Implementado — Todos os builds passam:
- `go build ./...` ✓
- `go vet ./...` ✓
- `go test -race ./internal/chat ./internal/ws` ✓
- `tsc --noEmit` (frontend) ✓
- `npm run build` (frontend) ✓
- Acceptance BDD: 20 cenários passando

## ADRs (Architectural Decision Records)

### ADR-101.1 — Stats on-demand via SQL agregado (sem tabela materializada)

**Contexto:** Stats de participação (total, tier) precisam estar sempre consistentes com as mensagens reais.

**Decisão:** Computar via `SELECT COUNT(*)` agregado em `messages` quando o endpoint é chamado, sem tabela `user_stats` materializada. Single source of truth = tabela `messages`.

**Consequências:**
- (+) Zero risco de inconsistência — dado reflete a realidade sempre
- (+) Nenhuma coluna/tabela nova
- (-) Cada fetch faz COUNT — aceitável no MVP; cache é v2 (DT-101.3)

---

### ADR-101.2 — Atualização via evento WS `user_stats_changed` + re-fetch

**Contexto:** Assinatura deve atualizar em tempo real quando o autor envia mensagem.

**Decisão:** Hub emite evento `user_stats_changed` contendo apenas o `user_id`. Frontend invalida cache e re-fetcha `GET /api/users/{id}/stats`. Mantém o hub simples (sem query no broadcast).

**Consequências:**
- (+) Broadcast não acessa o banco — só sinaliza
- (+) Re-fetch garante consistência com ADR-101.1
- (-) 1 request extra por transição — mitigado pelo debounce (ADR-101.3)

---

### ADR-101.3 — Debounce de 2s no backend contra flood

**Contexto:** Um usuário em flood dispararia rajadas de eventos.

**Decisão:** Backend agrupa eventos de stats por `user_id` com debounce de 2s. No máximo 1 evento a cada 2s por usuário, implementado via map em memória no hub com timer coalescente.

**Consequências:**
- (+) Evita rajada de re-fetches no frontend
- (-) Atraso máximo de 2s na atualização visual — aceitável para UX de reputação

---

### ADR-101.4 — `active_rooms` degrada para 0/1 até a Feature 103

**Contexto:** A migration 001 não tem coluna `room_id`/`chat_id` em `messages` — existe apenas a sala "general". O conceito de múltiplas salas só nasce na [[Feature 103]].

**Decisão:** Enquanto `messages` não tiver `chat_id`, `active_rooms` retorna 1 para quem tem ≥1 mensagem e 0 para quem tem 0. Após Feature 103 adicionar `chat_id`, a query vira `COUNT(DISTINCT chat_id)` sem mudança de contrato.

**Consequências:**
- (+) Feature 101 implementável antes da 103 sem inventar coluna
- (+) Contrato do endpoint permanece estável — só a query interna muda
- (-) Campo sempre 0 ou 1 até Feature 103 (documentado como DT-101.1)

---

### ADR-101.5 — Chave do endpoint é o `id` numérico da 42, não login

**Contexto:** `users.id` é INT (id da 42 intra); login é VARCHAR UNIQUE. A 42 intra dá sempre um id numérico.

**Decisão:** O path usa `GET /api/users/{id}/stats` com id INT. Login não é chave de rota. Frontend já tem `user_id` de cada mensagem (`messages.user_id`), então não precisa resolver login→id.

**Consequências:**
- (+) Consistente com PK INT da tabela users
- (+) Sem lookup login→id no caminho quente
- (-) Acceptance BDD usa id no path (não login)

---

## Débitos Técnicos

| ID | Descrição | Impacto | Mitigação |
|----|-----------|---------|-----------|
| DT-101.1 | `active_rooms` limitado a 0/1 até Feature 103 adicionar `chat_id` | Médio | ADR-101.4 — degrada graciosamente; campo vira real na Feature 103 |
| DT-101.2 | Acceptance histórico usava login no path — reescrito para id (ADR-101.5) | Baixo | Feito na task de BDD |
| DT-101.3 | COUNT por fetch pode virar gargalo com volume alto | Baixo | v2 — cache curto ou materialização incremental |
| DT-101.4 | Debounce de stats é estado em memória — perdido em restart do hub | Baixo | Aceitável; estado se reconstrói no próximo evento |

---

## Relacionado

- [[Feature 100]] — 42 Chat Core. Dependência: tabela `messages`, WebSocket hub, JWT middleware.
- [[Feature 102]] — Fórum. Consome UserSignature para exibir autor de posts.
- [[Feature 103]] — Chats tipados. Quando adicionar `messages.chat_id`, ativa `active_rooms` real.
- [[journal/2026-06-17-brainstorm-feature-101]] — Sessão de brainstorm
