---
name: sdd-brainstorm
description: >
  Discovery interativo de features SDD: entrevista iterativa com cross-reference wiki/código obrigatório,
  gera Discovery Report (ADR+PRD híbrido) em reports/ com cenários Gherkin (sucesso E falha)
  e loop de qualidade até score ≥ 20/25. Só após aprovação deriva spec.md para o pipeline.
  Trigger: brainstorm, brain storm, discutir ideia, refinar ideia, pensar feature, nova feature,
  nova ideia, discutir feature, entrevista, interview, discovery, bora pensar, vamos pensar, como voce faria.
when_to_use: >
  Entry point do pipeline SDD. Use quando o usuário disser "brainstorm", "quero discutir uma
  feature", "nova ideia", "vamos pensar", "como você faria", "entrevista de requisitos", "discovery".
argument-hint: "[feature-idea]"
allowed-tools: Read Write Bash AskUserQuestion
disable-model-invocation: true
---

# sdd-brainstorm — Discovery Interativo → reports/<id>-<slug>-discovery.md

**HARD-GATE:** Nunca implemente antes do spec aprovado. Vale para TODA feature.

## Por que este fluxo existe

Feature 100 (42chat-core) acumulou débito técnico por:
- Casos de sucesso/falha não listados → comportamento de erro indefinido
- Gherkin/TDD ausentes → implementação guiada por suposição, não por contrato
- Wiki/codebase não consultados → decisões que ignoraram padrões existentes

**Este skill não termina sem: Gherkin completo (sucesso + falha) e quality score ≥ 20/25.**

## Prerequisites

- Repo inicializado com SDD: `.github/memory/`, `specs/features/`.
- Se `tech.md` ou `constitution.md` estiverem vazios, alerte e prossiga.
- Diretório `reports/` pode não existir — criar com `mkdir -p reports/` quando necessário.

---

## Instructions

### 1. Explorar contexto

Leia `.github/memory/tech.md` e `.github/memory/constitution.md`. Liste `specs/features/` para
identificar o próximo ID incremental e features anteriores relacionadas.

### 2. Avaliar escopo

Se a ideia descreve múltiplos subsistemas independentes, use `AskUserQuestion` para confirmar
decomposição. Cada subsistema vira feature própria com discovery separado.

### 3. Cross-reference inicial (OBRIGATÓRIO — executar antes da entrevista)

Esta etapa previne decisões baseadas em ignorância do estado atual do código e da wiki.

**3a. Wiki search** — se `~/.claude/wiki_index.db` ou `wiki-claude/` existirem:

```python
# se índice disponível:
import sys; sys.path.insert(0, '.claude/skills/wiki/experiential_memory')
from search import search_similar
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
results = search_similar(query_text='<tópico da feature>', model=model, k=5)
# para cada result: anote chunk_id, score, trecho relevante
```

Se índice ausente, leia manualmente `wiki-claude/index.md` e busque seções relevantes.

**3b. Codebase scan** — sempre executar:

```bash
# Identificar código relacionado ao domínio da feature
grep -r "<keyword_1>" --include="*.go" --include="*.tsx" -l . 2>/dev/null | head -10
grep -r "<keyword_2>" --include="*.go" --include="*.tsx" -l . 2>/dev/null | head -10
```

Documente:
- Arquivos com código reutilizável ou que podem ser afetados
- Padrões existentes (ex.: "store já implementa soft delete em posts — manter consistência")
- Conflitos potenciais (ex.: "migration 002 já usa campo X — não duplicar")

Guarde essa lista de evidências — será injetada no discovery report e mencionada durante a entrevista.

### 4. Entrevista interativa

Carregue as dimensões em `${CLAUDE_SKILL_DIR}/assets/interview-dimensions.md`.

**Regras de condução:**
- **Uma pergunta por `AskUserQuestion`** — nunca empilhe dimensões.
- **Múltipla escolha sempre que possível** — "Other" como escape para resposta livre.
- Mencione achados do step 3: "A wiki tem padrão X para isso — reutilizar ou diferente aqui?"
- Só avance quando a dimensão estiver clara o suficiente para escrever Gherkin.

**Dimensão extra obrigatória — Cenários de Falha:**

Antes de encerrar a entrevista, SEMPRE pergunte explicitamente:

> "Agora quero cobrir o que FALHA. Quais são os 2-3 cenários onde isso dá errado e o que o sistema
> deve fazer em cada caso? (ex: input inválido, serviço externo fora do ar, usuário sem permissão)"

Não avance para o step 5 sem pelo menos 2 cenários de falha definidos.

### 5. Gerar Discovery Report

Crie `reports/` se não existir. Carregue `${CLAUDE_SKILL_DIR}/assets/discovery-template.md`.

- **ID:** próximo incremental (veja os IDs em `specs/features/` — use o maior + 1; se vazio = `001`)
- **Slug:** máx 3 palavras, lowercase, hífens, sem artigos

```bash
mkdir -p reports
# Escreva em:
# reports/<id>-<slug>-discovery.md
```

Preencha **todas** as seções do template sem `TODO` ou `TBD`. Seções obrigatórias:

