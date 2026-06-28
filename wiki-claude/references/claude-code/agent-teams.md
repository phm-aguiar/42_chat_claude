---
title: "Claude Code — Agent Teams (orquestração de companheiros)"
category: reference
tags: [claude-code, agent-teams, subagentes, orquestracao, paralelismo]
created: "2026-06-27"
rag_score: 0.5
updated: "2026-06-27"
summary: "Documentação Claude Code v2.1.178+ sobre equipes de agentes — orquestração de múltiplos companheiros Claude Code com lista de tarefas compartilhada, mensagens diretas e modos in-process / split-pane."
lifecycle: reviewed
sources:
  - https://code.claude.com/docs/llms.txt
author: "phm-aguiar (Claude)"
provenance: ingested
base_confidence: 0.92
tier: 4
aliases: ["agent-teams", "Claude Teams", "teammates"]
---

# Claude Code — Agent Teams

> Documentação canônica Claude Code v2.1.178+ sobre equipes de agentes. Cobre ativação, modos de exibição, controle de tarefas, hooks e arquitetura. Fonte: https://code.claude.com/docs/llms.txt (página "Orquestre equipes de sessões Claude Code").

## Status do Recurso

- **Experimental.** Desabilitado por padrão. Ativar via `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` em `~/.claude/settings.json` ou ambiente.
- Limitações conhecidas: retomada de sessão com companheiros in-process não restaura; status da tarefa pode atrasar (companheiros falham em marcar `completed`); encerramento pode ser lento.
- A partir de v2.1.178: nova flag `teammateMode` substitui o antigo sistema `TeamCreate/TeamDelete` (deprecadas).

## Quando Usar (vs Subagents)

| Critério | Subagents | Agent Teams |
|----------|-----------|-------------|
| Context window | Própria, isolada | Própria, totalmente independente |
| Comunicação | Resultado volta ao main | Companheiros se mensagemam diretamente |
| Coordenação | Main gerencia tudo | Lista de tarefas compartilhada, auto-coordenação |
| Melhor para | Tarefas focadas (resultado importa) | Trabalho complexo (requer discussão/colaboração) |
| Custo de tokens | Menor (resumo de retorno) | Maior (cada companheiro = instância Claude completa) |

**Use subagents quando:** quer workers rápidos e focados que reportam de volta.
**Use equipes quando:** companheiros precisam compartilhar descobertas, desafiar uns aos outros e coordenar por conta própria.

## Quando Vale a Pena

Mais eficaz quando exploração paralela adiciona valor real:
- **Pesquisa e revisão** (múltiplos companheiros investigam ângulos diferentes e desafiam achados)
- **Novos módulos ou features** (cada companheiro possui uma peça separada)
- **Debug com hipóteses concorrentes** (testam teorias em paralelo)
- **Coordenação entre camadas** (frontend/backend/testes em paralelo)

**Evitar para:** tarefas sequenciais, edições no mesmo arquivo, trabalho altamente acoplado. Sobrecarga de coordenação drena o benefício.

## Ativação

