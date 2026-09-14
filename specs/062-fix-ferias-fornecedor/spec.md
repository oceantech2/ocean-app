# Feature Specification: Correção de Férias (fornecedor, listagem, direito e folha)

**Feature Branch**: `062-fix-ferias-fornecedor`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "FÉRIAS ainda não funciona. Onde está escrito colaborador mudar para fornecedor e trocar endpoint. Novo Período de Férias no campo colaborador não abre listagem com nomes. A lógica de cálculo era baseada na data de entrada do colaborador ao completar 1 ano ele tinha direito as férias. Voltar data de início e término opcional. Voltar salário. Voltar com card total da folha."

## Clarifications

### Session 2026-09-14

- Q: Quem deve aparecer no seletor de Férias (Novo Período e filtro)? → A: Todos os fornecedores **ativos** (a mesma lista da página Fornecedores, sem inativos).
- Q: Quem entra no card Total da Folha em Férias? → A: Somente fornecedores **Tipo Fixo** ativos (igual ao card da página Fornecedores).
- Q: Como o ano do período de férias é definido? → A: O sistema **sugere** o ano a partir da data de entrada; o admin pode alterar.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fornecedor na tela e nomes no Novo Período (Priority: P1)

O administrador abre a página de Férias. Em toda a tela voltada ao usuário (título, filtros, tabela, avisos, formulário, exportações visíveis), a palavra **colaborador** aparece como **fornecedor**. Ao criar **Novo Período**, o campo de pessoa deixa de ficar vazio ou sem nomes: abre uma listagem com os **nomes** de **todos os fornecedores ativos**, a **mesma lista da página Fornecedores** (sem inativos; inclui Fixo e Spot). O filtro da página usa a mesma listagem.

**Why this priority**: Sem nomes no seletor, o cadastro de período está inutilizável; a nomenclatura desalinha o produto após a unificação com Fornecedores. A correção anterior com o mesmo objetivo não chegou à operação.

**Independent Test**: Abrir Férias com fornecedores ativos cadastrados na página Fornecedores; abrir Novo Período; conferir os mesmos nomes no seletor; conferir rótulos “Fornecedor” na UI.

**Acceptance Scenarios**:

1. **Given** existem fornecedores ativos no cadastro (página Fornecedores), **When** o admin abre **Novo Período**, **Then** o campo de pessoa lista **os mesmos** fornecedores **pelo nome** (não fica vazio, não mostra só identificadores e não falha em silêncio).
2. **Given** a página de Férias aberta, **When** o usuário consulta título, filtro, tabela, avisos e textos de ajuda, **Then** os rótulos visíveis usam **Fornecedor** (não “Colaborador”).
3. **Given** o filtro por pessoa na listagem, **When** o usuário abre o seletor, **Then** vê a mesma listagem de nomes de fornecedores ativos da página Fornecedores.
4. **Given** um visualizador, **When** acessa Férias, **Then** consulta a listagem e o card de folha em somente leitura; não cria nem edita períodos.

---

### User Story 2 - Direito a férias após 1 ano da data de entrada (Priority: P1)

O direito a férias de um fornecedor (qualquer ativo selecionável) é determinado pela **data de entrada** no cadastro (campo operacional de início/admissão). Ao completar **12 meses** a partir dessa data, ele passa a ter direito ao período aquisitivo (padrão **30 dias** no primeiro registro do ano de gozo). Antes de completar 1 ano, ou sem data de entrada, o sistema **alerta** e só grava com direito normal se o admin **confirmar override**.

Na **criação** de período, ao selecionar o fornecedor, o sistema **sugere o ano** a partir da data de entrada: o **ano civil da data que completa 12 meses** (data de entrada + 12 meses). Se essa data já passou, sugere o **ano corrente**. Sem data de entrada, sugere o ano corrente. O admin **pode alterar** o ano antes de salvar. Na **edição**, o ano já gravado permanece (não é recalculado).

**Why this priority**: É a lógica de negócio original do módulo; sem ela o planejamento de RH fica incorreto.

**Independent Test**: Usar um fornecedor com entrada há mais de 1 ano e outro com menos de 1 ano; conferir ano sugerido, direito e o aviso de override no Novo Período; alterar o ano e salvar.

**Acceptance Scenarios**:

