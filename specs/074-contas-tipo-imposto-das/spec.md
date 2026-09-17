# Feature Specification: Contas a Pagar — Tipo Imposto / DAS

**Feature Branch**: `074-contas-tipo-imposto-das`

**Created**: 2026-09-16

**Status**: Draft

**Input**: User description: "a categoria de imposto deve virar um tipo igual fixo/ variavel, etnão agora será 3 fixo variavel Imposto / DAS e tudo que estiver em imposto deve migrar para esse novo tipo"

## Clarifications

### Session 2026-09-16

- Q: Quando o Tipo for Imposto / DAS, a conta ainda precisa de uma Categoria operacional? → A: Com Tipo Imposto / DAS, a categoria fica **opcional**
- Q: Na migração automática, o que fazer com a categoria das contas que hoje estão em Impostos? → A: Limpar a categoria (Tipo Imposto / DAS e **sem** categoria)
- Q: No custo por categoria / Dashboard, como tratar contas com Tipo Imposto / DAS? → A: Apenas **excluir** das fatias de custo por categoria (sem fatia “Impostos” no donut de categorias)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Classificar a despesa com três Tipos (Priority: P1)

No formulário de **Nova conta a pagar** (e na edição), o administrador informa o campo **Tipo** com exatamente três opções: **Fixo**, **Variável** e **Imposto / DAS**. O valor é obrigatório, persiste e aparece na listagem. O padrão ao abrir uma conta nova continua sendo **Variável**. O visualizador consulta o Tipo e não o altera.

**Why this priority**: Sem o terceiro Tipo, impostos e DAS continuam misturados na taxonomia de Categorias e o recorte fiscal fica incorreto.

**Independent Test**: Criar uma conta de cada Tipo; reabrir e confirmar persistência; tentar gravar sem Tipo e confirmar bloqueio; conferir o rótulo **Imposto / DAS** na listagem.

**Acceptance Scenarios**:

1. **Given** o formulário **Nova conta a pagar**, **When** o administrador visualiza o campo **Tipo**, **Then** as opções são exatamente **Fixo**, **Variável** e **Imposto / DAS**, com **Variável** pré-selecionado.
2. **Given** Tipo **Imposto / DAS** (ou Fixo, ou Variável) selecionado e demais dados válidos, **When** o administrador salva, **Then** o Tipo persiste e reaparece na edição e na listagem com o rótulo correspondente.
3. **Given** o formulário sem Tipo válido, **When** tenta salvar, **Then** o sistema bloqueia e informa que o Tipo é obrigatório.
4. **Given** um administrador editando uma conta, **When** troca entre Fixo, Variável e Imposto / DAS e salva, **Then** o novo Tipo prevalece.
5. **Given** um visualizador, **When** consulta, **Then** vê o Tipo (incluindo Imposto / DAS) e **não** o altera.

---

### User Story 2 - Remover Impostos da taxonomia de Categorias (Priority: P1)

A classificação **Impostos** deixa de ser uma categoria de primeiro nível. Nas opções de **Categorias** (formulário, filtro e listagem de novos lançamentos), o conjunto oficial passa a ser, nesta ordem: Adm/Financeiro, Operações, Marketing, Comercial, Recursos Humanos (com subcategorias já vigentes), Benefícios, Tecnologia — **sem** Impostos.

**Why this priority**: A categoria Impostos vira Tipo; manter as duas dimensões gera duplicidade e erro de classificação.

**Independent Test**: Abrir criar/editar conta e o filtro de categorias; confirmar que Impostos não aparece; salvar contas nas categorias restantes.

**Acceptance Scenarios**:

1. **Given** um administrador no formulário de conta a pagar, **When** abre Categorias, **Then** **não** encontra Impostos e vê as demais categorias oficiais na ordem vigente (sem Impostos).
2. **Given** o filtro de categorias na listagem, **When** o usuário observa as opções, **Then** Impostos **não** está disponível como filtro de categoria.
3. **Given** Tipo **Imposto / DAS** selecionado, **When** o administrador observa Categorias, **Then** pode deixar a categoria em branco **ou** escolher entre as categorias restantes (não Impostos); se escolher Recursos Humanos, a subcategoria de RH continua obrigatória.
4. **Given** Tipo **Fixo** ou **Variável**, **When** tenta salvar sem categoria, **Then** o sistema bloqueia (categoria continua obrigatória nesses Tipos).
5. **Given** um visualizador, **When** consulta categorias, **Then** não vê Impostos como categoria oficial.

---

### User Story 3 - Migrar contas da categoria Impostos para o Tipo Imposto / DAS (Priority: P1)

