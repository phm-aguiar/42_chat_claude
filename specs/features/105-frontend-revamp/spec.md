---
feature_id: 105
slug: frontend-revamp
status: accepted
approved: true
author: phm-aguiar
date: 2026-07-03
previous_feature: 103-ms-graph-messaging
---

# Spec: Frontend Revamp — Feature 105

## Metadados

- **ID:** 105
- **Status:** accepted
- **Aprovado:** true
- **Autor:** phm-aguiar
- **Data:** 2026-07-03
- **Feature Anterior:** 103-ms-graph-messaging
- **Débitos incorporados:** DT-02, DT-03, DT-04, DT-05, DT-06, DT-07, DT-08 (`specs/tech-debt.md`)

---

## Propósito

O 42 Chat funciona (chat multi-room, fórum, 1:1), mas a experiência visual foi construída
ad-hoc por tasks isoladas: preto sobre preto ilegível, headers duplicados, telas sem estados
de vazio/carregamento, fórum exibindo autores "unknown" e acessível sem login. Não existe
uma "casa" — o aluno cai direto no chat sem visão do que está acontecendo na comunidade.

A Feature 105 estabelece o **design system dark** do produto (estilo Discord, identidade 42),
cria o **hub pós-login com atividade** e reveste chat, fórum e login com o novo sistema —
preparando o layout para os canais de texto da Feature 106.

**Decisão de produto (2026-07-03):** o produto é 100% autenticado — sem leitura anônima,
sem anonimato. Isso reverte o "Auth Opcional" dos GETs do fórum (spec 102).

---

## Escopo

### Dentro do escopo

**Design System (fundação):**
- Tokens no `tailwind.config.ts`: 3 níveis de superfície dark (fundo `#1B1B1B` → painel
  `#202026` → card/hover `#29292E`), escala de texto com contraste WCAG AA (primário,
  secundário, desabilitado), acento Teal `#00BABC` (ações/ativo), semânticas (erro Pink
  `#EC3391`, sucesso Green `#2DD57A`), `border-radius: 0` mantido (flat, charter 42)
- Componentes base próprios: `Button`, `Card`, `Input`, `Badge`, `EmptyState`, `Avatar`
  (com fallback), `PageHeader` — sem dependências novas
- Eliminação dos estilos inline nas telas migradas

**App Shell (layout global):**
- Shell única autenticada envolvendo todas as rotas: barra lateral fina de navegação
  (Hub / Chat / Fórum + avatar do usuário) estilo Discord + área de conteúdo
- Header único por página (resolve DT-02) — título reflete o contexto (nome do chat ativo,
  board atual), nunca "42 Chat" duplicado
- Route guard global: sem JWT válido → redirect `/login` (inclui rotas do fórum — DT-05)

**Hub pós-login (`/`):**
- Atalhos primários para Chat e Fórum
- Pulso da comunidade: últimas N threads do fórum (título, board, autor, last_post_at),
  usuários online agora (do hub WS), chats recentes do usuário com badge de não lidas
- Saudação com login/avatar/level do aluno

**Chat (redesign):**
- `Chat.tsx` + `ChatList` unificados no shell (um header, sidebar de conversas à esquerda,
  janela à direita), tipografia/contraste novos, estados vazio/carregando/erro
- Badge de não lidas por chat na ChatList (DT-08): rastreio de leitura por (user, chat) +
  notificação em tempo real de atividade em chat que o usuário participa mas não está aberto
- Typing indicator filtrado por identidade real do JWT, não localStorage (DT-06)

**Fórum (redesign + correções):**
- ForumList/BoardView/ThreadView/NewThread migradas para o design system
- DT-04: autores exibidos com login/avatar reais em threads e posts (enriquecer responses
  dos GETs com dados do autor via JOIN users)
- DT-05: GETs de `/api/forum/*` passam a exigir `AuthRequired` (backend) + route guard

**Login/Callback (redesign):**
- LoginPage como única porta de entrada: identidade 42, botão OAuth2, botão dev quando
  `VITE_DEV_MODE=true` (alinhar env com backend — DT-07)

### Fora do escopo (explicitamente)

- Canais de texto estilo Discord (criação, descoberta, join) — **Feature 106**
- Tema claro / toggle de tema — dark é o único tema
- Responsividade mobile completa — desktop-first (alunos usam os iMacs do campus); apenas
  não-quebrar em janelas estreitas
- Novas funcionalidades de fórum ou chat além do listado (reactions, busca, perfis)
- shadcn/ui ou qualquer biblioteca de componentes nova

---

## Comportamento Esperado

### Cenário Principal: chegada do aluno

1. Aluno acessa qualquer rota sem sessão → redirect `/login`
2. Login via OAuth2 42 (ou dev-login em dev) → redirect para `/` (hub)
3. Hub mostra: saudação, atalhos Chat/Fórum, últimas threads, quem está online,
   seus chats recentes com badges de não lidas
