---
feature_id: 103
slug: ms-graph-messaging
status: accepted
approved: true
author: phm-aguiar
date: 2026-06-30
previous_feature: 100-42chat-core
discovery_report: "reports/103-ms-graph-messaging-discovery.md"
---

# Spec: Expansão de Mensageria (MS Graph Inspired) — Feature 103

## Metadados

- **ID:** 103
- **Status:** accepted
- **Aprovado:** true
- **Autor:** phm-aguiar
- **Data:** 2026-06-30
- **Feature Anterior:** 100-42chat-core
- **Discovery Report:** `reports/103-ms-graph-messaging-discovery.md`

---

## Propósito

O MVP (Feature 100) entrega uma sala única "general" com broadcast global. Para comunicação
organizada — pair programming, grupos de estudo, suporte entre pares — os alunos precisam de
conversas direcionadas: 1:1 e grupos menores.

A Feature 103 transforma o chat de uma sala global em um sistema de recursos `chat` tipados
(`oneOnOne`, `group`, `general`), com endpoints REST inspirados no MS Graph, hub WS roteado
por `chat_id`, typing indicator efêmero e emoticons textuais renderizados no frontend.

A mudança-delta sobre a Feature 100 é: **uma conversa passa a ser um recurso `chat` com
tipo, membros e histórico próprios, sem quebrar o comportamento atual da sala `general`.**

---

## Escopo

### Dentro do escopo

- Recurso `chat` com tipos `oneOnOne`, `group`, `general` — tabela `chats`
- Gerenciamento de membros — tabela `chat_members` com roles `owner`, `mod`, `member`
- Migration 003 com backfill: mensagens existentes → chat "general"
- Hub WS roteado por `chat_id` (rooms); `/ws?token` sem chat_id → "general" implícito
- Endpoints REST: `/api/chats`, `/api/chats/{id}/messages`, `/api/chats/{id}/members`
- Paginação de histórico por cursor (`before=<RFC3339>`)
- Typing indicator via evento WS efêmero (não persistido, TTL 5s)
- Emoticons `(L)` e `:-)` renderizados como imagem — parsing no frontend
- Soft delete de mensagens por mod/admin com tombstone visível

### Fora do escopo (explicitamente)

- Canais/Teams estilo MS Graph — fora do domínio chat
- Chamadas de voz/vídeo — requer stack de mídia não contemplada
- `body_html` persistido no banco — parsing no frontend é suficiente
- `reply_to_id` (threading de respostas) — Feature 105+
- Attachments/upload de arquivos — Feature futura
- Winks animados — tecnologia legada incompatível com Vite/React
- Nudge (tremor CSS) — nice-to-have, não bloqueia MVP

---

## Comportamento Esperado

### Cenário Principal: Criar e usar conversa 1:1

1. Aluno acessa lista de chats — vê "general" + suas conversas 1:1 e grupos
2. Clica em "Nova conversa" → escolhe outro aluno → `POST /api/chats`
3. Backend cria chat `oneOnOne`, insere ambos como membros, retorna recurso
4. Aluno conecta WS com `?chat_id=<id>` → entra na room específica
5. Envia mensagem → broadcast apenas para membros do chat
6. Histórico paginável: scroll para cima carrega página anterior via `?before=<cursor>`

### Cenários Alternativos

- **Grupo:** `POST /api/chats` com `type: "group"` e lista de membros → mesmo fluxo
- **Sala general:** `/ws?token` sem chat_id → join na room "general" (backward compat Feature 100)
- **Typing:** keystroke → frontend emite `{"type":"typing"}` via WS → destinatário exibe por 5s

### Edge Cases (cobertos por Gherkin no discovery)

- Não-membro tentando acessar chat privado → 403
- Criar 1:1 com usuário inexistente → 404
- Backfill migration 003 em banco com dados existentes
- 300 usuários no "general" — broadcast < 50ms

---

## Constraints

- **Stack:** Go 1.25 + Chi + `lib/pq` + PostgreSQL 16 + React 18 + Vite + Tailwind + Zustand
- **Sem ORM:** apenas `lib/pq` com SQL direto (constitution.md)
- **Sem serviços externos:** proibido Redis, Kafka, microsserviço
- **UUID:** `uuid.NewV7()` para `chats.id` e `chat_members` PKs. Nunca v4, nunca serial
- **Migrations:** nova `003_chat_resources.sql` — proibido alterar 001/002
- **Backward compat WS:** `/ws?token=<jwt>` continua funcional após o refactor do hub
- **Soft delete obrigatório:** `deleted_at = NOW()` em mensagens — nunca hard delete
- **Performance:** histórico < 200ms p95; broadcast < 50ms para 300 clientes

