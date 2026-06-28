---
name: wiki-status
description: Show the current state of the wiki — ingested sources, source/wiki delta, token footprint, and a ranked "What to Do Next" list. Insights mode (triggered by "wiki insights") analyzes hub pages, bridge pages, tag cohesion, and writes _insights.md.
when_to_use: Use when the user asks "what's the status", "how much is ingested", "wiki dashboard", "what's pending", or wants an overview before deciding append vs rebuild.
argument-hint: "[--insights | --full]"
allowed-tools: Read Bash Write
---
# Wiki Status — Audit & Delta

You are computing the current state of the wiki: what's been ingested, what's new since last ingest, and what the delta looks like. This helps the user decide whether to append (ingest the delta) or rebuild (archive and reprocess everything).

## Before You Start

1. **Resolve config** — follow the Config Resolution Protocol in `${CLAUDE_SKILL_DIR}/../wiki-meta/SKILL.md` (walk up CWD for `.env` → `~/.obsidian-wiki/config` → prompt setup). This gives `OBSIDIAN_VAULT_PATH`, `OBSIDIAN_SOURCES_DIR`, `CLAUDE_HISTORY_PATH`, and `CODEX_HISTORY_PATH`.
2. Read `.manifest.json` at the vault root — this is the ingest tracking ledger

## The Manifest

The manifest lives at `$OBSIDIAN_VAULT_PATH/.manifest.json`. It tracks every source file that has been ingested. If it doesn't exist, this is a fresh vault with nothing ingested.

> **Source keys are canonical absolute paths** (`~` and env vars expanded). Never mix `~`-relative and absolute keys — the same file would be tracked twice and re-ingested. Repair a mixed manifest with `scripts/manifest.py normalize <vault>`.

```json
{
  "version": 1,
  "last_updated": "2026-04-06T10:30:00Z",
  "sources": {
    "/absolute/path/to/file.md": {
      "ingested_at": "2026-04-06T10:30:00Z",
      "size_bytes": 4523,
      "modified_at": "2026-04-05T08:00:00Z",
      "source_type": "document",
      "project": null,
      "pages_created": ["concepts/transformers.md"],
      "pages_updated": ["entities/vaswani.md"]
    }
  },
  "projects": {
    "my-app": {
      "source_path": "/Users/name/.claude/projects/-Users-name-my-app",
      "vault_path": "projects/my-app",
      "last_ingested": "2026-04-06T11:00:00Z",
      "conversations_ingested": 5,
      "conversations_total": 8,
      "memory_files_ingested": 3
    }
  },
  "stats": {
    "total_sources_ingested": 42,
    "total_pages": 87,
    "total_projects": 6,
    "last_full_rebuild": null
  }
}
```

## Step 1: Scan Current Sources

Build an inventory of everything available to ingest right now:

### Documents (from `OBSIDIAN_SOURCES_DIR`)
```
Glob each directory in OBSIDIAN_SOURCES_DIR for all text files
Record: path, size, modification time
```

### Claude History (from `CLAUDE_HISTORY_PATH`)
```
Glob: ~/.claude/projects/*/          → project directories
Glob: ~/.claude/projects/*/*.jsonl   → conversation files
Glob: ~/.claude/projects/*/memory/*.md → memory files
```

### Codex History (from `CODEX_HISTORY_PATH`)
```
Glob: ~/.codex/session_index.jsonl
Glob: ~/.codex/sessions/**/rollout-*.jsonl
Glob: ~/.codex/history.jsonl
```

### Any other sources the user has pointed at previously
Check the manifest for source paths outside the standard directories.

## Step 2: Compute the Delta

Compare current sources against the manifest. Classify each source file:

| Status | Meaning | Action needed |
|---|---|---|
| **New** | File exists on disk, not in manifest | Needs ingesting |
| **Modified** | File in manifest, hash differs from `content_hash` | Needs re-ingesting |
| **Touched** | File in manifest, mtime newer but hash unchanged | Skip — content identical |
| **Unchanged** | File in manifest, mtime and hash both match | Nothing to do |
| **Deleted** | In manifest, but file no longer exists on disk | Note it — wiki pages may be stale |

When a manifest entry has no `content_hash` (older entry), fall back to mtime comparison only.

