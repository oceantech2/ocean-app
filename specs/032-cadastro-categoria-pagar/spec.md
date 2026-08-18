# Feature Specification: Contas a Pagar — Cadastro de Nova Categoria

**Feature Branch**: `032-cadastro-categoria-pagar`

**Created**: 2026-08-17

**Status**: Draft

**Input**: User description: "em contas a pagar deve ser possível cadastrar uma nova categoria"

## Clarifications

### Session 2026-08-17

- Q: De onde o administrador inicia o cadastro da nova categoria? → A: Somente a partir do campo Categorias no formulário de criar/editar conta a pagar (não há ação independente na listagem nesta entrega)
- Q: Após cadastrar, a categoria nova fica selecionada no formulário aberto? → A: Sim: a categoria recém-cadastrada fica automaticamente selecionada no campo Categorias da conta que está sendo criada ou editada
- Q: Qual a ordem das categorias no campo e no filtro? → A: Oficiais primeiro (ordem já vigente); cadastradas depois, em ordem alfabética pelo nome
- Q: Qual o tamanho máximo do nome da categoria cadastrada? → A: Até 20 caracteres (após remover espaços das pontas)
- Q: Quais caracteres são permitidos no nome? → A: Letras (com acento), números, espaços, hífen e barra

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar categoria nova sem sair de Contas a Pagar (Priority: P1)

Na página **Contas a Pagar**, o administrador cadastra uma **nova categoria de primeiro nível** (além da taxonomia oficial já vigente). O cadastro **só** é iniciado a partir do campo **Categorias** no formulário de **criar ou editar** conta a pagar — não há botão ou tela de cadastro independente na listagem nesta entrega. Assim a categoria fica disponível no mesmo fluxo em que a despesa é classificada.

O nome informado pelo administrador é o rótulo que o time passa a ver no campo **Categorias**, na listagem e nos filtros.

**Why this priority**: Sem poder criar categoria no momento do lançamento, despesas novas ficam classificadas de forma forçada em um grupo existente, distorcendo a leitura gerencial.

**Independent Test**: Como admin, abrir o formulário de criar (ou editar) conta a pagar, cadastrar uma categoria a partir do campo Categorias com nome único (ex.: “Frota”) e confirmar que ela aparece nas opções; na listagem, confirmar que não há ação avulsa de cadastro; como visualizador, confirmar que o cadastro não está disponível.

**Acceptance Scenarios**:

1. **Given** um administrador no formulário de criar ou editar conta a pagar, **When** inicia o cadastro a partir do campo Categorias e informa um nome válido ainda não existente, **Then** a categoria é gravada e passa a aparecer nas opções de Categorias.
2. **Given** o administrador acabou de cadastrar a categoria no formulário aberto, **When** o cadastro conclui com sucesso, **Then** o campo Categorias dessa conta fica **selecionado** com a categoria nova (não permanece vazio nem na categoria anterior) e o admin pode salvar a conta com essa classificação.
3. **Given** um visualizador no formulário de consulta (somente leitura) ou na listagem, **When** observa o campo Categorias e as ações da página, **Then** vê as categorias (incluindo as já cadastradas) mas **não** encontra ação de cadastrar categoria.
4. **Given** o administrador no cadastro, **When** tenta gravar sem nome (ou só com espaços), **Then** o sistema impede e informa que o nome é obrigatório.
5. **Given** o administrador informa um nome com mais de 20 caracteres (após remover espaços das pontas), **When** tenta gravar a categoria, **Then** o sistema impede e informa o limite de 20 caracteres; nada é cadastrado.
6. **Given** um administrador na listagem de Contas a Pagar (formulário de conta fechado), **When** procura cadastrar categoria, **Then** não encontra ação independente de cadastro fora do campo Categorias do formulário de criar/editar.

---

### User Story 2 - Usar a categoria cadastrada na classificação, filtro e consultas (Priority: P1)

Depois de cadastrada, a categoria nova se comporta como as demais categorias de primeiro nível **sem subcategoria**: o administrador classifica contas com ela; qualquer usuário autenticado filtra a listagem por ela; a visão de **custo por categoria** passa a ter fatia própria para essa categoria quando houver despesas classificadas nela.

