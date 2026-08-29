# Implementation Plan: Contas a Receber — Excluir linha, Tipo e campos Maggo editáveis

**Branch**: `044-contas-receber-excluir-editar` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/044-contas-receber-excluir-editar/spec.md`

**Note**: Clarify 2026-08-28 (2 respostas): exclusão permitida em recebida sem mexer no caixa; Maggo não atualiza campos Maggo de conta já existente (só cria novas).

## Summary

Reativar exclusão **por linha** em Contas a Receber via soft delete (`excluida_em`), para a Maggo não recriar o fechamento. Renomear o rótulo **Método de pagamento** → **Tipo** e o valor visível **Parcelamento** → **Parcela** (persistência `parcelamento` inalterada). Liberar na UI a edição dos campos Maggo no Ocean, sem escrever na Maggo e sem o merge sobrescrever contas já existentes.

## Technical Context

**Language/Version**: Python 3.11 (FastAPI) + TypeScript 5.2 / React 18

**Primary Dependencies**: FastAPI, SQLAlchemy, Pydantic, Axios, Zustand, React Router, `react-hot-toast`

**Storage**: PostgreSQL 16 — coluna `nfs.excluida_em`; migração inline em `backend/app/main.py` (`_migrar`)

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run lint` + `npm run type-check` no frontend

**Target Platform**: Web interna; API **8001**; frontend **5193**; PostgreSQL **5433**; Redis **6380**

**Project Type**: Web application (backend + frontend)

**Performance Goals**: SC-001 — excluir linha em &lt; 30s; SC-006 — editar campo Maggo e persistir em &lt; 1 min

**Constraints**: Portas fixas; JWT admin/visualizador; sem escrita na Maggo; sem desfazer caixa; sem `DELETE /nfs/todas`; sem credenciais nos artefatos

**Scale/Scope**: Uma coluna nova; reativar DELETE unitário; filtros `excluida_em` nas consultas de NF; rótulos em NFs + DH; UI Maggo editável

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — exclusão e edição Maggo só admin |
| III. Clareza antes de implementar | PASS — 2/2 clarifies (caixa; merge Maggo) |
| IV. Consistência com produto existente | PASS — `confirm` + toast; soft delete (Maggo tombstone); arquivar permanece |
| V. Simplicidade e escopo fechado | PASS — uma coluna; enum não migrado; sem tabela tombstone extra |
| Portas / segredos | PASS |

**Post-design re-check**: PASS. Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/044-contas-receber-excluir-editar/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── rest-contas-receber-edicao.md
│   └── ui-contas-receber-edicao.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
backend/app/main.py                      # ALTER TABLE nfs.excluida_em
backend/app/models/__init__.py           # NF.excluida_em
backend/app/schemas.py                   # alias tipo parcela; NFResponse se expor excluida
backend/app/api/routes/nfs.py            # DELETE soft; filtro visíveis; merge skip excluída
backend/app/api/routes/relatorios.py     # filtrar excluídas
backend/app/api/routes/metas.py          # idem
backend/app/api/routes/impostos.py      # idem
backend/app/api/routes/dh.py            # rótulo Parcela em assunto novo
backend/app/services/email.py           # consultas NF visíveis; rótulo se houver
backend/app/services/nf_duplicidade.py  # unicidade inclui excluídas (sem filtro extra)

frontend/src/pages/NFs.tsx               # Tipo, Parcela, Excluir, maggoEditavel
frontend/src/pages/DH.tsx                # rótulo Parcela
frontend/src/types/index.ts             # excluida_em opcional se necessário
```

**Structure Decision**: Web app existente. Soft delete em `nfs` em vez de tabela nova. Rótulo Parcela só na apresentação; valor `parcelamento` permanece.

## Fases de implementação (resumo)

### Backend

1. Migração `excluida_em` + modelo
2. Helper `_nfs_visiveis`; aplicar em listagem, resumo, export, relatórios, metas, impostos, e-mail
3. `DELETE /nfs/{id}`: `require_admin`, soft delete, auditoria; `GET` por id 404 se excluída
4. Merge Maggo: `continue` se já existe (visível ou excluída)
5. Alias `parcela` em `_parse_tipo_create` / `_tipo_oficial`; rótulo Parcela em `dh.py`

### Frontend

1. `NFs.tsx`: coluna/formulário/CSV **Tipo**; `tipoLabel` → Parcela; botão Excluir; `maggoEditavel` para admin
2. `DH.tsx` + assunto: Parcela
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
| REST contract | [contracts/rest-contas-receber-edicao.md](./contracts/rest-contas-receber-edicao.md) |
| UI contract | [contracts/ui-contas-receber-edicao.md](./contracts/ui-contas-receber-edicao.md) |
| Quickstart | [quickstart.md](./quickstart.md) |
