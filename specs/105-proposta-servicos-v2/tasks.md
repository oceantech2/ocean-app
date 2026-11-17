# Tasks: Propostas v2 — serviços, setor Outros e PDF A4

**Input**: Design documents from `/specs/105-proposta-servicos-v2/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Por user story (US1 formulário/serviços, US2 PDF, US3 legado/MCP)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo
- **[Story]**: US1 | US2 | US3

---

## Phase 1: Setup

- [x] T001 Copiar imagens de setor do zip para `frontend/public/propostas/setores/` (incl. `industria-servicos.jpg`)
- [x] T002 [P] Criar pasta `frontend/src/proposal/modelos/ocean/v1/` (conteudo, brand, pagina, css)

---

## Phase 2: Foundational

- [x] T003 Em `backend/app/services/proposta_modelos.py`: adicionar `SERVICOS`, `SETORES["outros"]`, `MODELOS["ocean"]`, mapa legado→servicos, validação de `servicos` e observações
- [x] T004 Em `backend/app/models/__init__.py` + `main.py`: colunas JSONB `servicos`, `observacoes_investimento`, `observacoes_garantias` em `propostas` e `propostas_modelos`
- [x] T005 [P] Atualizar `backend/app/schemas.py` e serialização em `propostas.py` / rotas proposal
- [x] T006 [P] Portar conteúdo do zip para TS em `frontend/src/proposal/modelos/ocean/v1/conteudo.ts` com rótulo **sem** “até”/`up to`
- [x] T007 [P] Atualizar `frontend/src/proposal/modelos/setores.ts` + tipos em `proposalApi.ts` (`outros`, `ServicoId`, campos novos)

**Checkpoint**: Schema e catálogo prontos

---

## Phase 3: US1 — Criar proposta com serviços (P1) 🎯 MVP

**Goal**: Formulário e página pública no formato ocean/serviços

**Independent Test**: Nova proposta com R&S + Outros; link público ok; texto Impostos (18,75%)

- [x] T008 [US1] Implementar `PaginaOceanV2.tsx` + CSS (estrutura do `render.js`, brand do zip)
- [x] T009 [US1] Registrar modelo `ocean` em `frontend/src/proposal/modelos/index.ts`; `PropostaPublica` roteia ocean vs legado
- [x] T010 [US1] Adaptar `ModeloForm.tsx` / `Nova.tsx` / `Editar.tsx`: card Serviços, remover Divisão/Modelo de página, obs editáveis, payload `modelo: ocean`
- [x] T011 [US1] Ajustar cadastro de modelos de proposta (`ModeloForm` variante modelo, `proposal_modelos`) para `servicos`
- [x] T012 [US1] Backend: criar/editar proposta aceita e valida `servicos` + observações + setor `outros`

**Checkpoint**: US1 testável de ponta a ponta

---

## Phase 4: US2 — PDF A4 (P1)

**Goal**: Impressão sem quebra / sem chrome header

**Independent Test**: Casos do quickstart (~2/~2/~3 páginas)

- [x] T013 [US2] Portar bloco `@page` / `.pf` / `@media print` e `screen`-only breakpoints para `pagina-ocean.css`
- [x] T014 [US2] Garantir Baixar PDF usa título do documento e `window.print` (como zip)

**Checkpoint**: PDF ok no Chrome

---

## Phase 5: US3 — Legado e MCP (P2)

- [x] T015 [US3] Leitura: expor `servicos` derivados do mapa quando ausentes; propostas legadas seguem renderer antigo
- [x] T016 [US3] Atualizar `mcp_ferramentas.py` (enums `servicos`, `outros`, `ocean`)
- [x] T017 [US3] Cópia de proposta: se legado, mapear para ocean+servicos ao copiar (ou manter legado na cópia — preferir mapear para ocean)

---

## Phase 6: Polish

- [x] T018 Rodar `npx tsc --noEmit` no frontend e `python -m py_compile` nos módulos backend alterados
- [x] T019 Remover/ignorar `_tmp_propostas_v2/` do commit; conferir quickstart.md
- [x] T020 Atualizar checklist/tasks marcando concluídas

## Dependencies

- Phase 2 → US1 → US2 (CSS print na mesma página) → US3
- T006/T007 // com T003–T005

## Implementation Strategy

MVP = Phase 1–3 (formulário + página). Em seguida PDF (já no CSS da página). Por fim MCP/legado.