**Why this priority**: Cadastrar só tem valor se a categoria entrar no ciclo operacional (lançar, filtrar, ler custo).

**Independent Test**: Cadastrar categoria, lançar ao menos uma conta nela, filtrar a listagem por essa categoria e conferir a fatia correspondente no custo por categoria.

**Acceptance Scenarios**:

1. **Given** uma categoria cadastrada pelo admin, **When** o administrador salva uma conta classificada nela, **Then** a listagem exibe essa categoria na conta.
2. **Given** contas em várias categorias, **When** o usuário filtra pela categoria cadastrada, **Then** vê apenas as contas dessa categoria.
3. **Given** ao menos uma conta na categoria cadastrada, **When** o usuário consulta custo por categoria no período em que a despesa entra, **Then** a categoria aparece como fatia própria (não some nem é agrupada em “outros” sem identificação).
4. **Given** uma conta classificada na categoria nova, **When** o administrador edita a conta, **Then** a categoria permanece selecionável e pode ser trocada para qualquer outra categoria vigente (oficiais ou cadastradas).
5. **Given** categorias oficiais e ao menos duas cadastradas (ex.: “Zebra” e “Frota”), **When** o usuário abre o campo Categorias ou o filtro, **Then** vê primeiro as oficiais na ordem vigente (Adm/Financeiro … Impostos) e, em seguida, as cadastradas em ordem alfabética (Frota antes de Zebra).

---

### User Story 3 - Impedir nomes inválidos ou duplicados (Priority: P2)

O sistema não aceita uma categoria cujo nome já exista entre as categorias oficiais ou entre as já cadastradas, ignorando diferenças só de maiúsculas/minúsculas e espaços extras nas pontas. Também não aceita nomes que coincidam com uma **subcategoria oficial de Recursos Humanos** (para não misturar primeiro nível com subnível de RH).

**Why this priority**: Nomes duplicados quebram filtro, relatórios e a confiança na classificação.

**Independent Test**: Tentar cadastrar “Marketing”, “marketing”, “ Salário ”, um nome com mais de 20 caracteres, um nome com emoji/pontuação e um nome já cadastrado; todas as tentativas devem ser recusadas com feedback claro; um nome distinto de até 20 caracteres só com letras (com acento), números, espaços, hífen ou barra deve ser aceito.

**Acceptance Scenarios**:

1. **Given** a taxonomia oficial vigente, **When** o administrador tenta cadastrar uma categoria com o mesmo nome de uma oficial (ex.: Marketing, Impostos, Recursos Humanos), **Then** o sistema recusa e explica que o nome já existe.
2. **Given** uma categoria já cadastrada chamada “Frota”, **When** tenta cadastrar “frota” ou “ Frota ”, **Then** o sistema recusa como duplicata.
3. **Given** as subcategorias oficiais de RH (Salário, Bônus, Comissão, Retirada Sócios), **When** tenta cadastrar uma categoria de primeiro nível com um desses nomes, **Then** o sistema recusa.
4. **Given** um nome válido e único, **When** o administrador confirma o cadastro, **Then** a categoria é criada uma única vez e o usuário recebe confirmação de sucesso.
5. **Given** o administrador informa um nome com caractere fora do permitido (ex.: pontuação, emoji ou sublinhado), **When** tenta gravar, **Then** o sistema recusa e explica que só letras (com acento), números, espaços, hífen e barra são aceitos.

---

### Edge Cases

