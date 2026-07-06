# Plan: Feature 107 — Reskin MSN/Discord + Presença e Cutucar

## Metadados

- **Feature:** 107-msn-discord-reskin
- **Spec:** `spec.md` (Aprovado: true, 2026-07-05)
- **Design:** `design/DESIGN-REFERENCE.md`
- **Data:** 2026-07-05
- **Status:** ready-for-tasks
- **Evidências:** researcher 2026-07-05 (schema 001/003/004, protocolo WS, tokens)

---

## 1. Stack e Dependências

Sem libs novas de código. Google Fonts (Inter + JetBrains Mono) via `<link>` — autorizado
pela emenda constitucional. Backend: migration 005 aditiva; hub estendido in-process.

---

## 2. ADRs

### ADR-107.1 — Tokens re-valorados e consolidação de namespaces

**Contexto:** tokens semânticos da 105 já cobrem o chat; fórum ainda mistura legado
`42-black`/`42-white` (12 arquivos) e `accent-teal` aparece em 18 arquivos.

**Decisão:** manter NOMES semânticos, trocar VALORES (paleta em DESIGN-REFERENCE). Mudanças
de nome: `accent.teal`→`accent.primary` (#ff5fa2), `accent.navy`→`accent.secondary`
(cyan `#35c3dd`); novos: `surface.deep` #120b1a, `surface.chat` #170f22,
`content.onAccent` #1a1020, `content.secondary` #a89fb5 / `muted` #7d7490 (sólidos ≈ alphas
do mockup), `status.online` #3ee08a, `away` #ffcc4d, `busy` #ff4d6d, `invisible` #6b6478,
`offline` #4a4358 (mantém `error`→#ff4d6d, `success`→#3ee08a, `warning`→#ffcc4d).
Migração mecânica via sed: `accent-teal`→`accent-primary`, `accent-navy`→`accent-secondary`,
`42-black`→`content-onAccent`(sobre acento)/`surface-base`(fundo), `42-white`→`content-primary`.
REMOVER blocos legados `"42-*"` e `ft.*` do config (fim do duplo sistema). Gradiente pink:
utility própria `.bg-gradient-accent` (plugin/inline CSS em index.css) usada por Button/bolha.
Radius: apagar overrides do config e o `border-radius: 0 !important` do index.css; escala
default do Tailwind volta a valer. Fontes: `font-sans` Inter, `font-mono` JetBrains Mono.

### ADR-107.2 — Presença: `users.status` + eventos de hub

**Contexto:** não existe presença. Hub tem `usersIndex`+`NotifyUsers` (ADR-105.3). Broadcast
global de presença é aceitável para ~300 usuários (precedente: `user_stats_changed`).

**Decisão:** migration 005: `ALTER users ADD COLUMN status VARCHAR(16) NOT NULL DEFAULT
'online' CHECK (status IN ('online','away','busy','invisible','offline'))` — status
ESCOLHIDO. **Presença efetiva** (única coisa que sai para outros usuários):
`efetiva = (sem conexão no hub) ? offline : (escolhido ∈ {invisible, offline}) ? offline : escolhido`.
Invisible NUNCA vaza. Hub ganha: `OnlineUserIDs() []int`; em register da 1ª conexão do user
→ `Broadcast {"type":"presence","user_id":N,"status":<efetiva>}` (suprimido se efetiva
= offline); em unregister da última conexão → `{"type":"presence","user_id":N,"status":"offline"}`.
REST: `PATCH /api/users/me/status {"status":"away"}` → valida enum, UPDATE, broadcast
`presence` com a nova efetiva; `GET /api/users/presence` → snapshot
`[{user_id,login,status}]` só de quem está conectado (com efetiva ≠ offline), para o load
inicial. Um único tipo de evento (`presence`) cobre online/offline/mudança — sem
`user_online`/`user_offline` separados.

### ADR-107.3 — Typing relay (conserta o gap)

**Decisão:** `readPump` passa a tratar `{"type":"typing"}`: relay
`{"type":"typing","chat_id":roomID,"login":c.login}` via `BroadcastToRoom` (frontend já
filtra o próprio login — DT-06/T013). Sem persistência, sem throttle server-side (o client
já faz debounce 1s).

### ADR-107.4 — Cutucar: WS inbound + `messages.kind`

