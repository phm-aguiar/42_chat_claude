# Spec: 42 Chat Core (MVP)

## Metadados
- **ID:** 100
- **Status:** revisão
- **Aprovado:** true
- **Autor:** phm-aguiar
- **Data original:** 2026-06-14
- **Revisão:** 2026-06-29 — reescrita após validação pós-implementação (ver debt.md)
- **Stack:** Go, React, PostgreSQL, Docker
- **Referências:** [[references/42-chat-platform-architecture]], [[references/42-graphic-charter-software]]

## Propósito

Chat em tempo real para a 42 São Paulo (~300 alunos simultâneos), substituindo
Slack/Discord com integração nativa à API da 42. MVP focado: login OAuth2 42,
WebSocket, sala única "general", mensagens persistidas.

O campus perdeu o Discord e os alunos têm dificuldade com o Slack. O 42 Chat
resolve isso com uma plataforma leve, integrada à intra da 42, que facilita a
comunicação P2P — essencial para avaliações, pair programming e grupos de estudo.

## Por que a spec foi reescrita

A versão original (2026-06-14) estava aprovada e gerou 18 tasks implementadas.
Após validação no browser, identificamos que **o produto não era utilizável**:
sem página de login, sem roteamento por token, sem logout. A spec não especificou
esses fluxos frontais e as tasks geradas nunca os cobriram.

Esta revisão corrige o escopo com base nos itens DT-004 e DT-005 do debt.md.

---

## Escopo

### Dentro do escopo (MVP)

**Autenticação (ponta a ponta):**
- Página de Login com botão "Entrar com a 42" → redireciona para OAuth2 da 42
- Callback `/api/auth/42/callback`: troca code → access token → busca `/v2/me` → upsert usuário → gera JWT → retorna `{ token, user }`
- Frontend salva JWT no `localStorage` e redireciona para `/chat`
- **Dev Login:** botão visível apenas com `VITE_DEV_MODE=true` → chama `GET /api/auth/dev/login?login=marvin` → salva token → entra no chat
- Logout: limpa `localStorage`, fecha WebSocket, redireciona para `/`

**Roteamento frontend:**
- `/` → se token válido: redireciona para `/chat`; se não: exibe `<LoginPage />`
- `/chat` → exige token; sem token redireciona para `/`

**Chat em tempo real:**
- WebSocket autenticado (token via query param `?token=<jwt>`)
- Sala única "general" — broadcast para todos os conectados
- Histórico: últimas 50 mensagens via `GET /api/messages` ao entrar
- Envio: textarea + Enter (sem Shift) → WS broadcast → persiste PostgreSQL
- Recebimento: mensagens de outros aparecem em tempo real
- Reconexão: backoff exponencial [1s, 2s, 4s, 8s, 16s] com indicador visual

**Persistência:**
- PostgreSQL para usuários e mensagens
- Soft delete em mensagens (`deleted_at`), nunca hard delete
- Expurgo LGPD: hard DELETE de mensagens > 6 meses via cron 24h (Art. 15)

**Observabilidade:**
- `GET /metrics` → JSON com `goroutines`, `db_open_connections`, `ws_active_clients`

**Infra:**
- Docker Compose: PostgreSQL 16 + server Go + nginx (frontend + proxy)
- Migrations automáticas no startup
- Graceful shutdown: SIGINT/SIGTERM → `hub.Shutdown` → 500ms → `srv.Shutdown(10s)` → `db.Close`

### Fora do escopo (features futuras)
- **Matchmaking de avaliação** (/eval) — Feature 101
- **Fórum tech** (boards → threads → posts) — Feature 102
- **TUI terminal** — Feature 103
- **Painel admin** — Feature 104
- **Salas múltiplas / DMs** — Features 105–107
- **Cache 3 camadas anti-rate-limit 42 API** — complexidade desnecessária no MVP; retry simples é suficiente

---

## Comportamento Esperado

### Cenário 1: Primeiro acesso (OAuth2)

1. Aluno acessa `http://localhost:9999` (ou domínio de produção)
2. Não tem token → vê `<LoginPage />` com botão "Entrar com a 42"
3. Clica → frontend redireciona para `https://api.intra.42.fr/oauth/authorize?client_id=...&redirect_uri=...`
4. Aluno autoriza na intra → 42 redireciona para `FORTYTWO_REDIRECT_URI/callback?code=<code>`
5. Frontend extrai `code` da URL → chama `GET /api/auth/42/callback?code=<code>`
6. Backend: troca code por access_token → GET `/v2/me` → upsert user no PostgreSQL → gera JWT 12h → retorna `{ token, user }`
7. Frontend salva `token` no `localStorage` → navega para `/chat`
8. `<ChatPage />` carrega → `fetchHistory()` → `GET /api/messages?limit=50` (com `Authorization: Bearer <token>`)
9. `useWebSocket` conecta → `ws://host/ws?token=<token>` → recebe mensagens em tempo real

