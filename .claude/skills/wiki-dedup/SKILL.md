---
name: wiki-dedup
description: Detect and merge wiki pages that cover the same concept under different names — identity resolution. Audit mode reports candidates only; --merge confirms interactively; --auto merges high-confidence pairs non-interactively. Distinct from wiki-lint (structure) and wiki-cross-link (adds links).
when_to_use: Use when the user says "dedup my wiki", "find duplicate pages", "merge duplicates", "identity resolution", or "my wiki has two pages for the same thing".
argument-hint: "[--merge | --auto]"
disable-model-invocation: true
allowed-tools: Read Bash Write Edit
---
# Wiki Dedup — Identity Resolution and Page-Level Deduplication

You are finding and merging wiki pages that cover the same concept under different names. This is a write-heavy, potentially destructive skill — page merges cannot be automatically undone. Work carefully and confirm before acting in merge mode.

**Follow the Retrieval Primitives table in `${CLAUDE_SKILL_DIR}/../wiki-meta/SKILL.md`.** The candidate-detection pass uses only frontmatter and titles (cheap). Only open full page bodies for confirmed candidate pairs.

## Before You Start

1. **Resolve config** — follow the Config Resolution Protocol in `${CLAUDE_SKILL_DIR}/../wiki-meta/SKILL.md` (walk up CWD for `.env` → `~/.obsidian-wiki/config` → prompt setup). This gives `OBSIDIAN_VAULT_PATH` and `OBSIDIAN_LINK_FORMAT`.
2. Read `index.md` to get the full page inventory with one-line descriptions and tags.
3. Read `log.md` briefly — if a dedup run just happened, note what was already merged.

## Modes

| Mode | Flag | Behavior |
|---|---|---|
| **Audit** | *(default)* | Report candidates only — no writes |
| **Merge** | `--merge` | Show each confirmed pair, ask for confirmation before merging |
| **Auto-merge** | `--auto` | Merge all high-confidence pairs (`score ≥ 0.90`) non-interactively |

If the user doesn't specify, run in **Audit** mode and present findings before asking whether to proceed.

## Step 1: Build the Page Registry

Glob all `.md` files in the vault (excluding `_archives/`, `_raw/`, `.obsidian/`, `index.md`, `log.md`, `hot.md`, `_insights.md`, and any file that contains `redirects_to:` in its frontmatter — those are already merged redirect stubs).

For each remaining page, extract from frontmatter:
- `node_id` — relative path from vault root, without `.md`
- `title` — frontmatter `title` field
- `aliases` — frontmatter `aliases` list (may be absent)
- `tags` — frontmatter `tags` list
- `category` — directory prefix

Build a lookup table: `node_id → {title, aliases, tags, category, summary}`.

## Step 2: Detect Candidate Pairs

For every pair of pages in the registry, compute a **similarity score** using these signals:

### 2a. Title similarity signals

| Signal | How to assess | Max contribution |
|---|---|---|
| **Token overlap** | Jaccard similarity of lowercased title word-tokens | 0.65 |
| **Edit distance** | Normalized edit distance: `1 - (edits / max(len_a, len_b))` | 0.40 |
| **Substring containment** | One title is a substring of the other | 0.50 |
| **Alias cross-match** | Page A's title appears in page B's `aliases`, or vice versa | 0.65 |

**Title extraction note:** Some pages use YAML block scalars (`title: >-` or `title: |`). When `title:` is `>-`, `>`, `|`, or `|-`, the actual title is on the next indented line. Never compare the literal string `>-` as a title.

### 2b. Semantic signals (cheap pass)

| Signal | Points |
|---|---|
| Same `category` directory | +0.10 |
| Tag overlap ≥ 3 shared tags | +0.15 |
| Tag overlap ≥ 2 shared tags | +0.05 |
| Same first tag (dominant tag) | +0.05 |

### 2c. Threshold

Flag pairs with composite score ≥ **0.75** as **candidates**. Pairs scoring 0.90+ are **high-confidence**.

| Score | Label |
|---|---|
| ≥ 0.90 | HIGH — almost certainly the same concept |
| 0.75–0.89 | MEDIUM — likely the same, verify |
| 0.60–0.74 | LOW — possible abbreviation or specialisation; skip |

Only carry HIGH and MEDIUM candidates into Step 3.

### 2d. Quick exit rule

If the vault has fewer than 10 pages, skip the pair loop and report "vault too small to have meaningful duplicates". If the vault has more than 500 pages, process candidates in batches of 50 pairs.

## Step 3: Semantic Verdict

For each candidate pair (sorted by score descending):

1. Read both pages in full.
2. Assign one of three verdicts:

| Verdict | Meaning |
|---|---|
| `merge` | Same concept — different name, abbreviation, alias, or accidental duplicate. Safe to merge. |
| `keep-separate` | Related but distinct — e.g. "Server Actions" vs "Server Components". |
| `needs-review` | Ambiguous — substantial overlap but also meaningful differences. |

Attach a short reason to each verdict (one sentence).

## Step 4: Audit Report

