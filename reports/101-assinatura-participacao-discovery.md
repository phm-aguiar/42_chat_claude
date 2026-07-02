# Discovery Report: Assinatura de Participação (User Signature)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | 101 |
| **Slug** | assinatura-participacao |
| **Status** | accepted |
| **Autor** | phm-aguiar |
| **Data original** | 2026-06-17 |
| **Revisão** | 2026-06-30 — discovery report para planejamento (feature não implementada) |
| **Versão** | 1.0 |
| **Spec derivada** | `specs/features/101-assinatura-participacao/spec.md` |
| **Aprovado** | true |

---

## 1. Contexto e Problema

O 42 Chat Core (Feature 100) já entrega mensagens em tempo real e identidade via OAuth2 42,
mas as mensagens são "planas" — não há marcador de reputação ou engajamento comunitário. Num
campus de ~300 alunos, saber quem contribui ativamente ajuda a construir confiança (ex: quem
responde muitas dúvidas técnicas vira referência).

A Feature 101 adiciona uma **assinatura de participação** inline abaixo de cada mensagem, no
estilo de fóruns/chans clássicos: avatar, login, tier de participação e total de mensagens.
É a primeira feature de "identidade comunitária" e pavimenta o caminho para o badge de título
do fórum (Feature 102) e para os chats tipados (Feature 103).

### Usuários Impactados

- **Primários:** ~300 alunos autenticados no 42 Chat
- **Secundários:** nenhum — a assinatura é puramente de leitura, pública

### Situação Atual (sem a feature)

Mensagens no chat não têm contexto sobre o autor além de login + avatar. Não há sinal de
quão ativo alguém é na comunidade.

### Por que agora

Feature 100 já tem `messages` (com `user_id`, `created_at`) e o hub WebSocket. A assinatura é
um incremento de baixo risco: um endpoint de stats agregados + um componente React + um evento
WS. Não toca no schema de mensagens.

---

## 2. Objetivos e Não-Objetivos

### Objetivos

- Componente `UserSignature` reutilizável (chat hoje, fórum amanhã)
- Endpoint `GET /api/users/{id}/stats` com agregados do usuário
- Tiers de participação: novato → iniciante → participante → veterano
- Atualização em tempo real via evento WS `user_stats_changed` (com debounce)
- Placeholder "novato" para usuários sem atividade

### Não-Objetivos (explícitos)

- Gráficos/charts temporais — v2
- Ranking/leaderboard entre usuários — v2
- Página de perfil dedicada `/perfil/@login` — a assinatura é inline
- Badges/conquistas complexos — apenas o tier
- Edição de perfil (foto, bio) — isso é a intra 42, não a assinatura

---

## 3. Requisitos

### Funcionais (RF)

| # | Requisito | Prioridade |
|---|-----------|-----------|
| RF-01 | `GET /api/users/{id}/stats` retorna `{ total_messages, active_rooms, tier, tier_label }` | Must |
| RF-02 | Stats computados por query SQL agregada em `messages` (sem tabela materializada) | Must |
| RF-03 | Tier derivado do total: 0=novato, 1–50=iniciante, 51–200=participante, 201+=veterano | Must |
| RF-04 | Componente `UserSignature` renderiza avatar, login, tier, total abaixo de cada mensagem | Must |
| RF-05 | Placeholder reduzido "novato" para usuário com 0 mensagens | Must |
| RF-06 | Evento WS `user_stats_changed` emitido quando um usuário envia mensagem | Must |
| RF-07 | Frontend re-fetcha stats do autor ao receber `user_stats_changed` | Must |
| RF-08 | Debounce de 2s no backend para evitar rajada de eventos em flood | Must |
| RF-09 | Ao reconectar o WS, frontend puxa estado fresco via `GET /api/users/{id}/stats` | Should |
| RF-10 | Avatar fallback para default do sistema 42 quando `image_url` é nulo | Should |
| RF-11 | Endpoint retorna 404 para usuário inexistente | Must |

### Não-Funcionais (RNF)

| # | Requisito | Métrica |
|---|-----------|---------|
| RNF-01 | Stats consistentes com queries diretas no banco (zero discrepância) | Teste de integração |
| RNF-02 | Suporta 50+ usuários simultâneos vendo atualizações em tempo real | Teste de carga leve |
| RNF-03 | `UserSignature` com altura fixa — sem layout shift no chat | Visual constraint |
| RNF-04 | Sem coluna nova em `messages` — reusa schema da migration 001 | Constraint de schema |
| RNF-05 | `border-radius: 0`, paleta DS42 | Visual constraint |

