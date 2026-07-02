---
title: "42_chat — Framework SDD Autônomo"
category: project
tags: [sdd, framework, agents, ai]
sources:
  - specs/BACKLOG.md
summary: "Framework SDD autônomo com agentes IA e humanos in loop. Pipeline: brainstorm → spec → plan → tasks (DAG) → sessão principal coordena → subagentes (Dev/QA). Aplicação 42_chat é o smoke-test real."
lifecycle: reviewed
lifecycle_changed: "2026-06-27"
base_confidence: 0.92
provenance:
  extracted: 0.90
  inferred: 0.10
  ambiguous: 0.00
created: "2026-06-13"
updated: "2026-06-30"
tier: core
---

# 42_chat — Framework SDD Autônomo

> **Produto:** Framework SDD autônomo com agentes IA.
> **42_chat app:** Smoke-test real pra validar o framework — **não é o produto.**

## Pipeline

```
sdd-brainstorm → spec.md → Aprovado: true
     ↓
sdd-generate-plan → plan.md
     ↓
sdd-generate-tasks (DAG) → tasks.md
     ↓
Sessão principal (Lead LATTE) — coordena direto, sem orquestrador intermediário
  ├─ Agent(agent-dev)    (implementa código)
  ├─ Agent(agent-qa)     (testa)
  ├─ Agent(agent-devops) (CI/CD, deploy) — feature 008 pendente
  └─ Agent(agent-pentester) (security scan) — feature 009 pendente
```

## Agentes

| Agente | Status | Feature |
|---|---|---|
| [[projects/42_chat/agents/agent-onboard|onboard]] | ✅ Implementado | Inicialização SDD |
| agent-dev | ✅ Implementado | 006 — Persona implementadora |
| agent-qa | ✅ Implementado | 007 — Guardião da qualidade |
| agent-devops | ❌ Standby | 008 — Pendente fundamentação |
| agent-pentester | ❌ Standby | 009 — Pendente fundamentação |

## Features do Framework

| ID | Feature | Status |
|----|---------|--------|
| 001 | start-repo (estrutura base + templates) | ✅ Aprendizado |
| 002 | sdd-templates (formato spec/plan/tasks) | ✅ Aprendizado |
| 003 | forge-skill (scaffold de skills) | 🔄 Parcial |
| 004 | sdd-tasks-dag (DAG no tasks.md) | ✅ Implementado |
| 005 | agent-orchestrator (runtime SDD) | 🔄 Absorvido — coordenação direta |
| 006 | agent-dev (persona implementadora) | ✅ Implementado |
| 007 | agent-qa (guardião da qualidade) | ✅ Implementado |
| 008 | agent-devops | ❌ Standby |
| 009 | agent-pentester | ❌ Standby |

Páginas de feature: [[projects/42_chat/features/feature-004-sdd-tasks-dag|004]] · [[projects/42_chat/features/feature-005-agent-orchestrator|005]] · [[projects/42_chat/features/feature-006-agent-dev|006]] · [[projects/42_chat/features/feature-007-agent-qa|007]]

## Features da Aplicação (42_chat)

| ID | Feature | Status |
|----|---------|--------|
| 100 | 42_chat core (Go + WS + OAuth2 + PostgreSQL) | ✅ Implementado |
| 101 | Assinatura de participação (UserSignature + stats) | ✅ Implementado |
| 102 | Fórum (boards → threads → posts, MDX, moderação) | ✅ Implementado |
| 103 | Menções e notificações | ❌ Backlog |
| 104 | Perfil pessoal + tags | ❌ Backlog |
| 105 | Conquistas da 42 | ❌ Backlog |
| 106 | Reply/quote estilo chan | ❌ Backlog |
| 107 | Reações em mensagens | ❌ Backlog |
| 108 | Fórum de tech (já incluído no 102) | ❌ Fundido no 102 |
| 109 | Página "ao vivo" da 42 | ❌ Backlog |

Páginas de feature: [[projects/42_chat/features/feature-100-42-chat-core|100]] · [[projects/42_chat/features/feature-101-assinatura-participacao|101]] · [[projects/42_chat/features/feature-102-forum|102]]

## Skills Implementadas

### Dev Skills (006)
| Skill | O que faz |
|-------|-----------|
| `go-implement` | Implementa código Go (Chi, gorilla/websocket, PostgreSQL) |
| `react-implement` | Implementa frontend React (Vite, Tailwind 42, Shadcn/ui, Zustand) |
| `build-check` | Smoke test: `go build`, `go vet`, `npm run build` — portão DONE |

### QA Skills (007)
| Skill | O que faz |
|-------|-----------|
| `go-unit-tests` | Gera/executa `go test ./...` com cobertura |
| `gherkin-scenarios` | Lê spec.md → gera `.feature` files |
| `local-test-runner` | Build, lint, vet, smoke-test |
| `tdd-workflow` | Red-Green-Refactor |
| `bdd-spec-process` | Processo de especificação BDD |
| `playwright-bdd-e2e` | Testes E2E com Playwright BDD |
| `cucumber-step-definitions` | Step definitions Go/Godog |

## Segurança

Backlog de hardening nginx: [[projects/42_chat/features/security-backlog|Security Backlog]] — SEC-001 a SEC-007 (rate limiting, TLS, WAF, JWT gateway, fail2ban, scanning, CSP).

## Conceitos

- [[concepts/sdd|SDD]] — Metodologia SDD
- [[concepts/sdd-workflow|SDD Workflow]] — Pipeline operacional

## Referências da Aplicação

- [[references/42-chat-platform-architecture|Platform Architecture]] — Stack Go/React/PostgreSQL/Docker/AWS
- [[references/42-chat-design-system|Design System]] — Identidade visual 42 Graphic Charter
- [[references/42-chat-engineering-requirements|Engineering Requirements]] — Concorrência, tuning, graceful shutdown
- [[references/42-chat-architecture-diagram|Architecture Diagram]] — Diagramas Mermaid (auth, hub, deploy)
- [[projects/42_chat/concepts/chat-ui-specification|UI Specification — Estilo MSN Messenger]] — Especificação de interface com lista de contatos, janela de conversa e comportamentos interativos

## Repositório

- `specs/features/` — Specs SDD (BACKLOG.md, specs por feature)
- `.claude/agents/` — Agentes versionados
- `.claude/skills/` — Skills versionadas
