---
title: "Adicionar membro ao canal - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-post-members?view=graph-rest-1.0&tabs=http"
author:
  - "[[AkJo]]"
published:
created: 2026-06-30
description: "Adicionar membro ao canal."
tags:
  - "clippings"
---
## Adicionar membro ao canal

Namespace: microsoft.graph

Adicionar uma [conversaçãoMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) a um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0). Esta operação só é permitida para canais com um valor **membershipType** de `private` ou `shared`.

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | ChannelMember.ReadWrite.All | Indisponível. |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | ChannelMember.ReadWrite.Group | ChannelMember.ReadWrite.All |

## Solicitação HTTP

HTTP

```http
POST /teams/{team-id}/channels/{channel-id}/members
```

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |
| Content-type | application/json. Obrigatório. |

## Corpo da solicitação

Inclua as propriedades a seguir no corpo da solicitação.

| Propriedade | Tipo | Descrição |
| --- | --- | --- |
| funções | coleção de cadeias de caracteres | A função para o utilizador. Tem de estar `owner` ou estar vazio. |
| usuário | [user](https://learn.microsoft.com/pt-br/graph/api/resources/user?view=graph-rest-1.0) | O utilizador a adicionar ao canal. |

## Resposta

Se bem-sucedido, este método retornará um código de resposta `201 Created` e um objeto [conversationMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) no corpo da resposta.

## Exemplos

### Exemplo 1: adicionar um membro a um canal privado

#### Solicitação

O exemplo a seguir mostra uma solicitação.

```http
POST https://graph.microsoft.com/v1.0/teams/ece6f0a1-7ca4-498b-be79-edf6c8fc4d82/channels/19%3A56eb04e133944cf69e603c5dac2d292e%40thread.skype/members
Content-type: application/json

{
    "@odata.type": "#microsoft.graph.aadUserConversationMember",
    "roles": ["owner"],
    "user@odata.bind": "https://graph.microsoft.com/v1.0/users('8b081ef6-4792-4def-b2c9-c363a1bf41d5')"
}
```

#### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 201 Created
Content-type: application/json

{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#teams('ece6f0a1-7ca4-498b-be79-edf6c8fc4d82')/channels('19%3A56eb04e133944cf69e603c5dac2d292e%40thread.skype')/members/microsoft.graph.aadUserConversationMember/$entity",
  "@odata.type": "#microsoft.graph.aadUserConversationMember",
  "id": "ZWUwZjVhZTItOGJjNi00YWU1LTg0NjYtN2RhZWViYmZhMDYyIyM3Mzc2MWYwNi0yYWM5LTQ2OWMtOWYxMC0yNzlhOGNjMjY3Zjk=",
  "roles": [],
  "displayName": "John Doe",
  "userId": "8b081ef6-4792-4def-b2c9-c363a1bf41d5",
  "email": null
}
```

### Exemplo 2: adicionar um membro com a função de proprietário a um canal privado

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_2_http)
- [C#](#tabpanel_2_csharp)
- [Ir](#tabpanel_2_go)
- [Java](#tabpanel_2_java)
- [JavaScript](#tabpanel_2_javascript)
- [PHP](#tabpanel_2_php)
- [Python](#tabpanel_2_python)

```http
POST https://graph.microsoft.com/v1.0/teams/ece6f0a1-7ca4-498b-be79-edf6c8fc4d82/channels/19%3A56eb04e133944cf69e603c5dac2d292e%40thread.skype/members
Content-type: application/json

{
    "@odata.type": "#microsoft.graph.aadUserConversationMember",
    "roles": ["owner"],
    "user@odata.bind": "https://graph.microsoft.com/v1.0/users('8b081ef6-4792-4def-b2c9-c363a1bf41d5')"
}
```

#### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 201 Created
Content-type: application/json

{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#teams('ece6f0a1-7ca4-498b-be79-edf6c8fc4d82')/channels('19%3A56eb04e133944cf69e603c5dac2d292e%40thread.skype')/members/microsoft.graph.aadUserConversationMember/$entity",
  "@odata.type": "#microsoft.graph.aadUserConversationMember",
  "id": "ZWUwZjVhZTItOGJjNi00YWU1LTg0NjYtN2RhZWViYmZhMDYyIyM3Mzc2MWYwNi0yYWM5LTQ2OWMtOWYxMC0yNzlhOGNjMjY3Zjk=",
  "roles": ["owner"],
  "displayName": "John Doe",
  "userId": "8b081ef6-4792-4def-b2c9-c363a1bf41d5",
  "email": null
}
```

### Exemplo 3: Adicionar um proprietário a um canal com o nome principal de utilizador

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_3_http)
- [C#](#tabpanel_3_csharp)
- [Ir](#tabpanel_3_go)
- [Java](#tabpanel_3_java)
- [JavaScript](#tabpanel_3_javascript)
- [PHP](#tabpanel_3_php)
- [Python](#tabpanel_3_python)

```http
POST https://graph.microsoft.com/v1.0/teams/ece6f0a1-7ca4-498b-be79-edf6c8fc4d82/channels/19%3A56eb04e133944cf69e603c5dac2d292e%40thread.skype/members
Content-type: application/json

{
    "@odata.type": "#microsoft.graph.aadUserConversationMember",
    "roles": ["owner"],
    "user@odata.bind": "https://graph.microsoft.com/v1.0/users('jacob@contoso.com')"
}
```

#### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 201 Created
Content-type: application/json

{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#teams('ece6f0a1-7ca4-498b-be79-edf6c8fc4d82')/channels('19%3A56eb04e133944cf69e603c5dac2d292e%40thread.skype')/members/microsoft.graph.aadUserConversationMember/$entity",
  "@odata.type": "#microsoft.graph.aadUserConversationMember",
  "id": "ZWUwZjVhZTItOGJjNi00YWU1LTg0NjYtN2RhZWViYmZhMDYyIyM3Mzc2MWYwNi0yYWM5LTQ2OWMtOWYxMC0yNzlhOGNjMjY3Zjk=",
  "roles": [],
  "displayName": "Jacob Hancock",
  "userId": "8b081ef6-4792-4def-b2c9-c363a1bf41d5",
  "email": "jacob@contoso.com"
}
```

### Exemplo 4: Adicionar um utilizador que faça parte do mesmo inquilino que um membro a um canal partilhado

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_4_http)
- [C#](#tabpanel_4_csharp)
- [Ir](#tabpanel_4_go)
- [Java](#tabpanel_4_java)
- [JavaScript](#tabpanel_4_javascript)
- [PHP](#tabpanel_4_php)
- [Python](#tabpanel_4_python)

```http
POST https://graph.microsoft.com/v1.0/teams/6a720ba5-7373-463b-bc9f-4cd04b5c6742/channels/19:LpxShHZZh9utjNcEmUS5aOEP9ASw85OUn05NcWYAhX81@thread.tacv2/members
Content-type: application/json

{
    "@odata.type": "#microsoft.graph.aadUserConversationMember",
    "roles": [],
    "user@odata.bind": "https://graph.microsoft.com/v1.0/users/24b3819b-4e1d-4f3e-86bd-e42b54d0b2b4"
}
```

#### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 201 Created
Content-type: application/json
Content-length: 468

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#teams('6a720ba5-7373-463b-bc9f-4cd04b5c6742')/channels('19%3ALpxShHZZh9utjNcEmUS5aOEP9ASw85OUn05NcWYAhX81%40thread.tacv2')/members/$entity",
    "@odata.type": "#microsoft.graph.aadUserConversationMember",
    "id": "ZGY4MWRiNTMtYzdlMi00MThhLTg4MDMtMGU2OGQ0Yjg4NjA3IyMxOTpMcHhTaEhaWmg5dXRqTmNFbVVTNWFPRVA5QVN3ODVPVW4wNU5jV1lBaFg4MUB0aHJlYWQudGFjdjIjIzI0YjM4MTliLTRlMWQtNGYzZS04NmJkLWU0MmI1NGQwYjJiNA==",
    "roles": [],
    "displayName": "John Doe",
    "visibleHistoryStartDateTime": null,
    "userId": "24b3819b-4e1d-4f3e-86bd-e42b54d0b2b4",
    "email": "john_doe@contoso.com",
    "tenantId": "df81db53-c7e2-418a-8803-0e68d4b88607"
}
```

### Exemplo 5: Adicionar um utilizador que faça parte de um inquilino diferente como membro a um canal partilhado

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_5_http)
- [C#](#tabpanel_5_csharp)
- [Ir](#tabpanel_5_go)
- [Java](#tabpanel_5_java)
- [JavaScript](#tabpanel_5_javascript)
- [PHP](#tabpanel_5_php)
- [Python](#tabpanel_5_python)

```http
POST https://graph.microsoft.com/v1.0/teams/6a720ba5-7373-463b-bc9f-4cd04b5c6742/channels/19:LpxShHZZh9utjNcEmUS5aOEP9ASw85OUn05NcWYAhX81@thread.tacv2/members
Content-type: application/json

{
    "@odata.type": "#microsoft.graph.aadUserConversationMember",
    "roles": [],
    "user@odata.bind": "https://graph.microsoft.com/v1.0/users/bc3598dd-cce4-4742-ae15-173429951408",
    "tenantId": "a18103d1-a6ef-4f66-ac64-e4ef42ea8681"
}
```

#### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 201 Created
Content-type: application/json
Content-length: 468

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#teams('6a720ba5-7373-463b-bc9f-4cd04b5c6742')/channels('19%3ALpxShHZZh9utjNcEmUS5aOEP9ASw85OUn05NcWYAhX81%40thread.tacv2')/members/$entity",
    "@odata.type": "#microsoft.graph.aadUserConversationMember",
    "id": "YTE4MTAzZDEtYTZlZi00ZjY2LWFjNjQtZTRlZjQyZWE4NjgxIyMxOTpMcHhTaEhaWmg5dXRqTmNFbVVTNWFPRVA5QVN3ODVPVW4wNU5jV1lBaFg4MUB0aHJlYWQudGFjdjIjI2JjMzU5OGRkLWNjZTQtNDc0Mi1hZTE1LTE3MzQyOTk1MTQwOA==",
    "roles": [],
    "displayName": "Eric Solomon",
    "visibleHistoryStartDateTime": null,
    "userId": "bc3598dd-cce4-4742-ae15-173429951408",
    "email": "ericsol@fabrikam.com",
    "tenantId": "a18103d1-a6ef-4f66-ac64-e4ef42ea8681"
}
```

### Exemplo 6: Adicionar um utilizador que faça parte do mesmo inquilino ou de um inquilino diferente de um membro a um canal partilhado com o nome principal de utilizador

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_6_http)
- [C#](#tabpanel_6_csharp)
- [Ir](#tabpanel_6_go)
- [Java](#tabpanel_6_java)
- [JavaScript](#tabpanel_6_javascript)
- [PHP](#tabpanel_6_php)
- [Python](#tabpanel_6_python)

```http
POST https://graph.microsoft.com/v1.0/teams/ece6f0a1-7ca4-498b-be79-edf6c8fc4d82/channels/19%3ALpxShHZZh9utjNcEmUS5aOEP9ASw85OUn05NcWYAhX81%40thread.tacv2/members
Content-type: application/json

{
    "@odata.type": "#microsoft.graph.aadUserConversationMember",
    "roles": [],
    "user@odata.bind": "https://graph.microsoft.com/v1.0/users('jacob@contoso.com')"
}
```

#### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 201 Created
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#teams('ece6f0a1-7ca4-498b-be79-edf6c8fc4d82')/channels('19%3ALpxShHZZh9utjNcEmUS5aOEP9ASw85OUn05NcWYAhX81%40thread.tacv2')/members/microsoft.graph.aadUserConversationMember/$entity",
    "@odata.type": "#microsoft.graph.aadUserConversationMember",
    "id": "ZWUwZjVhZTItOGJjNi00YWU1LTg0NjYtN2RhZWViYmZhMDYyIyM3Mzc2MWYwNi0yYWM5LTQ2OWMtOWYxMC0yNzlhOGNjMjY3Zjk=",
    "roles": [],
    "displayName": "Jacob Hancock",
    "userId": "8b081ef6-4792-4def-b2c9-c363a1bf41d5",
    "email": "jacob@contoso.com",
    "tenantId": "a18103d1-a6ef-4f66-ac64-e4ef42ea8681"
}
```

## Conteúdo relacionado

- [Adicionar membro à equipe](https://learn.microsoft.com/pt-br/graph/api/team-post-members?view=graph-rest-1.0)