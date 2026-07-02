---
title: "Obter chat entre o utilizador e o teamsApp - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/userscopeteamsappinstallation-get-chat?view=graph-rest-1.0&tabs=http"
author:
  - "[[AkJo]]"
published:
created: 2026-06-30
description: "Obtenha uma conversa individual entre o utilizador especificado e a aplicação Teams."
tags:
  - "clippings"
---
## Obter chat entre o utilizador e o teamsApp

Namespace: microsoft.graph

Obtenha o [chat](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) do [utilizador](https://learn.microsoft.com/pt-br/graph/api/resources/user?view=graph-rest-1.0) especificado e da [aplicação Teams](https://learn.microsoft.com/pt-br/graph/api/resources/teamsapp?view=graph-rest-1.0).

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | TeamsAppInstallation.ReadForUser | TeamsAppInstallation.ReadWriteForUser, TeamsAppInstallation.ReadWriteSelectedForUser, TeamsAppInstallation.ReadWriteSelfForUser |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | TeamsAppInstallation.ReadForUser.All | TeamsAppInstallation.Read.All, TeamsAppInstallation.Read.User, TeamsAppInstallation.ReadWriteForUser.All, TeamsAppInstallation.ReadWriteSelectedForUser.All, TeamsAppInstallation.ReadWriteSelfForUser.All |

## Solicitação HTTP

HTTP

```http
GET /users/{user-id | user-principal-name}/teamwork/installedApps/{app-installation-id}/chat
```

## Parâmetros de consulta opcionais

Este método suporta o `$select` [parâmetro de consulta OData](https://learn.microsoft.com/pt-br/graph/query-parameters) para ajudar a personalizar a resposta.

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se for bem-sucedido, este método devolve um `200 OK` código de resposta e uma instância de objeto de [chat](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) no corpo da resposta.

## Exemplos

### Solicitação

O exemplo seguinte mostra um pedido que lista conversas um-para-um entre o utilizador especificado e a aplicação Teams.

- [HTTP](#tabpanel_1_http)
- [C#](#tabpanel_1_csharp)
- [Ir](#tabpanel_1_go)
- [Java](#tabpanel_1_java)
- [JavaScript](#tabpanel_1_javascript)
- [PHP](#tabpanel_1_php)
- [PowerShell](#tabpanel_1_powershell)
- [Python](#tabpanel_1_python)

```msgraph
GET https://graph.microsoft.com/v1.0/users/f32b83bb-4fc8-4db7-b7f5-76cdbbb8aa1c/teamwork/installedApps/ZjMyYjgzYmItNGZjOC00ZGI3LWI3ZjUtNzZjZGJiYjhhYTFjIyMyMmY3M2JiZS1mNjdhLTRkZWEtYmQ1NC01NGNhYzcxOGNiMmI=/chat
```

### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
   "@odata.context":"https://graph.microsoft.com/v1.0/$metadata#chats/$entity",
   "id":"19:0de69e5e-2da8-4cf2-821f-5e6585b2c65b_f32b83bb-4fc8-4db7-b7f5-76cdbbb8aa1c@unq.gbl.spaces"
}
```

## Conteúdo relacionado

[Limites de limitação específicos do serviço do Microsoft Graph](https://learn.microsoft.com/pt-br/graph/throttling-limits#microsoft-teams-service-limits)