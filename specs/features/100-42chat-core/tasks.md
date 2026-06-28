---
feature: 100
graph-operators: enabled
max-rounds: 40
heartbeat-threshold: 4
---

# Tasks: 42 Chat Core MVP (Feature 100)

> DAG de execução LATTE. 18 tasks atômicas em 7 blocos.
> Sliding window máx 3 workers simultâneos.
> Todas as tasks tocam arquivos disjuntos dentro de cada camada paralela.

---

## Bloco A — Infraestrutura Base

### T001 — Inicializar módulo Go e skeleton do servidor
- **Papel:** executor
- **Dependências:** Nenhuma
- **Paralelizável:** Sim
- **Arquivos:**
  - `go.mod`
  - `go.sum`
  - `cmd/server/main.go`
- **Critério DONE:** `go build ./...` exit 0; `grep "^module" go.mod` retorna path do módulo; `grep "^go 1.25" go.mod` retorna linha; `cmd/server/main.go` contém `func main()` lendo `PORT` de `os.Getenv` e subindo servidor HTTP básico na porta.

---

### T002 — Migration 001 e pool lib/pq
- **Papel:** executor
- **Dependências:** T001
- **Paralelizável:** Sim
- **Arquivos:**
  - `internal/db/migrations/001_init.sql`
  - `internal/db/db.go`
- **Critério DONE:** `go build ./...` exit 0; `internal/db/migrations/001_init.sql` contém DDL de `users` e `messages` conforme Seção 2.3 do plan.md (incluindo `deleted_at TIMESTAMP` e índice `idx_messages_created`); `internal/db/db.go` exporta `Connect() *sql.DB` com `SetMaxOpenConns(90)` e `SetMaxIdleConns(10)` e runner automático de migrations em `internal/db/migrations/*.sql`.

---

### T003 — Docker Compose + Nginx + .env.example
- **Papel:** executor
- **Dependências:** Nenhuma
- **Paralelizável:** Sim
- **Arquivos:**
  - `docker-compose.yml`
  - `nginx/nginx.conf`
  - `.env.example`
- **Critério DONE:** `docker compose config` exit 0; `grep "shared_buffers=256MB" docker-compose.yml` retorna linha (ADR-007 tuning via `command:`); `grep "proxy_pass\|upgrade" nginx/nginx.conf` retorna linhas para `/ws` com `upgrade`; `.env.example` contém todas as 17 variáveis da Seção 2.5 do plan.md sem valores de produção reais.

---

## Bloco B — Autenticação

### T004 — JWT: geração, validação e Claims struct
- **Papel:** executor
- **Dependências:** T001
- **Paralelizável:** Sim
- **Arquivos:**
  - `internal/auth/jwt.go`
- **Critério DONE:** `go build ./internal/auth/...` exit 0; `internal/auth/jwt.go` exporta `type Claims struct { UserID int; Login string }`, `GenerateJWT(userID int, login string) (string, error)` (HS256, 12h, lê `JWT_SECRET` de env), `ParseJWT(tokenString string) (*Claims, error)`; `grep -n "change-me\|secret.*=.*\"" internal/auth/jwt.go` retorna vazio.

---

### T005 — OAuth2 handler + UpsertUser + GetUserByID
- **Papel:** executor
- **Dependências:** T002, T004
- **Paralelizável:** Sim
- **Arquivos:**
  - `internal/auth/handler.go`
  - `internal/db/queries/users.go`
- **Critério DONE:** `go build ./...` exit 0; `internal/auth/handler.go` exporta `Handler` struct com métodos `Callback(w, r)` (OAuth2 `/v2/me` → UpsertUser → GenerateJWT → JSON response `{"token": "..."}`) e `DevLogin(w, r)` (guard `DEV_MODE=true`); `internal/db/queries/users.go` exporta `UpsertUser(db *sql.DB, u User) error` e `GetUserByID(db *sql.DB, id int) (User, error)` usando SQL direto lib/pq; `grep "gorm\|sqlx\|ent\." internal/db/queries/users.go` retorna vazio.

---

### T006 — JWTMiddleware + GetClaims + rotas de auth em main.go
- **Papel:** executor
- **Dependências:** T004, T005
- **Paralelizável:** Sim
- **Arquivos:**
  - `internal/auth/middleware.go`
  - `cmd/server/main.go`
