# Feature Specification: Contas a Pagar — Agrupar por Mês e Filtrar por Categorias

**Feature Branch**: `034-contas-pagar-agrupar-mes`

**Created**: 2026-08-18

**Status**: Draft

**Input**: User description: "em contas a pagar permitir Agrupar por mês e permitir filtrar por categorias como recursos humanos"

## Clarifications

### Session 2026-08-18

- Q: Qual o modo de agrupamento ao abrir a página? → A: Dois modos (Por categoria e Por mês); ao abrir a página o padrão é **Por mês**.
- Q: O que entra no total do cabeçalho de cada mês? → A: Um total: soma dos valores de todas as contas visíveis daquele mês (respeitando os filtros).
- Q: Os blocos de mês começam abertos ou fechados? → A: Só o mês mais recente (entre os grupos visíveis) começa aberto; os demais começam fechados. O total permanece no cabeçalho. O usuário pode abrir ou fechar qualquer grupo.
- Q: O agrupamento Por categoria também colapsa? → A: Não. Por categoria permanece com todos os grupos abertos; o colapso aplica-se somente ao modo Por mês.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Agrupar a listagem por mês de vencimento (Priority: P1)

Na página **Contas a Pagar**, o usuário escolhe **agrupar por mês**. As contas visíveis (já filtradas) passam a aparecer em blocos por **mês e ano da data de vencimento**, em ordem cronológica (mês mais recente primeiro). Cada bloco mostra o rótulo do mês (ex.: “Agosto 2026”) e **um único total**: a soma dos valores de **todas as contas visíveis** daquele grupo (pagas e pendentes, conforme o que os filtros deixaram na lista). **Só o mês mais recente entre os grupos visíveis começa aberto** (contas listadas); os demais começam **fechados** (cabeçalho e total visíveis, linhas ocultas até o usuário abrir). O usuário pode abrir ou fechar qualquer mês.

O agrupamento por **categoria** (já existente na página) permanece disponível: o usuário troca entre **Por categoria** e **Por mês** sem perder os filtros aplicados. **Ao abrir a página**, o modo ativo é **Por mês**.

**Why this priority**: Sem agrupamento por mês, o financeiro perde a leitura de “o que vence em cada competência”, que é o recorte usual de contas a pagar.

**Independent Test**: Abrir a página e confirmar agrupamento por mês sem ação extra; com contas em pelo menos dois meses, conferir que só o mês mais recente está aberto e os demais mostram só cabeçalho + total; abrir um mês anterior e ver as contas; trocar para agrupamento por categoria e confirmar que a listagem muda de recorte mantendo os filtros.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado que acaba de abrir a página Contas a Pagar, **When** a listagem carrega, **Then** as contas já estão agrupadas **Por mês** (sem precisar escolher o modo).
2. **Given** um usuário autenticado na página Contas a Pagar com contas vencendo em meses diferentes e agrupamento Por mês, **When** observa a lista, **Then** ela é apresentada em grupos de mês/ano de vencimento; **somente o mês mais recente visível está aberto** (contas à mostra) e os demais estão fechados, com rótulo e total no cabeçalho.
3. **Given** agrupamento por mês ativo, **When** o usuário observa a ordem dos grupos, **Then** o mês mais recente aparece primeiro (aberto) e os anteriores em seguida (fechados).
4. **Given** vários meses fechados, **When** o usuário abre um mês anterior, **Then** as contas daquele mês aparecem; o mês mais recente permanece no estado em que o usuário o deixou (aberto ou fechado).
5. **Given** um grupo de um mês com contas pagas e pendentes visíveis (filtro de status “Todos”), **When** o usuário lê o cabeçalho do grupo, **Then** vê o nome do mês em português, o ano e **um** total igual à soma de todos os valores daquele grupo (pagas + pendentes), mesmo se o grupo estiver fechado.
6. **Given** filtro de status “Pendente” e agrupamento por mês, **When** o usuário lê o total do grupo, **Then** o número é a soma só das contas pendentes visíveis daquele mês (as pagas não estão na lista nem no total).
7. **Given** agrupamento por mês, **When** o usuário troca para **Por categoria**, **Then** a lista passa a agrupar por categoria (e subcategoria de RH, quando aplicável), mantendo os mesmos filtros, e **todos os grupos de categoria estão abertos** (sem colapso).
8. **Given** um visualizador, **When** usa o agrupamento, **Then** consegue agrupar por mês ou por categoria em somente leitura, sem ganhar permissão de edição.

