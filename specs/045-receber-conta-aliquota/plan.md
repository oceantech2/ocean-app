# Implementation Plan: Contas a Receber — Conta, Alíquota e cards líquidos

**Branch**: `045-receber-conta-aliquota` | **Date**: 2026-08-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/045-receber-conta-aliquota/spec.md`

**Note**: Clarify 2026-08-29 — Impostos = bruto × alíquota; líquido = bruto − impostos; Impostos/Líquido somente conferência; mesmas regras na edição; sem recálculo em massa.

## Summary

Estender **Contas a Receber** (`NFs.tsx`, rota `/nfs`) com três entregas acopladas:

1. **Campo Conta** sempre visível no formulário de criação/edição (não só quando Recebida), pré-selecionando o **slot 1** (primeira corrente ativa na ordem do produto) com fallback na conta **padrão**; persistir `caixa` também em registros **Pendentes**.
2. **Campo Alíquota (imposto)** na criação e edição, com cálculo automático de **Impostos** e **Valor líquido** (somente conferência, sem digitação); fórmulas confirmadas na clarify.
3. **Cards de resumo**: renomear para **Líquido Pendente** / **Líquido Vencido** e exibir `total_liquido_*` (o backend já expõe; o frontend hoje usa `total_bruto_*`).

Abordagem: coluna `aliquota_imposto` em `nfs`; helper compartilhado de cálculo no backend (autoridade) e espelho no frontend (UX imediata); ajuste mínimo em `nfs.py` para `caixa` pendente; cards só no frontend.

## Technical Context

**Language/Version**: Python 3.11 (FastAPI) + TypeScript 5.2 / React 18

**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic, Axios, `NFs.tsx`, `fluxoCaixaMovimentos.ts`, `app.services.caixas`, `react-hot-toast`

**Storage**: PostgreSQL 16 — `ALTER TABLE nfs ADD COLUMN aliquota_imposto FLOAT NULL`; migração inline em `backend/app/main.py` (`_migrar`). Colunas existentes: `valor_bruto`, `valor_imposto`, `valor_liquido`, `caixa`.

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend; testes backend existentes de rotas NF se houver

**Target Platform**: Web interna; API **8001**; frontend **5193**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (backend + frontend)

**Performance Goals**: SC-007 — cadastro completo em &lt; 2 min; recálculo instantâneo no formulário (&lt; 100 ms percebido)

**Constraints**: Portas fixas; JWT admin escrita / visualizador leitura; investimento fora do select Conta; sem recálculo em massa; sem ajuste manual de imposto/líquido

**Scale/Scope**: Uma página (`NFs.tsx`), rotas `POST/PUT /api/nfs`, endpoint `GET /api/nfs/resumo` (sem mudança de contrato de totais — só consumo no frontend)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — admin edita; visualizador só lê cards e coluna Conta |
| III. Clareza antes de implementar | PASS — 3/3 clarifies na spec |
| IV. Consistência com produto existente | PASS — mesmo modal, toast, select de correntes da 036; tooltip mensal de imposto (037) intacto |
| V. Simplicidade e escopo fechado | PASS — uma coluna nova; helper de cálculo; cards = troca de campo + rótulo |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações. Não recalcular histórico em massa. Não expor investimento no campo Conta. Backend recalcula imposto/líquido para evitar bypass via API. Tooltip de alíquota **mensal** (037) permanece distinto da alíquota **por linha** desta feature.

## Project Structure

### Documentation (this feature)

```text
specs/045-receber-conta-aliquota/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-receber-conta-aliquota.md
│   └── ui-receber-conta-aliquota.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/app/main.py                         # ADD nfs.aliquota_imposto
backend/app/models/__init__.py              # NF.aliquota_imposto
backend/app/schemas.py                      # aliquota_imposto; validação caixa pendente
backend/app/services/nf_valores.py          # NEW calcular_imposto_liquido(bruto, aliquota)
backend/app/services/caixas.py              # NEW codigo_slot1 (primeira corrente ativa)
backend/app/api/routes/nfs.py               # caixa pendente; recálculo; resumo inalterado
frontend/src/types/index.ts                 # NF.aliquota_imposto
frontend/src/utils/nfValores.ts             # NEW espelho do cálculo + codigoSlot1
frontend/src/utils/fluxoCaixaMovimentos.ts  # opcional: reexport codigoSlot1
frontend/src/pages/NFs.tsx                  # Conta sempre; Alíquota; read-only imposto/líquido; cards
```

**Structure Decision**: Web app existente. Contas a Receber = `NFs.tsx`. Cálculo fiscal centralizado em `nf_valores.py` (backend) e `nfValores.ts` (frontend).

## Complexity Tracking

> Sem violações da constituição.
