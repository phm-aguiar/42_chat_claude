---
title: "Microsoft Graph — conversationMember Resource"
summary: "Reference for the MS Graph conversationMember resource: add/remove/list/get members in chats and channels, role types (owner/guest), aadUserConversationMember type, and sharedWithChannelTeamInfo."
tags: [ms-graph, api-reference, members]
category: references
lifecycle: draft
provenance: ingested-from-raw
base_confidence: high
created: 2026-06-30
source: "https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember"
---
# Microsoft Graph — conversationMember Resource

## Overview

Members belong to chats and channels. An org-wide channel uses `conversationMember` for its membership model.

- Roles: `owner` and `guest`.
- `aadUserConversationMember` adds: `userId`, `displayName`, `email`, and `roles[]`.
- `@odata.type`: `#microsoft.graph.aadUserConversationMember`

## Resource Properties

| Property | Type | Description |
|---|---|---|
| `id` | string | Unique membership identifier. |
| `roles` | string[] | Collection of roles for this member. |
| `displayName` | string | AAD display name of the member. |
| `userId` | string | AAD user ID of the member. |
| `email` | string | AAD email of the member. |
| `tenantId` | string | AAD tenant ID of the member. |

## Chat Members Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/chats/{chat-id}/members` | Add member to a chat |
| GET | `/chats/{chat-id}/members` | List members of a chat |
| GET | `/chats/{chat-id}/members/{membership-id}` | Get a specific member in a chat |
| DELETE | `/chats/{chat-id}/members/{membership-id}` | Remove member from a chat |

### Additional Chat Path

- `GET /users/{user-id | user-principal-name}/chats/{chat-id}/members`
- `GET /users/{user-id | user-principal-name}/chats/{chat-id}/members/{membership-id}`

## Channel Members Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/teams/{team-id}/channels/{channel-id}/members` | Add member to a channel |
| GET | `/teams/{team-id}/channels/{channel-id}/members` | List members of a channel |
| GET | `/teams/{team-id}/channels/{channel-id}/members/{membership-id}` | Get a specific member in a channel |
| DELETE | `/teams/{team-id}/channels/{channel-id}/members/{membership-id}` | Remove member from a channel |
| GET | `/teams/{team-id}/channels/{channel-id}/allMembers` | List all members of a channel (including shared) |

> **Note** — Adding/removing channel members is only allowed for channels with `membershipType` of `private` or `shared`.

## sharedWithChannelTeamInfo

For shared channels (`membershipType: shared`), manage which teams can access the channel.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/teams/{team-id}/channels/{channel-id}/sharedWithTeams` | List teams shared with this channel |
| GET | `/teams/{team-id}/channels/{channel-id}/sharedWithTeams/{shared-with-channel-team-info-id}` | Get a specific shared-with team |
| DELETE | `/teams/{team-id}/channels/{channel-id}/sharedWithTeams/{shared-with-channel-team-info-id}` | Unshare channel with a team |

### allowedMembers (for shared channels)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/teams/{team-id}/channels/{channel-id}/sharedWithTeams/{shared-with-channel-team-info-id}/allowedMembers` | List members who can access this shared channel |

> Excludes users with role `Guest` and externally authenticated users.

## Role Values

| Role | Description |
|---|---|
| `owner` | Member with owner-level permissions for the chat or channel. | | `guest` | Guest member, typically with restricted permissions. |

## Permissions Summary

### Chat Members

| Permission Type | Least Privileged | Higher Privileges |
|---|---|---|
| Delegated (work/school) | `ChatMember.ReadWrite` | `Chat.ReadWrite` |
| Application | `Chat.Manage.Chat` | `Chat.ReadWrite.All`, `ChatMember.ReadWrite.All` |

### Chat Members (Read Only)

| Permission Type | Least Privileged | Higher Privileges |
|---|---|---|
| Delegated (work/school) | `Chat.ReadBasic` | `Chat.Read`, `Chat.ReadWrite`, `ChatMember.Read` |
| Application | `ChatMember.Read.All` | `Chat.Read.All`, `Chat.ReadWrite.All`, `ChatMember.ReadWrite.All` |

### Channel Members

| Permission Type | Least Privileged | Higher Privileges |
|---|---|---|
| Delegated (work/school) | `ChannelMember.ReadWrite.All` | — |
| Application | `ChannelMember.ReadWrite.Group` | `ChannelMember.ReadWrite.All` |

### Channel Members (Read Only)

| Permission Type | Least Privileged | Higher Privileges |
|---|---|---|
| Delegated (work/school) | `ChannelMember.Read.All` | `ChannelMember.ReadWrite.All`, `Group.Read.All` |
| Application | `ChannelMember.Read.Group` | `ChannelMember.Read.All`, `ChannelMember.ReadWrite.All` |

## Related Pages

- [[Chat]]
- [[Channel]]
- [[chatMessage]]
- [[Apps/Tabs]]
