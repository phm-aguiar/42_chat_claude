# Plan: Feature 103 — Expansão de Mensageria

## Metadados

- **Feature:** 103-ms-graph-messaging
- **Spec:** `specs/features/103-ms-graph-messaging/spec.md`
- **Discovery:** `reports/103-ms-graph-messaging-discovery.md`
- **Data:** 2026-06-30
- **Status:** ready-for-tasks

---

## 1. Stack e Dependências

Sem novas libs. Tudo dentro do que constitution.md permite:

| Componente | Tecnologia | Notas |
|-----------|-----------|-------|
| Backend | Go 1.25, Chi, gorilla/websocket, lib/pq | Herança Feature 100 |
| Banco | PostgreSQL 16 | Migration 003 acrescenta 2 tabelas + ALTER messages |
| UUID | `google/uuid` (v7) | `uuid.NewV7()` para chat.id |
| Frontend | React 18, Zustand, Tailwind | Herança Feature 100 |
| Testes | `go test`, godog | BDD para acceptance tests |

---

## 2. ADRs Formalizadas

### ADR-103.1 — Hub WS roteado por chat_id (rooms)

**Status:** accepted

**Contexto:** Hub atual (`internal/ws/hub.go`) mantém `clients map[*Client]bool` — broadcast global
para todos os conectados. Feature 103 exige que mensagens de um chat não vazem para outros chats.

**Opções:**
- A: `rooms map[string]map[*Client]bool` no hub — cada chat_id é uma room *(escolhida)*
- B: Hub global + filtro no client — todos recebem tudo, client descarta
- C: Instância separada de Hub por chat — overhead de goroutines

**Decisão:** Opção A. O campo `rooms` usa o chat_id como chave. O método `BroadcastToRoom(chatID string, msg []byte)` substitui `Broadcast` para mensagens de chat. `Broadcast` global continua existindo apenas para `system:shutdown`.

**Backward compat:** cliente que conecta via `/ws?token=<jwt>` sem `chat_id` → registrado na room `GENERAL_CHAT_ID` (constante definida na migration 003). Nenhuma mudança no frontend da Feature 100.

**Consequências:**
- (+) Isolamento de broadcast por conversa
- (+) `ClientCount()` pode ser por room ou global
- (-) Hub refactor toca código core — cobrir com `go test -race ./internal/ws/...`

---

### ADR-103.2 — Migration 003 com backfill

**Status:** accepted

**Contexto:** tabela `messages` da migration 001 não tem `chat_id`. Adicionar `NOT NULL` exige backfill.

**Estratégia:**

```sql
-- 1. Criar chats e chat_members antes do ALTER
-- 2. Inserir chat "general" com UUID fixo
-- 3. ALTER TABLE messages ADD COLUMN chat_id UUID
-- 4. UPDATE messages SET chat_id = '<GENERAL_UUID>' WHERE chat_id IS NULL
-- 5. ALTER TABLE messages ALTER COLUMN chat_id SET NOT NULL
-- 6. ADD FOREIGN KEY
```

**Por que UUID fixo:** evita JOIN na migration; o seed UUID do "general" é uma constante
documentada. Qualquer recriação do banco produz o mesmo UUID.

**Consequências:**
- (+) Dados existentes preservados — zero perda
- (+) Migration idempotente (IF NOT EXISTS em todas as DDLs)
- (-) Backfill pode ser lento em banco com muitas mensagens — aceitável no contexto local

---

### ADR-103.3 — Emoticons parsing no frontend

**Status:** accepted

**Contexto:** spec original previa `body_html TEXT` no banco com parsing backend via regex.

**Decisão:** parsing client-side em componente React (`lib/emoticons.ts`). Mapa fixo:
`{ '(L)': '❤️', ':-)': '😊', ':)': '😊', ':(': '😞' }`.

**Por que não backend:**
- Elimina coluna `body_html` da migration 003 — schema mais simples
- Sem risco de XSS na geração de HTML no servidor
- Frontend já recebe `content` como texto puro — pode render como quiser

