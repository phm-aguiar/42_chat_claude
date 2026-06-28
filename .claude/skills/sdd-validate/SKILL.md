---
name: sdd-validate
description: >
  Audita a conformidade SDD de um repositório: verifica .github/memory/, specs/, e cada
  feature (spec.md, plan.md, tasks.md). Emite relatório PASS/FAIL/WARN com ações sugeridas.
  Read-only — nunca cria ou modifica arquivos. Suporte a métricas LATTE (se disponível).
  Trigger: validar SDD, validate sdd, auditar estrutura, check sdd, verificar conformidade,
  audit structure.
when_to_use: >
  Use quando o usuário quiser verificar se o repositório segue a estrutura SDD correta,
  antes de um PR, ou para identificar artefatos faltantes. Operação somente leitura.
context: fork
allowed-tools: Read Bash
---

# sdd-validate — Validar Estrutura SDD

**Read-only — nunca crie ou modifique arquivos.**

## Instructions

### 1. Validar memória de contexto global

Verifique:
- `.github/memory/` — existe?
- `.github/memory/constitution.md` — existe e não vazio?
- `.github/memory/tech.md` — existe e não vazio?

Reporte: PASS (existe e não vazio), FAIL (ausente), WARN (existe mas vazio).

### 2. Validar specs/

Verifique `specs/` e subdiretórios: `domain-events/`, `features/`, `infra/`.
`features/` vazio = WARN (sem features ainda — aceitável em repo novo).

### 3. Validar cada feature

Para cada `specs/features/<id>-<nome>/`:
- Nome segue padrão `<id numérico>-<nome>`? Se não → WARN.
- `spec.md` — existe? não vazio? contém seções canônicas?
- `plan.md` — existe? não vazio? contém 4 seções?
- `tasks.md` — existe? não vazio? tasks no formato DAG?

### 4. Validar CLAUDE.md

Existe? Contém seção `## SDD Workflow`?

### 5. Emitir relatório

```
SDD Validation Report
=====================
.github/memory/            PASS
  constitution.md          PASS
  tech.md                  WARN (vazio — execute /sdd-explore-tech)
specs/                     PASS
  features/                PASS
    001-chat-core/
      spec.md              PASS
      plan.md              PASS
      tasks.md             WARN (em progresso)
CLAUDE.md                  PASS (contém SDD Workflow)
─────────────────────────────
Resultado: 8/9 checks passaram
Ação sugerida: execute /sdd-explore-tech para popular tech.md
```

Automação opcional: `bash ${CLAUDE_SKILL_DIR}/assets/check-sdd.sh`

### 6. Métricas LATTE (se disponível)

Se o repositório usa LATTE Coordination e `G_final` está disponível, compute métricas:

```python
from latte_coordination.metrics import compute_coordination_metrics
metrics = compute_coordination_metrics(G_final)
```

Inclua subseção com: Overwrite Rate, Wasted Chars, Idle Rounds, Straggler P95,
Completion Rate, Graph Health. Thresholds: Overwrite > 0.2 → WARN, Completion < 1.0 → FAIL.

### 7. Feedback loop (se LATTE + índice experiencial disponíveis)

Compute utility signal: `u = 1.0 - (overwrite_rate × 0.4 + waste_ratio × 0.3 + idle_ratio × 0.3)`
Atualize scores dos chunks usados como hints no índice semântico.

## Guardrails

- **Read-only** — apenas reporte, nunca crie/modifique.
- **Features sem numeração** — WARN para diretórios fora do padrão `<id>-<nome>`.
- **FAIL vs WARN** — ausente = FAIL, vazio/em progresso = WARN.

## Checklist

- [ ] Relatório segue formato PASS/FAIL/WARN com ações sugeridas
- [ ] Cada FAIL tem ação sugerida
- [ ] Nenhum arquivo foi criado/modificado

## Additional Resources

- `${CLAUDE_SKILL_DIR}/assets/content-quality.md` — freshness scoring, métricas de cobertura, thresholds
- `${CLAUDE_SKILL_DIR}/assets/check-sdd.sh` — script de automação para validação estrutural
