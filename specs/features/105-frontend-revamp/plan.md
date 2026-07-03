# Plan: Feature 105 — Frontend Revamp

## Metadados

- **Feature:** 105-frontend-revamp
- **Spec:** `specs/features/105-frontend-revamp/spec.md` (Aprovado: true, 2026-07-03)
- **Data:** 2026-07-03
- **Status:** ready-for-tasks
- **Débitos:** DT-02..08 (`specs/tech-debt.md`)

---

## 1. Stack e Dependências

Sem novas libs. Tudo dentro do que constitution.md permite:

| Componente | Tecnologia | Notas |
|-----------|-----------|-------|
| Frontend | React 18, Vite, Tailwind, Zustand | Tokens no tailwind.config; componentes próprios |
| Backend | Go 1.25, Chi, gorilla/websocket, lib/pq | Migration 004 aditiva; hub estendido in-process |
| Banco | PostgreSQL 16 | Nova tabela `chat_reads` |
| Auth | JWT HS256 12h (herança) | Route guard + interceptor 401 no frontend |

---

## 2. ADRs Formalizadas

### ADR-105.1 — Design tokens Tailwind + componentes próprios

**Status:** accepted (escolha do product owner no brainstorm)

**Contexto:** estilos inline espalhados, contraste ruim (DT-03). Stack declara Shadcn/ui mas ele não é usado de fato.

**Opções:** A) tokens no `tailwind.config.ts` + ~7 componentes base próprios *(escolhida)*;
B) adotar shadcn/ui com tema custom; C) retoque mínimo de cores.

**Decisão:** A. Tokens semânticos (não hexes soltos):
```
surface: base #1B1B1B · panel #202026 · raised #29292E
text:    primary #F2F2F2 · secondary #A8A8B3 · muted #6E6E78 (AA sobre as superfícies acima)
accent:  teal #00BABC (ações/ativo) · navy #173D7A (institucional)
status:  error #EC3391 · success #2DD57A
```
Componentes em `frontend/src/components/ui/`: `Button`, `Card`, `Input`, `Badge`,
`EmptyState`, `Avatar` (fallback iniciais), `PageHeader`. `border-radius: 0` global.

**Consequências:** (+) zero deps novas, consistência via tokens; (−) sem acessibilidade
"de graça" de Radix — foco/aria manuais nos componentes base.

---

### ADR-105.2 — Rastreio de leitura em tabela `chat_reads` (migration 004)

**Status:** accepted

**Contexto:** badge de não lidas (DT-08) exige saber a última leitura por (user, chat).
O chat "general" tem membership implícita — não há linha em `chat_members` para todos.

**Opções:** A) coluna `last_read_at` em `chat_members` (não cobre general);
B) tabela dedicada `chat_reads` *(escolhida)*.

**Decisão:**
```sql
CREATE TABLE IF NOT EXISTS chat_reads (
    user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chat_id      UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, chat_id)
);
```
Upsert no `POST /api/chats/{id}/read` (`ON CONFLICT ... DO UPDATE`). `unread_count` =
`COUNT(*) FROM messages WHERE chat_id=$1 AND created_at > COALESCE(last_read_at, '-infinity') AND deleted_at IS NULL AND user_id != $me`.

**Consequências:** (+) cobre general sem linhas fantasma; sem ALTER em tabelas existentes;
(−) 1 JOIN/subquery a mais no `GET /api/chats`.

---

### ADR-105.3 — Notificação cross-room via índice de usuários no hub

**Status:** accepted

**Contexto:** conexão WS pertence a 1 room (ADR-103.1/5). Usuário no fórum ou no general
não recebe atividade dos seus 1:1/grupos (DT-08).

**Opções:** A) broadcast global de atividade (vaza metadados a não-membros); B) múltiplas
rooms por conexão (refactor grande do hub); C) índice `userID → conexões` + envio
direcionado *(escolhida)*.

**Decisão:** hub ganha `usersIndex map[int]map[*Client]bool` (mantido em register/unregister
sob o mesmo `h.mu`) e `NotifyUsers(userIDs []int, msg []byte)`. Após persistir mensagem em
um chat, o caminho de envio busca os membros (`GetChatMembers`) e chama
`NotifyUsers(membros, {"type":"chat_activity","chat_id":...})` — cada cliente ignora o
evento se já está naquela room. **O general não gera `chat_activity`** (anti-ruído: todos
são membros; badge do general só por unread count no fetch).

**Consequências:** (+) sem vazamento a não-membros, sem pub/sub externo, muda pouco o hub;
(−) 1 query de membros por mensagem em chat não-general (aceitável no volume 42SP);
`go test -race` deve cobrir o índice novo.

---

### ADR-105.4 — Auth obrigatória no fórum

**Status:** accepted (decisão de produto 2026-07-03: sem anonimato)

**Decisão:** GETs de `/api/forum/*` trocam o middleware opcional por `AuthRequired`.
`tests/forum_smoke_test.sh` atualizado para enviar Bearer nos GETs + caso novo: GET sem
token → 401. Reverte "Auth Opcional" do spec 102 (registrado lá como superseded).

**Consequências:** (+) política única de acesso; (−) quebra intencional de contrato para
clients não autenticados (não existem hoje além do navegador).