`~/.claude/settings.json`:
```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

Após ativar, descreva a tarefa em linguagem natural. Claude cria e coordena sozinho.

Exemplo:
```
I'm designing a CLI tool that helps developers track TODO comments across
their codebase. Spawn three teammates to explore this from different angles:
one on UX, one on technical architecture, one playing devil's advocate.
```

## Modos de Exibição

| Modo | Comportamento | Requisito |
|------|---------------|-----------|
| **in-process** (padrão) | Companheiros rodam no terminal principal; setas ↑/↓ no painel → Enter para visualizar | Nenhum |
| **split-panes** | Cada companheiro em painel próprio; clique para interagir | tmux ou iTerm2 |
| **auto** | Ativa split-panes se já estiver em tmux/iTerm2, senão in-process | detecta terminal |
| **tmux** | Força split-pane via tmux | `tmux` instalado |
| **iterm2** | Força split-pane nativo iTerm2 (v2.1.186+) | `it2` CLI + API Python |

Configurar em `~/.claude/settings.json`:
```json
{ "teammateMode": "auto" }
```

Ou por sessão: `claude --teammate-mode auto`.

> Limitações tmux: tradicionalmente melhor no macOS. Sugestão: `tmux -CC` no iTerm2.

## Especificar Companheiros e Modelos

Claude decide o número com base na tarefa, ou você pode ser explícito:

```
Spawn 4 teammates to refactor these modules in parallel. Use Sonnet for
each teammate.
```

- Companheiros **não herdam** `/model` do líder por padrão. Configurar "Default teammate model" em `/config`.
- A partir de v2.1.186: herdam nível de esforço do líder (`low|medium|high|xhigh|max`).

## Aprovação de Plano por Companheiro

Para tarefas complexas/arriscadas, exija planejar antes de implementar:

```
Spawn an architect teammate to refactor the authentication module.
Require plan approval before they make any changes.
```

- Companheiro trabalha em modo plan-only (read-only) até aprovação.
- Líder revisa, aprova ou rejeita com feedback.
- Se rejeitado, companheiro revisa e resubmete.
- Líder toma decisões autonomamente. Influencie com critérios no prompt: *"apenas aprove planos com cobertura de testes"*, *"rejeite planos que modifiquem o schema do banco"*.

## Falar Direto com Companheiros

Cada companheiro = sessão Claude Code completa independente.

- **in-process**: setas ↑/↓ selecionam → Enter visualiza + digita mensagem. `x` interrompe selecionado. `Ctrl+T` alterna lista de tarefas.
- **split-pane**: clique no painel para interagir diretamente com a sessão.

## Atribuir e Reivindicar Tarefas

Lista de tarefas compartilhada coordena equipe. Estados: `pending`, `in_progress`, `completed`. Tarefas podem depender de outras (pendente com dependências não-resolvidas = bloqueada para reivindicação).

- **Líder atribui**: "dê a tarefa X para o companheiro Y"
- **Auto-reivindicar**: após terminar, pega próxima não-atribuída e desbloqueada sozinho
- Reivindicação usa **file locking** para evitar race condition quando múltiplos companheiros tentam reivindicar simultaneamente.

## Encerrar Companheiros

```
Ask the researcher teammate to shut down
```

Líder envia shutdown request → companheiro aprova (graceful exit) ou rejeita com explicação. Diretórios compartilhados são limpos automaticamente.

## Quality Gates com Hooks

- `TeammateIdle` — quando companheiro vai ficar ocioso. Exit code 2 = feedback, mantém trabalhando.
- `TaskCreated` — quando tarefa é criada. Exit code 2 = bloqueia criação, envia feedback.
- `TaskCompleted` — quando tarefa vai ser marcada concluída. Exit code 2 = bloqueia conclusão, envia feedback.

## Arquitetura

| Componente | Papel |
|------------|-------|
| **Team lead** | Sessão Claude Code principal que gera e coordena companheiros |
| **Teammates** | Instâncias Claude Code separadas, cada uma em sua tarefa atribuída |
| **Task list** | Lista compartilhada que companheiros reivindicam e completam |
| **Mailbox** | Sistema de mensagens entre agentes |

**Sistema de coordenação automática:** Dependências gerenciadas sem intervenção manual. Quando companheiro completa tarefa desbloqueadora, tarefas dependentes viram disponíveis.

**Armazenamento local:**
- Team config: `~/.claude/teams/{team-name}/config.json`
- Task list: `~/.claude/tasks/{team-name}/`

Nome derivado da sessão: `session-<primeiros-8-chars-do-id>`. Config dir removido no fim da sessão. Task list persiste.

> Configuração da equipe contém estado runtime (IDs de sessão, IDs de painel tmux). **Não edite manualmente** — sobrescrito na próxima atualização. Para papéis reutilizáveis, use [[claude-skills#subagent-definitions|subagent definitions]].

## Definições de Subagent como Companheiros

Você pode referenciar um tipo de subagent (escopo: projeto, usuário, plugin ou CLI-defined) ao gerar companheiro:

```
Spawn a teammate using the security-reviewer agent type to audit the auth module.
```

- Companheiro honra `tools` e `model` dessa definição.
- Corpo da definição é **anexado** ao system prompt do companheiro (não substitui).
- Ferramentas de coordenação (`SendMessage`, gerência de tarefas) **sempre disponíveis**, mesmo se `tools` restringe outras.

> Campos `skills` e `mcpServers` em subagent **não são aplicados** quando executado como companheiro. Companheiros carregam skills/MCP de configurações de projeto/usuário, igual uma sessão regular.

## Permissões

- Companheiros começam com **permissões do líder.** `--dangerously-skip-permissions` propaga para todos.
- Após geração, pode mudar modos individuais, mas **não por companheiro no tempo de geração**.

## Context e Comunicação

Cada companheiro tem sua própria context window. Na geração, carrega contexto de projeto (CLAUDE.md, MCP servers, skills) + prompt de geração do líder. **Histórico da conversa do líder NÃO é transferido.**

Como compartilham informação:
- **Entrega automática de mensagens** — destinatários recebem sem polling
- **Notificações de ociosidade** — líder avisado quando companheiro fica idle
- **Lista de tarefas compartilhada** — todos veem status, reivindicam trabalho
- **Sistema de mensagens por nome** — `SendMessage` para companheiro específico

Líder atribui nome ao gerar. Companheiros podem mencionar uns aos outros pelo nome. Para nomes previsíveis em prompts posteriores, **diga ao líder como chamar cada um na instrução de geração**.

## Custo de Tokens

Equipes escalam linearmente com número de companheiros ativos (cada um = context window separada). Pesquisa/revisão/novos recursos geralmente valem o custo. Tarefas rotineiras: sessão única é mais econômica.

## Exemplos de Casos de Uso

### Code Review Paralela (`grep -lE "PR.*review" .`)
```
Spawn three teammates to review PR #142:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review and report findings.
```
Cada revisor aplica filtro distinto. Líder sintetiza após todos terminarem.

### Investigação com Hipóteses Concorrentes
```
Users report the app exits after one message instead of staying connected.
Spawn 5 agent teammates to investigate different hypotheses. Have them talk to
each other to try to disprove each other's theories, like a scientific
debate. Update the findings doc with whatever consensus emerges.
```
Debate é o mecanismo-chave. Investigação sequencial sofre de ancoragem; múltiplos investigadores adversariais eliminam viés.

## Boas Práticas

- **Dê contexto suficiente** — companheiros NÃO herdam histórico do líder. Inclua detalhes da tarefa no prompt de geração.
- **Tamanho apropriado de equipe** — 3 a 5 para maioria dos workflows. 5–6 tasks por companheiro mantém produtividade sem alternância excessiva.
- **Tarefas bem dimensionadas** — unidades self-contained com entregável claro (função, teste, review). Muito pequeno = overhead domina. Muito grande = risco de retrabalho.
- **Espere os companheiros terminarem** — líder às vezes implementa em vez de esperar. Prompt corretivo: *"Wait for your teammates to complete their tasks before proceeding"*.
- **Comece com pesquisa/revisão** — limites claros, sem implementação paralela (menos coordenação).
- **Evite conflitos de arquivo** — dois companheiros editando o mesmo arquivo = sobrescrita. Divida por domínio de arquivo.
- **Monitore e direcione** — não deixe supervisorless por muito tempo. Redirecione antes que esforço vire desperdício.

## Troubleshooting

### Companheiros não aparecem
- in-process: painel abaixo do prompt. Setas ↑/↓ → Enter para visualizar.
- Linha que desapareceu = escondida por ociosidade (não interrompida). Reaparece em 30s ou ao enviar mensagem.
- Verifique se `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` está setado.
- Tarefa complexa o suficiente? Claude decide se vale.
- tmux: `which tmux`. iTerm2: `it2` CLI instalado + API Python ativada.

### Muitos prompts de permissão
Pré-aprove operações comuns em `/permissions` antes de gerar equipe para reduzir interrupções.

### Companheiros parando em erros
Podem parar em vez de recuperar. Soluções:
- Dê instruções adicionais diretamente
- Gere um companheiro substituto

### Líder encerra antes do trabalho completo
Diga para continuar. Ou: *"Wait for your teammates to finish before proceeding"*.

### Sessões tmux órfãs
```bash
tmux ls
tmux kill-session -t <session-name>
```

## Limitações Atuais

- **Sem retomada de sessão com companheiros in-process** — `/resume`, `/rewind` não restauram. Pode resultar em líder enviando mensagens para companheiros inexistentes → diga para gerar novos.
- **Status de tarefa pode atrasar** — companheiros às vezes falham em marcar como concluída, bloqueando dependentes. Verifique manualmente ou empurre o companheiro.
- **Encerramento pode ser lento** — companheiros terminam chamado de ferramenta/tool em curso antes de sair.

## Related

- [[claude-skills]] — sistema de skills (complementar; estrutura de invocação e frontmatter)
- [[agent-view]] — UI para gerenciar múltiplas sessões (`claude agents`)
- [[kanban-orchestrator]] — como orquestração funciona no framework claude (analogia direta)
- [[latte-protocol]] — protocolo LATTE para coordenação de agent teams
