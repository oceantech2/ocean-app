# Implementation Plan: Cabeçalho Fixo na Tabela de Contas a Pagar

**Branch**: `066-contas-pagar-cabecalho-fixo` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/066-contas-pagar-cabecalho-fixo/spec.md`

**Note**: Clarify 2026-09-14 — cabeçalho fixo no topo de uma **área rolável só da tabela** (não grudar ao rolar a página inteira).

## Summary

Na página Contas a Pagar (`frontend/src/pages/Contas.tsx`), a listagem passa a ter um **contenedor com altura máxima e rolagem própria** (`overflow` vertical + horizontal). O `<thead>` permanece **sticky** no topo desse contenedor enquanto as linhas rolam. Título, cards de totais, filtros e botões de header ficam **fora** dessa área.

Abordagem: CSS/Tailwind na página Contas apenas (`overflow-auto` + `max-h-[calc(...)]` + `sticky top-0` no cabeçalho, fundo opaco). Sem backend, API, migrations ou componentes novos compartilhados nesta entrega.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend)

**Primary Dependencies**: React, Tailwind CSS; página `Contas.tsx`

**Storage**: N/A — só apresentação de UI

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend; backend intocado)

**Performance Goals**: Rolagem fluida da listagem; sticky sem jitter perceptível em uso normal

**Constraints**: Portas fixas; papéis `admin`/`visualizador` inalterados; escopo só Contas a Pagar; impressão PDF (`window.print` / `.print-area`) não deve cortar linhas; alinhar cabeçalho–colunas com scroll horizontal

**Scale/Scope**: 1 página (`Contas.tsx`); possível ajuste mínimo em CSS de impressão se necessário; 0 endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — mesma página e mesmas ações por papel |
| III. Clareza antes de implementar | PASS — clarify fechou área rolável da tabela vs. página |
| IV. Consistência com produto existente | PASS — mesma tabela/colunas; só comportamento de scroll/sticky |
| V. Simplicidade e escopo fechado | PASS — mudança local em Contas; sem lib nova; sem extrair componente genérico “por antecipação” |
| Portas / segredos | PASS — sem credenciais; portas inalteradas |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não aplicar o mesmo padrão a outras tabelas nesta entrega. Não reintroduzir sticky na viewport da página.

## Project Structure

### Documentation (this feature)

```text
specs/066-contas-pagar-cabecalho-fixo/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-contas-pagar-cabecalho-fixo.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
frontend/src/pages/Contas.tsx     # wrapper rolável + thead sticky; filtros/título fora
frontend/src/index.css            # só se impressão exigir reset de max-height/overflow (opcional)
```

**Structure Decision**: Solução local na página Contas. O padrão NFs (grade com cabeçalho/corpo sincronizados) existe, mas é mais complexo; para Contas basta um único contenedor com `overflow` e `position: sticky` no cabeçalho (ver [research.md](./research.md)).

## Complexity Tracking

> Sem violações a justificar.
