# Discovery Report: Expansão de Mensageria (MS Graph Inspired)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | 103 |
| **Slug** | ms-graph-messaging |
| **Status** | accepted |
| **Autor** | phm-aguiar |
| **Data** | 2026-06-30 |
| **Versão** | 1.0 |
| **Spec derivada** | `specs/features/103-ms-graph-messaging/spec.md` |
| **Aprovado** | true |

---

## 1. Contexto e Problema

O MVP (Feature 100) entrega uma sala única "general" — todos os alunos em um único broadcast.
Para comunicação organizada (pair programming, grupos de estudo, suporte entre pares), os alunos
precisam de conversas direcionadas: 1:1 e grupos menores. A sala única não escala para esse uso.

A Feature 103 transforma o chat de uma sala global em um sistema de recursos `chat` com tipos
(`oneOnOne`, `group`, `general`), endpoints REST estruturados (inspirados no MS Graph) e
comportamentos clássicos de mensageria (typing indicator, emoticons textuais) referenciados
pelo MSN Messenger 7.5/8.5 descrito em `wiki-claude/_raw/funcionalidade-chat.md`.

### Usuários Impactados

- **Primários:** todos os ~300 alunos — qualquer um pode iniciar 1:1 ou grupo
- **Secundários:** mods e admins que precisam deletar mensagens inapropriadas com rastreabilidade

### Situação Atual (Feature 100)

- Hub único: `clients map[*Client]bool` → broadcast global para todos
- Tabela `messages` sem `chat_id` → impossível filtrar por conversa
- Endpoint `/ws?token=<jwt>` → conecta na sala geral, sem roteamento por conversa

---

## 2. Objetivos e Não-Objetivos

### Objetivos

- Recurso `chat` com tipos `oneOnOne`, `group`, `general` persistidos no PostgreSQL
- Hub roteado por `chat_id` em vez de broadcast global
- Endpoints REST estilo MS Graph: `/api/chats`, `/api/chats/{id}/messages`
- Paginação de histórico por cursor (`before=<RFC3339>`) — alinhado ao `$skiptoken` do MS Graph
- Typing indicator via evento WS efêmero (não persistido, TTL 5s)
- Emoticons textuais `(L)` e `:-)` renderizados como imagem **no frontend** (sem `body_html` no banco)
- Soft delete de mensagens com tombstone visível

### Não-Objetivos (MVP)

- Canais/Teams estilo MS Teams — fora do escopo do domínio chat
- Chamadas de voz/vídeo — requer stack de mídia não contemplada
- Winks animados (Flash) — tecnologia legada
- Attachments/upload de arquivos — feature futura
- Reply threading (`reply_to_id`) — defer para feature 105+
- `body_html` no banco (parsing backend) — frontend parsing é suficiente e mais simples
- Mobile nativo — React web responsiva apenas
- WCAG 2.1 AA completo — accessible-first, mas sem auditoria formal no MVP

---

## 3. Requisitos

### 3.1 Funcionais

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-01 | CRUD de chats: criar, listar (do usuário), detalhar | Must |
| RF-02 | Gerenciar membros: adicionar, remover | Must |
| RF-03 | Enviar e listar mensagens por chat com paginação por cursor | Must |
| RF-04 | Hub WS roteado por chat_id (rooms) | Must |
| RF-05 | Typing indicator: evento WS efêmero com TTL 5s | Should |
| RF-06 | Emoticon parsing no frontend: `(L)` → ❤️, `:-)` → 😊 | Should |
| RF-07 | Soft delete de mensagem por mod/admin | Must |
| RF-08 | Migration 003 com backfill: mensagens existentes → chat "general" | Must |
| RF-09 | Backward compat: `/ws?token` continua funcionando (join "general") | Must |

### 3.2 Não-Funcionais

| Categoria | Requisito | Métrica |
|-----------|-----------|---------|
| Performance | Listar histórico de mensagens | p95 < 200ms para 50 mensagens |
| Performance | Broadcast de mensagem para sala | < 50ms para 300 clientes conectados |
| Segurança | Membros validados antes de qualquer acesso a chat privado | 403 para não-membros |
| Segurança | Soft delete obrigatório — hard delete proibido | Constraint via convention, não DB |
| Compatibilidade | Feature 100 continua funcionando sem refactor no frontend | `/ws?token` → general implícito |

---

## 4. Cenários Gherkin (BDD)

