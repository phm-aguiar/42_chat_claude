---
name: sdd
description: >
  Pipeline SDD (Spec-Driven Development) — toolkit unificado para o ciclo completo:
  brainstorm → spec.md → plan.md → tasks.md → validate → refactor. Selecione o modo
  pelo contexto: brainstorm (nova feature/ideia), explore_tech (mapear stack), init_repo
  (inicializar SDD), plan (gerar plan.md), tasks (gerar tasks.md), validate (auditar
  conformidade), refactor (normalizar artefato), wiki-enforce (tabela de gatilhos CLAUDE.md).
  Trigger: SDD, spec, feature, pipeline, brainstorm, explore tech, init repo, gerar plano,
  gerar tasks, validar SDD, refatorar artefato, wiki enforcement.
when_to_use: >
  Carregue quando o usuário mencionar SDD, spec-driven, brainstorm, discutir ideia,
  nova feature, gerar plan, gerar tasks, validar SDD, refatorar spec, init sdd,
  inicializar sdd, explore tech, mapear stack, wiki enforcement, ou qualquer fase
  do pipeline de especificação.
allowed-tools: Read Bash Write Edit
disable-model-invocation: true
---

# sdd — Pipeline SDD (8 modos)

```
brainstorm → spec.md ──→ plan → plan.md ──→ tasks → tasks.md
     ↑                    ↑                    ↑
     │                    │                    │
  explore_tech        init_repo            validate
  (tech.md)         (estrutura)         (auditoria)
                                             │
                    wiki-enforce ←───────────┘
                  (CLAUDE.md triggers)
```

| Modo | Gatilho | Entrada | Saída |
|---|---|---|---|
| `brainstorm` | Discutir feature, nova ideia | Ideia do usuário | `spec.md` |
| `explore_tech` | Mapear stack, preencher tech.md | Repo | `tech.md` |
| `init_repo` | Inicializar SDD | Repo vazio/existente | `.github/memory/` + `specs/` |
| `plan` | Gerar plano arquitetural | `spec.md` | `plan.md` |
| `tasks` | Gerar matriz DAG | `spec.md` + `plan.md` | `tasks.md` |
| `validate` | Auditar estrutura SDD | Repo | Relatório PASS/FAIL/WARN |
| `refactor` | Normalizar artefato SDD | `spec/plan/tasks.md` | Artefato canônico |
| `wiki-enforce` | Wire wiki no CLAUDE.md | `CLAUDE.md` | Tabela de gatilhos wiki |

---

## Modo: brainstorm

**Gatilhos:** brainstorm, discutir ideia, nova feature, entrevista, discovery, bora pensar, como voce faria.

**HARD-GATE:** Nunca implemente antes do spec aprovado.

1. Leia `tech.md`, `constitution.md`, liste `specs/features/`.
2. Se múltiplos subsistemas independentes, proponha decomposição.
3. Entrevista com `AskUserQuestion` — uma pergunta por vez, múltipla escolha. Cubra propósito, escopo, constraints, critérios de sucesso.
4. Proponha 2-3 abordagens com trade-offs e recomendação.
5. Gere `spec.md` com ID incremental (`specs/features/<NNN>-<slug>/spec.md`).
6. Self-review: placeholders? contradições? escopo focado?
7. `AskUserQuestion` para aprovação explícita.
8. Transite para modo `plan`.

**Guardrails:** Uma pergunta por `AskUserQuestion`. YAGNI: spec mínimo viável. Respeite `constitution.md`. Idempotência: detecte spec existente.

---

## Modo: explore_tech

**Gatilhos:** mapear tech stack, explorar tecnologia, preencher tech.md, detectar stack.

1. Detecte manifestos: `go.mod`, `package.json`, `Cargo.toml`, `pom.xml`, `pyproject.toml`, `Gemfile`, `mix.exs`, `CMakeLists.txt`, `*.csproj`.
2. Extraia versão da linguagem e frameworks principais de cada manifesto.
3. Detecte CI e ferramentas: `.github/workflows/`, linters, Docker, task runners, padrões de teste.
4. Consolide em `.github/memory/tech.md` usando `—` para entradas não encontradas.
5. Resuma achados e pergunte se o usuário quer ajustar.

**Guardrails:** Nunca invente stack. Campos vazios = `—`. Se `tech.md` existe, pergunte antes de sobrescrever.

---

## Modo: init_repo

