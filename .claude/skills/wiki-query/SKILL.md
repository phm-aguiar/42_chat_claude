---
name: wiki-query
description: Answer questions by searching the compiled Obsidian wiki using tiered retrieval (index pass → optional QMD → section grep → full read). Supports multi-hop graph traversal for path queries, semantic/hybrid modes, and a fast index-only mode.
when_to_use: Use when the user asks "what do I know about X", "find everything related to Y", "how is X connected to Z", or wants synthesized answers with citations from wiki pages.
argument-hint: "[query] [--semantic] [--hybrid] [--top-k N]"
allowed-tools: Read Bash
---
# Wiki Query — Knowledge Retrieval

You are answering questions against a compiled Obsidian wiki, not raw source documents. The wiki contains pre-synthesized, cross-referenced knowledge.

## This skill is READ-ONLY

`wiki-query` answers questions. It MUST NOT create or modify any wiki content. The ONLY write it may perform is the single Step 6 append to `log.md`.

Never, even when a change seems obviously helpful:
- create or edit pages under `concepts/`, `entities/`, `skills/`, `references/`, `synthesis/`, `journal/`, or `projects/`
- modify `index.md`, `hot.md`, `_insights.md`, or `.manifest.json`

If the user's message contains a new finding, an action request, or anything implying a change, **do not perform it.** Answer the question, PROPOSE the change, and route the user to the right skill:
- quick note / gotcha → `wiki-capture --quick`
- a full new page → `wiki-capture`
- a project-knowledge sync → `wiki-update`

## Before You Start

1. **Resolve config** — follow the Config Resolution Protocol in `${CLAUDE_SKILL_DIR}/../wiki-meta/SKILL.md` (walk up CWD for `.env` → `~/.obsidian-wiki/config` → prompt setup). Prefer `~/.obsidian-wiki/config` for cross-project queries when present. This gives `OBSIDIAN_VAULT_PATH` and any QMD variables.
2. **Load QMD settings from the resolved config** before deciding retrieval strategy. If `QMD_WIKI_COLLECTION` is set, treat QMD as available. If empty or unset, say briefly why QMD is being skipped.
3. If `$OBSIDIAN_VAULT_PATH/hot.md` exists, read it first — it gives instant context on recent activity.
4. Read `$OBSIDIAN_VAULT_PATH/index.md` to understand the wiki's scope and structure.

## Visibility Filter (optional)

By default, **all pages are returned** regardless of visibility tags.

If the user's query includes phrases like **"public only"**, **"no internal content"**, **"exclude internal"**, activate **filtered mode**:
- Build a **blocked tag set**: `{visibility/internal, visibility/pii}`
- In the Index Pass (Step 2), skip any candidate whose frontmatter tags contain a blocked tag
- In Section/Full Read passes (Steps 3–4), do not read or cite any blocked page
- Note the filter in Step 6 log entry: `mode=filtered`

## Semantic Mode (--semantic)

Activated **only** when the user passes `--semantic` explicitly. This embeds the query with `all-MiniLM-L6-v2` and searches by cosine similarity in the SQLite index (`~/.claude/wiki_index.db`). Use `--top-k N` to control result count (default: 5).

If the index doesn't exist or is empty, report: "No semantic index found — run the indexer to build it."

## Hybrid Mode (--semantic --hybrid)

Combines **cosine similarity** (embedding) with **BM25** (lexical). Activated by adding `--hybrid` alongside `--semantic`.

Combined score: `hybrid_score = 0.7 * cosine_norm + 0.3 * bm25_norm`

Output format per result:
```
[0.423 cos + 0.312 bm25 = 0.390 hybrid] source > heading
    content truncated...
```

**Mode comparison:**

| Mode | Flag | Ideal for |
|---|---|---|
| **Textual** (default) | *(no flag)* | Exact names, file paths, error messages |
| **Semantic** | `--semantic` | Conceptual queries: "how to do X", "pattern for Y" |
| **Hybrid** | `--semantic --hybrid` | Technical terms in broad conceptual context, or when semantic-only gives poor results |

Scripts: `.claude/skills/wiki/experiential_memory/cli_query.py` (orchestration), `search.py` (cosine + hybrid), `bm25.py` (BM25Retriever).

## Retrieval Protocol

