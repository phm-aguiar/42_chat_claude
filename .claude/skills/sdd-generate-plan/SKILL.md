---
name: sdd-generate-plan
description: >
  Gera plan.md para uma feature SDD a partir de spec.md existente. Produz 4 seções canônicas:
  Metadados, Contratos e Fronteiras, ADRs (mín. 1), Auditoria de Constituição. Use quando o
  usuário pedir para gerar ou criar o plano arquitetural de uma feature. Trigger: gerar plan,
  criar plan.md, generate plan, criar plano, generate architectural plan.
when_to_use: >
  Segunda etapa do pipeline SDD, após sdd-brainstorm. Use quando spec.md já existe e o usuário
  quer o plano arquitetural. Requer spec.md preenchido e .github/memory/tech.md e constitution.md.
argument-hint: "[specs/features/<id>-<slug>]"
allowed-tools: Read Write
disable-model-invocation: true
---

# sdd-generate-plan — Gerar Plano Arquitetural (plan.md)

## Prerequisites

- Feature com `spec.md` preenchido.
- `.github/memory/tech.md` e `constitution.md` existentes (podem estar vazios — use placeholders).

## Instructions

### 1. Identificar a feature

Usuário informa o diretório (ex: `specs/features/003-forge-skill`). Se não informado, pergunte.

### 2. Ler fontes

1. `spec.md` → funcionalidade, cenários BDD, restrições.
2. `.github/memory/tech.md` → linguagens, frameworks, build/teste.
3. `.github/memory/constitution.md` → portões de qualidade, restrições, anti-padrões.

### 3. Gerar 4 seções canônicas

**Seção 1 — Metadados:**
```markdown
## 1. Metadados do Plano
- **Stack Tecnológico:** {{linguagens e frameworks de tech.md}}
- **Feature Fonte:** `specs/features/{{id}}-{{slug}}/spec.md`
- **Escopo:** {{resumo 1 frase do que será implementado}}
```

**Seção 2 — Contratos e Fronteiras:**
Documente APIs/eventos/schemas se o spec os mencionar. Se `{{...}}`, preserve.
Se não houver: "Nenhum contrato formal neste estágio."

**Seção 3 — ADRs (mínimo 1):**
Para cada decisão no spec, formalize como mini-ADR:
```markdown
- **Decisão:** {{o que foi decidido}}
  - **Justificativa:** {{por que esta escolha}}
  - **Alternativa Rejeitada:** {{o que foi descartado e por quê}}
```
Se spec sem decisões explícitas, gere ao menos 1 ADR sobre stack ou estrutura.

**Seção 4 — Auditoria de Constituição:**
Checklist contra cada regra do `constitution.md`:
```markdown
- [x] {{regra}} — {{como o plano respeita ou por que não se aplica}}
```
Se constitution.md vazio: `- [ ] Constitution.md está vazio — nenhuma regra para auditar.`

### 4. Apresentar e salvar

Mostre stack, número de ADRs, itens auditados. **Pergunte antes de salvar.**

```bash
# Escreva em:
specs/features/<id>-<slug>/plan.md
```

## Guardrails

- **Não invente stack** — use apenas `tech.md`. Vazio = placeholders `{{...}}`.
- **ADR mínimo** — 1 ADR estrutural se spec não sugerir decisões.
- **Preserve placeholders** — `{{...}}` do spec intactos.
- **Idempotência** — se `plan.md` existe, pergunte sobrescrever ou mesclar.

## Checklist

- [ ] `plan.md` escrito em `specs/features/<id>-<slug>/`
- [ ] 4 seções canônicas presentes
- [ ] Pelo menos 1 ADR gerada
- [ ] Regras do `constitution.md` listadas na auditoria
- [ ] Usuário aprovou antes de salvar

## Additional Resources

- `${CLAUDE_SKILL_DIR}/assets/architecture-patterns.md` — decision tree de padrões arquiteturais, padrões Go por domínio, anti-padrões a evitar
