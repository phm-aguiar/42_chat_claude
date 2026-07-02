---
title: "Microsoft Graph — chatMessage Resource"
summary: "Reference for the MS Graph chatMessage resource: properties (body, from, reactions, mentions, messageType), endpoints for channels and chats, soft delete, delta API, and JSON schema."
tags: [ms-graph, api-reference, chat-message]
category: references
lifecycle: draft
provenance: ingested-from-raw
base_confidence: high
created: 2026-06-30
source: "https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage"
---

# Microsoft Graph — chatMessage Resource

## Overview

The `chatMessage` resource represents a single chat message in a channel or chat. A message can be a root message or part of a reply thread, indicated by the `replyToId` property. The resource supports reactions, mentions, soft delete, and change notifications.

**Namespace:** `microsoft.graph`

## Resource Properties

| Property | Type | Description |
|----------|------|-------------|
| id | String | Read-only. Unique ID of the message within a conversation/channel/reply thread. |
| body | itemBody | Plain text or HTML representation of the message content. |
| from | chatMessageFromIdentitySet | Sender details (can only be set during migration). |
| chatId | String | The chat ID where the message was sent. |
| channelIdentity | channelIdentity | Team and channel identity if the message was sent in a channel. |
| createdDateTime | dateTimeOffset | Timestamp when the message was created. |
| deletedDateTime | dateTimeOffset | Read-only. Timestamp when the message was soft-deleted; null if not deleted. |
| importance | String | Message importance: `normal`, `high`, `urgent`. |
| lastEditedDateTime | dateTimeOffset | Read-only. Timestamp when the message was last edited. |
| lastModifiedDateTime | dateTimeOffset | Read-only. Timestamp when the message was created or modified (including reactions). |
| messageType | chatMessageType | Type of chat message (see Enum below). |
| reactions | chatMessageReaction collection | Reactions on the message (e.g. Like). |
| mentions | chatMessageMention collection | List of entities mentioned in the message (users, bots, teams, channels, chats, tags). |
| replyToId | String | Read-only. ID of the parent/root message (channel only). |
| subject | String | Subject line of the message, in plain text. |
| webUrl | String | Read-only. Link to the message in Microsoft Teams. |

## messageType Enum

| Value | Description |
|-------|-------------|
| message | Standard text/HTML message. |
| chatEvent | Event embedded in chat (e.g., member added, chat renamed). |
| typing | Typing indicator. |
| systemEventMessage | Auto-generated system messages (e.g., channel created, member added). |
| unknownFutureValue | Reserved for future extensibility. |

## Endpoints

| Method | Endpoint | Purpose | Permission |
|--------|----------|---------|------------|
| GET | /teams/{team-id}/channels/{channel-id}/messages | List channel messages | Channel List Messages -- Delegated: ChannelMessage.Read.All or Group.Read.All; Application: ChannelMessage.Read.Group or ChannelMessage.Read.All |
| POST | /teams/{team-id}/channels/{channel-id}/messages | Send a new message in a channel | Send ChatMessage -- Delegated: ChannelMessage.Send; Application: Teamwork.Migrate.All |
| GET | /teams/{team-id}/channels/{channel-id}/messages/{id} | Get a specific message in a channel | Channel List Messages -- Delegated: ChannelMessage.Read.All or Group.Read.All; Application: ChannelMessage.Read.Group or ChannelMessage.Read.All |
| POST | /teams/{team-id}/channels/{channel-id}/messages/{id}/replies | Reply to a message in a channel | Send Chat Message -- Delegated: ChannelMessage.Send; Application: Teamwork.Migrate.All |
| GET | /chats/{id}/messages | List chat messages | List Chat Messages -- Delegated: Chat.Read; Application: Chat.Read.All or Chat.ReadWrite.All |
| POST | /chats/{id}/messages | Send a new message in a chat | Send Chat Message -- Delegated: ChatMessage.Send; Application: Teamwork.Migrate.All |
| GET | /chats/{id}/messages/{id} | Get a specific message in a chat | List Chat Messages -- Delegated: Chat.Read; Application: Chat.Read.All or Chat.ReadWrite.All |
| DELETE | /teams/{tid}/channels/{cid}/messages/{id} and /chats/{cid}/messages/{id} | Soft delete a message -- returns 204 | Delegated: ChannelMessage.ReadWrite.All or Chat.ReadWrite; Application: ChannelMessage.ReadWrite.All or Chat.ReadWrite.All |
| GET | /chats/getAllMessages | App-only -- get all messages across chats for a user | App-Only -- Application: Chat.Read.All or Chat.ReadWrite.All |
| GET | /chats/getAllMessages?delta | Delta API -- get all messages across chats for a user | App-Only -- Application: Chat.Read.All or Chat.ReadWrite.All |

