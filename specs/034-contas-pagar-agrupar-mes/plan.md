# Implementation Plan: Contas a Pagar — Agrupar por Mês e Filtrar por Categorias

**Branch**: `034-contas-pagar-agrupar-mes` | **Date**: 2026-08-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/034-contas-pagar-agrupar-mes/spec.md`

**Note**: Feature **somente frontend**. Clarify 2026-08-18: padrão Por mês; um total visível no grupo; colapso só no modo mês (mês mais recente aberto); Por categoria continua todo aberto. Filtro por categorias (incl. RH) já existe na API e na página — esta entrega garante o recorte combinado com o novo agrupamento.

## Summary

Na página Contas a Pagar (`Contas.tsx`), acrescentar modo de agrupamento **Por mês** (vencimento), padrão ao abrir a tela, com grupos em ordem do mais recente para o mais antigo, rótulo em português, um total = soma das contas visíveis, colapso (só o mês mais recente datado começa aberto) e grupo **“Sem vencimento”**. Manter **Por categoria** (sempre aberto) e os filtros já existentes (categoria, subcategoria RH, status, descrição, intervalo de vencimento). Sem API, migration ou mudança de cadastro/taxonomia.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); backend inalterado (Python 3.11 / FastAPI já filtra categoria)

**Primary Dependencies**: React, Tailwind CSS, Zustand (`usePageFilters` só para filtros já existentes); `Intl`/`toLocaleString('pt-BR')` para rótulo do mês — **sem biblioteca nova**

**Storage**: N/A — modo de agrupamento e aberto/fechado só em estado local da página (não persistir após sair)

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend

**Target Platform**: Web interna (browser); frontend **5193**; API **8001** (inalterada)

**Project Type**: Web application (frontend + backend) — escopo desta feature = frontend

**Performance Goals**: Agrupar e somar a lista já carregada na página (dezenas a poucas centenas de contas) sem atraso perceptível ao trocar modo ou abrir/fechar grupo

**Constraints**: Portas fixas; papéis admin/visualizador intactos; não alterar CRUD, import, comprovante, cartões de resumo globais, Dashboard, Fluxo de Caixa nem Contas a Receber; não persistir preferência de agrupamento no store

**Scale/Scope**: 1 página (`Contas.tsx`) + helper puro opcional em `utils`; 0 endpoints; 0 migrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — mesma página Contas a Pagar; visualizador só lê |
| III. Clareza antes de implementar | PASS — 4 clarificações na spec; sem `[NEEDS CLARIFICATION]` |
| IV. Consistência com produto existente | PASS — mesmos cards de grupo, filtros e tabela; só controla modo + colapso no mês |
| V. Simplicidade e escopo fechado | PASS — agrupamento no cliente sobre `contasFiltradas`; sem endpoint de agregação |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não extrair DataGrid compartilhado. Não mudar `GET /api/contas`. Não gravar agrupamento no Zustand.

## Project Structure

### Documentation (this feature)

```text
specs/034-contas-pagar-agrupar-mes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-contas-pagar-agrupar-mes.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/src/pages/Contas.tsx
frontend/src/utils/contasPagarAgrupamento.ts   # chaves, rótulos, ordem, totais, mês inicial aberto
```

**Structure Decision**: UX e estado (`modoAgrupamento`, conjunto aberto) ficam em `Contas.tsx`. Funções puras de agrupamento/rótulo/ordem ficam no util para evitar erro de fuso em `YYYY-MM-DD` e para reusar nos dois modos. Backend, `api.ts`, store de filtros e tipos de `ContaPagar` não mudam.

## Complexity Tracking

> Sem violações a justificar.
