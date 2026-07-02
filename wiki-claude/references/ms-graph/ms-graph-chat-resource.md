---
title: "Microsoft Graph — Chat Resource"
summary: "Reference for the MS Graph chat resource: types (oneOnOne, group, meeting), CRUD endpoints, permissions, and JSON schema."
tags: ["42-chat", "documentation", "tools"]
category: references
lifecycle: draft
provenance: ingested-from-raw
base_confidence: high
created: 2026-06-30
source: "https://learn.microsoft.com/pt-br/graph/api/resources/chat"
---

## Overview

The `chat` resource in Microsoft Graph represents a conversation (chat) between one or more participants — users or applications. Chats are categorized into three types: **oneOnOne** (1:1 between two users), **group** (multi-user with a topic), and **meeting** (tied to an online meeting instance). This resource is central to the Teams messaging model and connects with chat messages, references/[[ms-graph-member-resource|members]], and references/[[ms-graph-apps-tabs-resource|apps/tabs]].

---

## Resource Type: chat

| Property | Type | Description |
|----------|------|-------------|
| `chatType` | [chatType](#chattype-values) | Specifies the type of chat. |
| `id` | string | The chat's unique identifier. Read-only. |
| `topic` | string | Chat subject or title. Only for `group` chats. |
| `createdDateTime` | dateTimeOffset | Date and time the chat was created. Read-only. |
| `lastUpdatedDateTime` | dateTimeOffset | Date and time the chat name or member list was last changed. Read-only. |
| `webUrl` | string | URL of the chat in Microsoft Teams. Read-only. |
| `isHiddenForAllMembers` | boolean | Indicates whether the chat is hidden for all its members. Read-only. |
| `tenantId` | string | The tenant identifier where the chat was created. Read-only. |
| `onlineMeetingInfo` | teamworkOnlineMeetingInfo | Represents details about an online meeting. Empty if the chat is not associated with a meeting. Read-only. |
| `viewpoint` | chatViewpoint | Caller's information about the chat, e.g. last message read time. Only populated for delegated context. |
| `migrationMode` | migrationMode | Indicates if the chat is in migration mode (`inProgress`, `completed`, `unknownFutureValue`). Defaults to `null`. |

> **Note:** Excluded from this table per consolidation spec: `originalCreatedDateTime`, `createdBy`.

---

## chatType Values

| Member | Description |
|--------|-------------|
| `oneOnOne` | A 1:1 chat. Member list size is fixed; members cannot be removed or added. |
| `group` | A group chat. Member list (minimum two people) can be updated later. |
| `meeting` | Chat associated with an online meeting; created as part of meeting creation. |
| `unknownFutureValue` | Evolvable enumeration sentinel. Do not use. |

---

## Endpoints

| Method | Endpoint | Purpose | Required Permission (least-privileged delegated) | Response |
|--------|----------|---------|--------------------------------------------------|----------|
| POST | `/chats` | Create a new chat. | `Chat.Create` | 201 Created |
| GET | `/chats` | List all chats for the signed-in user. | `Chat.ReadBasic` / `Chat.Read` | 200 OK |
| GET | `/me/chats` | List chats for current user (delegated). | `Chat.ReadBasic` / `Chat.Read` | 200 OK |
| GET | `/users/{id}/chats` | List chats for a specific user. | `Chat.ReadBasic` / `Chat.Read` | 200 OK |
| GET | `/chats/{chat-id}` | Get a single chat. | `Chat.ReadBasic` | 200 OK |
| PATCH | `/chats/{chat-id}` | Update a chat (topic only, group chats). | `Chat.ReadWrite` | 200 OK |
| DELETE | `/chats/{chat-id}` | Soft-delete a chat (admin only). | `Chat.ManageDeletion.All` | 204 No Content |
| POST | `/chats/{chat-id}/removeAllAccessForUser` | Remove all access to a chat for a user. | `Chat.ReadWrite.All` | 200/204 |
| GET | `/users/{id}/teamwork/installedApps/{app-id}/chat` | Get the one-on-one chat between a user and an app. | `TeamsAppInstallation.ReadForUser` | 200 OK |
| GET | `/chats/{chat-id}/members` | List members of a chat. | `Chat.ReadBasic` | 200 OK |
| GET | `/chats/{chat-id}/messages` | List messages in a chat. | `Chat.Read` | 200 OK |
| GET | `/chats/{chat-id}/installedApps` | List applications installed in a chat. | `Chat.Read` | 200 OK |

---

## Permissions Summary

| Operation | Least-Privileged Delegated Permission |
|-----------|---------------------------------------|
| Create chat | `Chat.Create` |
| List chats | `Chat.ReadBasic` |
| Get chat | `Chat.ReadBasic` |
| Update chat | `Chat.ReadWrite` |
| Delete chat | `Chat.ManageDeletion.All` |
| removeAllAccessForUser | `Chat.ReadWrite.All` |
| Get user-app chat | `TeamsAppInstallation.ReadForUser` |
| List members | `Chat.ReadBasic` |
| List messages | `Chat.Read` |
| List installed apps | `Chat.Read` |

---

## JSON Representation

```json
{
  "chatType": "group",
  "topic": "Project Alpha",
  "createdDateTime": "2020-12-04T23:11:16.175Z",
  "lastUpdatedDateTime": "2020-12-04T23:12:19.943Z",
  "id": "19:1c5b01696d2e4a179c292bc9cf04e63b@thread.v2"
}
```

---

## Related Pages

- chatMessage Resource
- references/[[ms-graph-channel-resource|Channel Resource]]
- references/[[ms-graph-member-resource|Conversation Members]]
- references/[[ms-graph-apps-tabs-resource|Apps, Tabs & Pinned Messages]]
