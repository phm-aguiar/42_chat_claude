---
feature_id: 107
slug: msn-discord-reskin
status: accepted
approved: true
author: phm-aguiar
date: 2026-07-05
previous_feature: 105-frontend-revamp
---

# Spec: Reskin MSN/Discord + Presença e Cutucar — Feature 107

## Metadados

- **ID:** 107
- **Status:** accepted
- **Aprovado:** true (2026-07-05 — ordem direta do product owner: "Implement: 42_chat.dc.html" + 3 decisões de escopo registradas abaixo)
- **Autor:** phm-aguiar
- **Data:** 2026-07-05
- **Feature Anterior:** 105-frontend-revamp
- **Design de referência:** `design/DESIGN-REFERENCE.md` (importado do Claude Design via DesignSync)

## Decisões do Product Owner (2026-07-05)

1. **Escopo = app inteiro.** A paleta roxa/rosa, tipografia (Inter + JetBrains Mono) e
   componentes do mockup viram o novo design system. Chat, Hub, Fórum e Login migram.
2. **Cantos arredondados oficializados.** A regra `border-radius: 0` do charter 42 está
   **revogada** — constituição emendada nesta feature.
3. **Cutucar e status MSN integrados de verdade.** Cutucada chega no outro usuário via WS
   (sacode a tela dele); status (Online/Ausente/Ocupado/Invisível/Offline) persiste no
   backend e propaga a todos.

## Propósito

A feature 105 entregou estrutura (shell, hub, badges, auth), mas o visual dark-42 não
agradou o dono do produto, que desenhou no Claude Design a identidade desejada: um híbrido
Discord (rail + sidebar) e MSN Messenger (status, grupos por presença, cutucar, emoticons)
com personalidade própria (`<42_chat/>`, mono-font, gradientes pink). A Feature 107
implementa esse design como sistema e adiciona a camada de presença que ele exige.

## Escopo

### Dentro

**Design system v2 (tokens re-valorados):**
- Manter os NOMES semânticos dos tokens da 105 (`surface-*`, `content-*`, `accent-*`,
  `status-*`) trocando VALORES para a paleta do mockup; adicionar `surface-deep`,
  `surface-chat`, `accent-secondary`, `status-away/busy/invisible` (ver DESIGN-REFERENCE)
- Restaurar escala de radius do Tailwind; remover `border-radius: 0 !important` global
- Fontes Inter + JetBrains Mono (Google Fonts)
- Componentes ui/ reestilizados (Button com gradiente pink, Avatar circular com dot de
  status, Card/Input/Badge arredondados)

**AppShell v2:** title bar (traffic lights decorativos + `<42_chat/>` + "sessão ::
<current_host|42sp>") + rail 72px (Hub/Chat/Fórum, ativo = quadrado pink 14px, morph
radius) substituem a sidebar 64px da 105.

**Chat (layout do mockup):** sidebar 288px com busca "grep contato...", cartão do próprio
usuário com menu de status MSN, chats agrupados por status de presença do interlocutor
(1:1) e seção própria para grupos/general; janela com bolhas (minha = gradiente pink à
direita, deles = raised à esquerda, sistema = central itálico mono), barra de 8 emoticons,
input + "> send", botão "👋 cutucar" no header (1:1).

**Presença (backend):**
- Status escolhido pelo usuário persiste (`users.status`, migration 005 aditiva)
- `PATCH /api/users/me/status` valida enum e propaga `{"type":"status_change",...}` via WS
- Presença efetiva = conexão no hub + status: sem conexão → offline; `invisible` →
  exibido como offline para os demais (nunca vaza o status real)
- Snapshot inicial de presença para o frontend (endpoint ou evento WS on-connect)

**Cutucar (backend):**
- Evento WS inbound `nudge` (só 1:1; valida membership) → entregue ao destinatário via
  `NotifyUsers` + persistido no histórico como mensagem de sistema
- Cooldown anti-spam (mín. 10s por chat, lado servidor)
- Recepção: shake da janela (keyframes) + msg de sistema "X cutucou você!"

**Hub/Fórum/Login:** migram por re-valoração de tokens + ajustes de radius/fontes;
sem mudança estrutural além do novo AppShell.

### Fora

- Canais de texto (Feature 106) — o rail já reserva o `+`
- Foto de perfil custom, mensagens de status editáveis por campo dedicado (a "msg de
  status" do contato no mockup = preview da última mensagem do chat)
- Sons de cutucada/notificação; tema claro; mobile completo
- Winks, jogos e demais recursos do MSN

## Critérios de Sucesso

| # | Critério | Como testar |
|---|----------|-------------|
| 1 | Tokens re-valorados: nenhuma tela com paleta antiga (teal/navy como acento primário) | Varredura visual + grep |
| 2 | Radius liberado: avatares circulares, bolhas 14px, zero `border-radius: 0` global | Inspeção CSS buildado |
| 3 | Status MSN: trocar status propaga para outro usuário logado em <2s | 2 sessões dev |
| 4 | Invisível aparece offline para os outros, mas usa o app normalmente | 2 sessões dev |
| 5 | Cutucar: destinatário recebe shake + msg sistema; histórico persiste | 2 sessões dev |
| 6 | Cooldown de cutucada (10s) responde erro amigável | Cutucar 2x seguidas |
| 7 | Chats 1:1 agrupados por presença; Offline colapsado por padrão; busca filtra | UI |
| 8 | Emoticons concatenam no input; enter envia | UI |
| 9 | Fluxos 105 intactos: login OAuth/dev, hub, badges de não-lidas, fórum autenticado | Roteiro E2E 105 re-executado |
| 10 | Portões: go build/vet/test, npm run build, smoke 12/12 | CI local |

## Constraints

- Migrations aditivas (005+); nunca alterar 001–004
- Hub WS único in-process (nudge/status via `NotifyUsers`/broadcast — sem pub/sub externo)
- Sem libs novas de UI; Google Fonts autorizado (emenda à regra "sem fontes externas")
- IDs API como string UUID; erro padrão `{error, code}`
- **Emenda constitucional (aprovada):** border-radius livre; paleta oficial = mockup;
  tipografia Inter/JetBrains Mono. Charter 42 permanece só como inspiração de conteúdo.

## Dependências

- 105: shell/router/tokens (substituídos in-place), badges e chat_reads (mantidos)
- 103: hub rooms, typing, mensagens (nudge reusa NotifyUsers e messages)
- 106 (futura): rail e `+` já preparados para canais