**Consequências:**
- (+) Migration 003 sem `body_html TEXT` — 2 colunas a menos
- (+) Sem sanitização HTML no backend
- (-) Renderização varia por cliente (aceitável — todos são o mesmo React app)

---

### ADR-103.4 — Typing indicator efêmero (sem persistência)

**Status:** accepted

**Contexto:** typing indicator é UX de tempo real — não faz sentido persistir.

**Protocolo:**
- Frontend: debounce de 1s antes de emitir `{"type":"typing","chat_id":"<id>"}` via WS
- Backend hub: recebe o evento e faz `BroadcastToRoom(chatID, typingPayload)` sem persistir
- Frontend destinatário: exibe `"@login está digitando..."` e reinicia timer de 5s a cada evento recebido; quando timer expira, esconde

**Consequências:**
- (+) Zero linhas inseridas no banco por typing events
- (+) Sem acúmulo de dados efêmeros
- (-) Se WS cair, indicador some imediatamente (comportamento esperado)

---

### ADR-103.5 — WS URL backward compatible

**Status:** accepted

**Contexto:** spec original propunha nova rota `/ws/chats/{id}?token=<jwt>` — quebraria Feature 100.

**Decisão:** manter `/ws?token=<jwt>`. Adicionar query param opcional `chat_id`:
- `/ws?token=<jwt>` → join room "general" (Feature 100 compat)
- `/ws?token=<jwt>&chat_id=<id>` → join room específica

O handler extrai `chat_id` da query; se ausente, usa `GENERAL_CHAT_ID`.

**Consequências:**
- (+) Frontend Feature 100 não precisa de mudança
- (+) Rota única `/ws` — sem proliferação de endpoints WS
- (-) Query param menos "RESTful" que path param — aceitável para WS

---

## 3. Contratos de API

### POST /api/chats

**Request:**
```json
{
  "type": "oneOnOne | group",
  "topic": "string (opcional)",
  "members": [2, 3, 4]
}
```

**Response 201:**
```json
{
  "id": "uuid-v7",
  "type": "group",
  "topic": "ft_printf",
  "created_by": 1,
  "created_at": "2026-06-30T...",
  "members": [
    {"user_id": 1, "role": "owner"},
    {"user_id": 2, "role": "member"}
  ]
}
```

**Erros:**
- `400` — type inválido ou members vazio
- `404` — user_id em members não encontrado
- `409` — chat oneOnOne já existe entre os mesmos dois usuários

---

### GET /api/chats/{id}/messages

**Query params:** `?before=<RFC3339>&limit=50` (limit max 100)

**Response 200:**
```json
{
  "messages": [
    {
      "id": "uuid-v7",
      "chat_id": "uuid-v7",
      "user_id": 42,
      "login": "marvin",
      "image_url": "https://...",
      "content": "oi (L)",
      "created_at": "2026-06-30T..."
    }
  ],
  "has_more": true,
  "next_before": "2026-06-30T12:00:00Z"
}
```

Mensagens com `deleted_at != NULL` retornam como tombstone:
```json
{"id": "...", "content": "[mensagem removida]", "deleted_at": "2026-06-30T..."}
```

---

### Contratos WebSocket

**Inbound (client → server):**
```json
{"type": "message", "content": "texto ≤ 5000 chars", "chat_id": "uuid"}
{"type": "typing", "chat_id": "uuid"}
```

**Outbound (server → room members):**
```json
{"type": "message", "id": "uuid", "chat_id": "uuid", "user_id": 42, "login": "marvin", "content": "...", "created_at": "..."}
{"type": "typing", "login": "marvin", "chat_id": "uuid"}
{"type": "system", "content": "joined|left|shutdown", "login": "marvin", "chat_id": "uuid"}
```

---

## 4. Estratégia de Migração

### Migration 003 — Ordem de operações

