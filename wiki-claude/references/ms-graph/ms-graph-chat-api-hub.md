---
title: "Microsoft Graph — Chat & Channel API Reference Hub"
summary: "Central index for Microsoft Graph v1.0 Chat/Channel API resources consolidated from raw docs. Covers chats, channels, messages, members, apps/tabs, and pinned messages."
tags: ["documentation", "hub", "teams", "tools"]
category: references
lifecycle: draft
provenance: ingested-from-raw
base_confidence: high
created: 2026-06-30
source: "https://learn.microsoft.com/pt-br/graph/api/overview"
---
# Microsoft Graph — Chat & Channel API Reference Hub

## Purpose

This hub indexes the consolidated Microsoft Graph API reference pages for Teams chat and channel operations. Source: 66 raw documentation pages from `wiki-claude/_raw/` (MS Graph v1.0 PT-BR) distilled into 5 resource pages.

**Scope:** Chat, Channel, chatMessage, conversationMember, and Apps/Tabs resources.  
**Excluded:** Team-level operations, calendar, calls, meetings (outside chat scope).  
**Relevance to 42 Chat:** Feature 103 (Messaging Expansion) uses chat/message/member patterns aligned with these MS Graph APIs.

---

## Resource Pages

| Resource | Page | Key Operations |
|----------|------|----------------|
| **Chat** | `[[references/[[ms-graph-chat-resource]]\|Chat Resource]]` | Create/List/Get/Update/Delete chat, `chatType` (oneOnOne/group/meeting), removeAllAccessForUser, user-app chat |
| **Channel** | `[[references/ms-graph-channel-resource\|Channel Resource]]` | Create/List/Get/Update/Delete channel, `membershipType` (standard/private/shared), migration, archive/unarchive, email provisioning |
| **chatMessage** | `[[references/ms-graph-chat-message-resource\|chatMessage Resource]]` | Send/List/Get messages, replies, reactions, mentions, soft delete, delta API, pagination |
| **Members** | `[[references/ms-graph-member-resource\|conversationMember Resource]]` | Add/Remove/List/Get members in chats and channels, roles (owner/guest), sharedWithChannelTeamInfo |
| **Apps/Tabs/Pinned** | `[[references/ms-graph-apps-tabs-resource\|Apps, Tabs & Pinned Messages]]` | Install/Upgrade/Remove apps (teamsApp), add/remove tabs (teamsTab), pin/unpin messages |

---

## Quick Endpoint Reference

### Chat Operations
| Operation | Endpoint | Key Permissions |
|-----------|----------|-----------------|
| Create chat | `POST /chats` | `Chat.Create` |
| List chats | `GET /chats`, `GET /me/chats` | `Chat.ReadBasic` |
| Get chat | `GET /chats/{id}` | `Chat.ReadBasic` |
| Update chat (topic) | `PATCH /chats/{id}` | `Chat.ReadWrite` |
| Delete chat | `DELETE /chats/{id}` | `Chat.ManageDeletion.All` |
| Remove user access | `POST /chats/{id}/removeAllAccessForUser` | `Chat.ReadWrite.All` |

### Channel Operations
| Operation | Endpoint | Key Permissions |
|-----------|----------|-----------------|
| Create channel | `POST /teams/{team-id}/channels` | `Channel.Create` |
| List channels | `GET /teams/{team-id}/channels` | `Channel.ReadBasic.All` |
| Get channel | `GET /teams/{team-id}/channels/{id}` | `Channel.ReadBasic.All` |
| Update channel | `PATCH /teams/{team-id}/channels/{id}` | `Channel.ReadWrite.All` |
| Delete channel | `DELETE /teams/{team-id}/channels/{id}` | `Channel.ReadWrite.All` |
| Archive/Unarchive | `POST /.../channels/{id}/archive` | `Channel.ReadWrite.All` |

### Message Operations
| Operation | Endpoint | Key Permissions |
|-----------|----------|-----------------|
| Send channel message | `POST /teams/{id}/channels/{id}/messages` | `ChannelMessage.Send` |
| List channel messages | `GET /teams/{id}/channels/{id}/messages` | `ChannelMessage.Read.All` |
| Send chat message | `POST /chats/{id}/messages` | `Chat.ReadWrite` |
| List chat messages | `GET /chats/{id}/messages` | `Chat.Read` |
| Soft delete | `DELETE /.../messages/{id}` | `Chat.ReadWrite` / `ChannelMessage.Send` |
| Delta (all user messages) | `GET /chats/getAllMessages?delta` | `Chat.Read.All` (app-only) |

### Member Operations
| Operation | Endpoint | Key Permissions |
|-----------|----------|-----------------|
| Add chat member | `POST /chats/{id}/members` | `Chat.ReadWrite` |
| List chat members | `GET /chats/{id}/members` | `Chat.ReadBasic` |
| Add channel member | `POST /teams/{id}/channels/{id}/members` | `ChannelMember.ReadWrite.All` |
| List channel members | `GET /teams/{id}/channels/{id}/members` | `ChannelMember.Read.All` |

---

## Related Wiki Sections

- `[[projects/42_chat/features/feature-103-ms-graph-messaging\|Feature 103 — Expansão de Mensageria]]` — uses these API patterns
- `[[references/42-api-endpoints\|42 Intra API v2 — Endpoints Reference]]` — separate API (42 Intra, not MS Graph)
- `[[references/websocket-production\|WebSocket Production]]` — real-time layer for 42 Chat

---

## Source Traceability

All 5 resource pages derived from `wiki-claude/_raw/` (66 files, MS Graph v1.0 PT-BR, ingested 2026-06-30).  
Raw files retained in `_raw/` per consolidation policy.