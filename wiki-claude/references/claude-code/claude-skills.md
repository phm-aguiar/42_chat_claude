---
title: "Claude Code — Skills (SKILL.md, frontmatter, invocação)"
category: reference
tags: ["SKILL.md", "agentskills", "claude-code", "frontmatter", "plugins", "skills"]
created: "2026-06-27"
rag_score: 0.5
updated: "2026-06-27"
summary: "Documentação Claude Code sobre skills — criação de SKILL.md, frontmatter completo, escopos (pessoal/projeto/plugin/enterprise), invocação (user/claude), execução em subagent, share e troubleshooting. Padrão aberto Agent Skills (agentskills.io)."
lifecycle: reviewed
sources:
  - https://code.claude.com/docs/llms.txt
  - https://agentskills.io
author: "phm-aguiar (Claude)"
provenance: ingested
base_confidence: 0.95
tier: 5
aliases: ["claude-skills", "SKILL.md", "Agent Skills"]
---

# Claude Code — Skills

> Documentação canônica Claude Code sobre skills. Formato aberto [Agent Skills](https://agentskills.io). Página "Estenda Claude com skills" do https://code.claude.com/docs/llms.txt. **Aplicabilidade direta ao claude Agent** (sistema de skills funciona segundo o mesmo padrão).

## Conceito

Skills estendem o que Claude pode fazer. Crie um arquivo `SKILL.md` com instruções, e Claude adiciona ao kit de ferramentas. Claude usa skills quando relevante, ou você invoca diretamente com `/skill-name`.

Crie uma skill quando você fica colando o mesmo manual/checklist/procedimento no chat, ou quando uma seção de CLAUDE.md virou um procedimento de múltiplas etapas em vez de fato. Diferente de CLAUDE.md (sempre injetada), o corpo de uma skill carrega apenas quando usado — referência longa custa quase nada até precisar.

> **Comandos foram mesclados em skills.** `.claude/commands/deploy.md` e `.claude/skills/deploy/SKILL.md` ambos criam `/deploy`. `.claude/commands/` ainda funciona. Skills suportam: diretório para arquivos de suporte, frontmatter para controlar invocação, **injeção de contexto dinâmico**, **execução em subagent**.

## Skills Agrupadas

Claude Code inclui um conjunto embutido, desabilitável via `disableBundledSkills`:
- `/code-review`, `/batch`, `/debug`, `/loop`, `/claude-api`
- **Tríade run-verify-generator** (v2.1.145+):
  - `/run` — inicia e conduz seu app
  - `/verify` — compila e executa pra confirmar mudança
  - `/run-skill-generator` — registra receita de build/startup uma vez por projeto, depois `/run`/`/verify` seguem ela

`/run` e `/verify` funcionam sem config (inferem tipo via README/Makefile), mas viram flaky em projetos non-trivial (db, env, graphical session). Use `/run-skill-generator` para projetos com setup não-padrão.

## Criando sua Primeira Skill

Este exemplo cria skill que resume mudanças uncommitted:

1. **Criar diretório**:
   ```bash
   mkdir -p ~/.claude/skills/summarize-changes
   ```

2. **Escrever SKILL.md** (frontmatter + markdown):
   ```yaml
   ---
   description: Summarizes uncommitted changes and flags anything risky. Use when the user asks what changed, wants a commit message, or asks to review their diff.
   ---

   ## Current changes

   !`git diff HEAD`

   ## Instructions

   Summarize the changes above in two or three bullet points, then list any risks you notice such as missing error handling, hardcoded values, or tests that need updating. If the diff is empty, say there are no uncommitted changes.
   ```

3. **Testar**:
   - **Claude invoca automaticamente**: pergunte algo que case com a description: `What did I change?`
   - **Invocação direta**: `/summarize-changes`

A linha `` !`git diff HEAD` `` usa **injeção de contexto dinâmico** — Claude Code executa o comando e substitui pela saída antes de Claude ler a skill.

## Onde as Skills Vivem

| Escopo | Path | Aplica-se a |
|--------|------|-------------|
| Enterprise | Managed settings (consulte `/pt/settings`) | Todos usuários da org |
| **Pessoal** | `~/.claude/skills/<skill-name>/SKILL.md` | Todos os seus projetos |
| **Projeto** | `.claude/skills/<skill-name>/SKILL.md` | Apenas este projeto |
| **Plugin** | `<plugin>/skills/<skill-name>/SKILL.md` | Onde o plugin está habilitado |

**Precedência** (mesmo nome em múltiplos níveis): Enterprise > Pessoal > Projeto. Skill em qualquer nível substitui skill agrupada de mesmo nome. Plugins usam namespace `plugin-name:skill-name` (não conflitam). `.claude/commands/` legados funcionam igual, mas se skill e comando têm mesmo nome, **skill tem precedência**.

### Skills Aninhadas (Monorepo)

Skills carregam de `.claude/skills/` aninhados abaixo do seu CWD. Quando Claude lê/edita arquivo em subdiretório, skills do `.claude/skills/` daquele subdiretório ficam disponíveis.

- Subdiretórios a partir do CWD inicial até raiz do repo — iniciar Claude em subdir ainda pega skills da raiz.
- Quando edita arquivo em subdir, descobre skills de `.claude/skills/` aninhados sob demanda.

**Conflito de mesmo nome**: ambas ficam disponíveis. Aninhada aparece como **path-qualified** (`apps/web:deploy`). Descrição indica qual diretório aplica. Claude escolhe baseado nos arquivos em que está trabalhando.

**Invocação explícita da aninhada**: `/apps/web:deploy` (raiz seria `/deploy`).

### Skills de Diretórios Adicionais

`--add-dir` e `/add-dir` concedem acesso a arquivos, mas **skills dentro de diretórios adicionados via `--add-dir` CARREGAM automaticamente.** Exceção: `.claude/skills/` em um dir adicional é escaneado.

> Apenas `--add-dir` e `/add-dir` carregam skills. `permissions.additionalDirectories` em settings.json concede acesso a arquivos **apenas**, não carrega skills. CLAUDE.md de `--add-dir` requer `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1`.

### Mudança ao Vivo (Live Change Detection)

Claude Code observa diretórios de skills para mudanças durante a sessão. Adicionar/editar/remover em `~/.claude/skills/`, `.claude/skills/` (projeto), ou `.claude/skills/` dentro de `--add-dir` = efeito imediato, sem reinício.

Criar diretório de skills de nível superior que **não existia quando a sessão começou** = requer reinício.

> Para pasta de skill que também é **plugin** (com `hooks/`, `.mcp.json`, `agents/`, `output-styles/`), mudanças precisam de `/reload-plugins` para entrar em efeito. Cobertura live é só pra texto de `SKILL.md`.

### Estrutura de Diretório

```
my-skill/
├── SKILL.md           # Instruções principais (obrigatório)
├── template.md        # Template para Claude preencher
├── examples/
│   └── sample.md      # Exemplo de saída mostrando formato esperado
└── scripts/
    └── validate.sh    # Script que Claude pode executar
```

`SKILL.md` é obrigatório e ponto de entrada. Outros arquivos opcionais — templates, exemplos, scripts, referências detalhadas. **Referencie-os do SKILL.md** para que Claude saiba o que contêm e quando carregar.

> Limite: `<500` linhas em `SKILL.md`. Mova referência detalhada para arquivos separados.

## Tipos de Conteúdo de Skill

| Tipo | Quando usar | Invocação |
|------|-------------|-----------|
| **Conteúdo de referência** | Convenções, padrões, guias de estilo, knowledge de domínio | Inline (Claude usa junto da conversa) |
| **Conteúdo de tarefa** | Implantações, commits, geração de código (ação específica) | Diretamente via `/skill-name`. Adicione `disable-model-invocation: true` para evitar auto-trigger |

**Concisão é regra:** conteúdo fica em contexto entre turnos, cada linha é custo de token recorrente. Declare **o que** fazer, não narre **como** ou **por que**.

## Frontmatter Reference

```yaml
---
name: my-skill
description: What this skill does
disable-model-invocation: true
allowed-tools: Read Grep
---
```

Todos os campos opcionais. `description` recomendado (Claude precisa saber quando usar).

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `name` | Não | Display name em listagens. Default = nome do diretório. |
| `description` | **Recomendado** | O que faz e quando usar. Claude decide com base nisso. Se omitido, usa primeiro parágrafo do body. Texto combinado de `description+when_to_use` truncado em **1536 chars** na listagem. |
| `when_to_use` | Não | Contexto adicional (frases de gatilho, prompts de exemplo). Anexado a `description` e conta pro limite. |
| `argument-hint` | Não | Dica de autocomplete, ex `[issue-number]` ou `[filename] [format]`. |
| `arguments` | Não | Argumentos posicionais nomeados para substituição `$name`. String separada por espaços ou YAML list. |
| `disable-model-invocation` | Não | `true` evita Claude carregar automaticamente. Use para fluxos com side-effects (`/commit`, `/deploy`). |
| `user-invocable` | Não | `false` esconde do menu `/`. Use para knowledge de background que usuários não invocarão diretamente. |
| `allowed-tools` | Não | Tools que Claude pode usar sem pedir permissão **quando skill está ativa**. String space/comma-separated ou YAML list. |
| `disallowed-tools` | Não | Tools removidas do pool enquanto skill está ativa. Limpa quando você envia próxima mensagem. |
| `model` | Não | Model a usar com skill ativa. Aceita valores de `/model` ou `inherit` para manter modelo ativo. |
| `effort` | Não | Nível de esforço quando skill ativa. Sobrescreve sessão. Opções: `low|medium|high|xhigh|max`. |
| `context` | Não | `fork` para executar em subagent context bifurcado. |
| `agent` | Não | Qual tipo de subagent usar quando `context: fork`. |
| `hooks` | Não | Hooks scoped ao lifecycle da skill. |
| `paths` | Não | Glob patterns limitando ativação automática. Funciona como path-specific rules do CLAUDE.md. |
| `shell` | Não | Shell para `` !`command` `` e blocos ` ```! `. `bash` ou `powershell`. |

### Como Skill Obtém Nome de Comando

Comando que você digita após `/` vem de onde a skill reside. Frontmatter `name` é display label (exceto em `SKILL.md` raiz de plugin).

| Localização | Fonte do nome de comando | Exemplo |
|-------------|---------------------------|---------|
| Diretório sob `~/.claude/skills/` ou `.claude/skills/` | Nome do diretório | `.claude/skills/deploy-staging/SKILL.md` → `/deploy-staging` |
| Diretório `.claude/skills/` aninhado (em conflito) | Path relativo ao CWD + nome do dir | `apps/web/.claude/skills/deploy/SKILL.md` → `/apps/web:deploy` |
| Arquivo sob `.claude/commands/` | Nome do arquivo sem extensão | `.claude/commands/deploy.md` → `/deploy` |
| Subdir `skills/` do plugin | Nome do dir, com namespace do plugin | `my-plugin/skills/review/SKILL.md` → `/my-plugin:review` |
| `SKILL.md` raiz do plugin | Frontmatter `name`, fallback = nome dir | `my-plugin/SKILL.md` com `name: review` → `/my-plugin:review` |

### Substituições de String Disponíveis

| Variável | Descrição |
|----------|-----------|
| `$ARGUMENTS` | Todos os argumentos passados ao invocar. Se ausente no body, argumentos são anexados como `ARGUMENTS: <value>`. |
| `$ARGUMENTS[N]` | Argumento específico por índice 0-based (`$ARGUMENTS[0]` = primeiro). |
| `$N` | Atalho para `$ARGUMENTS[N]` (`$0` = primeiro, `$1` = segundo). |
| `$name` | Argumento nomeado declarado em `arguments`. Com `arguments: [issue, branch]`, `$issue` = primeiro, `$branch` = segundo. |
| `${CLAUDE_SESSION_ID}` | ID da sessão atual — útil pra logging, arquivos per-session. |
| `${CLAUDE_EFFORT}` | Nível de esforço ativo: `low|medium|high|xhigh|max`. "ultracode" é reportado como `xhigh`. |
| `${CLAUDE_SKILL_DIR}` | Diretório do `SKILL.md`. Para plugins, é o subdiretório da skill dentro do plugin (não raiz). Use em `!` bash injection pra referenciar scripts agrupados. |

**Quoting**: argumentos indexados usam shell-style, use aspas pra multi-word: `/my-skill "hello world" second` → `$0=hello world`, `$1=second`. `$ARGUMENTS` sempre expande pra string completa.

**Escapar `$`**: `\$1.00` antes de dígito/argumento/nome = literal `$1.00`. Backslash antes de qualquer outro `$` é deixado intacto.

## Suporte Files (Files Adicionais)

Skills podem incluir múltiplos arquivos mantendo `SKILL.md` focado:

```
my-skill/
├── SKILL.md (obrigatório)
├── reference.md (API detalhada — carregado quando necessário)
├── examples.md (exemplos de uso — carregado quando necessário)
└── scripts/
    └── helper.py (script — executado, não carregado)
```

Referencie de `SKILL.md` para que Claude saiba o que cada um contém:

```markdown
## Additional resources

- For complete API details, see reference.md
- For usage examples, see examples.md
```

## Controle de Invocação

| Frontmatter | Você invoca | Claude invoca | Quando carregada |
|-------------|:----------:|:-------------:|----------------|
| (padrão) | Sim | Sim | Description sempre in context, body carrega quando invocada |
| `disable-model-invocation: true` | Sim | Não | Description NÃO in context, body carrega quando você invoca |
| `user-invocable: false` | Não | Sim | Description sempre in context, body carrega quando invocada |

### Exemplos

**Deploy acionada só por você** (`/deploy`):
```yaml
---
name: deploy
description: Deploy the application to production
disable-model-invocation: true
---

Deploy $ARGUMENTS to production:
1. Run the test suite
2. Build the application
3. Push to the deployment target
4. Verify the deployment succeeded
```

**Knowledge de background só de Claude** (`/legacy-system-context`):
```yaml
---
name: legacy-system-context
description: How the legacy billing system works
user-invocable: false
---
```

> Em sessão regular, descriptions ficam in context mas body só carrega quando invocada. **Subagents com skills pré-carregadas**: body completo injetado na initialization.

## Lifecycle do Conteúdo

Quando você ou Claude invoca, `SKILL.md` renderizado entra na conversa como mensagem única e **permanece pelo resto da sessão.** Claude Code NÃO relê em turnos posteriores → escreva instruções permanentes em vez de etapas únicas.

**Auto-compactação** preserva skills invocadas em orçamento de token:
- Resume e reanexa a invocação mais recente de cada skill após compactação.
- Mantém primeiros 5.000 tokens de cada.
- Skills reanexadas compartilham orçamento combinado de **25.000 tokens**.
- Claude Code preenche começando da mais recente → skills mais antigas podem ser descartadas inteiramente após compactação.

> **Skill parece parar de influenciar comportamento após primeira resposta?** O conteúdo geralmente ainda está lá, o modelo está escolhendo outras tools. Fortaleça `description`+instruções, ou use hooks pra comportamento determinístico. Se grande ou várias outras invocadas, re-invoque após compactação.

## Pré-Aprovar Tools

`allowed-tools` concede permissão enquanto skill está ativa — Claude usa sem pedir. **Não restringe tools disponíveis**: cada tool permanece chamável, suas permission settings ainda governam tools não-listadas.

```yaml
---
name: commit
description: Stage and commit the current changes
disable-model-invocation: true
allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *)
---
```

Para skills em `.claude/skills/` de projeto **verificadas**, `allowed-tools` ativa após aceitar diálogo de confiança do workspace. Revise skills de projeto antes de confiar — uma skill pode conceder acesso amplo a tools.

**Bloquear tools**: `disallowed-tools` remove do pool enquanto skill ativa. Limitação limpa quando você envia próxima mensagem. Pra bloquear em **todas** skills, adicione deny rules em permissions.

## Argumentos para Skills

`$ARGUMENTS` substituído por qualquer coisa que siga o nome:

```yaml
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
---

