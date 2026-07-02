---
title: "Obsidian CLI Reference"
category: references
tags:
  - obsidian
  - cli
  - tooling
  - automation
source: "https://obsidian.md/help/cli"
ingested_at: "2026-07-01"
base_confidence: 0.95
lifecycle: published
tier: supporting
summary: "Complete reference for Obsidian CLI commands — control Obsidian from terminal for scripting, automation, and plugin development."
---

# Obsidian CLI

Command-line interface to control Obsidian from your terminal for scripting, automation, and integration with external tools. Requires Obsidian 1.12+ installer with CLI enabled in Settings → General.

## Installation & Setup

```bash
# Enable in Obsidian: Settings → General → Command line interface
# Follow prompt to register CLI (adds to PATH)

# Verify installation
obsidian help
obsidian version
```

> **Requirement:** Obsidian app must be running. CLI connects to the running instance.

## Usage Modes

| Mode | Command |
|------|---------|
| Single command | `obsidian <command> [args]` |
| TUI (interactive) | `obsidian` then type commands directly |

TUI supports autocomplete, history (`Ctrl+R`), and keyboard shortcuts.

## Targeting

```bash
# Target specific vault
obsidian vault="My Vault" daily

# Target file by name (wikilink resolution) or exact path
obsidian read file=Recipe
obsidian read path="Templates/Recipe.md"

# Copy output to clipboard
obsidian search query="TODO" --copy
```

## Core Command Reference

### General
| Command | Description |
|---------|-------------|
| `help [<command>]` | Show all commands or help for specific command |
| `version` | Show Obsidian version |
| `reload` | Reload app window |
| `restart` | Restart app |

### Bases (Obsidian 1.8+)
| Command | Description |
|---------|-------------|
| `bases` | List all `.base` files |
| `base:views` | List views in current base |
| `base:create` | Create item in base (file, path, view, name, content, open, newtab) |
| `base:query` | Query base (file, path, view, format=json\|csv\|tsv\|md\|paths) |

### Bookmarks
| Command | Description |
|---------|-------------|
| `bookmarks` | List bookmarks (total, verbose, format) |
| `bookmark` | Add bookmark (file, subpath, folder, search, url, title) |

### Command Palette & Hotkeys
| Command | Description |
|---------|-------------|
| `commands [filter]` | List command IDs |
| `command id=<id>` | Execute command by ID |
| `hotkeys [total\|verbose]` | List hotkeys |
| `hotkey id=<id>` | Get hotkey for command |

### Daily Notes
| Command | Description |
|---------|-------------|
| `daily` | Open daily note |
| `daily:path` | Get daily note path |
| `daily:read` | Read daily note |
| `daily:append` | Append to daily note (content, inline, open) |
| `daily:prepend` | Prepend to daily note |

### File History
| Command | Description |
|---------|-------------|
| `diff` | Compare file versions (file, path, from, to, filter=local\|sync) |
| `history` | List local history versions |
| `history:list` | List all files with local history |
| `history:read` | Read local history version |
| `history:restore` | Restore local history version |
| `history:open` | Open file recovery panel |

### Files & Folders
| Command | Description |
|---------|-------------|
| `file` | Show file info (path, name, extension, size, timestamps) |
| `files` | List files (folder, ext, total) |
| `folder` | Show folder info (path, info=files\|folders\|size) |
| `folders` | List folders (folder, total) |
| `open` | Open file (file, path, newtab) |
| `create` | Create/overwrite file (name, path, content, template, overwrite, open, newtab) |
| `read` | Read file contents |
| `append` | Append to file (content, inline) |
| `prepend` | Prepend after frontmatter (content, inline) |
| `move` | Move/rename file (to, updates links if enabled) |
| `rename` | Rename file (name, preserves extension) |
| `delete` | Delete file (permanent to skip trash) |

### Links
| Command | Description |
|---------|-------------|
| `backlinks` | List backlinks (counts, total, format) |
| `links` | List outgoing links (total) |
| `unresolved` | List unresolved links (total, counts, verbose, format) |
| `orphans` | List files with no incoming links (total) |
| `deadends` | List files with no outgoing links (total) |

### Outline
| Command | Description |
|---------|-------------|
| `outline` | Show headings (format=tree\|md\|json, total) |

### Plugins
| Command | Description |
|---------|-------------|
| `plugins` | List installed (filter=core\|community, versions, format) |
| `plugins:enabled` | List enabled plugins |
| `plugins:restrict` | Toggle restricted mode (on/off) |
| `plugin id=<id>` | Get plugin info |
| `plugin:enable\|disable id=<id>` | Enable/disable plugin |
| `plugin:install id=<id>` | [[Install]] community plugin |
| `plugin:uninstall id=<id>` | Uninstall plugin |
| `plugin:reload id=<id>` | Reload plugin (dev) |

### Properties
| Command | Description |
|---------|-------------|
| `aliases` | List aliases (total, verbose, active) |
| `properties` | List properties (name, sort, format, total, counts, active) |
| `property:set` | Set property (name, value, type=text\|list\|number\|checkbox\|date\|datetime) |
| `property:remove` | Remove property |
| `property:read` | Read property value |

