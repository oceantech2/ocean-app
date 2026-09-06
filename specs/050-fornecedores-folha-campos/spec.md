# Feature Specification: Fornecedores — campos opcionais de PF, período, salário e total da folha

**Feature Branch**: `050-fornecedores-folha-campos`

**Created**: 2026-09-06

**Status**: Draft

**Input**: User description: "FORNECEDOR - Tirar obrigatoriedade de preenchimento em CNPJ > Pessoa física do CNPJ > Data de Nascimento e CPF. Voltar com data de inicio e termino, mas não sendo obrigatórios. Voltar com campo de valor de salário. Voltar card total folha de apenas Tipo fixo"

## Clarifications

### Session 2026-09-06

- Q: Para quais fornecedores o formulário deve exibir Salário, Data de início e Data de término? → A: Todos os fornecedores (Fixo e Spot, novos e legados), campos opcionais.
- Q: Na seção Pessoa física do CNPJ, Nome e Endereço devem continuar obrigatórios? → A: Nome e Endereço continuam obrigatórios; só CPF e Data de Nascimento são opcionais.
- Q: Como devem se chamar os campos de período no formulário? → A: Rótulos **Data de início** / **Data de término** (mesmo dado das antigas admissão/desligamento).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pessoa física do CNPJ sem exigir CPF e data de nascimento (Priority: P1)

Ao cadastrar ou editar um fornecedor com **Documento = CNPJ**, o administrador continua vendo a seção **Pessoa física do CNPJ**. Nessa seção, **Nome** e **Endereço** permanecem **obrigatórios**. Os campos **CPF** e **Data de Nascimento** passam a ser **opcionais**: o registro pode ser gravado sem preenchê-los. Se o administrador informar CPF ou data de nascimento, o sistema valida o formato/valor; se deixar em branco, a gravação segue normalmente (respeitando Nome, Endereço e os demais campos obrigatórios do cadastro).

**Why this priority**: Remove bloqueio operacional no cadastro de fornecedor PJ quando o responsável ainda não tem CPF ou data de nascimento disponíveis, mantendo identificação mínima do responsável.

**Independent Test**: Criar fornecedor CNPJ com Nome e Endereço da PF, sem CPF e sem data de nascimento, e confirmar gravação; tentar gravar sem Nome ou sem Endereço e confirmar recusa; informar CPF inválido e confirmar recusa.

**Acceptance Scenarios**:

1. **Given** Documento = **CNPJ** no formulário, **When** o administrador visualiza a seção Pessoa física do CNPJ, **Then** **Nome** e **Endereço** aparecem como obrigatórios e **CPF** e **Data de Nascimento** aparecem **sem** indicação de obrigatoriedade.
2. **Given** Documento = **CNPJ** com Nome e Endereço da pessoa física válidos e **sem** CPF nem Data de Nascimento, **When** o administrador grava (demais campos do cadastro ok), **Then** o registro é aceito e os campos opcionais ficam vazios na edição.
3. **Given** Documento = **CNPJ** sem Nome ou sem Endereço da pessoa física, **When** o administrador tenta gravar, **Then** o sistema recusa com mensagem clara.
4. **Given** Documento = **CNPJ** com CPF da pessoa física informado, **When** o CPF é inválido, **Then** o sistema recusa a gravação com mensagem clara.
5. **Given** Documento = **CNPJ** com Data de Nascimento da pessoa física informada, **When** a data é futura ou inválida, **Then** o sistema recusa a gravação.
6. **Given** um fornecedor CNPJ já gravado sem CPF/data de nascimento da PF, **When** o administrador completa esses campos depois e grava, **Then** os valores persistem e reaparecem na edição.

---

### User Story 2 - Data de início e data de término opcionais (Priority: P1)

No formulário de criação ou edição de **qualquer** fornecedor (novo ou existente, Fixo ou Spot, legado ou não), o administrador volta a ter os campos **Data de início** e **Data de término** (rótulos canônicos desta feature; equivalem operacionalmente às antigas datas de admissão/desligamento, sem segundo par de campos). Ambos são **opcionais**: é possível gravar sem preencher um ou ambos. Quando preenchidos, os valores persistem e reaparecem na edição.

