# Feature Specification: Correção de Férias (fornecedor, listagem e folha)

**Feature Branch**: `050-ferias-fornecedor-correcao`

**Created**: 2026-09-06

**Status**: Draft

**Input**: User description: "FÉRIAS — Não está funcionando. Onde está escrito colaborador mudar para fornecedor e trocar endpoint. Novo Período de Férias no campo colaborador não abre listagem com nomes. A lógica de cálculo era baseado na data de entrada do colaborador ao completar 1 ano ele tinha direito as férias. Voltar data de início e término opcional. Voltar salário. Voltar com card total da folha."

## Clarifications

### Session 2026-09-06

- Q: Se o fornecedor ainda não completou 1 ano (ou está sem data de admissão), o que o sistema deve fazer ao tentar salvar um período? → A: Aviso com override — alerta, mas o admin pode confirmar e gravar com direito normal (30).
- Q: Quem entra no Total da Folha? → A: Todos os fornecedores elegíveis ativos (filtro de pessoa restringe; ano não altera a soma).
- Q: Onde o salário do fornecedor deve aparecer na página de Férias? → A: Tabela + formulário — coluna na listagem e campo somente leitura no modal.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Listagem de fornecedores no formulário e filtros (Priority: P1)

O administrador abre a página de Férias e, ao criar **Novo Período** ou usar o filtro da página, o campo de pessoa exibe a listagem com **nomes de fornecedores** elegíveis à equipe. Em toda a tela (títulos, filtros, formulário, avisos, exportações e importações voltadas ao usuário), a palavra **colaborador** é substituída por **fornecedor**. A tela passa a obter essa listagem pela fonte oficial de **fornecedores** (e não pela nomenclatura/rota antiga de colaboradores).

**Why this priority**: Sem nomes na lista, o cadastro de período está inutilizável; a nomenclatura desalinha o produto após a unificação com Fornecedores.

**Independent Test**: Abrir Férias com fornecedores elegíveis cadastrados; abrir Novo Período; confirmar que o seletor mostra nomes; confirmar rótulos “Fornecedor” na UI.

**Acceptance Scenarios**:

1. **Given** existem fornecedores ativos elegíveis à equipe, **When** o admin abre **Novo Período**, **Then** o campo de pessoa lista esses fornecedores **pelo nome** (não fica vazio nem só com IDs).
2. **Given** a página de Férias aberta, **When** o usuário consulta filtro, tabela, avisos e textos de ajuda, **Then** os rótulos visíveis usam **Fornecedor** (não “Colaborador”).
3. **Given** o filtro por pessoa na listagem, **When** o usuário abre o seletor, **Then** vê a mesma listagem de nomes de fornecedores elegíveis.
4. **Given** um visualizador, **When** acessa Férias, **Then** consulta a listagem e o card de folha em somente leitura; não cria nem edita períodos.

---

### User Story 2 - Direito a férias após 1 ano da data de entrada (Priority: P1)

O direito a férias de um fornecedor elegível é determinado pela **data de entrada (admissão)** no cadastro: ao completar **12 meses** a partir dessa data, ele passa a ter direito ao período aquisitivo (padrão **30 dias** no primeiro registro do ano de gozo, alinhado ao fluxo CLT já comunicado na tela). Antes de completar 1 ano (ou sem data de admissão), o sistema **alerta** e só grava com direito normal se o admin **confirmar override**.

**Why this priority**: A lógica de negócio original do módulo; sem ela o cálculo e o planejamento de RH ficam incorretos.

**Independent Test**: Usar um fornecedor com admissão há mais de 1 ano e outro com menos de 1 ano; conferir direito sugerido / bloqueio informativo no Novo Período.

**Acceptance Scenarios**:

1. **Given** um fornecedor com data de entrada há **12 meses ou mais**, **When** o admin abre o primeiro período do ano para ele, **Then** o sistema reconhece direito a férias (padrão 30 dias no primeiro registro do ano, editável como hoje no fracionamento).
2. **Given** um fornecedor com data de entrada há **menos de 12 meses**, **When** o admin tenta registrar período de férias, **Then** o sistema alerta que ainda não completou 1 ano; se o admin **confirmar o override**, o período pode ser gravado com direito normal (padrão 30 no primeiro registro do ano).
3. **Given** um fornecedor **sem** data de entrada cadastrada, **When** o admin tenta criar período, **Then** o sistema alerta a ausência da data; se o admin **confirmar o override**, o período pode ser gravado com direito normal (padrão 30 no primeiro registro do ano).
4. **Given** fracionamento (segundo período no mesmo fornecedor/ano), **When** o admin cria parcela adicional, **Then** o direito anual **não** é somado de novo; aplica-se o saldo restante do ano (comportamento já estabelecido no módulo).

---

### User Story 3 - Datas de início e término opcionais (Priority: P1)

