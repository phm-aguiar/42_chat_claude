---
title: "Obter bate-papo - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/chat-get?view=graph-rest-1.0&tabs=http"
author:
  - "[[RamjotSingh]]"
published:
created: 2026-06-30
description: "Recupere um único bate-papo."
tags:
  - "clippings"
---
## Obter bate-papo

Namespace: microsoft.graph

Recupere um único [bate-papo](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) (sem suas mensagens).

Este método suporta a federação. Para aceder a uma conversa, pelo menos um membro do chat tem de pertencer ao inquilino a partir do qual o pedido foi iniciado.

> **Nota:** Esta API funciona de forma diferente numa ou mais clouds nacionais. Para obter detalhes, veja [Diferenças de implementação nas clouds nacionais](https://learn.microsoft.com/pt-br/graph/teamwork-national-cloud-differences).

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | Chat.ReadBasic | Chat.Read, Chat.ReadWrite |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | Chat.ReadBasic.WhereInstalled | Chat.Manage.Chat, Chat.Read.All, Chat.ReadBasic.All, Chat.ReadWrite.All, ChatSettings.Read.Chat, ChatSettings.ReadWrite.Chat |

## Solicitação HTTP

HTTP

```http
GET /me/chats/{chat-id}
GET /users/{user-id | user-principal-name}/chats/{chat-id}
GET /chats/{chat-id}
```

## Parâmetros de consulta opcionais

Atualmente, esta operação não suporta [parâmetros de consulta OData](https://learn.microsoft.com/pt-br/graph/query-parameters) para personalizar a resposta.

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se bem sucedido, esse método retorna um código de resposta `200 OK` e uma coleção de objetos de [bate-papo](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) no corpo da resposta.

## Exemplos

### Exemplo 1: obtenha um chat em grupo

#### Solicitação

O exemplo a seguir mostra uma solicitação.

```msgraph
GET https://graph.microsoft.com/v1.0/chats/19:b8577894a63548969c5c92bb9c80c5e1@thread.v2
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats/$entity",
    "id": "19:b8577894a63548969c5c92bb9c80c5e1@thread.v2",
    "topic": "test group 1",
    "createdDateTime": "2021-04-06T19:49:52.431Z",
    "lastUpdatedDateTime": "2021-04-06T19:54:04.306Z",
    "chatType": "group",
    "webUrl": "https://teams.microsoft.com/l/chat/19%3Ab8577894a63548969c5c92bb9c80c5e1@thread.v2/0?tenantId=b33cbe9f-8ebe-4f2a-912b-7e2a427f477f",
    "tenantId": "b33cbe9f-8ebe-4f2a-912b-7e2a427f477f",
    "onlineMeetingInfo": null,
    "viewpoint": {
        "isHidden": true,
        "lastMessageReadDateTime": "2021-05-06T23:55:07.191Z"
    },
    "isHiddenForAllMembers": false
}
```

### Exemplo 2: obtenha um bate-papo individual de um usuário

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
GET https://graph.microsoft.com/v1.0/users/8b081ef6-4792-4def-b2c9-c363a1bf41d5/chats/19:8b081ef6-4792-4def-b2c9-c363a1bf41d5_877192bd-9183-47d3-a74c-8aa0426716cf@unq.gbl.spaces
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats/$entity",
    "id": "19:8b081ef6-4792-4def-b2c9-c363a1bf41d5_877192bd-9183-47d3-a74c-8aa0426716cf@unq.gbl.spaces",
    "topic": null,
    "createdDateTime": "2019-04-18T23:51:42.099Z",
    "lastUpdatedDateTime": "2019-04-18T23:51:43.255Z",
    "chatType": "oneOnOne",
    "webUrl": "https://teams.microsoft.com/l/chat/19%3A8b081ef6-4792-4def-b2c9-c363a1bf41d5_877192bd-9183-47d3-a74c-8aa0426716cf@unq.gbl.spaces/0?tenantId=2432b57b-0abd-43db-aa7b-16eadd115d34",
    "tenantId": "2432b57b-0abd-43db-aa7b-16eadd115d34",
    "onlineMeetingInfo": null,
    "viewpoint": {
        "isHidden": false,
        "lastMessageReadDateTime": "2021-07-06T22:26:27.98Z"
    },
    "isHiddenForAllMembers": false
}
```

### Exemplo 3: obtenha um bate-papo e todos os seus membros

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
GET https://graph.microsoft.com/v1.0/chats/19:b8577894a63548969c5c92bb9c80c5e1@thread.v2?$expand=members
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats(members())/$entity",
    "id": "19:b8577894a63548969c5c92bb9c80c5e1@thread.v2",
    "topic": "test group 1",
    "createdDateTime": "2021-04-06T19:49:52.431Z",
    "lastUpdatedDateTime": "2021-04-21T17:13:44.033Z",
    "chatType": "group",
    "webUrl": "https://teams.microsoft.com/l/chat/19%3Ab8577894a63548969c5c92bb9c80c5e1@thread.v2/0?tenantId=b33cbe9f-8ebe-4f2a-912b-7e2a427f477f",
    "tenantId": "b33cbe9f-8ebe-4f2a-912b-7e2a427f477f",
    "onlineMeetingInfo": null,
    "viewpoint": {
        "isHidden": false,
        "lastMessageReadDateTime": "2021-08-09T17:38:24.101Z"
    },
    "isHiddenForAllMembers": false,
    "members": [
        {
            "@odata.type": "#microsoft.graph.aadUserConversationMember",
            "id": "MCMjMjQzMmI1N2ItMGFiZC00M2RiLWFhN2ItMTZlYWRkMTE1ZDM0IyMxOTpiODU3Nzg5NGE2MzU0ODk2OWM1YzkyYmI5YzgwYzVlMUB0aHJlYWQudjIjIzhjMGExYTY3LTUwY2UtNDExNC1iYjZjLWRhOWM1ZGJjZjZjYQ==",
            "roles": [
                "owner"
            ],
            "displayName": "John Doe",
            "visibleHistoryStartDateTime": "0001-01-01T00:00:00Z",
            "userId": "8c0a1a67-50ce-4114-bb6c-da9c5dbcf6ca",
            "email": "john@contoso.com",
            "tenantId": "b33cbe9f-8ebe-4f2a-912b-7e2a427f477f"
        },
        {
            "@odata.type": "#microsoft.graph.aadUserConversationMember",
            "id": "MCMjMjQzMmI1N2ItMGFiZC00M2RiLWFhN2ItMTZlYWRkMTE1ZDM0IyMxOTpiODU3Nzg5NGE2MzU0ODk2OWM1YzkyYmI5YzgwYzVlMUB0aHJlYWQudjIjIzQ1OTVkMmYyLTdiMzEtNDQ2Yy04NGZkLTliNzk1ZTYzMTE0Yg==",
            "roles": [
                "owner"
            ],
            "displayName": "Test User 1",
            "visibleHistoryStartDateTime": "0001-01-01T00:00:00Z",
            "userId": "4595d2f2-7b31-446c-84fd-9b795e63114b",
            "email": "testuser1@contoso.com",
            "tenantId": "b33cbe9f-8ebe-4f2a-912b-7e2a427f477f"
        },
        {
            "@odata.type": "#microsoft.graph.aadUserConversationMember",
            "id": "MCMjMjQzMmI1N2ItMGFiZC00M2RiLWFhN2ItMTZlYWRkMTE1ZDM0IyMxOTpiODU3Nzg5NGE2MzU0ODk2OWM1YzkyYmI5YzgwYzVlMUB0aHJlYWQudjIjIzgyZmU3NzU4LTViYjMtNGYwZC1hNDNmLWU1NTVmZDM5OWM2Zg==",
            "roles": [
                "owner"
            ],
            "displayName": "Test User 2",
            "visibleHistoryStartDateTime": "0001-01-01T00:00:00Z",
            "userId": "82fe7758-5bb3-4f0d-a43f-e555fd399c6f",
            "email": "testuser2@contoso.com",
            "tenantId": "b33cbe9f-8ebe-4f2a-912b-7e2a427f477f"
        },
        {
            "@odata.type": "#microsoft.graph.aadUserConversationMember",
            "id": "MCMjMjQzMmI1N2ItMGFiZC00M2RiLWFhN2ItMTZlYWRkMTE1ZDM0IyMxOTpiODU3Nzg5NGE2MzU0ODk2OWM1YzkyYmI5YzgwYzVlMUB0aHJlYWQudjIjIzJjOGQyYjVjLTE4NDktNDA2Ni1iNTdkLWU3YTBlOWU0NGVjOA==",
            "roles": [
                "owner"
            ],
            "displayName": "Test User 3",
            "visibleHistoryStartDateTime": "0001-01-01T00:00:00Z",
            "userId": "2c8d2b5c-1849-4066-b57d-e7a0e9e44ec8",
            "email": "testuser3@contoso.com",
            "tenantId": "b33cbe9f-8ebe-4f2a-912b-7e2a427f477f"
        },
        {
            "@odata.type": "#microsoft.graph.aadUserConversationMember",
            "id": "MCMjMjQzMmI1N2ItMGFiZC00M2RiLWFhN2ItMTZlYWRkMTE1ZDM0IyMxOTpiODU3Nzg5NGE2MzU0ODk2OWM1YzkyYmI5YzgwYzVlMUB0aHJlYWQudjIjIzhlYTBlMzhiLWVmYjMtNDc1Ny05MjRhLTVmOTQwNjFjZjhjMg==",
            "roles": [
                "owner"
            ],
            "displayName": "Test User 4",
            "visibleHistoryStartDateTime": "2021-04-20T17:13:43.715Z",
            "userId": "8ea0e38b-efb3-4757-924a-5f94061cf8c2",
            "email": "testuser4@contoso.com",
            "tenantId": "b33cbe9f-8ebe-4f2a-912b-7e2a427f477f"
        }
    ]
}
```

### Exemplo 4: obter os detalhes da reunião de um chat associado a uma Reuniões do Microsoft Teams

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
GET https://graph.microsoft.com/v1.0/chats/19:meeting_ZDZlYTYxOWUtYzdlMi00ZmMxLWIxMTAtN2YzODZlZjAxYzI4@thread.v2
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "id": "19:meeting_YDZlYTYxOWUtYzdlMi00ZmMxLWIxMTAtN2YzODZlZjAxYzI4@thread.v2",
    "topic": "Test Meeting",
    "createdDateTime": "2021-08-17T12:21:37.322Z",
    "lastUpdatedDateTime": "2021-08-18T00:31:31.817Z",
    "chatType": "meeting",
    "webUrl": "https://teams.microsoft.com/l/chat/19%3Ameeting_YDZlYTYxOWUtYzdlMi00ZmMxLWIxMTAtN2YzODZlZjAxYzI4%40thread.v2/0?tenantId=2432b57b-0abd-43db-aa7b-16eadd115d34",
    "tenantId": "2432b57b-0abd-43db-aa7b-16eadd115d35",
    "viewpoint": {
        "isHidden": false,
        "lastMessageReadDateTime": "2021-08-17T18:04:32.583Z"
    },
    "onlineMeetingInfo": {
        "calendarEventId": "AAMkADAzMjNhY2NiLWVmNDItNDVjYS05MnFjLTExY2U0ZWMyZTNmZQBGAAAAAAARDMODhhR0TZRGWo9nN0NcBwAmvYmLhDvYR6hCFdQLgxR-AAAAAAENAAAmvYmLhDvYR6hCFdQLgxR-AABkrglJAAA=",
        "joinWebUrl": "https://teams.microsoft.com/l/meetup-join/19%3Ameeting_YDZlYTYxOWUtYzdlMi00ZmMxLWIxMTAtN2YzODZlZjAxYzI4%40thread.v2/0?context=%7b%22Tid%22%3a%222432b57b-0abd-43db-aa7b-16eadd115d34%22%2c%22Oid%22%3a%22bfb5bb25-3a8d-487d-9828-7875ced51a30%22%7d",
        "organizer": {
            "id": "bfb5bb25-3a8d-487d-9828-7875ced51a30",
            "displayName": null,
            "userIdentityType": "aadUser"
        }
    },
    "isHiddenForAllMembers": false
}
```

### Exemplo 5: Obter o chat juntamente com a pré-visualização da última mensagem enviada no chat

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
GET https://graph.microsoft.com/v1.0/chats/19:ebe3857aa388434bab0cad9d2e09f4de@thread.v2?$expand=lastMessagePreview
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats(lastMessagePreview())/$entity",
    "id": "19:ebe3857aa388434bab0cad9d2e09f4de@thread.v2",
    "topic": "Demo Group Chat",
    "createdDateTime": "2021-04-08T16:00:53.563Z",
    "lastUpdatedDateTime": "2022-09-08T23:11:54.246Z",
    "chatType": "group",
    "webUrl": "https://teams.microsoft.com/l/chat/19%3Aebe3857aa388434bab0cad9d2e09f4de%40thread.v2/0?tenantId=2432b57b-0abd-43db-aa7b-16eadd115d34",
    "tenantId": "2432b57b-0abd-43db-aa7b-16eadd115d34",
    "onlineMeetingInfo": null,
    "viewpoint": {
        "isHidden": true,
        "lastMessageReadDateTime": "2022-09-08T23:11:54.353Z"
    },
    "lastMessagePreview@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats('19%3Aebe3857aa388434bab0cad9d2e09f4de%40thread.v2')/lastMessagePreview/$entity",
    "lastMessagePreview": {
        "id": "1662678714353",
        "createdDateTime": "2022-09-08T23:11:54.353Z",
        "isDeleted": false,
        "messageType": "systemEventMessage",
        "from": null,
        "body": {
            "contentType": "html",
            "content": "<systemEventMessage/>"
        },
        "eventDetail": {
            "@odata.type": "#microsoft.graph.membersAddedEventMessageDetail",
            "visibleHistoryStartDateTime": "0001-01-01T00:00:00Z",
            "members": [
                {
                    "id": "ee9f3754-62e1-4034-ad10-97940ef7f709",
                    "displayName": null,
                    "userIdentityType": "aadUser"
                }
            ],
            "initiator": {
                "application": null,
                "device": null,
                "user": {
                    "id": "bfb5bb25-3a8d-487d-9828-7875ced51a30",
                    "displayName": null,
                    "userIdentityType": "aadUser"
                }
            }
        }
    },
    "isHiddenForAllMembers": false
}
```

