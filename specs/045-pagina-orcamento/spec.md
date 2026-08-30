# Feature Specification: Página Orçamento

**Feature Branch**: `045-pagina-orcamento`

**Created**: 2026-08-29

**Status**: Draft

**Input**: User description: "ORÇAMENTO - Adicionar página \"Orçamento\""

**Baseline**: Referencia `specs/001-ocean-app-baseline`. Esta feature **adiciona** um módulo navegável novo; não altera Dashboard, Contas a Pagar, metas de receita nem demais páginas, salvo inclusão do item no menu, no catálogo de visibilidade e nas permissões.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Abrir a página Orçamento pelo menu (Priority: P1)

O usuário autenticado (admin ou visualizador com permissão) encontra o item **Orçamento** no menu lateral, abre a página no endereço correspondente e vê uma tela dedicada a planejar e acompanhar o orçamento de despesas do ano. O visualizador sem permissão a este módulo não vê o item. Em Configurações, o administrador inclui Orçamento na lista de páginas ocultáveis e nas permissões do visualizador, no mesmo padrão das demais páginas financeiras.

**Why this priority**: Sem ponto de entrada no produto, o restante da feature não é utilizável.

**Independent Test**: Entrar como admin e como visualizador (com e sem permissão); confirmar item de menu, abertura da página, ausência para quem não tem permissão; em Configurações, confirmar Orçamento na visibilidade global e nas permissões.

**Acceptance Scenarios**:

1. **Given** um administrador autenticado, **When** consulta o menu lateral, **Then** vê o item **Orçamento** (após **Contas a Pagar** e antes de **Fluxo de Caixa**) e, ao acioná-lo, abre a página Orçamento.
2. **Given** um visualizador com permissão ao módulo Orçamento e a página visível globalmente, **When** consulta o menu, **Then** vê **Orçamento** e consegue abrir a página em somente leitura.
3. **Given** um visualizador sem permissão a Orçamento, **When** consulta o menu ou tenta o endereço direto, **Then** não vê o item e não acessa o conteúdo (mesmo tratamento das demais páginas restritas).
4. **Given** Orçamento oculta na visibilidade global, **When** qualquer usuário autentica, **Then** o item some do menu e da busca rápida; o visualizador não acessa pelo endereço; o administrador ainda acessa pelo endereço direto (regra já vigente de páginas ocultas).
5. **Given** um administrador em Configurações, **When** abre visibilidade de páginas e permissões de visualizador, **Then** Orçamento aparece na lista com rótulo **Orçamento** e descrição compreensível (planejamento e acompanhamento do orçamento de despesas).

---

### User Story 2 - Ver o orçamento do ano por categoria (previsto × realizado) (Priority: P1)

Na página Orçamento, o usuário escolhe o **ano** e vê, para cada categoria de despesa usada em Contas a Pagar, o valor **orçado**, o valor **realizado** daquele ano e a **variação** (orçado menos realizado, em valor e em percentual quando o orçado for maior que zero). Há um resumo do ano: total orçado, total realizado, saldo (orçado − realizado) e percentual já utilizado. O recorte padrão é o ano civil corrente.

**Why this priority**: É o valor de negócio da página — enxergar o plano de despesas e o quanto já foi consumido, no mesmo recorte de categorias da operação.

**Independent Test**: Com orçamento informado em pelo menos duas categorias e contas a pagar nessas categorias no mesmo ano, abrir a página, conferir linhas, totais e troca de ano.

**Acceptance Scenarios**:

