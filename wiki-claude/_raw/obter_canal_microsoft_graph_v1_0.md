---
title: "Obter canal - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-get?view=graph-rest-1.0&tabs=http"
author:
  - "[[MSFTRickyCastaneda]]"
published:
created: 2026-06-30
description: "Recuperar as propriedades e os relacionamentos de um canal."
tags:
  - "clippings"
---
## Obter canal

Namespace: microsoft.graph

Recuperar as propriedades e os relacionamentos de um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0).

Este método suporta a federação. Apenas um utilizador que seja membro do canal partilhado pode obter informações de canal.

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

Esta API suporta permissões de administrador. Os administradores de serviços do Microsoft Teams podem aceder às equipas das quais não são membros.

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | Channel.ReadBasic.All | ChannelSettings.ReadWrite.All, ChannelSettings.Read.All, Directory.Read.All, Directory.ReadWrite.All, Group.Read.All, Group.ReadWrite.All |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | ChannelSettings.Read.Group | ChannelSettings.ReadWrite.Group, Channel.ReadBasic.All, ChannelSettings.Read.All, ChannelSettings.ReadWrite.All, Directory.Read.All, Directory.ReadWrite.All, Group.Read.All, Group.ReadWrite.All |

## Solicitação HTTP

HTTP

```http
GET /teams/{team-id}/channels/{channel-id}
```

## Parâmetros de consulta opcionais

Este método oferece suporte aos `$filter` e `$select` [parâmetros de consulta OData](https://learn.microsoft.com/pt-br/graph/query-parameters) para ajudar a personalizar a resposta.

### Use $select para melhorar o desempenho

Preencher o **e-mail** e a propriedade **de resumo** de um canal é uma operação dispendiosa que resulta num desempenho lento. Utilize `$select` para excluir o **e-mail** e a propriedade **de resumo** para melhorar o desempenho.

> **Nota**: a propriedade de resumo só pode ser obtida através do `select` parâmetro, conforme mostrado no Exemplo 2 neste tópico.

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se tiver êxito, este método retornará um código de resposta `200 OK` e um objeto [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) no corpo da resposta.

## Exemplos

### Exemplo 1: Obter um canal

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

```msgraph
GET https://graph.microsoft.com/v1.0/teams/893075dd-2487-4122-925f-022c42e20265/channels/19:561fbdbbfca848a484f0a6f00ce9dbbd@thread.tacv2
```

#### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "id": "19:561fbdbbfca848a484f0a6f00ce9dbbd@thread.tacv2",
    "createdDateTime": "2020-05-27T19:22:25.692Z",
    "displayName": "General",
    "description": "AutoTestTeam_20210311_150740.2550_fim3udfdjen9",
    "membershipType": "standard",
    "layoutType": "post",
    "isArchived": false
}
```

### Exemplo 2: Obter uma propriedade channelSummary

#### Solicitação

O exemplo seguinte mostra um pedido para obter a propriedade **channelSummary**.

- [HTTP](#tabpanel_2_http)
- [C#](#tabpanel_2_csharp)
- [Ir](#tabpanel_2_go)
- [Java](#tabpanel_2_java)
- [JavaScript](#tabpanel_2_javascript)
- [PHP](#tabpanel_2_php)
- [PowerShell](#tabpanel_2_powershell)
- [Python](#tabpanel_2_python)

```msgraph
GET https://graph.microsoft.com/v1.0/teams/893075dd-2487-4122-925f-022c42e20265/channels/19:561fbdbbfca848a484f0a6f00ce9dbbd@thread.tacv2?$select=summary
```

#### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#teams('8bb12236-b929-42e0-94a0-1c417466ebf8')/channels(summary)/$entity",
    "summary":{
        "ownersCount":2,
        "membersCount":3,
        "guestsCount":1,
        "hasMembersFromOtherTenants":false
    }
}
```

### Exemplo 3: Obter um canal no modo de migração

O exemplo seguinte mostra como obter um canal no modo de migração.

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

```msgraph
GET https://graph.microsoft.com/v1.0/teams/893075dd-2487-4122-925f-022c42e20265/channels/19:561fbdbbfca848a484f0a6f00ce9dbbd@thread.tacv2
```

#### Resposta

O exemplo seguinte mostra a resposta quando o canal está no modo de migração.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#teams('893075dd-2487-4122-925f-022c42e20265')/channels/$entity",
  "id": "19:561fbdbbfca848a484f0a6f00ce9dbbd@thread.tacv2",
  "displayName": "Migration Channel",
  "description": "Channel created in migration mode.",
  "isFavoriteByDefault": null,
  "email": "",
  "webUrl": "https://teams.microsoft.com/l/channel/19%3A561fbdbbfca848a484f0a6f00ce9dbbd%40thread.tacv2/Migration%20Channel?groupId=893075dd-2487-4122-925f-022c42e20265&tenantId=139d16b4-7223-43ad-b9a8-674ba63c7924",
  "membershipType": "private",
  "isArchived": false,
  "createdDateTime": "2020-05-27T19:22:25.692Z",
  "migrationMode": "inProgress",
  "originalCreatedDateTime": "2020-05-28T10:00:00Z"
}
```

## Conteúdo relacionado

[Limites de limitação específicos do serviço do Microsoft Graph](https://learn.microsoft.com/pt-br/graph/throttling-limits#microsoft-teams-service-limits)