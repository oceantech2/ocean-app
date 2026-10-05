---

description: "Lista de tarefas da feature 082 — Escopo do Projeto e título da divisão na proposta (Executive Search)"
---

# Tasks: Escopo do Projeto e Título da Divisão na Proposta (Executive Search)

**Input**: Design documents from `/specs/082-proposta-escopo-projeto/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: A spec não pede testes, então não há fase TDD. A validação usa:
- o [quickstart.md](./quickstart.md) (API, navegador e comparação com o modelo novo);
- a tabela de casos de `normalizar_escopo` ([data-model.md](./data-model.md) §2.3), executada por script;
- `npm run type-check` e `npm run build` no `frontend/`.

**Organization**: As fases seguem esta ordem:
1. Setup: dependências do editor.
2. Foundational: coluna, normalização, hash, serialização, versão 2 do modelo, migração das pendentes e utilitários de exibição.
3. US1: campo no formulário, detalhe, histórico e cópia (MVP interno).
4. US2: seção na página do cliente.
5. US3: título da divisão.
6. Polish: build, regressão e deploy.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/` (`main.py`, `models/__init__.py`, `schemas.py`, `services/escopo_projeto.py`, `services/proposta_modelos.py`, `services/propostas.py`)
- Frontend Proposal: `frontend/src/proposal/` (não importa nada do ERP)
- Página do modelo: `frontend/src/proposal/modelos/executive-search/v1/` (atende às versões 1 e 2, research R5)
- **Não alterar**:
  - portas (8001/5433/6380/5193);
  - formato canônico das propostas simples;
  - chaves já existentes do conteúdo canônico das propostas por modelo (research R7);
  - contrato de `POST /public/propostas/{codigo}/assinar`;
  - textos `nav.servico` da v1;
  - arquivos do ERP.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar a base e instalar o editor.

- [X] T001 Confirmar que a `main` local está igual à `origin/main` com a 081 (commit `f606c3b`) e sem alterações pendentes em `backend/app/` e `frontend/src/proposal/` (`git status`, `git log -1`). Ignorar só `specs/082-proposta-escopo-projeto/` e `.specify/feature.json`; se houver outra alteração, parar e perguntar ao usuário
- [X] T002 Instalar o editor no frontend: `cd frontend && npm install @tiptap/react@^3 @tiptap/pm@^3 @tiptap/starter-kit@^3`, conferindo que `frontend/package.json` e `frontend/package-lock.json` mudaram só com essas dependências (research R1)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend completo do escopo, versão 2 do modelo registrada nos dois lados e utilitários de exibição, de modo que as três histórias possam ser feitas e testadas de forma independente.

**⚠️ CRITICAL**: Nenhuma história começa antes desta fase. A versão 2 precisa estar registrada no frontend (T014) junto com `versao_atual = 2` no backend (T007); se não estiver, propostas novas abrem sem componente.

- [X] T003 [P] Em `backend/app/models/__init__.py`:
  - acrescentar `CK_PROPOSTAS_ESCOPO = "projeto_escopo IS NULL OR modelo <> 'simples'"`;
  - acrescentar `CheckConstraint(CK_PROPOSTAS_ESCOPO, name="ck_propostas_escopo")` em `Proposta.__table_args__`;
  - acrescentar a coluna `projeto_escopo = Column(Text, nullable=True)` logo depois de `projeto_nome`, com comentário curto: HTML canônico restrito, `NULL` = sem escopo.

  Ver [data-model.md](./data-model.md) §1.
