---

description: "Lista de tarefas da feature 080 — modelos de proposta por divisão (Executive Search)"
---

# Tasks: Modelos de Proposta por Divisão (Executive Search)

**Input**: Design documents from `/specs/080-proposta-modelo-executive-search/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec, então não há fase TDD. A validação é feita pelo [quickstart.md](./quickstart.md) (interface, comparação lado a lado com o HTML de referência e `curl`) e por `npm run lint`, `npm run type-check` e `npm run build` no `frontend/`.

**Organization**: Setup (imagens e fontes) → Foundational (migração, modelos, registros, tipos e formatação) → US1 criar proposta por modelo (MVP) → US2 página do cliente no layout do modelo → US3 aceite pelo botão do modelo → US4 lista, detalhe, edição e cópia → US5 perfil do consultor → Polish/deploy.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US5 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/` (`main.py`, `models/__init__.py`, `schemas.py`, `services/propostas.py`, `services/proposta_modelos.py`, `api/routes/`)
- Frontend Proposal: `frontend/src/proposal/` e `frontend/public/propostas/` (não importa nada de `frontend/src/pages/`, `components/Layout.tsx`, `store/` nem `services/api.ts` do ERP)
- HTML de referência: `C:\Users\mathe\Downloads\Proposta_Comercial_Executive_Search.html`
- Contratos: `specs/080-proposta-modelo-executive-search/contracts/`
- **Não alterar**: portas (8001/5433/6380/5193); formato do conteúdo canônico das propostas `simples` em `conteudo_canonico` (research R7); contrato de `POST /public/propostas/{codigo}/assinar`; arquivos do ERP (`frontend/src/pages/`, `frontend/src/services/api.ts`, `backend/app/services/audit.py`, cadastro de usuários)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Garantir a base da 079 e preparar os arquivos estáticos e as fontes do modelo.

- [X] T001 Confirmar que a feature 079 está commitada (sem pendências em `backend/app/api/routes/proposal_propostas.py`, `backend/app/api/routes/public_propostas.py`, `backend/app/services/propostas.py`, `backend/app/models/__init__.py`, `backend/app/main.py`, `frontend/src/proposal/components/PropostaForm.tsx`, `frontend/src/proposal/pages/Editar.tsx`); se houver, pedir ao usuário para commitar antes de seguir (plan, "Dependência de código") — **decisão do usuário: implementar 079 e 080 juntas, sem commit**
- [X] T002 [P] Extrair as duas imagens embutidas do HTML de referência (decodificar os `data:image/...;base64,` com um script Python avulso, sem commitar o script): o JPEG (`<img class="bg">` da capa, ≈ 289 KB) para `frontend/public/propostas/setores/infraestrutura.jpg` e o PNG (logo branca da divisão em `.div-logo`, ≈ 6 KB) para `frontend/public/propostas/executive-search/logo-divisao.png` (research R3)
- [X] T003 [P] Em `frontend/proposal.html`, dentro do `<head>`, adicionar `<link rel="preconnect" href="https://fonts.googleapis.com">`, `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` e `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">` (mesmas famílias e pesos do HTML de referência; research R2)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema, modelos, registros de modelos/setores/investimentos, schemas da API, serialização tolerante a propostas sem CNPJ/valor e utilitários do frontend usados por todas as histórias.

**⚠️ CRITICAL**: Nenhuma história começa antes desta fase.

