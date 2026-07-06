# E2E Roteiro Manual — Feature 105 (Frontend Revamp)

## Pré-requisitos

1. **Ambiente de execução:**
   - Docker Compose rodando: `docker compose up -d`
   - Backend saudável: `curl -s http://localhost:9999/api/auth/dev/login?login=marvin` retorna JWT
   - Frontend acessível em `http://localhost:9999` (porta pública via nginx)

2. **Dev Mode habilitado:**
   - `.env` na raiz do repo com `VITE_DEV_MODE=true` (habilita botão dev-login na UI)
   - Backend com `DEV_MODE=true` (ativa endpoints `/api/auth/dev/login?login=<user>`)

3. **2 usuários de teste dev:**
   - **User A:** `testuser-a` (login via dev-login)
   - **User B:** `testuser-b` (login em aba separada / cookie diferente)
   - Ambos conseguem acessar a API e participam de chats/fórum

4. **Dados iniciais:**
   - 5 boards seeded: tech, projects, career, events, random (via migration 002)
   - General chat implícito e disponível (migration 003)
   - 0 ou mais threads/mensagens iniciais (não afeta testes)

---

## Cenários de Teste

### Critério 1: Rota sem sessão redireciona para /login (todas as rotas)

**Pré-requisito:** aba anônima (sem cookies, sem JWT no localStorage)

1. Abra aba anônima e navegue para `http://localhost:9999/`
   - **Esperado:** redirect automático para `/login`, NOT mostrando conteúdo da hub

2. Na mesma aba anônima, navegue para `http://localhost:9999/chat`
   - **Esperado:** redirect automático para `/login`

3. Na mesma aba anônima, navegue para `http://localhost:9999/forum`
   - **Esperado:** redirect automático para `/login`

4. Na mesma aba anônima, navegue para `http://localhost:9999/forum/tech`
   - **Esperado:** redirect automático para `/login`

**Evidência de PASS:** Todas 4 rotas redirecionam para `/login` em 3s (máximo)

- [ ] `/` redireciona para `/login`
- [ ] `/chat` redireciona para `/login`
- [ ] `/forum` redireciona para `/login`
- [ ] `/forum/tech` redireciona para `/login`

---

### Critério 2: GETs do fórum sem token → 401

**Execução:**

1. Terminal: execute curl sem Bearer token

```bash
curl -s http://localhost:9999/api/forum/boards
```

**Esperado:**
- HTTP 200? Não
- HTTP 401? Sim
- Body contém `"code":"MISSING_TOKEN"` ou `"code":"UNAUTHORIZED"`? Sim
- Nenhum board no response

2. Verifique erro específico:

```bash
curl -s http://localhost:9999/api/forum/boards | grep -q "MISSING_TOKEN" && echo "PASS: MISSING_TOKEN" || echo "FAIL"
```

**Evidência de PASS:** `PASS: MISSING_TOKEN`

- [ ] Curl sem token retorna 401
- [ ] Mensagem de erro está presente

---

### Critério 3: Autores reais no fórum (login + avatar)

**Pré-requisito:** User A logado (dev-login como `testuser-a`)

1. Login em `http://localhost:9999/login` → clique botão "Dev Login"
   - Insira login: `testuser-a`
   - Aperte Enter ou clique confirmar
   - Esperado: redirect para `/` (hub) e sessão ativa

2. Navegue para `/forum` → clique board `tech`
   - Se houver threads do smoke test, veja a primeira
   - **Esperado:** thread exibe:
     - `author_login`: "testuser" (ou "testuser-a" conforme seed)
     - `author_image_url`: URL da imagem (ou campo vazio se 42 retornar null)
     - Nenhum campo `author_login` com valor "unknown" ou "null" ou vazio

3. Clique na thread para abrir a thread view
   - **Esperado:** comentários/posts exibem:
     - Avatar do autor (com fallback para iniciais se image_url vazio)
     - Login do autor visível (não "unknown")
     - Data/hora do post

4. Terminal: obtenha GET de threads com token

```bash
TOKEN=$(curl -s "http://localhost:9999/api/auth/dev/login?login=marvin" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:9999/api/forum/boards/tech/threads" | jq '.[0] | {author_login, author_image_url}'
```

