# language: pt-BR
# encoding: utf-8
# Feature: Emoticons — Parsing de emoções textuais (estilo MSN)
# Spec: specs/features/103-ms-graph-messaging/spec.md
# 5 Cenários BDD — Emoticons renderizados no cliente, persistidos como texto

Funcionalidade: Emoticons textuais
  Como aluno da 42
  Quero enviar emoticons textuais que se convertem em imagens
  Para expressar emoções de forma rápida (estilo MSN Messenger clássico)

  Contexto:
    Dado que o sistema está rodando com Docker Compose
    E a migration 003 foi aplicada com sucesso
    E os usuários "marvin" (id=1) e "zeenyt__" (id=2) existem
    E existe um chat 1:1 entre marvin e zeenyt__

  # ─────────────────────────────────────────────────────────────
  # EMOTICON PARSING — 3 cenários
  # ─────────────────────────────────────────────────────────────

  @emoticons @rendering
  Cenário: (L) é renderizado como coração
    Dado que estou autenticado como "marvin"
    Quando envio POST /api/chats/{id}/messages com
      | content | Valeu pelo pair! (L) |
    Então recebo status HTTP 201
    E o body contém content = "Valeu pelo pair! (L)" (TEXTO PURO, sem conversão)
    E GET /api/chats/{id}/messages retorna content = "Valeu pelo pair! (L)"
    Quando zeenyt__ abre a mensagem no ChatWindow
    Então "(L)" é renderizado como a imagem do coração ❤️
    E o texto "Valeu pelo pair! " permanece intacto
    E nenhuma tag HTML ou markdown é inserida no banco

  @emoticons @rendering
  Cenário: :-) e :) são renderizados como rosto feliz
    Dado que estou autenticado como "marvin"
    Quando envio POST /api/chats/{id}/messages com
      | content | Ótimo resultado :) |
    Então recebo status HTTP 201
    E o body contém content = "Ótimo resultado :)" (TEXTO PURO)
    Quando zeenyt__ visualiza a mensagem
    Então ":)" é renderizado como a imagem 😊
    E "Ótimo resultado " permanece como texto normal

  @emoticons @rendering
  Cenário: :( é renderizado como rosto triste
    Dado que estou autenticado como "marvin"
    Quando envio POST /api/chats/{id}/messages com
      | content | Não funcionou :( |
    Então recebo status HTTP 201
    E o body contém content = "Não funcionou :(" (TEXTO PURO)
    Quando zeenyt__ visualiza a mensagem
    Então ":(" é renderizado como a imagem 😞
    E o restante do conteúdo permanece intacto

  # ─────────────────────────────────────────────────────────────
  # DATA INTEGRITY — 2 cenários
  # ─────────────────────────────────────────────────────────────

  @emoticons @storage
  Cenário: Emoticons persistem como texto puro no banco
    Dado que marvin enviou 100 mensagens com emoticons (L), :), :(
    Quando faço SELECT content FROM messages WHERE author_id=1
    Então cada linha retorna o TEXTO EXATO enviado: "(L)", ":)", ":("
    E nenhuma conversão para HTML ou emojis Unicode ocorreu no armazenamento
    E o banco permanece limpo (sem coluna body_html extra)

  @emoticons @rendering
  Cenário: Múltiplos emoticons em uma mensagem são todos renderizados
    Dado que estou autenticado como "marvin"
    Quando envio POST /api/chats/{id}/messages com
      | content | Legal! :) Legal demais! :) (L) (L) |
    Então recebo status HTTP 201
    E o body contém content = "Legal! :) Legal demais! :) (L) (L)" (TEXTO PURO)
    Quando zeenyt__ visualiza a mensagem
    Então todos os 4 emoticons são renderizados corretamente
    E a ordem e o contexto de cada emoticon são preservados
    E não há conflito de parsing entre emoticons adjacentes
