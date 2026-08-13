# Implementation Plan: Contas a Pagar — Taxonomia de Categorias

**Branch**: `021-contas-pagar-taxonomia` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/021-contas-pagar-taxonomia/spec.md`

**Note**: Clarify 2026-08-12 (3 Qs). Promove **Benefícios** a categoria de primeiro nível; **não** migra contas já gravadas como RH / Benefícios; importação rejeita o par antigo.

## Summary

Atualizar o catálogo fechado em `categorias_contas.py` e a UI de Contas a Pagar: oito categorias na ordem da spec; RH com quatro subcategorias oficiais; código `beneficios` passa a ser categoria própria. Contas existentes `recursos_humanos` + `beneficios` **permanecem** (sem `UPDATE` em massa, sem `categoria_pendente`). PUT que reenvia o mesmo par legado é aceito; POST e import rejeitam RH + Benefícios. Dashboard ganha label/cor da fatia Benefícios; Impostos e Retiradas não mudam o critério de filtro.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Zustand, Axios, react-hot-toast; FastAPI, SQLAlchemy, Pydantic — sem lib nova

**Storage**: PostgreSQL — tabela `contas_pagar` já tem `categoria` / `subcategoria` (VARCHAR); **sem** ALTER; **sem** migração de dados desta feature

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`; smoke POST/PUT/import e donut de custo

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Listagem e agregação no padrão atual (~500 registros); sem job de migração

**Constraints**: Portas fixas; papéis admin/visualizador; sem conversão em lote; sem aviso de pendência no par legado; import só taxonomia nova; ajuste mínimo no Dashboard (label/cor)

**Scale/Scope**: Catálogo + validação + UI Contas + labels do donut; 0 páginas novas; 0 colunas; 0 endpoints novos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Contas a Pagar; admin escreve; visualizador só lê |
| III. Clareza antes de implementar | PASS — spec sem `[NEEDS CLARIFICATION]`; 3 clarificações gravadas (não migrar, sem aviso, import rejeita) |
| IV. Consistência com produto existente | PASS — mesma página/`/api/contas`; filtro e CRUD atuais; donut só ganha fatia quando houver valor |
| V. Simplicidade e escopo fechado | PASS — alterar catálogo/validação/UI; sem migration; sem redesign Impostos/Retiradas |
| Portas / segredos | PASS — sem mudança de portas; sem credenciais |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. O código `beneficios` no **campo** `categoria` (novo) vs no **campo** `subcategoria` (legado) é o único ponto delicado — resolvido em [research.md](./research.md) §1 sem coluna extra.

## Project Structure

### Documentation (this feature)

```text
specs/021-contas-pagar-taxonomia/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-contas-pagar-taxonomia.md
│   └── ui-contas-pagar-taxonomia.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    ├── services/categorias_contas.py   # catálogo, labels, validar, import aliases, inferência
    ├── api/routes/contas.py            # PUT: aceitar par legado inalterado; POST/import já usam validar
    └── api/routes/relatorios.py        # custo-por-categoria já GROUP BY categoria (só label)

frontend/
└── src/
    ├── pages/Contas.tsx                # opções, filtro, label legado, import cliente, edição
    └── pages/Dashboard.tsx             # CENTRO_LABEL / CENTRO_COR para beneficios
```

**Structure Decision**: Reusar `categorias_contas.py` como fonte única. Não criar tabela de catálogo. Impostos e Retiradas já filtram por código (`impostos`, `recursos_humanos`+`retirada_socios`) — fora da lista de mudança. `excel_io` só persiste o que a rota validar.

## Complexity Tracking

> Sem violações a justificar.
