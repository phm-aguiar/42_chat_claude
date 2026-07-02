---
title: "Listar todosMembers - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-list-allmembers?view=graph-rest-1.0&tabs=http"
author:
  - "[[sumanac]]"
published:
created: 2026-06-30
description: "Obtenha uma lista de todos os membros num canal."
tags:
  - "clippings"
---
## Listar todosMembers

Namespace: microsoft.graph

Obtenha uma lista de todos os [membros](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) num [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0). Esta API suporta todos os tipos de canal, incluindo canais partilhados. Para canais partilhados, a resposta inclui:

- **Membros diretos**: utilizadores que são adicionados diretamente ao canal, incluindo utilizadores de outros inquilinos (entre inquilinos).
- **Membros indiretos**: utilizadores que são membros de uma equipa com a qual o canal é partilhado, incluindo equipas no mesmo inquilino ou num inquilino diferente (entre inquilinos). A propriedade **@microsoft.graph.originalSourceMembershipUrl** identifica a equipa de origem original e indica que o utilizador é um membro indireto do canal partilhado.

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | ChannelMember.Read.All | ChannelMember.ReadWrite.All |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | ChannelMember.Read.Group | ChannelMember.Read.All, ChannelMember.ReadWrite.All, ChannelMember.ReadWrite.Group |

## Solicitação HTTP

HTTP

```http
GET /teams/{team-id}/channels/{channel-id}/allMembers
```

### Parâmetros de consulta opcionais

Este método oferece suporte aos `$filter` e `$select` [parâmetros de consulta OData](https://learn.microsoft.com/pt-br/graph/query-parameters) para ajudar a personalizar a resposta.

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se bem sucedido, este método retorna um código de resposta `200 OK` e uma coleção de objetos [conversationMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) no corpo da resposta.

## Exemplos

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
GET https://graph.microsoft.com/v1.0/teams/2ab9c796-2902-45f8-b712-7c5a63cf41c4/channels/19%3A20bc1df46b1148e9b22539b83bc66809%40thread.skype/allMembers
```

### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#teams('2ab9c796-2902-45f8-b712-7c5a63cf41c4')/channels('19%3A20bc1df46b1148e9b22539b83bc66809%40thread.skype')/allMembers",
  "@odata.count": 2,
  "value": [
    {
      "@odata.type": "#microsoft.graph.aadUserConversationMember",
      "@microsoft.graph.originalSourceMembershipUrl": "https://graph.microsoft.com/v1.0/tenants/2432b57b-0abd-43db-aa7b-16eadd115d34/teams/1e769eab-06a8-4b2e-ac42-1f040a4e52a1/channels/19%3AlRZHL5VwvZs0XN2orTn7DlinJDETkgSVTHXbDLUEKf01%40thread.tacv2/members/MCMjMyMjMjQzMmI1N2ItMGFiZC00M2RiLWFhN2ItMTZlYWRkMTE1ZDM0IyMxOTpsUlpITDVWd3ZaczBYTjJvclRuN0RsaW5KREVUa2dTVlRIWGJETFVFS2YwMUB0aHJlYWQudGFjdjIjIzI4YzEwMjQ0LTRiYWQtNGZkYS05OTNjLWYzMzJmYWVmOTRmMA==",
      "id": "MmFiOWM3OTYtMjkwMi00NWY4LWI3MTItN2M1YTYzY2Y0MWM0IyNlZWY5Y2IzNi0wNmRlLTQ2OWItODdjZC03MGY0Y2JlMzJkMTQ=",
      "roles": [
        "Owner"
      ],
      "displayName": "Caleb Foster",
      "userId": "eef9cb36-06de-469b-87cd-70f4cbe32d14",
      "email": "calfos@contoso.com",
      "tenantId": "ar8133445-c7e2-418a-8803-0e68d4b88607"
    },
    {
      "@odata.type": "#microsoft.graph.aadUserConversationMember",
      "@microsoft.graph.originalSourceMembershipUrl": "https://graph.microsoft.com/v1.0/tenants/2432b57b-0abd-43db-aa7b-16eadd115d34/teams/1e769eab-06a8-4b2e-ac42-1f040a4e52a1/members/MCMjMSMjMjQzMmI1N2ItMGFiZC00M2RiLWFhN2ItMTZlYWRkMTE1ZDM0IyMxZTc2OWVhYi0wNmE4LTRiMmUtYWM0Mi0xZjA0MGE0ZTUyYTEjIzQ1OTVkMmYyLTdiMzEtNDQ2Yy04NGZkLTliNzk1ZTYzMTE0Yg==",
      "id": "MmFiOWM3OTYtMjkwMi00NWY4LWI3MTItN2M1YTYzY2Y0MWM0IyNiMzI0NmY0NC1jMDkxLTQ2MjctOTZjNi0yNWIxOGZhMmM5MTA=",
      "roles": [ ],
      "displayName": "Eric Solomon",
      "userId": "b3246f44-c091-4627-96c6-25b18fa2c910",
      "email": "ericsol@contoso.com",
      "tenantId": "df81db53-c7e2-418a-8803-0e68d4b88607"
    }
  ]
}
```

## Conteúdo relacionado

[Liste os membros de uma equipa](https://learn.microsoft.com/pt-br/graph/api/team-list-members?view=graph-rest-1.0).