- [X] T004 [P] Em `backend/app/schemas.py`, `PropostaCreate`: acrescentar `projeto_escopo: Optional[str] = None` junto dos campos da feature 080
- [X] T005 [P] Criar `backend/app/services/escopo_projeto.py` com:
  - `LIMITE_ESCOPO = 5000`, `LIMITE_ENTRADA = 100_000` e `MSG_ESCOPO_LONGO = "Escopo do projeto deve ter no máximo 5.000 caracteres"`;
  - `normalizar_escopo(entrada: Optional[str]) -> Optional[str]`, que implementa as regras 1 a 9 de [data-model.md](./data-model.md) §2.2.

  Implementação:
  - subclasse de `html.parser.HTMLParser(convert_charrefs=True)` que monta uma árvore mínima (`p`, `ol`, `ul`, `li`, `strong`, texto, `br`);
  - mapear `b` para `strong` e ignorar atributos;
  - descartar `script`, `style`, `template`, `iframe`, `object`, `noscript` e `textarea` com o conteúdo;
  - nas demais tags desconhecidas, manter só o texto; tags de bloco desconhecidas (`h1`–`h6`, `div`, `tr`, `td`, `blockquote`) viram fronteira de parágrafo;
  - desembrulhar `<p>` dentro de `<li>`, juntando vários parágrafos com `<br>`;
  - envolver em `<p>` o texto solto do topo;
  - achatar listas a partir do 3º nível para o 2º, logo depois do item pai;
  - colapsar espaços e aparar as bordas;
  - remover vazios;
  - serializar sem atributos e sem espaços entre tags, escapando o texto com `html.escape(texto, quote=False)`.

  Erros: entrada maior que `LIMITE_ENTRADA` ou texto maior que `LIMITE_ESCOPO` lançam `HTTPException(422, MSG_ESCOPO_LONGO)`. O resultado é a string canônica, ou `None` se não sobrar texto
- [X] T006 Verificar `normalizar_escopo` executando, no container ou venv do backend, um script ad hoc (sem arquivo novo no repositório). O script percorre cada linha da tabela de [data-model.md](./data-model.md) §2.3, inclusive o exemplo `data-example-html` copiado do HTML novo, e compara com a saída esperada. Corrigir `backend/app/services/escopo_projeto.py` até todas as linhas baterem (depende de T005)
- [X] T007 Em `backend/app/services/proposta_modelos.py`:
  - `MODELOS["executive-search"]["versao_atual"] = 2`;
  - em `validar_modelo`, importar `normalizar_escopo` de `app.services.escopo_projeto` e incluir `"projeto_escopo": normalizar_escopo(getattr(payload, "projeto_escopo", None))` no dicionário retornado, chamando a função depois de `projeto_nome` (as mensagens de erro seguem a ordem dos campos do formulário).

  Depende de T004 e T005
- [X] T008 Em `backend/app/services/propostas.py` (research R7, [data-model.md](./data-model.md) §3 e §4):
  - em `conteudo_canonico`, ramo das propostas por modelo, acrescentar `if p.projeto_escopo: dados["projeto_escopo"] = p.projeto_escopo`, com comentário: sem a chave quando vazio, para manter válidos os hashes anteriores;
  - acrescentar `"projeto_escopo"` em `CAMPOS_MODELO`, depois de `"projeto_nome"`;
  - acrescentar `"projeto_escopo": p.projeto_escopo` em `serializar_detalhe` e no dicionário das propostas por modelo de `serializar_publica`, sem mexer no ramo de cancelada/expirada nem nas simples.

  Depende de T003
- [X] T009 Em `backend/app/main.py`, `_migrar()`: novo bloco "Proposal (feature 082)", logo depois do bloco da 081 e no mesmo padrão de `try/commit/except rollback`. Ver [data-model.md](./data-model.md) §1 e research R6.
  1. `ALTER TABLE propostas ADD COLUMN IF NOT EXISTS projeto_escopo TEXT`.
  2. Criar `ck_propostas_escopo` com o mesmo `DO $$ … pg_constraint … $$` usado para `ck_propostas_campos_modelo`.
  3. Num `SessionLocal()` separado, buscar com `.with_for_update()` as `Proposta` com `modelo != 'simples'`, `modelo_versao == 1` e `status in ('aguardando','visualizada')`. Em cada uma, `p.modelo_versao = 2` e `p.conteudo_hash = calcular_hash(p)`, importando `calcular_hash` de `app.services.propostas`.
  4. Não alterar `versao`, `atualizada_em` nem `status`, e não criar `PropostaEdicao`.
  5. Fazer commit no fim. Em exceção: rollback, `print`/log do erro, sem interromper o boot. Fechar a sessão no `finally`.

  Depende de T003 e T008
