# Implementation Plan: Filtros e exclusão de propostas no Proposal

**Branch**: `094-proposal-filtros-exclusao` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/094-proposal-filtros-exclusao/spec.md`

## Summary

`GET /api/proposal/propostas/` passa a aceitar os filtros `empresa`, `modelo`, `projeto`, `data_de`, `data_ate` e `criado_por` (este só para admin), além do `status` que já existe, todos aplicados antes da paginação. Dois endpoints novos, só para admin:

- `GET /autores`: lista de quem já criou propostas, para o filtro "Criado por";
- `DELETE /{id}`: exclusão física (assinatura e edições saem por `ON DELETE CASCADE`), registrada na auditoria do ERP.

No frontend, a lista ganha uma barra de filtros (texto com debounce, selects, datas e "Limpar filtros") e a ação Excluir; o Detalhe ganha o botão Excluir.

## Technical Context

**Language/Version**: Python 3.11 · TypeScript 5 + React 18

**Primary Dependencies**: FastAPI, SQLAlchemy 2 · Vite, Tailwind, Axios, react-hot-toast

**Storage**: PostgreSQL. Sem mudança de schema; FKs `propostas_assinaturas.proposta_id` e `propostas_edicoes.proposta_id` já são `ON DELETE CASCADE`

**Testing**: Sem suíte automatizada; `py_compile`, `npm run type-check`, `npm run build`, roteiro do [quickstart.md](./quickstart.md)

**Target Platform**: Web (Proposal em `frontend/src/proposal`)

**Project Type**: Aplicação web

**Performance Goals**: Lista filtrada responde como hoje (dezenas a centenas de propostas; `ILIKE` e `EXISTS` em `jsonb_array_elements` são suficientes nesse volume)

**Constraints**: Consultor continua restrito às próprias propostas; filtros não podem permitir curingas injetados

**Scale/Scope**: <1.000 propostas; 1 página de lista e 1 de detalhe

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|-----------|-----------|--------|
| I. Idioma Português | Artefatos e UI em pt-BR | ✅ |
| II. Domínio / papéis | Exclusão e "Criado por" restritos a admin; consultor só vê as próprias | ✅ |
| III. Clareza | Regra de exclusão decidida pelo usuário (qualquer status, definitiva) | ✅ |
| IV. Consistência | `window.confirm` na exclusão, toast, spinner; exclusão registrada em `registrar_auditoria` como nas demais entidades | ✅ |
| V. Simplicidade | Sem lixeira, sem filtros salvos, sem índice novo | ✅ |

**Re-check pós-design**: sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/094-proposal-filtros-exclusao/
├── plan.md
├── research.md
├── quickstart.md
├── contracts/rest-proposal-lista-exclusao.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/app/api/routes/proposal_propostas.py   # filtros na listagem; GET /autores; DELETE /{id}
frontend/src/proposal/services/proposalApi.ts  # FiltrosPropostas, listarAutores, excluirProposta
frontend/src/proposal/pages/Lista.tsx          # barra de filtros + ação Excluir
frontend/src/proposal/pages/Detalhe.tsx        # botão Excluir (admin)
frontend/src/proposal/utils/propostaCalculo.ts # mensagemConfirmacaoExclusao (lista e detalhe)
```

**Structure Decision**: Aplicação web existente; nenhum arquivo novo de código.

## Complexity Tracking

Sem violações da constitution.