1. **Given** a página recém-aberta na sessão, **When** carrega, **Then** o ano selecionado é o ano civil corrente e a grade mostra as categorias de despesa vigentes (oficiais, subcategorias de Recursos Humanos e categorias cadastradas pelo administrador).
2. **Given** um ano com valores orçados e contas a pagar nessas categorias, **When** o usuário lê uma linha, **Then** vê o nome da categoria, o orçado do ano, o realizado do ano e a variação (valor e percentual, este último só se o orçado for &gt; 0).
3. **Given** Recursos Humanos, **When** o usuário lê a grade, **Then** vê uma linha por subcategoria (Salário, Comissão, e as demais subcategorias oficiais vigentes), não um único bloco “RH” que misture tudo.
4. **Given** categorias oficiais sem subcategoria (ex.: Marketing, Tecnologia) e categorias cadastradas, **When** a grade carrega, **Then** cada uma aparece como linha própria.
5. **Given** o resumo no topo, **When** há dados, **Then** total orçado, total realizado, saldo e percentual utilizado são a soma coerente das linhas visíveis (Impostos e Retirada Sócios entram no orçamento; não são omitidos).
6. **Given** o usuário troca o ano, **When** a página atualiza, **Then** orçado, realizado e totais passam a ser só daquele ano, sem misturar anos.
7. **Given** um ano sem nenhum valor orçado e sem despesas, **When** a página carrega, **Then** a grade permanece visível com orçado e realizado zerados (ou estado vazio equivalente) e mensagem clara de que ainda não há orçamento definido; a tela não quebra.
8. **Given** papéis `admin` e `visualizador` com acesso, **When** cada um abre a página, **Then** ambos veem os mesmos números; só o admin altera o orçado.

---

### User Story 3 - Administrador informa e altera o orçamento (Priority: P1)

O administrador define, para o ano selecionado, o valor orçado de cada linha (categoria ou subcategoria). Ele informa valores **mensais** (janeiro a dezembro); o orçado anual da linha é a soma dos doze meses. Pode gravar de uma vez o conjunto do ano. O visualizador não vê controles de edição. Valores inválidos são recusados com mensagem clara; o que já estava gravado permanece.

**Why this priority**: Sem poder gravar o plano, a página só consulta realizado e não cumpre o papel de orçamento.

**Independent Test**: Como admin, informar meses de duas categorias, gravar, recarregar e conferir persistência; tentar valor negativo e conferir recusa; como visualizador, confirmar ausência de edição.

**Acceptance Scenarios**:

1. **Given** um administrador no ano corrente, **When** informa valores mensais válidos (≥ 0) em uma ou mais categorias e confirma a gravação, **Then** os valores persistem e reaparecem ao reabrir a página naquele ano.
2. **Given** valores mensais gravados, **When** o usuário lê o orçado anual da linha, **Then** esse total é a soma dos doze meses daquela linha.
3. **Given** um administrador, **When** altera meses já gravados e salva de novo, **Then** os novos valores substituem os anteriores daquele ano e categoria; anos distintos não se afetam.
4. **Given** um mês sem valor informado, **When** grava, **Then** aquele mês conta como zero na soma (não impede gravar o restante).
5. **Given** o administrador informa valor negativo ou não numérico, **When** tenta gravar, **Then** o sistema recusa, explica o problema e não aplica a alteração inválida.
6. **Given** um visualizador na página, **When** observa ações, **Then** não encontra formulário, botão ou atalho para criar ou alterar orçamento.
7. **Given** falha ao gravar, **When** o admin tenta salvar, **Then** recebe feedback de erro e os valores exibidos continuam os últimos gravados com sucesso.

---

### User Story 4 - Entender consumo e estouro do orçamento (Priority: P2)

O usuário identifica rapidamente linhas e o total do ano em que o realizado já ultrapassou o orçado, e linhas ainda sem orçamento mas com despesa. A leitura permanece compreensível com categorias novas (cadastradas depois do plano) e com realizado maior que o orçado.

**Why this priority**: O acompanhamento só gera decisão se o estouro e a ausência de plano forem visíveis, sem exigir cálculo mental.

**Independent Test**: Com uma categoria orçada abaixo do realizado, outra só com realizado e outra só com orçado, conferir destaque de estouro, linha sem plano e totais.

**Acceptance Scenarios**:

