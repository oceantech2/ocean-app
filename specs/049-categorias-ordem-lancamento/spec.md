# Feature Specification: Categorias de Contas a Pagar, Subcategorias RH e Ordenação por Lançamento

**Feature Branch**: `049-categorias-ordem-lancamento`

**Created**: 2026-09-06

**Status**: Draft

**Input**: User description: "CONTAS A PAGAR — Nova conta a pagar: Renomear categoria 'Comissões' para 'Bônus'; Em categorias poder além de adicionar uma nova, poder também excluir e editar; Em subcategoria RH poder adicionar uma nova, poder também excluir e editar. EM CONTAS A RECEBER, A PAGAR e FLUXO DE CAIXA poder filtrar por ordem de lançamento."

## Clarifications

### Session 2026-09-06

- Q: O que significa “filtrar por ordem de lançamento”? → A: **Ordenar** por momento de inclusão (mais antigos ↔ mais recentes), sem remover linhas dos demais filtros.
- Q: Escopo de editar/excluir subcategorias RH? → A: Editar **qualquer** nome; excluir **somente** as criadas pelo administrador.
- Q: Escopo de editar/excluir categorias (1º nível)? → A: Editar e excluir **somente** as criadas pelo administrador (padrão imutável).
- Q: O que fazer com a subcategoria “Comissão” (singular) e qual o rótulo final de “Comissões”? → A: Manter **Comissão** (singular) inalterada; renomear **Comissões → Bônus & Comissão**.
- Q: Onde editar/excluir categorias e subcategorias RH? → A: No formulário de conta a pagar (junto aos seletores de categoria/subcategoria RH).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver e escolher a subcategoria RH "Bônus & Comissão" (antes "Comissões") (Priority: P1)

Ao criar ou editar uma **conta a pagar** classificada em **Recursos Humanos**, o usuário vê a opção de subcategoria com o rótulo **Bônus & Comissão** no lugar de **Comissões**. Contas já existentes que estavam classificadas nessa subcategoria passam a exibir **Bônus & Comissão** em listagens, filtros, formulários e exportações da página Contas a Pagar, sem exigir reclassificação manual. A subcategoria distinta **Comissão** (singular) permanece com o rótulo **Comissão**.

**Why this priority**: Corrige a nomenclatura operacional pedida e evita confusão com o módulo/página de comissões da equipe.

**Independent Test**: Abrir o formulário de nova conta a pagar, escolher Recursos Humanos e confirmar que a lista de subcategorias mostra **Bônus & Comissão** e não **Comissões**; confirmar que **Comissão** (singular) ainda aparece; abrir uma conta antiga da classificação antiga "Comissões" e ver o rótulo **Bônus & Comissão**.

**Acceptance Scenarios**:

1. **Given** um administrador autenticado abrindo o formulário de nova conta a pagar, **When** seleciona a categoria **Recursos Humanos**, **Then** a lista de subcategorias inclui **Bônus & Comissão** e **não** exibe o rótulo **Comissões** para essa mesma opção.
2. **Given** a mesma lista de subcategorias RH, **When** o usuário observa as opções, **Then** a subcategoria **Comissão** (singular) continua disponível com esse rótulo (não unificada nem removida).
3. **Given** uma conta a pagar já existente classificada em RH na antiga subcategoria "Comissões", **When** o usuário visualiza a listagem ou o formulário de edição, **Then** o rótulo exibido é **Bônus & Comissão** (ex.: "Recursos Humanos / Bônus & Comissão").
4. **Given** o filtro de subcategoria RH na listagem de Contas a Pagar, **When** o usuário abre as opções, **Then** vê **Bônus & Comissão** no lugar de **Comissões**.
5. **Given** um visualizador, **When** consulta contas com essa classificação, **Then** também vê o rótulo **Bônus & Comissão** (somente leitura).

---

### User Story 2 - Editar e excluir categorias de Contas a Pagar (Priority: P1)

Além de **adicionar** uma nova categoria (já disponível), o administrador pode **editar o nome** e **excluir** apenas categorias **criadas por ele** (gerenciáveis), **no próprio formulário** de nova/edição de conta a pagar, junto ao seletor de categoria (mesmo contexto do fluxo atual de adicionar). Categorias **padrão de fábrica** (ex.: Adm/Financeiro, Recursos Humanos, Impostos) são **imutáveis** nesta entrega — não se editam nem excluem. A exclusão de categoria gerenciável exige confirmação explícita. Categorias gerenciáveis em uso por contas existentes **não** podem ser excluídas enquanto houver vínculos; o sistema informa o motivo de forma clara. Nomes editados passam a aparecer imediatamente em formulários, filtros e listagens.

**Why this priority**: Sem edição/exclusão, o catálogo só cresce e nomes incorretos ficam permanentes — dor operacional direta.