- [X] T010 Subir a API (`docker compose up -d --build backend` ou reiniciar `ocean_backend`) e validar o [quickstart.md](./quickstart.md) §1.1 a §1.3: boot sem erro, coluna e constraint criadas, assinadas continuam com `modelo_versao = 1` e o mesmo hash, pendentes passam a `modelo_versao = 2` com hash novo, nenhum registro novo em `propostas_edicoes`, e um segundo boot não muda nada (depende de T009)
- [X] T011 [P] Em `frontend/src/proposal/services/proposalApi.ts`, acrescentar `projeto_escopo` conforme [data-model.md](./data-model.md) §6:
  - `Proposta.projeto_escopo: string | null`;
  - `PropostaModeloPayload.projeto_escopo: string | null`;
  - `PropostaPublicaData.projeto_escopo?: string | null`.

  Conferir também que `PropostaPublicaData` tem `modelo_versao?: number`
- [X] T012 [P] Criar `frontend/src/proposal/modelos/escopo.ts` com:
  - `LIMITE_ESCOPO = 5000` e `MSG_ESCOPO_LONGO = 'Escopo do projeto deve ter no máximo 5.000 caracteres'`;
  - `contarCaracteres(html: string): number`: `DOMParser` → `body.textContent`, com espaços em sequência colapsados em um e as bordas de cada bloco aparadas; deve dar o mesmo número que `editor.state.doc.textContent.length` e que o servidor (research R8);
  - `escopoParaTexto(html: string | null): string`: parágrafos em linhas; itens de `ol` como `1.`, `2.`…; itens de `ul` como `•`; o 2º nível recuado com 3 espaços; `<strong>` sem marcação; `null`/vazio → `''`.

  Ver o exemplo em [contracts/ui-proposal.md](./contracts/ui-proposal.md) §2
- [X] T013 [P] Criar `frontend/src/proposal/modelos/EscopoRico.tsx`: `export default function EscopoRico({ html }: { html: string })`. Converte o HTML em elementos React percorrendo `new DOMParser().parseFromString(html, 'text/html').body.childNodes`:
  - aceita `P`, `OL`, `UL`, `LI`, `STRONG`, `B` (como `strong`), `BR` e nós de texto;
  - outras tags renderizam só os filhos;
  - nenhum atributo é copiado e não usa `dangerouslySetInnerHTML`;
  - usa `useMemo` por `html` e chaves por índice.

  Ver [contracts/ui-proposal.md](./contracts/ui-proposal.md) §3.4 e research R4
- [X] T014 Criar `frontend/src/proposal/modelos/executive-search/v1/versoes.ts` com:
  - `export interface RecursosVersao { tituloDivisao: boolean; escopo: boolean }`;
  - `RECURSOS: Record<number, RecursosVersao> = { 1: { tituloDivisao: false, escopo: false }, 2: { tituloDivisao: true, escopo: true } }`;
  - `recursosDaVersao(versao?: number)`, que devolve os recursos da versão ou os da v1 quando não houver.

  Em `frontend/src/proposal/modelos/index.ts`, extrair o `lazy(() => import('./executive-search/v1/ExecutiveSearchV1'))` para uma constante e registrar `versoes: { 1: pagina, 2: pagina }`, com comentário: v1 e v2 compartilham o componente, e as diferenças estão em `versoes.ts`. Sem este registro, propostas criadas depois de T007 abrem sem componente

**Checkpoint**: Backend aceita, normaliza, grava, versiona e devolve o escopo; a versão 2 está registrada; os utilitários estão prontos. Propostas novas abrem com o componente atual, ainda sem diferença visual.

---

## Phase 3: User Story 1 - Consultor descreve o escopo do projeto na proposta (Priority: P1) 🎯 MVP

**Goal**: Campo opcional "Escopo do Projeto" no formulário, com editor visual e limite de 5.000 caracteres; escopo exibido no detalhe, registrado no histórico e copiado na cópia.

**Independent Test**: [quickstart.md](./quickstart.md) §2 e §3. Criar uma proposta com o exemplo OceanPact CBO montado só pela barra e pelo teclado. O detalhe mostra o escopo formatado e a API devolve o HTML canônico igual ao `data-example-html`. Editar e apagar gera histórico legível, e Criar cópia traz o escopo.

### Implementation for User Story 1