---

### User Story 2 - Filtrar por categorias, incluindo Recursos Humanos (Priority: P1)

O usuário restringe a listagem por **categoria** de primeiro nível (oficiais e cadastradas), incluindo **Recursos Humanos**. Ao filtrar por RH, pode ainda restringir por **subcategoria** (Salário, Bônus, Comissão, Retirada Sócios, Benefícios) ou ver **todas as de RH**. O filtro vale tanto no agrupamento por mês quanto no agrupamento por categoria.

**Why this priority**: O pedido explícito é poder filtrar por categorias como Recursos Humanos; sem isso, o agrupamento por mês mistura todas as naturezas de despesa.

**Independent Test**: Filtrar por Recursos Humanos (todas as subcategorias) e depois por uma subcategoria (ex.: Salário), em ambos os modos de agrupamento; conferir que só as contas daquela classificação aparecem.

**Acceptance Scenarios**:

1. **Given** contas em várias categorias, **When** o usuário filtra por uma categoria de primeiro nível (ex.: Marketing), **Then** vê apenas contas dessa categoria.
2. **Given** contas de RH em mais de uma subcategoria, **When** filtra por **Recursos Humanos** sem escolher subcategoria, **Then** vê todas as contas de RH (todas as subcategorias) e nenhuma de outra categoria.
3. **Given** o filtro em Recursos Humanos, **When** escolhe a subcategoria **Salário**, **Then** vê somente contas de RH/Salário.
4. **Given** filtro por Recursos Humanos (com ou sem subcategoria) e agrupamento **Por mês**, **When** observa os grupos, **Then** só há grupos/meses que ainda têm contas após o filtro; contas de outras categorias não aparecem em nenhum mês.
5. **Given** o filtro “Todas” as categorias, **When** a lista é exibida, **Then** não há restrição por categoria (demais filtros, se houver, continuam valendo).
6. **Given** um visualizador, **When** aplica os filtros de categoria, **Then** obtém o mesmo recorte de leitura que o administrador.

---

### User Story 3 - Combinar agrupamento, filtro de categoria e demais recortes da página (Priority: P2)

O usuário aplica filtro de categoria (e subcategoria de RH, se houver) junto com os recortes já existentes da página (status pago/pendente/alertas, busca por descrição, intervalo de vencimento). O agrupamento por mês (ou por categoria) considera **somente** as contas que passaram por todos os filtros.

**Why this priority**: Agrupar e filtrar isolados não bastam se o recorte combinado distorcer totais ou esconder contas.

**Independent Test**: Filtrar RH + pendente + um intervalo de vencimento, agrupar por mês e conferir que cada grupo e seus totais refletem só esse recorte.

**Acceptance Scenarios**:

1. **Given** filtros de categoria e de status (ex.: Pendente) ativos, **When** agrupa por mês, **Then** cada grupo contém só contas que satisfazem **ambos** os filtros.
2. **Given** um intervalo de vencimento, **When** agrupa por mês, **Then** só aparecem meses (e contas) dentro desse intervalo.
3. **Given** busca por descrição, **When** agrupa por mês ou por categoria, **Then** os grupos mostram apenas contas cuja descrição atende à busca.
4. **Given** filtros que resultam em zero contas, **When** o usuário observa a listagem, **Then** vê estado vazio claro (sem grupos fantasma) e os totais dos cartões da página continuam coerentes com a regra já vigente da tela.