- **Critério DONE:** `go build ./...` exit 0; `internal/auth/middleware.go` exporta `JWTMiddleware() func(http.Handler) http.Handler` e `GetClaims(ctx context.Context) *Claims`; `cmd/server/main.go` monta `GET /api/auth/42/callback` e `GET /api/auth/dev/login` no Chi router; `DEV_MODE=true go run ./cmd/server/main.go &` + `curl -s "http://localhost:8080/api/auth/dev/login?login=marvin" | grep token` retorna campo `token` não vazio.

---

## Bloco C — Backend Core

### T007 — WebSocket Hub (hub.go)
- **Papel:** executor
- **Dependências:** T001
- **Paralelizável:** Sim
- **Arquivos:**
  - `internal/ws/hub.go`
- **Critério DONE:** `go build ./internal/ws/...` exit 0; `internal/ws/hub.go` exporta `type Hub struct` com campos `clients map[*Client]bool`, `mu sync.RWMutex`, `register chan *Client`, `unregister chan *Client`, `broadcast chan []byte`; exporta `NewHub() *Hub`, `Run(ctx context.Context)` (goroutine central com select), `Broadcast(msg []byte)` (itera clientes com RLock, desconecta client se canal cheio), `Shutdown()` (broadcast `{"type":"system","content":"shutdown"}` + sleep 500ms), `ClientCount() int` (retorna `len(h.clients)` com RLock — necessário para T016).

---

### T008 — WebSocket Client (client.go + rate limiter ADR-008)
- **Papel:** executor
- **Dependências:** T007
- **Paralelizável:** Sim
- **Arquivos:**
  - `internal/ws/client.go`
- **Critério DONE:** `go build ./internal/ws/...` exit 0; `internal/ws/client.go` exporta `type Client struct` com `hub *Hub`, `conn *websocket.Conn`, `send chan []byte` (buffer 256), `limiter *rate.Limiter`, `violations int`; exporta `readPump(ctx context.Context)` com maxMessageSize=6144, pongWait=60s, verificação `limiter.Allow()` (violations counter, desconexão em violations>=3) e `writePump()` com writeWait=10s, pingPeriod=30s; `grep "golang.org/x/time/rate" internal/ws/client.go` retorna linha de import.

---

### T009 — Persistência de mensagens (messages.go)
- **Papel:** executor
- **Dependências:** T002
- **Paralelizável:** Sim
- **Arquivos:**
  - `internal/db/queries/messages.go`
- **Critério DONE:** `go build ./internal/db/...` exit 0; `internal/db/queries/messages.go` exporta `SaveMessage(db *sql.DB, userID int, content string) (Message, error)` (INSERT retorna id UUID como string), `GetMessages(db *sql.DB, before time.Time, limit int) ([]Message, error)` (cursor pagination: `WHERE created_at < $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $2`), `SoftDeleteMessage(db *sql.DB, id string, userID int) error` (`UPDATE messages SET deleted_at = NOW()`); `grep "DELETE FROM messages" internal/db/queries/messages.go` retorna vazio.

---

### T010 — Chat handler REST + wiring completo de main.go
- **Papel:** executor
- **Dependências:** T006, T007, T008, T009
- **Paralelizável:** Sim
- **Arquivos:**
  - `internal/chat/handler.go`
  - `cmd/server/main.go`
- **Critério DONE:** `go build ./...` exit 0; `go vet ./...` exit 0; `internal/chat/handler.go` exporta `Handler` struct implementando `GET /api/messages` (campo `id` como string UUID, limit default=50 max=100), `GET /api/users/{id}`, `GET /ws` (upgrade gorilla/websocket, token em `?token=<jwt>`, CheckOrigin via `WS_ALLOWED_ORIGINS` ADR-004, eventos `join`/`leave`), `GET /metrics` (stub básico — expandido em T016); `cmd/server/main.go` monta todos os endpoints com `JWTMiddleware` nas rotas protegidas.

---

## Bloco D — Frontend

### T011 — Projeto React base: Vite + Tailwind + DS42
- **Papel:** executor
- **Dependências:** Nenhuma
- **Paralelizável:** Sim
- **Arquivos:**
  - `frontend/package.json`
  - `frontend/vite.config.ts`
  - `frontend/tailwind.config.ts`
  - `frontend/index.css`
  - `frontend/index.html`
  - `frontend/src/main.tsx`
  - `frontend/src/App.tsx`
  - `frontend/components.json`