```gherkin
# language: pt-BR
Feature: Sistema de chats com recursos diferenciáveis
  Como aluno da 42 São Paulo
  Quero criar e participar de conversas direcionadas
  Para coordenar pair programming e grupos de estudo sem sobrecarregar o canal geral

  Background:
    Dado que o servidor está rodando com migration 003 aplicada
    E os usuários "marvin" (id=1) e "zeenyt__" (id=2) existem no banco
    E o chat "general" foi criado pelo seed da migration 003

  # ============================================================
  # CENÁRIOS DE SUCESSO
  # ============================================================

  Scenario: Criar conversa 1:1 entre dois alunos
    Dado que estou autenticado como "marvin"
    Quando faço POST /api/chats com {"type": "oneOnOne", "members": [2]}
    Então recebo status 201 com o recurso chat criado
    E o chat tem type "oneOnOne" e dois membros (marvin + zeenyt__)
    E ambos os membros recebem evento WS {"type":"system","content":"joined","chat_id":"<id>"}

  Scenario: Criar grupo de estudo
    Dado que estou autenticado como "marvin"
    Quando faço POST /api/chats com {"type": "group", "topic": "ft_printf", "members": [2, 3]}
    Então recebo status 201 com o grupo criado com 3 membros
    E o topic é "ft_printf"

  Scenario: Enviar e receber mensagem em conversa específica
    Dado que existe um chat 1:1 entre "marvin" e "zeenyt__"
    E ambos estão conectados via WS ao chat_id
    Quando "marvin" envia POST /api/chats/{id}/messages com {"content": "oi!"}
    Então "zeenyt__" recebe o broadcast WS com {"type":"message","content":"oi!","chat_id":"<id>"}
    E a mensagem é persistida no PostgreSQL com o chat_id correto

  Scenario: Paginar histórico de mensagens
    Dado que um chat tem 120 mensagens
    Quando faço GET /api/chats/{id}/messages?limit=50
    Então recebo as 50 mais recentes em ordem cronológica
    E a resposta indica cursor para próxima página
    Quando faço GET /api/chats/{id}/messages?before=<cursor>&limit=50
    Então recebo as 50 anteriores sem overlap

  Scenario: Typing indicator aparece e expira
    Dado que "marvin" e "zeenyt__" estão conectados ao mesmo chat
    Quando "marvin" começa a digitar (keystroke no frontend)
    Então "zeenyt__" recebe {"type":"typing","login":"marvin","chat_id":"<id>"}
    Quando 5 segundos passam sem novo keystroke
    Então "zeenyt__" não vê mais o indicador de digitação

  Scenario: Emoticons renderizados no frontend
    Dado que uma mensagem contém o texto "(L) valeu pelo pair!"
    Quando a mensagem é renderizada no ChatWindow
    Então "(L)" é substituído pela imagem de coração
    E o texto restante "valeu pelo pair!" permanece intacto

  Scenario: Sala general continua funcionando (backward compat)
    Dado que um cliente Feature-100 conecta via "/ws?token=<jwt>"
    Então é conectado implicitamente ao chat "general"
    E envia e recebe mensagens normalmente sem mudança no frontend

  # ============================================================
  # CENÁRIOS DE FALHA
  # ============================================================

  Scenario: Não-membro não pode acessar chat privado
    Dado que existe um chat 1:1 entre "marvin" e "zeenyt__"
    E "bocal" não é membro desse chat
    Quando "bocal" faz GET /api/chats/{id}/messages
    Então recebe status 403
    E a mensagem de erro é "not a member of this chat"

  Scenario: Criar oneOnOne com usuário inexistente
    Dado que estou autenticado como "marvin"
    Quando faço POST /api/chats com {"type": "oneOnOne", "members": [9999]}
    Então recebo status 404
    E a mensagem de erro é "user not found"
    E nenhum chat é criado

  Scenario: Soft delete não remove dado do banco
    Dado que sou mod do chat e existe a mensagem M com created_at=T
    Quando faço DELETE /api/messages/{id}
    Então recebo status 204
    E GET /api/chats/{id}/messages não retorna a mensagem M
    E o registro permanece no banco com deleted_at != NULL e id e created_at preservados

  Scenario: Non-mod não pode deletar mensagem alheia
    Dado que sou membro comum do chat
    Quando faço DELETE /api/messages/{id} de mensagem de outro usuário
    Então recebo status 403

  # ============================================================
  # EDGE CASES
  # ============================================================

  Scenario: Backfill da migration 003 — mensagens existentes
    Dado que o banco tem mensagens da Feature 100 sem chat_id
    Quando a migration 003 é aplicada
    Então todas as mensagens existentes recebem o chat_id do chat "general"
    E o chat "general" é criado com id = seed fixo da migration
    E nenhuma mensagem é perdida

  Scenario: 300 usuários no chat general — broadcast dentro do SLA
    Dado que 300 alunos estão conectados ao chat "general" via WS
    Quando um aluno envia uma mensagem
    Então todos os 300 recebem o broadcast em menos de 50ms (média local)
    E o Hub não cria goroutine leak (ClientCount retorna correto após desconexões)

  Scenario: Typing indicator não persiste no banco
    Dado que "marvin" dispara 10 eventos "typing" em 30 segundos
    Então nenhuma linha é inserida em nenhuma tabela do PostgreSQL
    E o banco não cresce por causa de typing events
```

