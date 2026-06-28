---
name: wiki-meta
description: Foundational knowledge-distillation pattern for the Obsidian wiki — three-layer architecture, page templates, provenance markers, confidence formula, lifecycle states, typed relationships, retrieval primitives, config protocol, and link format. Background reference consulted by all wiki-* skills.
when_to_use: Auto-load when any wiki-* skill needs to reference the Config Resolution Protocol, page templates, provenance markers, confidence formula, lifecycle states, typed relationships, retrieval primitives, or link format conventions.
user-invocable: false
allowed-tools: Read
---
# LLM Wiki — Knowledge Distillation Pattern

You are maintaining a persistent, compounding knowledge base. The wiki is not a chatbot — it is a **compiled artifact** where knowledge is distilled once and kept current, not re-derived on every query.

## Three-Layer Architecture

### Layer 1: Raw Sources (immutable)

The user's original documents — articles, papers, notes, PDFs, conversation logs, bookmarks, **and images** (screenshots, whiteboard photos, diagrams, slide captures). These are never modified by the system. They live wherever the user keeps them (configured via `OBSIDIAN_SOURCES_DIR` in `.env`). Images are first-class sources: the ingest skills read them via the Read tool's vision support and treat their interpreted content as inferred unless it's verbatim transcribed text. Image ingestion requires a vision-capable model — models without vision support should skip image sources and report which files were skipped.

Think of raw sources as the "source code" — authoritative but hard to query directly.

### Layer 2: The Wiki (LLM-maintained)

A collection of interconnected Obsidian-compatible markdown files organized by category. This is the compiled knowledge — synthesized, cross-referenced, and navigable. Each page has:

- YAML frontmatter (title, category, tags, sources, timestamps)
- Obsidian `[[wikilinks]]` connecting related concepts
- Clear provenance — every claim traces back to a source

The wiki lives at the path configured via `OBSIDIAN_VAULT_PATH` in `.env`.

### Layer 3: The Schema (this skill + config)

The rules governing how the wiki is structured — categories, conventions, page templates, and operational workflows. The schema tells the LLM *how* to maintain the wiki.

## Wiki Organization

The vault has two levels of structure: **categories** (what kind of knowledge) and **projects** (where the knowledge came from).

### Categories

Organize pages into these default categories (customizable in `.env`):

| Category | Purpose | Example |
|---|---|---|
| `concepts/` | Ideas, theories, mental models | `concepts/transformer-architecture.md` |
| `entities/` | People, orgs, tools, projects | `entities/andrej-karpathy.md` |
| `skills/` | How-to knowledge, procedures | `skills/fine-tuning-llms.md` |
| `references/` | Summaries of specific sources; academic papers use the Paper Deep-Dive Template (below) | `references/attention-is-all-you-need.md` |
| `synthesis/` | Cross-cutting analysis across sources | `synthesis/scaling-laws-debate.md` |
| `journal/` | Timestamped observations, session logs | `journal/2024-03-15.md` |

### Projects

Knowledge often belongs to a specific project. The `projects/` directory mirrors this:

```
$OBSIDIAN_VAULT_PATH/
├── projects/
│   ├── my-project/
│   │   ├── my-project.md      ← project overview (named after project)
│   │   ├── concepts/          ← project-scoped category pages
│   │   ├── skills/
│   │   └── ...
│   └── ...
├── concepts/                   ← global (cross-project) knowledge
├── entities/
├── skills/
└── ...
```

**When knowledge is project-specific**, put it under `projects/<project-name>/<category>/`. **When knowledge is general**, put it in the global category directory.

**Naming rule:** The project overview file must be named `<project-name>.md`, not `_project.md`. Obsidian's graph view uses the filename as the node label.

## Special Files

Every wiki has these files at its root:

### `index.md`
A content-oriented catalog organized by category. Each entry has a one-line summary and tags. Rebuild after every ingest. Format rule: use `description ( #tag)` with a space after `(` — not `description (#tag)`.

### `log.md`
Chronological append-only record. Each entry: `- [TIMESTAMP] OPERATION key=value ...`

### `.manifest.json`
Tracks every source file that has been ingested — path, timestamps, what wiki pages it produced. **Source keys MUST be stored as absolute paths with `~` expanded** — never mix `~`-relative and absolute keys.

### `hot.md`
~500-word semantic snapshot of recent activity. Updated after every major write. Sections: Recent Activity, Active Threads, Key Takeaways, Flagged Contradictions.

