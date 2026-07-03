---
base_confidence: 0.5
title: "sdd-generate-tasks"
category: projects
tags: ["DAG", "execution", "methodology", "skills", "tasks"]
sources: []
summary: Skill SDD v2.0.0 que gera tasks.md com DAG (dependências, paralelismo, isolamento de arquivos)
lifecycle: draft
created: "2026-06-13"
rag_score: 0.4875
updated: "2026-06-13"
---

# sdd-generate-tasks

> Gera `tasks.md` com formato DAG (Directed Acyclic Graph) para execução paralela segura.

## Localização
Skill claude: `.claude/skills/sdd/generate-tasks/SKILL.md` (v2.0.0)

## Função
- Approval gate: verifica `Aprovado: true` no spec.md
- Deriva tarefas atômicas com metadados DAG (Papel, Dependências, Paralelizável, Arquivos)
- Interação fase por fase via `AskUserQuestion`
- Validação de DAG: ciclos, dependências quebradas, tasks órfãs
- Isolamento de arquivos: tasks paralelas NUNCA compartilham paths

## Pipeline
`sdd-generate-plan` → `plan.md` → **`sdd-generate-tasks`** → `tasks.md` → sessão principal (Lead LATTE)

## Relacionado
- [[projects/42_chat/skills/sdd-generate-plan]] — Passo anterior
- [[projects/42_chat/features/feature-004-sdd-tasks-dag]] — Feature que implementou o formato DAG
- [[projects/42_chat/features/feature-005-agent-orchestrator|005: Orchestrator]] — Lição aprendida (coordenação agora é direta)
