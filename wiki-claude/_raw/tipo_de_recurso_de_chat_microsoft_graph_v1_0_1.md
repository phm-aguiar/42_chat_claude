---
title: "tipo de recurso de chat - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0"
author:
  - "[[RamjotSingh]]"
published:
created: 2026-06-30
description: "Uma conversa é uma coleção de chatMessages entre um ou mais participantes."
tags:
  - "clippings"
---
## tipo de recurso de chat

Namespace: microsoft.graph

Uma conversa é uma coleção de [chatMessages](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) entre um ou mais participantes. Os participantes podem ser utilizadores ou aplicações.

> **Nota**: se o chat estiver associado a uma instância [onlineMeeting](https://learn.microsoft.com/pt-br/graph/api/resources/onlinemeeting?view=graph-rest-1.0), alguns dos métodos listados afetarão transitivamente a reunião.

## Métodos

| Método | Tipo de retorno | Descrição |
| --- | --- | --- |
| **Gestão de conversas** |  |  |
| [List](https://learn.microsoft.com/pt-br/graph/api/chat-list?view=graph-rest-1.0) | coleção [de chat](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) | Obtenha a lista de conversas de que um utilizador faz parte. |
| [Create](https://learn.microsoft.com/pt-br/graph/api/chat-post?view=graph-rest-1.0) | [chat](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) | Crie uma nova conversa. |
| [Get](https://learn.microsoft.com/pt-br/graph/api/chat-get?view=graph-rest-1.0) | [chat](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) | Leia as propriedades e relações do chat. |
| [Atualizar](https://learn.microsoft.com/pt-br/graph/api/chat-patch?view=graph-rest-1.0) | [chat](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) | Atualize as propriedades do chat. |
| [Delete](https://learn.microsoft.com/pt-br/graph/api/chat-delete?view=graph-rest-1.0) | Nenhum | Eliminar uma conversa. |
| [Listar membros](https://learn.microsoft.com/pt-br/graph/api/chat-list-members?view=graph-rest-1.0) | coleção [conversationMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) | Ver a lista de todos os usuários no bate-papo. |
| [Adicionar membro](https://learn.microsoft.com/pt-br/graph/api/chat-post-members?view=graph-rest-1.0) | Cabeçalho location | Adicione um utilizador ao chat. |
| [Obter membro](https://learn.microsoft.com/pt-br/graph/api/chat-get-members?view=graph-rest-1.0) | [conversationMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) | Obter um único usuário no bate-papo. |
| [Remover membro](https://learn.microsoft.com/pt-br/graph/api/chat-delete-members?view=graph-rest-1.0) | Nenhum | Remova um utilizador da conversa. |
| [Obter chat entre o usuário e o aplicativo](https://learn.microsoft.com/pt-br/graph/api/userscopeteamsappinstallation-get-chat?view=graph-rest-1.0) | [chat](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) | Obter uma conversa individual entre o utilizador e a aplicação |
| [Remover todo o acesso do utilizador](https://learn.microsoft.com/pt-br/graph/api/chat-removeallaccessforuser?view=graph-rest-1.0) | Nenhum | Remova o acesso a uma conversa para um utilizador. |
| [Iniciar migração](https://learn.microsoft.com/pt-br/graph/api/chat-startmigration?view=graph-rest-1.0) | [chat](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) | Inicie a migração de mensagens externas ao ativar o modo de migração num [chat](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) existente. |
| [Migração completa](https://learn.microsoft.com/pt-br/graph/api/chat-completemigration?view=graph-rest-1.0) | [chat](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) | Conclua a migração de mensagens externas ao remover o modo de migração de um [chat](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0). |
| **Mensagens** |  |  |
| [Listar mensagens em um bate-papo](https://learn.microsoft.com/pt-br/graph/api/chat-list-messages?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) | Obter mensagens numa conversa. |
| [Obter resposta da mensagem](https://learn.microsoft.com/pt-br/graph/api/chatmessage-get?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) | Receba uma única mensagem em um bate-papo. |
| [Obter mensagens em todas as conversas](https://learn.microsoft.com/pt-br/graph/api/chats-getallmessages?view=graph-rest-1.0) | coleção [de chat](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) | Obter mensagens de todos os chats nos quais um usuário é um participante. |
| [Obter mensagens retidas em todas as conversas](https://learn.microsoft.com/pt-br/graph/api/chat-getallretainedmessages?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) collection | Obtenha todas as [mensagens](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) [retidas](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) de todas as conversas nas quais um utilizador participa, incluindo conversas um-para-um, conversas de grupo e conversas de reunião. |
| [Obter mensagens de chat delta para o utilizador](https://learn.microsoft.com/pt-br/graph/api/chatmessage-delta?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) collection | Obtenha a lista de [mensagens](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) de todas as [conversas](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) nas quais um utilizador é participante, incluindo conversas um-para-um, conversas de grupo e conversas de reunião. |
| **Aplicativos** |  |  |
| [Listar aplicativos no chat](https://learn.microsoft.com/pt-br/graph/api/chat-list-installedapps?view=graph-rest-1.0) | Coleção [teamsAppInstallation](https://learn.microsoft.com/pt-br/graph/api/resources/teamsappinstallation?view=graph-rest-1.0) | Listar aplicações instaladas num chat (e reunião associada). |
| [Instalar a aplicação no chat](https://learn.microsoft.com/pt-br/graph/api/chat-get-installedapps?view=graph-rest-1.0) | [teamsAppInstallation](https://learn.microsoft.com/pt-br/graph/api/resources/teamsappinstallation?view=graph-rest-1.0) | Instale uma aplicação específica numa conversa (e reunião associada). |
| [Adicionar aplicação no chat](https://learn.microsoft.com/pt-br/graph/api/chat-post-installedapps?view=graph-rest-1.0) |  | Adicionar (instalar) uma aplicação numa conversa (e reunião associada). |
| [Atualizar aplicativo instalado no chat](https://learn.microsoft.com/pt-br/graph/api/chat-teamsappinstallation-upgrade?view=graph-rest-1.0) | Nenhum | Atualize para a versão mais recente da aplicação instalada no chat (e reunião associada). |
| [Remover a aplicação do chat](https://learn.microsoft.com/pt-br/graph/api/chat-delete-installedapps?view=graph-rest-1.0) | Nenhum | Remover (desinstalar) a aplicação de uma conversa (e reunião associada). |
| [Listar as concessões de permissões](https://learn.microsoft.com/pt-br/graph/api/chat-list-permissiongrants?view=graph-rest-1.0) | Coleção [resourceSpecificPermissionGrant](https://learn.microsoft.com/pt-br/graph/api/resources/resourcespecificpermissiongrant?view=graph-rest-1.0) | Liste as permissões concedidas às aplicações neste chat. |
| **Guias** |  |  |
| [Listar separadores no chat](https://learn.microsoft.com/pt-br/graph/api/chat-list-tabs?view=graph-rest-1.0) | [teamsTab](https://learn.microsoft.com/pt-br/graph/api/resources/teamstab?view=graph-rest-1.0) | Separadores de lista afixados a uma conversa (e reunião associada). |
| [Obter o separador no chat](https://learn.microsoft.com/pt-br/graph/api/chat-get-tabs?view=graph-rest-1.0) | [teamsTab](https://learn.microsoft.com/pt-br/graph/api/resources/teamstab?view=graph-rest-1.0) | Obter um separador específico afixado a uma conversa (e reunião associada). |
| [Adicionar separador ao chat](https://learn.microsoft.com/pt-br/graph/api/chat-post-tabs?view=graph-rest-1.0) | [teamsTab](https://learn.microsoft.com/pt-br/graph/api/resources/teamstab?view=graph-rest-1.0) | Adicione (afixe) um separador a uma conversa (e reunião associada). |
| [Separador Atualizar no chat](https://learn.microsoft.com/pt-br/graph/api/chat-patch-tabs?view=graph-rest-1.0) | [teamsTab](https://learn.microsoft.com/pt-br/graph/api/resources/teamstab?view=graph-rest-1.0) | Atualize as propriedades de um separador numa conversa (e reunião associada). |
| [Remover separador do chat](https://learn.microsoft.com/pt-br/graph/api/chat-delete-tabs?view=graph-rest-1.0) | Nenhum | Remover (remover) um separador de uma conversa (e reunião associada). |
| **Mensagens afixadas** |  |  |
| [Listar mensagens afixadas](https://learn.microsoft.com/pt-br/graph/api/chat-list-pinnedmessages?view=graph-rest-1.0) | [pinnedChatMessageInfo](https://learn.microsoft.com/pt-br/graph/api/resources/pinnedchatmessageinfo?view=graph-rest-1.0) collection | Obtenha uma lista de mensagens afixadas numa conversa. |
| [Afixar mensagem](https://learn.microsoft.com/pt-br/graph/api/chat-post-pinnedmessages?view=graph-rest-1.0) | [pinnedChatMessageInfo](https://learn.microsoft.com/pt-br/graph/api/resources/pinnedchatmessageinfo?view=graph-rest-1.0) | Afixe uma mensagem de chat numa conversa. |
| [Remover mensagem](https://learn.microsoft.com/pt-br/graph/api/chat-delete-pinnedmessages?view=graph-rest-1.0) | Nenhum | Remover uma mensagem de uma conversa. |

> **Nota:** Ao utilizar permissões de aplicação, certifique-se de que sabe como obter o ID de chat. Uma vez que a listagem de conversas com permissões de aplicação não é suportada, nem todos os cenários são possíveis. É possível obter IDs de chat com permissões delegadas e [de notificações de alteração para /chats/getAllMessages](https://learn.microsoft.com/pt-br/graph/api/subscription-post-subscriptions?view=graph-rest-1.0) com permissões de aplicação.

## Propriedades

| Propriedade | Tipo | Descrição |
| --- | --- | --- |
| chatType | [chatType](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0#chattype-values) | Especifica o tipo de chat. Os valores possíveis são: `group`, `oneOnOne`, `meeting`, `unknownFutureValue`. |
| createdDateTime | dateTimeOffset | Data e hora em que a conversa foi criada. Somente leitura. |
| id | Cadeia de caracteres | O identificador exclusivo do chat. Somente leitura. |
| isHiddenForAllMembers | Booliano | Indica se a conversa está oculta para todos os respetivos membros. Somente leitura. |
| lastUpdatedDateTime | dateTimeOffset | Data e hora em que o nome da conversa foi mudado ou a lista de membros foi alterada pela última vez. Somente leitura. |
| migrationMode | [migrationMode](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0#migrationmode-values) | Indica se uma conversa está no modo de migração. Este valor destina-se `null` a conversas que nunca entraram no modo de migração. Os valores possíveis são: `inProgress`, `completed`, `unknownFutureValue`. |
| onlineMeetingInfo | [teamworkOnlineMeetingInfo](https://learn.microsoft.com/pt-br/graph/api/resources/teamworkonlinemeetinginfo?view=graph-rest-1.0) | Representa detalhes sobre uma reunião online. Se o chat não estiver associado a uma reunião online, a propriedade estará vazia. Somente leitura. |
| originalCreatedDateTime | dateTimeOffset | Carimbo de data/hora da hora de criação original do chat. O valor é `null` se o chat nunca tiver entrado no modo de migração. |
| tenantId | String | O identificador do inquilino no qual a conversa foi criada. Somente leitura. |
| topic | Cadeia de caracteres | (Opcional) Assunto ou tópico do chat. Apenas disponível para conversas de grupo. |
| ponto de vista | [chatViewpoint](https://learn.microsoft.com/pt-br/graph/api/resources/chatviewpoint?view=graph-rest-1.0) | Representa informações específicas do autor da chamada sobre o chat, como a data e hora de leitura da última mensagem. Esta propriedade só é preenchida quando o pedido é feito num contexto delegado. |
| webUrl | String | O URL do chat no Microsoft Teams. O URL deve ser tratado como um blob opaco e não analisado. Somente leitura. |

### valores de chatType

| Member | Descrição |
| --- | --- |
| oneOnOne | Indica que o chat é uma conversa de 1:1. O tamanho da lista é fixo para este tipo de chat; os membros não podem ser removidos/adicionados. |
| group | Indica que o chat é uma conversa de grupo. O tamanho da lista (de, pelo menos, duas pessoas) pode ser atualizado para este tipo de chat. Os membros podem ser removidos/adicionados mais tarde. |
| reunião | Indica que o chat está associado a uma reunião online. Este tipo de chat só é criado como parte da criação de uma reunião online. |
| unknownFutureValue | Valor da sentinela de enumeração evoluível. Não usar. |

## Relações

| Relação | Tipo | Descrição |
| --- | --- | --- |
| installedApps | Coleção [teamsAppInstallation](https://learn.microsoft.com/pt-br/graph/api/resources/teamsappinstallation?view=graph-rest-1.0) | Uma coleção de todas as aplicações no chat. Anulável. |
| lastMessagePreview | [chatMessageInfo](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessageinfo?view=graph-rest-1.0) | Pré-visualização da última mensagem enviada no chat. Nulo se não forem enviadas mensagens na conversa. Atualmente, apenas a operação [de chats de lista](https://learn.microsoft.com/pt-br/graph/api/chat-list?view=graph-rest-1.0) suporta esta propriedade. |
| members | coleção [conversationMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) | Uma coleção de todos os membros na conversa. Anulável. |
| messages | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) collection | Uma coleção de todas as mensagens no chat. Anulável. |
| permissionGrants | Coleção [resourceSpecificPermissionGrant](https://learn.microsoft.com/pt-br/graph/api/resources/resourcespecificpermissiongrant?view=graph-rest-1.0) | Uma coleção de permissões concedidas às aplicações para o chat. |
| pinnedMessages | [pinnedChatMessageInfo](https://learn.microsoft.com/pt-br/graph/api/resources/pinnedchatmessageinfo?view=graph-rest-1.0) collection | Uma coleção de todas as mensagens afixadas no chat. Anulável. |
| guias | [teamsTab](https://learn.microsoft.com/pt-br/graph/api/resources/teamstab?view=graph-rest-1.0) collection | Uma coleção de todos os separadores no chat. Anulável. |

## Representação JSON

A representação JSON seguinte mostra o tipo de recurso.

JSON

```json
{
  "chatType": "String",
  "createdDateTime": "String (timestamp)",
  "id": "String (identifier)",
  "isHiddenForAllMembers": "Boolean",
  "lastUpdatedDateTime": "String (timestamp)",
  "migrationMode": "String",
  "onlineMeetingInfo": {"@odata.type": "microsoft.graph.teamworkOnlineMeetingInfo"},
  "originalCreatedDateTime": "String (timestamp)",
  "tenantId": "String",
  "topic": "String",
  "viewpoint": {"@odata.type": "microsoft.graph.chatViewpoint"},
  "webUrl": "String"
}
```

## Conteúdo relacionado

- [channel](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0)
- [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0)
- [Exemplo de ciclo de vida do chat C#](https://github.com/OfficeDev/Microsoft-Teams-Samples/blob/main/samples/graph-chat-lifecycle/csharp)
- [Exemplo de Node.js de ciclo de vida do chat](https://github.com/OfficeDev/Microsoft-Teams-Samples/blob/main/samples/graph-chat-lifecycle/nodejs)