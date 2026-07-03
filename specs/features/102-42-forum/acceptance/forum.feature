# language: pt-BR
# encoding: utf-8
# Feature: 42 Forum — Fórum tech para alunos da 42
# Spec: specs/features/102-42-forum/spec.md
# 22 Cenários BDD (Gherkin) — Acceptance Criteria da Feature 102

Funcionalidade: Fórum de tech da 42
  Como aluno da 42
  Quero compartilhar descobertas e conhecimento técnico
  Em boards organizados por tema, com identidade real

  Contexto:
    Dado que o sistema está rodando com Docker Compose
    E a migration 002_add_forum foi aplicada
    E os 5 seed boards existem: /tech, /projects, /career, /events, /random

  # ─────────────────────────────────────────────────────────────
  # BOARDS — 5 cenários
  # ─────────────────────────────────────────────────────────────

  @boards
  Cenário: Listar boards públicos retorna os 5 seed boards
    Quando acesso GET /api/forum/boards sem autenticação
    Então recebo status HTTP 200
    E o body contém um array de boards
    E cada board contém os campos: slug, name, description, sfw
    E os 5 seed boards estão presentes: tech, projects, career, events, random

  @boards
  Cenário: Acessar um board existente por slug
    Quando acesso GET /api/forum/boards/tech sem autenticação
    Então recebo status HTTP 200
    E o body contém um objeto com slug "tech"
    E o objeto contém os campos: id, slug, name, owner_id, is_locked

  @boards
  Cenário: Board inexistente retorna erro BOARD_NOT_FOUND
    Quando acesso GET /api/forum/boards/inexistente sem autenticação
    Então recebo status HTTP 404
    E o body contém o código de erro "BOARD_NOT_FOUND"
    E o body contém uma mensagem descritiva

  @boards @auth
  Cenário: Criar board sem token retorna 401
    Quando tento POST /api/forum/boards sem token
      | slug | gamedev         |
      | name | Game Development |
    Então recebo status HTTP 401
    E o body contém o código de erro "UNAUTHORIZED"

  @boards @auth
  Cenário: Criar board com slug reservado é rejeitado
    Dado que estou autenticado como admin
    Quando tento POST /api/forum/boards com slug "admin"
      | name | Admin Board |
    Então recebo status HTTP 400
    E o body contém o código de erro "SLUG_RESERVED"

  # ─────────────────────────────────────────────────────────────
  # THREADS — 7 cenários
  # ─────────────────────────────────────────────────────────────

  @threads
  Cenário: Criar thread em board aberto com título e conteúdo válidos
    Dado que estou autenticado como aluno
    Quando crio POST /api/forum/boards/tech/threads
      | title   | Como compilar kernel BSD?     |
      | content | # Passo 1\n\nBaixar fonte...   |
      | tags    | ["bsd", "kernel", "c"]        |
    Então recebo status HTTP 201
    E o body contém um id UUID
    E GET /api/forum/boards/tech/threads mostra a thread criada

  @threads
  Cenário: Board locked rejeita criação de nova thread
    Dado que estou autenticado como aluno
    E o board /projects está locked (is_locked = true)
    Quando tento POST /api/forum/boards/projects/threads
      | title   | Meu projeto    |
      | content | Descrição aqui |
    Então recebo status HTTP 403
    E o body contém o código de erro "BOARD_LOCKED"

  @threads
  Cenário: Título menor que 3 caracteres é rejeitado
    Dado que estou autenticado como aluno
    Quando tento POST /api/forum/boards/tech/threads com title "Ok"
      | content | Conteúdo válido |
    Então recebo status HTTP 400
    E o body contém o código de erro "INVALID_TITLE"

  @threads
  Cenário: Título maior que 200 caracteres é rejeitado
    Dado que estou autenticado como aluno
    Quando tento POST /api/forum/boards/tech/threads com title de 201 caracteres
      | content | Conteúdo válido |
    Então recebo status HTTP 400
    E o body contém o código de erro "INVALID_TITLE"

  @threads
  Cenário: Conteúdo maior que 10000 caracteres é rejeitado
    Dado que estou autenticado como aluno
    Quando tento POST /api/forum/boards/tech/threads
      | title   | Tema válido     |
      | content | "x" repetido 10001 vezes |
    Então recebo status HTTP 400
    E o body contém o código de erro "CONTENT_TOO_LONG"

  @threads
  Cenário: Threads são listadas em bump order com pinned no topo
    Dado que estou autenticado como aluno
    E o board /tech tem 3 threads: A (criada primeiro), B (depois), C (pinned)
    Quando acesso GET /api/forum/boards/tech/threads
    Então recebo status HTTP 200
    E a thread C aparece na posição 0 (é pinned)
    E a thread B aparece na posição 1 (último post)
    E a thread A aparece na posição 2 (mais antiga)

  @threads
  Cenário: Thread nova sobe ao topo após novo post (bump)
    Dado que estou autenticado como aluno
    E o board /tech tem 2 threads: A (mais recente), B (mais antiga)
    Quando crio POST /api/forum/threads/{id_de_B}/posts com content "Resposta"
    Então a thread B tem last_post_at atualizado
    E GET /api/forum/boards/tech/threads mostra B na posição 0
    E GET /api/forum/boards/tech/threads mostra A na posição 1

  # ─────────────────────────────────────────────────────────────
  # POSTS — 5 cenários
  # ─────────────────────────────────────────────────────────────

  @posts
  Cenário: Aluno responde uma thread aberta
    Dado que estou autenticado como aluno
    E existe uma thread em /api/forum/threads/{id} que não está locked
    Quando crio POST /api/forum/threads/{id}/posts com content "Concordo com você!"
    Então recebo status HTTP 201
    E o body contém um id UUID do novo post
    E GET /api/forum/threads/{id} mostra post_count = 2 (OP + reply)

  @posts
  Cenário: Thread locked rejeita novo post com erro THREAD_LOCKED
    Dado que estou autenticado como aluno
    E existe uma thread locked (is_locked = true)
    Quando tento POST /api/forum/threads/{id_locked}/posts com content "Resposta"
    Então recebo status HTTP 403
    E o body contém o código de erro "THREAD_LOCKED"

  @posts
  Cenário: Post com reply_to aninhado mantém referência
    Dado que estou autenticado como aluno
    E existe um post com id {postId} em uma thread
    Quando crio POST /api/forum/threads/{id}/posts
      | content  | Em resposta: concordo |
      | reply_to | {postId}              |
    Então recebo status HTTP 201
    E o post criado tem reply_to = {postId}
    E GET /api/forum/threads/{id}/posts mostra a referência

  @posts
  Cenário: post_count da thread incrementa com novo post
    Dado que estou autenticado como aluno
    E GET /api/forum/threads/{id} mostra post_count = 1 (OP)
    Quando crio POST /api/forum/threads/{id}/posts com content "Reply 1"
    E crio POST /api/forum/threads/{id}/posts com content "Reply 2"
    Então GET /api/forum/threads/{id} mostra post_count = 3

  @posts
  Cenário: Posts são listados em ordem cronológica (created_at)
    Dado que estou autenticado como aluno
    E uma thread tem 3 posts: OP, Reply1 (T+1s), Reply2 (T+2s)
    Quando acesso GET /api/forum/threads/{id}/posts
    Então o primeiro post é o OP (created_at mais antigo)
    E o segundo post é Reply1
    E o terceiro post é Reply2 (created_at mais recente)

  # ─────────────────────────────────────────────────────────────
  # MODERAÇÃO — 3 cenários
  # ─────────────────────────────────────────────────────────────

  @moderacao
  Cenário: Mod pina uma thread com is_pinned = true
    Dado que estou autenticado como mod do board /tech
    E existe uma thread em /api/forum/threads/{id} que não está pinned
    Quando faço PATCH /api/forum/threads/{id} com is_pinned = true
    Então recebo status HTTP 200
    E GET /api/forum/boards/tech/threads mostra a thread na posição 0

  @moderacao
  Cenário: Mod tranca uma thread com is_locked = true
    Dado que estou autenticado como mod do board /tech
    E existe uma thread em /api/forum/threads/{id} que não está locked
    Quando faço PATCH /api/forum/threads/{id} com is_locked = true
    Então recebo status HTTP 200
    E alunos comuns recebem 403 THREAD_LOCKED ao tentar postar

  @moderacao
  Cenário: Soft delete de post esconde sem apagar dados
    Dado que estou autenticado como mod do board /tech
    E existe um post em /api/forum/posts/{id}
    Quando faço DELETE /api/forum/posts/{id}
    Então recebo status HTTP 200
    E o post tem deleted_at não nulo
    E GET /api/forum/threads/{thread_id}/posts não mostra o post deleted
    E mas os dados do post continuam no banco de dados (soft delete)

  # ─────────────────────────────────────────────────────────────
  # AUTH / IDENTIDADE — 2 cenários
  # ─────────────────────────────────────────────────────────────

  @auth
  Cenário: POST sem token retorna 401 UNAUTHORIZED
    Quando tento POST /api/forum/boards/tech/threads sem token
      | title   | Tema |
      | content | Conteúdo |
    Então recebo status HTTP 401
    E o body contém o código de erro "UNAUTHORIZED"

  @auth @identidade
  Cenário: Post exibe login real do autor sem anonimato
    Dado que estou autenticado como aluno "marvin"
    Quando crio POST /api/forum/boards/tech/threads
      | title   | Pergunta técnica |
      | content | Qual é o jeito?  |
    E GET /api/forum/threads/{id}/posts
    Então cada post contém um campo author.login = "marvin"
    E cada post contém um campo author.image_url (avatar)
    E o login "marvin" é visível ao consultar a thread (sem anonimato)