**Why this priority**: Restaura o período de vínculo operacional do fornecedor sem forçar preenchimento incompleto.

**Independent Test**: Criar fornecedor sem datas; editar outro preenchendo só início; preencher início e término e confirmar persistência; tentar término anterior ao início e confirmar recusa.

**Acceptance Scenarios**:

1. **Given** o formulário de novo ou edição de fornecedor, **When** o administrador visualiza os campos, **Then** existem **Data de início** e **Data de término**, ambos sem obrigatoriedade.
2. **Given** formulário sem data de início e sem data de término, **When** o administrador grava com os demais campos válidos, **Then** o registro é aceito.
3. **Given** apenas data de início preenchida, **When** grava, **Then** o valor persiste e a data de término permanece vazia.
4. **Given** data de início e data de término preenchidas, **When** a data de término é **anterior** à de início, **Then** o sistema recusa a gravação com mensagem clara.
5. **Given** um visualizador, **When** abre o registro, **Then** vê as datas (quando existirem) e **não** consegue alterá-las.

---

### User Story 3 - Campo de valor de salário no cadastro (Priority: P1)

No formulário de criação ou edição de **qualquer** fornecedor (novo ou existente, Fixo ou Spot, legado ou não), o administrador volta a ter o campo **Salário** (valor monetário). O campo é **opcional**: o fornecedor pode ser gravado sem salário. Quando informado, o valor persiste, reaparece na edição e fica disponível para o card de total da folha (quando aplicável ao Tipo).

**Why this priority**: Sem salário no cadastro, o total da folha de fornecedores Fixo não pode ser calculado nem mantido.

**Independent Test**: Criar fornecedor Fixo com salário; criar Spot sem salário; reabrir e confirmar valores; informar valor negativo e confirmar recusa.

**Acceptance Scenarios**:

1. **Given** o formulário de fornecedor (criação ou edição), **When** o administrador visualiza os campos, **Then** existe o campo **Salário**, sem obrigatoriedade.
2. **Given** salário informado com valor válido (≥ 0), **When** grava, **Then** o valor persiste e reaparece na edição.
3. **Given** salário em branco, **When** grava com demais campos válidos, **Then** o registro é aceito sem valor de salário.
4. **Given** salário informado com valor negativo, **When** tenta gravar, **Then** o sistema recusa com mensagem clara.
5. **Given** um visualizador, **When** consulta o registro, **Then** vê o salário (quando existir) e **não** consegue alterá-lo.

---

### User Story 4 - Card Total da folha somente Tipo Fixo (Priority: P1)

Na página de **Fornecedores**, o usuário volta a ver um card **Total da folha** que exibe a soma dos salários dos fornecedores **ativos** com **Tipo = Fixo**. Fornecedores **Spot**, inativos ou sem salário informado **não** entram na soma (salário vazio conta como zero / ausente). O card atualiza conforme a listagem de ativos Fixo muda (criação, edição de salário/tipo ou desativação).

**Why this priority**: Devolve a visão rápida de custo de folha dos fornecedores recorrentes, alinhada à classificação Fixo/Spot.

**Independent Test**: Ter um Fixo ativo com salário, um Spot com salário e um Fixo inativo; confirmar que o card soma só o Fixo ativo; alterar salário/tipo e ver o card refletir.

**Acceptance Scenarios**:

