# Feature Specification: Dashboard — Card NFs com Pagamento Pendente (R$)

**Feature Branch**: `010-dashboard-nfs-pendente`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "Criar card \"NFs com pagamento pendente (R$)\" atualmente existe um que diz a quantidade de NF deve ter os 2, quantidade de NF e valor de pagamento pendente"

**Baseline**: Referencia o card existente de **NFs Pendentes** na dashboard (hoje exibe apenas a quantidade de notas aguardando pagamento). Esta feature **substitui** esse card por um único card que mostra o valor em R$ em destaque e a quantidade no subtítulo.

## Clarifications

### Session 2026-08-06

- Q: Como devem aparecer quantidade e valor na faixa de KPIs? → A: Um único card **“NFs com pagamento pendente (R$)”** com o **valor em destaque** e a quantidade no subtítulo (opção B)
- Q: Qual texto usar no subtítulo da quantidade? → A: `{n} NFs pendentes` (ex.: `3 NFs pendentes`) (opção A)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver valor e quantidade no mesmo card de NFs pendentes (Priority: P1)

Um usuário autenticado com acesso à dashboard abre a tela inicial e, na faixa de indicadores de faturamento/NFs, vê um único card intitulado **“NFs com pagamento pendente (R$)”**: o **valor principal** é o montante em reais do pagamento pendente e o **subtítulo** informa a quantidade de NFs nesse status. O card antigo que mostrava só a quantidade deixa de existir como card separado.

**Why this priority**: É o pedido central — o valor em R$ passa a ser o destaque financeiro, sem perder a contagem de NFs.

**Independent Test**: Abrir a dashboard com NFs pendentes conhecidas; confirmar título, valor em R$ em destaque e subtítulo `{n} NFs pendentes`; confirmar que não há um segundo card só de quantidade na mesma faixa.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado com acesso à dashboard e NFs com status de pagamento pendente, **When** a tela carrega, **Then** ele vê no mesmo card o valor monetário de pagamento pendente (destaque) e o subtítulo no formato `{n} NFs pendentes`, sem navegar para outra tela.
2. **Given** a dashboard carregada, **When** o usuário localiza o card de pendência, **Then** o título é **“NFs com pagamento pendente (R$)”** e o valor principal está formatado em reais (R$).
3. **Given** a dashboard carregada, **When** o usuário observa a faixa de KPIs, **Then** não existe um card separado cujo valor principal seja apenas a quantidade de NFs pendentes.
4. **Given** o mesmo conjunto de NFs pendentes, **When** o usuário compara valor e quantidade na dashboard com a visão já usada em Contas a Receber / NFs para o mesmo contexto de pendentes, **Then** os números são coerentes (mesma regra de “pendente” e mesma base de valor adotada nesta feature).

---

### User Story 2 - Entender o estado quando não há NFs pendentes (Priority: P2)

Quando não há NFs aguardando pagamento, o card permanece visível com valor R$ 0,00 (ou equivalente) e quantidade zero no subtítulo, sem mensagem de erro ou ausência confusa do card.

**Why this priority**: Evita que a ausência de pendências seja interpretada como falha de carregamento ou card “quebrado”.

**Independent Test**: Cenário sem NFs pendentes; abrir a dashboard e verificar R$ 0,00 no destaque e zero na quantidade do subtítulo.

**Acceptance Scenarios**:

1. **Given** nenhuma NF com pagamento pendente no contexto exibido, **When** o usuário abre a dashboard, **Then** o valor em R$ é zero e a quantidade no subtítulo é zero, ambos ainda visíveis no mesmo card.
2. **Given** esse estado zerado, **When** o usuário lê a faixa de KPIs, **Then** o subtítulo mostra `0 NFs pendentes` e não há indicação de erro nem ocultação do card.

---

### User Story 3 - Manter leitura dos demais KPIs da faixa (Priority: P2)

A substituição do card de quantidade pelo card unificado não prejudica a leitura dos demais indicadores da mesma faixa (faturamento bruto e faturamento líquido). Em telas estreitas, os cards empilham de forma legível; em telas largas, a faixa permanece com três KPIs organizados e escaneáveis.

**Why this priority**: A feature é um complemento visual; não deve degradar a visão gerencial já existente.

**Independent Test**: Abrir a dashboard em desktop e mobile; confirmar que bruto, líquido e o card unificado de pendência (valor + quantidade) são todos legíveis.

**Acceptance Scenarios**:

1. **Given** viewport larga, **When** o usuário visualiza a faixa de KPIs, **Then** consegue identificar faturamento bruto, faturamento líquido e o card “NFs com pagamento pendente (R$)” (valor + quantidade no subtítulo) sem sobreposição ou corte de texto.
2. **Given** viewport estreita (mobile), **When** o usuário percorre a faixa, **Then** os indicadores empilham-se de forma legível na ordem bruto → líquido → NFs com pagamento pendente (R$).