**Independent Test**: Criar uma categoria de teste, renomeá-la e confirmar o novo nome no seletor; tentar editar/excluir uma categoria padrão (bloqueado); tentar excluir uma categoria vinculada a contas (bloqueado); excluir uma categoria sem vínculos (deve sumir do catálogo).

**Acceptance Scenarios**:

1. **Given** um administrador no formulário de nova/edição de conta a pagar, **When** edita o nome de uma categoria **criada por ele** a partir do seletor de categoria, **Then** o novo nome é persistido e aparece nos seletores e na listagem de contas.
2. **Given** uma categoria **criada pelo administrador** e **sem** contas vinculadas, **When** o administrador confirma a exclusão, **Then** a categoria deixa de aparecer para novas classificações e nos filtros.
3. **Given** uma categoria **criada pelo administrador** e **com** pelo menos uma conta vinculada, **When** o administrador tenta excluir, **Then** a exclusão é **recusada** com mensagem clara de que há contas usando a categoria.
4. **Given** uma categoria **padrão de fábrica**, **When** o administrador tenta editar ou excluir, **Then** a ação é **recusada** ou a opção não está disponível.
5. **Given** a ação de excluir (quando permitida), **When** o administrador inicia a exclusão, **Then** há confirmação antes de concluir (padrão do produto).
6. **Given** um visualizador, **When** acessa Contas a Pagar, **Then** **não** consegue adicionar, editar nem excluir categorias.
7. **Given** tentativa de renomear para um nome já existente (ignorando maiúsculas/minúsculas e espaços extras), **When** salva, **Then** o sistema rejeita com mensagem de nome duplicado.

---

### User Story 3 - Gerenciar subcategorias de Recursos Humanos (adicionar, editar e excluir) (Priority: P1)

No contexto de Contas a Pagar, o administrador pode **adicionar** subcategorias de **Recursos Humanos**, **editar o nome de qualquer** subcategoria RH (padrão de fábrica ou criada pelo admin, incluindo **Bônus & Comissão** após o rename) e **excluir somente** as subcategorias **criadas pelo administrador**, **no próprio formulário** de nova/edição de conta a pagar, junto ao seletor de subcategoria RH (quando a categoria selecionada é Recursos Humanos). Subcategorias padrão de fábrica **não** podem ser excluídas. Subcategorias criadas pelo admin em uso por contas **não** podem ser excluídas enquanto houver vínculos. Nomes novos ou editados ficam disponíveis no formulário de conta e no filtro de subcategoria RH.

**Why this priority**: Completa o ciclo de vida do catálogo RH; hoje só se consome a lista fixa.

**Independent Test**: Criar subcategoria RH "Teste RH", usá-la em uma conta, tentar excluir (bloqueado), editar o nome de uma padrão (ex.: Salário), tentar excluir Salário (bloqueado), remover o vínculo de "Teste RH" e excluir com sucesso.

**Acceptance Scenarios**:

1. **Given** um administrador no formulário de conta a pagar com categoria **Recursos Humanos**, **When** adiciona uma nova subcategoria com nome válido junto ao seletor de subcategoria RH, **Then** ela aparece no seletor e no filtro da listagem.
2. **Given** uma subcategoria RH existente (padrão ou criada pelo admin), **When** o administrador edita o nome, **Then** contas e filtros passam a exibir o novo rótulo sem reclassificação manual.
3. **Given** uma subcategoria RH **criada pelo administrador** e **sem** contas vinculadas, **When** confirma a exclusão, **Then** ela some dos seletores e filtros.
4. **Given** uma subcategoria RH **criada pelo administrador** e **com** contas vinculadas, **When** tenta excluir, **Then** a exclusão é recusada com mensagem clara.
5. **Given** uma subcategoria RH **padrão de fábrica** (ex.: Salário, Bônus & Comissão), **When** o administrador tenta excluir, **Then** a exclusão é **recusada** (não é permitida), independentemente de vínculos.
6. **Given** um visualizador, **When** usa Contas a Pagar, **Then** **não** gerencia subcategorias RH (somente leitura das opções existentes).
7. **Given** tentativa de criar/renomear subcategoria RH com nome já usado, **When** salva, **Then** o sistema rejeita por duplicidade.

---

### User Story 4 - Ordenar por ordem de lançamento em Contas a Receber, Contas a Pagar e Fluxo de Caixa (Priority: P2)

Nas páginas **Contas a Receber**, **Contas a Pagar** e **Fluxo de Caixa**, o usuário pode ordenar a listagem pela **ordem de lançamento** (momento em que o registro foi incluído no sistema): mais antigos primeiro ou mais recentes primeiro. Essa ordenação convive com os filtros e demais ordenações já existentes em cada página; ao escolher ordem de lançamento, a listagem reflete essa sequência de forma estável e previsível.

