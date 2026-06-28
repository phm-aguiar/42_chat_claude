---
name: wiki-lint
description: Audit the Obsidian wiki for structural issues — orphans, broken links, missing frontmatter, stale content, contradictions, provenance drift, fragmented tag clusters, visibility issues, synthesis gaps, and more (13 checks total). Use --consolidate to switch from report-only to act-and-report dream-cycle mode.
when_to_use: Use when the user says "audit my wiki", "check vault", "what needs fixing", "wiki health check", "/wiki-lint", or "clean up the wiki".
argument-hint: "[--consolidate | --fast]"
disable-model-invocation: true
allowed-tools: Read Bash Write Edit
---
# Wiki Lint — Health Audit

You are performing a health check on an Obsidian wiki. Your goal is to find and fix structural issues that degrade the wiki's value over time.

**Before scanning anything:** follow the Retrieval Primitives table in `${CLAUDE_SKILL_DIR}/../wiki-meta/SKILL.md`. Prefer frontmatter-scoped greps and section-anchored reads over full-page reads.

## Before You Start

1. **Resolve config** — follow the Config Resolution Protocol in `${CLAUDE_SKILL_DIR}/../wiki-meta/SKILL.md` (walk up CWD for `.env` → `~/.obsidian-wiki/config` → prompt setup). This gives `OBSIDIAN_VAULT_PATH`
2. Read `index.md` for the full page inventory
3. Read `log.md` for recent activity context

## Lint Checks

Run these checks in order. Report findings as you go.

### 1. Orphaned Pages

Find pages with zero incoming wikilinks. These are knowledge islands that nothing connects to.

**How to check:**
- Glob all `.md` files in the vault
- For each page, Grep the rest of the vault for `[[page-name]]` references
- Pages with zero incoming links (except `index.md` and `log.md`) are orphans

**How to fix:**
- Identify which existing pages should link to the orphan
- Add wikilinks in appropriate sections

### 2. Broken Wikilinks

Find `[[wikilinks]]` that point to pages that don't exist.

**How to check:**
- Grep for `\[\[.*?\]\]` across all pages
- Extract the link targets
- Check if a corresponding `.md` file exists

**How to fix:**
- If the target was renamed, update the link
- If the target should exist, create it
- If the link is wrong, remove or correct it

### 3. Missing Frontmatter

Every page should have: title, category, tags, sources, created, updated.

**How to check:**
- Grep frontmatter blocks (scope to `^---` at file heads) instead of reading every page in full
- Flag pages missing required fields

**How to fix:**
- Add missing fields with reasonable defaults

### 3a. Missing Summary (soft warning)

Every page *should* have a `summary:` frontmatter field — 1–2 sentences, ≤200 chars. This is what cheap retrieval reads to avoid opening page bodies.

**How to check:**
- Grep frontmatter for `^summary:` across the vault
- Flag pages without it **as a soft warning, not an error** — older pages predating this field are fine
- Also flag pages whose summary exceeds 200 chars

**How to fix:**
- Re-ingest the page, or manually write a short summary.

### 4. Stale Content

Pages whose `updated` timestamp is old relative to their sources.

**How to check:**
- Compare page `updated` timestamps to source file modification times
- Flag pages where sources have been modified after the page was last updated

### 5. Contradictions

Claims that conflict across pages.

**How to check:**
- This requires reading related pages and comparing claims
- Focus on pages that share tags or are heavily cross-referenced
- Look for phrases like "however", "in contrast", "despite" that may signal contradictions

**How to fix:**
- Add an "Open Questions" section noting the contradiction
- Reference both sources and their claims

### 6. Index Consistency

Verify `index.md` matches the actual page inventory.

**How to check:**
- Compare pages listed in `index.md` to actual files on disk
- Check that summaries in `index.md` still match page content

### 7. Provenance Drift

Check whether pages are being honest about how much of their content is inferred vs extracted.