- Nome vazio ou só espaços: cadastro bloqueado.
- Nome com mais de 20 caracteres (depois de remover espaços das pontas): cadastro bloqueado com mensagem clara sobre o limite.
- Nome com caractere fora de letras (com acento), números, espaços, hífen e barra: cadastro bloqueado com mensagem clara.
- Nome duplicado (oficial, já cadastrado ou subcategoria oficial de RH), inclusive com variação de capitalização ou espaços nas pontas: cadastro bloqueado com mensagem clara.
- Visualizador: nunca cadastra categoria.
- Administrador na listagem com formulário fechado: não há cadastro de categoria fora do campo Categorias do formulário de criar/editar.
- Categoria recém-criada: já entra na lista de opções, no filtro e, com despesas, no custo por categoria, sem exigir recarregar a sessão além do retorno do próprio cadastro. No formulário aberto que originou o cadastro, a categoria nova fica selecionada automaticamente.
- Contas já existentes: permanecem com a categoria anterior; nada é reclassificado automaticamente.
- Importação de contas a pagar: linhas com a categoria cadastrada (nome exato da categoria vigente) são aceitas; categoria inexistente continua rejeitada na linha.
- Telas Impostos e Retiradas: continuam recortando só Impostos e RH / Retirada Sócios; uma categoria nova **não** entra nesses recortes só por existir.
- Tentativa de cadastrar subcategoria (incluindo subcategoria nova de RH ou de outra categoria): **fora desta entrega** — o fluxo oferece apenas categoria de primeiro nível, sem subcategoria.
- Categorias oficiais da taxonomia vigente **não** podem ser apagadas, ocultadas nem renomeadas por este fluxo.
- Ordem no campo Categorias e no filtro: bloco das oficiais na ordem já vigente, depois bloco das cadastradas em ordem alfabética pelo nome (sem misturar os dois blocos).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: No formulário de criar ou editar conta a pagar, o papel `admin` DEVE poder cadastrar uma nova **categoria de primeiro nível** a partir do campo **Categorias**, informando um nome. A listagem da página NÃO DEVE oferecer ação independente de cadastro de categoria nesta entrega.
- **FR-002**: O papel `visualizador` NÃO DEVE poder cadastrar, alterar nem remover categorias.
- **FR-003**: Após o cadastro bem-sucedido, a nova categoria DEVE aparecer imediatamente nas opções do campo **Categorias** (criar e editar conta a pagar) e no filtro da listagem. No formulário que originou o cadastro, o campo Categorias DEVE ficar **automaticamente selecionado** com a categoria recém-criada (substitui valor vazio ou a categoria que estava escolhida).
- **FR-004**: Contas a pagar DEVEM poder ser classificadas com a categoria cadastrada. Categorias cadastradas NÃO DEVEM exigir subcategoria para salvar.
- **FR-005**: O nome da categoria DEVE ser obrigatório. O sistema DEVE recusar nome vazio ou composto só de espaços. Após remover espaços das pontas, o nome DEVE ter no máximo **20 caracteres** e conter **somente** letras (incluindo acentos), números, espaços, hífen e barra. Qualquer outro caractere ou excesso de tamanho DEVE recusar o cadastro com feedback claro.
- **FR-006**: O sistema DEVE recusar cadastro cujo nome coincida (sem distinguir maiúsculas/minúsculas e espaços nas pontas) com: (a) qualquer categoria oficial vigente; (b) qualquer categoria já cadastrada; (c) qualquer subcategoria oficial de Recursos Humanos.
- **FR-007**: A visão de custo por categoria DEVE incluir despesas classificadas em categorias cadastradas pelo usuário como fatia identificável pelo nome da categoria.
- **FR-008**: A importação de contas a pagar DEVE aceitar o nome de categorias cadastradas vigentes da mesma forma que aceita as oficiais. Linha com categoria inexistente DEVE continuar rejeitada.
- **FR-009**: Cadastro de categoria NÃO DEVE alterar a classificação de contas já gravadas.
- **FR-010**: Este fluxo NÃO DEVE permitir cadastrar subcategorias, nem criar subcategorias sob a categoria nova.
- **FR-011**: Este fluxo NÃO DEVE permitir excluir, ocultar ou renomear as categorias da taxonomia oficial. Excluir ou renomear categorias cadastradas pelo usuário fica **fora desta entrega**.
- **FR-012**: Impostos e Retiradas NÃO DEVEM passar a incluir categorias cadastradas automaticamente; os recortes atuais dessas telas permanecem.
- **FR-013**: No campo Categorias (criar/editar) e no filtro da listagem, o sistema DEVE listar primeiro as categorias oficiais na ordem vigente (Adm/Financeiro, Operações, Marketing, Comercial, Recursos Humanos, Benefícios, Tecnologia, Impostos) e, em seguida, as categorias cadastradas em ordem alfabética pelo nome.

### Key Entities

