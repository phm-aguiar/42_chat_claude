# language: pt

Funcionalidade: Assinatura de Participação (User Signature)
  Como um usuário autenticado do 42 Chat
  Quero visualizar a assinatura de participação abaixo de cada mensagem
  Para que eu possa ver o nível de engajamento de cada membro da comunidade

  A assinatura é um componente reutilizável `UserSignature` exibido inline
  abaixo de mensagens, mostrando avatar, login, tier de participação, total
  de mensagens e salas ativas (0 ou 1 pré-Feature 103). Stats são globais
  (cross-channel) e atualizam em tempo real via WebSocket. Tiers: novato (0),
  iniciante (1-50), participante (51-200), veterano (201+).

  Contexto:
    Dado que estou autenticado no 42 Chat com o login "joao_silva"
    E o canal "geral" está carregado com mensagens visíveis

  # ===================================================================
  # Happy Path
  # ===================================================================

  Cenário: Usuário visualiza assinatura de participação abaixo de uma mensagem
    Dado que o usuário com id 123 (login "maria_dev") possui 42 mensagens no total
    E tem active_rooms = 1 (sala "general")
    E seu tier de participação é "iniciante"
    Quando o canal carrega as mensagens
    Então abaixo de cada mensagem do usuário 123 o componente UserSignature deve ser exibido
    E o cartão deve conter o avatar do usuário
    E deve exibir o login "maria_dev"
    E deve exibir o rótulo de tier "iniciante"
    E deve exibir "42 mensagens" como total
    E deve exibir "1 sala ativa" como active_rooms

  Cenário: Assinatura renderiza sem quebrar o layout do chat
    Dado que o canal possui 20 mensagens de diversos autores
    Quando todas as mensagens são carregadas
    Então cada mensagem deve ter o componente UserSignature renderizado abaixo do seu conteúdo
    E o layout do chat não deve apresentar overflow horizontal
    E a rolagem vertical deve funcionar normalmente
    E o cartão UserSignature deve ter altura fixa e consistente entre mensagens

  # ===================================================================
  # Tiers de Participação
  # ===================================================================

  Cenário: Usuário novato — 0 mensagens exibe tier "novato"
    Dado que o usuário com id 456 (login "novato_user") nunca enviou mensagens
    E seu total de mensagens é 0
    E seu active_rooms é 0 (nenhuma mensagem em sala alguma)
    Quando o canal carrega uma mensagem desse usuário (ou seu perfil)
    Então o componente UserSignature deve ser exibido
    E deve exibir o rótulo de tier "novato"
    E deve exibir "0 mensagens"
    E deve exibir "0 salas ativas"
    E deve exibir o avatar default do sistema 42

  Cenário: Usuário iniciante — 1 a 50 mensagens exibe tier "iniciante"
    Dado que o usuário com id 789 (login "joao_dev") enviou 1 mensagem
    E tem active_rooms = 1
    Quando a assinatura é renderizada via GET /api/users/789/stats
    Então o tier exibido deve ser "iniciante"
    E o total de mensagens deve ser "1 mensagem"
    E active_rooms deve ser 1

    Dado que o usuário com id 789 agora possui 50 mensagens
    E tem active_rooms = 1
    Quando a assinatura é renderizada via GET /api/users/789/stats
    Então o tier exibido deve ser "iniciante"
    E o total de mensagens deve ser "50 mensagens"
    E active_rooms deve ser 1

  Cenário: Usuário participante — 51 a 200 mensagens exibe tier "participante"
    Dado que o usuário com id 101 (login "ana_silva") enviou 51 mensagens
    E tem active_rooms = 1
    Quando a assinatura é renderizada via GET /api/users/101/stats
    Então o tier exibido deve ser "participante"
    E o total de mensagens deve ser "51 mensagens"
    E active_rooms deve ser 1

    Dado que o usuário com id 101 agora possui 200 mensagens
    E tem active_rooms = 1
    Quando a assinatura é renderizada via GET /api/users/101/stats
    Então o tier exibido deve ser "participante"
    E o total de mensagens deve ser "200 mensagens"
    E active_rooms deve ser 1

  Cenário: Usuário veterano — 201+ mensagens exibe tier "veterano"
    Dado que o usuário com id 102 (login "pedro_lider") enviou 201 mensagens
    E tem active_rooms = 1
    Quando a assinatura é renderizada via GET /api/users/102/stats
    Então o tier exibido deve ser "veterano"
    E o total de mensagens deve ser "201 mensagens"
    E active_rooms deve ser 1

  # ===================================================================
  # Atualização em Tempo Real (WebSocket)
  # ===================================================================

  Cenário: Assinatura atualiza via WebSocket após nova mensagem do autor
    Dado que o usuário com id 789 (login "joao_dev") está logado e visualizando o canal "geral"
    E o UserSignature do usuário 789 está renderizado na tela com "49 mensagens" (tier "iniciante")
    E tem active_rooms = 1
    Quando o usuário 789 envia uma nova mensagem no canal "geral"
    E o servidor emite o evento WebSocket "user_stats_changed" para o usuário 789
    Então o frontend deve receber a notificação em até 3 segundos
    E o componente UserSignature do usuário 789 deve atualizar para "50 mensagens"
    E o tier deve permanecer "iniciante"
    E active_rooms deve continuar 1

  Cenário: Múltiplos clientes veem a mesma atualização de stats simultaneamente
    Dado que 3 usuários estão conectados e visualizando o canal "geral"
    E todos possuem o UserSignature do usuário 102 (login "pedro_lider") renderizado com "200 mensagens" (tier "participante")
    E tem active_rooms = 1
    Quando o usuário 102 envia uma mensagem no canal "geral"
    E o WebSocket emite "user_stats_changed" para o usuário 102
    Então todos os 3 clientes devem atualizar o UserSignature do usuário 102
    E o novo total deve ser "201 mensagens"
    E o tier deve transitar para "veterano"
    E active_rooms deve permanecer 1

  Cenário: Debounce evita rajada de atualizações em alta frequência
    Dado que o usuário com id 999 (login "flood_user") envia 10 mensagens em rápida sucessão (menos de 1s entre elas)
    Quando o servidor processa as mensagens
    Então o evento WebSocket "user_stats_changed" deve ser emitido no máximo a cada 2 segundos
    E o frontend não deve receber mais de 1 atualização por período de debounce
    E o estado final do UserSignature deve refletir o total correto de mensagens

  # ===================================================================
  # Transição de Tier
  # ===================================================================

  Cenário: Transição de tier iniciante para participante ao atingir 51 mensagens
    Dado que o usuário com id 110 (login "carlos_souza") possui 50 mensagens (tier "iniciante")
    E seu UserSignature exibe o rótulo "iniciante"
    E tem active_rooms = 1
    Quando o usuário 110 envia sua 51ª mensagem
    E o WebSocket notifica a mudança de stats
    Então o UserSignature deve atualizar o total para "51 mensagens"
    E o rótulo de tier deve transitar de "iniciante" para "participante"
    E a transição visual deve ser perceptível (mudança de cor/ícone do tier)
    E active_rooms deve permanecer 1

  Cenário: Transição de tier participante para veterano ao atingir 201 mensagens
    Dado que o usuário com id 101 (login "ana_silva") possui 200 mensagens (tier "participante")
    E tem active_rooms = 1
    Quando o usuário 101 envia sua 201ª mensagem
    E o WebSocket notifica a mudança de stats
    Então o UserSignature deve atualizar o total para "201 mensagens"
    E o rótulo de tier deve transitar de "participante" para "veterano"
    E active_rooms deve permanecer 1

  Cenário: Transição de novato para iniciante na primeira mensagem
    Dado que o usuário com id 456 (login "novato_user") possui 0 mensagens (tier "novato")
    E seu UserSignature exibe o placeholder reduzido com active_rooms = 0
    Quando o usuário 456 envia sua primeira mensagem
    E o WebSocket notifica a mudança de stats
    Então o UserSignature deve deixar o modo reduzido e exibir o cartão completo
    E o total deve ser "1 mensagem"
    E o tier deve transitar de "novato" para "iniciante"
    E active_rooms deve transitar para 1

  # ===================================================================
  # Endpoint REST: GET /api/users/{id}/stats
  # ===================================================================

  Cenário: Endpoint retorna stats completos com código 200
    Dado que o usuário com id 123 (login "maria_dev") possui 42 mensagens
    E tem active_rooms = 1
    Quando o frontend consulta GET "/api/users/123/stats"
    Então a resposta deve conter status HTTP 200
    E o JSON deve incluir os campos: user_id, login, image_url, total_messages, active_rooms, tier, tier_label, member_since
    E user_id deve ser 123
    E login deve ser "maria_dev"
    E total_messages deve ser 42
    E active_rooms deve ser 1
    E tier deve ser 1 (numérico)
    E tier_label deve ser "iniciante"

  Cenário: Endpoint retorna 404 para ID de usuário inexistente
    Dado que o ID 99999 não corresponde a nenhum usuário real
    Quando o frontend consulta GET "/api/users/99999/stats"
    Então a API deve retornar HTTP 404
    E o corpo da resposta deve indicar que o usuário não foi encontrado

  Cenário: Total de mensagens do endpoint bate com contagem direta do banco
    Dado que o usuário com id 105 (login "check_user") possui registros na tabela messages
    Quando a API GET "/api/users/105/stats" é consultada
    Então o total_messages retornado deve ser igual ao resultado de "SELECT COUNT(*) FROM messages WHERE user_id = 105 AND deleted_at IS NULL"

  # ===================================================================
  # active_rooms Degradado (Pré-Feature 103)
  # ===================================================================

  Cenário: Usuário com mensagens em sala única tem active_rooms = 1
    # NOTA GHERKIN: active_rooms é 0 ou 1 pré-Feature 103 porque existe apenas a sala "general".
    # Após a Feature 103 adicionar suporte a múltiplas salas (chat_id/room_id na migration 001),
    # este valor será COUNT(DISTINCT chat_id) de verdade. Por enquanto, é boolean: 0 (nenhuma msg)
    # ou 1 (≥1 msg na sala "general").
    Dado que o usuário com id 123 (login "maria_dev") enviou 42 mensagens na sala "general"
    Quando a API GET "/api/users/123/stats" é consultada
    Então active_rooms deve ser 1
    E a resposta não deve tentar contar múltiplas salas (pré-Feature 103)

  Cenário: Usuário sem mensagens tem active_rooms = 0
    Dado que o usuário com id 456 (login "novato_user") nunca enviou mensagens
    E não há registros desse usuário na tabela messages
    Quando a API GET "/api/users/456/stats" é consultada
    Então active_rooms deve ser 0
    E total_messages deve ser 0

  # ===================================================================
  # Resiliência e Edge Cases
  # ===================================================================

  Cenário: WebSocket cai e assinatura mantém último estado conhecido
    Dado que o cliente possui o UserSignature do usuário 123 com "42 mensagens" (tier "iniciante", active_rooms = 1)
    E a conexão WebSocket é perdida
    Quando novas mensagens do usuário 123 chegam ao servidor durante a desconexão
    Então o UserSignature deve continuar exibindo "42 mensagens" (último estado conhecido)
    E o componente não deve remover ou esconder a assinatura
    E o WebSocket deve tentar reconectar automaticamente

  Cenário: Reconexão WebSocket puxa estado fresco via API
    Dado que a conexão WebSocket foi restabelecida após uma queda
    E durante a desconexão o usuário 123 enviou 8 novas mensagens
    Quando o WebSocket reconecta
    Então o frontend deve consultar GET "/api/users/123/stats"
    E o UserSignature deve atualizar para "50 mensagens"
    E o tier deve refletir o estado mais recente
    E active_rooms deve refletir o estado mais recente

  Cenário: Usuário sem avatar configurado exibe avatar default do 42
    Dado que o usuário com id 104 (login "new_user") não configurou avatar no perfil 42
    E o campo image_url é NULL ou vazio na resposta da API
    Quando a assinatura é renderizada
    Então o UserSignature deve exibir o avatar default do sistema 42 (/assets/default-avatar.png)
    E o restante do cartão (login, tier, stats) deve renderizar normalmente

  Cenário: Usuário logado vê a própria assinatura sem distinção visual
    Dado que estou autenticado como o usuário 42 (login "joao_silva")
    E minhas mensagens estão visíveis no canal "geral"
    Quando visualizo uma mensagem que eu mesmo enviei
    Então o UserSignature deve ser renderizado normalmente abaixo da minha mensagem
    E não deve haver indicador visual de "você" ou destaque diferente dos demais

  Cenário: Canal sem mensagens não renderiza assinatura
    Dado que o canal "vazio" não possui nenhuma mensagem
    Quando o canal é carregado
    Então nenhum componente UserSignature deve ser renderizado
    E o estado vazio do canal deve ser exibido normalmente

  Cenário: Active_rooms é 0 para usuário com 0 mensagens na sala "general"
    Dado que o usuário com id 107 (login "silence_user") nunca enviou mensagens no chat
    Quando a API GET "/api/users/107/stats" é consultada
    Então active_rooms deve ser 0
    E total_messages deve ser 0
    E o tier deve ser 0 (novato)
