---
title: "Atualizar chat - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/chat-patch?view=graph-rest-1.0&tabs=http"
author:
  - "[[anandjo]]"
published:
created: 2026-06-30
description: "Atualize as propriedades de um objeto de chat."
tags:
  - "clippings"
---
## Atualizar chat

Namespace: microsoft.graph

Atualize as propriedades de um objeto de [chat](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0).

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | Chat.ReadWrite | Indisponível. |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | ChatSettings.ReadWrite.Chat | Chat.ReadWrite.All |

## Solicitação HTTP

HTTP

```http
PATCH /chats/{chat-id}
```

## Cabeçalhos de solicitação

| Nome | Descrição |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |
| Content-Type | application/json. Obrigatório. |

## Corpo da solicitação

No corpo do pedido, forneça uma representação JSON do objeto de [chat](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0).

A tabela seguinte mostra as propriedades que podem ser utilizadas com esta ação.

| Propriedade | Tipo | Descrição |
| --- | --- | --- |
| topic | Cadeia de caracteres | O título da conversa. Isto só pode ser definido para uma conversa com um valor **chatType** de `group`. O comprimento máximo é **de 250** carateres. A utilização de **":"** não é permitida. |

## Resposta

Se for bem-sucedido, este método devolve um `200 OK response` código e o recurso de **chat** atualizado no corpo da resposta.

## Exemplos

### Solicitação

- [HTTP](#tabpanel_1_http)
- [C#](#tabpanel_1_csharp)
- [Ir](#tabpanel_1_go)
- [Java](#tabpanel_1_java)
- [JavaScript](#tabpanel_1_javascript)
- [PHP](#tabpanel_1_php)
- [PowerShell](#tabpanel_1_powershell)
- [Python](#tabpanel_1_python)

```http
PATCH https://graph.microsoft.com/v1.0/chats/19:1c5b01696d2e4a179c292bc9cf04e63b@thread.v2
Content-Type: application/json

{
    "topic": "Group chat title update"
}
```

### Resposta

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#chats/$entity",
    "id": "19:1c5b01696d2e4a179c292bc9cf04e63b@thread.v2",
    "topic": "Group chat title update",
    "createdDateTime": "2020-12-04T23:11:16.175Z",
    "lastUpdatedDateTime": "2020-12-04T23:12:19.943Z",
    "chatType": "group"
}
```