- [X] T004 [P] Em `backend/app/main.py`, dentro de `_migrar()`, adicionar o bloco "Proposal (feature 080)" logo após o bloco da feature 079, no mesmo padrão `with engine.connect() as conn: try/commit/except rollback`: (1) `ALTER TABLE propostas ADD COLUMN IF NOT EXISTS` para `modelo VARCHAR(40) NOT NULL DEFAULT 'simples'`, `modelo_versao INTEGER`, `data_proposta DATE`, `setor VARCHAR(40)`, `consultor_nome VARCHAR(255)`, `consultor_cargo VARCHAR(255)`, `consultor_telefone VARCHAR(30)`, `consultor_email VARCHAR(255)`, `projeto_nome VARCHAR(255)`, `garantia_meses SMALLINT`, `investimentos JSONB`; (2) `ALTER TABLE propostas ALTER COLUMN cnpj DROP NOT NULL` (idem `valor`, `total`); (3) dois blocos `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '...' AND conrelid = 'propostas'::regclass) THEN ALTER TABLE propostas ADD CONSTRAINT ... END IF; END $$` para `ck_propostas_campos_modelo` e `ck_propostas_data_validade` com as expressões exatas de [data-model.md](./data-model.md) §1; (4) `CREATE TABLE IF NOT EXISTS proposal_perfis_consultor (usuario_id INTEGER PRIMARY KEY REFERENCES usuarios_app(id) ON DELETE CASCADE, nome VARCHAR(255), cargo VARCHAR(255), telefone VARCHAR(30), email VARCHAR(255), atualizado_em TIMESTAMP NOT NULL DEFAULT NOW())` ([data-model.md](./data-model.md) §2 e §5)
- [X] T005 [P] Em `backend/app/models/__init__.py`: em `Proposta`, tornar `cnpj`, `valor` e `total` `nullable=True`; adicionar as 11 colunas de T004 (`modelo = Column(String(40), nullable=False, default="simples", server_default=text("'simples'"))`, `investimentos = Column(JSONB, nullable=True)`, `garantia_meses = Column(SmallInteger, nullable=True)`, demais `String`/`Date`/`Integer` anuláveis); declarar em `__table_args__` os `CheckConstraint` `ck_propostas_campos_modelo` e `ck_propostas_data_validade` (mesmas expressões de T004); criar a classe `PerfilConsultor` (`__tablename__ = "proposal_perfis_consultor"`, `usuario_id = Column(Integer, ForeignKey("usuarios_app.id", ondelete="CASCADE"), primary_key=True)`, `nome`, `cargo`, `telefone`, `email` anuláveis, `atualizado_em = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)`); importar `SmallInteger` se ainda não estiver importado
- [X] T006 [P] Criar `backend/app/services/proposta_modelos.py` com: `MODELOS = {"executive-search": {"nome": "Executive Search", "versao_atual": 1, "disponivel": True}}`; `NOME_SIMPLES = "Proposta simples"`; `SETORES = {"oil-gas": "Petróleo & Gás", "energia": "Energia", "infraestrutura": "Infraestrutura", "mineracao": "Mineração", "industria-servicos": "Indústria & Serviços"}`; `TIPOS_INVESTIMENTO = {"retainer": "Retainer", "sucesso": "Sucesso", "valor-fechado": "Valor fechado"}` (ordem de exibição); `modelo_disponivel(modelo: Optional[str]) -> bool`; `nome_modelo(modelo: str) -> str` (`simples` → `NOME_SIMPLES`); `digitos_telefone(tel: Optional[str]) -> str` (só dígitos); `telefone_valido(tel) -> bool` (10 a 13 dígitos); `telefone_whatsapp(tel) -> str` (dígitos com `55` prefixado quando tiver 10 ou 11 dígitos) ([contracts/api-proposal.md](./contracts/api-proposal.md) "Registro de modelos", research R10)
- [X] T007 [P] Em `backend/app/schemas.py`: criar `InvestimentoIn(BaseModel)` com `tipo: str = ""`, `taxa_tipo: str = ""`, `taxa: Optional[Decimal] = None`, `entrada: Optional[int] = None`; estender `PropostaCreate` com `modelo: Optional[str] = None`, `data_proposta: Optional[date] = None`, `setor: str = ""`, `consultor_nome: str = ""`, `consultor_cargo: str = ""`, `consultor_telefone: str = ""`, `consultor_email: str = ""`, `projeto_nome: str = ""`, `garantia_meses: Optional[int] = None`, `investimentos: Optional[list[InvestimentoIn]] = None` (campos da 077 continuam como estão); criar `PerfilConsultorIn(BaseModel)` com `nome`, `cargo`, `telefone`, `email` todos `Optional[str] = None`
- [X] T008 Em `backend/app/services/propostas.py` (depende de T005, T006): em `serializar_item`, adicionar `modelo`, `modelo_nome` (`nome_modelo`), `projeto_nome`, `data_proposta` (`isoformat()` ou `None`) e tornar `cnpj` tolerante a `None` (`formatar_cnpj(p.cnpj) if p.cnpj else None`); em `serializar_detalhe`, adicionar `modelo_versao`, `setor`, `consultor_nome`, `consultor_cargo`, `consultor_telefone`, `consultor_email`, `garantia_meses` e `investimentos` (lista como gravada ou `None`), mantendo `valor`/`total`/`aliquota` via `_dec_str` (já aceita `None`) ([contracts/api-proposal.md](./contracts/api-proposal.md), GET detalhe e lista)
- [X] T009 [P] Em `frontend/src/proposal/services/proposalApi.ts`: tipos `ModeloId = 'executive-search'`, `SetorId = 'oil-gas' | 'energia' | 'infraestrutura' | 'mineracao' | 'industria-servicos'`, `TipoInvestimento = 'retainer' | 'sucesso' | 'valor-fechado'`, `Investimento { tipo: TipoInvestimento; taxa_tipo: 'percentual' | 'valor'; taxa: string; entrada: number | null }`, `PropostaModeloPayload` (campos do POST de [contracts/api-proposal.md](./contracts/api-proposal.md)); em `PropostaListItem`, `modelo: ModeloId | 'simples'`, `modelo_nome: string`, `projeto_nome: string | null`, `data_proposta: string | null`, `cnpj: string | null`, `total: string | null`; em `Proposta`, os campos do modelo do detalhe e `valor: string | null`; em `PropostaPublicaData`, `modelo?`, `modelo_versao?`, `data_proposta?`, `setor?`, `consultor?: { nome; cargo; telefone; telefone_digitos; email }`, `projeto_nome?`, `garantia_meses?`, `investimentos?`; `criarProposta` e `editarProposta` passam a aceitar `PropostaPayload | PropostaModeloPayload`
- [X] T010 [P] Criar `frontend/src/proposal/modelos/setores.ts` (`SETORES: { chave: SetorId; rotulo: string; foto: string }[]` nas 5 chaves e rótulos de T006, todas com `foto: '/propostas/setores/infraestrutura.jpg'` até chegarem as fotos; `rotuloSetor(chave)`; `fotoSetor(chave)`) e `frontend/src/proposal/modelos/investimentos.ts` (`TIPOS: { tipo: TipoInvestimento; rotulo: string }[]` na ordem Retainer, Sucesso, Valor fechado; `rotuloTipo(tipo)`)
- [X] T011 [P] Criar `frontend/src/proposal/modelos/formatacao.ts` com funções puras (research R11): `formatarTaxa(inv)` (percentual pt-BR sem zeros à direita até 2 casas + `%`: `15%`, `17,5%`; valor: `R$ 50.000` se inteiro, `R$ 50.000,50` com centavos); `formatarPagamento(entrada)` (`null`/0 → `100% após conclusão`; senão `{e}% de entrada + {100−e}% após conclusão`); `formatarGarantia(meses)` (`1 mês` / `N meses`); `formatarDataISO(yyyy-mm-dd)` → `DD/MM/AAAA` sem conversão de fuso; `digitosTelefone(tel)`
- [X] T012 [P] Criar `frontend/src/proposal/modelos/index.ts` com `MODELOS: Record<ModeloId, { nome: string; disponivel: boolean; versoes: Partial<Record<number, LazyExoticComponent<ComponentType<ModeloPaginaProps>>>> }>` (por enquanto `'executive-search': { nome: 'Executive Search', disponivel: true, versoes: {} }`), o tipo `ModeloPaginaProps { dados: PropostaPublicaData; codigo: string; onRecarregar: () => void }`, `modelosDisponiveis()` e `componenteDoModelo(modelo, versao)` (retorna `undefined` se não houver) ([contracts/ui-proposal.md](./contracts/ui-proposal.md), "Registro de modelos")