## Step 3: Report the Status

**Visibility tally (before rendering the report):** Grep frontmatter across all vault `.md` pages for `visibility/internal` and `visibility/pii` tag values. Count: public (no `visibility/` tag or `visibility/public`), internal, pii.

```markdown
# Wiki Status

## Overview
- **Total wiki pages:** 87 across 6 categories
- **Page visibility:** 72 public · 11 internal · 4 pii
- **Total sources ingested:** 42
- **Projects tracked:** 6
- **Last ingest:** 2026-04-06T11:00:00Z
- **Staged writes pending:** 4 pages · 2 patches (oldest: 3 days ago)  ← only when WIKI_STAGED_WRITES=true

## Delta (what's changed since last ingest)

### New sources (never ingested): 12
| Source | Type | Size |
|---|---|---|
| ~/Documents/research/new-paper.pdf | document | 2.1 MB |
| ~/.claude/projects/.../session-xyz.jsonl | claude_conversation | 340 KB |

### Modified sources (need re-ingesting): 3
| Source | Last ingested | Last modified | Delta |
|---|---|---|---|
| ~/notes/architecture.md | 2026-04-01 | 2026-04-05 | 4 days newer |

### New projects (not yet in wiki): 2
- **tractorex** (3 conversations, 2 memory files)
- **papertech** (1 conversation, 0 memory files)

### Deleted sources (ingested but gone): 0

## Summary
- **Ready to ingest:** 12 new + 3 modified = 15 sources
- **Up to date:** 27 sources unchanged
- **Recommendation:** Append (delta is small relative to total)
```

## Step 3b: Compute Token Footprint

1. Glob all `.md` pages. Read the `tier:` frontmatter field of each (cheap grep). Group pages by tier.
2. Estimate tokens as `file_size_bytes / 4` (4 chars/token heuristic). Sum per tier and total.
3. Index-only estimate: sum `len(title) + len(summary) + len(tags)` per page frontmatter (~100 chars each), divided by 4.
4. Typical query estimate: index-only estimate + average full-read cost of 5 pages.
5. Read `WIKI_TOKEN_WARN_THRESHOLD` from config (default: `100000`; `0` = disable). If full-wiki token estimate exceeds the threshold, emit a `⚠️` warning.

```markdown
## Token Footprint (estimated)

| Scope | Pages | ~Tokens |
|---|---|---|
| core tier | 12 | 18,400 |
| supporting tier | 87 | 94,200 |
| peripheral tier | 43 | 31,600 |
| **Full wiki (all)** | **142** | **144,200** |

Index-only pass (frontmatter + summaries): ~8,900 tokens
Typical query (index + 5 full pages):      ~14,200 tokens

⚠️  Full wiki exceeds 100K tokens. Consider:
  - Demoting peripheral pages (promote tier suggestions from wiki-status insights mode)
  - Running /wiki-lint --consolidate to merge near-duplicates
  - Using wiki-query fast mode for most queries
```

## Step 4: What to Do Next

### 4a: Gather signals

0. **Staged writes pending** (only when `WIKI_STAGED_WRITES=true`) — Glob `$OBSIDIAN_VAULT_PATH/_staging/**/*.md` and `**/*.patch.md`. This is always listed first if any staged files exist.

1. **`_raw/` files** — list every file in `$OBSIDIAN_VAULT_PATH/_raw/` that isn't a `.gitkeep`. Count and name them.

2. **Stale core pages** — pages where `updated` ≥90 days before today AND ≥5 incoming wikilinks. List by name + last-updated date.

3. **Orphan pages** — pages with zero incoming wikilinks. Show up to 5 names; report total count.

4. **Synthesis opportunities** — check `hot.md` for any recent `/wiki-synthesize` run. If no synthesis has run recently (not in `hot.md` or `log.md` within last 14 days), flag "synthesis scan overdue".

5. **Source delta** — count of new + modified sources ready to ingest.

6. **Lint issues** — check `log.md` for a recent `/wiki-lint` run (within last 30 days). If no recent run, flag "lint not run recently".

### 4b: Rank and render

Score each category and emit a ranked list, **capped at 6 items**. Always rank in this priority order:

