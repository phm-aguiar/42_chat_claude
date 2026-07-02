---
base_confidence: 0.5
title: Consolidation Report 2026-06-27
category: synthesis
tags: [maintenance, consolidation, lint]
sources: []
summary: Auto-generated consolidation report from wiki-lint --consolidate run on 2026-06-27. Fixed lifecycle values, tag formatting, broken links, and orphan cross-references.
lifecycle: draft
lifecycle_changed: "2026-06-27"
tier: peripheral
created: "2026-06-27T00:00:00Z"
updated: "2026-06-27T00:00:00Z"
---
base_confidence: 0.5

# Consolidation Report — 2026-06-27

## Summary

- Broken links fixed: 9 (1 path correction + 8 skills/* → plain text batches)
- Cross-references added: 8 (orphan rescue for 4 synthesis pages)
- Lifecycle states corrected: 29 (invalid enum values → valid)
- Tier demotions: 0 (no stale orphans)
- Lifecycle promotions: 0 (no draft pages with age>30d + confidence>0.7)
- Tag normalizations: 15 (single-quoted YAML → unquoted)
- Confidence fixes: 1 (placeholder value replaced)

## Broken Link Fixes

### Corrected paths (1)
- `journal/digest-2026-06-21.md:57` — `[[adr/ADR-001]]` → `[[references/adr/adr-001-budget-tracking|ADR-001]]`

### Converted to plain text (skills/* — no skills/ dir in vault)
- `journal/2026-06-14-sessao-qa-skills-42chat.md` — 9 `[[skills/*]]` links → plain text
- `journal/2026-06-17-brainstorm-feature-101.md` — 2 `[[skills/sdd-brainstorm]]` → plain text
- `references/sdd-dsa-series.md` — 3 `[[skills/sdd-*]]` → plain text
- `_insights.md` — 4 `[[skills/*]]` → plain text

### Could not fix (no match, left as plain text by sed):
- `[[concepts/coordination-graph]]` — no such page exists
- `[[projects/42_Framework/features/005-latte-hardening]]` — feature never created

## Cross-References Added (orphan rescue)

4 synthesis pages rescued from zero-incoming-link state:

| Orphan | Rescued from |
|---|---|
| `synthesis/go-tooling-ecosystem` | `references/go-style-guide.md` (Ver Também), `synthesis/thinking-go.md` (Related) |
| `synthesis/oauth2×jwt` | `entities/oauth2.md` (Relacionado), `entities/jwt.md` (new Síntese section) |
| `synthesis/playwright-bdd×cucumber` | `references/playwright-bdd.md` (Ver Também), `references/cucumber-basics.md` (Ver Também) |
| `synthesis/websocket×chi` | `entities/websocket.md` (Relacionado), `entities/chi.md` (Relacionado) |

## Lifecycle Corrections (29 pages)

### lifecycle: raw → draft (26 cucumber pages)
All files in `references/cucumber/`:
- cucumber-api-reference, introduction, step-definitions, checking-assertions, continuous-integration,
  java-tooling, index, mocking-and-stubbing, testable-architecture, discovery-workshop, state-management,
  step-organization, gocuke, 10-minute-tutorial, environment-variables, upgrading, example-mapping,
  api-automation, history-of-bdd, configuration, browser-automation, user-story, who-does-what,
  cucumber-expressions, parallel-execution, myths-about-bdd

### lifecycle: stable → reviewed (1 page)
- `references/42-graphic-charter-software.md` — "stable" is not in enum

### lifecycle: active → draft (1 page)
- `projects/42_Framework/42_Framework.md` — "active" is not in enum

### lifecycle: absorbed → archived (1 page)
- `projects/42_chat/features/feature-005-agent-orchestrator.md` — "absorbed" is not in enum; archived is correct (feature superseded)

## Tag Normalizations (15 pages)

All files in `tools/golangci-lint/linters/`:
- revive, wsl, testifylint, _index, tagliatelle, govet, depguard, gosec, stylecheck,
  overview, gocritic, gosimple, staticcheck, varnamelen, sloglint

Fixed: `tags: ['golangci-lint', 'linters']` → `tags: [golangci-lint, linters]`
(Python-style single quotes are invalid YAML for Obsidian tag parsing)

## Confidence Fixes (1 page)

- `references/toolkits/wiki/url-sources.md` — `base_confidence: <computed — see below>` → `base_confidence: 0.40`

## Remaining Issues (not auto-fixed — require human review)

| Issue | Count | Action |
|---|---|---|
| Orphan pages | 132 (remaining) | Run `/wiki-cross-link` or `/wiki-ingest` to establish links |
| Missing frontmatter | 140 pages | Needs per-page sourcing; run `/wiki-ingest` to populate |
| Missing summary | 128 pages (soft) | Re-ingest or write manually |
| Index empty | 331 pages unlisted | Run `/wiki-ingest` — it rebuilds index.md |
| Broken `skills/*` refs | Some may remain in body text | Search and clean after vault reorganization |
| Synthesis gap: BDD × Go | High co-occurrence, no synthesis | Run `/wiki-synthesize` |
| Token footprint | ~522K tokens | Tier bulk `references/cucumber/*` and `tools/*` to peripheral |
