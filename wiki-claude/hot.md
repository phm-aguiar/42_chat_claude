---
title: Hot Cache
summary: "Cache de atividade recente do vault — últimas operações, threads ativas e takeaways."
base_confidence: 0.5
lifecycle: draft
updated: "2026-07-02T23:00:00Z"
---

## Recent Activity

1. **2026-07-02 — Feature 102 executada + capture** — 42 Forum implementado via LATTE (28/28 tasks, 27 workers, smoke 11/11, testes store live PASS). Criadas [[projects/42_chat/features/feature-102-forum|feature-102-forum]] e [[synthesis/latte-lead-coordination-lessons|latte-lead-coordination-lessons]] (8 padrões do Lead). Pipeline enxugada antes da execução: CLAUDE.md −21%, protocolo LATTE movido para skill `/sdd` modo `coordinate`, 48 notas com frontmatter órfão corrigidas, [[concepts/context-engineering|context-engineering]] + [[references/claude-code/token-sparing-playbook|token-sparing-playbook]] destilados de `_raw/`.
2. **2026-07-01 — wiki-ingest** — Processed `wiki-claude/_raw/Obsidian-CLI.md` (1535 lines). Created `references/toolkits/obsidian/CLI.md` with complete command reference organized by category. Obsidian CLI now documented for automation/scripting workflows.
3. **2026-07-01 — Raw Cleanup** — Removed 66 MS Graph API clippings from `_raw/` (already ingested per manifest). Directory now empty.
4. **2026-06-30 — Raw Ingest** — 69 arquivos em `_raw/` avaliados: 3 processados (2 criados, 1 duplicado), 66 Microsoft Graph API docs não relevantes ignorados.

## Active Threads

- **Security hardening (SEC-001→007)** — backlog criado, nenhuma feature implementada. SEC-001 (rate limiting) tem menor esforço.
- **Features app pendentes** — 103 (mensageria) tem specs prontas; 104 (perfil), 105 (conquistas) em backlog. Feature 102 ✅ concluída em 2026-07-02.
- **Gerador de tasks** — corrigir divergência `depends_on` × edges e detecção de tasks "paralelizáveis" no mesmo pacote Go (ver [[synthesis/latte-lead-coordination-lessons|lições LATTE]]).
- **Frontend chunk >500 kB** — react-markdown/highlight.js no bundle principal; candidato a code-splitting.
- **Wiki cross-link** — 132 páginas orphans restantes. Prioridade: `references/adr/*`, `references/papers/*`, `references/toolkits/*`.

## Key Takeaways

- **LATTE na prática (feature 102)**: zero fixes na fase QA — os 3 bugs previstos pelo tasks.md foram prevenidos como constraints nos prompts dos executors. Overwrite/violação de constraint ainda ocorre (1 caso): validação final do Lead é inegociável. ~803k tokens de subagentes, ~30k/task.
- **ADR-102.2 corrigida em execução**: stdlib Go 1.25 NÃO tem `uuid.NewV7()` — usado `github.com/google/uuid v1.6.0`. Verificação empírica com fallback no prompt evitou round de falha.
- **Wiki token footprint**: 522K tokens — acima do limiar. Candidatos a `peripheral`: `references/cucumber/*` (26p) e `tools/golangci-lint/*` (37p).
- **Obsidian CLI tooling**: documentado — permite automação de vault, plugin dev workflows, search/analytics via CLI.

## Flagged Contradictions

- **Resolvida (2026-07-02):** digest de 2026-06-30 afirmava feature 102 "completed via LATTE, 27/27" quando nenhum código existia — a execução real ocorreu em 2026-07-02 (28/28). O journal antigo descreve um planejamento, não uma execução.