## Soft Delete and Undo

| Action | Endpoint | Response |
|--------|----------|----------|
| Soft Delete | DELETE /chats/{id}/messages/{id} | 204 No Content |
| Soft Delete | DELETE /teams/{tid}/channels/{cid}/messages/{mid} | 204 No Content |
| Restore (Undo) | POST /chats/{id}/messages/{id}/undoSoftDelete | 204 No Content |
| Restore (Undo) | POST /teams/{tid}/channels/{cid}/messages/{mid}/undoSoftDelete | 204 No Content |

**Note:** On soft delete, deletedDateTime is set to the current timestamp. The message is hidden by default. Undo will reset it back to null and clear the soft delete.

## Pagination

| Feature | Description |
|---------|-------------|
| $top | Controls items per page. Default is 50 for channel messages and 20 for chat messages. |
| $expand=replies | Expands the replies of a message inline (can include up to 200 replies). |
| nextLink | Returned when more pages are available. Use the URL to fetch the next page. |
| replies@odata.nextLink | Returned when a message has more replies than the default page size (can be up to 1000). |
| $filter | Filter by lastModifiedDateTime using gt and lt operators. |

**Note:** $top is optional. If not provided, the default of 50 (for channel messages) or 20 (for chat messages) will be used.

## Delta API

The Delta API (/chats/getAllMessages?delta) allows applications to query for new or updated messages across all chats.

### Key Points
- **Scope:** App-only. Requires Chat.Read.All permission.
- **Limitations:** Only returns messages from the last 8 months.
- **Sync Modes:** Supports both full synchronization (to get all messages across chats) and incremental synchronization (to get messages added or modified since the last delta token).
- **Delta Token:** Returned as @odata.deltaLink. Save and re-use to fetch only new changes.

### Query Parameters for Delta
| Parameter | Description |
|-----------|-------------|
| $deltatoken | State token returned in the @odata.deltaLink to resume synchronization. |
| $skiptoken | State token returned in the @odata.nextLink to fetch the next page. |
| $top | Limits the number of messages per call (max 50). |
| $filter | Supports lastModifiedDateTime with gt operator. |

## Permissions Summary

### For GET /teams/{tid}/channels/{cid}/messages
| PermissionType | Permissions (Least to most privileged) |
|---------------|----------------------------------------|
| Delegated | ChannelMessage.Read.All, Group.Read.All, Group.ReadWrite.All |
| Application | ChannelMessage.Read.Group, ChannelMessage.Read.All, Group.Read.All, Group.ReadWrite.All |

### For Other chatMessage APIs
| Delegate | Required Permission | Application | Required Permission |
|----------|---------------------|-------------|---------------------|
| List chat messages | ChatMessage.Read.All | ChatMessage.Read.All | |
| Send a channel message | ChannelMessage.Send | Teamwork.Migrate.All | |
| Send a chat message | ChatMessage.Send | ChatMessage.Send | |
| Delete a message | ChannelMessage.ReadWrite.All | ChannelMessage.ReadWrite.All | |
| List all messages in a chat | Chat.Read.All | Chat.Read.All | |

### Additional Permission Scopes for Advanced Operations
| Delegate | Required Permission |
|----------|---------------------|
| Set reactions on a message | ChatMessageReaction.ReadWrite |
| Create new messages | ChatMessage.Send |
| Get all messages and delta | Requires Chat.Read.All Application permission |

## JSON Representation

```json
{
  "id": "1616990032035",
  "body": {
    "contentType": "text",
    "content": "Hello World"
  },
  "from": {
    "user": {
      "id": "8ea0e38b-efb3-4757-924a-5f94061cf8c2",
      "displayName": "Robin Kline",
      "userIdentityType": "aadUser"
    }
  },
  "createdDateTime": "2021-03-29T03:53:52.035Z",
  "chatId": "19:4a95f7d8db4c4e7fae857bcebe0623e6@thread.tacv2"
}
```

## Related Pages
- [[Chat]]
- [[Channel]]
- [[Member]]
- [[Apps/Tabs]]
