# Discovery Report: 42 Chat Core (MVP)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | 100 |
| **Slug** | 42chat-core |
| **Status** | accepted |
| **Autor** | phm-aguiar |
| **Data original** | 2026-06-14 |
| **Revisão** | 2026-06-30 — reescrita pós-implementação com débitos conhecidos |
| **Versão** | 2.0 |
| **Spec derivada** | `specs/features/100-42chat-core/spec.md` |
| **Aprovado** | true |

---

## 1. Contexto e Problema

O campus 42 São Paulo (~300 alunos) perdeu o Discord e tem dificuldade de adoção do Slack,
cujos convites e estrutura de canais não funcionam bem para o modelo de autoavaliação da 42.
Os alunos precisam de um canal de comunicação P2P para avaliações, pair programming e
grupos de estudo — integrado à identidade da 42 (conta Intra) sem exigir criação de conta extra.

O 42 Chat substitui Slack/Discord com uma plataforma leve (monolito Go + React + PostgreSQL)
que usa OAuth2 42 como única forma de autenticação. A Feature 100 é o core que suporta todas
as features futuras.

### Usuários Impactados

- **Primários:** ~300 alunos presenciais da 42 São Paulo com conta na Intra
- **Secundários:** staff da 42 que precisa observar canais de comunicação

### Situação Atual (sem a feature)

Slack desorganizado, Discord removido. Coordenação de avaliações e pair programming via DMs
na Intra (lento, sem histórico de sala). Comunicação de grupo inexistente no campus.

---

## 2. Objetivos e Não-Objetivos

### Objetivos

- Autenticação OAuth2 42 ponta-a-ponta (Login → callback → JWT → chat)
- Sala única "general" com WebSocket em tempo real
- Histórico persistido no PostgreSQL com paginação por cursor
- Presença básica: lista de usuários online via eventos join/leave do WebSocket
- Reconexão automática com backoff exponencial
- Graceful shutdown sem perda de mensagens em trânsito

### Não-Objetivos (MVP)

- Salas múltiplas, DMs, threads — Features 105–107
- Fórum tech (boards/threads/posts) — Feature 102
- Painel admin — Feature 104
- Typing indicators — Feature futura (anotado como gap técnico)
- Push notifications — Feature futura
- Cache 3 camadas anti-rate-limit — complexidade desnecessária; retry simples basta no MVP

---

## 3. Requisitos

### 3.1 Funcionais

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-01 | Login OAuth2 42 ponta-a-ponta: UI → callback → JWT → chat | Must |
| RF-02 | Dev login (`DEV_MODE=true`) sem OAuth2 real | Must |
| RF-03 | WebSocket autenticado: envio, recebimento broadcast, join/leave system events | Must |
| RF-04 | Histórico: últimas 50 mensagens ao conectar; paginação por cursor (`before=<RFC3339>`) | Must |
| RF-05 | Estado de mensagens reset no reconnect — sem duplicação ao navegar de volta | Must |
| RF-06 | Lista de usuários online baseada em presença real (hub.clients), não proxy de histórico | Should |
| RF-07 | Reconexão automática: backoff [1s, 2s, 4s, 8s, 16s] com indicador visual | Must |
| RF-08 | Logout: limpa localStorage, fecha WS, redireciona para `/` | Must |
| RF-09 | Soft delete de mensagens (`deleted_at`); nunca hard delete | Must |
| RF-10 | Cron LGPD: expurga mensagens > 6 meses (Art. 15) | Should |
| RF-11 | `GET /metrics` retorna goroutines, db_open_connections, ws_active_clients | Could |

### 3.2 Não-Funcionais

| Categoria | Requisito | Métrica de Aceite |
|-----------|-----------|------------------|
| Performance | 300 conexões WS simultâneas | k6: 300 VUs, rampa 30s, p95 latência < 500ms, zero erros WS |
| Performance | Mensagem broadcast | < 200ms fim a fim (sender → todos receivers) |
| Segurança | JWT HS256 12h, secret via env var | Zero credenciais no código-fonte |
| Segurança | Token inválido no WS | Rejeição 401 antes do handshake (upgrade recusado) |
| Observabilidade | Métricas expostas em `/metrics` | JSON com ao menos 3 campos: goroutines, db_conns, ws_clients |
| Privacidade | Retenção de dados | Mensagens > 6 meses deletadas em hard DELETE via cron |
| Disponibilidade | Graceful shutdown | Clientes recebem shutdown event; servidor encerra em < 10s |