**Why this priority**: Facilita auditoria operacional e conferência do que foi lançado primeiro/último, em três telas financeiras centrais.

**Independent Test**: Em cada uma das três páginas, com pelo menos dois lançamentos em horários/datas de criação distintos, ativar ordem de lançamento ascendente e descendente e confirmar a sequência.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado em **Contas a Pagar** com várias contas, **When** escolhe ordenar por **ordem de lançamento** (crescente ou decrescente), **Then** as linhas respeitam a sequência de inclusão no sistema.
2. **Given** o mesmo em **Contas a Receber**, **When** aplica ordem de lançamento, **Then** a listagem segue a sequência de inclusão.
3. **Given** o mesmo em **Fluxo de Caixa**, **When** aplica ordem de lançamento, **Then** os movimentos/lançamentos listados seguem a sequência de inclusão.
4. **Given** filtros ativos (ex.: mês, categoria, status), **When** o usuário ordena por ordem de lançamento, **Then** a ordenação se aplica ao **conjunto já filtrado** (não remove filtros).
5. **Given** um visualizador, **When** ordena por ordem de lançamento nas três páginas, **Then** obtém o mesmo resultado de leitura que o administrador.
6. **Given** dois lançamentos com o mesmo instante de inclusão (empate), **When** a listagem é ordenada por ordem de lançamento, **Then** o desempate é estável e previsível (ex.: identificador interno).

---

### Edge Cases

- Tentativa de excluir categoria ou subcategoria RH vinculada a contas: bloqueio com mensagem clara; nenhum dado de conta é apagado.
- Tentativa de editar ou excluir categoria padrão de fábrica: bloqueio ou ação indisponível.
- Tentativa de excluir subcategoria RH padrão de fábrica: bloqueio (exclusão permitida apenas para subcategorias criadas pelo administrador).
- Nome de categoria/subcategoria vazio, só espaços ou fora do tamanho mínimo/máximo já usado no produto: rejeição com feedback.
- Nome duplicado (mesmo texto com capitalização diferente): rejeição.
- Contas legadas/pendentes de reclassificação: o rename **Comissões → Bônus & Comissão** na taxonomia nova **não** altera rótulos legados exibidos como pendência (ex.: "Comissões (legado)"), salvo se o produto já unificar esses rótulos — legado permanece identificável.
- A subcategoria **Comissão** (singular) coexiste com **Bônus & Comissão**; não há unificação automática de contas entre elas.
- Página sem lançamentos: ordenar por ordem de lançamento mostra estado vazio, sem erro.
- Troca rápida entre ordenações (vencimento vs lançamento): a listagem atualiza de forma coerente sem misturar critérios.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exibir o rótulo **Bônus & Comissão** no lugar de **Comissões** para a subcategoria de Recursos Humanos correspondente, em formulários de nova/edição de conta a pagar, listagem, filtros e exportações da página Contas a Pagar.
- **FR-001a**: A subcategoria **Comissão** (singular) MUST permanecer com o rótulo **Comissão**; MUST NOT ser unificada, removida ou renomeada automaticamente nesta entrega.
- **FR-002**: Contas já classificadas na antiga subcategoria "Comissões" MUST continuar classificadas corretamente e MUST passar a exibir o rótulo **Bônus & Comissão** sem ação manual do usuário.
- **FR-003**: Administradores MUST poder **adicionar**, **editar o nome** e **excluir** apenas categorias **criadas pelo administrador** (gerenciáveis) de Contas a Pagar, **a partir do formulário** de nova/edição de conta a pagar (junto ao seletor de categoria).
- **FR-003a**: Categorias **padrão de fábrica** MUST NOT ser editáveis nem excluíveis nesta entrega.
- **FR-004**: Administradores MUST poder **adicionar** subcategorias de Recursos Humanos, **editar o nome de qualquer** subcategoria RH (padrão ou criada pelo admin) e **excluir somente** subcategorias RH **criadas pelo administrador**, **a partir do formulário** de nova/edição de conta a pagar (junto ao seletor de subcategoria RH).
- **FR-004a**: O sistema MUST impedir exclusão de subcategorias RH **padrão de fábrica**, com mensagem clara.
- **FR-004b**: Nesta entrega MUST NOT haver tela/modal separado exclusivo de “gerenciar catálogo”; a gestão ocorre no fluxo do formulário de conta a pagar.
- **FR-005**: Exclusão de categoria ou subcategoria RH (quando permitida) MUST exigir confirmação do usuário.
- **FR-006**: O sistema MUST impedir exclusão de categoria ou de subcategoria RH criada pelo admin que esteja vinculada a uma ou mais contas a pagar, informando o motivo.
- **FR-007**: O sistema MUST rejeitar nomes vazios ou duplicados (comparação sem diferenciar maiúsculas/minúsculas) ao criar ou editar categorias e subcategorias RH.
- **FR-008**: Visualizadores MUST consultar categorias e subcategorias, mas MUST NOT criar, editar ou excluir.
- **FR-009**: Nas páginas Contas a Receber, Contas a Pagar e Fluxo de Caixa, o usuário MUST poder **ordenar** (não filtrar/excluir linhas) a listagem por **ordem de lançamento** (crescente e decrescente). O pedido original “filtrar por ordem de lançamento” MUST ser tratado como essa ordenação.
- **FR-010**: A ordenação por ordem de lançamento MUST aplicar-se ao conjunto já filtrado pelos recortes existentes da página e MUST usar o momento de inclusão do registro no sistema como critério; MUST NOT introduzir um filtro adicional que remova linhas por quantidade ou intervalo de inclusão nesta entrega.
- **FR-011**: Em empate de momento de inclusão, a ordenação MUST permanecer estável (desempate previsível).