---

## Critérios de Sucesso

| # | Critério | Como testar |
|---|----------|-------------|
| 1 | Migration 003 roda em banco limpo | `docker compose down -v && up` — startup sem erro |
| 2 | Backfill preserva mensagens existentes | Contar mensagens antes/depois — mesmo total |
| 3 | `/ws?token` sem chat_id → "general" funcional | Testar Feature 100 frontend sem alteração |
| 4 | Criar chat 1:1 e grupo | POST /api/chats → 201 |
| 5 | Broadcast isolado por chat | 2 chats abertos → mensagem não vaza entre eles |
| 6 | Não-membro recebe 403 | GET /api/chats/{id}/messages com token não-membro |
| 7 | Soft delete: mensagem some da lista mas existe no banco | SELECT com e sem `WHERE deleted_at IS NULL` |
| 8 | Typing indicator aparece e expira | Digitar → aguardar 5s → indicador some |
| 9 | Emoticons renderizados | Enviar `(L)` → ver imagem de coração |
| 10 | Build e testes passam | `go build ./...`, `go vet ./...`, `go test ./...`, `npm run build` |

---

## Modelagem de Dados (Migration 003)

### chats

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID PK (UUIDv7) | Identificador do chat |
| type | ENUM('oneOnOne','group','general') | Tipo do chat |
| topic | TEXT | Nome/assunto (opcional) |
| created_by | INT FK → users.id | Criador |
| created_at | TIMESTAMPTZ | — |

### chat_members

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| chat_id | UUID FK → chats.id | — |
| user_id | INT FK → users.id | — |
| role | ENUM('owner','mod','member') | Permissão no chat |
| joined_at | TIMESTAMPTZ | — |

PK composta: `(chat_id, user_id)`. UNIQUE constraint previne duplicatas.

### messages (ALTER na 003)

Adicionar: `chat_id UUID NOT NULL REFERENCES chats(id)`

Backfill: `UPDATE messages SET chat_id = '<general-uuid>'` — todas as mensagens existentes
recebem o chat_id do "general" criado pelo seed da migration 003.

---

## API REST

| Método | Rota | Auth | Comportamento |
|--------|------|------|---------------|
| POST | `/api/chats` | User | Cria chat oneOnOne ou group |
| GET | `/api/chats` | User | Lista chats do usuário autenticado |
| GET | `/api/chats/{id}` | Member | Detalhe + lista de membros |
| POST | `/api/chats/{id}/members` | Owner/Mod | Adiciona membro |
| DELETE | `/api/chats/{id}/members/{user_id}` | Owner/Mod | Remove membro |
| GET | `/api/chats/{id}/messages` | Member | Lista paginada (`?before=<RFC3339>&limit=50`) |
| POST | `/api/chats/{id}/messages` | Member | Envia mensagem (REST) |
| DELETE | `/api/messages/{id}` | Mod/Admin | Soft delete |

WebSocket: `/ws?token=<jwt>` (join general implícito) ou `/ws?token=<jwt>&chat_id=<id>` (room específica).

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Backend | Go 1.25, Chi, gorilla/websocket, lib/pq |
| Banco | PostgreSQL 16 — migrations 001+002+003 |
| Auth | JWT HS256 12h (herança Feature 100) |
| Frontend | React 18, Vite, Tailwind, Zustand |
| Testes | go test + godog (BDD), playwright (E2E opcional) |

---

## Dependências

- **100-42chat-core:** hub WS, auth JWT, sala "general" migrada para recurso `chat`
- **101-assinatura:** nenhuma modificação — pode consumir `messages.created_at` opcionalmente
- **102-forum:** nenhuma modificação no schema do fórum

---

## Checklist de Prontidão

- [x] Propósito e problema claramente definidos
- [x] Escopo dentro/fora explicitado
- [x] Cenários cobrem happy path, falha e edge cases (ver discovery)
- [x] Constraints herdadas de constitution.md
- [x] Modelagem de dados com backfill documentada
- [x] API REST com auth por endpoint
- [x] Critérios de sucesso mensuráveis
- [x] Discovery report com Gherkin completo e ADRs
