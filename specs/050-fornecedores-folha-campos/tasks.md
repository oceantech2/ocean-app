# Tasks: Fornecedores — campos opcionais de PF, período, salário e total da folha

**Input**: Design documents from `/specs/050-fornecedores-folha-campos/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/rest-fornecedores-folha-campos.md](./contracts/rest-fornecedores-folha-campos.md), [contracts/ui-fornecedores-folha-campos.md](./contracts/ui-fornecedores-folha-campos.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (todas P1: US1 → US2 → US3 → US4). Sem `[P]` quando o mesmo arquivo seria editado em paralelo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US4 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte e arquivos-alvo; sem dependências novas nem migração de schema

- [x] T001 Confirmar feature `050-fornecedores-folha-campos`, portas 8001/5193/5433 e arquivos-alvo em [plan.md](./plan.md) (`backend/app/api/routes/colaboradores.py`, `frontend/src/pages/Fornecedores.tsx`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Regras de API compartilhadas (PF parcial + persistir salário/datas em não-legado) — bloqueia US1–US4

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Em `backend/app/api/routes/colaboradores.py`, ajustar `_validar_pf_cnpj` para exigir só `pf_nome` + `pf_endereco`; validar `pf_cpf` e `pf_data_nascimento` somente quando preenchidos (CPF dígitos + ≤ hoje), conforme [contracts/rest-fornecedores-folha-campos.md](./contracts/rest-fornecedores-folha-campos.md)
- [x] T003 Em `backend/app/api/routes/colaboradores.py` (`_normalizar_cadastro`): deixar de exigir `salario` no bloco legado CPF (manter `cargo` + `data_nascimento` se já exigidos)
- [x] T004 Em `backend/app/api/routes/colaboradores.py` (`criar_colaborador` / `atualizar_colaborador`): permitir persistir `salario`, `data_admissao` e `data_desligamento` também quando `elegivel_equipe=false`; continuar zerando/ignorando cargo, benefício e `data_nascimento` de equipe em não-legado; validar intervalo término ≥ início quando ambas as datas existirem; salário ≥ 0 quando informado

**Checkpoint**: API aceita CNPJ só com Nome/Endereço PF; aceita salário/datas em qualquer fornecedor

---

## Phase 3: User Story 1 - Pessoa física do CNPJ sem exigir CPF e data de nascimento (Priority: P1) 🎯 MVP

**Goal**: UI e validação cliente alinhadas à PF parcial (Nome/Endereço obrigatórios; CPF e nascimento opcionais)

**Independent Test**: Criar CNPJ com Nome+Endereço PF sem CPF/nascimento → grava; sem Nome ou Endereço → recusa; CPF inválido preenchido → recusa

### Implementation for User Story 1

- [x] T005 [US1] Em `frontend/src/pages/Fornecedores.tsx`, na seção Pessoa física do CNPJ: remover `*` e obrigatoriedade de CPF e Data de Nascimento; manter `*` em Nome e Endereço
- [x] T006 [US1] Em `frontend/src/pages/Fornecedores.tsx` (`salvar`): validar só `pf_nome` e `pf_endereco` como obrigatórios; se `pf_cpf` preenchido, validar CPF; se `pf_data_nascimento` preenchida, recusar data futura; enviar `null`/omitir CPF e nascimento quando vazios

**Checkpoint**: SC-001, SC-001a, SC-002; FR-001, FR-001a, FR-002, FR-003

---

## Phase 4: User Story 2 - Data de início e data de término opcionais (Priority: P1)

**Goal**: Campos **Data de início** / **Data de término** visíveis para todos os fornecedores, opcionais, com rótulos canônicos

**Independent Test**: Novo fornecedor (não legado) vê e grava datas; término &lt; início recusa; rótulos não são Admissão/Desligamento

### Implementation for User Story 2

- [x] T007 [US2] Em `frontend/src/pages/Fornecedores.tsx`, exibir **Data de início** e **Data de término** fora do bloco `ehLegadoForm` (todos os formulários); bind em `data_admissao` / `data_desligamento`; remover duplicata dentro do bloco legado se existir
- [x] T008 [US2] Em `frontend/src/pages/Fornecedores.tsx` (`salvar` / `abrirCriar` / `abrirEditar`): incluir datas no payload para qualquer fornecedor; validar no cliente término ≥ início quando ambas preenchidas; toasts claros

**Checkpoint**: SC-003 (parcial datas); FR-004, FR-005, FR-007

---

## Phase 5: User Story 3 - Campo de valor de salário no cadastro (Priority: P1)

**Goal**: Campo **Salário** opcional para todos os fornecedores (Fixo/Spot, novo/legado)

**Independent Test**: Novo Fixo com salário grava; Spot sem salário grava; salário negativo recusa; reabre com valor persistido

### Implementation for User Story 3

- [x] T009 [US3] Em `frontend/src/pages/Fornecedores.tsx`, exibir **Salário** (sem `*`) para todos os formulários; remover obrigatoriedade de salário no check de legado CPF (`cargo` / `data_nascimento` podem permanecer)
- [x] T010 [US3] Em `frontend/src/pages/Fornecedores.tsx` (`salvar`): enviar `salario` (number ou `null`) para qualquer fornecedor; recusar valor negativo no cliente

**Checkpoint**: SC-003; FR-006, FR-007

---

## Phase 6: User Story 4 - Card Total da folha somente Tipo Fixo (Priority: P1)

**Goal**: Card **Total da folha** = soma de salários de ativos `tipo_fornecedor=fixo`, independente do filtro da tabela

**Independent Test**: Fixo ativo + Spot + Fixo inativo → card só soma Fixo ativos; troca Tipo/desativa atualiza card; filtro de busca não zera o total

### Implementation for User Story 4

- [x] T011 [US4] Em `frontend/src/pages/Fornecedores.tsx`, calcular `totalFolha` a partir da lista completa carregada (`ativo && tipo_fornecedor === 'fixo'`, `salario` null = 0), não de `filtrados`
- [x] T012 [US4] Em `frontend/src/pages/Fornecedores.tsx`, renderizar card **Total da folha** em BRL (`pt-BR`) na área de resumo do topo; visível para admin e visualizador; atualiza após `carregarFornecedores` conforme [contracts/ui-fornecedores-folha-campos.md](./contracts/ui-fornecedores-folha-campos.md)

**Checkpoint**: SC-004, SC-005, SC-006; FR-008, FR-009, FR-010, FR-011

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Consistência e validação ponta a ponta

- [x] T013 Garantir que demais campos RH (cargo, benefício, histórico, documentos) continuam só em legado em `frontend/src/pages/Fornecedores.tsx` (FR-013)
- [x] T014 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T015 Executar cenários de [quickstart.md](./quickstart.md) (PF parcial, datas/salário, card folha, visualizador)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as histórias
- **US1 (Phase 3)**: Após Foundational — MVP
- **US2 (Phase 4)**: Após Foundational; pode seguir US1 (mesmo arquivo UI — sequencial recomendado)
- **US3 (Phase 5)**: Após Foundational; sequencial com US2 no mesmo `Fornecedores.tsx`
- **US4 (Phase 6)**: Após US3 (precisa salário persistido para demo completa); logicamente testável com dados já existentes
- **Polish (Phase 7)**: Após histórias desejadas

### User Story Dependencies

- **US1**: Independente após T002–T004
- **US2 / US3**: Independentes na API após T004; UI no mesmo arquivo → ordem US2 → US3
- **US4**: Usa salário (US3) e listagem existente; card só frontend

### Parallel Opportunities

- T014 pode rodar em paralelo com revisão manual T013 após UI estável
- Backend Phase 2 (T002–T004) é sequencial no mesmo arquivo `colaboradores.py`
- Frontend US1–US4 sequenciais no mesmo `Fornecedores.tsx` (evitar `[P]` cruzado)

---

## Parallel Example: Foundational + checagens

```bash
# Após T002–T012, em paralelo:
Task: "Rodar npm run lint e type-check em frontend/"
Task: "Revisar FR-013 (RH só legado) em Fornecedores.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 + Phase 2 (API PF parcial + persistência salário/datas)
2. Phase 3 (US1 UI PF)
3. **STOP**: validar quickstart §1 (CNPJ sem CPF/nascimento)

### Incremental Delivery

1. US1 → PF parcial  
2. US2 → datas início/término  
3. US3 → salário para todos  
4. US4 → card Total da folha  
5. Polish + quickstart completo  

### Suggested MVP scope

**US1 apenas** (com T002–T004): desbloqueia cadastro CNPJ incompleto de CPF/nascimento — maior dor imediata.

---

## Notes

- Sem testes automatizados nesta feature (não pedidos na spec)
- Sem migração SQL / novas colunas
- REST permanece `/api/colaboradores`; sem endpoint de resumo-folha
- Commit após cada história ou grupo lógico