**Checkpoint**: Backend sobe com a migração (quickstart §1: propostas antigas com `modelo = 'simples'`, constraints e tabela de perfil criadas, nada muda num segundo boot); `npm run type-check` passa.

---

## Phase 3: User Story 1 - Escolher o modelo e preencher a proposta Executive Search (Priority: P1) 🎯 MVP

**Goal**: O usuário escolhe o modelo (só Executive Search, já selecionado), preenche os campos do modelo e gera a proposta com link; criação sem modelo é recusada.

**Independent Test**: Quickstart §3: criar a proposta com os dados de exemplo, conferir cálculo de "Após conclusão", bloqueios de validação e o `422 "Modelo de proposta inválido"` via `curl`.

- [X] T013 [US1] Em `backend/app/services/proposta_modelos.py`, implementar `validar_modelo(payload, modelo: str, validade_se_vazia: date, data_se_vazia: date) -> dict` com as regras e mensagens exatas da tabela "Regras de validação" de [data-model.md](./data-model.md) §1 (levantar `HTTPException(422, detail=...)`; reutilizar `validar_email` de `app.services.documento` e `hoje_sp` de `app.services.propostas` importado dentro da função para evitar import circular): normaliza textos com `strip`, `entrada` 0/`None` → `None`, `taxa` quantizada em 2 casas, investimentos ordenados por `TIPOS_INVESTIMENTO`, rejeita tipos repetidos; retorna `{cliente_nome, data_proposta, setor, consultor_nome, consultor_cargo, consultor_telefone, consultor_email, projeto_nome, garantia_meses, investimentos: [{tipo, taxa_tipo, taxa: "15.00", entrada}], validade, modelo, modelo_versao: MODELOS[modelo]["versao_atual"], cnpj: None, valor: None, total: None, imposto_ativo: False, aliquota: None, valor_imposto: Decimal("0.00")}`
- [X] T014 [US1] Em `backend/app/services/propostas.py`, fazer `conteudo_canonico(p)` despachar por `p.modelo`: `simples` mantém exatamente o dicionário atual; demais modelos usam `json.dumps` ordenado de `{codigo, emitida_em, modelo, modelo_versao, cliente_nome, data_proposta (iso), setor, consultor: {nome, cargo, telefone, email}, projeto_nome, garantia_meses, investimentos (como gravados), validade (iso)}` com os mesmos `sort_keys`, `separators` e `ensure_ascii=False` (research R7)
- [X] T015 [US1] Em `backend/app/api/routes/proposal_propostas.py`, alterar `criar_proposta`: se `not modelo_disponivel(payload.modelo)` → `HTTPException(422, "Modelo de proposta inválido")`; senão `dados = validar_modelo(payload, payload.modelo, validade_padrao(), hoje_sp())` e construir `Proposta(**dados, codigo=..., emitida_em=..., status="aguardando", versao=1, criado_por_id=..., criado_por_usuario=...)`; manter `conteudo_hash = calcular_hash(p)` ([contracts/api-proposal.md](./contracts/api-proposal.md), POST)
- [X] T016 [P] [US1] Criar `frontend/src/proposal/components/ModeloForm.tsx` com a mesma interface de props do `PropostaForm` (`inicial`, `rotuloSalvar`, `rotuloSalvando`, `salvando`, `onSubmit(payload: PropostaModeloPayload)`, `aviso?`), exportando `FormModelo`, `formModeloInicial(consultor?)` (Data = `hojeSP()`, validade = `validadePadrao()`) e `formDeModelo(p: Proposta, opcoes?: { dataHoje?: boolean; validadePadrao?: boolean })`; seções Cliente (Empresa, Data, Setor), Consultor (Nome, Cargo, Telefone, E-mail), Projeto (Nome do projeto, Garantia em meses, Validade com `min` = amanhã) e Investimento (3 caixas na ordem de `TIPOS`; cada uma marcada abre um quadro com alternador `%`/`R$`, campo de taxa com parse pt-BR, Entrada (%) opcional e texto só leitura "Após conclusão: {100 − entrada}%"); resumo lateral com `formatarTaxa` + `formatarPagamento` por quadro e `formatarGarantia`; validação no cliente espelhando [data-model.md](./data-model.md) (inclui Data ≤ validade), erro sob cada campo; estilo Tailwind igual ao `PropostaForm` ([contracts/ui-proposal.md](./contracts/ui-proposal.md), `ModeloForm`)
- [X] T017 [US1] Em `frontend/src/proposal/pages/Nova.tsx` (depende de T016): substituir `PropostaForm` por um `<select>` "Modelo (divisão)" com `modelosDisponiveis()` (pré-selecionado quando houver só um; FR-001/FR-002) seguido do `ModeloForm`; `?copiar={id}` carrega a origem e, se `modelo === 'simples'`, mostra `toast.error('Esta proposta não pode ser copiada')` e abre o formulário vazio, senão usa `formDeModelo(p, { dataHoje: true, validadePadrao: true })` (FR-029); a tela "Proposta criada" mostra `{cliente_nome} · {projeto_nome} · válida até {validade}` (sem total)

