# Implementation Plan: Zerar Dados do Banco (Preservar Login e Fornecedores)

**Branch**: `055-zerar-dados-banco` | **Date**: 2026-09-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/055-zerar-dados-banco/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Operação pontual (procedimento/comando administrativo, sem UI) para zerar todos os dados do Ocean App exceto **login** (`usuarios_app` / `usuarios_auth`) e **fornecedores** (`colaboradores` com `tipo='fornecedor'` e `elegivel_equipe=false`, incluindo histórico e documentos desses fornecedores). Inclui limpeza de categorias, contas correntes, config de páginas, equipe e anexos associados; sem reseeding; confirmação explícita; semântica **tudo ou nada** no banco. Abordagem: script Python no backend executável via container/host, transação PostgreSQL para deletes, remoção de arquivos após commit, e ajuste dos seeds de startup para não recriar estrutura automaticamente (FR-011).

## Technical Context

**Language/Version**: Python 3.11+ (backend existente)

**Primary Dependencies**: SQLAlchemy, SessionLocal (`backend/app/database.py`), models em `backend/app/models`

**Storage**: PostgreSQL 16 (porta host 5433); arquivos em `UPLOAD_DIR`, `NFS_DIR`, `COMPROVANTES_DIR`

**Testing**: Verificação manual via quickstart + contagens SQL pós-wipe; pytest opcional para unidade do critério de preservação

**Target Platform**: Ambiente Docker Compose local/ops do Ocean (serviço `ocean_backend` / Postgres)

**Project Type**: Web application (backend + frontend); esta feature é **somente backend/ops** — nenhuma mudança de frontend

**Performance Goals**: Limpeza + verificação de aceite em ≤ 15 minutos (SC-006) em volume típico interno

**Constraints**: Sem tela no app; backup fora do procedimento; atomicidade forte no Postgres; arquivos em disco best-effort pós-commit; portas fixas do projeto; sem reseeding estrutural após wipe

**Scale/Scope**: Uma operação pontual; ~20 tabelas de domínio; um script + ajuste pontual de seeds no startup

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Notas |
|-----------|--------|-------|
| I. Idioma Português | PASS | Artefatos e contratos em pt-BR |
| II. Domínio Financeiro Interno | PASS | Respeita papéis; não expõe wipe a visualizador via UI |
| III. Clareza Antes de Implementar | PASS | Spec esclarecida (5 Qs); escopo fechado |
| IV. Consistência com o Produto | PASS | Sem UI nova; padrão de script ops alinhado a `backend/scripts/` |
| V. Simplicidade e Escopo Fechado | PASS | Um script + ajuste de seeds; sem API REST de wipe |
| Portas / segredos | PASS | Sem mudança de portas; sem credenciais em artefatos |
| Spec ≠ stack | PASS | Detalhes técnicos ficam neste plan / research |

**Post-design re-check**: PASS — contratos CLI (não UI), data-model espelha preservação/exclusão, quickstart validável sem expor wipe no frontend.

## Project Structure

### Documentation (this feature)

```text
specs/055-zerar-dados-banco/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── cli-zerar-dados.md
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── main.py                 # Ajuste: seeds estruturais não rodam em todo startup
│   ├── database.py
│   ├── models/
│   ├── config.py               # UPLOAD_DIR / NFS_DIR / COMPROVANTES_DIR
│   └── services/
│       ├── categorias_contas.py  # seed_subcategorias_rh (só sob demanda)
│       └── paginas_visibilidade.py
└── scripts/
    ├── backup.sh               # existente (fora do escopo obrigatório)
    ├── zerar_dados.py          # NOVO — operação pontual de wipe
    └── seed_estrutura.py       # NOVO (opcional) — seed estrutural explícito para installs novos
```

**Structure Decision**: Feature limitada ao backend/ops. Nenhum arquivo em `frontend/`. Script em `backend/scripts/` alinhado ao padrão existente (`backup.sh`), com lógica SQLAlchemy reutilizando `SessionLocal` e models.

## Complexity Tracking

> Sem violações da constitution a justificar.
