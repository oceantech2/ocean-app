# Tasks: Imposto mensal nas propostas

**Input**: Design documents from `/specs/092-proposta-imposto-mensal/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec; validação por checks estáticos e roteiro manual do [quickstart.md](./quickstart.md).

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e [research.md](./research.md): tabela `impostos_proposta`, coluna `propostas.imposto_percentual`, padrão 18,75, legado 19,55, mês de referência = data do salvamento (São Paulo); proposta simples fora do escopo

---

## Phase 2: Foundational (bloqueia todas as histórias)

- [x] T002 Em `backend/app/models/__init__.py`, criar `ImpostoProposta` (`impostos_proposta`: id, ano, mes, percentual Numeric(5,2), criado_em, atualizado_em, atualizado_por; `UniqueConstraint(ano, mes)`; CHECKs de mês 1–12 e 0 < percentual < 100) e adicionar `Proposta.imposto_percentual = Column(Numeric(5, 2), nullable=True)` conforme [data-model.md](./data-model.md)
- [x] T003 Em `backend/app/main.py`, em `_migrar()`, novo bloco "feature 092": `ALTER TABLE propostas ADD COLUMN IF NOT EXISTS imposto_percentual NUMERIC(5,2)`, `ALTER TABLE impostos_proposta ENABLE ROW LEVEL SECURITY` e seed `INSERT INTO impostos_proposta (ano, mes, percentual, criado_em) VALUES (2026, 10, 18.75, NOW()) ON CONFLICT (ano, mes) DO NOTHING` (FR-014), com rollback + log no padrão dos blocos existentes
- [x] T004 Criar `backend/app/services/imposto_proposta.py` com `IMPOSTO_PADRAO = Decimal("18.75")`, `IMPOSTO_LEGADO = Decimal("19.55")` e `imposto_vigente(db, hoje=None) -> dict` (`percentual` Decimal, `ano`, `mes`, `origem` ∈ mes/anterior/padrao) conforme R3

**Checkpoint**: modelo, migração e regra de resolução prontos.

---

## Phase 3: User Story 1 — Cadastrar o imposto do mês no ERP (P1) 🎯 MVP

**Goal**: admin cadastra/edita o imposto de cada mês em Configurações.

**Independent Test**: cenário 1 do [quickstart.md](./quickstart.md).

- [x] T005 [P] [US1] Em `backend/app/schemas.py`, criar `ImpostoPropostaIn` (`ano` 2000–2100, `mes` 1–12, `percentual` Decimal > 0 e < 100 com até 2 casas, mensagem "Percentual deve ser maior que 0 e menor que 100") e `ImpostoPropostaOut` (`ano`, `mes`, `percentual` float, `atualizado_em`, `atualizado_por`)
- [x] T006 [US1] Em `backend/app/api/routes/configuracoes.py`, implementar `GET /imposto-proposta` (admin, ordenado ano/mes desc) e `PUT /imposto-proposta` (admin, upsert por ano/mês, `atualizado_em/atualizado_por`, `registrar_auditoria` com ação `criar`/`editar`, entidade `ImpostoProposta`, descrição `"{mes}/{ano} — {percentual}%"`) conforme [contracts/rest-imposto-proposta-erp.md](./contracts/rest-imposto-proposta-erp.md)
- [x] T007 [P] [US1] Em `frontend/src/services/api.ts`, adicionar tipo `ImpostoProposta` e `configuracoesService.listarImpostosProposta()` / `salvarImpostoProposta({ ano, mes, percentual })`
- [x] T008 [US1] Em `frontend/src/pages/Configuracoes.tsx`, nova seção "Imposto das propostas" (admin): formulário com mês (select Jan–Dez), ano e percentual (aceita vírgula), botão Salvar com toast de sucesso/erro, e tabela dos meses cadastrados (Mês/Ano, Percentual em pt-BR, Atualizado em/por) com ação Editar que carrega o mês no formulário

**Checkpoint**: US1 funcional e testável sozinha.

---

## Phase 4: User Story 2 — Proposta nova usa o imposto do mês vigente (P1)

**Goal**: propostas novas gravam e exibem o imposto vigente nos dois idiomas; o consultor vê o valor antes de gerar.

**Independent Test**: cenários 2 e 3 do [quickstart.md](./quickstart.md).

- [x] T009 [US2] Em `backend/app/services/propostas.py`, incluir `"imposto_percentual"` no `conteudo_canonico` do formato novo **somente quando não nulo** (R4) e expor `imposto_percentual` (`_dec_str`) em `serializar_detalhe` e no ramo por modelo de `serializar_publica`
- [x] T010 [US2] Em `backend/app/api/routes/proposal_propostas.py`, adicionar `GET /imposto-vigente` (antes de `/{proposta_id}`; `get_proposal_user`; resposta `{percentual: "18.75", ano, mes, origem}`) e, em `criar_proposta`, gravar `dados["imposto_percentual"] = imposto_vigente(db)["percentual"]` antes de calcular o hash — [contracts/rest-proposal-imposto.md](./contracts/rest-proposal-imposto.md)
- [x] T011 [P] [US2] Em `frontend/src/proposal/services/proposalApi.ts`, adicionar `imposto_percentual?: string | null` aos tipos de proposta (detalhe e pública), tipo `ImpostoVigente` e `obterImpostoVigente()`
- [x] T012 [P] [US2] Em `frontend/src/proposal/modelos/formatacao.ts`, adicionar `formatarPercentual(valor: string, idioma)` com `Intl.NumberFormat(idioma, { maximumFractionDigits: 2 })`
- [x] T013 [US2] Em `frontend/src/proposal/modelos/pagina/i18n/tipos.ts`, adicionar `observacaoImpostos: (percentual: string) => string` em `ConteudoDivisao`; nos 4 arquivos `frontend/src/proposal/modelos/{executive-search,outplacement-development}/v1/conteudo/{pt-BR,en-US}.ts`, remover a frase fixa de 19,55% de `observacoesInvestimento` e implementar `observacaoImpostos` ("Impostos (até X%) serão adicionados a todos os valores informados." / "Taxes (up to X%) will be added to all amounts stated.")
- [x] T014 [US2] Em `frontend/src/proposal/modelos/pagina/PaginaModelo.tsx`, renderizar `d.observacaoImpostos(formatarPercentual(dados.imposto_percentual ?? '19.55', idioma))` como último item das Observações de Investimento
- [x] T015 [US2] Em `frontend/src/proposal/components/ModeloForm.tsx`, receber prop opcional `imposto?: { vigente: ImpostoVigente | null; atual?: string | null }` e mostrar no Resumo "Imposto: 18,75% — Out/2026" (somente leitura), aviso quando `origem = anterior` ("cadastrado em Set/2026") ou `padrao` ("imposto do mês não cadastrado; usando o padrão")
- [x] T016 [US2] Em `frontend/src/proposal/pages/Nova.tsx`, buscar `obterImpostoVigente()` ao montar e passar ao `ModeloForm` (falha na busca não bloqueia o formulário)

**Checkpoint**: proposta nova exibe o imposto do mês; US1 + US2 entregam o pedido principal.

---

## Phase 5: User Story 3 — Pendentes atualizam ao editar; demais não mudam (P2)

**Goal**: edição aplica o imposto vigente e registra no histórico; antigas não editadas e assinadas ficam intactas.

**Independent Test**: cenários 4 e 5 do [quickstart.md](./quickstart.md).

- [x] T017 [US3] Em `backend/app/services/propostas.py`, incluir `imposto_percentual` em `_diff_modelo` (formato decimal canônico; anterior nulo registrado como `"19.55"` via `IMPOSTO_LEGADO`) e em `_canonico`
- [x] T018 [US3] Em `backend/app/api/routes/proposal_propostas.py`, em `editar_proposta` (ramo por modelo), gravar `dados["imposto_percentual"] = imposto_vigente(db)["percentual"]` antes de `diff_campos`, de modo que só a mudança de imposto já gere nova versão (FR-010/FR-011)
- [x] T019 [US3] Em `frontend/src/proposal/pages/Editar.tsx`, buscar o imposto vigente e passar `{ vigente, atual: proposta.imposto_percentual ?? '19.55' }` ao `ModeloForm`; em `ModeloForm.tsx`, quando `atual` ≠ vigente, avisar "Ao salvar, o imposto será atualizado de 19,55% para 18,75%."
- [x] T020 [P] [US3] Em `frontend/src/proposal/pages/Detalhe.tsx`, adicionar rótulo `imposto_percentual: 'Imposto'` em `ROTULOS_CAMPO` e formatação com `formatarAliquota` em `formatarValorCampo`

**Checkpoint**: todas as histórias funcionais.

---

## Phase 6: Polish & Cross-Cutting

- [x] T021 [P] Rodar `npm run type-check` e `npm run build` em `frontend/` e corrigir erros
- [x] T022 [P] Rodar `python -m py_compile` nos arquivos backend alterados (lista em [quickstart.md](./quickstart.md))
- [x] T023 Executar o roteiro do [quickstart.md](./quickstart.md) (backend local) e confirmar que o hash de propostas antigas não muda (`calcular_hash(p) == p.conteudo_hash` para propostas existentes)

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational (T002–T004)** → histórias.
- **US1 (T005–T008)**: depende só da fase 2.
- **US2 (T009–T016)**: depende da fase 2; independe de US1 (usa seed/padrão).
- **US3 (T017–T020)**: depende de T009/T010 (campo serializado e hash) e de T015 (aviso no formulário).
- **Polish (T021–T023)**: após as histórias.

### Parallel Opportunities

- T005 ∥ T007 (backend schema vs. frontend service).
- T011 ∥ T012 (arquivos distintos do Proposal).
- T020 ∥ T017–T019.
- T021 ∥ T022.

## Implementation Strategy

1. **MVP**: Fases 1–3 (cadastro no ERP) + Fase 4 (proposta nova) — atende ao pedido principal, inclusive 18,75% em Out/2026.
2. **Incremento**: Fase 5 (edição de pendentes e histórico).
3. **Fechamento**: Fase 6 (checks e roteiro).
