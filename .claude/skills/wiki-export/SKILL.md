---
name: wiki-export
description: Export the Obsidian wiki knowledge graph to graph.json (NetworkX), graph.graphml (Gephi/yEd), cypher.txt (Neo4j), and graph.html (interactive vis.js) into wiki-export/ at the vault root. Supports project and visibility filters.
when_to_use: Use when the user says "export wiki", "export graph", "export to JSON/Gephi/Neo4j", "visualize wiki", "graphml", or wants to use wiki data in external tools.
argument-hint: "[project-name] [--public]"
disable-model-invocation: true
allowed-tools: Read Bash Write
---
# Wiki Export — Knowledge Graph Export

You are exporting the wiki's wikilink graph to structured formats so it can be used in external tools (Gephi, Neo4j, custom scripts, browser visualization).

## Before You Start

1. **Resolve config** — follow the Config Resolution Protocol in `${CLAUDE_SKILL_DIR}/../wiki-meta/SKILL.md` (walk up CWD for `.env` → `~/.obsidian-wiki/config` → prompt setup). This gives `OBSIDIAN_VAULT_PATH`
2. Confirm the vault has pages to export — if fewer than 5 pages exist, warn the user and stop

## Project Filter (optional)

If the user's invocation includes a project name — e.g. `/wiki-export prismor`, `"export the prismor project"` — activate **project filter mode**:

1. Extract the project name from the argument or phrase. Normalise: lowercase, strip the word "project".
2. Keep only pages where **either** condition holds:
   - The page `id` starts with `projects/<name>/` (path-based match)
   - The page's `tags` array contains `<name>` (tag-based match)
3. Drop any edge where either endpoint was excluded.
4. Note the filter in the summary: `(filtered: project:<name> — X of Y pages)`
5. Set `graph.graph.filter = "project:<name>"` in the JSON output.

If both a project filter and a visibility filter are active, apply both (project filter first, then visibility filter on the remaining set).

## Visibility Filter (optional)

By default, **all pages are exported** regardless of visibility tags.

If the user requests a filtered export — phrases like **"public export"**, **"exclude internal"**, **"no internal pages"** — activate **visibility filtered mode**:

- Build a **blocked tag set**: `{visibility/internal, visibility/pii}`
- Skip any page whose frontmatter tags contain a blocked tag
- Skip any edge where either endpoint was excluded
- Note the filter in the summary: `(filtered: visibility/internal, visibility/pii excluded)`

Pages with no `visibility/` tag, or tagged `visibility/public`, are always included.

## Step 1: Build the Node and Edge Lists

Glob all `.md` files in the vault (excluding `_archives/`, `_raw/`, `.obsidian/`, `index.md`, `log.md`, `_insights.md`). Apply any active filters after collecting the full file list.

For each page, extract from frontmatter:
- `id` — relative path from vault root, without `.md` extension
- `label` — `title` field from frontmatter, or filename if missing
- `category` — directory prefix
- `tags` — array from frontmatter tags field
- `summary` — frontmatter `summary` field if present

This is your **node list**.

For each page, Grep the body for `\[\[.*?\]\]` to extract all wikilinks:
- Parse each `[[target]]` or `[[target|display]]` — use the target part only
- Resolve the target to a node id (normalize: lowercase, spaces→hyphens, strip `.md`)
- Skip links that point outside the node list (broken links)
- Each resolved link becomes an edge: `{source: page_id, target: linked_id, relation: "wikilink", confidence: "EXTRACTED"}`

**Typed edge enrichment:** After building the wikilink edge list, read each page's `relationships:` frontmatter block. For each `{target, type}` entry:
- Strip `[[` and `]]` from the target value, normalize to get the node id
- If an edge for this `(source, target)` pair already exists, override its `relation` field with the typed value and set `typed: true`
- If no edge exists yet, add one: `{source: page_id, target: target_id, relation: <type>, confidence: "EXTRACTED", typed: true}`

This is your **edge list**.

## Step 2: Assign Community IDs

Group pages into communities by tag clustering:
- Pages sharing the same dominant tag belong to the same community
- Dominant tag = the first tag in the page's frontmatter tags array
- Pages with no tags get community id `null`
- Number communities starting from 0, ordered by size descending

## Step 3: Write the Output Files

Create `wiki-export/` at the vault root if it doesn't exist. Write all four files:

### 3a. `graph.json` — NetworkX node_link format

```json
{
  "directed": false,
  "multigraph": false,
  "graph": {
    "exported_at": "<ISO timestamp>",
    "vault": "<OBSIDIAN_VAULT_PATH>",
    "total_nodes": N,
    "total_edges": M
  },
  "nodes": [
    {
      "id": "concepts/transformers",
      "label": "Transformer Architecture",
      "category": "concepts",
      "tags": ["ml", "architecture"],
      "summary": "The attention-based architecture introduced in Attention Is All You Need.",
      "community": 0
    }
  ],
  "links": [
    {
      "source": "concepts/transformers",
      "target": "entities/vaswani",
      "relation": "wikilink",
      "confidence": "EXTRACTED"
    },
    {
      "source": "concepts/transformers",
      "target": "concepts/lstm",
      "relation": "contradicts",
      "confidence": "EXTRACTED",
      "typed": true
    }
  ]
}
```

