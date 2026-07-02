---
title: "Listar membros de um canal - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-list-members?view=graph-rest-1.0&tabs=http"
author:
  - "[[AkJo]]"
published:
created: 2026-06-30
description: "Obtenha uma lista de membros num canal, incluindo membros diretos de canais padrão, privados e partilhados."
tags:
  - "clippings"
---
## Listar membros de um canal

Namespace: microsoft.graph

Obtenha uma lista de [membros](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) num [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0), incluindo membros diretos de canais padrão, privados e partilhados. Utilize a API [List allMembers](https://learn.microsoft.com/pt-br/graph/api/channel-list-allmembers?view=graph-rest-1.0) para obter membros diretos e indiretos de um canal partilhado.

Este método suporta a federação. Apenas um utilizador que seja membro do canal partilhado pode obter a lista de membros do canal.

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | ChannelMember.Read.All | ChannelMember.ReadWrite.All, Group.Read.All |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | ChannelMember.Read.Group | ChannelMember.Read.All, ChannelMember.ReadWrite.All, ChannelMember.ReadWrite.Group |

## Solicitação HTTP

HTTP

```http
GET /teams/{team-id}/channels/{channel-id}/members
```

## Parâmetros de consulta opcionais

Este método suporta os `$filter` parâmetros de consulta, `$select` e `$top` [OData](https://learn.microsoft.com/pt-br/graph/query-parameters) para ajudar a personalizar a resposta. Os tamanhos de página predefinidos e máximos são 100 e 999 objetos, respetivamente.

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
- [Python](#tabpanel_1_python)

```msgraph
GET https://graph.microsoft.com/v1.0/teams/2ab9c796-2902-45f8-b712-7c5a63cf41c4/channels/19%3A20bc1df46b1148e9b22539b83bc66809%40thread.skype/members
```

### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
"@odata.context": "https://graph.microsoft.com/v1.0/$metadata#teams('2ab9c796-2902-45f8-b712-7c5a63cf41c4')/channels('19%3A20bc1df46b1148e9b22539b83bc66809%40thread.skype')/members",
"@odata.count": 2,
"value": [
    {
        "@odata.type": "#microsoft.graph.aadUserConversationMember",
        "id": "MmFiOWM3OTYtMjkwMi00NWY4LWI3MTItN2M1YTYzY2Y0MWM0IyNlZWY5Y2IzNi0wNmRlLTQ2OWItODdjZC03MGY0Y2JlMzJkMTQ=",
        "roles": [],
        "displayName": "Jane Doe",
        "userId": "eef9cb36-06de-469b-87cd-70f4cbe32d14",
        "email": "jdoe@contoso.com"
    },
    {
        "@odata.type": "#microsoft.graph.aadUserConversationMember",
        "id": "MmFiOWM3OTYtMjkwMi00NWY4LWI3MTItN2M1YTYzY2Y0MWM0IyNiMzI0NmY0NC1jMDkxLTQ2MjctOTZjNi0yNWIxOGZhMmM5MTA=",
        "roles": [
            "owner"
        ],
        "displayName": "Ace John",
        "userId": "b3246f44-c091-4627-96c6-25b18fa2c910",
        "email": "ajohn@contoso.com"
    }
]
}
```

## Conteúdo relacionado

- [Listar membros de equipe](https://learn.microsoft.com/pt-br/graph/api/team-list-members?view=graph-rest-1.0)