**How to check:**
- For each page with a `provenance:` block or any `^[inferred]`/`^[ambiguous]` markers, count sentences/bullets and how many end with each marker
- Apply these thresholds:
  - **AMBIGUOUS > 15%**: flag as "speculation-heavy"
  - **INFERRED > 40% with no `sources:` in frontmatter**: flag as "unsourced synthesis"
  - **Hub pages** (top 10 by incoming wikilink count) with INFERRED > 20%: flag as "high-traffic page with questionable provenance"
  - **Drift**: if `provenance:` block exists, flag when any field is more than 0.20 off from the recomputed value
- **Skip** pages with no `provenance:` frontmatter and no markers — treated as fully extracted by convention

**How to fix:**
- For ambiguous-heavy: re-ingest from sources, resolve uncertain claims, or split speculative content into a `synthesis/` page
- For unsourced synthesis: add `sources:` to frontmatter or clearly label the page as synthesis
- For hub pages with INFERRED > 20%: prioritize for re-ingestion — errors here have the widest blast radius
- For drift: update the `provenance:` frontmatter to match the recomputed values

### 8. Fragmented Tag Clusters

Checks whether pages that share a tag are actually linked to each other.

**How to check:**
- For each tag that appears on ≥ 5 pages:
  - `n` = count of pages with this tag
  - `actual_links` = count of wikilinks between any two pages in this tag group
  - `cohesion = actual_links / (n × (n−1) / 2)`
- Flag any tag group where cohesion < 0.15 and n ≥ 5

**How to fix:**
- Run `wiki-cross-link` targeted at the fragmented tag
- If n > 15 and still fragmented, consider splitting into more specific sub-tags

### 9. Visibility Tag Consistency

**How to check:**

- **Untagged PII patterns:** Grep page bodies for lines containing `password`, `api_key`, `secret`, `token`, `ssn`, `email:`, `phone:` followed by an actual value. If a page matches and lacks `visibility/pii` or `visibility/internal`, flag it.
- **`visibility/pii` without `sources:`:** A page tagged `visibility/pii` should always have a `sources:` frontmatter field.
- **Visibility tags in taxonomy:** `visibility/` tags are system tags and must **not** appear in `_meta/taxonomy.md`.

**How to fix:**
- For untagged PII patterns: add `visibility/pii` (or `visibility/internal`) to the page's frontmatter tags
- For missing `sources:`: add provenance or escalate to the user — don't auto-fill
- For taxonomy contamination: remove the `visibility/` entries from `_meta/taxonomy.md`

### 10. Misc Promotion Candidates

Find pages in `misc/` that have accumulated enough project affinity to be promoted.

**How to check:**
- Glob `$OBSIDIAN_VAULT_PATH/misc/*.md`
- For each page, read the `affinity` frontmatter field
- Flag pages where any single project's score ≥ 3

**How to fix:**
- Run `wiki-cross-link` first if affinity scores look stale
- To promote: move the page to `projects/<project-name>/references/`, update its `category` frontmatter, remove `promotion_status`, and grep the vault for backlinks to update them

### 11. Synthesis Gaps

Identify high-value synthesis opportunities the wiki is missing — concept pairs that co-occur across many pages but have no `synthesis/` page connecting them.

**How to check:**
- List all pages in `synthesis/` — collect the concept pairs each one already covers
- Pick 10-15 frequently linked concepts from `concepts/` and `entities/`
- For each pair, run:
  ```bash
  grep -rl "\[\[ConceptA\]\]" "$OBSIDIAN_VAULT_PATH" --include="*.md" > /tmp/a.txt
  grep -rl "\[\[ConceptB\]\]" "$OBSIDIAN_VAULT_PATH" --include="*.md" > /tmp/b.txt
  comm -12 <(sort /tmp/a.txt) <(sort /tmp/b.txt) | wc -l
  ```
- Flag pairs with co-occurrence ≥ 3 that have no existing synthesis page

**How to fix:**
- Run `/wiki-synthesize` to automatically discover and fill the top gaps

