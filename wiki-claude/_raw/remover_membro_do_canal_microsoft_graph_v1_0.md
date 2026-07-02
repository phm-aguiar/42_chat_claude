---
title: "Remover membro do canal - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-delete-members?view=graph-rest-1.0&tabs=http"
author:
  - "[[AkJo]]"
published:
created: 2026-06-30
description: "Remover um membro de um canal."
tags:
  - "clippings"
---
## Remover membro do canal

Namespace: microsoft.graph

Eliminar uma [conversaÇãoMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) de um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0). Esta operação só é permitida para canais com um valor **membershipType** de `private` ou `shared`.

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | ChannelMember.ReadWrite.All | Indisponível. |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | ChannelMember.ReadWrite.Group | ChannelMember.ReadWrite.All |

## Solicitação HTTP

HTTP

```http
DELETE /teams/{team-id}/channels/{channel-id}/members/{membership-id}
```

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se tiver êxito, este método retornará um código de resposta `204 No Content`.

## Exemplo

### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_1_http)
- [C#](#tabpanel_1_csharp)
- [Ir](#tabpanel_1_go)
- [Java](#tabpanel_1_java)
- [JavaScript](#tabpanel_1_javascript)
- [PHP](#tabpanel_1_php)
- [Python](#tabpanel_1_python)

```http
DELETE https://graph.microsoft.com/v1.0/teams/ece6f0a1-7ca4-498b-be79-edf6c8fc4d82/channels/19%3A56eb04e133944cf69e603c5dac2d292e%40thread.skype/members/ZWUwZjVhZTItOGJjNi00YWU1LTg0NjYtN2RhZWViYmZhMDYyIyM3Mzc2MWYwNi0yYWM5LTQ2OWMtOWYxMC0yNzlhOGNjMjY3Zjk=
```

### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 204 No Content
```

## Conteúdo relacionado

- [Remover membro da equipe](https://learn.microsoft.com/pt-br/graph/api/team-delete-members?view=graph-rest-1.0)