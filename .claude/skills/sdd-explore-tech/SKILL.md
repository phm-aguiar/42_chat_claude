---
name: sdd-explore-tech
description: >
  Escaneia o repositório e preenche .github/memory/tech.md com a stack tecnológica detectada.
  Identifica linguagens, frameworks, build tools, CI, linters e padrões de teste a partir dos
  arquivos reais do projeto. Nunca inventa stack — só reporta o que está nos arquivos.
  Trigger: mapear tech stack, explorar tecnologia, preencher tech.md, detectar stack,
  explore tech, what tech does this repo use.
when_to_use: >
  Use após sdd-init-repo para popular .github/memory/tech.md, ou sempre que o usuário quiser
  mapear ou atualizar a stack tecnológica do projeto. Pré-requisito: .github/memory/ existe.
allowed-tools: Read Write Bash
disable-model-invocation: true
---

# sdd-explore-tech — Mapear Stack Tecnológica

## Prerequisites

- `.github/memory/` deve existir (criado por `sdd-init-repo`).

## Instructions

### 1. Detectar linguagens e manifestos

Busque pelos seguintes arquivos de manifesto:

| Arquivo | Linguagem |
|---|---|
| `go.mod` | Go |
| `package.json` | Node.js / TypeScript |
| `Cargo.toml` | Rust |
| `pom.xml`, `build.gradle*` | Java/Kotlin |
| `requirements.txt`, `pyproject.toml`, `setup.py` | Python |
| `Gemfile` | Ruby |
| `mix.exs` | Elixir |
| `CMakeLists.txt` | C/C++ |
| `*.csproj`, `*.sln` | .NET |

### 2. Extrair versões e dependências

Para cada manifesto encontrado, leia e extraia: versão da linguagem, frameworks principais,
ferramentas de build.

### 3. Detectar CI e ferramentas auxiliares

Escanear: `.github/workflows/`, linters (`.golangci.yml`, `.eslintrc*`), Docker
(`Dockerfile`, `docker-compose*`), task runners (`Makefile`, `justfile`),
padrões de teste (`_test.go`, `*.test.ts`, `*.spec.ts`).

### 4. Preencher tech.md

Carregue o template em `${CLAUDE_SKILL_DIR}/assets/tech-template.md`.

Preencha com os dados coletados. Use `—` para entradas não encontradas.
Se `tech.md` já existe, pergunte: sobrescrever ou mesclar?

```bash
# Escreva em:
.github/memory/tech.md
```

### 5. Reportar

Resuma o que foi detectado e pergunte se o usuário quer ajustar algo.

## Guardrails

- **Nunca invente stack** — apenas o detectado em arquivos reais.
- **Campos vazios = `—`** — não preencha com suposições.
- **Nenhum manifesto encontrado** — alerte: repo pode estar vazio ou usar linguagem não suportada.
- **tech.md existente** — pergunte antes de sobrescrever.

## Checklist

- [ ] `.github/memory/tech.md` existe com todas as seções do template
- [ ] Cada entrada tem fonte (arquivo detectado) ou `—`
- [ ] Nenhuma dependência foi inventada
- [ ] Usuário pode ajustar manualmente se algo faltar

## Additional Resources

- `${CLAUDE_SKILL_DIR}/assets/tech-template.md` — template canônico para tech.md
