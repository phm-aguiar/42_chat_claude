---
title: "Context Engineering (Engenharia de Contexto)"
category: concepts
tags: ["agentes", "context-engineering", "llm", "otimizacao", "tokens"]
created: "2026-07-02"
summary: "Disciplina de gerir cirurgicamente o que entra na janela de contexto de um agente LLM: imposto fixo de arquivos de ciclo de vida, poda ativa, retrieval indexado vs força bruta."
lifecycle: reviewed
sources:
  - wiki-claude/_archives/analise-estrategias.md
provenance: ingested
base_confidence: 0.4
aliases: ["context engineering", "engenharia de contexto", "context bloat", "token economy", "economia de tokens", "context pruning"]
rag_score: 0.5
---

# Context Engineering (Engenharia de Contexto)

Distinta da engenharia de prompts (que otimiza *instruções*), a engenharia de contexto
gere *o que entra* na janela do modelo: compressão ativa da memória, alocação orçamental
de tokens e aproveitamento de cache (KV/prefix cache).

## Problemas centrais

- **Context bloat:** no ciclo ReAct (Reason → Act → Observe), cada iteração reprocessa
  todo o histórico — system prompt, schemas de ferramentas, saídas de terminal. Custo
  acumula de forma quadrática; contexto saturado degrada o raciocínio ("lost in the middle").
- **Imposto fixo dos arquivos de ciclo de vida:** `CLAUDE.md` e equivalentes não têm
  lazy-loading — são injetados integralmente em toda sessão *e em todo subagente spawninado*.
  Em pipelines multi-agente como o [[sdd|LATTE]], o custo multiplica por worker.
  Alvo recomendado: 300–600 tokens, só invariantes; o resto vai para skills
  (carga sob demanda) ou para a wiki (retrieval indexado).
- **Anti-pattern da força bruta:** dar ao agente `grep`/`find`/`cat` irrestritos sobre uma
  base de conhecimento força reconstrução do grafo a cada consulta. A alternativa é
  retrieval indexado — neste repo, a experiential memory
  (`cli_query.py --semantic --hybrid`, embeddings locais + BM25, custo de API zero).

## Técnicas de poda (long-horizon)

- **Truncamento cego falha:** cortar histórico por contagem de tokens apaga lições de
  tentativas fracassadas → o agente re-tenta erros já superados.
- **Compressão ativa ("dente de serra"):** o próprio modelo demarca fases de exploração
  e, ao fechar cada fase, condensa um resumo estruturado (fatos aprendidos, dead-ends,
  veredicto) que substitui as mensagens sujas. No Claude Code isso corresponde à
  sumarização automática de contexto + regra LATTE de sumarizar tasks concluídas a cada
  4 turns.
- **Memory anchors:** antes de compactar, registrar explicitamente as decisões que devem
  sobreviver à compressão.

## Confiabilidade da fonte

Fonte original é um relatório gerado sem citações verificáveis (métricas como "7M tokens",
"22.7%" e a chave `claudeMdExcludes` não são confirmáveis). Princípios gerais: sólidos.
Números específicos: tratar como ilustrativos. Ver [[token-sparing-playbook]] para o que
foi de fato aplicado neste repo.
