---
title: "canal: startMigration - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-startmigration?view=graph-rest-1.0&tabs=http"
author:
  - "[[mehakagarwal]]"
published:
created: 2026-06-30
description: "Inicie a migração de mensagens externas ao ativar o modo de migração num canal existente."
tags:
  - "clippings"
---
## canal: startMigration

Namespace: microsoft.graph

Inicie a migração de mensagens externas ao ativar o modo de migração num [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) existente. As operações de importação limitavam-se aos canais padrão recentemente criados que estavam num estado vazio. Para obter mais informações, consulte [Importar mensagens de plataforma de terceiros para o Teams com o Microsoft Graph](https://learn.microsoft.com/pt-br/microsoftteams/platform/graph-api/import-messages/import-external-messages-to-teams).

Os utilizadores também podem definir um carimbo de data/hora mínimo para o conteúdo a ser migrado, permitindo-lhes importar mensagens do passado. O carimbo de data/hora fornecido tem de ser mais antigo do que o **createdDateTime** atual para um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0). O carimbo de data/hora fornecido é utilizado para substituir o **createdDateTime** existente do [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0).

Esta API suporta os seguintes tipos de canal.

| Entidades | Subtipo | Suporte para o modo de migração | Observações |
| --- | --- | --- | --- |
| Canais | Standard, Privado, Partilhado | Novo e existente | Os canais têm de ser criados ou já estar no modo de migração. |

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ❌ | ❌ | ❌ |

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
POST /teams/{team-id}/channels/{channel-id}/startMigration
```

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |
| Content-Type | application/json. Opcional |

## Corpo da solicitação

No corpo do pedido, forneça uma representação JSON dos seguintes parâmetros.

| Parâmetro | Tipo | Descrição |
| --- | --- | --- |
| conversationCreationDateTime | DateTimeOffset | O carimbo de data/hora mínimo para as mensagens a serem migradas. O carimbo de data/hora tem de ser mais antigo do que o **createdDateTime** atual do canal. Se não for fornecido, é utilizada a data e hora atuais. |

## Resposta

Se tiver êxito, este método retornará um código de resposta `204 No Content`. Não devolve nada no corpo da resposta.

## Exemplos

### Exemplo 1: Iniciar a migração num canal existente com um carimbo de data/hora específico

O exemplo seguinte mostra como iniciar a migração num canal existente com um carimbo de data/hora específico.

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
POST https://graph.microsoft.com/v1.0/teams/57fb72d0-d811-46f4-8947-305e6072eaa5/channels/19:4b6bed8d24574f6a9e436813cb2617d8@thread.tacv2/startMigration
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 204 No Content
```

### Exemplo 2: Iniciar a migração quando um canal já estiver no modo de migração

O exemplo seguinte mostra como iniciar a migração quando um canal já está no modo de migração. Este pedido falha com uma `400 Bad Request` resposta.

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
POST https://graph.microsoft.com/v1.0/teams/57fb72d0-d811-46f4-8947-305e6072eaa5/channels/19:4b6bed8d24574f6a9e436813cb2617d8@thread.tacv2/startMigration
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 400 Bad Request
```

## Conteúdo relacionado

- [canal: completeMigration](https://learn.microsoft.com/pt-br/graph/api/channel-completemigration?view=graph-rest-1.0)
- [Importar uma mensagem](https://learn.microsoft.com/pt-br/graph/api/channel-post-messages?view=graph-rest-1.0#example-2-import-a-message).
- [Obter status de migração de canais](https://learn.microsoft.com/pt-br/graph/api/channel-get?view=graph-rest-1.0#example-1-get-a-channel).
- [chat: completeMigration](https://learn.microsoft.com/pt-br/graph/api/chat-completemigration?view=graph-rest-1.0)
- [chat: startMigration](https://learn.microsoft.com/pt-br/graph/api/chat-startmigration?view=graph-rest-1.0)