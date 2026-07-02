---
title: "Criar canal - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-post?view=graph-rest-1.0&tabs=http"
author:
  - "[[MSFTRickyCastaneda]]"
published:
created: 2026-06-30
description: "Crie um novo canal numa equipa, conforme especificado no corpo do pedido."
tags:
  - "clippings"
---
## Criar canal

Namespace: microsoft.graph

Crie um novo [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) numa equipa, conforme especificado no corpo do pedido. Quando cria um canal, o comprimento máximo do canal `displayName` é de 50 carateres. Este é o nome que aparece para o utilizador no Microsoft Teams.

Se estiver a criar um canal privado, pode adicionar um máximo de 200 membros.

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

Esta API suporta permissões de administrador. Os administradores de serviços do Microsoft Teams podem aceder às equipas das quais não são membros.

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | Channel.Create | Directory.ReadWrite.All, Group.ReadWrite.All |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | Channel.Create.Group | Channel.Create, Directory.ReadWrite.All, Group.ReadWrite.All, Teamwork.Migrate.All |

## Solicitação HTTP

HTTP

```http
POST /teams/{team-id}/channels
```

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |
| Content-Type | application/json. Obrigatório. |

## Corpo da solicitação

No corpo da solicitação, fornça uma representação JSON do objeto [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0).

## Resposta