1. **Given** um fornecedor com data de entrada há **12 meses ou mais**, **When** o admin abre o primeiro período do ano para ele, **Then** o sistema reconhece direito a férias (padrão 30 dias no primeiro registro do ano, editável no fracionamento já existente) e **sugere o ano corrente** (a data que completa 12 meses já passou).
2. **Given** um fornecedor cuja data de entrada + 12 meses cai em um **ano futuro**, **When** o admin o seleciona no Novo Período, **Then** o campo ano é preenchido com esse ano futuro; o admin pode alterar; o aviso de override permanece porque ainda não completou 1 ano.
3. **Given** um fornecedor com data de entrada há **menos de 12 meses** (conclusão ainda no ano corrente), **When** o admin tenta registrar período, **Then** o sistema sugere o ano da conclusão dos 12 meses (ano corrente ou o ano dessa data) e alerta que ainda não completou 1 ano; se o admin **confirmar o override**, o período pode ser gravado com direito normal (padrão 30 no primeiro registro do ano).
4. **Given** um fornecedor **sem** data de entrada cadastrada, **When** o admin o seleciona no Novo Período, **Then** o ano sugerido é o **ano corrente**; o sistema alerta a ausência da data; se o admin **confirmar o override**, o período pode ser gravado com direito normal (padrão 30 no primeiro registro do ano).
5. **Given** o ano já sugerido, **When** o admin altera o ano manualmente e salva (com os demais campos ok), **Then** o valor informado pelo admin prevalece.
6. **Given** fracionamento (segundo período no mesmo fornecedor/ano), **When** o admin cria parcela adicional, **Then** o direito anual **não** é somado de novo; aplica-se o saldo restante do ano (comportamento já estabelecido no módulo).
7. **Given** edição de um período existente, **When** o admin abre o formulário, **Then** o ano gravado **não** é substituído pela sugestão.

---

### User Story 3 - Datas de início e término opcionais no período (Priority: P1)

No formulário de novo ou edição de período, **Data Início** e **Data Fim** (término) são **opcionais**. O usuário pode salvar só com dias tirados (e demais campos obrigatórios), sem preencher as datas. Se preencher as duas e o intervalo for válido, os dias tirados podem ser sugeridos a partir das datas; se preencher só uma, o salvamento permanece permitido e não se calcula intervalo completo.

**Why this priority**: Forçar datas quebra o fluxo operacional; o usuário pediu restaurar o comportamento opcional.

**Independent Test**: Criar período só com fornecedor, ano e dias tirados, sem datas; editar e gravar com sucesso.

**Acceptance Scenarios**:

1. **Given** o formulário com fornecedor e ano preenchidos, **When** o admin deixa início e término vazios e informa dias tirados, **Then** consegue salvar.
2. **Given** início e fim preenchidos com intervalo válido, **When** o admin altera as datas, **Then** dias tirados podem ser atualizados pela contagem inclusiva (início e fim contam), ainda permitindo ajuste manual.
3. **Given** início e fim preenchidos com fim anterior ao início, **When** o admin tenta salvar, **Then** o sistema impede o salvamento até corrigir ou limpar uma das datas.
4. **Given** apenas uma das datas preenchida, **When** o admin salva, **Then** o período é gravado sem exigir a outra data.

---

### User Story 4 - Salário e card Total da Folha (Priority: P2)

A página de Férias volta a exibir o **salário** do fornecedor (valor vindo do cadastro) como **coluna na listagem** e como **campo somente leitura no formulário**, e um **card “Total da Folha”** com a soma dos salários dos fornecedores **Tipo Fixo ativos** (igual ao card da página Fornecedores). Spot permanece no seletor de férias, mas **não** entra nessa soma. O filtro de fornecedor restringe a soma ao selecionado **somente se** ele for Fixo ativo; o filtro de **ano não altera** o Total da Folha.

**Why this priority**: Restaura a visão financeira usada no acompanhamento da folha junto às férias; secundário à listagem e ao direito funcionarem.

**Independent Test**: Abrir Férias com Fixo e Spot que têm salário; conferir coluna e campo no modal; conferir o card somando só Fixo; filtrar por um Fixo e por um Spot e conferir o total.

**Acceptance Scenarios**:

1. **Given** um fornecedor com salário cadastrado, **When** o usuário vê a listagem de períodos, **Then** a coluna de salário exibe o valor (somente leitura, formatado em reais).
2. **Given** o formulário de Novo Período ou edição com um fornecedor selecionado que tem salário, **When** o modal está aberto, **Then** o salário aparece como campo somente leitura.
3. **Given** vários fornecedores Fixo ativos com salário e ao menos um Spot com salário, **When** o filtro de fornecedor está em “Todos” (qualquer ano), **Then** o card **Total da Folha** mostra a soma **somente** dos salários dos Fixo ativos (Spot não entra).
4. **Given** o filtro em um fornecedor **Fixo** específico, **When** a página atualiza (inclusive mudando o ano), **Then** o card **Total da Folha** reflete apenas o salário daquele fornecedor (ou zero se ausente) e **não** muda só por causa do ano.
5. **Given** o filtro em um fornecedor **Spot**, **When** a página atualiza, **Then** o card **Total da Folha** mostra zero (Spot não entra na folha).
6. **Given** fornecedor Fixo sem salário no cadastro, **When** entra no total ou na coluna/formulário, **Then** exibe ausência/zero sem quebrar a tela.