### 12. Confidence and Lifecycle Schema

Enforces the confidence + lifecycle frontmatter schema (see `${CLAUDE_SKILL_DIR}/../wiki-meta/SKILL.md`, Confidence and Lifecycle section).

Two modes:
- **`--check`** (default, read-only) — reports errors and warnings
- **`--fix`** — may rewrite `base_confidence` only when drift is detected (Rule 12e); never rewrites `lifecycle`

#### Rule 12a — `lifecycle` enum validation

Grep frontmatter for `^lifecycle:` across all pages. Flag any value not in `{draft, reviewed, verified, disputed, archived}`.

#### Rule 12b — `base_confidence` range

Grep frontmatter for `^base_confidence:` across all pages. Flag any value outside `[0.0, 1.0]` or any page missing the field entirely.

#### Rule 12c — Stale page report

Staleness is computed at read time: `is_stale = (today − updated) > 90 days`. Report:
- Stale pages with `lifecycle: verified` with a louder annotation (high-trust pages that may be wrong)
- All other stale pages as a standard warning

`--fix` does **not** rewrite `lifecycle`. Staleness clears automatically when a re-ingest bumps `updated`.

#### Rule 12d — Supersession integrity

For each page with `superseded_by: "[[target]]"`:
- Verify the target page exists
- Verify the target page is not itself `archived` (no circular or chained supersession)
- Warn if `lifecycle != archived` while `superseded_by` is set

#### Rule 12e — Confidence drift

For pages with both `base_confidence:` and `sources:`, recompute `base_confidence` using the formula from `${CLAUDE_SKILL_DIR}/../wiki-meta/SKILL.md`. If stored value differs from recomputed by more than 0.05, flag it as drift. In `--fix` mode: rewrite the `base_confidence` field to the recomputed value (this is the **only rule** that mutates frontmatter automatically).

#### Migration timeline

| Phase | When | Behavior on missing fields |
|---|---|---|
| Phase 1: Soft launch | Initial PR | Warning only |
| Phase 2: New pages enforced | +2 weeks | Error for newly created pages missing the fields |
| Phase 3: Full enforcement | +6 weeks | Error for all pages |

### 13. Typed Relationships Validity

Validate `relationships:` frontmatter blocks. Skip pages that have no `relationships:` block — the field is optional.

**Allowed types:** `extends`, `implements`, `contradicts`, `derived_from`, `uses`, `replaces`, `related_to`

**How to check:**
- Grep frontmatter for `^relationships:` across all vault pages
- For each page, read its frontmatter (not the full page body)
- For each entry:
  1. **Type validation** — flag any `type:` value not in the allowed set
  2. **Broken target** — strip `[[` and `]]` from `target:`, normalize (lowercase, spaces→hyphens, strip `.md`), check whether a `.md` file exists at that path
  3. **Self-reference** — flag any entry where the resolved target equals the page's own node id

**How to fix:**
- Invalid type: correct to the nearest allowed type, or use `related_to`
- Broken target: update or remove the entry; create the page first if it should exist
- Self-reference: remove the entry

## Output Format

