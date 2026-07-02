---
title: "chats: getAllMessages - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/chats-getallmessages?view=graph-rest-1.0&tabs=http"
author:
  - "[[RamjotSingh]]"
published:
created: 2026-06-30
description: "Obtenha todas as mensagens de todas as conversas nas quais um utilizador é participante."
tags:
  - "clippings"
---
## chats: getAllMessages

Namespace: microsoft.graph

Obtenha todas as [mensagens](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) de todas as [conversas](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) em que um utilizador é participante, incluindo conversas um-para-um, conversas de grupo e conversas de reunião.

Para saber mais sobre como usar as APIs de exportação do Microsoft Teams para exportar conteúdo, consulte [Exportar conteúdo com as APIs de exportação do Microsoft Teams](https://learn.microsoft.com/pt-br/microsoftteams/export-teams-content).

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ❌ | ❌ | ❌ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | Sem suporte. | Sem suporte. |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Aplicativo | Chat.Read.All | Chat.ReadWrite.All |

## Solicitação HTTP

HTTP

```http
GET /users/{id | user-principal-name}/chats/getAllMessages
```

## Parâmetros de consulta opcionais

Este método também suporta [parâmetros de intervalo de datas](https://learn.microsoft.com/pt-br/graph/query-parameters) para personalizar a resposta, conforme mostrado no exemplo seguinte.

HTTP

```http
GET /users/{id}/chats/getAllMessages?$top=50&$filter=lastModifiedDateTime gt 2020-06-04T18:03:11.591Z and lastModifiedDateTime lt 2020-06-05T21:00:09.413Z
```

Este método suporta o `$filter` parâmetro de consulta. A tabela seguinte lista exemplos.

| Cenário | Parâmetro `$filter` | Valores possíveis |
| --- | --- | --- |
| Obter mensagens enviadas por tipo de identidade de utilizador | $filter=from/user/userIdentityType eq '{teamworkUserIdentityType}' | aadUser, onPremiseAadUser, anonymousGuest, federatedUser, personalMicrosoftAccountUser, skypeUser, phoneUser |
| Obter mensagens enviadas por tipo de aplicação | $filter=from/application/applicationIdentityType eq '{teamworkApplicationIdentity}' | aadApplication, bot, tenantBot, office365Connector, outgoingWebhook |
| Obter mensagens enviadas pelo ID de utilizador | $filter=from/user/id eq '{oid}' |  |
| Obter mensagens de controlo (evento do sistema) | $filter=messageType eq "systemEventMessage" |  |
| Excluir mensagens de controlo (evento do sistema) | $filter=messageType ne "systemEventMessage" |  |

> **Nota:** Estas cláusulas de filtro podem ser associadas com o `or` operador. Uma cláusula de filtro pode aparecer mais do que uma vez numa consulta e pode filtrar um valor diferente sempre que for apresentada na consulta..

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Resposta

Se bem-sucedido, este método retorna um código de resposta `200 OK` e uma coleção de objetos [event](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) no corpo da resposta.

### Erros

Esta API tem [requisitos de licenciamento e pagamento](https://learn.microsoft.com/pt-br/graph/teams-licenses). Se estes requisitos não forem cumpridos, a API devolve um dos seguintes erros.

| Tipo de erro de exemplo | Código de status | Mensagem de erro de exemplo |
| --- | --- | --- |
| Requisito de licença E5 não atendido | 402 (Pagamento Obrigatório) | `"...needs a valid license to access this API..."`   `"...tenant needs a valid license to access this API..."` |
| Capacidade de avaliação excedida | 402 (Pagamento Obrigatório) | `"...evaluation mode capacity has been exceeded. Use a valid billing model..."` |

## Exemplo

### Solicitação

- [HTTP](#tabpanel_1_http)
- [C#](#tabpanel_1_csharp)
- [Ir](#tabpanel_1_go)
- [Java](#tabpanel_1_java)
- [JavaScript](#tabpanel_1_javascript)
- [PHP](#tabpanel_1_php)
- [Python](#tabpanel_1_python)

```http
GET https://graph.microsoft.com/v1.0/users/0b4f1cf6-54c8-4820-bbb7-2a1f4257ade5/chats/getAllMessages?$top=2
```

### Resposta

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#Collection(chatMessage)",
    "@odata.count": 2,
    "@odata.nextLink": "https://graph.microsoft.com/v1.0/users('0b4f1cf6-54c8-4820-bbb7-2a1f4257ade5')/chats/getallMessages?$top=2&$skiptoken=U2tpcFZhbHVlPTIjTWFpbGJveEZvbGRlcj1NYWlsRm9sZGVycy9UZWFtc01lc3NhZ2VzRGF0YQ%3d%3d",
    "value": [
        {
            "@odata.type": "#microsoft.graph.chatMessage",
            "id": "1621973534864",
            "replyToId": null,
            "etag": "1621973534864",
            "messageType": "message",
            "createdDateTime": "2021-05-25T20:12:14.864Z",
            "lastModifiedDateTime": "2021-05-25T20:12:14.864Z",
            "lastEditedDateTime": null,
            "deletedDateTime": null,
            "subject": null,
            "summary": null,
            "chatId": "19:3c9e92a344704332bbf5bda58f4d37b1@thread.v2",
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
                    "id": "0b4f1cf6-54c8-4820-bbb7-2a1f4257ade5",
                    "displayName": "user1 a",
                    "userIdentityType": "aadUser"
                }
            },
            "body": {
                "contentType": "text",
                "content": "Hello user2, user 3"
            },
            "attachments": [],
            "mentions": [],
            "reactions": []
        },
        {
            "@odata.type": "#microsoft.graph.chatMessage",
            "id": "1622762567488",
            "replyToId": null,
            "etag": "1622762567488",
            "messageType": "message",
            "createdDateTime": "2021-06-03T23:22:47.488Z",
            "lastModifiedDateTime": "2021-06-03T23:22:47.488Z",
            "lastEditedDateTime": null,
            "deletedDateTime": null,
            "subject": null,
            "summary": null,
            "chatId": "19:0b4f1cf6-54c8-4820-bbb7-2a1f4257ade5_0d7c63d3-1306-4eec-8f21-588a70fb6ef1@unq.gbl.spaces",
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
                    "id": "0b4f1cf6-54c8-4820-bbb7-2a1f4257ade5",
                    "displayName": "user1 a",
                    "userIdentityType": "aadUser"
                }
            },
            "body": {
                "contentType": "text",
                "content": "hi user2"
            },
            "attachments": [],
            "mentions": [],
            "reactions": []
        }
    ]
}
```

## Conteúdo relacionado

[Limites de limitação específicos do serviço do Microsoft Graph](https://learn.microsoft.com/pt-br/graph/throttling-limits#microsoft-teams-service-limits)