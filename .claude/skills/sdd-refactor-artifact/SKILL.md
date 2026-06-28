---
name: sdd-refactor-artifact
description: >
  Reorganiza um artefato SDD existente (spec.md, plan.md, tasks.md, CLAUDE.md, llms.txt)
  para o formato canônico. Preserva todo o conteúdo original — apenas reorganiza seções.
  Sempre apresenta diff e pede confirmação antes de salvar. Para GERAR plan.md ou tasks.md
  do zero, use sdd-generate-plan ou sdd-generate-tasks. Trigger: refatorar spec, refatorar
  plan, refatorar tasks, formatar spec.md, normalizar artefato, alinhar com template,
  padronizar spec, refactor artifact, format SDD file.
when_to_use: >
  Use quando um artefato SDD existente não segue o formato canônico e precisa ser reorganizado.
  Diferente de sdd-generate-plan/tasks que geram do zero — este normaliza o que já existe.
argument-hint: "[path/to/artifact.md]"
allowed-tools: Read Write Edit
disable-model-invocation: true
---

# sdd-refactor-artifact — Normalizar Artefato SDD

## Prerequisites

- O arquivo alvo deve existir e ter conteúdo.
- Leia `${CLAUDE_SKILL_DIR}/assets/canonical-templates.md` antes de refatorar.

## Instructions

### 1. Identificar o tipo de artefato

Pelo nome do arquivo alvo:

| Arquivo | Tipo | Template |
|---|---|---|
| `spec.md`, `spec-*.md`, `requirements.md` | Especificação funcional | spec.md |
| `plan.md`, `plan-*.md`, `design.md` | Plano arquitetural | plan.md |
| `tasks.md`, `tasks-*.md` | Matriz de execução | tasks.md |
| `CLAUDE.md` | Diretrizes para agentes | CLAUDE.md |
| `llms.txt` | Navegação para LLMs | llms.txt |

Se o nome não corresponder, pergunte ao usuário qual template aplicar.

### 2. Ler conteúdo atual

Leia o arquivo alvo por completo. Extraia semanticamente:
- Títulos e seções existentes
- Parágrafos de conteúdo
- Listas, checkboxes, tabelas
- Placeholders `{{...}}` não resolvidos

### 3. Mapear para seções canônicas

Para cada seção canônica do template (em `assets/canonical-templates.md`), busque conteúdo
correspondente no arquivo original. Conteúdo sem seção canônica → mova para `## Notas Adicionais`.

### 4. Apresentar diff e pedir confirmação

1. Gere o conteúdo refatorado completo.
2. Mostre resumo das mudanças: seções renomeadas, movidas, adicionadas.
3. **Pergunte ao usuário se pode aplicar.** Nunca sobrescreva sem confirmação.

### 5. Aplicar e reportar

Após confirmação, escreva o arquivo refatorado e liste:
- Seções adicionadas (novas seções canônicas sem conteúdo original)
- Seções renomeadas (conteúdo preservado, heading atualizado)
- Conteúdo preservado integralmente

## Guardrails

- **Preservação total** — nenhum conteúdo original pode ser descartado.
- **Idempotência** — se já conforme ao template, reporte e não modifique.
- **Placeholders** — preserve `{{...}}` e `` exatamente como estão.
- **CLAUDE.md parcial** — apenas a seção SDD Workflow é refatorada; o restante fica intacto.
- **Nunca sobrescreva sem confirmação** — sempre apresente o resultado antes.

## Checklist

- [ ] Arquivo alvo continua com mesmo conteúdo semântico (±5% para mudanças cosméticas)
- [ ] Todas as seções originais aparecem na nova versão
- [ ] Placeholders `{{...}}` preservados intactos
- [ ] Se `CLAUDE.md`, seção não-SDD está idêntica
- [ ] Usuário aprovou o diff antes de salvar

## Additional Resources

- `${CLAUDE_SKILL_DIR}/assets/canonical-templates.md` — templates canônicos para spec.md, plan.md, tasks.md, CLAUDE.md e llms.txt; regras de mapeamento de seções
