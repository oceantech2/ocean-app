# Tasks: Modelos Offshore Talent e Outsourcing e Fotos de Capa por Setor

**Input**: Design documents from `/specs/097-proposta-modelos-offshore-outsourcing/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados na spec; a validação segue o [quickstart.md](./quickstart.md), `npm run type-check` e `npm run build`.

**Organization**: Os ajustes do layout compartilhado (parágrafos do serviço e largura da logo) são pré-requisito das duas divisões e ficam na fase Foundational. US1 (criar) e US2 (página do cliente) das divisões novas são entregues juntas por divisão, pois o registro do modelo serve às duas.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: história da spec (US1 a US3)

---

## Phase 1: Setup

- [X] T001 [P] Extrair as logos PNG embutidas (data URI da `.div-logo`) de `externo/Proposta_Comercial_Offshore_Talent.html` e `externo/Proposta_Comercial_Outsourcing.html` para `frontend/public/propostas/offshore-talent/logo-divisao.png` e `frontend/public/propostas/outsourcing/logo-divisao.png`
- [X] T002 [P] Copiar as fotos de `externo/` para `frontend/public/propostas/setores/{oil-gas,energia,infraestrutura,mineracao,tecnologia}.jpg`, atribuindo pelo conteúdo da imagem (research R4)

---

## Phase 2: Foundational (bloqueia as divisões novas)

- [X] T003 Em `frontend/src/proposal/modelos/pagina/i18n/tipos.ts`, mudar `textoServico` para `string[]` e trocar `logo.larga?: boolean` por `logo.largura?: number` (research R2/R3)
- [X] T004 Em `frontend/src/proposal/modelos/pagina/PaginaModelo.tsx`, renderizar um `<p className="lead">` por parágrafo de `textoServico` e aplicar `logo.largura` pela variável CSS `--logo-largura` na `.div-logo`
- [X] T005 Em `frontend/src/proposal/modelos/pagina/pagina-modelo.css`, usar `width:var(--logo-largura,220px)` na logo e remover a regra `.larga`
- [X] T006 [P] Ajustar `frontend/src/proposal/modelos/executive-search/v1/conteudo/{pt-BR,en-US}.ts` e `frontend/src/proposal/modelos/outplacement-development/v1/conteudo/{pt-BR,en-US}.ts` para `textoServico` em array (mesmo texto) e `largura: 290` no Development & Outplacement

**Checkpoint**: Executive Search e Development & Outplacement idênticos ao que eram.

---

## Phase 3: User Story 1 + 2 — Offshore Talent e Outsourcing (P1) 🎯 MVP

**Goal**: o consultor cria propostas das duas divisões e o cliente vê a página igual ao HTML de referência.

**Independent Test**: quickstart §2 e §3.

- [X] T007 [US1] Em `backend/app/services/proposta_modelos.py`, registrar `offshore-talent` ("Offshore Talent", v1) e `outsourcing` ("Outsourcing", v1) em `MODELOS`, na ordem ES, Offshore, Outsourcing, D&O
- [X] T008 [P] [US1] Em `frontend/src/proposal/services/proposalApi.ts`, incluir `offshore-talent` e `outsourcing` em `ModeloId`
- [X] T009 [P] [US2] Criar `frontend/src/proposal/modelos/offshore-talent/v1/conteudo/pt-BR.ts` e `en-US.ts` com o conteúdo fixo do HTML (FR-004, FR-006, FR-007)
- [X] T010 [P] [US2] Criar `frontend/src/proposal/modelos/outsourcing/v1/conteudo/pt-BR.ts` e `en-US.ts` com o conteúdo fixo do HTML (FR-005, FR-006, FR-007)
- [X] T011 [P] [US2] Criar `frontend/src/proposal/modelos/offshore-talent/v1/OffshoreTalentV1.tsx` e `frontend/src/proposal/modelos/outsourcing/v1/OutsourcingV1.tsx` montando `PaginaModelo` com `{ tituloDivisao, escopo, formatoNovo }` verdadeiros
- [X] T012 [US1] Em `frontend/src/proposal/modelos/index.ts`, registrar os dois modelos (lazy, versão 1, `rotuloEscopo: 'Escopo'`, `garantiasSempreVisivel: true`) na ordem ES, Offshore, Outsourcing, D&O

**Checkpoint**: quickstart §2 e §3 passam.

---

## Phase 4: User Story 3 — Setor Tecnologia e foto por setor (P2)

**Goal**: 6 setores e capa com a foto do setor em todas as divisões.

**Independent Test**: quickstart §4.

- [X] T013 [P] [US3] Em `backend/app/services/proposta_modelos.py`, incluir `"tecnologia": "Tecnologia"` em `SETORES` antes de `industria-servicos`
- [X] T014 [P] [US3] Em `frontend/src/proposal/services/proposalApi.ts`, incluir `tecnologia` em `SetorId`
- [X] T015 [US3] Em `frontend/src/proposal/modelos/setores.ts`, apontar cada setor para a sua foto (Indústria & Serviços na padrão), incluir Tecnologia na 5ª posição e exportar `FOTO_PADRAO`
- [X] T016 [US3] Em `frontend/src/proposal/modelos/pagina/PaginaModelo.tsx`, no `onError` da foto da capa trocar para `FOTO_PADRAO` e só esconder a imagem se a própria padrão falhar (FR-012)

---

## Phase 5: Polish

- [X] T017 Rodar `npm run type-check` e `npm run build` em `frontend/` e importar `app.services.proposta_modelos` no backend
- [X] T018 Conferir as páginas no navegador (quickstart §3 e §4) contra os HTML de referência
- [X] T019 Remover a pasta `externo/` (research R7)

---

## Dependencies & Execution Order

- Setup (T001–T002) sem dependências.
- Foundational (T003–T006) antes das páginas novas (T009–T011), por causa do tipo `ConteudoDivisao`.
- T012 depende de T008 e T011. T015 depende de T002 e T014. T016 depende de T015.
- T019 só depois de T018 (a comparação usa os HTML de `externo/`).

## Parallel Opportunities

- T001 e T002; T009, T010 e T011; T013 e T014.

## Implementation Strategy

MVP = Phases 1 a 3 (divisões novas disponíveis). Phase 4 completa a regra de foto por setor para as quatro divisões.
