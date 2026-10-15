# Tasks: E-mail com link e PDF no aceite da proposta

**Input**: Design documents from `/specs/095-proposta-email-aceite/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados; smoke da montagem (destinatários e HTML) e roteiro do [quickstart.md](./quickstart.md).

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [x] T001 [P] Em `backend/app/config.py`, adicionar `PROPOSAL_PUBLIC_URL` (env, padrão `http://proposal.localhost:5193`) e, em `.env.deploy.example`, a variável e itens de checklist (PROPOSAL_PUBLIC_URL e SMTP para os e-mails de aceite)

---

## Phase 2: Foundational

- [x] T002 Criar `backend/app/services/email_aceite.py` com `links(p)` (ver/pdf/proposal conforme [contracts/email-aceite.md](./contracts/email-aceite.md); sem pdf para `simples`), `destinatarios(db, p)` → `(cliente, internos)` conforme R3, e formatação de data/hora em São Paulo por idioma (R4)

---

## Phase 3: User Story 1 — Cliente recebe o comprovante (P1) 🎯 MVP

**Independent Test**: cenários 1–4 do [quickstart.md](./quickstart.md).

- [x] T003 [US1] Em `backend/app/services/email_aceite.py`, `montar_email_cliente(p) -> (assunto, html)` em pt-BR/en-US com `html.escape` (FR-002, FR-008)
- [x] T004 [US1] Em `backend/app/services/email_aceite.py`, `enviar_emails_aceite(proposta_id)`: sessão própria, carrega proposta + assinatura, envia ao cliente (só se houver e-mail) e trata exceções com log (FR-001, FR-007)
- [x] T005 [US1] Em `backend/app/api/routes/public_propostas.py` `assinar_proposta`, receber `BackgroundTasks` e agendar `enviar_emails_aceite(p.id)` após o commit bem-sucedido
- [x] T006 [P] [US1] Em `frontend/src/proposal/modelos/pagina/PaginaModelo.tsx`, `useEffect` de montagem: se `pdf=1` na URL, remover o parâmetro (`history.replaceState`) e chamar `baixarPdf()` após ~600 ms (FR-006)

---

## Phase 4: User Story 2 — Consultor e admins avisados (P1)

**Independent Test**: cenário 5 do [quickstart.md](./quickstart.md).

- [x] T007 [US2] Em `backend/app/services/email_aceite.py`, `montar_email_interno(p) -> (assunto, html)` em pt-BR com empresa, modelo, projetos, aceitante, data/hora, criador e 3 links (FR-004)
- [x] T008 [US2] Em `enviar_emails_aceite`, enviar o aviso interno à lista `internos` (deduplicada, sem o cliente) só quando não vazia (FR-003, FR-005)

---

## Phase 5: Polish

- [x] T009 `python -m py_compile` nos arquivos do backend; `npm run type-check` e `npm run build`
- [x] T010 Smoke com SQLite + `enviar_email` simulado: destinatários (consultor admin deduplicado, cliente fora da lista interna, login não e-mail → `consultor_email`), idioma do cliente, escape de HTML e ausência de PDF em `simples`

## Dependencies & Execution Order

- T001 → T002 → T003/T007 → T004/T008 → T005. T006 independente.

## Implementation Strategy

MVP = US1 (cliente). US2 no mesmo serviço logo em seguida. Configuração de SMTP em produção é pré-requisito operacional (quickstart).
