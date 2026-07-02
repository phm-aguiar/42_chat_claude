---
title: "canal: doesUserHaveAccess - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-doesuserhaveaccess?view=graph-rest-1.0&tabs=http"
author:
  - "[[devjha-ms]]"
published:
created: 2026-06-30
description: "Determinar se um utilizador tem acesso a um canal."
tags:
  - "clippings"
---
## canal: doesUserHaveAccess

Namespace: microsoft.graph

Determinar se um [utilizador](https://learn.microsoft.com/pt-br/graph/api/resources/useridentity?view=graph-rest-1.0) tem acesso a um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0).

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | ChannelMember.Read.All | ChannelMember.ReadWrite.All |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Aplicativo | ChannelMember.Read.All | ChannelMember.ReadWrite.All |

## Solicitação HTTP

HTTP

```http
GET /teams/{team-id}/channels/{channel-id}/doesUserHaveAccess(userId='@userId',tenantId='@tenantId',userPrincipalName='@userPrincipalName')
```

## Parâmetros de função

Na URL da solicitação, forneça os seguintes parâmetros de consulta com valores. A tabela a seguir mostra os parâmetros que podem ser usados com esta função.

| Parâmetro | Tipo | Descrição |
| --- | --- | --- |
| tenantId | String | O ID do inquilino Microsoft Entra ao [qual o utilizador](https://learn.microsoft.com/pt-br/graph/api/resources/useridentity?view=graph-rest-1.0) pertence. O valor predefinido para esta propriedade é o **tenantId** atual do utilizador ou aplicação com sessão iniciada. |
| userId | Cadeia de caracteres | Identificador exclusivo do [utilizador](https://learn.microsoft.com/pt-br/graph/api/resources/useridentity?view=graph-rest-1.0). Especifique o **userId** ou a propriedade **userPrincipalName** no pedido. |
| userPrincipalName | Cadeia de caracteres | O nome principal de utilizador (UPN) do [utilizador](https://learn.microsoft.com/pt-br/graph/api/resources/useridentity?view=graph-rest-1.0). Especifique o **userId** ou a propriedade **userPrincipalName** no pedido. |

## Cabeçalhos de solicitação

| Nome | Descrição |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo do pedido para esta função.

## Resposta

Se tiver êxito, essa função retornará o código resposta `200 OK` e um Booliano no corpo da resposta.

## Exemplos

### Exemplo 1: Verificar o acesso de um utilizador interno

O exemplo seguinte mostra um pedido que verifica se um utilizador interno tem acesso a um canal.

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_1_http)
- [C#](#tabpanel_1_csharp)
- [Ir](#tabpanel_1_go)
- [JavaScript](#tabpanel_1_javascript)
- [PowerShell](#tabpanel_1_powershell)

```http
GET https://graph.microsoft.com/v1.0/teams/0fddfdc5-f319-491f-a514-be1bc1bf9ddc/channels/19:33b76eea88574bd1969dca37e2b7a819@thread.skype/doesUserHaveAccess(userId='6285581f-484b-4845-9e01-60667f8b12ae')
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "value": true
}
```

### Exemplo 2: Verificar o acesso de um utilizador externo

O exemplo seguinte mostra um pedido que utiliza a propriedade **tenantId** para marcar se um utilizador externo tem acesso a um canal partilhado.

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_2_http)
- [C#](#tabpanel_2_csharp)
- [Ir](#tabpanel_2_go)
- [JavaScript](#tabpanel_2_javascript)
- [PowerShell](#tabpanel_2_powershell)

```http
GET https://graph.microsoft.com/v1.0/teams/0fddfdc5-f319-491f-a514-be1bc1bf9ddc/channels/19:33b76eea88574bd1969dca37e2b7a819@thread.skype/doesUserHaveAccess(userId='62855810-484b-4823-9e01-60667f8b12ae', tenantId='57fb72d0-d811-46f4-8947-305e6072eaa5')
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "value": true
}
```

### Exemplo 3: Verificar o acesso do utilizador a um utilizador com o nome principal de utilizador

O exemplo seguinte mostra um pedido que utiliza a propriedade **userPrincipalName** para marcar se um utilizador interno tem acesso a um canal.

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_3_http)
- [C#](#tabpanel_3_csharp)
- [Ir](#tabpanel_3_go)
- [JavaScript](#tabpanel_3_javascript)
- [PowerShell](#tabpanel_3_powershell)

```http
GET https://graph.microsoft.com/v1.0/teams/0fddfdc5-f319-491f-a514-be1bc1bf9ddc/channels/19:33b76eea88574bd1969dca37e2b7a819@thread.skype/doesUserHaveAccess(userPrincipalName='john.doe@contoso.com')
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "value": false
}
```