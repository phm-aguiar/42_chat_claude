# Regras de Geração de Tarefas com DAG (tasks.md)

Referência para `sdd-generate_tasks` v2.0.0. Contém regras de atomicidade, formato DAG,
detecção de paralelismo, mapeamento spec→tasks e fases canônicas.

## Regras de Atomicidade (OBRIGATÓRIO)

1. **Uma ação por tarefa**: cada `Tnnn` faz exatamente uma coisa. "Criar X e testar Y" são duas tarefas.
2. **Paralelizável por fase**: tarefas na mesma fase podem ser paralelas se:
   - Nenhuma depende da outra (dependências disjuntas)
   - Seus conjuntos de `Arquivos` são disjuntos (interseção vazia)
3. **Formato DAG**: cada task tem metadados completos (Papel, Dependências, Paralelizável, Arquivos).
4. **Numeração sequencial global**: `T001`, `T002`... não reinicia por fase.
5. **Checkbox**: `[ ]` para pendente, `[x]` para já concluído.

## Formato DAG da Task

```markdown
- [ ] **Tnnn:** Descrição da tarefa
  - **Papel:** researcher | analyst | executor
  - **Dependências:** Txxx, Tyyy | Nenhuma
  - **Paralelizável:** true | false
  - **Arquivos:** `path/to/file.go`, `path/to/other.go`
```

### Campos

| Campo | Descrição | Valores |
|---|---|---|
| `Papel` | Tipo de subagente que executa | `researcher`, `analyst`, `executor` |
| `Dependências` | IDs que devem estar `[x]` antes | `T001, T002` ou `Nenhuma` |
| `Paralelizável` | Pode rodar com outras da mesma fase | `true` ou `false` |
| `Arquivos` | Paths que a task cria/modifica | Lista exaustiva, extensões explícitas |

## Detecção de Paralelismo (Regra Primária)

Duas tasks T_A e T_B na mesma fase são paralelizáveis **se e somente se:**

1. **Sem dependência cruzada:** T_A não depende de T_B e T_B não depende de T_A
2. **Arquivos disjuntos:** `Arquivos(T_A) ∩ Arquivos(T_B) = ∅`

Se violarem a regra 2:
- Force `Paralelizável: false` em uma delas
- Adicione dependência explícita (a segunda depende da primeira)
- Alerte: "T_A e T_B compartilham <arquivo> — forçado sequencial"

### Exceções inteligentes

- **Extensões diferentes no mesmo diretório:** executor gerando `chat.feature` e executor gerando `message.go` em `specs/features/004-*/acceptance/` — sem conflito real. Extensões `.feature` ≠ `.go`.
- **Arquivo único inevitável:** ex: `main.go` é shared. Se duas tasks executor tocam `main.go`, force sequencial e alerte.

## Mapeamento spec/plan → tarefas DAG

| Fonte no spec/plan | Gera task | Papel |
|---|---|---|
| Exploração de base de código desconhecida | "Mapear padrões existentes em X" | researcher |
| Auditoria de constituição | "Auditar feature Y contra constitution.md" | analyst |
| Plano de execução para feature nova | "Derivar plano atômico para X" | analyst |
| Restrições de segurança/performance | "Adicionar validação para restrição X" | executor |
| Cenários BDD | "Implementar cenário: Dado X, Quando Y, Então Z" | executor |
| Cenários de aceitação (Gherkin) | "Criar cenários Gherkin para feature X" | executor |
| Contratos (OpenAPI/AsyncAPI) | "Criar/atualizar contrato Y" | executor |
| Decisões arquiteturais (ADR) | "Implementar ADR-NNN: descrição" | executor |
| Componentes do plan | "Criar diretório/arquivo para componente Y" | executor |
| Portões do constitution.md | "Adicionar teste para Z" | executor |
| Ferramentas de build/CI | "Configurar pipeline/linter Y" | executor |
| Smoke test fim a fim | "Executar smoke test" | executor |
| Documentação | "Atualizar README/llms.txt" | executor |

## Fases canônicas

Agrupe tarefas nestas 4 fases. Tasks na mesma fase que satisfazem as regras de paralelismo são `Paralelizável: true`.

| Fase | Conteúdo típico | Papel comum |
|---|---|---|
| **Fase 0: Descoberta** (opcional) | Explorar codebase, evidências, contexto | researcher + analyst |
| **Fase 1: Fundação** | Contratos, schemas, configs, estrutura | executor |
| **Fase 2: Implementação** | Lógica de negócio, adapters, handlers, testes | executor |
| **Fase 3: Validação** | Smoke test, CI, linting, revisão constitution | executor |
| **Fase 4: Documentação** | README, llms.txt, CLAUDE.md | executor |

## Exemplo de DAG completo

```markdown
# tasks.md: Feature Chat Messages

## Fase 1: Fundação
- [ ] **T001:** Criar modelo Message
  - **Papel:** executor
  - **Dependências:** Nenhuma
  - **Paralelizável:** true
  - **Arquivos:** `internal/model/message.go`

- [ ] **T002:** Criar schema do banco (migration)
  - **Papel:** executor
  - **Dependências:** T001
  - **Paralelizável:** false
  - **Arquivos:** `internal/db/migrations/001_create_messages.sql`

## Fase 2: Implementação (paralela)
- [ ] **T003:** Criar handler HTTP POST /messages
  - **Papel:** executor
  - **Dependências:** T001, T002
  - **Paralelizável:** true
  - **Arquivos:** `internal/handler/message_handler.go`

- [ ] **T004:** Criar cenários de aceitação (Gherkin)
  - **Papel:** executor
  - **Dependências:** Nenhuma
  - **Paralelizável:** true
  - **Arquivos:** `specs/features/004-*/acceptance/chat.feature`

- [ ] **T005:** Criar testes unitários do modelo Message
  - **Papel:** executor
  - **Dependências:** T001
  - **Paralelizável:** true
  - **Arquivos:** `internal/model/message_test.go`

## Fase 3: Finalização
- [ ] **T006:** Smoke test fim a fim
  - **Papel:** executor
  - **Dependências:** T003, T004, T005
  - **Paralelizável:** false
  - **Arquivos:** `test/smoke_test.go`
```

## Exemplo de sumário para AskUserQuestion

```
tasks.md: 10 tarefas em 4 fases

Fase 1: Fundação (3 tasks, 2 paralelizáveis)
  T001 Criar modelo X (executor, paralelo)
  T002 Criar migration Y (executor, depende T001)
  T003 Criar cenários Gherkin (executor, paralelo)

Fase 2: Implementação (4 tasks, 3 paralelizáveis)
  ...

Fase 3: Validação (2 tasks, paralelizáveis)
Fase 4: Documentação (1 task)
```
