# language: pt-BR
# encoding: utf-8
# Feature: Typing Indicator — Indicador efêmero de digitação
# Spec: specs/features/103-ms-graph-messaging/spec.md
# 4 Cenários BDD — Eventos efêmeros de digitação com TTL 5s

Funcionalidade: Indicador de digitação
  Como aluno da 42
  Quero ver quando outro membro está digitando
  Para evitar sobreposição de respostas e melhorar a experiência de conversa

  Contexto:
    Dado que o sistema está rodando com Docker Compose
    E a migration 003 foi aplicada com sucesso
    E os usuários "marvin" (id=1) e "zeenyt__" (id=2) existem
    E existe um chat 1:1 entre marvin e zeenyt__
    E ambos estão conectados via WS ao chat com id correto

  # ─────────────────────────────────────────────────────────────
  # TYPING EVENTS — 2 cenários
  # ─────────────────────────────────────────────────────────────

  @typing
  Cenário: Membro recebe evento de digitação do outro
    Dado que marvin está digitando (keystroke no ChatInput)
    Quando marvin emite evento WS {"type":"typing","chat_id":"<id>"}
    Então zeenyt__ recebe o evento broadcast
    E o evento contém {"type":"typing","login":"marvin","chat_id":"<id>"}
    E zeenyt__ exibe na UI "@marvin está digitando..."
    E nenhum registro é inserido no PostgreSQL

  @typing
  Cenário: Indicador de digitação expira após 5 segundos
    Dado que marvin emitiu evento de digitação em T=0
    Quando aguardo 5.1 segundos sem novo evento
    Então zeenyt__ para de ver "@marvin está digitando..."
    E a UI retorna ao estado normal
    E o indicador expirou no frontend (nenhuma persistence no backend)

  # ─────────────────────────────────────────────────────────────
  # PERFORMANCE — 2 cenários
  # ─────────────────────────────────────────────────────────────

  @typing @performance
  Cenário: Frontend debounce evita spam de eventos typing
    Dado que marvin está no ChatInput e digita rapidamente
    Quando marvin emite 10 keystroke em 2 segundos
    Então o frontend envia apenas ~2-3 eventos typing (debounce 1s)
    E zeenyt__ recebe um evento suave sem flickering
    E o servidor não é sobrecarregado com eventos

  @typing @performance
  Cenário: Typing indicator não persiste no banco
    Dado que marvin dispara 100 eventos de digitação em 1 minuto
    Quando a migration 003 foi aplicada
    Então SELECT COUNT(*) FROM messages retorna 0 novas linhas
    E SELECT COUNT(*) FROM chats retorna o mesmo (nenhuma alteração)
    E nenhuma tabela cresceu por causa de typing events
    E o banco de dados permanece limpo e eficiente
