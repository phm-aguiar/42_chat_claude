# Constituição Arquitetural — 42 Chat + Forum

> Regras incontornáveis do projeto. Modifique apenas com confirmação explícita do usuário.

## Portões de Qualidade

- `go build ./...` deve passar antes de qualquer PR
- `go vet ./...` deve passar antes de qualquer PR
- `cd frontend && npm run build` deve passar antes de qualquer PR
- Testes de integração: `tests/forum_smoke_test.sh` (11 casos) deve passar
- Testes unitários Go: `go test ./...` deve passar

## Restrições Arquiteturais

- **Monolito único**: Go (Chi) + React (Vite) + PostgreSQL. Proibido adicionar microsserviços sem aprovação.
- **Sem ORM**: apenas `lib/pq` com SQL direto. Proibido GORM, sqlx ou similares.
- **WebSocket hub único**: `internal/ws/hub.go` gerencia broadcast. Sem pub/sub externo (Redis, Kafka).
- **Auth**: OAuth2 42 Intra → JWT interno (12h). `JWT_SECRET` obrigatório via env var.
- **IDs do fórum**: UUIDv7 via `uuid.NewV7()` — nunca UUID v4, nunca inteiros sequenciais.
- **PKs de usuário**: `id INT` da 42 Intra — nunca alterar para UUID.
- **Soft delete obrigatório**: threads e posts usam `deleted_at`. Hard delete proibido.
- **Migrations automáticas**: `internal/db/migrations/*.sql` rodam no startup. Nunca alterar migration existente.
- **Deploy**: AWS EC2 t2.micro com Docker Compose + Nginx. Sem Kubernetes.

## Regras de Negócio Transversais

- IDs na API REST sempre como strings UUID (nunca byte arrays, nunca inteiros).
- Slugs válidos: `^[a-z0-9]([a-z0-9_-]*[a-z0-9])?$`. Slugs reservados: `admin`, `api`, `chat`, `forum`, `static`, `health`.
- `board_staff.role`: apenas `owner`, `mod`, `admin`. Sem outros papéis.
- Bump de thread: cada novo post faz `UPDATE threads SET last_post_at = NOW(), post_count = post_count + 1`.
- Erro padrão da API: `{ "error": "mensagem", "code": "SNAKE_CODE" }`.
- `FORUM_ADMIN_ID` (env var) define o usuário admin inicial — nunca hardcoded.

## Preferências de Bibliotecas

**Go:**
- Router: `go-chi/chi` — proibido Gin, Echo, Fiber
- WebSocket: `gorilla/websocket`
- PostgreSQL: `lib/pq` (SQL direto)
- UUID: `google/uuid` (Go 1.25 stdlib)
- JWT: biblioteca atual do projeto — não trocar sem ADR

**Frontend:**
- Framework: React 18 com Vite
- Estilo: Tailwind CSS + Shadcn/ui
- Estado: Zustand (`forumStore`, `chatStore`) — nunca Redux, nunca Context API para estado global
- Markdown: `react-markdown` + `remark-gfm` + `rehype-highlight`
- Sem jQuery, sem Axios (usar `fetch` nativo)

## Design System

- `border-radius: 0` em TODOS os componentes — flat design, cantos retos
- Paleta primária: Black `#1B1B1B`, White `#FFFFFF`
- Paleta UI: Dark Navy `#173D7A`, Near Black `#202026`, Dark Gray `#29292E`, Teal `#00BABC`, CG Blue `#04809F`, Green `#2DD57A`, Pink `#EC3391`
- Tipografia: Futura PT (300/400/700). Fallback: `ui-sans-serif`
- Avatar: `onError` → fallback `/assets/default-avatar.png`

## Anti-Padrões Proibidos

- **Credenciais no código**: `JWT_SECRET`, `DATABASE_URL`, `FORTYTWO_CLIENT_SECRET` APENAS via env vars
- **UUIDs como byte arrays**: sempre `string` no JSON/API
- **Hard delete** em threads/posts: usar `deleted_at = NOW()`
- **Abstração preemptiva**: não criar interfaces/camadas sem necessidade comprovada (YAGNI)
- **Acesso direto à API nos componentes React**: sempre via `forumStore` (Zustand)
- **Migrar migration existente**: criar nova migration ao invés de alterar existente
- **Slugs hardcoded reservados**: sempre validar contra a blacklist no store