## Page Template

```markdown
---
title: Page Title
category: concepts
tags: [ml, architecture]
aliases: [alternate name]
relationships:
  - target: "[[concepts/related-concept]]"
    type: extends
sources: [papers/attention.pdf]
summary: One or two sentences, ≤200 chars, so a reader can preview this page without opening it.
provenance:
  extracted: 0.72
  inferred: 0.25
  ambiguous: 0.03
base_confidence: 0.65
lifecycle: draft
lifecycle_changed: 2024-03-15
tier: supporting
created: 2024-03-15T10:30:00Z
updated: 2024-03-15T10:30:00Z
---

# Page Title

One-paragraph summary of what this page covers.

## Key Ideas

- The source's central claim, paraphrased directly.
- A generalization the source implies but doesn't state outright. ^[inferred]
- A figure two sources disagree on. ^[ambiguous]

Use [[wikilinks]] to connect to related pages.

## Open Questions

Things that are unresolved or need more sources.

## Sources

- [[references/attention-is-all-you-need]] — Original paper
```

## Paper Deep-Dive Template

For ML/AI/LLM papers landing in `references/` — use this instead of the generic template. The substance lives in the architecture, equations, and results table.

````markdown
---
# ...required frontmatter, same as generic template; category: references...
---

# Paper Title

> [!tldr] One sentence: what's new, plus the headline result.

## Problem & Motivation

What's broken or missing that this paper addresses.

## Method / Architecture

Prose walkthrough. Embed the paper's real architecture figure (see *Academic papers* in `wiki-ingest`). Fall back to Mermaid only when no figure can be extracted.

![[attachments/<slug>-fig1.png]]
*Figure N (Author Year): one-line caption.*

## Key Equations

The 1–3 core equations as display math:
$$ \mathcal{L} = \mathbb{E}_{x}\!\left[-\log p_\theta(y \mid z)\right] $$

## Results

| Method | Benchmark | Metric | Cost |
|---|---|---|---|
| Baseline | … | … | … |
| **This paper** | … | … | … |

## Limitations

What the paper concedes or sidesteps. Mark reading-between-the-lines as ^[inferred].

## Related

Typed `[[wikilinks]]` to neighbouring work.
````

## Provenance Markers

Every claim on a wiki page has one of three provenance states:

| State | Marker | Meaning |
|---|---|---|
| **Extracted** | *(no marker — default)* | A paraphrase of something a source actually says. |
| **Inferred** | `^[inferred]` suffix | An LLM-synthesized claim — a connection, generalization, or implication the source doesn't state directly. |
| **Ambiguous** | `^[ambiguous]` suffix | Sources disagree, or the source is unclear. |

**Frontmatter summary:** Surface the rough mix at the page level:
```yaml
provenance:
  extracted: 0.72
  inferred: 0.25
  ambiguous: 0.03
```

## Typed Relationships

The optional `relationships:` frontmatter block adds typed, directional edges to the knowledge graph.

```yaml
relationships:
  - target: "[[concepts/transformer-architecture]]"
    type: extends
  - target: "[[concepts/lstm]]"
    type: contradicts
```

### Allowed relationship types

| Type | Meaning |
|---|---|
| `extends` | This page builds on or generalises the target |
| `implements` | This page is a concrete realisation of the target concept |
| `contradicts` | This page's claims conflict with or refute the target |
| `derived_from` | This page is based on or adapted from the target |
| `uses` | This page depends on or relies on the target |
| `replaces` | This page supersedes or deprecates the target |
| `related_to` | Catch-all: related but no stronger directional type applies |

Rules: optional field; don't duplicate body wikilinks; direction matters; always use wikilink format for `target` regardless of `OBSIDIAN_LINK_FORMAT`.

## Confidence and Lifecycle

```yaml
base_confidence: 0.65          # [0.0, 1.0]
lifecycle: draft               # draft | reviewed | verified | disputed | archived
lifecycle_changed: 2024-03-15  # ISO date of last state transition
```

### Confidence formula

```
base_confidence = source_count_score * 0.5 + source_quality_score * 0.5
source_count_score   = min(distinct_source_ids / 3, 1.0)
source_quality_score = avg(quality score per distinct source_id)
```

Source quality scores: `paper`=1.0, `official`=0.9, `documentation`=0.85, `book`=0.8, `repository`=0.75, `blog`=0.55, `session_transcript`=0.5, `forum`=0.4, `unknown`=0.4, `llm_generated`=0.3

