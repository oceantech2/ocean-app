# Feature Specification: Página Comissões — nomenclatura, criação e filtro de período

**Feature Branch**: `044-comissoes-pagina`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "BÔNUS - Renomear página para Comissões; Remover botão Novo bônus; Inserir filtro de mês/trimestre"

## Clarifications

### Session 2026-08-28

- Q: Até onde a nomenclatura Comissões vale nesta página? → A: Toda a aplicação: também Dashboard, Contas a Pagar e demais telas que ainda digam Bônus.
- Q: Qual deve ser o recorte padrão ao abrir a página Comissões? → A: Ano civil corrente e recorte ano inteiro (visão atual da tela).
- Q: Com mês ou trimestre selecionado, o gráfico de evolução mensal deve fazer o quê? → A: Continua mostrando os 12 meses do ano; só listagem e total filtram.
- Q: O endereço da página deve mudar junto com o nome Comissões? → A: Novo endereço Comissões (`/comissoes`), sem redirecionamento; o endereço antigo deixa de abrir a tela.
- Q: Quem abre o endereço antigo deve ver o quê? → A: Endereço inexistente: não abre Comissões nem outra tela do produto.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reconhecer Comissões em todo o produto (Priority: P1)

O usuário autenticado (admin ou visualizador) deixa de ver o termo **Bônus** na interface. O menu, a página da listagem, Configurações e as demais telas que hoje rotulam esse conceito (incluindo Dashboard e Contas a Pagar) passam a usar **Comissões** (ou **Comissão**, no singular, quando fizer sentido gramatical). Qualificadores já existentes (por exemplo “(legado)”) permanecem, só o termo Bônus é trocado. Os registros e os cálculos não mudam; muda o nome visível.

**Why this priority**: Alinha o vocabulário de todo o produto ao termo usado na operação, evitando mistura de Bônus e Comissões entre telas.

**Independent Test**: Percorrer menu (`/comissoes`), página de listagem, Configurações, Dashboard e Contas a Pagar; confirmar nomenclatura Comissões; acessar o endereço antigo e confirmar que nenhuma tela do produto abre.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado com acesso à página, **When** consulta o menu lateral, **Then** o item exibe **Comissões** (não **Bônus**) e abre a listagem no endereço **`/comissoes`**.
2. **Given** a página aberta, **When** o usuário lê título, estado vazio, gráfico, formulário de edição, mensagens e exportação/importação, **Then** os textos visíveis usam comissão/comissões e não bônus.
3. **Given** um administrador na tela de Configurações (visibilidade de páginas ou permissões), **When** localiza esta página no catálogo, **Then** o rótulo e a descrição visíveis usam **Comissões**.
4. **Given** o Dashboard, **When** o usuário vê categorias ou rótulos que antes diziam **Bônus**, **Then** vê **Comissões** (ou **Comissão**) no lugar, com o mesmo significado numérico.
5. **Given** Contas a Pagar, **When** o usuário vê a categoria que hoje aparece como **Bônus (legado)** (ou equivalente), **Then** o termo Bônus foi substituído por Comissões, preservando o qualificativo “(legado)” se ele existir.
6. **Given** Auditoria ou outras telas que listem o nome desse tipo de registro para o usuário, **When** o rótulo era Bônus/Bonus, **Then** o usuário vê Comissão/Comissões.
7. **Given** papéis `admin` e `visualizador`, **When** cada um percorre as telas, **Then** ambos veem a mesma nomenclatura **Comissões**.
8. **Given** um usuário autenticado, **When** acessa o endereço antigo da tela (o que hoje corresponde a Bônus), **Then** a listagem de Comissões **não** abre, **não** há redirecionamento para `/comissoes`, Dashboard ou qualquer outra tela do produto — o endereço é tratado como inexistente.

---

### User Story 2 - Página sem o botão de nova comissão (Priority: P1)

