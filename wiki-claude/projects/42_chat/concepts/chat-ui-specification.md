---
title: "Especificação de UI do Chat — Estilo MSN Messenger"
category: concepts
tags: ["42-chat", "design", "frontend", "msn-messenger", "specification"]
sources:
  - "_raw/funcionalidade-chat.md"
summary: "Especificação detalhada da interface de chat inspirada no MSN Messenger (versões 7.5 e 8.5), dividida em Janela Principal (lista de contatos) e Janela de Conversa, com comportamentos interativos para QA."
base_confidence: 0.50
lifecycle: draft
lifecycle_changed: "2026-06-30"
tier: supporting
provenance:
  extracted: 0.85
  inferred: 0.10
  ambiguous: 0.05
relationships:
  - target: "[[projects/42_chat/42_chat]]"
    type: related_to
  - target: "[[references/42-graphic-charter-software]]"
    type: related_to
created: "2026-06-30T22:30:00Z"
updated: "2026-06-30T22:30:00Z"
---

# Especificação de UI do Chat — Estilo MSN Messenger

> Especificação da interface de chat inspirada no **MSN Messenger** (versões 7.5 e 8.5), dividida em componentes visuais, hierarquia de layout e comportamentos interativos. Documento destinado a agentes de Frontend e QA para interpretação, reconstrução e teste da interface.^[extracted]

---

## 1. Janela Principal (Lista de Contatos)

A janela principal atua como o painel de navegação e status do usuário. Formato retangular vertical (~300px × 600px).

### 1.1 Tema e Estilo Global

- **Background:** Degradê suave, geralmente de um azul celeste no topo para um branco ou azul muito claro na base.
- **Bordas:** Arredondadas nos cantos superiores (estilo Windows XP/Vista).
- **Tipografia:** Tahoma ou Segoe UI, tamanho padrão 8pt a 10pt.

### 1.2 Hierarquia de Componentes (Top-Down)

#### A. Cabeçalho e Menus

- **Barra de Título:** Ícone do MSN (borboleta), texto "MSN Messenger", e botões padrão do SO (Minimizar, Maximizar/Restaurar, Fechar).
- **Barra de Menus (Dropdowns):** Arquivo, Contatos, Ações, Ferramentas, Ajuda.

#### B. Cartão de Perfil do Usuário (User Card)

- **Avatar (Display Picture):** Um quadrado no lado esquerdo (aprox. 96×96px) com uma fina borda cinza. Pode ter um ícone de "webcam" sobreposto.
- **Nome de Exibição:** Texto em negrito, verde escuro ou azul, alinhado ao topo direito do avatar.
- **Mensagem Pessoal (Substatus):** Texto cinza, em itálico, logo abaixo do nome.
- **Seletor de Status:** Um pequeno ícone de um "boneco" (Buddy) com um dropdown arrow ao lado.

#### C. Barra de Ações Rápidas

- Ícones horizontais logo abaixo do perfil: Adicionar Contato (ícone com um '+'), Procurar Contatos, e um ícone de e-mail (com contador de mensagens não lidas no Hotmail).

#### D. Área da Lista de Contatos (Scrollable)

- **Grupos (Accordions):** Cabeçalhos expansíveis/colapsáveis (ex: "Amigos", "Família", "Colegas", "Offline"). Fundo levemente cinza ou translúcido.
- **Contatos Individuais:**
  - **Ícone de Status:** Fica à esquerda do nome.
  - **Nome:** Texto principal.
  - **Mensagem Pessoal:** Texto em cinza claro, na mesma linha ou na linha abaixo, dependendo da configuração.

#### E. Rodapé

- **Banner de Publicidade:** Retângulo fixo (ex: 234×60px) na parte inferior.
- **Caixa de Pesquisa:** Barra de busca "Procurar contatos ou na web".

### 1.3 Tabela de Estados de Status para QA

| Estado do Usuário | Cor do Ícone (Buddy) | Comportamento na Lista |
|---|---|---|
| **Online** | Verde | Agrupado nos contatos online. |
| **Ocupado (Busy)** | Vermelho | Ícone com sinal de "menos" branco. |
| **Ausente (Away)** | Laranja / Amarelo | Ícone com um relógio pequeno sobreposto. |
| **Offline** | Cinza (Desbotado) | Movido para o final da lista (Grupo "Offline"). |

---

## 2. Janela de Conversa (Chat Window)