### Lifecycle state machine

Five states. **`stale` is not a state** — computed overlay: `is_stale = (today − updated) > 90 days`.

| State | Entered by |
|---|---|
| `draft` | Any ingest skill on first write |
| `reviewed` | Human edit only |
| `verified` | Human edit only |
| `disputed` | Manual edit only |
| `archived` | Manual edit, or ingest skill setting `superseded_by` |

## Importance Tiering

| Tier | Ingest behavior | Query priority |
|---|---|---|
| `core` | Always update if marginally relevant | Surfaced first |
| `supporting` *(default)* | Update when source has clear new claims | Standard |
| `peripheral` | Skip unless source is primarily about this topic | Last resort |

- **Promote to `core`:** ≥5 incoming wikilinks OR top-5 bridge position
- **Demote to `peripheral`:** ≤1 incoming link AND not updated in 90+ days
- Human override always wins

## Retrieval Primitives

| Need | Primitive | Cost |
|---|---|---|
| Does a page exist? What's its title/category/tags? | Read `index.md`; `Grep` frontmatter | **Cheapest** |
| 1–2 sentence preview | Read the `summary:` field in frontmatter | **Cheap** |
| A specific claim or section | `Grep -A <n> -B <n> "<term>" <file>` | **Medium** |
| Whole-page content | `Read <file>` | **Expensive** — last resort |

The rule: escalate only when the cheaper primitive can't answer the question.

## Link Format

Controlled by `OBSIDIAN_LINK_FORMAT` (default: `wikilink`):

| Setting | Syntax | Example |
|---|---|---|
| `wikilink` *(default)* | `[[path/to/page]]` or `[[path/to/page\|display]]` | `[[concepts/foo\|foo]]` |
| `markdown` | `[display text](relative/path.md)` | `[foo](../concepts/foo.md)` |

Always use wikilink format for `target` values in `relationships:` frontmatter — `OBSIDIAN_LINK_FORMAT` controls body links only.

## Config Resolution Protocol

All skills must resolve config using this algorithm:

1. **Walk up from CWD** — look for `.env` with `OBSIDIAN_VAULT_PATH` in current dir, then each parent, up to `$HOME`
2. **Global config** — if no local `.env`, read `~/.obsidian-wiki/config`
3. **Prompt setup** — if neither exists: "No config found. Run `/wiki-setup` to initialize your wiki."

```bash
find_config() {
  dir="$PWD"
  while [[ "$dir" != "$HOME" && "$dir" != "/" ]]; do
    [[ -f "$dir/.env" ]] && grep -q "OBSIDIAN_VAULT_PATH" "$dir/.env" && { echo "$dir/.env"; return; }
    dir="$(dirname "$dir")"
  done
  [[ -f "$HOME/.obsidian-wiki/config" ]] && { echo "$HOME/.obsidian-wiki/config"; return; }
  echo ""
}
```

## Environment Variables

- `OBSIDIAN_VAULT_PATH` — Where the wiki lives **(required)**
- `OBSIDIAN_SOURCES_DIR` — Where raw source documents are
- `OBSIDIAN_LINK_FORMAT` — `wikilink` (default) or `markdown`
- `WIKI_TOKEN_WARN_THRESHOLD` — Warn in `wiki-status` when full-wiki token estimate exceeds this (default: `100000`; `0` to disable)
- `WIKI_STAGED_WRITES` — When `true`, all LLM-written pages go to `_staging/<category>/` for review
- `WIKI_SKIP_PROJECTS` — Comma-separated substrings to exclude from history ingest
- `QMD_WIKI_COLLECTION` — QMD collection name for semantic search (optional)
- `QMD_TRANSPORT` — `mcp` (default) or `cli`
- `QMD_CLI` — Path to `qmd` CLI (default: `qmd`)
- `QMD_CLI_SEARCH_MODE` — `quality` (default), `balanced`, or `fast`

## Core Principles

1. **Compile, don't retrieve.** The wiki is pre-compiled knowledge — update every relevant page when ingesting a source.
2. **Compound over time.** Each ingest makes the wiki smarter, not just bigger.
3. **Provenance matters.** Every claim should trace to a source. Mark inferences.
4. **Human curates, LLM maintains.** The human decides what sources to add; the LLM handles bookkeeping.
5. **Obsidian is the IDE.** Everything must be valid Obsidian markdown with working wikilinks.
