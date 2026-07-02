---
title: "Liste os membros de um bate-papo. - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/chat-list-members?view=graph-rest-1.0&tabs=http"
author:
  - "[[anandjo]]"
published:
created: 2026-06-30
description: "Recupere os membros de um bate-papo."
tags:
  - "clippings"
---
## Liste os membros de um bate-papo.

Namespace: microsoft.graph

Listar todos os [membros da conversa](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) de um [bate-papo](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0).

Este método suporta a federação. Para conversas um-para-um, pelo menos um membro de chat tem de pertencer ao inquilino a partir do qual o pedido é iniciado. Para conversas de grupo, o chat tem de ser iniciado por um utilizador no inquilino a partir do qual o pedido é iniciado.

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | Chat.ReadBasic | ChatMember.ReadWrite, Chat.Read, Chat.ReadWrite, ChatMember.Read |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | ChatMember.Read.All | Chat.Manage.Chat, Chat.Read.All, Chat.ReadBasic.All, Chat.ReadWrite.All, ChatMember.Read.Chat, ChatMember.ReadWrite.All |

## Solicitação HTTP

HTTP

```http
GET /chats/{chat-id}/members
GET /users/{user-id | user-principal-name}/chats/{chat-id}/members
```

## Parâmetros de consulta opcionais

Esta operação não suporta os [parâmetros de consulta OData](https://learn.microsoft.com/pt-br/graph/query-parameters) para personalizar a resposta.

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se bem sucedido, este método retorna um código de resposta `200 OK` e uma lista de objetos [conversationMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) no corpo da resposta.

## Exemplo

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

```msgraph
GET https://graph.microsoft.com/v1.0/me/chats/19:09ddc990-3821-4ceb-8019-24d39998f93e_48d31887-5fad-4d73-a9f5-3c356e68a038@unq.gbl.spaces/members
```

### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users('48d31887-5fad-4d73-a9f5-3c356e68a038')/chats('19%3A09ddc990-3821-4ceb-8019-24d39998f93e_48d31887-5fad-4d73-a9f5-3c356e68a038%40unq.gbl.spaces')/members",
    "@odata.count": 1,
    "value": [
        {
            "@odata.type": "#microsoft.graph.aadUserConversationMember",
            "id": "MCMjMCMjZGNkMjE5ZGQtYmM2OC00YjliLWJmMGItNGEzM2E3OTZiZTM1IyMxOTowOWRkYzk5MC0zODIxLTRjZWItODAxOS0yNGQzOTk5OGY5M2VfNDhkMzE4ODctNWZhZC00ZDczLWE5ZjUtM2MzNTZlNjhhMDM4QHVucS5nYmwuc3BhY2VzIyM0OGQzMTg4Ny01ZmFkLTRkNzMtYTlmNS0zYzM1NmU2OGEwMzg=",
            "roles": [
                "owner"
            ],
            "displayName": "Megan Bowen",
            "visibleHistoryStartDateTime": "2021-11-25T01:56:31.313Z",
            "userId": "48d31887-5fad-4d73-a9f5-3c356e68a038",
            "email": "MeganB@contoso.com",
            "tenantId": "dcd219dd-bc68-4b9b-bf0b-4a33a796be35"
        }
    ]
}
```