```markdown
## Wiki Health Report

### Orphaned Pages (N found)
- `concepts/foo.md` — no incoming links

### Broken Wikilinks (N found)
- `entities/bar.md:15` — links to [[nonexistent-page]]

### Missing Frontmatter (N found)
- `skills/baz.md` — missing: tags, sources

### Stale Content (N found)
- `references/paper-x.md` — source modified 2024-03-10, page last updated 2024-01-05

### Contradictions (N found)
- `concepts/scaling.md` claims "X" but `synthesis/efficiency.md` claims "not X"

### Index Issues (N found)
- `concepts/new-page.md` exists on disk but not in index.md

### Missing Summary (N found — soft)
- `concepts/foo.md` — no `summary:` field

### Provenance Issues (N found)
- `concepts/scaling.md` — AMBIGUOUS > 15%: 22% of claims are ambiguous
- `concepts/transformers.md` — hub page (31 incoming links) with INFERRED=28%

### Fragmented Tag Clusters (N found)
- **#systems** — 7 pages, cohesion=0.06 ⚠️ — run wiki-cross-link on this tag

### Visibility Issues (N found)
- `entities/user-records.md` — contains `email:` value pattern but no `visibility/pii` tag

### Misc Promotion Candidates (N found)
| Page | Top Project | Affinity Score |
|---|---|---|
| `misc/web-martinfowler-articles-microservices.md` | `obsidian-wiki` | 4 |

### Typed Relationship Issues (N found)
- `concepts/foo.md` — relationships[1]: type "contradication" is not an allowed type

### Synthesis Gaps (N found)
| Pair | Co-occurrence | Suggested Action |
|---|---|---|
| [[Caching]] × [[Consistency]] | 5 pages | Run `/wiki-synthesize` |

### Confidence/Lifecycle Issues (N found)
- `concepts/foo.md` — missing `lifecycle` field (warning: Phase 1)
- `synthesis/old-analysis.md` — STALE (last updated 2025-10-01, 182 days ago) lifecycle=verified ⚠️ HIGH PRIORITY
- `concepts/drift-example.md` — base_confidence drift: stored=0.80, recomputed=0.59 (delta=0.21)
```

## After Linting

Append to `log.md`:
```
- [TIMESTAMP] LINT issues_found=N orphans=X broken_links=Y stale=Z contradictions=W prov_issues=P missing_summary=S fragmented_clusters=F visibility_issues=V promotion_candidates=C synthesis_gaps=G relationship_issues=R lifecycle_issues=L
```

Offer to fix issues automatically or let the user decide which to address.

---

## Consolidate Mode (`--consolidate`)

Triggered by `wiki-lint --consolidate`. Switches from report-only to **act-and-report** — the "dream cycle" that runs periodically so the wiki self-heals.

### Safety protocol

**Always run in dry-run first.** Before writing anything:

1. Run all 13 lint checks above.
2. Print the planned consolidation actions as a structured list (see Dry-Run Output below).
3. Ask the user: `"Apply these N changes? [yes / no / select]"`.
4. Only proceed with writes after explicit confirmation. If the user selects individual actions, apply only those.
5. Never merge pages — use `wiki-dedup` for that. Only link, promote, demote, and flag.

### Consolidation actions (in order, after confirmation)

#### Action 1: Fix broken wikilinks

For each broken `[[Target]]` found in Check 2:
- Search the vault for a page whose title or filename is the closest fuzzy match (use `Grep` across `index.md` titles)
- If a unique best match exists (edit distance ≤ 2 characters or same root word): rewrite the link. Note the rewrite: `[[Original]] → [[corrected-page]]`.
- If no match or ambiguous: convert to plain text (`~~[[Target]]~~` → `Target`) and add a comment `<!-- broken link: no match found -->`.
- Never create a new page just to satisfy a broken link.

#### Action 2: Add missing cross-references for orphans

For each orphan page found in Check 1 (zero incoming links):
- Grep the vault body text for mentions of the page's title or aliases (case-insensitive).
- For each mention found in another page, add a `[[wikilink]]` replacing the plain-text mention.
- Limit to 3 insertions per orphan — don't flood pages with links.
- This is scoped to orphans only (different from `wiki-cross-link` which runs broadly).

#### Action 3: Correct lifecycle states

Apply these rules automatically (they enforce the documented state machine):
- **Promote `draft` → `reviewed`:** pages where `lifecycle: draft` AND `created` > 30 days ago AND `base_confidence > 0.7`. Set `lifecycle: reviewed`, `lifecycle_changed: <today>`, `lifecycle_reason: "auto-promoted by wiki-lint --consolidate: age>30d, confidence>0.7"`.
- **Stale verified pages:** for verified pages where `is_stale = (today − updated) > 180 days`, add a callout at the top of the page body: `> ⚠️ **Stale**: This page was last updated <date>. Verify before relying on it.` Only add if the callout isn't already present.
- **Do not change `reviewed` → `verified` or any other transition** — those are human-only.

