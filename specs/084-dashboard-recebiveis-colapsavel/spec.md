# Feature Specification: Previsão de Recebíveis Recolhível no Dashboard

**Feature Branch**: `084-dashboard-recebiveis-colapsavel`

**Created**: 2026-10-06

**Status**: Draft

**Input**: User description: "na seção \"Previsão de recebíveis\" deve ser um colapse e por default ela deve ser fechada"

## Clarifications

### Session 2026-10-06

- Q: Quando a seção estiver fechada, o que continua visível? → A: O cabeçalho da seção (título, subtítulo de referência e o "Total em aberto"); apenas os cards por faixa de vencimento ficam ocultos.
- Q: A escolha de aberto/fechado deve ser lembrada entre visitas? → A: Não. A seção abre sempre fechada a cada carregamento do Dashboard; a expansão vale só durante a visita atual.
- Q: Quem pode abrir/fechar a seção? → A: Todos os papéis (`admin` e `visualizador`); é apenas uma preferência de visualização, sem alterar dados.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver Dashboard com a Previsão de Recebíveis recolhida (Priority: P1)

Ao abrir o Dashboard, o usuário vê a seção "Previsão de Recebíveis" recolhida: o título e o total em aberto aparecem, mas os cards detalhados por faixa de vencimento ficam ocultos, deixando a página mais curta e focada nos indicadores do período.

**Why this priority**: É o comportamento principal pedido — a seção deve ser fechada por padrão para reduzir o volume de informação na primeira leitura do Dashboard.

**Independent Test**: Abrir o Dashboard e confirmar que a seção aparece fechada, mostrando apenas cabeçalho e total, sem os cards de faixas.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado, **When** ele abre o Dashboard, **Then** a seção "Previsão de Recebíveis" aparece fechada, com título, subtítulo e "Total em aberto" visíveis e os cards por faixa ocultos.
2. **Given** a seção fechada, **When** o usuário troca mês, ano ou visão de receita, **Then** a seção permanece fechada e o total exibido segue a visão de receita selecionada.

---

### User Story 2 - Expandir e recolher a seção sob demanda (Priority: P1)

O usuário clica no cabeçalho da seção para expandi-la e ver os cards por faixa de vencimento; clica novamente para recolhê-la. Um indicador visual mostra se a seção está aberta ou fechada.

**Why this priority**: Sem a possibilidade de expandir, a informação detalhada ficaria inacessível; é indispensável junto com o padrão fechado.

**Independent Test**: Clicar no cabeçalho da seção fechada, verificar que os cards aparecem; clicar de novo e verificar que somem.

**Acceptance Scenarios**:

1. **Given** a seção fechada, **When** o usuário clica no cabeçalho, **Then** os cards por faixa de vencimento são exibidos e o indicador passa para "aberto".
2. **Given** a seção aberta, **When** o usuário clica no cabeçalho, **Then** os cards são ocultados e o indicador passa para "fechado".
3. **Given** a seção com foco via teclado, **When** o usuário pressiona Enter ou Espaço, **Then** a seção alterna entre aberta e fechada.
4. **Given** a seção aberta, **When** o usuário recarrega ou volta ao Dashboard, **Then** a seção aparece fechada novamente.

---

### Edge Cases

- Se o carregamento da Previsão de Recebíveis falhar, a mensagem de erro aparece ao expandir a seção (no lugar dos cards), e o cabeçalho continua utilizável.
- Sem recebíveis em aberto, a seção continua recolhível e o total mostra zero.
- Em telas estreitas (mobile), o cabeçalho continua clicável e o indicador permanece visível.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A seção "Previsão de Recebíveis" do Dashboard DEVE iniciar fechada a cada carregamento da página.
- **FR-002**: Com a seção fechada, o sistema DEVE exibir o título, o subtítulo de referência e o "Total em aberto", e DEVE ocultar os cards por faixa de vencimento (e a mensagem de erro, quando houver).
- **FR-003**: Usuários DEVEM poder alternar a seção entre aberta e fechada clicando no cabeçalho.
- **FR-004**: A alternância DEVE ser acessível por teclado (Enter/Espaço) e comunicar o estado aberto/fechado a tecnologias assistivas.
- **FR-005**: O sistema DEVE exibir um indicador visual (seta) que mostre claramente se a seção está aberta ou fechada.
- **FR-006**: Abrir/fechar a seção NÃO DEVE disparar nova busca de dados nem alterar os valores exibidos.
- **FR-007**: O comportamento DEVE ser o mesmo para os papéis `admin` e `visualizador`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos carregamentos do Dashboard, a seção "Previsão de Recebíveis" aparece fechada.
- **SC-002**: O usuário consegue ver os detalhes por faixa de vencimento com um único clique (ou tecla) a partir do estado fechado.
- **SC-003**: Com a seção fechada, a altura ocupada por ela no Dashboard é reduzida à do cabeçalho, sem perder a visibilidade do total em aberto.
- **SC-004**: Os valores exibidos (total e faixas) são idênticos antes e depois de abrir/fechar a seção.

## Assumptions

- O estado aberto/fechado não é persistido (nem por usuário nem no navegador); a seção sempre inicia fechada.
- O "Total em aberto" permanece visível no estado fechado por ser o indicador-resumo da seção.
- Nenhuma mudança de cálculo, de fonte de dados ou de permissões; apenas apresentação no Dashboard.
- As demais seções do Dashboard permanecem como estão (fora de escopo torná-las recolhíveis).
