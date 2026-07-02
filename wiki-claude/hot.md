---
title: Hot Cache
updated: "2026-07-01T23:30:00Z"
---

## Recent Activity

1. **2026-07-01 — wiki-ingest** — Processed `wiki-claude/_raw/Obsidian-CLI.md` (1535 lines). Created `references/toolkits/obsidian/CLI.md` with complete command reference organized by category (General, Bases, Bookmarks, Daily Notes, Files, Links, Plugins, Properties, Publish, Search, Sync, Tags, Tasks, Templates, Themes, Vault, Workspace, Developer). Obsidian CLI now documented for automation/scripting workflows.
2. **2026-07-01 — Raw Cleanup** — Removed 66 MS Graph API clippings from `_raw/` (already ingested per manifest). Directory now empty.
3. **2026-06-30 — Raw Ingest** — 69 arquivos em `_raw/` avaliados: 3 processados (2 criados, 1 duplicado), 66 Microsoft Graph API docs não relevantes ignorados.
4. **2026-06-27 — wiki-lint --consolidate** — 59 mudanças: 29 lifecycle corrections, 15 tag normalizations, 8 orphan rescue cross-refs, 9 broken link fixes, 1 confidence fix

## Active Threads

- **Security hardening (SEC-001→007)** — backlog criado, nenhuma feature implementada. SEC-001 (rate limiting) tem menor esforço.
- **Features app pendentes** — 103 (menções), 104 (perfil), 105 (conquistas) em backlog após feature 102.
- **Wiki cross-link** — 132 páginas orphans restantes. Prioridade: `references/adr/*`, `references/papers/*`, `references/toolkits/*`.

## Key Takeaways

- **LATTE overwrite pattern**: Overwrites só acontecem na fase QA/smoke test, nunca nas fases de implementação. T022 descobriu 3 bugs críticos que tasks isoladas ignoraram.
- **42_chat pipeline**: Framework SDD + agents 006/007 validados via feature 102. Próximo: agents 008/009 quando fundamentação pronta.
- **Wiki token footprint**: 522K tokens — acima do limiar. Candidatos a `peripheral`: `references/cucumber/*` (26p) e `tools/golangci-lint/*` (37p).
- **Obsidian CLI tooling**: Agora documentado — permite automação de vault, plugin dev workflows, search/analytics via CLI.
- **Raw staging clean**: Zero pending files in `_raw/` — all clippings promoted or discarded.

## Flagged Contradictions

Nenhuma contradição ativa registrada.