**Follow the Retrieval Primitives table in `${CLAUDE_SKILL_DIR}/../wiki-meta/SKILL.md`.** Use the cheapest primitive that answers the question and escalate only when it can't.

### Step 1: Understand the Question

Classify the query type:
- **Factual lookup** — "What is X?" → Find the relevant page(s)
- **Relationship query** — "How does X relate to Y?" / "What contradicts X?" → Find both pages, their cross-references, and their `relationships:` frontmatter blocks
- **Path / multi-hop query** — "How is X connected to Y?" / "Trace the chain from X to Z" / "What does X depend on transitively?" → Use the multi-hop graph traversal in Step 4b
- **Synthesis query** — "What's the current thinking on X?" → Find all pages that touch X, synthesize
- **Gap query** — "What don't I know about X?" → Find what's missing, check open questions sections

Also decide the **mode**: index-only (triggered by "quick answer", "fast lookup", "don't read the pages"), normal, semantic, or hybrid.

### Step 2: Index Pass (cheap)

Build a candidate set *without opening any page bodies*:

- Use the already-read `index.md` as the first filter
- Use `Grep` to scan page **frontmatter only** for title, tag, alias, and summary matches
- Collect the top 5–10 candidate page paths ranked by:
  1. Exact title or alias match
  2. Tag match
  3. Summary field contains the query term
  4. `index.md` entry contains the query term
- **Apply tier ordering within each rank bucket:** prefer `tier: core` over `tier: supporting` over `tier: peripheral`

If in **index-only mode**, stop here. Answer from `summary:` fields, titles, and `index.md` descriptions only. Label the answer clearly: **"(index-only answer — page bodies not read; facts below are from page summaries and may miss nuance)"**. Then skip to Step 5.

### Step 2b: QMD Semantic Pass (optional — requires `QMD_WIKI_COLLECTION`)

**GUARD: If `$QMD_WIKI_COLLECTION` is empty or unset, skip this entire step and proceed to Step 3.**

If `QMD_WIKI_COLLECTION` is set, run QMD before reaching for `Grep` unless the question is already fully answered by `hot.md` or `index.md` metadata.

Choose transport from `$QMD_TRANSPORT`:

- `mcp` (default): use the QMD MCP tool.
- `cli`: run the local qmd CLI. Use `$QMD_CLI` if set; otherwise use `qmd`.

For MCP transport:
```
mcp__qmd__query:
  collection: <QMD_WIKI_COLLECTION>
  intent: <the user's question>
  searches:
    - type: lex    # keyword match
      query: <key terms>
    - type: vec    # semantic match
      query: <question rephrased as a description>
```

For CLI transport (`$QMD_CLI_SEARCH_MODE`):
- `quality` (default): `${QMD_CLI:-qmd} query $'lex: <key terms>\nvec: <question as description>' -c "$QMD_WIKI_COLLECTION" -n 8 --files`
- `balanced`: same, add `--no-rerank`
- `fast`: `${QMD_CLI:-qmd} vsearch "<question as description>" -c "$QMD_WIKI_COLLECTION" -n 8 --files`

Keep operator-like tokens (`no-sudo`, `~/.local/bin`) in the `lex:` line. Rewrite `vec:` as plain natural language without hyphenated `-term` words (QMD treats `-term` as negation, unsupported in vec queries).

If the transport is unavailable, skip QMD and continue with Step 3.

If `QMD_PAPERS_COLLECTION` is set and the question may involve source papers, run a parallel search against the papers collection. Cite raw sources separately from compiled wiki pages.

### Step 3: Section Pass (medium cost — only if Steps 2/2b are inconclusive)

For each of the top candidates, pull the relevant section *without reading the whole page*:

- Use `Grep -A 10 -B 2 "<query-term>" <candidate-file>` to get just the lines around the match.
- This usually returns 15–30 lines per hit instead of 100–500.
- If the section grep gives a clear answer, go straight to Step 5.

### Step 4: Full Read (expensive — last resort)

Only when Steps 2 and 3 don't answer the question:

