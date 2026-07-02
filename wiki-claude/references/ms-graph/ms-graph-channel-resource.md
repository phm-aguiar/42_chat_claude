---
title: "Microsoft Graph — Channel Resource"
summary: "Reference for the MS Graph channel resource: membership types (standard, private, shared), CRUD endpoints, migration, email provisioning, and JSON schema."
tags: [ms-graph, api-reference, channel]
category: references
lifecycle: draft
provenance: ingested-from-raw
base_confidence: high
created: 2026-06-30
source: "https://learn.microsoft.com/pt-br/graph/api/resources/channel"
---
# Microsoft Graph — Channel Resource

## Overview

A **channel** is a collection of conversations and messaging endpoints that belongs to a Microsoft Teams team. Channels support three membership types (`standard`, `private`, and `shared`) and can be configured with a `layoutType` (e.g., `post`, `chat`). They also support migration mode for importing historical messages, and optional email provisioning for external communication.

---

## Resource Type Properties

| Property | Type | Description |
| --- | --- | --- |
| `id` | String | Unique identifier (`19:<id>@thread.tacv2`). |
| `displayName` | String | Name shown in the Teams client (max 50 chars). |
| `description` | String | Description text. |
| `membershipType` | String | `standard`, `private`, or `shared`. |
| `webUrl` | String | Deep-link URL to the channel in Teams. |
| `createdDateTime` | DateTimeOffset | When the channel was created. |
| `email` | String | Email address for the channel (if provisioned). |
| `isFavoriteByDefault` | Boolean | Whether the channel is a team default favorite. |
| `layoutType` | String | Layout type: `post` (default) or `chat`. |
| `isArchived` | Boolean | Whether the channel is currently archived. |

---

## membershipType Values

| Value | Description |
| --- | --- |
| `standard` | Visible to all members of the team. |
| `private` | Restricted to specific members; not team-visible. |
| `shared` | Shared across teams/tenants; supports `incomingChannels`. |

---

## Endpoints

| Method | Endpoint | Purpose | Required Permission | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/teams/{team-id}/channels` | Create a new channel |连续多年 | `Channel.Create` | `201` (standard/private) / `202` (shared) |
| `GET` | `/teams/{team-id}/channels` | List channels the user can see | `Channel.ReadBasic.All` | `200` |
| `GET` | `/teams/{team-id}/allChannels` | List all channels (including shared) | `Channel.ReadBasic.All` | `200` |
| `GET` | `/teams/{team-id}/incomingChannels` | List shared/incoming channels in this team | `Channel.ReadBasic.All` | `200` |
| `GET` | `/teams/{team-id}/channels/{channel-id}` | Get a specific channel | `Channel.ReadBasic.All` | `200` |
| `GET` | `/teams/{team-id}/primaryChannel` | Get the team's default General channel | `Channel.ReadBasic.All` | `200` |
| `POST` | `/teams/{team-id}/channels/{channel-id}/archive` | Archive this channel | `ChannelSettings.ReadWrite.All` | `202` |
| `POST` | `/teams/{team-id}/channels/{channel-id}/unarchive` | Unarchive this channel | `ChannelSettings.ReadWrite.All` | `202` |
| `POST` | `/teams/{team-id}/channels/{channel-id}/startMigration` | Begin migration mode for import | `Teamwork.Migrate.All` | `204` |
| `POST` | `/teams/{team-id}/channels/{channel-id}/completeMigration` | Finish migration mode for import | `Teamwork.Migrate.All` | `204` |
| `GET` | `/teams/{team-id}/channels/{channel-id}/doesUserHaveAccess(...)` | Check if a user can access a channel | `ChannelMember.Read.All` | `200` |
| `POST` | `/teams/{team-id}/channels/{channel-id}/provisionEmail` | Provision an email address for the channel | `ChannelSettings.ReadWrite.All` | `200` |
| `POST` | `/teams/{team-id}/channels/{channel-id}/removeEmail` | Remove the provisioned email address | `ChannelSettings.ReadWrite.All` | `204` |
| `PATCH` | `/teams/{team-id}/channels/{channel-id}` | Update channel (patch) | `Channel.ReadWrite` | `200` |
| `DELETE` | `/teams/{team-id}/channels/{channel-id}` | Delete a channel | `Channel.Delete.All` | `204` |
| `DELETE` | `/teams/{team-id}/incomingChannels/{incoming-channel-id}/$ref` | Remove an shared/incoming channel | `Channel.Delete.All` | `204` |
| `GET` | `/teams/{team-id}/channels/{channel-id}/filesFolder` | Get files folder metadata | `Files.Read.All` | `200` |
| `GET` | `/teams/{team-id}/channels/getAllRetainedMessages` | Get all retained messages | `ChannelMessage.Read.All` | `200` |
| `GET` | `/teams/{team-id}/channels/getAllMessages` | Get all messages (export API) | `ChannelMessage.Read.All` | `200` |

---

## Permissions Summary

| Operation | Lowest Privilege (Delegated) | Lowest Privilege (Application) |
| --- | --- | --- |
| Create channel | `Channel.Create` | `Channel.Create.Group` |
| List / Get channels | `Channel.ReadBasic.All` | `ChannelSettings.Read.Group` or `Channel.ReadBasic.All` |
| Update channel | `Channel.ReadWrite` | — |
| Delete channel | `Channel.Delete.All` | `Channel.Delete.Group` |
| Archive / Unarchive | `ChannelSettings.ReadWrite.All` | `ChannelSettings.ReadWrite.All` |
| startMigration / completeMigration | — (not supported delegated) | `Teamwork.Migrate.All` |
| doesUserHaveAccess | `ChannelMember.Read.All` | `ChannelMember.Read.All` |
| provisionEmail / removeEmail | `ChannelSettings.ReadWrite.All` | — |
| filesFolder | `Files.Read.All` | `Files.Read.All` |
| getAllMessages | — (not supported delegated) | `ChannelMessage.Read.All` |
| getAllRetainedMessages | — (not supported delegated) | `ChannelMessage.Read.All` |

---

## JSON Representation

```json
{
  "id": "19:4b6bed8d24574f6a9e436813cb2617d8@thread.tacv2",
  "displayName": "Architecture Discussion",
  "description": "This channel is where we debate all future architecture plans",
  "membershipType": "standard",
  "webUrl": "https://teams.microsoft.com/l/channel/19%3A4b6bed8d24574f6a9e436813cb2617d8%40thread.tacv2/Architecture%20Discussion?groupId=57fb72d0-d811-46f4-8947-305e6072eaa5",
  "createdDateTime": "2024-12-08T12:30:45.123Z",
  "email": "",
  "isFavoriteByDefault": false,
  "layoutType": "post",
  "isArchived": false
}
```

---

## Related Pages

- [[Chat]]
- [[chatMessage]]
- [[Member]]
- [[Apps-Tabs]]
