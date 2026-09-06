# Implementation Plan: Contas a Receber — Campos Maggo editáveis no Ocean

**Branch**: `051-contas-receber-maggo-editavel` | **Date**: 2026-09-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/051-contas-receber-maggo-editavel/spec.md`

**Note**: Clarify 2026-09-06 (3 respostas): imposto/líquido só via bruto+alíquota; caixa não mexe ao editar Recebida; comissões existentes não recalculam automaticamente.

## Summary

Garantir que o administrador edite no Ocean o grupo Maggo de Contas a Receber (vaga/projeto, empresa, candidato, tipo, valor bruto, alíquota, data de fechamento), com imposto e líquido **calculados e somente leitura**, sem escrita na Maggo e sem o merge sobrescrever contas já existentes. Fechar gaps em relação à entrega 044: **não** recalcular comissões ao mudar o líquido; **não** aceitar digitação livre de imposto/líquido; confirmar que Fluxo de Caixa permanece intacto.

## Technical Context

**Language/Version**: Python 3.11 (FastAPI) + TypeScript 5.2 / React 18

**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic, Axios, Zustand, React Router, `react-hot-toast`

**Storage**: PostgreSQL 16 — tabela `nfs` e `bonus` existentes; **sem** migração de schema nova

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend

**Target Platform**: Web interna; API **8001**; frontend **5193**; PostgreSQL **5433**; Redis **6380**

**Project Type**: Web application (backend + frontend)

**Performance Goals**: SC-001 — editar campo Maggo e ver valor persistido em &lt; 1 min

**Constraints**: Portas fixas; JWT admin/visualizador; sem escrita na Maggo; sem mexer em caixa ao editar valores; sem recalcular comissões existentes; sem credenciais nos artefatos

**Scale/Scope**: Ajuste fino em `nfs.py`, `comissoes_sync.py` e `NFs.tsx`; sem novos módulos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — edição Maggo só admin; visualizador RO |
| III. Clareza antes de implementar | PASS — 3/3 clarifies (fiscal; caixa; comissões) |
| IV. Consistência com produto existente | PASS — modal Contas a Receber; cálculo fiscal 045; merge Maggo 044 |
| V. Simplicidade e escopo fechado | PASS — sem schema novo; só fechar editabilidade + side-effects |
| Portas / segredos | PASS |

**Post-design re-check**: PASS. Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/051-contas-receber-maggo-editavel/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-maggo-editavel.md
│   └── ui-maggo-editavel.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
backend/app/api/routes/nfs.py              # PUT: ignorar imposto/líquido do client; merge skip; sem tocar caixa
backend/app/services/comissoes_sync.py     # Não recalcular valor_bonus ao mudar líquido da NF
backend/app/schemas.py                     # Documentar/validar NFUpdate (alíquota; imposto/líquido derivados)

frontend/src/pages/NFs.tsx                 # maggoEditavel admin; imposto/líquido RO; alíquota editável; ajuda origem
frontend/src/utils/ (cálculo fiscal UI)    # Reusar aplicarCalculoFiscal já existente — sem novo util se já cobre
```

**Structure Decision**: Web app existente. Feature é **fechamento/gap-fill** da editabilidade Maggo (044/045), não módulo novo.

## Fases de implementação (resumo)

### Backend

1. Confirmar `_sync_maggo_stub`: `continue` se `maggo_id` já existe (visível ou excluída) — sem update Maggo
2. `PUT /nfs/{id}`: aceitar grupo Maggo + alíquota; **ignorar** `valor_imposto` / `valor_liquido` do body quando houver recalculo (ou sempre recalcular a partir de bruto+alíquota); **nunca** mutar `origem`/`maggo_id`; **não** criar/atualizar movimentos de caixa por mudança de valor
3. `comissoes_sync.sincronizar`: preservar `valor_bonus` (e status) de comissões existentes quando só o líquido da NF mudou — remover/ajustar o loop que recalcula todas as não liberadas (FR-012)

### Frontend

1. `NFs.tsx`: `maggoEditavel = papel === 'admin'` (origem Maggo ou manual); campos Maggo editáveis; imposto e líquido `readOnly`/`disabled` com cálculo via bruto+alíquota
2. Texto de ajuda: correção só no Ocean, Maggo não é atualizada
3. Lint + type-check + quickstart

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
| REST contract | [contracts/rest-maggo-editavel.md](./contracts/rest-maggo-editavel.md) |
| UI contract | [contracts/ui-maggo-editavel.md](./contracts/ui-maggo-editavel.md) |
| Quickstart | [quickstart.md](./quickstart.md) |
