# Tasks: Contas a Pagar e Receber — botão +1 (salvar e continuar)

**Input**: Design documents from `/specs/071-contas-salvar-mais-um/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Setup → fundação (localizar `salvar`/footer) → US1 (+1 criação nas duas páginas) → US2 (feedback/cancelamento/anti-duplo) → polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US2 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Contas a Pagar: `frontend/src/pages/Contas.tsx`
- Contas a Receber: `frontend/src/pages/NFs.tsx`
- Helper opcional: `frontend/src/utils/formularioMaisUm.ts` (só se DRY justificar)
- Contrato UI: `specs/071-contas-salvar-mais-um/contracts/ui-contas-salvar-mais-um.md`
- **Não alterar**: backend, `frontend/src/services/api.ts` (reusar `criar`), seleção em massa, +1 na edição

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte; sem app novo, sem dependência nova

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e [contracts/ui-contas-salvar-mais-um.md](./contracts/ui-contas-salvar-mais-um.md): só criação em `Contas.tsx` + `NFs.tsx`; sem endpoint novo; portas 5193/8001 inalteradas; resets de liquidação/NF/anexo conforme [data-model.md](./data-model.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Mapear pontos de edição (`salvar`, footer da modal, flags de modo criação)

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 [P] Em `frontend/src/pages/Contas.tsx`, localizar `salvar`, footer Cancelar/Salvar da modal e condição `editando` vs criação; anotar onde parametrizar `continuar`
- [x] T003 [P] Em `frontend/src/pages/NFs.tsx`, localizar `salvar` no ramo `criando`, `fecharModal`, footer Cancelar/Salvar e flag `criando`; anotar onde parametrizar `continuar`
- [x] T004 Decidir se um helper mínimo em `frontend/src/utils/formularioMaisUm.ts` vale a pena ou se a lógica fica inline nas duas páginas ([research.md](./research.md) §8); documentar a escolha em comentário curto só se houver helper

**Checkpoint**: Pontos de edição claros; shapes de form e resets pós-+1 alinhados ao data-model

---

## Phase 3: User Story 1 - Criar várias contas semelhantes sem reabrir a modal (Priority: P1) 🎯 MVP

**Goal**: Botão **+1** na modal de criação de Contas a Pagar e Contas a Receber: grava, mantém modal aberta, pré-preenche com resets (pendente, sem NF/anexo)

**Independent Test**: Em cada página, criar com +1 (inclusive liquidado + NF quando aplicável); modal permanece com cópia + resets; segundo Salvar cria outro registro e fecha; edição sem +1

### Implementation for User Story 1

- [x] T005 [US1] Em `frontend/src/pages/Contas.tsx`, refatorar criação em `salvar` para aceitar `continuar?: boolean` (ou `salvarCriacao({ continuar })`) reutilizando validações e `contasService.criar` + upload de comprovante existentes
- [x] T006 [US1] Em `frontend/src/pages/Contas.tsx`, após create OK com `continuar=true`: toast sucesso; `carregarContas` + triggers de notif/calendário; **não** fechar modal; aplicar form pós-+1 (copiar campos enviados; `data_pagamento=''`; `arquivoNf=null`; `editando=null`)
- [x] T007 [US1] Em `frontend/src/pages/Contas.tsx`, no footer da modal de **criação** (`!editando`), adicionar botão **+1** (`title`/`aria-label` = `Salvar e cadastrar mais um`) na ordem Cancelar · +1 · Salvar; Salvar chama `continuar=false`; +1 chama `continuar=true`; ambos `disabled={salvando}`
- [x] T008 [US1] Em `frontend/src/pages/Contas.tsx`, garantir que na modal de **edição** o footer **não** renderiza +1 (só Cancelar/Salvar)
- [x] T009 [P] [US1] Em `frontend/src/pages/NFs.tsx`, refatorar ramo `criando` de `salvar` para aceitar `continuar?: boolean`, reutilizando validações e `nfsService.criar` + upload de anexo
- [x] T010 [US1] Em `frontend/src/pages/NFs.tsx`, após create OK com `continuar=true`: toast; `carregarNFs` + triggers; **não** chamar `fecharModal`; aplicar form pós-+1 (copiar negócio + comissões/bônus do form; `pagamento_estado='pendente'`; limpar `data_pagamento`, `numero`, `data_emissao`; `arquivoNfForm=null`; `criando=true`)
- [x] T011 [US1] Em `frontend/src/pages/NFs.tsx`, no footer da modal com `criando`, adicionar botão **+1** (mesmos rótulos/a11y/ordem/estilo do contrato); Salvar fecha; +1 continua; ambos respeitam `salvando`
- [x] T012 [US1] Em `frontend/src/pages/NFs.tsx`, garantir ausência de +1 quando `!criando` (edição)

**Checkpoint**: US1 testável nas duas páginas conforme quickstart (smokes de criação em cadeia)

---

## Phase 4: User Story 2 - Feedback e cancelamento claros (Priority: P2)

**Goal**: Toast em cada +1; erros não gravam nem resetam form; Cancelar fecha sem desfazer creates anteriores; anti double-submit

**Independent Test**: +1 inválido → toast, zero registro novo; +1 OK → Cancelar → modal fecha e itens já criados permanecem; clique duplo não duplica

### Implementation for User Story 2

- [x] T013 [P] [US2] Em `frontend/src/pages/Contas.tsx`, confirmar que falha de validação/API no caminho `continuar` não aplica form pós-+1, não fecha modal e deixa `salvando=false` no `finally`; Cancelar limpa só estado local (`arquivoNf`) sem reverter POSTs
- [x] T014 [P] [US2] Em `frontend/src/pages/NFs.tsx`, mesmo tratamento de erro/Cancelar no caminho `continuar` (não resetar form em erro; `fecharModal` só no Cancelar/Salvar sem continuar)
- [x] T015 [US2] Em `frontend/src/pages/Contas.tsx` e `frontend/src/pages/NFs.tsx`, alinhar toast de sucesso do +1 à mesma família do Salvar e garantir desabilitação de Salvar/+1 enquanto `salvando` (FR-007/FR-008)
- [x] T016 [US2] Em `frontend/src/pages/Contas.tsx` e `frontend/src/pages/NFs.tsx`, no caso create OK + falha de upload de anexo com `continuar=true`, seguir política do [research.md](./research.md) §7: conta já criada → aviso do anexo + ainda assim aplicar form pós-+1 e manter modal

**Checkpoint**: US2 coberta; feedback/cancel/anti-duplo coerentes nas duas páginas

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validação manual e higiene de código

- [x] T017 Executar smokes de [quickstart.md](./quickstart.md) (Pagar + Receber + negativos visualizador/edição/validação)
- [x] T018 Rodar `npm run lint` e `npm run type-check` em `frontend/` e corrigir regressões introduzidas por esta feature
- [x] T019 Revisar que nenhum endpoint novo foi adicionado e que listagens/seleção em massa não foram alteradas fora do necessário para refresh após create

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → **Phase 3 (US1 MVP)** → **Phase 4 (US2)** → **Phase 5**
- US2 assume o caminho `continuar` da US1 já existir nas duas páginas

### User Story Dependencies

- **US1**: Após fundação; entrega o MVP
- **US2**: Depende de US1 (mesmos handlers); reforça erros/cancel/upload parcial

### Within US1

- Contas: T005 → T006 → T007 → T008
- NFs: T009 → T010 → T011 → T012
- T005–T008 e T009–T012 podem avançar em paralelo após T004 ([P] em T009)

### Parallel Opportunities

```text
T002 ∥ T003
depois T004
depois: (T005→T008) ∥ (T009→T012)
depois: T013 ∥ T014
depois T015 → T016
depois T017 → T018 → T019
```

---

## Parallel Example: User Story 1

```text
# Após T004:
# Dev A — Contas a Pagar
T005 → T006 → T007 → T008 em frontend/src/pages/Contas.tsx

