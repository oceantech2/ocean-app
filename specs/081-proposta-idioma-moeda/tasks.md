---

description: "Lista de tarefas da feature 081 — proposta em português ou inglês conforme a moeda (Executive Search)"
---

# Tasks: Proposta em Português ou Inglês conforme a Moeda (Executive Search)

**Input**: Design documents from `/specs/081-proposta-idioma-moeda/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec, então não há fase TDD. A validação é feita pelo [quickstart.md](./quickstart.md) (API, navegador e comparação de estilos da página em português) e por `npm run type-check` e `npm run build` no `frontend/`.

**Organization**: Setup → Foundational (migração, modelo, schemas, tipos, idioma e formatação) → US1 escolher a moeda (MVP interno) → US2 página em inglês → US3 aceite em inglês → US4 revisão das traduções → Polish/deploy.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US4 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/` (`main.py`, `models/__init__.py`, `schemas.py`, `services/proposta_modelos.py`, `services/propostas.py`, `api/routes/proposal_propostas.py`)
- Frontend Proposal: `frontend/src/proposal/` (não importa nada do ERP)
- Dicionários: `frontend/src/proposal/modelos/executive-search/v1/i18n/`
- Textos PT ↔ EN: [contracts/textos-executive-search.md](./contracts/textos-executive-search.md)
- **Não alterar**: portas (8001/5433/6380/5193); formato canônico das propostas simples; hash das propostas por modelo em `BRL` (research R4); contrato de `POST /public/propostas/{codigo}/assinar`; mensagens do servidor (continuam em português); markup e CSS do `ExecutiveSearchV1` (research R10); arquivos do ERP

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar a base.

- [X] T001 Confirmar que a `main` local está igual à `origin/main` com a 080 (commit `e728b95`) e sem alterações pendentes em `backend/app/` e `frontend/src/proposal/` (`git status`, `git log -1`); se houver, parar e perguntar ao usuário

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Coluna `moeda`, validação, serialização e utilitários de idioma e formatação usados por todas as histórias.

**⚠️ CRITICAL**: Nenhuma história começa antes desta fase.

