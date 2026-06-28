---
name: sdd-generate-tasks
description: >
  Gera tasks.md com DAG (Directed Acyclic Graph) de tarefas atômicas para uma feature SDD.
  Cada task tem: ID (Tnnn), Papel (researcher|analyst|executor), Dependências, Paralelizável, Arquivos. Inclui
  approval gate (Aprovado: true obrigatório), interação fase por fase, validação de DAG e
  suporte a --with-memory (memória experiencial) e LATTE Coordination (graph-operators).
  Trigger: gerar tasks, criar tasks.md, generate tasks, criar tarefas.
when_to_use: >
  Terceira etapa do pipeline SDD, após sdd-generate-plan. Use quando spec.md e plan.md existem
  e o usuário quer a matriz de execução. HARD-GATE: spec.md deve ter Aprovado: true.
argument-hint: "[specs/features/<id>-<slug>] [--with-memory]"
allowed-tools: Read Write Bash
disable-model-invocation: true
---

# sdd-generate-tasks — Gerar Matriz DAG (tasks.md)

**HARD-GATE:** `spec.md` deve ter `**Aprovado:** true`. Se false → ABORTE com mensagem de erro.

## Prerequisites

- Feature com `spec.md` (`Aprovado: true`) e `plan.md` preenchidos.

## Instructions

### 0. Approval gate

Leia `specs/features/<id>-<slug>/spec.md`. Se `Aprovado: false` → reporte e ABORTE.

### 1. Identificar a feature

Usuário informa o diretório. Se não informado, pergunte.

### 2. Ler spec.md e plan.md

Extraia: funcionalidade, cenários BDD, restrições (spec) + stack, contratos, ADRs (plan).

### 3. Carregar regras de geração

Leia `${CLAUDE_SKILL_DIR}/assets/task-rules.md` para regras de atomicidade, formato DAG,
detecção de paralelismo, fases canônicas e exemplos.

### 3.5. Retrieve experiential hints (só se `--with-memory`)

Se flag `--with-memory` passada:

```python
from search import search_similar
hints = search_similar(query_text=spec_full_text, k=5, min_score=0.3)
```

Injete top-5 chunks como `## Hints de features anteriores` antes de derivar tasks.
Se índice ausente, prossiga sem hints (não aborte).

### 4. Derivar tarefas atômicas

Para cada elemento extraído, crie UMA tarefa:

```markdown
- [ ] **Tnnn:** Descrição da tarefa
  - **Papel:** researcher | analyst | executor
  - **Dependências:** Txxx, Tyyy | Nenhuma
  - **Paralelizável:** true | false
  - **Arquivos:** `path/to/file.go`
```

**Regra de paralelismo:** tasks paralelas na mesma fase devem ter conjuntos de `Arquivos` disjuntos.
Se compartilharem paths → force sequencial. Exceção: `.feature` vs `.go` no mesmo diretório.

### 5. Interação fase por fase

**Nunca gere todas as fases de uma vez.** Para cada fase:
1. Proponha tasks com papel, deps e paralelismo.
2. `AskUserQuestion` com opções: "Aprovar", "Ajustar tasks", "Adicionar task", "Remover task".
3. Incorpore feedback e avance.

### 6. Validar DAG completo

Antes de salvar:
1. **Ciclos:** DFS — se back-edge → reporte e retorne à fase.
2. **Deps quebradas:** toda referência em `Dependências:` deve existir.
3. **Órfãs:** task sem deps e sem dependentes → pergunte se intencional.
4. **Isolamento de arquivos:** tasks `Paralelizável: true` com Arquivos disjuntos.

### 7. Salvar

Pergunte antes de salvar. Se `tasks.md` existe: "Sobrescrever, mesclar, ou abortar?"

```bash
# Escreva em:
specs/features/<id>-<slug>/tasks.md
```

## Modo LATTE (graph-operators)

Se `graph-operators: enabled` no YAML frontmatter do tasks.md, adicione:
- YAML frontmatter com `heartbeat-threshold` e `max-rounds`
- Seção `## Coordination Graph` com tabela `ID | Agent | Dependencies | Status`

Leia `${CLAUDE_SKILL_DIR}/assets/latte-task-rules.md` para regras específicas.
Sem `graph-operators` → modo legacy (DAG estático), compatibilidade reversa garantida.

## Guardrails

- **Nunca agrupe ações** — "Criar X e testar Y" → 2 tasks separadas.
- **Tasks paralelas nunca compartilham paths** — HARD RULE.
- **Interação fase por fase obrigatória** — nunca gere tudo de uma vez.
- **Approval gate** — sem `Aprovado: true`, ABORTE.
- **Idempotência** — se `tasks.md` existe, pergunte.

## Checklist

- [ ] Approval gate verificado (`Aprovado: true`)
- [ ] `tasks.md` escrito em `specs/features/<id>-<slug>/`
- [ ] Cada task com Papel, Dependências, Paralelizável, Arquivos
- [ ] DAG validado: sem ciclos, deps quebradas ou órfãs não intencionais
- [ ] Tasks paralelas têm Arquivos disjuntos
- [ ] Interação fase por fase concluída
- [ ] Usuário aprovou antes de salvar

## Additional Resources

- `${CLAUDE_SKILL_DIR}/assets/task-rules.md` — regras de atomicidade, fases canônicas, exemplos
- `${CLAUDE_SKILL_DIR}/assets/latte-task-rules.md` — regras para G₀ e coordination graph LATTE