| Priority | Category | Trigger |
|---|---|---|
| 0 | Staged writes pending | Any files in `_staging/` (only when `WIKI_STAGED_WRITES=true`) |
| 1 | `_raw/` files waiting | Any files present in `_raw/` |
| 2 | Stale core pages | Any page: updated ≥90 days ago AND ≥5 incoming links |
| 3 | Orphan pages | Any pages with zero incoming wikilinks |
| 4 | Synthesis opportunities | N opportunities from last run, OR scan overdue |
| 5 | New/modified sources | Count from delta in Step 2 |
| 6 | Lint issues | Known issues from last lint run, OR lint overdue |

```markdown
## What to Do Next

0. 📋  6 staged pages waiting for review (oldest: 3 days ago)
   → 4 new pages + 2 patches in _staging/
   run: /wiki-stage-commit

1. 📥  Ingest 3 files waiting in _raw/
   → architecture-notes.md, meeting-2026-05-10.md, paper-draft.pdf
   run: /wiki-ingest

2. 🔄  Refresh 2 stale core pages (not updated in 90+ days)
   → [[System Architecture]] (last updated 2026-02-10), [[API Design]] (2026-01-15)

3. 🔗  Link 7 orphan pages  →  run: /wiki-cross-link
   Disconnected: [[Redis Caching]], [[JWT Tokens]], +5 more

4. 🧩  2 synthesis opportunities identified  →  run: /wiki-synthesize
   [[Redis Caching]] × [[Session Management]] (co-occur in 8 pages)

5. ✅  4 sources modified since last ingest  →  run: /wiki-ingest (append mode)

6. 🩺  Lint not run in 30+ days — run: /wiki-lint
```

**Empty state:** If all categories have nothing to report:
```markdown
## What to Do Next

✅  Wiki is healthy — nothing urgent.
    All sources up to date · no orphans · no stale core pages · no _raw/ files pending · no staged writes
```

**Overflow:** If more than 6 items would be shown, add: `_(N more items available — run /wiki-status --full to see all)_`

## Insights Mode

Triggered when the user asks something like "wiki insights", "what's central in my wiki", "show me the hubs", "cross-domain bridges", or "wiki structure".

This mode is *additive* — it doesn't replace the delta report. It analyzes the *shape* of the wiki itself.

### What to compute

**First, build the wikilink graph.** Glob all `.md` pages, extract every `[[wikilink]]`, and build `incoming[page]`, `outgoing[page]`, `tags[page]`, `category[page]`.

**1. Anchor pages (top hubs).** Pages with the most incoming links. Rank by `incoming` count, take top 10. Note: high incoming + high outgoing = connector hub. High incoming + zero outgoing = sink hub (flag as cross-link candidate).

**2. Bridge pages.** Pages that connect otherwise-disconnected tag clusters — removing them would partition the graph. For each page P, find pairs (A, B) where A links to P, B is linked from P, A and B share no tags, and P is the only path between them within 2 hops. Rank by cross-cluster pairs bridged; show top 5. Label each: "`P` bridges `[tag-cluster-A]` ↔ `[tag-cluster-B]`".

**3. Tag cluster cohesion.** For each tag with ≥ 5 pages:
- `n` = number of pages with this tag
- `actual_links` = count of wikilinks between any two pages in this tag group
- `cohesion = actual_links / (n × (n−1) / 2)`
- Flag clusters where cohesion < 0.15 and n ≥ 5
- Show top 5 (most cohesive) and bottom 5 (most fragmented)

**4. Surprising connections.** Cross-category wikilinks scored by unexpectedness:
- +3 if the claim is `^[ambiguous]`
- +2 if the claim is `^[inferred]`
- +2 if categories are in different knowledge layers
- +2 if source page has ≤ 2 total links (peripheral) but target has ≥ 8 (hub)
- Show top 5 with plain-language reasons

**5. Orphan-adjacent suggestions.** Pages linked from a top-10 hub but with zero outgoing links of their own. Dead-ends in high-traffic areas — prime cross-link candidates.

**6. Rough clusters.** Group anchor pages by dominant tag.

**7. Graph delta since last run.** Compare to snapshot in previous `_insights.md` (the `<!-- GRAPH_SNAPSHOT: ... -->` HTML comment at the bottom). Flag newly connected pages and pages that lost incoming links.