---

## 4. Cenários Gherkin

### Cenários de Sucesso

```gherkin
# language: pt-BR

Funcionalidade: Assinatura de Participação

  Cenário: Assinatura renderiza abaixo de uma mensagem
    Dado que "maria_dev" possui 42 mensagens no total
    Quando o canal carrega mensagens de "maria_dev"
    Então abaixo de cada mensagem aparece o UserSignature
    E o cartão mostra avatar, login "maria_dev", tier "iniciante" e "42 mensagens"

  Cenário: Tier veterano para 201+ mensagens
    Dado que "pedro_lider" enviou 201 mensagens
    Quando a assinatura é renderizada
    Então o tier exibido é "veterano"

  Cenário: Atualização em tempo real via WebSocket
    Dado que "joao_silva" tem 49 mensagens (tier "iniciante")
    E seu UserSignature está renderizado com "49 mensagens"
    Quando "joao_silva" envia nova mensagem no canal "general"
    E o servidor emite "user_stats_changed" para "joao_silva"
    Então o frontend recebe a notificação em até 3s
    E o UserSignature atualiza para "50 mensagens"

  Cenário: Transição de tier ao cruzar threshold
    Dado que "carlos_souza" tem 50 mensagens (tier "iniciante")
    Quando envia a 51ª mensagem e o WS notifica
    Então o total vira "51 mensagens"
    E o tier transita de "iniciante" para "participante"

  Cenário: Endpoint de stats retorna agregado consistente
    Dado que "check_user" possui mensagens na tabela messages
    Quando consulto GET /api/users/{id}/stats
    Então total_messages == SELECT COUNT(*) FROM messages WHERE user_id = {id} AND deleted_at IS NULL
    E a resposta inclui total_messages, active_rooms, tier, tier_label
```

### Cenários de Falha

```gherkin
  Cenário de Falha: Usuário inexistente retorna 404
    Dado que o id 999999 não corresponde a nenhum usuário
    Quando consulto GET /api/users/999999/stats
    Então recebo status 404
    E o corpo indica "usuário não encontrado"

  Cenário de Falha: WebSocket cai e assinatura mantém último estado
    Dado que o UserSignature de "maria_dev" mostra "42 mensagens"
    E a conexão WebSocket é perdida
    Quando novas mensagens de "maria_dev" chegam durante a queda
    Então o UserSignature continua exibindo "42 mensagens" (último estado)
    E o componente não é removido nem escondido
    E o WebSocket tenta reconectar automaticamente

  Cenário de Falha: Flood não gera rajada de updates
    Dado que "flood_user" envia 10 mensagens em menos de 1s
    Quando o servidor processa as mensagens
    Então o evento "user_stats_changed" é emitido no máximo a cada 2s
    E o estado final reflete o total correto
```

### Edge Cases

```gherkin
  Cenário Edge: Reconexão puxa estado fresco via API
    Dado que o WS reconectou após uma queda
    E durante a desconexão "maria_dev" enviou 8 mensagens
    Quando o WS reconecta
    Então o frontend consulta GET /api/users/{id}/stats
    E o UserSignature atualiza para o total mais recente

  Cenário Edge: Usuário sem avatar usa default
    Dado que "new_user" não tem image_url configurado
    Quando a assinatura é renderizada
    Então exibe o avatar default do 42
    E o restante do cartão renderiza normalmente

  Cenário Edge: Canal sem mensagens não renderiza assinatura
    Dado que o canal não possui mensagens
    Quando o canal é carregado
    Então nenhum UserSignature é renderizado
```

---

## 5. ADRs

### ADR-101.1 — Stats on-demand via SQL agregado (sem tabela materializada)

**Status:** accepted

**Contexto:** Stats de participação (total de mensagens, tier) precisam ser lidos por assinatura.

**Decisão:** Computar via `SELECT COUNT(*)` agregado em `messages` quando o endpoint é chamado.
Sem tabela `user_stats` materializada. Single source of truth = tabela `messages`.

**Por que não materializar:** Sem constraint de performance no MVP. Materializar introduz estado
derivado e risco de inconsistência (dupla escrita). `COUNT` na tabela indexada é trivial para
o volume de ~300 alunos.

