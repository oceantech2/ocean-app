# Feature Specification: Contas a Pagar — Fornecedor, cards e campos Conta/Tipo

**Feature Branch**: `045-contas-pagar-campos`

**Created**: 2026-08-29

**Status**: Draft

**Input**: User description: "CONTAS A PAGAR - Nova conta a pagar: inserir Fornecedores como opções no campo Fornecedor; Inserir card Total (soma de total pago, total a pagar e vencido); Alterar ordem de exibição e nome dos campos (Total > Pago > A pagar > Vencido); Nova conta a pagar: inserir campo Conta (selecionar entre contas existentes, manter Conta Corrente 1 como padrão); Nova conta a pagar: inserir campo Tipo (opções Fixo ou Variável)"

## Clarifications

### Session 2026-08-29

- Q: O Tipo Fixo/Variável da conta a pagar deve valer também nos cards Despesas Fixas e Despesas Variáveis do Dashboard? → A: Só na página Contas a Pagar (formulário e listagem). O Dashboard continua classificando Fixas/Variáveis como hoje.
- Q: Como o card A pagar se relaciona com Vencido na soma do Total? → A: Parcelas exclusivas — A pagar = pendente no prazo; Vencido = pendente atrasado; Total = Pago + A pagar + Vencido.
- Q: Contas a pagar já existentes sem Conta gravada: o que fazer na migração? → A: Todas recebem **Conta Corrente 1** (padrão), editável depois.
- Q: A exportação Excel e PDF de Contas a Pagar deve incluir os novos campos Conta e Tipo? → A: Sim — Excel e PDF incluem **Conta** e **Tipo**, alinhados à listagem.
- Q: Ao abrir Nova conta a pagar, o campo Tipo deve vir pré-selecionado ou vazio? → A: Pré-selecionar **Variável** (editável).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Escolher Fornecedor cadastrado ao lançar a conta (Priority: P1)

O administrador, no formulário **Nova conta a pagar** (e na edição), usa o campo **Fornecedor** e vê como opções os **Fornecedores** ativos do cadastro unificado (página Fornecedores). Escolhe um fornecedor pelo nome, ou deixa sem fornecedor. Após salvar, o vínculo aparece na listagem. O visualizador consulta o fornecedor associado e não altera o campo.

**Why this priority**: Sem as opções do cadastro de Fornecedores, o campo não cumpre o uso operacional diário (identificar de quem é a despesa).

**Independent Test**: Ter ao menos dois Fornecedores ativos no cadastro; abrir Nova conta a pagar; confirmar que ambos aparecem no campo Fornecedor; salvar com um deles e ver o nome na listagem.

**Acceptance Scenarios**:

1. **Given** um administrador no formulário **Nova conta a pagar**, **When** abre o campo **Fornecedor**, **Then** as opções são os Fornecedores **ativos** do cadastro (pelo nome), além da opção de gravar **sem fornecedor**.
2. **Given** Fornecedores cadastrados (incluindo registros que antes eram colaboradores e fornecedores novos), **When** o administrador consulta o campo, **Then** todos os ativos aparecem; registros inativos **não** entram nas opções de uma conta nova.
3. **Given** um fornecedor ativo selecionado e os demais dados obrigatórios válidos, **When** o administrador salva, **Then** a conta fica vinculada a esse fornecedor e a listagem exibe o nome.
4. **Given** o campo Fornecedor deixado sem seleção, **When** o administrador salva com os demais dados válidos, **Then** a conta é gravada sem fornecedor (vínculo opcional).
5. **Given** um administrador editando uma conta cujo fornecedor foi desativado, **When** abre o formulário, **Then** o fornecedor atual permanece visível (identificado como inativo) para não perder o vínculo já gravado; novas escolhas listam só ativos.
6. **Given** um visualizador, **When** consulta a conta, **Then** vê o fornecedor (ou a ausência) e **não** altera o campo.

---

### User Story 2 - Ver cards Total, Pago, A pagar e Vencido (Priority: P1)

Qualquer usuário autenticado, na página **Contas a Pagar**, vê quatro cards de totais, nesta ordem da esquerda para a direita: **Total**, **Pago**, **A pagar**, **Vencido**. Os nomes visíveis são exatamente esses (não “Total Pago” nem “Total a Pagar”). **Pago**, **A pagar** e **Vencido** são parcelas **mutuamente exclusivas**; **Total** é a soma das três.

