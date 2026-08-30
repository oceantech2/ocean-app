# Implementation Plan: Comissões vinculadas à Conta a receber

**Branch**: `045-comissoes-conta-receber` | **Date**: 2026-08-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/045-comissoes-conta-receber/spec.md`

**Note**: Clarify 2026-08-29 (2 respostas): **Pagar** só após **Liberar**; ações em massa = **Liberar** + **Pagar**.

## Summary

Vincular comissões à **Conta a receber** (`nfs`): cadastro em bloco no formulário de criação/edição da conta, valor calculado no servidor a partir do **valor líquido**, campo **Atividade** (multi-seleção), destinatário **Fornecedor** (cadastro unificado). Na página **Comissões**: remover Deletar e edição isolada; **Editar** navega para a conta; ações **Liberar** / **Pagar** (individual e em massa); colunas **Liberado** (soma por fornecedor) e **Pago** (por linha). Migração inline em `main.py`; REST estendido em `/api/nfs` (sync de linhas) e `/api/bonus` (liberar/pagar/lote).

## Technical Context

**Language/Version**: Python 3.11 (FastAPI) + TypeScript 5.2 / React 18

**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic v2, Axios, Zustand, React Router, Recharts, `react-hot-toast`

**Storage**: PostgreSQL 16 — migração inline (`ALTER TABLE bonus`) em `backend/app/main.py`; FK `bonus.nf_id → nfs.id`; colunas de estado `liberado`, `pago`, datas; coluna `atividades` (JSON/texto)

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend; smoke API com curl

**Target Platform**: Web interna; API **8001**; frontend **5193**; PostgreSQL **5433**; Redis **6380**

**Project Type**: Web application (backend + frontend)

**Performance Goals**: Listagem Comissões continua carregando até 500 registros/ano (padrão atual); lote de 5+ linhas em uma confirmação (SC-005)

**Constraints**: Portas fixas; JWT admin/visualizador; prefixo REST `/api/bonus` preservado; permKey `bonus`; papéis inalterados; sem credenciais nos artefatos; import CSV avulso fora de escopo funcional (mantém comportamento legado)

**Scale/Scope**: ~15 arquivos tocados; 1 serviço backend novo (`comissoes_sync`); 1 componente React (`ComissoesLinhasForm`); 4 endpoints novos; migração de 6 colunas em `bonus`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Liberar/Pagar só admin; visualizador somente leitura |
| III. Clareza antes de implementar | PASS — 2/2 clarifies na spec |
| IV. Consistência com produto existente | PASS — toast, `window.confirm`, Layout, padrão Contas a Pagar (autorizar → quitar), migração inline como 043 |
| V. Simplicidade e escopo fechado | PASS — estende tabela `bonus`; sem rename de API; import CSV legado intacto |
| Portas / segredos | PASS |

**Post-design re-check**: PASS. Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/045-comissoes-conta-receber/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-comissoes-conta-receber.md
│   └── ui-comissoes-conta-receber.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
backend/app/main.py                           # migração inline bonus.*
backend/app/models/__init__.py                # Bonus: nf_id, atividades, liberado, pago, datas
backend/app/schemas.py                        # ComissaoLinha*, NFCreate/Update + comissoes
backend/app/services/comissoes_sync.py        # sync linhas na conta; cálculo valor
backend/app/api/routes/nfs.py                 # criar/atualizar com sync comissões
backend/app/api/routes/bonus.py               # liberar/pagar; lote; listagem enriquecida
frontend/src/types/index.ts                   # Bonus estendido; ComissaoLinhaForm
frontend/src/services/api.ts                  # nfs com comissões; bonus liberar/pagar/lote
frontend/src/components/ComissoesLinhasForm.tsx  # bloco reutilizável no modal NF
frontend/src/pages/NFs.tsx                    # bloco comissões; query ?edit= abre modal
frontend/src/pages/Bonus.tsx                  # Liberado/Pago; lote; sem delete/modal edit
frontend/src/utils/comissoesCalculo.ts        # preview valor no form (read-only)
```

**Structure Decision**: Web app existente. Persistência na tabela `bonus` com extensão de colunas. Cadastro na origem (Conta a receber); operação de status na página Comissões.

## Fases de implementação (resumo)

### Backend

1. Migração inline: `nf_id`, `atividades`, `liberado`, `pago`, `data_liberacao`, `data_pagamento`
2. Serviço `comissoes_sync`: validar linhas, calcular `valor_bonus`, CRUD só não liberadas, ocultar se NF excluída
3. `POST/PUT /api/nfs`: payload opcional `comissoes[]`
4. `POST /api/bonus/{id}/liberar`, `POST /api/bonus/{id}/pagar`
5. `POST /api/bonus/acoes/liberar`, `POST /api/bonus/acoes/pagar` (lote)
6. `GET /api/bonus`: excluir vínculos com NF soft-deleted; resposta com campos novos

### Frontend

1. `ComissoesLinhasForm` no modal de Conta a receber (criar/editar)
2. `NFs.tsx`: carregar/sync comissões; deep-link `?edit={nfId}`
3. `Bonus.tsx`: colunas Liberado/Pago; checkboxes; Liberar/Pagar/lote; Editar → `/nfs?edit=`; remover Deletar e modal legado
4. Filtro fornecedor: listar todos fornecedores ativos (não só `elegivel_equipe`)
5. Tipos e `api.ts` alinhados aos contratos

### Verificação

Lint + type-check + [quickstart.md](./quickstart.md)

## Complexity Tracking

> Sem violações da constituição.

| Item | Notas |
|------|-------|
| — | Nenhuma exceção necessária |

## Artefatos gerados (Phase 0–1)

| Artefato | Caminho |
|----------|---------|
| Research | [research.md](./research.md) |
| Data model | [data-model.md](./data-model.md) |
| REST contract | [contracts/rest-comissoes-conta-receber.md](./contracts/rest-comissoes-conta-receber.md) |
| UI contract | [contracts/ui-comissoes-conta-receber.md](./contracts/ui-comissoes-conta-receber.md) |
| Quickstart | [quickstart.md](./quickstart.md) |

**Próximo comando sugerido**: `/speckit-tasks`