Fix GitHub issue $ARGUMENTS following our coding standards.
```

`/fix-issue 123` → "Fix GitHub issue 123 following our coding standards..."

**Se invocar com args mas body NÃO incluir `$ARGUMENTS`**: Claude Code anexa `ARGUMENTS: <your input>` ao final.

**Argumentos indexados**: `$ARGUMENTS[N]` ou `$N`:

```yaml
---
name: migrate-component
description: Migrate a component from one framework to another
---

Migrate the $ARGUMENTS[0] component from $ARGUMENTS[1] to $ARGUMENTS[2].
Preserve all existing behavior and tests.
```

`/migrate-component SearchBar React Vue` → `SearchBar`, `React`, `Vue`.

## Padrões Avançados

### Injeção de Contexto Dinâmico (`` !`<cmd>` ``)

Sintaxe `` !`<comando>` `` executa shell antes do body ser enviado. Output substitui placeholder — Claude recebe dados reais, não o comando:

```yaml
---
name: pr-summary
description: Summarize changes in a pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`

## Your task
Summarize this pull request...
```

**Execução**:
1. Cada `` !`<cmd>` `` roda imediatamente (antes de Claude ver)
2. Output substitui placeholder no body
3. Claude vê o prompt totalmente renderizado com dados reais

Pré-processamento, não Claude-executa. Claude apenas vê o resultado.

