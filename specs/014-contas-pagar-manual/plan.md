# Implementation Plan: Contas a Pagar — Input Manual de Valores

**Branch**: `014-contas-pagar-manual` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/014-contas-pagar-manual/spec.md`

**Note**: Clarify 2026-08-06 incorporado (máscara BRL, editar valor pago, CTA “Nova conta a pagar”, status via data de pagamento, limpar data → pendente). Plano focado no **gap** em relação ao CRUD já existente em Contas a Pagar.

## Summary

Garantir o **input unitário de valores** em Contas a Pagar: admin cria/edita via **“Nova conta a pagar”** com **máscara monetária brasileira** no campo valor; status pago/pendente derivado da data de pagamento (incl. limpar data na edição → pendente); create aceita data de pagamento opcional no backend; valor > 0 validado. Importação CSV/Excel permanece. Sem mudança de taxonomia nem reintrodução de exclusão em massa.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Zustand, Axios, react-hot-toast; FastAPI, SQLAlchemy, Pydantic — **sem** nova lib de máscara (util leve pt-BR)

**Storage**: PostgreSQL — tabela `contas_pagar` existente; **sem** migration de coluna nova

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`; smoke POST/PUT `/api/contas` (create pendente/pago, limpar data, valor inválido)

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Create/update síncronos com validação imediata; listagem no padrão atual

**Constraints**: Portas fixas; papéis admin/visualizador; import permanece; sem “Deletar todas”; taxonomia 008 intacta; máscara só no formulário (lista já usa `toLocaleString` BRL)

**Scale/Scope**: Evoluir `Contas.tsx` + schemas/rota `/api/contas`; util de máscara reutilizável; 0 páginas novas; 0 colunas DB novas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Contas a Pagar; admin cria/edita; visualizador só lê |
| III. Clareza antes de implementar | PASS — clarify 5/5 |
| IV. Consistência com produto existente | PASS — mesma página/`/api/contas`, toast, Layout, categorias 008 |
| V. Simplicidade e escopo fechado | PASS — fecha gaps de valor/CTA/status; sem módulo paralelo nem lib pesada |
| Portas / segredos | PASS — sem mudança de portas; sem credenciais |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Util de máscara local evita dependência nova.

## Project Structure

### Documentation (this feature)

```text
specs/014-contas-pagar-manual/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-contas-pagar-manual.md
│   └── ui-contas-pagar-manual.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    ├── schemas.py                 # ContaPagarCreate: data_pagamento?; valor > 0
    └── api/routes/contas.py       # create/update: pago ↔ data_pagamento; limpar data → pendente

frontend/
└── src/
    ├── pages/Contas.tsx           # CTA, máscara valor, payload create/edit (null data_pagamento)
    ├── utils/moeda.ts             # formatar/parse máscara BRL (novo)
    └── services/api.ts            # tipagem payload se necessário (mínimo)
```

**Structure Decision**: Continuar no módulo Contas a Pagar (`Contas.tsx` + `/api/contas`). Sem tabela/página nova. Fechar gap de contrato create/update e UX de valor.

## Complexity Tracking

> Sem violações a justificar.
