# Tasks: Mostrar/ocultar senha nos campos de senha

**Input**: Design documents from `/specs/096-mostrar-senha/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados; `type-check`, `build` e roteiro do [quickstart.md](./quickstart.md).

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Foundational

- [x] T001 Criar `frontend/src/components/CampoSenha.tsx`: input com props repassadas, `type` alternando password/text, botão `type="button"` com ícones olho/olho riscado, `aria-label` e `aria-pressed`, `pr-10` no input (R1–R3)

---

## Phase 2: User Story 1 — Conferir a senha enquanto digita (P1) 🎯 MVP

**Independent Test**: cenários 1–6 do [quickstart.md](./quickstart.md).

- [x] T002 [P] [US1] Usar `CampoSenha` no login do ERP em `frontend/src/components/Login.tsx`
- [x] T003 [P] [US1] Usar `CampoSenha` no login do Proposal em `frontend/src/proposal/pages/Login.tsx` (mantendo `autoComplete="current-password"`)
- [x] T004 [P] [US1] Usar `CampoSenha` em "Senha" e "Confirmar senha" de `frontend/src/proposal/pages/Convite.tsx` (mantendo `autoFocus`, `minLength`, `autoComplete="new-password"`)
- [x] T005 [P] [US1] Usar `CampoSenha` no modal de usuário em `frontend/src/pages/Configuracoes.tsx` (`autoComplete="new-password"`)

---

## Phase 3: Polish

- [x] T006 Confirmar que não restou `type="password"` fora do `CampoSenha`; `npm run type-check` e `npm run build`

## Dependencies & Execution Order

T001 → T002–T005 (paralelas) → T006.
