---
title: "Obter sharedWithChannelTeamInfo - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/sharedwithchannelteaminfo-get?view=graph-rest-1.0&tabs=http"
author:
  - "[[devjha-ms]]"
published:
created: 2026-06-30
description: "Obtenha uma equipa que tenha sido partilhada com um canal especificado."
tags:
  - "clippings"
---
## Obter sharedWithChannelTeamInfo

Namespace: microsoft.graph

Obtenha uma [equipa](https://learn.microsoft.com/pt-br/graph/api/resources/sharedwithchannelteaminfo?view=graph-rest-1.0) que tenha sido partilhada com um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) especificado. Esta operação é permitida somente para canais com valor **membershipType** de `shared`.

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ❌ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | ChannelMember.Read.All | ChannelMember.ReadWrite.All |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | ChannelMember.Read.Group | ChannelMember.Read.All, ChannelMember.ReadWrite.All, ChannelMember.ReadWrite.Group |

> **Observação**: esta API oferece transporte a permissões de administrador. Os administradores de serviços do Microsoft Teams podem aceder às equipas das quais não são membros.

## Solicitação HTTP

HTTP

```http
GET /teams/{team-id}/channels/{channel-id}/sharedWithTeams/{shared-with-channel-team-info-id}
```

## Parâmetros de consulta opcionais

Este método não suporta os parâmetros de consulta OData para ajudar a personalizar a resposta. Para obter informações gerais, acesse [Parâmetros de consulta OData](https://learn.microsoft.com/pt-br/graph/query-parameters).

## Cabeçalhos de solicitação

| Nome | Descrição |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se for bem-sucedido, esse método retornará um código de resposta `200 OK` e um objeto [sharedWithChannelTeamInfo](https://learn.microsoft.com/pt-br/graph/api/resources/sharedwithchannelteaminfo?view=graph-rest-1.0) no corpo da resposta.

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
GET https://graph.microsoft.com/v1.0/teams/893075dd-2487-5634-925f-022c42e20265/channels/19:561fbdbbfca848a484f0a6f00ce9dbbd@thread.tacv2/sharedWithTeams/893075dd-2487-5634-925f-022c42e20265
```

### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "value": {
    "@odata.type": "#microsoft.graph.sharedWithChannelTeamInfo",
    "id": "2173de69-de69-2173-69de-732169de7321",
    "tenantId": "b3246f44-b4gb-4627-96c6-25b18fa2c910",
    "displayName": "Team contoso",
    "isHostTeam": true
  }
}
```