Todas as contas a pagar já gravadas com a categoria **Impostos** (incluindo variantes de rótulo legado equivalentes a imposto/impostos) **migram automaticamente** para o Tipo **Imposto / DAS**. Após a migração, essas contas deixam de depender da categoria Impostos para serem reconhecidas como imposto: o Tipo passa a ser a fonte da verdade. A categoria Impostos é **removida** do registro: as contas migradas ficam **sem** categoria operacional (editável depois, pois a categoria é opcional nesse Tipo).

**Why this priority**: Sem migração, o histórico fiscal some da leitura correta e a página Impostos fica vazia ou inconsistente.

**Independent Test**: Partir de contas com categoria Impostos; após a atualização, conferir Tipo Imposto / DAS, categoria vazia e presença na página Impostos; conferir que contas Fixo/Variável sem Impostos não mudam de Tipo.

**Acceptance Scenarios**:

1. **Given** contas existentes com categoria Impostos, **When** a feature entra em vigor, **Then** 100% delas passam a ter Tipo **Imposto / DAS**.
2. **Given** essas contas migradas, **When** o usuário abre a listagem ou a edição, **Then** vê Tipo **Imposto / DAS**, **sem** categoria Impostos e **sem** outra categoria preenchida automaticamente.
3. **Given** contas que já eram Fixo ou Variável e **não** tinham categoria Impostos, **When** a migração roda, **Then** o Tipo delas **não** muda para Imposto / DAS.
4. **Given** o administrador edita uma conta migrada, **When** preenche, limpa ou troca a categoria (opcional) e salva, **Then** o Tipo Imposto / DAS permanece até ser alterado explicitamente.

---

### User Story 4 - Página Impostos e leituras derivadas usam o Tipo (Priority: P2)

A página **Impostos** (e qualquer recorte mínimo que hoje depende da categoria Impostos — por exemplo, exclusão de impostos no custo por categoria) passa a considerar contas com Tipo **Imposto / DAS**, e **não** mais a categoria Impostos.

**Why this priority**: O valor operacional de migrar o Tipo só se completa se a tela Impostos e os recortes fiscais lerem a mesma regra.

**Independent Test**: Ter contas Tipo Imposto / DAS (migradas ou novas) e contas Fixo/Variável em outras categorias; abrir Impostos e confirmar que só as de Tipo Imposto / DAS entram; criar uma nova Imposto / DAS e vê-la na página.

**Acceptance Scenarios**:

1. **Given** contas com Tipo **Imposto / DAS**, **When** o usuário abre a página Impostos, **Then** essas contas aparecem no total e na listagem do período, independentemente da categoria operacional.
2. **Given** contas Fixo ou Variável sem Tipo Imposto / DAS, **When** consulta Impostos, **Then** elas **não** entram no recorte, mesmo que a descrição mencione imposto.
3. **Given** o texto de orientação da página Impostos, **When** o usuário lê como incluir um imposto, **Then** a orientação aponta para o Tipo **Imposto / DAS** (não para a categoria Impostos).
4. **Given** a visão de custo por categoria, **When** calculada, **Then** contas com Tipo **Imposto / DAS** são **excluídas** das fatias operacionais; **não** há fatia “Impostos” no donut de categorias (o recorte fiscal permanece na página Impostos).

---

### User Story 5 - Exportação e importação alinhadas ao novo Tipo (Priority: P3)

Exportações Excel/PDF de Contas a Pagar continuam incluindo a coluna **Tipo**, agora podendo exibir **Imposto / DAS**. A importação em lote **não** aceita mais a categoria Impostos; para gravar imposto/DAS, a linha deve informar o Tipo **Imposto / DAS** (categoria operacional opcional, se presente deve ser oficial e sem Impostos).

**Why this priority**: Evita reintroduzir a categoria Impostos pelo arquivo e mantém o histórico exportável legível.

**Independent Test**: Exportar listagem com os três Tipos; importar linha com categoria Impostos (rejeitar); importar linha com Tipo Imposto / DAS sem categoria (aceitar); importar com Tipo Imposto / DAS e categoria Adm/Financeiro (aceitar).

**Acceptance Scenarios**:

1. **Given** contas com os três Tipos na listagem, **When** o usuário exporta Excel ou PDF, **Then** a coluna Tipo mostra Fixo, Variável ou Imposto / DAS alinhado à tela.
2. **Given** uma linha de importação com categoria Impostos, **When** processada, **Then** a linha é rejeitada com erro identificável.
3. **Given** uma linha com Tipo Imposto / DAS e sem categoria (ou com categoria oficial válida, não Impostos), **When** importada, **Then** a conta é gravada com esse Tipo e a categoria informada (ou sem categoria).