### Cenário 2: Dev login (DEV_MODE=true)

1. `LoginPage` exibe botão adicional "Dev Login (marvin)"
2. Clica → `GET /api/auth/dev/login?login=marvin`
3. Backend: upsert user de dev (ID fictício estável) → JWT → retorna token
4. Frontend: salva token → navega para `/chat`
5. Chat funcional sem OAuth2 real

### Cenário 3: Retorno com token válido

1. Aluno acessa `/` com token válido no `localStorage`
2. Frontend valida token (decode local, checa `exp`) → redireciona para `/chat`
3. Chat carrega sem novo login

### Cenário 4: Token expirado

1. Aluno acessa com token expirado (exp < now)
2. Frontend detecta na checagem local → limpa `localStorage` → exibe `<LoginPage />`
3. Alternativa: `GET /api/messages` retorna 401 → frontend limpa token → redireciona

### Cenário 5: Reconexão WebSocket

1. Aluno perde conexão (Wi-Fi do campus)
2. `useWebSocket` detecta `onclose` → aguarda delay [1s, 2s, 4s, 8s, 16s] → tenta reconectar
3. UI mostra "○ reconectando..." durante o processo
4. Ao reconectar: `fetchHistory(lastTimestamp)` para carregar mensagens perdidas

### Cenário 6: Logout

1. Aluno clica em "Sair"
2. Frontend remove token do `localStorage`
3. WebSocket fecha (cleanup do hook)
4. Redireciona para `/` → `<LoginPage />`

---

## Edge Cases

- **300 conexões simultâneas:** Hub com RWMutex + send chan buffer 256. PostgreSQL tuning: shared_buffers=256MB, max_connections=100
- **Rate limit WS:** token bucket 10 msg/s por client; desconexão após 3 violações
- **Mensagem muito longa:** limite 5000 chars (CHECK constraint + maxLength no input)
- **Conexão duplicada:** mesma conta em múltiplas abas = múltiplos clients independentes (comportamento esperado)
- **Aluno sem foto:** fallback para `/assets/default-avatar.png` via `onError` no `<UserAvatar />`
- **Token inválido no WS:** backend valida JWT no upgrade; rejeita com 401 antes do handshake
- **Graceful shutdown:** clientes recebem `{"type":"system","content":"shutdown"}` → fecha WS → servidor desliga em < 10s

---

## Constraints

