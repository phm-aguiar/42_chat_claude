---
title: "Listar mensagens em um chat - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/chat-list-messages?view=graph-rest-1.0&tabs=http"
author:
  - "[[RamjotSingh]]"
published:
created: 2026-06-30
description: "Recupere a lista de mensagens em um chat."
tags:
  - "clippings"
---
## Listar mensagens em um chat

Namespace: microsoft.graph

Recupere a lista de [mensagens](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) em um [bate-papo](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0).

Este método suporta a federação. Para listar mensagens de chat no contexto da aplicação, o pedido tem de ser feito a partir do inquilino ao qual o proprietário do canal pertence (representado pela propriedade **tenantId** no canal).

> **Observações**:
> 
> - Esta API suporta a subscrição de alterações (criar, atualizar e eliminar) [através de notificações de alteração](https://learn.microsoft.com/pt-br/graph/api/resources/change-notifications-api-overview?view=graph-rest-1.0). Isso permite aos chamadores assinar e obter alterações em tempo real. Para obter detalhes, confira [obter notificações de](https://learn.microsoft.com/pt-br/graph/teams-changenotifications-chatmessage) de mensagens.
> - Esta API funciona de forma diferente numa ou mais clouds nacionais. Para obter detalhes, veja [Diferenças de implementação nas clouds nacionais](https://learn.microsoft.com/pt-br/graph/teamwork-national-cloud-differences).

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegada (conta corporativa ou de estudante) | Chat.Read | Chat.ReadWrite |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | ChatMessage.Read.Chat | Chat.Read.All, Chat.ReadWrite.All |

## Solicitação HTTP

HTTP

```http
GET /me/chats/{chat-id}/messages
GET /users/{user-id | user-principal-name}/chats/{chat-id}/messages
GET /chats/{chat-id}/messages
```

## Parâmetros de consulta opcionais

Esse método dá suporte aos seguintes [parâmetros de consulta OData](https://learn.microsoft.com/pt-br/graph/query-parameters).

| Nome | Descrição |
| --- | --- |
| [$top](https://learn.microsoft.com/pt-br/graph/query-parameters#top-parameter) | Controla o número de itens por resposta. O valor máximo `$top` permitido é 50. |
| [$orderby](https://learn.microsoft.com/pt-br/graph/query-parameters#orderby-parameter) | Atualmente, suporta as propriedades **lastModifiedDateTime** (predefinição) e **createdDateTime** por ordem descendente. A ordem ascendente não é atualmente suportada. |
| [$filter](https://learn.microsoft.com/pt-br/graph/query-parameters#filter-parameter) | Define o filtro de intervalo de datas para as propriedades **lastModifiedDateTime** e **createdDateTime**. A propriedade **lastModifiedDateTime** suporta os `gt` operadores e `lt`. A propriedade **createdDateTime** suporta o `lt` operador. Só pode filtrar os resultados se o URL do pedido contiver os `$orderby` parâmetros de consulta e `$filter` configurados para a mesma propriedade; caso contrário, a opção `$filter` de consulta é ignorada. |

No momento, não há suporte para os outros [Parâmetros de consulta OData](https://learn.microsoft.com/pt-br/graph/query-parameters).

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se bem sucedido, este método retorna um código de resposta `200 OK` e uma coleção de objetos [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) no corpo da resposta.

## Exemplos

### Exemplo 1: Solicitação sem Cabeçalho preferencial opcional

O exemplo a seguir mostra uma solicitação. `$top=2` é passado para recuperar duas mensagens.

#### Solicitação

O exemplo a seguir mostra a solicitação.

```msgraph
GET https://graph.microsoft.com/v1.0/chats/19:2da4c29f6d7041eca70b638b43d45437@thread.v2/messages?$top=2
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats('19%3A2da4c29f6d7041eca70b638b43d45437%40thread.v2')/messages",
    "@odata.count": 3,
    "@odata.nextLink": "https://graph.microsoft.com/v1.0/chats/19:2da4c29f6d7041eca70b638b43d45437@thread.v2/messages?$top=2&$skiptoken=M2UyZDAwMDAwMDMxMzkzYTMyNjQ2MTM0NjMzMjM5NjYzNjY0MzczMDM0MzE2NTYzNjEzNzMwNjIzNjMzMzg2MjM0MzM2NDM0MzUzNDMzMzc0MDc0Njg3MjY1NjE2NDJlNzYzMjAxZThmYjY4M2Y3ODAxMDAwMDg4NjA5ODdhNzgwMTAwMDB8MTYxNjk2NDUwOTgzMg%3d%3d",
    "value": [
        {
            "id": "1616964509832",
            "replyToId": null,
            "etag": "1616964509832",
            "messageType": "message",
            "createdDateTime": "2021-03-28T20:48:29.832Z",
            "lastModifiedDateTime": "2021-03-28T20:48:29.832Z",
            "lastEditedDateTime": null,
            "deletedDateTime": null,
            "subject": null,
            "summary": null,
            "chatId": "19:2da4c29f6d7041eca70b638b43d45437@thread.v2",
            "importance": "normal",
            "locale": "en-us",
            "webUrl": null,
            "channelIdentity": null,
            "policyViolation": null,
            "eventDetail": null,
            "from": {
                "application": null,
                "device": null,
                "user": {
                    "id": "8ea0e38b-efb3-4757-924a-5f94061cf8c2",
                    "displayName": "Robin Kline",
                    "userIdentityType": "aadUser"
                }
            },
            "body": {
                "contentType": "text",
                "content": "Hello world"
            },
            "attachments": [],
            "mentions": [],
            "reactions": [],
            "messageHistory": []
        },
        {
            "id": "1615971548136",
            "replyToId": null,
            "etag": "1615971548136",
            "messageType": "message",
            "createdDateTime": "2021-03-17T08:59:08.136Z",
            "lastModifiedDateTime": "2021-03-17T08:59:08.136Z",
            "lastEditedDateTime": null,
            "deletedDateTime": null,
            "subject": null,
            "summary": null,
            "chatId": "19:2da4c29f6d7041eca70b638b43d45437@thread.v2",
            "importance": "normal",
            "locale": "en-us",
            "webUrl": null,
            "channelIdentity": null,
            "policyViolation": null,
            "eventDetail": null,
            "from": {
                "application": null,
                "device": null,
                "user": {
                    "id": "8ea0e38b-efb3-4757-924a-5f94061cf8c2",
                    "displayName": "Robin Kline",
                    "userIdentityType": "aadUser"
                }
            },
            "body": {
                "contentType": "html",
                "content": "<div><div><div><span><img height=\"63\" src=\"https://graph.microsoft.com/v1.0/chats/19:2da4c29f6d7041eca70b638b43d45437@thread.v2/messages/1615971548136/hostedContents/aWQ9eF8wLXd1cy1kOS1lNTRmNjM1NWYxYmJkNGQ3ZTNmNGJhZmU4NTI5MTBmNix0eXBlPTEsdXJsPWh0dHBzOi8vdXMtYXBpLmFzbS5za3lwZS5jb20vdjEvb2JqZWN0cy8wLXd1cy1kOS1lNTRmNjM1NWYxYmJkNGQ3ZTNmNGJhZmU4NTI5MTBmNi92aWV3cy9pbWdv/$value\" width=\"67\" style=\"vertical-align:bottom; width:67px; height:63px\"></span></div></div></div>"
            },
            "attachments": [],
            "mentions": [],
            "reactions": [],
            "messageHistory": []
        },
        {
            "id": "1615943825123",
            "replyToId": null,
            "etag": "1615943825123",
            "messageType": "unknownFutureValue",
            "createdDateTime": "2021-03-1706:47:05.123Z",
            "lastModifiedDateTime": "2021-03-1706:47:05.123Z",
            "lastEditedDateTime": null,
            "deletedDateTime": null,
            "subject": null,
            "summary": null,
            "chatId": "19:2da4c29f6d7041eca70b638b43d45437@thread.v2",
            "importance": "normal",
            "locale": "en-us",
            "webUrl": null,
            "channelIdentity": null,
            "policyViolation": null,
            "from": null,
            "body": {
                "contentType": "html",
                "content": "<systemEventMessage/>"
            },
            "attachments": [],
            "mentions": [],
            "reactions": [],
            "messageHistory": [],
            "eventDetail": {
                "@odata.type": "#microsoft.graph.chatRenamedEventMessageDetail",
                "chatId": "19:2da4c29f6d7041eca70b638b43d45437@thread.v2",
                "chatDisplayName": "Graph Members",
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
    ]
}
```

### Exemplo 2: Solicitação com Cabeçalho preferencial opcional

O exemplo a seguir mostra uma solicitação. `$top=2` é passado para recuperar duas mensagens.

#### Solicitação

O exemplo a seguir mostra a solicitação.

- [HTTP](#tabpanel_2_http)
- [C#](#tabpanel_2_csharp)
- [Ir](#tabpanel_2_go)
- [Java](#tabpanel_2_java)
- [JavaScript](#tabpanel_2_javascript)
- [PHP](#tabpanel_2_php)
- [PowerShell](#tabpanel_2_powershell)
- [Python](#tabpanel_2_python)

```msgraph
GET https://graph.microsoft.com/v1.0/chats/19:2da4c29f6d7041eca70b638b43d45437@thread.v2/messages?$top=2
Prefer: include-unknown-enum-members
```

#### Resposta

Segue-se um exemplo da resposta quando `Prefer: include-unknown-enum-members` é fornecida no cabeçalho do pedido.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats('19%3A2da4c29f6d7041eca70b638b43d45437%40thread.v2')/messages",
    "@odata.count": 3,
    "@odata.nextLink": "https://graph.microsoft.com/v1.0/chats/19:2da4c29f6d7041eca70b638b43d45437@thread.v2/messages?$top=2&$skiptoken=M2UyZDAwMDAwMDMxMzkzYTMyNjQ2MTM0NjMzMjM5NjYzNjY0MzczMDM0MzE2NTYzNjEzNzMwNjIzNjMzMzg2MjM0MzM2NDM0MzUzNDMzMzc0MDc0Njg3MjY1NjE2NDJlNzYzMjAxZThmYjY4M2Y3ODAxMDAwMDg4NjA5ODdhNzgwMTAwMDB8MTYxNjk2NDUwOTgzMg%3d%3d",
    "value": [
        {
            "id": "1616964509832",
            "replyToId": null,
            "etag": "1616964509832",
            "messageType": "message",
            "createdDateTime": "2021-03-28T20:48:29.832Z",
            "lastModifiedDateTime": "2021-03-28T20:48:29.832Z",
            "lastEditedDateTime": null,
            "deletedDateTime": null,
            "subject": null,
            "summary": null,
            "chatId": "19:2da4c29f6d7041eca70b638b43d45437@thread.v2",
            "importance": "normal",
            "locale": "en-us",
            "webUrl": null,
            "channelIdentity": null,
            "policyViolation": null,
            "eventDetail": null,
            "from": {
                "application": null,
                "device": null,
                "user": {
                    "id": "8ea0e38b-efb3-4757-924a-5f94061cf8c2",
                    "displayName": "Robin Kline",
                    "userIdentityType": "aadUser"
                }
            },
            "body": {
                "contentType": "text",
                "content": "Hello world"
            },
            "attachments": [],
            "mentions": [],
            "reactions": [],
            "messageHistory": []
        },
        {
            "id": "1615971548136",
            "replyToId": null,
            "etag": "1615971548136",
            "messageType": "message",
            "createdDateTime": "2021-03-17T08:59:08.136Z",
            "lastModifiedDateTime": "2021-03-17T08:59:08.136Z",
            "lastEditedDateTime": null,
            "deletedDateTime": null,
            "subject": null,
            "summary": null,
            "chatId": "19:2da4c29f6d7041eca70b638b43d45437@thread.v2",
            "importance": "normal",
            "locale": "en-us",
            "webUrl": null,
            "channelIdentity": null,
            "policyViolation": null,
            "eventDetail": null,
            "from": {
                "application": null,
                "device": null,
                "user": {
                    "id": "8ea0e38b-efb3-4757-924a-5f94061cf8c2",
                    "displayName": "Robin Kline",
                    "userIdentityType": "aadUser"
                }
            },
            "body": {
                "contentType": "html",
                "content": "<div><div><div><span><img height=\"63\" src=\"https://graph.microsoft.com/v1.0/chats/19:2da4c29f6d7041eca70b638b43d45437@thread.v2/messages/1615971548136/hostedContents/aWQ9eF8wLXd1cy1kOS1lNTRmNjM1NWYxYmJkNGQ3ZTNmNGJhZmU4NTI5MTBmNix0eXBlPTEsdXJsPWh0dHBzOi8vdXMtYXBpLmFzbS5za3lwZS5jb20vdjEvb2JqZWN0cy8wLXd1cy1kOS1lNTRmNjM1NWYxYmJkNGQ3ZTNmNGJhZmU4NTI5MTBmNi92aWV3cy9pbWdv/$value\" width=\"67\" style=\"vertical-align:bottom; width:67px; height:63px\"></span></div></div></div>"
            },
            "attachments": [],
            "mentions": [],
            "reactions": [],
            "messageHistory": []
        },
        {
            "id": "1615943825123",
            "replyToId": null,
            "etag": "1615943825123",
            "messageType": "systemEventMessage",
            "createdDateTime": "2021-03-1706:47:05.123Z",
            "lastModifiedDateTime": "2021-03-1706:47:05.123Z",
            "lastEditedDateTime": null,
            "deletedDateTime": null,
            "subject": null,
            "summary": null,
            "chatId": "19:2da4c29f6d7041eca70b638b43d45437@thread.v2",
            "importance": "normal",
            "locale": "en-us",
            "webUrl": null,
            "channelIdentity": null,
            "policyViolation": null,
            "from": null,
            "body": {
                "contentType": "html",
                "content": "<systemEventMessage/>"
            },
            "attachments": [],
            "mentions": [],
            "reactions": [],
            "messageHistory": [],
            "eventDetail": {
                "@odata.type": "#microsoft.graph.chatRenamedEventMessageDetail",
                "chatId": "19:2da4c29f6d7041eca70b638b43d45437@thread.v2",
                "chatDisplayName": "Graph Members",
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
    ]
}
```

### Exemplo 3: Listar mensagens de chat ordenadas por data de criação

O exemplo seguinte mostra um pedido que lista as duas mensagens principais (`$top=2`) e ordena-as pela propriedade **createdDateTime** (`$orderby=createdDateTime`).

#### Solicitação

O exemplo a seguir mostra a solicitação.

- [HTTP](#tabpanel_3_http)
- [C#](#tabpanel_3_csharp)
- [Ir](#tabpanel_3_go)
- [Java](#tabpanel_3_java)
- [JavaScript](#tabpanel_3_javascript)
- [PHP](#tabpanel_3_php)
- [PowerShell](#tabpanel_3_powershell)
- [Python](#tabpanel_3_python)

```msgraph
GET https://graph.microsoft.com/v1.0/chats/19:2da4c29f6d7041eca70b638b43d45437@thread.v2/messages?$top=2&$orderby=createdDateTime desc
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats('19%3A2da4c29f6d7041eca70b638b43d45437%40thread.v2')/messages",
    "@odata.count": 2,
    "@odata.nextLink": "https://graph.microsoft.com/v1.0/chats/19:2da4c29f6d7041eca70b638b43d45437@thread.v2/messages?$top=2&$skiptoken=M2UyZDAwMDAwMDMxMzkzYTMyNjQ2MTM0NjMzMjM5NjYzNjY0MzczMDM0MzE2NTYzNjEzNzMwNjIzNjMzMzg2MjM0MzM2NDM0MzUzNDMzMzc0MDc0Njg3MjY1NjE2NDJlNzYzMjAxZThmYjY4M2Y3ODAxMDAwMDg4NjA5ODdhNzgwMTAwMDB8MTYxNjk2NDUwOTgzMg%3d%3d",
    "value": [
        {
            "id": "1616964509832",
            "replyToId": null,
            "etag": "1616964509832",
            "messageType": "message",
            "createdDateTime": "2021-03-28T20:48:29.832Z",
            "lastModifiedDateTime": "2021-03-28T20:48:29.832Z",
            "lastEditedDateTime": null,
            "deletedDateTime": null,
            "subject": null,
            "summary": null,
            "chatId": "19:2da4c29f6d7041eca70b638b43d45437@thread.v2",
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
                    "id": "8ea0e38b-efb3-4757-924a-5f94061cf8c2",
                    "displayName": "Robin Kline",
                    "userIdentityType": "aadUser"
                }
            },
            "body": {
                "contentType": "text",
                "content": "Hello world"
            },
            "attachments": [],
            "mentions": [],
            "reactions": [],
            "messageHistory": []
        },
        {
            "id": "1615971548136",
            "replyToId": null,
            "etag": "1615971548136",
            "messageType": "message",
            "createdDateTime": "2021-03-17T08:59:08.136Z",
            "lastModifiedDateTime": "2021-03-17T08:59:08.136Z",
            "lastEditedDateTime": null,
            "deletedDateTime": null,
            "subject": null,
            "summary": null,
            "chatId": "19:2da4c29f6d7041eca70b638b43d45437@thread.v2",
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
                    "id": "8ea0e38b-efb3-4757-924a-5f94061cf8c2",
                    "displayName": "Robin Kline",
                    "userIdentityType": "aadUser"
                }
            },
            "body": {
                "contentType": "html",
                "content": "<div><div><div><span><img height=\"63\" src=\"https://graph.microsoft.com/v1.0/chats/19:2da4c29f6d7041eca70b638b43d45437@thread.v2/messages/1615971548136/hostedContents/aWQ9eF8wLXd1cy1kOS1lNTRmNjM1NWYxYmJkNGQ3ZTNmNGJhZmU4NTI5MTBmNix0eXBlPTEsdXJsPWh0dHBzOi8vdXMtYXBpLmFzbS5za3lwZS5jb20vdjEvb2JqZWN0cy8wLXd1cy1kOS1lNTRmNjM1NWYxYmJkNGQ3ZTNmNGJhZmU4NTI5MTBmNi92aWV3cy9pbWdv/$value\" width=\"67\" style=\"vertical-align:bottom; width:67px; height:63px\"></span></div></div></div>"
            },
            "attachments": [],
            "mentions": [],
            "reactions": [],
            "messageHistory": []
        }
    ]
}
```

### Exemplo 4: Listar mensagens de chat filtradas pelo intervalo de datas da última modificação

O exemplo seguinte mostra um pedido que lista as duas mensagens principais (`$top=2`), ordena-as por ordem descendente pela propriedade **lastModifiedDateTime** (`$orderby=lastModifiedDateTime desc`) e filtra os resultados de um intervalo de datas específico (`$filter=lastModifiedDateTime gt 2022-09-22T00:00:00.000Z and lastModifiedDateTime lt 2022-09-24T00:00:00.000Z`).

#### Solicitação

O exemplo a seguir mostra a solicitação.

- [HTTP](#tabpanel_4_http)
- [C#](#tabpanel_4_csharp)
- [Ir](#tabpanel_4_go)
- [Java](#tabpanel_4_java)
- [JavaScript](#tabpanel_4_javascript)
- [PHP](#tabpanel_4_php)
- [PowerShell](#tabpanel_4_powershell)
- [Python](#tabpanel_4_python)

```msgraph
GET https://graph.microsoft.com/v1.0/chats/19:2da4c29f6d7041eca70b638b43d45437@thread.v2/messages?$top=2&$orderby=lastModifiedDateTime desc&$filter=lastModifiedDateTime gt 2022-09-22T00:00:00.000Z and lastModifiedDateTime lt 2022-09-24T00:00:00.000Z
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats('19%3A2da4c29f6d7041eca70b638b43d45437%40thread.v2')/messages",
    "@odata.count": 2,
    "@odata.nextLink": "https://graph.microsoft.com/v1.0/chats/19:2da4c29f6d7041eca70b638b43d45437@thread.v2/messages?$top=2&$orderby=lastModifiedDateTime desc&$filter=lastModifiedDateTime gt 2022-09-22T00:00:00.000Z and lastModifiedDateTime lt 2022-09-24T00:00:00.000Z&$skiptoken=M2UyZDAwMDAwMDMxMzkzYTMyNjQ2MTM0NjMzMjM5NjYzNjY0MzczMDM0MzE2NTYzNjEzNzMwNjIzNjMzMzg2MjM0MzM2NDM0MzUzNDMzMzc0MDc0Njg3MjY1NjE2NDJlNzYzMjAxZThmYjY4M2Y3ODAxMDAwMDg4NjA5ODdhNzgwMTAwMDB8MTYxNjk2NDUwOTgzMg%3d%3d",
    "value": [
        {
            "id": "1616964509832",
            "replyToId": null,
            "etag": "1616964509832",
            "messageType": "message",
            "createdDateTime": "2022-09-23T00:00:00.000Z",
            "lastModifiedDateTime": "2022-09-23T00:00:00.000Z",
            "lastEditedDateTime": null,
            "deletedDateTime": null,
            "subject": null,
            "summary": null,
            "chatId": "19:2da4c29f6d7041eca70b638b43d45437@thread.v2",
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
                    "id": "8ea0e38b-efb3-4757-924a-5f94061cf8c2",
                    "displayName": "Robin Kline",
                    "userIdentityType": "aadUser"
                }
            },
            "body": {
                "contentType": "text",
                "content": "Hello world"
            },
            "attachments": [],
            "mentions": [],
            "reactions": [],
            "messageHistory": []
        },
        {
            "id": "1615971548136",
            "replyToId": null,
            "etag": "1615971548136",
            "messageType": "message",
            "createdDateTime": "2022-09-23T00:00:00.000Z",
            "lastModifiedDateTime": "2022-09-23T00:00:00.000Z",
            "lastEditedDateTime": null,
            "deletedDateTime": null,
            "subject": null,
            "summary": null,
            "chatId": "19:2da4c29f6d7041eca70b638b43d45437@thread.v2",
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
                    "id": "8ea0e38b-efb3-4757-924a-5f94061cf8c2",
                    "displayName": "Robin Kline",
                    "userIdentityType": "aadUser"
                }
            },
            "body": {
                "contentType": "html",
                "content": "<div><div><div><span><img height=\"63\" src=\"https://graph.microsoft.com/1.0/chats/19:2da4c29f6d7041eca70b638b43d45437@thread.v2/messages/1615971548136/hostedContents/aWQ9eF8wLXd1cy1kOS1lNTRmNjM1NWYxYmJkNGQ3ZTNmNGJhZmU4NTI5MTBmNix0eXBlPTEsdXJsPWh0dHBzOi8vdXMtYXBpLmFzbS5za3lwZS5jb20vdjEvb2JqZWN0cy8wLXd1cy1kOS1lNTRmNjM1NWYxYmJkNGQ3ZTNmNGJhZmU4NTI5MTBmNi92aWV3cy9pbWdv/$value\" width=\"67\" style=\"vertical-align:bottom; width:67px; height:63px\"></span></div></div></div>"
            },
            "attachments": [],
            "mentions": [],
            "reactions": [],
            "messageHistory": []
        }
    ]
}
```