**Checkpoint**: Quickstart §3 passa; a proposta criada aparece na lista (colunas antigas, ajustadas na US4).

---

## Phase 4: User Story 2 - Cliente recebe a proposta no layout do modelo, com os dados preenchidos (Priority: P1)

**Goal**: O link mostra a página idêntica ao HTML de referência, com os dados preenchidos, validade em "Vamos avançar?", WhatsApp, PDF e contatos funcionando; propostas simples continuam com a página atual.

**Independent Test**: Quickstart §4: comparação lado a lado no computador e a 390 px, nenhum `[`, `?campos`/Shift+C inertes, links de contato, PDF, um só investimento, caracteres especiais e foto ausente.

- [X] T018 [US2] Em `backend/app/services/propostas.py`, em `serializar_publica`, para `modelo != 'simples'` nos estados `aguardando`/`visualizada`/`assinada`, devolver o corpo de [contracts/api-public.md](./contracts/api-public.md): `status`, `pode_assinar`, `modelo`, `modelo_versao`, `cliente_nome`, `data_proposta`, `setor`, `consultor: {nome, cargo, telefone, telefone_digitos: telefone_whatsapp(...), email}`, `projeto_nome`, `garantia_meses`, `investimentos`, `validade`, `versao`, `atualizada_em`, `assinatura` (`{nome, assinada_em}` só se assinada, senão `None`); sem `cnpj`, `valor`, `emitida_em`, `codigo` nem dados do criador. Para `simples`, acrescentar `"modelo": "simples"` ao corpo atual. Cancelada/expirada sem mudança
- [X] T019 [P] [US2] Criar `frontend/src/proposal/modelos/executive-search/v1/executive-search-v1.css` copiando integralmente o `<style>` do HTML de referência e escopando sob `.tpl-es` (research R2): `:root{...}` e `body{...}` → `.tpl-es{...}` (incluindo `background`, `color`, `font`), todo seletor de elemento ou classe prefixado com `.tpl-es ` (inclusive dentro de `@media` e `@media print`), `html{scroll-behavior:smooth}` mantido global; remover as regras `.show-fields ...`; acrescentar restaurações do preflight do Tailwind: `.tpl-es .notes ul{list-style:disc}`, `.tpl-es .step ul{list-style:disc}`, `.tpl-es p{margin:...}` conforme o modelo, `.tpl-es button{font:inherit}` onde o `.btn` não cobre, `.tpl-es .div-logo img{display:block}`, `.tpl-es table{border-collapse:collapse}`; regra extra `.tpl-es .meta small{display:block;margin-top:6px;font:400 12px/1.2 var(--body);color:var(--fg-inverse-muted)}` para "Atualizada em" e `.tpl-es .aceita{margin:0 0 var(--space-16);font-weight:600;color:var(--fg-title)}` para o estado assinado
- [X] T020 [US2] Criar `frontend/src/proposal/modelos/executive-search/v1/ExecutiveSearchV1.tsx` (default export, props `ModeloPaginaProps`, importa o CSS de T019) reproduzindo a marcação do HTML de referência dentro de `<div className="tpl-es">`, com textos fixos literais (Serviço, 6 passos da Metodologia, Observações de Investimento e de Garantias, Shortlist "3 a 5 candidatos", SLA "5 a 10 dias úteis", "Vamos avançar?", LinkedIn e site da Ocean) e os dados: capa (`<img className="bg" src={fotoSetor(setor)} onError={oculta}>`, `cliente_nome`, `formatarDataISO(data_proposta)` + `<small>Atualizada em …</small>` quando `atualizada_em` (data em São Paulo, `formatarData` de `utils/propostaCalculo`), `consultor.nome`, logo `/propostas/executive-search/logo-divisao.png`); nav com âncoras; Investimento com `<h3>{projeto_nome}</h3>` e um `<article className="plan">` por item (título `rotuloTipo`, Taxa `formatarTaxa`, Forma de pagamento `formatarPagamento`); Garantia `formatarGarantia`; em "Vamos avançar?" o parágrafo `Esta proposta é válida até {DD/MM/AAAA}.` antes da `.cta` (FR-033), botão **Aceitar proposta** só se `pode_assinar` (ação ligada na US3; por ora sem `onClick`), **Falar com o consultor** com `href="https://wa.me/{telefone_digitos}?text=" + encodeURIComponent("Olá, gostaria de falar sobre a proposta comercial da Ocean Talent Solutions para a " + cliente_nome + ".")` e `target="_blank" rel="noopener"`, **Baixar PDF** (troca `document.title` para `Proposta Comercial Ocean - {cliente_nome}`, `window.print()`, restaura em `afterprint` com listener removido no unmount); se assinada, `<p className="aceita">Proposta aceita em {DD/MM/AAAA} às {HH:MM} por {nome}.</p>` no lugar do botão Aceitar; contato com `tel:+{telefone_digitos}` e `mailto:{email}`; rodapé com a data. Nenhum `data-field`/`data-example`, `?campos` ou Shift+C; todo dado via JSX ([contracts/ui-proposal.md](./contracts/ui-proposal.md), `ExecutiveSearchV1`)
- [X] T021 [US2] Em `frontend/src/proposal/modelos/index.ts`, registrar `versoes: { 1: lazy(() => import('./executive-search/v1/ExecutiveSearchV1')) }` em `executive-search`
- [X] T022 [US2] Em `frontend/src/proposal/pages/PropostaPublica.tsx`, depois dos estados de carregamento, não encontrada, erro de rede e cancelada/expirada (inalterados), despachar: `!dados.modelo || dados.modelo === 'simples'` → página atual sem mudança; senão `const Pagina = componenteDoModelo(dados.modelo, dados.modelo_versao)` renderizado em `<Suspense fallback={spinner atual}>` com `{ dados, codigo, onRecarregar: carregar }`; se `Pagina` for `undefined`, `<Mensagem texto="Não foi possível exibir esta proposta" />`
- [X] T023 [US2] Executar o quickstart §4 lado a lado com o HTML de referência (computador e 390 px) e corrigir no CSS de T019 qualquer diferença de texto, espaçamento, fonte, marcadores de lista ou cor; se o preflight do Tailwind impedir a fidelidade, registrar em `specs/080-proposta-modelo-executive-search/research.md` (R1, plano B) e parar para decidir com o usuário

