---
title: "Atualizar guia - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-patch-tabs?view=graph-rest-1.0&tabs=http"
author:
  - "[[MSFTRickyCastaneda]]"
published:
created: 2026-06-30
description: "Atualize as propriedades do separador especificado."
tags:
  - "clippings"
---
## Atualizar guia

Namespace: microsoft.graph

Atualize as propriedades do [separador](https://learn.microsoft.com/pt-br/graph/api/resources/teamstab?view=graph-rest-1.0) especificado. Esta API pode ser utilizada para configurar o conteúdo do separador.

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ❌ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

Esta API suporta permissões de administrador. Os administradores de serviços do Microsoft Teams podem aceder às equipas das quais não são membros.

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | TeamsTab.ReadWriteSelfForTeam | Directory.ReadWrite.All, Group.ReadWrite.All, TeamsTab.ReadWrite.All, TeamsTab.ReadWriteForTeam |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | TeamsTab.ReadWrite.Group | Directory.ReadWrite.All, Group.ReadWrite.All, TeamsTab.ReadWrite.All, TeamsTab.ReadWriteForTeam.All, TeamsTab.ReadWriteSelfForTeam.All |

## Solicitação HTTP

HTTP

```http
PATCH /teams/{team-id}/channels/{channel-id}/tabs/{tab-id}
```

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |
| Content-Type | application/json |

## Corpo da solicitação

No corpo do pedido, forneça uma representação JSON do objeto de [separador](https://learn.microsoft.com/pt-br/graph/api/resources/teamstab?view=graph-rest-1.0).

## Resposta

Se tiver êxito, este método retornará um código de resposta `200 OK`.

## Exemplo

#### Solicitação

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
PATCH https://graph.microsoft.com/v1.0/teams/{id}/channels/{id}/tabs/{id}
Content-type: application/json

{
  "displayName": "My Contoso Tab - updated"
}
```

#### Resposta

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
  "id": "tabId",
  "displayName": "My Contoso Tab - updated",
  "teamsApp@odata.bind": "https://graph.microsoft.com/v1.0/appCatalogs/teamsApps('06805b9e-77e3-4b93-ac81-525eb87513b8')",
  "configuration": {
    "entityId": "2DCA2E6C7A10415CAF6B8AB6661B3154",
    "contentUrl": "https://www.contoso.com/Orders/2DCA2E6C7A10415CAF6B8AB6661B3154/tabView",
    "websiteUrl": "https://www.contoso.com/Orders/2DCA2E6C7A10415CAF6B8AB6661B3154",
    "removeUrl": "https://www.contoso.com/Orders/2DCA2E6C7A10415CAF6B8AB6661B3154/uninstallTab"
  },
  "sortOrderIndex": "20",
  "webUrl": "https://teams.microsoft.com/l/channel/19%3ac2e36757ee744c569e70b385e6dd79b6%40thread.skype/tab%3a%3afd736d46-51ed-4c0b-9b23-e67ca354bb24?label=my%20%contoso%to%tab"
}
```

## Conteúdo relacionado

- [Configurar tipos de guia internos](https://learn.microsoft.com/pt-br/graph/teams-configuring-builtin-tabs)
- [Limites de limitação específicos do serviço do Microsoft Graph](https://learn.microsoft.com/pt-br/graph/throttling-limits#microsoft-teams-service-limits)