---
title: "Claude Code — Agent View (UI de múltiplas sessões)"
category: reference
tags: ["agent-view", "background-sessions", "claude-agents", "claude-code", "frontend", "supervisor", "terminal-tui"]
created: "2026-06-27"
rag_score: 0.5
updated: "2026-06-27"
summary: "Documentação Claude Code v2.1.139+ (preview) sobre agent view — TUI fullscreen via `claude agents` para despachar e gerenciar muitas sessões background, com supervisor process, worktrees isolados e atalhos de teclado."
lifecycle: reviewed
sources:
  - https://code.claude.com/docs/llms.txt
author: "phm-aguiar (Claude)"
provenance: ingested
base_confidence: 0.92
tier: 4
aliases: ["agent-view", "claude agents", "background-sessions"]
---

# Claude Code — Agent View

> Documentação canônica Claude Code v2.1.139+ sobre agent view. TUI fullscreen (`claude agents`) para despachar e gerenciar múltiplas sessões em background de uma tela única. Fonte: https://code.claude.com/docs/llms.txt.

## Conceito

`claude agents` abre tela para todas as sessões em background: o que está rodando, o que precisa de input, o que terminou. Despache novas, observe estado sem rolar transcripts, intervenha quando precisar. Cada sessão em background é **conversa completa** Claude Code que continua sem terminal anexado — abra, responda, saia.

**Quando usar:** múltiplas tarefas independentes que Claude pode trabalhar sem você observar cada passo. Despache fix-bug + revisar PR + investigar teste flaky como **três linhas**, continue em outra janela, verifique quando uma linha mostrar que precisa de você ou tem resultado.

**Quando `←` para anexar:**鼠 quiser trabalhar diretamente com qualquer sessão de agente, anexe à linha para entrar na conversa completa.

> **Status:** Preview de pesquisa. Requer Claude Code v2.1.139+. Interface + shortcuts podem mudar conforme evolui. Verifique versão: `claude --version`.

## Quick Start

```bash
claude agents
```

Abre TUI fullscreen com entrada na parte inferior e tabela que se preenche conforme sessões começam. `Esc` retorna para shell. **Suas sessões continuam rodando enquanto você está ausente** — reaparecem ao reabrir.

| Passo | Ação |
|-------|------|
| 1. Abrir agent view | `claude agents` do shell |
| 2. Despachar sessão | Digite prompt + `Enter` na entrada inferior |
| 3. Espreitar e responder | `↑`/`↓` para selecionar linha, `Space` para painel peek |
| 4. Anexar / desanexar | `Enter`/`→` anexa (sessão completa fullscreen), `←` desanexa |
| 5. Trazer sessão existente | `/bg` dentro dela, ou `←` em prompt vazio para bg + abre agent view |

**`claude agents` como entry point principal** em vez de `claude`: despache cada task da view, anexe quando quiser, `←` para retornar.

## Escopo por Diretório

```bash
claude agents --cwd ~/projects/my-app
```

Mostra apenas sessões iniciadas sob esse diretório. Sessão movida para worktree sob `~/projects/my-app/.claude/worktrees/` ainda conta como pertencente a `~/projects/my-app`.

> **Sessões interativas abertas em outros terminais** não aparecem até que você coloque-as em background. Subagents e teammates gerados por uma sessão **não** listam como linhas separadas.

## Estados Visuais da Sessão

| Estado | Ícone | Cor | Significado |
|--------|-------|-----|-------------|
| Working | `✽` animado | — | Rodando tool ativamente ou gerando resposta |
| Needs input | `✻` | Amarelo | Aguardando pergunta específica ou decisão de permissão |
| Idle | esmaecido | — | Sem nada para fazer, pronta para próximo prompt |
| Completed | `✻` | Verde | Tarefa concluída |
| Failed | — | Vermelho | Terminou em erro |
| Stopped | — | Cinza | Interrompida com `Ctrl+X` ou `claude stop` |