**Checkpoint**: Página do cliente fiel ao modelo; propostas simples continuam abrindo como antes (quickstart §1.3).

---

## Phase 5: User Story 3 - Cliente aceita a proposta pelo botão do modelo (Priority: P1)

**Goal**: "Aceitar proposta" abre o diálogo do modelo, coleta nome, e-mail e declaração e registra a assinatura existente, com as mensagens do modelo e a trava de versão da 079.

**Independent Test**: Quickstart §5: aceitar, recarregar e ver "Proposta aceita em…", evidências no detalhe, versão desatualizada recusada, cancelada/expirada sem dados.

- [X] T024 [US3] Em `frontend/src/proposal/modelos/executive-search/v1/ExecutiveSearchV1.tsx`, implementar o diálogo de aceite (research R12): `<dialog>` com `ref` aberto por `showModal()` no clique de **Aceitar proposta**, mantendo `id`/classes, título "Aceitar proposta" e texto do modelo, com campos Nome completo, E-mail e caixa "Li e aceito os termos desta proposta" (validações locais iguais às da página legada: nome ≥ 3, e-mail válido, aceite marcado; erros em `.msg.err`); **Confirmar aceite** desabilitado durante o envio chama `assinarPublica(codigo, { nome, email, aceite, versao: dados.versao })`: sucesso → `.msg.ok` "Aceite registrado. Nossa equipe enviará o contrato em breve.", oculta Confirmar, e ao fechar chama `onRecarregar()`; `409` com detail "Esta proposta foi atualizada…" → mostra a mensagem e chama `onRecarregar()` mantendo nome/e-mail no estado; outros `409`/`404` → fecha e `onRecarregar()`; demais erros → `.msg.err` "Erro: não foi possível registrar o aceite. Tente novamente ou fale com o consultor." com Confirmar reabilitado; **Cancelar** fecha o diálogo
- [X] T025 [US3] Conferir que `POST /public/propostas/{codigo}/assinar` em `backend/app/api/routes/public_propostas.py` funciona sem mudança para propostas por modelo (o `calcular_hash` de T014 bate com o `conteudo_hash` gravado na criação e na edição) e executar o quickstart §5

