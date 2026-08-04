# Implementation Plan: Ocean App — Baseline do Produto

**Branch**: `001-ocean-app-baseline` | **Date**: 2026-07-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-ocean-app-baseline/spec.md`

**Note**: Plano de **documentação as-is** (inventário técnico do sistema existente). Não propõe redesign nem implementação de features novas.

## Summary

Documentar a arquitetura e o modelo de dados atuais do Ocean App para servir de referência a specs futuras. O produto já está implementado como aplicação web full-stack: API FastAPI + PostgreSQL, frontend React/Vite, autenticação JWT/OAuth2 com 2FA TOTP opcional, arquivos em disco local e Docker Compose nas portas fixas do projeto (API 8001, Postgres 5433, Redis 6380, frontend dev 5193).

## Technical Context

**Language/Version**: Python 3.11 (backend); TypeScript 5.2 + React 18 (frontend)

**Primary Dependencies**: FastAPI, SQLAlchemy 2, Pydantic 2, python-jose, passlib, pyotp, pandas/openpyxl; React Router 6, Axios, Zustand, Recharts, Tailwind CSS, Vite 5

**Storage**: PostgreSQL 16; uploads em filesystem (`uploads`, `NFs`, `Comprovantes`); Redis 7 presente no Compose mas **não usado** pelo código da aplicação

**Testing**: pytest/httpx declarados em `requirements.txt`; **sem suíte de testes** no repositório hoje. Frontend: `lint` + `type-check`

**Target Platform**: Web interna (browser); API em container Linux / dev local Windows

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Uso interno; meta de UX do spec — listagem/resumo de NFs do mês em &lt; 3s em carga normal

**Constraints**: Portas host fixas (8001 / 5433 / 6380 / 5193) por conflito com outros projetos; schema via `create_all` + `_migrar()` (Alembic não operacional); autorização `visualizador` reforçada principalmente na UI

**Scale/Scope**: ~16 telas autenticadas, ~20 routers `/api/*`, 16 modelos SQLAlchemy; usuários internos (admin + visualizadores)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

A constituição em `.specify/memory/constitution.md` ainda é o **template não ratificado** (placeholders). Para este baseline documental:

| Gate | Status |
|------|--------|
| Princípios de constituição aplicáveis | N/A — constituição não preenchida |
| Escopo alinhado ao spec (as-is, sem redesign) | PASS |
| Sem introdução de stack nova neste plano | PASS |
| Artefatos de design (research, data-model, contracts, quickstart) | PASS (Phase 0/1) |

**Post-design re-check**: Sem violações. Complexidade Tracking vazio.

## Project Structure

### Documentation (this feature)

```text
specs/001-ocean-app-baseline/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1 — mapa da API
└── tasks.md             # Phase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── main.py              # app FastAPI, CORS, create_all, _migrar
│   ├── config.py            # settings / portas / dirs
│   ├── database.py
│   ├── models/__init__.py   # entidades SQLAlchemy
│   ├── schemas.py
│   ├── api/routes/          # 20 routers sob /api/*
│   └── services/            # audit, email, excel_io
├── Dockerfile
└── requirements.txt

frontend/
├── src/
│   ├── App.tsx              # rotas + Protected
│   ├── components/          # Layout, Login, ImportCSV, DocumentosModal, …
│   ├── pages/               # Dashboard, NFs, Contas, …
│   ├── services/api.ts      # Axios + serviços
│   ├── store/index.ts       # Zustand
│   └── types/
├── vite.config.ts           # porta 5193, strictPort
└── package.json

docker-compose.yml           # postgres, redis, backend, frontend, backup
NFs/                         # biblioteca de arquivos de NF (host mount)
Comprovantes/                # biblioteca de comprovantes (host mount)
```

**Structure Decision**: Aplicação web em dois diretórios (`backend/` + `frontend/`) orquestrados por Docker Compose — estrutura já existente e mantida como referência do baseline.

## Complexity Tracking

> Nenhuma violação de constituição a justificar (constituição ainda não ratificada).