A interface onde a interação ocorre. Formato retangular horizontal/quadrado (ex: 600px × 500px).

### 2.1 Estrutura de Layout (Grid/Flex)

A janela é dividida em duas colunas principais:

1. **Coluna Esquerda (75% da largura):** Área principal do chat e digitação.
2. **Coluna Direita (25% da largura):** Painel de avatares.

### 2.2 Componentes da Coluna Esquerda

#### A. Barra de Ferramentas de Ação (Topo)

- Fundo degradê. Contém ícones grandes com texto embaixo:
  - Convidar (adicionar alguém ao chat)
  - Enviar Arquivo
  - Webcam (ícone de câmera)
  - Áudio (ícone de microfone)
  - Atividades/Jogos (ícone de peça de quebra-cabeça)
  - Bloquear (ícone de escudo/pare)

#### B. Histórico de Conversa (Chat Log)

- **Área Branca Scrollable:** Onde as mensagens aparecem.
- **Formatação da Mensagem:**
  - Nome do contato (em negrito) seguido de "diz:"
  - A mensagem na linha de baixo (com a fonte, cor e tamanho personalizados pelo remetente).
- **Timestamps:** Visíveis ao lado do nome (ex: `[14:35]`).
- **Informações de Sistema:** Textos em cinza e centralizados (ex: *"João acabou de entrar."*, *"João está digitando uma mensagem..."*).

#### C. Barra de Ferramentas de Formatação (Divisória)

- Fica entre o histórico e a caixa de digitação. Contém pequenos botões de ícone:
  - **A (Fonte):** Cor, negrito, itálico, sublinhado.
  - **Smiley:** Menu popup de emoticons.
  - **Winks:** Ícone de um rosto rindo (animações em flash de tela cheia).
  - **Nudge (Chamar Atenção):** Ícone de uma janela vibrando.

#### D. Área de Input e Envio (Base)

- **Textarea:** Caixa branca onde o usuário digita. Suporta Rich Text (colar imagens, texto formatado).
- **Botão "Enviar":** Retangular, localizado no canto inferior direito da caixa de texto.

### 2.3 Componentes da Coluna Direita (Avatares)

- **Avatar do Contato (Topo):** Quadrado grande, emoldurado. Geralmente possui uma seta suspensa (dropdown) no canto para ações rápidas sobre o contato.
- **Espaço Vazio/Branding:** Meio da coluna esquerda.
- **Avatar Local (Base):** O avatar do próprio usuário, alinhado paralelamente à área de digitação.

---

## 3. Comportamentos Críticos para Agentes de QA (Test Cases)

Para que o agente de QA valide a interface dinamicamente, ele deve focar nos seguintes gatilhos e animações:

### 3.1 Validação de "Chamar a Atenção" (Nudge)

- **Ação:** Clicar no botão Nudge.
- **Expected Result:** A janela do chat (DOM inteiro) deve tremer fisicamente no eixo X e Y por cerca de 1 a 2 segundos. Um efeito sonoro de alerta deve ser acionado. O texto *"Você acabou de enviar um Chamar a Atenção!"* aparece no histórico.
- **Cooldown:** O botão deve ser desabilitado (disabled state) por alguns segundos após o uso para evitar spam.

### 3.2 Notificações Toast (Pop-ups de Canto)

- **Ação:** Um contato fica online.
- **Expected Result:** Um pequeno retângulo desliza de baixo para cima no canto inferior direito da tela inteira (fora da janela do MSN), exibindo o avatar, nome e o texto *"Acabou de entrar"*, acompanhado de um som característico.

### 3.3 Estados de Digitação

- **Ação:** O agente Frontend simula a entrada de texto na janela do contato remoto.
- **Expected Result:** A barra de status na parte inferior do chat log ou na barra de título exibe a animação/texto `[Nome do Contato] está digitando...`.

### 3.4 Parseamento de Emoticons Textuais

- **Ação:** Digitar `(L)` ou `:-)` no textarea e enviar.
- **Expected Result:** O Frontend deve renderizar as strings como imagens (um coração vermelho e um rosto sorridente clássico) dentro da div do histórico de chat, não como texto puro.

---

## Referências

- Fonte: Documento `funcionalidade-chat.md` (referência ao MSN Messenger v7.5/v8.5)
- [[projects/42_chat/42_chat]] — Projeto 42_chat
- [[references/42-graphic-charter-software]] — Paleta de cores e identidade visual da 42