**Esperado:**
```json
{
  "author_login": "testuser",
  "author_image_url": "..."
}
```

(autor_login não vazio, não "unknown")

**Evidência de PASS:** 

- [ ] Threads exibem `author_login` real
- [ ] Posts exibem `author_login` real
- [ ] Avatar com fallback funciona (iniciais visíveis se image_url vazio)
- [ ] Nenhum "unknown" em tela

---

### Critério 4: Hub mostra threads recentes, online e chats com badge

**Pré-requisito:** User A logado em `http://localhost:9999/` (hub)

1. Observar página `/` após dev-login:
   - **Bloco 1 — Saudação:** "Bem-vindo, testuser-a" (login + avatar + level)
     - [ ] Login visível
     - [ ] Avatar renderizado (com fallback se necessário)
     - [ ] Level da 42 visível (ex: "Nível 21")

2. **Bloco 2 — Últimas threads do fórum:**
   - [ ] Seção "Atividade Recente" ou "Últimas Threads" presente
   - [ ] Se houver threads (do smoke test), mostra: título, board, autor, timestamp
   - [ ] Se zero threads, exibe EmptyState com CTA para ir ao fórum (não tela branca)
   - [ ] Clique em uma thread → abre em `/forum/{slug}/thread/{id}`

3. **Bloco 3 — Usuários online agora:**
   - **Nota conhecida:** Este bloco exibe EmptyState com CTA (fonte de online só existe na página de chat)
   - [ ] EmptyState visível com mensagem "Ninguém online agora" ou similar
   - [ ] CTA linking para `/chat` (ou ícone Chat na sidebar)
   - [ ] **Comportamento esperado:** não é um bug; será preenchido pela Feature 106 ou quando integrado com o WS de chat

4. **Bloco 4 — Chats recentes com badge:**
   - [ ] Lista de chats recentes (ex: "general", "1:1 com bob", etc) visível
   - [ ] Se houver não lidas, mostra badge com número
   - [ ] Se não houver chats, exibe EmptyState com CTA

**Evidência de PASS:**

- [ ] Saudação com login, avatar, level presente
- [ ] Bloco de threads recentes presente (ou EmptyState)
- [ ] Bloco de online mostra EmptyState como esperado
- [ ] Bloco de chats presente com badges funcionando

---

### Critério 5: Header único por tela (nenhuma duplicação)

**Pré-requisito:** User A logado em `/`

1. Inspecione página `/` (hub):
   - [ ] Um único header principal no topo
   - [ ] Nenhum "42 Chat" duplicado
   - [ ] Título reflete contexto (ex: "Hub", "Início", etc)

2. Navegue para `/chat`:
   - [ ] Um único header no topo
   - [ ] Título reflete contexto (ex: "Chat" ou nome do chat ativo, ex: "general")
   - [ ] Nenhuma duplicação visual (não 2 headers side-by-side)

3. Navegue para `/forum`:
   - [ ] Um único header
   - [ ] Título: "Fórum" ou lista de boards
   - [ ] Nenhuma duplicação

4. Navegue para `/forum/tech`:
   - [ ] Um único header
   - [ ] Título: "Tecnologia & Inovação" (nome do board)
   - [ ] Nenhuma duplicação

5. Abra um thread em `/forum/tech/thread/{id}`:
   - [ ] Um único header
   - [ ] Título: nome da thread ou "Discussão"
   - [ ] Nenhuma duplicação

**Evidência de PASS:**

- [ ] Hub tem 1 header
- [ ] Chat tem 1 header
- [ ] Forum list tem 1 header
- [ ] Board view tem 1 header
- [ ] Thread view tem 1 header

---

### Critério 6: Contraste AA nas telas migradas

**Método:** Auditoria manual de 2 telas-chave (hub + thread view)

**Pré-requisito:** Firefox DevTools ou Chrome DevTools com accessibility tab

1. Abra `/` (hub) em Firefox/Chrome
2. Abra DevTools → Accessibility/Color Contrast tab
3. Selecione textos-chave:
   - Títulos (headers, nomes de threads)
   - Corpo de texto (descrições, timestamps)
   - Links e CTAs