Forma do ícone = processo subjacente:
- `✻/✽` animado → processo vivo, responde na hora
- `∙` → processo saiu. Espreitar/responder/anexar reinicia onde parou
- `✢` → sessão `[/loop]` dormindo entre iterações

> Label `PR #N` aparece na borda direita se sessão abriu PR. Cor: Amarelo=aguarda review, Verde=pass+merge livre, Roxo=merged, Cinza=draft/closed. Múltiplos PRs = count (`3 PRs`).

**Título da aba terminal** mostra contagem awaiting-input: `2 awaiting input · claude agents`.

## Resumos de Linha (Haiku-class)

Cada linha tem resumo gerado por modelo **Haiku-class** para informar estado sem abrir transcript. **Limit**: máximo 1x a cada 15s durante trabalho ativo + 1x ao fim do turno.

**v2.1.161+:** count `done/total` aparece antes do summary quando sessão roda 2+ itens paralelos (`2/5`).

Cada update = Haiku-class request via provedor normal (cobra termos de usage de dados). Em provedores 3rd-party (Bedrock, Vertex, Foundry, gateways), fallback para modelo principal se nenhum Haiku configurado. Configure: `ANTHROPIC_DEFAULT_HAIKU_MODEL`.

## Peek and Reply

`Space` em linha selecionada → painel peek. Mostra o que a sessão precisa, saída mais recente, PRs abertos. **Suficiente na maioria das vezes** — nunca abra transcript completo.

- Digite resposta no peek + `Enter` → envia sem sair do agent view
- Multipla escolha: peek mostra opções, pressione tecla numérica
- Sessões bloqueadas: `Tab` preenche entrada com resposta sugerida que você edita
- Prefixe `!` para comando Bash em vez de resposta
- v2.1.161+: painel nomeia trabalho rodando há mais tempo e há quanto
- v2.1.145+: voice dictation — mantenha/tecle tecla push-to-talk com input focado

Setas `↑/↓` espreitam sessões adjacentes sem fechar painel. `→` anexa.

## Attach / Detach

`Enter` ou `→` em linha = anexar (agent view substituído por sessão interativa completa). Claude publica brief summary do que aconteceu enquanto ausente.

- Sessões anexadas sempre fullscreen (independente de config `tui`) — bg session não tem scrollback terminal para anexar.
- Scroll: `PgUp/PgDn`, roda mouse, ou `Ctrl+O` modo transcript.
- Scroll nativo terminal e tmux copy mode mostram apenas viewport atual.
- `←` em prompt vazio desanexa → retorna para agent view.
- Diálogo focado, `←` não responde: `Ctrl+Z` desanexa imediato.
- `Ctrl+C` mantém interrupt default (cancela response ou shell `!`). **2x `Ctrl+C` em prompt vazio desanexa.**
- `/exit`, duplo `Ctrl+D`: também desanexa.

**Desanexar nunca interrompe bg**: `←`, `Ctrl+Z`, `/exit`, 2x `Ctrl+C`, 2x `Ctrl+D` deixam roda. Encerrar de dentro: `/stop`.

> `←` em prompt vazio funciona de **qualquer** sessão Claude Code, não só agent view. Bg sessão + abre agent view com linha selecionada. Linha criada mesmo de sessão nova sem histórico → `→` retorna. Única linha → hint de integração abaixo. Desativar: `leftArrowOpensAgents` em `/config`.

## Organizar a Lista

Agent view agrupa: `Ready for review` + `Needs input` no topo, `Working` + `Completed` abaixo. Nomes **não** são 1-1 com estados — `Ready for review` = tem PR aberto, `Completed` agrupa concluída + failed + stopped.

- `Ctrl+S` agrupa por diretório em vez de estado (persiste entre runs)
- `Ctrl+T` fixa sessão no topo + mantém processo rodando enquanto idle
- `Shift+↑/↓` reordena
- `Ctrl+R` renomeia
- `Enter` em group header recolhe
- `Ctrl+X` interrompe; 2x em 2s deleta. `Ctrl+X` em group header deleta cada (com confirmação)

