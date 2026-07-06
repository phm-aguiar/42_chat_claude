# Referência de Design — 42_chat.dc.html

Fonte: projeto Claude Design "Chat Discord e MSN com Vite"
(https://claude.ai/design/p/6a0ac20b-81cb-43db-b2f4-b5a0bb58e17e?file=42_chat.dc.html)
Importado em 2026-07-05 via DesignSync. Aprovado pelo product owner como novo
design system do app inteiro (substitui o dark-42 da feature 105).

## Paleta

| Token semântico | Valor | Uso no mockup |
|---|---|---|
| surface.base | `#150e1f` | fundo da janela |
| surface.deep | `#120b1a` | rail de navegação |
| surface.panel | `#1a1226` | sidebar de contatos |
| surface.raised | `#241833` | inputs, avatares inativos, bolha "deles", cartão do usuário |
| surface.hover | `#2b1c3d` | menu de status, hovers |
| surface.chat | `#170f22` | janela de chat (header/footer do chat) |
| content.primary | `#f1ecf7` | texto principal |
| content.secondary | `rgba(241,236,247,0.5)` | subtítulos, última msg |
| content.muted | `rgba(241,236,247,0.35)` | timestamps, @login |
| accent.primary (pink) | `#ff5fa2` → gradiente `linear-gradient(135deg,#ff5fa2,#c23f7f)` | ações primárias, bolha "minha", server ativo, seleção `rgba(255,95,162,0.12)` |
| accent.secondary (cyan) | `oklch(74% 0.17 200)` ≈ `#35c3dd` | avatares alternativos |
| accent.onAccent | `#1a1020` | texto sobre pink/cyan |
| status.online | `#3ee08a` (pulso animado) | dot online |
| status.away | `#ffcc4d` | Ausente |
| status.busy | `#ff4d6d` | Ocupado |
| status.invisible | `#6b6478` | Invisível |
| status.offline | `#4a4358` | Offline |
| header gradient | `linear-gradient(180deg,#3a1f57,#241335)` | title bar |
| borders | `rgba(255,255,255,0.06..0.1)` | divisórias |

## Tipografia
- UI: **Inter** (400/500/600/700)
- Código/branding/timestamps/labels técnicos: **JetBrains Mono** (400-700)
- Google Fonts autorizado (o comentário "sem fontes externas" do index.css fica obsoleto)

## Radius (constituição EMENDADA: border-radius liberado)
- Avatares e dots: `50%` (rounded-full)
- Bolhas: `14px` com canto "rabinho" `4px` no lado do autor
- Inputs: `8–10px` · cartões/menus: `10px` · rows: `8px` · emoticon: `6px`
- Server ativo: morph `50% → 14px` (transição .15s)

## Estrutura (1440×900 desktop-first)
1. **Title bar 44px**: traffic lights decorativos, logo `<42_chat/>` (JetBrains Mono bold), à direita "sessão :: <host> :: 42sp"
2. **Rail 72px** (`surface.deep`): ícones 44px circulares (ativos viram quadrado 14px pink), divisória, botão `+`
3. **Sidebar 288px** (`surface.panel`): label da seção (mono 11px), busca "grep contato...", cartão do próprio usuário (avatar 38, nome + dot de status, msg de status, @login) que abre menu de status MSN (Online/Ausente/Ocupado/Invisível/Offline), lista de contatos agrupada por status com headers colapsáveis (chevron ▸ rotaciona 90°, contagem "— N")
4. **Chat**: header 60px (avatar 40 + dot 11, nome, status-msg, @login, botão "👋 cutucar" pink-ghost), mensagens (bolhas max-width 60%, minhas à direita com gradiente pink, deles à esquerda raised; sistema: central itálico mono; timestamp 10.5px mono abaixo), footer com barra de 8 emoticons (😄😉😂❤️😎🤔👍🔥) + input + botão "> send" (gradiente pink, mono)

## Comportamentos
- **Cutucar**: shake da janela de chat (keyframes shake42, .5s) + mensagem de sistema "você cutucou X!" — DECISÃO: integrado via WS (o outro lado sacode e vê "X cutucou você!")
- **Status MSN**: escolhido no menu do próprio cartão — DECISÃO: persiste no backend e propaga a todos via WS; "Invisível" aparece como offline para os outros
- **Dot online**: animação pulseDot42 (2s infinite)
- **Grupos por status**: Offline começa colapsado; grupos vazios somem
- **Busca**: filtra por nome e login
- **Emoticon**: clique concatena no input

## Mapeamento mockup → app real
- "Servers" do rail (Home/Piscine/CC/PC/EV) → navegação do app: Hub, Chat, Fórum (+ futuro canais F106); `+` reservado p/ F106
- "Contatos" → chats do usuário (1:1 = outro membro; grupos = topic; general fixo)
- Msg de status do contato → última mensagem do chat (preview) ou status-message do usuário
- Dados fake do mockup NUNCA entram no app — tudo vem da API/WS