No formulário de novo ou edição de período, **Data Início** e **Data Fim** (término) são **opcionais**. O usuário pode salvar só com dias tirados (e demais campos obrigatórios), sem preencher as datas. Se preencher as duas e o intervalo for válido, os dias tirados podem ser sugeridos a partir das datas; se preencher só uma, o salvamento permanece permitido e não se calcula intervalo completo.

**Why this priority**: O usuário pediu restaurar o comportamento opcional; forçar datas quebra o fluxo operacional.

**Independent Test**: Criar período só com fornecedor, ano e dias tirados, sem datas; editar e gravar com sucesso.

**Acceptance Scenarios**:

1. **Given** o formulário com fornecedor e ano preenchidos, **When** o admin deixa início e término vazios e informa dias tirados, **Then** consegue salvar.
2. **Given** início e fim preenchidos com intervalo válido, **When** o admin altera as datas, **Then** dias tirados podem ser atualizados pela contagem inclusiva (início e fim contam), ainda permitindo ajuste manual.
3. **Given** início e fim preenchidos com fim anterior ao início, **When** o admin tenta salvar, **Then** o sistema impede o salvamento até corrigir ou limpar uma das datas.
4. **Given** apenas uma das datas preenchida, **When** o admin salva, **Then** o período é gravado sem exigir a outra data.

---

### User Story 4 - Salário e card Total da Folha (Priority: P2)

A página de Férias volta a exibir o **salário** do fornecedor (valor vindo do cadastro) como **coluna na listagem** e como **campo somente leitura no formulário**, e um **card “Total da Folha”** com a soma dos salários de **todos** os fornecedores elegíveis à equipe **ativos**. O filtro de fornecedor restringe essa soma ao selecionado; o filtro de **ano não altera** o Total da Folha.

**Why this priority**: Restaura informação financeira usada no acompanhamento da folha junto às férias; secundário à listagem e ao direito funcionar.

**Independent Test**: Abrir Férias com fornecedores que têm salário; conferir coluna e campo no modal; conferir o card com a soma correta; filtrar por um fornecedor e conferir o total filtrado.

**Acceptance Scenarios**:

1. **Given** um fornecedor com salário cadastrado, **When** o usuário vê a listagem de períodos, **Then** a coluna de salário exibe o valor (somente leitura, formatado em reais).
2. **Given** o formulário de Novo Período ou edição com um fornecedor selecionado que tem salário, **When** o modal está aberto, **Then** o salário aparece como campo somente leitura.
3. **Given** vários fornecedores elegíveis ativos com salário, **When** o filtro de fornecedor está em “Todos” (qualquer ano), **Then** o card **Total da Folha** mostra a soma desses salários.
4. **Given** o filtro em um fornecedor específico, **When** a página atualiza (inclusive mudando o ano), **Then** o card **Total da Folha** reflete apenas o salário daquele fornecedor (ou zero se ausente) e **não** muda só por causa do ano.
5. **Given** fornecedor sem salário no cadastro, **When** entra no total ou na coluna/formulário, **Then** exibe ausência/zero sem quebrar a UI.

---

### Edge Cases

- Listagem de nomes vazia por falha na fonte de fornecedores: mensagem clara de erro ao carregar; não deixar o seletor “mudo” sem feedback.
- Fornecedor inativo: não aparece na listagem para novos períodos; períodos históricos já salvos continuam visíveis na tabela.
- Fornecedor elegível sem nome preenchido: não deve ocorrer no cadastro válido; se ocorrer, exibir identificador legível e não esconder a opção.
- Completou 1 ano exatamente no dia corrente: considera direito adquirido a partir desse dia (inclusivo); sem aviso de override.
- Data de entrada no futuro ou ausente, ou menos de 12 meses: aviso de override; gravação só após confirmação explícita do admin.
- Admin cancela o override: período não é salvo; formulário permanece aberto com os dados.
- Filtro de ano na listagem de períodos: não altera o card Total da Folha.
- Salários nulos ou zero no Total da Folha: entram como zero na soma; o card permanece visível.
- Intervalo de datas invertido: bloqueia salvamento até correção ou limpeza.
- Fracionamento e saldo anual: mantêm as regras de um único direito anual e soma de dias tirados (incluindo pendentes), já definidas no módulo de férias.
- Papel visualizador: vê listagem, salários e Total da Folha; sem criar/editar/aprovar/excluir.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A página de Férias MUST exibir rótulos e textos voltados ao usuário com o termo **Fornecedor** no lugar de **Colaborador** (filtro, formulário, avisos, cabeçalhos de tabela/exportação visíveis e mensagens correlatas).
- **FR-002**: A página de Férias MUST carregar a listagem de pessoas a partir da fonte oficial de **fornecedores** elegíveis à equipe (ativos), de modo que o seletor de Novo Período e o filtro mostrem **nomes**.
- **FR-003**: O seletor de fornecedor no Novo Período / edição MUST NÃO ficar vazio quando existirem fornecedores elegíveis ativos no cadastro; falhas de carga MUST gerar feedback ao usuário.
- **FR-004**: O sistema MUST calcular elegibilidade de direito a férias com base na **data de entrada (admissão)** do fornecedor: direito adquirido somente após completar **12 meses** a partir dessa data.
- **FR-005**: Ao criar o primeiro período do ano para fornecedor com direito adquirido, o sistema MUST sugerir **30** dias de direito (editável), sem duplicar direito em fracionamentos do mesmo ano.
- **FR-006**: Fornecedor sem 12 meses completos ou sem data de entrada MUST gerar **aviso** ao criar/salvar período; o admin MUST poder **confirmar override** e gravar com direito normal (padrão 30 no primeiro registro do ano). Sem confirmação do override, o salvamento MUST NÃO concluir.
- **FR-007**: **Data Início** e **Data Fim** MUST ser opcionais no formulário; períodos sem as duas datas MUST poder ser salvos se os demais campos obrigatórios estiverem ok.
- **FR-008**: Quando ambas as datas estiverem preenchidas e o fim for anterior ao início, o sistema MUST impedir o salvamento até correção ou remoção de uma das datas.
- **FR-009**: Quando ambas as datas formarem intervalo válido, o sistema MUST poder sugerir dias tirados pela contagem de dias corridos inclusiva; o usuário MUST poder ajustar o valor manualmente.
- **FR-010**: A página MUST exibir o **salário** do fornecedor (somente leitura, a partir do cadastro) como **coluna na listagem** e como **campo somente leitura no formulário** de período.
- **FR-011**: A página MUST exibir um card **Total da Folha** com a soma dos salários de todos os fornecedores elegíveis à equipe ativos; o filtro de fornecedor MUST restringir a soma ao selecionado; o filtro de ano MUST NÃO alterar essa soma.
- **FR-012**: Aprovação, rejeição, exclusão, filtros por ano, papéis (admin altera; visualizador só consulta) e fracionamento/saldo anual existente MUST permanecerem, salvo o que esta spec altera (nomenclatura, fonte da listagem, elegibilidade por 1 ano, datas opcionais, salário e card).