| Card      | O que soma                                                                 |
|-----------|----------------------------------------------------------------------------|
| Pago      | Contas já pagas                                                            |
| A pagar   | Contas pendentes cujo vencimento **ainda não passou**                      |
| Vencido   | Contas pendentes cujo vencimento é **anterior a hoje**                     |
| Total     | Pago + A pagar + Vencido                                                   |

**Why this priority**: É a leitura gerencial da página; ordem e nomes errados geram conferência lenta e risco de somar vencido duas vezes.

**Independent Test**: Ter ao menos uma conta paga, uma pendente no prazo e uma vencida, com valores conhecidos; conferir os quatro cards na ordem e que Total = Pago + A pagar + Vencido.

**Acceptance Scenarios**:

1. **Given** a página Contas a Pagar aberta, **When** o usuário olha os cards de totais, **Then** vê quatro cards na ordem **Total**, **Pago**, **A pagar**, **Vencido**, com esses rótulos.
2. **Given** contas pagas, pendentes no prazo e vencidas na mesma visão, **When** consulta os valores, **Then** **Pago** soma só as pagas, **A pagar** só as pendentes ainda não vencidas, **Vencido** só as pendentes já vencidas, e **Total** é a soma dos três valores.
3. **Given** uma conta pendente que vence hoje, **When** os cards são calculados, **Then** o valor entra em **A pagar** (não em **Vencido**).
4. **Given** uma conta já paga com vencimento no passado, **When** os cards são calculados, **Then** o valor entra só em **Pago** (não em **Vencido** nem em **A pagar**).
5. **Given** um visualizador, **When** abre a página, **Then** vê os mesmos quatro cards e valores (somente leitura).

---

### User Story 3 - Escolher Conta no lançamento, com Conta Corrente 1 como padrão (Priority: P1)

No formulário **Nova conta a pagar** (e na edição), o administrador informa o campo **Conta**: escolhe entre as **contas correntes existentes e ativas**, pelo nome cadastrado. Ao abrir uma conta nova, a opção pré-selecionada é **Conta Corrente 1** (a conta corrente padrão do produto, o mesmo slot que o Dashboard trata como Conta Corrente 1). A escolha é gravada mesmo se a despesa ainda estiver pendente. A lista **não** inclui Conta investimento. O visualizador vê a conta associada e não a altera.

**Why this priority**: Sem escolher a conta no ato do lançamento, o pagamento cai no caixa errado e exige retrabalho.

**Independent Test**: Com duas ou mais contas correntes ativas, abrir Nova conta a pagar, confirmar padrão Conta Corrente 1, trocar para outra, salvar pendente e conferir a conta na listagem; na edição, o valor permanece.

**Acceptance Scenarios**:

1. **Given** um administrador no formulário **Nova conta a pagar**, **When** visualiza os campos, **Then** existe o campo **Conta** (visível mesmo sem data de pagamento) com as contas correntes **ativas** pelo nome, sem Conta investimento.
2. **Given** o formulário de criação recém-aberto, **When** o administrador ainda não alterou **Conta**, **Then** a opção pré-selecionada é **Conta Corrente 1** (conta corrente padrão).
3. **Given** o administrador escolhe outra conta corrente ativa e salva (pendente ou já paga), **When** a listagem e a edição são consultadas, **Then** a conta escolhida permanece associada.
4. **Given** uma única conta corrente ativa, **When** abre o formulário, **Then** essa conta é a única opção e já vem selecionada.
5. **Given** o administrador marca a conta como paga depois (ação de pagar ou preenchendo a data de pagamento), **When** confirma, **Then** a Conta já gravada é a partida; ele pode trocar antes de confirmar, se o fluxo de pagamento já permitir escolha.
6. **Given** um visualizador, **When** consulta, **Then** vê o nome da Conta e **não** altera o campo.

---

### User Story 4 - Classificar a despesa como Fixo ou Variável (Priority: P1)

No formulário **Nova conta a pagar** (e na edição), o administrador informa o campo **Tipo** com uma das opções: **Fixo** ou **Variável**. O valor é obrigatório, persiste e fica visível na listagem. Esse Tipo é da **conta a pagar**, distinto do Tipo do cadastro de Fornecedor (Fixo/Spot). O visualizador vê o Tipo e não o altera.