- [X] T015 [US1] Criar `frontend/src/proposal/components/EditorEscopo.tsx` (export default), com props `{ valor: string; onChange: (html: string) => void; erro?: string }`.
  - **Editor**: `useEditor` com `StarterKit.configure({ heading: false, blockquote: false, code: false, codeBlock: false, horizontalRule: false, italic: false, strike: false, underline: false, link: false, dropcursor: false, gapcursor: false, trailingNode: false })`. O conteúdo inicial é `valor`; em `onUpdate`, chama `onChange(editor.isEmpty ? '' : editor.getHTML())`.
  - **Barra de comandos**: botões com `type="button"`, ícone SVG inline, `title` e `aria-label`: Negrito (`toggleBold`), Lista numerada (`toggleOrderedList`), Lista com marcadores (`toggleBulletList`), Aumentar recuo e Diminuir recuo (`sinkListItem('listItem')` / `liftListItem('listItem')`). O estado ativo usa `editor.isActive(...)`, com `bg-ocean-700 text-white` quando ativo.
  - **Limite de 2 níveis**: "Aumentar recuo" fica desabilitado quando o item já está no 2º nível; calcular a profundidade contando os ancestrais `listItem` de `editor.state.selection.$from`. Uma extensão pequena (`Extension.create` com `addKeyboardShortcuts`) faz Tab chamar `sinkListItem` só no 1º nível e Shift+Tab chamar `liftListItem` (research R9).
  - **Área editável**: `EditorContent`, com classes Tailwind nos padrões dos inputs (`border rounded-lg`, `focus-within:ring-2 focus-within:ring-ocean-600`, `border-red-400` com `erro`) e altura mínima de cerca de 6 linhas.
  - **Estilos das listas**: como o reset do Tailwind remove marcadores e numeração, restaurar com seletores arbitrários no contêiner (`[&_.ProseMirror_ol]:list-decimal`, `[&_.ProseMirror_ul]:list-disc`, `pl-6`, `[&_.ProseMirror_p]:my-1`, `[&_.ProseMirror]:outline-none`) ou com um bloco CSS pequeno no próprio componente.
  - **Contador**: "N / 5.000" com `contarCaracteres(valor)`, de `modelos/escopo.ts`, em vermelho acima de `LIMITE_ESCOPO`.

  Ver [contracts/ui-proposal.md](./contracts/ui-proposal.md) §1
- [X] T016 [US1] Em `frontend/src/proposal/components/ModeloForm.tsx`:
  - `FormModelo.projeto_escopo: string`; `formModeloInicial` com `projeto_escopo: ''`; `formDeModelo` com `projeto_escopo: p.projeto_escopo ?? ''` (vale para edição e para Criar cópia, FR-007);
  - `const EditorEscopo = lazy(() => import('./EditorEscopo'))` com `<Suspense>`, cujo fallback é uma caixa da mesma altura com spinner `animate-spin`;
  - na seção "Projeto", logo depois de `texto('projeto_nome', 'Nome do projeto')`: rótulo "Escopo do Projeto (opcional)", o editor ligado a `set('projeto_escopo', html)`, o texto de apoio "Aparece na seção Escopo do Projeto da proposta. Deixe em branco para não exibir a seção." e `<Erro msg={erros.projeto_escopo} />`;
  - em `validar`, se `contarCaracteres(form.projeto_escopo) > LIMITE_ESCOPO`, então `erros.projeto_escopo = MSG_ESCOPO_LONGO`;
  - em `salvar`, `projeto_escopo: contarCaracteres(form.projeto_escopo) ? form.projeto_escopo : null`.

  Depende de T011, T012 e T015
- [X] T017 [US1] Conferir que `frontend/src/proposal/pages/Nova.tsx` e `frontend/src/proposal/pages/Editar.tsx` passam o escopo de ponta a ponta (cópia via `formDeModelo(..., { dataHoje, validadePadrao })`; edição via `formDeModelo(p)`) e que os erros `422` do servidor ("Escopo do projeto deve ter no máximo 5.000 caracteres") aparecem por toast como os demais. Ajustar só se algo não passar o campo
- [X] T018 [P] [US1] Em `frontend/src/proposal/pages/Detalhe.tsx`:
  - acrescentar `projeto_escopo: 'Escopo do Projeto'` em `ROTULOS_CAMPO`;
  - em `formatarValorCampo`, `case 'projeto_escopo': return escopoParaTexto(String(valor)) || '—'`;
  - na exibição dos valores do histórico, aplicar `whitespace-pre-line` para respeitar as quebras de linha;
  - em `SecoesModelo`, um cartão "Escopo do Projeto" depois do cartão do projeto, com `<EscopoRico html={p.projeto_escopo} />` dentro de um contêiner com estilos de leitura (`[&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-6 [&_ul]:pl-6 [&_strong]:font-semibold space-y-2`), ou "Não informado" em `text-gray-500` quando for nulo. Propostas simples não exibem o cartão.

  Depende de T011, T012 e T013
