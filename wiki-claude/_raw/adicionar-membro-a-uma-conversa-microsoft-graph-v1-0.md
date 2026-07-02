---
title: "Adicionar membro a uma conversa - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/chat-post-members?view=graph-rest-1.0&tabs=http"
author:
  - "[[anandjo]]"
published:
created: 2026-06-30
description: "Adicionar uma conversaÇãoMember a uma conversa."
tags:
  - "clippings"
---
## Adicionar membro a uma conversa

Namespace: microsoft.graph

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegada (conta corporativa ou de estudante) | ChatMember.ReadWrite | Chat.ReadWrite |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | Chat.Manage.Chat | Chat.ReadWrite.All, ChatMember.ReadWrite.All |

## Solicitação HTTP

HTTP

```http
POST /chats/{chat-id}/members
```

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |
| Content-Type | application/json. Obrigatório. |

## Corpo da solicitação

No corpo da solicitação, forneça uma representação JSON do objeto [conversationMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0).

## Resposta

Se for bem-sucedido, este método devolve um `201 Created` código de resposta e um cabeçalho de Localização que fornece um caminho de URL para o objeto membro recentemente criado.

## Exemplos

### Exemplo 1: adicionar um único membro a uma conversa e especificar o período de tempo do histórico de conversações

#### Solicitação

O exemplo a seguir mostra uma solicitação.

```msgraph
POST https://graph.microsoft.com/v1.0/chats/19:cf66807577b149cca1b7af0c32eec122@thread.v2/members
content-type: application/json

{
    "@odata.type": "#microsoft.graph.aadUserConversationMember",
    "user@odata.bind": "https://graph.microsoft.com/v1.0/users/8b081ef6-4792-4def-b2c9-c363a1bf41d5",
    "visibleHistoryStartDateTime": "2019-04-18T23:51:43.255Z",
    "roles": ["owner"]
}
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
Location
```

### Exemplo 2: Adicionar um único membro a uma conversa do Microsoft Teams, sem partilhar o histórico de conversas

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_2_http)
- [C#](#tabpanel_2_csharp)
- [Ir](#tabpanel_2_go)
- [Java](#tabpanel_2_java)
- [JavaScript](#tabpanel_2_javascript)
- [PHP](#tabpanel_2_php)
- [PowerShell](#tabpanel_2_powershell)
- [Python](#tabpanel_2_python)

```msgraph
POST https://graph.microsoft.com/v1.0/chats/19:cf66807577b149cca1b7af0c32eec122@thread.v2/members
Content-type: application/json

{
    "@odata.type": "#microsoft.graph.aadUserConversationMember",
    "user@odata.bind": "https://graph.microsoft.com/v1.0/users/8b081ef6-4792-4def-b2c9-c363a1bf41d5",
    "roles": ["owner"]
}
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
Location
```

### Exemplo 3: adicionar um único membro a uma conversa do Microsoft Teams, partilhando todo o histórico do chat

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_3_http)
- [C#](#tabpanel_3_csharp)
- [Ir](#tabpanel_3_go)
- [Java](#tabpanel_3_java)
- [JavaScript](#tabpanel_3_javascript)
- [PHP](#tabpanel_3_php)
- [PowerShell](#tabpanel_3_powershell)
- [Python](#tabpanel_3_python)

```msgraph
POST https://graph.microsoft.com/v1.0/chats/19:cf66807577b149cca1b7af0c32eec122@thread.v2/members
content-type: application/json

{
    "@odata.type": "#microsoft.graph.aadUserConversationMember",
    "user@odata.bind": "https://graph.microsoft.com/v1.0/users/8b081ef6-4792-4def-b2c9-c363a1bf41d5",
    "visibleHistoryStartDateTime": "0001-01-01T00:00:00Z",
    "roles": ["owner"]
}
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
Location
```

### Exemplo 4: Adicionar um único membro a uma conversa com o nome principal de utilizador

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_4_http)
- [C#](#tabpanel_4_csharp)
- [Ir](#tabpanel_4_go)
- [Java](#tabpanel_4_java)
- [JavaScript](#tabpanel_4_javascript)
- [PHP](#tabpanel_4_php)
- [PowerShell](#tabpanel_4_powershell)
- [Python](#tabpanel_4_python)

```msgraph
POST https://graph.microsoft.com/v1.0/chats/19:cf66807577b149cca1b7af0c32eec122@thread.v2/members
content-type: application/json

{
    "@odata.type": "#microsoft.graph.aadUserConversationMember",
    "user@odata.bind": "https://graph.microsoft.com/v1.0/users/jacob@contoso.com",
    "visibleHistoryStartDateTime": "2019-04-18T23:51:43.255Z",
    "roles": ["owner"]
}
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
Location
```

### Exemplo 5: Adicionar um convidado no inquilino a uma conversa, sem partilhar o histórico de conversas

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_5_http)
- [C#](#tabpanel_5_csharp)
- [Ir](#tabpanel_5_go)
- [Java](#tabpanel_5_java)
- [JavaScript](#tabpanel_5_javascript)
- [PHP](#tabpanel_5_php)
- [PowerShell](#tabpanel_5_powershell)
- [Python](#tabpanel_5_python)

```http
POST https://graph.microsoft.com/v1.0/chats/19:cf66807577b149cca1b7af0c32eec122@thread.v2/members
Content-type: application/json

{
    "@odata.type": "#microsoft.graph.aadUserConversationMember",
    "user@odata.bind": "https://graph.microsoft.com/v1.0/users/8ba98gf6-7fc2-4eb2-c7f2-aef9f21fd98g",
    "roles": ["guest"]
}
```

---

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
Location
```

### Exemplo 6: Adicionar um utilizador externo fora do inquilino a uma conversa, sem partilhar o histórico de conversas

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_6_http)
- [C#](#tabpanel_6_csharp)
- [Ir](#tabpanel_6_go)
- [Java](#tabpanel_6_java)
- [JavaScript](#tabpanel_6_javascript)
- [PHP](#tabpanel_6_php)
- [PowerShell](#tabpanel_6_powershell)
- [Python](#tabpanel_6_python)

```msgraph
POST https://graph.microsoft.com/v1.0/chats/19:cf66807577b149cca1b7af0c32eec122@thread.v2/members
Content-type: application/json

{
    "@odata.type": "#microsoft.graph.aadUserConversationMember",
    "user@odata.bind": "https://graph.microsoft.com/v1.0/users/82af01c5-f7cc-4a2e-a728-3a5df21afd9d",
    "roles": ["owner"],
    "tenantId": "4dc1fe35-8ac6-4f0d-904a-7ebcd364bea1"
}
```

---

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
Location
```