**Why this priority**: Classificar cada despesa como fixa ou variável no lançamento é o dado que o financeiro usa para leitura operacional da página.

**Independent Test**: Criar uma conta Tipo Fixo e outra Variável; reabrir cada uma e confirmar persistência; tentar gravar sem Tipo e confirmar recusa; conferir o Tipo na listagem.

**Acceptance Scenarios**:

1. **Given** o formulário **Nova conta a pagar**, **When** o administrador visualiza os campos, **Then** existe **Tipo** com as opções **Fixo** e **Variável**, com **Variável** já pré-selecionado.
2. **Given** Tipo **Fixo** ou **Variável** selecionado e demais dados válidos, **When** o administrador salva, **Then** o Tipo persiste e reaparece na edição e na listagem.
3. **Given** o formulário de criação com **Variável** pré-selecionado, **When** o administrador limpa ou desmarca o Tipo e tenta salvar, **Then** o sistema recusa e informa que o Tipo é obrigatório.
4. **Given** um administrador editando uma conta, **When** troca Fixo por Variável (ou o inverso) e salva, **Then** o novo Tipo prevalece.
5. **Given** contas já existentes antes desta feature, **When** são exibidas pela primeira vez após a mudança, **Then** recebem **Variável** como Tipo padrão, editável pelo administrador.
6. **Given** um visualizador, **When** consulta, **Then** vê o Tipo e **não** o altera.

---

### User Story 5 - Exportar Conta e Tipo (Priority: P2)

O administrador (e o visualizador, em consulta) exporta a listagem de Contas a Pagar para **Excel** ou **PDF** e encontra as colunas **Conta** e **Tipo** com os mesmos valores exibidos na tela.

**Why this priority**: Conferência e repasse fora do sistema dependem de exportação alinhada à listagem.

**Independent Test**: Ter contas com Conta e Tipo distintos; exportar Excel e PDF; confirmar que ambos os campos aparecem e batem com a tela.

**Acceptance Scenarios**:

1. **Given** contas com Conta e Tipo preenchidos na listagem, **When** o usuário exporta para **Excel**, **Then** o arquivo inclui colunas **Conta** e **Tipo** com os mesmos valores da tela.
2. **Given** as mesmas contas, **When** o usuário exporta para **PDF**, **Then** o resultado inclui **Conta** e **Tipo** alinhados à listagem.
3. **Given** uma conta sem Fornecedor, **When** exporta, **Then** Conta e Tipo ainda aparecem; Fornecedor segue a regra já vigente (traço ou vazio).

---

### Edge Cases