1. **Given** uma linha com realizado maior que o orçado, **When** o usuário lê a grade, **Then** a variação negativa (estouro) é distinguível das linhas dentro do plano (ex.: destaque visual e percentual acima de 100%).
2. **Given** uma categoria com realizado e orçado zero (ou sem plano), **When** a grade carrega, **Then** a linha aparece com realizado preenchido, orçado zero e indicação de que não há orçamento (percentual de uso não é apresentado de forma enganosa).
3. **Given** uma categoria cadastrada depois de o orçamento do ano ter sido gravado, **When** a página abre, **Then** a categoria nova entra na grade com orçado zero até o admin informar valores; o realizado, se houver, já aparece.
4. **Given** o total do ano com estouro em algumas linhas e folga em outras, **When** o usuário lê o resumo, **Then** o saldo e o percentual utilizado refletem a soma real (estouro de uma linha não é escondido no total).

---

### Edge Cases

- Ano civil futuro (ainda sem despesas): permite gravar orçamento antecipado; realizado permanece zero até haver contas com vencimento naquele ano.
- Ano passado: orçado e realizado são consultáveis; o admin ainda pode ajustar o orçado histórico (não há bloqueio de anos encerrados nesta entrega).
- Troca de ano no filtro: descarta alterações não gravadas da tela anterior (ou pede confirmação se houver alteração pendente) para não gravar o plano no ano errado.
- Categoria ou subcategoria descontinuada que ainda tenha orçado ou realizado no ano: permanece visível naquele ano; não some da grade enquanto houver dado.
- Realizado usa o **mês de vencimento** das contas a pagar do ano selecionado (pagas e não pagas), na mesma lógica de competência do custo por categoria; contas sem vencimento válido não entram.
- Impostos entram no orçamento (linha Impostos). Retirada Sócios entra como subcategoria de Recursos Humanos.
- Moeda e formato: valores em Real, padrão brasileiro, consistentes com o restante do produto.
- Carregamento e falha de dados: spinner/estado de carga no padrão das outras páginas; erro com mensagem clara, sem números inventados.
- Página oculta vs permissão: valem as regras já vigentes (admin acessa URL se oculta; visualizador não).
- Não há aprovação em fluxo, versões alternativas (“cenário otimista”) nem cópia automática do ano anterior nesta entrega.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-000**: A primeira entrega da página Orçamento MUST [NEEDS CLARIFICATION: ser o módulo de orçamento de despesas (previsto × realizado por categoria); ser só o item de menu com página inicial sem plano ainda; ou incluir também receitas e resultado orçado?].
- **FR-001**: O menu de navegação MUST exibir o item **Orçamento** após **Contas a Pagar** e antes de **Fluxo de Caixa**, levando ao endereço **`/orcamento`**.
- **FR-002**: A página Orçamento MUST estar no catálogo de visibilidade global e nas permissões do visualizador, com rótulo **Orçamento**.
- **FR-003**: A página MUST exigir autenticação e respeitar permissão de módulo e visibilidade global no mesmo padrão das demais páginas financeiras.
- **FR-004**: Usuários `admin` MUST poder criar e alterar o orçamento; usuários `visualizador` MUST consultar em somente leitura.
- **FR-005**: A página MUST filtrar por **ano civil** (padrão: ano corrente) e MUST exibir somente dados daquele ano.
- **FR-006**: A grade MUST listar uma linha por categoria de despesa de primeiro nível sem subcategoria (oficiais e cadastradas) e uma linha por subcategoria oficial de Recursos Humanos.
- **FR-007**: O administrador MUST informar o valor orçado de cada linha no recorte [NEEDS CLARIFICATION: valores mensais (janeiro a dezembro, anual = soma) ou um único valor anual por categoria?].
- **FR-008**: Valores orçados MUST ser maiores ou iguais a zero; valores negativos ou inválidos MUST ser recusados com mensagem clara.
- **FR-009**: A página MUST [NEEDS CLARIFICATION: comparar orçado com realizado das contas a pagar (vencimento no ano, pagas e não pagas); comparar só com contas já pagas; ou não exibir realizado nesta entrega?].
- **FR-010**: A página MUST calcular, por linha e no total do ano: orçado, realizado, saldo (orçado − realizado) e percentual utilizado quando o orçado for maior que zero.
- **FR-011**: O resumo do ano MUST mostrar total orçado, total realizado, saldo e percentual utilizado, coerentes com a soma das linhas (incluindo Impostos e Retirada Sócios).
- **FR-012**: Linhas com realizado acima do orçado MUST ser distinguíveis visualmente como estouro.
- **FR-013**: A página MUST permanecer utilizável sem orçamento gravado (orçado zero, realizado se houver, estado compreensível).
- **FR-014**: A gravação MUST persistir o plano por ano e por linha; alterar um ano MUST NOT alterar outro.
- **FR-015**: Impostos MUST aparecer como linha de orçamento; MUST NOT ser omitidos desta página (diferente dos cards de Despesa do Dashboard, que excluem Impostos).

