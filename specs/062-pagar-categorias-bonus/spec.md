# Feature Specification: Contas a Pagar — Categoria Bônus e Catálogo Editável

**Feature Branch**: `062-pagar-categorias-bonus`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "CONTAS A PAGAR - Nova conta a pagar: Renomear categoria \"Comissões\" para \"Bônus\"; Em categorias poder além de adicionar uma nova, poder também excluir e editar; Em subcategoria RH poder adicionar uma nova, poder também excluir e editar"

## Clarifications

### Session 2026-09-14

- Q: Onde o rótulo Bônus deve aparecer? → A: Em toda a página Contas a Pagar (formulário, listagem, filtros e exportações)
- Q: Quais categorias de primeiro nível o admin pode editar e excluir? → A: Editar e excluir só as categorias criadas pelo admin (oficiais imutáveis)
- Q: O que o admin pode fazer com as subcategorias de RH? → A: Editar qualquer nome; excluir só as subcategorias criadas pelo admin
- Q: Depois de excluir a categoria ou subcategoria RH selecionada no formulário aberto, o que acontece nesse formulário? → A: Categoria volta a uma oficial válida; subcategoria RH excluída deixa o campo vazio
- Q: Na importação de Contas a Pagar, o nome antigo Comissões ainda vale para essa subcategoria? → A: Aceitar Bônus, Comissões e o rótulo composto anterior como a mesma subcategoria

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver e escolher a subcategoria RH "Bônus" (antes "Comissões") (Priority: P1)

Ao criar ou editar uma **conta a pagar** classificada em **Recursos Humanos**, o administrador vê a opção de subcategoria com o rótulo **Bônus** no lugar de **Comissões** (e no lugar de qualquer rótulo composto equivalente que o produto tenha usado para a mesma opção, como “Bônus & Comissão”). Contas já existentes nessa classificação passam a exibir **Bônus** na listagem, nos filtros, no formulário e nas exportações da página Contas a Pagar, sem reclassificação manual. A subcategoria distinta **Comissão** (singular) permanece com o rótulo **Comissão**.

**Why this priority**: Corrige a nomenclatura operacional no lançamento de despesa e evita misturar essa classificação com a página/módulo de Comissões da equipe.

**Independent Test**: Abrir Nova conta a pagar, escolher Recursos Humanos e confirmar que a lista de subcategorias mostra **Bônus** e não **Comissões**; confirmar que **Comissão** (singular) ainda aparece; conferir o mesmo rótulo **Bônus** na listagem, no filtro de subcategoria RH e na exportação da página Contas a Pagar; abrir uma conta antiga dessa classificação e ver **Bônus**. Dashboard e demais telas ficam fora desta verificação.

**Acceptance Scenarios**:

1. **Given** um administrador no formulário de nova conta a pagar, **When** seleciona a categoria **Recursos Humanos**, **Then** a lista de subcategorias inclui **Bônus** e **não** exibe o rótulo **Comissões** (nem “Bônus & Comissão”) para essa mesma opção.
2. **Given** a mesma lista de subcategorias RH, **When** o usuário observa as opções, **Then** a subcategoria **Comissão** (singular) continua disponível com esse rótulo, distinta de **Bônus**.
3. **Given** uma conta a pagar já existente classificada em RH nessa opção (antes chamada Comissões), **When** o usuário visualiza a listagem, o formulário de edição, o filtro ou a exportação da página Contas a Pagar, **Then** o rótulo exibido é **Bônus** (ex.: “Recursos Humanos / Bônus”).
4. **Given** um visualizador, **When** consulta contas com essa classificação, **Then** também vê o rótulo **Bônus** (somente leitura).
5. **Given** a página/módulo de Comissões da equipe, **When** o usuário navega por ela, **Then** o nome dessa página **não** muda nesta entrega.
6. **Given** uma importação de contas a pagar com Recursos Humanos e subcategoria **Bônus**, **Comissões** ou o rótulo composto anterior (“Bônus & Comissão”), **When** a linha é válida nos demais campos, **Then** a conta é aceita na **mesma** subcategoria; após importar, a página Contas a Pagar exibe **Bônus** (não o nome antigo da planilha).

---

