# Tasks: Site institucional da Ocean (landing page, Soluções e Vagas)

**Input**: Design documents from `/specs/100-site-institucional/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/enderecos.md, contracts/formularios.md, quickstart.md

**Tests**: Não solicitados; validação por type-check, build e roteiro do quickstart.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [X] T001 Extrair da exportação (fora do repositório, com Pillow em ambiente temporário) e otimizar as imagens para frontend/public/site/img/: logo, hero (~1920 px), 8 fotos da equipe (224×224), 12 logos de clientes; e do protótipo publicado a imagem de topo de Soluções e as 6 ilustrações de setores (WebP 400 px) — research §4
- [X] T002 Gerar frontend/public/site/site.css a partir do CSS da exportação: sem `@font-face` embutidos, sem a regra de exportação estática que desliga animações, e com as URLs base64 trocadas por `/site/img/...` — research §2
- [X] T003 [P] Criar frontend/site.html (título, descrição, Open Graph, `google-site-verification`, favicon, Google Fonts Inter/Poppins, `/site/site.css`, `src/site/main.tsx`) — research §3 e §9
- [X] T004 [P] Adicionar a entrada `site` ao build e servir `site.html` para hosts `site.*` no plugin de dev em frontend/vite.config.ts
- [X] T005 [P] Adicionar os rewrites de `oceantalentsolutions.com` e `www.oceantalentsolutions.com` para `/site.html` em frontend/vercel.json
- [X] T006 [P] Excluir `./src/site/**` do `content` em frontend/tailwind.config.js

---

## Phase 2: Foundational

- [X] T007 [P] Criar os ícones SVG (Lucide) usados no site em frontend/src/site/icones.tsx
- [X] T008 [P] Criar o conteúdo estático (equipe, clientes, casos, valores, cards de solução, contatos, soluções e setores) em frontend/src/site/dados/conteudo.ts
- [X] T009 [P] Criar o cabeçalho com logo, menu (Home, Soluções, Vagas, Contato) e menu do celular em frontend/src/site/components/Cabecalho.tsx
- [X] T010 [P] Criar o rodapé com "Voltar ao topo" em frontend/src/site/components/Rodape.tsx
- [X] T011 [P] Criar o botão flutuante de WhatsApp em frontend/src/site/components/WhatsAppFlutuante.tsx
- [X] T012 Criar o app com rotas `/`, `/solucoes`, `/vagas`, `*` → `/`, rolagem ao topo/âncora e `Toaster` em frontend/src/site/App.tsx e frontend/src/site/main.tsx

---

## Phase 3: User Story 1 - Página inicial (P1) 🎯 MVP

**Independent Test**: Quickstart §2.1.

- [X] T013 [US1] Criar a Home (hero e números, Quem Somos + 4 cards com "Saiba mais" para a aba certa, Valores, Equipe, Clientes, Resultados, seção Contato com dados de contato) em frontend/src/site/pages/Home.tsx

---

## Phase 4: User Story 2 - Vagas e "Tenho interesse" (P1)

**Independent Test**: Quickstart §2.2.

- [X] T014 [P] [US2] Criar a lista fixa de vagas e as opções de filtro em frontend/src/site/dados/vagas.ts
- [X] T015 [P] [US2] Criar o modal "Tenho interesse" com validação e confirmação sem envio em frontend/src/site/components/ModalInteresse.tsx — contracts/formularios.md
- [X] T016 [US2] Criar a página Vagas com filtros Área/Nível, contador e lista vazia em frontend/src/site/pages/Vagas.tsx

---

## Phase 5: User Story 3 - Soluções (P2)

**Independent Test**: Quickstart §2.3.

- [X] T017 [US3] Criar a página Soluções (topo com imagem, 4 abas sincronizadas com a âncora, metodologia, áreas e cargos, benefícios, cards, anterior/próxima, setores, diferenciais, chamada final) em frontend/src/site/pages/Solucoes.tsx

---

## Phase 6: User Story 4 - Formulário de contato (P2)

**Independent Test**: Quickstart §2.4.

- [X] T018 [US4] Criar o formulário de contato com validação e confirmação sem envio em frontend/src/site/components/FormularioContato.tsx e usá-lo na seção Contato de frontend/src/site/pages/Home.tsx — contracts/formularios.md

---

## Phase 7: Polish & Cross-Cutting

- [X] T019 [P] Documentar domínios e DNS do site no checklist de deploy em .env.deploy.example
- [X] T020 Rodar `npx tsc --noEmit` e `npx vite build` em frontend/ e conferir `dist/site.html`, `dist/app.html`, `dist/proposal.html` e `dist/site/`
- [X] T021 Validar no navegador em `site.localhost:5193` (computador e 375 px) os roteiros do quickstart §2.1–2.5 e conferir que ERP e Proposal locais continuam iguais

---

## Dependencies & Execution Order

- T001 antes de T002 (o CSS referencia as imagens geradas). T003–T006 em paralelo.
- Phase 2 depende de Phase 1; T012 depende de T009–T011.
- US1 (T013) e US2 (T014–T016) dependem de Phase 2 e são independentes entre si.
- US3 (T017) depende de Phase 2 e de T008.
- US4 (T018) depende de T013 (mesma página).
- Polish depois de todas as histórias.

## Parallel Example

```text
T003 (site.html) ‖ T004 (vite.config.ts) ‖ T005 (vercel.json) ‖ T006 (tailwind.config.js)
T007 ‖ T008 ‖ T009 ‖ T010 ‖ T011
T014 ‖ T015
```

## Implementation Strategy

MVP = Setup + Foundational + US1 (a página inicial publicada no domínio principal). Em seguida US2 (Vagas, foco da validação), US3 (Soluções) e US4 (formulário de contato), cada uma conferível isoladamente pelo quickstart.
