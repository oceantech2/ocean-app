# Implementation Plan: Contas a Receber — Novos nomes dos tipos

**Branch**: `017-contas-receber-tipos` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/017-contas-receber-tipos/spec.md`

**Note**: Clarify concluído (4 Qs). Classificação oficial gravada: Retainer / Sucesso / Parcelamento. Maggo continua no formato antigo e o Ocean converte na entrada. E-mails novos (assunto DH) usam os nomes novos.

## Summary

Trocar a classificação oficial de contas a receber e DH: **Retainer - Abertura → Retainer**, **Retainer - Fechamento → Sucesso**, **Sucesso → Parcelamento**. Persistência via enum `TipoFechamento` + `parcelamento`; conversão one-shot em `_migrar()`. API, listagens, Relatórios (mix de **três** grupos), DH, e-mails novos e exportação usam só os nomes novos. Maggo stub permanece na semântica antiga; `_parse_tipo_maggo` grava o valor oficial.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Axios, react-hot-toast, Recharts; FastAPI, SQLAlchemy, Pydantic; enum PostgreSQL `tipofechamento`

**Storage**: PostgreSQL — `ALTER TYPE tipofechamento ADD VALUE IF NOT EXISTS 'parcelamento'` (AUTOCOMMIT, padrão já usado para `statusnf`); UPDATE one-shot em `nfs.tipo` e `dh.tipo_fechamento`; `tipo_abertura_fechamento` permanece na tabela mas deixa de ser classificação oficial (gravado `NULL`)

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`; smoke POST `/api/nfs` e `/api/dh` com os três tipos; GET `/api/relatorios/fechamentos-por-tipo` com três chaves; restart da API para conferir conversão

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Conversão one-shot no boot; listagem e relatórios síncronos inalterados em volume

**Constraints**: Portas fixas; papéis admin/visualizador; Maggo real fora de escopo (stub mantém payload antigo); não reescrever e-mails/auditoria já gravados; não alterar Caixa/NF/unicidade

**Scale/Scope**: Enum + migração de dados; rotas `nfs`, `dh`, `relatorios`; páginas `NFs.tsx`, `DH.tsx`, `Relatorios.tsx`, `Dashboard.tsx` (mix); 0 páginas novas. Calendário hoje **não** exibe tipo de fechamento — sem mudança obrigatória nessa tela.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — tipos de receita/DH; admin escreve; visualizador só lê |
| III. Clareza antes de implementar | PASS — spec sem `[NEEDS CLARIFICATION]`; 4 clarificações gravadas |
| IV. Consistência com produto existente | PASS — mesmas páginas, toast, Layout, Maggo RO, arquivar |
| V. Simplicidade e escopo fechado | PASS — não drop de coluna; não novo contrato Maggo; Calendário no-op |
| Portas / segredos | PASS — sem mudança de portas; sem credenciais |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Manter `tipo_abertura_fechamento` (sempre `NULL` após conversão) é menor que `DROP COLUMN`. Mix de 3 grupos no Relatórios (e no Dashboard, que já busca o endpoint) atende FR-012 sem módulo novo.

## Project Structure

### Documentation (this feature)

```text
specs/017-contas-receber-tipos/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-contas-receber-tipos.md
│   └── ui-contas-receber-tipos.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    ├── main.py                      # ADD VALUE parcelamento + UPDATE one-shot nfs/dh
    ├── models/__init__.py           # TipoFechamento.PARCELAMENTO
    ├── schemas.py                   # tipo / tipo_fechamento: retainer|sucesso|parcelamento
    ├── api/routes/nfs.py            # parse Maggo → oficial; create/update oficiais
    ├── api/routes/dh.py             # assunto e-mail com nomes novos; persistir enum novo
    ├── api/routes/relatorios.py     # fechamentos-por-tipo: 3 chaves
    └── services/maggo_stub.py       # payload antigo inalterado (conversão na rota)

frontend/
└── src/
    ├── types/index.ts               # tipo e tipo_fechamento + parcelamento
    ├── pages/NFs.tsx                # labels, select, export
    ├── pages/DH.tsx                 # opções, totais, assunto preview
    ├── pages/Relatorios.tsx         # pizza/totais 3 grupos
    └── pages/Dashboard.tsx          # mix 3 grupos (dados já buscados)
```

**Structure Decision**: Evoluir o enum e as telas que **já** mostram tipo. Sem tabela nova. Calendário sem rótulo de tipo de fechamento → fora da lista de arquivos. Helper de mapeamento Maggo fica em `nfs.py` (único ponto de ingestão).

## Complexity Tracking

> Sem violações a justificar.
