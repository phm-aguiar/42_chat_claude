---
feature_id: 104
slug: wiki-raw-ingestion
status: accepted
approved: true
author: phm-aguiar
date: 2026-06-30
type: wiki-maintenance
previous_feature: 103-ms-graph-messaging
---

# Feature 104 — Wiki Raw Page Ingestion (Checkpoint)

## Goal

Consolidate os 66 arquivos `_raw/` do **Microsoft Graph v1.0 PT-BR** em páginas wiki interconectadas.

## State at 2026-06-30T22:45Z

**Raw inventory:** 66 arquivos em `wiki-claude/_raw/` — MS Graph API docs (Chat, Channel, chatMessage, Members, Apps/Tabs).

**Planned output:** 6 páginas no vault `wiki-claude/references/`:

1. `ms-graph-chat-resource.md` (chat CRUD + resource schema)
2. `ms-graph-channel-resource.md` (channel CRUD + migration + email)
3. `ms-graph-chat-message-resource.md` (chatMessage + soft delete + delta)
4. `ms-graph-member-resource.md` (conversationMember + sharedWithChannelTeamInfo)
5. `ms-graph-apps-tabs-resource.md` (installedApps + tabs + pinned)
6. `ms-graph-chat-api-hub.md` (index linking all 5)

## Pending Tasks

Đã hoàn thành:
- [x] **T001:** Processar domínio Chat Resource (10 arquivos → page 1) — **DONE** em 2026-06-30T22:03Z, 105 linhas, `references/ms-graph-chat-resource.md`
- [x] **T002:** Processar domínio Channel Resource (~18 arquivos → page 2) — **DONE** em 2026-06-30T22:07Z, 115 linhas, `references/ms-graph-channel-resource.md`
- [x] **T003:** Processar domínio chatMessage (~9 arquivos → page 3) — **DONE** em 2026-06-30T22:09Z, 157 linhas, `references/ms-graph-chat-message-resource.md`
- [x] **T004:** Processar domínio Members (~14 arquivos → page 4) — **DONE** em 2026-06-30T22:12Z, 118 linhas, `references/ms-graph-member-resource.md`
- [x] **T005:** Processar domínio Apps/Tabs (~10 arquivos → page 5) — **DONE** em 2026-06-30T22:12Z, 185 linhas, `references/ms-graph-apps-tabs-resource.md`
- [x] **T006:** Criar hub index `ms-graph-chat-api-hub.md` linkando pages 1–5 — **DONE** em 2026-06-30T22:17Z, 88 linhas, `references/ms-graph-chat-api-hub.md`

Đang chờ xử lý:
- [ ] **T007:** Atualizar `wiki-claude/index.md` adicionando as 5 novas entradas na seção `references/`
- [ ] **T008:** Atualizar `.manifest.json` com `ingested_at` para os 66 raw sources
- [ ] **T009:** Rodar `wiki-lint --fast` para validar wikilinks

## Resume Point

T001–T006 concluídos. Próximo: atualizar index.md (T007), manifest.json (T008), rodar lint (T009).