---

## 5. Decisão Arquitetural (ADR)

### Status

`accepted` — escrita no discovery, formalizada em `plan.md`

### Drivers de Decisão

- Monolito Go único — sem pub/sub externo (constitution.md proíbe Redis/Kafka)
- Backward compatibility com Feature 100 — frontend existente não pode quebrar
- Hub atual é global (sem rooms) — refactor necessário, mas isolado em `internal/ws/`
- Tabela `messages` sem `chat_id` — migration com backfill obrigatória

### Opções Consideradas

| Opção | Descrição | Prós | Contras |
|-------|-----------|------|---------|
| A: Hub rooms por chat_id (escolhida) | `map[string]map[*Client]bool` — cada chat_id é uma room | Isolado no hub; backward compat via "general" implícito | Refactor do hub existente |
| B: Hub global + filtro no client | Client descarta mensagens de outros chats | Zero refactor no hub | Broadcast ineficiente; todos recebem tudo |
| C: Hub separado por chat | Instância nova de Hub por chat | Isolamento total | Overhead de goroutines; gerenciamento complexo |

### Decisões

**ADR-103.1 — Hub rooms:** Opção A. `internal/ws/hub.go` ganha `rooms map[string]map[*Client]bool`. `/ws?token=<jwt>` sem `chat_id` → join room `"general"` (backward compat). `/ws?token=<jwt>&chat_id=<id>` → join room específica.

**ADR-103.2 — Migration backfill:** Migration 003 cria o chat "general" com UUID fixo (seed), depois faz `UPDATE messages SET chat_id = '<general-uuid>'`. Sem perda de dados.

**ADR-103.3 — Emoticons no frontend:** Parsing client-side (regex no componente React). Não persiste `body_html` no banco. Simples, sem XSS risk, sem coluna extra na tabela.

**ADR-103.4 — Typing indicator efêmero:** Evento WS puro (`{"type":"typing","login":"...","chat_id":"..."}`), nunca persiste. TTL gerenciado no frontend (timer de 5s reseta a cada keystroke).

**ADR-103.5 — WS URL:** Mantém `/ws?token=<jwt>` funcional. Adiciona `?chat_id=<id>` como query param opcional. Sem novo path de rota — backward compat total.

### Consequências

**Positivas:**
- Feature 100 frontend continua sem alteração até refactor intencional
- Hub rooms são isoladas — broadcast só vai para membros do chat
- Emoticons sem coluna extra na migration

**Negativas / Riscos:**
- Hub refactor toca código core de WS — regressão possível (cobrir com testes)
- Backfill na migration 003 precisa de teste em banco com dados reais antes de rodar

---

## 6. Débitos Técnicos Antecipados

| Débito | Impacto | Plano de Mitigação |
|--------|---------|-------------------|
| Hub refactor pode regredir Feature 100 | Alto | Testar `/ws` sem chat_id logo após o refactor; smoke test cobre |
| Migration 003 com backfill não é rollback-able facilmente | Médio | Testar em banco de dev limpo + banco com dados antes de aplicar em qualquer staging |
| Emoticons no frontend precisam de lista de códigos mantida | Baixo | Arquivo de mapa isolado `lib/emoticons.ts`; fácil de expandir |
| `general` chat UUID hardcoded na migration | Baixo | Constante isolada em `003_chat_resources.sql`; documentada |
| Sem deduplicação de membros no `chat_members` | Médio | UNIQUE constraint `(chat_id, user_id)` na migration previne isso |
| Typing indicator no frontend sem debounce pode spammar WS | Médio | Implementar debounce de 1s antes de emitir evento typing |

