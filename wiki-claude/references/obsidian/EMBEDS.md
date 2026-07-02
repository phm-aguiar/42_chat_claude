---
summary: "Knowledge page - summary pending"
base_confidence: 0.5
lifecycle: draft
title: "Embeds"
tags: ["documentation", "tools"]
created: 2026-06-20
rag_score: 0.484
---
summary: "Knowledge page - summary pending"
base_confidence: 0.5
lifecycle: draft
# Embeds Reference

## Embed Notes

```markdown
!Note Name
!Note Name#Heading
!Note Name#^block-id
```

## Embed Images

```markdown
!image.png
!640x480    Width x Height
!300        Width only (maintains aspect ratio)
```

## External Images

```markdown
![Alt text](https://example.com/image.png)
![Alt text|300](https://example.com/image.png)
```

## Embed Audio

```markdown
!audio.mp3
!audio.ogg
```

## Embed PDF

```markdown
!document.pdf
!document.pdf#page=3
!document.pdf#height=400
```

## Embed Bases

```markdown
!BaseFile.base
!BaseFile.base#View Name
```

## Embed Lists

```markdown
!Note#^list-id
```

Where the list has a block ID:

```markdown
- Item 1
- Item 2
- Item 3

^list-id
```

## Embed Search Results

````markdown
```query
tag:#project status:done
```
````
