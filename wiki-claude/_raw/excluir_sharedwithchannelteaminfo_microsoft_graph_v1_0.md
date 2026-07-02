---
title: "Excluir sharedWithChannelTeamInfo - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/sharedwithchannelteaminfo-delete?view=graph-rest-1.0&tabs=http"
author:
  - "[[devjha-ms]]"
published:
created: 2026-06-30
description: "Descompartilhar um canal com uma equipe excluindo o recurso sharedWithChannelTeamInfo correspondente."
tags:
  - "clippings"
---
## Excluir sharedWithChannelTeamInfo

Namespace: microsoft.graph

Descompartilhar um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) com uma [equipe](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0) excluindo o recurso [sharedWithChannelTeamInfo](https://learn.microsoft.com/pt-br/graph/api/resources/sharedwithchannelteaminfo?view=graph-rest-1.0) correspondente. Esta operação é permitida somente para canais com valor **membershipType** de `shared`.

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ❌ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | ChannelMember.ReadWrite.All | Indisponível. |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | ChannelMember.ReadWrite.Group | ChannelMember.ReadWrite.All |

> **Observação**: esta API oferece transporte a permissões de administrador. Os administradores de serviços do Microsoft Teams podem aceder às equipas das quais não são membros.

## Solicitação HTTP

HTTP

```http
DELETE /teams/{team-id}/channels/{channel-id}/sharedWithTeams/{shared-with-channel-team-info-id}
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

- [HTTP](#tabpanel_1_http)
- [C#](#tabpanel_1_csharp)
- [Ir](#tabpanel_1_go)
- [Java](#tabpanel_1_java)
- [JavaScript](#tabpanel_1_javascript)
- [PHP](#tabpanel_1_php)
- [PowerShell](#tabpanel_1_powershell)
- [Python](#tabpanel_1_python)

```http
DELETE https://graph.microsoft.com/v1.0/teams/ece6f0a1-7ca4-498b-be79-edf6c8fc4d82/channels/19%3A56eb04e133944cf69e603c5dac2d292e%40thread.skype/sharedWithTeams/ece6f0a1-5g39-498b-be79-edf6c8fc4d82
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