---

## 4. Cenários Gherkin (BDD)

```gherkin
# language: pt-BR
Feature: Chat em tempo real — 42 Chat Core
  Como aluno da 42 São Paulo
  Quero trocar mensagens em tempo real com outros alunos
  Para coordenar avaliações, pair programming e grupos de estudo

  Background:
    Dado que o servidor está rodando em http://localhost:9999
    E o PostgreSQL está disponível com migration 001 aplicada
    E a API 42 Intra está acessível (ou mockada em DEV_MODE)

  # ============================================================
  # CENÁRIOS DE SUCESSO
  # ============================================================

  Scenario: Primeiro login OAuth2 e entrada no chat
    Dado que estou na página "/" sem token no localStorage
    Quando vejo a LoginPage com o botão "Entrar com a 42"
    E clico no botão
    Então sou redirecionado para https://api.intra.42.fr/oauth/authorize
    Quando autorizo o acesso e sou redirecionado para /callback?code=<code>
    Então o frontend chama GET /api/auth/42/callback?code=<code>
    E o backend retorna {"token":"<jwt>","user":{...}}
    E o token é salvo no localStorage
    E sou redirecionado para /chat
    E vejo as últimas 50 mensagens carregadas via GET /api/messages?limit=50
    E o indicador de conexão mostra "● online"

  Scenario: Dev login sem OAuth2
    Dado que DEV_MODE=true está configurado
    Quando estou na LoginPage e clico em "Dev Login (marvin)"
    Então o frontend chama GET /api/auth/dev/login?login=marvin
    E recebo um JWT válido
    E sou redirecionado para /chat como "marvin"
    E o chat está funcional (envio, recebimento, histórico)

  Scenario: Retorno com token válido sem novo login
    Dado que tenho um token JWT não expirado no localStorage
    Quando acesso "/"
    Então sou redirecionado diretamente para /chat sem ver a LoginPage
    E o histórico carrega normalmente

  Scenario: Envio e broadcast de mensagem
    Dado que estou autenticado na sala "general"
    E "marvin" está conectado em outra aba
    Quando digito "Alguém para pair programming?" e pressiono Enter
    Então a mensagem aparece na minha tela com meu login e avatar
    E "marvin" recebe a mensagem em tempo real sem F5
    E a mensagem é persistida no PostgreSQL

  Scenario: Navegação e retorno — histórico sem duplicação
    Dado que estou no /chat com 50 mensagens carregadas
    Quando navego para /forum e depois volto para /chat
    Então o histórico mostra exatamente as mesmas 50 mensagens
    E não há mensagens duplicadas na lista

  Scenario: Logout limpa sessão completamente
    Dado que estou autenticado no /chat
    Quando clico em "Sair"
    Então o token é removido do localStorage
    E o WebSocket é fechado
    E sou redirecionado para "/" (LoginPage)
    E ao tentar acessar /chat diretamente sou redirecionado para /

  Scenario: Reconexão automática após queda de rede
    Dado que estou conectado ao WebSocket
    Quando a conexão cai (simulado: servidor reinicia)
    Então o indicador muda para "○ reconectando..."
    E o frontend tenta reconectar com backoff exponencial [1s, 2s, 4s, 8s, 16s]
    Quando a conexão é restabelecida
    Então fetchHistory carrega apenas mensagens novas (desde lastTimestamp)
    E o indicador volta para "● online"
    E não há mensagens duplicadas após o reconnect

  Scenario: Graceful shutdown notifica clientes
    Dado que 10 clientes estão conectados
    Quando o servidor recebe SIGTERM
    Então todos recebem {"type":"system","content":"shutdown"}
    E o servidor encerra em menos de 10 segundos
    E o pool PostgreSQL é fechado sem transações pendentes

  # ============================================================
  # CENÁRIOS DE FALHA
  # ============================================================

  Scenario: Acesso a /chat sem token redireciona para login
    Dado que não há token no localStorage (ou o token foi removido)
    Quando acesso diretamente /chat
    Então sou redirecionado para "/" com a LoginPage
    E o WebSocket não é iniciado
    E nenhuma chamada autenticada é feita

  Scenario: Token expirado é detectado e limpo
    Dado que meu token JWT está expirado (exp < now)
    Quando o frontend valida o token (decode local, verifica exp)
    Então o token é removido do localStorage
    E sou redirecionado para a LoginPage
    E se GET /api/messages retornar 401 antes da detecção local
    Então o frontend também limpa o token e redireciona

  Scenario: Token inválido rejeitado no upgrade WebSocket
    Dado que envio um token adulterado na query string do WS
    Quando o backend valida o JWT no upgrade HTTP
    Então a conexão é recusada com HTTP 401
    E o handshake WebSocket não ocorre
    E o frontend exibe status "error" (sem loop de reconexão para erro de auth)

  Scenario: Mensagem acima do limite é rejeitada
    Dado que estou autenticado no /chat
    Quando tento enviar uma mensagem com mais de 5000 caracteres
    Então o servidor rejeita com erro "content exceeds maximum length"
    E o contador de caracteres no frontend mostra estado de erro (vermelho)
    E a conexão WebSocket permanece aberta

  Scenario: WebSocket conecta e desconecta em loop (bug DT-008)
    Dado que o context HTTP da requisição WS é cancelado no return do handler
    Quando o readPump usa ctx derivado do r.Context()
    Então a conexão encerra em < 300ms com select ctx.Done()
    E o frontend entra em loop de backoff
    Então o handler deve usar context.Background() para o readPump
    E a conexão se mantém até o conn.Close() ou hub.Shutdown()

  # ============================================================
  # EDGE CASES
  # ============================================================

  Scenario: fetchHistory acumula mensagens em vez de substituir (bug DT-011)
    Dado que estou no /chat com 50 mensagens no chatStore
    Quando navego para outra rota e volto para /chat
    Então useWebSocket monta novamente e chama connect()
    E ws.onopen dispara fetchHistory(undefined, 50)
    Se fetchHistory fizer [...msgs.reverse(), ...state.messages]
    Então as 50 mensagens aparecem duplicadas no topo do histórico
    Então fetchHistory sem before deve fazer setMessages(msgs.reverse())
    E não mesclar com o estado existente

  Scenario: Múltiplas abas do mesmo usuário
    Dado que o mesmo usuário abre /chat em 2 abas diferentes
    Então cada aba cria um Client independente no Hub
    E mensagens enviadas em uma aba aparecem na outra em tempo real
    E cada aba mantém seu próprio ciclo de vida WS

  Scenario: 300 conexões simultâneas dentro do SLA
    Dado que 300 alunos conectam ao WebSocket em 30 segundos
    Quando cada um envia 10 mensagens durante 60 segundos
    Então o p95 de latência de broadcast é menor que 500ms
    E zero erros de WebSocket são reportados pelo k6
    E RAM do processo não excede 600 MB (servidor local com recursos limitados)
```

