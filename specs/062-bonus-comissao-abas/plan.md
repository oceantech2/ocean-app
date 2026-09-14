# Implementation Plan: Página Bônus e Comissão com abas

**Branch**: `062-bonus-comissao-abas` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/062-bonus-comissao-abas/spec.md`

**Note**: Clarify 2026-09-14: Comissão = listagem atual; Bônus = tipo novo; mesmo pacote de ações nas duas abas; cadastro de bônus no fluxo da Conta a receber; valor em R$ informado (sem % / Atividade). Listagem operacional de Comissão (Editar→NF, Liberar, Pago, lote) já existe (`045`/`048`); esta feature acrescenta discriminador, abas, nomenclatura e bloco de bônus. `/speckit-plan` 2026-09-14 (Phase 0–1 sem NEEDS CLARIFICATION).

## Summary

Renomear a sessão **Comissões** para **Bônus e Comissão**, com abas **Bônus** | **Comissão** (padrão Comissão). Persistir o tipo novo na mesma tabela `bonus` via coluna `tipo` (`comissao` | `bonus`); linhas atuais ficam `comissao` por default. Reutilizar Liberar/Pagar/lote. No formulário da Conta a receber, bloco paralelo **Bônus** (Fornecedor, Mês/Ano, Valor R$ informado). Sync de comissões e de bônus **isolados por tipo**, para o payload de um não apagar o outro.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Axios, Zustand (`usePageFilters`); SQLAlchemy `Bonus` + `NF`; `ComissoesLinhasForm` + `comissoes_sync.sincronizar`; `bonusService` (`/api/bonus`)

**Storage**: PostgreSQL — tabela `bonus`: coluna nova `tipo` (`comissao`|`bonus`, default `comissao`); `percentual` e `etapa` passam a aceitar NULL em linhas `tipo=bonus`. Migration inline em `backend/app/main.py` (padrão do projeto). Sem tabela nova.

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no `frontend/`; smoke API **8001**

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (página `Bonus.tsx` + modal Contas a Receber em `NFs.tsx`)

**Performance Goals**: 1 GET `/api/bonus?tipo=…` por aba (ou um GET com `tipo` ao trocar aba); soma Liberado no cliente no recorte visível; SC-002 ≤ 10 s para alternar abas; SC-004 ≤ 5 s após Liberar

**Constraints**: Portas fixas; JWT; `admin` altera / `visualizador` só lê; nomenclatura só da sessão (Dashboard e Contas a Pagar legado inalterados); não reclassificar histórico; não recalcular valor de bônus quando o líquido da NF muda; não misturar linhas nos blocos nem nas abas; URL da sessão permanece `/comissoes`

**Scale/Scope**: 1 coluna + NULL em 2 campos; 1 query param `tipo` na listagem; 1 payload `bonus[]` em NF create/update; 1 form UI de linhas de bônus; abas na página existente; 0 páginas novas no menu

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Bônus e Comissão no domínio; visualizador somente leitura |
| III. Clareza antes de implementar | PASS — clarify 4/4 (tipo, ações, origem, valor informado) |
| IV. Consistência com produto existente | PASS — reuso `bonus`, sync NF, Liberar/Pagar, abas no estilo Dashboard, `/nfs?edit=` |
| V. Simplicidade e escopo fechado | PASS — discriminador na tabela existente; sem página extra; Dashboard fora |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Isolar sync por `tipo` é o mínimo para não apagar o outro conjunto. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/062-bonus-comissao-abas/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-bonus-comissao-abas.md
│   └── ui-bonus-comissao-abas.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    ├── main.py                      # ALTER tipo; percentual/etapa nullable
    ├── models/__init__.py           # Bonus.tipo
    ├── schemas.py                   # BonusLinhaInput; NFCreate/Update.bonus; BonusResponse.tipo
    ├── api/routes/
    │   ├── bonus.py                 # GET ?tipo=; lote inalterado (por id)
    │   └── nfs.py                   # sincronizar_bonus após sync de comissões
    └── services/
        ├── comissoes_sync.py        # filtrar existentes por tipo=comissao
        └── bonus_sync.py            # sync tipo=bonus (valor informado)

frontend/
└── src/
    ├── utils/paginasCatalogo.ts     # label Bônus e Comissão
    ├── pages/Bonus.tsx              # título, abas, listagem por tipo
    ├── pages/NFs.tsx                # bloco Bônus + payloads separados
    ├── components/BonusLinhasForm.tsx
    ├── types/index.ts               # tipo; BonusLinhaForm
    └── services/api.ts              # listar({ tipo }); NF.bonus[]
```

**Structure Decision**: Web app existente (frontend + backend). Sem serviço novo além de `bonus_sync.py` espelhando o sync de comissões, para não misturar regras de cálculo.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Nenhuma violação.
