---
title: "Tipo de recurso de usuário - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0"
author:
  - "[[MSFTRickyCastaneda]]"
published:
created: 2026-06-30
description: "Um canal é uma coleção de chatMessages dentro de uma equipe."
tags:
  - "clippings"
---
## Tipo de recurso de usuário

Namespace: microsoft.graph

[Teams](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0) é formado por canais que são as conversas que você tem com seus colegas. Cada canal é dedicado a um tópico específico, departamento ou projeto. Os canais estão onde o trabalho é feito - onde conversas via texto, áudio e vídeo abertas para toda a equipe ocontecem, onde os arquivos são compartilhados e as guias são adicionadas.

## Métodos

| Método | Tipo de retorno | Descrição |
| --- | --- | --- |
| [List channels](https://learn.microsoft.com/pt-br/graph/api/channel-list?view=graph-rest-1.0) | [channel](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) collection | Obtenha a lista de canais em uma equipe. |
| [Lstar canais de entrada](https://learn.microsoft.com/pt-br/graph/api/team-list-incomingchannels?view=graph-rest-1.0) | Coleção [channel](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) | Obtenha a lista de [canais](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) de entrada (canais compartilhados com uma [equipe](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0)). |
| [Listar todos os canais](https://learn.microsoft.com/pt-br/graph/api/team-list-allchannels?view=graph-rest-1.0) | Coleção [channel](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) | Obtenha a lista de [canais](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) em uma [equipe](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0) ou compartilhada com uma [equipe](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0) (canais de entrada). |
| [Create channel](https://learn.microsoft.com/pt-br/graph/api/channel-post?view=graph-rest-1.0) | [channel](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) | Crie um novo canal ao incluir o nome de exibição e a descrição. |
| [Get channel](https://learn.microsoft.com/pt-br/graph/api/channel-get?view=graph-rest-1.0) | [channel](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) | Leia as propriedades e as relações do canal. |
| [Obter canal primário](https://learn.microsoft.com/pt-br/graph/api/team-get-primarychannel?view=graph-rest-1.0) | [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) | O canal geral da equipe. |
| [Update channel](https://learn.microsoft.com/pt-br/graph/api/channel-patch?view=graph-rest-1.0) | [channel](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) | Atualize as propriedades do canal. |
| [Delete channel](https://learn.microsoft.com/pt-br/graph/api/channel-delete?view=graph-rest-1.0) | Nenhum | Exclua um canal. |
| [List channel messages](https://learn.microsoft.com/pt-br/graph/api/channel-list-messages?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) | Obtenha mensagens em um canal. |
| [Obter todas as mensagens do canal](https://learn.microsoft.com/pt-br/graph/api/channel-getallmessages?view=graph-rest-1.0) | [channel](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) collection | Obter todas as mensagens de todos os chats nos quais um usuário é um participante. |
| [Obter todas as mensagens de canal retidas](https://learn.microsoft.com/pt-br/graph/api/channel-getallretainedmessages?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) collection | Obtenha todas as [mensagens](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) retidas em todos os [canais](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) numa [equipa](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0). |
| [Criar postagem de mensagem no canal](https://learn.microsoft.com/pt-br/graph/api/channel-post-messages?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) | Envie uma mensagem para um canal. |
| [Criar resposta à postagem da mensagem do canal](https://learn.microsoft.com/pt-br/graph/api/chatmessage-post-replies?view=graph-rest-1.0) | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) | Responda a uma mensagem em um canal. |
| [Obter pasta de arquivos](https://learn.microsoft.com/pt-br/graph/api/channel-get-filesfolder?view=graph-rest-1.0). | [driveItem](https://learn.microsoft.com/pt-br/graph/api/resources/driveitem?view=graph-rest-1.0) | Recupera os detalhes da pasta do SharePoint em que os arquivos do canal estão armazenados. |
| [Listar guias](https://learn.microsoft.com/pt-br/graph/api/channel-list-tabs?view=graph-rest-1.0) | [teamsTab](https://learn.microsoft.com/pt-br/graph/api/resources/teamstab?view=graph-rest-1.0) | Listar guias fixadas a um canal. |
| [Listar membros do canal](https://learn.microsoft.com/pt-br/graph/api/channel-list-members?view=graph-rest-1.0) | coleção [conversationMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) | Obtenha uma lista de [membros](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) num [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0), incluindo membros diretos de canais padrão, privados e partilhados. |
| [Listar todos os membros](https://learn.microsoft.com/pt-br/graph/api/channel-list-allmembers?view=graph-rest-1.0) | coleção [conversationMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) | Obtenha uma lista de todos os [membros](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) num [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0). |
| [Adicionar membro do canal](https://learn.microsoft.com/pt-br/graph/api/channel-post-members?view=graph-rest-1.0) | [conversationMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) | Adicionar um membro a um canal. Só há suporte para canais com um **membershipType** de `private` ou `shared`. |
| [Obter canal do membro](https://learn.microsoft.com/pt-br/graph/api/channel-get-members?view=graph-rest-1.0) | coleção [conversationMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) | Obtenha um membro em um canal. |
| [canal Arquivo](https://learn.microsoft.com/pt-br/graph/api/channel-archive?view=graph-rest-1.0) | Nenhum | Arquivo um canal numa equipa. |
| [Canal unarchive](https://learn.microsoft.com/pt-br/graph/api/channel-unarchive?view=graph-rest-1.0) | Nenhum | Restaurar um canal arquivado numa equipa. |
| [Atualizar a função do membro do canal](https://learn.microsoft.com/pt-br/graph/api/channel-update-members?view=graph-rest-1.0) | [conversationMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) | Atualize as propriedades de um membro do canal. Só há suporte para canais com um **membershipType** de `private` ou `shared`. |
| [Remover membro do canal](https://learn.microsoft.com/pt-br/graph/api/channel-delete-members?view=graph-rest-1.0) | Nenhum | Exclua um membro de um canal. Só há suporte para canais com um **membershipType** de `private` ou `shared`. |
| [Iniciar migração](https://learn.microsoft.com/pt-br/graph/api/channel-startmigration?view=graph-rest-1.0) | [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) | Inicie a migração de mensagens externas ao ativar o modo de migração num [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) existente. |
| [Migração completa](https://learn.microsoft.com/pt-br/graph/api/channel-completemigration?view=graph-rest-1.0) | [channel](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) | Concluir a migração em [canais existentes](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) ou em novos canais. |
| [Listar guias no canal](https://learn.microsoft.com/pt-br/graph/api/channel-list-tabs?view=graph-rest-1.0) | [teamsTab](https://learn.microsoft.com/pt-br/graph/api/resources/teamstab?view=graph-rest-1.0) | Listar guias fixadas a um canal. |
| [Adicionar uma guia ao canal](https://learn.microsoft.com/pt-br/graph/api/channel-post-tabs?view=graph-rest-1.0) | [teamsTab](https://learn.microsoft.com/pt-br/graph/api/resources/teamstab?view=graph-rest-1.0) | Adicionar (fixar) uma guia a um canal. |
| [Guia obter no canal](https://learn.microsoft.com/pt-br/graph/api/channel-get-tabs?view=graph-rest-1.0) | [teamsTab](https://learn.microsoft.com/pt-br/graph/api/resources/teamstab?view=graph-rest-1.0) | Ler uma guia fixada a um canal. |
| [Guia atualizar no canal](https://learn.microsoft.com/pt-br/graph/api/channel-patch-tabs?view=graph-rest-1.0) | [teamsTab](https://learn.microsoft.com/pt-br/graph/api/resources/teamstab?view=graph-rest-1.0) | Atualiza as propriedades de uma guia em um canal. |
| [Remover guia do canal](https://learn.microsoft.com/pt-br/graph/api/channel-delete-tabs?view=graph-rest-1.0) | Nenhum | Remover (Desafixar) uma Tabulação de um canal. |
| [Listar aplicações no canal](https://learn.microsoft.com/pt-br/graph/api/channel-list-enabledapps?view=graph-rest-1.0) | Coleção [teamsApp](https://learn.microsoft.com/pt-br/graph/api/resources/teamsapp?view=graph-rest-1.0) | Obtenha uma lista das [aplicações ativadas](https://learn.microsoft.com/pt-br/graph/api/resources/teamsapp?view=graph-rest-1.0) no [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) especificado dentro de uma [equipa](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0). |
| [Obter a aplicação no canal](https://learn.microsoft.com/pt-br/graph/api/teamsapp-get?view=graph-rest-1.0) | [teamsApp](https://learn.microsoft.com/pt-br/graph/api/resources/teamsapp?view=graph-rest-1.0) | Obtenha uma [aplicação ativada](https://learn.microsoft.com/pt-br/graph/api/resources/teamsapp?view=graph-rest-1.0) no [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) especificado dentro de uma [equipa](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0). |
| [Adicionar aplicação ao canal](https://learn.microsoft.com/pt-br/graph/api/channel-post-enabledapps?view=graph-rest-1.0) | Nenhum | Adicione uma [aplicação teams](https://learn.microsoft.com/pt-br/graph/api/resources/teamsapp?view=graph-rest-1.0) que ativa uma [aplicação](https://learn.microsoft.com/pt-br/graph/api/resources/teamsapp?view=graph-rest-1.0) no [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) especificado dentro de uma [equipa](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0). |
| [Remover a aplicação do canal](https://learn.microsoft.com/pt-br/graph/api/channel-delete-enabledapps?view=graph-rest-1.0) | Nenhum | Remova uma [aplicação teams](https://learn.microsoft.com/pt-br/graph/api/resources/teamsapp?view=graph-rest-1.0) que desative uma [aplicação](https://learn.microsoft.com/pt-br/graph/api/resources/teamsapp?view=graph-rest-1.0) no [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) especificado dentro de uma [equipa](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0). |
| [Endereço de email do canal de provisão](https://learn.microsoft.com/pt-br/graph/api/channel-provisionemail?view=graph-rest-1.0) | [provisionChannelEmailResult](https://learn.microsoft.com/pt-br/graph/api/resources/provisionchannelemailresult?view=graph-rest-1.0) | Provisione um endereço de e-mail para o canal. |
| [Remover o endereço de email do canal](https://learn.microsoft.com/pt-br/graph/api/channel-removeemail?view=graph-rest-1.0) | Nenhum | Remova o endereço de e-mail do canal. |
| [Remover canal de entrada](https://learn.microsoft.com/pt-br/graph/api/team-delete-incomingchannels?view=graph-rest-1.0) | Nenhum | Remova um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) de entrada (um **canal** compartilhado com uma **equipe**) de uma [equipe](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0). |
| [Listar equipes que compartilham um canal](https://learn.microsoft.com/pt-br/graph/api/sharedwithchannelteaminfo-list?view=graph-rest-1.0) | coleção [sharedWithChannelTeamInfo](https://learn.microsoft.com/pt-br/graph/api/resources/sharedwithchannelteaminfo?view=graph-rest-1.0) | Obtenha a lista de [equipes](https://learn.microsoft.com/pt-br/graph/api/resources/sharedwithchannelteaminfo?view=graph-rest-1.0) com a qual foi compartilhado um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) especificado. |
| [Obter equipe compartilhando um canal](https://learn.microsoft.com/pt-br/graph/api/sharedwithchannelteaminfo-get?view=graph-rest-1.0) | [sharedWithChannelTeamInfo](https://learn.microsoft.com/pt-br/graph/api/resources/sharedwithchannelteaminfo?view=graph-rest-1.0) | Obtenha uma [equipe](https://learn.microsoft.com/pt-br/graph/api/resources/sharedwithchannelteaminfo?view=graph-rest-1.0) que foi compartilhada em um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) especificado. |
| [Descompartilhar canal com a equipe](https://learn.microsoft.com/pt-br/graph/api/sharedwithchannelteaminfo-delete?view=graph-rest-1.0) | Nenhum | Descompartilhar um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) com uma [equipe](https://learn.microsoft.com/pt-br/graph/api/resources/team?view=graph-rest-1.0) excluindo o recurso [sharedWithChannelTeamInfo](https://learn.microsoft.com/pt-br/graph/api/resources/sharedwithchannelteaminfo?view=graph-rest-1.0) correspondente. |
| [Listar membros permitidos](https://learn.microsoft.com/pt-br/graph/api/sharedwithchannelteaminfo-list-allowedmembers?view=graph-rest-1.0) | [conversationMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) coleção | Obtenha a lista de [conversationMembers](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) que podem acessar um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) compartilhado. |
| [Verificar o acesso do usuário](https://learn.microsoft.com/pt-br/graph/api/channel-doesuserhaveaccess?view=graph-rest-1.0) | Boolean | Determinar se um [utilizador](https://learn.microsoft.com/pt-br/graph/api/resources/useridentity?view=graph-rest-1.0) tem acesso a um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0) partilhado. |

## Propriedades

| Propriedade | Tipo | Descrição |
| --- | --- | --- |
| createdDateTime | dateTimeOffset | Somente leitura. Carimbo de data/hora de criação do canal. |
| description | String | Descrição textual opcional do canal. |
| displayName | String | Nome do canal como ele aparecerá ao usuário no Microsoft Teams. O comprimento máximo é de 50 carateres. |
| email | Cadeia de caracteres | O endereço de email para enviar mensagens ao canal. Somente leitura. |
| id | String | O identificador exclusivo do canal. Somente leitura. |
| isArchived | Booliano | Indica se o canal está arquivado. Somente leitura. |
| isFavoriteByDefault | Booliano | Indica se o canal deve ser marcado como recomendado para que todos os membros da equipa sejam apresentados na respetiva lista de canais. **Nota:** Todos os canais recomendados são apresentados automaticamente na lista de canais para utilizadores de educação e trabalhadores de primeira linha. A propriedade só pode ser definida programaticamente através do método [Criar equipa](https://learn.microsoft.com/pt-br/graph/api/team-post?view=graph-rest-1.0). O valor padrão é `false`. |
| layoutType | [channelLayoutType](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0#channellayouttype-values) | O tipo de esquema do canal. Pode ser definido durante a criação e atualizado mais tarde. Os valores possíveis são: `post`, `chat`, `unknownFutureValue`. O valor padrão é `post`. Os canais com o `post` esquema utilizam um formato de conversação pós-resposta tradicional e os canais com o esquema de chat proporcionam uma experiência de threading semelhante a conversas de chat. |
| membershipType | [channelMembershipType](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0#channelmembershiptype-values) | O tipo do canal. Pode ser definido durante a criação e não pode ser alterado. Os valores possíveis são: `standard`, `private`, `unknownFutureValue`, `shared`. O valor padrão é `standard`. Utilize o cabeçalho do `Prefer: include-unknown-enum-members` pedido para obter os seguintes membros nesta [enumeração em evolução](https://learn.microsoft.com/pt-br/graph/best-practices-concept#handling-future-members-in-evolvable-enumerations): `shared`. |
| migrationMode | [migrationMode](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0#migrationmode-values) | Indica se um canal está no modo de migração. Este valor destina-se `null` a canais que nunca entraram no modo de migração. Os valores possíveis são: `inProgress`, `completed`, `unknownFutureValue`. |
| originalCreatedDateTime | dateTimeOffset | Carimbo de data/hora da hora de criação original do canal. O valor é `null` se o canal nunca entrou no modo de migração. |
| tenantId | cadeia de caracteres | O ID do inquilino Microsoft Entra. |
| webUrl | String | Um hiperlink que navegará até o canal no Microsoft Teams. Essa é a URL que você recebe ao clicar com o botão direito do mouse em um canal Microsoft Teams e selecionar Obter o link para o canal. Essa URL deve ser tratada como um blob opaco e não analisado. Somente leitura. |
| summary | [channelSummary](https://learn.microsoft.com/pt-br/graph/api/resources/channelsummary?view=graph-rest-1.0) | Contém informações de resumo sobre o canal, incluindo o número de proprietários, membros, convidados e um indicador para membros de outros inquilinos. A propriedade **de resumo** só será devolvida se for especificada na `$select` cláusula do método [Get channel](https://learn.microsoft.com/pt-br/graph/api/channel-get?view=graph-rest-1.0). |

### valores channelMembershipType

| Member | Descrição |
| --- | --- |
| padrão | O Canal herda a lista de membros do equipe principal. |
| privado | O Canal pode ter membros que são um subconjunto de todos os membros no equipe principal. |
| unknownFutureValue | Valor da sentinela de enumeração evoluível. Não usar. |
| compartilhado | Os membros podem ser adicionados diretamente ao canal sem os adicionar à equipa. |

### valores migrationMode

| Member | Descrição |
| --- | --- |
| inProgress | O canal ou chat entrou no modo de migração. |
| concluído | O canal ou o chat está fora do modo de migração. |
| unknownFutureValue | Valor da sentinela de enumeração evoluível. Não usar. |

### valores channelLayoutType

| Member | Descrição |
| --- | --- |
| post | Formato de conversação pós-resposta tradicional. As mensagens são apresentadas num formato estruturado com respostas aninhadas na publicação original. Representa o tipo de esquema predefinido. |
| chat | Experiência de threading semelhante a conversas de chat. As mensagens são apresentadas num fluxo contínuo com suporte para conversações por tópicos por tópicos específicos. |
| unknownFutureValue | Valor da sentinela de enumeração evoluível. Não usar. |

### Atributos de instância

Atributos de instância são propriedades com comportamentos especiais. Essas propriedades são temporárias e a) definem o comportamento que o serviço deve apresentar ou b) fornecem valores de propriedades de curto prazo, como uma URL de download, para um item com data de expiração.

| Nome da propriedade | Tipo | Descrição |
| --- | --- | --- |
| @microsoft.graph.channelCreationMode | string | Indica que o canal está no estado de migração e está sendo usado no momento para fins de migração. Aceita um valor: `migration`. |

> **Nota**: `channelCreationMode` é uma enumeração que utiliza o valor `migration`.

Para obter um exemplo de uma solicitação POST, confira [Solicitação (criar canal no estado de migração)](https://learn.microsoft.com/pt-br/microsoftteams/platform/graph-api/import-messages/import-external-messages-to-teams#request-create-a-team-in-migration-state).

## Relações

| Relação | Tipo | Descrição |
| --- | --- | --- |
| allMembers | coleção [conversationMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) | Uma coleção de registos de associação associados ao canal, incluindo membros diretos e indiretos de canais partilhados. |
| enabledApps | Coleção [teamsApp](https://learn.microsoft.com/pt-br/graph/api/resources/teamsapp?view=graph-rest-1.0) | Uma coleção de aplicações ativadas no canal. |
| [filesFolder](https://learn.microsoft.com/pt-br/graph/api/channel-get-filesfolder?view=graph-rest-1.0) | [driveItem](https://learn.microsoft.com/pt-br/graph/api/resources/driveitem?view=graph-rest-1.0) | Metadados para o local em que os arquivos do canal estão armazenados. |
| members | coleção [conversationMember](https://learn.microsoft.com/pt-br/graph/api/resources/conversationmember?view=graph-rest-1.0) | Uma coleção de registros de associação ligados ao canal. |
| messages | [chatMessage](https://learn.microsoft.com/pt-br/graph/api/resources/chatmessage?view=graph-rest-1.0) collection | Uma coleção de todas as mensagens do canal. Uma propriedade de navegação. Anulável. |
| operations | Coleção [teamsAsyncOperation](https://learn.microsoft.com/pt-br/graph/api/resources/teamsasyncoperation?view=graph-rest-1.0) | As operações assíncronas que foram executadas ou estão em execução nesta equipe. |
| sharedWithTeams | coleção [sharedWithChannelTeamInfo](https://learn.microsoft.com/pt-br/graph/api/resources/sharedwithchannelteaminfo?view=graph-rest-1.0) | Uma coleção de equipes com as quais um canal é compartilhado. |
| guias | [teamsTab](https://learn.microsoft.com/pt-br/graph/api/resources/teamstab?view=graph-rest-1.0) collection | Uma coleção de todas as guias do canal. Uma propriedade de navegação. |

## Representação JSON

A representação JSON seguinte mostra o tipo de recurso.

JSON

```json
{
  "createdDateTime": "String (timestamp)",
  "description": "String",
  "displayName": "String",
  "email": "String",
  "id": "String (identifier)",
  "isArchived": "Boolean",
  "isFavoriteByDefault": "Boolean",
  "layoutType": "String",
  "membershipType": "String",
  "migrationMode": "String",
  "originalCreatedDateTime": "String (timestamp)",
  "webUrl": "String"
}
```

## Conteúdo relacionado

- [Exemplo de ciclo de vida do canal C#](https://github.com/OfficeDev/Microsoft-Teams-Samples/blob/main/samples/graph-channel-lifecycle/csharp)
- [Exemplo de Node.js do ciclo de vida do canal](https://github.com/OfficeDev/Microsoft-Teams-Samples/blob/main/samples/graph-channel-lifecycle/nodejs)