**Consequências:**
- (+) Zero risco de inconsistência — dado sempre reflete a realidade
- (+) Nenhuma coluna/tabela nova
- (-) Cada fetch de stats faz um COUNT — aceitável; pode virar cache/materialização em v2

---

### ADR-101.2 — Atualização via evento WS `user_stats_changed` + re-fetch

**Status:** accepted

**Contexto:** Assinatura deve atualizar em tempo real quando o autor envia mensagem.

**Opções:**
- A: Hub emite `user_stats_changed` (apenas o user_id); frontend re-fetcha stats via API *(escolhida)*
- B: Hub calcula e envia os stats completos no payload do evento
- C: Frontend faz polling periódico do endpoint de stats

**Decisão:** Opção A. O evento carrega só o `user_id`. O frontend invalida e re-fetcha
`GET /api/users/{id}/stats`. Mantém o hub simples (sem query no caminho do broadcast).

**Consequências:**
- (+) Hub não precisa acessar o banco no broadcast — só sinaliza
- (+) Re-fetch garante consistência com ADR-101.1
- (-) 1 request extra por transição — mitigado pelo debounce (ADR-101.3)

---

### ADR-101.3 — Debounce de 2s no backend contra flood

**Status:** accepted

**Contexto:** Um usuário em flood dispararia dezenas de `user_stats_changed`.

**Decisão:** O backend agrupa eventos de stats por `user_id` com debounce de 2s. No máximo
1 evento a cada 2s por usuário. O estado final sempre reflete o total correto (o re-fetch pega
o valor atual do banco).

**Consequências:**
- (+) Evita rajada de re-fetches no frontend
- (-) Atraso máximo de 2s na atualização visual — aceitável para UX de reputação

---

### ADR-101.4 — `active_rooms` degrada para 1 até a Feature 103 (dependência de schema)

**Status:** accepted

**Contexto:** A spec e o acceptance da 101 pedem `active_rooms = COUNT(DISTINCT room_id)`, mas
a migration 001 **não tem coluna `room_id`/`chat_id`** em `messages` — existe uma única sala
"general". O conceito de múltiplas salas só nasce na Feature 103 (`chat_id`).

**Decisão:** Enquanto `messages` não tiver `chat_id` (pré-Feature 103), `active_rooms` retorna
`1` para quem tem ≥1 mensagem e `0` para quem tem 0. Após a Feature 103 adicionar `chat_id`, o
mesmo endpoint passa a computar `COUNT(DISTINCT chat_id)` sem mudança de contrato.

**Por que não bloquear a 101 na 103:** A ordem de desenvolvimento é 101→102→103. Bloquear a 101
inverteria a sequência. Degradar graciosamente entrega valor imediato (total + tier) e o campo
`active_rooms` fica correto por construção quando o schema evoluir.

**Consequências:**
- (+) 101 pode ser implementada antes da 103 sem inventar coluna
- (+) Contrato do endpoint estável — só a query interna muda na 103
- (-) `active_rooms` é sempre 0 ou 1 até a 103 — documentado como débito DT-101.1

---

### ADR-101.5 — Chave do endpoint é o `id` numérico da 42, não o login

**Status:** accepted

**Contexto:** A spec diz `GET /api/users/{id}/stats`, mas o acceptance mistura login
("cross_user", "maria_dev") e id no path. `users.id` é INT (id da 42); `login` é VARCHAR UNIQUE.

**Decisão:** O path usa o `id` numérico (`users.id`). Login não é a chave de rota. O frontend
já tem o `user_id` de cada mensagem (via `messages.user_id`), então não precisa resolver login→id.

**Consequências:**
- (+) Consistente com a PK INT da tabela users
- (+) Sem lookup login→id no caminho quente
- (-) Cenários do acceptance que usam login no path serão reescritos para id na task de BDD

---

## 6. Débitos Técnicos

| ID | Descrição | Impacto | Mitigação |
|----|-----------|---------|-----------|
| DT-101.1 | `active_rooms` limitado a 0/1 até a Feature 103 adicionar `chat_id` | Médio | ADR-101.4 — degrada graciosamente; vira real na 103 |
| DT-101.2 | Acceptance atual usa login no path e assume `room_id` inexistente | Baixo | Reescrever `.feature` na task de BDD alinhado à ADR-101.4/101.5 |
| DT-101.3 | COUNT por fetch pode virar gargalo se o volume crescer muito | Baixo | v2 — cache curto ou materialização incremental |
| DT-101.4 | Debounce de stats é estado em memória no hub — perdido em restart | Baixo | Aceitável; estado se reconstrói no próximo evento |

