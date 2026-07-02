---
feature: 100
tipo: débito técnico
---

# Débito Técnico — Feature 100: 42 Chat Core

Itens identificados em pós-implementação que funcionam mas precisam de melhoria antes de produção.

---

## DT-001 — nginx SPA: MIME types e cache ausentes

**Origem:** nginx/nginx.conf `location /` servindo `frontend/dist/` sem configuração de MIME types, compressão ou cache HTTP.

**Sintoma atual:** arquivos `.js`/`.css` podem ser servidos sem `Content-Type` correto; sem `Cache-Control` para assets com hash; sem gzip.

**Impacto:** performance degradada em conexões lentas, possível quebra em browsers rígidos com MIME sniffing desabilitado.

**Correção esperada:**
```nginx
include       /etc/nginx/mime.types;
gzip          on;
gzip_types    text/css application/javascript application/json;

location /assets/ {
    root /usr/share/nginx/html;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
    add_header Cache-Control "no-cache";
}
```

**Prioridade:** média — obrigatório antes de produção.

---

## DT-002 — Containers server e nginx reiniciando no startup

**Origem:** `docker compose up` com `server` e `nginx` em estado `Restarting (1)`. PostgreSQL sobe healthy.

**Saída observada:**
```
42_chat_claude-nginx-1    Restarting (1) 8 seconds ago
42_chat_claude-server-1   Restarting (1) 21 seconds ago
42_chat_claude-postgres-1 Up 55 seconds (healthy)
```

**Causa identificada:**
- `server`: `.env` tinha `DATABASE_URL=postgres://...@localhost:5432/...` — dentro do Docker, `localhost` aponta para o próprio container, não para o serviço `postgres`. Corrigido para `@postgres:5432`.
- `nginx`: upstream `server:8080` inacessível (server reiniciando em cascata) → nginx encerra com exit 1.

**Correção esperada:**
1. Copiar `.env.example` → `.env` e preencher `JWT_SECRET` (qualquer string em dev).
2. Adicionar `depends_on: server: condition: service_healthy` no nginx com healthcheck no server (`GET /health`).
3. Adicionar healthcheck no serviço `server` no docker-compose.yml:
```yaml
healthcheck:
  test: ["CMD-SHELL", "wget -qO- http://localhost:8080/health || exit 1"]
  interval: 5s
  timeout: 3s
  retries: 5
  start_period: 10s
```

**Prioridade:** alta — bloqueia uso local via Docker.

---

## DT-003 — Migrations lidas do filesystem em runtime (frágil em Docker)

**Origem:** `internal/db/db.go` lê `internal/db/migrations/*.sql` via `os.ReadDir` — o path é relativo ao working directory do processo.

**Sintoma:** container server encerra com `open internal/db/migrations: no such file or directory` porque o `Dockerfile` copiava apenas o binário para a imagem final.

**Fix imediato aplicado:** `COPY --from=builder /app/internal/db/migrations ./internal/db/migrations` no Dockerfile.

**Correção definitiva:** usar `//go:embed` para embutir as migrations no binário:
```go
//go:embed migrations/*.sql
var migrationsFS embed.FS

func runMigrations(db *sql.DB) error {
    entries, _ := migrationsFS.ReadDir("migrations")
    // ...
}
```
Elimina a dependência de path no filesystem — o binário fica self-contained.

**Prioridade:** média — fix imediato resolve, embed é melhoria de robustez.

---

## DT-004 — Frontend sem autenticação: sem login, sem ChatPage funcional

**Origem:** o frontend carrega a `ChatPage` diretamente, sem qualquer fluxo de autenticação. O backend retorna 401 em todas as chamadas.

**Sintomas observados no browser:**
```
GET http://localhost:9999/api/messages?limit=50 401 (Unauthorized)
WebSocket /ws 401 — useWebSocket aborta
```

**Causa raiz:** `App.tsx` renderiza `<ChatPage />` sem checar se existe token no `localStorage`. O hook `useWebSocket` aborta ao não encontrar token (status → `error`), mas não há página de login para o usuário obter um.