O administrador deixa de ver o botão **Novo bônus** (ou equivalente **Nova comissão**). Não há, nesta tela, ação de criar um registro avulso por esse botão. Ações que já existiam e não foram pedidas para remoção — importação em lote, exportação, edição e exclusão de registros existentes — permanecem disponíveis conforme o papel.

**Why this priority**: Impede a criação pontual pela tela, que a operação não deseja mais oferecer neste ponto de entrada.

**Independent Test**: Entrar na página como admin e como visualizador; confirmar ausência do botão de novo registro; confirmar que importar/exportar (quando aplicável) e editar/excluir registros existentes ainda funcionam para o admin.

**Acceptance Scenarios**:

1. **Given** um administrador na página Comissões, **When** visualiza a área de ações do cabeçalho, **Then** não há botão **Novo bônus**, **Novo Bônus**, **Nova comissão** nem equivalente para criar um registro avulso.
2. **Given** um visualizador na mesma página, **When** visualiza o cabeçalho, **Then** também não vê esse botão (o visualizador já não criava registros).
3. **Given** um administrador, **When** tenta criar um registro avulso pela interface desta página, **Then** não encontra caminho equivalente ao botão removido (formulário de “novo” não é aberto por esse atalho).
4. **Given** um administrador com registros existentes, **When** usa editar ou excluir em um registro da listagem, **Then** essas ações continuam disponíveis e funcionam como hoje.
5. **Given** um administrador, **When** usa importar CSV (se a ação permanecer visível), **Then** a importação em lote continua disponível; a remoção restringe-se ao botão de novo registro avulso.

---

### User Story 3 - Filtrar comissões por mês ou trimestre (Priority: P1)

Na área de filtros da página (junto aos filtros já existentes de pessoa da equipe e de ano), o usuário escolhe um recorte de **mês** ou de **trimestre** dentro do ano selecionado. A listagem e o total do cabeçalho passam a mostrar apenas as comissões daquele recorte. O usuário também pode voltar a ver o **ano inteiro**.

**Why this priority**: Sem o recorte temporal, a nomenclatura nova não resolve a dificuldade de analisar comissões de um mês ou de um trimestre específico.

**Independent Test**: Com registros em meses de trimestres diferentes no mesmo ano, aplicar filtro de um mês, de um trimestre e de ano inteiro, e conferir listagem e total.

**Acceptance Scenarios**:

1. **Given** a página Comissões carregada, **When** o usuário olha a área de filtros, **Then** além de pessoa da equipe e ano existem controles para recorte **mês** ou **trimestre** (e a opção de ver o ano inteiro).
2. **Given** registros no mesmo ano em março e em agosto, **When** o usuário seleciona o mês de março, **Then** a listagem e o total do cabeçalho incluem apenas as comissões de março daquele ano.
3. **Given** registros em janeiro, fevereiro e abril do mesmo ano, **When** o usuário seleciona o 1º trimestre, **Then** a listagem e o total incluem janeiro a março daquele ano e não incluem abril.
4. **Given** um trimestre selecionado, **When** o usuário troca para um mês (ou vice-versa), **Then** vale apenas o recorte recém-escolhido (mês e trimestre não se combinam ao mesmo tempo).
5. **Given** um recorte de mês ou trimestre ativo, **When** o usuário escolhe ver o ano inteiro, **Then** a listagem e o total voltam a considerar todos os meses do ano selecionado (ainda respeitando o filtro de pessoa da equipe, se houver).
6. **Given** a primeira visita à página na sessão (sem recorte prévio), **When** a tela carrega, **Then** o ano padrão é o ano civil corrente e o recorte padrão é o **ano inteiro** (comportamento familiar da tela atual).
7. **Given** um mês ou trimestre sem registros, **When** o usuário aplica esse filtro, **Then** vê estado vazio compreensível e total zero (ou equivalente), sem quebrar o restante da tela.
8. **Given** papéis `admin` e `visualizador`, **When** cada um usa os filtros, **Then** ambos filtram da mesma forma; o visualizador permanece somente leitura.

---

### Edge Cases