---

### Edge Cases

- Conta com categoria Impostos e Tipo Fixo/Variável antes da migração: após migração, Tipo vira Imposto / DAS e a categoria é **limpa** (a categoria Impostos prevalece para decidir a migração).
- Conta já com algum valor legado “imposto” (singular) tratado como Impostos no produto: entra na mesma migração (Tipo Imposto / DAS, categoria limpa).
- Trocar Tipo de Imposto / DAS para Variável (ou Fixo): permitido; se a categoria estiver vazia, o sistema exige categoria antes de salvar; a conta deixa de aparecer na página Impostos.
- Recursos Humanos + Tipo Imposto / DAS: permitido se o admin escolher categoria RH; subcategoria de RH continua obrigatória nesse caso. Sem categoria, não há subcategoria.
- Tipo Imposto / DAS sem categoria: permitido gravar; listagem mostra Tipo e categoria vazia/traço conforme padrão do produto.
- Visualizador: somente leitura em Tipo, categorias e página Impostos.
- Importação com Tipo vazio: mantém o padrão já vigente (Variável), salvo se a regra de importação já exigir Tipo explícito — nesta feature, ausência de Tipo na importação continua recebendo Variável; categoria Impostos continua rejeitada.
- Filtro por Tipo na listagem: fora do escopo desta entrega (não é obrigatório criar filtro novo).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O campo **Tipo** da conta a pagar MUST oferecer exatamente três opções: **Fixo**, **Variável** e **Imposto / DAS**, obrigatório para gravar.
- **FR-002**: Em **Nova conta a pagar**, o Tipo MUST iniciar pré-selecionado como **Variável** (editável), inclusive após a introdução do terceiro valor.
- **FR-003**: O Tipo MUST ser persistido, visível na listagem e independente do Tipo do Fornecedor (Fixo/Spot).
- **FR-004**: A taxonomia oficial de Categorias MUST deixar de incluir **Impostos**. O conjunto de primeiro nível MUST ser: Adm/Financeiro, Operações, Marketing, Comercial, Recursos Humanos, Benefícios, Tecnologia (nessa ordem), mantendo as regras vigentes de subcategorias de RH.
- **FR-005**: O sistema MUST migrar automaticamente 100% das contas a pagar cuja categoria seja Impostos (ou equivalente legado de imposto/impostos) para Tipo **Imposto / DAS**.
- **FR-006**: Nas contas migradas pela FR-005, o sistema MUST remover Impostos como valor de categoria e MUST deixar a categoria operacional **vazia** (sem preencher Adm/Financeiro nem outra categoria automaticamente).
- **FR-006a**: Quando o Tipo for **Imposto / DAS**, a categoria operacional MUST ser **opcional** (pode gravar sem categoria). Quando o Tipo for **Fixo** ou **Variável**, a categoria MUST permanecer obrigatória. Se, com Tipo Imposto / DAS, o admin escolher Recursos Humanos, a subcategoria de RH MUST ser exigida. Ao mudar de Imposto / DAS para Fixo ou Variável com categoria vazia, o sistema MUST bloquear até informar uma categoria válida.
- **FR-007**: Contas que não estavam na categoria Impostos MUST conservar o Tipo Fixo ou Variável que já possuíam (não MUST ser convertidas para Imposto / DAS).
- **FR-008**: A página **Impostos** MUST listar e totalizar contas pelo Tipo **Imposto / DAS**, não pela categoria Impostos.
- **FR-009**: Onde o custo por categoria (ou equivalente) hoje excluía a categoria Impostos, o sistema MUST **excluir** contas com Tipo **Imposto / DAS** das fatias operacionais. MUST NOT manter nem recriar uma fatia “Impostos” no donut/visão de custo por categoria nesta feature. A orientação da página Impostos MUST passar a referir o Tipo **Imposto / DAS**.
- **FR-010**: Exportações Excel e PDF de Contas a Pagar MUST exibir o Tipo com os três valores possíveis, alinhados à listagem.
- **FR-011**: A importação de contas a pagar MUST rejeitar linhas com categoria Impostos; MUST aceitar Tipo **Imposto / DAS** com categoria oficial válida (sem Impostos) **ou** sem categoria.
- **FR-012**: Papel `admin` MUST poder criar/editar Tipo e categoria; papel `visualizador` MUST ter somente leitura.
- **FR-013**: Os cards Despesas Fixas e Despesas Variáveis do **Dashboard** MUST NOT mudar de regra nesta feature (permanece a classificação já vigente do Dashboard); o Tipo da conta a pagar continua valendo na página Contas a Pagar, na página Impostos e nos recortes mínimos desta spec.