### Key Entities

- **Fornecedor (elegível à equipe)**: Pessoa do cadastro unificado com dados de RH relevantes (nome, data de entrada/admissão, salário, ativo); selecionável em Férias.
- **Período de Férias**: Registro de gozo/fracionamento (ano, dias de direito, dias tirados, datas opcionais de início/término, status de aprovação) vinculado a um fornecedor.
- **Total da Folha (visão)**: Indicador agregado na página — soma dos salários dos fornecedores elegíveis ativos (independente de períodos de férias ou do ano filtrado); restringível pelo filtro de fornecedor.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes com fornecedores elegíveis ativos cadastrados, o seletor de Novo Período lista nomes em até 3 segundos após abrir o formulário (em uso normal da rede local).
- **SC-002**: 100% dos rótulos de pessoa na página de Férias usam “Fornecedor” (amostra: filtro, formulário, aviso de pendência, cabeçalho de exportação).
- **SC-003**: Em verificação com amostra de fornecedores (com e sem 12 meses desde a admissão), o aviso de override e o direito após confirmação estão corretos em 100% dos casos.
- **SC-004**: Admin consegue salvar um período novo **sem** datas de início/término em menos de 1 minuto, no primeiro fluxo completo.
- **SC-005**: O card Total da Folha confere com a soma manual dos salários dos elegíveis ativos (todos / um fornecedor filtrado / salário ausente) em 100% dos cenários; mudar só o ano não altera o total.
- **SC-006**: Visualizador consegue consultar listagem, salários e Total da Folha sem ações de escrita disponíveis.

## Assumptions

- “Trocar endpoint” significa passar a consumir a API/fonte de **fornecedores** alinhada ao cadastro unificado (em vez da nomenclatura/rota antiga de colaboradores na tela de Férias); detalhes de caminho técnico ficam para o plano.
- Continuam elegíveis em Férias apenas fornecedores **elegíveis à equipe** (ex-colaboradores / RH), conforme decisão já tomada na unificação de Fornecedores — não todos os fornecedores Spot/CNPJ puros.
- Data de entrada = campo de **admissão** do cadastro do fornecedor.
- Antes de completar 1 ano (ou sem data de admissão), o sistema **alerta** e exige **confirmação de override** do admin para gravar com direito normal; a listagem de nomes inclui esses fornecedores para transparência.
- Salário é **somente leitura** na página de Férias (coluna na listagem e campo no formulário); alteração continua no cadastro de Fornecedores.
- Total da Folha soma salários do cadastro de todos os elegíveis ativos (não só quem tem férias no ano; não calcula 1/3 constitucional nem provisão contábil nesta feature). O ano filtrado não entra no cálculo.
- Regras de saldo anual, fracionamento, pendências e dias corridos inclusivos do módulo atual de férias permanecem, exceto onde esta spec redefine elegibilidade por 1 ano e datas opcionais.
- Fora de escopo: redesenho completo do importador CSV além de alinhar rótulos/campos ao termo fornecedor quando visíveis ao usuário; novos tipos de cálculo trabalhista além do direito após 1 ano + 30 dias padrão.