### Publish
| Command | Description |
|---------|-------------|
| `publish:site` | Show publish site info |
| `publish:list` | List published files |
| `publish:status` | List changes (new, changed, deleted) |
| `publish:add` | Publish file or all changed |
| `publish:remove` | Unpublish file |
| `publish:open` | Open on published site |

### Random Notes
| Command | Description |
|---------|-------------|
| `random` | Open random note (folder, newtab) |
| `random:read` | Read random note |

### Search
| Command | Description |
|---------|-------------|
| `search` | Search vault (query, path, limit, format, total, case) |
| `search:context` | Search with context lines (grep-style output) |
| `search:open` | Open search view |

### Sync
| Command | Description |
|---------|-------------|
| `sync` | Pause/resume sync (on/off) |
| `sync:status` | Show sync status and usage |
| `sync:history` | List sync versions (total) |
| `sync:read` | Read sync version |
| `sync:restore` | Restore sync version |
| `sync:open` | Open sync history |
| `sync:deleted` | List deleted files in sync |

### Tags
| Command | Description |
|---------|-------------|
| `tags` | List tags (sort, total, counts, format, active) |
| `tag name=<tag>` | Get tag info (total, verbose) |

### Tasks
| Command | Description |
|---------|-------------|
| `tasks` | List tasks (file, path, status, total, done, todo, verbose, format, active, daily) |
| `task` | Show/update task (ref, file, path, line, status, toggle, daily, done, todo) |

### Templates
| Command | Description |
|---------|-------------|
| `templates` | List templates (total) |
| `template:read` | Read template (name, title, resolve) |
| `template:insert` | Insert template into active file |

### Themes & Snippets
| Command | Description |
|---------|-------------|
| `themes` | List themes (versions) |
| `theme` | Show active theme |
| `theme:set name=<name>` | Set active theme |
| `theme:install\|uninstall name=<name>` | [[Install]]/uninstall theme |
| `snippets` | List snippets |
| `snippets:enabled` | List enabled snippets |
| `snippet:enable\|disable name=<name>` | Enable/disable snippet |

### Unique Notes
| Command | Description |
|---------|-------------|
| `unique` | Create unique note (name, content, paneType, open) |

### Vault
| Command | Description |
|---------|-------------|
| `vault` | Show vault info (info=name\|path\|files\|folders\|size) |
| `vaults` | List known vaults (total, verbose) |
| `vault:open name=<name>` | Switch vault (TUI only) |

### Web Viewer
| Command | Description |
|---------|-------------|
| `web url=<url>` | Open URL in web viewer (newtab) |

### Word Count
| Command | Description |
|---------|-------------|
| `wordcount` | Count words/characters (words, characters) |

### Workspace
| Command | Description |
|---------|-------------|
| `workspace` | Show workspace tree (ids) |
| `workspaces` | List saved workspaces (total) |
| `workspace:save name=<name>` | Save current layout |
| `workspace:load name=<name>` | Load workspace |
| `workspace:delete name=<name>` | Delete workspace |
| `tabs` | List open tabs (ids) |
| `tab:open` | Open new tab (group, file, view) |
| `recents` | List recent files (total) |

## Developer Commands

| Command | Description |
|---------|-------------|
| `devtools` | Toggle Electron dev tools |
| `dev:debug` | Attach/detach Chrome DevTools Protocol (on/off) |
| `dev:cdp` | Run CDP command (method, params JSON) |
| `dev:errors` | Show JS errors (clear) |
| `dev:screenshot path=<file>` | Take screenshot (base64 PNG) |
| `dev:console` | Show console messages (limit, level, clear) |
| `dev:css` | Inspect CSS (selector, prop) |
| `dev:dom` | Query DOM (selector, attr, css, total, text, inner, all) |
| `dev:mobile` | Toggle mobile emulation (on/off) |
| `eval code=<js>` | Execute JavaScript in app console |

## Common Workflows

```bash
# Daily note workflow
obsidian daily:append content="- [ ] Task from CLI"
obsidian tasks daily todo

# Search & act
obsidian search query="meeting" --copy
obsidian create name="Meeting Notes" content="# Meeting\n\nNotes here"

# Plugin development
obsidian plugin:reload id=my-plugin
obsidian eval code="app.vault.getFiles().length"

# Vault inspection
obsidian files ext=md total
obsidian tags counts sort=count
obsidian orphans total
```

## Platform Notes

| Platform | CLI Binary Location |
|----------|---------------------|
| macOS | `/usr/local/bin/obsidian` (symlink) |
| Linux | `~/.local/bin/obsidian` (copied binary) |
| Windows | `Obsidian.com` redirector in install folder |

Restart terminal after registration for PATH changes to take effect.

## Related Pages

- references/toolkits/obsidian/[[EMBEDS]] — Embed syntax reference
- references/toolkits/obsidian/PROPERTIES — Properties/YAML frontmatter
- references/toolkits/obsidian/[[CALLOUTS]] — Callout syntax
- wiki-meta/wiki-architecture — Wiki structure and conventions