# Implementation Plan: Recorrência de contas a pagar nos próximos meses

**Branch**: `090-contas-pagar-recorrencia` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/090-contas-pagar-recorrencia/spec.md`

## Summary

`POST /api/contas` passa a aceitar o campo opcional `repetir_meses` (inteiro 1–24). Quando presente, o servidor cria a conta original e N cópias na **mesma transação** (`flush` por conta + um único `commit`), com vencimento deslocado mês a mês (dia preservado ou último dia do mês), pendentes, sem comprovante, e auditoria por conta. A resposta continua sendo a conta original (`ContaPagarResponse`) — contrato retrocompatível. No frontend (`Contas.tsx`), o modal de **nova** conta ganha checkbox + campo de meses + resumo dos vencimentos; o toast informa as recorrências. Sem migration (cópias independentes, nada de série).

## Technical Context

**Language/Version**: Python 3.11 + FastAPI + SQLAlchemy (backend); TypeScript 5.2 + React 18 (frontend)

**Primary Dependencies**: Pydantic v2 (`Field(ge=1, le=24)`), `calendar.monthrange` (stdlib)

**Storage**: PostgreSQL — sem mudança de schema

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run type-check`/`build`; import/compilação do backend (`python -m py_compile`)

**Target Platform**: Web interna; API **8001**; frontend **5193**

**Project Type**: Web application (backend + frontend)

**Performance Goals**: Até 25 inserts em uma requisição (< 1 s)

**Constraints**: Atomicidade (FR-007); `require_admin` mantido; resposta retrocompatível; importação CSV/XLSX intocada

**Scale/Scope**: 5 arquivos (`schemas.py`, `routes/contas.py`, novo `utils/recorrencia.ts`, `services/api.ts`, `pages/Contas.tsx`); 0 endpoints novos; 0 migrations

## Constitution Check

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis | PASS — criação continua `require_admin` |
| III. Clareza antes de implementar | PASS — clarify registrado |
| IV. Consistência com produto existente | PASS — mesmo modal, toasts, auditoria por conta |
| V. Simplicidade e escopo fechado | PASS — campo opcional no endpoint existente; sem tabela de série |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/090-contas-pagar-recorrencia/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api-contas-recorrencia.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/app/schemas.py                  # ContaPagarCreate.repetir_meses (1–24, opcional)
backend/app/api/routes/contas.py        # _somar_meses + criação das cópias na mesma transação
frontend/src/utils/recorrencia.ts       # somarMeses (espelho da regra) + resumo do intervalo
frontend/src/services/api.ts            # ContaPagarCreatePayload.repetir_meses
frontend/src/pages/Contas.tsx           # checkbox + meses + resumo no modal de nova conta; toast
```

**Structure Decision**: A regra de datas vive no servidor (fonte da verdade) e é espelhada num helper puro do frontend só para o resumo exibido no formulário.

## Complexity Tracking

> Sem violações a justificar.
