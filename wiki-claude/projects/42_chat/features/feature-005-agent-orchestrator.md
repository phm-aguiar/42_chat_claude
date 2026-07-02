---
title: "005: Agent Orchestrator — Lição Aprendida"
category: projects
tags: ["delegate-task", "licao-aprendida", "methodology", "orchestrator", "paralelismo"]
summary: "Feature que implementou o agente orquestrador (hoje absorvido pela coordenação direta da sessão principal). Mantida como registro arquitetural."
created: "2026-06-13"
rag_score: 0.4952
updated: "2026-06-26"
sources:
  - repo:specs/features/005-runtime-orchestrator/
lifecycle: archived
lifecycle_changed: "2026-06-26"
base_confidence: 0.8
provenance:
  extracted: 0.8
  inferred: 0.2
  ambiguous: 0.0
---

# 005: Agent Orchestrator — Lição Aprendida

> ⚠️ **Absorvido em 2026-06-26.** O agente orquestrador como subagente separado foi substituído pela
> **coordenação direta** — a sessão principal assume o papel de Lead LATTE e coordena workers
> via `delegate_task`. O contrato de orquestração vive no `AGENTS.md` raiz (seção "Coordenação Direta").

## O que aprendemos

A feature 005 implementou o `agent-orchestrator` como subagente spawnado via `agent-run`. Na prática, descobrimos que:

1. **Overhead de contexto duplo:** main → orquestrador → worker consumia ~30-50% mais tokens que main → worker direto
2. **Timeout de 600s:** o `delegate_task` aninhado estourava em features com 15+ tasks
3. **Validação cega:** o orquestrador validava DONE sem o humano ver — a sessão principal vê resultados conforme chegam
4. **O LATTE já define o Lead como coordenador:** o paper original coloca o Lead (ℓ) como orquestrador, não um subagente

## O que foi absorvido

O `AGENTS.md` raiz agora contém a seção **"Coordenação Direta (Modo Orquestrador)"** com:
- Approval gate (`Aprovado: true`)
- Carregamento e validação de DAG
- Janela deslizante de 3 workers via `delegate_task(tasks=[...])`
- Validação de evidência DONE
- Ciclo de retry (3 tentativas, contexto enriquecido)
- Escalação de bloqueios para o humano

## Artefatos (históricos)

- `spec.md` — Especificação funcional completa
- `plan.md` — 5 ADRs documentadas
- `tasks.md` — 16 tasks em 4 fases

> O diretório `.claude/agents/agent-orchestrator/` foi removido.

## Dependências

- **Feature 004 (sdd-tasks-dag):** formato DAG no tasks.md — agora consumido diretamente pela sessão principal

## Relacionado

- [[projects/42_chat/features/[[feature-004-sdd-tasks-dag]]|004: Tasks DAG]] — Formato DAG (mantido)
- [[projects/42_chat/agents/agent-onboard|onboard]] — Agente de inicialização
- [[sdd]] — Metodologia
