---
title: "Receber chatMessagem em um canal ou chat - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/chatmessage-get?view=graph-rest-1.0&tabs=http"
author:
  - "[[RamjotSingh]]"
published:
created: 2026-06-30
description: "Recupere uma única mensagem (sem suas respostas) em um canal ou chat."
tags:
  - "clippings"
---
## Receber chatMessagem em um canal ou chat

Namespace: microsoft.graph

Recupere uma única [mensagem](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) ou uma [resposta de mensagem](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) em um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) ou um [chat](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0).

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Uma das seguintes permissões é necessária para chamar esta API. Para saber mais, incluindo como escolher permissões, confira [Permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

### Permissões para o canal

| Tipo de permissão | Permissões (da com menos para a com mais privilégios) |
| --- | --- |
| Delegado (conta corporativa ou de estudante) | ChannelMessage.Read.All, Group.Read.All, Group.ReadWrite.All |
| Delegado (conta pessoal da Microsoft) | Sem suporte. |
| Aplicativo | ChannelMessage.Read.Group, ChannelMessage.Read.All, Group.Read.All, Group.ReadWrite.All |

> **Nota:** As permissões Group.Read.All e Group.ReadWrite.All são suportadas apenas para retrocompatibilidade. Recomendamos que você atualize suas soluções para usar uma permissão alternativa listada na tabela anterior e evite usar essas permissões daqui para frente.

### Permissões para o chat

| Tipo de permissão | Permissões (da com menos para a com mais privilégios) |
| --- | --- |
| Delegado (conta corporativa ou de estudante) | Chat.Read, Chat.ReadWrite |
| Delegado (conta pessoal da Microsoft) | Sem suporte. |
| Aplicativo | Chat.Read.All, Chat.ReadWrite.All |

## Solicitação HTTP

**Obter mensagens em um canal**

HTTP

```http
GET /teams/{team-id}/channels/{channel-id}/messages/{message-id}
GET /teams/{team-id}/channels/{channel-id}/messages/{message-id}/replies/{reply-id}
```

**Obter mensagens em um chat**

HTTP

```http
GET /chats/{chat-id}/messages/{message-id}
GET /users/{user-id | user-principal-name}/chats/{chat-id}/messages/{message-id}
GET /me/chats/{chat-id}/messages/{message-id}
```

## Parâmetros de consulta opcionais

Este método não suporta os [parâmetros de consulta OData](https://learn.microsoft.com/pt-br/graph/query-parameters) para personalizar a resposta.

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se bem-sucedido, esse método retornará um `200 OK` código de resposta e um objeto [chatmessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) no corpo da resposta.

## Exemplos

### Exemplo 1: obter uma mensagem em um chat.

#### Solicitação

O exemplo a seguir mostra uma solicitação.

```msgraph
GET https://graph.microsoft.com/v1.0/chats/19:8ea0e38b-efb3-4757-924a-5f94061cf8c2_97f62344-57dc-409c-88ad-c4af14158ff5@unq.gbl.spaces/messages/1612289992105
```

#### Resposta

O exemplo a seguir mostra a resposta. `chatId` identifica o [chat](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) que contém esta mensagem.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats('19%3A8ea0e38b-efb3-4757-924a-5f94061cf8c2_97f62344-57dc-409c-88ad-c4af14158ff5%40unq.gbl.spaces')/messages/$entity",
    "id": "1612289992105",
    "replyToId": null,
    "etag": "1612289992105",
    "messageType": "message",
    "createdDateTime": "2021-02-02T18:19:52.105Z",
    "lastModifiedDateTime": "2021-02-02T18:19:52.105Z",
    "lastEditedDateTime": null,
    "deletedDateTime": null,
    "subject": null,
    "summary": null,
    "chatId": "19:8ea0e38b-efb3-4757-924a-5f94061cf8c2_97f62344-57dc-409c-88ad-c4af14158ff5@unq.gbl.spaces",
    "importance": "normal",
    "locale": "en-us",
    "webUrl": null,
    "channelIdentity": null,
    "policyViolation": null,
    "eventDetail": null,
    "from": {
        "application": null,
        "device": null,
        "conversation": null,
        "user": {
            "@odata.type": "#microsoft.graph.teamworkUserIdentity",
            "id": "8ea0e38b-efb3-4757-924a-5f94061cf8c2",
            "displayName": "Robin Kline",
            "userIdentityType": "aadUser",
            "tenantId": "e61ef81e-8bd8-476a-92e8-4a62f8426fca"
        }
    },
    "body": {
        "contentType": "text",
        "content": "test"
    },
    "attachments": [],
    "mentions": [],
    "reactions": [],
    "messageHistory": []
}
```

### Exemplo 2: obter uma mensagem em um canal

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_2_http)
- [C#](#tabpanel_2_csharp)
- [Ir](#tabpanel_2_go)
- [Java](#tabpanel_2_java)
- [JavaScript](#tabpanel_2_javascript)
- [PHP](#tabpanel_2_php)
- [PowerShell](#tabpanel_2_powershell)
- [Python](#tabpanel_2_python)

```msgraph
GET https://graph.microsoft.com/v1.0/teams/fbe2bf47-16c8-47cf-b4a5-4b9b187c508b/channels/19:4a95f7d8db4c4e7fae857bcebe0623e6@thread.tacv2/messages/1614618259349
```

#### Resposta

O exemplo a seguir mostra a resposta. `channelIdentity` identifica a [equipa](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0) e o [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) que contém esta mensagem.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#teams('fbe2bf47-16c8-47cf-b4a5-4b9b187c508b')/channels('19%3A4a95f7d8db4c4e7fae857bcebe0623e6%40thread.tacv2')/messages/$entity",
    "id": "1614618259349",
    "replyToId": null,
    "etag": "1614618259349",
    "messageType": "message",
    "createdDateTime": "2021-03-01T17:04:19.349Z",
    "lastModifiedDateTime": "2021-03-01T17:04:19.349Z",
    "lastEditedDateTime": null,
    "deletedDateTime": null,
    "subject": null,
    "summary": null,
    "chatId": null,
    "importance": "normal",
    "locale": "en-us",
    "webUrl": "https://teams.microsoft.com/l/message/19%3A4a95f7d8db4c4e7fae857bcebe0623e6%40thread.tacv2/1614618259349?groupId=fbe2bf47-16c8-47cf-b4a5-4b9b187c508b&tenantId=2432b57b-0abd-43db-aa7b-16eadd115d34&createdTime=1614618259349&parentMessageId=1614618259349",
    "policyViolation": null,
    "eventDetail": null,
    "from": {
        "application": null,
        "device": null,
        "conversation": null,
        "user": {
            "@odata.type": "#microsoft.graph.teamworkUserIdentity",
            "id": "8ea0e38b-efb3-4757-924a-5f94061cf8c2",
            "displayName": "Robin Kline",
            "userIdentityType": "aadUser",
            "tenantId": "e61ef81e-8bd8-476a-92e8-4a62f8426fca"
        }
    },
    "body": {
        "contentType": "html",
        "content": "<div><div><div><span><img height=\"250\" src=\"https://graph.microsoft.com/v1.0/teams/fbe2bf47-16c8-47cf-b4a5-4b9b187c508b/channels/19:4a95f7d8db4c4e7fae857bcebe0623e6@thread.tacv2/messages/1614618259349/hostedContents/aWQ9eF8wLXd1cy1kOS1jZTI3NDkxOTIzMTJjYWI5NDczMWQwYTgzNTFjN2VhNSx0eXBlPTEsdXJsPWh0dHBzOi8vdXMtYXBpLmFzbS5za3lwZS5jb20vdjEvb2JqZWN0cy8wLXd1cy1kOS1jZTI3NDkxOTIzMTJjYWI5NDczMWQwYTgzNTFjN2VhNS92aWV3cy9pbWdv/$value\" width=\"424.6575342465753\" style=\"vertical-align:bottom; width:424px; height:250px\"></span></div></div></div>"
    },
    "channelIdentity": {
        "teamId": "fbe2bf47-16c8-47cf-b4a5-4b9b187c508b",
        "channelId": "19:4a95f7d8db4c4e7fae857bcebe0623e6@thread.tacv2"
    },
    "attachments": [],
    "mentions": [],
    "reactions": [],
    "messageHistory": []
}
```

### Exemplo 3: obter resposta a uma mensagem em um canal

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_3_http)
- [C#](#tabpanel_3_csharp)
- [Ir](#tabpanel_3_go)
- [Java](#tabpanel_3_java)
- [JavaScript](#tabpanel_3_javascript)
- [PHP](#tabpanel_3_php)
- [PowerShell](#tabpanel_3_powershell)
- [Python](#tabpanel_3_python)

```msgraph
GET https://graph.microsoft.com/v1.0/teams/fbe2bf47-16c8-47cf-b4a5-4b9b187c508b/channels/19:4a95f7d8db4c4e7fae857bcebe0623e6@thread.tacv2/messages/1612509044972/replies/1613671348387
```

#### Resposta

O exemplo a seguir mostra a resposta. `replyToId` contém o `id` da mensagem raiz.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#teams('fbe2bf47-16c8-47cf-b4a5-4b9b187c508b')/channels('19%3A4a95f7d8db4c4e7fae857bcebe0623e6%40thread.tacv2')/messages('1612509044972')/replies/$entity",
    "id": "1613671348387",
    "replyToId": "1612509044972",
    "etag": "1613671348387",
    "messageType": "message",
    "createdDateTime": "2021-02-18T18:02:28.387Z",
    "lastModifiedDateTime": "2021-02-18T18:02:28.387Z",
    "lastEditedDateTime": null,
    "deletedDateTime": null,
    "subject": null,
    "summary": null,
    "chatId": null,
    "importance": "normal",
    "locale": "en-us",
    "webUrl": "https://teams.microsoft.com/l/message/19%3A4a95f7d8db4c4e7fae857bcebe0623e6%40thread.tacv2/1613671348387?groupId=fbe2bf47-16c8-47cf-b4a5-4b9b187c508b&tenantId=2432b57b-0abd-43db-aa7b-16eadd115d34&createdTime=1613671348387&parentMessageId=1612509044972",
    "policyViolation": null,
    "eventDetail": null,
    "from": {
        "application": null,
        "device": null,
        "conversation": null,
        "user": {
            "@odata.type": "#microsoft.graph.teamworkUserIdentity",
            "id": "8ea0e38b-efb3-4757-924a-5f94061cf8c2",
            "displayName": "Robin Kline",
            "userIdentityType": "aadUser",
            "tenantId": "e61ef81e-8bd8-476a-92e8-4a62f8426fca"
        }
    },
    "body": {
        "contentType": "html",
        "content": "<div><div>Test</div></div>"
    },
    "channelIdentity": {
        "teamId": "fbe2bf47-16c8-47cf-b4a5-4b9b187c508b",
        "channelId": "19:4a95f7d8db4c4e7fae857bcebe0623e6@thread.tacv2"
    },
    "attachments": [],
    "mentions": [],
    "reactions": [],
    "messageHistory": []
}
```

### Exemplo 4: Obter uma mensagem de chat com emojis e reações personalizadas

O exemplo seguinte mostra um pedido para obter uma mensagem de chat que contém emojis personalizados no corpo da mensagem e inclui reações personalizadas.

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_4_http)
- [C#](#tabpanel_4_csharp)
- [Ir](#tabpanel_4_go)
- [Java](#tabpanel_4_java)
- [JavaScript](#tabpanel_4_javascript)
- [PHP](#tabpanel_4_php)
- [PowerShell](#tabpanel_4_powershell)
- [Python](#tabpanel_4_python)

```msgraph
GET https://graph.microsoft.com/v1.0/chats/19:bcf84b15c2994a909770f7d05bc4fe16@thread.v2/messages/1706763669648
```

#### Resposta

O exemplo a seguir mostra a resposta. O corpo da mensagem contém uma `<customemoji></customemoji>` etiqueta e a mensagem inclui uma reação personalizada indicada por `"reactionType": "custom"`. Pode aceder a emojis personalizados e reações como conteúdo alojado numa mensagem de chat.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats('19%3Abcf84b15c2994a909770f7d05bc4fe16%40thread.v2')/messages/$entity",
    "id": "1706763669648",
    "replyToId": null,
    "etag": "1707948456260",
    "messageType": "message",
    "createdDateTime": "2024-02-01T05:01:09.648Z",
    "lastModifiedDateTime": "2024-02-14T22:07:36.26Z",
    "lastEditedDateTime": null,
    "deletedDateTime": null,
    "subject": null,
    "summary": null,
    "chatId": "19:bcf84b15c2994a909770f7d05bc4fe16@thread.v2",
    "importance": "normal",
    "locale": "en-us",
    "webUrl": null,
    "channelIdentity": null,
    "onBehalfOf": null,
    "policyViolation": null,
    "eventDetail": null,
    "from": {
        "application": null,
        "device": null,
        "user": {
            "@odata.type": "#microsoft.graph.teamworkUserIdentity",
            "id": "670374fa-3b0e-4a3b-9d33-0e1bc5ff1956",
            "displayName": "Adele Vance",
            "userIdentityType": "aadUser",
            "tenantId": "2432b57b-0abd-43db-aa7b-16eadd115d34"
        }
    },
    "body": {
        "contentType": "html",
        "content": "<p>I am looking&nbsp;<emoji id=\"1f440_eyes\" alt=\"👀\" title=\"Eyes\"></emoji><customemoji id=\"dGVzdHNjOzAtd3VzLWQyLTdiNWRkZGQ2ZGVjMDNkYzIwNTgxY2NkYTE1MmEyZTM4\" alt=\"microsoft_teams\" source=\"https://graph.microsoft.com/v1.0/chats/19:bcf84b15c2994a909770f7d05bc4fe16@thread.v2/messages/1706638496169/hostedContents/aWQ9LHR5cGU9MSx1cmw9aHR0cHM6Ly91cy1jYW5hcnkuYXN5bmNndy50ZWFtcy5taWNyb3NvZnQuY29tL3YxL29iamVjdHMvMC13dXMtZDItN2I1ZGRkZDZkZWMwM2RjMjA1ODFjY2RhMTUyYTJlMzgvdmlld3MvaW1ndDJfYW5pbQ==/$value\"></customemoji></p>"
    },
    "attachments": [],
    "mentions": [],
    "reactions": [
        {
            "reactionType": "💯",
            "displayName": "Hundred points",
            "reactionContentUrl": null,
            "createdDateTime": "2024-02-14T22:07:36.3Z",
            "user": {
                "application": null,
                "device": null,
                "user": {
                    "@odata.type": "#microsoft.graph.teamworkUserIdentity",
                    "id": "670374fa-3b0e-4a3b-9d33-0e1bc5ff1956",
                    "displayName": null,
                    "userIdentityType": "aadUser"
                }
            }
        },
        {
            "reactionType": "custom",
            "displayName": "microsoft_teams",
            "reactionContentUrl": "https://graph.microsoft.com/v1.0/chats/19:bcf84b15c2994a909770f7d05bc4fe16@thread.v2/messages/1706763669648/hostedContents/aWQ9MC13dXMtZDExLTc3ZmI2NmY4MTMwMGI2OGEzYzRkOWUyNmU1YTc5ZmMyLHR5cGU9MSx1cmw9/$value",
            "createdDateTime": "2024-02-14T22:07:02.288Z",
            "user": {
                "application": null,
                "device": null,
                "user": {
                    "@odata.type": "#microsoft.graph.teamworkUserIdentity",
                    "id": "28c10244-4bad-4fda-993c-f332faef94f0",
                    "displayName": null,
                    "userIdentityType": "aadUser"
                }
            }
        }
    ]
}
```

### Exemplo 5: Obter uma mensagem de chat com um @mention para todos

O exemplo seguinte mostra um pedido para obter uma mensagem de chat que @mentions todas as pessoas numa conversa de grupo.

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_5_http)
- [C#](#tabpanel_5_csharp)
- [Ir](#tabpanel_5_go)
- [Java](#tabpanel_5_java)
- [JavaScript](#tabpanel_5_javascript)
- [PHP](#tabpanel_5_php)
- [PowerShell](#tabpanel_5_powershell)
- [Python](#tabpanel_5_python)

```msgraph
GET https://graph.microsoft.com/v1.0/chats/19:80a7ff67c0ef43c19d88a7638be436b1@thread.v2/messages/1725986575123
```

#### Resposta

O exemplo a seguir mostra a resposta. O corpo da mensagem contém um @mention para todas as pessoas num chat de grupo que é representado pela `<at></at>` etiqueta. A propriedade **conversationIdentityType** está definida como `chat` na identidade de **conversação** do objeto **mencionado**.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats('19%3Ae2ed97baac8e4bffbb91299a38996790%40thread.v2')/messages/$entity",
    "@microsoft.graph.tips": "Use $select to choose only the properties your app needs, as this can lead to performance improvements. For example: GET chats('<key>')/messages('<key>')?$select=attachments,body",
    "id": "1727903166936",
    "replyToId": null,
    "etag": "1727903166936",
    "messageType": "message",
    "createdDateTime": "2024-10-02T21:06:06.936Z",
    "lastModifiedDateTime": "2024-10-02T21:06:06.936Z",
    "lastEditedDateTime": null,
    "deletedDateTime": null,
    "subject": null,
    "summary": null,
    "chatId": "19:80a7ff67c0ef43c19d88a7638be436b1@thread.v2",
    "importance": "normal",
    "locale": "en-us",
    "webUrl": null,
    "channelIdentity": null,
    "onBehalfOf": null,
    "policyViolation": null,
    "eventDetail": null,
    "from": {
        "application": null,
        "device": null,
        "user": {
            "@odata.type": "#microsoft.graph.teamworkUserIdentity",
            "id": "28c10244-4bad-4fda-993c-f332faef94f0",
            "displayName": "Adele Vance",
            "userIdentityType": "aadUser",
            "tenantId": "2432b57b-0abd-43db-aa7b-16eadd115d34"
        }
    },
    "body": {
        "contentType": "html",
        "content": "<p>Hi&nbsp;<at id=\"0\">Everyone</at></p>"
    },
    "attachments": [],
    "mentions": [
        {
            "id": 0,
            "mentionText": "Everyone",
            "mentioned": {
                "application": null,
                "device": null,
                "user": null,
                "tag": null,
                "conversation": {
                    "id": "19:80a7ff67c0ef43c19d88a7638be436b1@thread.v2",
                    "displayName": "Everyone",
                    "conversationIdentityType": "chat"
                }
            }
        }
    ],
    "reactions": []
}
```

### Exemplo 6: Obter uma mensagem de chat com uma mensagem reencaminhada

O exemplo seguinte mostra um pedido que recebe uma mensagem de chat com uma mensagem reencaminhada como um anexo.

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_6_http)
- [C#](#tabpanel_6_csharp)
- [Ir](#tabpanel_6_go)
- [Java](#tabpanel_6_java)
- [JavaScript](#tabpanel_6_javascript)
- [PHP](#tabpanel_6_php)
- [PowerShell](#tabpanel_6_powershell)
- [Python](#tabpanel_6_python)

```msgraph
GET https://graph.microsoft.com/v1.0/chats/19:e2ed97baac8e4bffbb91299a38996790@thread.v2/messages/1727903166936
```

#### Resposta

O exemplo a seguir mostra a resposta. O corpo da mensagem contém uma mensagem reencaminhada como anexo. O **contentType** da mensagem reencaminhada é identificado como `forwardedMessageReference`. A mensagem original que foi reencaminhada também está disponível no **conteúdo** do anexo.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats('19%3Ae2ed97baac8e4bffbb91299a38996790%40thread.v2')/messages/$entity",
    "@microsoft.graph.tips": "Use $select to choose only the properties your app needs, as this can lead to performance improvements. For example: GET chats('<key>')/messages('<key>')?$select=attachments,body",
    "id": "1727903166936",
    "replyToId": null,
    "etag": "1727903166936",
    "messageType": "message",
    "createdDateTime": "2024-10-02T21:06:06.936Z",
    "lastModifiedDateTime": "2024-10-02T21:06:06.936Z",
    "lastEditedDateTime": null,
    "deletedDateTime": null,
    "subject": null,
    "summary": null,
    "chatId": "19:e2ed97baac8e4bffbb91299a38996790@thread.v2",
    "importance": "normal",
    "locale": "en-us",
    "webUrl": null,
    "channelIdentity": null,
    "onBehalfOf": null,
    "policyViolation": null,
    "eventDetail": null,
    "from": {
        "application": null,
        "device": null,
        "user": {
            "@odata.type": "#microsoft.graph.teamworkUserIdentity",
            "id": "28c10244-4bad-4fda-993c-f332faef94f0",
            "displayName": null,
            "userIdentityType": "aadUser",
            "tenantId": "2432b57b-0abd-43db-aa7b-16eadd115d34"
        }
    },
    "body": {
        "contentType": "html",
        "content": "<attachment id=\"1727881360458\"></attachment>"
    },
    "attachments": [
        {
            "id": "1727881360458",
            "contentType": "forwardedMessageReference",
            "contentUrl": null,
            "content": "{\"originalMessageId\":\"1727881360458\",\"originalMessageContent\":\"\\n<p>hello</p>\\n\",\"originalConversationId\":\"19:97641583cf154265a237da28ebbde27a@thread.v2\",\"originalSentDateTime\":\"2024-10-02T15:02:40.458+00:00\",\"originalMessageSender\":{\"application\":null,\"device\":null,\"user\":{\"userIdentityType\":\"aadUser\",\"tenantId\":\"2432b57b-0abd-43db-aa7b-16eadd115d34\",\"id\":\"28c10244-4bad-4fda-993c-f332faef94f0\",\"displayName\":null}}}",
            "name": null,
            "thumbnailUrl": null,
            "teamsAppId": null
        }
    ],
    "mentions": [],
    "reactions": []
}
```

## Conteúdo relacionado

- [Listar mensagens em um canal](https://learn.microsoft.com/pt-br/graph/api/channel-list-messages?view=graph-rest-1.0)
- [Listar mensagens em um chat](https://learn.microsoft.com/pt-br/graph/api/chat-list-messages?view=graph-rest-1.0)
- [Enviar mensagem em um canal ou um chat](https://learn.microsoft.com/pt-br/graph/api/chatmessage-post?view=graph-rest-1.0)
- [Limites de limitação específicos do serviço do Microsoft Graph](https://learn.microsoft.com/pt-br/graph/throttling-limits#microsoft-teams-service-limits)