# Dev B — Contas a Receber (em paralelo)
T009 → T010 → T011 → T012 em frontend/src/pages/NFs.tsx
```

---

## Implementation Strategy

### MVP (só User Story 1)

1. Completar T001–T004  
2. Entregar +1 em Contas e NFs (T005–T012)  
3. Validar smokes de criação em cadeia do quickstart  
4. Parar e demonstrar se desejado  

### Incremental

1. US2 endurece erros/cancel/upload  
2. Polish lint + checklist quickstart completo  

### Notes

- [P] = arquivos distintos / sem depender de tarefa incompleta do par  
- Cada tarefa inclui caminho de arquivo  
- Sem tasks de teste automatizado (não pedidas na spec)  
- Formato checklist: `- [ ] Txxx ...` com IDs sequenciais  

---

## Summary

| Métrica | Valor |
|---------|-------|
| Total de tasks | 19 |
| US1 | 8 (T005–T012) |
| US2 | 4 (T013–T016) |
| Setup + Fundação + Polish | 7 (T001–T004, T017–T019) |
| Paralelas marcadas [P] | T002, T003, T009, T013, T014 |
| MVP sugerido | Phase 1–3 (US1) |
| Testes automatizados | Não |
| Implementação | 2026-09-14 — T001–T019 concluídas; lógica inline (sem `formularioMaisUm.ts`) |
