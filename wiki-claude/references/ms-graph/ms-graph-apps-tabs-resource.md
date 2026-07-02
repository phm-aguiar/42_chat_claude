---
title: "Microsoft Graph — Apps, Tabs & Pinned Messages in Chat/Channel"
summary: "Reference for MS Graph installedApps (teamsApp), tabs, and pinned messages in chats and channels: install, upgrade, remove apps; pin/unpin messages; add/remove tabs."
tags: ["apps", "documentation", "tabs", "tools"]
category: references
lifecycle: draft
provenance: ingested-from-raw
base_confidence: high
created: 2026-06-30
source: "https://learn.microsoft.com/pt-br/graph/api/resources/teamsappinstallation"
---
# Microsoft Graph — Apps, Tabs & Pinned Messages in Chat/Channel

## Overview

Chats and channels support installed apps (`teamsAppInstallation`), tabs (`teamsTab`), and pinned messages (`pinnedChatMessageInfo`).

- Resource names differ in the endpoint path: `installedApps`, `tabs`, `pinnedMessages`.
- The examples in the raw sources focus on **team/channel** paths; analogous **chat** paths also exist under `/chats/{chat-id}`.

---

## Apps (`teamsApp` / `teamsAppInstallation`)

### Team/Channel Endpoints

| Operation | Method | Endpoint |
|---|---|---|
| List enabled apps | GET | `/teams/{team-id}/channels/{channel-id}/enabledApps` |
| Install app | POST | `/teams/{team-id}/channels/{channel-id}/enabledApps/$ref` |
| Get enabled app | GET | `/teams/{team-id}/channels/{channel-id}/enabledApps/{app-id}` |
| Remove (disable) app | DELETE | `/teams/{team-id}/channels/{channel-id}/enabledApps/{app-id}/$ref` |

### Chat Counterparts

| Operation | Method | Endpoint |
|---|---|---|
| List | GET | `/chats/{chat-id}/installedApps` |
| Install | POST | `/chats/{chat-id}/installedApps` |
| Get | GET | `/chats/{chat-id}/installedApps/{installation-id}` |
| Upgrade | POST | `/chats/{chat-id}/installedApps/{installation-id}/upgrade` |
| Remove | DELETE | `/chats/{chat-id}/installedApps/{installation-id}` |

### Key Notes
- `enabledApps` (channel) operates on `teamsApp` references by ID; `installedApps` (chat) returns `teamsAppInstallation` objects.
- Install returns `204 No Content`; remove also returns `204 No Content`.
- Channel `enabledApps` operations require `membershipType: shared`. Chat operations do not have this restriction.

---

## Tabs (`teamsTab`)

### Team/Channel Endpoints

| Operation | Method | Endpoint |
|---|---|---|
| List tabs | GET | `/teams/{team-id}/channels/{channel-id}/tabs` |
| Add tab | POST | `/teams/{team-id}/channels/{channel-id}/tabs` |
| Get tab | GET | `/teams/{team-id}/channels/{channel-id}/tabs/{tab-id}` |
| Update tab | PATCH | `/teams/{team-id}/channels/{channel-id}/tabs/{tab-id}` |
| Remove tab | DELETE | `/teams/{team-id}/channels/{channel-id}/tabs/{tab-id}` |

### Chat Counterparts

| Operation | Method | Endpoint |
|---|---|---|
| List | GET | `/chats/{chat-id}/tabs` |
| Add | POST | `/chats/{chat-id}/tabs` |
| Get | GET | `/chats/{chat-id}/tabs/{tab-id}` |
| Update | PATCH | `/chats/{chat-id}/tabs/{tab-id}` |
| Remove | DELETE | `/chats/{chat-id}/tabs/{tab-id}` |

### Key Notes
- To add a tab, the app must be pre-installed and its manifest must define `configurableTabs`.
- Static tabs matching the team scope are pinned by default if the app manifest defines them.
- The Files tab is native to a channel or chat and is **not** returned by this API.
- Supports OData `$filter`, `$select`, and `$expand`.

---

## Pinned Messages (`pinnedChatMessageInfo`)

### Chat Endpoints

| Operation | Method | Endpoint |
|---|---|---|
| List pinned messages | GET | `/chats/{chat-id}/pinnedMessages` |
| Pin a message | POST | `/chats/{chat-id}/pinnedMessages` |
| Unpin a message | DELETE | `/chats/{chat-id}/pinnedMessages/{pinnedChatMessageInfo-id}` |

### Key Notes
- Pinned messages are read via `chatMessage` collections under `pinnedMessages`.
- No channel counterpart; pinned messages are a chat-only concept in this API surface.

---

## Permissions Summary

### Apps (`teamsAppInstallation` / enabledApps)

| Operation | Delegated (least privilege) | Application (least privilege) |
|---|---|---|
| List enabled | `TeamsAppInstallation.ReadForTeam` | `TeamsAppInstallation.Read.Group` |
| Get enabled | `TeamsAppInstallation.ReadForTeam` | `TeamsAppInstallation.Read.Group` |
| Install | `TeamsAppInstallation.ManageSelectedForTeam` | `TeamsAppInstallation.ManageSelectedForTeam.All` |
| Remove | `TeamsAppInstallation.ManageSelectedForTeam` | `TeamsAppInstallation.ManageSelectedForTeam.All` |

### Tabs (`teamsTab`)

| Operation | Delegated (least privilege) | Application (least privilege) |
|---|---|---|
| List | `TeamsTab.Read.All` | `TeamsTab.Read.Group` |
| Get | `TeamsTab.Read.All` | `TeamsTab.Read.Group` |
| Add | `TeamsTab.Create` | `TeamsTab.Create.Group` |
| Update | `TeamsTab.ReadWriteSelfForTeam` | `TeamsTab.ReadWrite.Group` |
| Remove | `TeamsTab.ReadWriteSelfForTeam` | `TeamsTab.Delete.Group` |

### Pinned Messages (`pinnedChatMessageInfo`)

| Operation | Delegated (least privilege) | Application (least privilege) |
|---|---|---|
| List | `Chat.Read` | `Chat.Read.All` |
| Pin | `ChatMessage.ReadWrite` | `ChatMessage.ReadWrite.All` |
| Unpin | `ChatMessage.ReadWrite` | `ChatMessage.ReadWrite.All` |

---

## Related Pages

- `[[Chat — Microsoft Graph]]`
- `[[Channel — Microsoft Graph]]`
- `[[chatMessage — Microsoft Graph]]`
- `[[ConversationMember — Microsoft Graph]]`