- [X] T002 [P] Em `backend/app/main.py`, dentro de `_migrar()`, adicionar o bloco "Proposal (feature 081)" logo após o bloco da feature 080, no mesmo padrão `with engine.connect() as conn: try/commit/except rollback`: `ALTER TABLE propostas ADD COLUMN IF NOT EXISTS moeda VARCHAR(3)`; `UPDATE propostas SET moeda = 'BRL' WHERE modelo <> 'simples' AND moeda IS NULL`; bloco `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_propostas_moeda' AND conrelid = 'propostas'::regclass) THEN ALTER TABLE propostas ADD CONSTRAINT ck_propostas_moeda CHECK (...); END IF; END $$` usando a constante `CK_PROPOSTAS_MOEDA` de T003 (mesmo padrão de `CK_PROPOSTAS_CAMPOS_MODELO`) ([data-model.md](./data-model.md) §1)
- [X] T003 [P] Em `backend/app/models/__init__.py`: criar `CK_PROPOSTAS_MOEDA = "(modelo = 'simples' AND moeda IS NULL) OR (modelo <> 'simples' AND moeda IN ('BRL', 'USD'))"` junto de `CK_PROPOSTAS_CAMPOS_MODELO`; em `Proposta`, `moeda = Column(String(3), nullable=True)` e `CheckConstraint(CK_PROPOSTAS_MOEDA, name="ck_propostas_moeda")` em `__table_args__`; importar a constante em `backend/app/main.py`
- [X] T004 [P] Em `backend/app/schemas.py`, acrescentar `moeda: Optional[str] = None` em `PropostaCreate`
- [X] T005 [P] Em `backend/app/services/proposta_modelos.py`: `MOEDAS = ("BRL", "USD")`, `MOEDA_PADRAO = "BRL"` e `validar_moeda(valor: Optional[str]) -> str` (vazio/`None` → `MOEDA_PADRAO`; `strip().upper()`; fora de `MOEDAS` → `_erro("Moeda inválida")`) ([data-model.md](./data-model.md) §3)
- [X] T006 Em `backend/app/services/propostas.py` (depende de T003): em `serializar_item`, acrescentar `"moeda": p.moeda` (o detalhe herda) ([contracts/api-proposal.md](./contracts/api-proposal.md))
- [X] T007 [P] Em `frontend/src/proposal/services/proposalApi.ts`: `export type Moeda = 'BRL' | 'USD'`; `export type Idioma = 'pt-BR' | 'en-US'`; `moeda: Moeda | null` em `PropostaListItem` (e, por herança, `Proposta`); `moeda?: Moeda` em `PropostaPublicaData` e em `PropostaModeloPayload`
- [X] T008 [P] Criar `frontend/src/proposal/modelos/idioma.ts` com `idiomaDaMoeda(moeda?: Moeda | null): Idioma` (`USD` → `en-US`, demais → `pt-BR`), `PREFIXO_MOEDA: Record<Moeda, string>` (`R$`, `US$`) e os rótulos da interface interna: `MOEDAS_FORM` (`[{ moeda: 'BRL', rotulo: 'Real (R$) — apresentação em português' }, { moeda: 'USD', rotulo: 'Dólar (US$) — apresentação em inglês' }]`), `rotuloMoedaCurto(moeda)` (`Real · português` / `Dólar · inglês`) e `rotuloMoedaDetalhe(moeda)` (`Real (português)` / `Dólar (inglês)`) ([contracts/ui-proposal.md](./contracts/ui-proposal.md))
- [X] T009 Em `frontend/src/proposal/modelos/formatacao.ts` (depende de T007, T008), conforme research R6, mantendo `pt-BR`/`BRL` como padrão para não mudar a interface interna: `formatarTaxa(inv, opcoes?: { idioma?: Idioma; moeda?: Moeda })` (percentual com `Intl.NumberFormat(idioma, { maximumFractionDigits: 2 })` + `%`; valor com `PREFIXO_MOEDA[moeda] + ' '` + número no formato do idioma, sem casas se inteiro e com 2 casas se houver centavos); `formatarDataISO(iso, idioma = 'pt-BR')` (`en-US` → `Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })` sobre `new Date(iso + 'T00:00:00Z')`); `dataHoraSP(iso, idioma = 'pt-BR')` (`en-US`: data por extenso e `hour: 'numeric', minute: '2-digit'` → `10:24 AM`, fuso `America/Sao_Paulo`); `formatarDataSP(iso, idioma)` (timestamp → só a data no fuso de São Paulo, `DD/MM/AAAA` em `pt-BR` e por extenso em `en-US`), para "Atualizada em"; manter `formatarPagamento` e `formatarGarantia` como estão (usados pela interface interna em português)

**Checkpoint**: API sobe com a migração (quickstart §1: simples com `moeda` nula, modelos com `BRL`, constraint criada, segundo boot sem mudança); `npm run type-check` sem erros novos.

---

## Phase 3: User Story 1 - Escolher a moeda ao criar a proposta (Priority: P1) 🎯 MVP

**Goal**: O consultor escolhe Real ou Dólar na criação; a moeda fica fixa na edição, é herdada (e trocável) na cópia e aparece na lista e no detalhe; valores em dólar usam `US$`.

**Independent Test**: Quickstart §2 e §6: criar em dólar, ver `US$` no resumo, lista e detalhe; `422` para moeda inválida e para troca de moeda; cópia com a moeda da origem.