**8. Tier assignment suggestions.** After computing hubs and bridges, recommend `tier:` changes. Never write `tier:` to pages — only surface suggestions.
- Promote to `core`: pages with ≥5 incoming links OR top-5 bridge position that currently have `tier: supporting` or no `tier:` field
- Demote to `peripheral`: pages with ≤1 incoming link AND not updated in 90+ days that currently have `tier: supporting`
- Show up to 10 suggestions (promotions first, then demotions)

**9. Suggested questions.** Up to 7 questions uniquely answerable by this wiki structure, or that reveal gaps:
- From `^[ambiguous]` claims: "Resolve: What is the exact relationship between X and Y?"
- From bridge pages: "Explore: Why does P connect [cluster-A] to [cluster-B]?"
- From pages with zero incoming links: "Link: X has no incoming links — what should reference it?"

### Output

Write the result to `_insights.md` at the vault root (overwrite freely — it's regenerable). At the very end, embed a compact graph snapshot as an HTML comment so the next run can diff against it:

```markdown
# Wiki Insights — <TIMESTAMP>

## Anchor Pages (top 10 hubs)
| Page | Incoming | Outgoing | Note |
|---|---|---|---|
| [[concepts/transformer-architecture]] | 23 | 8 | connector hub |
| [[entities/andrej-karpathy]] | 17 | 0 | sink hub — cross-link candidate |

## Bridge Pages (top 5)
| Page | Bridges | Cross-cluster pairs |
|---|---|---|
| [[concepts/exponential-growth]] | #ml ↔ #economics | 4 pairs |

## Tag Cluster Cohesion
### Most cohesive
- **#ml** — 12 pages, cohesion 0.41
### Most fragmented (cross-link targets)
- **#systems** — 7 pages, cohesion 0.06 ⚠️ run wiki-cross-link on this tag

## Surprising Connections (top 5)
- [[concepts/scaling-laws]] → [[entities/gordon-moore]] — score 5
  - Reason: cross-layer (concepts ↔ entities), marked ^[inferred]

## Orphan-Adjacent (dead-ends near hubs)
- [[concepts/foo]] — linked from 3 hubs, 0 outbound links

## Rough Clusters
- **#ml** — transformer-architecture, attention-mechanism, scaling-laws

## Graph Delta Since Last Run
- +3 new pages, +11 new wikilinks
- Newly connected: [[concepts/bar]], [[entities/baz]]
- Lost incoming links: [[references/old-paper]] (target may have been renamed)

## Tier Suggestions
↑ core    [[concepts/attention-mechanism]] — 14 incoming links, currently tier=supporting
↓ peripheral [[concepts/old-concept]]       — 0 incoming, 132 days stale

## Questions Worth Asking
1. Resolve: What is the exact relationship between `scaling-laws` and `moore's-law`?
2. Explore: Why does `exponential-growth` bridge #ml and #economics?
3. Link: `references/foo.md` has no incoming links — what should reference it?

<!-- GRAPH_SNAPSHOT: {"nodes":["concepts/foo","entities/bar"],"edges":[["concepts/foo","entities/bar"]]} -->
```

After writing the file, append to `log.md`:
```
- [TIMESTAMP] STATUS_INSIGHTS anchors=10 bridges=N cohesion_checked=T surprising=5 questions=7 delta="+N pages +M links" tier_suggestions=N
```

### When to skip insights mode

- Vaults with fewer than 20 pages — not enough graph structure. Tell the user and skip.
- After a fresh `wiki-rebuild` — wait until at least one ingest has happened.

## Notes

- If the manifest doesn't exist, report everything as "new" and recommend a full ingest
- This skill only reads and reports — it doesn't modify anything (except writing `_insights.md` in insights mode, which is regenerable)
- The actual ingest work is done by `wiki-ingest`, `claude-history-ingest`, `codex-history-ingest` — those skills are responsible for updating the manifest after they finish

## QMD Refresh

If `$QMD_WIKI_COLLECTION` is set: after vault writes (insights mode only) run `${QMD_CLI:-qmd} update` (then `embed` if vectors are stale). Record the outcome; failure does not roll back vault changes.