### Key Entities

- **Categoria de Conta a Pagar**: classificação de primeiro nível de uma despesa; possui nome legível; pode ser **padrão de fábrica** (imutável nesta entrega) ou **criada pelo administrador** (editável e excluível se sem vínculos); relaciona-se a zero ou muitas contas.
- **Subcategoria RH**: classificação de segundo nível válida apenas quando a categoria é Recursos Humanos; possui nome legível (incluindo **Bônus & Comissão** e **Comissão**); pode ser **padrão de fábrica** (editável, não excluível) ou **criada pelo administrador** (editável e excluível se sem vínculos); relacionável a contas de RH.
- **Conta a Pagar / Conta a Receber / Lançamento de Fluxo de Caixa**: registros financeiros listáveis; cada um possui momento de inclusão usado como **ordem de lançamento**.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em até 1 minuto, um administrador encontra e seleciona a subcategoria **Bônus & Comissão** (e não "Comissões") ao classificar uma nova conta a pagar de RH, e ainda vê **Comissão** (singular) como opção distinta.
- **SC-002**: 100% das contas já classificadas na antiga "Comissões" de RH passam a exibir **Bônus & Comissão** sem reclassificação manual.
- **SC-003**: Um administrador consegue criar, renomear e excluir (quando sem vínculos) uma categoria gerenciável em menos de 2 minutos por operação.
- **SC-004**: Um administrador consegue criar, renomear qualquer subcategoria RH e excluir (quando criada por ele e sem vínculos) uma subcategoria RH em menos de 2 minutos por operação.
- **SC-005**: Em 100% das tentativas de exclusão com vínculos, o sistema bloqueia e nenhuma conta perde classificação.
- **SC-006**: Em Contas a Receber, Contas a Pagar e Fluxo de Caixa, o usuário consegue alternar para ordem de lançamento (crescente/decrescente) e validar a sequência em menos de 30 segundos por página.
- **SC-007**: Visualizadores conseguem ordenar por lançamento e ver rótulos atualizados, mas falham (sem efeito) em qualquer tentativa de alterar o catálogo.

## Assumptions

- O pedido de renomear **"Comissões"** refere-se à subcategoria de Recursos Humanos no formulário de Contas a Pagar; o rótulo final confirmado é **Bônus & Comissão** (não apenas "Bônus"); **não** altera a página/módulo de Comissões da equipe.
- A subcategoria **Comissão** (singular) permanece distinta e com o mesmo rótulo.
- "Categorias" passíveis de editar/excluir são **somente** as **criadas pelo administrador**; categorias padrão de fábrica são **imutáveis** nesta entrega (confirmado).
- Subcategorias RH: **editar qualquer** nome; **excluir somente** as criadas pelo administrador (padrão de fábrica não excluível).
- "Filtrar por ordem de lançamento" foi **confirmado** como **ordenar** a listagem pela sequência/tempo de inclusão do registro (crescente e decrescente), convivendo com os filtros já existentes — não como um filtro que remove linhas por quantidade ou intervalo de inclusão.
- Exclusão de categoria/subcategoria com vínculos é **bloqueada** (não há reclassificação em massa nesta entrega).
- Papéis seguem o padrão do Ocean App: `admin` altera; `visualizador` só lê.
- Rótulos legados de pendência de reclassificação (ex.: "Comissões (legado)") permanecem distintos do rótulo novo **Bônus & Comissão**, para não confundir dados ainda não reclassificados.
- Escopo de ordenação por lançamento limita-se às três páginas citadas; demais telas financeiras ficam fora desta entrega.
- Gestão de categorias/subcategorias RH (adicionar/editar/excluir) ocorre **no formulário de conta a pagar**, junto aos seletores — sem tela dedicada nesta entrega.
