---
title: "Separador Eliminar do canal - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-delete-tabs?view=graph-rest-1.0&tabs=http"
author:
  - "[[MSFTRickyCastaneda]]"
published:
created: 2026-06-30
description: "Remove (remove) um separador do canal especificado numa equipa."
tags:
  - "clippings"
---
## Separador Eliminar do canal

Namespace: microsoft.graph

Remove (remove) um separador do [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) especificado numa [equipa](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0).

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
| Application | TeamsTab.Delete.Group | TeamsTab.ReadWrite.Group, Directory.ReadWrite.All, Group.ReadWrite.All, TeamsTab.ReadWrite.All, TeamsTab.ReadWriteForTeam.All, TeamsTab.ReadWriteSelfForTeam.All |

## Solicitação HTTP

HTTP

```http
DELETE /teams/{team-id}/channels/{channel-id}/tabs/{tab-id}
```

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se bem sucedido, este método retorna um código de resposta `204 No Content`. Não devolve nada no corpo da resposta.

## Exemplo

### Solicitação

O exemplo a seguir mostra uma solicitação.

```http
DELETE https://graph.microsoft.com/v1.0/teams/{id}/channels/{id}/tabs/{id}
```

### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 204 No Content
```

## Conteúdo relacionado

[Limites de limitação específicos do serviço do Microsoft Graph](https://learn.microsoft.com/pt-br/graph/throttling-limits#microsoft-teams-service-limits)