---

## 5. Decisão Arquitetural (ADR)

### Status

`accepted` — implementado e em uso

### Drivers de Decisão

- Servidor local por enquanto; se o projeto for aceito pela 42SP será hospedado em servidor on-premise da escola — Go tem overhead de memória ~10x menor que Node.js para conexões WS longas
- Sem ORM: queries simples, preferência por SQL direto para auditabilidade (regra constitution.md)
- Monolito: campus presencial com ~300 usuários não justifica a complexidade operacional de microsserviços
- OAuth2 42: autenticação integrada à identidade do campus, sem gestão de senhas

### Opções Consideradas

| Opção | Descrição | Prós | Contras |
|-------|-----------|------|---------|
| A: Go + gorilla/websocket (escolhida) | Hub/Client com goroutines nativas | Baixíssimo RAM, sem deps extras, idiomático | Mais verboso que Node.js para lógica de négocio |
| B: Node.js + socket.io | Framework maduro de WS com reconexão nativa | Dev mais rápido, ecosystem rico | ~4x mais RAM por conexão, não satisfaz constraint de infra |
| C: Go + nhooyr/websocket | Alternativa moderna ao gorilla | Melhor lifecycle management | Menos documentação, mudança de dep sem ganho claro |

### Decisão

**Opção A** — Go + gorilla/websocket com modelo Hub/Client clássico.

