---

description: "Lista de tarefas da feature 104 — modelo por seção na nova proposta"
---

# Tasks: Modelo por seção na nova proposta

**Input**: Design documents from `/specs/104-proposta-modelo-por-secao/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-seletor-secao.md, quickstart.md

**Tests**: A spec não pede testes automatizados e o frontend não tem suíte; a validação é `npx tsc --noEmit` e o roteiro de [quickstart.md](./quickstart.md).

**Organization**: Tarefas agrupadas por user story. Todas tocam `frontend/src/proposal/components/ModeloForm.tsx` ou `frontend/src/proposal/pages/Nova.tsx`, então quase nada é paralelizável.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[Story]**: User story da tarefa (US1, US2)

---

## Phase 1: Setup

**Purpose**: Sem infraestrutura nova; só conferir o ponto de partida.

- [X] T001 Conferir que `npx tsc --noEmit` passa em `frontend/` antes das mudanças (linha de base da primeira versão já presente em `frontend/src/proposal/components/ModeloForm.tsx`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipos e utilitários de seção usados pelas duas user stories.

- [X] T002 Definir o tipo `SecaoModelo` com as seis seções (`apresentacao`, `cliente`, `escopo`, `projetos`, `garantias`, `validade`) e a lista `SECOES_MODELO` em `frontend/src/proposal/components/ModeloForm.tsx`
- [X] T003 Criar `comIdioma(form, idioma)` (troca de idioma que só substitui textos padrão de shortlist/SLA) e usá-lo em `trocarIdioma` em `frontend/src/proposal/components/ModeloForm.tsx`
- [X] T004 Criar `conteudoDoModeloNaSecao(form, secao, modelo)` que devolve o formulário com só os campos da seção vindos do modelo (data-model.md), incluindo setor validado contra `SETORES`, em `frontend/src/proposal/components/ModeloForm.tsx`
- [X] T005 Criar `assinaturaSecao(form, secao)` que serializa só os campos da seção, sem a `chave` dos projetos (research R2), em `frontend/src/proposal/components/ModeloForm.tsx`
- [X] T006 Criar `secaoPreenchida(form, secao)` com as regras de confirmação da research R5 (Cliente com setor; Escopo com texto; projeto com nome ou investimento; Garantias diferentes do padrão do idioma; Apresentação e Validade nunca) em `frontend/src/proposal/components/ModeloForm.tsx`

**Checkpoint**: utilitários prontos; nenhuma mudança visível ainda.

---

## Phase 3: User Story 1 - Preencher uma seção com outro modelo (Priority: P1) 🎯 MVP

**Goal**: Um seletor por seção que substitui só aquela seção.

**Independent Test**: Quickstart passos 1, 2, 3 e 5.

### Implementation for User Story 1

- [X] T007 [US1] Adicionar as props opcionais `modelosSecao` e `modeloSecaoInicial` ao `ModeloForm` conforme contracts/ui-seletor-secao.md em `frontend/src/proposal/components/ModeloForm.tsx`
- [X] T008 [US1] Implementar `opcoesDaSecao(secao)`: todos os `modelosSecao` e, para `cliente`, só os com setor válido, em `frontend/src/proposal/components/ModeloForm.tsx`
- [X] T009 [US1] Implementar `aplicarModeloNaSecao(secao, id, nomeSecao)`: confirmar com `window.confirm` quando `secaoPreenchida` e o conteúdo for diferente do modelo; aplicar com `conteudoDoModeloNaSecao`; limpar os erros da seção; remontar o editor de escopo (chave `versaoEscopo`) quando a seção for `escopo`, em `frontend/src/proposal/components/ModeloForm.tsx`
- [X] T010 [US1] Implementar `cabecalhoSecao(titulo, secao?, nomeSecao?)` com o título e o seletor (opção desabilitada "Usar modelo…", `aria-label` "Modelo da seção …"), escondido quando não há opções, em `frontend/src/proposal/components/ModeloForm.tsx`
- [X] T011 [US1] Usar `cabecalhoSecao` nas seções Apresentação (sem seletor quando `idiomaMoedaFixos`), Cliente, Escopo, Projetos, Garantias e condições e Validade; manter Consultor sem seletor, em `frontend/src/proposal/components/ModeloForm.tsx`
- [X] T012 [US1] Passar `modelosSecao={modelosDaDivisao}` e `modeloSecaoInicial={modeloPropostaSel}` ao `ModeloForm` e o texto de ajuda abaixo do seletor geral em `frontend/src/proposal/pages/Nova.tsx`

**Checkpoint**: US1 funcional — seções podem vir de modelos diferentes.

---

## Phase 4: User Story 2 - Saber de onde veio cada seção e restaurar o modelo (Priority: P2)

**Goal**: Seletor mostra a origem só enquanto o conteúdo é igual ao do modelo; reescolher o modelo restaura.

**Independent Test**: Quickstart passo 4.

### Implementation for User Story 2

- [X] T013 [US2] Guardar a origem por seção como `{ id, assinatura }`, iniciando todas as seções com `modeloSecaoInicial` e a assinatura do formulário inicial (research R6), em `frontend/src/proposal/components/ModeloForm.tsx`
- [X] T014 [US2] Gravar `{ id, assinatura }` do novo conteúdo ao aplicar um modelo na seção (dentro de `aplicarModeloNaSecao`) em `frontend/src/proposal/components/ModeloForm.tsx`
- [X] T015 [US2] Calcular o valor exibido no seletor: o id só se estiver nas opções da seção e a assinatura atual for igual à guardada; senão vazio ("Usar modelo…"), em `frontend/src/proposal/components/ModeloForm.tsx`

**Checkpoint**: US1 e US2 funcionais.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T016 Remover código morto da primeira versão (estado de origem só com id, cálculo de valor antigo) em `frontend/src/proposal/components/ModeloForm.tsx`
- [X] T017 Rodar `npx tsc --noEmit` em `frontend/` sem erros
- [X] T018 Conferir que `frontend/src/proposal/pages/Editar.tsx` e `frontend/src/proposal/pages/ModeloEditor.tsx` não passam `modelosSecao` (FR-011)
- [ ] T019 Executar o roteiro de `specs/104-proposta-modelo-por-secao/quickstart.md` no navegador (requer login no Proposal)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup; bloqueia as user stories
- **US1 (Phase 3)**: depende da Phase 2
- **US2 (Phase 4)**: depende da US1 (usa `aplicarModeloNaSecao` e `cabecalhoSecao`)
- **Polish (Phase 5)**: depende de US1 e US2

### Within Each User Story

- T007 → T008 → T009 → T010 → T011; T012 depende de T007
- T013 → T014 → T015

### Parallel Opportunities

- T012 (`Nova.tsx`) pode rodar em paralelo com T008–T011 (`ModeloForm.tsx`) depois de T007.
- T018 pode rodar em paralelo com T017.

---

## Parallel Example: User Story 1

```bash
# Depois de T007:
Task: "T012 Passar modelosSecao e modeloSecaoInicial em frontend/src/proposal/pages/Nova.tsx"
Task: "T008–T011 Seletores de seção em frontend/src/proposal/components/ModeloForm.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2
2. Phase 3 (US1)
3. **Validar**: quickstart passos 1, 2, 3 e 5

### Incremental Delivery

1. US1 → seções combináveis (MVP)
2. US2 → origem confiável e restauração
3. Polish → limpeza e validação completa

---

## Notes

- A primeira versão (sem spec) já cobre parte de T002, T003, T007, T009–T012; a implementação deve conferir e completar, não duplicar.
- Nenhuma tarefa toca o backend (research R7).