```sql
-- Fase 1: novas tabelas (independentes)
CREATE TABLE chats ...
CREATE TABLE chat_members ...

-- Fase 2: seed do chat "general"
INSERT INTO chats (id, type, topic, created_by) VALUES ('<GENERAL_UUID>', 'general', 'general', 0)

-- Fase 3: alterar messages (em 3 passos para ser seguro)
ALTER TABLE messages ADD COLUMN chat_id UUID;
UPDATE messages SET chat_id = '<GENERAL_UUID>';
ALTER TABLE messages ALTER COLUMN chat_id SET NOT NULL;
ALTER TABLE messages ADD CONSTRAINT fk_messages_chat FOREIGN KEY (chat_id) REFERENCES chats(id);

-- Fase 4: índices
CREATE INDEX idx_messages_chat_time ON messages(chat_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_chat_members_user ON chat_members(user_id);
```

**GENERAL_UUID:** `'00000000-0000-7000-8000-000000000001'` — UUID v7 com timestamp zero, reservado.

### Validação pré-migração

Antes de aplicar em qualquer banco com dados reais:
```bash
# 1. Contar mensagens antes
psql -c "SELECT COUNT(*) FROM messages"
# 2. Aplicar migration
# 3. Verificar backfill
psql -c "SELECT COUNT(*) FROM messages WHERE chat_id IS NOT NULL"
# 4. Counts devem ser iguais
```

---

## 5. Estrutura de Arquivos Novos

```
internal/
  chat/
    model/
      chat.go          # structs Chat, ChatMember
    store/
      chats.go         # CRUD chats + list for user
      members.go       # add/remove member, get role
      messages.go      # list by chat_id (paginação), send, soft delete
    handler/
      chats.go         # POST /api/chats, GET /api/chats, GET /api/chats/{id}
      messages.go      # GET/POST /api/chats/{id}/messages, DELETE /api/messages/{id}
      members.go       # POST/DELETE /api/chats/{id}/members/{user_id}
    middleware/
      auth.go          # ChatMember, ChatModOnly
    routes/
      routes.go        # Chi subrouter /api/chat
internal/
  ws/
    hub.go             # + rooms map[string]map[*Client]bool + BroadcastToRoom
    handler.go         # extrai chat_id de query param
internal/
  db/
    migrations/
      003_chat_resources.sql

frontend/src/
  stores/
    chatStore.ts       # + multi-chat support, typing state
  pages/chat/
    ChatList.tsx       # lista de chats do usuário
    ChatWindow.tsx     # janela de conversa (atualizada)
  components/chat/
    TypingIndicator.tsx
  lib/
    emoticons.ts       # mapa de emoticons + função parseEmoticons()
specs/features/103-ms-graph-messaging/
  acceptance/
    chat_lifecycle.feature
    messaging.feature
    typing_indicator.feature
    emoticons.feature
```

---

## 6. Estratégia de Testes

### TDD por task

Cada task de implementação (executor) segue RED → GREEN → REFACTOR:
1. **RED:** escreve o teste que falha (ou o Gherkin step) — commit `test: ...`
2. **GREEN:** código mínimo para passar — commit `feat: ...`
3. **REFACTOR:** limpa, extrai helpers — commit `refactor: ...`

### Camadas de teste

| Camada | Ferramenta | O que cobre |
|--------|-----------|-------------|
| Unit (store) | `go test` | SQL queries, validações de input |
| Unit (hub) | `go test -race` | rooms, broadcast, register/unregister concorrente |
| Integration (handler) | `go test` com `httptest` | endpoints completos com banco real |
| BDD (acceptance) | godog | cenários Gherkin do discovery |
| Build | `go build ./...`, `npm run build` | compilação sem erro |
| Smoke | `tests/forum_smoke_test.sh` | regressão Feature 102 |

---

## 7. Riscos Residuais

| Risco | Mitigação no plano |
|-------|-------------------|
| Hub refactor → race condition | `go test -race` obrigatório na task T011 |
| Migration 003 falha com dados | Validação pré-migração documentada acima |
| Frontend Feature 100 quebra | ADR-103.5 garante `/ws?token` sem change |
| Typing indicator spam | Debounce 1s na task T013 do frontend |