- [X] T019 [US1] Validar o [quickstart.md](./quickstart.md) §2 (campo, barra, limite de 2 níveis, colagem do Word, exemplo OceanPact CBO igual ao `data-example-html`, sem escopo → "Não informado", 5.001 caracteres bloqueado), §3 (edição, histórico legível, apagar, editar sem mexer, cópia) e §5 (casos de segurança via API)

**Checkpoint**: O consultor cria, edita e copia propostas com escopo; o detalhe e o histórico mostram o escopo. A página do cliente ainda não exibe a seção (US2).

---

## Phase 4: User Story 2 - Cliente vê a seção "Escopo do Projeto" quando há escopo (Priority: P1)

**Goal**: Na versão 2, a seção "Escopo do Projeto" e o link no menu entre Metodologia e Investimento, só quando houver escopo, no estilo `.scope` do modelo novo, em português e inglês.

**Independent Test**: [quickstart.md](./quickstart.md) §4. Abrir em janela anônima uma proposta com escopo (criada pelo formulário da US1 ou por `POST` na API com `projeto_escopo`) e comparar com o modelo novo preenchido com o exemplo, a 1280 px e a 390 px. Uma proposta sem escopo não tem link nem seção.

### Implementation for User Story 2

- [X] T020 [P] [US2] Traduções do título da seção:
  - em `frontend/src/proposal/modelos/executive-search/v1/i18n/tipos.ts`, acrescentar `escopo: string` em `nav`;
  - em `frontend/src/proposal/modelos/executive-search/v1/i18n/pt-BR.ts`, acrescentar `escopo: 'Escopo do Projeto'`;
  - em `frontend/src/proposal/modelos/executive-search/v1/i18n/en-US.ts`, acrescentar `escopo: 'Project Scope'`.

  Ver [contracts/ui-proposal.md](./contracts/ui-proposal.md) §3.3
- [X] T021 [P] [US2] Em `frontend/src/proposal/modelos/executive-search/v1/executive-search-v1.css`, logo depois das regras de `td.price` (ou das de `.invest`, mantendo a ordem do modelo), acrescentar as 8 regras `.tpl-es .scope…` de [contracts/ui-proposal.md](./contracts/ui-proposal.md) §3.2, copiadas do HTML novo, mais `overflow-wrap:anywhere` em `.tpl-es .scope`. Conferir se existe um reset de `ul`/`ol` no CSS da página que anule `list-style` no `ol` (o modelo depende do marcador padrão do `ol`); se existir, garantir `list-style:decimal` em `.tpl-es .scope ol`
- [X] T022 [US2] Em `frontend/src/proposal/modelos/executive-search/v1/ExecutiveSearchV1.tsx`:
  - calcular `const recursos = recursosDaVersao(dados.modelo_versao)` e `const escopo = recursos.escopo && dados.projeto_escopo ? dados.projeto_escopo : null`;
  - no `<nav>`, entre o link de Metodologia e o de Investimento: `{escopo && <a href="#escopo">{t.nav.escopo}</a>}`;
  - entre `<section id="metodologia">` e `<section id="investimento">`: `{escopo && (<section id="escopo"><div className="head"><h2>{t.nav.escopo}</h2></div><div className="scope"><EscopoRico html={escopo} /></div></section>)}`.

  Sem `hidden` e sem espaço reservado quando não houver escopo. Depende de T013, T014, T020 e T021
