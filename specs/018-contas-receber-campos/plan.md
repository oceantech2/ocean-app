# Implementation Plan: Contas a Receber — Campos Maggo e Ocean

**Branch**: `018-contas-receber-campos` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/018-contas-receber-campos/spec.md`

**Note**: Clarify concluído (4 Qs). Maggo deixa de ser fonte de NF/emissão/vencimento. Merge por `maggo_id`. Status sem vencimento = pendente. Create manual mínimo: empresa, método, bruto, líquido. NF preenchida exige emissão.

## Summary

Separar na página **Contas a Receber** o grupo **Maggo** (vaga, empresa, método de pagamento, bruto, imposto, líquido, data ent. pgto — RO se origem Maggo) do grupo **Ocean** (NF, emissão, vencimento, pagamento; status derivado). Stub passa a enviar `maggo_id` + imposto + data ent. pgto, sem autoridade sobre a nota. Admin lança a nota no Ocean; sync Maggo atualiza valores do fechamento mesmo depois da NF.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Axios, react-hot-toast; FastAPI, SQLAlchemy, Pydantic; `nf_duplicidade` (013); `_parse_tipo_maggo` (017)

**Storage**: PostgreSQL — `maggo_id`, `valor_imposto`, `data_ent_pgto`; `data_emissao` e `data_vencimento` passam a `NULL`; unique parcial em `maggo_id`; backfill `maggo_id = numero` nas linhas Maggo existentes

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`; smoke GET/POST/PUT `/api/nfs` (Maggo sem NF, create mínimo, NF sem emissão → 422, PUT Ocean em Maggo, PUT Maggo em bruto → 422)

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Sync Maggo no GET inalterado em volume (~dezenas de linhas); listagem síncrona

**Constraints**: Portas fixas; papéis admin/visualizador; sem OCR/pasta/import/delete; Maggo real fora de escopo; DRE/relatórios continuam filtrando por `data_emissao` (sem emissão = fora do faturamento); não renomear colunas `razao_social`/`posicao`/`tipo`

**Scale/Scope**: Evoluir `NFs.tsx` + `/api/nfs` + stub + schema/modelo + `_migrar()`; 0 páginas novas; 0 endpoints novos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Contas a Receber; admin lança Ocean; visualizador só lê |
| III. Clareza antes de implementar | PASS — spec sem `[NEEDS CLARIFICATION]`; 4 clarificações gravadas |
| IV. Consistência com produto existente | PASS — mesma página/`/api/nfs`, toast, Layout, arquivar, tipos 017, NF opcional 016 |
| V. Simplicidade e escopo fechado | PASS — sem OCR; sem rename de colunas; DRE/relatórios fora; allowlist no PUT existente |
| Portas / segredos | PASS — sem mudança de portas; sem credenciais |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. `maggo_id` + datas NULL é o mínimo para FR-005/FR-011. Filtro de listagem por `COALESCE` evita esconder Maggo sem nota sem reabrir o DRE.

## Project Structure

### Documentation (this feature)

```text
specs/018-contas-receber-campos/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-contas-receber-campos.md
│   └── ui-contas-receber-campos.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    ├── main.py                      # ALTER maggo_id, valor_imposto, data_ent_pgto; DROP NOT NULL datas; índice; backfill
    ├── models/__init__.py           # colunas novas; datas nullable
    ├── schemas.py                   # NFCreate datas/NF opcionais; valor_imposto; data_ent_pgto; maggo_id na response; validator NF→emissão
    ├── api/routes/nfs.py            # sync por maggo_id; allowlist Ocean vs Maggo RO; status; filtro COALESCE; create mínimo
    └── services/maggo_stub.py       # shape novo (maggo_id, imposto, data_ent_pgto; sem NF/emissão/vencimento)

frontend/
└── src/
    ├── pages/NFs.tsx                # colunas, rótulos, grupos modal, validação, PUT Maggo Ocean-only
    ├── types/index.ts               # valor_imposto, data_ent_pgto, maggo_id; datas nullable
    └── services/api.ts              # payload create/update com nulos e campos novos
```

**Structure Decision**: Evoluir a tabela `nfs` e a página já usada. Sem tabela nova e sem endpoint novo. Relatórios/Dashboard não mudam o eixo de data (emissão = faturado). Export CSV da página e, se o XLSX de NFs for gerado no backend com colunas fixas, incluir imposto e data ent. pgto no mesmo ajuste da listagem.

## Complexity Tracking

> Sem violações a justificar.
