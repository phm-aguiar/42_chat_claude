# Plan: 42 Chat Core — Fase 2 (Auth Frontend)

## Metadados
- **Feature:** 100
- **Fase:** 2 — Frontend de autenticação (pós-revisão de spec 2026-06-29)
- **Escopo:** 4 itens ❌ do debt.md DT-004 — todos frontend, backend já funcional

## Contexto

Backend 100% funcional:
- `GET /api/auth/42/callback?code=<code>` → `{ token, user }`
- `GET /api/auth/dev/login?login=<login>` → `{ token, user }` (DEV_MODE=true)
- `GET /api/messages` → 401 sem token Bearer
- `GET /ws?token=<jwt>` → rejeita sem token

Frontend atual: `App.tsx` renderiza `<ChatPage />` diretamente. Sem login, sem routing, sem logout.

---

## ADR-F01 — Router: React Router DOM vs. roteamento manual

**Decisão:** roteamento manual com lógica condicional em `App.tsx` (sem react-router-dom).

**Razão:** MVP tem apenas 3 rotas (`/` login, `/callback`, `/chat`). react-router-dom adiciona ~50kB ao bundle e complexity desnecessária. `window.location.pathname` é suficiente.

**Implementação:**
```tsx
function App() {
  const token = getValidToken();
  const path = window.location.pathname;

  if (path.startsWith('/callback')) return <CallbackPage />;
  if (!token) return <LoginPage />;
  return <ChatPage />;
}
```

**Alternativa rejeitada:** react-router-dom — overhead para 3 rotas.

---

## ADR-F02 — Armazenamento do token: localStorage (mantido)

**Decisão:** `localStorage` — já usado em `useWebSocket` e `lib/api.ts`.

**Razão:** WebSocket não suporta cookies automaticamente. Mudar para cookie httpOnly exigiria refatorar o WS inteiro. Escopo MVP.

---

## ADR-F03 — Validação local do token (sem roundtrip)

**Decisão:** decodificar JWT localmente (base64 decode do payload) para checar `exp`.

```ts
function getValidToken(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }
    return token;
  } catch {
    localStorage.removeItem('token');
    return null;
  }
}
```

**Fallback:** se backend retornar 401, `lib/api.ts` limpa token e força reload.

---

## ADR-F04 — URL OAuth2 construída no frontend

**Decisão:** frontend monta a URL do authorize usando `VITE_42_CLIENT_ID` e `VITE_42_REDIRECT_URI`.

```
https://api.intra.42.fr/oauth/authorize
  ?client_id=<VITE_42_CLIENT_ID>
  &redirect_uri=<VITE_42_REDIRECT_URI>
  &response_type=code
  &scope=public
```

`VITE_42_REDIRECT_URI` deve apontar para `http://localhost:9999` (porta nginx) em dev — a 42 redirecionará para `localhost:9999/callback?code=<code>`, o `CallbackPage` processa.

---

## Fases de Implementação

### Fase 1 — Utilitários de auth
- `frontend/src/lib/auth.ts`: `getValidToken()`, `saveToken(token, user)`, `clearToken()`, `buildOAuthUrl()`

### Fase 2 — Páginas e routing
- `frontend/src/pages/LoginPage.tsx`: botão OAuth2 + dev login condicional
- `frontend/src/pages/CallbackPage.tsx`: extrai `?code=`, chama `/api/auth/42/callback`, salva token, redireciona
- `frontend/src/App.tsx`: substituir `<ChatPage />` direto por routing condicional

### Fase 3 — Logout
- Header em `<ChatPage />` com botão "Sair"
- `clearToken()` + `window.location.replace('/')` + WS se fecha no cleanup do hook

### Critério DONE global
`npm run build` exit 0 + fluxo dev login funcional em `localhost:9999`.

---

## Contratos mantidos

- `useWebSocket` lê `localStorage.getItem('token')` — inalterado
- `authHeader()` em `lib/api.ts` lê `localStorage` — inalterado
- Backend endpoints inalterados
- DS42: border-radius:0, sem rounded-*, paleta 42
