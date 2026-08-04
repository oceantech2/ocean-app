# Feature Specification: Dashboard — Cards de Metas Lado a Lado

**Feature Branch**: `002-dashboard-metas-cards`

**Created**: 2026-07-26

**Status**: Draft

**Input**: User description: "vamos começar pela dashboard — já de início temos meta de faturamento e depois meta anual; faça isso ser 2 cards onde o primeiro seja o anual e o segundo seja a meta de faturamento, se possível colocar um do lado do outro"

**Baseline**: Referencia `specs/001-ocean-app-baseline` (visão gerencial no dashboard e metas). Esta feature altera apenas a apresentação das metas no topo da dashboard.

## Clarifications

### Session 2026-07-26

- Q: Como os dois cards devem dividir o espaço no desktop (lado a lado)? → A: Largura igual (50/50), altura alinhada
- Q: Quais títulos oficiais usar em cada card? → A: “Meta de Faturamento Anual — {ano}” e “Meta de Faturamento — {mês}/{ano}” (padrão atual)
- Q: Quando o admin edita uma meta, como o formulário deve aparecer nos cards lado a lado? → A: Edição inline no próprio card (como hoje)
- Q: A partir de qual largura de tela os cards devem ficar lado a lado (em vez de empilhados)? → A: Lado a lado a partir de tablet médio (~768px); mobile empilhado

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver metas anual e mensal lado a lado (Priority: P1)

Um usuário autenticado com acesso à dashboard abre a tela inicial e, no topo, vê imediatamente dois cards de meta: à esquerda (ou primeiro) a **meta anual** e à direita (ou segundo) a **meta de faturamento do mês**. Em telas a partir de ~768px os cards aparecem um ao lado do outro (50/50, altura alinhada); abaixo disso empilham-se na mesma ordem (anual acima, faturamento do mês abaixo).

**Why this priority**: É o pedido central da feature — reorganizar a leitura das metas para priorizar a visão anual e facilitar comparação visual lado a lado.

**Independent Test**: Abrir a dashboard em desktop e em mobile; confirmar ordem (anual → mensal) e layout (lado a lado vs. empilhado).

**Acceptance Scenarios**:

1. **Given** um usuário autenticado com acesso à dashboard, **When** a tela carrega, **Then** os dois cards de meta são os primeiros blocos de conteúdo relevantes após o cabeçalho da página, na ordem meta anual e depois meta de faturamento do mês.
2. **Given** uma viewport larga (desktop ou tablet a partir de ~768px), **When** o usuário visualiza a dashboard, **Then** os dois cards aparecem lado a lado na mesma linha, com largura igual (50/50) e altura alinhada.
3. **Given** uma viewport estreita (mobile, abaixo de ~768px), **When** o usuário visualiza a dashboard, **Then** os cards empilham-se verticalmente mantendo a ordem anual → mensal.
4. **Given** metas já definidas (anual e mensal), **When** o usuário olha os cards, **Then** cada card mostra valor da meta, valor realizado e progresso percentual, sem perda de informação em relação ao comportamento atual.

---

### User Story 2 - Definir ou editar metas a partir dos cards (Priority: P1)

Um administrador continua podendo definir ou editar a meta anual e a meta de faturamento do mês a partir de cada card respectivo. Um visualizador (ou usuário sem permissão de escrita) vê os cards e o progresso, mas não vê ações de edição.

**Why this priority**: A reorganização visual não pode quebrar o fluxo existente de gestão das metas.

**Independent Test**: Como admin, editar cada meta e salvar; como visualizador, confirmar ausência de botões de edição e presença dos valores/progresso.

**Acceptance Scenarios**:

1. **Given** um administrador, **When** clica em definir/editar no card da meta anual, **Then** o formulário de edição abre inline no próprio card, ele pode informar o valor, salvar e ver o card atualizado com o novo progresso.
2. **Given** um administrador, **When** clica em definir/editar no card da meta de faturamento do mês, **Then** o formulário de edição abre inline no próprio card, ele pode informar o valor, salvar e ver o card atualizado com o novo progresso.
3. **Given** um usuário sem permissão de edição, **When** visualiza os cards, **Then** vê meta, realizado e progresso (quando houver meta), sem controles de edição.
4. **Given** falha ao salvar uma meta, **When** o admin tenta gravar, **Then** recebe feedback de erro e o valor anterior permanece exibido.

---

### User Story 3 - Entender o estado quando não há meta definida (Priority: P2)

Quando uma das metas ainda não foi definida, o card correspondente permanece visível, deixa claro que não há meta e (para admin) oferece o caminho para defini-la. A barra de progresso só aparece quando existe meta com valor válido.

**Why this priority**: Evita confusão na leitura inicial da dashboard quando o ano ou o mês ainda não têm meta cadastrada.

**Independent Test**: Remover/zerar uma meta e reabrir a dashboard; verificar mensagem/estado vazio e ausência de barra enganosa.

**Acceptance Scenarios**:

