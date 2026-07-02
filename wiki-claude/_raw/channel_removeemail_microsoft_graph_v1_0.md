---
title: "channel: removeEmail - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-removeemail?view=graph-rest-1.0&tabs=http"
author:
  - "[[anandab-msft]]"
published:
created: 2026-06-30
description: "Remover o e-mail aprovisionado de um canal."
tags:
  - "clippings"
---
## channel: removeEmail

Namespace: microsoft.graph

Remova o endereço de e-mail de um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0).

Só pode remover um endereço de e-mail se tiver sido aprovisionado com o método [provisionEmail](https://learn.microsoft.com/pt-br/graph/api/channel-provisionemail?view=graph-rest-1.0) ou através do cliente do Microsoft Teams.

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | ChannelSettings.ReadWrite.All | Indisponível. |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Aplicativo | Sem suporte. | Sem suporte. |

## Solicitação HTTP

HTTP

```http
POST /teams/{team-id}/channels/{channel-id}/removeEmail
```

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se tiver êxito, esta ação retornará um código de resposta `204 No Content`.

## Exemplo

### Solicitação

```http
POST https://graph.microsoft.com/v1.0/teams/893075dd-2487-4122-925f-022c42e20265/channels/19:561fbdbbfca848a484f0a6f00ce9dbbd@thread.tacv2/removeEmail
```

### Resposta

HTTP

```http
HTTP/1.1 204 No Content
```