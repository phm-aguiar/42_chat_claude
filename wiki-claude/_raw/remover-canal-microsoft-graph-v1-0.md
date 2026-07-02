---
title: "Remover canal - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/team-delete-incomingchannels?view=graph-rest-1.0&tabs=http"
author:
  - "[[devjha-ms]]"
published:
created: 2026-06-30
description: "Remova um canal de entrada."
tags:
  - "clippings"
---
## Remover canal

Namespace: microsoft.graph

Remova um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) de entrada (um **canal** compartilhado com uma **equipe**) de uma [equipe](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0).

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | Channel.Delete.All | Indisponível. |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | Channel.Delete.All | Indisponível. |

> **Observação**: esta API oferece transporte a permissões de administrador. Os administradores de serviços do Microsoft Teams podem aceder às equipas das quais não são membros.

## Solicitação HTTP

HTTP

```http
DELETE /teams/{team-id}/incomingChannels/{incoming-channel-id}/$ref
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
DELETE https://graph.microsoft.com/v1.0/teams/ece6f0a1-7ca4-498b-be79-edf6c8fc4d82/incomingChannels/19%3A56eb04e133944cf69e603c5dac2d292e%40thread.skype/$ref
```

### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 204 No Content
```

## Conteúdo relacionado

- [Remover membro do canal](https://learn.microsoft.com/pt-br/graph/api/channel-delete-members?view=graph-rest-1.0)
- [Remover membro da equipe](https://learn.microsoft.com/pt-br/graph/api/team-delete-members?view=graph-rest-1.0)