---

## 7. Cross-Reference (Wiki + Codebase)

### Padrões Encontrados na Wiki

| Fonte | Relevância | Implicação |
|-------|-----------|------------|
| `wiki-claude/_raw/funcionalidade-chat.md` (MSN 7.5/8.5) | Alta | Valida typing indicator, join/leave em cinza centralizado, states: Online/Busy/Away/Offline |
| `wiki-claude/_raw/Listar mensagens em um chat - Microsoft Graph v1.0.md` | Alta | Confirma paginação cursor `$skiptoken`, max 50, DESC order — nosso `before=<RFC3339>` é equivalente |
| `wiki-claude/entities/websocket.md` | Alta | Hub/Client padrão, constantes ping/pong; base para rooms extension |
| `wiki-claude/references/42-chat-sec9-observabilidade-bdd.md` | Média | Valida uso de godog para acceptance tests |

### Código Existente Relacionado

| Arquivo | Padrão | Implicação |
|---------|--------|-----------|
| `internal/ws/hub.go` | Hub global sem rooms | ADR-103.1: adicionar `rooms map[string]map[*Client]bool` |
| `internal/db/migrations/001_init.sql` | `messages` sem `chat_id` | Migration 003 deve fazer ALTER + backfill |
| `internal/forum/store/boards.go` | Soft delete via `deleted_at` | Reutilizar mesmo padrão em messages |
| `internal/forum/middleware/auth.go` | `ModOnly`, `BoardOwner` | Adaptar `ChatMember`, `ChatModOnly` para novos middlewares |

### Ambiguidades Resolvidas

| Ambiguidade | Resolução |
|-------------|-----------|
| WS URL muda para `/ws/chats/{id}?token`? | Não — mantém `/ws?token` + query param `chat_id` opcional |
| `body_html` persiste no banco? | Não — parsing apenas no frontend |
| "general" é um chat do tipo `general` ou hard-coded? | É um chat real no banco (tipo `general`) criado pelo seed da migration 003 |
| Typing indicator tem cooldown no backend ou frontend? | Frontend — debounce de 1s antes de emitir; TTL de 5s para expirar |

---

## 8. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Hub refactor introduz deadlock ou race condition | Média | Alto | Rodar `go test -race ./internal/ws/...` após refactor |
| Migration 003 falha com banco de dados de produção com muitas mensagens | Baixa | Alto | Testar backfill em dump local primeiro |
| Frontend Feature 100 quebra por mudança de contrato WS | Baixa | Alto | Backward compat via ADR-103.5 — sem change no contrato existente |
| Typing indicator cria flooding de eventos WS | Média | Médio | Debounce 1s + TTL 5s; sem persistência |

---

## 9. Critérios de Aceitação (Definition of Done)

- [ ] Migration 003 roda em banco limpo e em banco com dados da Feature 100 sem erros
- [ ] Backfill: todas as mensagens existentes têm chat_id do "general"
- [ ] `/ws?token=<jwt>` (sem chat_id) continua funcional — Feature 100 não quebra
- [ ] Criar chat 1:1 e de grupo funcionam via POST /api/chats
- [ ] Mensagens roteadas por chat_id: membro de chat A não recebe broadcast de chat B
- [ ] Soft delete: mensagem deletada não aparece no GET; registro permanece no banco
- [ ] Non-membro recebe 403 ao tentar acessar chat privado
- [ ] Typing indicator aparece no destinatário e expira após 5s
- [ ] Emoticons `(L)` e `:-)` renderizam como imagem no frontend
- [ ] `go build ./...`, `go vet ./...`, `go test ./...`, `npm run build` passam
- [ ] Todos os cenários Gherkin verificados manualmente

---

## Quality Score

| Dimensão | Score | Observações |
|----------|-------|-------------|
| Completeness (0-5) | 5 | Todas as seções preenchidas |
| Gherkin coverage (0-5) | 5 | 7 sucesso + 4 falha + 3 edge cases |
| Ambiguity (0-5) | 5 | WS URL, body_html, general chat, typing TTL — todos resolvidos |
| Debt surface (0-5) | 5 | 6 débitos com impacto e mitigação |
| Wiki alignment (0-5) | 5 | 4 fontes consultadas; MSN + MS Graph validam os padrões |
| **Total** | **25/25** | — |