O Hub usa `sync.RWMutex` para o mapa de clients e canais buffered de 256 slots por cliente.
JWT validado no upgrade HTTP (antes do handshake), evitando conexões não autorizadas.

### Consequências

**Positivas:**
- RAM de ~50 MB para 300 conexões WS ativas (medido em local)
- Sem framework extra: `net/http` nativo + gorilla para WS
- Graceful shutdown com propagação de event `system:shutdown` para todos os clients

**Negativas:**
- Context cancellation (r.Context()) precisa de atenção — não usar no readPump (DT-008)
- Sem reconexão nativa no gorilla — backoff implementado no cliente React

---

## 6. Débitos Técnicos Antecipados

| Débito | Impacto | Plano de Mitigação |
|--------|---------|-------------------|
| **DT-001** nginx sem MIME types/gzip/cache | Médio — performance degradada em conexões lentas | Configurar `include mime.types`, gzip e `Cache-Control` antes de produção |
| **DT-002** Docker healthcheck ausente no startup | Alto (bloqueante no MVP local) | Adicionar healthcheck no `server` e `depends_on: condition: service_healthy` no nginx |
| **DT-003** Migrations no filesystem (frágil em Docker) | Médio — quebra se working dir diverge | Migrar para `//go:embed` — o binário fica self-contained |
| **DT-006** Futura PT é fonte paga; valores de cor ambíguos | Baixo (só em produção) | Usar `ui-sans-serif` no MVP; obter licença antes de produção |
| **DT-007** Sidebar mostra proxy de histórico, não presença real | Médio — UX incorreta, usuários offline aparecem como online | Adicionar `login string` ao Client struct; expor `hub.OnlineUsers()`; endpoint `/api/online` |
| **DT-011** `fetchHistory` acumula mensagens em vez de substituir | Alto — duplicação visível ao voltar para /chat | Quando `before` é undefined (initial load), usar `setMessages(msgs.reverse())` sem merge |
| Sem deduplicação por ID no `addMessage` | Médio — mensagens enviadas localmente aparecem via WS broadcast E via addMessage | Deduplicar por `msg.id` em `addMessage`: ignorar se ID já existe no state |
| Sem endpoint `/api/online` para presença real | Médio | Implementar junto com DT-007 |
| Rate limiter WS (10 msg/s, 3 violations → disconnect) | Médio — não documentado para o cliente | Implementar retorno de event `system:rate_limited` antes de desconectar |

---

## 7. Cross-Reference (Wiki + Codebase)

### Padrões Encontrados na Wiki

| Fonte | Relevância | Implicação |
|-------|-----------|------------|
| `wiki-claude/entities/websocket.md` | Alta | Confirma modelo Hub/Client com `sync.RWMutex`; constantes ping/pong em 30s/60s |
| `wiki-claude/projects/42_chat/features/feature-100-42-chat-core.md` | Alta | Documentação arquitetural completa pós-implementação; confirma ciclo de vida WS |
| `wiki-claude/_raw/funcionalidade-chat.md` (MSN Messenger) | Média | Valida padrões UX: timestamps inline, join/leave system messages, indicador de status colorido |
| `wiki-claude/_raw/Listar mensagens em um chat - Microsoft Graph v1.0.md` | Média | Valida paginação por cursor: `$top=50`, `nextLink` para próxima página; confirma ordenação DESC como padrão |

### Padrões do MS Graph API relevantes para o nosso `GET /api/messages`

O MS Graph retorna `@odata.nextLink` para indicar que há mais páginas. Nossa API usa `before=<RFC3339>` como cursor equivalente. Considerações:
- O cliente deve inferir "há mais páginas" por `count < limit` — não expor um `nextLink` é aceitável no MVP
- Max page size 50 (idêntico ao nosso `limit=50`) — validado
- Ordenação somente DESC — idêntico ao nosso `ORDER BY created_at DESC`

### Código Existente Relacionado

