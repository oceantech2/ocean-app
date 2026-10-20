# Tasks: Painel do consultor em domínio próprio (consultantpanel)

**Input**: Design documents from `/specs/099-consultant-panel-dominio/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/enderecos.md, quickstart.md

**Tests**: Não solicitados; validação por type-check, build e roteiro do quickstart.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [X] T001 [P] Servir `proposal.html` também para hosts `consultantpanel.*` no plugin de dev em frontend/vite.config.ts
- [X] T002 [P] Adicionar o rewrite do host `consultantpanel.oceantalentsolutions.com` para `/proposal.html` em frontend/vercel.json
- [X] T003 [P] Adicionar `CONSULTANT_PANEL_URL` e a origem `http://consultantpanel.localhost:5193` ao CORS padrão em backend/app/config.py

---

## Phase 2: Foundational

- [X] T004 Criar o módulo de domínios (`urlCliente`, `urlPainel`, `separacaoAtiva`, `ehHostCliente`, `ehHostPainel`, `redirecionarParaPainelSeNecessario`) em frontend/src/proposal/dominios.ts

---

## Phase 3: User Story 1 - Cliente continua em "proposal" (P1)

**Independent Test**: Quickstart passos 1 e 2.

- [X] T005 [US1] Redirecionar rotas do painel acessadas no host do cliente antes de montar o app em frontend/src/proposal/main.tsx
- [X] T006 [US1] Gerar o link do cliente com `urlCliente()` em frontend/src/proposal/utils/propostaCalculo.ts

---

## Phase 4: User Story 2 - Consultor usa o painel em "consultantpanel" (P1)

**Independent Test**: Quickstart passos 3, 4 e 5.

- [X] T007 [US2] Definir o título da aba "Consultant Panel · Ocean" fora de `/p/` em frontend/src/proposal/App.tsx
- [X] T008 [P] [US2] Trocar o nome exibido para "Consultant Panel" em frontend/src/proposal/components/ProposalLayout.tsx, frontend/src/proposal/pages/Login.tsx e frontend/src/proposal/pages/Convite.tsx
- [X] T009 [P] [US2] Apontar `/entrar` e `/convite` para a base do painel em frontend/src/utils/proposalUrl.ts
- [X] T010 [P] [US2] Renomear o item de menu e as mensagens para "Consultant Panel" em frontend/src/components/Layout.tsx
- [X] T011 [P] [US2] Renomear os textos visíveis "Proposal" para "Consultant Panel" em frontend/src/pages/Fornecedores.tsx e frontend/src/pages/Configuracoes.tsx
- [X] T012 [P] [US2] Usar `CONSULTANT_PANEL_URL` no botão do e-mail de aceite e renomear o rótulo em backend/app/services/email_aceite.py

---

## Phase 5: User Story 3 - Pré-visualização sem marcar "Visualizada" (P2)

**Independent Test**: Quickstart passo 6.

- [X] T013 [US3] "Abrir página do cliente" abre `/p/<código>` na origem do painel em frontend/src/proposal/pages/Detalhe.tsx
- [X] T014 [US3] Mostrar a faixa de pré-visualização (oculta na impressão) quando aberta no painel com sessão em frontend/src/proposal/pages/PropostaPublica.tsx

---

## Phase 6: Polish & Cross-Cutting

- [X] T015 [P] Documentar `VITE_CONSULTANT_PANEL_URL`, `CONSULTANT_PANEL_URL`, `CORS_ORIGINS` e o checklist de DNS/Vercel/Render em .env.deploy.example
- [X] T016 Rodar `npx tsc --noEmit` e `npx vite build` em frontend/ e `python -m py_compile` no backend/

---

## Dependencies & Execution Order

- Setup (T001–T003) em paralelo; T004 bloqueia US1, US2 (T009) e US3.
- US1 → US2 → US3 em ordem de prioridade; tarefas [P] dentro de US2 tocam arquivos distintos.

## Parallel Example

```text
T001 (vite.config.ts) ‖ T002 (vercel.json) ‖ T003 (config.py)
T008 ‖ T009 ‖ T010 ‖ T011 ‖ T012
```

## Implementation Strategy

MVP = Setup + T004 + US1 + US2 (separação de domínios e nome). US3 fecha o risco de falsa visualização; polish documenta a ativação em produção.