**Gatilhos:** iniciar SDD, init sdd, estrutura sdd, setup sdd, criar estrutura SDD.

1. Liste a raiz. Se `.github/memory/` ou `specs/` existirem, pergunte preservar ou recriar.
2. Crie `.github/memory/constitution.md` e `tech.md` (placeholder).
3. Crie `specs/domain-events/`, `specs/features/`, `specs/infra/`.
4. Faça merge da seção SDD Workflow em `CLAUDE.md` (idempotente).
5. Sugira próximos passos: `explore_tech` → preencher `constitution.md` → `brainstorm`.

**Guardrails:** Idempotência obrigatória. Agnóstico de linguagem. `constitution.md` exige confirmação.

---

## Modo: plan

**Gatilhos:** gerar plan, criar plan.md, generate plan, criar plano.

1. Usuário informa diretório da feature (ex: `specs/features/003-forge-skill`).
2. Leia `spec.md`, `tech.md`, `constitution.md`.
3. Gere 4 seções canônicas: Metadados, Contratos e Fronteiras, ADRs (mín. 1), Auditoria de Constituição.
4. Mostre resumo. Pergunte antes de salvar. Escreva `plan.md`.

**Guardrails:** Não invente stack. ADR mínimo: 1. Preserve placeholders `{{...}}`. Idempotência.

---

## Modo: tasks

**Gatilhos:** gerar tasks, criar tasks.md, generate tasks, criar tarefas.

**HARD-GATE:** `spec.md` deve ter `Aprovado: true`. Se false → ABORTE.

1. Verifique `Aprovado: true` no spec.md.
2. Leia `spec.md` + `plan.md`.
3. Derive tasks atômicas com metadados DAG: `Tnnn`, Papel (researcher|analyst|executor), Dependências, Paralelizável, Arquivos.
4. Interaja fase por fase via `AskUserQuestion` — nunca gere tudo de uma vez.
5. Valide DAG completo: detecte ciclos (DFS), dependências quebradas, tasks órfãs, conflitos de arquivo.
6. Pergunte antes de salvar. Escreva `tasks.md`.

**Guardrails:** Tasks paralelas NUNCA compartilham paths. Nunca agrupe ações. Interação fase por fase obrigatória.

---

## Modo: validate

**Gatilhos:** validar SDD, validate sdd, auditar estrutura, check sdd, verificar conformidade.

**Read-only — nunca crie ou modifique arquivos.**

1. Valide `.github/memory/`, `constitution.md`, `tech.md`.
2. Valide `specs/` e subdiretórios.
3. Para cada `specs/features/<id>-<nome>/`, verifique `spec.md`, `plan.md`, `tasks.md`.
4. Verifique `CLAUDE.md` — existe? contém workflow SDD?
5. Emita relatório PASS/FAIL/WARN com ações sugeridas.

---

## Modo: refactor

**Gatilhos:** refatorar spec, refatorar plan, refatorar tasks, normalizar artefato, padronizar spec.

1. Identifique tipo: `spec.md`, `plan.md`, `tasks.md`, `CLAUDE.md`, `llms.txt`.
2. Leia o conteúdo atual.
3. Mapeie para seções canônicas (preservando todo conteúdo).
4. Apresente diff. Pergunte antes de aplicar.
5. Aplique e reporte seções adicionadas/renomeadas.

**Guardrails:** Preservação total. Idempotência. Nunca sobrescreva sem confirmação.

---

## Modo: wiki-enforce

**Gatilhos:** CLAUDE.md trigger table, wiki enforcement, wire wiki into SDD.

1. Audite `CLAUDE.md` — já tem tabela de gatilhos wiki?
2. Insira/atualize a tabela de enforcement com os 10 gatilhos padrão.
3. Valide: tabela completa, regra de enforcement visível.

---

## Nota: Agentes disponíveis

Este projeto tem 3 agentes em `.claude/agents/`:

| Agente | Papel | Modelo |
|---|---|---|
| `researcher` | Descoberta read-only — mapeia código, evidências, build state | Sonnet |
| `analyst` | Síntese — audita constitution.md, produz plano atômico | Sonnet |
| `executor` | Implementação genérica — escreve código e testes (Dev ou QA pela natureza da task) | Haiku |

Todos consultam a wiki via experiential memory antes de agir (`cli_query.py --semantic`).
Para criar novos agentes: `brainstorm` → spec → `plan` (ADRs de toolkits) → `tasks` (DAG: criar agent.md).