---

### Edge Cases

- Listagem de nomes vazia por falha ao carregar fornecedores: mensagem clara de erro; o seletor não fica “mudo” sem feedback.
- Fornecedor inativo: não aparece na listagem para novos períodos; períodos históricos já salvos continuam visíveis na tabela.
- Fornecedor ativo sem nome preenchido: não deve ocorrer no cadastro válido; se ocorrer, exibir identificador legível e não esconder a opção.
- Fornecedor Spot ou sem salário: aparece no seletor; o direito após 1 ano e o override aplicam-se da mesma forma. Spot **não** entra no Total da Folha (filtro em Spot → total zero). Fixo sem salário conta como zero na soma.
- Completou 1 ano exatamente no dia corrente: considera direito adquirido a partir desse dia (inclusivo); sem aviso de override.
- Data de entrada no futuro, ausente, ou menos de 12 meses: aviso de override; gravação só após confirmação explícita do admin.
- Admin cancela o override: período não é salvo; formulário permanece aberto com os dados.
- Troca de fornecedor na criação: o ano é **re-sugerido** pela data de entrada do novo selecionado (o admin pode alterar de novo).
- Data de entrada no futuro: trata-se como ainda sem 12 meses (override); o ano sugerido é o ano civil de (data de entrada + 12 meses).
- Confirmação de override na **criação**; na edição de período já existente, não se exige novo override só por regravar.
- Filtro de ano na listagem de períodos: não altera o card Total da Folha.
- Salários nulos ou zero no Total da Folha: entram como zero na soma; o card permanece visível.
- Intervalo de datas invertido: bloqueia salvamento até correção ou limpeza.
- Fracionamento e saldo anual: mantêm as regras de um único direito anual e soma de dias tirados (incluindo pendentes), já definidas no módulo de férias.
- Papel visualizador: vê listagem, salários e Total da Folha; sem criar/editar/aprovar/excluir.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A página de Férias MUST exibir rótulos e textos voltados ao usuário com o termo **Fornecedor** no lugar de **Colaborador** (filtro, formulário, avisos, cabeçalhos de tabela/exportação visíveis e mensagens correlatas).
- **FR-002**: A página de Férias MUST carregar a listagem de pessoas com **todos os fornecedores ativos** da página Fornecedores (Fixo e Spot; sem inativos), de modo que o seletor de Novo Período e o filtro mostrem os **mesmos nomes**.
- **FR-003**: O seletor de fornecedor no Novo Período / edição MUST NÃO ficar vazio quando existirem fornecedores ativos no cadastro; falhas de carga MUST gerar feedback ao usuário.
- **FR-004**: O sistema MUST calcular elegibilidade de direito a férias com base na **data de entrada** do fornecedor: direito adquirido somente após completar **12 meses** a partir dessa data.
- **FR-005**: Ao criar o primeiro período do ano para fornecedor com direito adquirido, o sistema MUST sugerir **30** dias de direito (editável), sem duplicar direito em fracionamentos do mesmo ano.
- **FR-006**: Fornecedor sem 12 meses completos ou sem data de entrada MUST gerar **aviso** ao **criar** período; o admin MUST poder **confirmar override** e gravar com direito normal (padrão 30 no primeiro registro do ano). Sem confirmação do override, o salvamento MUST NÃO concluir. Na **edição** de período já existente, o sistema MUST NÃO exigir novo override só por regravar.
- **FR-007**: **Data Início** e **Data Fim** MUST ser opcionais no formulário de período; períodos sem as duas datas MUST poder ser salvos se os demais campos obrigatórios estiverem ok.
- **FR-008**: Quando ambas as datas estiverem preenchidas e o fim for anterior ao início, o sistema MUST impedir o salvamento até correção ou remoção de uma das datas.
- **FR-009**: Quando ambas as datas formarem intervalo válido, o sistema MUST poder sugerir dias tirados pela contagem de dias corridos inclusiva; o usuário MUST poder ajustar o valor manualmente.
- **FR-010**: A página MUST exibir o **salário** do fornecedor (somente leitura, a partir do cadastro) como **coluna na listagem** e como **campo somente leitura no formulário** de período.
- **FR-011**: A página MUST exibir um card **Total da Folha** com a soma dos salários dos fornecedores **Tipo Fixo ativos** (igual ao card da página Fornecedores). Spot MUST NÃO entrar na soma. Com filtro em “Todos”, a soma é de todos os Fixo ativos; com filtro em um Fixo, a soma é só o salário dele (ou zero); com filtro em um Spot, o card MUST mostrar zero. O filtro de ano MUST NÃO alterar essa soma.
- **FR-012**: Aprovação, rejeição, exclusão, filtros por ano, papéis (admin altera; visualizador só consulta) e fracionamento/saldo anual existente MUST permanecerem, salvo o que esta spec altera (nomenclatura, fonte da listagem, elegibilidade por 1 ano, datas opcionais, salário, card e sugestão de ano).
- **FR-013**: Na criação, ao selecionar o fornecedor, o sistema MUST **sugerir o ano** assim: se houver data de entrada, usar o **ano civil da data que completa 12 meses** (data de entrada + 12 meses); se essa data já passou, usar o **ano corrente**; se não houver data de entrada, usar o ano corrente. O admin MUST poder alterar o ano. Na edição, o ano gravado MUST ser preservado (sem recalcular a sugestão). Trocar o fornecedor na criação MUST reaplicar a sugestão.