- [X] T010 [US1] Em `backend/app/services/propostas.py`, em `conteudo_canonico`, no ramo de propostas por modelo, acrescentar `"moeda": p.moeda` ao dicionário **somente** quando `p.moeda` não for `MOEDA_PADRAO` (importar de `proposta_modelos`); ramo simples intacto (research R4). Precisa estar pronto antes de criar qualquer proposta em dólar
- [X] T011 [US1] Em `backend/app/api/routes/proposal_propostas.py`, em `criar_proposta` (depende de T005, T010): depois de `validar_modelo`, `dados["moeda"] = validar_moeda(payload.moeda)`, antes de construir a `Proposta` e de `calcular_hash` ([contracts/api-proposal.md](./contracts/api-proposal.md), POST)
- [X] T012 [US1] Em `backend/app/api/routes/proposal_propostas.py`, em `editar_proposta`, no ramo de proposta por modelo, logo após a checagem de troca de modelo e no mesmo padrão (`db.rollback()` + `HTTPException`): se `(payload.moeda or "").strip()` e `payload.moeda.strip().upper() != p.moeda` → `422 "A moeda da proposta não pode ser alterada"`; nunca fazer `setattr` de `moeda` (PUT)
- [X] T013 [US1] Em `frontend/src/proposal/components/ModeloForm.tsx` (depende de T008, T009): `moeda: Moeda` em `FormModelo`; `formModeloInicial` com `moeda: 'BRL'`; `formDeModelo` copia `p.moeda ?? 'BRL'`; nova prop opcional `moedaFixa?: boolean`; campo **Moeda** como primeiro do formulário (`<select>` com `MOEDAS_FORM`, texto de apoio "Define a moeda dos valores e o idioma da página que o cliente recebe."; com `moedaFixa`, `disabled` e texto "A moeda não pode ser alterada depois de criada."); alternador de taxa mostra `PREFIXO_MOEDA[form.moeda]` no lugar de `'R$'`; resumo lateral usa `formatarTaxa(inv, { moeda: form.moeda })`; `onSubmit` envia `moeda: form.moeda`; trocar a moeda não apaga as taxas ([contracts/ui-proposal.md](./contracts/ui-proposal.md), `ModeloForm`)
- [X] T014 [US1] Em `frontend/src/proposal/pages/Editar.tsx` (depende de T013): passar `moedaFixa` ao `ModeloForm` e garantir que o payload enviado leve `moeda: proposta.moeda` (como já faz com `modelo`)
- [X] T015 [US1] Em `frontend/src/proposal/pages/Nova.tsx` (depende de T013): conferir que a proposta nova começa em `BRL` e que `?copiar=` herda a moeda da origem via `formDeModelo` (editável); ajustar só se necessário
- [X] T016 [P] [US1] Em `frontend/src/proposal/pages/Lista.tsx` (depende de T008): na coluna Modelo, abaixo de `modelo_nome`, linha menor (`text-xs text-gray-500`) com `rotuloMoedaCurto(item.moeda)` quando `item.moeda` existir
- [X] T017 [P] [US1] Em `frontend/src/proposal/pages/Detalhe.tsx` (depende de T008, T009): cabeçalho "{modelo_nome} · {rotuloMoedaDetalhe(moeda)} · {projeto}" para propostas por modelo; `formatarTaxa(inv, { moeda: proposta.moeda ?? 'BRL' })` nos cartões de investimento e em `formatarValorCampo` do histórico

**Checkpoint**: Quickstart §2 e §6 passam; a página do cliente de uma proposta em dólar ainda aparece em português (US2 a seguir).

---

## Phase 4: User Story 2 - Cliente vê a proposta em inglês quando a moeda é Dólar (Priority: P1)

**Goal**: A página do modelo lê todos os textos de um dicionário por idioma; proposta em dólar abre em inglês com formatos americanos; proposta em real continua idêntica.

**Independent Test**: Quickstart §3, §4 e §7: página em inglês sem texto fixo em português, comparação de estilos da página em português com diferença zero, mensagens de cancelada/expirada em inglês.