| Arquivo | Padrão Identificado | Relevância |
|---------|-------------------|-----------|
| `frontend/src/stores/chatStore.ts:38` | **Bug DT-011**: `[...msgs.reverse(), ...state.messages]` acumula | Correção necessária para fetchHistory inicial |
| `frontend/src/hooks/useWebSocket.ts:34` | `fetchHistory(lastTimestampRef.current, 50)` no `ws.onopen` | `lastTimestampRef` reseta em cada montagem — primeira chamada é sempre com `undefined` |
| `internal/ws/hub.go` | `map[*Client]bool` sem campo `login` | DT-007: precisa de `login string` no Client para presença real |
| `internal/ws/handler.go` | `client.ReadPump(context.Background())` | DT-008 já corrigido — documentado para não regredir |

### Ambiguidades Resolvidas

| Termo Ambíguo | Definição Adotada |
|---------------|------------------|
| "histórico inicial" | As **últimas 50 mensagens** do banco, sem filtro de data, ao abrir o chat pela primeira vez ou reconectar com `lastTimestamp = undefined` |
| "mensagem perdida no reconnect" | Mensagens com `created_at > lastTimestampRef` durante a janela de desconexão; recuperadas via `GET /api/messages?before=<lastTimestamp>` invertido — na prática: fetch com `before` no topo do histórico atual |
| "presença online" | Usuários com `Client` ativo no `Hub.clients` no momento da query — não "quem enviou mensagens recentemente" |
| "soft delete" | `UPDATE messages SET deleted_at = NOW()` — o registro permanece no banco; não retorna em queries com `WHERE deleted_at IS NULL` |
| "DEV_MODE" | `DEV_MODE=true` no backend + `VITE_DEV_MODE=true` no frontend — ambos necessários para exibir e habilitar o dev login |

---

## 8. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| DT-011 gera UX confusa em produção (duplicação de histórico) | Alta (bug confirmado no código) | Alto | Corrigir antes de qualquer release; Gherkin `Scenario: Navegação e retorno` cobre o caso |
| Servidor on-premise da 42SP (spec desconhecida) fica sem recursos com 300 WS + PostgreSQL | Média | Alto | Teste k6 com 300 VUs antes de qualquer deploy; monitorar via `/metrics` para estabelecer baseline local primeiro |
| API 42 fora do ar bloqueia todo login OAuth2 | Média | Alto | DEV_MODE como fallback; usuários com token válido não são afetados até expiração (12h) |
| JWT_SECRET não configurado em produção | Baixa (tem validação no startup) | Crítico | Validação no startup existe; adicionar ao checklist de deploy |
| Migração para embed.FS quebra container se não testado | Baixa | Médio | Testar `docker compose build && up` após qualquer mudança em db.go |

---

## 9. Critérios de Aceitação (Definition of Done)

- [ ] Login OAuth2 42 funciona ponta-a-ponta no browser (não apenas no backend)
- [ ] Dev login funciona com `DEV_MODE=true`
- [ ] Navegar para outra rota e voltar ao /chat não duplica o histórico (DT-011 corrigido)
- [ ] Envio e recebimento de mensagens em tempo real funciona em 2 abas simultâneas
- [ ] Logout limpa token, fecha WS e redireciona corretamente
- [ ] Acesso a /chat sem token redireciona para /
- [ ] Reconexão automática com backoff funciona (desligar servidor por 5s e religar)
- [ ] Token inválido no WS é rejeitado com 401 (sem handshake)
- [ ] Mensagem > 5000 chars é rejeitada pelo servidor com erro claro
- [ ] `go build ./...` e `go vet ./...` passam
- [ ] `cd frontend && npm run build` passa
- [ ] Todos os cenários Gherkin acima verificados manualmente
- [ ] Teste de carga k6 executado: 300 VUs, p95 < 500ms, zero erros WS

---

## Quality Score

| Dimensão | Score | Observações |
|----------|-------|-------------|
| Completeness (0-5) | 5 | Todas as 9 seções preenchidas, sem TODO/TBD |
| Gherkin coverage (0-5) | 5 | 7 sucesso + 5 falha + 3 edge cases |
| Ambiguity (0-5) | 5 | Termos chave definidos: "presença online", "histórico inicial", "soft delete", "DEV_MODE" |
| Debt surface (0-5) | 5 | 9 débitos com impacto e mitigação; DT-011 (bug confirmado) com Gherkin correspondente |
| Wiki alignment (0-5) | 5 | 4 fontes consultadas; MSN + MS Graph validam UX e paginação; código cross-referenciado |
| **Total** | **25/25** | — |