### User Story 2 - Editar e excluir categorias de Contas a Pagar (Priority: P1)

Além de **adicionar** uma nova categoria (já disponível no formulário), o administrador pode **editar o nome** e **excluir** categorias **criadas por ele**, no próprio formulário de nova/edição de conta a pagar, junto ao seletor de Categorias. Categorias **padrão de fábrica** (ex.: Adm/Financeiro, Recursos Humanos, Impostos) são **imutáveis** nesta entrega — não se editam nem excluem. A exclusão exige confirmação explícita. Categoria em uso por contas existentes **não** pode ser excluída enquanto houver vínculos; o sistema informa o motivo. Nomes editados passam a aparecer imediatamente em formulários, filtros e listagens.

**Why this priority**: Sem edição e exclusão, o catálogo só cresce e nomes incorretos ficam permanentes.

**Independent Test**: Criar uma categoria de teste, renomeá-la e confirmar o novo nome no seletor; tentar editar/excluir uma categoria padrão (bloqueado); tentar excluir uma categoria vinculada a contas (bloqueado); excluir uma categoria sem vínculos (some do catálogo) e confirmar que o formulário aberto volta a uma categoria oficial válida.

**Acceptance Scenarios**:

1. **Given** um administrador no formulário de nova/edição de conta a pagar, **When** edita o nome de uma categoria **criada por ele** a partir do seletor de Categorias, **Then** o novo nome é gravado e aparece nos seletores, no filtro e na listagem.
2. **Given** uma categoria **criada pelo administrador** e **sem** contas vinculadas, **When** o administrador confirma a exclusão, **Then** a categoria deixa de aparecer para novas classificações e nos filtros.
3. **Given** uma categoria **criada pelo administrador** e **com** pelo menos uma conta vinculada, **When** o administrador tenta excluir, **Then** a exclusão é **recusada** com mensagem clara de que há contas usando a categoria.
4. **Given** uma categoria **padrão de fábrica**, **When** o administrador tenta editar ou excluir, **Then** a ação é **recusada** ou a opção não está disponível.
5. **Given** a ação de excluir (quando permitida), **When** o administrador inicia a exclusão, **Then** há confirmação antes de concluir (padrão do produto).
6. **Given** um visualizador, **When** acessa Contas a Pagar, **Then** **não** consegue adicionar, editar nem excluir categorias.
7. **Given** tentativa de renomear para um nome já existente (ignorando maiúsculas/minúsculas e espaços extras), **When** salva, **Then** o sistema rejeita com mensagem de nome duplicado.
8. **Given** o formulário aberto com uma categoria **criada pelo admin** selecionada e sem contas vinculadas, **When** o administrador confirma a exclusão dessa categoria, **Then** o seletor deixa de apontar para o item excluído e passa a uma **categoria oficial válida** (ex.: Adm/Financeiro); o formulário permanece aberto.

---

### User Story 3 - Gerenciar subcategorias de Recursos Humanos (adicionar, editar e excluir) (Priority: P1)

No formulário de conta a pagar, com a categoria **Recursos Humanos** selecionada, o administrador pode **adicionar** uma subcategoria RH, **editar o nome de qualquer** subcategoria RH (padrão de fábrica ou criada por ele, incluindo **Bônus** após o rename) e **excluir somente** as subcategorias **criadas pelo administrador**. Subcategorias padrão de fábrica **não** podem ser excluídas. Subcategoria criada pelo admin e em uso por contas **não** pode ser excluída enquanto houver vínculos. Nomes novos ou editados ficam disponíveis no seletor e no filtro de subcategoria RH.

**Why this priority**: Completa o ciclo de vida do catálogo RH no mesmo fluxo em que a despesa é classificada.

**Independent Test**: Criar subcategoria RH “Teste RH”, usá-la em uma conta, tentar excluir (bloqueado), editar o nome de uma padrão (ex.: Salário), tentar excluir Salário (bloqueado), remover o vínculo de “Teste RH” e excluir com sucesso.

**Acceptance Scenarios**:

