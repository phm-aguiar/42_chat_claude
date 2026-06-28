---
name: wiki-cross-link
description: Scan the Obsidian wiki and automatically insert missing [[wikilinks]] between pages that should reference each other. Scores candidate links (EXTRACTED/INFERRED/AMBIGUOUS), writes typed relationships blocks, and updates misc/ page affinity scores.
when_to_use: Use when the user says "link my pages", "find missing links", "connect my wiki", or after any large ingestion to weave new pages into the existing knowledge graph.
disable-model-invocation: true
allowed-tools: Read Bash Write Edit
---
# Cross-Linker — Automated Wiki Cross-Referencing

You are weaving the wiki's knowledge graph tighter by finding and inserting missing `[[wikilinks]]` between pages that should reference each other but currently don't.

**Follow the Retrieval Primitives table in `${CLAUDE_SKILL_DIR}/../wiki-meta/SKILL.md`.** Build the registry in Step 1 by grepping frontmatter only (not full pages). Reserve full `Read` for the unlinked-mention detection pass, and even there, only read pages whose summaries/titles make them plausible link targets.

## Before You Start

1. **Resolve config** — follow the Config Resolution Protocol in `${CLAUDE_SKILL_DIR}/../wiki-meta/SKILL.md` (walk up CWD for `.env` → `~/.obsidian-wiki/config` → prompt setup). This gives `OBSIDIAN_VAULT_PATH` and `OBSIDIAN_LINK_FORMAT` (default: `wikilink`).
2. Read `index.md` to get the full inventory of pages and their one-line descriptions
3. Skim `log.md` to see what was recently ingested (focus linking effort on new pages)

When inserting links in Step 4, apply the link format from `${CLAUDE_SKILL_DIR}/../wiki-meta/SKILL.md` (Link Format section) using the `OBSIDIAN_LINK_FORMAT` value. When `OBSIDIAN_LINK_FORMAT=markdown`, compute the relative `.md` path from the **file being edited** to the target page.

## Step 1: Build the Page Registry

Glob all `.md` files in the vault (excluding `_archives/`, `.obsidian/`). For each page, extract:

- **Filename** (without `.md`) — this is the wikilink target
- **Title** from frontmatter
- **Aliases** from frontmatter (if any)
- **Tags** from frontmatter
- **Category** from frontmatter or directory inference
- **One-line summary** — first sentence or `title` field

Build a lookup table:

```
page_name → { path, title, aliases, tags, summary }
```

This is your "vocabulary" — every entry in this table is a valid wikilink target.

## Step 2: Scan for Missing Links

For each page in the vault:

1. **Read the full content**
2. **Extract existing wikilinks** — find all `[[...]]` references already present
3. **Search for unlinked mentions** — check if the page's text contains any of these, without being wrapped in `[[...]]`:
   - Page filenames, page titles from frontmatter, aliases from frontmatter
   - Entity names, project names, concept names from the registry

4. **Check for semantic connections** — pages that share multiple tags or are in the same project directory but don't link to each other

### Matching Rules

- **Case-insensitive matching** for names
- **Diacritic-insensitive matching** — normalize with Unicode NFKD before comparing
- **Skip self-references** — a page shouldn't link to itself
- **Skip common words** — only match on distinctive names
- **Prefer the shortest unambiguous wikilink path**
- **Don't link inside code blocks** or frontmatter
- **Don't double-link** — if `[[foo]]` already appears on the page, don't add another

## Step 3: Score and Rank Suggestions

| Signal | Points | Example |
|---|---|---|
| **Exact name match in text** | +4 | "MyProject" appears in body text → link to my-project.md |
| **Shared tags (2+)** | +2 | Both tagged `#ai #agent` but no link between them |
| **Same project, no link** | +2 | Both under `projects/my-project/` but don't reference each other |
| **Mentioned entity/concept** | +2 | Page mentions "knowledge graphs" → link to `[[concepts/knowledge-graphs]]` |
| **Cross-category connection** | +2 | Source is in `concepts/`, target is in `entities/` — different knowledge layers |
| **Peripheral→hub reach** | +2 | Source page has ≤ 2 total links (peripheral) but target has ≥ 8 (hub) |
| **Partial name match** | +1 | "graph" appears but page is `knowledge-graphs` — plausible but ambiguous |

### Confidence labels

