# Implementation Plan: Página Contas a Receber

**Branch**: `007-contas-receber` | **Date**: 2026-07-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-contas-receber/spec.md`

**Note**: Evolui a página de NFs para **Contas a Receber**: lista via **fonte simulada Maggo** (stub), remove criar/importar/excluir/pasta, adiciona **Caixa** (corrente/investimento) e restringe edição ao enriquecimento Ocean. Maggo real fora de escopo.

## Summary

Substituir a experiência operacional de NFs (criação local) por **Contas a Receber** alimentada por stub Maggo na listagem, com enriquecimento persistido no Ocean (`caixa`, pagamento, colaboradores, arquivar). Remover da UI (e bloquear na API quando aplicável) “Nova NF”, “Deletar Todas”, exclusão individual, importações e pasta/gerenciador de arquivos. Renomear rótulos de navegação; manter `permKey`/`/api/nfs` para não migrar permissões. Preparar contrato de listagem para troca futura do stub pela Maggo real (FR-014).

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Zustand, Axios, react-hot-toast; FastAPI, SQLAlchemy, PostgreSQL; stub Maggo em serviço Python (sem cliente HTTP externo nesta entrega)

**Storage**: PostgreSQL — coluna nova `nfs.caixa` (`corrente` \| `investimento` \| NULL) via `ALTER TABLE … IF NOT EXISTS` em `main.py` (padrão do projeto); enriquecimento continua na tabela `nfs`

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend; smoke da API de listagem/atualização allowlist

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Listagem + merge stub↔Ocean no mesmo padrão atual (até ~500 registros); feedback de erro imediato se stub falhar

**Constraints**: Portas fixas; papéis admin/visualizador; Maggo **real** fora de escopo; sem reintroduzir criar/importar/excluir/pasta; campos Maggo somente leitura na UI e allowlist no PUT

**Scale/Scope**: 1 página (NFs → Contas a Receber), 1 serviço stub, 1 coluna DB, ajustes de schemas/rotas/nav; sem Maggo de produção

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — módulo de recebíveis; admin edita enriquecimento; visualizador só lê |
| III. Clareza antes de implementar | PASS — clarify: campos editáveis, sem import/delete, stub Maggo |
| IV. Consistência com produto existente | PASS — Layout/toast/confirm; Caixa alinhado a Fluxo de Caixa (`corrente`/`investimento`); arquivar já existe |
| V. Simplicidade e escopo fechado | PASS — stub local + coluna `caixa` + UI; sem cliente Maggo real |
| Portas / segredos | PASS — sem mudança de portas; sem credenciais Maggo nos artefatos |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Stub isolado em serviço trocável (FR-014).

## Project Structure

### Documentation (this feature)

```text
specs/007-contas-receber/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-contas-receber.md
│   └── ui-contas-receber.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── main.py                    # ALTER nfs.caixa
│   ├── models/__init__.py         # coluna caixa
│   ├── schemas.py                 # NFResponse/Update + caixa; allowlist
│   ├── services/
│   │   └── maggo_stub.py          # NEW — fonte simulada
│   └── api/routes/
│       └── nfs.py                 # listar via stub+merge; bloquear create/import/delete; PUT allowlist

frontend/
└── src/
    ├── pages/NFs.tsx              # Contas a Receber (rótulos, remoções, caixa, readonly)
    ├── types/index.ts             # caixa?
    ├── services/api.ts            # tipagem/payloads; sem import/deletarTodas na UI
    ├── components/Layout.tsx      # label Contas a Receber
    ├── pages/Configuracoes.tsx    # label do módulo (permKey nfs)
    └── App.tsx                    # opcional: rota /contas-receber + redirect /nfs
```

**Structure Decision**: Manter arquivo `NFs.tsx` e prefixo `/api/nfs` nesta entrega (menos churn de permissões e consumidores Dashboard/Calendário/Bônus). Isolar Maggo em `maggo_stub.py` para substituição futura. Rótulos e contrato de UI passam a **Contas a Receber**.

## Complexity Tracking

> Sem violações a justificar.