- Mês e trimestre são recortes **alternativos** no mesmo ano: não é possível filtrar “março do 2º trimestre” como combinação; ao escolher um, o outro deixa de se aplicar.
- Trimestres seguem o calendário civil: 1º = janeiro–março, 2º = abril–junho, 3º = julho–setembro, 4º = outubro–dezembro, sempre no **ano** já selecionado.
- Trocar o **ano** mantém o tipo de recorte (ano inteiro, mês ou trimestre) e o valor escolhido (mesmo mês ou mesmo número de trimestre), agora no novo ano; se o valor não fizer sentido, o recorte volta para ano inteiro.
- O gráfico de evolução mensal continua mostrando os **12 meses do ano selecionado** (contexto anual); a listagem e o total do título é que seguem o recorte mês/trimestre/ano inteiro.
- Filtro de pessoa da equipe (quando preenchido) combina com o recorte temporal: só entram registros daquela pessoa **e** do período.
- Exportação (CSV/PDF), quando usada, deve refletir o mesmo conjunto visível na listagem filtrada (pessoa + ano + mês ou trimestre).
- A troca de nomenclatura cobre **toda a interface visível ao usuário**; qualificadores como “(legado)” permanecem. Identificadores internos não visíveis (nomes técnicos) não precisam ser apresentados ao usuário como Bônus.
- Remover o botão de novo registro **não** apaga dados existentes nem impede edição/exclusão/importação já oferecidas ao admin.
- O endereço da página passa a ser **`/comissoes`**. O endereço antigo é **inexistente**: não abre Comissões, não redireciona e não abre Dashboard nem outra tela do produto. Favoritos e links antigos deixam de funcionar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O menu de navegação MUST exibir o item desta página com o rótulo **Comissões** no lugar de **Bônus** e MUST levar ao endereço **`/comissoes`**.
- **FR-002**: O título principal da página MUST usar **Comissões** no lugar de **Bônus**.
- **FR-003**: Todos os textos visíveis ao usuário nesta página (incluindo estado vazio, gráfico, edição, mensagens e importação/exportação) MUST usar comissão/comissões, sem o termo **bônus**.
- **FR-004**: A página MUST NOT exibir botão ou atalho equivalente a **Novo bônus** / **Nova comissão** para criar um registro avulso.
- **FR-005**: A remoção do botão de novo registro MUST NOT retirar do administrador a edição, a exclusão nem a importação em lote já existentes nesta página.
- **FR-006**: A área de filtros MUST oferecer recorte temporal de **mês** ou de **trimestre** dentro do ano selecionado, além da opção de **ano inteiro**.
- **FR-007**: Mês e trimestre MUST ser recortes mutuamente exclusivos: só um deles (ou o ano inteiro) vale por vez.
- **FR-008**: Com mês selecionado, a listagem e o total do cabeçalho MUST incluir somente registros daquele mês e ano (e da pessoa da equipe, se o filtro de pessoa estiver ativo).
- **FR-009**: Com trimestre selecionado, a listagem e o total do cabeçalho MUST incluir somente registros dos três meses civis daquele trimestre no ano selecionado (1º = jan–mar, 2º = abr–jun, 3º = jul–set, 4º = out–dez).
- **FR-010**: Com ano inteiro selecionado, a listagem e o total MUST considerar todos os meses do ano filtrado (comportamento equivalente ao atual, só com ano e pessoa).
- **FR-011**: O recorte padrão na primeira carga da sessão MUST ser ano civil corrente + ano inteiro.
- **FR-012**: O gráfico de evolução mensal MUST continuar representando os 12 meses do **ano** selecionado, independentemente do recorte mês/trimestre da listagem.
- **FR-013**: Usuários `admin` e `visualizador` MUST ver a mesma nomenclatura e os mesmos filtros; o visualizador permanece somente leitura.
- **FR-014**: Toda a interface visível ao usuário MUST substituir o termo **Bônus**/**bônus** (e o equivalente **Bonus** quando esse for o rótulo mostrado) por **Comissões**/**Comissão**, inclusive Dashboard, Contas a Pagar, Configurações, Auditoria e demais telas que hoje exibam esse nome. Qualificadores já existentes (ex.: “(legado)”) MUST ser preservados. O recorte mês/trimestre continua restrito à página Comissões.
- **FR-015**: A página Comissões MUST ser acessível pelo endereço **`/comissoes`**. Configurações (visibilidade/permissões) MUST apontar para esse endereço.
- **FR-016**: O endereço antigo da tela (o que hoje abre Bônus) MUST ser tratado como inexistente: MUST NOT abrir a listagem de Comissões, MUST NOT redirecionar para `/comissoes` e MUST NOT abrir Dashboard nem qualquer outra tela do produto.