- Cadastro de Fornecedores vazio: o campo Fornecedor permanece, só com a opção de gravar sem fornecedor; a conta pode ser salva.
- Fornecedor inativo: não aparece em conta nova; na edição de vínculo antigo, permanece visível e identificado como inativo.
- Nome de fornecedor duplicado na lista: cada opção corresponde a um registro distinto (o usuário distingue pelo nome exibido; se os nomes forem iguais, ambos ainda são selecionáveis).
- Conta investimento: nunca aparece no campo **Conta** desta tela.
- Nenhuma conta corrente ativa: o sistema impede gravar a conta a pagar e informa que é preciso haver ao menos uma conta corrente ativa.
- Conta corrente padrão desativada: a pré-seleção usa a conta corrente que o produto considera padrão no momento (a mesma lógica já usada para “Conta Corrente 1”); se essa deixar de existir, usa-se a primeira conta corrente ativa disponível.
- Data de vencimento igual a hoje em conta pendente: entra em **A pagar**, não em **Vencido**.
- Conta paga com vencimento atrasado: entra só em **Pago**.
- Filtros já existentes da página (categoria, status, descrição, período): os quatro cards MUST refletir o **mesmo conjunto visível** após esses filtros, para o Total bater com o que a pessoa está vendo.
- Tipo do Fornecedor (Fixo/Spot) NÃO preenche nem substitui o Tipo da conta (Fixo/Variável).
- Visualizador: consulta cards, fornecedor, Conta e Tipo; nenhuma criação/edição.
- Importação em lote existente: fora do escopo de novos campos na planilha (continua como hoje); contas importadas recebem Tipo **Variável** e Conta **Conta Corrente 1** (padrão), editáveis depois.
- Contas já existentes sem Conta na migração: recebem **Conta Corrente 1** (padrão), editável depois; Tipo **Variável** se ainda não houver.
- Papel admin: único que cria/edita os novos campos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: No formulário **Nova conta a pagar** e **Editar conta a pagar**, o campo **Fornecedor** MUST listar os Fornecedores **ativos** do cadastro unificado, identificados pelo nome, e MUST permitir gravar sem fornecedor.
- **FR-002**: Fornecedores inativos MUST NOT aparecer como opção em conta nova; na edição, um vínculo já gravado com fornecedor inativo MUST permanecer visível e identificável como inativo.
- **FR-003**: A página Contas a Pagar MUST exibir quatro cards de totais na ordem **Total**, **Pago**, **A pagar**, **Vencido**, usando exatamente esses rótulos.
- **FR-004**: **Pago** MUST somar apenas contas pagas do conjunto visível; **A pagar** MUST somar apenas contas pendentes com vencimento hoje ou futuro; **Vencido** MUST somar apenas contas pendentes com vencimento anterior a hoje.
- **FR-005**: **Total** MUST ser igual a Pago + A pagar + Vencido do mesmo conjunto visível (as três parcelas mutuamente exclusivas; Vencido NÃO entra de novo em A pagar).
- **FR-006**: No formulário de criação e edição, MUST existir o campo **Conta**, visível independentemente de haver data de pagamento, com as contas correntes **ativas** (pelo nome cadastrado), sem Conta investimento.
- **FR-007**: Ao abrir **Nova conta a pagar**, **Conta** MUST iniciar pré-selecionada em **Conta Corrente 1** (conta corrente padrão do produto); o administrador MUST poder trocar antes de salvar.
- **FR-008**: A Conta escolhida MUST ser persistida na criação e na edição, inclusive quando a despesa ainda estiver pendente, e MUST aparecer na listagem pelo nome.
- **FR-009**: Sem ao menos uma conta corrente ativa, o sistema MUST recusar gravar a conta a pagar e informar o motivo.
- **FR-010**: No formulário de criação e edição, MUST existir o campo **Tipo** com opções **Fixo** e **Variável**, obrigatório para gravar; em **Nova conta a pagar**, MUST iniciar com **Variável** pré-selecionado (editável).
- **FR-011**: O Tipo da conta a pagar MUST ser persistido e visível na listagem; MUST ser independente do Tipo do cadastro de Fornecedor (Fixo/Spot).
- **FR-012**: Contas já existentes e contas importadas sem Tipo MUST receber **Variável** como valor inicial, editável depois.
- **FR-013**: Contas **já existentes**, contas **importadas** e demais registros **sem Conta** MUST receber **Conta Corrente 1** (padrão) como valor inicial na migração ou na importação, editável depois.
- **FR-014**: Usuários com papel **visualizador** MUST NOT criar nem editar Fornecedor, Conta ou Tipo nesses formulários; apenas consultar cards e dados.
- **FR-015**: Os demais campos e regras já vigentes do módulo (descrição, categorias, valor, vencimento, data de pagamento, comprovante, papéis, exclusão individual) MUST permanecer; esta feature NÃO os redefine.
- **FR-016**: Os cards Despesas Fixas e Despesas Variáveis do **Dashboard** MUST NOT mudar de regra nesta feature; o Tipo Fixo/Variável da conta a pagar MUST valer apenas no formulário e na listagem de Contas a Pagar.
- **FR-017**: As exportações **Excel** e **PDF** de Contas a Pagar MUST incluir **Conta** e **Tipo** com os mesmos valores exibidos na listagem.

### Key Entities

