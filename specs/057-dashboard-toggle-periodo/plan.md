# Implementation Plan: Toggle Bruto/Líquido + Configuração do Período no Dashboard

**Branch**: `057-dashboard-toggle-periodo` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/057-dashboard-toggle-periodo/spec.md`

**Note**: Clarify 2026-09-10 (5/5): Configuração do Período **substitui** meta mensal; trigger atualiza alíquota **e** recalcula líquido; confirmação só se alíquota mudar; toggle cobre Pipeline + meta + KPIs de receita existentes; meta e alíquota **obrigatórias** juntas no save. Meta anual (`mes=0`) intacta. Cards briefing 05–09 fora.

## Summary

Entregar no Dashboard o controle global **Bruto / Líquido** (padrão líquido, estado de sessão) e a **Configuração do Período** (meta líquida + alíquota do mês) no lugar da edição isolada de meta mensal. Persistência: estender `metas_financeiras` com `aliquota_periodo`. Ao mudar a alíquota (com confirmação e contagem), atualizar em massa `nfs` com `data_emissao` no período via `calcular_imposto_liquido`. Pipeline e KPIs de receita passam a expor/usar as duas bases sem visão mista; despesas e impostos absolutos não alternam.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Axios; SQLAlchemy `MetaFinanceira` / `NF`; `nf_valores.calcular_imposto_liquido`; filtros `mes`/`ano` do Dashboard; Pipeline da feature `056`

**Storage**: PostgreSQL — coluna nova `metas_financeiras.aliquota_periodo` via `_migrar()`; updates em `nfs.aliquota_imposto` / `valor_imposto` / `valor_liquido`

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`; smoke API **8001**

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend Dashboard + rotas de metas/relatórios no backend)

**Performance Goals**: Toggle sem refetch obrigatório (dados dual-base na carga); 1 save de período + update em massa síncrono aceitável para volume interno; SC-002 ≤ 5s percepção de mudança de base

**Constraints**: Portas fixas; JWT; só `admin` edita período; `visualizador` lê; não implementar cards 05–09; não redesenhar listagem NFs; não alterar meta anual

**Scale/Scope**: 1 migration leve (`_migrar`); endpoints de Configuração do Período (+ preview/confirmação); extensão Pipeline dual-base; ajustes Dashboard (toggle, form período, KPIs receita)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Conta a Receber = `nfs`; edição só admin |
| III. Clareza antes de implementar | PASS — clarify 5/5 |
| IV. Consistência com produto existente | PASS — reutiliza metas mensais, `nf_valores`, Dashboard, Pipeline 056 |
| V. Simplicidade e escopo fechado | PASS — estende meta mensal em vez de tabela paralela; sem cards 05–09 |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/057-dashboard-toggle-periodo/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-configuracao-periodo.md
│   ├── rest-pipeline-receita-toggle.md
│   └── ui-dashboard-toggle-periodo.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    ├── main.py                         # _migrar: aliquota_periodo
    ├── models/__init__.py              # MetaFinanceira.aliquota_periodo
    ├── schemas.py                      # request/response Configuração do Período; Pipeline dual-base
    ├── services/
    │   └── nf_valores.py               # reutilizar calcular_imposto_liquido
    └── api/routes/
        ├── metas.py                    # GET/PUT configuração período + contagem afetáveis
        └── relatorios.py               # Pipeline: valor_bruto + valor_liquido por estágio

frontend/
└── src/
    ├── pages/
    │   └── Dashboard.tsx               # toggle header; form meta+alíquota; KPIs por base
    ├── services/
    │   └── api.ts                      # metasService período; pipeline dual-base
    └── utils/
        └── metaPeriodo.ts              # opcional: meta_bruta, labels do toggle
```

**Structure Decision**: Persistência na meta mensal existente + endpoints dedicados de período (validação conjunta, preview e confirmação de massa). Agregações de receita dual-base no backend onde ainda faltar (Pipeline); `resumo-financeiro` já expõe bruto/líquido — o Dashboard seleciona pela visão ativa. Página `NFs.tsx` fora do redesign (só efeitos via update em massa).

## Complexity Tracking

> Sem violações a justificar.