**Checkpoint**: Ciclo completo criar → enviar link → aceitar no layout do modelo → status **Assinada** no Proposal.

---

## Phase 6: User Story 4 - Acompanhar, editar e copiar propostas no novo formato (Priority: P2)

**Goal**: Lista com Empresa/Modelo/Projeto/Data, detalhe com as seções do modelo, edição (079) com o formulário do modelo e histórico de investimentos, cópia só de propostas por modelo.

**Independent Test**: Quickstart §6: lista, detalhe, edição com histórico de investimentos, troca de modelo recusada via `curl`, cópia com Data de hoje.

- [X] T026 [US4] Em `backend/app/services/propostas.py`, fazer `diff_campos(p, dados)` despachar por `p.modelo`: `simples` mantém a lógica atual; demais usam `CAMPOS_MODELO = ("cliente_nome", "data_proposta", "setor", "consultor_nome", "consultor_cargo", "consultor_telefone", "consultor_email", "projeto_nome", "garantia_meses", "validade")` com forma canônica (datas `isoformat`, `garantia_meses` int) e, para cada tipo de `TIPOS_INVESTIMENTO`, compara o item atual e o novo como `{taxa_tipo, taxa, entrada}` ou `None`, gerando `{"campo": "investimento.{tipo}", "anterior": ..., "novo": ...}` quando diferentes (research R8)
- [X] T027 [US4] Em `backend/app/api/routes/proposal_propostas.py`, alterar `editar_proposta` (mantendo lock, `409` de assinada/cancelada, diff vazio, reset de status, `versao + 1`, histórico): se `p.modelo == 'simples'` → `validar_dados(payload, p.validade)` como hoje; senão, se `payload.modelo` não for vazio e for diferente de `p.modelo` → `db.rollback()` + `422 "O modelo da proposta não pode ser alterado"`, e `dados = validar_modelo(payload, p.modelo, p.validade, p.data_proposta)` (grava `modelo_versao` vigente); `setattr` de todos os campos de `dados` exceto `modelo` ([contracts/api-proposal.md](./contracts/api-proposal.md), PUT)
- [X] T028 [P] [US4] Em `frontend/src/proposal/pages/Lista.tsx`, trocar as colunas para Empresa (`cliente_nome`) · Modelo (`modelo_nome`) · Projeto (`projeto_nome ?? '—'`) · Data (`data_proposta` via `formatarDataISO`, ou data de emissão em `simples`) · Validade · Status · (admin) Criado por · Ações, removendo CNPJ e Total (FR-026, FR-030)
- [X] T029 [P] [US4] Em `frontend/src/proposal/pages/Detalhe.tsx`: mostrar `modelo_nome` no cabeçalho; para `modelo !== 'simples'`, seções Cliente (Empresa, Data, Setor por `rotuloSetor`), Consultor (nome, cargo, telefone, e-mail), Projeto (nome, garantia `formatarGarantia`, validade) e Investimento (um cartão por item com `rotuloTipo`, `formatarTaxa`, `formatarPagamento`); para `simples`, exibição atual; **Criar cópia** só quando `modelo !== 'simples'`; em `ROTULOS_CAMPO`/`formatarValorCampo`, rótulos e formatação de `data_proposta` ("Data"), `setor`, `consultor_*` ("Consultor: nome/cargo/telefone/e-mail"), `projeto_nome` ("Projeto"), `garantia_meses` ("Garantia"), `investimento.{tipo}` ("Investimento {Rótulo}", objeto → `"{formatarTaxa} · {formatarPagamento}"`, `null` → "—") e `cliente_nome` como "Empresa" quando a proposta for por modelo ([contracts/ui-proposal.md](./contracts/ui-proposal.md), `Detalhe.tsx`)
- [X] T030 [US4] Em `frontend/src/proposal/pages/Editar.tsx` (depende de T016): se `proposta.modelo === 'simples'`, manter `PropostaForm` como hoje; senão renderizar `ModeloForm` com `formDeModelo(proposta)` e enviar `editarProposta(id, { ...payload, modelo: proposta.modelo })`; avisos de expirada/mesmo link e tratamento de `409`/`404` inalterados