Se for bem-sucedido, este método devolve um `201 Created` código de resposta e um objeto de [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) no corpo da resposta de um canal com um valor **membershipType** de `standard` ou `private`. Para um canal com um valor **membershipType** de `shared`, este método devolve um `202 Accepted` código de resposta e uma ligação para [teamsAsyncOperation](https://learn.microsoft.com/pt-br/graph/api/resources/teamsasyncoperation?view=graph-rest-1.0).

## Exemplos

### Exemplo 1: Criar um canal padrão

#### Solicitação

O exemplo seguinte mostra um pedido para criar um canal padrão.

```http
POST https://graph.microsoft.com/v1.0/teams/57fb72d0-d811-46f4-8947-305e6072eaa5/channels
Content-type: application/json

{
  "displayName": "Architecture Discussion",
  "description": "This channel is where we debate all future architecture plans",
  "membershipType": "standard"
}
```

#### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 201 Created
Content-type: application/json

{
  "id": "19:4b6bed8d24574f6a9e436813cb2617d8@thread.tacv2",
  "displayName": "Architecture Discussion",
  "description": "This channel is where we debate all future architecture plans"
}
```

### Exemplo 2: Criar um canal privado em nome do utilizador

#### Solicitação

O exemplo seguinte mostra um pedido para criar um canal privado e adicionar um utilizador como proprietário da equipa.

- [HTTP](#tabpanel_2_http)
- [C#](#tabpanel_2_csharp)
- [Ir](#tabpanel_2_go)
- [Java](#tabpanel_2_java)
- [JavaScript](#tabpanel_2_javascript)
- [PHP](#tabpanel_2_php)
- [PowerShell](#tabpanel_2_powershell)
- [Python](#tabpanel_2_python)

```http
POST https://graph.microsoft.com/v1.0/teams/57fb72d0-d811-46f4-8947-305e6072eaa5/channels
Content-type: application/json

{
  "@odata.type": "#Microsoft.Graph.channel",
  "membershipType": "private",
  "displayName": "My First Private Channel",
  "description": "This is my first private channels",
  "members":
     [
        {
           "@odata.type":"#microsoft.graph.aadUserConversationMember",
           "user@odata.bind":"https://graph.microsoft.com/v1.0/users('62855810-484b-4823-9e01-60667f8b12ae')",
           "roles":["owner"]
        }
     ]
}
```

> **Nota:** Para adicionar uma conta de convidado ao canal, para a propriedade **funções**, utilize o valor `guest`.

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 201 Created
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#teams('57fb72d0-d811-46f4-8947-305e6072eaa5')/channels/$entity",
    "id": "19:33b76eea88574bd1969dca37e2b7a819@thread.skype",
    "displayName": "My First Private Channel",
    "description": "This is my first private channels",
    "isFavoriteByDefault": null,
    "email": "",
    "webUrl": "https://teams.microsoft.com/l/channel/19:33b76eea88574bd1969dca37e2b7a819@thread.skype/My%20First%20Private%20Channel?groupId=57fb72d0-d811-46f4-8947-305e6072eaa5&tenantId=0fddfdc5-f319-491f-a514-be1bc1bf9ddc",
    "membershipType": "private"
}
```

### Exemplo 3: Criar um canal com o tipo de esquema de chat

O exemplo seguinte mostra como criar um canal com o tipo de esquema de chat que fornece uma experiência de threading semelhante a um chat semelhante às conversas de grupo.

#### Solicitação

O exemplo seguinte mostra um pedido para criar um canal com **layoutType** definido como `chat`.

- [HTTP](#tabpanel_3_http)
- [C#](#tabpanel_3_csharp)
- [Ir](#tabpanel_3_go)
- [Java](#tabpanel_3_java)
- [JavaScript](#tabpanel_3_javascript)
- [PHP](#tabpanel_3_php)
- [PowerShell](#tabpanel_3_powershell)
- [Python](#tabpanel_3_python)

```http
POST https://graph.microsoft.com/v1.0/teams/57fb72d0-d811-46f4-8947-305e6072eaa5/channels
Content-type: application/json

{
  "displayName": "Project Collaboration",
  "description": "Discussion space for project team collaboration",
  "membershipType": "standard",
  "layoutType": "chat"
}
```

#### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 201 Created
Content-type: application/json

{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#teams('57fb72d0-d811-46f4-8947-305e6072eaa5')/channels/$entity",
  "id": "19:4b6bed8d24574f6a9e436813cb2617d8@thread.tacv2",
  "createdDateTime": "2024-12-08T12:30:45.123Z",
  "displayName": "Project Collaboration",
  "description": "Discussion space for project team collaboration",
  "membershipType": "standard",
  "layoutType": "chat",
  "isFavoriteByDefault": false,
  "email": "",
  "webUrl": "https://teams.microsoft.com/l/channel/19%3A4b6bed8d24574f6a9e436813cb2617d8%40thread.tacv2/Project%20Collaboration?groupId=57fb72d0-d811-46f4-8947-305e6072eaa5&tenantId=0afeb5d5-a667-4716-8fc7-733024389e91",
  "tenantId": "0afeb5d5-a667-4716-8fc7-733024389e91"
}
```

### Exemplo 4: Criar um canal no modo de migração

O exemplo seguinte mostra como criar um canal que é utilizado para importar mensagens.

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_4_http)
- [C#](#tabpanel_4_csharp)
- [Ir](#tabpanel_4_go)
- [Java](#tabpanel_4_java)
- [JavaScript](#tabpanel_4_javascript)
- [PHP](#tabpanel_4_php)
- [PowerShell](#tabpanel_4_powershell)
- [Python](#tabpanel_4_python)

```http
POST https://graph.microsoft.com/v1.0/teams/57fb72d0-d811-46f4-8947-305e6072eaa5/channels
Content-Type: application/json

{
  "@microsoft.graph.channelCreationMode": "migration",
  "displayName": "Import_150958_99z",
  "description": "Import_150958_99z",
  "createdDateTime": "2020-03-14T11:22:17.067Z"
}
```

#### Resposta

O exemplo a seguir mostra a resposta. O cabeçalho Content-Location na resposta especifica o caminho para o canal que está a ser aprovisionado. Uma vez aprovisionado, este canal pode ser utilizado para [importar mensagens](https://learn.microsoft.com/pt-br/microsoftteams/platform/graph-api/import-messages/import-external-messages-to-teams).

HTTP

```http
HTTP/1.1 201 Created
Location: /teams('57fb72d0-d811-46f4-8947-305e6072eaa5')/channels('19:4b6bed8d24574f6a9e436813cb2617d8@thread.tacv2')

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#teams('57fb72d0-d811-46f4-8947-305e6072eaa5')/channels/$entity",
    "id": "19:987c7a9fbe6447ccb3ea31bcded5c75c@thread.tacv2",
    "createdDateTime": null,
    "displayName": "Import_150958_99z",
    "description": "Import_150958_99z",
    "isFavoriteByDefault": null,
    "email": null,
    "webUrl": null,
    "membershipType": null,
    "moderationSettings": null
}
```

### Exemplo 5: Criar um canal privado em nome de um utilizador com o nome principal de utilizador

O exemplo seguinte mostra como criar um canal privado e adicionar um utilizador como proprietário da equipa.

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_5_http)
- [C#](#tabpanel_5_csharp)
- [Ir](#tabpanel_5_go)
- [Java](#tabpanel_5_java)
- [JavaScript](#tabpanel_5_javascript)
- [PHP](#tabpanel_5_php)
- [PowerShell](#tabpanel_5_powershell)
- [Python](#tabpanel_5_python)

```http
POST https://graph.microsoft.com/v1.0/teams/57fb72d0-d811-46f4-8947-305e6072eaa5/channels
Content-type: application/json

{
  "@odata.type": "#Microsoft.Graph.channel",
  "membershipType": "private",
  "displayName": "My First Private Channel",
  "description": "This is my first private channels",
  "members":
     [
        {
           "@odata.type":"#microsoft.graph.aadUserConversationMember",
           "user@odata.bind":"https://graph.microsoft.com/v1.0/users('jacob@contoso.com')",
           "roles":["owner"]
        }
     ]
}
```

> **Nota:** Para adicionar uma conta de convidado ao canal, para a propriedade **funções**, utilize o valor `guest`.

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 201 Created
Content-type: application/json

{
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#teams('57fb72d0-d811-46f4-8947-305e6072eaa5')/channels/$entity",
    "id": "19:33b76eea88574bd1969dca37e2b7a819@thread.skype",
    "displayName": "My First Private Channel",
    "description": "This is my first private channels",
    "isFavoriteByDefault": null,
    "email": "",
    "webUrl": "https://teams.microsoft.com/l/channel/19:33b76eea88574bd1969dca37e2b7a819@thread.skype/My%20First%20Private%20Channel?groupId=57fb72d0-d811-46f4-8947-305e6072eaa5&tenantId=0fddfdc5-f319-491f-a514-be1bc1bf9ddc",
    "membershipType": "private"
}
```

### Exemplo 6: Criar um canal partilhado em nome de um utilizador

O exemplo seguinte mostra como criar um canal partilhado.

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_6_http)
- [C#](#tabpanel_6_csharp)
- [Ir](#tabpanel_6_go)
- [Java](#tabpanel_6_java)
- [JavaScript](#tabpanel_6_javascript)
- [PHP](#tabpanel_6_php)
- [PowerShell](#tabpanel_6_powershell)
- [Python](#tabpanel_6_python)

```http
POST https://graph.microsoft.com/v1.0/teams/57fb72d0-d811-46f4-8947-305e6072eaa5/channels
Content-type: application/json

{
  "displayName": "My First Shared Channel",
  "description": "This is my first shared channel",
  "membershipType": "shared",
  "members": [
    {
      "@odata.type": "#microsoft.graph.aadUserConversationMember",
      "user@odata.bind": "https://graph.microsoft.com/v1.0/users('7640023f-fe43-573f-9ff4-84a9efe4acd6')",
      "roles": [
        "owner"
      ]
    }
  ]
}
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 202 Accepted
Content-Type: application/json
Content-Location: /teams/7640023f-fe43-4cc7-9bd3-84a9efe4acd6/operations/359d75f6-2bb8-4785-ab2d-377bf3d573fa
Content-Length: 0
```

### Exemplo 7: Criar um canal partilhado partilhado com a equipa anfitriã

#### Solicitação

O exemplo seguinte mostra como criar um canal partilhado partilhado com a equipa anfitriã.

HTTP

```http
POST https://graph.microsoft.com/v1.0/teams/57fb72d0-d811-46f4-8947-305e6072eaa5/channels
Content-type: application/json

{
  "displayName": "My First Shared Channel",
  "description": "This is my first shared channel",
  "membershipType": "shared",
  "members": [
    {
      "@odata.type": "#microsoft.graph.aadUserConversationMember",
      "user@odata.bind": "https://graph.microsoft.com/v1.0/users('7640023f-fe43-573f-9ff4-84a9efe4acd6')",
      "roles": [
        "owner"
      ]
    }
  ],
  "sharedWithTeams":[
    {
      "id": "57fb72d0-d811-46f4-8947-305e6072eaa5"
    }
  ]
}
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 202 Accepted
Content-Type: application/json
Content-Location: /teams/7640023f-fe43-4cc7-9bd3-84a9efe4acd6/operations/359d75f6-2bb8-4785-ab2d-377bf3d573fa
Content-Length: 0
```

## Conteúdo relacionado

[Limites de limitação específicos do serviço do Microsoft Graph](https://learn.microsoft.com/pt-br/graph/throttling-limits#microsoft-teams-service-limits)