**Impacto:** front-end completamente inútil — não é possível ler nem enviar mensagens.

**Correção esperada (mínimo para MVP):**
1. Criar página `Login.tsx` com botão "Entrar com 42" redirecionando para `GET /api/auth/42` (OAuth 42 via backend).
2. Criar rota `GET /api/auth/callback` no backend que valida código OAuth, gera JWT, retorna token ao front.
3. Em `App.tsx`, checar `localStorage.getItem('token')`:
   - Se existe → renderizar `<ChatPage />`
   - Se não → renderizar `<LoginPage />`
4. Para dev: adicionar endpoint `POST /api/auth/dev` que aceita `{ login, password }` e gera JWT com `DEV_MODE=true`, permitindo login local sem OAuth real.

**Dependências:**
- Backend: endpoints `/api/auth/42`, `/api/auth/callback`, `/api/auth/dev`
- Frontend: página `Login.tsx`, ajuste de routing em `App.tsx`
- Ambos: acordo sobre formato do JWT e key do `localStorage`

**Prioridade:** crítica — bloqueia qualquer uso do produto.

---

## DT-005 — Feature 100 dada como concluída sem testes de usabilidade

**Origem:** todas as 18 tasks (T001–T018) foram marcadas como DONE em tasks.md, incluindo T018 (k6 load test), mas nenhum teste de usabilidade foi executado no frontend. O produto foi considerado "MVP pronto" sem jamais ter sido usado por um humano real.

**Sintoma:** ao acessar `http://localhost:9999` (após correção de porta):
- `GET /api/messages` → 401 (sem token)
- WebSocket conecta → rejeita (sem token)
- UI mostra apenas o ChatPage em estado `error` ("Token de autenticação não encontrado")
- Não existe página de login, logout, ou qualquer interação possível
- O console JavaScript mostra `index-DSNboLpY.css:1  GET https://use.typekit.net/placeholder.css net::ERR_ABORTED 404` (typekit placeholder)

**Impacto:** feature foi false-positively entregue. O，所谓 "MVP" é um skeleton que não funciona para nenhum fluxo de usuário.

**O que um MVP de chat realmente precisa ter (funcionalidades básicas):**

| # | Funcionalidade | Descrição |
|---|---------------|-----------|
| 1 | Login OAuth 42 | Redireciona → autoriza → callback → JWT |
| 2 | Dev login | `POST /api/auth/dev` com `{login, password}` para teste sem OAuth |
| 3 | Exibição de mensagens | Lista mensagens com autor, timestamp, conteúdo |
| 4 | Envio de mensagens | Input + enter ou botão → WS broadcast |
| 5 | Recebimento em tempo real | WebSocket empurra mensagens novas para todos os clientes |
| 6 | Status de conexão | Indicador visual: "online / conectando / offline" |
| 7 | Reconexão automática | Backoff exponencial quando WS cai |
| 8 | Scroll automático | Mensagens novas aparecem no fundo visível |
| 9 | Logout | Limpa token do localStorage, desconecta WS |
| 10 | Histórico paginado | `/api/messages?before=<timestamp>&limit=50` para carregar mais |
| 11 | Teste de carga | k6: 300 VUs, WebSocket, p95 < 500ms, zero erros |

**Estado atual da Feature 100 vs. requisitos do MVP:**

| Requisito MVP | Status |
|-------------|--------|
| Login OAuth 42 | ⚠️ Backend tem endpoints, frontend não tem página de login |
| Dev login | ⚠️ Endpoint existe (`/api/auth/dev/login?login=marvin`) mas front não usa |
| Exibir mensagens | ⚠️ Componentes existem mas `fetchHistory` retorna 401 |
| Enviar mensagens | ❌ Impossível — WebSocket rejeita sem token |
| Receber em realtime | ❌ WebSocket rejeita sem token |
| Status de conexão | ⚠️ `useWebSocket` define status mas UI mostra apenas "error" |
| Reconexão automática | ⚠️ Backoff implementado mas nunca executa (WS morre no primeiro connect) |
| Scroll automático | ✅ Componente `MessageList` existe |
| Logout | ❌ Nenhuma UI para logout |
| Histórico paginado | ⚠️ Endpoint existe mas `fetchHistory` retorna 401 |
| Teste de carga k6 | ✅ T018 foi marcada como DONE em tasks.md |