1. **Given** um administrador no formulário de conta a pagar com categoria **Recursos Humanos**, **When** adiciona uma nova subcategoria com nome válido junto ao seletor de subcategoria RH, **Then** ela aparece no seletor (já selecionada no formulário aberto) e no filtro da listagem.
2. **Given** uma subcategoria RH existente (padrão ou criada pelo admin), **When** o administrador edita o nome, **Then** contas e filtros passam a exibir o novo rótulo sem reclassificação manual.
3. **Given** uma subcategoria RH **criada pelo administrador** e **sem** contas vinculadas, **When** confirma a exclusão, **Then** ela some dos seletores e filtros.
4. **Given** uma subcategoria RH **criada pelo administrador** e **com** contas vinculadas, **When** tenta excluir, **Then** a exclusão é recusada com mensagem clara.
5. **Given** uma subcategoria RH **padrão de fábrica** (ex.: Salário, Bônus, Comissão, Retirada Sócios), **When** o administrador tenta excluir, **Then** a exclusão é **recusada**, independentemente de vínculos.
6. **Given** um visualizador, **When** usa Contas a Pagar, **Then** **não** gerencia subcategorias RH (somente leitura das opções existentes).
7. **Given** tentativa de criar ou renomear subcategoria RH com nome já usado (incluindo nomes de categorias de primeiro nível e demais subcategorias RH), **When** salva, **Then** o sistema rejeita por duplicidade.
8. **Given** o formulário aberto em Recursos Humanos com uma subcategoria **criada pelo admin** selecionada e sem contas vinculadas, **When** o administrador confirma a exclusão, **Then** o campo de subcategoria RH fica **vazio** até nova escolha; a categoria Recursos Humanos permanece selecionada e o salvamento continua exigindo subcategoria.

---

### Edge Cases