### Key Entities

- **Orçamento anual de despesas**: Plano de gastos da empresa para um ano civil, composto pelas linhas de categoria/subcategoria e pelos valores mensais informados pelo administrador.
- **Linha de orçamento**: Uma categoria de despesa (ou subcategoria de Recursos Humanos) com orçado mensal, orçado anual, realizado do ano e variação.
- **Realizado**: Soma das contas a pagar daquela linha no ano, pela data de vencimento, independentemente de já pagas ou não.
- **Categoria de despesa**: Mesma classificação já usada em Contas a Pagar (taxonomia oficial, subcategorias de RH e categorias cadastradas).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um administrador encontra **Orçamento** no menu e abre a página na primeira visita, sem treinamento adicional.
- **SC-002**: Com um conjunto conhecido de valores orçados e de contas a pagar no mesmo ano, o usuário confere orçado, realizado e variação de cada linha e os totais do ano em menos de 1 minuto, sem calcular à parte.
- **SC-003**: Um administrador grava o plano mensal de pelo menos três categorias de um ano e, após recarregar a página, recupera 100% dos valores gravados.
- **SC-004**: Em 100% das visitas, o visualizador com permissão vê os mesmos totais que o admin e não encontra ação de alterar o orçamento.
- **SC-005**: Em uma revisão da visibilidade e das permissões, Orçamento aparece no catálogo e pode ser ocultada ou concedida como as demais páginas financeiras, sem quebrar o menu existente.

## Assumptions

- “Adicionar página Orçamento” nesta entrega é um **módulo de planejamento e acompanhamento de despesas**, não uma tela vazia e não um orçamento de receitas (as metas de faturamento permanecem no Dashboard).
- O orçamento **não** substitui nem edita metas de receita; não há linha de receita nem resultado (lucro orçado) nesta entrega.
- Recorte operacional: **ano civil** + valores **mensais** por categoria; o anual é derivado da soma dos meses.
- Realizado vem **somente** de Contas a Pagar (vencimento no ano), pagas e não pagas. Não inclui movimentos manuais de fluxo de caixa que não sejam contas a pagar.
- Impostos e Retirada Sócios entram no orçamento de despesas (visão de caixa/compromisso), mesmo que o Dashboard exclua Impostos dos cards de Despesa.
- Papéis `admin` e `visualizador` não mudam; a página é ocultável e sujeita a permissão de visualizador.
- Endereço **`/orcamento`**. Posição no menu: após Contas a Pagar, antes de Fluxo de Caixa.
- Fora de escopo: versões/cenários, fluxo de aprovação, cópia do ano anterior, importação/exportação, orçamento por fornecedor ou por pessoa da equipe, e qualquer alteração de cálculo do Dashboard.
- Confirmação ao sair com alterações não gravadas segue o padrão de cuidado do produto (não perder edição silenciosamente ao trocar o ano).