**Decisão:** migration 005 também: `ALTER messages ADD COLUMN kind VARCHAR(16) NOT NULL
DEFAULT 'text' CHECK (kind IN ('text','nudge'))`. Inbound `{"type":"nudge"}` numa conexão
cuja room é chat `oneOnOne` (≠ general; membership já validada na conexão): persiste
mensagem `kind='nudge'`, `content='👋'`; broadcast na room do payload
`{"type":"nudge","chat_id","from_user_id","from_login", "message":{...}}` + `NotifyUsers`
ao outro membro fora da room (reusa caminho do chat_activity). **Cooldown 10s por
(user,chat)** em memória no hub/handler; violação → `{"type":"error","code":"NUDGE_COOLDOWN"}`
só para o remetente. GETs de mensagens incluem `kind`; frontend renderiza `kind='nudge'`
como mensagem de sistema ("X cutucou você!" / "você cutucou X!") e dispara shake na
recepção em tempo real.

### ADR-107.5 — GET /api/chats ganha dados do interlocutor (1:1)

**Contexto:** a sidebar agrupa 1:1 por presença do interlocutor — o frontend precisa saber
QUEM é o outro membro sem N+1.

**Decisão:** itens `oneOnOne` do `GET /api/chats` ganham `"peer": {"id","login","image_url"}`
via JOIN (mesmo padrão do ADR-105.5). Grupos/general não têm `peer`. Presença do peer vem
do snapshot + eventos `presence` (nunca do REST de chats — evita staleness).

### ADR-107.6 — AppShell v2 e composição do Chat

**Decisão:** AppShell = title bar 44px (traffic lights decorativos, `<42_chat/>` mono,
"sessão :: {current_host || '42sp'}") + rail 72px (Hub `42`, Chat `CH`, Fórum `FR`; ativo =
pink com morph radius; badge de unread agregado no Chat; `+` desabilitado com title
"canais — em breve"). `AuthUser` ganha `current_host?: string` (opcional; backend já tem no
users — incluir no payload de login/dev-login se ainda não vier; fallback '42sp').
Chat: sidebar 288px (busca client-side, cartão próprio com menu de status → PATCH,
seções por presença efetiva do peer para 1:1 [Online/Ausente/Ocupado/Offline, offline
colapsado por padrão] + seção "Salas" fixa para general/grupos), janela com bolhas do
mockup, barra de emoticons (reusa `EMOTICONS_ORDER` de `lib/emoticons.ts` — 8 primeiros),
botão cutucar só em 1:1.

---

## 3. Contratos

### Novos
- `PATCH /api/users/me/status` (auth) body `{"status": "online|away|busy|invisible|offline"}` → 204; inválido → 400 `INVALID_STATUS`
- `GET /api/users/presence` (auth) → `[{"user_id":int,"login":str,"status":"online|away|busy"}]` (só conectados visíveis)
- WS out `{"type":"presence","user_id":int,"status":"online|away|busy|offline"}`
- WS in `{"type":"typing"}` → out `{"type":"typing","chat_id","login"}` (room)
- WS in `{"type":"nudge"}` → out `{"type":"nudge","chat_id","from_user_id","from_login","message":{...}}`; erro `{"type":"error","code":"NUDGE_COOLDOWN"}`
- Mensagens (REST e WS) ganham `"kind":"text|nudge"`

### Alterados
- `GET /api/chats`: itens oneOnOne ganham `"peer":{"id","login","image_url"}`

---

## 4. Auditoria de Constituição (pós-emenda 2026-07-05)

| Regra | Veredito |
|---|---|
| Monolito, sem pub/sub externo | PASS — presença/nudge in-process no hub |
| Sem ORM | PASS — SQL direto |
| Migrations aditivas (005 nova) | PASS — só ADD COLUMN com DEFAULT |
| Soft delete | PASS — nudge vira message normal (deleted_at aplica) |
| Design: tokens semânticos, hex proibido fora do config | PASS — reforçado (remove legado 42-*) |
| Radius livre / paleta mockup | PASS — é a própria emenda |
| Erro padrão `{error, code}` | PASS — INVALID_STATUS, NUDGE_COOLDOWN |

## 5. Riscos

| Risco | Mitigação |
|---|---|
| Broadcast presence em burst de reconexões | evento só na 1ª/última conexão por user; volume 42SP ok |
| Reskin quebrar fluxos 105 (badges/unread) | manter nomes de tokens; roteiro E2E 105 re-executado no fechamento |
| `kind` quebrar consumers de message | DEFAULT 'text' + campo aditivo no JSON |
| Shake/animações em telas antigas | keyframes escopados; só o Chat usa |