> **Deletar remove session + worktree que Claude criou** (inclui alterações uncommitted). Faça push/commit do que quer manter antes. Worktree que VOCÊ criou é deixado no lugar. Transcript fica local + disponível via `claude --resume`.

Sessões concluídas mais antigas dobram em `… N more`. Falhas + sessões com PR aberto sempre visíveis.

## Atalhos de Teclado

`?` em agent view mostra cada atalho em contexto.

| Atalho | Ação |
|--------|------|
| `↑/↓` | Move entre linhas |
| `Enter` | Anexar selecionada; ou despachar se texto na entrada |
| `Space` | Abrir/fechar painel peek |
| `Shift+Enter` | Despachar + anexar imediato |
| `→` | Anexar selecionada |
| `Alt+1..Alt+9` | Anexar sessão 1–9 do diretório focado |
| `Tab` | Em entrada vazia: procurar subagents. Senão: aplicar sugestão destacada |
| `Ctrl+S` | Toggle agrupamento estado vs diretório |
| `Ctrl+T` | Pin/unpin selecionada |
| `Ctrl+R` | Renomear selecionada |
| `Ctrl+G` | Abrir prompt de despacho no `$VISUAL`/`$EDITOR` |
| `Ctrl+X` | Interromper; 2x em 2s deleta |
| `Shift+↑/↓` | Reordenar selecionada |
| `Esc` | Fechar painel peek, limpar entrada ou sair |
| `Ctrl+C` | Limpar entrada; 2x para sair |
| `?` | Mostrar todos os atalhos |

## Despachar Novos Agentes

### From Agent View

Digite prompt na entrada inferior + `Enter`. Sessão nomeada automaticamente — renomeie com `Ctrl+R`.

**Controle de despacho via prefixos:**

| Entrada | Efeito |
|---------|--------|
| `<agent-name> <prompt>` | Primeira palavra = nome de subagent custom → executa como agente principal com config frontmatter |
| `@<agent-name>` | Mencione subagent custom em qualquer lugar → executa como principal |
| `@<repo>` | Mention repo sob CWD → executa sessão naquele |
| `/<command>` | Sugerir skills/commands para despachar como prompt |
| `! <command>` | Executa comando shell como trabalho bg (PTY). Aparece como linha, anexável/espreitável |
| `#<number>` ou URL PR | Se sessão já trabalha naquele PR → seleciona em vez de despachar |
| `Shift+Enter` | Despachar + anexar imediato à nova sessão |

Pequeno conjunto de comandos roda em agent view em vez de ser despachado: `/exit`, `/quit` (fecha agent view), `/logout` (desconecta), `/model` (define modelo). Skills, comandos custom e built-ins que expandem prompts (`/init`) → enviados para nova sessão bg como primeiro prompt. Outros built-ins mostram hint `attach to a session to run it`.

**Match de primeira palavra:** mesmo `@name` casa subagent + repo irmão? Subagent tem precedência. Match primeira palavra também: prompt começa com nome de subagent → despacha esse subagent em vez de tratar como texto. Use `@` para ser explícito, ou comece com palavra diferente para evitar match.

### Dispatch por Diretório Específico

Nova sessão roda no diretório onde abriu agent view. Para outro:

- Abra `claude agents` naquele diretório
- Ou `claude agents` em diretório pai + `@<repo>` no prompt
- Ou do shell: `cd` + `claude --bg "<prompt>"`

Grouped by directory: diretório da linha destacada vira target de despacho.

### From Inside a Session

```
/background  (ou /bg)
```

Move conversa atual para bg. `/bg run test suite and fix failures` adiciona instrução antes. Claude respondendo quando você executa `/bg` → resposta continua na session bg.

> Bg de sessão interativa inicia **novo processo** que retoma da conversa salva — subagents, monitors, comandos bg **não transferidos**. Claude pede confirmação se algo está rodando antes de bg.

