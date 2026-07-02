---
title: "chat: completeMigration - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/chat-completemigration?view=graph-rest-1.0&tabs=http"
author:
  - "[[mehakagarwal]]"
published:
created: 2026-06-30
description: "Conclua a migração de mensagens externas ao remover o modo de migração de um chat."
tags:
  - "clippings"
---
## chat: completeMigration

Namespace: microsoft.graph

Conclua a migração de mensagens externas ao remover o modo de migração de um [chat](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0). As operações de migração completas foram inicialmente restringidas a canais padrão recentemente criados através de modelos de migração especificamente concebidos para o processo de migração inicial. Para obter mais informações, consulte [Importar mensagens de plataforma de terceiros para o Teams com o Microsoft Graph](https://learn.microsoft.com/pt-br/microsoftteams/platform/graph-api/import-messages/import-external-messages-to-teams).

Depois de um pedido **completeMigration** ser feito para uma conversa existente ou nova, pode iniciar uma sessão de migração ao chamar [chat: startMigration](https://learn.microsoft.com/pt-br/graph/api/chat-startmigration?view=graph-rest-1.0).

Esta API suporta os seguintes tipos de canal.

| Entidades | Subtipo | Suporte para o modo de migração | Observações |
| --- | --- | --- | --- |
| Chats | Grupo, 1:1 | Novo e existente | As conversas de reunião não são suportadas. Os membros externos são suportados. |

> **Observações**:
> 
> - Os tipos de chat não são permitidos nas importações iniciais.
> - As conversas federadas são suportadas, mas os utilizadores não podem criar recursos federados. Por exemplo, não podem importar mensagens em nome de um utilizador federado e o chat de destino tem de pertencer ao inquilino da aplicação iniciador. Os utilizadores só podem importar conteúdo para o inquilino para o qual são autenticados.

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
POST /chats/{chat-id}/completeMigration
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

### Exemplo 1: Concluir a migração de mensagens externas numa conversa

O exemplo seguinte mostra como concluir a migração de mensagens externas numa conversa.

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
POST https://graph.microsoft.com/v1.0/chats/19:4b6bed8d24574f6a9e436813cb2617d8@thread.tacv2/completeMigration
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 204 No Content
```

### Exemplo 2: Concluir a migração quando uma conversa já estiver no modo de migração

O exemplo seguinte mostra como concluir a migração quando um chat já está no modo de migração. Este pedido falha com uma `400 Bad Request` resposta.

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
POST https://graph.microsoft.com/v1.0/chats/19:4b6bed8d24574f6a9e436813cb2617d8@thread.tacv2/completeMigration
```

#### Resposta

O exemplo a seguir mostra a resposta.

HTTP

```http
HTTP/1.1 400 Bad Request
```

## Conteúdo relacionado

- [chat: startMigration](https://learn.microsoft.com/pt-br/graph/api/chat-startmigration?view=graph-rest-1.0)
- [Importar uma mensagem](https://learn.microsoft.com/pt-br/graph/api/chat-post-messages?view=graph-rest-1.0#example-2-import-a-message)
- [Obter status de importação de mensagens](https://learn.microsoft.com/pt-br/graph/api/chatmessage-get?view=graph-rest-1.0)
- [canal: completeMigration](https://learn.microsoft.com/pt-br/graph/api/channel-completemigration?view=graph-rest-1.0)
- [canal: startMigration](https://learn.microsoft.com/pt-br/graph/api/channel-startmigration?view=graph-rest-1.0)