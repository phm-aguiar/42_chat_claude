---
title: "Atualizar membro no canal - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-update-members?view=graph-rest-1.0&tabs=http"
author:
  - "[[AkJo]]"
published:
created: 2026-06-30
description: "Atualizar a função de membro num canal."
tags:
  - "clippings"
---
## Atualizar membro no canal

Namespace: microsoft.graph

Atualizar a função de uma [conversaçãoMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) num [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0). Esta operação só é permitida para canais com um valor **membershipType** de `private` ou `shared`.

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | ChannelMember.ReadWrite.All | Directory.ReadWrite.All, Group.ReadWrite.All |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Application | ChannelMember.ReadWrite.Group | ChannelMember.ReadWrite.All, Directory.ReadWrite.All, Group.ReadWrite.All |

## Solicitação HTTP

HTTP

```http
PATCH /teams/{team-id}/channels/{channel-id}/members/{membership-id}
```

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |
| Content-type | application/json. Obrigatório. |

## Corpo da solicitação

No corpo do pedido, forneça os valores para que os campos relevantes atualizem. Propriedades existentes que não estão incluídas no corpo da solicitação terão seus valores anteriores mantidos ou serão recalculadas com base nas alterações a outros valores de propriedade. Para alcançar o melhor desempenho, não inclua valores existentes que não foram alterados.

| Propriedade | Tipo | Descrição |
| --- | --- | --- |
| funções | coleção de cadeias de caracteres | A função para o utilizador. Tem de estar `owner` ou estar vazio. Os utilizadores convidados são carimbados automaticamente com `guest` a função e este valor não pode ser atualizado. |

## Resposta

Se for bem-sucedido, este método devolve um `200 OK` código de resposta e um objeto [conversationMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) atualizado no corpo da resposta.

## Exemplo

### Solicitação

Segue-se um pedido para aplicar a `owner` função a um membro existente de um canal.

- [HTTP](#tabpanel_1_http)
- [C#](#tabpanel_1_csharp)
- [Ir](#tabpanel_1_go)
- [Java](#tabpanel_1_java)
- [JavaScript](#tabpanel_1_javascript)
- [PHP](#tabpanel_1_php)
- [Python](#tabpanel_1_python)

```http
PATCH https://graph.microsoft.com/v1.0/teams/ece6f0a1-7ca4-498b-be79-edf6c8fc4d82/channels/19%3A56eb04e133944cf69e603c5dac2d292e%40thread.skype/members/ZWUwZjVhZTItOGJjNi00YWU1LTg0NjYtN2RhZWViYmZhMDYyIyM3Mzc2MWYwNi0yYWM5LTQ2OWMtOWYxMC0yNzlhOGNjMjY3Zjk=
content-type: application/json
content-length: 26

{
  "@odata.type":"#microsoft.graph.aadUserConversationMember",
  "roles": ["owner"]
}
```

### Resposta

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#teams('ece6f0a1-7ca4-498b-be79-edf6c8fc4d82')/channels('19%3A56eb04e133944cf69e603c5dac2d292e%40thread.skype')/members/microsoft.graph.aadUserConversationMember/$entity",
  "@odata.type": "#microsoft.graph.aadUserConversationMember",
  "id": "ZWUwZjVhZTItOGJjNi00YWU1LTg0NjYtN2RhZWViYmZhMDYyIyM3Mzc2MWYwNi0yYWM5LTQ2OWMtOWYxMC0yNzlhOGNjMjY3Zjk=",
  "roles": ["owner"],
  "displayName": "John Doe",
  "userId": "8b081ef6-4792-4def-b2c9-c363a1bf41d5",
  "email": null,
  "tenantId": "f2eea028-3898-4e55-b611-2e2d960f7512"
}
```

## Conteúdo relacionado

- [Atualizar a função do membro numa equipa](https://learn.microsoft.com/pt-br/graph/api/team-update-members?view=graph-rest-1.0)