1. **Given** meta anual inexistente, **When** o usuário abre a dashboard, **Then** o card anual permanece no lugar, indica ausência de meta e não exibe barra de progresso como se houvesse meta.
2. **Given** meta mensal inexistente, **When** o usuário abre a dashboard, **Then** o card de faturamento do mês comporta-se de forma equivalente.
3. **Given** apenas uma das duas metas definida, **When** o usuário visualiza, **Then** o card com meta mostra progresso e o outro mostra o estado sem meta, ambos lado a lado (ou empilhados no mobile).

---

### Edge Cases

- Viewport intermediária (~768px e acima): manter lado a lado 50/50 com altura alinhada; abaixo disso, empilhar na ordem anual → mensal. Quando lado a lado, altura desalinhada por conteúdo (ex.: um em modo edição) deve ser corrigida para manter o alinhamento de altura da faixa.
- Meta definida com valor zero ou inválido: tratar como ausência de meta utilizável (sem progresso percentual enganoso).
- Realizado maior que a meta: o progresso visual não ultrapassa 100%, mas o percentual numérico exibido deve refletir a regra já usada hoje no produto (consistência com o baseline).
- Carregamento: enquanto os dados das metas não chegam, a área dos cards não deve “pular” de forma confusa em relação ao restante da dashboard (manter o padrão de loading já usado na página).
- Edição simultânea: editar um card não deve abrir ou corromper o modo de edição do outro; cada card tem fluxo de edição inline independente; a faixa mantém altura alinhada enquanto um (ou ambos) estiver em edição.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A dashboard MUST exibir a meta anual e a meta de faturamento do mês como dois cards distintos no início da área de conteúdo.
- **FR-002**: A ordem visual MUST ser: (1) meta anual, (2) meta de faturamento do mês corrente (conforme o período selecionado/ano da dashboard).
- **FR-003**: Em telas a partir de tablet médio (~768px), os dois cards MUST aparecer lado a lado na mesma faixa horizontal, com largura igual (50/50) e altura visual alinhada entre si.
- **FR-004**: Em telas abaixo de ~768px, os dois cards MUST empilhar na ordem anual → mensal.
- **FR-005**: Cada card MUST mostrar, no mínimo: título no padrão oficial (“Meta de Faturamento Anual — {ano}” no card anual; “Meta de Faturamento — {mês}/{ano}” no card mensal), valor realizado, valor da meta (ou indicação de ausência) e progresso quando houver meta válida.
- **FR-006**: Administradores MUST poder definir e editar o valor de cada meta via edição inline no respectivo card (sem modal), com feedback de sucesso ou erro.
- **FR-007**: Usuários sem permissão de escrita MUST visualizar os cards sem ações de edição.
- **FR-008**: A reorganização dos cards MUST preservar o significado das métricas já existentes no baseline (realizado anual acumulado vs. realizado do mês; meta anual vs. meta do mês).
- **FR-009**: Demais seções da dashboard (KPIs de bruto/líquido/pendentes, gráficos, retiradas, saldos, etc.) MUST permanecer fora do escopo desta feature, salvo ajustes mínimos de espaçamento necessários para acomodar a nova faixa de cards.

### Key Entities

- **Meta Anual**: Objetivo de faturamento para o ano em exibição; relaciona-se ao total realizado acumulado no ano.
- **Meta de Faturamento (mês)**: Objetivo de faturamento para o mês corrente (ou mês em contexto na dashboard); relaciona-se ao realizado daquele mês.
- **Progresso de Meta**: Comparação entre realizado e valor da meta, apresentada de forma percentual e visual no card.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em viewport a partir de ~768px, um usuário identifica e compara meta anual e meta mensal na mesma faixa superior (cards 50/50) em menos de 5 segundos, sem rolar além do primeiro viewport dos cards.
- **SC-002**: 100% dos usuários de teste confirmam a ordem: card anual à esquerda (ou acima abaixo de ~768px) e card de faturamento mensal à direita (ou abaixo).
- **SC-003**: Admin consegue definir ou editar cada meta em no máximo 2 interações a partir do card (abrir edição → salvar), com sucesso na primeira tentativa em condições normais.
- **SC-004**: Em mobile, os dois cards permanecem legíveis sem scroll horizontal e sem truncamento crítico de valores monetários ou percentuais.
- **SC-005**: Nenhuma regressão funcional: valores de meta, realizado e progresso batem com os mesmos totais exibidos antes da mudança de layout (mesma regra de negócio do baseline).

## Assumptions

- A dashboard já possui lógica e dados de meta anual e meta de faturamento mensal; esta feature é prioritariamente de reorganização visual e ordem de apresentação.
- “Meta de faturamento” no pedido do usuário refere-se à meta mensal já existente no produto (não uma terceira meta nova). Os títulos oficiais dos cards permanecem: “Meta de Faturamento Anual — {ano}” e “Meta de Faturamento — {mês}/{ano}”.
- Papéis e permissões de edição seguem o baseline (`admin` edita; `visualizador`/somente leitura apenas consulta).
- Em tablet/viewport a partir de ~768px, lado a lado; abaixo disso, empilhar.
- Outros elementos da dashboard (gráficos, KPIs, saldos) não mudam nesta entrega; melhorias futuras da dashboard serão specs separadas.
- O período (ano/mês) exibido nos cards continua alinhado aos filtros/contexto já usados na dashboard.