> Forma inline reconhecida só quando `!` aparece no início da linha ou após whitespace. `!` após outro char (ex `KEY=!cmd`) = deixa literal, não executa.

**Multi-linha**: bloco ```` ```! `` `` (aberto com ` ```! `):

````markdown
## Environment
```!
node --version
npm --version
git status --short
```
````

**Desabilitar execução de shell** em skills: `"disableSkillShellExecution": true` em settings. Cada `` !` `` substituído por `[shell command execution disabled by policy]`. Skills bundled/managed não afetadas.

> Pra raciocínio mais profundo em skill execution, inclua `ultrathink` no body.

### Execute Skills em Subagent

Adicione `context: fork` ao frontmatter → skill executa em isolamento. Body vira prompt que dirige o subagent. Sem acesso ao histórico da sua conversa.

> `context: fork` só faz sentido para skills com **instruções explícitas**. Se tem guidelines tipo "use estas convenções de API" sem task, subagent recebe guidelines mas sem prompt acionável → retorna sem output.

Skills e subagents em duas direções:

| Abordagem | System prompt | Task | Carrega também |
|-----------|---------------|------|----------------|
| Skill com `context: fork` | Do tipo de agent | Conteúdo de SKILL.md | CLAUDE.md (exceto agents Explore/Plan) |
| Subagent com campo `skills` | Body markdown | Mensagem de delegação | Skills pré-carregadas + CLAUDE.md |

Com `context: fork`, escreve task na skill e escolhe agent type. Agents Explore e Plan **pulam CLAUDE.md e git status** pra manter context pequeno → skill bifurcada usando `agent: Explore` vê só body do SKILL.md + system prompt do agent.

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:
1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```

