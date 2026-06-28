# Plan: 42 Chat Core (Feature 100)

## 1. Metadados do Plano

| Campo | Valor |
|---|---|
| ID do Plano | plan-100 |
| Feature Source | `specs/features/100-42chat-core/spec.md` |
| Spec Aprovada | true (verificado — campo `Aprovado: true`) |
| Autor | phm-aguiar |
| Data | 2026-06-28 |
| Status | Aprovado |
| Stack | Go 1.25, Chi, gorilla/websocket v1.5.3, lib/pq, PostgreSQL 16, React 18, Vite, Tailwind CSS, Shadcn/ui, Zustand |
| Deploy Alvo | AWS EC2 t2.micro, Docker Compose, Nginx |
| Escala | 300 conexões WebSocket simultâneas |

---

## 2. Contratos e Fronteiras

### 2.1 API REST

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/auth/42/callback` | Nenhuma | OAuth2 callback — troca `code` por JWT interno |
| GET | `/api/auth/dev/login?login=<login>` | `DEV_MODE=true` | Dev login sem OAuth2 real |
| GET | `/api/messages?before=<cursor_ts>&limit=<n>` | JWT obrigatório | Histórico (cursor pagination, default limit=50, max=100) |
| GET | `/api/users/{id}` | JWT obrigatório | Perfil de usuário pelo ID inteiro da 42 |
| GET | `/metrics` | Nenhuma (rede interna) | goroutines, memória, `DB.Stats()`, conexões WS ativas |
| GET | `/ws?token=<jwt>` | JWT via query param | Upgrade WebSocket |

Resposta de erro padrão (todos os endpoints):
```json
{ "error": "mensagem legível", "code": "SNAKE_CODE" }
```

Códigos HTTP de erro usados: 400 (input inválido), 401 (JWT ausente ou expirado), 403 (sem permissão), 413 (content > 5000 chars), 429 (rate limit WS), 500 (erro interno).

### 2.2 Contrato WebSocket

**Upgrade:** `GET /ws?token=<jwt>`. Fallback: token lido de `Sec-WebSocket-Protocol` se query param ausente.

**Inbound (cliente → servidor):**
```json
{ "type": "message", "content": "texto (máx 5000 chars)" }
```

**Outbound — mensagem de chat (servidor → todos os clientes conectados):**
```json
{
  "type": "message",
  "id": "018f1a2b-3c4d-7e5f-8a9b-0c1d2e3f4a5b",
  "user_id": 42,
  "login": "marvin",
  "content": "texto da mensagem",
  "created_at": "2026-06-28T15:04:05Z"
}
```

**Outbound — eventos de sistema:**
```json
{ "type": "system", "login": "marvin", "content": "join" }
{ "type": "system", "login": "marvin", "content": "leave" }
{ "type": "system", "content": "shutdown" }
```

**Parâmetros do frame e da conexão:**

| Parâmetro | Valor |
|---|---|
| `maxMessageSize` | 6144 bytes (frame) |
| `pingPeriod` | 30s |
| `pongWait` | 60s |
| `writeWait` | 10s |
| `send chan []byte` (buffer por client) | 256 mensagens |

### 2.3 Schema do Banco — Migration 001 (`001_init.sql`)

```sql
CREATE TABLE IF NOT EXISTS users (
    id           INT PRIMARY KEY,
    login        VARCHAR(50) UNIQUE NOT NULL,
    image_url    TEXT,
    current_host VARCHAR(20),
    level        NUMERIC(4,2) DEFAULT 0,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    INT NOT NULL REFERENCES users(id),
    content    TEXT NOT NULL CHECK (char_length(content) <= 5000),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_created
    ON messages(created_at DESC)
    WHERE deleted_at IS NULL;
```

> A migration 001 nunca será alterada. Feature 102 aplica `ALTER TABLE users ADD COLUMN title VARCHAR(100), skills TEXT[]` em `002_add_forum.sql`.

### 2.4 Fronteira com Feature 102 (Fórum)

| Contrato | Exposto por Feature 100 | Consumido por Feature 102 |
|---|---|---|
| JWT Middleware | `auth.JWTMiddleware() func(http.Handler) http.Handler` | Wraps `chi.Group("/api/forum")` |
| Extração de claims | `auth.GetClaims(ctx context.Context) *Claims` — retorna `{UserID int, Login string}` | Todos os handlers do fórum para RBAC |
| Tabela `users` | DDL criado em migration 001 | Migration 002 faz `ALTER TABLE` — sem recriar |
| Chi Router | `r *chi.Mux` instanciado em `cmd/server/main.go` | `forum.Routes(r)` monta subrouter `/api/forum` |
| Pool PostgreSQL | `*sql.DB` injetado por parâmetro de função | Recebe o mesmo ponteiro — sem segunda conexão |
| Docker Compose | Container `server` único, `DATABASE_URL` único | Sem container adicional |

**Invariante crítica:** Feature 100 expõe `auth.JWTMiddleware` e `*sql.DB` como contratos de plataforma. Feature 102 não reimplementa auth — consome as funções existentes sem modificação.

### 2.5 Variáveis de Ambiente

**Backend:**

| Variável | Obrigatória em Prod | Default Dev | Descrição |
|---|---|---|---|
| `JWT_SECRET` | Sim | `change-me-in-production` | Chave HMAC-SHA256 para assinar JWT |
| `DATABASE_URL` | Sim | `postgres://chat:banana42@localhost:5432/chat?sslmode=disable` | DSN para pool lib/pq |
| `FORTYTWO_CLIENT_ID` | Sim | — | OAuth2 Client ID da 42 Intra |
| `FORTYTWO_CLIENT_SECRET` | Sim | — | OAuth2 Client Secret da 42 Intra |
| `FORTYTWO_REDIRECT_URI` | Não | `http://localhost:5173` | Redirect URI (deve coincidir com o app 42) |
| `FORTYTWO_API_URL` | Não | `https://api.intra.42.fr` | Base URL da API 42 |
| `PORT` | Não | `8080` | Porta HTTP do servidor |
| `DEV_MODE` | Não | `false` | Habilita `/api/auth/dev/login` |
| `DEV_USER` | Não | `marvin` | Login padrão no dev mode |
| `WS_ALLOWED_ORIGINS` | Sim em prod | `*` (dev) | CSV de origins permitidas no WS upgrade (ADR-004) |
| `FORUM_ADMIN_ID` | Não (Feature 102) | — | ID inteiro do admin inicial do fórum |
| `POSTGRES_USER` | Não (Docker) | `chat` | Usuário do container PostgreSQL |
| `POSTGRES_PASSWORD` | Não (Docker) | `banana42` | Senha do container PostgreSQL |
| `POSTGRES_DB` | Não (Docker) | `chat` | Database do container PostgreSQL |

**Frontend (prefixo `VITE_`, embutidas no build):**

| Variável | Default | Descrição |
|---|---|---|
| `VITE_DEV_MODE` | `false` | Exibe botão "Dev Login" na UI |
| `VITE_API_URL` | (vazio) | URL base da API (vazio = proxy Vite em dev) |
| `VITE_42_CLIENT_ID` | `dev-client-id` | Client ID para link de redirect OAuth2 |
| `VITE_42_REDIRECT_URI` | `http://localhost:5173` | Deve coincidir com `FORTYTWO_REDIRECT_URI` |

---

## 3. Decisões Arquiteturais e Justificativas

#### ADR-001: Modelo de Concorrência do Hub — Híbrido RWMutex + send chan

**Contexto:** O Hub precisa gerenciar até 300 clients concorrentes com broadcast eficiente. Em Go, dois padrões principais existem: channels puros (goroutine central de broadcast) e mutex no mapa + channel de saída por client.

**Decisão:** Híbrido — `sync.RWMutex` protege o mapa `clients map[*Client]bool` (leitura em broadcast é frequente; escrita em connect/disconnect é rara). Cada `Client` tem `send chan []byte` com buffer 256 — a goroutine `writePump` do client drena o channel de forma não bloqueante para o broadcast.

**Alternativas rejeitadas:**
- *Channels puros:* cada broadcast exige round-trip via goroutine registradora, adicionando latência proporcional à carga.
- *`sync.Mutex` exclusivo no mapa:* bloqueia todas as leituras durante a escrita de uma mensagem; estrangulamento a 300 clients em broadcast simultâneo.

**Consequências:** Broadcast em O(n) sem bloqueio mútuo entre leitores. Se `send chan` de um client lotar (buffer 256 cheio), o client é desconectado — não bloqueia os demais. Pico de goroutines: `readPump + writePump` = 600 goroutines a 300 clientes (aceitável no runtime Go em t2.micro).

---

#### ADR-002: Sem Refresh Token — Risco Aceito com Prazo de Revisão

**Contexto:** JWT dura 12h. Quando expira, o usuário precisa re-autenticar via OAuth2. Refresh tokens exigiriam armazenamento server-side, revogação e rotação.

**Decisão:** MVP sem refresh token. Se o aluno mantiver cookie de sessão na 42, o re-login é transparente (OAuth2 consent já dado). Risco aceito formalmente: sessão quebra se JWT expirar durante uso ativo após 12h sem cookie OAuth2 válido.

**Alternativas rejeitadas:**
- *Refresh token opaque em PostgreSQL:* adiciona tabela `sessions`, lógica de rotação e risco de token theft; YAGNI para campus com sessões < 12h.
- *JWT de longa duração (7 dias):* janela de comprometimento 14x maior em caso de vazamento do token.

**Consequências:** UX levemente degradada em sessões > 12h. Revisão obrigatória na Feature 104 (painel admin Bocal), que exigirá sessões longas de moderação.

---

#### ADR-003: Token WS via Query Param `?token=<jwt>`

**Contexto:** Browsers não permitem headers customizados (`Authorization`) no handshake WebSocket por spec. As alternativas práticas são query param ou `Sec-WebSocket-Protocol` como carrier.

**Decisão:** Query param `?token=<jwt>` como mecanismo principal. O handler extrai e valida o token antes do upgrade gorilla/websocket. Fallback: token lido de `r.Header.Get("Sec-WebSocket-Protocol")` para clientes nativos (Feature 103 — TUI terminal).

**Alternativas rejeitadas:**
- *Cookie HttpOnly:* requer CORS credenciado (`credentials: 'include'`) e `SameSite` configurado; complica deploy multi-domínio e testes.
- *`Sec-WebSocket-Protocol` exclusivo:* quebra semântica do protocolo WS; o servidor deve responder com o mesmo valor como subprotocolo aceito, o que confunde proxies.

**Consequências:** Token fica visível nos access logs do Nginx. Mitigação: configurar `log_format` para mascarar o parâmetro `token=` (`$request` → `$uri` sem query string) em produção.

---

#### ADR-004: CheckOrigin Aberto em Dev, Whitelist em Produção

**Contexto:** gorilla/websocket valida o header `Origin` por padrão. Em dev, a origem é `localhost:5173` (Vite) vs backend em `localhost:8080` — a validação padrão rejeita o upgrade.

**Decisão:** Comportamento controlado por `WS_ALLOWED_ORIGINS`:
- `DEV_MODE=true` ou env var ausente em dev: `CheckOrigin: func(*http.Request) bool { return true }`.
- Produção: ler `WS_ALLOWED_ORIGINS` (CSV), validar `r.Header.Get("Origin")` contra a lista. Ausência da var em prod é `log.Fatal` explícito — não falha silenciosa.

**Alternativas rejeitadas:**
- *Sempre aberto:* violação de segurança em produção — CSRF via WebSocket é vetor de ataque real.
- *Hardcoded whitelist:* acoplamento ao domínio de produção no binário; quebra deploys staging.

**Consequências:** `WS_ALLOWED_ORIGINS=https://chat.42sp.org.br` é obrigatório no checklist de deploy. Ausência dispara `log.Fatal` antes de aceitar conexões.

---

#### ADR-005: Cursor Pagination por `created_at` em vez de OFFSET

**Contexto:** `GET /api/messages?before=<cursor>&limit=<n>` deve ser eficiente com tabela crescendo por 6 meses de mensagens de 300 usuários.

**Decisão:** Cursor baseado em `created_at` (timestamp RFC3339 via query param): `WHERE created_at < $cursor AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $n`. Índice `idx_messages_created` (B-tree em `created_at DESC WHERE deleted_at IS NULL`) garante O(log n) independente do volume acumulado.

**Alternativas rejeitadas:**
- *OFFSET/LIMIT:* degrada para O(offset) conforme o cursor avança; inconsistente em inserções concorrentes durante paginação.
- *Cursor por UUID:* `messages.id` usa `gen_random_uuid()` (v4, não time-sortable); mudar para UUIDv7 quebraria a migration 001 já definida.

**Consequências:** Cliente armazena `created_at` da mensagem mais antiga exibida para requisitar a próxima página. Duplicatas no exato mesmo timestamp são possíveis (improvável em prática): cliente deve deduplicar por `id` no store Zustand.

---

#### ADR-006: Scheduler LGPD — time.Ticker em main.go

**Contexto:** LGPD Art. 15 exige eliminação de dados pessoais ao fim do período de retenção. O spec define retenção de mensagens por 6 meses. Gap 1 do researcher: nenhum mecanismo de scheduler havia sido decidido.

**Decisão:** `time.Ticker` com período de 24h iniciado em `main.go`. Goroutine dedicada executa:
```sql
DELETE FROM messages WHERE created_at < NOW() - INTERVAL '6 months'
```
Hard delete físico — LGPD exige eliminação real dos dados pessoais, não apenas soft delete. A goroutine respeita graceful shutdown via `select { case <-ticker.C: runExpurgo(); case <-ctx.Done(): return }`.

**Alternativas rejeitadas:**
- *systemd timer:* exige acesso ao host EC2 e configuração fora do container; aumenta superfície de operação e quebra portabilidade Docker.
- *Container cron separado:* viola a restrição de monolito único da constitution.
- *`pg_cron` (extensão PostgreSQL):* adiciona dependência à imagem PostgreSQL; impossibilita migração futura para RDS gerenciado.

**Consequências:** O cron só executa enquanto o servidor está up. Para downtime > 24h, o expurgo roda na próxima inicialização — aceitável para uptime esperado > 99% em EC2. Logar cada execução com contagem de linhas deletadas para auditoria LGPD.

---

#### ADR-007: PostgreSQL Tuning via `command:` no docker-compose.yml

**Contexto:** t2.micro tem 1 GB RAM. Parâmetros definidos no spec: `shared_buffers=256MB`, `effective_cache_size=512MB`, `work_mem=16MB`, `max_connections=100`. Gap 2 do researcher: sem mecanismo de aplicação definido.

**Decisão:** Aplicar via `command:` no serviço `postgres` do `docker-compose.yml`:
```yaml
services:
  postgres:
    image: postgres:16
    command: >
      postgres
      -c shared_buffers=256MB
      -c effective_cache_size=512MB
      -c work_mem=16MB
      -c max_connections=100
```

**Alternativas rejeitadas:**
- *`postgresql.conf` customizado:* requer bind-mount de arquivo; mais frágil em rotação de volumes e drift entre ambientes.
- *`ALTER SYSTEM SET`:* persiste no data volume mas não é declarativo no repositório; cria divergência entre dev e prod.
- *Variáveis de ambiente `POSTGRES_*`:* a imagem oficial Docker do PostgreSQL não suporta configuração de todos os parâmetros via env var.

**Consequências:** Parâmetros versionados no git dentro do `docker-compose.yml`. `max_connections=100` limita o pool do backend: `sql.DB.SetMaxOpenConns(90)` reserva 10 conexões para manutenção e migrations. `sql.DB.SetMaxIdleConns(10)` para reutilização eficiente.

---

#### ADR-008: Rate Limiting WS — Token Bucket com golang.org/x/time/rate

**Contexto:** Sem rate limit no WebSocket, um client malicioso pode fazer broadcast de spam em alta velocidade, saturando o broadcast loop, o pool PostgreSQL e o `send chan` de todos os outros clients. Gap 4 do researcher: algoritmo e biblioteca não haviam sido definidos.

**Decisão:** `golang.org/x/time/rate.NewLimiter(rate.Every(100*time.Millisecond), 10)` por client — 10 msgs/s sustentado com burst inicial de 10. Verificado no `readPump` antes de processar o payload:
```go
if !client.limiter.Allow() {
    client.violations++
    if client.violations >= 3 {
        return // fecha conexão
    }
    client.send <- errorMsg("RATE_LIMIT_EXCEEDED")
    continue
}
client.violations = 0
```

**Alternativas rejeitadas:**
- *Middleware Chi HTTP:* não se aplica a frames WS após o upgrade — o handler WS bypassa o middleware chain.
- *Leaky bucket com channel Go:* implementação manual; `golang.org/x/time/rate` é stdlib-adjacent, mantida pela equipe Go.
- *Redis rate limiter:* viola constraint de monolito único e adiciona latência de rede para cada mensagem.

**Consequências:** `golang.org/x/time/rate` é `golang.org/x` — zero dependências externas adicionais. 10 msgs/s é generoso para interação humana; ajustável via env var `WS_RATE_LIMIT_RPS` futura sem ADR adicional.

---

#### ADR-009: CI/CD — GitHub Actions com Bitwarden CLI

**Contexto:** Secrets (`JWT_SECRET`, `FORTYTWO_CLIENT_SECRET`, `DATABASE_URL`) não podem estar no repositório nem no Dockerfile. Spec define GitHub Actions + Bitwarden CLI. Gap 6 do researcher: nenhum `.github/workflows/*.yml` havia sido especificado.

**Decisão:** Dois jobs no arquivo `.github/workflows/ci-cd.yml`:

**Job 1 — `build-test`** (trigger: push em qualquer branch, PR):
1. Checkout + `go build ./...`
2. `go vet ./...`
3. `go test ./...`
4. `cd frontend && npm ci && npm run build`

**Job 2 — `deploy`** (trigger: push em `main`; `needs: build-test`):
1. Instala Bitwarden CLI no runner
2. `bw login --apikey` usando `BW_CLIENTID` e `BW_CLIENTSECRET` (GitHub Secrets — apenas credenciais do Bitwarden)
3. `bw unlock --passwordenv BW_PASSWORD` → exporta `BW_SESSION`
4. `bw get password <item-id>` → injeta `JWT_SECRET`, `FORTYTWO_CLIENT_SECRET`, `DATABASE_URL`
5. SSH para EC2: `git pull origin main && docker compose pull && docker compose up -d`

**Alternativas rejeitadas:**
- *Secrets diretamente no GitHub Secrets:* vincula todos os secrets à plataforma GitHub; Bitwarden permite auditoria centralizada e rotação sem tocar no CI.
- *GitHub OIDC + AWS Secrets Manager:* não resolve secrets da aplicação (JWT, OAuth2); adiciona complexidade de IAM.
- *`COPY .env` no Dockerfile:* violação crítica — secrets ficam no layer do container e acessíveis via `docker history`.

**Consequências:** Apenas `BW_CLIENTID`, `BW_CLIENTSECRET` e `BW_PASSWORD` ficam no GitHub Secrets. Tempo de deploy estimado: ~3min.

---

## 4. Auditoria de Constituição

| # | Restrição | Status | Evidência |
|---|---|---|---|
| 1 | Monolito único — sem microsserviços | ✅ | WS Hub + Auth + REST no mesmo processo `cmd/server/main.go`. ADR-006 cron interno. ADR-008 rate limiter in-process. |
| 2 | Sem ORM — apenas lib/pq com SQL direto | ✅ | Nenhuma importação de `gorm`, `sqlx` ou `ent` no plano. Todas as queries são SQL literal. |
| 3 | WebSocket: gorilla/websocket obrigatório | ✅ | ADR-001 e ADR-003 usam exclusivamente `gorilla/websocket`. Parâmetros de frame especificados. |
| 4 | Router: chi obrigatório (Gin/Echo/Fiber proibidos) | ✅ | Todos os endpoints montados via `chi.Mux`. Feature 102 usa `chi.Group`. |
| 5 | Estado frontend: Zustand — sem Context API global | ✅ | Fase 4 especifica `chatStore.ts` com Zustand. `fetch` nativo em `lib/api.ts`. |
| 6 | Sem jQuery, sem Axios | ✅ | `lib/api.ts` usa `fetch` nativo. Nenhuma referência a Axios ou jQuery no plano. |
| 7 | Credenciais apenas via env vars | ✅ | Seção 2.5 tabela completa. ADR-009 proíbe secrets no código/Dockerfile. |
| 8 | Migrations automáticas no startup | ✅ | `cmd/server/main.go` roda `internal/db/migrations/*.sql` antes de aceitar conexões. |
| 9 | Nunca alterar migration existente | ✅ | Seção 2.3 nota explícita. Feature 102 usa `ALTER TABLE` em `002_add_forum.sql`. |
| 10 | PKs de usuário: `id INT` da 42 (nunca UUID) | ✅ | Schema migration 001: `id INT PRIMARY KEY`. Contrato WS outbound: `"user_id": 42` como inteiro. |
| 11 | Soft delete obrigatório em messages | ✅ | Schema: campo `deleted_at TIMESTAMP`. Hard delete físico após 6 meses é cumprimento de LGPD (eliminação obrigatória), não violação da constitution. |
| 12 | IDs na API REST sempre como strings UUID | ✅ | `messages.id` UUID retornado como string JSON. `user_id` retornado como inteiro (PK da 42 — não UUID). |
| 13 | `border-radius: 0` em todos os componentes | ✅ | Fase 4: `tailwind.config.ts` com `borderRadius: { DEFAULT: '0', none: '0' }`. Shadcn/ui configurado com `rounded-none`. |
| 14 | Deploy: EC2 t2.micro + Docker Compose + Nginx | ✅ | ADR-009 deploy job usa Docker Compose. Nginx como proxy reverso. Sem Kubernetes. |
| 15 | `FORUM_ADMIN_ID` via env var | ✅ | Seção 2.5: declarado na tabela backend. Feature 100 provê a variável; Feature 102 consome. |
| 16 | `JWT_SECRET` nunca hardcoded | ✅ | ADR-009: Bitwarden CLI injeta em runtime. Default dev é string fraca documentada — nunca usada em prod. |

---

## 5. Fases de Implementação

### Fase 1 — Infraestrutura Base

**Componentes:** PostgreSQL 16 (container), migration 001 automática, Docker Compose com tuning (ADR-007), pool lib/pq, Nginx básico.

**Arquivos esperados:**
- `docker-compose.yml` (serviços `server` e `postgres`, tuning via `command:`)
- `internal/db/migrations/001_init.sql` (DDL de `users` e `messages` conforme Seção 2.3)
- `internal/db/db.go` (`Connect() *sql.DB` com `SetMaxOpenConns(90)`, `SetMaxIdleConns(10)`)
- `nginx/nginx.conf` (proxy reverso porta 80 → 8080, path `/ws` com `upgrade`)
- `.env.example` (todas as vars da Seção 2.5 sem valores de produção)

**Critério de conclusão:** `docker compose up` sobe sem erros; `psql -U chat -c '\dt'` lista tabelas `users` e `messages`; `go build ./...` passa; `psql -c 'SHOW shared_buffers'` retorna `256MB`.

### Fase 2 — Autenticação (OAuth2 + JWT)

**Componentes:** OAuth2 42 callback, troca `code` → token 42, GET `/v2/me`, upsert de usuário no PostgreSQL, geração de JWT HS256 12h, `auth.JWTMiddleware()`, `auth.GetClaims()`, dev login.

**Arquivos esperados:**
- `internal/auth/handler.go` (callback OAuth2, dev login, geração JWT)
- `internal/auth/middleware.go` (`JWTMiddleware`, `GetClaims`)
- `internal/db/queries/users.go` (`UpsertUser`, `GetUserByID`)

**Critério de conclusão:** `DEV_MODE=true go run ./cmd/server/main.go` + `curl 'localhost:8080/api/auth/dev/login?login=marvin'` retorna JSON com campo `token`; JWT decodificado contém claims `{user_id: <int>, login: "marvin", exp: <now+12h>}`.

### Fase 3 — Backend Core (Hub + WebSocket + REST)

**Componentes:** WebSocket Hub (`hub.go`), `readPump`/`writePump` por client, rate limiter por client (ADR-008), broadcast com `sync.RWMutex`, persistência de mensagem, `GET /api/messages` (cursor pagination ADR-005), `GET /api/users/{id}`, `/metrics`.

**Arquivos esperados:**
- `internal/ws/hub.go` (register/unregister/broadcast, `Shutdown()`)
- `internal/ws/client.go` (`readPump`, `writePump`, `limiter *rate.Limiter`)
- `internal/chat/handler.go` (handlers REST: `/api/messages`, `/api/users/{id}`, `/ws`, `/metrics`)
- `cmd/server/main.go` (Chi router, injeção de deps, graceful shutdown, cron LGPD)

**Critério de conclusão:** `wscat -c 'ws://localhost:8080/ws?token=<jwt>'` conecta; mensagem JSON enviada é broadcast de volta; `GET /api/messages` retorna array com campo `id` como string UUID; `/metrics` responde 200.

### Fase 4 — Frontend (React + Zustand + UI)

**Componentes:** `chatStore` (Zustand com `messages`, `status`, `error`, `sendMessage`, `fetchHistory`), hook `useWebSocket` com backoff exponencial, componentes de chat (MessageList, MessageInput, UserAvatar), Design System 42 (Futura PT, paleta oficial, `border-radius: 0`, dot grid background).

**Arquivos esperados:**
- `frontend/src/stores/chatStore.ts`
- `frontend/src/hooks/useWebSocket.ts` (backoff: 1s → 2s → 4s → 8s → 16s cap; badge "reconectando...")
- `frontend/src/lib/api.ts` (`fetch` nativo para `/api/messages` e `/api/users/{id}`)
- `frontend/src/pages/Chat.tsx`
- `frontend/src/components/chat/MessageList.tsx`
- `frontend/src/components/chat/MessageInput.tsx`
- `frontend/src/components/chat/UserAvatar.tsx` (`onError` → fallback `/assets/default-avatar.png`)
- `frontend/index.css` (Futura PT, variáveis CSS da paleta 42, dot grid `radial-gradient`)
- `tailwind.config.ts` (`borderRadius: { DEFAULT: '0', none: '0' }`)

**Critério de conclusão:** `npm run build` passa; browser conecta WS, envia e recebe mensagens; avatar sem foto exibe fallback; `grep -r 'rounded-' frontend/src/components` retorna apenas `rounded-none`.

### Fase 5 — Operacional

**Componentes:** Graceful shutdown completo (SIGINT/SIGTERM → `hub.Shutdown()` broadcast `"shutdown"` → sleep 500ms → `srv.Shutdown(10s)` → `db.Close()`), cron LGPD 24h (ADR-006), `/metrics` completo.

**Arquivos esperados:**
- `cmd/server/main.go` (seções de graceful shutdown e `time.Ticker` LGPD)

**Critério de conclusão:** `kill -SIGINT <pid>` → log "shutdown broadcast enviado" → servidor fecha em < 10s; `/metrics` retorna goroutines, `db.Stats().OpenConnections`, contagem de clients WS.

### Fase 6 — CI/CD e Deploy

**Componentes:** GitHub Actions (2 jobs: `build-test` e `deploy`), Bitwarden CLI no runner, script SSH de deploy, Nginx com TLS (Let's Encrypt).

**Arquivos esperados:**
- `.github/workflows/ci-cd.yml`
- `scripts/deploy.sh` (`git pull` + `docker compose pull` + `docker compose up -d --wait`)

**Critério de conclusão:** Push em `main` → GitHub Actions verde em ambos os jobs (< 5min); `curl https://chat.42sp.org.br/metrics` retorna 200; TLS válido.

### Fase 7 — QA

**Componentes:** Teste de carga 300 conexões (k6), smoke test OAuth2 manual, validação de todos os portões de qualidade da constitution.

**Arquivos esperados:**
- `tests/load_test.js` (k6: 300 VUs, rampa 30s, sustentado 60s, threshold `ws_session_duration{p:95} < 500`)

**Critério de conclusão:** k6 com 300 VUs por 60s — zero erros WS, p95 < 500ms, CPU do container Go < 80%; `go build ./...` ✅; `go vet ./...` ✅; `npm run build` ✅.

---

## 6. Riscos e Mitigações

| Gap | Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|---|
| Gap 3 | `WS_ALLOWED_ORIGINS` ausente em produção → CSRF via WebSocket | Médio | Alto | ADR-004: ausência dispara `log.Fatal` antes de aceitar conexões WS. `scripts/deploy.sh` valida a presença da variável. |
| Gap 5 | Sem ferramenta de teste de carga → meta de 300 conexões não validada | Alto | Alto | Fase 7: k6 com `tests/load_test.js`, 300 VUs, threshold p95 < 500ms como gate de qualidade — PR bloqueado se falhar. |
| Gap 7 | Reconexão frontend sem backoff → UX quebrada em WiFi instável do campus | Médio | Médio | Fase 4: `useWebSocket.ts` com backoff exponencial (1s → 2s → 4s → 8s → 16s cap). Recupera mensagens perdidas via `GET /api/messages?before=<last_ts>` após reconexão. |
| Gap 8 | JWT 12h sem refresh token — sessão quebra em uso contínuo | Baixo | Baixo | ADR-002 documenta formalmente. Monitorar via `/metrics` (contagem de 401 em `/api/messages`) pós-launch. Revisão agendada para Feature 104. |