---

### Edge Cases

- Valor pendente muito alto: formatação em R$ permanece legível (sem estourar o card de forma a esconder o título ou o subtítulo de quantidade).
- Quantidade zero com valor zero: ambos mostram zero de forma explícita no mesmo card.
- Carregamento: enquanto os dados não chegam, a faixa de KPIs segue o padrão de loading já usado na dashboard (sem “pulo” confuso ou valores fantasma).
- Falha ao obter o resumo financeiro: o usuário recebe feedback de erro no padrão da página; o card não exibe valores inventados.
- NFs vencidas vs. pendentes: esta feature cobre apenas o conjunto “aguardando pagamento” (pendentes), alinhado à regra já usada pelo indicador de quantidade anterior; vencidas não entram neste card, salvo se o produto já as tratava como o mesmo conjunto (manter a mesma regra).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A dashboard MUST exibir um único card intitulado **“NFs com pagamento pendente (R$)”** no lugar do card que antes mostrava só a quantidade de NFs pendentes.
- **FR-002**: O valor principal desse card MUST ser o montante em reais do pagamento pendente das NFs nesse status.
- **FR-003**: A quantidade de NFs com pagamento pendente MUST aparecer no **subtítulo** do mesmo card no formato **`{n} NFs pendentes`** (ex.: `3 NFs pendentes`), não como card separado.
- **FR-004**: Valor e quantidade MUST estar visíveis na mesma visita à dashboard, sem exigir navegação para a página de NFs ou Relatórios.
- **FR-005**: O valor em R$ MUST usar a mesma definição de “NF com pagamento pendente” já usada pelo indicador de quantidade anterior, para que quantidade e valor descrevam o mesmo conjunto de notas.
- **FR-006**: O valor monetário MUST ser a soma do valor bruto das NFs pendentes do contexto exibido (consistente com a visão de pendentes já usada em Contas a Receber / NFs).
- **FR-007**: Quando não houver NFs pendentes, valor e quantidade MUST mostrar zero de forma clara no mesmo card.
- **FR-008**: Usuários `admin` e `visualizador` com acesso à dashboard MUST ver o card (somente leitura para visualizador; nenhum fluxo de edição neste card).
- **FR-009**: A feature MUST limitar-se à dashboard; não exige alteração da página de Relatórios nem novos fluxos de CRUD de NF.
- **FR-010**: A faixa de KPIs MUST permanecer com três cards (bruto, líquido, NFs com pagamento pendente), sem card adicional só de quantidade.

### Key Entities

- **NF (Nota Fiscal)**: Documento de receita com status de pagamento (ex.: paga, pendente, vencida, cancelada) e valores bruto/líquido; nesta feature interessa o subconjunto com pagamento pendente.
- **Card NFs com pagamento pendente (R$)**: Indicador unificado da dashboard — valor principal = soma do valor bruto das NFs pendentes; subtítulo = `{n} NFs pendentes`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em uma visita à dashboard, o usuário identifica valor em R$ **e** quantidade de NFs com pagamento pendente no mesmo card em menos de 10 segundos, sem abrir outra página.
- **SC-002**: Em 100% dos cenários de teste com NFs pendentes conhecidas, o valor do card “NFs com pagamento pendente (R$)” corresponde à soma do valor bruto dessas NFs (mesma regra do indicador de quantidade).
- **SC-003**: Em 100% dos cenários sem NFs pendentes, valor e quantidade exibem zero e o card permanece visível.
- **SC-004**: Em 100% dos testes de regressão da faixa de KPIs, não há card separado cujo destaque seja apenas a contagem de NFs pendentes (a quantidade só aparece no subtítulo do card unificado).

## Assumptions

- O escopo é a **dashboard**; a página de Relatórios e outros painéis ficam fora desta feature, salvo reuso natural dos mesmos dados.
- O card antigo **“NFs Pendentes”** (quantidade como valor principal) é **substituído** pelo card unificado; não há card adicional.
- O valor monetário é a **soma do valor bruto** das NFs pendentes, alinhado à visão de pendentes em Contas a Receber / NFs.
- O contexto temporal (ano / filtros já existentes na dashboard) do indicador de pendência segue a mesma regra já usada pelo card de quantidade atual.
- Papéis e permissões de visualização da dashboard não mudam.
- A faixa de KPIs permanece com **3 cards** (bruto / líquido / NFs com pagamento pendente).
- O subtítulo de quantidade usa sempre o formato `{n} NFs pendentes` (incluindo o caso `0` e o singular numérico `1 NFs pendentes`, sem flexão especial de plural — alinhado ao padrão `{n} NFs pagas` do card de líquido).