`agent` aceita: integragdos (`Explore`, `Plan`, `general-purpose`) ou subagents custom de `.claude/agents/`. Default = `general-purpose`.

### Restringir Acesso de Skill de Claude

Por padrão Claude pode invocar qualquer skill sem `disable-model-invocation: true`. Skills com `allowed-tools` concedem acesso sem aprovação por uso enquanto ativas. Permission settings baseline governam todas outras tools.

**Três formas:**
1. **Desabilitar todas** negando tool Skill em `/permissions`:
   ```
   # Add to deny rules:
   Skill
   ```
2. **Allow/deny específicas** com permission rules:
   ```
   Skill(commit)         # match exato
   Skill(review-pr *)    # prefix match
   Skill(deploy *)       # deny
   ```
3. **Ocultar individuais** com `disable-model-invocation: true` → remove do context de Claude inteiramente.

> `user-invocable` controla visibilidade de menu, não acesso à tool Skill. Use `disable-model-invocation: true` para bloquear invocação programática.

### Override de Visibilidade via Settings

`skillOverrides` controla visibilidade do settings, não do frontmatter. Use para skills cujo `SKILL.md` você não quer editar (skills checked em repo compartilhado, fornecidas por MCP server).

```json
{
  "skillOverrides": {
    "legacy-context": "name-only",
    "deploy": "off"
  }
}
```

