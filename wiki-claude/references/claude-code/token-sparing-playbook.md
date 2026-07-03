---
title: "Token-Sparing Playbook — 42 Chat"
category: claude-code
tags: ["claude-code", "context-engineering", "latte", "otimizacao", "playbook", "tokens", "wiki"]
created: "2026-07-02"
updated: "2026-07-02"
summary: "Playbook aplicado de economia de tokens na pipeline SDD+LATTE+wiki deste repo: CLAUDE.md enxuto, protocolo LATTE na skill /sdd, wiki-first via índice local, e o que foi avaliado e descartado (udiff, MCP externo, re-ranking)."
lifecycle: reviewed
sources:
  - wiki-claude/_archives/analise-estrategias.md
provenance: ingested
base_confidence: 0.4
aliases: ["token sparing", "token economy playbook", "economia de tokens claude code", "CLAUDE.md fixed tax", "imposto fixo CLAUDE.md"]
rag_score: 0.5
---

# Token-Sparing Playbook — 42 Chat

Destilado de [[context-engineering]] para a pipeline deste repo (SDD + LATTE + wiki).
Aplicado em 2026-07-02.

## Aplicado

1. **CLAUDE.md como bússola, não manual.** O protocolo LATTE completo (Algorithm A4.5,
   7 operadores, heartbeat, budget) vive na skill `/sdd` (modo `coordinate`), carregada
   sob demanda. O CLAUDE.md mantém só o ponteiro. Racional: todo worker spawninado
   (executor Haiku incluso) herda o CLAUDE.md inteiro — protocolo inline era imposto
   fixo multiplicado por worker × round.
2. **Contexto basal preciso.** Referências a scripts inexistentes
   (`wiki/lint/*.py`, `latte_coordination/tests/`) removidas do CLAUDE.md — instruções
   mortas queimam turnos de agente em comandos que falham.
3. **Wiki-first via índice local.** Retrieval por
   `cli_query.py --semantic "<query>" --hybrid --top-k 5` (embeddings all-MiniLM-L6-v2 +
   BM25, SQLite local) — custo de API zero. Proibido mapear a wiki com `grep`/`cat` em massa.
4. **Aliases como superfície de recall.** Frontmatter `aliases` com variações léxicas que
   o agente digitaria (regra 4 do `_meta/template.md`) — alimenta o matching BM25 sem
   inflar o corpo da nota.
5. **Allowlist de permissões** em `.claude/settings.json` para comandos read-only
   recorrentes — elimina turnos vazios de aprovação.

## Avaliado e descartado (não aplicar)

- **Formato udiff para edições:** Claude Code edita via tool `Edit` (search/replace
  estruturado fora do texto de resposta). Instruir udiff quebraria o tooling. A seção
  Aider da fonte (RepoMap, `.aider.conf.yml`) é sobre outra ferramenta.
- **Servidor MCP para Obsidian (seekstone etc.):** redundante com a experiential memory
  já existente, e schemas MCP são um novo imposto fixo em todo contexto.
- **Re-ranking com cross-encoder:** overkill para ~350 notas. Reavaliar se o vault passar
  de alguns milhares de notas.
- **`/compact` manual + memory anchors:** parcialmente superado pela sumarização
  automática do harness; a regra LATTE "sumarize a cada 4 turns" já cobre o padrão.

## Guardrails permanentes

- CLAUDE.md: mirar ≤ 600 tokens de invariantes; detalhe operacional → skill ou wiki.
- Nova instrução no CLAUDE.md só entra se valer o custo em *todo* contexto de *todo* agente.
- Ao renomear/remover scripts de tooling, atualizar CLAUDE.md no mesmo commit.