4. Verifique score WCAG:
   - [ ] Texto em destaque (18px+, bold): contraste ≥ 3:1
   - [ ] Texto normal (14px, normal weight): contraste ≥ 4.5:1
   - Nenhum texto em superfícies dark sem contraste adequado

5. Repita para `/forum/tech/thread/{id}` (conteúdo, comentários):
   - [ ] Títulos de posts têm contraste ≥ 3:1
   - [ ] Conteúdo de posts tem contraste ≥ 4.5:1
   - [ ] Metadata (autor, timestamp) tem contraste ≥ 4.5:1

**Evidência de PASS:**

- [ ] Hub: nenhum texto com contraste < 3:1 (large) ou < 4.5:1 (normal)
- [ ] Thread: nenhum texto com contraste < 3:1 (large) ou < 4.5:1 (normal)

---

### Critério 7: Badge de não lidas funciona cross-room

**Pré-requisito:** 2 abas/janelas: User A (aba 1) e User B (aba 2)

**Setup:**

1. **Aba 1 — User A:** Login como `testuser-a`, navegue para `/chat`
   - Selecione chat "general" (conversation aberta)
   - [ ] Chat está aberto e visível na tela principal

2. **Aba 2 — User B:** Login como `testuser-b` em janela separada
   - Navegue para `/` (hub) ou `/forum`
   - [ ] **Sidebar de navegação visível com ícone Chat**
   - Nenhuma badge no ícone Chat inicialmente (ou mostra 0)

**Execução:**

3. **Aba 2 (User B):** Procure chat 1:1 com User A (ou abra nova conversa se não existe)
   - Clique no campo de input
   - Digite: "Test message from B to A"
   - Envie a mensagem

4. **Aba 1 (User A):** Observar badge no ícone Chat (sidebar)
   - **Esperado:** Badge aparece com número "1" (ou contador correto) no ícone Chat na sidebar
   - Mesmo tendo o "general" aberto, a badge deve aparecer no ícone de navegação
   - [ ] Badge visível sem recarregar página

5. **Aba 1 (User A):** Clique no ícone Chat na sidebar
   - [ ] ChatList abre/se expande
   - [ ] Chat "1:1 com testuser-b" (ou similar) mostra badge "1"

6. **Aba 1 (User A):** Clique no chat "1:1 com testuser-b"
   - [ ] Conversa abre
   - [ ] Mensagem "Test message from B to A" visível
   - [ ] Badge desaparece após abrir (ou zera para 0)

7. **Aba 2 (User B):** Nenhuma alteração esperada (User B enviou, não recebe propria mensagem como não lida)

**Evidência de PASS:**

- [ ] Badge aparece no ícone Chat quando mensagem é recebida em room diferente
- [ ] Badge desaparece ao abrir o chat
- [ ] Funciona sem F5 (tempo real via WS)

---

### Critério 8: Typing indicator nunca mostra o próprio usuário

**Pré-requisito:** 2 abas/janelas: User A (aba 1) e User B (aba 2)

**Setup:**

1. **Aba 1 (User A):** Login, abra chat 1:1 com User B
2. **Aba 2 (User B):** Login, abra mesmo chat 1:1 com User A

**Execução:**

3. **Aba 1 (User A):** Comece a digitar no input (sem enviar)
   - [ ] "testuser-a is typing..." ou similar **NÃO aparece** na tela de A
   - [ ] Typing indicator mostra apenas outros usuários (se houver)

4. **Aba 2 (User B):** Observar tela
   - [ ] "testuser-a is typing..." aparece (ou indicador de digitação)

5. **Aba 1 (User A):** Envie mensagem
   - [ ] Typing indicator desaparece em ambas abas (A deixou de digitar)

6. **Aba 2 (User B):** Comece a digitar
   - [ ] "testuser-b is typing..." **NÃO aparece** em B (tela de B mesma)
   - [ ] Apenas mostra outros digitando

7. **Aba 1 (User A):** Observar
   - [ ] "testuser-b is typing..." aparece

**Evidência de PASS:**

- [ ] Typing indicator de User A não aparece em tela de User A
- [ ] Typing indicator de User B não aparece em tela de User B
- [ ] Typing indicator **de outro usuário** aparece corretamente em ambas abas

---

### Critério 9: Dev-login visível na UI em dev