4. Clica em Chat → shell mantém navegação lateral; chat abre com sidebar de conversas
5. Clica em Fórum → mesmas regras; autores visíveis com login/avatar reais

### Cenários Alternativos

- **Não lidas:** usuário A recebe mensagem no 1:1 enquanto navega no fórum → badge
  aparece na navegação lateral (ícone Chat) e na ChatList sem precisar abrir o chat;
  ao abrir a conversa, badge zera
- **Sessão expirada (JWT 12h):** requisição 401 → redirect `/login` com aviso
- **Fórum anônimo:** aba anônima em `/forum/tech` → redirect `/login` (front) e 401 (API)

### Edge Cases

- Usuário sem `image_url` → Avatar com fallback (iniciais do login), nunca imagem quebrada
- Hub com comunidade vazia (0 threads, 0 online) → EmptyStates desenhados, não telas brancas
- Badge de não lidas do "general" (membership implícita, sem linha em `chat_members`)
- Contraste: nenhum texto em superfície dark abaixo de WCAG AA (4.5:1 corpo, 3:1 large)

---

## Constraints

- **Stack:** React 18 + Vite + Tailwind + Zustand — sem bibliotecas novas de UI
- **Monolito/hub único:** notificação de não lidas via hub WS in-process (sem pub/sub externo)
- **Backend mínimo:** só o necessário para hub/badges/autores/auth do fórum; migrations novas
  aditivas (004+), nunca alterar 001–003
- **Charter 42:** paleta oficial, Futura PT com fallback `ui-sans-serif`, cantos retos
- **Backward compat:** APIs existentes não mudam de contrato, exceto a decisão explícita
  de auth obrigatória nos GETs do fórum (quebra intencional, aprovada pelo product owner)
- **Portões:** `go build`, `go vet`, `go test ./...`, `npm run build`, smoke fórum
  (atualizado para enviar auth nos GETs)

---

## Critérios de Sucesso

| # | Critério | Como testar |
|---|----------|-------------|
| 1 | Rota sem sessão redireciona para /login (todas, inclusive /forum/*) | Aba anônima em /, /chat, /forum/tech → /login |
| 2 | GETs do fórum sem token → 401 | `curl /api/forum/boards` sem Bearer |
| 3 | Autores reais no fórum | Thread/post exibem login + avatar; zero "unknown" |
| 4 | Hub mostra threads recentes, online e chats com badge | Login → conferir os 3 blocos com dados reais |
| 5 | Header único por tela | Nenhuma tela com dois headers "42 Chat" |
| 6 | Contraste AA nas telas migradas | Auditoria de pares texto/fundo dos tokens (script ou manual) |
| 7 | Badge de não lidas funciona cross-room | User B recebe msg de 1:1 com o general aberto → badge; abrir conversa → zera |
| 8 | Typing indicator nunca mostra o próprio usuário | Digitar e observar a própria tela |
| 9 | Dev-login visível na UI em dev | `VITE_DEV_MODE=true` → botão na LoginPage |
| 10 | Builds e testes passam + smoke fórum verde | Portões da constituição |

---

## Mudanças de Backend (resumo)

| Mudança | Motivo |
|---------|--------|
| `AuthRequired` nos GETs de `/api/forum/*` | DT-05 (decisão: sem anonimato) |
| GETs de threads/posts retornam `author_login`, `author_image_url` (JOIN users) | DT-04 |
| Rastreio de leitura por (user, chat) — schema no plan (coluna em `chat_members` vs tabela `chat_reads`; precisa cobrir o general implícito) | DT-08 badges |
| `GET /api/chats` retorna `unread_count` por chat | DT-08 |
| Hub: notificação de atividade para membros de um chat independente da room conectada (ex.: índice userID→clients + envio direcionado; decisão no plan) | DT-08 tempo real |
| Endpoint de threads recentes cross-board para o hub (ou reuso com sort/limit) | Hub de atividade |

---

## Dependências

- **100/103 (chat):** consome hub WS, chats, mensagens — sem quebra de contrato
- **102 (fórum):** muda auth dos GETs (intencional) e enriquece responses com autor
- **106 (canais, futura):** o App Shell desta feature é o layout que receberá canais

---

## Checklist de Prontidão

- [x] Propósito e problema claramente definidos
- [x] Escopo dentro/fora explicitado
- [x] Decisão de produto registrada (100% autenticado)
- [x] Débitos técnicos incorporados com referência (DT-02..08)
- [x] Cenários cobrem happy path, alternativos e edge cases
- [x] Constraints herdadas de constitution.md
- [x] Critérios de sucesso mensuráveis
- [x] Aprovação explícita do usuário (HARD-GATE, 2026-07-03)
