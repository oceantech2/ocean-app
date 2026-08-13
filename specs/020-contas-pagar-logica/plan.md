# Implementation Plan: Contas a Pagar — Confirmar lógica do input manual

**Branch**: `020-contas-pagar-logica` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/020-contas-pagar-logica/spec.md`

**Note**: Clarify 2026-08-12 (4 Qs). Esta feature **confirma** a lógica já descrita em 008/014; o trabalho é auditar o código e fechar o gap de permissão de escrita na API.

## Summary

Formalizar a lógica canônica de Contas a Pagar: input unitário com máscara BRL; status derivado da data de pagamento; **Pagar** na lista = um clique com data de hoje; qualquer data de pagamento aceita; duplicatas permitidas; desfazer pagamento só na edição. A UI e o modelo já estão alinhados (014). O gap a fechar: `POST`/`PUT`/`DELETE` (e upload de comprovante) de `/api/contas` hoje aceitam qualquer usuário autenticado — visualizador deve receber **403** na escrita (`require_admin`), como já ocorre em importação e em Contas a Receber.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend); Python 3.11 + FastAPI (backend)

**Primary Dependencies**: React, Tailwind, Zustand, Axios, react-hot-toast; FastAPI, SQLAlchemy, Pydantic — sem lib nova

**Storage**: PostgreSQL — tabela `contas_pagar` existente; **sem** migration; **sem** unique de conteúdo

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check`; smoke POST/PUT/DELETE com token visualizador → 403; duplicata e data futura → 201

**Target Platform**: Web interna; frontend **5193**; API **8001**; PostgreSQL **5433**; Redis **6380** (inalteradas)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Create/update síncronos; listagem no padrão atual

**Constraints**: Portas fixas; papéis admin/visualizador; import permanece; sem “Deletar todas”; sem seletor Pendente\|Pago; sem modal de data no **Pagar**; sem unicidade; sem trava de data vs hoje/vencimento

**Scale/Scope**: Auditoria de `Contas.tsx` + ajuste pontual em `backend/app/api/routes/contas.py`; 0 páginas novas; 0 colunas DB; 0 endpoints novos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — Contas a Pagar; visualizador só lê (API + UI) |
| III. Clareza antes de implementar | PASS — spec sem `[NEEDS CLARIFICATION]`; 4 clarificações gravadas |
| IV. Consistência com produto existente | PASS — mesma página/`/api/contas`; **Pagar** um clique (não copiar modal Recebido) |
| V. Simplicidade e escopo fechado | PASS — não reimplementar 014; só confirmar + `require_admin` na escrita |
| Portas / segredos | PASS — sem mudança de portas; sem credenciais |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio. Não adicionar validação de data nem índice unique — Clarify A em ambas.

## Project Structure

### Documentation (this feature)

```text
specs/020-contas-pagar-logica/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-contas-pagar-logica.md
│   └── ui-contas-pagar-logica.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
└── app/
    └── api/routes/contas.py       # require_admin em POST/PUT/DELETE e upload comprovante

frontend/
└── src/
    └── pages/Contas.tsx           # auditoria: CTA, máscara, Pagar, sem Desfazer, sem unique
```

**Structure Decision**: Continuar no módulo Contas a Pagar. Sem tabela/página/util novos. `moeda.ts` e schemas 014 permanecem.

## Complexity Tracking

> Sem violações.