- [X] T018 [US2] Em `backend/app/services/propostas.py`, em `serializar_publica`: acrescentar `"moeda": p.moeda` ao corpo das propostas por modelo e, nos retornos de `cancelada` e `expirada`, acrescentar `"moeda": p.moeda` somente quando `not eh_simples(p)`; propostas simples sem chave `moeda` ([contracts/api-public.md](./contracts/api-public.md))
- [X] T019 [P] [US2] Criar `frontend/src/proposal/modelos/executive-search/v1/i18n/tipos.ts` com `export interface TextosES` cobrindo todos os grupos de [data-model.md](./data-model.md) §6 e todas as chaves de [contracts/textos-executive-search.md](./contracts/textos-executive-search.md): textos simples como `string`, listas como `string[]`, passos da metodologia como `{ titulo: string; itens: string[] }[]`, tipos de investimento como `Record<TipoInvestimento, string>` e frases com dados como funções (`atualizadaEm(data)`, `comEntrada(e, f)`, `meses(n)`, `validadeAte(data)`, `aceitaEm(data, hora, nome)`, `rodape(data)`, `mensagem(cliente)`, `nomeArquivo(cliente)`); `capa.titulo` como tupla `[string, string]` (duas linhas)
- [X] T020 [P] [US2] Criar `frontend/src/proposal/modelos/executive-search/v1/i18n/pt-BR.ts` (`const textos: TextosES`, export default) com os textos **literais** atuais de `ExecutiveSearchV1.tsx` (incluindo os 6 `PASSOS`, as observações e as mensagens do diálogo), conforme a coluna pt-BR do contrato; `garantias.meses(n)` reproduz `formatarGarantia` (`1 mês` / `{n} meses`) e `investimento.comEntrada`/`semEntrada` reproduzem `formatarPagamento`
- [X] T021 [P] [US2] Criar `frontend/src/proposal/modelos/executive-search/v1/i18n/en-US.ts` (`const textos: TextosES`, export default) com a coluna en-US de [contracts/textos-executive-search.md](./contracts/textos-executive-search.md), palavra por palavra
- [X] T022 [US2] Criar `frontend/src/proposal/modelos/executive-search/v1/i18n/index.ts` com `textosES(idioma: Idioma): TextosES` importando os dois dicionários de forma estática (ficam no chunk preguiçoso do modelo) (depende de T019–T021)
- [X] T023 [US2] Em `frontend/src/proposal/modelos/executive-search/v1/ExecutiveSearchV1.tsx` (depende de T009, T022): `const idioma = idiomaDaMoeda(dados.moeda)`, `const t = textosES(idioma)`; remover `TITULO_PAGINA` e `PASSOS` locais; trocar cada texto fixo da página (capa, navegação e `aria-label`, títulos de seção, Serviço, Metodologia, Investimento, Observações, Garantias, "Vamos avançar?", validade, indicação de assinada, botões, Contato, rodapé) pelo dicionário, **sem mudar tags, classes nem ordem**; datas com `formatarDataISO(..., idioma)`, "Atualizada em" com `formatarDataSP(dados.atualizada_em, idioma)`, assinatura com `dataHoraSP(..., idioma)`; taxas com `formatarTaxa(inv, { idioma, moeda })`, pagamento com `t.investimento.comEntrada/semEntrada`, garantia com `t.garantias.meses`, tipo com `t.investimento.tipos[inv.tipo]`; `useEffect` que define `document.documentElement.lang = t.pagina.lang` e `document.title = t.pagina.titulo` e restaura ambos ao desmontar (o listener de `afterprint` volta para `t.pagina.titulo`); WhatsApp com `t.whatsapp.mensagem(cliente)`; PDF com `t.pdf.nomeArquivo(cliente)` (o diálogo fica para T026)
- [X] T024 [US2] Em `frontend/src/proposal/pages/PropostaPublica.tsx` (depende de T022): `Moldura` e `Mensagem` aceitam um título opcional (padrão "Proposta comercial"); em cancelada/expirada, se `dados.moeda === 'USD'`, usar `textosIndisponivel("en-US")` para o título da moldura e a mensagem (`cancelada`/`expirada` conforme `dados.status`), senão como hoje; fallback do `Suspense` com `textosIndisponivel(idiomaDaMoeda(dados.moeda)).carregando` mantendo o mesmo markup do spinner; carregamento inicial, 404 e erro de rede sem mudança. O grupo `indisponivel` fica em `i18n/indisponivel.ts`, fora de `TextosES`, para os dicionários continuarem só no chunk do modelo
- [X] T025 [US2] Executar quickstart §3, §4 e §7: comparar estilos computados da página em português (proposta em real) entre o build anterior e o novo a 1280 px e 390 px (diferença zero esperada; corrigir qualquer diferença no JSX, nunca no CSS); conferir a página em inglês contra o contrato de textos e a 390 px (textos mais longos quebram linha sem sobrepor)

