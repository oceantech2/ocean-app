# Implementation Plan: Dashboard — Alíquota, Lucro %, DRE Anual e Imposto por Competência

**Branch**: `047-dashboard-metricas-dre` | **Date**: 2026-09-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/047-dashboard-metricas-dre/spec.md`

**Note**: Clarify 2026-09-06 (3/3): Impostos = soma `valor_imposto` das NFs **pagas** do mês; DRE alinhado ao card; alíquota sobre Receita Bruta; % Lucro sobre Receita Líquida; eixo DRE com 12 meses. Complementa `003`, `040`, `041`. Sem migration. Módulo/página Impostos **não** muda.

## Summary

Corrigir quatro regras do Dashboard: (1) card **Impostos** e alíquota por competência das NFs pagas (÷ Receita Bruta), em vez de Contas a Pagar por vencimento; (2) % do card **Lucro** sobre **Receita Líquida**; (3) gráfico **DRE** com eixo **jan–dez** por padrão; (4) segmento Impostos do DRE com a mesma base de NFs pagas, recalculando o Lucro empilhado do DRE. Backend: ajuste em `GET /api/relatorios/dre-mensal`. Frontend: helpers + `Dashboard.tsx`. Endpoint `impostos/de-contas` permanece para a tela Impostos.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Recharts, Axios (`relatoriosService.dreMensal`, `nfsService`, resumo/faturamento já usados); utilitários `dashboardDespesas.ts` (`lucroCard`, `impostosDoRecorte`)

**Storage**: PostgreSQL existente (`nfs.valor_imposto`, `nfs.status`, `nfs.data_emissao`) — **sem** migration

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`; smoke do endpoint DRE (API 8001)

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + ajuste pontual de agregação no backend)

**Performance Goals**: DRE continua 1 request/ano; card Impostos agrega O(n) sobre NFs já carregadas no ciclo do Dashboard (sem chamada extra); SC-004 ≤ 5s no carregamento normal

**Constraints**: Portas fixas; JWT; só Dashboard + `dre-mensal`; não alterar página Impostos / `impostos/de-contas`; papéis admin/visualizador; DRL e Despesas fora do escopo (exceto Lucro do DRE via novo impostos)

**Scale/Scope**: `relatorios.py` (`dre_mensal`); `Dashboard.tsx`; `dashboardDespesas.ts`; contratos REST/UI; 0 migrations; 0 páginas novas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS |
| III. Clareza antes de implementar | PASS — clarify 3/3 integrado |
| IV. Consistência com produto existente | PASS — mesma base de NFs pagas + `data_emissao` da Receita Bruta; UX Dashboard intacta |
| V. Simplicidade e escopo fechado | PASS — 1 endpoint ajustado + helpers; sem migration |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/047-dashboard-metricas-dre/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-dre-mensal.md
│   └── ui-dashboard-metricas-dre.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    └── api/
        └── routes/
            └── relatorios.py          # dre_mensal: impostos = Σ NF.valor_imposto (pagas)

frontend/
└── src/
    ├── pages/
    │   └── Dashboard.tsx              # card Impostos/alíquota; label % Lucro; eixo DRE 12 meses
    └── utils/
        └── dashboardDespesas.ts       # lucroCard (÷ líquida); impostosDeNfsPagas (substitui uso de de-contas no card)
```

**Structure Decision**: Agregação DRE no backend (já existente). Card Impostos no frontend a partir das NFs já carregadas no `Promise.all` do Dashboard (evita novo endpoint e não mexe em `impostos/de-contas`). Remover dependência do Dashboard a `impostosService.deContas` para o card.

## Complexity Tracking

> Sem violações a justificar.
