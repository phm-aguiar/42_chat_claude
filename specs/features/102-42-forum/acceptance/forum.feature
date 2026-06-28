# language: pt-BR
# Feature: 42 Forum — Fórum tech para alunos da 42
# Spec: specs/features/102-42-forum/spec.md

Funcionalidade: Fórum de tech da 42
  Como aluno da 42
  Quero compartilhar descobertas e conhecimento técnico
  Em boards organizados por tema, com identidade real

  Contexto:
    Dado que o sistema está rodando com Docker Compose
    E a migration 002_add_forum foi aplicada
    E os 5 seed boards existem (/tech, /projects, /career, /events, /random)

  # ─── Boards ───────────────────────────────────────────

  Cenário: Aluno vê lista de boards na landing page
    Quando acesso GET /api/forum/boards
    Então recebo status 200
    E o body contém um array com 5 boards
    E cada board tem slug, name, description, sfw

  Cenário: Admin cria um novo board
    Dado que estou autenticado como admin
    Quando crio POST /api/forum/boards com slug "gamedev", name "Game Development"
    Então recebo status 201
    E o board aparece em GET /api/forum/boards

  Cenário: Slug reservado é rejeitado
    Dado que estou autenticado como admin
    Quando tento POST /api/forum/boards com slug "admin"
    Então recebo status 400
    E o body contém "slug reservado"

  Cenário: Board owner edita settings do board
    Dado que sou owner do board /tech
    Quando faço PATCH /api/forum/boards/tech com name "Technology"
    Então recebo status 200
    E GET /api/forum/boards/tech retorna name "Technology"

  Cenário: Não-owner não edita board
    Dado que NÃO sou staff do board /tech
    Quando tento PATCH /api/forum/boards/tech
    Então recebo status 403

  Cenário: Board sem threads mostra mensagem vazia
    Dado que o board /events não tem threads
    Quando acesso GET /api/forum/boards/events/threads
    Então recebo status 200
    E o array de threads está vazio

  # ─── Threads ──────────────────────────────────────────

  Cenário: Aluno cria uma thread em um board
    Dado que estou autenticado como aluno
    Quando crio POST /api/forum/boards/tech/threads
      | title   | Como compilar Kernel BSD?          |
      | content | # Kernel BSD\n\nGuia passo a passo |
      | tags    | ["bsd", "kernel", "c"]             |
    Então recebo status 201
    E o body contém um id UUID
    E GET /api/forum/boards/tech/threads mostra a thread no topo

  Cenário: Título muito curto é rejeitado
    Dado que estou autenticado
    Quando tento criar thread com title "Oi"
    Então recebo status 400

  Cenário: Título muito longo é rejeitado
    Dado que estou autenticado
    Quando tento criar thread com title de 201 caracteres
    Então recebo status 400

  Cenário: Conteúdo maior que 10k chars é rejeitado
    Dado que estou autenticado
    Quando tento criar thread com content de 10001 caracteres
    Então recebo status 400

  Cenário: Threads em bump order com pinned no topo
    Dado que o board /tech tem 3 threads (A criada primeiro, B depois, C pinned)
    Quando acesso GET /api/forum/boards/tech/threads
    Então a primeira thread é C (pinned)
    E a segunda é B (último bump)
    E a terceira é A (mais antiga)

  # ─── Posts ────────────────────────────────────────────

  Cenário: Aluno responde uma thread
    Dado que estou autenticado
    E a thread /tech/thread/{id} existe e não está locked
    Quando crio POST /api/forum/threads/{id}/posts com content "Resposta"
    Então recebo status 201
    E GET /api/forum/threads/{id} mostra 2 posts (OP + reply)
    E post_count da thread é 2

  Cenário: Reply com reply_to referencia outro post
    Dado que estou autenticado
    E existe um post anterior com id {postId} na thread
    Quando crio POST /api/forum/threads/{id}/posts
      | content  | Concordo com você!    |
      | reply_to | {postId}              |
    Então recebo status 201
    E o post criado tem reply_to = {postId}

  Cenário: Não é possível postar em thread locked
    Dado que a thread está locked (is_locked = true)
    Quando tento POST /api/forum/threads/{id}/posts
    Então recebo status 403
    E o body contém "THREAD_LOCKED"

  # ─── Moderação ────────────────────────────────────────

  Cenário: Mod fixa uma thread (pin)
    Dado que sou mod do board /tech
    E a thread /tech/thread/{id} não está pinned
    Quando faço PATCH /api/forum/threads/{id} com is_pinned = true
    Então recebo status 200
    E a thread aparece no topo com is_pinned = true

  Cenário: Mod fecha uma thread (lock)
    Dado que sou mod do board /tech
    E a thread /tech/thread/{id} não está locked
    Quando faço PATCH /api/forum/threads/{id} com is_locked = true
    Então recebo status 200
    E alunos não conseguem mais postar na thread

  Cenário: Mod deleta uma thread (soft delete)
    Dado que sou mod do board /tech
    Quando faço DELETE /api/forum/threads/{id}
    Então recebo status 200
    E a thread não aparece mais em GET /api/forum/boards/tech/threads

  Cenário: Mod deleta um post (soft delete)
    Dado que sou mod do board /tech
    Quando faço DELETE /api/forum/posts/{id}
    Então recebo status 200
    E o post aparece como "[deleted]" na thread

  Cenário: Não-mod não consegue moderar
    Dado que NÃO sou staff do board /tech
    Quando tento PATCH /api/forum/threads/{id} com is_pinned = true
    Então recebo status 403

  # ─── Board Staff ──────────────────────────────────────

  Cenário: Owner adiciona mod ao board
    Dado que sou owner do board /tech
    Quando faço POST /api/forum/boards/tech/staff com user_id = 42, role = "mod"
    Então recebo status 200
    E o usuário 42 é mod do board /tech

  Cenário: Owner remove staff do board
    Dado que sou owner do board /tech
    E o usuário 42 é mod do board /tech
    Quando faço DELETE /api/forum/boards/tech/staff/42
    Então recebo status 200
    E o usuário 42 não é mais staff do board /tech

  # ─── API 42 Integration ───────────────────────────────

  Cenário: Título do aluno aparece como badge nos posts
    Dado que o aluno "marvin" tem título "Go Expert" na API 42
    Quando "marvin" faz login OAuth2
    Então users.title = "Go Expert"
    E os posts do marvin exibem o badge "Go Expert 🏆"

  Cenário: Skills do aluno são sugeridas ao criar thread
    Dado que o aluno "marvin" tem skills ["Go", "C", "Web"] na API 42
    Quando "marvin" faz login OAuth2
    Então users.skills = ["Go", "C", "Web"]
    E ao criar thread, o autocomplete de tags sugere "Go", "C", "Web"

  Cenário: Aluno sem título não mostra badge
    Dado que o aluno "evaluatee" não tem título na API 42
    Quando "evaluatee" faz login
    Então users.title é NULL
    E os posts não exibem badge

  # ─── Usuário deletado ─────────────────────────────────

  Cenário: Post de usuário deletado mostra "[deleted]"
    Dado que um post existe com author_id = 999
    Quando o usuário 999 é deletado do sistema
    Então o post continua visível
    Mas o login do autor aparece como "[deleted]"

  Cenário: Reply-to de post deletado mostra referência
    Dado que um post referencia reply_to = {deletedPostId}
    E o post {deletedPostId} tem deleted_at não nulo
    Quando acesso GET /api/forum/threads/{id}
    Então o post de resposta mostra "Em resposta a [deleted]"
