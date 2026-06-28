---
name: sdd-init-repo
description: >
  Inicializa ou adapta um repositório para Spec-Driven Development (SDD): cria
  .github/memory/ (constitution.md, tech.md), specs/ (domain-events, features, infra),
  e atualiza CLAUDE.md com a seção SDD Workflow. Agnóstico de linguagem. Trigger:
  iniciar SDD, init sdd, estrutura sdd, setup sdd, inicializar repo SDD, criar estrutura SDD.
when_to_use: >
  Entry point do pipeline SDD para repositórios novos ou existentes. Use quando o usuário
  quiser começar a usar SDD em um projeto. Nenhum pré-requisito — funciona em repos vazios.
allowed-tools: Read Write Bash
disable-model-invocation: true
---

# sdd-init-repo — Inicializar Repositório SDD

## Estrutura alvo

```
<repo>/
├── .github/memory/
│   ├── constitution.md       ← Portões de qualidade, restrições, anti-padrões
│   └── tech.md               ← Stack tecnológica homologada
├── specs/
│   ├── domain-events/        ← Contratos formais (AsyncAPI, OpenAPI)
│   ├── features/             ← Features numeradas (001-nome/spec.md, plan.md, tasks.md)
│   └── infra/                ← Declarações de infraestrutura
└── CLAUDE.md                 ← Atualizado com workflow SDD
```

## Instructions

### 1. Verificar estado atual

Liste a raiz do repositório. Se `.github/memory/` ou `specs/` existirem, pergunte:
preservar ou recriar?

### 2. Criar memória de contexto global

Carregue o template em `${CLAUDE_SKILL_DIR}/assets/templates/constitution-template.md`.
Crie `.github/memory/constitution.md` com o conteúdo do template.
Crie `.github/memory/tech.md` como placeholder (referenciando `sdd-explore-tech` para preenchimento futuro).

Alternativa: execute `bash ${CLAUDE_SKILL_DIR}/assets/scaffold-sdd.sh` se preferir automação.

### 3. Criar árvore de specs

```bash
mkdir -p specs/domain-events specs/features specs/infra
```

### 4. Atualizar CLAUDE.md

Carregue o template em `${CLAUDE_SKILL_DIR}/assets/sdd-workflow-claude-md.md`.

Leia o `CLAUDE.md` atual. Se já contém seção `## Fluxo SDD`, pule (idempotente).
Senão, faça merge do bloco ao final do arquivo. Se `CLAUDE.md` não existir, crie-o com o bloco.

### 5. Reportar e sugerir próximos passos

Informe o que foi criado e sugira:
1. `/sdd-explore-tech` — mapear a stack tecnológica
2. Preencher `constitution.md` com as regras do projeto (sempre confirmando com o usuário)
3. `/sdd-brainstorm` — criar a primeira feature

## Guardrails

- **Idempotência** — nunca sobrescreva arquivos existentes sem perguntar.
- **Agnóstico de linguagem** — não assuma stack. A estrutura SDD é independente.
- **CLAUDE.md preservado** — merge da seção SDD Workflow, nunca replace do arquivo inteiro.
- **constitution.md é sagrado** — regras nesse arquivo exigem confirmação do usuário.

## Checklist

- [ ] `.github/memory/constitution.md` e `tech.md` existem
- [ ] `specs/{domain-events,features,infra}/` são diretórios
- [ ] `CLAUDE.md` contém seção "## Fluxo SDD"
- [ ] Se algo já existia, usuário aprovou preservar/sobrescrever

## Additional Resources

- `${CLAUDE_SKILL_DIR}/assets/templates/constitution-template.md` — template da constituição
- `${CLAUDE_SKILL_DIR}/assets/templates/spec-template.md` — template de spec.md
- `${CLAUDE_SKILL_DIR}/assets/templates/plan-template.md` — template de plan.md
- `${CLAUDE_SKILL_DIR}/assets/templates/tasks-template.md` — template de tasks.md
- `${CLAUDE_SKILL_DIR}/assets/sdd-workflow-claude-md.md` — bloco SDD para CLAUDE.md
- `${CLAUDE_SKILL_DIR}/assets/scaffold-sdd.sh` — script de automação da estrutura SDD