**Checkpoint**: Quickstart §6 passa; propostas simples continuam editáveis com o formulário antigo e sem **Criar cópia**.

---

## Phase 7: User Story 5 - Manter o perfil do consultor (Priority: P2)

**Goal**: Cada usuário mantém seu perfil (nome, cargo, telefone, e-mail), que pré-preenche o consultor em novas propostas, sem afetar propostas existentes.

**Independent Test**: Quickstart §2 e §6.6: salvar perfil parcial e completo, validações, isolamento entre usuários, pré-preenchimento na Nova proposta e propostas antigas inalteradas após mudar o perfil.

- [X] T031 [P] [US5] Criar `backend/app/api/routes/proposal_perfil.py` com `router = APIRouter()`: `GET /` devolve o perfil do usuário do token (`get_proposal_user`) como `{nome, cargo, telefone, email, atualizado_em}` (todos `None` se não existir); `PUT /` recebe `PerfilConsultorIn`, normaliza vazio → `None`, valida (nome/cargo ≤ 255 → `422 "Nome muito longo"`/`"Cargo muito longo"`; telefone preenchido com `telefone_valido` → `422 "Telefone inválido"`; e-mail preenchido com `validar_email` → `422 "E-mail inválido"`), faz upsert de `PerfilConsultor` por `usuario_id = user["id"]` e devolve o mesmo corpo do `GET`; nunca recebe id na rota ([contracts/api-proposal.md](./contracts/api-proposal.md), perfil)
- [X] T032 [US5] Em `backend/app/main.py`, importar `proposal_perfil` junto dos routers do Proposal e registrar `app.include_router(proposal_perfil.router, prefix="/api/proposal/perfil", tags=["Proposal · Perfil"])` no bloco "Proposal" (depende de T031)
- [X] T033 [P] [US5] Em `frontend/src/proposal/services/proposalApi.ts`, adicionar `PerfilConsultor { nome: string | null; cargo: string | null; telefone: string | null; email: string | null; atualizado_em?: string | null }`, `obterPerfil()` (`GET /proposal/perfil`) e `salvarPerfil(payload)` (`PUT /proposal/perfil`)
- [X] T034 [US5] Criar `frontend/src/proposal/pages/Perfil.tsx` dentro de `ProposalLayout`: carrega com spinner, formulário com Nome, Cargo, Telefone (`inputMode="tel"`) e E-mail, todos opcionais, valida só os preenchidos (mesmas regras do `ModeloForm`), salva com `salvarPerfil` e `toast.success('Perfil salvo')`, erro via `mensagemErro`; texto de apoio "Esses dados preenchem automaticamente o consultor nas novas propostas. Alterar o perfil não muda propostas já criadas." (depende de T033)
- [X] T035 [US5] Em `frontend/src/proposal/App.tsx`, adicionar a rota protegida `/perfil` → `Perfil`; em `frontend/src/proposal/components/ProposalLayout.tsx`, link **Meu perfil** (`<Link to="/perfil">`) ao lado do nome do usuário no cabeçalho
- [X] T036 [US5] Em `frontend/src/proposal/pages/Nova.tsx` (depende de T017, T033): numa proposta nova (sem `?copiar`), carregar `obterPerfil()` e montar `formModeloInicial(perfil)` com os campos do consultor (`null` → vazio); se algum dos 4 campos estiver vazio, passar ao `ModeloForm` o `aviso` "Preencha seu perfil para não precisar digitar seus dados de contato em cada proposta." com link para `/perfil`; falha ao carregar o perfil não bloqueia o formulário (campos vazios)

**Checkpoint**: Quickstart §2 passa; mudar o perfil não altera propostas existentes (FR-032).

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade estática, validação ponta a ponta e deploy.

