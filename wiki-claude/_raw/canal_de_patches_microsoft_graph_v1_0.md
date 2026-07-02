---
title: "Canal de patches - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-patch?view=graph-rest-1.0&tabs=http"
author:
  - "[[anandjo]]"
published:
created: 2026-06-30
description: "Atualize as propriedades do canal especificado."
tags:
  - "clippings"
---
## Canal de patches

Namespace: microsoft.graph

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

Esta API suporta permissões de administrador. Os administradores de serviços do Microsoft Teams podem aceder às equipas das quais não são membros.

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | ChannelSettings.ReadWrite.All | Directory.ReadWrite.All, Group.ReadWrite.All |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | ChannelSettings.ReadWrite.Group | ChannelSettings.ReadWrite.All, Directory.ReadWrite.All, Group.ReadWrite.All |

## Solicitação HTTP

HTTP

```http
PATCH /teams/{team-id}/channels/{channel-id}
```

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |
| Content-Type | application/json. Obrigatório. |

## Corpo da solicitação

No corpo da solicitação, fornça uma representação JSON do objeto [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0).

> **Nota:** Não é possível atualizar o `membershipType` valor de um canal existente.

## Resposta

Se tiver êxito, este método retornará um código de resposta `204 No Content`.

## Exemplos

### Exemplo 1: Atualizar um canal

O exemplo seguinte mostra como atualizar um canal.

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
PATCH https://graph.microsoft.com/v1.0/teams/893075dd-2487-4122-925f-022c42e20265/channels/19:561fbdbbfca848a484f0a6f00ce9dbbd@thread.tacv2
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 204 No Content
```

### Exemplo 2: Atualizar o tipo de esquema de um canal

O exemplo seguinte mostra como atualizar o tipo de esquema existente de um canal de publicação para chat.

#### Solicitação

O exemplo seguinte mostra um pedido para alterar o esquema de um canal do formato pós-resposta tradicional para uma experiência de threading semelhante a um chat.

- [HTTP](#tabpanel_2_http)
- [C#](#tabpanel_2_csharp)
- [Ir](#tabpanel_2_go)
- [Java](#tabpanel_2_java)
- [JavaScript](#tabpanel_2_javascript)
- [PHP](#tabpanel_2_php)
- [PowerShell](#tabpanel_2_powershell)
- [Python](#tabpanel_2_python)

```http
PATCH https://graph.microsoft.com/v1.0/teams/893075dd-2487-4122-925f-022c42e20265/channels/19:4b6bed8d24574f6a9e436813cb2617d8@thread.tacv2
Content-type: application/json

{
  "layoutType": "chat"
}
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 204 No Content
```

### Exemplo 3: mudar um canal de volta para o tipo de esquema de publicação

O exemplo seguinte mostra como converter um canal de esquema de chat de volta para o formato pós-resposta tradicional.

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_3_http)
- [C#](#tabpanel_3_csharp)
- [Ir](#tabpanel_3_go)
- [Java](#tabpanel_3_java)
- [JavaScript](#tabpanel_3_javascript)
- [PHP](#tabpanel_3_php)
- [PowerShell](#tabpanel_3_powershell)
- [Python](#tabpanel_3_python)

```http
PATCH https://graph.microsoft.com/v1.0/teams/893075dd-2487-4122-925f-022c42e20265/channels/19:4b6bed8d24574f6a9e436813cb2617d8@thread.tacv2
Content-type: application/json

{
  "layoutType": "post"
}
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 204 No Content
```

## Conteúdo relacionado

[Limites de limitação específicos do serviço do Microsoft Graph](https://learn.microsoft.com/pt-br/graph/throttling-limits#microsoft-teams-service-limits)