**Prioridade:** crítica — a feature não pode ser considerada "MVP" até que todos os 11 itens funcionem de ponta a ponta.

---

## DT-006 — Design System 42: fonte oficial indisponível + referência única não verificada

**Origem:** `wiki-claude/references/42-graphic-charter-software.md` foi criado a partir de documento "pasted by user" (fonte: "42 Graphic Charter August 2024"), com `base_confidence: 0.83`, `lifecycle: draft`, `tier: supporting`, e anotações `^[ambiguous]` em vários valores de cor. Não há nenhum arquivo oficial da administração da 42 — o student não tem acesso.

**Nota de postura:** este é um MVP local em desenvolvimento. NÃO é produção. Não precisamos de placeholders de design system, credenciais reais, ou conformidade oficial com charter enquanto não tivermos acesso ao material da admin. O foco é fazer o chat funcionar localmente.

**Problemas concretos (só relevantes quando for pra produção):**

1. **Futura PT é paga** — requer Adobe Creative Cloud ou licença de desktop.
2. **Valores de corambíguos no documento:**
   ```
   Dark Slate Gray: RGB diz "180,33,29" mas CMYK diz "77 48 53 49" — impossíveis de serem da mesma cor
   Cadet Gray: RGB diz "0,186,188" (idêntico a 42 Blue) — claramente copy-paste error
   Violet: RGB diz "271,100,74" — valor impossível (>255 no canal R)
   ```
3. **Sem assets oficiais** — o `42-UI-elements.sketch` não está disponível.

**Para o MVP local (hoje):**

| Decisão | Justificativa |
|---------|---------------|
| Fonte: usar `ui-sans-serif` + `system-ui` | Funcional, sem external deps |
| Cores: usar valores concretos da UI Colors table | Os do `index.css` já funcionam |
| Ícones: nenhum (sem assets) | UI simples com texto/bordas é suficiente pro MVP |

**Para produção (futuro):**
- Obter licença Adobe Fonts ou migrar para Google Fonts (Outfit/Plus Jakarta Sans)
- Validar cores e ícones com admin 42
- Submeter para review na intra

**Prioridade:** baixa — não bloqueia o MVP. É dívida de quando o projeto for pra produção.

---

## DT-007 — Sidebar de usuários online mostra apenas histórico recente, não presença real

**Origem:** o `Hub` (`internal/ws/hub.go`) mantém `map[*Client]bool` mas não armazena o `login` do usuário por client. Não há endpoint para listar quem está conectado agora.

**Sintoma:** a sidebar "Online" exibe logins extraídos das últimas 50 mensagens como proxy — não reflete presença real. Um usuário que está conectado mas não enviou mensagens não aparece. Um usuário que enviou mensagens mas desconectou ainda aparece.

**Correção esperada:**
1. Adicionar `login string` ao `Client` struct em `internal/ws/client.go`
2. Passar o login no `ServeWS` ao criar o client: `ws.NewClient(h.Hub, conn, claims.Login)`
3. Expor `hub.OnlineUsers() []string` que itera `clients` com RLock e retorna logins
4. Adicionar endpoint `GET /api/online` que retorna a lista
5. Frontend: buscar `/api/online` ao conectar e atualizar via eventos `join`/`leave` do WS
6. Zustand: adicionar `onlineUsers: string[]` ao chatStore

**Prioridade:** média — funcionalidade visível e prometida na spec, mas não bloqueia o chat.

---

## DT-008 — WebSocket desconectava imediatamente após upgrade (r.Context() cancelado)

**Origem:** `internal/chat/handler.go` — `ServeWS` lançava goroutines e retornava imediatamente. Ao retornar, `r.Context()` era cancelado pelo `net/http`, e `readPump` tinha `select { case <-ctx.Done(): return }` que disparava antes da primeira mensagem.

