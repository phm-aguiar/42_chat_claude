---
title: "Tipo de recurso chatMessage - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0"
author:
  - "[[RamjotSingh]]"
published:
created: 2026-06-30
description: "Representa uma mensagem de chat individual numa entidade de canal ou chat."
tags:
  - "clippings"
---
## Tipo de recurso chatMessage

Namespace: microsoft.graph

Representa uma mensagem de bate-papo individual em um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) ou [bate-papo](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0). A mensagem pode ser uma mensagem raiz ou parte de um thread definido pela propriedade **replyToId** na mensagem.

> **Nota**: este recurso suporta a subscrição de alterações (criar, atualizar e eliminar) [através de notificações de alteração](https://learn.microsoft.com/pt-br/graph/api/resources/change-notifications-api-overview?view=graph-rest-1.0). Isso permite aos chamadores assinar e obter alterações em tempo real. Para obter detalhes, confira [obter notificações de](https://learn.microsoft.com/pt-br/graph/teams-changenotifications-chatMessage) de mensagens.

## Métodos

| Método | Tipo de retorno | Descrição |
| --- | --- | --- |
| **Mensagens do canal** |  |  |
| [Listar mensagens no canal](https://learn.microsoft.com/pt-br/graph/api/channel-list-messages?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) collection | Lista de todas as mensagens raiz num canal. |
| [Criar assinatura para novas mensagens de canal](https://learn.microsoft.com/pt-br/graph/api/subscription-post-subscriptions?view=graph-rest-1.0) | [subscription](https://learn.microsoft.com/pt-br/graph/api/resources/subscription?view=graph-rest-1.0) | Escutar mensagens novas, editadas e eliminadas e reações às mesmas. |
| [Obter mensagem no canal](https://learn.microsoft.com/pt-br/graph/api/chatmessage-get?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) | Obter uma única mensagem de raiz num canal. |
| [Enviar mensagem no canal](https://learn.microsoft.com/pt-br/graph/api/chatmessage-post?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) | Criar uma nova mensagem de raiz num canal. |
| [Atualizar mensagem no canal](https://learn.microsoft.com/pt-br/graph/api/chatmessage-update?view=graph-rest-1.0) | Nenhum | Atualize a propriedade **policyViolation** de uma mensagem de chat. |
| [Eliminar mensagem no canal](https://learn.microsoft.com/pt-br/graph/api/chatmessage-softdelete?view=graph-rest-1.0) | Nenhum | Elimine a mensagem num canal. |
| [Anular a eliminação de uma mensagem no canal](https://learn.microsoft.com/pt-br/graph/api/chatmessage-undosoftdelete?view=graph-rest-1.0) | Nenhum | Anular a eliminação da mensagem num canal. |
| [Definir a reação a uma mensagem no canal](https://learn.microsoft.com/pt-br/graph/api/chatmessage-setreaction?view=graph-rest-1.0) | Nenhum | Definir a reação a uma mensagem num canal. |
| [Anular a reação a uma mensagem no canal](https://learn.microsoft.com/pt-br/graph/api/chatmessage-unsetreaction?view=graph-rest-1.0) | Nenhum | Anular a reação a uma mensagem num canal. |
| **Respostas a mensagens de canal** |  |  |
| [Listar respostas à mensagem](https://learn.microsoft.com/pt-br/graph/api/chatmessage-list-replies?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) collection | Lista de todas as respostas a uma mensagem de chat no canal. |
| [Obter mensagem de resposta no canal](https://learn.microsoft.com/pt-br/graph/api/chatmessage-get?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) | Obter uma única mensagem de resposta num canal. |
| [Responder a uma mensagem no canal](https://learn.microsoft.com/pt-br/graph/api/chatmessage-post-replies?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) | Responder a uma mensagem de chat existente num canal. |
| [Atualizar mensagem de resposta](https://learn.microsoft.com/pt-br/graph/api/chatmessage-update?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) | Atualize a propriedade **policyViolation** de uma mensagem de chat. |
| [Eliminar mensagem de resposta no canal](https://learn.microsoft.com/pt-br/graph/api/chatmessage-softdelete?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) | Elimine a mensagem de resposta única num canal. |
| [Anular a eliminação de uma mensagem de resposta no canal](https://learn.microsoft.com/pt-br/graph/api/chatmessage-undosoftdelete?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) | Anular a eliminação da mensagem de resposta única num canal. |
| [Definir a reação a uma mensagem no canal](https://learn.microsoft.com/pt-br/graph/api/chatmessage-setreaction?view=graph-rest-1.0) | Nenhum | Definir a reação a uma mensagem num canal. |
| [Anular a reação a uma mensagem no canal](https://learn.microsoft.com/pt-br/graph/api/chatmessage-unsetreaction?view=graph-rest-1.0) | Nenhum | Anular a reação a uma mensagem num canal. |
| **Mensagens de chat** |  |  |
| [Listar mensagens no chat](https://learn.microsoft.com/pt-br/graph/api/chat-list-messages?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) | Listar mensagens de chat numa conversa. |
| [Receba uma mensagem no bate-papo](https://learn.microsoft.com/pt-br/graph/api/chatmessage-get?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) | Obter uma única mensagem de chat numa conversa. |
| [Obter mensagens em todos os chats para o usuário](https://learn.microsoft.com/pt-br/graph/api/chats-getallmessages?view=graph-rest-1.0) | coleção [de chat](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) | Obtenha mensagens de todas as conversas nas quais um utilizador participa, incluindo conversas de 1:1, conversas de grupo e conversas de reunião. |
| [Obter mensagens de chat delta para o utilizador](https://learn.microsoft.com/pt-br/graph/api/chatmessage-delta?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) collection | Obtenha a lista de [mensagens](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) de todas as [conversas](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0) nas quais um utilizador é participante, incluindo conversas um-para-um, conversas de grupo e conversas de reunião. |
| [Obter todas as mensagens do canal](https://learn.microsoft.com/pt-br/graph/api/channel-getallmessages?view=graph-rest-1.0) | [channel](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) collection | Obter todas as mensagens de todos os chats nos quais um usuário é um participante. |
| [Criar assinatura para novas mensagens de chat](https://learn.microsoft.com/pt-br/graph/api/subscription-post-subscriptions?view=graph-rest-1.0) | [subscription](https://learn.microsoft.com/pt-br/graph/api/resources/subscription?view=graph-rest-1.0) | Escutar mensagens de chat novas, editadas e eliminadas e reações às mesmas. |
| [Enviar mensagem no chat](https://learn.microsoft.com/pt-br/graph/api/chat-post-messages?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) | Envie uma mensagem de chat numa conversação de chat de grupo ou 1:1 existente. |
| [Atualizar mensagem no chat](https://learn.microsoft.com/pt-br/graph/api/chatmessage-update?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) | Atualize a propriedade **policyViolation** de uma mensagem de chat. |
| [Eliminar mensagem no chat](https://learn.microsoft.com/pt-br/graph/api/chatmessage-softdelete?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) | Elimine a mensagem de uma conversa. |
| [Anular a eliminação de uma mensagem no chat](https://learn.microsoft.com/pt-br/graph/api/chatmessage-undosoftdelete?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) | Anular a eliminação da mensagem numa conversa. |
| [Definir a reação a uma mensagem no canal](https://learn.microsoft.com/pt-br/graph/api/chatmessage-setreaction?view=graph-rest-1.0) | Nenhum | Definir a reação a uma mensagem num canal. |
| [Anular a reação a uma mensagem no canal](https://learn.microsoft.com/pt-br/graph/api/chatmessage-unsetreaction?view=graph-rest-1.0) | Nenhum | Anular a reação a uma mensagem num canal. |
| [Responder com aspas](https://learn.microsoft.com/pt-br/graph/api/chatmessage-replywithquote?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) | Responda com aspas a uma única [mensagem de chat](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) ou a várias mensagens de chat numa [conversa](https://learn.microsoft.com/pt-br/graph/api/resources/chat?view=graph-rest-1.0). |
| **Conteúdo alojado** |  |  |
| [Listar todo o conteúdo hospedado](https://learn.microsoft.com/pt-br/graph/api/chatmessage-list-hostedcontents?view=graph-rest-1.0) | [chatMessageHostedContent collection (coleção chatMessageHostedContent](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessagehostedcontent?view=graph-rest-1.0) ) | Obter todos os conteúdos alojados associados a uma mensagem. |
| [Obter conteúdo hospedado](https://learn.microsoft.com/pt-br/graph/api/chatmessagehostedcontent-get?view=graph-rest-1.0) | [chatMessageHostedContent](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessagehostedcontent?view=graph-rest-1.0) | Obtenha conteúdo alojado (e os respetivos bytes) para uma mensagem. |

## Propriedades

| Propriedade | Tipo | Descrição |
| --- | --- | --- |
| attachments | [chatMessageAttachment](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessageattachment?view=graph-rest-1.0) collection | Referências a objetos anexados, como ficheiros, separadores, reuniões, etc. |
| corpo | [itemBody](https://learn.microsoft.com/pt-br/graph/api/resources/itembody?view=graph-rest-1.0) | Representação em texto simples/HTML do conteúdo da mensagem de chat. A representação é especificada pelo contentType dentro do corpo. O conteúdo está sempre em HTML se a mensagem de chat contiver um [chatMessageMention](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessagemention?view=graph-rest-1.0). |
| chatId | string | Se a mensagem tiver sido enviada numa conversa, representa a identidade do chat. |
| channelIdentity | [channelIdentity](https://learn.microsoft.com/pt-br/graph/api/resources/channelidentity?view=graph-rest-1.0) | Se a mensagem tiver sido enviada num canal, representa a identidade do canal. |
| createdDateTime | dateTimeOffset | Carimbo de data/hora de quando a mensagem de chat foi criada. |
| deletedDateTime | dateTimeOffset | Somente leitura. Carimbo de data/hora no qual a mensagem de chat foi eliminada ou nulo se não for eliminada. |
| etag | string | Somente leitura. Número da versão da mensagem de chat. |
| eventDetail | [eventMessageDetail](https://learn.microsoft.com/pt-br/graph/api/resources/eventmessagedetail?view=graph-rest-1.0) | Somente leitura. Se estiver presente, representa os detalhes de um evento que ocorreu numa **conversa**, num **canal** ou numa **equipa**, por exemplo, a adicionar novos membros. Para mensagens de evento, a propriedade **messageType** será definida como `systemEventMessage`. |
| from | [chatMessageFromIdentitySet](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessagefromidentityset?view=graph-rest-1.0) | Detalhes do remetente da mensagem de chat. Só pode ser definido durante a [migração](https://learn.microsoft.com/pt-br/microsoftteams/platform/graph-api/import-messages/import-external-messages-to-teams). |
| id | String | Somente leitura. ID única da mensagem. Os IDs são exclusivos numa conversa/canal/resposta a mensagem, mas podem ser duplicados noutras conversas/canais/responder a mensagens. |
| importância | string | A importância da mensagem de chat. Os valores possíveis são: `normal`, `high`, `urgent`. |
| lastModifiedDateTime | dateTimeOffset | Somente leitura. Carimbo de data/hora quando a mensagem de chat é criada (definição inicial) ou modificada, incluindo quando uma reação é adicionada ou removida. |
| lastEditedDateTime | dateTimeOffset | Somente leitura. Carimbo de data/hora quando foram efetuadas edições à mensagem de chat. Aciona um sinalizador "Editado" na IU do Teams. Se não forem efetuadas edições, o valor será `null`. |
| localidade | string | Região da mensagem de chat definida pelo cliente. Sempre definido para `en-us`. |
| mentions | [chatMessageMention](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessagemention?view=graph-rest-1.0) collection | Lista de entidades mencionadas na mensagem de chat. As entidades suportadas são: utilizador, bot, equipa, canal, chat e etiqueta. |
| messageHistory | [chatMessageHistoryItem collection (Coleção chatMessageHistoryItem](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessagehistoryitem?view=graph-rest-1.0) ) | Lista de histórico de atividade de um item de mensagem, incluindo o tempo e as ações de modificação, como reaçãoAdded, reactionRemoved ou alterações de reação, na mensagem. |
| messageType | chatMessageType | O tipo de mensagem de chat. Os valores possíveis são: `message`, `chatEvent`, `typing`, `unknownFutureValue`, `systemEventMessage`. Utilize o cabeçalho do `Prefer: include-unknown-enum-members` pedido para obter os seguintes membros nesta [enumeração em evolução](https://learn.microsoft.com/pt-br/graph/best-practices-concept#handling-future-members-in-evolvable-enumerations): `systemEventMessage`. |
| policyViolation | [chatMessagePolicyViolation](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessagepolicyviolation?view=graph-rest-1.0) | Define as propriedades de uma violação de política definida por uma aplicação de prevenção de perda de dados (DLP). |
| reactions | [chatMessageReaction](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessagereaction?view=graph-rest-1.0) collection | Reações para esta mensagem de chat (por exemplo, Gosto). |
| replyToId | string | Somente leitura. ID da mensagem de chat principal ou mensagem de chat raiz do tópico. (Aplica-se apenas a mensagens de chat em canais e não chats.) |
| assunto | string | O assunto da mensagem de chat, em texto simples. |
| summary | string | Texto de resumo da mensagem de chat que pode ser utilizado para notificações push e vistas de resumo ou vistas de contingência. Aplica-se apenas a mensagens de chat de canal e não a mensagens de chat numa conversa. |
| webUrl | cadeia de caracteres | Somente leitura. Ligação para a mensagem no Microsoft Teams. |

## Relações

| Relação | Tipo | Descrição |
| --- | --- | --- |
| hostedContents | [chatMessageHostedContent collection (coleção chatMessageHostedContent](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessagehostedcontent?view=graph-rest-1.0) ) | Conteúdo numa mensagem alojada pelo Microsoft Teams, por exemplo, imagens ou fragmentos de código. |
| respostas | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) collection | Respostas para uma mensagem especificada. `$expand` Suporta mensagens de canal. |

## Representação JSON

A representação JSON seguinte mostra o tipo de recurso.

JSON

```json
{
  "attachments": [{"@odata.type": "microsoft.graph.chatMessageAttachment"}],
  "body": {"@odata.type": "microsoft.graph.itemBody"},
  "channelIdentity": {"@odata.type": "microsoft.graph.channelIdentity"},
  "chatId": "String",
  "createdDateTime": "String (timestamp)",
  "deletedDateTime": "String (timestamp)",
  "etag": "String",
  "eventDetail": {"@odata.type": "microsoft.graph.eventMessageDetail"},
  "from": {"@odata.type": "microsoft.graph.chatMessageFromIdentitySet"},
  "id": "String (identifier)",
  "importance": "String",
  "lastEditedDateTime": "String (timestamp)",
  "lastModifiedDateTime": "String (timestamp)",
  "locale": "String",
  "mentions": [{"@odata.type": "microsoft.graph.chatMessageMention"}],
  "messageHistory": [{"@odata.type": "microsoft.graph.chatMessageHistoryItem"}],
  "messageType": "String",
  "policyViolation": {"@odata.type": "microsoft.graph.chatMessagePolicyViolation"},
  "reactions": [{"@odata.type": "microsoft.graph.chatMessageReaction"}],
  "replyToId": "String (identifier)",
  "subject": "String",
  "summary": "String",
  "webUrl": "String"
}
```