### 3b. `graph.graphml` — Gephi / yEd / Cytoscape format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/graphml">
  <key id="label" for="node" attr.name="label" attr.type="string"/>
  <key id="category" for="node" attr.name="category" attr.type="string"/>
  <key id="tags" for="node" attr.name="tags" attr.type="string"/>
  <key id="community" for="node" attr.name="community" attr.type="int"/>
  <key id="relation" for="edge" attr.name="relation" attr.type="string"/>
  <key id="type" for="edge" attr.name="type" attr.type="string"/>
  <key id="confidence" for="edge" attr.name="confidence" attr.type="string"/>
  <graph id="wiki" edgedefault="undirected">
    <node id="concepts/transformers">
      <data key="label">Transformer Architecture</data>
      <data key="category">concepts</data>
      <data key="tags">ml, architecture</data>
      <data key="community">0</data>
    </node>
    <edge source="concepts/transformers" target="entities/vaswani">
      <data key="relation">wikilink</data>
      <data key="confidence">EXTRACTED</data>
    </edge>
    <!-- Typed edge — emits both relation and type keys -->
    <edge source="concepts/transformers" target="concepts/lstm">
      <data key="relation">contradicts</data>
      <data key="type">contradicts</data>
      <data key="confidence">EXTRACTED</data>
    </edge>
  </graph>
</graphml>
```

Write one `<node>` per page and one `<edge>` per link. For typed edges, emit both `<data key="relation">` and `<data key="type">`. Untyped wikilinks omit the `<data key="type">` element.

### 3c. `cypher.txt` — Neo4j Cypher MERGE statements

```cypher
// Wiki knowledge graph export — <TIMESTAMP>
// Load with: cypher-shell -u neo4j -p password < cypher.txt

// Nodes
MERGE (n:Page {id: "concepts/transformers"}) SET n.label = "Transformer Architecture", n.category = "concepts", n.tags = ["ml","architecture"], n.community = 0;

// Relationships — untyped wikilinks use [:WIKILINK], typed edges use the type UPPERCASE
MATCH (a:Page {id: "concepts/transformers"}), (b:Page {id: "entities/vaswani"}) MERGE (a)-[:WIKILINK {relation: "wikilink", confidence: "EXTRACTED"}]->(b);
MATCH (a:Page {id: "concepts/transformers"}), (b:Page {id: "concepts/lstm"}) MERGE (a)-[:CONTRADICTS {relation: "contradicts", confidence: "EXTRACTED"}]->(b);
```

### 3d. `graph.html` — Self-contained vis.js interactive visualization

Build the HTML file by:

1. Generating vis.js node objects:
```js
{id: "concepts/transformers", label: "Transformer Architecture", color: {background: "#4E79A7"}, size: <degree * 3 + 8>, title: "concepts | #ml #architecture", community: 0}
```
- Color by community (cycle through: `#4E79A7`, `#F28E2B`, `#E15759`, `#76B7B2`, `#59A14F`, `#EDC948`, `#B07AA1`, `#FF9DA7`, `#9C755F`, `#BAB0AC`)
- Size by degree: `size = degree * 3 + 8`, capped at 60

2. Generating vis.js edge objects:
```js
// Untyped wikilink
{from: "concepts/transformers", to: "entities/vaswani", dashes: false, width: 1, color: {color: "#666", opacity: 0.6}, title: "wikilink"}
// Typed edge
{from: "concepts/transformers", to: "concepts/lstm", dashes: false, width: 2, color: {color: "#E15759", opacity: 0.8}, label: "contradicts", font: {size: 9, color: "#ccc"}}
```
- `dashes: true` for INFERRED edges, `dashes: [4,8]` for AMBIGUOUS edges
- Typed edge colors: `extends`=#59A14F, `implements`=#4E79A7, `contradicts`=#E15759, `derived_from`=#F28E2B, `uses`=#76B7B2, `replaces`=#B07AA1, `related_to`=#BAB0AC

3. Writing a self-contained HTML with vis.js CDN, dark sidebar for click details and community legend.

## Step 4: Print Summary

```
Wiki export complete → wiki-export/
  graph.json    — N nodes, M edges (NetworkX node_link format)
  graph.graphml — N nodes, M edges (Gephi / yEd / Cytoscape)
  cypher.txt    — N MERGE nodes + M MERGE relationships (Neo4j)
  graph.html    — interactive browser visualization (open in any browser)
```

Append filter notes when active:
```
  (filtered: project:prismor — 19 of 67 pages)
  (filtered: X of Y pages excluded — visibility/internal, visibility/pii)
```

## Notes

- **Re-running is safe** — all output files are overwritten on each run
- **Broken wikilinks are skipped** — only edges to pages that exist in the vault are exported
- **The `wiki-export/` directory should be gitignored** if the vault is version-controlled — these are derived artifacts
- **`graph.json` is the primary format** — the others are derived from it
