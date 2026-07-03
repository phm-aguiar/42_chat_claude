---
base_confidence: 0.5
title: "42 Framework"
category: project
tags: ["agent-orchestration", "meta-framework", "methodology", "wiki"]
source_path: /home/zeenyt__/Projetos/42_Framework
summary: "Meta-framework SDD com pipeline de especificação, wiki como memória semântica e orquestração multi-agente baseada em LATTE coordination graphs."
lifecycle: draft
created: "2026-06-19"
rag_score: 0.484
updated: "2026-06-19"
---

# 42 Framework — Meta-Framework SDD

> **Produto:** Meta-framework que unifica pipeline SDD, wiki como memória semântica e orquestração multi-agente.
> **Escopo:** Infraestrutura base para desenvolvimento orientado a especificação — skills, agentes, coordenação e memória.

## Pipeline

```
sdd-validate → spec validada
     ↓
agent-run (orquestrador)
  ├─ spawna subagentes (dev, qa, devops, pentester)
  ├─ LATTE coordination graph (task DAG dinâmico)
  └─ heartbeat monitoring + métricas
     ↓
wiki (memória semântica)
  ├─ embeddings + retrieval
  ├─ hints contextuais
  └─ feedback loop (agentes aprendem)
```

## Features

| Feature | Status | Descrição |
|---|---|---|
| 001: LATTE Coordination | ✅ Implemented | Orquestração dinâmica com coordination graph, operadores LATTE, heartbeat e métricas |
| 002: Experiential Memory | 📋 Specified | Memória semântica via wiki, embeddings, hints e feedback loop |
| 003: Hybrid Retrieval & Normalization | ✅ Implemented | Pesquisa híbrida (BM25 + cosine), normalização de frontmatter e thresholds adaptativos |

## Papers Analisados

Papers acadêmicos que fundamentam as decisões arquiteturais do 42 Framework:


## Skills

- sdd-validate — Validação de specs SDD
- sdd-generate-tasks — Geração de DAG de tarefas
- agent-run — Execução de agentes com coordenação
- `.claude/skills/sdd/latte-coordination/` — LATTE coordination (core)

## Conceitos

- SDD Workflow — Fluxo completo de especificação → implementação

## Próximos Passos

- [ ] **002: Experiential Memory** — Implementar memória semântica com embeddings, retrieval de hints e feedback loop entre agentes e wiki.
- [ ] Expandir suite de agentes (dev, qa, devops, pentester) integrados ao LATTE coordination graph.
- [ ] Integração completa com o 42_chat como smoke-test do meta-framework.

## Repositório

- `.claude/skills/sdd/` — Skills core do pipeline SDD
- `.claude/skills/sdd/latte-coordination/` — Orquestração LATTE
- `.claude/agents/` — Definições de agentes
- `wiki/` — Wiki como memória semântica
- `specs/` — Specs versionadas