- **Conta a Pagar**: Despesa da página Contas a Pagar; inclui a categoria de classificação (oficial ou cadastrada).
- **Categoria oficial**: Conjunto vigente de primeiro nível definido pela taxonomia já em uso (Adm/Financeiro, Operações, Marketing, Comercial, Recursos Humanos, Benefícios, Tecnologia, Impostos), com subcategorias somente sob Recursos Humanos.
- **Categoria cadastrada**: Categoria de primeiro nível criada pelo administrador; identificada pelo nome (até 20 caracteres após trim; só letras com acento, números, espaços, hífen e barra); sem subcategorias.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um administrador cadastra uma categoria nova com nome válido e a seleciona em uma conta a pagar em menos de 2 minutos no fluxo padrão, sem suporte técnico.
- **SC-002**: Em 100% dos cadastros com nome vazio, com mais de 20 caracteres, com caractere não permitido, duplicado (oficial, já cadastrado ou subcategoria oficial de RH) ou equivalente por capitalização/espaços, o sistema bloqueia e informa o motivo; 0% desses nomes são gravados.
- **SC-003**: Em 100% das sessões de visualizador na página Contas a Pagar, a ação de cadastrar categoria não está disponível.
- **SC-004**: Após um cadastro bem-sucedido no formulário aberto, 100% dos casos deixam a categoria nova **já selecionada** nesse formulário e também disponível para criar/editar e filtrar em seguida, sem o admin cadastrá-la de novo.
- **SC-005**: 100% das contas classificadas na categoria cadastrada aparecem no filtro correspondente e na fatia identificável de custo por categoria do período; 0% dessas despesas somam em outra categoria só por a nova não ser oficial.
- **SC-006**: 100% das contas existentes antes do cadastro mantêm a classificação anterior (0% reclassificadas automaticamente).
- **SC-007**: Em 100% das aberturas do campo Categorias e do filtro, a ordem observada é: oficiais na sequência vigente, depois cadastradas em ordem alfabética (0% de oficiais misturadas no bloco das cadastradas).

## Assumptions

- A taxonomia oficial vigente (feature de taxonomia de Contas a Pagar) **permanece** e continua disponível; esta feature **acrescenta** categorias de primeiro nível, não substitui o conjunto oficial.
- “Cadastrar uma nova categoria” significa criar categoria de **primeiro nível sem subcategoria**, no mesmo papel das oficiais que não são Recursos Humanos.
- O cadastro ocorre **somente a partir do campo Categorias** no formulário de criar/editar conta a pagar, não em módulo separado nem por ação avulsa na listagem nesta entrega.
- Papéis existentes (`admin` / `visualizador`) são reutilizados: só admin cadastra.
- Unicidade de nome é **case-insensitive** e ignora espaços no início/fim; o nome gravado é o texto informado pelo admin após remover espaços das pontas (sem alterar o restante), com no máximo 20 caracteres nesse texto já aparado, usando só letras (com acento), números, espaços, hífen e barra.
- Ordem de exibição: oficiais primeiro na ordem da taxonomia vigente; cadastradas depois, alfabéticas pelo nome gravado. Esta regra não altera a ordem interna das oficiais.
- Não há limite máximo de categorias cadastradas nesta entrega além do razoável para uso interno (dezenas, não milhares).
- Importação, listagem, filtro e custo por categoria passam a reconhecer categorias cadastradas; Impostos e Retiradas não mudam o critério de recorte.
- Lançamento manual, status pago/pendente, exclusão individual e a ausência de exclusão em massa permanecem como estão.

## Out of Scope

- Ação independente de cadastro de categoria na listagem (fora do formulário de criar/editar).
- Cadastrar, editar ou excluir **subcategorias** (inclusive novas subcategorias de Recursos Humanos).
- Renomear, desativar ou excluir categorias oficiais ou cadastradas.
- Reordenar a taxonomia oficial.
- Aplicar o cadastro livre de categorias a Contas a Receber ou a outros módulos que não usem as categorias de Contas a Pagar.
- Conversão em massa ou reclassificação automática de contas existentes para a categoria nova.
- Redesign do Dashboard, Impostos ou Retiradas além do necessário para a categoria cadastrada aparecer no custo por categoria.