**Flags de configuração transferidas** para bg session:
- `--mcp-config`, `--strict-mcp-config`
- `--settings`, `--add-dir`, `--plugin-dir`
- `--fallback-model`, `--allow-dangerously-skip-permissions`

Diretórios adicionados durante sessão via `/add-dir` também transferem. `--allow-dangerously-skip-permissions` mantém `bypassPermissions` acessível na bg session mas **não concede nada novo** — mesmo acceptance interativo único se aplica.

### From Your Shell

```bash
claude --bg "investigate the flaky SettingsChangeDetector test"
```

Combinável com `--agent <name>` para subagent específico como agente principal. `--name <display>` para nome em agent view em vez de auto:

```bash
claude --bg --name "flaky-test-fix" "investigate flaky SettingsChangeDetector test"
```

Após bg, Claude imprime ID curto + comandos de gestão:

```text
backgrounded · 7c5dcf5d · flaky-test-fix
  claude agents             list sessions
  claude attach 7c5dcf5d    open in this terminal
  claude logs 7c5dcf5d      show recent output
  claude stop 7c5dcf5d      stop this session
```

### Run a Shell Command

`! <cmd>` como primeiro caractere da entrada → executa comando shell como trabalho bg (PTY), aparece como linha em agent view. Linha mais recente = status.

Mesma coisa do shell: `claude --bg --exec 'pytest -x'`.

**Saída** capturada em memória (não escrita em disco). Comandos rodam no lugar de Claude — **nenhum modelo invocado**. Linha + output limpos ~5 minutos após comando sair.

Para ver: anexe, `Space` peek, ou `claude logs <id>`.

## Isolamento de File Edits

**Toda sessão bg** (de agent view, `/bg`, ou `claude --bg`) inicia no seu CWD. Antes de editar arquivos, Claude move sessão para **git worktree isolado** sob `.claude/worktrees/`. Paralelas leem mesmo checkout mas cada uma escreve em seu próprio.

**Claude pula worktree** quando:
- Sessão já em git worktree (Claude criou ou você criou com `git worktree add`)
- CWD não é repo git e nenhum hook `WorktreeCreate` configurado
- Escrita é fora do CWD

**Desativar** para repo onde worktrees são impráticos: `worktree.bgIsolation = "none"` em `.claude/settings.json` do projeto (v2.1.143+):

```json
{
  "worktree": {
    "bgIsolation": "none"
  }
}
```

> Fora de git repo, sessões escrevem direto no CWD e **não isolam** entre si — evite dispatch paralelas editando mesmos arquivos. VCS não-git: configurar hook `WorktreeCreate`.

**Deletar sessão em agent view** (`Ctrl+X` 2x) remove worktree criado por Claude, **incluindo uncommitted changes**. `claude rm` mantém worktree com uncommitted + imprime caminho. Worktree que você criou manual é deixado no lugar.

Subagent gerado por bg session herda CWD da sessão → edits vão ao worktree da sessão, não copy de trabalho. Para subagent em worktree separado: `isolation: worktree` em frontmatter ou passe `isolation: "worktree"` ao gerar.

## Set the Model

Modelo mostrado no header = default de despacho (sessões novas). Vem de `model` em user settings. `/model` no seletor ou edit direto. Override para toda session view: `--model ao abrir claude agents`.

**Dentro de agent view**: `/model <nome>` na entrada + `Enter`. Header atualiza com marcador `(session)`. Sessões despachadas após usam-no. `/model default` limpa override. Persiste só execução atual — **não escreve em settings**. Requer v2.1.172+.

```text
/model opus
refactor auth
/model sonnet
run the test suite
```

**Por sessão**: `claude --bg --model <m>` do shell; anexe → `/model` + pressione `s` em modelo (persiste em restart); subagent com frontmatter `model`.

## Permission Mode, Model, Effort

Bg session lê settings do diretório onde roda (como se você tivesse `claude` lá). Valores `env` em project settings se aplicam.