---

### Edge Cases

- Conta **sem data de vencimento**, com agrupamento por mês: vai para um grupo explícito **“Sem vencimento”**, no final da lista de meses (depois dos meses datados).
- Mês com uma única conta: o grupo existe normalmente, com total igual ao valor dessa conta.
- “Mês mais recente” significa o primeiro grupo **datado** na lista visível (após filtros), não o mês do calendário se ele não tiver contas. O grupo **“Sem vencimento”** não conta como mais recente e começa fechado.
- Só existe um grupo visível (um mês ou só “Sem vencimento”): esse grupo começa aberto.
- Cabeçalho de grupo fechado: rótulo, total e ação de abrir/fechar permanecem visíveis.
- Filtro de categoria que esvazia um mês: aquele grupo **não** é exibido.
- Contas **pendentes de reclassificação**: entram no agrupamento por mês pela data de vencimento; no agrupamento por categoria permanecem no grupo de pendência já existente; no filtro por categoria nomeada (ex.: Recursos Humanos) **não** entram até serem reclassificadas para essa categoria.
- Categorias cadastradas pelo administrador (além das oficiais): aparecem no filtro de categorias e funcionam igual às oficiais no recorte da listagem.
- Troca de agrupamento não limpa os filtros; troca de filtro não reseta o modo de agrupamento escolhido na sessão da página.
- Papel visualizador: mesmos agrupamento e filtros; sem criar, editar ou excluir.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Na página Contas a Pagar, o usuário DEVE poder escolher o modo de agrupamento da listagem entre **Por categoria** (comportamento já existente) e **Por mês**. Ao abrir a página, o modo DEVE iniciar em **Por mês**.
- **FR-002**: No modo **Por mês**, as contas exibidas DEVEM ser agrupadas pelo **mês e ano da data de vencimento**.
- **FR-003**: Os grupos de mês DEVEM ser apresentados em ordem do **mais recente para o mais antigo**, com rótulo em português (mês por extenso + ano).
- **FR-004**: Cada grupo de mês DEVE exibir **um único total**: a soma dos valores de **todas as contas visíveis** daquele grupo após os filtros (não há total separado de pago versus pendente no cabeçalho). Se o filtro de status restringe a lista, o total segue essa lista.
- **FR-005**: Contas sem data de vencimento, no modo Por mês, DEVEM aparecer no grupo **“Sem vencimento”**, após os grupos com data.
- **FR-014**: No modo Por mês, DEVE começar aberto apenas o grupo do **mês mais recente visível** (primeiro grupo datado após os filtros). Os demais grupos, inclusive **“Sem vencimento”**, DEVEM começar fechados. O usuário DEVE poder abrir e fechar qualquer grupo. O total do grupo permanece visível no cabeçalho mesmo fechado. Se houver só um grupo visível, ele DEVE começar aberto. O modo **Por categoria** NÃO DEVE colapsar grupos: todos os grupos de categoria DEVEM permanecer abertos.
- **FR-006**: O usuário DEVE poder filtrar a listagem por categoria de primeiro nível, incluindo **Recursos Humanos** e as demais categorias oficiais e cadastradas, além da opção **Todas**.
- **FR-007**: Ao filtrar por Recursos Humanos, o usuário DEVE poder restringir por **subcategoria de RH** ou ver todas as subcategorias de RH.
- **FR-008**: Filtro por categoria (e subcategoria, quando aplicável) DEVE aplicar-se da mesma forma nos modos Por mês e Por categoria.
- **FR-009**: O agrupamento DEVE considerar somente contas que passaram por **todos** os filtros ativos da página (categoria, subcategoria RH, status/alertas, descrição e intervalo de vencimento, quando preenchidos).
- **FR-010**: Trocar o modo de agrupamento NÃO DEVE limpar os filtros; alterar filtros NÃO DEVE resetar o modo de agrupamento na sessão da página.
- **FR-011**: Contas pendentes de reclassificação NÃO DEVEM aparecer no filtro de uma categoria nomeada; no agrupamento por mês, DEVEM aparecer no mês do vencimento (ou em “Sem vencimento”).
- **FR-012**: Papéis `admin` e `visualizador` DEVEM ter os mesmos agrupamento e filtros; o visualizador permanece somente leitura.
- **FR-013**: Esta feature NÃO DEVE alterar cadastro de contas, taxonomia de categorias, fluxo de caixa, Contas a Receber nem o Dashboard, salvo a listagem e os controles de agrupamento/filtro em Contas a Pagar.

