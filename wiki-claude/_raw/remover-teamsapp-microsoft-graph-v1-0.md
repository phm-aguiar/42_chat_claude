---
title: "Remover teamsApp - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-delete-enabledapps?view=graph-rest-1.0&tabs=http"
author:
  - "[[devjha-ms]]"
published:
created: 2026-06-30
description: "Remova uma aplicação teams que desative uma aplicação no canal especificado dentro de uma equipa."
tags:
  - "clippings"
---
## Remover teamsApp

Namespace: microsoft.graph

Remova uma [aplicação teams](https://learn.microsoft.com/pt-br/graph/api/resources/teamsapp?view=graph-rest-1.0) que desative uma [aplicação](https://learn.microsoft.com/pt-br/graph/api/resources/teamsapp?view=graph-rest-1.0) no [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) especificado dentro de uma [equipa](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0). Esta operação é permitida somente para canais com valor **membershipType** de `shared`.

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissão com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | TeamsAppInstallation.ManageSelectedForTeam | TeamsAppInstallation.ReadWriteForTeam |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | TeamsAppInstallation.ManageSelectedForTeam.All | TeamsAppInstallation.ReadWriteForTeam.All |

## Solicitação HTTP

HTTP

```http
DELETE /teams/{team-id}/channels/{channel-id}/enabledApps/{app-id}/$ref
```

## Cabeçalhos de solicitação

| Nome | Descrição |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se tiver êxito, este método retornará um código de resposta `204 No Content`.

## Exemplos

### Solicitação

O exemplo a seguir mostra uma solicitação.

```http
DELETE https://graph.microsoft.com/v1.0/teams/893075dd-2487-4122-925f-022c42e20265/channels/19:561fbdbbfca848a3a8df3ffe558b1c1@thread.tacv2/enabledApps/b1c5353a-7aca-41b3-830f-27d5218fe0e5/$ref
```

### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 204 No Content
```