- Tentativa de excluir categoria ou subcategoria RH vinculada a contas: bloqueio com mensagem clara; nenhum dado de conta é apagado nem reclassificado automaticamente.
- Tentativa de editar ou excluir categoria padrão de fábrica: bloqueio ou ação indisponível.
- Tentativa de excluir subcategoria RH padrão de fábrica: bloqueio (exclusão só para as criadas pelo administrador).
- Nome vazio, só espaços, acima do limite de 20 caracteres (após remover espaços das pontas) ou com caractere fora do permitido (letras com acento, números, espaços, hífen e barra): rejeição com feedback claro.
- Nome duplicado (mesmo texto com capitalização diferente ou espaços extras nas pontas): rejeição.
- Contas com pendência de reclassificação (rótulos legado, ex.: “Comissões (legado)”): o rename **Comissões → Bônus** da taxonomia vigente **não** altera esses rótulos legado; o legado permanece identificável até o admin reclassificar.
- A subcategoria **Comissão** (singular) coexiste com **Bônus**; não há unificação automática de contas entre elas.
- Após cadastrar categoria ou subcategoria no formulário aberto, a opção nova fica selecionada automaticamente.
- Após excluir a categoria selecionada no formulário aberto: o seletor passa a uma categoria oficial válida (ex.: Adm/Financeiro); o formulário não fecha.
- Após excluir a subcategoria RH selecionada no formulário aberto: o campo de subcategoria fica vazio; Recursos Humanos permanece; salvar sem nova subcategoria continua bloqueado.
- Visualizador: vê rótulos atualizados e opções existentes, sem ações de catálogo.
- Importação com subcategoria **Bônus**, **Comissões** ou o rótulo composto anterior: linha aceita na mesma opção; a página passa a mostrar **Bônus**. **Comissão** (singular) continua sendo outra subcategoria e não é confundida com **Comissões**.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Nesta entrega, o rótulo **Bônus** (no lugar de **Comissões** ou de qualquer rótulo composto equivalente da mesma opção, como “Bônus & Comissão”) DEVE aparecer em **toda a página Contas a Pagar**: formulário de nova/edição, listagem, filtros e exportações. NÃO É obrigatório atualizar Dashboard, Impostos, Retiradas nem outras telas nesta entrega.
- **FR-002**: A subcategoria **Comissão** (singular) DEVE permanecer com o rótulo **Comissão**; NÃO DEVE ser unificada, removida ou renomeada automaticamente nesta entrega.
- **FR-003**: Contas já classificadas na antiga opção “Comissões” DEVEM continuar classificadas corretamente e DEVEM passar a exibir o rótulo **Bônus** sem ação manual do usuário.
- **FR-004**: O papel `admin` DEVE poder **adicionar**, **editar o nome** e **excluir** apenas categorias **criadas pelo administrador**, a partir do formulário de nova/edição de conta a pagar (junto ao seletor de Categorias). Categorias oficiais (padrão de fábrica) ficam fora dessas duas ações.
- **FR-005**: Categorias **padrão de fábrica** NÃO DEVEM ser editáveis nem excluíveis nesta entrega (nem por ação visível, nem após confirmação).
- **FR-006**: O papel `admin` DEVE poder **adicionar** subcategorias de Recursos Humanos, **editar o nome de qualquer** subcategoria RH (padrão de fábrica ou criada pelo admin, inclusive **Bônus** após o rename) e **excluir somente** subcategorias RH **criadas pelo administrador**, a partir do formulário de nova/edição de conta a pagar (junto ao seletor de subcategoria RH).
- **FR-007**: O sistema DEVE impedir exclusão de subcategorias RH **padrão de fábrica**, com mensagem clara ou opção indisponível.
- **FR-008**: Nesta entrega NÃO DEVE haver tela exclusiva de “gerenciar catálogo”; a gestão ocorre no fluxo do formulário de conta a pagar.
- **FR-009**: Exclusão de categoria ou subcategoria RH (quando permitida) DEVE exigir confirmação do usuário.
- **FR-010**: O sistema DEVE impedir exclusão de categoria ou de subcategoria RH criada pelo admin que esteja vinculada a uma ou mais contas a pagar, informando o motivo.
- **FR-011**: O sistema DEVE rejeitar nomes vazios, só espaços, acima de 20 caracteres (após remover espaços das pontas), com caractere não permitido ou duplicados (sem distinguir maiúsculas/minúsculas nem espaços nas pontas) ao criar ou editar categorias e subcategorias RH. Caracteres permitidos: letras (com acento), números, espaços, hífen e barra.
- **FR-012**: Após cadastro bem-sucedido no formulário aberto, a categoria ou subcategoria nova DEVE ficar automaticamente selecionada nesse formulário.
- **FR-012a**: Após exclusão bem-sucedida da **categoria** selecionada no formulário aberto, o seletor DEVE passar a uma **categoria oficial válida** (ex.: Adm/Financeiro); o formulário DEVE permanecer aberto.
- **FR-012b**: Após exclusão bem-sucedida da **subcategoria RH** selecionada no formulário aberto, o campo de subcategoria DEVE ficar **vazio** até nova escolha; a categoria Recursos Humanos DEVE permanecer selecionada. Salvar sem subcategoria DEVE continuar bloqueado.
- **FR-013**: O papel `visualizador` DEVE consultar categorias e subcategorias, mas NÃO DEVE criar, editar ou excluir.
- **FR-014**: Esta entrega NÃO DEVE alterar o nome da página/módulo de Comissões da equipe nem os registros daquela tela.
- **FR-015**: A importação de contas a pagar DEVE aceitar, para essa mesma subcategoria de RH, os nomes **Bônus**, **Comissões** e o rótulo composto anterior (“Bônus & Comissão”). Após a importação, a página Contas a Pagar DEVE exibir **Bônus**. O nome **Comissão** (singular) DEVE continuar mapeando a subcategoria distinta **Comissão**.

### Key Entities

