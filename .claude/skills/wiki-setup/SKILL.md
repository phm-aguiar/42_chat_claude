---
name: wiki-setup
description: Initialize a new Obsidian wiki vault with the correct directory structure, special files (index.md, log.md, hot.md, .manifest.json), .env config, and Obsidian settings. Optionally installs the session-end Stop hook for auto-capture.
when_to_use: Use when the user says "set up my wiki", "initialize obsidian", "create a new vault", or needs to configure or repair their wiki setup.
disable-model-invocation: true
allowed-tools: Read Bash Write Edit
---
# Obsidian Setup — Vault Initialization

You are setting up a new Obsidian wiki vault (or repairing an existing one).

## Step 1: Create .env

If `.env` doesn't exist, create it from `.env.example`. Ask the user for:

1. **Where should the vault live?** → `OBSIDIAN_VAULT_PATH`
   - Default: `~/Documents/obsidian-wiki-vault`
   - Must be an absolute path (after expansion)

2. **Where are your source documents?** → `OBSIDIAN_SOURCES_DIR`
   - Can be multiple paths, comma-separated
   - Default: `~/Documents`

3. **Want to import Claude history?** → `CLAUDE_HISTORY_PATH`
   - Default: auto-discovers from `~/.claude`
   - Set explicitly if Claude data is elsewhere

4. **Have QMD installed?** → `QMD_WIKI_COLLECTION` / `QMD_PAPERS_COLLECTION` / `QMD_TRANSPORT`
   - Optional. Enables semantic search in `wiki-query` and source discovery in `wiki-ingest`.
   - Default to `QMD_TRANSPORT=mcp` unless the user wants the agent to call the local `qmd` CLI directly.
   - If using CLI mode, set `QMD_CLI_SEARCH_MODE=quality` by default; suggest `balanced` if reranking is too slow.
   - If unsure, skip for now — both skills fall back to `Grep` automatically.

5. **Token budget warning threshold?** → `WIKI_TOKEN_WARN_THRESHOLD`
   - Default: `100000` (warn when full-wiki read would cost > 100K tokens)
   - Set to `0` to disable the warning entirely

6. **Enable staged writes?** → `WIKI_STAGED_WRITES`
   - Default: unset / `false` (pages written directly to their final location)
   - Set to `true` for team wikis or high-stakes domains where the human wants final say on every LLM-written page
   - When enabled: all new/updated pages land in `_staging/` first; run `/wiki-stage-commit` to review and promote them

## Step 2: Create Vault Directory Structure

```bash
mkdir -p "$OBSIDIAN_VAULT_PATH"/{concepts,entities,skills,references,synthesis,journal,projects,_archives,_raw,_staging,.obsidian}
```

- `.obsidian/` — Obsidian's own config. Creates vault recognition.
- `projects/` — Per-project knowledge (populated during ingest).
- `_archives/` — Stores wiki snapshots for rebuild/restore operations.
- `_raw/` — Staging area for unprocessed drafts. Drop rough notes here; `wiki-ingest` will promote them to proper wiki pages and delete the originals.
- `_staging/` — Review queue for LLM-written pages when `WIKI_STAGED_WRITES=true`. Pages here are not visible in Obsidian's graph until promoted via `/wiki-stage-commit`.

## Step 3: Create Special Files

### index.md

```markdown
---
title: Wiki Index
---

# Wiki Index

*This index is automatically maintained. Last updated: TIMESTAMP*

## Concepts

*No pages yet. Use `wiki-ingest` to add your first source.*

## Entities

## Skills

## References

## Synthesis

## Journal
```

### log.md

```markdown
---
title: Wiki Log
---

# Wiki Log

- [TIMESTAMP] INIT vault_path="OBSIDIAN_VAULT_PATH" categories=concepts,entities,skills,references,synthesis,journal
```

### hot.md

```markdown
---
title: Hot Cache
updated: TIMESTAMP
---

# Hot Cache

*A ~500-word semantic snapshot of recent activity. Updated after every major write operation.*

## Recent Activity

- [TIMESTAMP] INIT — vault created at OBSIDIAN_VAULT_PATH

## Active Threads

*None yet — start ingesting sources to populate.*

## Key Takeaways

*None yet.*

## Flagged Contradictions

*None yet.*
```

## Step 4: Create .obsidian Configuration

Create minimal Obsidian config for a good out-of-box experience:

### .obsidian/app.json
```json
{
  "strictLineBreaks": false,
  "showFrontmatter": false,
  "defaultViewMode": "preview",
  "livePreview": true
}
```

### .obsidian/appearance.json
```json
{
  "baseFontSize": 16
}
```

## Step 5: Recommend Obsidian Plugins

Tell the user about these recommended community plugins (they install manually):

1. **Dataview** — Query page metadata, create dynamic tables. Essential for a wiki.
2. **Graph Analysis** — Enhanced graph view for exploring connections.
3. **Templater** — If they want to create pages manually using templates.
4. **Obsidian Git** — Auto-backup the vault to a git repo.

## Step 6: Verify Setup

Run a quick sanity check:
- [ ] Vault directory exists with: `concepts/`, `entities/`, `skills/`, `references/`, `synthesis/`, `journal/`, `projects/`, `_archives/`, `_raw/`
- [ ] `index.md` exists at vault root
- [ ] `log.md` exists at vault root
- [ ] `hot.md` exists at vault root
- [ ] `.env` has `OBSIDIAN_VAULT_PATH` set
- [ ] `.obsidian/` directory exists
- [ ] `_staging/` directory exists (required even when `WIKI_STAGED_WRITES` is not set)
- [ ] Source directories (if configured) exist and are readable

Report the results and tell the user they can now:
1. Open the vault in Obsidian (File → Open Vault → select the directory)
2. Run `/wiki-status` to see what's available to ingest
3. Run `/wiki-ingest` to add their first sources
4. Run `/wiki-status` again anytime to check the delta

## Optional: Install the Stop Hook (Auto-Capture)

Ask the user: **"Want to auto-capture findings at session end?"**

If yes, install the Stop hook into their global Claude Code settings so that every session with meaningful work automatically prompts `/wiki-capture --quick` before closing.

**What the hook does:** reads the session transcript on Stop, counts file edits and shell calls, and if significant work happened, asks Claude to run `/wiki-capture --quick` once.

**Installation steps:**

1. Find the obsidian-wiki repo path. If `OBSIDIAN_WIKI_REPO` is set in config, use that. Otherwise, check common locations: `~/Documents/projects/obsidian-wiki`, `~/obsidian-wiki`, or ask the user.

2. Merge the hook entry into `~/.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash <REPO_PATH>/.claude/hooks/wiki-stop-capture.sh"
          }
        ]
      }
    ]
  }
}
```

If `~/.claude/settings.json` already has a `hooks.Stop` array, **append** the new entry rather than replacing.

3. Confirm: "Stop hook installed. Claude Code will prompt `/wiki-capture --quick` at the end of any session where you write files or run ≥ 4 shell commands."

**To uninstall:** remove the hook entry from `~/.claude/settings.json` or set `HIVEMIND_CAPTURE=false` to skip capture for a single session.

## Optional: Refresh QMD After Setup

If `QMD_WIKI_COLLECTION` is configured and the local QMD CLI is available, run `qmd update` after the initial vault files exist so the fresh vault is immediately queryable.