- **Critério DONE:** `cd frontend && npm run build` exit 0; `grep "borderRadius" frontend/tailwind.config.ts` mostra `DEFAULT: '0'` e `none: '0'`; `grep "Futura PT" frontend/index.css` retorna linha de import; `grep "radial-gradient" frontend/index.css` retorna linha do dot grid; `grep "rounded-" frontend/src/App.tsx frontend/src/main.tsx` retorna vazio.

---

### T012 — chatStore Zustand + lib/api.ts
- **Papel:** executor
- **Dependências:** T011
- **Paralelizável:** Sim
- **Arquivos:**
  - `frontend/src/stores/chatStore.ts`
  - `frontend/src/lib/api.ts`
- **Critério DONE:** `cd frontend && npm run build` exit 0; `frontend/src/stores/chatStore.ts` exporta store Zustand com estado `messages: Message[]`, `status: 'idle'|'connecting'|'connected'|'error'`, `error: string|null`, actions `addMessage`, `setMessages`, `setStatus`, `setError`, `fetchHistory`; `frontend/src/lib/api.ts` usa `fetch` nativo exportando `getMessages(before?: string, limit?: number)` e `getUserById(id: number)`; `grep "axios\|jQuery" frontend/src/stores/chatStore.ts frontend/src/lib/api.ts` retorna vazio.

---

### T013 — Componentes UI de chat
- **Papel:** executor
- **Dependências:** T012
- **Paralelizável:** Sim
- **Arquivos:**
  - `frontend/src/pages/Chat.tsx`
  - `frontend/src/components/chat/MessageList.tsx`
  - `frontend/src/components/chat/MessageInput.tsx`
  - `frontend/src/components/chat/UserAvatar.tsx`
  - `frontend/public/assets/default-avatar.png`
- **Critério DONE:** `cd frontend && npm run build` exit 0; `grep "onError" frontend/src/components/chat/UserAvatar.tsx` retorna handler com fallback `"/assets/default-avatar.png"`; `grep -r "rounded-" frontend/src/components/chat/` retorna apenas `rounded-none`; `grep "useChatStore\|chatStore" frontend/src/pages/Chat.tsx` retorna acesso via store Zustand (zero chamadas diretas a `fetch` nos componentes).

---

### T014 — Hook useWebSocket + backoff exponencial
- **Papel:** executor
- **Dependências:** T010, T012
- **Paralelizável:** Sim
- **Arquivos:**
  - `frontend/src/hooks/useWebSocket.ts`
- **Critério DONE:** `cd frontend && npm run build` exit 0; `frontend/src/hooks/useWebSocket.ts` implementa backoff exponencial com delays `[1000, 2000, 4000, 8000, 16000]` ms (cap 16s); `grep "16000" frontend/src/hooks/useWebSocket.ts` retorna linha; hook chama `chatStore.setStatus('connecting'|'connected'|'error')` e ao reconectar chama `chatStore.fetchHistory(lastTimestamp)` via `lib/api.ts`; token lido de `localStorage` (não hardcoded).

---

## Bloco E — Operacional

### T015 — Graceful shutdown + cron LGPD 24h em main.go
- **Papel:** executor
- **Dependências:** T010
- **Paralelizável:** Sim
- **Arquivos:**
  - `cmd/server/main.go`
- **Critério DONE:** `go build ./...` exit 0; `cmd/server/main.go` contém sequência: `signal.NotifyContext(SIGINT, SIGTERM)` → `hub.Shutdown()` → `time.Sleep(500ms)` → `srv.Shutdown(ctx 10s)` → `db.Close()`; contém `time.Ticker` com período 24h executando `DELETE FROM messages WHERE created_at < NOW() - INTERVAL '6 months'` (hard delete LGPD — único hard delete permitido, conforme ADR-006) com `select { case <-ticker.C: ...; case <-ctx.Done(): return }`; teste manual: `kill -SIGINT <pid>` → log "shutdown broadcast enviado" → servidor fecha em < 10s.

---

### T016 — /metrics endpoint completo
- **Papel:** executor
- **Dependências:** T010
- **Paralelizável:** Sim
- **Arquivos:**
  - `internal/chat/handler.go`
- **Critério DONE:** `go build ./...` exit 0; `curl -s http://localhost:8080/metrics` retorna JSON com campos `goroutines` (`runtime.NumGoroutine()`), `db_open_connections` (`db.Stats().OpenConnections`), `ws_active_clients` (`hub.ClientCount()`); método `ClientCount() int` já definido em T007.