| Valor | Listada pra Claude | No menu `/` |
|-------|:------------------:|:-----------:|
| `"on"` (default) | Nome + description | Sim |
| `"name-only"` | Apenas nome | Sim |
| `"user-invocable-only"` | Oculto | Sim |
| `"off"` | Oculto | Oculto |

Menu `/skills` escreve para você: destaque skill → `Space` alterna estados → `Enter` salva em `.claude/settings.local.json`.
Skills de plugin **não** afetadas por `skillOverrides` — gerencie via `/plugin`.

## Avaliando Skills (skill-creator)

Ver skill disparar diz Claude encontrou, não que fez o que queria. Meça 2 coisas:
1. Se Claude invoca nos prompts que deveria
2. Se output bate com o esperado quando invoca

Comparação de baseline: alguns prompts realistas, execute cada um em **sessão nova** com skill disponível e novamente desabilitada, compare. Sessão nova é importante — contexto do author mascara gaps.

### Plugin `skill-creator`

Instale do marketplace oficial:
```
/plugin install skill-creator@claude-plugins-official
```

Execute `/reload-plugins` depois. O plugin guia por escrever test cases e rodar loop:
- **Casos de teste**: prompts, input files, expected behavior em `evals/evals.json`
- **Runs isoladas**: gera 1 subagent por test case (context limpo), loga tokens e duração
- **Grading**: verifica assertions contra output, escreve pass/fail com evidência em `grading.json`
- **Benchmark**: agrega % aprovação, tempo, tokens com-skill vs sem-skill em `benchmark.json` → comparar %melhoria contra overhead
- **Comparação de versão**: A/B blind entre duas versões da skill → confirmar se edição é melhoria
- **Tuning de description**: gera prompts should-trigger e should-not-trigger, mede hit rate, propõe edições quando dispara em requests erradas
- **Review viewer**: relatório HTML onde inspeciona cada output e registra feedback qualitativo que próxima iteração lê

