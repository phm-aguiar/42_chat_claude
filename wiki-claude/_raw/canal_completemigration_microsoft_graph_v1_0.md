---
title: "canal: completeMigration - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-completemigration?view=graph-rest-1.0&tabs=http"
author:
  - "[[RamjotSingh]]"
published:
created: 2026-06-30
description: "Concluir a migração em canais existentes ou em novos canais."
tags:
  - "clippings"
---
## canal: completeMigration

Namespace: microsoft.graph

Concluir a migração em [canais existentes](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) ou em novos canais. As operações de migração completas foram inicialmente restringidas a canais padrão recentemente criados através de modelos de migração especificamente concebidos para o processo de migração inicial. Para obter mais informações, consulte [Importar mensagens de plataforma de terceiros para o Teams com o Microsoft Graph](https://learn.microsoft.com/pt-br/microsoftteams/platform/graph-api/import-messages/import-external-messages-to-teams).

Considere os seguintes pontos ao concluir a migração para canais novos e existentes:

- Quando um canal é criado no modo de migração para o fluxo de importação inicial, a propriedade **migrationMode** de um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) numa equipa é atualizada para `completed`, em vez de ser removida, e o estado é marcado permanentemente para conversas ou canais. O modo de migração é um estado especial que impediu determinadas operações, como o envio de mensagens e a adição de membros, durante o processo de migração de dados. O equipe principal não está marcado com o modo de migração, uma vez que as equipas não podem entrar no modo de migração; apenas os canais subordinados (geral, padrão, privado e partilhado) podem.
- Para canais *existentes* que já estão no modo de migração, a API conclui o processo de migração de mensagens ao atualizar **migrationMode** para `completed` para um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) numa equipa.
- A aplicação que chama **completeMigration** tem de ser a mesma aplicação que iniciou a sessão de migração ao chamar [startMigration](https://learn.microsoft.com/pt-br/graph/api/channel-startmigration?view=graph-rest-1.0) no canal de destino. Esta é a mesma aplicação que tem permissão para chamar [a mensagem de importação](https://learn.microsoft.com/pt-br/graph/api/channel-post-messages?view=graph-rest-1.0#example-2-import-a-message) durante a sessão de migração.
- Chamar **completeMigration** remove a faixa do modo de importação visível para os utilizadores cliente do Teams, tornando o canal totalmente disponível novamente.

Depois de **efetuar um pedido completeMigration** para canais existentes ou novos, ainda pode importar mais mensagens para a equipa ao chamar o [canal: startMigration](https://learn.microsoft.com/pt-br/graph/api/channel-startmigration?view=graph-rest-1.0).

Esta API suporta os seguintes tipos de canal.

| Entidades | Subtipo | Suporte para o modo de migração | Observações |
| --- | --- | --- | --- |
| Canais | Standard, Privado, Partilhado | Novo e existente | Os canais têm de ser criados ou já estar no modo de migração. |

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | Sem suporte. | Sem suporte. |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Aplicativo | Teamwork.Migrate.All | Indisponível. |

## Solicitação HTTP

HTTP

```http
POST /teams/{team-id}/channels/{channel-id}/completeMigration
```

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se tiver êxito, este método retornará um código de resposta `204 No Content`. Não devolve nada no corpo da resposta.

## Exemplos

### Exemplo 1: Concluir a migração quando um canal estiver no modo de migração

O exemplo seguinte mostra como concluir a migração quando um canal está no modo de migração.

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
POST https://graph.microsoft.com/v1.0/teams/57fb72d0-d811-46f4-8947-305e6072eaa5/channels/19:4b6bed8d24574f6a9e436813cb2617d8@thread.tacv2/completeMigration
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 204 No Content
```

### Exemplo 2: Concluir a migração quando um canal não estiver no modo de migração

O exemplo seguinte mostra como concluir a migração quando um canal não está no modo de migração. Este pedido falha com uma `400 Bad Request` resposta.

#### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_2_http)
- [C#](#tabpanel_2_csharp)
- [Ir](#tabpanel_2_go)
- [Java](#tabpanel_2_java)
- [JavaScript](#tabpanel_2_javascript)
- [PHP](#tabpanel_2_php)
- [PowerShell](#tabpanel_2_powershell)
- [Python](#tabpanel_2_python)

```msgraph
POST https://graph.microsoft.com/v1.0/teams/57fb72d0-d811-46f4-8947-305e6072eaa5/channels/19:4b6bed8d24574f6a9e436813cb2617d8@thread.tacv2/completeMigration
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 400 Bad Request
```

## Conteúdo relacionado

- [canal: startMigration](https://learn.microsoft.com/pt-br/graph/api/channel-startmigration?view=graph-rest-1.0)
- [importMessage](https://learn.microsoft.com/pt-br/graph/api/channel-post-messages?view=graph-rest-1.0#example-2-import-a-message)
- [Obter status de migração de canais](https://learn.microsoft.com/pt-br/graph/api/channel-get?view=graph-rest-1.0#example-1-get-a-channel).
- [chat: completeMigration](https://learn.microsoft.com/pt-br/graph/api/chat-completemigration?view=graph-rest-1.0)
- [chat: startMigration](https://learn.microsoft.com/pt-br/graph/api/chat-startmigration?view=graph-rest-1.0)