---
title: "Listar canais - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-list?view=graph-rest-1.0&tabs=http"
author:
  - "[[MSFTRickyCastaneda]]"
published:
created: 2026-06-30
description: "Recuperar a lista de canais nessa equipe."
tags:
  - "clippings"
---
## Listar canais

Namespace: microsoft.graph

Recuperar a lista de [canais](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) nessa [equipe](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0).

> **Nota:** Os membros do Teams não podem ver canais privados ou partilhados dos quais não são membros na resposta para esta API.

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

Esta API suporta permissões de administrador. Os administradores de serviços do Microsoft Teams podem aceder às equipas das quais não são membros.

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | Channel.ReadBasic.All | ChannelSettings.Read.All, ChannelSettings.ReadWrite.All, Directory.Read.All, Directory.ReadWrite.All, Group.Read.All, Group.ReadWrite.All |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | ChannelSettings.Read.Group | Channel.ReadBasic.All, ChannelSettings.Read.All, ChannelSettings.ReadWrite.All, ChannelSettings.ReadWrite.Group, Directory.Read.All, Directory.ReadWrite.All, Group.Read.All, Group.ReadWrite.All |

## Solicitação HTTP

HTTP

```http
GET /teams/{team-id}/channels
```

## Parâmetros de consulta opcionais

Este método suporta os [parâmetros de consulta OData](https://learn.microsoft.com/pt-br/graph/query-parameters) $filter e $select para ajudar a personalizar a resposta.

### Use $select para melhorar o desempenho

Preencher a propriedade **de e-mail** de um canal é uma operação dispendiosa que resulta num desempenho lento. Utilize `$select` para excluir a propriedade **de e-mail** para melhorar o desempenho.

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se bem-sucedido, este método retorna um código de resposta `200 OK` e uma coleção de objetos [Channel](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) no corpo da resposta.

Quando o conjunto de resultados abrange várias páginas, a resposta inclui uma propriedade **@odata.nextLink** com um URL para obter a página seguinte dos resultados. Para obter detalhes sobre como analisar os resultados, veja [Paging Microsoft Graph data in your app (Paginar dados do Microsoft Graph na sua aplicação](https://learn.microsoft.com/pt-br/graph/paging)).

## Exemplos

### Exemplo 1: Listar todos os canais

#### Solicitação

O exemplo a seguir mostra uma solicitação para listar todos os canais.

- [HTTP](#tabpanel_1_http)
- [C#](#tabpanel_1_csharp)
- [Ir](#tabpanel_1_go)
- [Java](#tabpanel_1_java)
- [JavaScript](#tabpanel_1_javascript)
- [PHP](#tabpanel_1_php)
- [PowerShell](#tabpanel_1_powershell)
- [Python](#tabpanel_1_python)

```msgraph
GET https://graph.microsoft.com/v1.0/teams/893075dd-2487-4122-925f-022c42e20265/channels
```

#### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
  "value": [
    {
      "id": "19:561fbdbbfca848a484f0a6f00ce9dbbd@thread.tacv2",
      "createdDateTime": "2020-05-27T19:22:25.692Z",
      "displayName": "General",
      "description": "AutoTestTeam_20210311_150740.2550_fim3udfdjen9",
      "membershipType": "standard",
      "layoutType": null,
      "isArchived": false
    }
  ]
}
```

### Exemplo 2: Listar todos os canais privados

O exemplo seguinte mostra como listar todos os canais privados.

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
GET https://graph.microsoft.com/v1.0/teams/64c323f2-226a-4e64-8ba4-3e6e3f7b9330/channels?$filter=membershipType eq 'private'
```

#### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
  "value": [
    {
      "id": "19:982abbfca323a582f0a6d00ae2deca@thread.tacv2",
      "createdDateTime": "2020-05-27T19:22:25.692Z",
      "displayName": "General",
      "description": "test private team",
      "membershipType": "private",
      "layoutType": null,
      "isArchived": false
    }
  ]
}
```

### Exemplo 3: listar todos os canais compartilhados

#### Solicitação

O exemplo a seguir mostra uma solicitação para listar todos os canais compartilhados.

- [HTTP](#tabpanel_3_http)
- [C#](#tabpanel_3_csharp)
- [Ir](#tabpanel_3_go)
- [Java](#tabpanel_3_java)
- [JavaScript](#tabpanel_3_javascript)
- [PHP](#tabpanel_3_php)
- [PowerShell](#tabpanel_3_powershell)
- [Python](#tabpanel_3_python)

```msgraph
GET https://graph.microsoft.com/v1.0/teams/6a720ba5-7373-463b-bc9f-4cd04b5c6742/channels?$filter=membershipType eq 'shared'
```

#### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json
Content-length: 262

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#teams('6a720ba5-7373-463b-bc9f-4cd04b5c6742')/channels",
    "@odata.count": 1,
    "value": [
        {
            "id": "19:LpxShHZZh9utjNcEmUS5aOEP9ASw85OUn05NcWYAhX81@thread.tacv2",
            "createdDateTime": null,
            "displayName": "shared channel-01",
            "description": "this is the shared channel description",
            "isFavoriteByDefault": null,
            "email": "",
            "webUrl": "https://teams.microsoft.com/l/channel/19%3ALpxShHZZh9utjNcEmUS5aOEP9ASw85OUn05NcWYAhX81%40thread.tacv2/shared%20channel-01?groupId=6a720ba5-7373-463b-bc9f-4cd04b5c6742&tenantId=df81db53-c7e2-418a-8803-0e68d4b88607",
            "membershipType": "shared",
            "layoutType": null,
            "moderationSettings": null,
            "isArchived": false
        }
    ]
}
```

## Conteúdo relacionado

[Limites de limitação específicos do serviço do Microsoft Graph](https://learn.microsoft.com/pt-br/graph/throttling-limits#microsoft-teams-service-limits)