---

## 7. Cross-Reference

### Base de código existente (Feature 100)

| Arquivo | Relevância |
|---------|-----------|
| `internal/db/migrations/001_init.sql` | `messages(id, user_id, content, created_at, deleted_at)` — **sem room_id** (ver ADR-101.4) |
| `internal/ws/hub.go` | Só tem `Broadcast` global (linha 68) — precisa de método para emitir `user_stats_changed` |
| `internal/ws/client.go` | Client WS — ponto onde a mensagem enviada dispara o evento de stats |
| `internal/chat/handler.go` | Handler REST existente — onde acrescentar `GET /api/users/{id}/stats` |
| `internal/auth/middleware.go` | JWT middleware — reusar para proteger o endpoint de stats |
| `frontend/src/pages/Chat.tsx` | Onde `UserSignature` será montado abaixo de cada mensagem |
| `frontend/src/stores/chatStore.ts` | Store Zustand — onde cachear stats por user_id |
| `frontend/src/hooks/useWebSocket.ts` (Feature 100) | Onde tratar o evento `user_stats_changed` e o re-fetch pós-reconexão |

### Wiki consultada

| Documento | Uso |
|-----------|-----|
| `wiki-claude/projects/42_chat/features/feature-100-42-chat-core.md` | Hub WS, schema de messages, padrão de handler |
| `wiki-claude/_raw/42-graphic-charter-software.md` | DS42 — cores, tipografia, border-radius do cartão |

### Dependência futura

- **Feature 103** adiciona `chat_id` em `messages` — habilita `active_rooms` real (ADR-101.4)

---

## 8. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| `active_rooms` confunde por retornar sempre 1 pré-103 | Alta | Baixo | Documentado (DT-101.1); UI pode ocultar o campo até a 103 |
| Evento de stats no caminho quente do hub degrada broadcast | Baixa | Médio | Evento carrega só user_id; sem query no broadcast (ADR-101.2) |
| Layout shift ao inserir assinatura abaixo de mensagens | Média | Médio | Altura fixa no cartão (RNF-03) |
| Re-fetch em massa com muitos autores visíveis | Média | Baixo | Debounce 2s (ADR-101.3) + cache por user_id no store |

---

## 9. DoD (Definition of Done)

> Critérios-alvo. Feature **ainda não implementada** — todos pendentes.

| Critério | Status |
|----------|--------|
| `go build ./...` sem erros | ☐ pendente |
| `go vet ./...` sem warnings | ☐ pendente |
| `npx tsc --noEmit` sem erros | ☐ pendente |
| `npx vite build` sem erros | ☐ pendente |
| `GET /api/users/{id}/stats` retorna agregado correto | ☐ pendente |
| 404 para usuário inexistente | ☐ pendente |
| Tiers refletem thresholds (0/1–50/51–200/201+) | ☐ pendente |
| `UserSignature` renderiza sem layout shift | ☐ pendente |
| Evento WS `user_stats_changed` com debounce 2s | ☐ pendente |
| Re-fetch pós-reconexão | ☐ pendente |
| `active_rooms` degrada para 0/1 pré-103 (ADR-101.4) | ☐ pendente |
| Testes cobrem happy path + falha + edge | ☐ pendente |
| Wiki vault atualizado | ☐ pendente |

---

## Quality Score

| Dimensão | Pontos | Máx | Notas |
|----------|--------|-----|-------|
| Clareza de escopo (objetivos / não-objetivos) | 5 | 5 | Fronteira nítida com v2 |
| Cobertura de cenários (success + failure + edge) | 5 | 5 | 5 success + 3 failure + 3 edge |
| Resolução de ambiguidades (cross-reference código+wiki) | 5 | 5 | Descoberto `room_id` inexistente; id-vs-login resolvido |
| ADRs com opções rejeitadas documentadas | 5 | 5 | 5 ADRs, incluindo a dependência de schema da 103 |
| Débitos e riscos explicitados | 5 | 5 | 4 débitos + 4 riscos com mitigação |
| **Total** | **25** | **25** | ✓ Excelente |