---

### ADR-105.5 — Autores do fórum via JOIN nos GETs

**Status:** accepted

**Contexto:** DT-04 — frontend exibe "unknown" porque os responses de threads/posts só
trazem `author_id`.

**Decisão:** stores do fórum fazem `JOIN users` e os GETs passam a incluir
`author_login`, `author_image_url` (com `COALESCE(image_url,'')`). Frontend usa os campos
novos; sem fetch por usuário (evita N+1).

---

### ADR-105.6 — Route guard central + interceptor 401

**Status:** accepted

**Decisão:** componente `RequireAuth` envolvendo as rotas autenticadas no router (todas,
exceto `/login` e `/auth/callback`) + wrapper de fetch único (`lib/http.ts`) que injeta o
Bearer e, em 401, limpa token e redireciona `/login`. `forumApi`/`chatApi` migram para o
wrapper (elimina headers manuais duplicados).

---

## 3. Contratos

### Alterados

- `GET /api/chats` → cada item ganha `"unread_count": int`
- GETs de threads/posts do fórum → itens ganham `"author_login"`, `"author_image_url"`
- GETs de `/api/forum/*` → exigem `Authorization: Bearer` (401 sem token)

### Novos

- `POST /api/chats/{id}/read` (member) → upsert `chat_reads`, retorna 204
- `GET /api/forum/threads/recent?limit=10` (auth) → threads mais recentes cross-board
  (título, board_slug, author_login, last_post_at) para o hub
- WS outbound: `{"type":"chat_activity","chat_id":"<uuid>"}` — só para membros online
  fora da room do chat; general excluído

### Rotas frontend

| Rota | Página | Guard |
|------|--------|-------|
| `/login`, `/auth/callback` | LoginPage / CallbackPage | público |
| `/` | Hub (novo) | RequireAuth |
| `/chat` | Chat (redesign) | RequireAuth |
| `/forum`, `/forum/{slug}`, `/forum/{slug}/thread/{id}`, `/forum/{slug}/new` | fórum (redesign) | RequireAuth |

---

## 4. Estrutura de Arquivos

```
frontend/src/
  layouts/AppShell.tsx          # navegação lateral + header contextual + <Outlet/>
  pages/Hub.tsx                 # hub pós-login (atividade)
  components/ui/                # Button, Card, Input, Badge, EmptyState, Avatar, PageHeader
  components/RequireAuth.tsx    # route guard
  lib/http.ts                   # fetch wrapper (Bearer + 401 → /login)
  tailwind.config.ts            # tokens (surface/text/accent/status)
internal/
  db/migrations/004_chat_reads.sql
  chat/store/reads.go           # upsert last_read, unread counts
  chat/handler/reads.go         # POST /api/chats/{id}/read
  ws/hub.go                     # usersIndex + NotifyUsers (+ hub_test.go race)
  forum/store/threads.go        # JOIN autor + ListRecent cross-board
  forum/store/posts.go          # JOIN autor
  forum/handler/*.go            # campos novos; rotas com AuthRequired
```

---

## 5. Auditoria de Constituição

| Regra | Veredito |
|-------|----------|
| Monolito único, sem microsserviços | PASS |
| Sem ORM (lib/pq puro) | PASS — SQL direto em reads.go/threads.go |
| Hub WS único, sem pub/sub externo | PASS — NotifyUsers é in-process (ADR-105.3) |
| Migrations aditivas, nunca alterar existentes | PASS — 004 só cria `chat_reads` |
| UUIDv7 / PKs de usuário INT | PASS — sem PKs novas geradas pela app |
| Soft delete | PASS — unread ignora `deleted_at IS NOT NULL` |
| IDs na API como string UUID | PASS |
| Credenciais via env | PASS — nenhuma nova |
| Portões de qualidade | PASS — smoke do fórum ATUALIZADO faz parte da feature (ADR-105.4) |

Quebra intencional (não-constitucional): auth obrigatória nos GETs do fórum — decisão de
produto registrada no spec 105 e refletida como superseded no spec 102.

---

## 6. Estratégia de Testes

| Camada | O que cobre |
|--------|-------------|
| `go test -race ./internal/ws/...` | usersIndex: register/unregister/NotifyUsers concorrentes |
| `go test ./internal/chat/store/` (live) | chat_reads upsert, unread_count (incl. general e soft-deleted) |
| `go test ./internal/forum/...` + smoke atualizado | 401 sem token; autores nos responses |
| `npm run build` | tipos/tokens |
| Auditoria manual de contraste | pares dos tokens (spec critério 6) |
| E2E manual roteirizado | fluxo login → hub → badge cross-room (critério 7) |

## 7. Riscos Residuais

| Risco | Mitigação |
|-------|-----------|
| unread_count deixar GET /api/chats lento | subquery indexada por `idx_messages_chat_time`; medir com EXPLAIN no live test |
| NotifyUsers sob carga (1 query membros/msg) | aceitável no volume 42SP; cache simples de membros se necessário (futuro) |
| Redesign quebrar fluxos da Feature 100/101 | smoke + roteiro E2E manual antes do close |
| Contraste "no olho" | tokens fixos auditados uma vez; proibido hex fora dos tokens |
