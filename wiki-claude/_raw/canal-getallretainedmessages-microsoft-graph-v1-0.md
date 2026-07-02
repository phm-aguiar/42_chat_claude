---
title: "canal: getAllRetainedMessages - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-getallretainedmessages?view=graph-rest-1.0&tabs=http"
author:
  - "[[bkeerthivasa]]"
published:
created: 2026-06-30
description: "Obtenha todas as mensagens retidas em todos os canais numa equipa."
tags:
  - "clippings"
---
## canal: getAllRetainedMessages

Namespace: microsoft.graph

Obtenha todas as [mensagens](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) retidas em todos os [canais](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) numa [equipa](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0).

Para saber mais sobre como usar as APIs de exportação do Microsoft Teams para exportar conteúdo, consulte [Exportar conteúdo com as APIs de exportação do Microsoft Teams](https://learn.microsoft.com/pt-br/microsoftteams/export-teams-content).

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

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
GET /teams/{teamsId}/channels/getAllRetainedMessages
```

## Parâmetros de consulta opcionais

Este método suporta os seguintes parâmetros de consulta OData para ajudar a personalizar a resposta. Para obter informações gerais, acesse [Parâmetros de consulta OData](https://learn.microsoft.com/pt-br/graph/query-parameters).

| Nome | Descrição |
| --- | --- |
| $filter | O parâmetro [de consulta $filter](https://learn.microsoft.com/pt-br/graph/query-parameters#filter-parameter) suporta consultas de intervalo de data e hora na propriedade **lastModifiedDateTime**. |
| $top | Utilize o parâmetro [de consulta $top](https://learn.microsoft.com/pt-br/graph/query-parameters#top-parameter) para controlar o número de itens por resposta. |

## Cabeçalhos de solicitação

| Nome | Descrição |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se bem sucedida, esta função devolve um `200 OK` código de resposta e uma coleção de objetos de [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) no corpo da resposta.

## Exemplos

### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_1_http)
- [C#](#tabpanel_1_csharp)
- [Ir](#tabpanel_1_go)
- [Java](#tabpanel_1_java)
- [JavaScript](#tabpanel_1_javascript)
- [PHP](#tabpanel_1_php)
- [PowerShell](#tabpanel_1_powershell)
- [Python](#tabpanel_1_python)

```http
GET https://graph.microsoft.com/v1.0/teams/8b081ef6-4792-4def-b2c9-c363a1bf41d5/channels/getAllRetainedMessages
```

### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#Collection(chatMessage)",
  "@odata.count": 2,
  "@odata.nextLink": "https://graph.microsoft.com/v1.0/teams/fbe2bf47-16c8-47cf-b4a5-4b9b187c508b/channels/getAllRetainedMessages?$skip=2",
  "value": [
    {
      "@odata.type": "#microsoft.graph.chatMessage",
      "id": "1616990417393",
      "replyToId": null,
      "etag": "1616990417393",
      "messageType": "message",
      "createdDateTime": "2021-03-29T04:00:17.393Z",
      "lastModifiedDateTime": "2021-03-29T04:00:17.393Z",
      "lastEditedDateTime": null,
      "deletedDateTime": null,
      "subject": null,
      "summary": null,
      "chatId": null,
      "importance": "normal",
      "locale": "en-us",
      "webUrl": "https://teams.microsoft.com/l/message/19%3Ad5d2708d408c41d98424c1c354c19db3%40thread.tacv2/1616990417393?groupId=fbe2bf47-16c8-47cf-b4a5-4b9b187c508b&tenantId=2432b57b-0abd-43db-aa7b-16eadd115d34&createdTime=1616990417393&parentMessageId=1616990417393",
      "policyViolation": null,
      "eventDetail": null,
      "from": {
        "application": null,
        "device": null,
        "conversation": null,
        "user": {
          "id": "8ea0e38b-efb3-4757-924a-5f94061cf8c2",
          "displayName": "Robin Kline",
          "userIdentityType": "aadUser"
        }
      },
      "body": {
        "contentType": "text",
        "content": "Test message"
      },
      "channelIdentity": {
        "teamId": "fbe2bf47-16c8-47cf-b4a5-4b9b187c508b",
        "channelId": "19:d5d2708d408c41d98424c1c354c19db3@thread.tacv2"
      },
      "attachments": [],
      "mentions": [],
      "reactions": []
    },
    {
      "@odata.type": "#microsoft.graph.chatMessage",
      "id": "1616990171266",
      "replyToId": "1616990032035",
      "etag": "1616990171266",
      "messageType": "message",
      "createdDateTime": "2021-03-29T03:56:11.266Z",
      "lastModifiedDateTime": "2021-03-29T03:56:11.266Z",
      "lastEditedDateTime": null,
      "deletedDateTime": null,
      "subject": null,
      "summary": null,
      "chatId": null,
      "importance": "normal",
      "locale": "en-us",
      "webUrl": "https://teams.microsoft.com/l/message/19%3A4a95f7d8db4c4e7fae857bcebe0623e6%40thread.tacv2/1616990171266?groupId=fbe2bf47-16c8-47cf-b4a5-4b9b187c508b&tenantId=2432b57b-0abd-43db-aa7b-16eadd115d34&createdTime=1616990171266&parentMessageId=1616990032035",
      "policyViolation": null,
      "eventDetail": null,
      "from": {
        "application": null,
        "device": null,
        "conversation": null,
        "user": {
          "id": "8ea0e38b-efb3-4757-924a-5f94061cf8c2",
          "displayName": "Robin Kline",
          "userIdentityType": "aadUser"
        }
      },
      "body": {
        "contentType": "text",
        "content": "Hello World"
      },
      "channelIdentity": {
        "teamId": "fbe2bf47-16c8-47cf-b4a5-4b9b187c508b",
        "channelId": "19:4a95f7d8db4c4e7fae857bcebe0623e6@thread.tacv2"
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