Formatos de arquivo eval e workflow completo: [Evaluating skill output quality](https://agentskills.io/skill-creation/evaluating-skills) em agentskills.io.

## Compartilhando Skills

- **Projeto**: commitar `.claude/skills/` em git
- **Plugins**: criar dir `skills/` em plugin
- **Gerenciado**: deploy org-wide via managed settings

## Gerar Saída Visual

Pattern poderoso: scripts agrupados gerando HTML interativo, Chrome visualisation, etc.

Exemplo — explorador de codebase com HTML tree-view:

```yaml
---
name: codebase-visualizer
description: Generate an interactive collapsible tree visualization of your codebase. Use when exploring a new repo, understanding project structure, or identifying large files.
allowed-tools: Bash(python3 *)
---

# Codebase Visualizer

Run from project root:
```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/visualize.py .
```

Creates `codebase-map.html` and opens in default browser.
```

Script `scripts/visualize.py` varre árvore, gera HTML auto-contido com:
- Sidebar de summary (files, dirs, total size, file types)
- Bar chart por file type (top 8 by size)
- Árvore recolhível com type-coded dots

Funciona para qualquer saída visual: dependency graphs, coverage reports, API docs, schema visualizations. Script faz o trabalho, Claude orquesta.

## Troubleshooting

### Skill Não Dispara

1. Description inclui keywords que usuários naturalmente diriam?
2. Aparece em "What skills are available?"?
3. Reformule para casar mais de perto
4. Invoque direto: `/skill-name` se invocável

> Frontmatter YAML malformado = Claude Code carrega body com metadados vazios. `/skill-name` ainda funciona mas Claude não tem description. **Run com `--debug`** para ver parse error.

### Dispara Muito Frequentemente

1. Description mais específica
2. `disable-model-invocation: true` para apenas invocação manual

### Descriptions Cortadas

Descriptions entram em context para Claude saber o que está disponível. Budget escala em **1% da janela de contexto** do model. Quando transborda, descriptions de skills invocadas menos são removidas primeiro.

Mostra quantas estão encurtadas e quais: **`/doctor`**.

Pra aumentar budget:
- `skillListingBudgetFraction` setting (ex `0.02` = 2%)
- `SLASH_COMMAND_TOOL_CHAR_BUDGET` env var para char count fixo

Pra liberar budget:
- Entradas low-priority como `"name-only"` em `skillOverrides`
- Aparar texto de `description` + `when_to_use` na fonte
- **Limite por entry**: 1.536 chars (combinado `description+when_to_use`), configurável com `maxSkillDescriptionChars`

## Related

- [[agent-teams]] — orquestração com múltiplos companheiros
- [[agent-view]] — UI de gestão (`claude agents`)
- claude skill management — skills no framework claude seguem padrão Agent Skills
