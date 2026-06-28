---
name: sdd-brainstorm
description: >
  Brainstorm interativo de features SDD: conduz entrevista com AskUserQuestion uma pergunta por vez,
  gera spec.md em specs/features/<id>-<slug>/. Use quando quiser discutir, refinar ou fazer
  brainstorm de uma nova feature antes de escrever o spec. Trigger: brainstorm, brain storm,
  discutir ideia, refinar ideia, pensar feature, nova feature, nova ideia, discutir feature,
  entrevista, interview, discovery, bora pensar, vamos pensar, como voce faria.
when_to_use: >
  Entry point do pipeline SDD. Use quando o usuário disser "brainstorm", "quero discutir uma
  feature", "nova ideia", "vamos pensar", "como você faria", "entrevista de requisitos", "discovery".
argument-hint: "[feature-idea]"
allowed-tools: Read Write Bash
disable-model-invocation: true
---

# sdd-brainstorm — Brainstorm Interativo → spec.md

**HARD-GATE:** Nunca implemente antes do spec aprovado. Vale para TODA feature.

## Prerequisites

- Repo inicializado com SDD (`sdd-init-repo`): `.github/memory/`, `specs/features/`.
- Se `tech.md` ou `constitution.md` estiverem vazios, alerte mas prossiga.

## Instructions

### 1. Explorar contexto

Leia `.github/memory/tech.md`, `.github/memory/constitution.md`. Liste `specs/features/`.

### 2. Avaliar escopo

Se a ideia descreve múltiplos subsistemas independentes, use `AskUserQuestion` para confirmar
decomposição antes de prosseguir. Cada subsistema vira feature própria.

### 3. Query de memória experiencial (opcional)

Se o índice `wiki_index.db` estiver disponível, consulte features similares:

```python
from search import search_similar
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
results = search_similar(query_text='<tópico da feature>', model=model, k=3)
```

Injete os top-3 chunks como contexto antes da entrevista. Se índice ausente, prossiga sem hints.

### 4. Entrevista interativa

Carregue as dimensões da entrevista em `${CLAUDE_SKILL_DIR}/assets/interview-dimensions.md`.

- **Uma pergunta por `AskUserQuestion`** — nunca empilhe perguntas.
- Cubra: propósito, escopo, constraints, critérios de sucesso, edge cases.
- Só avance quando a dimensão atual estiver clara.
- Se usuário disser "confio em você", preencha com defaults razoáveis e valide no passo 5.

### 5. Propor abordagens

Use `AskUserQuestion` para apresentar 2-3 abordagens com trade-offs e recomendação.

### 6. Gerar spec.md

Carregue o template canônico em `${CLAUDE_SKILL_DIR}/assets/spec-template.md`.

Substitua placeholders `{{...}}` pelos insumos coletados. ID: próximo incremental de `specs/features/`
(vazio = `001`). Slug: máx 3 palavras, lowercase, hífens.

```bash
# Escreva em:
specs/features/<id>-<slug>/spec.md
```

### 7. Self-review

Revise o spec.md: placeholders preenchidos? Contradições? Escopo focado? Ambiguidades?
Corrija inline antes de apresentar ao usuário.

### 8. Gate de aprovação

Use `AskUserQuestion` para aprovação explícita. Se o usuário pedir ajustes, faça e re-apresente.

### 9. Transição

Carregue `/sdd-generate-plan` ou informe que o próximo passo é gerar o plan.md.

## Guardrails

- **Uma pergunta por `AskUserQuestion`** — nunca empilhe tópicos.
- **Múltipla escolha sempre que possível** — "Other" como escape para resposta livre.
- **YAGNI implacável** — spec com mínimo viável, não máximo possível.
- **Respeite `constitution.md`** — spec não pode violar portões/anti-padrões.
- **Idempotência** — se spec existente, pergunte refinar ou recomeçar.
- **ID incremental** — derive do maior ID em `specs/features/`.

## Checklist

- [ ] `spec.md` existe em `specs/features/<id>-<slug>/`
- [ ] Seções canônicas preenchidas (sem "TODO" ou "TBD")
- [ ] Propósito, escopo, cenários, edge cases, constraints e critérios presentes
- [ ] Usuário aprovou explicitamente
- [ ] `/sdd-generate-plan` invocado ou sinalizado como próximo passo

## Additional Resources

- `${CLAUDE_SKILL_DIR}/assets/spec-template.md` — template canônico do spec.md
- `${CLAUDE_SKILL_DIR}/assets/interview-dimensions.md` — dimensões da entrevista de brainstorm
