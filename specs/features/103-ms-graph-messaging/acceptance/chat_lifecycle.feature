# language: pt-BR
# encoding: utf-8
# Feature: Chat Lifecycle — Criar e gerenciar chats (oneOnOne, group, general)
# Spec: specs/features/103-ms-graph-messaging/spec.md
# 9 Cenários BDD — Ciclo de vida de conversas

Funcionalidade: Ciclo de vida de chats
  Como aluno da 42
  Quero criar conversas 1:1 e grupos
  Para comunicar organizadamente sem sobrecarregar o canal geral

  Contexto:
    Dado que o sistema está rodando com Docker Compose
    E a migration 003 foi aplicada com sucesso
    E os usuários "marvin" (id=1), "zeenyt__" (id=2) e "bocal" (id=3) existem
    E o chat "general" foi criado pelo seed da migration 003

  # ─────────────────────────────────────────────────────────────
  # CRIAR CHATS — 5 cenários
  # ─────────────────────────────────────────────────────────────

  @chats @lifecycle
  Cenário: Criar conversa 1:1 com sucesso retorna 201
    Dado que estou autenticado como "marvin"
    Quando faço POST /api/chats com
      | type    | oneOnOne |
      | members | [2]      |
    Então recebo status HTTP 201
    E o body contém um id UUID
    E o body contém type "oneOnOne"
    E o chat tem 2 membros: marvin e zeenyt__
    E marvin tem role "owner"
    E zeenyt__ tem role "member"

  @chats @lifecycle
  Cenário: Criar conversa de grupo com sucesso retorna 201
    Dado que estou autenticado como "marvin"
    Quando faço POST /api/chats com
      | type    | group             |
      | topic   | ft_printf study   |
      | members | [2, 3]            |
    Então recebo status HTTP 201
    E o body contém um id UUID
    E o body contém type "group"
    E o body contém topic "ft_printf study"
    E o chat tem 3 membros: marvin, zeenyt__, bocal
    E marvin tem role "owner"
    E zeenyt__ tem role "member"
    E bocal tem role "member"

  @chats @lifecycle
  Cenário: Criar oneOnOne duplicado com mesmo usuário retorna 409
    Dado que estou autenticado como "marvin"
    E existe um chat 1:1 entre marvin e zeenyt__
    Quando faço POST /api/chats com
      | type    | oneOnOne |
      | members | [2]      |
    Então recebo status HTTP 409
    E o body contém o código de erro "CHAT_ALREADY_EXISTS"
    E o novo chat não é criado

  @chats @lifecycle
  Cenário: Criar chat com membro inexistente retorna 404
    Dado que estou autenticado como "marvin"
    Quando faço POST /api/chats com
      | type    | oneOnOne |
      | members | [9999]   |
    Então recebo status HTTP 404
    E o body contém o código de erro "USER_NOT_FOUND"
    E nenhum chat é criado

  @chats @lifecycle
  Cenário: Criar chat com type inválido retorna 400
    Dado que estou autenticado como "marvin"
    Quando faço POST /api/chats com
      | type    | invalid_type |
      | members | [2]          |
    Então recebo status HTTP 400
    E o body contém o código de erro "INVALID_CHAT_TYPE"

  # ─────────────────────────────────────────────────────────────
  # LISTAR E DETALHAR CHATS — 2 cenários
  # ─────────────────────────────────────────────────────────────

  @chats @query
  Cenário: Listar chats do usuário retorna suas conversas
    Dado que estou autenticado como "marvin"
    E marvin tem 3 chats: um 1:1 com zeenyt__, um grupo e a sala general
    Quando faço GET /api/chats
    Então recebo status HTTP 200
    E o body contém um array de chats
    E o array tem 3 elementos
    E cada chat contém: id, type, created_at, member_count

  @chats @query
  Cenário: Detalhar chat mostra membros com roles
    Dado que estou autenticado como "marvin"
    E existe um chat com marvin (owner), zeenyt__ (member) e bocal (member)
    Quando faço GET /api/chats/{id}
    Então recebo status HTTP 200
    E o body contém id, type, created_at
    E o body contém um array "members"
    E o array tem 3 membros com fields: user_id, login, role, joined_at

  # ─────────────────────────────────────────────────────────────
  # GERENCIAR MEMBROS — 2 cenários
  # ─────────────────────────────────────────────────────────────

  @chats @members
  Cenário: Owner adiciona novo membro ao chat
    Dado que estou autenticado como "marvin" (owner do chat)
    E o chat tem zeenyt__ e bocal, mas não tem "marvin" (user id=1)
    Quando faço POST /api/chats/{id}/members com
      | user_id | 1 |
    Então recebo status HTTP 201
    E GET /api/chats/{id} mostra o novo membro com role "member"

  @chats @members
  Cenário: Owner remove membro do chat
    Dado que estou autenticado como "marvin" (owner do chat)
    E o chat tem zeenyt__ como membro
    Quando faço DELETE /api/chats/{id}/members/2
    Então recebo status HTTP 204
    E GET /api/chats/{id} não mostra zeenyt__ na lista de membros

  # ─────────────────────────────────────────────────────────────
  # SEGURANÇA — 1 cenário
  # ─────────────────────────────────────────────────────────────

  @chats @auth
  Cenário: Não-membro não pode acessar chat privado retorna 403
    Dado que estou autenticado como "bocal"
    E existe um chat 1:1 entre marvin e zeenyt__ (bocal não é membro)
    Quando faço GET /api/chats/{id}/messages
    Então recebo status HTTP 403
    E o body contém o código de erro "NOT_A_MEMBER"
    E a mensagem é "not a member of this chat"
