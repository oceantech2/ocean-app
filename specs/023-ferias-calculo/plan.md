# Implementation Plan: Correção do cálculo de férias

**Branch**: `023-ferias-calculo` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/023-ferias-calculo/spec.md`

**Note**: Clarify 2026-08-12 (5/5). Sem tabela nova. Revisão 2026-08-12 no código: `resumoPorAno` **soma** `dias_direito`; `FeriasUpdate` **não** inclui `dias_direito`; `DELETE` não transfere direito; banner exige `saldo > 0`.

## Summary

Corrigir o cálculo de férias: **direito anual = máximo** dos `dias_direito` do colaborador/ano (não a soma); **saldo = direito − soma dos tirados** (pendentes e aprovados). A página passa a ter **resumo por colaborador/ano** e linhas só com a parcela. Extraír as regras para um módulo compartilhado no frontend e, no backend, validar intervalo de datas, persistir `dias_direito` no update e **transferir o direito** ao excluir o registro que o concentrava.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Axios (`feriasService`), Zustand (`usePageFilters`, `useAuthStore`), Pydantic/SQLAlchemy (CRUD `/ferias` existente)

**Storage**: PostgreSQL — tabela `ferias` **sem migration**. Direito anual continua derivado dos registros; transferência na exclusão atualiza `dias_direito` de uma parcela restante.

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`. Repo sem suíte pytest; regras Python conferidas pelos curls do quickstart (não inventar CI).

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Recálculo do resumo no mesmo ciclo de render da lista já carregada (≤ 200 itens filtrados); SC-003 &lt; 10s no formulário de edição

**Constraints**: Portas fixas; JWT; papéis admin (CRUD) / visualizador (leitura); sem validação automática CLT de 5/14 dias; importador CSV sem redesenho; sem credenciais nos artefatos

**Scale/Scope**: 1 página (`Ferias.tsx`); 1 módulo TS + 1 serviço Python de regras; `FeriasUpdate.dias_direito`; validação 422 de intervalo; `DELETE` com transferência; banner/export; sem endpoint de resumo; **fora**: `email.py` e sino do menu

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — módulo Férias; visualizador só consulta |
| III. Clareza antes de implementar | PASS — clarify 5/5 na spec |
| IV. Consistência com produto existente | PASS — Layout, modal, toast, confirm de exclusão; resumo é evolução documentada da spec (não direito/saldo na linha) |
| V. Simplicidade e escopo fechado | PASS — sem tabela nova; agregação no client; transferência só no DELETE |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Duplicar a fórmula em TS e Python (UI vs persistência) é menor que criar endpoint de resumo e tabela de direito anual. Gaps confirmados em `Ferias.tsx`, `schemas.py` (`FeriasUpdate`) e `ferias.py`.

## Project Structure

### Documentation (this feature)

```text
specs/023-ferias-calculo/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-ferias.md
│   └── ui-ferias-calculo.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/src/
├── pages/Ferias.tsx                 # resumo, tabela de parcelas, modal, banner
├── utils/feriasCalculo.ts           # direito, saldo, dias corridos, overlap, pendência
├── hooks/useNotificacoes.ts         # alinhamento: período não aprovado (já conta; conferir unicidade só no banner da página)
├── utils/export.ts                  # consumo: CSV sem direito/saldo como se fossem da parcela
└── types/index.ts                   # tipo opcional de ResumoFeriasAno (só client)

backend/app/
├── api/routes/ferias.py             # DELETE com transferência; validação de datas no create/update
├── schemas.py                       # FeriasUpdate.dias_direito; validator início ≤ fim
└── services/ferias_calculo.py       # max direito, soma tirados, overlap, escolha do destino da transferência
```

**Structure Decision**: Cálculo de tela no client (lista já filtrada por ano/colaborador). Persistência crítica (datas invertidas e transferência de direito) no backend para não perder 30 dias ao excluir a parcela-base. Sem `GET /ferias/resumo`.

## Complexity Tracking

> Sem violações a justificar.