- [X] T037 [P] Rodar `npm run lint`, `npm run type-check` e `npm run build` em `frontend/` e corrigir o que aparecer; conferir no build que `ExecutiveSearchV1` e seu CSS saem num chunk separado (research R16) — **lint**: o projeto não tem configuração de ESLint (situação anterior à feature); **type-check**: só restam os erros antigos de `frontend/src/pages/Dashboard.tsx`; **build**: OK, `ExecutiveSearchV1` e o CSS em chunks separados
- [X] T038 Executar o [quickstart.md](./quickstart.md) completo (§1 a §6) com o backend recém-migrado, incluindo regressão das propostas simples (página, assinatura, edição e ausência de **Criar cópia**) — coberto por teste ponta a ponta da API (perfil, criação, página pública, visualização, edição com histórico, trava de versão, aceite, troca de modelo recusada, regressão das simples) e conferência no navegador (fidelidade ao HTML a 1280 px e 390 px, aceite, Nova, Lista, Detalhe, Editar, Criar cópia, Meu perfil)
- [ ] T039 Deploy: após o primeiro boot da API com a migração em produção, rodar `backend/scripts/enable_rls_supabase.sql` no Supabase e conferir RLS em `proposal_perfis_consultor`; conferir `200` em `https://proposal.oceantalentsolutions.com/propostas/setores/infraestrutura.jpg` e `/propostas/executive-search/logo-divisao.png` (quickstart §7)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 antes de tudo; T002 e T003 em paralelo.
- **Foundational (Phase 2)**: depende do Setup; bloqueia todas as histórias. T008 depende de T005 e T006.
- **US1 (Phase 3)**: depende da Foundational. É o MVP.
- **US2 (Phase 4)**: depende da Foundational e, na prática, de propostas criadas pela US1 (ou via `curl` no `POST`). T014 (hash) precisa estar pronto antes de qualquer assinatura.
- **US3 (Phase 5)**: depende da US2 (o diálogo vive em `ExecutiveSearchV1.tsx`).
- **US4 (Phase 6)**: depende da Foundational e de T013/T016 (validação e formulário do modelo). Pode correr em paralelo com US2/US3.
- **US5 (Phase 7)**: backend e tela de perfil (T031–T035) dependem só da Foundational; T036 depende de T017.
- **Polish (Phase 8)**: depois das histórias desejadas.

### Within Each User Story

- Backend (validação → hash/serialização → rota) antes do frontend que consome o contrato.
- Arquivos compartilhados: `services/propostas.py` (T008, T014, T018, T026), `proposal_propostas.py` (T015, T027), `ExecutiveSearchV1.tsx` (T020, T024), `Nova.tsx` (T017, T036), `proposalApi.ts` (T009, T033): executar nessa ordem, nunca em paralelo.

### Parallel Opportunities

- Setup: T002 ∥ T003.
- Foundational: T004 ∥ T005 ∥ T006 ∥ T007 ∥ T009 ∥ T010 ∥ T011 ∥ T012; depois T008.
- US1: T016 (frontend) ∥ T013→T014→T015 (backend).
- US2: T019 (CSS) ∥ T018 (backend); T020 depois de T019.
- US4: T028 ∥ T029 (telas diferentes), em paralelo com T026→T027.
- US5: T031 ∥ T033; US5 inteira (exceto T036) ∥ US2/US3/US4.

---

## Parallel Example: User Story 1

```bash
# Backend e frontend da US1 em paralelo:
Task: "T013–T015 validar_modelo, hash por modelo e POST só por modelo em backend/app/"
Task: "T016 ModeloForm em frontend/src/proposal/components/ModeloForm.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "T018 serializar_publica por modelo em backend/app/services/propostas.py"
Task: "T019 CSS escopado em frontend/src/proposal/modelos/executive-search/v1/executive-search-v1.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 + 3)

1. Phase 1 (Setup) e Phase 2 (Foundational).
2. US1 → validar quickstart §3 (a proposta já é criada com os campos do modelo).
3. US2 → validar quickstart §4 (o cliente vê a página do modelo). **Parar e validar a fidelidade** antes de seguir.
4. US3 → validar quickstart §5 (ciclo completo com aceite). As três histórias P1 juntas formam a primeira entrega utilizável pelo cliente.

### Incremental Delivery

1. Setup + Foundational → base pronta, propostas antigas intactas.
2. US1 → criação por modelo.
3. US2 → página do cliente fiel ao modelo.
4. US3 → aceite (entrega para uso real).
5. US4 → lista, detalhe, edição e cópia no novo formato.
6. US5 → perfil do consultor e pré-preenchimento.
7. Polish + deploy.

---

## Notes

- [P] = arquivos diferentes, sem dependência incompleta.
- Commit após cada tarefa ou grupo lógico; parar em cada checkpoint para validar a história.
- Fotos por setor (`fundos-por-setor.zip`) e as outras 3 divisões estão fora desta lista: quando chegarem, adicionar os arquivos em `frontend/public/propostas/setores/` e atualizar `frontend/src/proposal/modelos/setores.ts`; novas divisões entram como novo componente + entrada nos registros (backend e frontend).
