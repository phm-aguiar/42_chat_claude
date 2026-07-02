---
title: "channel: getAllMessages - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-getallmessages?view=graph-rest-1.0&tabs=http"
author:
  - "[[RamjotSingh]]"
published:
created: 2026-06-30
description: "Recupere todas as mensagens entre os canais de uma equipe."
tags:
  - "clippings"
---
## channel: getAllMessages

Namespace: microsoft.graph

Recupere as [mensagens](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) em todos os [canais](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) de uma [equipe](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0), incluindo texto, áudio, e conversas de vídeo.

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
| Aplicativo | ChannelMessage.Read.All | Indisponível. |

## Solicitação HTTP

HTTP

```http
GET /teams/{team-id}/channels/getAllMessages
```

## Parâmetros de consulta opcionais

Você pode usar o parâmetro de consulta [$top](https://learn.microsoft.com/pt-br/graph/query-parameters#top-parameter) para controlar o número de itens por resposta. Além disso, [$filter](https://learn.microsoft.com/pt-br/graph/query-parameters#filter-parameter) é suportado com **dateTime** intervalo de consulta em **lastModifiedDateTime**. Os outros [parâmetros de consulta OData](https://learn.microsoft.com/pt-br/graph/query-parameters) não têm suporte no momento.

## Cabeçalhos de solicitação

| Nome | Descrição |
| --- | --- |
| Autorização | Portador {código}. Obrigatório. |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se tiver êxito, este método retornará um `200 OK` de resposta e também retornará todas as mensagens em todos os canais públicos e privados.

## Exemplo

### Solicitação

O exemplo a seguir mostra uma solicitação.

```http
GET https://graph.microsoft.com/v1.0/teams/01fe12e0-e720-44fd-8854-28c66d1bee40/channels/getAllMessages?$filter=lastModifiedDateTime+gt+2019-11-01T00:00:00Z+and lastModifiedDateTime+lt+2021-11-01T00:00:00Z
```

### Resposta

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#Collection(chatMessage)",
    "@odata.count": 2,
    "@odata.nextLink": "https://graph.microsoft.com/v1.0/teams('01fe12e0-e720-44fd-8854-28c66d1bee40')/channels/getallMessages?$skiptoken=U2tpcFZhbHVlPTAjUHJpdmF0ZUNoYW5uZWxJZD0xOTpmYWU5YTJmZjk1ZGE0ZTEwOWE1YTg3ZTM5Y2FkOGYyYkB0aHJlYWQudGFjdjIjVXNlcklkPTBkN2M2M2QzLTEzMDYtNGVlYy04ZjIxLTU4OGE3MGZiNmVmMSNNYWlsYm94Rm9sZGVyPU1haWxGb2xkZXJzL1RlYW1DaGF0&$filter=lastModifiedDateTime+gt+2019-11-01T00%3a00%3a00Z+and+lastModifiedDateTime+lt+2021-11-01T00%3a00%3a00Z",
    "value": [
        {
            "@odata.type": "#microsoft.graph.chatMessage",
            "id": "1622071758431",
            "replyToId": "1622071642456",
            "etag": "1622071758431",
            "messageType": "message",
            "createdDateTime": "2021-05-26T23:29:18.431Z",
            "lastModifiedDateTime": "2021-05-26T23:29:18.431Z",
            "lastEditedDateTime": null,
            "deletedDateTime": null,
            "subject": null,
            "summary": null,
            "chatId": null,
            "importance": "normal",
            "locale": "en-us",
            "webUrl": "https://teams.microsoft.com/l/message/19%3Afae9a2ff95da4e109a5a87e39cad8f2b%40thread.tacv2/1622071758431?groupId=01fe12e0-e720-44fd-8854-28c66d1bee40&tenantId=9854dc85-3fb3-4f8e-a055-9cdc5523024d&createdTime=1622071758431&parentMessageId=1622071642456",
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
                "contentType": "html",
                "content": "<div>\n<div itemprop=\"copy-paste-block\">reply 9&nbsp;to new conv</div>\n</div>"
            },
            "channelIdentity": {
                "teamId": "01fe12e0-e720-44fd-8854-28c66d1bee40",
                "channelId": "19:fae9a2ff95da4e109a5a87e39cad8f2b@thread.tacv2"
            },
            "attachments": [],
            "mentions": [],
            "reactions": []
        },
        {
            "@odata.type": "#microsoft.graph.chatMessage",
            "id": "1622071764529",
            "replyToId": "1622071642456",
            "etag": "1622071764529",
            "messageType": "message",
            "createdDateTime": "2021-05-26T23:29:24.529Z",
            "lastModifiedDateTime": "2021-05-26T23:29:24.529Z",
            "lastEditedDateTime": null,
            "deletedDateTime": null,
            "subject": null,
            "summary": null,
            "chatId": null,
            "importance": "normal",
            "locale": "en-us",
            "webUrl": "https://teams.microsoft.com/l/message/19%3Afae9a2ff95da4e109a5a87e39cad8f2b%40thread.tacv2/1622071764529?groupId=01fe12e0-e720-44fd-8854-28c66d1bee40&tenantId=9854dc85-3fb3-4f8e-a055-9cdc5523024d&createdTime=1622071764529&parentMessageId=1622071642456",
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
                "contentType": "html",
                "content": "<div>\n<div itemprop=\"copy-paste-block\">reply 10 to new conv</div>\n</div>"
            },
            "channelIdentity": {
                "teamId": "01fe12e0-e720-44fd-8854-28c66d1bee40",
                "channelId": "19:fae9a2ff95da4e109a5a87e39cad8f2b@thread.tacv2"
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