1. **Given** a página de Fornecedores aberta, **When** o usuário visualiza o cabeçalho/área de resumo, **Then** existe o card **Total da folha** com valor em moeda legível.
2. **Given** fornecedores ativos Tipo **Fixo** com salários preenchidos, **When** o card é exibido, **Then** o valor é a soma desses salários.
3. **Given** um fornecedor **Spot** ativo com salário preenchido, **When** o total é calculado, **Then** esse salário **não** entra na soma.
4. **Given** um fornecedor **Fixo** inativo com salário, **When** o total é calculado, **Then** esse salário **não** entra na soma.
5. **Given** um Fixo ativo sem salário, **When** o total é calculado, **Then** ele não altera a soma (contribui zero).
6. **Given** o administrador altera salário ou Tipo de um ativo (ex.: Fixo → Spot) ou desativa um Fixo, **When** a listagem/resumo atualiza, **Then** o card reflete o novo total sem exigir recarregar a página manualmente além do fluxo normal de atualização da tela.
7. **Given** um visualizador, **When** abre a página, **Then** vê o card **Total da folha** em somente leitura.

---

### Edge Cases

- Fornecedor CNPJ com **Nome** e **Endereço** da pessoa física preenchidos, mas sem CPF e sem Data de Nascimento: gravação permitida.
- Fornecedor CNPJ sem Nome ou sem Endereço da pessoa física: gravação recusada.
- CPF da pessoa física preenchido e duplicado em outro fornecedor ativo: recusa por duplicidade (mesma regra já usada quando o CPF era obrigatório).
- CPF da pessoa física em branco: não aplica checagem de duplicidade de CPF da PF.
- Data de início sem data de término: permitido (vínculo em aberto).
- Data de término sem data de início: permitido nesta feature (não bloqueia); se ambas existirem, término ≥ início.
- Salário zero (0): permitido e entra na soma como zero.
- Troca de Tipo de Fixo para Spot: o salário deixa de contar no Total da folha imediatamente após a atualização da tela.
- Troca de Spot para Fixo com salário: o valor passa a contar no Total da folha.
- Filtros de busca/cargo na listagem **não** alteram o Total da folha: o card considera o conjunto de ativos Fixo do cadastro (não só os filtrados na tabela).
- Demais campos de RH da feature 043 (cargo, benefício, histórico etc.) permanecem restritos a legados; esta feature **só** amplia salário e datas de início/término a todos os fornecedores.
- Não há rótulos “Admissão/Desligamento” nesta feature: a UI usa apenas **Data de início** e **Data de término**.
- Importação em lote: salário e datas, quando presentes na origem, são gravados; ausência não impede importação por esses campos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Com **Documento = CNPJ**, o sistema NÃO DEVE exigir **CPF** nem **Data de Nascimento** da seção Pessoa física do CNPJ para gravar o fornecedor.
- **FR-001a**: Com **Documento = CNPJ**, o sistema DEVE exigir **Nome** e **Endereço** da seção Pessoa física do CNPJ (não vazios) para gravar o fornecedor.
- **FR-002**: Com **Documento = CNPJ**, se **CPF** da pessoa física for informado, o sistema DEVE validar o CPF e impedir CPF inválido ou duplicado entre fornecedores ativos (quando preenchido).
- **FR-003**: Com **Documento = CNPJ**, se **Data de Nascimento** da pessoa física for informada, o sistema DEVE recusar data futura ou inválida.
- **FR-004**: O formulário de fornecedor DEVE exibir **Data de início** e **Data de término** (esses rótulos, não “Admissão/Desligamento”) para **todos** os fornecedores (Fixo e Spot, novos e legados), ambos opcionais — sem restringir a registros legados e sem criar um segundo par de datas.
- **FR-005**: Quando ambas as datas estiverem preenchidas, o sistema DEVE recusar gravação se a data de término for anterior à data de início.
- **FR-006**: O formulário de fornecedor DEVE exibir o campo **Salário** (valor monetário) para **todos** os fornecedores (Fixo e Spot, novos e legados), opcional, sem valor negativo — sem restringir a registros legados.
- **FR-007**: O sistema DEVE persistir e reapresentar na edição salário, data de início e data de término quando informados.
- **FR-008**: A página de Fornecedores DEVE exibir o card **Total da folha** com a soma dos salários dos fornecedores **ativos** com **Tipo = Fixo**.
- **FR-009**: Fornecedores Spot, inativos ou sem salário NÃO DEVEM incrementar o Total da folha (ausência de salário = zero).
- **FR-010**: O card Total da folha DEVE atualizar após criar, editar (salário/tipo) ou desativar/reativar fornecedores relevantes, no mesmo fluxo de atualização da listagem.
- **FR-011**: O visualizador DEVE consultar card e campos em somente leitura; apenas o administrador altera cadastro.
- **FR-012**: Demais regras já estabelecidas do cadastro unificado de Fornecedores (Tipo Fixo/Spot, documento, papéis, listagem) DEVEM permanecer, exceto onde esta feature relaxa ou restaura os campos acima.
- **FR-013**: Campos de RH além de salário e datas de início/término (cargo, benefício, histórico de cargo, etc.) DEVEM continuar restritos a registros legados conforme a feature 043; esta feature NÃO amplia esses demais campos a novos fornecedores.

