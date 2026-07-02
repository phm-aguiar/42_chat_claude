---
name: sdd-generate-spec
description: >
  Deriva spec.md a partir de um Discovery Report aprovado em reports/. Lê o discovery,
  condensa nas seções canônicas do spec, confirma com o usuário e escreve em
  specs/features/<id>-<slug>/spec.md com Aprovado: false. Etapa entre brainstorm e generate-plan.
  Trigger: gerar spec, criar spec.md, generate spec, derivar spec, spec da feature, próximo passo do brainstorm.
when_to_use: >
  Segunda etapa do pipeline SDD, após sdd-brainstorm. Use quando um discovery.md aprovado
  existe em reports/ e o usuário quer avançar para o pipeline de plan/tasks.
argument-hint: "[reports/<id>-<slug>-discovery.md]"
allowed-tools: Read Write Bash AskUserQuestion
disable-model-invocation: true
---

# sdd-generate-spec — Discovery Report → spec.md

**Posição no pipeline:** `sdd-brainstorm` → **`sdd-generate-spec`** → `sdd-generate-plan` → `sdd-generate-tasks`

## Prerequisites

- `reports/<id>-<slug>-discovery.md` existente e com `Aprovado: true` no campo de metadados.
- Diretório `specs/features/` existente.

---

## Instructions

### 1. Identificar o discovery

Se o usuário não informou o arquivo, liste `reports/` e pergunte qual usar via `AskUserQuestion`.

```bash
ls reports/*-discovery.md 2>/dev/null
```

### 2. Verificar aprovação do discovery

Leia o discovery. Verifique o campo `**Aprovado:**` nos metadados.

- Se `false` → informe que o discovery precisa ser aprovado primeiro (rodar `/sdd-brainstorm`
  até o gate de aprovação passar) e ABORTE.
- Se `true` → prossiga.

Verifique também o quality score — se o total for < 20/25, alerte o usuário mas não bloqueie
(o gate de qualidade já deveria ter sido satisfeito no brainstorm; se foi pulado, é risco documentado).

### 3. Extrair insumos do discovery

Do discovery.md, extraia:

| Seção no discovery | Campo no spec |
|--------------------|--------------|
| Metadados (ID, slug, autor, data) | Metadados do spec |
| Contexto e Problema + Usuários | Propósito |
| Objetivos e Não-Objetivos | Escopo (dentro/fora) |
| Cenários Gherkin (Background + Scenarios) | Comportamento Esperado — Happy Path + Cenários Alternativos + Edge Cases |
| RF com prioridade Must | Comportamento Esperado (complementa Gherkin) |
| Decisão Arquitetural (opção escolhida + justificativa) | Abordagem Escolhida + Alternativas Consideradas |
| Seção Opções Consideradas | Alternativas Consideradas |
| RNFs + Constraints | Constraints |
| Critérios de Aceitação (DoD) | Critérios de Sucesso |
| Cross-reference: arquivos relacionados | Dependências |
| Débitos Técnicos Antecipados | Observação na seção Abordagem Escolhida |

### 4. Preencher spec.md

Carregue `${CLAUDE_SKILL_DIR}/assets/spec-template.md`. Substitua todos os placeholders `{{...}}`
pelos insumos extraídos. Adicione o campo de rastreabilidade nos Metadados:

```markdown
- **Discovery Report:** `reports/<id>-<slug>-discovery.md`
```

Regras de condensação:
- Propósito: 1-2 parágrafos — não copie verbatim; sintetize o essencial
- Cenários Gherkin completos vão no discovery; no spec use linguagem natural para Happy Path,
  mas preserve os títulos dos Scenarios de falha para que o leitor saiba que existem
- Alternativas: copie a tabela do ADR diretamente
- Critérios de Sucesso: use os DoD do discovery — são mensuráveis e já aprovados

Mantenha `**Aprovado:** false` — o spec só é aprovado explicitamente pelo usuário ao invocar
`/sdd-generate-plan`.

### 5. Self-review

Antes de apresentar:
- Há `{{placeholders}}` não substituídos? → Preencha.
- O Propósito responde "para quem, o quê, por quê"? → Garanta.
- Os Critérios de Sucesso são mensuráveis? → Não aceite "funcionar corretamente".
- A seção Abordagem menciona os débitos técnicos antecipados? → Inclua se relevante.

### 6. Confirmar e salvar

Mostre um preview resumido do spec ao usuário. Use `AskUserQuestion` com opções:
"Salvar como está", "Ajustar [seção específica]", "Abortar".

Se "Ajustar", aplique o ajuste e re-apresente. Repita até aprovação.

```bash
mkdir -p specs/features/<id>-<slug>
# Escreva em:
specs/features/<id>-<slug>/spec.md
```

### 7. Transição

Informe o caminho do spec.md criado e indique que o próximo passo é `/sdd-generate-plan`.

---

## Guardrails

- **Não regenere um spec existente sem confirmar** — se `spec.md` já existe, pergunte: sobrescrever ou abortar.
- **Discovery não aprovado → ABORTE** — não derive spec de discovery com `Aprovado: false`.
- **Não copie verbatim blocos Gherkin** — o spec usa linguagem natural; o Gherkin completo fica no discovery.
- **Mantenha rastreabilidade** — o campo `Discovery Report:` é obrigatório no spec.
- **Não altere o discovery** — esta skill é read-only sobre `reports/`.

---

## Checklist

- [ ] Discovery lido e aprovação verificada
- [ ] Todos os placeholders do spec-template preenchidos
- [ ] Campo `Discovery Report:` presente nos Metadados
- [ ] `Aprovado: false` no spec (aguarda gate do sdd-generate-plan)
- [ ] `specs/features/<id>-<slug>/spec.md` escrito
- [ ] Usuário confirmou antes de salvar
- [ ] `/sdd-generate-plan` sinalizado como próximo passo

---

## Additional Resources

- `${CLAUDE_SKILL_DIR}/assets/spec-template.md` — template canônico do spec.md
