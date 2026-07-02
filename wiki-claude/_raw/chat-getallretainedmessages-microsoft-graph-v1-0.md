---
title: "chat: getAllRetainedMessages - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/chat-getallretainedmessages?view=graph-rest-1.0&tabs=http"
author:
  - "[[bkeerthivasa]]"
published:
created: 2026-06-30
description: "Obtenha todas as mensagens retidas de todas as conversas nas quais um utilizador participa, incluindo conversas um-para-um, conversas de grupo e conversas de reunião."
tags:
  - "clippings"
---
## chat: getAllRetainedMessages

Namespace: microsoft.graph

Obtenha todas as [mensagens](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) [retidas](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) de todas as conversas nas quais um utilizador participa, incluindo conversas um-para-um, conversas de grupo e conversas de reunião.

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
| Aplicativo | Chat.Read.All | Chat.ReadWrite.All |

## Solicitação HTTP

HTTP

```http
GET /users/{id}/chats/getAllRetainedMessages
```

## Parâmetros de consulta opcionais

Este método suporta os seguintes parâmetros de consulta OData para ajudar a personalizar a resposta. Para obter informações gerais, acesse [Parâmetros de consulta OData](https://learn.microsoft.com/pt-br/graph/query-parameters).

| Nome | Descrição |
| --- | --- |
| $filter | O parâmetro [de consulta $filter](https://learn.microsoft.com/pt-br/graph/query-parameters#filter-parameter) suporta consultas de intervalo de data e hora na propriedade **lastModifiedDateTime** com [parâmetros de intervalo de datas](https://learn.microsoft.com/pt-br/graph/query-parameters). |
| $top | Utilize o parâmetro [de consulta $top](https://learn.microsoft.com/pt-br/graph/query-parameters#top-parameter) para controlar o número de itens por resposta. |

O exemplo seguinte mostra um pedido que utiliza os `$top` parâmetros e `$filter` de consulta para obter uma lista de mensagens de chat retidas.

HTTP

```http
GET /users/{id}/chats/getAllRetainedMessages?$top=50&$filter=lastModifiedDateTime gt 2020-06-04T18:03:11.591Z and lastModifiedDateTime lt 2020-06-05T21:00:09.413Z
```

A tabela seguinte lista exemplos que mostram como utilizar o `$filter` parâmetro.

| Cenário | Parâmetro `$filter` | Valores possíveis |
| --- | --- | --- |
| Obter mensagens enviadas por tipo de identidade de utilizador | $filter=from/user/userIdentityType eq '{teamworkUserIdentityType}' | `aadUser`, `onPremiseAadUser`, `anonymousGuest`, `federatedUser`, `personalMicrosoftAccountUser`, `skypeUser`, `phoneUser` |
| Obter mensagens enviadas por tipo de aplicação | $filter=from/application/applicationIdentityType eq '{teamworkApplicationIdentity}' | `aadApplication`, `bot`, `tenantBot`, `office365Connector`, `outgoingWebhook` |
| Obter mensagens enviadas pelo ID de utilizador | $filter=from/user/id eq '{oid}' |  |
| Obter mensagens de controlo (evento do sistema) | $filter=messageType eq "systemEventMessage" |  |
| Excluir mensagens de controlo (evento do sistema) | $filter=messageType ne "systemEventMessage" |  |

## Cabeçalhos de solicitação

| Nome | Descrição |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se bem sucedido, este método retorna um código de resposta `200 OK` e uma coleção de objetos [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) no corpo da resposta.

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
GET https://graph.microsoft.com/v1.0/users/8b081ef6-4792-4def-b2c9-c363a1bf41d5/chats/getAllRetainedMessages
```

### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#Collection(chatMessage)",
  "@odata.count": 10,
  "@odata.nextLink": "https://graph.microsoft.com/v1.0/users/8b081ef6-4792-4def-b2c9-c363a1bf41d5/chats/getAllRetainedMessages?$skip=10",
  "value": [
    {
      "@odata.type": "#microsoft.graph.chatMessage",
      "id": "1600457965467",
      "replyToId": null,
      "etag": "1600457965467",
      "messageType": "message",
      "createdDateTime": "2020-09-18T19:39:25.467Z",
      "lastModifiedDateTime": "2020-09-18T19:39:25.467Z",
      "lastEditedDateTime": null,
      "deletedDateTime": null,
      "subject": null,
      "summary": null,
      "chatId": "19:0de69e5e-2da8-4cf2-821f-5e6585b2c65b_5c64e248-3269-4268-a36e-0f80314e9c39@unq.gbl.spaces",
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
          "id": "0de69e5e-2da8-4cf2-821f-5e6585b2c65b",
          "displayName": "Richard Wilson",
          "userIdentityType": "aadUser"
        }
      },
      "body": {
        "contentType": "html",
        "content": "<div>\n<blockquote itemscope=\"\" itemtype=\"http://schema.skype.com/Reply\" itemid=\"1600457867820\">\n<strong itemprop=\"mri\" itemid=\"8:orgid:0de69e5e-2da8-4cf2-821f-5e6585b2c65b\">Richard Wilson</strong><span itemprop=\"time\" itemid=\"1600457867820\"></span>\n<p itemprop=\"preview\">1237</p>\n</blockquote>\n<p>this is a reply</p>\n</div>"
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