# Tech Stack — 42 Chat + Forum

> Stack planejada (código-fonte ainda não no repositório). Atualizar via `/sdd-explore-tech` quando o código for adicionado.

## Linguagens

| Linguagem | Versão | Fonte |
|---|---|---|
| Go | 1.25 | CLAUDE.md |
| TypeScript / React | 18.x | CLAUDE.md |
| SQL | PostgreSQL 16 | CLAUDE.md |

## Backend (Go)

| Pacote | Versão | Função |
|---|---|---|
| `go-chi/chi` | — | HTTP Router |
| `gorilla/websocket` | — | WebSocket |
| `lib/pq` | — | PostgreSQL driver |
| `google/uuid` | — | UUIDs (v7) |
| JWT lib | — | Geração/validação JWT (12h) |

## Frontend

| Pacote | Versão | Função |
|---|---|---|
| React | 18 | UI framework |
| Vite | — | Build tool |
| Tailwind CSS | — | Estilo utility-first |
| Shadcn/ui | — | Componentes |
| Zustand | — | Estado global (forumStore, chatStore) |
| react-markdown | — | Renderização MDX |
| remark-gfm | — | GitHub Flavored Markdown |
| rehype-highlight | — | Syntax highlight |

## Banco de Dados

| Item | Valor |
|---|---|
| Engine | PostgreSQL 16 |
| Driver | lib/pq (SQL direto, sem ORM) |
| Migrations | `internal/db/migrations/*.sql` (auto no startup) |
| UUIDs | v7 (time-sortable) |

## Infra e Tooling

| Item | Valor |
|---|---|
| Containerização | Docker Compose |
| Reverse proxy | Nginx |
| Deploy | AWS EC2 t2.micro |
| Auth externa | OAuth2 42 Intra |
| Auth interna | JWT (12h) |
| CI | — (não detectado) |
| Linter Go | — (não detectado) |
| Linter TS | — (não detectado) |

## Variáveis de Ambiente Obrigatórias

| Var | Descrição |
|---|---|
| `JWT_SECRET` | Assina tokens JWT |
| `DATABASE_URL` | URL de conexão PostgreSQL |
| `FORTYTWO_CLIENT_SECRET` | OAuth2 42 Intra |
| `FORUM_ADMIN_ID` | ID do usuário admin inicial |
| `DEV_MODE` | `true` habilita login de dev sem OAuth2 |
