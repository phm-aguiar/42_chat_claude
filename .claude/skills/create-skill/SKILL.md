---
name: create-skill
description: Creates a new Claude Code SKILL.md from scratch or migrates an existing skill from another harness (Cursor, Continue, Copilot, generic prompts, legacy .claude/commands/) to the Claude Code standard. Applies quality criteria: proper frontmatter, concise declarative body, dynamic context injection, and organized assets. Use when asked to "create a skill", "write a SKILL.md", "migrate this prompt to a skill", or "convert this command file".
when_to_use: Use when the user wants to author a new /slash-command skill, package a recurring workflow as a skill, or port an existing prompt file from Cursor (.cursorrules, .mdc), Continue (.continue/prompts/), Copilot (copilot-instructions.md), or any other harness format into a Claude Code SKILL.md.
argument-hint: "[skill-name | path/to/existing-file]"
disable-model-invocation: true
allowed-tools: Read Bash Write Edit
---

# create-skill

Creates or migrates a skill to the Claude Code quality standard.

Read `${CLAUDE_SKILL_DIR}/assets/skill-template.md` before proceeding — it is the canonical output template.

## Arguments

`$ARGUMENTS` is either:
- A new skill name (e.g. `summarize-pr`) → **create mode**
- A file path to an existing prompt/command/skill → **migrate mode**

If `$ARGUMENTS` is empty, ask the user which mode they want before proceeding.

---

## Create Mode

1. Ask the user (one message, all questions together):
   - What does the skill do? (1 sentence)
   - What would a user type to trigger it? (example phrases)
   - Does it write files, run commands, commit, deploy, or send messages? (yes → side effects)
   - What CLI tools or Claude tools does it need? (for `allowed-tools`)
   - Does it take arguments? If yes, what are they?
   - Should it run in an isolated subagent? (research/analysis tasks)
   - Scope: personal (`~/.claude/skills/`) or project (`.claude/skills/`)?

2. Identify dynamic context needs: if the skill will need git state, file contents, env info, or command output, plan `!`-injection commands.

3. Fill the template from `assets/skill-template.md`.

4. Write the skill to `<scope>/<skill-name>/SKILL.md`.

5. Create `assets/` subdirectory and any supporting files referenced in the body.

---

## Migrate Mode

1. Read the source file at `$ARGUMENTS`.

2. Identify source format:
   - **Cursor** — `.cursorrules`, `.mdc` (MDC with `---` fenced frontmatter), `.cursor/rules/`
   - **Continue** — `.continue/prompts/*.md`, `config.json` slash commands
   - **Copilot** — `.github/copilot-instructions.md`, workspace `.yml`
   - **Legacy Claude** — `.claude/commands/*.md` (no frontmatter)
   - **Generic** — plain text or markdown prompt file

3. Extract from the source:
   - Core intent → `description` + `when_to_use`
   - Step-by-step instructions → body (rewrite as declarative, strip narration)
   - Variables or `{{placeholders}}` → `arguments` field + `$name` substitutions
   - Context the skill needs (files, git, env) → `!`-injection commands
   - Side effects → `disable-model-invocation: true` if present
   - Required tools → `allowed-tools`

4. Apply the Quality Rules below.

5. Fill the template from `assets/skill-template.md`.

6. Ask the user for target scope (personal vs project) and skill name if not clear from source.

7. Write to `<scope>/<skill-name>/SKILL.md`.

---

## Quality Rules

Apply to every skill, whether new or migrated:

- **`description`** uses phrases the user would literally type, not paraphrases of the skill's internal logic.
- **Body < 500 lines.** Move reference material to `assets/` files and link from `SKILL.md`.
- **Declarative body.** State WHAT to do, not WHY or how Claude works internally. Remove all sentences beginning with "This skill…", "Use this to…", "This helps you…".
- **Dynamic context via `!`-injection.** If the skill needs file content, git state, or command output at invocation time, use `` !`command` `` instead of asking Claude to run those commands inside the skill body.
- **`disable-model-invocation: true`** whenever the skill writes files, commits, deploys, sends messages, or makes API calls.
- **`allowed-tools`** lists every tool explicitly called in the body. Use `Bash(pattern *)` syntax to scope broad permissions.
- **`context: fork`** for research, review, or analysis tasks that should run without conversation history.
- **`argument-hint`** whenever the skill takes positional arguments.
- **One task per skill.** If the source does multiple unrelated things, propose splitting.

---

## Output

After writing to disk:
1. Print the created path(s)
2. Show the final frontmatter fields and a one-line rationale for each non-obvious choice
3. Call out any quality compromises made (e.g., source was too verbose to fully condense) and why