### Key Entities

- **Conta a pagar**: lançamento de despesa com valor, datas (vencimento e, se houver, pagamento), status pago/pendente, categoria de primeiro nível e, quando for Recursos Humanos, subcategoria.
- **Categoria**: classificação de primeiro nível (oficiais e cadastradas) usada no filtro e no agrupamento por categoria.
- **Subcategoria de RH**: classificação obrigatória sob Recursos Humanos; usada no filtro fino.
- **Grupo mensal**: conjunto de contas a pagar cujo vencimento cai no mesmo mês/ano (ou o conjunto “Sem vencimento”).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Ao abrir Contas a Pagar, o usuário vê a listagem **já agrupada por mês** sem ação extra. Em até **15 segundos**, consegue passar de Por mês para Por categoria (e o inverso) sem perder o contexto dos filtros.
- **SC-002**: Com pelo menos **20 contas** em **3 meses** distintos, o usuário identifica o total de um mês fechado **sem abrir o grupo e sem somar linha a linha**, lendo o único total no cabeçalho.
- **SC-003**: Em **100%** dos casos de teste de filtro por Recursos Humanos (todas as subcategorias e uma subcategoria isolada), a listagem não mostra conta de outra categoria.
- **SC-004**: **90%** dos usuários de teste localizam despesas de RH de um mês-alvo na primeira tentativa, combinando filtro de RH e agrupamento por mês.
- **SC-005**: Com filtros que zeram o resultado, **nenhum** grupo vazio é apresentado como se houvesse contas.

## Assumptions

- O mês do agrupamento é o da **data de vencimento**, não o da data de pagamento nem o da criação do registro.
- O agrupamento **Por categoria** já existente (incluindo subgrupos de RH e pendência de reclassificação) permanece, com **todos os grupos abertos**; esta entrega **adiciona** o modo Por mês (com colapso) e garante o filtro por categorias no recorte combinado.
- O modo padrão ao abrir a página é **Por mês**; o usuário troca explicitamente para Por categoria quando quiser o recorte anterior.
- A escolha de agrupamento (Por mês vs Por categoria) vale na **sessão da página** (enquanto a tela permanece aberta); não é obrigatório lembrar a preferência após sair da página nesta entrega.
- No modo Por mês, o estado inicial aberto/fechado aplica-se a cada carregamento da listagem agrupada por mês (abrir a página ou voltar de Por categoria para Por mês). Não é obrigatório lembrar quais meses o usuário abriu após sair da página.
- Filtros de categoria, subcategoria de RH, status, descrição e intervalo de vencimento já fazem parte da página; esta feature os mantém e exige que funcionem junto com o agrupamento por mês.
- Totais dos cartões no topo da página (a pagar, vencido, pago) seguem a regra já vigente da tela; o total por grupo mensal é adicional, único e igual à soma das contas visíveis daquele grupo.
- Categorias cadastradas (feature de cadastro de categoria) entram no mesmo filtro de primeiro nível.
- Fora de escopo: exportação agrupada, gráficos novos, agrupamento por data de pagamento, agrupamento simultâneo mês+categoria em dois níveis, e alteração em outras páginas.