**Sintoma:** WS conectava (101) e desconectava em < 300ms em loop — `useWebSocket` entrava em backoff constante. Nenhuma mensagem era enviada ou recebida.

**Correção aplicada:** `client.ReadPump(r.Context())` → `client.ReadPump(context.Background())`. O ciclo de vida da conexão é gerenciado pelo `conn` e pelo `hub.Shutdown()`, não pelo contexto HTTP.

**Status:** ✅ corrigido.

---

## DT-009 — Botão "Enviar" não enviava mensagens (consequência do DT-008)

**Origem:** o botão chamava `onSend(content)` → `window.dispatchEvent(chat:send)` → `useWebSocket` tentava `ws.send()`, mas `ws.readyState` nunca era `OPEN` porque o WS desconectava imediatamente (DT-008).

**Sintoma:** clicar em "Enviar" ou pressionar Enter não produzia nenhum efeito visível. Nenhuma mensagem aparecia na lista.

**Correção aplicada:** fix do DT-008 resolve este item. Com WS estável, o envio funciona.

**Status:** ✅ corrigido junto com DT-008.

---

## DT-010 — UI de chat sem aparência de chat: cores ruins, layout inadequado

**Origem:** implementação inicial focou em estrutura funcional sem refinamento visual. Componentes usavam classes Tailwind genéricas sem coesão, o layout não tinha sidebar de usuários, e as cores 42 não eram aplicadas com contraste adequado.

**Sintomas observados:**
- Sem sidebar de usuários online
- Status de conexão pouco visível
- Botão "Enviar" sem feedback visual de estado (disabled vs. active)
- Área de mensagens sem densidade adequada para um chat
- Input sem indicação de foco
- Cores 42 aplicadas de forma inconsistente

**Correção aplicada (2026-06-29):** redesign completo dos componentes de chat:
- `Chat.tsx`: layout com header + sidebar + área principal + input
- `OnlineSidebar.tsx`: sidebar com lista de logins recentes + indicador verde ●
- `MessageList.tsx`: mensagens densas com avatar, login em teal uppercase, timestamp sutil
- `MessageInput.tsx`: textarea com foco teal + botão com estado visual correto
- Todas as cores via inline styles com paleta 42 explícita (sem Tailwind para evitar purge)

**Status:** ✅ corrigido. Sidebar ainda usa proxy de histórico (ver DT-007 para presença real).

---

## DT-011 — `fetchHistory` acumula mensagens em vez de substituir (duplicação ao navegar)

**Origem:** `frontend/src/stores/chatStore.ts:38` — `fetchHistory` faz:
```ts
messages: [...msgs.reverse(), ...state.messages]
```

**Sintoma:** ao navegar para outra rota e voltar para `/chat`, o `useWebSocket` monta novamente,
`ws.onopen` dispara `fetchHistory(undefined, 50)`, e o Zustand store (persistido entre navegações)
ainda tem as mensagens da sessão anterior. As mesmas 50 mensagens aparecem duplicadas no topo.

**Causa raiz:** duas sub-causas independentes que se combinam:
1. `fetchHistory` sem `before` (initial load) sempre mescla com o estado existente
2. O Zustand store não é resetado entre montagens do `ChatPage`

**Correção esperada:**
```ts
fetchHistory: async (before?: string, limit = 50) => {
  try {
    const msgs = await getMessages(before, limit);
    const sorted = msgs.reverse();
    set((state) => ({
      // Initial load (before=undefined): substituir; load-more: prepend
      messages: before
        ? [...sorted, ...state.messages]
        : sorted,
    }));
  } catch (err) {
    set({ error: err instanceof Error ? err.message : 'Erro ao carregar histórico' });
  }
}
```

**Alternativa defensiva (complementar):** deduplicar por ID em `addMessage`:
```ts
addMessage: (msg) =>
  set((state) => ({
    messages: state.messages.some(m => m.id === msg.id)
      ? state.messages
      : [...state.messages, msg],
  })),
```

**Prioridade:** alta — bug visível ao primeiro uso real.
