---
title: "Listar conversas - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/chat-list?view=graph-rest-1.0&tabs=http"
author:
  - "[[RamjotSingh]]"
published:
created: 2026-06-30
description: "Obtenha a lista de conversas de um utilizador."
tags:
  - "clippings"
---
## Listar conversas

Namespace: microsoft.graph

Obtenha a lista de [conversas](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) das quais o utilizador faz parte.

Este método suporta a federação. Quando é fornecido um ID de utilizador, a aplicação de chamada tem de pertencer ao mesmo inquilino ao qual o utilizador pertence.

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Uma das seguintes permissões é necessária para chamar esta API. Para saber mais, incluindo como escolher permissões, confira [Permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões (da com menos para a com mais privilégios) |
| --- | --- |
| Delegado (conta corporativa ou de estudante) | Chat.ReadBasic, Chat.Read, Chat.ReadWrite |
| Delegado (conta pessoal da Microsoft) | Sem suporte. |
| Application | Chat.ReadBasic.All\*, Chat.Read.All\*, Chat.ReadWrite.All\* |

## Solicitação HTTP

Para obter as conversas do utilizador com sessão iniciada na organização com a permissão delegada:

HTTP

```http
GET /chats
```

Para obter as conversas do utilizador especificado (que é o utilizador com sessão iniciada) na organização com a permissão delegada:

HTTP

```http
GET /me/chats
GET /users/{user-id | user-principal-name}/chats
```

Para obter as conversas do utilizador especificado (que pode não ter sessão iniciada ou é diferente do utilizador com sessão iniciada) na organização, utilizando a permissão da aplicação:

HTTP

```http
GET /users/{user-id | user-principal-name}/chats
```

## Parâmetros de consulta opcionais

Esse método dá suporte aos seguintes [parâmetros de consulta OData](https://learn.microsoft.com/pt-br/graph/query-parameters).

| Nome | Descrição |
| --- | --- |
| [$expand](https://learn.microsoft.com/pt-br/graph/query-parameters#expand-parameter) | Atualmente, suporta os **membros** e as **propriedades lastMessagePreview**. |
| [$top](https://learn.microsoft.com/pt-br/graph/query-parameters#top-parameter) | Controla o número de itens por resposta. O valor máximo `$top` permitido é 50. |
| [$filter](https://learn.microsoft.com/pt-br/graph/query-parameters#filter-parameter) | Filtra os resultados. |
| [$orderby](https://learn.microsoft.com/pt-br/graph/query-parameters#orderby-parameter) | Atualmente, suporta **lastMessagePreview/createdDateTime** por ordem descendente. A ordem crescente não é suportada no momento. |

No momento, não há suporte para os outros [Parâmetros de consulta OData](https://learn.microsoft.com/pt-br/graph/query-parameters).

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se bem sucedido, esse método retorna um código de resposta `200 OK` e uma coleção de objetos de [bate-papo](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) no corpo da resposta.

## Exemplo

### Exemplo 1: listar todas as conversas

#### Solicitação

O exemplo a seguir mostra uma solicitação.

```msgraph
GET https://graph.microsoft.com/v1.0/users/8b081ef6-4792-4def-b2c9-c363a1bf41d5/chats
```

#### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats",
    "@odata.count": 3,
    "value": [
        {
            "id": "19:meeting_MjdhNjM4YzUtYzExZi00OTFkLTkzZTAtNTVlNmZmMDhkNGU2@thread.v2",
            "topic": "Meeting chat sample",
            "createdDateTime": "2020-12-08T23:53:05.801Z",
            "lastUpdatedDateTime": "2020-12-08T23:58:32.511Z",
            "chatType": "meeting",
            "viewpoint": {
                "isHidden": false,
                "lastMessageReadDateTime": "2021-06-03T08:05:49.521Z"
            },
            "webUrl": "https://teams.microsoft.com/l/chat/19%3Ameeting_MjdhNjM4YzUtYzExZi00OTFkLTkzZTAtNTVlNmZmMDhkNGU2@thread.v2/0?tenantId=b33cbe9f-8ebe-4f2a-912b-7e2a427f477f",
            "isHiddenForAllMembers": false
        },
        {
            "id": "19:561082c0f3f847a58069deb8eb300807@thread.v2",
            "topic": "Group chat sample",
            "createdDateTime": "2020-12-03T19:41:07.054Z",
            "lastUpdatedDateTime": "2020-12-08T23:53:11.012Z",
            "chatType": "group",
            "viewpoint": {
                "isHidden": false,
                "lastMessageReadDateTime": "2021-05-27T22:13:01.577Z"
            },
            "webUrl": "https://teams.microsoft.com/l/chat/19%3A561082c0f3f847a58069deb8eb300807@thread.v2/0?tenantId=b33cbe9f-8ebe-4f2a-912b-7e2a427f477f",
            "isHiddenForAllMembers": false
        },
        {
            "id": "19:d74fc2ed-cb0e-4288-a219-b5c71abaf2aa_8c0a1a67-50ce-4114-bb6c-da9c5dbcf6ca@unq.gbl.spaces",
            "topic": null,
            "createdDateTime": "2020-12-04T23:10:28.51Z",
            "lastUpdatedDateTime": "2020-12-04T23:10:36.925Z",
            "chatType": "oneOnOne",
            "viewpoint": {
                "isHidden": false,
                "lastMessageReadDateTime": "0001-01-01T00:00:00Z"
            },
            "webUrl": "https://teams.microsoft.com/l/chat/19%3Ad74fc2ed-cb0e-4288-a219-b5c71abaf2aa_8c0a1a67-50ce-4114-bb6c-da9c5dbcf6ca@unq.gbl.spaces/0?tenantId=b33cbe9f-8ebe-4f2a-912b-7e2a427f477f",
            "isHiddenForAllMembers": false
        }
    ]
}
```

### Exemplo 2: listar todas as conversas juntamente com os membros de cada conversa

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
GET https://graph.microsoft.com/v1.0/users/8b081ef6-4792-4def-b2c9-c363a1bf41d5/chats?$expand=members
```

#### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats(members())",
    "@odata.count": 3,
    "value": [
        {
            "id": "19:meeting_MjdhNjM4YzUtYzExZi00OTFkLTkzZTAtNTVlNmZmMDhkNGU2@thread.v2",
            "topic": "Meeting chat sample",
            "createdDateTime": "2020-12-08T23:53:05.801Z",
            "lastUpdatedDateTime": "2020-12-08T23:58:32.511Z",
            "chatType": "meeting",
            "viewpoint": {
                "isHidden": false,
                "lastMessageReadDateTime": "2021-04-02T08:15:02.091Z"
            },
            "isHiddenForAllMembers": false,
            "webUrl": "https://teams.microsoft.com/l/chat/19%3Ameeting_MjdhNjM4YzUtYzExZi00OTFkLTkzZTAtNTVlNmZmMDhkNGU2@thread.v2/0?tenantId=b33cbe9f-8ebe-4f2a-912b-7e2a427f477f",
            "members": [
                {
                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                    "id": "MmFiOWM3OTYtMjkwMi00NWY4LWI3MTItN2M1YTYzY2Y0MWM0IyNlZWY5Y2IzNi0wNmRlLTQ2OWItODdjZC03MGY0Y2JlMzJkM123=",
                    "roles": [],
                    "displayName": "Tony Stark",
                    "userId": "4595d2f2-7b31-446c-84fd-9b795e63114b",
                    "email": "starkt@contoso.com"
                },
                {
                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                    "id": "MmFiOWM3OTYtMjkwMi00NWY4LWI3MTItN2M1YTYzY2Y0MWM0IyNlZWY5Y2IzNi0wNmRlLTQ2OWItODdjZC03MGY0Y2JlMz6Jk45=",
                    "roles": [],
                    "displayName": "Peter Parker",
                    "userId": "d74fc2ed-cb0e-4288-a219-b5c71abaf2aa",
                    "email": "parkerp@contoso.com"
                },
                {
                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                    "id": "MmFiOWM3OTYtMjkwMi00NWY4LWI3MTItN2M1YTYzY2Y0MWM0IyNlZWY5Y2IzNi0wNmRlLTQ2OWItODdjZC03MGY0Y2JlMzJ989kMTQ=",
                    "roles": [],
                    "displayName": "Nick Fury",
                    "userId": "8c0a1a67-50ce-4114-bb6c-da9c5dbcf6ca",
                    "email": "furyn@contoso.com"
                }
            ]
        },
        {
            "id": "19:561082c0f3f847a58069deb8eb300807@thread.v2",
            "topic": "Group chat sample",
            "createdDateTime": "2020-12-03T19:41:07.054Z",
            "lastUpdatedDateTime": "2020-12-08T23:53:11.012Z",
            "chatType": "group",
            "viewpoint": {
                "isHidden": false,
                "lastMessageReadDateTime": "0001-01-01T00:00:00Z"
            },
            "isHiddenForAllMembers": false,
            "webUrl": "https://teams.microsoft.com/l/chat/19%3A561082c0f3f847a58069deb8eb300807@thread.v2/0?tenantId=b33cbe9f-8ebe-4f2a-912b-7e2a427f477f",
            "members": [
                {
                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                    "id": "MmFiOWM3OTYtMjkwMi00NWY4LWI3MTItN2M1YTYzY2Y0MWM0IyNlZWY5Y2IzNi0wNmRlLTQ2OWItODdjZC03MGY0Y2JlMzJkM123=",
                    "roles": [],
                    "displayName": "Tony Stark",
                    "userId": "4595d2f2-7b31-446c-84fd-9b795e63114b",
                    "email": "starkt@contoso.com"
                },
                {
                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                    "id": "MmFiOWM312ftMjkwMi00NWY4LWI3MTItN2M1YTYzY2Y0MWM0IyNlZWY5Y2IzNi0wNmRlLTQ2OWItODdjZC03MGY0Y2JlMzJkM123=",
                    "roles": [],
                    "displayName": "Bruce Banner",
                    "userId": "48bf9d52-dca7-4a5f-8398-37b95cc7bd83",
                    "email": "bannerb@contoso.com"
                },
                {
                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                    "id": "MmFiOWM3OTYtMjkwMi00NWY4LWai3MTetN2M1YTYzY2Y0MWM0IyNlZWY5Y2IzNi0wNmRlLTQ2OWItODdjZC03MGY0Y2JlMzJkM123=",
                    "roles": [],
                    "displayName": "TChalla",
                    "userId": "9efb1aea-4f83-4673-bdcd-d3f3c7be28c2",
                    "email": "tchalla@contoso.com"
                },
                {
                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                    "id": "MmFiOWM3OTYtMjkwamii00NWY4LWI3MTItN2M1YTYzY2Y0MWM0IyNlZWY5Y2IzNi0wNmRlLTQ2OWItODdjZC03MGY0Y2JlMzJkM123=",
                    "roles": [],
                    "displayName": "Thor Odinson",
                    "userId": "976f4b31-fd01-4e0b-9178-29cc40c14438",
                    "email": "odinsont@contoso.com"
                },
                {
                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                    "id": "MmFiOWM3OTYtMjkwMi00NWopiLWI3MTItN2M1YTYzY2Y0MWM0IyNlZWY5Y2IzNi0wNmRlLTQ2OWItODdjZC03MGY0Y2JlMzJkM123=",
                    "roles": [],
                    "displayName": "Steve Rogers",
                    "userId": "976f4b31-fd01-4e0b-9178-29cc40c14438",
                    "email": "rogerss@contoso.com"
                }
            ]
        },
        {
            "id": "19:d74fc2ed-cb0e-4288-a219-b5c71abaf2aa_8c0a1a67-50ce-4114-bb6c-da9c5dbcf6ca@unq.gbl.spaces",
            "topic": null,
            "createdDateTime": "2020-12-04T23:10:28.51Z",
            "lastUpdatedDateTime": "2020-12-04T23:10:36.925Z",
            "chatType": "oneOnOne",
            "viewpoint": {
                "isHidden": false,
                "lastMessageReadDateTime": "2021-06-05T00:31:30.047Z"
            },
            "isHiddenForAllMembers": false,
            "webUrl": "https://teams.microsoft.com/l/chat/19%3Ad74fc2ed-cb0e-4288-a219-b5c71abaf2aa_8c0a1a67-50ce-4114-bb6c-da9c5dbcf6ca@unq.gbl.spaces/0?tenantId=b33cbe9f-8ebe-4f2a-912b-7e2a427f477f",
            "members": [
                {
                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                    "id": "MmFiOWM3OTYtMjkwMi00NWY4LWI3MTItN2M1YTYzY2Y0MWM0IyNlZWY5Y2IzNi0wNmRlLTQ2OWItODdjZC03MGY0Y2JlMzJ989kMTQ=",
                    "roles": [],
                    "displayName": "Nick Fury",
                    "userId": "8c0a1a67-50ce-4114-bb6c-da9c5dbcf6ca",
                    "email": "furyn@contoso.com"
                },
                {
                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                    "id": "MmFiOWM3OTYtMjkwMi00NWY4LWI3MTItN2M1YTYzY2Y0MWM0IyNlZWY5Y2IzNi0wNmRlLTQ2OWItODdjZC03MGY0Y2JlMz6Jk45=",
                    "roles": [],
                    "displayName": "Peter Parker",
                    "userId": "d74fc2ed-cb0e-4288-a219-b5c71abaf2aa",
                    "email": "parkerp@contoso.com"
                }
            ]
        }
    ]
}
```

### Exemplo 3: Listar todas as conversas por ordem das mensagens de chat mais recentes

#### Solicitação

O exemplo a seguir mostra uma solicitação. **lastMessagePreview/createdDateTime** é transmitido para ordenar conversas pelas mensagens de chat mais recentes.

- [HTTP](#tabpanel_3_http)
- [C#](#tabpanel_3_csharp)
- [Ir](#tabpanel_3_go)
- [Java](#tabpanel_3_java)
- [JavaScript](#tabpanel_3_javascript)
- [PHP](#tabpanel_3_php)
- [PowerShell](#tabpanel_3_powershell)
- [Python](#tabpanel_3_python)

```msgraph
GET https://graph.microsoft.com/v1.0/chats?$orderby=lastMessagePreview/createdDateTime desc
```

#### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats",
    "@odata.count": 2,
    "@odata.nextLink": "https://graph.microsoft.com/v1.0/chats?$orderby=lastMessagePreview%2fcreatedDateTime+desc&$skiptoken=1.kscDYs0BbsYAAAFa8ZyBqlByb3BlcnRpZXOCqVN5bmNTdGF0ZdoBRGV5SmtaV3hwZG1WeVpXUlRaV2R0Wlc1MGN5STZXM3NpYzNSaGNuUWlPaUl5TURJeExUQTRMVEUzVkRFeE9qVXpPakUxTGprd09Tc3dNRG93TUNJc0ltVnVaQ0k2SWpJd01qSXRNRFV0TUROVU1UZzZNVFU2TkRJdU16QTNLekF3T2pBd0luMHNleUp6ZEdGeWQ4APMDRTVOekF0TURFdE1ERlVNREE2BAATcggAcWlMQ0psYm2YAJB4T1Rjd0xUQXgEACJWRFQAAAQABmAA8F8xZExDSjZaWEp2VEUxVFZFUmxiR2wyWlhKbFpGTmxaMjFsYm5SeklqcGJYU3dpYzI5eWRFOXlaR1Z5SWpveExDSnBibU5zZFdSbFdtVnliMHhOVTFRaU9uUnlkV1Y5rExhc3RQYWdlU2l6ZaIyMA%3d%3d",
    "value": [
        {
            "id": "19:670374fa-3b0e-4a3b-9d33-0e1bc5ff1956_bfb5bb25-3a8d-487d-9828-7875ced51a30@unq.gbl.spaces",
            "topic": null,
            "createdDateTime": "2021-11-17T18:48:57.986Z",
            "lastUpdatedDateTime": "2021-11-17T18:48:57.986Z",
            "chatType": "oneOnOne",
            "webUrl": "https://teams.microsoft.com/l/chat/19%3A670374fa-3b0e-4a3b-9d33-0e1bc5ff1956_bfb5bb25-3a8d-487d-9828-7875ced51a30%40unq.gbl.spaces/0?tenantId=2432b57b-0abd-43db-aa7b-16eadd115d34",
            "tenantId": "2432b57b-0abd-43db-aa7b-16eadd115d34",
            "onlineMeetingInfo": null,
            "viewpoint": {
                "isHidden": false,
                "lastMessageReadDateTime": "2022-05-03T18:15:42.307Z"
            },
            "isHiddenForAllMembers": false
        },
        {
            "id": "19:82fe7758-5bb3-4f0d-a43f-e555fd399c6f_bfb5bb25-3a8d-487d-9828-7875ced51a30@unq.gbl.spaces",
            "topic": null,
            "createdDateTime": "2021-05-26T00:07:00.751Z",
            "lastUpdatedDateTime": "2021-05-26T00:07:14.894Z",
            "chatType": "oneOnOne",
            "webUrl": "https://teams.microsoft.com/l/chat/19%3A82fe7758-5bb3-4f0d-a43f-e555fd399c6f_bfb5bb25-3a8d-487d-9828-7875ced51a30%40unq.gbl.spaces/0?tenantId=2432b57b-0abd-43db-aa7b-16eadd115d34",
            "tenantId": "2432b57b-0abd-43db-aa7b-16eadd115d34",
            "onlineMeetingInfo": null,
            "viewpoint": {
                "isHidden": true,
                "lastMessageReadDateTime": "2022-03-08T19:55:30.491Z"
            },
            "isHiddenForAllMembers": false
        }
    ]
}
```

### Exemplo 4: Listar conversas juntamente com a pré-visualização da última mensagem enviada no chat

#### Solicitação

O exemplo seguinte mostra um pedido para listar conversas juntamente com a pré-visualização da última mensagem enviada no chat. Comparar `createdDateTime` na pré-visualização `lastMessageReadDateTime` com em `viewpoint` permite que o autor da chamada determine se o utilizador leu todas as mensagens numa conversa.

- [HTTP](#tabpanel_4_http)
- [C#](#tabpanel_4_csharp)
- [Ir](#tabpanel_4_go)
- [Java](#tabpanel_4_java)
- [JavaScript](#tabpanel_4_javascript)
- [PHP](#tabpanel_4_php)
- [PowerShell](#tabpanel_4_powershell)
- [Python](#tabpanel_4_python)

```msgraph
GET https://graph.microsoft.com/v1.0/chats?$expand=lastMessagePreview
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats(lastMessagePreview())",
    "@odata.count": 3,
    "@odata.nextLink": "https://graph.microsoft.com/v1.0/chats?$expand=lastMessagePreview&$skiptoken=eyJDb250aW51YXRpb25Ub2tlbiI6Ilczc2ljM1JoY25RaU9pSXlNREl4TFRBMUxUSTNWREl5T2pFek9qQXpMakUyT1Nzd01Eb3dNQ0lzSW1WdVpDSTZJakl3TWpFdE1EWXRNRFZVTURBNk16RTZNekl1T0RBMkt6QXdPakF3SW4wc2V5SnpkR0Z5ZENJNklqRTVOekF0TURFdE1ERlVNREE2TURBNk1EQXJNREE2TURBaUxDSmxibVFpT2lJeE9UY3dMVEF4TFRBeFZEQXdPakF3T2pBd0xqQXdNU3N3TURvd01DSjlYUT09IiwiQ2hhdFR5cGUiOiJjaGF0fG1lZXRpbmd8c2ZiaW50ZXJvcGNoYXR8cGhvbmVjaGF0In0%3d",
    "value": [
        {
            "id": "19:8ea0e38b-efb3-4757-924a-5f94061cf8c2_976f4b31-fd01-4e0b-9178-29cc40c14438@unq.gbl.spaces",
            "topic": null,
            "createdDateTime": "2021-06-05T00:31:30.767Z",
            "lastUpdatedDateTime": "2021-06-05T00:31:32.806Z",
            "chatType": "oneOnOne",
            "viewpoint": {
                "isHidden": false,
                "lastMessageReadDateTime": "2021-06-05T00:31:30.047Z"
            },
            "isHiddenForAllMembers": false,
            "lastMessagePreview": {
                "id": "1622853091207",
                "createdDateTime": "2021-06-05T00:31:31.207Z",
                "isDeleted": false,
                "messageType": "message",
                "eventDetail": null,
                "body": {
                    "contentType": "text",
                    "content": "Testing unread read status"
                },
                "from": {
                    "application": null,
                    "device": null,
                    "user": {
                        "id": "8ea0e38b-efb3-4757-924a-5f94061cf8c2",
                        "displayName": "Nick Fury",
                        "userIdentityType": "aadUser"
                    }
                }
            }
        },
        {
            "id": "19:8ea0e38b-efb3-4757-924a-5f94061cf8c2_da7d471b-de7d-4152-8556-1cdf7a564f6c@unq.gbl.spaces",
            "topic": null,
            "createdDateTime": "2020-07-17T22:46:28.077Z",
            "lastUpdatedDateTime": "2021-06-03T08:05:49.788Z",
            "chatType": "oneOnOne",
            "viewpoint": {
                "isHidden": false,
                "lastMessageReadDateTime": "2021-06-03T08:05:49.521Z"
            },
            "isHiddenForAllMembers": false,
            "lastMessagePreview": {
                "id": "1622707540293",
                "createdDateTime": "2021-06-03T08:05:40.293Z",
                "isDeleted": false,
                "messageType": "message",
                "eventDetail": null,
                "body": {
                    "contentType": "html",
                    "content": "<attachment id=\"ee8d34acd36d4dfe87ca6ad4e060b7be\"></attachment>"
                },
                "from": {
                    "device": null,
                    "user": null,
                    "application": {
                        "id": "da7d471b-de7d-4152-8556-1cdf7a564f6c",
                        "displayName": "talla",
                        "applicationIdentityType": "bot"
                    }
                }
            }
        },
        {
            "id": "19:7b5c1643d8d74a03afa0af9c02dd0ef2@thread.v2",
            "topic": "Group chat",
            "createdDateTime": "2021-07-18T22:12:17.231Z",
            "lastUpdatedDateTime": "2021-06-04T05:34:23.980Z",
            "chatType": "group",
            "webUrl": "https://teams.microsoft.com/l/chat/19%3A7b5c1643d8d74a03afa0af9c02dd0ef2%40thread.v2/0?tenantId=df81db53-c7e2-418a-8803-0e68d4b88607",
            "viewpoint": {
                "isHidden": false,
                "lastMessageReadDateTime": "2021-06-04T05:34:23.712Z"
            },
            "isHiddenForAllMembers": false,
            "lastMessagePreview": {
                "id": "1622784857324",
                "createdDateTime": "2021-06-04T05:34:17.324Z",
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
                            "id": "d9a2f9a8-6ca9-4c92-9a1c-ceca33b91762",
                            "displayName": null,
                            "userIdentityType": "aadUser"
                        }
                    ],
                    "initiator": {
                        "application": null,
                        "device": null,
                        "user": {
                            "id": "1fb8890f-423e-4154-8fbf-db6809bc8756",
                            "displayName": null,
                            "userIdentityType": "aadUser"
                        }
                    }
                }
            }
        }
    ]
}
```

### Exemplo 5: Listar todas as conversas onde a aplicação está instalada

#### Solicitação

O exemplo a seguir mostra uma solicitação.

HTTP

```http
GET https://graph.microsoft.com/v1.0/users/e652dd92-dd63-4fcc-b5b2-2005681e8e9f/chats?$filter=installedApps/any(a:a/teamsApp/id eq '608d8644-acb1-4ab0-bca5-66fbb6ed62aa')
```

---

#### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats",
    "@odata.count": 1,
    "value": [
        {
            "id": "19:e652dd92-dd63-4fcc-b5b2-2005681e8e9f_734601fc-bbcd-4a30-9092-3c89f8d788cb@unq.gbl.spaces",
            "topic": null,
            "createdDateTime": "2023-03-03T11:32:33.631Z",
            "lastUpdatedDateTime": "2023-06-08T06:02:19.072Z",
            "chatType": "oneOnOne",
            "webUrl": "https://teams.microsoft.com/l/chat/19%3Ae652dd92-dd63-4fcc-b5b2-2005681e8e9f_734601fc-bbcd-4a30-9092-3c89f8d788cb%40unq.gbl.spaces/0?tenantId=aa923623-ae61-49ee-b401-81f414b6ad5a",
            "tenantId": "aa923623-ae61-49ee-b401-81f414b6ad5a",
            "onlineMeetingInfo": null,
            "viewpoint": {
                "isHidden": false,
                "lastMessageReadDateTime": "2023-06-29T10:22:15.024Z"
            },
            "isHiddenForAllMembers": false
        }
    ]

}
```