---

## Bloco F — CI/CD

### T017 — GitHub Actions CI/CD + deploy script (ADR-009)
- **Papel:** executor
- **Dependências:** T001
- **Paralelizável:** Sim
- **Arquivos:**
  - `.github/workflows/ci-cd.yml`
  - `scripts/deploy.sh`
- **Critério DONE:** `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci-cd.yml'))"` exit 0; `.github/workflows/ci-cd.yml` define job `build-test` (`go build ./...`, `go vet ./...`, `go test ./...`, `cd frontend && npm ci && npm run build`) e job `deploy` (trigger: push main, needs: build-test) com Bitwarden CLI (apenas `BW_CLIENTID`, `BW_CLIENTSECRET`, `BW_PASSWORD` em GitHub Secrets — zero secrets de aplicação hardcoded); `ls -la scripts/deploy.sh` mostra permissão executável; `grep "docker compose" scripts/deploy.sh` retorna linha com `git pull origin main && docker compose pull && docker compose up -d`.

---

## Bloco G — QA

### T018 — Smoke tests + k6 load test 300 VUs
- **Papel:** executor
- **Dependências:** T014, T015, T016, T017
- **Paralelizável:** Não
- **Arquivos:**
  - `tests/load_test.js`
- **Critério DONE:** `go build ./...` exit 0; `go vet ./...` exit 0; `cd frontend && npm run build` exit 0; `tests/load_test.js` existe com 300 VUs, rampa 30s, sustentado 60s, threshold `ws_session_duration{p:95} < 500`; execução com servidor ativo retorna zero erros WS e p95 < 500ms; CPU do container Go < 80% durante teste.

---

## Resumo DAG

| Task | Bloco | Papel | Dependências | Paralelo com |
|------|-------|-------|--------------|--------------|
| T001 | A — Infra | executor | — | T003, T011 |
| T002 | A — Infra | executor | T001 | T004, T007, T017 |
| T003 | A — Infra | executor | — | T001, T011 |
| T004 | B — Auth | executor | T001 | T002, T007, T017 |
| T005 | B — Auth | executor | T002, T004 | T008, T009 |
| T006 | B — Auth | executor | T004, T005 | T008, T009, T012 |
| T007 | C — Backend | executor | T001 | T002, T004, T017 |
| T008 | C — Backend | executor | T007 | T005, T009 |
| T009 | C — Backend | executor | T002 | T005, T007, T008 |
| T010 | C — Backend | executor | T006, T007, T008, T009 | T013 |
| T011 | D — Frontend | executor | — | T001, T003 |
| T012 | D — Frontend | executor | T011 | T006, T009 |
| T013 | D — Frontend | executor | T012 | T010, T016 |
| T014 | D — Frontend | executor | T010, T012 | T015, T016 |
| T015 | E — Operacional | executor | T010 | T013, T014, T016, T017 |
| T016 | E — Operacional | executor | T010 | T013, T014, T015, T017 |
| T017 | F — CI/CD | executor | T001 | T002, T004, T007 |
| T018 | G — QA | executor | T014, T015, T016, T017 | — |

### Caminho crítico

```
T001 → T002 → T005 → T006 → T010 → T015 → T018
                                   ↑
       T001 → T007 → T008 ────────┘
       T002 → T009 ───────────────┘
       T001 → T004 ───────────────┘
       T011 → T012 → T014 → T018
```

Caminho mais longo: T001 → T002 → T005 → T006 → T010 → T015 → T018 (7 tasks sequenciais).
Rounds estimados com janela deslizante de 3: ~12–16 rounds. Margem segura dentro de `max-rounds: 40`.

### Invariantes de isolamento de arquivos verificados

- `cmd/server/main.go` é tocado por T001, T006, T010, T015 — todos sequenciais (cada um depende do anterior).
- `internal/chat/handler.go` é tocado por T010 (cria) e T016 (expande) — T016 depende de T010.
- Zero arquivos compartilhados entre tasks marcadas como `Paralelizável: Sim` dentro do mesmo bloco.
- Único hard delete autorizado: T015 no cron LGPD (`DELETE FROM messages WHERE created_at < NOW() - INTERVAL '6 months'`). Qualquer outro `DELETE FROM messages` é violação crítica da constitution.
