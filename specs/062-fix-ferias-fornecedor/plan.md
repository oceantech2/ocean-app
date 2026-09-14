# Implementation Plan: Correção de Férias (fornecedor, listagem, direito e folha)

**Branch**: `062-fix-ferias-fornecedor` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/062-fix-ferias-fornecedor/spec.md`

**Note**: Clarify 2026-09-14 (3/3): seletor = todos os fornecedores **ativos**; Total da Folha = só **Tipo Fixo** ativos; ano **sugerido** pela data de entrada (admin pode alterar). A spec 050 descreveu o mesmo problema e **não chegou à operação** — esta entrega é a fonte de verdade. `/speckit-plan` Phase 0–1 sem NEEDS CLARIFICATION.

## Summary

Corrigir a página **Férias**: passar a listar **os mesmos fornecedores ativos da página Fornecedores** (via alias `/api/fornecedores`, sem filtro `elegivel_equipe` — causa da lista vazia), substituir rótulos **Colaborador → Fornecedor**, sugerir o ano aquisitivo a partir da data de entrada, exigir override na criação se ainda não completou 12 meses, manter datas de gozo opcionais, exibir salário (coluna + campo somente leitura) e o card **Total da Folha** com a mesma fórmula da página Fornecedores (soma de salários **Tipo Fixo** ativos). Sem migration; FK `ferias.colaborador_id` permanece.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic; React, Tailwind, Axios (`api.ts`), Zustand (`usePageFilters`, `useAuthStore`), react-hot-toast, `feriasCalculo.ts`

**Storage**: PostgreSQL — tabelas existentes `colaboradores` (cadastro unificado) e `ferias`. **Sem** DDL / migration

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`; smoke API **8001**

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (página Férias + alias REST de fornecedores)

**Performance Goals**: Carga da lista de fornecedores ativos (limit 1000, igual a Fornecedores) em ≤ 3 s na rede local (SC-001); Total da Folha calculado em memória, sem endpoint extra

**Constraints**: Portas fixas; JWT; `admin` altera, `visualizador` só consulta; não quebrar CRUD/aprovação/fracionamento (023); payload de férias continua `colaborador_id`; não alterar o card da página Fornecedores

**Scale/Scope**: 1 alias de router; 1 serviço frontend; utils de data/ano/folha; alterações concentradas em `Ferias.tsx` + `feriasCalculo.ts`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Férias e Fornecedores; visualizador somente leitura |
| III. Clareza antes de implementar | PASS — clarify 3/3 |
| IV. Consistência com produto existente | PASS — mesma lista/folha da página Fornecedores; `window.confirm` no override; datas opcionais já no modelo |
| V. Simplicidade e escopo fechado | PASS — alias de rota; sem migration; sem recálculo trabalhista extra |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/062-fix-ferias-fornecedor/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-fornecedores-ferias.md
│   └── ui-ferias-fornecedor.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    ├── main.py                         # include_router alias /api/fornecedores
    └── api/routes/
        └── colaboradores.py            # mesmo handler; sem mudança de filtro padrão

frontend/
└── src/
    ├── pages/Ferias.tsx                # nomenclatura, carga, card, salário, override, ano
    ├── services/api.ts                 # fornecedoresService → /fornecedores
    ├── types/index.ts                  # reuso Colaborador (salario, data_admissao, tipo_fornecedor)
    └── utils/feriasCalculo.ts          # temDireitoAdquirido, sugerirAnoAquisitivo, totalFolhaFixo
```

**Structure Decision**: App web existente. Backend só registra o alias `/api/fornecedores` no mesmo router de `colaboradores`. A lógica de negócio desta feature (lista, 1 ano, ano sugerido, folha) fica no frontend, alinhada à spec e ao padrão `window.confirm`.

## Complexity Tracking

> Sem violações da constitution.
