---
title: "Get primaryChannel - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/team-get-primarychannel?view=graph-rest-1.0&tabs=http"
author:
  - "[[MSFTRickyCastaneda]]"
published:
created: 2026-06-30
description: "Recupere a propriedade de navegação de uma equipe que permita acesso ao seu canal Geral padrão."
tags:
  - "clippings"
---
## Get primaryChannel

Namespace: Microsoft Graph

Obtenha o canal [padrão](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0), **Geral**, de uma [equipe](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0).

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

Esta API suporta permissões de administrador. Os utilizadores com funções de administrador podem aceder às equipas das quais não são membros.

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | Channel.ReadBasic.All | ChannelSettings.Read.All, ChannelSettings.ReadWrite.All |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | ChannelSettings.Read.Group | Channel.ReadBasic.All, ChannelSettings.Read.All, ChannelSettings.ReadWrite.All, ChannelSettings.ReadWrite.Group |

## Solicitação HTTP

HTTP

```http
GET /teams/{id}/primaryChannel
```

## Parâmetros de consulta opcionais

Este método suporta os `$filter` parâmetros de consulta, `$select` e `$expand` [OData](https://learn.microsoft.com/pt-br/graph/query-parameters) para ajudar a personalizar a resposta.

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se tiver êxito, este método retornará um código de resposta `200 OK` e um objeto [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) no corpo da resposta.

## Exemplo

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
GET https://graph.microsoft.com/v1.0/teams/02bd9fd6-8f93-4758-87c3-1fb73740a315/primaryChannel
```

### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#teams('32e3b156-66b2-4135-9aeb-73295a35a55b')/primaryChannel/$entity",
    "id": "19:skypespaces_dd1e128ffa85453ab1f3015468e979d5@thread.skype",
    "displayName": "General",
    "description": "Microsoft Teams Platform team discussions",
    "email": "0686dc7a.microsoft.com@amer.teams.ms",
    "webUrl": "https://teams.microsoft.com/l/channel/19%3askypespaces_dd1e128ffa85453ab1f3015468e979d5%40thread.skype/General?groupId=32e3b156-66b2-4135-9aeb-73295a35a55b&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47",
    "membershipType": "standard",
    "layoutType": null
}
```