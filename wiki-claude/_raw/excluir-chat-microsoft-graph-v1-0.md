---
title: "Excluir chat - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/chat-delete?view=graph-rest-1.0&tabs=http"
author:
  - "[[sthapliyal]]"
published:
created: 2026-06-30
description: "Eliminar um objeto de chat."
tags:
  - "clippings"
---
## Excluir chat

Namespace: microsoft.graph

Eliminar de forma recuperável uma [conversa](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0). Quando invocada com permissões delegadas, esta operação só funciona para administradores de inquilinos e administradores de serviços do Teams.

> **Notas:** Esta operação não é suportada para utilizadores não administradores. Apenas os administradores de inquilinos do utilizador que iniciou a conversa podem eliminar a conversa. Por exemplo, se um utilizador do inquilino A criar um thread e, em seguida, adicionar um utilizador do inquilino B, apenas o administrador do inquilino A pode eliminar o thread. Esta API elimina conversas 1:1, conversas de reunião e tópicos de chat de grupo. Não elimina tópicos de chat de canal. Depois de as conversas serem eliminadas, os administradores de inquilinos têm sete dias para restaurá-las. As conversas eliminadas durante mais de sete dias não podem ser restauradas. É permitido um pedido de eliminação por segundo por inquilino.

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | Chat.ManageDeletion.All | Indisponível. |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | Chat.ManageDeletion.Chat | Chat.ManageDeletion.All |

## Solicitação HTTP

HTTP

```http
DELETE /chats/{chat-id}
```

## Cabeçalhos de solicitação

| Nome | Descrição |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se tiver êxito, esta ação retornará um código de resposta `204 No Content`.

## Exemplos

### Solicitação

```http
DELETE https://graph.microsoft.com/v1.0/chats/19:7d898072-792c-4006-bb10-5ca9f2590649_8ea0e38b-efb3-4757-924a-5f94061cf8c2@unq.gbl.spaces
```

### Resposta

HTTP

```http
HTTP/1.1 204 No Content
```