1. **Contexto e Problema** — quem, o quê, por quê, situação atual sem a feature
2. **Objetivos e Não-Objetivos** — lista explícita dentro/fora (YAGNI)
3. **Requisitos Funcionais** — tabela RF-NN com prioridade Must/Should/Could
4. **Requisitos Não-Funcionais** — performance, segurança, observabilidade com métricas
5. **Cenários Gherkin** — bloco `Feature:` completo (ver formato abaixo)
6. **Decisão Arquitetural** — opções consideradas, drivers, escolha, consequências
7. **Débitos Técnicos Antecipados** — tabela: débito, impacto, plano de mitigação
8. **Cross-Reference** — achados wiki + codebase do step 3
9. **Critérios de Aceitação (DoD)** — checklist mensurável

**Formato Gherkin obrigatório:**

```gherkin
Feature: <título descritivo>
  Como <papel do usuário>
  Quero <ação ou capacidade>
  Para <valor de negócio>

  Background:
    Dado que <pré-condição compartilhada entre cenários>

  # === CENÁRIOS DE SUCESSO (mínimo 3) ===

  Scenario: <happy path principal>
    Dado <estado inicial>
    Quando <ação do usuário>
    Então <resultado esperado>
    E <efeito colateral esperado se houver>

  Scenario: <variação de sucesso>
    ...

  Scenario: <segundo caso de sucesso ou edge case feliz>
    ...

  # === CENÁRIOS DE FALHA (mínimo 2) ===

  Scenario: <falha por input inválido ou estado inconsistente>
    Dado <estado que provoca erro>
    Quando <ação>
    Então o sistema retorna erro "<mensagem específica>"
    E o estado do sistema permanece inalterado

  Scenario: <falha por dependência externa ou permissão>
    Dado <serviço X indisponível | usuário sem permissão>
    Quando <ação>
    Então <comportamento de fallback ou erro claro>

  # === EDGE CASES (mínimo 1) ===

  Scenario: <concorrência, volume, timeout ou dado no limite>
    ...
```

### 6. Quality Gate Loop

Calcule o score usando `${CLAUDE_SKILL_DIR}/assets/quality-gates.md`.

| Dimensão | Max | Critério de pontuação máxima |
|----------|-----|------------------------------|
| Completeness | 5 | Todas seções preenchidas, zero TODO/TBD |
| Gherkin coverage | 5 | ≥ 3 sucesso + ≥ 2 falha + ≥ 1 edge case |
| Ambiguity | 5 | Nenhum termo vago sem definição explícita |
| Debt surface | 5 | Débitos listados com impacto e mitigação concreta |
| Wiki alignment | 5 | Padrões consultados e implicações documentadas |

**Mínimo para aprovação: 20/25.**

Se score < 20:
1. Mostre o score por dimensão ao usuário em texto.
2. Para cada dimensão com score < 3, faça `AskUserQuestion` para coletar o que falta.
3. Atualize o `discovery.md` com as novas informações.
4. Recalcule. Repita até ≥ 20.

### 7. Self-review

Antes de apresentar ao usuário, revise mentalmente:
- Há placeholders `{{...}}` não preenchidos? → Preencha.
- Há contradições entre requisitos e cenários Gherkin? → Resolva.
- Cenários de falha cobrem as violações das constraints do `constitution.md`? → Garanta.
- Débitos listados têm mitigação concreta, não genérica? → Seja específico.

### 8. Gate de aprovação

Use `AskUserQuestion` para apresentar o score final e pedir aprovação explícita.
Mostre: total score, pontos fortes, eventuais ressalvas.

Se o usuário pedir ajustes, incorpore, recalcule e re-apresente.

### 9. Transição

Informe o caminho do discovery gerado e indique que o próximo passo é `/sdd-generate-spec`,
que lê o `discovery.md` e deriva o `spec.md` necessário para o pipeline de plan/tasks.

---

## Guardrails

- **Uma pergunta por `AskUserQuestion`** — nunca empilhe tópicos.
- **Gherkin de falha obrigatório** — nunca encerre sem ≥ 2 cenários de falha.
- **Débitos explícitos obrigatórios** — nunca escreva "sem débitos" sem justificativa documentada.
- **YAGNI implacável** — discovery com mínimo viável, não máximo possível.
- **Respeite `constitution.md`** — discovery não pode violar restrições arquiteturais.
- **Cross-reference não é opcional** — step 3 executa sempre, mesmo que o índice esteja ausente.
- **Idempotência** — se discovery existente, pergunte: refinar ou recomeçar.
- **ID incremental** — derive do maior ID em `specs/features/` ou `reports/`.

---

## Checklist de Conclusão

- [ ] `reports/<id>-<slug>-discovery.md` criado
- [ ] Quality score ≥ 20/25 atingido
- [ ] ≥ 3 cenários de sucesso Gherkin
- [ ] ≥ 2 cenários de falha Gherkin
- [ ] ≥ 1 edge case Gherkin
- [ ] Débitos técnicos antecipados documentados com mitigação
- [ ] Cross-reference wiki + codebase documentado no discovery
- [ ] Usuário aprovou explicitamente
- [ ] `/sdd-generate-spec` sinalizado como próximo passo

---

## Additional Resources

- `${CLAUDE_SKILL_DIR}/assets/discovery-template.md` — template ADR+PRD para reports/
- `${CLAUDE_SKILL_DIR}/assets/quality-gates.md` — critérios de scoring de qualidade
- `${CLAUDE_SKILL_DIR}/assets/interview-dimensions.md` — dimensões da entrevista interativa
