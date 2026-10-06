# Tasks: Modelo Development & Outplacement, Vários Projetos e Idioma Independente da Moeda

**Input**: Design documents from `/specs/083-proposta-modelo-development-outplacement/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados na spec; a validação segue o [quickstart.md](./quickstart.md), `npm run type-check` e `npm run build`.

**Organization**: O "formato novo" (projetos, Garantias e condições, validade em dias, idioma) é uma única mudança de dados usada por todas as histórias, por isso fica na fase Foundational junto com o layout compartilhado da página. As fases por história entregam a interface e o comportamento visível de cada uma.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: história da spec (US1 a US7)

---

## Phase 1: Setup

- [X] T001 Extrair a logo PNG embutida (data URI da `.div-logo`) de `C:\Users\mathe\Downloads\Proposta_Comercial_Development_Outplacement.html` para `frontend/public/propostas/outplacement-development/logo-divisao.png` (research R7)

---

## Phase 2: Foundational (bloqueia todas as histórias)

### Backend — dados, validação, hash e migração

- [X] T002 Adicionar as colunas `idioma`, `projetos`, `shortlist`, `sla`, `garantia_texto` e `validade_dias` ao modelo `Proposta`, trocar `CK_PROPOSTAS_CAMPOS_MODELO` pela expressão de dois formatos com o nome `ck_propostas_campos_modelo_v2` e criar `CK_PROPOSTAS_IDIOMA` em `backend/app/models/__init__.py` (data-model §1)
- [X] T003 [P] Criar `ProjetoIn` e acrescentar `idioma`, `projetos`, `shortlist`, `sla`, `garantia` e `validade_dias` em `PropostaCreate` em `backend/app/schemas.py`
- [X] T004 Em `backend/app/services/proposta_modelos.py`: registrar `outplacement-development` (versão 1) e ES `versao_atual = 3`; criar `IDIOMAS`/`IDIOMA_PADRAO`, `validar_idioma()`, textos padrão de Shortlist/SLA por idioma, `texto_garantia_meses(meses, idioma)`, `validar_projetos()` (1 a 10, nome obrigatório, mensagens com o número do projeto, reaproveitando `validar_investimentos`) e reescrever `validar_modelo()` para o formato novo (Garantias e condições opcionais até 255, `validade_dias` 1 a 365, `validade = data_proposta + dias`, "A validade calculada já passou. Ajuste a data ou os dias.", colunas antigas `None`) (data-model §2 a §4)
- [X] T005 Em `backend/app/services/proposta_modelos.py`, criar `converter_para_formato_novo(p, versao)` que transforma uma proposta ES no formato antigo (projeto único, garantia em meses) no formato novo conforme research R4
- [X] T006 Em `backend/app/services/propostas.py`: `formato_novo(p)`; `conteudo_canonico()` com o canônico do formato novo (data-model §5) mantendo o antigo congelado; `CAMPOS_MODELO_NOVO` e diff por posição de projeto (`projeto.<n>`) em `diff_campos()` (research R9); `serializar_item()` com `idioma`, `projeto_nome` (primeiro projeto) e `projetos_total`; `serializar_detalhe()` e `serializar_publica()` com `projetos`, `shortlist`, `sla`, `garantia`, `validade_dias` e `idioma` (inclusive no payload de cancelada/expirada) conforme contracts/api-proposal.md e contracts/api-public.md
- [X] T007 Em `backend/app/api/routes/proposal_propostas.py`: criação grava `idioma` validado; edição recusa troca de idioma com "O idioma da proposta não pode ser alterado"
- [X] T008 Em `backend/app/main.py` (`_migrar()`): bloco "Proposal (feature 083)" com as 6 colunas, `UPDATE` do idioma a partir da moeda, `ck_propostas_campos_modelo_v2` (adiciona se não existir, remove a antiga se existir) e `ck_propostas_idioma`; trocar o laço ORM da 082 por um que converte as pendentes ES com `projetos IS NULL` para a versão atual via `converter_para_formato_novo()` e recalcula o hash (data-model §7)

### Frontend — tipos, utilitários e layout compartilhado

- [X] T009 [P] Em `frontend/src/proposal/services/proposalApi.ts`: `ModeloId` com `outplacement-development`; tipo `Projeto`; `idioma`, `projetos`, `projetos_total`, `shortlist`, `sla`, `garantia`, `validade_dias` em `PropostaListItem`/`Proposta`/`PropostaPublicaData`; `PropostaModeloPayload` no formato novo; `AlteracaoCampo` aceitando projeto
- [X] T010 [P] Em `frontend/src/proposal/modelos/idioma.ts`: `IDIOMAS_FORM`, `MOEDAS_FORM` sem idioma no rótulo, `rotuloIdioma()`, `rotuloIdiomaMoeda()` e `idiomaDaProposta(dados)` (usa `idioma`, com fallback na moeda)
- [X] T011 [P] Criar `frontend/src/proposal/modelos/formatoProposta.ts`: textos padrão de Shortlist/SLA por idioma, `LIMITE_PROJETOS`, `projetosDaProposta(p)` (formato novo ou projeto único do antigo) e `garantiaDaProposta(p)` (texto ou meses formatados)
- [X] T012 Mover os textos comuns às divisões de `modelos/executive-search/v1/i18n/` para `frontend/src/proposal/modelos/pagina/i18n/{tipos,pt-BR,en-US,index,indisponivel}.ts` (capa, menu comum, investimento, rótulos e padrões de garantias, subtítulo da taxa "sobre a remuneração anual"/"of annual compensation", próximos passos, contato, aceite, WhatsApp, PDF) e criar o tipo `ConteudoDivisao` (logo, título da divisão, texto do serviço, seção do meio metodologia/serviços, título do escopo, observações de investimento e de garantias, `garantiasSempreVisivel`) (research R5)
- [X] T013 Mover `executive-search-v1.css` para `frontend/src/proposal/modelos/pagina/pagina-modelo.css`, acrescentando as regras `.svcs`, `.svc`, `.rate-sub` e a largura de logo por divisão do HTML de referência
- [X] T014 Criar `frontend/src/proposal/modelos/pagina/PaginaModelo.tsx` a partir de `ExecutiveSearchV1.tsx`, recebendo `divisao` e `recursos` (`tituloDivisao`, `escopo`, `formatoNovo`): idioma via `idiomaDaProposta`; seção do meio por tipo (metodologia ou cartões de serviços); no formato novo, um bloco por projeto, subtítulo da taxa em percentuais e linhas de Garantias e condições só quando preenchidas, ocultando seção e link quando vazias e `garantiasSempreVisivel` for falso; no formato antigo, comportamento atual inalterado
- [X] T015 Mover o conteúdo fixo do ES para `frontend/src/proposal/modelos/executive-search/v1/conteudo/{pt-BR,en-US}.ts`, reescrever `ExecutiveSearchV1.tsx` para montar `PaginaModelo`, acrescentar a v3 (`formatoNovo`) em `versoes.ts` e remover a pasta `i18n/` antiga do ES
- [X] T016 Atualizar `frontend/src/proposal/modelos/index.ts`: ES versões 1 a 3 e `outplacement-development` versão 1 apontando para o componente da divisão

**Checkpoint**: backend no formato novo com migração; página ES v1/v2 idêntica e ES v3 renderizando pelo layout compartilhado.

---

## Phase 3: User Story 1 — Criar proposta Development & Outplacement (P1) 🎯 MVP

**Goal**: o consultor escolhe Development & Outplacement e cria a proposta.

**Independent Test**: criar a proposta de exemplo do HTML escolhendo Development & Outplacement e ver o link e o modelo na lista.

- [X] T017 [US1] Em `frontend/src/proposal/pages/Nova.tsx`, trocar o modelo sem reiniciar o formulário (modelo passado ao `ModeloForm` como prop controlada) e manter o modelo da origem em **Criar cópia**
- [X] T018 [US1] Em `frontend/src/proposal/components/ModeloForm.tsx`, receber `modelo` por prop, enviá-lo no payload e usar o rótulo de escopo da divisão ("Escopo do Projeto" ou "Escopo")

---

## Phase 4: User Story 2 — Página do cliente Development & Outplacement (P1)

**Goal**: página igual ao HTML de referência, com aceite.

**Independent Test**: comparar o link com o HTML de referência e aceitar a proposta.

- [X] T019 [P] [US2] Criar `frontend/src/proposal/modelos/outplacement-development/v1/conteudo/pt-BR.ts` com o conteúdo fixo do HTML (título, lead, "Principais serviços" com os 3 cartões e ícones, "Escopo", Observações de Investimento, logo 290px, sem Observações de Garantias, `garantiasSempreVisivel: false`)
- [X] T020 [P] [US2] Criar `frontend/src/proposal/modelos/outplacement-development/v1/conteudo/en-US.ts` com a tradução (contracts/ui-proposal.md)
- [X] T021 [US2] Criar `frontend/src/proposal/modelos/outplacement-development/v1/OutplacementDevelopmentV1.tsx` montando `PaginaModelo` com o conteúdo da divisão e os recursos da v1
- [X] T022 [US2] Em `frontend/src/proposal/pages/PropostaPublica.tsx`, escolher textos de carregamento, cancelada e expirada pelo idioma da proposta

---

## Phase 5: User Story 3 — Vários projetos (P1)

**Goal**: 1 a 10 projetos por proposta, cada um com os seus investimentos.

**Independent Test**: proposta com "Posição 1" (3 tipos) e "Posição 2" (Retainer) no formulário, resumo, detalhe, lista e página.

- [X] T023 [US3] Em `frontend/src/proposal/components/ModeloForm.tsx`, substituir projeto único e investimentos por uma lista de projetos (adicionar, remover, subir, descer, limite de 10), validação e erros por projeto, payload `projetos` e resumo agrupado por projeto
- [X] T024 [US3] Em `frontend/src/proposal/components/ModeloForm.tsx`, ajustar `formDeModelo()` para carregar projetos do formato novo ou converter o projeto único do formato antigo (cópia de assinadas)
- [X] T025 [P] [US3] Em `frontend/src/proposal/pages/Lista.tsx`, coluna Projeto com "primeiro + N"
- [X] T026 [US3] Em `frontend/src/proposal/pages/Detalhe.tsx`, cabeçalho com "+ N" e seção Investimento com um bloco por projeto (via `projetosDaProposta`)

---

## Phase 6: User Story 4 — Idioma e moeda separados (P1)

**Goal**: escolha independente de idioma e moeda.

**Independent Test**: as 4 combinações exibem textos, datas e valores corretos.

- [X] T027 [US4] Em `frontend/src/proposal/components/ModeloForm.tsx`, seção Apresentação com Idioma e Moeda separados, ambos fixos na edição (prop `idiomaMoedaFixos`), e `idioma` no payload
- [X] T028 [P] [US4] Em `frontend/src/proposal/pages/Editar.tsx`, passar `idiomaMoedaFixos` e o modelo da proposta ao formulário
- [X] T029 [P] [US4] Em `frontend/src/proposal/pages/Lista.tsx` e `frontend/src/proposal/pages/Detalhe.tsx`, exibir "Idioma · Moeda" com `rotuloIdiomaMoeda`

---

## Phase 7: User Story 5 — Garantias e condições editáveis (P2)

**Goal**: Shortlist, SLA e Garantia em texto livre opcional.

**Independent Test**: linhas vazias somem; D&O sem linhas esconde a seção; ES mantém as Observações.

- [X] T030 [US5] Em `frontend/src/proposal/components/ModeloForm.tsx`, seção Garantias e condições (3 campos, padrões do idioma, troca de idioma substitui só textos padrão, dica conforme a divisão) e campos no payload
- [X] T031 [US5] Em `frontend/src/proposal/pages/Detalhe.tsx`, cartão Condições com Shortlist, SLA, Garantia e Validade

---

## Phase 8: User Story 6 — Validade em dias (P2)

**Goal**: validade informada em dias com data calculada.

**Independent Test**: 24/10/2026 + 30 dias → 23/11/2026 no formulário, detalhe e página.

- [X] T032 [US6] Em `frontend/src/proposal/components/ModeloForm.tsx`, campo Validade (dias) com padrão 30, data calculada exibida, validação 1 a 365 e "A validade calculada já passou…", `validade_dias` no payload; cópia volta para hoje e 30 dias

---

## Phase 9: User Story 7 — Edição, cópia, histórico e compatibilidade (P2)

**Goal**: edição/cópia/histórico com os campos novos; migração sem perda.

**Independent Test**: editar pendente migrada incluindo projeto e conferir histórico; assinada antiga intacta.

- [X] T033 [US7] Em `frontend/src/proposal/pages/Detalhe.tsx`, rótulos e formatação do histórico para `projeto.<n>`, `shortlist`, `sla`, `garantia_texto`, `validade_dias` (contracts/ui-proposal.md)
- [X] T034 [US7] Em `frontend/src/proposal/pages/Nova.tsx`, tela "Proposta criada" com o primeiro projeto e "+ N"

---

## Phase 10: Polish

- [X] T035 Rodar `npm run type-check` e `npm run build` em `frontend/` e corrigir erros
- [X] T036 Validar o backend com script Python (importação dos módulos, `validar_modelo`, `converter_para_formato_novo`, canônico do formato antigo inalterado para uma proposta de exemplo) a partir de `backend/`
- [X] T037 Executar o [quickstart.md](./quickstart.md) com a API e o navegador, incluindo a comparação visual com o HTML de referência

---

## Dependencies & Execution Order

- **Setup (T001)**: independente.
- **Foundational (T002–T016)**: T002 → T004/T005 → T006 → T007/T008 no backend; T003 em paralelo. No frontend, T009–T011 em paralelo; T012 → T013 → T014 → T015 → T016.
- **US1 (T017–T018)** depende da Foundational.
- **US2 (T019–T022)** depende da Foundational e de T001; independe da US1 para renderizar propostas criadas pela API.
- **US3, US4, US5, US6 (T023–T032)** dependem da Foundational; as tarefas no `ModeloForm.tsx` são sequenciais entre si (mesmo arquivo).
- **US7 (T033–T034)** depende de US3 a US6.
- **Polish (T035–T037)** por último.

## Parallel Opportunities

- T003 com T002; T009, T010 e T011 entre si.
- T019 e T020 (conteúdo D&O pt/en).
- T025 (Lista) com T023/T024 (formulário); T028 e T029 com T027.

## Implementation Strategy

1. **MVP**: Setup + Foundational + US1 + US2 + US3 + US4 (todas P1) — divisão nova no ar, com vários projetos e idioma separado, já que o formato novo é único.
2. **Incremento**: US5 e US6 (formulário de Garantias e condições e validade em dias; o backend já os suporta).
3. **Fechamento**: US7 (histórico e textos de confirmação) e Polish.