- `Read` the top **3** candidates in full. Apply tier ordering: read `core` before `supporting`, skip `peripheral` unless they are the only match.
- Follow at most one hop of `[[wikilinks]]` from those pages if the answer requires cross-references.
- **For relationship queries**: also read the `relationships:` frontmatter block of candidate pages. Surface typed edges explicitly — "Page A *contradicts* Page B (typed edge)" is more useful than "Page A links to Page B".
- Check "Open Questions" sections for known gaps.
- If still short, fall back to a broad content grep across the vault. Tell the user you escalated.

### Step 4b: Multi-hop Graph Traversal (typed edges)

Run this step **only** for path/multi-hop queries. It is built entirely from frontmatter — never read page bodies here.

1. **Build the typed-edge adjacency (cheap).** Grep every page's `relationships:` block in one pass: `Grep -A 20 "^relationships:" <vault>/**/*.md` (frontmatter only). Each entry yields a directed, typed edge `source —type→ target`. Add the reverse direction as traversable too (mark it `(reverse)`). Plain body `[[wikilinks]]` count as untyped `related_to` edges only if needed to complete a path — prefer typed edges first.

2. **Locate the endpoints.** Resolve X (and Y if two-endpoint) to page paths using the registry from Step 2. If ambiguous, pick the `tier: core` candidate and note the assumption.

3. **Bounded BFS.** Walk outward from X:
   - **Max depth 3 hops** by default. Raise to 4 only if the user says "deep" / "however many hops it takes".
   - **Frontier cap:** stop expanding once the visited set exceeds ~60 pages.
   - For a **two-endpoint query** (X→Y): stop as soon as you find the shortest path; surface up to 2 alternate paths.
   - For a **one-endpoint query** (X transitively): collect all nodes reachable within the depth limit, grouped by hop distance.

4. **Report the path(s) with edge types:**

   ```
   [[concepts/transformers]] —uses→ [[concepts/attention]] —derived_from→ [[concepts/rnn-seq2seq]] —contradicts (reverse)→ [[concepts/lstm]]
   ```

   State the hop count and whether any hop is `(reverse)` or an untyped `related_to` fallback (those chains are weaker — flag them). If no path exists within the depth limit, say so explicitly — that is itself a useful finding (a graph gap).

**Cost guard:** if the adjacency grep returns nothing (no page uses `relationships:` yet), report that the graph has no typed edges to traverse and suggest running `wiki-cross-link` to populate them.

### Step 5: Synthesize an Answer

Compose your answer from wiki content:
- Cite specific wiki pages using `[[page-name]]` notation
- Note which step the answer came from ("found in summary" vs "grepped section" vs "full page read")
- If the wiki has contradictions, present both sides
- If the wiki doesn't cover something, say so explicitly

**Page trust annotations:** For every page cited, check its `lifecycle` frontmatter and compute `is_stale = (today − updated) > 90 days`. Annotate risky pages inline:

| Condition | Annotation |
|---|---|
| `lifecycle: archived` | `(ARCHIVED: superseded by [[target]])` |
| `lifecycle: disputed` | `(DISPUTED, marked <lifecycle_changed>: <lifecycle_reason or "reason unspecified">)` |
| `is_stale` + `lifecycle: verified` | `(VERIFIED but stale: last updated <updated>)` |
| `is_stale` (other lifecycle) | `(stale: last updated <updated>)` |

**Surface the project source path (project-scoped queries).** When the cited pages are project-scoped, resolve where the actual code lives:

1. Read `$OBSIDIAN_VAULT_PATH/.manifest.json` and look up `.projects.<name>.source_cwd`
2. Fallback: use the page's `source_path` frontmatter

Include a **`Source code:`** line in the answer with that absolute path.

### Step 6: Log the Query

Append to `log.md`. This is the *only* write this skill performs:
```
- [TIMESTAMP] QUERY query="the user's question" result_pages=N mode=normal|index_only|filtered escalated=true|false
```

## Answer Format

> **Based on the wiki:**
>
> [Your synthesized answer with [[wikilinks]] to source pages]
>
> **Pages consulted:** [[page-a]], [[page-b]], [[page-c]]
>
> **Gaps:** [What the wiki doesn't cover that might be relevant]
>
> **Source code:** `<source_cwd>` — to implement, the relevant files are `…`.
> (Say the word and I'll switch out of query mode to make the change.)

The **Source code** line is optional — include it only for project-scoped queries where you resolved a `source_cwd`.
