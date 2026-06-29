---
feature: 100
fase: 2
graph-operators: enabled
max-rounds: 20
heartbeat-threshold: 4
---

# Tasks: 42 Chat Core — Fase 2 (Auth Frontend)

> 5 tasks atômicas. Sliding window ≤ 3. Arquivos disjuntos entre paralelas.
> Backend inalterado — todas as tasks são frontend-only.

---

## Bloco A — Utilitários

### T101 — lib/auth.ts: getValidToken, saveToken, clearToken, buildOAuthUrl
- **Papel:** executor
- **Dependências:** Nenhuma
- **Paralelizável:** Sim
- **Arquivos:**
  - `frontend/src/lib/auth.ts`
- **Critério DONE:** `npm run build` exit 0; `grep "getValidToken\|saveToken\|clearToken\|buildOAuthUrl" frontend/src/lib/auth.ts` retorna 4 linhas; `grep "localStorage" frontend/src/lib/auth.ts` retorna linhas de get/set/remove; `grep "api.intra.42.fr/oauth/authorize" frontend/src/lib/auth.ts` retorna linha com URL base.

---

## Bloco B — Páginas

### T102 — LoginPage.tsx
- **Papel:** executor
- **Dependências:** T101
- **Paralelizável:** Não
- **Arquivos:**
  - `frontend/src/pages/LoginPage.tsx`
- **Critério DONE:** `npm run build` exit 0; `grep "buildOAuthUrl\|VITE_42_CLIENT_ID" frontend/src/pages/LoginPage.tsx` retorna linha; `grep "VITE_DEV_MODE\|import.meta.env" frontend/src/pages/LoginPage.tsx` retorna linha (botão dev condicional); `grep "rounded-" frontend/src/pages/LoginPage.tsx` retorna vazio; `grep "Entrar com a 42\|Intra" frontend/src/pages/LoginPage.tsx` retorna texto do botão.

---

### T103 — CallbackPage.tsx
- **Papel:** executor
- **Dependências:** T101
- **Paralelizável:** Sim (com T102 — arquivos disjuntos)
- **Arquivos:**
  - `frontend/src/pages/CallbackPage.tsx`
- **Critério DONE:** `npm run build` exit 0; `grep "URLSearchParams\|searchParams\|location.search" frontend/src/pages/CallbackPage.tsx` retorna linha de extração do `code`; `grep "/api/auth/42/callback" frontend/src/pages/CallbackPage.tsx` retorna linha de fetch; `grep "saveToken\|localStorage" frontend/src/pages/CallbackPage.tsx` retorna linha; `grep "window.location\|replace\|/chat" frontend/src/pages/CallbackPage.tsx` retorna linha de redirecionamento pós-auth.

---

## Bloco C — Wiring

### T104 — App.tsx: routing condicional + logout no ChatPage
- **Papel:** executor
- **Dependências:** T102, T103
- **Paralelizável:** Não
- **Arquivos:**
  - `frontend/src/App.tsx`
  - `frontend/src/pages/Chat.tsx`
- **Critério DONE:** `npm run build` exit 0; `grep "getValidToken\|CallbackPage\|LoginPage" frontend/src/App.tsx` retorna linhas de routing; `grep "callback\|/chat\|LoginPage\|ChatPage" frontend/src/App.tsx` retorna lógica de path; `grep "Sair\|logout\|clearToken" frontend/src/pages/Chat.tsx` retorna botão de logout; `grep "rounded-" frontend/src/App.tsx frontend/src/pages/Chat.tsx` retorna vazio.

---

## Bloco D — QA

### T105 — Smoke test manual + build final
- **Papel:** executor
- **Dependências:** T104
- **Paralelizável:** Não
- **Arquivos:** nenhum novo (apenas validação)
- **Critério DONE:**
  - `go build ./...` exit 0
  - `go vet ./...` exit 0
  - `cd frontend && npm run build` exit 0
  - `grep "getValidToken" frontend/src/App.tsx` retorna linha
  - `grep "CallbackPage" frontend/src/App.tsx` retorna linha
  - `grep "LoginPage" frontend/src/App.tsx` retorna linha
  - `grep "clearToken\|Sair" frontend/src/pages/Chat.tsx` retorna linha
  - `grep "buildOAuthUrl" frontend/src/pages/LoginPage.tsx` retorna linha
  - `grep "saveToken" frontend/src/pages/CallbackPage.tsx` retorna linha

---

## Resumo DAG

| Task | Bloco | Dependências | Paralelo com |
|------|-------|--------------|--------------|
| T101 | A — Utilitários | — | — |
| T102 | B — Páginas | T101 | T103 |
| T103 | B — Páginas | T101 | T102 |
| T104 | C — Wiring | T102, T103 | — |
| T105 | D — QA | T104 | — |

### Caminho crítico
```
T101 → T102 → T104 → T105
       T103 ──┘
```

Rounds estimados: 4–6. Margem segura dentro de `max-rounds: 20`.