#### Action 4: Tier demotion

For pages with `tier: supporting` (or unset) that have 0 incoming links AND haven't been updated in 90+ days:
- Set `tier: peripheral`.
- Emit a list of demotions for the user to review.
- Do not demote `tier: core` pages automatically — those were manually set.

#### Action 5: Tag normalization

Read `_meta/taxonomy.md` for the alias mapping. For each page, replace known alias tags with their canonical form in the `tags:` frontmatter field. Only alias fixes, no full audit.

#### Action 6: Contradiction callouts

For each pair of pages marked as contradicting each other (via `relationships: contradicts` in frontmatter, or flagged in Check 5):
- Check whether a `> ⚠️ Contradiction flagged with [[Other Page]]` callout already exists near the relevant claim.
- If not, add it at the end of the "Key Ideas" section (or before "Open Questions" if no "Key Ideas" section).
- Do not resolve the contradiction; only flag it visually.

#### Action 7: Write consolidation report

After all actions, write a report to `synthesis/consolidation-<YYYY-MM-DD>.md`:

```markdown
---
title: Consolidation Report <YYYY-MM-DD>
category: synthesis
tags: [maintenance, consolidation]
sources: []
summary: Auto-generated consolidation report from wiki-lint --consolidate run on <date>.
lifecycle: draft
lifecycle_changed: <date>
tier: peripheral
created: <ISO timestamp>
updated: <ISO timestamp>
---

# Consolidation Report — <YYYY-MM-DD>

## Summary
- Broken links fixed: N
- Cross-references added: M
- Lifecycle states updated: K
- Tier demotions: D
- Tags normalized: T
- Contradiction callouts added: C

## Broken Link Fixes
- `concepts/foo.md:12` — [[OldTarget]] → [[correct-target]]

## Cross-References Added (orphan rescue)
- `concepts/baz.md` — now linked from: [[concepts/alpha]], [[skills/beta]]

## Lifecycle Updates
- `concepts/old-draft.md` — draft → reviewed (age 45d, confidence 0.74)
- `synthesis/stale-verified.md` — stale callout added (last updated 2025-10-01)

## Tier Demotions
- `concepts/unused-concept.md` — supporting → peripheral (0 links, 120 days stale)

## Tag Normalizations
- `entities/some-tool.md` — `ml` → `machine-learning`

## Contradiction Callouts
- `concepts/scaling.md` — flagged contradiction with [[synthesis/efficiency]]
```

### Dry-Run Output (shown before any writes)

```
wiki-lint --consolidate — Dry Run

Planned actions (N total):
[1] Fix broken link: concepts/foo.md:12 [[OldTarget]] → [[correct-target]]
[2] Add cross-ref: concepts/baz.md ← [[concepts/alpha]] (orphan rescue)
[3] Lifecycle: concepts/old-draft.md → reviewed (age 45d, confidence 0.74)
[4] Tier demotion: concepts/unused.md → peripheral (0 links, 112 days stale)
[5] Tag alias: entities/some-tool.md: ml → machine-learning
[6] Contradiction callout: concepts/scaling.md ↔ [[synthesis/efficiency]]

Apply these 6 changes? [yes / no / select by number]
```

### Log entry for consolidate mode

```
- [TIMESTAMP] LINT_CONSOLIDATE links_fixed=N orphans_rescued=M lifecycle_updates=K tier_demotions=D tag_fixes=T contradiction_callouts=C report=synthesis/consolidation-YYYY-MM-DD.md
```

## QMD Refresh

If `$QMD_WIKI_COLLECTION` is set: after vault writes run `${QMD_CLI:-qmd} update` (then `embed` if vectors are stale). Record the outcome; failure does not roll back vault changes.
