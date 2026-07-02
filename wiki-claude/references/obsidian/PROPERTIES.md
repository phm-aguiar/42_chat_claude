---
summary: "Knowledge page - summary pending"
base_confidence: 0.5
lifecycle: draft
title: "Properties"
tags: ["documentation", "tools"]
created: 2026-06-20
rag_score: 0.4867
---
summary: "Knowledge page - summary pending"
base_confidence: 0.5
lifecycle: draft
# Properties (Frontmatter) Reference

Properties use YAML frontmatter at the start of a note:

```yaml
---
summary: "Knowledge page - summary pending"
base_confidence: 0.5
lifecycle: draft
title: My Note Title
date: 2024-01-15
tags:
  - project
  - important
aliases:
  - My Note
  - Alternative Name
cssclasses:
  - custom-class
status: in-progress
rating: 4.5
completed: false
due: 2024-02-01T14:30:00
---
summary: "Knowledge page - summary pending"
base_confidence: 0.5
lifecycle: draft
```

## Property Types

| Type | Example |
|------|---------|
| Text | `title: My Title` |
| Number | `rating: 4.5` |
| Checkbox | `completed: true` |
| Date | `date: 2024-01-15` |
| Date & Time | `due: 2024-01-15T14:30:00` |
| List | `tags: [one, two]` or YAML list |
| Links | `related: "[[Other Note]]"` |

## Default Properties

- `tags` - Note tags (searchable, shown in graph view)
- `aliases` - Alternative names for the note (used in link suggestions)
- `cssclasses` - CSS classes applied to the note in reading/editing view

## Tags

```markdown
#tag
#nested/tag
#tag-with-dashes
#tag_with_underscores
```

Tags can contain: letters (any language), numbers (not first character), underscores `_`, hyphens `-`, forward slashes `/` (for nesting).

In frontmatter:

```yaml
---
summary: "Knowledge page - summary pending"
base_confidence: 0.5
lifecycle: draft
tags:
  - tag1
  - nested/tag2
---
summary: "Knowledge page - summary pending"
base_confidence: 0.5
lifecycle: draft
```
