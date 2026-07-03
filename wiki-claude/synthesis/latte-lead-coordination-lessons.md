---
title: >-
  LATTE — Lições de Coordenação do Lead (execução em escala real)
category: synthesis
tags: ["latte", "coordenacao", "multi-agente", "sdd", "lead"]
sources:
  - conversation:2026-07-02
created: "2026-07-02"
updated: "2026-07-02"
summary: >-
  Padrões operacionais do Lead LATTE extraídos da primeira execução em escala real
  (feature 102, 28 tasks, 27 workers): paralelismo, reassign, prevenção de bugs via prompt.
provenance:
  extracted: 0.7
  inferred: 0.3
  ambiguous: 0.0
base_confidence: 0.42
lifecycle: draft
lifecycle_changed: "2026-07-02"
aliases: ["lições LATTE", "LATTE lessons", "coordenação lead", "lead coordination patterns"]
---

# LATTE — Lições de Coordenação do Lead

## Context

Primeira execução em escala real do modo `coordinate` (protocolo LATTE) após o
enxugamento da pipeline ([[token-sparing-playbook]]): [[feature-102-forum]],
28 tasks, 27 dispatches de executors Haiku, janela deslizante ≤3, ~803k tokens
de subagentes (~30k/task), zero retries por bug, smoke test 11/11 na primeira
execução. As lições abaixo são padrões reutilizáveis para qualquer feature futura.

## Finding

**1. Namespace de pacote vence `Paralelizável: true`.** Tasks que criam arquivos
no mesmo pacote Go compartilham namespace de símbolos. Quando helpers comuns nascem
em uma task (ex.: `writeJSON`/`writeError` no primeiro handler), as tasks irmãs
devem ser serializadas atrás dela e instruídas a REUTILIZAR sem redeclarar — mesmo
que o tasks.md as marque paralelizáveis. Para tasks paralelas inevitáveis no mesmo
pacote, exigir prefixo nos helpers privados (`board*`, `thread*`, `post*`).

**2. Divergência `depends_on` × edges → honrar as edges.** O gerador de tasks pode
emitir um Coordination Graph com arestas ausentes do `depends_on` (ex.: T022→T023,
T013→T015 na feature 102). A leitura conservadora (união dos dois) evita despachar
uma task cujo insumo real ainda não existe. ^[inferred]

**3. Verificação empírica com fallback preparado no prompt.** Quando o plan.md faz
uma afirmação técnica não verificada (ex.: "uuid.NewV7() na stdlib Go 1.25" — falso),
o prompt do executor deve mandar: tente a rota do plano, e se não compilar, use o
fallback X e REPORTE qual rota funcionou. Custo zero quando o plano está certo;
evita um round inteiro de falha quando está errado.

**4. Reassign começa pelo disco, não pelo re-dispatch.** Worker perdido
(connection closed) ≠ trabalho perdido. Antes de reatribuir: inventariar o que
ficou em disco (`ls`, `go vet`), e passar ao substituto o diagnóstico exato
("arquivo X existe, Y tem import não usado na linha 10, Z falta"). O reassign da
feature 102 completou em 1 tentativa por causa disso.

**5. Bugs previstos se previnem no prompt, não no QA.** Os 3 bugs "clássicos" que
o tasks.md antecipava (SeedBoards sem board_staff, getBoardID sem resolver thread
UUID, JWT middleware ausente) foram escritos como constraints explícitos nos prompts
de T011/T012 — e nenhum ocorreu. Transformar débito previsto em constraint de prompt
é mais barato que ciclo de fix. ^[inferred]

**6. Costuras de integração são o ponto cego crônico do DAG.** O tasks.md cobriu
todos os arquivos novos mas nenhuma task registrava as rotas no `App.tsx` (proibido
aos workers justamente para evitar conflito). Integração em arquivo compartilhado
existente é trabalho do Lead: pequeno, exige visão global, e não paraleliza.

**7. Lead pré-mapeia contratos compartilhados.** Antes de despachar workers paralelos
que precisam concordar (handler ↔ middleware), o Lead extrai o contrato real do
código (`auth.GetClaims(ctx) → *Claims{UserID, Login}`, formato de erro) e o injeta
nos dois prompts. Elimina descoberta duplicada (caro em Haiku) e drift de contrato.

**8. Validação final do Lead é inegociável após workers concorrentes na mesma área.**
Violações de constraint acontecem (um worker editou arquivo de outro em voo, apesar
da proibição explícita). O antídoto: sempre rodar o build completo como Lead após o
fechamento de workers que tocaram a mesma árvore, e anotar a violação nas métricas.

## Implications

- Corrigir no `/sdd-generate-tasks`: emitir `depends_on` consistente com as edges e
  detectar tasks "paralelizáveis" que compartilham pacote (item para o gerador, não
  para o Lead).
- Prompts de executor têm estrutura estável que funciona: CLAIM + TASK_ID +
  ANALYST_PLAN numerado + CONSTRAINTS de arquivos + DONE com evidência obrigatória.
- Métricas completas da execução: `specs/features/102-42-forum/metrics.md`.

## Related

- [[feature-102-forum]] — a execução que originou estas lições
- [[sdd-workflow]] — pipeline onde o modo coordinate se encaixa
- [[token-sparing-playbook]] — otimizações de contexto que baratearam os 27 dispatches
- [[context-engineering]] — fundamento conceitual
