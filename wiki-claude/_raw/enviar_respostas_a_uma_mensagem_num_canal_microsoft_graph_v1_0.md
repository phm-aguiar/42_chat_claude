---
title: "Enviar respostas a uma mensagem num canal - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/chatmessage-post-replies?view=graph-rest-1.0&tabs=http"
author:
  - "[[RamjotSingh]]"
published:
created: 2026-06-30
description: "Responder a uma mensagem existente num canal."
tags:
  - "clippings"
---
## Enviar respostas a uma mensagem num canal

Namespace: microsoft.graph

Enviar uma nova resposta para um [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) num [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) especificado.

> **Observações**:
> 
> - Não recomendamos que utilize esta API para migração de dados através do fluxo de mensagens de criação padrão. Para cenários de migração de dados, utilize antes o fluxo [de mensagens de importação](https://learn.microsoft.com/pt-br/graph/teams-import-messages).
> - É uma violação dos [termos de utilização](https://learn.microsoft.com/pt-br/legal/microsoft-apis/terms-of-use) para utilizar o Microsoft Teams como um ficheiro de registo. Enviar apenas mensagens que as pessoas lerão.

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | ChannelMessage.Send | Group.ReadWrite.All |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Aplicativo | Teamwork.Migrate.All | Indisponível. |

## Solicitação HTTP

HTTP

```http
POST /teams/{team-id}/channels/{channel-id}/messages/{message-id}/replies
```

## Cabeçalhos de solicitação

| Nome | Tipo | Descrição |
| --- | --- | --- |
| Autorização | string | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

No corpo do pedido, forneça uma representação JSON de um objeto de [mensagem](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0). Apenas a propriedade body é obrigatória. Outras propriedades são opcionais.

## Resposta

Se for bem-sucedido, este método devolve `201 Created` o código de resposta com a [mensagem](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) que foi criada.

## Exemplos

### Exemplo 1: Enviar uma nova resposta para um chatMessage

Para obter uma lista mais abrangente de exemplos, consulte [Criar chatMessage num canal ou chat](https://learn.microsoft.com/pt-br/graph/api/chatmessage-post?view=graph-rest-1.0).

#### Solicitação

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
POST https://graph.microsoft.com/v1.0/teams/fbe2bf47-16c8-47cf-b4a5-4b9b187c508b/channels/19:4a95f7d8db4c4e7fae857bcebe0623e6@thread.tacv2/messages/1616990032035/replies
Content-type: application/json

{
  "body": {
    "contentType": "html",
    "content": "Hello World"
  }
}
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 201 Created
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#teams('fbe2bf47-16c8-47cf-b4a5-4b9b187c508b')/channels('19%3A4a95f7d8db4c4e7fae857bcebe0623e6%40thread.tacv2')/messages('1616990032035')/replies/$entity",
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
        "content": "Hello World"
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

### Exemplo 2: Importar mensagens

O exemplo seguinte mostra como importar uma resposta de mensagem. Para obter mais informações, consulte [Importar mensagens para chats e canais do Microsoft Teams com o Microsoft Graph](https://learn.microsoft.com/pt-br/graph/teams-import-messages).

> **Nota**: o âmbito `Teamwork.Migrate.All` de permissão é necessário para este cenário.

#### Solicitação

O exemplo seguinte mostra como importar mensagens de back-in-time com as `createDateTime` chaves e `from` no corpo do pedido.

- [HTTP](#tabpanel_2_http)
- [C#](#tabpanel_2_csharp)
- [Ir](#tabpanel_2_go)
- [Java](#tabpanel_2_java)
- [JavaScript](#tabpanel_2_javascript)
- [PHP](#tabpanel_2_php)
- [PowerShell](#tabpanel_2_powershell)
- [Python](#tabpanel_2_python)

```http
POST https://graph.microsoft.com/v1.0/teams/57fb72d0-d811-46f4-8947-305e6072eaa5/channels/19:4b6bed8d24574f6a9e436813cb2617d8@thread.tacv2/messages/1590776551682/replies

{
   "createdDateTime":"2019-02-04T19:58:15.511Z",
   "from":{
      "user":{
         "id":"8c0a1a67-50ce-4114-bb6c-da9c5dbcf6ca",
         "displayName":"John Doe"
      }
   },
   "body":{
      "contentType":"html",
      "content":"Hello World"
   }
}
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
{
   "@odata.context":"https://graph.microsoft.com/v1.0/$metadata#teams('57fb72d0-d811-46f4-8947-305e6072eaa5')/channels('19:4b6bed8d24574f6a9e436813cb2617d8@thread.tacv2')/messages('1590776551682')/replies/$entity",
   "id":"1591039710682",
   "replyToId":"1590776551682",
   "etag":"1591039710682",
   "messageType":"message",
   "createdDateTime":"2019-02-04T19:58:15.511Z",
   "lastModifiedDateTime":null,
   "deleted":false,
   "subject":null,
   "summary":null,
   "importance":"normal",
   "locale":"en-us",
   "policyViolation":null,
   "eventDetail": null,
   "from":{
      "application":null,
      "device":null,
      "user":{
         "@odata.type": "#microsoft.graph.teamworkUserIdentity",
         "id":"8c0a1a67-50ce-4114-bb6c-da9c5dbcf6ca",
         "displayName":"Joh Doe",
         "userIdentityType":"aadUser",
         "tenantId": "e61ef81e-8bd8-476a-92e8-4a62f8426fca"
      }
   },
   "body":{
      "contentType":"html",
      "content":"Hello World"
   },
   "attachments":[],
   "mentions":[],
   "reactions":[],
   "messageHistory": []
}
```