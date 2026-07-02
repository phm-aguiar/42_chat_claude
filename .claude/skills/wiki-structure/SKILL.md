---
name: wiki-structure
description: Analyze wiki structure — detect hub pages, bridge pages, tag clusters, orphans, dead-ends, and information gaps. Powered by obsidian-cli for performance. Generates structure report with improvement recommendations.
when_to_use: Use when the user asks "analyze wiki structure", "find hub pages", "what's the structure", "wiki topology", "/wiki-structure", or wants to understand information flow and connectivity patterns.
argument-hint: "[--full | --category <name> | --min-connections N]"
allowed-tools: Read Bash Write
---

# Wiki Structure — Topology Analysis

Analyze the structure, connectivity, and information flow of the wiki using obsidian-cli for high-performance analysis.

## Analysis Types

### 1. Hub Pages
High-connectivity pages that serve as information hubs. Detected by:
- **Incoming links** — pages with many backlinks (typically 5+)
- **Outgoing links** — pages that link to many others (typically 8+)
- **Bridge role** — connects multiple clusters

These are critical for information architecture.

### 2. Dead-Ends
Pages with no outgoing links (sinks). May indicate:
- Leaf nodes (intentional, e.g., concrete examples)
- Incomplete pages (missing links)
- Specialized reference material

### 3. Orphans
Pages with no incoming links (isolated). Action:
- Should be linked to from index/hub pages
- OR are stale and should be archived
- OR are new and haven't been discovered yet

### 4. Tag Clusters
Groups of related tags that share a prefix:
- `go-*` (all Go-related tags)
- `testing-*` (all testing-related tags)
- etc.

Clusters indicate semantic topics. Orphaned tags (used only once) suggest niche areas.

### 5. Category Balance
Files distributed across directories:
- Balanced: each category has similar number of pages
- Unbalanced: one category dominates, others sparse

Imbalance suggests missing structure or reorganization opportunity.

### 6. Information Gaps
Detected by analyzing:
- Tag orphans (topics with only 1 page)
- Isolated clusters (tags not linked to other clusters)
- Unresolved links (references to pages that should exist)

## Running the Analysis

The analysis uses `wiki-cli.py` for fast obsidian-cli integration:

```bash
# Full structural analysis
./.claude/scripts/wiki-cli.py structure --vault wiki-claude --full

# Health check (orphans, unresolved, deadends, tags)
./.claude/scripts/wiki-cli.py health --vault wiki-claude

# Category analysis
./.claude/scripts/wiki-cli.py files --vault wiki-claude

# Tag cluster detection
./.claude/scripts/wiki-cli.py tags --vault wiki-claude --min-count 1
```

## Output Structure

```json
{
  "categories": {
    "go": 46,
    "references": 80,
    "entities": 12,
    "synthesis": 8,
    "journal": 20
  },
  "total_files": 267,
  "tag_clusters": {
    "go": ["go-concurrency", "go-error", "go-testing"],
    "testing": ["testing-bdd", "testing-unit", "testing-integration"]
  },
  "orphans": 0,
  "structure_score": 87.5,
  "recommendations": [
    "Consider archiving old journal entries (40+ pages)",
    "Link orphaned tags: database-pool, cache-strategy",
    "Balance references/ categories: too many go files"
  ]
}
```

## Analysis Criteria

| Aspect | Green | Yellow | Red |
|--------|-------|--------|-----|
| Orphans | 0 | 1-2 | 3+ |
| Unresolved | 0 | 1-3 | 4+ |
| Dead-ends | <5 | 5-20 | 20+ |
| Tag orphans | <5% | 5-15% | 15%+ |
| Category balance | 0.8-1.0 ratio | 0.5-0.8 | <0.5 |

## Workflow

1. **Baseline** — Run structure analysis to understand current state
2. **Identify Issues** — Note orphans, dead-ends, unbalanced categories
3. **Prioritize** — Address red-level issues first (orphans, unresolved)
4. **Refactor** — Reorganize categories, create hubs, add links
5. **Validate** — Re-run analysis to confirm improvements

## Related Pages

- `[[wiki-lint]]` — Health audit and validation (complementary: detects format/content issues)
- `[[wiki-query]]` — Search and navigate structure
- `[[wiki-meta]]` — Structure conventions and link format
