---
title: "canal: arquivo - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-archive?view=graph-rest-1.0&tabs=http"
author:
  - "[[sumitgupta3]]"
published:
created: 2026-06-30
description: "Arquivo um canal numa equipa."
tags:
  - "clippings"
---
## canal: arquivo

Namespace: microsoft.graph

Arquivo um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) numa equipa. Quando um canal é arquivado, os utilizadores não podem enviar novas mensagens ou reagir a mensagens existentes no canal, editar as definições do canal ou fazer outras alterações ao canal.

Pode eliminar um canal arquivado ou adicionar e remover membros do mesmo. Se arquivar uma equipa, os respetivos canais também serão arquivados.

O arquivo é uma operação assíncrona; Um canal é arquivado após a conclusão com êxito da operação de arquivo assíncrona, o que pode ocorrer após a resposta ser devolvida.

Não é possível arquivar um canal sem um proprietário ou que pertença a um [grupo](https://learn.microsoft.com/pt-br/graph/api/resources/group?view=graph-rest-1.0) que não tem proprietário.

Para restaurar um canal a partir do respetivo estado arquivado, utilize o [canal: método unarchive](https://learn.microsoft.com/pt-br/graph/api/channel-unarchive?view=graph-rest-1.0). Um canal não pode ser arquivado ou arquivado se a sua equipa estiver arquivada.

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
| Application | ChannelSettings.ReadWrite.All | Indisponível. |

> **Observação**: esta API oferece transporte a permissões de administrador. Os utilizadores com as funções de Administrador Global ou administrador de serviço do Microsoft Teams podem aceder às equipas das quais não são membros.

## Solicitação HTTP

HTTP

```http
POST /teams/{team-id}/channels/{channel-id}/archive
POST /groups/{team-id}/team/channels/{channel-id}/archive
```

## Cabeçalhos de solicitação

| Nome | Descrição |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |
| Content-Type | application/json. Opcional. |

## Corpo da solicitação

No corpo do pedido, opcionalmente, pode fornecer um objeto JSON com o seguinte parâmetro.

| Parâmetro | Tipo | Descrição |
| --- | --- | --- |
| shouldSetSpoSiteReadOnlyForMembers | Booliano | Define se pretende definir permissões para os membros do canal para só de leitura no site do SharePoint Online associado à equipa. Se o definir como `false` ou omitir o parâmetro, este passo é ignorado. |

O exemplo seguinte mostra o corpo do pedido com **shouldSetSpoSiteReadOnlyForMembers definido como** `true`.

JSON

```json
{
  "shouldSetSpoSiteReadOnlyForMembers": true
}
```

## Resposta

Se o arquivamento for iniciado com êxito, esse método retornará um código de resposta `202 Accepted`. A resposta contém um `Location` cabeçalho que especifica a localização do [teamsAsyncOperation](https://learn.microsoft.com/pt-br/graph/api/resources/teamsasyncoperation?view=graph-rest-1.0) que foi criado para processar o arquivo do canal numa equipa. Verifique o status da operação de arquivamento fazendo uma solicitação GET para esse local.

## Exemplos

### Exemplo 1: Arquivo um canal

O exemplo seguinte mostra um pedido para arquivar um canal.

#### Solicitação

- [HTTP](#tabpanel_1_http)
- [C#](#tabpanel_1_csharp)
- [Ir](#tabpanel_1_go)
- [Java](#tabpanel_1_java)
- [JavaScript](#tabpanel_1_javascript)
- [PHP](#tabpanel_1_php)
- [PowerShell](#tabpanel_1_powershell)
- [Python](#tabpanel_1_python)

```http
POST https://graph.microsoft.com/v1.0/teams/16dc05c0-2259-4540-a970-3580ff459721/channels/19:v32db348d9264477abcf18ffa2cf76dc@thread.tacv2/archive
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 202 Accepted
Location: /teams/16dc05c0-2259-4540-a970-3580ff459721/operations/b7ee702a-d87f-4cc6-82b9-e731c16d3aba
Content-Type: text/plain
Content-Length: 0
```

### Exemplo 2: Arquivo um canal quando a equipa é arquivada

O exemplo seguinte mostra um pedido para arquivar um canal que falha porque a equipa está arquivada; a equipa tem de estar ativa para arquivar ou desarcultar um canal.

#### Solicitação

- [HTTP](#tabpanel_2_http)
- [C#](#tabpanel_2_csharp)
- [Ir](#tabpanel_2_go)
- [Java](#tabpanel_2_java)
- [JavaScript](#tabpanel_2_javascript)
- [PHP](#tabpanel_2_php)
- [PowerShell](#tabpanel_2_powershell)
- [Python](#tabpanel_2_python)

```http
POST https://graph.microsoft.com/v1.0/teams/16dc05c0-2259-4540-a970-3580ff459721/channels/19:v32db348d9264477abcf18ffa2cf76dc@thread.tacv2/archive
```

#### Resposta

O exemplo seguinte mostra o `400 Bad Request` código de resposta com uma mensagem de erro correspondente.

HTTP

```http
http/1.1 400 Bad Request
Content-Type: application/json
Content-Length: 193

{
    "error": {
        "code": "BadRequest",
        "message": "Team has to be active, for channel to be archived or unarchived: {channel-id}",
        "innerError": {
            "message": "Team has to be active, for channel to be archived or unarchived: {channel-id}",
            "code": "Unknown",
            "innerError": {},
            "date": "2023-12-11T04:26:35",
            "request-id": "8f897345980-f6f3-49dd-83a8-a3064eeecdf8",
            "client-request-id": "50a0er33-4567-3f6c-01bf-04d144fc8bbe"
        }
    }
}
```