**Provider cloud selection** (`CLAUDE_CODE_USE_BEDROCK`/`VERTEX`) e aliases `ANTHROPIC_DEFAULT_*_MODEL` seguem shell que despachou. **Endpoint gateways** (`ANTHROPIC_BASE_URL` + `ANTHROPIC_AUTH_TOKEN`) **não** seguem — veja supervisor process.

**Permission mode**:
- `/bg` ou `←` mantém modo atual (session alterada para `acceptEdits`/`auto` permanece)
- Despachar de agent view input ou `claude --bg` usa `defaultMode` daquele dir, ou `permissionMode` do frontmatter do subagent despachado

**Persistência**: permission mode + model + effort + config flags persistem quando supervisor [para/reinicia](#the-supervisor-process) processo. `--dangerously-skip-permissions`/`--permission-mode bypassPermissions` mantém `bypassPermissions` após restart. `/model` ou `/effort` no meio da sessão persiste.

**Padrões para cada sessão despachada:**
```bash
claude agents --permission-mode plan --model opus --effort high
```

| Flag | Versão |
|------|--------|
| `--permission-mode`, `--model`, `--effort`, `--dangerously-skip-permissions` | v2.1.142 |
| `--allow-dangerously-skip-permissions` | v2.1.143 |
| `--agent` (honra `agent` config) | v2.1.157 |

`--agent` define subagent usado quando prompt de despacho não nomeia um. Default = config `agent` se definido, senão `claude` integrated catch-all. Nomear subagent na entrada sobrepõe.

Active defaults aparecem no rodapé abaixo da entrada de despacho. Sem flags, sessão usa `defaultMode` do dir, ou `permissionMode` do frontmatter do subagent.

> `bypassPermissions` ou `auto` recusado até você ter aceitado (`claude` uma vez interativo). Mesmo se passado para `claude agents` ou `claude --bg --permission-mode`.

## Settings, Plugins, MCP Servers

Agent view aceita mesmas flags que `claude` (v2.1.142+). Cada flag aplica a **agent view em si** + cada sessão despachada.

| Flag | Efeito |
|------|--------|
| `--settings <file-or-json>` | Override settings para view + sessions |
| `--add-dir <path>` | Acesso a arquivo em diretório adicional |
| `--plugin-dir <path>` | Carrega plugin local |
| `--mcp-config <file-or-json>` | Carrega MCP servers |
| `--strict-mcp-config` | Apenas MCPs de `--mcp-config` |

```bash
claude agents --settings ./ci-settings.json --add-dir ../shared-lib
```

## Gerenciamento do Shell

Cada bg session tem **ID curto** (impresso em `claude --bg`, `~/.claude/jobs/<id>/`).

| Comando | Propósito |
|---------|-----------|
| `claude agents` | Abre agent view |
| `claude agents --cwd <path>` | Escopo para sessões em `<path>` |
| `claude agents --json` | Print active sessions como JSON array + sai. `--all` inclui completed bg. Entry fields: `cwd`, `kind`, `startedAt`. Bg entries: `id`, `state` (working/blocked/done/failed/stopped), `pid`, `status`, `waitingFor`. Combine com `--cwd <path>` para filtrar. |
| `claude attach <id>` | Anexa a sessão neste terminal |
| `claude logs <id>` | Output recente |
| `claude stop <id>` | Interrompe (alias `claude kill`) |
| `claude respawn <id>` | Reinicia sessão (running/stopped) com conversa intacta (ex: novo binário) |
| `claude respawn --all` | Reinicia cada sessão running |
| `claude rm <id>` | Remove sessão. Remove worktree Claude criou (sem uncommitted) ou imprime caminho (com uncommitted). Deixa worktree manual. Transcript local + `claude --resume`. |
| `claude daemon status` | Estado supervisor: versão, socket dir, worker count |
| `claude daemon stop --any` | Para supervisor + bg sessions. `--keep-workers` deixa bg sessions rodando para próximo supervisor se reconectar |

## Processo Supervisor

Bg sessions são hospedadas por **processo supervisor por usuário**, separado do seu terminal + agent view. Iniciado automaticamente na 1ª vez que bg uma session ou abre agent view. Você não gerencia diretamente.

**Worker pre-warmed:** supervisor mantém processo pré-aquecido pronto para dispatch sem cold launch. Atribui worker pré-aquecido, aplica dir/settings/credenciais da sessão, inicia substituto para próximo dispatch. Se nenhum worker saudável, inicia novo.

**Auth:** supervisor e sessions autenticam com mesmas stored credentials que sessions interativas. Sem conexões rede extras além de API do modelo.

> **v2.1.174+**: bg session NÃO herda vars endpoint gateway (`ANTHROPIC_BASE_URL`, Bedrock/Vertex/Foundry base URLs, `ANTHROPIC_AUTH_TOKEN` pareado) do shell que iniciou supervisor ou despachou. Usa stored credentials + valores `env` em settings do projeto. Para LLM gateway: defina `ANTHROPIC_BASE_URL` em `env` do `.claude/settings.json` do projeto em vez de exportar no shell. Antes v2.1.174, bg session herdava do startup shell.

Cada bg session = próprio processo Claude Code, gerenciado pelo supervisor. Sessão working/aguardando-com-input/anexada mantém processo. Bg shell command, subagent, dynamic workflow, monitor conta como active work → servidor dev de longa duração mantém sessão ativa.

**Idle timeout:** sessão terminada + detached ~1h → supervisor interrompe processo para liberar recursos. Pinned (`Ctrl+T`) isento, mantém processo em idle. Transcript + estado ficam disco. Próximo attach/peek/response → supervisor inicia novo processo de onde parou. Quando cada sessão terminou + nenhum terminal conectado, supervisor sai; reinicia na próxima vez que precisar.

`←` que **nunca recebeu prompt** = removida completamente após ~5min. `claude --bg` sessions e aguardando trust dialog não são removidas.

**Low host memory:** supervisor interrompe unfixed inactives primeiro; pinned só se isso não liberou nada.

**Binary watch:** supervisor observa binário Claude Code instalado + reinicia após auto-updater substituir. Observação arquivo local, sem network check. Sessões bg = processos detached, continuam durante reinicialização; novo supervisor se reconecta. Pinned inactive é reiniciada in-place para pegar update sem você se reconectar.

### Onde o Estado é Armazenado

| Path | Conteúdo |
|------|----------|
| `~/.claude/daemon.log` | Log do supervisor |
| `~/.claude/daemon/roster.json` | Lista bg sessions (reconexão após restart) |
| `~/.claude/jobs/<id>/state.json` | Estado por sessão em agent view |
| `~/.claude/jobs/<id>/tmp/` | Scratch per-session. Writes não pedem permissão. Removido quando sessão deletada |

Definir `CLAUDE_CONFIG_DIR` → supervisor usa esse dir (instância separada).

**`CLAUDE_JOB_DIR`**: cada bg session tem env var apontando para `~/.claude/jobs/<id>`. Comandos shell podem escrever temp em `$CLAUDE_JOB_DIR/tmp` sem colidir com paralelas.

Inspecionar sem ler arquivos: `claude daemon status` (acessível, pid, versão, socket dir, count bg sessions). `/doctor` inclui mesmo summary.

Comando avisa se versão do supervisor difere de `claude` invocado (após update que supervisor ainda não reiniciou). Mostra ambas as versões, sugere `claude daemon stop --any`. **Windows**: `claude daemon status` expõe erro de arquivo subjacente quando daemon pipe key está bloqueada/ilegível.

## Desativar Agent View

Setting `disableAgentView: true` ou env `CLAUDE_CODE_DISABLE_AGENT_VIEW`. Admins impõem via managed settings.

## Troubleshooting

### `claude agents` lista subagentes em vez de abrir agent view

Significa agent view **não disponível** no ambiente. Versões anteriores não abriam em todos os ambientes (incluindo Bedrock/Vertex/Foundry). Solução: `claude update`. Persistindo: verifique se foi [desativado](#desativar-agent-view).

### Agent view abre sem sessões

Antes da primeira sessão despachada, mostra hint de integração com prompts de exemplo. Digite prompt na entrada inferior + `Enter` para despachar primeira sessão.

### Cannot open agents (work running in background)

`←` mostra `Cannot open agents — N still running in the background` se sessão tem trabalho em curso (subagent, dynamic workflow, bg shell command). Atalho não abandonaria silently. Solução: `/tasks` para ver o que roda, depois `/bg` para confirmar abandono. Subagents/monitors/bg commands **não transferem** quando você coloca em bg.

### Prompt rejeitado (too short)

Entrada de dispatch espera descrição de task. **<4 caracteres** rejeitado com hint `Too short` para que keypress acidental não dispare. Descreva com mínimo útil: `investigate the flaky checkout test`.

### Sessions show as failed after shutdown

Shutdown/reboot interrompe bg sessions → mostram como failed ao reabrir agent view. **Anexe/espreite/responda qualquer uma** → sessão reinicia de onde parou.

Sleep sozinho **não** causa isto. Supervisor se reconecta ao acordar.

### Agent view diz que background service não respondeu

**Supervisor provavelmente travou.** Stop + próximo `claude agents` inicia novo. Para manter bg sessions durante restart:

```bash
claude daemon stop --any --keep-workers
```

Sem `--keep-workers`, comando também encerra bg sessions. `--any` confirma stop de supervisor on-demand em vez de serviço instalado (default).

**Windows**: se supervisor não responder a stop, comando imprime pid. `taskkill /PID <pid>` para concluir. Bg sessions preservadas se `--keep-workers`.

### Dispatch fails with `Could not resolve authentication method`

v2.1.174+: significa supervisor não tinha stored credentials. Confirme `/login` ou API key configurada, depois:

```bash
claude daemon stop --any --keep-workers
```

Próximo `claude agents`/`claude --bg` inicia novo supervisor que lê stored credentials. Se autenticando com env var (`ANTHROPIC_API_KEY`) em vez de `/login`, execute próximo comando de shell com var definida.

Antes v2.1.174: pre-warmed worker ocioso exibia este erro quando atribuído a dispatch mesmo credenciais válidas. Update para recuperar.

### Background sessions não leem Desktop/Documents/Downloads (macOS)

Host bg session = próprio processo → solicita acesso a pastas protegidas separadamente do terminal. Se bg session reporta `Operation not permitted` em `~/Desktop`, `~/Documents`, `~/Downloads`: **System Settings → Privacy & Security → Files and Folders**, ou habilite **Full Disk Access**.

Native installer: entrada aparece como "Claude Code" e persiste através de updates. Homebrew/npm: entrada mostra bin path, pode precisar re-grant após update.

### Sessão lenta ao anexar

Sessão terminada + detached ~1h → supervisor interrompe processo. Anexar inicia novo de onde parou (leva momento). Working/aguardando/teclado **não interrompidas** assim → `Ctrl+T` para manter responsivo.

### `.claude/worktrees/` enchendo

Deletar sessão em agent view remove worktree. `claude rm` mantém worktree com uncommitted + imprime caminho. Liste restantes: `git worktree list` no projeto, remova cada: `git worktree remove <path>`.

## Limitações

- **Rate limits aplicam**: bg sessions consomem uso de assinatura mesma forma que interativas → 10 paralelas = 10x mais rápido
- **Sessões locais**: bg rodam em sua máquina. Preservadas em sleep, param se shutdown
- **Worktrees criadas pelo Claude deletadas com sessão em agent view**: merge/push antes de deletar sessão que editou em seu worktree. `claude rm` mantém worktree com uncommitted; worktree manual deixado no lugar

## Related

- [[agent-teams]] — equipes de agentes (companheiros se mensagemando diretamente)
- [[claude-skills]] — sistema de skills + invocação
- [[kanban-orchestrator]] — equivalente conceitual em claude Agent (LATTE)