- **Escala:** 300 conexões simultâneas (campus presencial)
- **Infra:** AWS EC2 t2.micro (1 vCPU, 1 GB RAM). Go + PostgreSQL no mesmo host
- **Latência:** mensagens em < 500ms p95 (teste k6)
- **Segurança:** OAuth2 42 obrigatório em produção. JWT HS256 12h. Credenciais via env vars. NUNCA hardcode secrets
- **Privacidade:** retenção 6 meses (LGPD Art. 15). Cron expurgo 24h
- **Design:** border-radius: 0, paleta 42 (#1B1B1B, #00BABC, #173D7A, #2DD57A, #EC3391), dot grid background
- **Fonte:** Futura PT com fallback `ui-sans-serif, system-ui` (ver DT-006 — fonte paga)
- **Sem ORM:** apenas `lib/pq` com SQL direto

---

## Critérios de Sucesso (11 itens — todos obrigatórios para fechar MVP)

| # | Critério | Como testar |
|---|----------|-------------|
| 1 | Login OAuth2 42 funcional | Abrir browser → clicar "Entrar com a 42" → autorizar → chegar no chat |
| 2 | Dev login funcional | `DEV_MODE=true` → clicar "Dev Login" → chegar no chat como marvin |
| 3 | Histórico carrega | Entrar no chat → ver últimas 50 mensagens do banco |
| 4 | Envio de mensagem | Digitar + Enter → mensagem aparece para o remetente |
| 5 | Recebimento em tempo real | Abrir 2 abas → enviar em uma → aparecer na outra sem F5 |
| 6 | Status de conexão | UI mostra "● online" conectado, "○ reconectando..." ao perder rede |
| 7 | Reconexão automática | Desligar servidor → religar → cliente reconecta e carrega mensagens perdidas |
| 8 | Scroll automático | Mensagem nova → lista scrolla para o final automaticamente |
| 9 | Logout funcional | Clicar "Sair" → voltar para LoginPage → WebSocket encerrado |
| 10 | Histórico paginado | `GET /api/messages?before=<timestamp>&limit=50` retorna 200 com array |
| 11 | Teste de carga k6 | 300 VUs WebSocket, rampa 30s, sustentado 60s, p95 < 500ms, zero erros WS |

---

## Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Backend | Go 1.25, Chi, gorilla/websocket, lib/pq | Alta concorrência, baixo RAM, sem ORM |
| Banco | PostgreSQL 16 (Docker) | Integridade transacional, soft delete, migrations SQL |
| Auth | OAuth2 42 Intra + JWT HS256 12h | Integração nativa, sem gestão de senhas |
| Frontend | React 18, Vite, Tailwind, Zustand | Build rápido, estado simples |
| Infra | Docker Compose, nginx | Ambiente reproduzível, SPA + proxy no mesmo host |
| CI/CD | GitHub Actions + Bitwarden CLI | Deploy com injeção segura de credenciais |

---

## Modelagem de Dados (MVP)

### users
| Coluna | Tipo | Descrição |
|---|---|---|
| id | INT PK | ID da API 42 |
| login | VARCHAR(50) UNIQUE | Login da intra |
| image_url | TEXT | URL da foto de perfil |
| current_host | VARCHAR(20) | Localização no campus |
| level | NUMERIC(4,2) | Nível na intra |
| created_at | TIMESTAMP | — |

### messages
| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID PK | gen_random_uuid() |
| user_id | INT FK → users | Autor |
| content | TEXT CHECK (≤5000 chars) | Conteúdo |
| created_at | TIMESTAMP | Indexado DESC para paginação |
| deleted_at | TIMESTAMP | Soft delete — NUNCA hard delete |

---

## Variáveis de Ambiente Obrigatórias

| Variável | Prod | Dev | Descrição |
|---|---|---|---|
| `JWT_SECRET` | obrigatória | qualquer string | Chave HS256 |
| `FORTYTWO_CLIENT_ID` | obrigatória | — | Client ID app 42 |
| `FORTYTWO_CLIENT_SECRET` | obrigatória | — | Client Secret |
| `FORTYTWO_REDIRECT_URI` | obrigatória | `http://localhost:9999` | Deve bater com app 42 |
| `DATABASE_URL` | obrigatória | `postgres://chat:banana42@postgres:5432/chat?sslmode=disable` | Hostname = serviço Docker |
| `DEV_MODE` | `false` | `true` | Habilita dev login |
| `VITE_DEV_MODE` | `false` | `true` | Exibe botão dev login no frontend |
| `VITE_42_CLIENT_ID` | obrigatória | — | Para montar URL OAuth no frontend |
| `VITE_42_REDIRECT_URI` | obrigatória | `http://localhost:9999` | Deve bater com `FORTYTWO_REDIRECT_URI` |

---

## O que já está implementado (pós-revisão)

| Componente | Status | Notas |
|---|---|---|
| Backend: auth handler (OAuth2 callback + dev login) | ✅ | `internal/auth/handler.go` |
| Backend: JWT geração/validação + middleware | ✅ | `internal/auth/jwt.go`, `middleware.go` |
| Backend: WebSocket Hub + Client + rate limiter | ✅ | `internal/ws/` |
| Backend: mensagens (save, get, soft delete) | ✅ | `internal/db/queries/messages.go` |
| Backend: chat REST handlers + metrics | ✅ | `internal/chat/handler.go` |
| Backend: graceful shutdown + cron LGPD | ✅ | `cmd/server/main.go` |
| Frontend: Design System 42 (DS42) | ✅ | `index.css`, `tailwind.config.ts` |
| Frontend: chatStore Zustand | ✅ | `stores/chatStore.ts` |
| Frontend: componentes chat (List, Input, Avatar) | ✅ | `components/chat/` |
| Frontend: useWebSocket + backoff | ✅ | `hooks/useWebSocket.ts` |
| Infra: Docker Compose + nginx + migrations | ✅ | Dockerfile, docker-compose.yml |
| CI/CD: GitHub Actions + Bitwarden + deploy.sh | ✅ | `.github/workflows/ci-cd.yml` |
| **Frontend: LoginPage** | ❌ | **Falta — DT-004** |
| **Frontend: roteamento por token (App.tsx)** | ❌ | **Falta — DT-004** |
| **Frontend: logout** | ❌ | **Falta — DT-004** |
| **Frontend: callback handler** | ❌ | **Falta — DT-004** |
| **Teste de carga k6 executado** | ❌ | **Arquivo existe, não foi executado** |
