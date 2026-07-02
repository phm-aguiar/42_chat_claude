---
title: "List enabledApps - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-list-enabledapps?view=graph-rest-1.0&tabs=http"
author:
  - "[[devjha-ms]]"
published:
created: 2026-06-30
description: "Obtenha uma lista das aplicações ativadas no canal especificado dentro de uma equipa."
tags:
  - "clippings"
---
## List enabledApps

Namespace: microsoft.graph

Obtenha uma lista das [aplicações ativadas](https://learn.microsoft.com/pt-br/graph/api/resources/teamsapp?view=graph-rest-1.0) no [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) especificado dentro de uma [equipa](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0).

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ❌ | ❌ | ❌ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | TeamsAppInstallation.ReadForTeam | TeamsAppInstallation.ManageSelectedForTeam, TeamsAppInstallation.ReadWriteForTeam |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | TeamsAppInstallation.Read.Group | TeamsAppInstallation.ManageSelectedForTeam.All, TeamsAppInstallation.Read.All, TeamsAppInstallation.ReadForTeam.All, TeamsAppInstallation.ReadWriteForTeam.All |

## Solicitação HTTP

HTTP

```http
GET /teams/{team-id}/channels/{channel-id}/enabledApps
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

Se for bem-sucedido, este método devolve um `200 OK` código de resposta e uma coleção de objetos [teamsApp](https://learn.microsoft.com/pt-br/graph/api/resources/teamsapp?view=graph-rest-1.0) no corpo da resposta. A resposta também inclui a propriedade **@odata.id** que pode ser utilizada para aceder ao **teamsApp** e executar outras operações no objeto [teamsApp](https://learn.microsoft.com/pt-br/graph/api/resources/teamsapp?view=graph-rest-1.0).

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

```http
GET https://graph.microsoft.com/v1.0/teams/893075dd-2487-4122-925f-022c42e20265/channels/19:561fbdbbfca848a3a8df3ffe558b1c1@thread.tacv2/enabledApps
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
      "@odata.type": "#microsoft.graph.teamsApp",
      "@odata.id": "https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/b1c5353a-7aca-41b3-830f-27d5218fe0e5",
      "id": "b1c5353a-7aca-41b3-830f-27d5218fe0e5",
      "externalId": "f31b1263-ba99-435a-a679-911d24850d7c",
      "displayName": "Sample App 1",
      "distributionMethod": "organization"
    },
    {
      "@odata.type": "#microsoft.graph.teamsApp",
      "@odata.id": "https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/c21ba739-90e0-462b-bc10-5c235ae55e99",
      "id": "c21ba739-90e0-462b-bc10-5c235ae55e99",
      "externalId": "c21ba739-90e0-462b-bc10-5c235ae55e88",
      "displayName": "Sample App 2",
      "distributionMethod": "organization"
    }
  ]
}
```