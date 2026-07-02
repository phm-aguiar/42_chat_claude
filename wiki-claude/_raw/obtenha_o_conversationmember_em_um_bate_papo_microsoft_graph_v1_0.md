---
title: "Obtenha o conversationMember em um bate-papo. - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/chat-get-members?view=graph-rest-1.0&tabs=http"
author:
  - "[[anandjo]]"
published:
created: 2026-06-30
description: "Recuperar um membro de um bate-papo."
tags:
  - "clippings"
---
## Obtenha o conversationMember em um bate-papo.

Namespace: microsoft.graph

Recuperar um [conversationMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) de um [bate-papo](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0).

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
| Application | ChatMember.Read.All | ChatMember.ReadWrite.All, Chat.Manage.Chat, Chat.Read.All, Chat.ReadBasic.All, Chat.ReadWrite.All, ChatMember.Read.Chat, TeamMember.Read.Group |

> **Observação**: Permissões marcadas com \* usam [consentimento específico de recurso](https://learn.microsoft.com/pt-br/microsoftteams/platform/graph-api/rsc/resource-specific-consent).

## Solicitação HTTP

HTTP

```http
GET /chats/{chat-id}/members/{membership-id}
GET /users/{user-id | user-principal-name}/chats/{chat-id}/members/{membership-id}
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

Se bem-sucedido, este método retornará um código de resposta `200 OK` e um objeto [conversationMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) no corpo da resposta.

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
GET https://graph.microsoft.com/v1.0/chats/19:d0f51aeb0e8e43d0befb24be72b09ea7@thread.v2/members/MCMjMCMjMGY4MWIxZWEtYjg1Ny00YTljLTk5ZWItZTk5OGQ1MjA0NmQ1IyMxOTpkMGY1MWFlYjBlOGU0M2QwYmVmYjI0YmU3MmIwOWVhN0B0aHJlYWQudjIjIzhjMGMwYTJhLWM2NzktNDAxZS1hZGMzLWE0NWI1NDg4ODlhNg==
```

### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats('19%3Ad0f51aeb0e8e43d0befb24be72b09ea7%40thread.v2')/members/$entity",
    "@odata.type": "#microsoft.graph.aadUserConversationMember",
    "id": "MCMjMCMjMGY4MWIxZWEtYjg1Ny00YTljLTk5ZWItZTk5OGQ1MjA0NmQ1IyMxOTpkMGY1MWFlYjBlOGU0M2QwYmVmYjI0YmU3MmIwOWVhN0B0aHJlYWQudjIjIzhjMGMwYTJhLWM2NzktNDAxZS1hZGMzLWE0NWI1NDg4ODlhNg==",
    "roles": [
        "owner"
    ],
    "displayName": "Niklas Lang",
    "visibleHistoryStartDateTime": "2022-05-02T12:49:36.881Z",
    "userId": "8c0c0a2a-c679-401e-adc3-a45b548889a6",
    "email": "Niklas.Lang@contoso.com",
    "tenantId": "0f81b1ea-b857-4a9c-99eb-e998d52046d5"
}
```