**Checkpoint**: Página em inglês completa para quem só visualiza; página em português idêntica à anterior.

---

## Phase 5: User Story 3 - Cliente aceita a proposta em inglês (Priority: P1)

**Goal**: Janela de aceite, validações e mensagens no idioma da proposta; hash com a moeda funcionando no aceite.

**Independent Test**: Quickstart §5: erros em inglês, aviso de versão atualizada em inglês, sucesso e indicação de assinada em inglês, `"moeda":"USD"` no conteúdo canônico.

- [X] T026 [US3] Em `frontend/src/proposal/modelos/executive-search/v1/ExecutiveSearchV1.tsx` (depende de T023): trocar todos os textos do `<dialog>` por `t.aceite` (título, texto, rótulos, declaração, Confirmar/Cancelar/Fechar); validações locais com `t.aceite.erroNome/erroEmail/erroAceite`; sucesso `t.aceite.sucesso`; erro genérico `t.aceite.erro`; no `409` de versão desatualizada (detectado pelo prefixo `MSG_VERSAO_DESATUALIZADA` do `detail`, que continua em português no servidor), exibir `t.aceite.versaoAtualizada` em vez do `detail` (FR-019)
- [X] T027 [US3] Executar quickstart §5 em uma proposta em dólar e repetir §1.4 (aceite de proposta em real criada antes da migração), confirmando que `POST /public/propostas/{codigo}/assinar` aceita as duas sem mudança em `backend/app/api/routes/public_propostas.py`

**Checkpoint**: Ciclo completo em inglês: criar em dólar → link → aceite → **Assinada** no Proposal.

---

## Phase 6: User Story 4 - Revisar e ajustar as traduções sem mexer no layout (Priority: P3)

**Goal**: Garantir que as traduções ficam isoladas e completas.

**Independent Test**: Quickstart §8: remover uma chave de `en-US.ts` faz o type-check falhar; alterar um texto de `en-US.ts` muda só a página em inglês.

- [X] T028 [US4] Validar em `frontend/src/proposal/modelos/executive-search/v1/i18n/en-US.ts`: (1) remover temporariamente uma chave e confirmar que `npm run type-check` falha apontando o arquivo; (2) alterar temporariamente um texto e confirmar no navegador que só a página em inglês muda; desfazer as duas alterações. Conferir que nenhum texto fixo restou literal no JSX de `ExecutiveSearchV1.tsx` (buscar por palavras em português, como "Proposta", "Garantia", "Observações", "Aceitar")

**Checkpoint**: Traduções revisáveis pela Ocean editando só `en-US.ts`/`pt-BR.ts`.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade estática, validação completa e deploy.