**Pré-requisito:** `.env` com `VITE_DEV_MODE=true` (verificar: `cat .env | grep VITE_DEV_MODE`)

1. Abra `http://localhost:9999/login` em aba anônima (ou limpe localStorage)
   - [ ] Página de login exibe: identidade 42 visual, botão OAuth2

2. **Com VITE_DEV_MODE=true:**
   - [ ] Um segundo botão "Dev Login" ou "Entrar com Conta de Teste" presente
   - [ ] Botão com campo input para login (ex: `<input placeholder="login..."/>`)

3. Clique botão "Dev Login":
   - Insira `testuser-dev`
   - [ ] Após clique, redirect para `/` (hub)
   - [ ] Sessão ativa com user `testuser-dev`

4. Logout e volte para `/login`:
   - [ ] Botão dev-login ainda está lá

**Sem VITE_DEV_MODE ou VITE_DEV_MODE=false:**

5. Abra `http://localhost:9999/login`:
   - [ ] **Nenhum botão de dev-login** (apenas OAuth2)

**Evidência de PASS:**

- [ ] Dev-login visível quando `VITE_DEV_MODE=true`
- [ ] Dev-login funciona (login sem OAuth2)
- [ ] Dev-login **escondido** quando `VITE_DEV_MODE=false`

---

### Critério 10: Builds e testes passam + smoke fórum verde

**Execução:**

1. **Go build:**

```bash
cd /home/zeenyt__/Projetos/42_chat_claude && go build ./...
```

- [ ] Zero erros, zero warnings

2. **Go vet:**

```bash
go vet ./...
```

- [ ] Zero erros

3. **Frontend build:**

```bash
cd frontend && npm run build
```

- [ ] Zero erros
- [ ] Saída: `dist/` com `index.html` e assets

4. **Smoke test fórum (12 casos):**

```bash
bash tests/forum_smoke_test.sh
```

**Esperado:**
```
Resumo: 12 PASS, 0 FAIL
```

- [ ] 12 PASS, 0 FAIL

**Evidência de PASS:**

- [ ] `go build ./...` — OK
- [ ] `go vet ./...` — OK
- [ ] `npm run build` — OK (no warnings bloqueadores)
- [ ] Smoke test — 12 PASS, 0 FAIL

---

## Resumo Executivo

| Critério | Status | Observações |
|----------|--------|------------|
| 1. Redirect anônimo → /login | - [ ] | Todas 4 rotas |
| 2. GET sem token → 401 | - [ ] | `curl /api/forum/boards` sem Bearer |
| 3. Autores reais no fórum | - [ ] | Login + avatar em threads/posts, zero "unknown" |
| 4. Hub com 3 blocos | - [ ] | Saudação, threads recentes, online (EmptyState OK), chats com badge |
| 5. Header único | - [ ] | 5 telas: /, /chat, /forum, /forum/tech, thread |
| 6. Contraste AA | - [ ] | Auditoria manual de hub + thread view |
| 7. Badge cross-room | - [ ] | User B manda msg enquanto User A em room diferente |
| 8. Typing sem own user | - [ ] | User A digita, não vê "A is typing" em própria tela |
| 9. Dev-login na UI | - [ ] | Visível em dev, escondido em prod |
| 10. Builds + smoke | - [ ] | `go build`, `go vet`, `npm run build`, smoke 12/12 |

---

## Notas

- **Ambiente:** Docker Compose roda o servidor e banco limpos a cada run. Reuse containers para testes sequenciais.
- **Dev users:** Crialize com `/api/auth/dev/login?login=<username>` — criá usuários com IDs 42 fixos (veja seed no plan).
- **Timestamps:** Todos os timestamps em UTC (Z suffix). Timezone do cliente não afeta testes.
- **Browser storage:** Dev-login salva JWT em localStorage; logout limpa. Aba anônima não tem localStorage (garante redirect).
- **Nota de design:** Hub "Online agora" mostra EmptyState porque a fonte de dados de online vem da página de chat (WS event), não da hub. Esperado para MVP; será integrado em futuras features.

---

**Data do roteiro:** 2026-07-06  
**Feature:** 105 (Frontend Revamp)  
**Responsável:** Executor (teste manual)  