- [X] T023 [US2] Validar o [quickstart.md](./quickstart.md) §4.1 a §4.3 e §4.5 a §4.8: ordem do menu e da seção, comparação lado a lado com o modelo novo (SC-002), sem escopo sem link nem seção (SC-003), caracteres especiais literais, palavra longa no celular, PDF com a seção e JSON canônico da assinatura com `projeto_escopo` e `"modelo_versao":2` (SC-005). Validar também o §4.4 só na parte do "Project Scope" (o título da divisão é a US3)

**Checkpoint**: O cliente vê o escopo nas propostas da versão 2 que têm escopo; o resto da página não muda.

---

## Phase 5: User Story 3 - Primeira seção com o nome do serviço da divisão (Priority: P2)

**Goal**: Na versão 2, o primeiro link do menu e o título da primeira seção exibem "Executive Search" em português e inglês; a versão 1 continua com "Serviço"/"Service".

**Independent Test**: [quickstart.md](./quickstart.md) §1.4, §1.5 e §4.4. Uma proposta assinada antes da feature continua com "Serviço". Uma proposta pendente migrada e uma nova, em real e em dólar, mostram "Executive Search" no primeiro link e na primeira seção.

### Implementation for User Story 3

- [X] T024 [P] [US3] Traduções do título da divisão:
  - em `frontend/src/proposal/modelos/executive-search/v1/i18n/tipos.ts`, mudar `servico: { texto: string }` para `servico: { tituloDivisao: string; texto: string }`;
  - em `frontend/src/proposal/modelos/executive-search/v1/i18n/pt-BR.ts` e `frontend/src/proposal/modelos/executive-search/v1/i18n/en-US.ts`, acrescentar `tituloDivisao: 'Executive Search'`.

  Manter `nav.servico` ("Serviço"/"Service") para a v1. Se T020 estiver em andamento no mesmo arquivo, fazer em sequência
- [X] T025 [US3] Em `frontend/src/proposal/modelos/executive-search/v1/ExecutiveSearchV1.tsx`:
  - calcular `const tituloServico = recursos.tituloDivisao ? t.servico.tituloDivisao : t.nav.servico`, reaproveitando `recursos` de T022 ou criando-o se a US2 ainda não tiver sido feita;
  - usar `tituloServico` no `<a href="#servico">` e no `<h2>` de `<section id="servico">`.

  Depende de T014 e T024
- [X] T026 [US3] Validar o [quickstart.md](./quickstart.md) §1.4 (assinada idêntica, com "Serviço"), §1.5 (pendente migrada com "Executive Search" e aceite sem aviso de versão desatualizada) e §4.4 (proposta em dólar com "Executive Search" no primeiro link e na primeira seção)

**Checkpoint**: As três histórias funcionam; a página da versão 2 está igual ao modelo novo.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Build, regressão, isolamento do editor e entrega.

- [X] T027 Rodar `cd frontend && npm run type-check` (aceitos só os erros antigos de `src/pages/Dashboard.tsx`) e `npm run build`. Remover temporariamente `nav.escopo` de `frontend/src/proposal/modelos/executive-search/v1/i18n/en-US.ts`, confirmar que o type-check falha e restaurar
- [X] T028 Validar o [quickstart.md](./quickstart.md) §6: proposta simples sem mudança e sem cartão de escopo; proposta assinada idêntica a antes (estilos computados a 1280 px e 390 px); na aba Rede, `/p/{codigo}` não carrega chunk do TipTap. Se carregar, conferir que só `ModeloForm.tsx` importa `EditorEscopo` e que o import é por `lazy`
- [X] T029 [P] Revisar o diff completo (`git diff`):
  - nenhum arquivo do ERP alterado;
  - nenhuma chave existente do conteúdo canônico alterada;
  - nenhum `dangerouslySetInnerHTML` novo;
  - comentários só onde explicam uma restrição (padrão do código existente).
- [X] T030 Marcar as tarefas concluídas neste `specs/082-proposta-escopo-projeto/tasks.md` e, com a aprovação do usuário, fazer commit na `main` (mensagem no padrão dos anteriores, ex.: "Implementa Escopo do Projeto e título da divisão na proposta (082): …") e push
- [ ] T031 Depois do deploy (API no Render, frontend na Vercel), validar o [quickstart.md](./quickstart.md) §8 em `https://proposal.oceantalentsolutions.com`: §1.2, §1.4, §1.5 e §4.1. A migração roda no boot; não há tabela nova nem mudança de RLS

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências. T002 só bloqueia T015.
- **Foundational (Phase 2)**: depende de T001 e bloqueia todas as histórias.
  - Backend: T003 → T008 → T009 → T010; T004 + T005 → T006 → T007.
  - Frontend: T011, T012, T013 e T014 em paralelo.
  - T007 e T014 devem ir juntos para o ar.
