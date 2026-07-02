---
title: "Delete channel - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-delete?view=graph-rest-1.0&tabs=http"
author:
  - "[[MSFTRickyCastaneda]]"
published:
created: 2026-06-30
description: "Elimine o canal."
tags:
  - "clippings"
---
## Delete channel

Namespace: microsoft.graph

> **Observação**: Há um problema conhecido com as permissões do aplicativo e este API. Para saber mais, confira a [lista de problemas conhecidos](https://learn.microsoft.com/pt-br/graph/known-issues#application-permissions).

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

Esta API suporta permissões de administrador. Os administradores de serviços do Microsoft Teams podem aceder às equipas das quais não são membros.

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | Channel.Delete.All | Directory.ReadWrite.All, Group.ReadWrite.All |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | Channel.Delete.Group | Channel.Delete.All, Directory.ReadWrite.All, Group.ReadWrite.All |

## Solicitação HTTP

HTTP

```http
DELETE /teams/{team-id}/channels/{channel-id}
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
DELETE https://graph.microsoft.com/v1.0/teams/{id}/channels/{id}
```

### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 204 No Content
```

## Conteúdo relacionado

[Limites de limitação específicos do serviço do Microsoft Graph](https://learn.microsoft.com/pt-br/graph/throttling-limits#microsoft-teams-service-limits)