### Key Entities

- **Comissão**: Registro já existente na operação (antes chamado bônus na interface), associado a uma pessoa da equipe, a um mês/ano, a um valor e a dados de contexto (etapa, cliente, NF, percentual). Nesta feature o registro não muda de significado; muda o nome visível em todo o produto e o recorte em que aparece na página Comissões.
- **Recorte temporal**: Escolha do usuário entre ano inteiro, um mês civil ou um trimestre civil, sempre combinada com o ano (e, se houver, com a pessoa da equipe).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em uma revisão da interface (menu, página Comissões, Configurações, Dashboard, Contas a Pagar, Auditoria e demais telas com esse rótulo), 100% dos textos visíveis ao usuário que hoje dizem **Bônus**/**bônus**/**Bonus** passam a **Comissões**/**Comissão**, com 0 ocorrências visíveis do termo antigo.
- **SC-002**: Em uma revisão da área de ações do cabeçalho, o botão de novo registro avulso não aparece para admin nem para visualizador, em 100% das cargas da página.
- **SC-003**: Com um conjunto conhecido de registros em pelo menos dois meses de trimestres distintos, o usuário obtém a listagem e o total corretos do mês escolhido e do trimestre escolhido em menos de 30 segundos, sem treinar o recorte.
- **SC-004**: Um usuário que já usava a tela encontra o item **Comissões** no menu, chega a `/comissoes` e aplica um filtro de mês ou trimestre na primeira visita após a mudança, sem suporte adicional.
- **SC-005**: Em 100% dos acessos ao endereço antigo da tela de Bônus, não se abre Comissões nem outra tela do produto, e não ocorre redirecionamento.

## Assumptions

- A página atual de listagem (por pessoa da equipe, total, gráfico anual, filtros de pessoa e ano, importação/exportação, edição e exclusão para admin) é a base; esta feature altera a nomenclatura visível em **todo o produto**, remove o botão de novo registro avulso na página Comissões e acrescenta o recorte mês/trimestre nessa página.
- “Renomear” abrange todos os rótulos visíveis ao usuário que hoje dizem Bônus (página, menu, Configurações, Dashboard, Contas a Pagar, Auditoria e correlatos). Não altera o significado dos dados nem categorias internas além do nome mostrado.
- Endereço confirmado: a tela passa a **`/comissoes`**. O endereço antigo é inexistente (não abre Comissões nem outra tela do produto; sem redirecionamento).
- Criação avulsa some só pelo botão pedido; importação em lote, edição e exclusão de registros existentes continuam para o admin.
- Trimestres são civis (não fiscais nem móveis) e sempre relativos ao ano já filtrado.
- Recorte padrão confirmado: ano inteiro no ano civil corrente; mês e trimestre são escolhas do usuário, não o estado inicial.
- O gráfico anual permanece como visão dos 12 meses do ano selecionado (confirmado); quem precisa do detalhe do mês/trimestre usa a listagem e o total.
- Papéis `admin` e `visualizador` não mudam; só o visualizador continua sem alterar dados.
- Pessoas listadas nesta tela continuam sendo as da equipe elegível já usadas hoje; a unificação com Fornecedores de outras features não altera o recorte desta spec.
