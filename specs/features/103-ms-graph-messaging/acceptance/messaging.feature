# language: pt-BR
# encoding: utf-8
# Feature: Messaging — Enviar, receber e listar mensagens em chats
# Spec: specs/features/103-ms-graph-messaging/spec.md
# 7 Cenários BDD — Sistema de mensagens com paginação e soft delete

Funcionalidade: Sistema de mensagens em chats
  Como aluno da 42
  Quero enviar e receber mensagens em conversas privadas
  Para coordenar pair programming e grupos de estudo sem ruído

  Contexto:
    Dado que o sistema está rodando com Docker Compose
    E a migration 003 foi aplicada com sucesso
    E os usuários "marvin" (id=1) e "zeenyt__" (id=2) existem
    E o chat "general" foi criado com id fixo pelo seed da migration 003
    E existe um chat 1:1 entre marvin e zeenyt__

  # ─────────────────────────────────────────────────────────────
  # ENVIAR E RECEBER — 2 cenários
  # ─────────────────────────────────────────────────────────────

  @messaging @send
  Cenário: Membro envia mensagem REST em seu chat
    Dado que estou autenticado como "marvin"
    Quando faço POST /api/chats/{id}/messages com
      | content | Oi zeenyt__, tudo bem? |
    Então recebo status HTTP 201
    E o body contém um id UUID
    E o body contém author_id = 1
    E o body contém created_at
    E o body contém content = "Oi zeenyt__, tudo bem?"

  @messaging @broadcast
  Cenário: Broadcast de mensagem é isolado por chat
    Dado que estou autenticado como "marvin"
    E marvin está conectado via WS ao chat 1:1 (id=A)
    E marvin está conectado via WS ao chat "general" (id=B)
    Quando marvin envia POST /api/chats/A/messages com "oi"
    Então marvin recebe o broadcast com {"type":"message","chat_id":"A"}
    E marvin NÃO recebe o broadcast no chat B
    E nenhuma mensagem vaza entre chats

  # ─────────────────────────────────────────────────────────────
  # LISTAR COM PAGINAÇÃO — 2 cenários
  # ─────────────────────────────────────────────────────────────

  @messaging @pagination
  Cenário: Listar histórico com paginação por cursor
    Dado que estou autenticado como "marvin"
    E o chat tem 120 mensagens com timestamps crescentes
    Quando faço GET /api/chats/{id}/messages?limit=50
    Então recebo status HTTP 200
    E o body contém um array de 50 mensagens em ordem cronológica (OP mais antigo)
    E o body contém "has_more" = true
    E o body contém "next_before" = <RFC3339 timestamp>

  @messaging @pagination
  Cenário: Paginar para trás sem overlap
    Dado que estou autenticado como "marvin"
    E ja recebi 50 mensagens mais recentes com next_before = T1
    Quando faço GET /api/chats/{id}/messages?before=T1&limit=50
    Então recebo status HTTP 200
    E o body contém 50 mensagens ANTERIORES a T1
    E nenhuma mensagem da página anterior aparece novamente
    E as mensagens estão em ordem cronológica

  # ─────────────────────────────────────────────────────────────
  # SOFT DELETE — 1 cenário
  # ─────────────────────────────────────────────────────────────

  @messaging @delete
  Cenário: Mod faz soft delete de mensagem com tombstone
    Dado que estou autenticado como "marvin" (mod do chat)
    E existe uma mensagem M com id U, author_id=2, content="spam"
    Quando faço DELETE /api/messages/U
    Então recebo status HTTP 204
    E GET /api/chats/{id}/messages não mostra a mensagem M
    E o registro no banco tem deleted_at != NULL
    E SELECT deleted_at FROM messages WHERE id=U retorna NOT NULL
    E a mensagem preserva seu id e created_at para auditoria

  # ─────────────────────────────────────────────────────────────
  # BACKWARD COMPATIBILITY — 1 cenário
  # ─────────────────────────────────────────────────────────────

  @messaging @compatibility
  Cenário: Cliente Feature-100 conecta sem chat_id e recebe geral
    Dado que estou autenticado com token JWT
    Quando conecto via WS com /ws?token=<jwt> (SEM chat_id)
    Então sou conectado implicitamente ao chat "general"
    E posso enviar POST /api/chats/{general_id}/messages normalmente
    E recebo broadcasts apenas do chat "general"
    E Feature 100 frontend continua funcionando sem alteração

  # ─────────────────────────────────────────────────────────────
  # DATA INTEGRITY — 1 cenário
  # ─────────────────────────────────────────────────────────────

  @messaging @migration
  Cenário: Backfill da migration 003 preserva mensagens existentes
    Dado que o banco tem 5000 mensagens da Feature 100 (sem chat_id)
    Quando a migration 003 é aplicada
    Então todas as 5000 mensagens recebem chat_id = <uuid do general>
    E SELECT COUNT(*) FROM messages retorna 5000 (sem perda)
    E todas as mensagens preservam author_id, content, created_at
    E o chat "general" é criado com uuid fixo para traceability
