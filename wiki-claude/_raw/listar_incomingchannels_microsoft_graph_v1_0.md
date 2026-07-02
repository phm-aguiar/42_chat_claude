---
title: "Listar incomingChannels - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/team-list-incomingchannels?view=graph-rest-1.0&tabs=http"
author:
  - "[[devjha-ms]]"
published:
created: 2026-06-30
description: "Obtenha a lista de canais de entrada."
tags:
  - "clippings"
---
## Listar incomingChannels

Namespace: microsoft.graph

Obtenha a lista de [canais](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) de entrada (canais compartilhados com uma [equipe](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0)).

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ❌ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | Channel.ReadBasic.All | ChannelSettings.Read.All, ChannelSettings.ReadWrite.All |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | Channel.ReadBasic.All | ChannelSettings.Read.All, ChannelSettings.ReadWrite.All |

> **Observação**: esta API oferece transporte a permissões de administrador. Os administradores de serviços do Microsoft Teams podem aceder às equipas das quais não são membros.

## Solicitação HTTP

HTTP

```http
GET /teams/{team-id}/incomingChannels
```

## Parâmetros de consulta opcionais

Este método oferece suporte aos `$filter` e `$select` [parâmetros de consulta OData](https://learn.microsoft.com/pt-br/graph/query-parameters) para ajudar a personalizar a resposta.

## Cabeçalhos de solicitação

| Nome | Descrição |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se for bem-sucedido, esse método retornará um código de réplica `200 OK` e uma coleção de objetos de [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) no corpo da réplica. A réplica também inclui a propriedade **@odata.id** que pode ser usada para acessar o canal e executar outras operações no objeto de [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0).

Quando o conjunto de resultados abrange várias páginas, a resposta inclui uma propriedade **@odata.nextLink** com um URL para obter a página seguinte dos resultados. Para obter detalhes sobre como analisar os resultados, veja [Paging Microsoft Graph data in your app (Paginar dados do Microsoft Graph na sua aplicação](https://learn.microsoft.com/pt-br/graph/paging)).

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
GET https://graph.microsoft.com/v1.0/teams/893075dd-2487-4122-925f-022c42e20265/incomingChannels
```

### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "value": [
    {
      "@odata.id": "https://graph.microsoft.com/v1.0/tenants/b3246f44-b4gb-4627-96c6-25b18fa2c910/teams/893075dd-5678-4122-925f-022c42e20265/channels/19:561fbdbbfca848a484f0a6f00ce9dbbd@thread.tacv2",
      "id": "19:561fbdbbfca848a484f0a6f00ce9dbbd@thread.tacv2",
      "createdDateTime": "2020-05-27T19:22:25.692Z",
      "displayName": "Contoso Sales channel",
      "description": "channel created in Contoso to be shared with other teams/tenants.",
      "membershipType": "shared",
      "layoutType": null,
      "tenantId": "b3246f44-b4gb-4627-96c6-25b18fa2c910"
    }
  ]
}
```