### Key Entities

- **Fornecedor**: Cadastro unificado; passa a admitir **Salário** opcional, **Data de início** e **Data de término** opcionais para qualquer registro; **Tipo** (Fixo | Spot) continua classificando inclusão no Total da folha.
- **Pessoa física do CNPJ**: Dados do responsável quando Documento = CNPJ — **Nome** e **Endereço** obrigatórios; **CPF** e **Data de Nascimento** opcionais.
- **Total da folha**: Indicador de resumo na página de Fornecedores = soma dos salários dos fornecedores ativos Tipo Fixo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das tentativas de gravar fornecedor CNPJ com Nome e Endereço da PF válidos e sem CPF e sem Data de Nascimento da pessoa física (demais obrigatórios do cadastro ok), a operação é aceita.
- **SC-001a**: Em 100% das tentativas de gravar fornecedor CNPJ sem Nome ou sem Endereço da pessoa física, a operação é recusada com mensagem compreensível.
- **SC-002**: Em 100% das tentativas com CPF da pessoa física inválido (quando preenchido), a operação é recusada com mensagem compreensível.
- **SC-003**: Um administrador consegue gravar fornecedor informando só salário, só data de início, só data de término, ou nenhum desses campos, em menos de 2 minutos no fluxo normal de cadastro.
- **SC-004**: Em verificação com amostra controlada (Fixo ativo, Spot ativo, Fixo inativo), o valor do card **Total da folha** coincide com a soma manual dos salários apenas dos Fixo ativos em 100% dos casos.
- **SC-005**: Após alterar Tipo de um fornecedor de Fixo para Spot (ou o inverso) ou desativar um Fixo, o card reflete o novo total na mesma sessão de uso da página, sem passo extra fora do fluxo padrão de salvar/atualizar.
- **SC-006**: Usuários visualizadores veem o Total da folha e os campos restaurados, sem conseguir editá-los.

## Assumptions

- “Voltar com” data de início/término e salário significa restaurar esses campos no formulário unificado de Fornecedores para **todos** os registros (Fixo e Spot, novos e legados — não só ex-colaboradores), tornando-os opcionais. Isso prevalece sobre a restrição da feature 043 de campos de RH só em legados, **somente** para salário e datas de início/término.
- **Data de início** e **Data de término** são os rótulos canônicos do período de vínculo; reutilizam o mesmo dado das antigas datas de admissão/desligamento (sem campos duplicados).
- Na seção Pessoa física do CNPJ, **Nome** e **Endereço** permanecem obrigatórios; apenas **CPF** e **Data de Nascimento** são opcionais.
- Salário opcional para Fixo e Spot; apenas Fixo ativos entram no Total da folha.
- Total da folha considera fornecedores **ativos** no cadastro, independentemente de filtros de busca aplicados na tabela.
- Valor de salário ausente ou nulo não entra na soma; zero entra como zero.
- Papéis `admin` e `visualizador` seguem o padrão do Ocean App.
- Não há alteração de menu, rota `/fornecedores` nem da classificação Tipo Fixo/Spot nesta feature.
