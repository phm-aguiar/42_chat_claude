---
title: "chats-getAllMessages: delta - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/chatmessage-delta?view=graph-rest-1.0&tabs=http"
author:
  - "[[bkeerthivasa]]"
published:
created: 2026-06-30
description: "Obtenha a lista de mensagens de todas as conversas nas quais um utilizador é participante, incluindo conversas um-para-um, conversas de grupo e conversas de reunião."
tags:
  - "clippings"
---
## chatMessage: delta

Namespace: microsoft.graph

Obtenha a lista de [mensagens](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) de todas as [conversas](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) nas quais um utilizador é participante, incluindo conversas um-para-um, conversas de grupo e conversas de reunião. Quando utiliza a consulta delta, pode obter mensagens novas ou atualizadas.

> **Nota:** O Delta só devolve mensagens nos últimos oito meses. Pode utilizar [GET /users/{id | user-principal-name}/chats/getAllMessages](https://learn.microsoft.com/pt-br/graph/api/chats-getallmessages?view=graph-rest-1.0) para obter mensagens mais antigas. A consulta Delta suporta a sincronização completa que obtém todas as mensagens de todas as conversas em que um utilizador é participante e a sincronização incremental que recebe mensagens adicionadas ou alteradas desde a última sincronização. Normalmente, faz uma sincronização completa inicial e, em seguida, obtém alterações incrementais nessa vista de mensagens periodicamente.

Para obter as respostas de uma mensagem, utilize as [respostas da mensagem de lista](https://learn.microsoft.com/pt-br/graph/api/chatmessage-list-replies?view=graph-rest-1.0) ou as operações [de resposta a mensagens de obtenção](https://learn.microsoft.com/pt-br/graph/api/chatmessage-get?view=graph-rest-1.0).

Um pedido GET com a função delta devolve um dos seguintes:

- Uma **@odata.nextLink** que contém um URL com uma chamada de função **delta** e um `skipToken`.
- Uma **@odata.deltaLink** que contém um URL com uma chamada de função **delta** e um `deltaToken`.

Os tokens de estado são opacos para o cliente. Para prosseguir com uma ronda de controlo de alterações, copie e aplique o URL **@odata.nextLink** ou **@odata.deltaLink** devolvido do último pedido GET para a próxima chamada da função **delta**. Uma **@odata.deltaLink** devolvida numa resposta significa que a ronda atual de controlo de alterações está concluída. Pode guardar e utilizar o URL **@odata.deltaLink** quando começar a obter mais alterações (mensagens alteradas ou publicadas depois de adquirir **@odata.deltaLink**).

Para obter mais informações, consulte a documentação da [consulta Delta](https://learn.microsoft.com/pt-br/graph/delta-query-overview).

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
GET /users/{id | user-principal-name}/chats/getAllMessages/delta
```

## Parâmetros de consulta

O registo de alterações nas mensagens implica uma ronda de uma ou mais chamadas de função **delta**. Se você usar qualquer parâmetro de consulta (diferente de `$deltatoken` e `$skiptoken`), especifique-o na primeira solicitação **delta**. O Microsoft Graph codifica automaticamente todos os parâmetros especificados na parte do token do **URL @odata.nextLink** ou **@odata.deltaLink** fornecido na resposta.

Só tem de especificar parâmetros de consulta uma vez.

Nos pedidos subsequentes, copie e aplique o URL **@odata.nextLink** ou **@odata.deltaLink** da resposta anterior, uma vez que esse URL já inclui os parâmetros codificados.

| Parâmetro de consulta | Tipo | Descrição |
| --- | --- | --- |
| `$deltatoken` | Cadeia de caracteres | Um [token de estado](https://learn.microsoft.com/pt-br/graph/delta-query-overview) devolvido no URL **@odata.deltaLink** da chamada da função **delta** anterior que indica a conclusão dessa ronda de controlo de alterações. Guarde e aplique todo o URL **@odata.deltaLink**, incluindo este token, no primeiro pedido da próxima iteração do controlo de alterações para essa coleção. |
| `$skiptoken` | Cadeia de caracteres | Um [token de estado](https://learn.microsoft.com/pt-br/graph/delta-query-overview) devolvido no URL **@odata.nextLink** da chamada da função **delta** anterior que indica que estão disponíveis mais alterações para serem controladas. |

### Parâmetros de consulta OData opcionais

Esta API suporta os seguintes [parâmetros de consulta OData](https://learn.microsoft.com/pt-br/graph/query-parameters):

- `$top` representa o número máximo de mensagens a obter numa chamada. O limite superior é `50`.
- `$skip` representa o número de mensagens a ignorar no início da lista.
- `$filter` devolve mensagens que cumprem determinados critérios. A única propriedade que suporta filtros é **lastModifiedDateTime** e apenas o `gt` operador é suportado. Por exemplo, `../messages/delta?$filter=lastModifiedDateTime gt 2024-08-27T07:13:28.000z` obtém qualquer mensagem criada ou alterada após a data e hora especificadas.

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da Solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se bem sucedido, este método retorna um código de resposta `200 OK` e uma coleção de objetos [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) no corpo da resposta. A resposta também inclui um URL **@odata.nextLink** ou um URL **@odata.deltaLink**.

## Exemplos

### Exemplo 1: sincronização inicial

O exemplo seguinte mostra uma série de três pedidos para sincronizar as mensagens. A resposta consiste em três mensagens:

Por questões de brevidade, as respostas de exemplo mostram apenas um subconjunto das propriedades de uma mensagem. Numa chamada real, a maioria das propriedades da mensagem são devolvidas.

Veja também o que pode fazer na [próxima ronda para obter mais mensagens](#example-2-the-next-round-to-get-more-messages).

#### Solicitação inicial

Neste exemplo, as mensagens de chat são sincronizadas pela primeira vez e o pedido de sincronização inicial não inclui nenhum token de estado.

O pedido especifica o parâmetro de consulta opcional `$top` que devolve duas mensagens de cada vez.

- [HTTP](#tabpanel_1_http)
- [JavaScript](#tabpanel_1_javascript)

```msgraph
GET https://graph.microsoft.com/v1.0/users/5ed12dd6-24f8-4777-be3d-0d234e06cefa/chats/getAllMessages/delta?$top=2
```

#### Resposta inicial da solicitação

A resposta inclui duas mensagens e um **cabeçalho de resposta @odata.nextLink** com um `skipToken`. O URL **@odata.nextLink** indica que estão disponíveis mais mensagens nas conversas para obter.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#Collection(microsoft.graph.chatMessage)",
  "@odata.nextLink": "https://graph.microsoft.com/v1.0/users/5ed12dd6-24f8-4777-be3d-0d234e06cefa/chats/getAllMessages/delta?$skiptoken=a-5fqdzHFr_L_cc7C0q1F-HCB8Z9SjwOsMN37XV5yfSnYgK4jVGVGEl25GFlxKWq0Wv6quL-5qcNg4nUnxzof6namZ_DM5no-hcL515cSrRGDoRLn38fZE1AXoDugSTOohOq3YRCYLqJbFGIoovMPTar32oLuoltHixme-Bf1lZtscv1wv5uu-MtkpYZIT0uDw-umQUK7mLNjMcyhNaifDrdemGUDMaQ25_QuHukNbkXcxsKMJdJ288p9IkaSeEyJHX5a6T_kEdAmuffsdzOGY8mLbLc7VEsUL75rGdt2aiKkywaPHsT9bDGV7MBo7WM2g_kdPeLdRPSdSxxhkGpNA.y_WMscy7negz0HZPhgjH-YyzsdeXzr2UDSfNrdzC78A",
  "value": [
    {
      "replyToId": null,
      "etag": "1727366299993",
      "messageType": "message",
      "createdDateTime": "2024-09-26T15:58:19.993Z",
      "lastModifiedDateTime": "2024-09-26T15:58:19.993Z",
      "lastEditedDateTime": null,
      "deletedDateTime": null,
      "subject": "",
      "summary": null,
      "chatId": "19:65a44130a0f249359d77858287ed39f0@thread.v2",
      "importance": "normal",
      "locale": "en-us",
      "webUrl": null,
      "channelIdentity": null,
      "policyViolation": null,
      "eventDetail": null,
      "id": "1727366299993",
      "from": {
        "application": null,
        "device": null,
        "user": {
          "@odata.type": "#microsoft.graph.teamworkUserIdentity",
          "id": "43383bf2-f7ab-4ba3-bf5e-12d071db189b",
          "displayName": "CFCC5",
          "userIdentityType": "aadUser",
          "tenantId": "f54e6700-e876-410b-8996-d6447d64098a"
        }
      },
      "body": {
        "contentType": "html",
        "content": "<div>\n<div itemprop=\"copy-paste-block\">reply 9&nbsp;to new conv</div>\n</div>"
      },
      "attachments": [],
      "mentions": [],
      "reactions": []
    },
    {
      "replyToId": null,
      "etag": "1727216579286",
      "messageType": "message",
      "createdDateTime": "2024-09-24T22:22:59.286Z",
      "lastModifiedDateTime": "2024-09-24T22:22:59.286Z",
      "lastEditedDateTime": null,
      "deletedDateTime": null,
      "subject": "",
      "summary": null,
      "chatId": "19:2a247d5dadc24f408d009e4ae84502cf@thread.v2",
      "importance": "normal",
      "locale": "en-us",
      "webUrl": null,
      "channelIdentity": null,
      "policyViolation": null,
      "eventDetail": null,
      "id": "1727216579286",
      "from": {
        "application": null,
        "device": null,
        "user": {
          "@odata.type": "#microsoft.graph.teamworkUserIdentity",
          "id": "43383bf2-f7ab-4ba3-bf5e-12d071db189b",
          "displayName": "CFCC5",
          "userIdentityType": "aadUser",
          "tenantId": "f54e6700-e876-410b-8996-d6447d64098a"
        }
      },
      "body": {
        "contentType": "html",
        "content": "<div>\n<div itemprop=\"copy-paste-block\">reply 10 to new conv</div>\n</div>"
      },
      "attachments": [],
      "mentions": [],
      "reactions": []
    }
  ]
}
```

#### Segunda solicitação

O segundo pedido especifica o URL **@odata.nextLink** devolvido da resposta anterior. Tenha em atenção que já não tem de especificar o mesmo `$top` parâmetro que no pedido inicial, tal como no `skipToken` **URL @odata.nextLink** codifica e inclui esses parâmetros.

- [HTTP](#tabpanel_2_http)
- [JavaScript](#tabpanel_2_javascript)

```msgraph
GET https://graph.microsoft.com/v1.0/users/5ed12dd6-24f8-4777-be3d-0d234e06cefa/chats/getAllMessages/delta?&%24skiptoken=a-5fqdzHFr_L_cc7C0q1F-HCB8Z9SjwOsMN37XV5yfSnYgK4jVGVGEl25GFlxKWq0Wv6quL-5qcNg4nUnxzof6namZ_DM5no-hcL515cSrRGDoRLn38fZE1AXoDugSTOohOq3YRCYLqJbFGIoovMPTar32oLuoltHixme-Bf1lZtscv1wv5uu-MtkpYZIT0uDw-umQUK7mLNjMcyhNaifMIVTT-htmEOClLVwgcyWLR-sl9Qb73uTTtPXdFdMK6FDE4gpwvvKxvo2ChsW2c4eo77LDh6ZL_WQ8Luq00koQ6vHIrLBHPMUdOAxDxu-U7N7H4hsFn9aRDRdwRky7067A.V2a-J-86yXTd9SJMA4CHP6enI-Ab-bQzRgYujwsIwDo
```

#### Resposta da segunda solicitação

A segunda resposta devolve as duas mensagens seguintes e um **cabeçalho de resposta @odata.nextLink** com um `skipToken` que indica que estão disponíveis mais mensagens para obter.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#Collection(microsoft.graph.chatMessage)",
  "@odata.nextLink": "https://graph.microsoft.com/v1.0/users/5ed12dd6-24f8-4777-be3d-0d234e06cefa/chats/getAllMessages/delta?$skiptoken=yJQeoV00BlfhYsCMsrn1GnNz7v5S39NShp1U4rzLZnPsraIATwnnsvbdv52hvKp7AAG-Bcwdu7dA7UweXHvGYQ2M5eysh-cNz6EZICZp7kM9HtmQHu7JU-_sX5S1edvEQxyAgm1R2HXk4R9_TWn9ZAu1BRQ-elS9hg0f8BlwKLCIluuSPS2ZuNVnQTOOYMMpmzKGX4wVVQUv0UlrIFZIPWTeriNpg5sJFd91n2GHSMnS7WaRTh3NSmvJE08ww-2CjGml2RjPyHfLHSqywuNt5BGNVj_vqsLbjetdDIYZFa_yaQqV_Bp5DaWM_nXD8RjVULH7H4ATXoUiG3Etsd_Nhd_GIYoxV6x2_rmbh928WPGSsenCOa352tyFxmuyTH0ozDmU4onVbGnOBQEYJDKZjuIeNVW-E19VHthjZ9GvYGE.NHJkfAbRu3Qoozl699AinriiHvWofLVnWkB5wEJmZlk",
  "value": [
    {
      "replyToId": null,
      "etag": "1726706286844",
      "messageType": "message",
      "createdDateTime": "2024-09-19T00:38:06.844Z",
      "lastModifiedDateTime": "2024-09-19T00:38:06.844Z",
      "lastEditedDateTime": null,
      "deletedDateTime": null,
      "subject": "",
      "summary": null,
      "chatId": "19:65a44130a0f249359d77858287ed39f0@thread.v2",
      "importance": "normal",
      "locale": "en-us",
      "webUrl": null,
      "channelIdentity": null,
      "policyViolation": null,
      "eventDetail": null,
      "id": "1726706286844",
      "from": {
        "application": null,
        "device": null,
        "user": {
          "@odata.type": "#microsoft.graph.teamworkUserIdentity",
          "id": "43383bf2-f7ab-4ba3-bf5e-12d071db189b",
          "displayName": "CFCC5",
          "userIdentityType": "aadUser",
          "tenantId": "f54e6700-e876-410b-8996-d6447d64098a"
        }
      },
      "body": {
        "contentType": "html",
        "content": "<p>Not one message, but several combined together to give you the full picture</p>"
      },
      "attachments": [],
      "mentions": [],
      "reactions": []
    },
    {
      "replyToId": null,
      "etag": "1726706276201",
      "messageType": "message",
      "createdDateTime": "2024-09-19T00:37:56.201Z",
      "lastModifiedDateTime": "2024-09-19T00:37:56.201Z",
      "lastEditedDateTime": null,
      "deletedDateTime": null,
      "subject": "",
      "summary": null,
      "chatId": "19:65a44130a0f249359d77858287ed39f0@thread.v2",
      "importance": "normal",
      "locale": "en-us",
      "webUrl": null,
      "channelIdentity": null,
      "policyViolation": null,
      "eventDetail": null,
      "id": "1726706276201",
      "from": {
        "application": null,
        "device": null,
        "user": {
          "@odata.type": "#microsoft.graph.teamworkUserIdentity",
          "id": "43383bf2-f7ab-4ba3-bf5e-12d071db189b",
          "displayName": "CFCC5",
          "userIdentityType": "aadUser",
          "tenantId": "f54e6700-e876-410b-8996-d6447d64098a"
        }
      },
      "body": {
        "contentType": "html",
        "content": "<p>Dive into the possibilities of incorporating context into ML evaluations by looking at entire conversations</p>"
      },
      "attachments": [],
      "mentions": [],
      "reactions": []
    }
  ]
}
```

#### Terceira solicitação

O terceiro pedido continua a utilizar a **@odata.nextLink** mais recente devolvida a partir do último pedido de sincronização.

- [HTTP](#tabpanel_3_http)
- [JavaScript](#tabpanel_3_javascript)

```msgraph
GET  https://graph.microsoft.com/v1.0/users/5ed12dd6-24f8-4777-be3d-0d234e06cefa/chats/getAllMessages/delta?$skiptoken=8UusBixEHS9UUau6uGcryrA6FpnWwMJbuTYILM1PArHxnZzDVcsHQrijNzCyIVeEauMQsKUfMhNjLWFs1o4sBS_LofJ7xMftZUfec_pijuT6cAk5ugcWCca9RCjK7iVj.DKZ9w4bX9vCR7Sj9P0_qxjLAAPiEZgxlOxxmCLMzHJ4
```

#### Resposta da terceira solicitação

A terceira resposta devolve as únicas mensagens restantes e um cabeçalho de resposta **@odata.deltaLink** com um `deltaToken` que indica que todas as mensagens são devolvidas. Guarde e utilize o URL **@odata.deltaLink** para consultar as novas mensagens adicionadas ou alteradas a partir deste ponto.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#Collection(microsoft.graph.chatMessage)",
  "@odata.deltaLink": "https://graph.microsoft.com/v1.0/users/5ed12dd6-24f8-4777-be3d-0d234e06cefa/chats/getAllMessages/delta?$deltatoken=aQdvS1VwGCSRxVmZJqykmDik_JIC44iCZpv-GLiA2VnFuE5yG-kCEBROb2iaPT_y_eMWVQtBO_ejzzyIxl00ji-tQ3HzAbW4liZAVG88lO3nG_6-MBFoHY1n8y21YUzjocG-Cn1tCNeeLPLTzIe5Dw.EP9gLiCoF2CE_e6l_m1bTk2aokD9KcgfgfcLGqd1r_4",
  "value": [
    {
      "replyToId": null,
      "etag": "1726706340932",
      "messageType": "message",
      "createdDateTime": "2024-09-19T00:39:00.932Z",
      "lastModifiedDateTime": "2024-09-19T00:39:00.932Z",
      "lastEditedDateTime": null,
      "deletedDateTime": null,
      "subject": "",
      "summary": null,
      "chatId": "19:65a44130a0f249359d77858287ed39f0@thread.v2",
      "importance": "normal",
      "locale": "en-us",
      "webUrl": null,
      "channelIdentity": null,
      "policyViolation": null,
      "eventDetail": null,
      "id": "1726706340932",
      "from": {
        "application": null,
        "device": null,
        "user": {
          "@odata.type": "#microsoft.graph.teamworkUserIdentity",
          "id": "43383bf2-f7ab-4ba3-bf5e-12d071db189b",
          "displayName": "CFCC5",
          "userIdentityType": "aadUser",
          "tenantId": "f54e6700-e876-410b-8996-d6447d64098a"
        }
      },
      "body": {
        "contentType": "html",
        "content": "<p>let's get started!</p>"
      },
      "attachments": [],
      "mentions": [],
      "reactions": []
    }
  ]
}
```

### Exemplo 2: a próxima ronda para obter mais mensagens

Ao utilizar o **@odata.deltaLink** do último pedido na última ronda, só pode obter as mensagens que foram alteradas (adicionadas ou atualizadas) desde que o **@odata.deltaLink** foi adquirido. O pedido deverá ter o seguinte aspeto, partindo do princípio de que pretende manter o mesmo tamanho máximo de página na resposta.

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_4_http)
- [JavaScript](#tabpanel_4_javascript)

```msgraph
GET https://graph.microsoft.com/v1.0/users/5ed12dd6-24f8-4777-be3d-0d234e06cefa/chats/getAllMessages/delta?$deltatoken=aQdvS1VwGCSRxVmZJqykmDik_JIC44iCZpv-GLiA2VnFuE5yG-kCEBROb2iaPT_y_eMWVQtBO_ejzzyIxl00ji-tQ3HzAbW4liZAVG88lO3nG_6-MBFoHY1n8y21YUzjocG-Cn1tCNeeLPLTzIe5Dw.EP9gLiCoF2CE_e6l_m1bTk2aokD9KcgfgfcLGqd1r_4
```

#### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#Collection(chatMessage)",
  "@odata.deltaLink": "https://graph.microsoft.com/v1.0/users/5ed12dd6-24f8-4777-be3d-0d234e06cefa/chats/getAllMessages/delta?$deltatoken=aQdvS1VwGCSRxVmZJqykmDik_JIC44iCZpv-GLiA2VnFuE5yG-kCEBROb2iaPT_yjz2nsMoh1gXNtXii7s78HapCi5woifXqwXlVNxICh8wUUnvE2gExsa8eZ2Vy_ch5rVIhm067_1mUPML3iYUVyg.3o0rhgaBUduuxOr98An5pjBDP5JjKUiVWku3flSiOsk",
  "value": [
    {
      "replyToId": null,
      "etag": "1727366299999",
      "messageType": "message",
      "createdDateTime": "2024-09-26T15:58:19.993Z",
      "lastModifiedDateTime": "2024-09-26T17:58:19.993Z",
      "lastEditedDateTime": null,
      "deletedDateTime": null,
      "subject": "",
      "summary": null,
      "chatId": "19:65a44130a0f249359d77858287ed39f0@thread.v2",
      "importance": "normal",
      "locale": "en-us",
      "webUrl": null,
      "channelIdentity": null,
      "policyViolation": null,
      "eventDetail": null,
      "id": "1727366299999",
      "from": {
        "application": null,
        "device": null,
        "user": {
          "@odata.type": "#microsoft.graph.teamworkUserIdentity",
          "id": "43383bf2-f7ab-4ba3-bf5e-12d071db189b",
          "displayName": "CFCC5",
          "userIdentityType": "aadUser",
          "tenantId": "f54e6700-e876-410b-8996-d6447d64098a"
        }
      },
      "body": {
        "contentType": "html",
        "content": "newly added content"
      },
      "attachments": [],
      "mentions": [],
      "reactions": []
    }
  ]
}
```