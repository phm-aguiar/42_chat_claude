---
title: "chat: removeAllAccessForUser - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/chat-removeallaccessforuser?view=graph-rest-1.0&tabs=http"
author:
  - "[[AdityaSharma6]]"
published:
created: 2026-06-30
description: "Remova o acesso a uma conversa para um utilizador."
tags:
  - "clippings"
---
## chat: removeAllAccessForUser

Namespace: microsoft.graph

Remova o acesso a uma [conversa](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) para um utilizador.

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ❌ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | Chat.ReadWrite.All | Indisponível. |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Aplicativo | Sem suporte. | Sem suporte. |

## Solicitação HTTP

HTTP

```http
POST /chats/{chatsId}/removeAllAccessForUser
```

## Cabeçalhos de solicitação

| Nome | Descrição |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |
| Content-Type | application/json. Obrigatório. |

## Corpo da solicitação

No corpo do pedido, forneça um objeto JSON com os seguintes parâmetros.

| Parâmetro | Tipo | Descrição |
| --- | --- | --- |
| usuário | [teamworkUserIdentity](https://learn.microsoft.com/pt-br/graph/api/resources/teamworkuseridentity?view=graph-rest-1.0) | Utilizador cujo acesso de chat para remover. |

## Resposta

Se tiver êxito, esta ação retornará um código de resposta `204 No Content`.

## Exemplos

### Solicitação

O exemplo a seguir mostra uma solicitação.

```http
POST https://graph.microsoft.com/v1.0/chats/{chatsId}/removeAllAccessForUser
Content-Type: application/json

{
  "user": {
    "@odata.type": "microsoft.graph.teamworkUserIdentity",
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "tenantId": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
  }
}
```

---

### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 204 No Content
```