### Key Entities

- **Fornecedor (ativo)**: Pessoa do cadastro unificado (Fixo ou Spot) com nome, data de entrada, salário e situação ativo/inativo; selecionável em Férias quando ativo.
- **Período de Férias**: Registro de gozo/fracionamento (ano, dias de direito, dias tirados, datas opcionais de início/término, status de aprovação) vinculado a um fornecedor.
- **Total da Folha (visão)**: Indicador agregado na página — soma dos salários dos fornecedores **Tipo Fixo ativos** (independente de períodos de férias, do ano filtrado e de fornecedores Spot); restringível pelo filtro de fornecedor (Spot filtrado → zero).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes com fornecedores ativos cadastrados na página Fornecedores, o seletor de Novo Período lista os mesmos nomes em até 3 segundos após abrir o formulário (em uso normal da rede local).
- **SC-002**: 100% dos rótulos de pessoa na página de Férias usam “Fornecedor” (amostra: filtro, formulário, aviso de pendência, cabeçalho de exportação visível).
- **SC-003**: Em verificação com amostra de fornecedores (com e sem 12 meses desde a data de entrada; com e sem data de entrada; conclusão dos 12 meses no passado vs no futuro), o ano sugerido, o aviso de override e o direito após confirmação estão corretos em 100% dos casos; o admin consegue alterar o ano sugerido e gravar.
- **SC-004**: Admin consegue salvar um período novo **sem** datas de início/término em menos de 1 minuto, no primeiro fluxo completo.
- **SC-005**: O card Total da Folha confere com a soma manual dos salários dos **Tipo Fixo ativos** (todos / um Fixo filtrado / Spot filtrado = zero / salário ausente) em 100% dos cenários; mudar só o ano não altera o total; Spot com salário não infla a soma quando o filtro está em “Todos”.
- **SC-006**: Visualizador consegue consultar listagem, salários e Total da Folha sem ações de escrita disponíveis.

## Assumptions

- Esta spec é a fonte de verdade atual: uma correção anterior com o mesmo objetivo (nomenclatura fornecedor, listagem de nomes, direito após 1 ano, datas opcionais, salário e Total da Folha) **não chegou à operação**; a página ainda apresenta “colaborador” e o Novo Período não lista nomes.
- “Trocar endpoint” significa passar a obter a listagem da **fonte oficial de Fornecedores** (a mesma do cadastro unificado), em vez da nomenclatura/rota antiga de colaboradores na tela de Férias; detalhes técnicos ficam para o plano.
- O seletor e o filtro de Férias usam **todos os fornecedores ativos** da página Fornecedores (Fixo e Spot). Inativos não entram para novos períodos; períodos históricos de inativos continuam visíveis na tabela.
- Data de entrada = campo de **início/admissão** do cadastro do fornecedor.
- Sugestão de ano na criação: ano civil de (data de entrada + 12 meses); se essa data já passou, ano corrente; sem data de entrada, ano corrente. O filtro de ano da página não precisa coincidir com a sugestão do formulário.
- Antes de completar 1 ano (ou sem data de entrada), o sistema **alerta** e exige **confirmação de override** do admin para gravar com direito normal; a listagem de nomes inclui esses fornecedores para transparência.
- Salário é **somente leitura** na página de Férias (coluna na listagem e campo no formulário); alteração continua no cadastro de Fornecedores.
- Total da Folha em Férias soma salários apenas de fornecedores **Tipo Fixo ativos** (não só quem tem férias no ano; Fixo sem salário conta como zero; Spot nunca entra; não calcula 1/3 constitucional nem provisão contábil). O ano filtrado não entra no cálculo. O critério coincide com o card Total da Folha da página Fornecedores; esta feature não altera o card daquela página.
- Regras de saldo anual, fracionamento, pendências e dias corridos inclusivos do módulo atual de férias permanecem, exceto onde esta spec redefine elegibilidade por 1 ano e datas opcionais.
- Fora de escopo: redesenho completo do importador em lote além de alinhar rótulos visíveis ao termo fornecedor; novos tipos de cálculo trabalhista além do direito após 1 ano + 30 dias padrão.
