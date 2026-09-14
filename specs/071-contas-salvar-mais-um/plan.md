# Implementation Plan: Contas a Pagar e Receber — botão +1 (salvar e continuar)

**Branch**: `071-contas-salvar-mais-um` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/071-contas-salvar-mais-um/spec.md`

**Note**: Clarify 2026-09-14 — só **+1** na criação; reset de liquidação; limpar vínculo NF; sem lote na listagem.

## Summary

Nas modais de **criação** de Contas a Pagar (`Contas.tsx`) e Contas a Receber (`NFs.tsx`), além de Cancelar/Salvar, adicionar o botão **+1**: grava com o mesmo fluxo/validação do Salvar (POST existente), mantém a modal aberta e pré-preenche o formulário com os dados recém-enviados, **exceto** liquidação (sempre pendente), vínculo/número de NF (limpo), identidade e anexos. Edição continua só com Cancelar/Salvar. Sem novos endpoints, migrations ou seleção em massa.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python/FastAPI no backend **inalterado**

**Primary Dependencies**: React, Zustand (`useAuthStore`), Axios (`contasService` / `nfsService`), `react-hot-toast`, Tailwind; páginas `Contas.tsx` e `NFs.tsx`

**Storage**: N/A nesta feature — persistência via POST já existentes (`contasService.criar`, `nfsService.criar`)

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend; backend intocado)

**Performance Goals**: Cadeia de ≥3 criações via +1 em &lt;2 min (SC-001); feedback de sucesso/erro imediato (toast)

**Constraints**: Portas fixas; papéis `admin`/`visualizador`; +1 só na criação; sem seleção em massa; sem novo endpoint; anti double-submit enquanto `salvando`

**Scale/Scope**: 2 páginas (`Contas.tsx`, `NFs.tsx`); possível helper local mínimo de “preparar form pós-+1”; 0 endpoints novos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — +1 só para admin; visualizador inalterado |
| III. Clareza antes de implementar | PASS — clarify fechou escopo, liquidação, edição e NF |
| IV. Consistência com produto existente | PASS — mesmos POSTs, toasts, modais e validações de Salvar |
| V. Simplicidade e escopo fechado | PASS — só UI de criação nas duas páginas; sem lote; sem endpoint |
| Portas / segredos | PASS — sem credenciais; portas inalteradas |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não extrair lib genérica “SaveAndAddAnother” por antecipação; helper local só se reduzir duplicação óbvia entre as duas páginas. Não alterar backend.

## Project Structure

### Documentation (this feature)

```text
specs/071-contas-salvar-mais-um/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-contas-salvar-mais-um.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/src/pages/Contas.tsx   # botão +1 na modal de criação; salvar(..., continuar)
frontend/src/pages/NFs.tsx      # idem Contas a Receber (rota /nfs)
# opcional, só se necessário para DRY mínimo:
# frontend/src/utils/formularioMaisUm.ts
```

**Structure Decision**: Mudança local nas duas páginas que já possuem modal de criação. Backend e `api.ts` permanecem iguais (mesmo `criar`). Contratos só de UI.

## Complexity Tracking

> Sem violações a justificar.