### Exemplo 6: Obter uma conversa de grupo no modo de migração

O exemplo seguinte mostra como obter uma conversa de grupo no modo de migração.

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
GET https://graph.microsoft.com/v1.0/chats/19:b8577894a63548969c5c92bb9c80c5e1@thread.v2
```

#### Resposta

O exemplo seguinte mostra a resposta quando o chat está no modo de migração.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats/$entity",
  "id": "19:b8577894a63548969c5c92bb9c80c5e1@thread.v2",
  "topic": "test group 1",
  "createdDateTime": "2021-04-06T19:49:52.431Z",
  "lastUpdatedDateTime": "2021-04-06T19:54:04.306Z",
  "chatType": "group",
  "webUrl": "https://teams.microsoft.com/l/chat/19%3Ab8577894a63548969c5c92bb9c80c5e1@thread.v2/0?tenantId=b33cbe9f-8ebe-4f2a-912b-7e2a427f477f",
  "tenantId": "b33cbe9f-8ebe-4f2a-912b-7e2a427f477f",
  "onlineMeetingInfo": null,
  "createdBy": {
    "application": null,
    "device": null,
    "user": {
      "@odata.type": "#microsoft.graph.teamworkUserIdentity",
      "id": "8c0a1a67-50ce-4114-bb6c-da9c5dbcf6ca",
      "displayName": null,
      "userIdentityType": "aadUser",
      "tenantId": "b33cbe9f-8ebe-4f2a-912b-7e2a427f477f"
    }
  },
  "viewpoint": {
    "isHidden": true,
    "lastMessageReadDateTime": "2021-05-06T23:55:07.191Z"
  },
  "isHiddenForAllMembers": false,
  "migrationMode": "inProgress",
  "originalCreatedDateTime": "2022-05-28T10:00:00+00:00"
}
```

## Conteúdo relacionado

[Limites de limitação específicos do serviço do Microsoft Graph](https://learn.microsoft.com/pt-br/graph/throttling-limits#microsoft-teams-service-limits)