- **Conta a Pagar**: Despesa lançada no Ocean; passa a incluir **Fornecedor** (opcional), **Conta** (conta corrente de destino/origem do pagamento) e **Tipo** (Fixo ou Variável), além dos atributos já existentes (descrição, valor, vencimento, pagamento, categoria).
- **Fornecedor**: Registro do cadastro unificado; ativo pode ser escolhido no campo Fornecedor da conta a pagar.
- **Conta (conta corrente)**: Caixa operacional cadastrado (ex.: Conta Corrente 1 como padrão); selecionável no lançamento; distinta da Conta investimento.
- **Tipo da despesa**: Classificação **Fixo** ou **Variável** da própria conta a pagar (não confundir com Tipo Fixo/Spot do Fornecedor).
- **Totais da página**: Quatro indicadores — Total, Pago, A pagar, Vencido — calculados sobre o conjunto visível.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das aberturas de **Nova conta a pagar** com Fornecedores ativos cadastrados, o campo Fornecedor lista esses registros pelo nome e permite gravar com ou sem vínculo.
- **SC-002**: Em 100% das inspeções da página, os cards aparecem na ordem Total → Pago → A pagar → Vencido, com esses nomes.
- **SC-003**: Em 100% dos conjuntos de teste com contas pagas, pendentes no prazo e vencidas, Total = Pago + A pagar + Vencido e nenhuma conta entra em mais de um dos três cards de parcela.
- **SC-004**: Administrador conclui o lançamento informando Fornecedor (ou sem), Conta e Tipo em menos de 2 minutos, sem sair da página.
- **SC-005**: Em 100% das criações, o campo Conta inicia em Conta Corrente 1 (padrão) e a escolha (padrão ou outra) permanece após recarregar.
- **SC-006**: Em 100% das tentativas de gravar sem Tipo, o sistema bloqueia e o usuário entende o motivo sem suporte técnico.
- **SC-007**: Visualizador não consegue alterar Fornecedor, Conta nem Tipo em 100% das tentativas, e ainda assim lê os quatro cards corretamente.
- **SC-008**: Em inspeção da listagem, 100% das contas exibem Fornecedor (ou traço), Conta e Tipo de forma legível.
- **SC-009**: Em 100% das exportações Excel e PDF geradas na página, **Conta** e **Tipo** aparecem e coincidem com a listagem visível no momento da exportação.

## Assumptions

- O campo Fornecedor já existe na tela; o pedido é garantir que as **opções** sejam os Fornecedores do cadastro unificado (ativos), não um subconjunto antigo (ex.: só ex-colaboradores).
- Vínculo com Fornecedor permanece **opcional**, alinhado à regra já vigente do módulo.
- **A pagar** inclui somente pendentes **no prazo**; **Vencido** inclui somente pendentes **atrasadas**; as três parcelas (Pago, A pagar, Vencido) são **mutuamente exclusivas** e somam o **Total**. Confirmado na sessão de esclarecimento de 2026-08-29. Isso altera o significado do card que hoje se chama “Total a Pagar”.
- “Conta Corrente 1” é a conta corrente **padrão** do produto (o mesmo slot do Dashboard); o rótulo visível no seletor é o **nome cadastrado** dessa conta, que pode ser “Conta Corrente 1” ou outro nome.
- O campo **Conta** fica sempre visível no formulário (não só quando há data de pagamento), para classificar o caixa já no lançamento.
- Conta investimento permanece fora desta lista; transferência de/para investimento continua só no Fluxo de Caixa.
- Tipo Fixo/Variável nesta feature vale **somente na página Contas a Pagar** (formulário e listagem). Os cards Despesas Fixas/Variáveis do **Dashboard** continuam com a regra já vigente (classificação por categoria). Confirmado na sessão de esclarecimento de 2026-08-29.
- Contas existentes, importadas e demais registros sem Conta recebem **Conta Corrente 1** (padrão) e Tipo **Variável** na migração/importação, editáveis depois — confirmado na sessão de esclarecimento de 2026-08-29.
- **Nova conta a pagar** abre com Tipo **Variável** pré-selecionado (editável); confirmado na sessão de 2026-08-29.
- Papéis admin / visualizador seguem o produto existente.
- Filtros, agrupamento por mês, importação, exportação, comprovantes e ação de pagar na listagem permanecem; exportação Excel e PDF passam a incluir **Conta** e **Tipo** (confirmado na sessão de 2026-08-29).
- Formato monetário dos cards segue o padrão brasileiro já usado na página.

## Out of Scope

- Alterar o cadastro de Fornecedores (campos, Tipo Fixo/Spot, página `/fornecedores`).
- Incluir Conta investimento no seletor de Contas a Pagar.
- Recalcular ou redefinir os cards Despesas Fixas / Despesas Variáveis do Dashboard.
- Novos filtros por Tipo, Fornecedor ou Conta (além dos filtros já existentes).
- Tornar o Fornecedor obrigatório.
- Pagamento parcial, rateio entre várias contas correntes ou múltiplos tipos na mesma conta.
- Mudança das colunas da planilha de importação (os novos campos recebem padrão na importação; preenchimento pela planilha fica para feature futura).
- Redesign completo da página além dos cards, do campo Fornecedor e dos campos Conta e Tipo.
