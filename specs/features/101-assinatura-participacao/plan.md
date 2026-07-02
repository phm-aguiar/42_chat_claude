# Plan: Feature 101 — Assinatura de Participação

## Metadados

- **Feature:** 101-assinatura-participacao
- **Spec:** `specs/features/101-assinatura-participacao/spec.md`
- **Discovery:** `reports/101-assinatura-participacao-discovery.md`
- **Data:** 2026-06-30
- **Status:** ready-for-tasks (não implementado)

---

## 1. Stack e Dependências

Sem novas libs. Tudo herdado da Feature 100:

| Componente | Tecnologia | Notas |
|-----------|-----------|-------|
| Backend | Go 1.25, Chi, gorilla/websocket, lib/pq | Herança Feature 100 |
| Banco | PostgreSQL 16 | **Sem migration nova** — só query agregada em `messages` |
| Frontend | React 18, Zustand, Tailwind | Herança Feature 100 |
| Testes | `go test` + godog (BDD) | Cenários do discovery |

---

## 2. ADRs Formalizadas

### ADR-101.1 — Stats on-demand via SQL agregado

**Status:** accepted

**Contexto:** Assinatura precisa de total de mensagens e tier por usuário.

**Opções:**
- A: `SELECT COUNT(*)` agregado em `messages` no momento do fetch *(escolhida)*
- B: Tabela `user_stats` materializada com dupla escrita
- C: Contador em `users` incrementado por trigger

**Decisão:** Opção A. Single source of truth = `messages`. Sem estado derivado.

**Consequências:**
- (+) Zero risco de inconsistência; nenhuma coluna/tabela nova
- (-) COUNT por fetch — trivial no volume atual; cache é v2 (DT-101.3)

---

### ADR-101.2 — Evento WS `user_stats_changed` + re-fetch

**Status:** accepted

**Contexto:** Atualização em tempo real da assinatura ao enviar mensagem.

**Decisão:** Ao persistir mensagem, o backend agenda emissão de `user_stats_changed`
(payload: `{ "type": "user_stats_changed", "user_id": <int> }`). O frontend, ao receber,
invalida o cache do autor e re-fetcha `GET /api/users/{id}/stats`.

**Consequências:**
- (+) Broadcast não acessa o banco — só sinaliza
- (+) Consistência garantida pelo re-fetch (ADR-101.1)
- (-) 1 request extra por transição — mitigado pelo debounce

---

### ADR-101.3 — Debounce de 2s por usuário

**Status:** accepted

**Contexto:** Flood dispararia rajada de eventos.

**Decisão:** Map em memória no hub agrupa por `user_id`; timer de 2s coalescente. Estado final
sempre correto (re-fetch pega o valor atual).

**Consequências:**
- (+) Sem rajada de re-fetch no frontend
- (-) Atraso ≤2s na atualização — aceitável

---

### ADR-101.4 — `active_rooms` degrada para 0/1 até a Feature 103

**Status:** accepted

**Contexto:** `messages` não tem `room_id`/`chat_id` na migration 001. Salas múltiplas nascem na 103.

**Decisão:** Pré-103, `active_rooms` = 1 se `total_messages > 0`, senão 0. Pós-103 (quando
`messages.chat_id` existir), a query vira `COUNT(DISTINCT chat_id)` sem mudar o contrato JSON.

**Consequências:**
- (+) 101 implementável antes da 103; contrato estável
- (-) Campo sempre 0/1 até a 103 (DT-101.1)

---

### ADR-101.5 — Endpoint chaveado por `id` numérico

**Status:** accepted

**Contexto:** `users.id` é INT (id da 42); acceptance misturava login e id no path.

**Decisão:** `GET /api/users/{id}/stats` usa `id` INT. Frontend já tem `user_id` de cada mensagem.

**Consequências:**
- (+) Consistente com PK; sem lookup login→id
- (-) Acceptance reescrito para usar id (task de BDD)

---

## 3. Contratos de API

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

**Erros:**
- `401` — sem JWT
- `404` — `id` não corresponde a nenhum usuário (`{ "error": "usuário não encontrado", "code": "USER_NOT_FOUND" }`)

**Query interna (pré-103):**
```sql
SELECT
  COUNT(*)                                        AS total_messages,
  CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END        AS active_rooms
FROM messages
WHERE user_id = $1 AND deleted_at IS NULL;
```

**Query interna (pós-103, quando existir messages.chat_id):**
```sql
SELECT
  COUNT(*)                        AS total_messages,
  COUNT(DISTINCT chat_id)         AS active_rooms
FROM messages
WHERE user_id = $1 AND deleted_at IS NULL;
```

### Cálculo de tier

| tier | total_messages | tier_label |
|------|----------------|-----------|
| 0 | 0 | novato |
| 1 | 1–50 | iniciante |
| 2 | 51–200 | participante |
| 3 | 201+ | veterano |

---

## 4. Contrato WebSocket

**Outbound (server → clients), na sala general:**
```json
{ "type": "user_stats_changed", "user_id": 42 }
```

- Emitido após persistir uma mensagem, respeitando debounce de 2s por `user_id`.
- Broadcast global (só há a sala "general" pré-103).
- Frontend: ao receber, invalida cache do `user_id` e re-fetcha stats.

---

## 5. Estrutura de Arquivos

```
internal/
  chat/
    handler.go          # + handler GET /api/users/{id}/stats
    stats.go            # (novo) query agregada + cálculo de tier
  ws/
    hub.go              # + EmitStatsChanged(userID) com debounce
    client.go           # dispara EmitStatsChanged ao persistir mensagem

frontend/src/
  components/chat/
    UserSignature.tsx   # (novo) cartão inline: avatar, login, tier, total
  lib/
    tiers.ts            # (novo) mapa tier → label + cor DS42
    statsApi.ts         # (novo) GET /api/users/{id}/stats
  stores/
    chatStore.ts        # + cache de stats por user_id + invalidação
  hooks/
    useWebSocket.ts     # + tratamento de user_stats_changed + re-fetch pós-reconexão

specs/features/101-assinatura-participacao/
  acceptance/
    user-signature.feature   # reescrito: id no path, active_rooms 0/1 pré-103
```

---

## 6. Estratégia de Testes

### Por task (TDD)

RED → GREEN → REFACTOR por task de implementação.

### Camadas

| Camada | Ferramenta | O que cobre |
|--------|-----------|-------------|
| Unit (stats) | `go test` | cálculo de tier, query agregada, degradação de active_rooms |
| Unit (hub) | `go test -race` | debounce de EmitStatsChanged sob concorrência |
| Integration (handler) | `go test` + httptest | 200 com agregado correto, 404 |
| BDD (acceptance) | godog | cenários do discovery (id no path) |
| Frontend | tsc + build | UserSignature sem layout shift |

---

## 7. Riscos Residuais

| Risco | Mitigação |
|-------|-----------|
| `active_rooms` confunde retornando sempre 1 | Documentado (DT-101.1); UI pode ocultar até a 103 |
| Evento no caminho quente do hub | Payload só com user_id; sem query no broadcast |
| Layout shift no chat | Altura fixa no cartão (RNF-03) |
| Rajada de re-fetch com muitos autores | Debounce 2s + cache por user_id |