- [X] T029 [P] Rodar `npm run type-check` (só os erros antigos de `frontend/src/pages/Dashboard.tsx`) e `npm run build` em `frontend/`; conferir que os dicionários saem no chunk do `ExecutiveSearchV1` e que o chunk do ERP não muda
- [X] T030 Executar o [quickstart.md](./quickstart.md) completo (§1 a §8), incluindo regressão das propostas simples (página, aceite, edição) e das propostas em real da 080
- [ ] T031 Deploy (com autorização do usuário para commit/push): a migração roda no boot da API no Render; repetir quickstart §1.4 e §3 em `https://proposal.oceantalentsolutions.com`; lembrar o usuário de que a Ocean deve revisar os textos marcados **[revisar]** em [contracts/textos-executive-search.md](./contracts/textos-executive-search.md) antes de enviar propostas em dólar

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 antes de tudo.
- **Foundational (Phase 2)**: depende do Setup; bloqueia todas as histórias. T006 depende de T003; T009 depende de T007 e T008.
- **US1 (Phase 3)**: depende da Foundational. T010 antes de T011 (hash com moeda antes de criar em dólar).
- **US2 (Phase 4)**: depende da Foundational; na prática usa propostas em dólar criadas pela US1 (ou via `curl`). Pode começar em paralelo com a US1 pelos dicionários (T019–T022).
- **US3 (Phase 5)**: depende da US2 (o diálogo vive em `ExecutiveSearchV1.tsx`, refatorado em T023) e de T010/T011 (hash).
- **US4 (Phase 6)**: depende de T021 e T026.
- **Polish (Phase 7)**: depois das histórias.

### Within Each User Story

- Backend antes do frontend que consome o contrato.
- Arquivos compartilhados, executar nesta ordem e nunca em paralelo: `services/propostas.py` (T006 → T010 → T018), `proposal_propostas.py` (T011 → T012), `ExecutiveSearchV1.tsx` (T023 → T026), `ModeloForm.tsx` (T013) antes de `Editar.tsx`/`Nova.tsx` (T014, T015).

### Parallel Opportunities

- Foundational: T002 ∥ T003 ∥ T004 ∥ T005 ∥ T007 ∥ T008; depois T006 e T009.
- US1: T016 ∥ T017 (telas diferentes), em paralelo com T010→T011→T012 (backend).
- US2: T019 ∥ T020 ∥ T021 (dicionários) ∥ T018 (backend); depois T022 → T023 → T024.
- US2 (dicionários) pode correr em paralelo com toda a US1.

---

## Parallel Example: User Story 2

```bash
Task: "T018 serializar_publica com moeda em backend/app/services/propostas.py"
Task: "T020 dicionário pt-BR em frontend/src/proposal/modelos/executive-search/v1/i18n/pt-BR.ts"
Task: "T021 dicionário en-US em frontend/src/proposal/modelos/executive-search/v1/i18n/en-US.ts"
```

## Parallel Example: User Story 1

```bash
Task: "T010–T012 hash, POST e PUT com moeda em backend/app/"
Task: "T016 coluna Modelo com moeda em frontend/src/proposal/pages/Lista.tsx"
Task: "T017 cabeçalho e taxas na moeda em frontend/src/proposal/pages/Detalhe.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 + 3)

1. Phase 1 e Phase 2.
2. US1 → validar quickstart §2 e §6 (moeda gravada, fixa e visível no Proposal).
3. US2 → validar quickstart §3, §4 e §7. **Parar e conferir a fidelidade da página em português** antes de seguir.
4. US3 → validar quickstart §5. As três histórias P1 juntas formam a primeira entrega útil para clientes internacionais.

### Incremental Delivery

1. Setup + Foundational → coluna e formatação prontas; nada muda para o usuário.
2. US1 → consultor já registra a moeda.
3. US2 → cliente vê a página em inglês.
4. US3 → aceite em inglês (entrega para uso real).
5. US4 → verificação da organização das traduções.
6. Polish + deploy.

---

## Notes

- [P] = arquivos diferentes, sem dependência incompleta.
- Não commitar sem pedido do usuário; parar em cada checkpoint para validar a história.
- A tradução inicial é da equipe de desenvolvimento; os textos marcados **[revisar]** no contrato dependem de decisão da Ocean e podem mudar depois só em `en-US.ts`.