| Score | Label | Action |
|---|---|---|
| ≥ 6 | **EXTRACTED** | Certain — apply inline. |
| 3–5 | **INFERRED** | Reasonable inference — apply inline or as Related section. |
| 1–2 | **AMBIGUOUS** | Skip unless user specifically asks. |

Only act on **EXTRACTED** and **INFERRED** candidates.

## Step 4: Apply Links

### 4a: Inline linking (preferred)

Find the first natural mention of the term in the body text and wrap it in wikilinks:

**Before:**
```markdown
This project uses knowledge graphs to connect entities.
```

**After:**
```markdown
This project uses [[concepts/knowledge-graphs|knowledge graphs]] to connect entities.
```

### 4b: Related section (fallback)

If the term isn't mentioned naturally in the body but the pages are semantically related, add a `## Related` section at the bottom:

```markdown
## Related

- [[projects/my-project/my-project]] — Also uses AI agents for research automation
- [[concepts/knowledge-graphs]] — Core technique used in this project
```

If a `## Related` section already exists, append to it. Don't duplicate existing entries.

### 4c: Infer and write relationship type

For every EXTRACTED or INFERRED link added, infer a semantic relationship type from the surrounding sentence context and write it to the page's `relationships:` frontmatter block.

**Type inference rules:**

| Sentence pattern | Inferred type |
|---|---|
| "X extends / builds on / generalises Y" | `extends` |
| "X implements / is an implementation of Y" | `implements` |
| "X contradicts / opposes / refutes Y" | `contradicts` |
| "X is derived from / based on / adapted from Y" | `derived_from` |
| "X uses / relies on / depends on / requires Y" | `uses` |
| "X replaces / supersedes / deprecates Y" | `replaces` |
| Shared tags or cross-category inference with no directional cue | `related_to` |

Always use wikilink format (`[[path/to/page]]`) for `target` values in the `relationships:` YAML block — regardless of `OBSIDIAN_LINK_FORMAT`. The `OBSIDIAN_LINK_FORMAT` setting controls body content only; frontmatter properties always use wikilink syntax.

Read the page's YAML frontmatter. If a `relationships:` block already exists, append new entries without duplicating existing targets.

## Step 5: Score Misc Page Affinity

After the main linking pass, update affinity scores for all pages in `misc/`.

For each misc page:
1. **Collect outgoing links** — all `[[wikilinks]]` in the page body
2. **Collect incoming links** — grep the vault for `[[misc/<slug>]]` references
3. For each linked page, check if it belongs to a project
4. Group by project name and sum: `outgoing_links + incoming_links`
5. Update the `affinity` frontmatter block on the misc page:

```yaml
affinity:
  obsidian-wiki: 3
  another-project: 1
```

6. If any project's score ≥ 3: flag this page as a **promotion candidate**

## Step 6: Report

```markdown
## Cross-Link Report

### Links Added: 23 across 12 pages

| Page | Links Added | Confidence | Placement | Relationship Types |
|---|---|---|---|---|
| `projects/my-project/my-project.md` | 3 | EXTRACTED | 2 inline, 1 related | uses ×2, related_to ×1 |

### Orphan Pages Remaining: 2
- `references/foo.md` — no incoming or outgoing links found

### Misc Promotion Candidates: N
| Page | Top Project | Score |
|---|---|---|
| `misc/web-martinfowler-articles-microservices.md` | `obsidian-wiki` | 4 |

### Pages Skipped: 3
- `index.md`, `log.md` — special files
- `_archives/*` — archived content
```

## Step 7: Update Log and Hot Cache

Append to `log.md`:
```
- [TIMESTAMP] CROSS_LINK pages_scanned=N links_added=M typed_relations_written=T pages_modified=P orphans_remaining=Q misc_affinity_updated=R promotion_candidates=S
```

**`hot.md`** — Update **Recent Activity** with a one-line summary — e.g. "Cross-linked 23 mentions across 12 pages; 2 orphans remain." Keep the last 3 operations. Update `updated` timestamp.

## Tips

- **Run after every ingest.** New pages are almost always poorly connected. This is the fix.
- **Be conservative with inline links.** Only link the first natural mention, not every occurrence.
- **Don't touch pages in `_archives/`.** Those are frozen snapshots.
- **Entity pages are link magnets.** An entity should be linked from almost every project page — prioritize these.

## QMD Refresh

If `$QMD_WIKI_COLLECTION` is set: after vault writes run `${QMD_CLI:-qmd} update` (then `embed` if vectors are stale). Record the outcome; failure does not roll back vault changes.