- **Conta a Pagar**: despesa da página Contas a Pagar; inclui categoria de primeiro nível e, quando Recursos Humanos, uma subcategoria.
- **Categoria de Conta a Pagar**: classificação de primeiro nível; possui nome visível; pode ser **padrão de fábrica** (imutável nesta entrega) ou **criada pelo administrador** (editável e excluível se sem vínculos).
- **Subcategoria RH**: classificação de segundo nível válida só sob Recursos Humanos; possui nome visível (incluindo **Bônus** e **Comissão**); pode ser **padrão de fábrica** (editável, não excluível) ou **criada pelo administrador** (editável e excluível se sem vínculos).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em até 1 minuto, um administrador encontra e seleciona a subcategoria **Bônus** (e não “Comissões”) ao classificar uma nova conta a pagar de RH, e ainda vê **Comissão** (singular) como opção distinta.
- **SC-002**: 100% das contas já classificadas na antiga “Comissões” de RH passam a exibir **Bônus** na página Contas a Pagar (formulário, listagem, filtros e exportações) sem reclassificação manual.
- **SC-003**: Um administrador consegue criar, renomear e excluir (quando sem vínculos) uma categoria gerenciável em menos de 2 minutos por operação, sem suporte técnico.
- **SC-004**: Um administrador consegue criar, renomear qualquer subcategoria RH e excluir (quando criada por ele e sem vínculos) uma subcategoria RH em menos de 2 minutos por operação.
- **SC-005**: Em 100% das tentativas de exclusão com vínculos, o sistema bloqueia e nenhuma conta perde classificação.
- **SC-006**: Em 100% das sessões de visualizador na página Contas a Pagar, as ações de adicionar, editar e excluir categorias ou subcategorias RH não estão disponíveis.
- **SC-007**: Em 100% dos cadastros ou edições com nome vazio, inválido ou duplicado, o sistema bloqueia e informa o motivo; 0% desses nomes são gravados.
- **SC-008**: Em testes de importação, 100% das linhas com Recursos Humanos e subcategoria **Bônus**, **Comissões** ou o rótulo composto anterior são aceitas na mesma classificação; após importar, 100% dessas contas exibem **Bônus** na página Contas a Pagar.

## Assumptions

- O pedido de renomear **“Comissões”** refere-se à **subcategoria de Recursos Humanos** na página Contas a Pagar (a mesma opção que o time usa ao lançar essa despesa), não a uma categoria de primeiro nível e **não** à página/módulo de Comissões da equipe. O alcance confirmado do rótulo **Bônus** é **somente essa página** (formulário, listagem, filtros e exportações).
- O rótulo final é **Bônus** (não “Bônus & Comissão”). Se o produto ainda exibir “Comissões” ou “Bônus & Comissão” para essa opção, ambos devem passar a **Bônus**.
- A subcategoria **Comissão** (singular) permanece distinta e com o mesmo rótulo.
- Cadastro de categoria de primeiro nível já existe; esta feature **completa** o ciclo com editar e excluir, sem inventar um módulo separado.
- “Categorias” passíveis de editar/excluir são **somente** as **criadas pelo administrador**; categorias padrão de fábrica são **imutáveis** nesta entrega (confirmado).
- Subcategorias RH: **editar qualquer** nome (oficial ou criada pelo admin); **excluir somente** as criadas pelo administrador (confirmado).
- Gestão ocorre **no formulário de conta a pagar**, junto aos seletores — mesmo contexto do cadastro já existente.
- Regras de nome reutilizam o padrão já vigente de categorias cadastradas: até 20 caracteres após aparar espaços; letras (com acento), números, espaços, hífen e barra; unicidade case-insensitive.
- Exclusão com vínculos é **bloqueada** (não há reclassificação em massa nesta entrega). Após excluir item sem vínculos que estava selecionado no formulário, a categoria volta a uma oficial válida e a subcategoria RH excluída deixa o campo vazio (confirmado).
- Papéis existentes (`admin` / `visualizador`) são reutilizados.
- Rótulos legado de pendência de reclassificação (ex.: “Comissões (legado)”) permanecem distintos do rótulo novo **Bônus**.
- Importação de contas a pagar aceita **Bônus**, **Comissões** e o rótulo composto anterior como a **mesma** subcategoria; a página continua mostrando **Bônus**. **Comissão** (singular) permanece distinta (confirmado).

## Out of Scope

- Alterar a página/módulo de Comissões da equipe (menu, endereço, registros ou cálculos).
- Ordenação por ordem de lançamento em Contas a Pagar, Contas a Receber ou Fluxo de Caixa.
- Editar ou excluir categorias padrão de fábrica de primeiro nível.
- Excluir subcategorias RH padrão de fábrica.
- Tela ou página dedicada só para gerenciar o catálogo.
- Reclassificação em massa de contas existentes.
- Aplicar o mesmo catálogo livre a Contas a Receber ou a outros módulos.
- Atualizar o rótulo **Bônus** no Dashboard, Impostos, Retiradas ou em qualquer tela que não seja a página Contas a Pagar.
