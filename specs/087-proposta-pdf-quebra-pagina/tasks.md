# Tasks: Blocos inteiros por página no PDF da proposta

**Input**: Design documents from `/specs/087-proposta-pdf-quebra-pagina/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md) (PDF real pelo Chrome headless).

**Organization**: Linha de base do PDF (setup) → remover "não dividir" das seções grandes (fundação) → projetos e cartões inteiros (US1) → títulos junto do conteúdo (US2) → demais blocos (US3) → polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- CSS: `frontend/src/proposal/modelos/pagina/pagina-modelo.css` (bloco `@media print`)
- Layout: `frontend/src/proposal/modelos/pagina/PaginaModelo.tsx` (só a posição do `<footer>`)
- Contrato: `specs/087-proposta-pdf-quebra-pagina/contracts/ui-pdf-paginacao.md`
- **Não alterar**: regras fora de `@media print`; conteúdos das divisões; backend; `frontend/src/index.css`

---

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Gerar os PDFs de referência "antes" das propostas locais 36 (Executive Search v3, 2 projetos) e 37 (Development & Outplacement, 2 projetos) com Chrome headless e registrar nº de páginas e cortes (quickstart cenário 2). Resultado: 6 páginas cada; "Posição 2" dividida entre as páginas 4 e 5; cartão de contato dividido entre 5 e 6

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T002 Em `frontend/src/proposal/modelos/pagina/pagina-modelo.css`, trocar o seletor genérico `.tpl-es section` da regra `break-inside: avoid` por `#servico`, `#garantias` e `.next` (research R1 e R3)

**Checkpoint**: Investimento, Escopo e seção do meio podem quebrar entre blocos

---

## Phase 3: User Story 1 - Projeto de investimento inteiro na mesma página (Priority: P1) 🎯 MVP

**Goal**: Nome do projeto e todos os seus cartões na mesma página; cartões e Observações nunca cortados.

**Independent Test**: PDF da proposta 37 sem "Posição 2" dividida (quickstart cenários 1 e 2).

- [x] T003 [US1] Adicionar `.pos`, `.plan` e `.notes` à regra `break-inside: avoid` do `@media print` em `frontend/src/proposal/modelos/pagina/pagina-modelo.css`

**Checkpoint**: US1 funcional

---

## Phase 4: User Story 2 - Título de seção sempre junto do conteúdo (Priority: P1)

**Goal**: Nenhum título de seção, nome de projeto ou título de observações sozinho no fim da página.

**Independent Test**: Em todos os PDFs testados, todo título tem conteúdo abaixo na mesma página.

- [x] T004 [US2] Adicionar regra `break-after: avoid` para `.head`, `.pos h3` e `.notes h4` no `@media print` de `frontend/src/proposal/modelos/pagina/pagina-modelo.css`

**Checkpoint**: US1 + US2 completos

---

## Phase 5: User Story 3 - Demais blocos inteiros (Priority: P2)

**Goal**: Linhas de garantia, itens do escopo e cartão de contato nunca cortados (etapas e cartões de serviço já estavam cobertos).

**Independent Test**: PDF de cada modelo, nos dois idiomas, sem esses blocos cortados.

- [x] T005 [US3] Adicionar `.info div`, `.scope li` e `.contact` à regra `break-inside: avoid` do `@media print` em `frontend/src/proposal/modelos/pagina/pagina-modelo.css` (manter `.card`, `.step` e `.svc`)
- [x] T005a [US3] Mover o `<footer>` para dentro do `<main>` de `frontend/src/proposal/modelos/pagina/PaginaModelo.tsx`, logo após o cartão de contato (sem o `.wrap` interno), e adicionar `footer { break-before: avoid }` no `@media print`, para o rodapé não ficar sozinho numa página (research R7; encontrado na validação de T007)

**Checkpoint**: Todas as histórias completas

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T006 Rodar `npm run type-check` e `npm run build` em `frontend/` sem erros novos (type-check: 3 erros pré-existentes do Recharts em `Dashboard.tsx`, inalterados; build OK)
- [x] T007 Gerar os PDFs "depois" das propostas 36 e 37 e comparar com T001: nenhum projeto, cartão, observação ou contato cortado; nenhum título órfão; nº de páginas não aumenta (6 → 6 nas duas)
- [x] T008 Validar com propostas de teste temporárias (removidas depois): 3 projetos incluindo "Especialista Fiscal" (pt-BR, Development & Outplacement) e Escopo com mais de 3 páginas (en-US, Executive Search v3), mais a proposta 30 (assinada, v2) e a 33 (en-US). Escopo divide entre itens; página na tela idêntica pixel a pixel em 1280 px e 390 px

---

## Dependencies & Execution Order

- T001 → T002 → T003 → T004 → T005 → T005a (mesmo arquivo, sequenciais)
- T005a → T006 → T007 → T008

## Parallel Example

```text
Sem paralelismo útil: as alterações ficam no mesmo bloco @media print.
T006 (build) e T007 (PDFs) podem rodar juntos após T005a.
```

## Implementation Strategy

- **MVP**: Phase 1–3 (projeto inteiro). US2 e US3 entram na mesma entrega por serem poucas linhas no mesmo bloco.
- Entrega em um único commit na `main`.