- **US1 (Phase 3)**: depende da Foundational e de T002.
- **US2 (Phase 4)**: depende só da Foundational. Pode ser testada criando o escopo por `POST` na API, sem a US1.
- **US3 (Phase 5)**: depende só da Foundational (T014).
- **Polish (Phase 6)**: depende das histórias desejadas.

### User Story Dependencies

- **US1 (P1)**: independente das outras histórias.
- **US2 (P1)**: independente da US1 (o escopo pode vir pela API). Divide `ExecutiveSearchV1.tsx` e os arquivos de i18n com a US3, então essas tarefas rodam em sequência.
- **US3 (P2)**: independente. Se a US2 já tiver sido feita, reaproveita `recursos` em `ExecutiveSearchV1.tsx`.

### Within Each User Story

- Traduções e CSS antes do componente da página (T020/T021 → T022; T024 → T025).
- Editor antes do formulário (T015 → T016).
- Validação do quickstart no fim de cada história.

### Parallel Opportunities

- Foundational: T003, T004 e T005 (backend), junto com T011, T012, T013 e T014 (frontend).
- US1: T018 (Detalhe) em paralelo com T015/T016 (editor e formulário).
- US2: T020 e T021 em paralelo.
- Entre histórias: a US1 (formulário e detalhe) pode correr em paralelo com a US2 e a US3 (página do cliente), que tocam arquivos diferentes.

---

## Parallel Example: Foundational

```bash
Task: "T003 Coluna projeto_escopo e CK_PROPOSTAS_ESCOPO em backend/app/models/__init__.py"
Task: "T004 PropostaCreate.projeto_escopo em backend/app/schemas.py"
Task: "T005 normalizar_escopo em backend/app/services/escopo_projeto.py"
Task: "T011 Tipos projeto_escopo em frontend/src/proposal/services/proposalApi.ts"
Task: "T012 contarCaracteres/escopoParaTexto em frontend/src/proposal/modelos/escopo.ts"
Task: "T013 EscopoRico em frontend/src/proposal/modelos/EscopoRico.tsx"
```

## Parallel Example: User Story 1

```bash
Task: "T015 EditorEscopo em frontend/src/proposal/components/EditorEscopo.tsx"
Task: "T018 Cartão e histórico do escopo em frontend/src/proposal/pages/Detalhe.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "T020 nav.escopo em i18n/tipos.ts, pt-BR.ts e en-US.ts"
Task: "T021 Regras .scope em executive-search-v1.css"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 (Setup) e Phase 2 (Foundational): o backend já aceita o escopo e as pendentes migram para a v2.
2. Phase 3 (US1): o consultor registra o escopo.
3. **Parar e validar**: [quickstart.md](./quickstart.md) §2, §3 e §5.

### Incremental Delivery

1. Foundational + US1: escopo registrado internamente (MVP interno).
2. + US2: o cliente vê o escopo. Este é o mínimo para publicar, porque sem ele o campo não aparece ao cliente.
3. + US3: título "Executive Search", com a página igual ao modelo novo.
4. Polish e deploy, num único commit na `main`, como nas features anteriores.

### Observação de entrega

US1 e US2 são ambas P1 e devem ir juntas para produção. Publicar só a US1 deixaria o consultor preenchendo um escopo que o cliente não vê.

---

## Notes

- [P] = arquivos diferentes, sem dependência incompleta.
- A tabela de casos do [data-model.md](./data-model.md) §2.3 é o critério de aceite de `normalizar_escopo` (T006).
- A migração das pendentes (T009) precisa recalcular o hash; sem isso, o aceite dessas propostas passa a falhar com "Proposta não está mais disponível".
- Não duplicar o componente da página numa pasta `v2/`: as diferenças ficam em `versoes.ts` (research R5).