### Key Entities

- **Conta a Pagar**: Despesa lançada; inclui Tipo (Fixo, Variável ou Imposto / DAS) e categoria operacional (sem Impostos).
- **Tipo da despesa**: Classificação Fixo, Variável ou Imposto / DAS da própria conta a pagar.
- **Categoria**: Classificação gerencial de primeiro nível sem Impostos; RH mantém subcategorias.
- **Conta de imposto / DAS**: Conta a pagar cujo Tipo é Imposto / DAS; alimenta a página Impostos e os recortes fiscais equivalentes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos formulários de criar/editar conta a pagar, o campo Tipo apresenta exatamente Fixo, Variável e Imposto / DAS.
- **SC-002**: Em 100% das tentativas de gravar sem Tipo, o sistema bloqueia com feedback claro.
- **SC-003**: Em 100% das contas que estavam na categoria Impostos antes da atualização, o Tipo passa a ser Imposto / DAS e a categoria fica vazia após a migração.
- **SC-004**: Em 100% das consultas à página Impostos após a migração, as contas exibidas são as de Tipo Imposto / DAS (0% dependência da categoria Impostos).
- **SC-005**: Em 100% dos fluxos de novo lançamento, a categoria Impostos não aparece nas opções de Categorias nem no filtro de categoria.
- **SC-006**: Administrador classifica uma conta nova como Imposto / DAS (só o Tipo, com ou sem categoria) em menos de 2 minutos no fluxo padrão, sem suporte técnico.
- **SC-007**: Em testes de importação, 100% das linhas com categoria Impostos são rejeitadas; linhas com Tipo Imposto / DAS (com ou sem categoria válida) são aceitas.
- **SC-008**: Visualizador consulta Tipo e página Impostos em 100% das sessões, com 0% de escrita nesse papel.
- **SC-010**: Na visão de custo por categoria, 100% das contas com Tipo Imposto / DAS ficam fora das fatias operacionais e 0% delas formam fatia “Impostos” no donut de categorias.

## Assumptions

- Esta feature **atualiza** o campo Tipo introduzido em Contas a Pagar (Fixo/Variável) e a taxonomia que ainda lista Impostos como categoria.
- O rótulo oficial do terceiro Tipo é **Imposto / DAS** (com barra e espaços como no pedido).
- Migração automática: categoria Impostos → Tipo Imposto / DAS e categoria **limpa** (sem categoria operacional). O admin pode preencher categoria depois, se quiser.
- Variantes legado de nome/código equivalentes a imposto/impostos entram na mesma migração.
- Contas novas com Tipo Imposto / DAS **podem** informar uma categoria operacional entre as restantes (não Impostos) ou gravar sem categoria.
- Página Impostos passa a filtrar por Tipo. No custo por categoria, contas Imposto / DAS são só **excluídas** das fatias operacionais — **sem** fatia “Impostos” no donut. Redesign amplo do Dashboard e novos agregados de impostos no Dashboard estão fora do escopo.
- Cards Fixas/Variáveis do Dashboard **não** passam a usar o Tipo da conta nesta entrega (mantém decisão já vigente da feature de campos Conta/Tipo).
- Demais métricas do Dashboard que não dependem da categoria Impostos de Contas a Pagar (ex.: impostos derivados de NF) permanecem como estão, salvo ajuste mínimo onde a fonte era explicitamente a categoria Impostos.
- Importação: categoria Impostos rejeitada; Tipo ausente na importação continua caindo em Variável, como já praticado, salvo linha que informe Imposto / DAS.
- Papéis `admin` e `visualizador` são reutilizados.
- Filtro novo por Tipo na listagem de Contas a Pagar não é exigido nesta entrega.

## Out of Scope

- Criar filtro de listagem por Tipo (Fixo / Variável / Imposto / DAS).
- Alterar a regra dos cards Despesas Fixas / Despesas Variáveis do Dashboard para consumir o Tipo da conta.
- Redesign completo da página Impostos ou do Dashboard além do ajuste mínimo (página Impostos por Tipo; excluir Imposto / DAS do custo por categoria).
- Criar ou manter fatia/agregado “Impostos” no donut de custo por categoria com base no Tipo.
- Novos tipos além dos três definidos.
- Manter Impostos simultaneamente como categoria e como Tipo.
- Aplicar o Tipo Imposto / DAS a Contas a Receber ou a outros módulos que não usem Contas a Pagar.
- Mudança no cadastro de Fornecedores (Tipo Fixo/Spot).
