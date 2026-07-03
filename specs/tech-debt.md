# Débitos Técnicos

Registro vivo de débitos conhecidos. Cada item: sintoma → causa (se diagnosticada) → correção sugerida.
Itens são removidos quando resolvidos (referenciar commit/feature na remoção).

Atualizado: 2026-07-03

---

## DT-01 · ✅ RESOLVIDO (2026-07-03) — Mensagens de chat 1:1 vazavam para o "general"

- **Feature:** 103 | **Arquivo:** `frontend/src/hooks/useWebSocket.ts`
- **Causa:** ao trocar `activeChat`, o `ws.onclose` do socket antigo agendava `connect()` com closure stale (general) e sobrescrevia `wsRef.current` — envios seguintes iam para a room errada.
- **Fix aplicado:** guard por instância em `onopen`/`onerror`/`onclose` (`wsRef.current !== ws` → ignora), fechamento intencional zera `wsRef` antes do `close()`, timer de backoff cancelado no cleanup.

## DT-02 · 🟡 UX — Header duplicado no chat

- **Feature:** 103 | **Arquivos:** `frontend/src/pages/Chat.tsx`, `frontend/src/pages/chat/ChatList.tsx`
- **Sintoma:** "42 Chat — general" no topo e "42 Chat / Conversations" logo abaixo na sidebar.
- **Causa:** o header da Feature 100 (Chat.tsx) foi mantido e o ChatList (T017) trouxe header próprio; a integração (T018 + wire-up) não unificou.
- **Correção sugerida:** um único header de aplicação; o título da janela de mensagens deve refletir o chat ativo (topic/login do interlocutor), não "42 Chat" de novo.

## DT-03 · 🟡 UX/Design — Contraste e legibilidade ruins no tema escuro

- **Features:** 100–103 (geral) | **Arquivos:** estilos inline espalhados + `frontend/src/index.css`
- **Sintoma:** cores escuras sobre escuras, textos difíceis de ler.
- **Causa:** paleta DS42 aplicada ad-hoc por task/worker, sem sistema (muitos estilos inline, ex.: texto `#29292E` sobre fundo `#1B1B1B` no placeholder do ChatList).
- **Correção sugerida:** centralizar tokens de cor/tipografia (Tailwind theme), auditar contraste (WCAG AA), definir onde aplicar paleta "Sleek" vs "Minimalist". Candidata a ser resolvida na feature de frontend (104).

## DT-04 · 🟠 BUG — Fórum exibe autores como "unknown" mesmo logado

- **Feature:** 102 | **Suspeitos:** `frontend/src/lib/forumApi.ts` (auth header), handlers de forum (JOIN de autor)
- **Sintoma:** threads/posts mostram "unknown" no lugar do login do autor, mesmo com sessão ativa no chat.
- **Diagnóstico pendente:** verificar se (a) o frontend do fórum envia o Bearer token, (b) os handlers GET retornam login/image_url do autor (JOIN users), (c) o componente lê o campo certo.
- **Correção sugerida:** após diagnóstico; provavelmente enriquecer response dos GETs de threads/posts com dados do autor.

## DT-05 · 🟠 DECISÃO — Fórum acessível sem autenticação

- **Feature:** 102 | **Rotas:** GETs de `/api/forum/*` + rotas frontend `/forum`
- **Sintoma:** aba anônima acessa o fórum direto, sem passar por login.
- **Contexto:** o spec 102 define GETs como "Auth Opcional" (leitura pública era intencional no backend). Frontend não tem route guard.
- **DECISÃO (2026-07-03, product owner):** fórum NÃO é público — todo acesso autenticado, sem anonimato. Corrigir: GETs do fórum passam a exigir auth (backend) + route guard nas rotas `/forum` (frontend). Entra no escopo da feature 105 junto com o DT-04.

## DT-06 · 🟢 MENOR — Typing indicator pode exibir o próprio usuário

- **Feature:** 103 | **Arquivo:** `frontend/src/hooks/useWebSocket.ts:99`
- **Sintoma potencial:** o filtro usa `localStorage.getItem('userLogin')`; se essa chave nunca é escrita no login, o usuário vê o próprio "está digitando...".
- **Correção sugerida:** confirmar escrita de `userLogin` no fluxo de auth ou filtrar pelo `user_id` do JWT decodificado.

## DT-07 · 🟢 MENOR — `VITE_DEV_MODE=false` no build do nginx

- **Infra** | **Arquivo:** `.env`
- **Sintoma:** botão de dev-login não aparece na UI servida pelo nginx, apesar de `DEV_MODE=true` no backend (login dev só via URL direta da API).
- **Correção sugerida:** alinhar `VITE_DEV_MODE` com `DEV_MODE` no ambiente de dev e rebuildar o nginx.

## DT-08 · 🟢 MENOR — Destinatário só recebe mensagem de 1:1 se estiver na room

- **Feature:** 103 (limitação de design, 1 room por conexão WS)
- **Sintoma:** se o usuário B está com o general aberto, não recebe em tempo real mensagens enviadas no 1:1 com A (só ao abrir a conversa, via fetch de histórico).
- **Contexto:** ADR-103.1/103.5 fixam 1 room por conexão. Notificação cross-room (badge de não lidas, contador) não foi especificada.
- **Correção sugerida:** candidata à próxima feature de chat — evento de notificação global leve (`new_message_in <chat_id>`) via broadcast global ou múltiplas rooms por conexão.
