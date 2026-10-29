# Tasks: Carrossel da Equipe e logos de clientes em alta resolução no site

**Input**: Design documents from `/specs/101-site-equipe-carrossel-logos/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Não solicitados; validação por type-check, build e roteiro do quickstart.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [X] T001 Baixar as fontes oficiais das 12 logos listadas em research §6 para um diretório temporário fora do repositório e preparar Pillow em ambiente temporário

---

## Phase 2: Foundational

- [X] T002 [P] Adicionar `IconeChevronEsquerda` e `IconeChevronDireita` (chevrons Lucide, no padrão de `IconeChevronBaixo`) em frontend/src/site/icones.tsx

---

## Phase 3: User Story 1 - Equipe em carrossel (P1) 🎯 MVP

**Independent Test**: Quickstart "Equipe" passos 1–10.

- [X] T003 [US1] Criar frontend/src/site/components/CarrosselEquipe.tsx: trilho 3×8 com `translateX`, avanço de 1, teleporte ao bloco do meio no fim da transição, 3/2/1 por vez via `matchMedia` (research §1–§2)
- [X] T004 [US1] Em CarrosselEquipe.tsx: troca automática a cada 6 s com pausa por mouse, foco de teclado, toque e aba oculta; `prefers-reduced-motion` desliga troca automática e animação (research §3)
- [X] T005 [US1] Em CarrosselEquipe.tsx: setas Anterior/Próximo, 8 indicadores com `aria-current`, deslize por toque, `aria-hidden`/`tabIndex=-1` fora da área visível (research §4)
- [X] T006 [US1] Em CarrosselEquipe.tsx: card com foto e nome como link para o LinkedIn (`group-hover:scale-105`, `group-hover:underline`) além do ícone, em nova aba (FR-006)
- [X] T007 [US1] Trocar a grade da Equipe por `<CarrosselEquipe />` em frontend/src/site/pages/Home.tsx

---

## Phase 4: User Story 2 - Logos nítidas (P1)

**Independent Test**: Quickstart "Clientes" passos 1–3.

- [X] T008 [US2] Gerar as 12 logos em frontend/public/site/img/clientes/ (SVG oficiais; WebP recortados em até 432×192; recolorir textos brancos de Foresea/Prosafe; gradiente oficial na PRIO; recorte V.SHIPS do guia de marca) e remover os `.png` antigos (research §6)
- [X] T009 [US2] Atualizar `CLIENTES[].logo` com o nome do arquivo e extensão em frontend/src/site/dados/conteudo.ts e o `src` das logos em frontend/src/site/pages/Home.tsx

---

## Phase 5: Polish

- [X] T010 [P] Rodar `npx tsc --noEmit` e `npx vite build` em frontend/
- [X] T011 Executar o roteiro de specs/101-site-equipe-carrossel-logos/quickstart.md no navegador (computador, tablet, celular, DPR 2) e conferir peso das logos < 300 KB (110 KB)
- [X] T012 [P] Atualizar specs/100-site-institucional/research.md §4 (logos dos clientes agora vêm dos sites oficiais — ver feature 101)

## Phase 6: Ajuste pós-revisão — modal do consultor (FR-006)

- [X] T013 [US1] Criar frontend/src/site/components/ModalConsultor.tsx (foto, nome, cargo, bio opcional, LinkedIn; fecha por X, Esc e clique fora) renderizada em portal, e fazer foto/nome do card abrirem a modal em CarrosselEquipe.tsx, pausando a troca automática
- [X] T014 [US1] Adicionar o tipo `Consultor` com `bio` em frontend/src/site/dados/conteudo.ts, com as 8 bios enviadas pela Ocean

## Dependencies & Execution Order

- T001 → T008 → T009
- T002 → T003 → T004 → T005 → T006 → T007
- US1 (T002–T007) e US2 (T008–T009) são independentes entre si
- T010–T012 depois de tudo