```markdown
## Wiki Dedup Report

### High-Confidence Candidates (score ≥ 0.90): N pairs

| Score | Page A | Page B | Verdict | Reason |
|---|---|---|---|---|
| 0.95 | `concepts/rsc.md` | `concepts/react-server-components.md` | merge | "RSC" is the abbreviation; both pages cover identical material |

### Medium-Confidence Candidates (score 0.75–0.89): N pairs

| Score | Page A | Page B | Verdict | Reason |
|---|---|---|---|---|
| 0.82 | `concepts/fine-tuning.md` | `concepts/finetuning.md` | merge | Same concept, hyphenation variant |

### Needs Human Review: N pairs

| Score | Page A | Page B | Reason |
|---|---|---|---|
| 0.78 | `concepts/agents.md` | `concepts/autonomous-agents.md` | Substantial overlap but "agents" may intentionally be broader |

### Summary
- Pages scanned: N
- Candidate pairs found: M
- Recommended merges: X
- Keep separate: Y
- Needs review: Z
```

In **Audit mode**, stop here and ask: "Run `--merge` to interactively merge the recommended pairs, or `--auto` to merge all high-confidence ones automatically?"

## Step 5: Merge

For each `merge` verdict pair:

In **merge mode**: show the pair and ask: "Merge `[Page A]` into `[Page B]`? (yes/skip/review)". Skip on anything other than yes.

In **auto-merge mode**: only process HIGH-confidence (`score ≥ 0.90`) merges without prompting.

### 5a: Pick the canonical page

Apply these tiebreakers in order until one wins:

1. **More incoming wikilinks** — grep the vault for `[[node_id]]` references; higher count wins
2. **Richer content** — longer page body (more lines) wins
3. **More sources** — larger `sources:` list wins
4. **Title length** — longer, more descriptive title wins (e.g. "React Server Components" beats "RSC")
5. **Alphabetical** — earlier title wins

### 5b: Merge content into the canonical page

Read both pages. Update the canonical page:

- **`aliases:`** — add secondary page's title and all its aliases (no duplicates)
- **`tags:`** — merge both tag lists (deduplicate, cap at 5 domain tags + system tags)
- **`sources:`** — merge both source lists (deduplicate)
- **`relationships:`** — merge both relationship lists (deduplicate by target, prefer typed over untyped)
- **`base_confidence`** — recompute using the union of sources and the formula from `${CLAUDE_SKILL_DIR}/../wiki-meta/SKILL.md`
- **`updated`** — set to now
- **`summary:`** — rewrite to cover the merged scope if the secondary page added new ground
- **Body content** — merge unique sections and bullets from the secondary page. Integrate, don't blindly append.
- **`provenance:`** — recompute after merging

### 5c: Write a redirect stub at the secondary page path

```markdown
---
title: <secondary page title>
redirects_to: "[[<canonical node_id>]]"
aliases: [<secondary aliases>]
category: <secondary category>
tags: []
created: <secondary original created>
updated: <ISO timestamp now>
---

This page has been merged into [[<canonical page title>]].
```

### 5d: Rewrite wikilinks vault-wide

Grep the entire vault for any link pointing at the secondary slug:

- `[[secondary-slug]]` → `[[canonical-slug]]`
- `[[secondary-slug|display text]]` → `[[canonical-slug|display text]]`

**Safety rules:**
- Never rewrite inside code blocks or the redirect stub itself
- Never use `rm` or destructive shell ops — only Edit/Write tools
- Rewrite one file at a time, verifying each before moving on

### 5e: Update tracking files

**`index.md`** — Remove the secondary page's entry. Update the canonical page's entry with the merged summary.

**`.manifest.json`** — Add `"merged_into": "<canonical node_id>"` to the secondary page's source entries.

**`hot.md`** — Update Recent Activity: "Merged N duplicate pairs; canonical pages updated."

### 5f: Final check

After all merges, grep the vault for any remaining `[[secondary-slug]]` references (in non-stub files). If any survive, report them.

## Step 6: Log

Append to `log.md`:
```
- [TIMESTAMP] DEDUP mode=audit|merge|auto-merge pages_scanned=N pairs_found=M merged=X kept_separate=Y needs_review=Z wikilinks_rewritten=W
```

## Redirect Stub Handling

Other skills should handle redirect stubs as follows:

- **`wiki-export`** — skip pages with `redirects_to:` in frontmatter; they are not content nodes
- **`wiki-query`** — if a search hits a redirect stub, follow `redirects_to:` and read the canonical page instead
- **`wiki-lint`** — validate that every `redirects_to:` wikilink resolves to an existing, non-stub page
- **`wiki-cross-link`** — treat redirect stubs as non-targets; never add a new `[[wikilink]]` pointing at a stub page

## Tips

- **Audit first, always.** Even in auto-merge mode, the audit report is shown. Read it before trusting the results.
- **Abbreviations are the most common case.** "GPT" / "GPT-4", "RSC" / "React Server Components" — these score high on substring containment and are almost always safe to merge.
- **Different versions are not duplicates.** "GPT-3" and "GPT-4" are related but distinct.
- **Run `wiki-cross-link` after dedup.** The redirect stubs leave the graph slightly inconsistent. Cross-linker will tighten it up.

## QMD Refresh

If `$QMD_WIKI_COLLECTION` is set: after vault writes run `${QMD_CLI:-qmd} update` (then `embed` if vectors are stale). Record the outcome; failure does not roll back vault changes.
