# Feature Specification: Remover Pipeline de Receita

**Feature Branch**: `065-remover-pipeline-receita`

**Created**: 2026-09-14

**Status**: Implemented

**Input**: User description: "remover pipeline de receita"

**Baseline**: No Dashboard Financeiro existe o card **Pipeline de Receita** (funil Fechado / A Faturar / Faturado · Ag. Pagamento / Recebido), introduzido na etapa 1 do briefing financeiro. A seção Receita também exibe as abas **Por Caixa** e **Por Competência**, que já cobrem a leitura gerencial equivalente (especialmente Por Competência, alinhada ao mesmo universo de fechamento). Esta feature remove o card Pipeline de Receita da interface, eliminando a duplicidade visual, sem retirar a leitura por abas nem o Resultado / barra de meta que dependem dos mesmos totais.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dashboard sem o card Pipeline de Receita (Priority: P1)

Como usuário autenticado (`admin` ou `visualizador`), ao abrir o Dashboard Financeiro na seção Receita, **não** vejo mais o card intitulado **Pipeline de Receita**. A leitura de receita continua pelas abas **Por Caixa** e **Por Competência**, e o restante do Dashboard (meta, toggle Bruto/Líquido, despesas, aging, alerta) permanece utilizável.

**Why this priority**: É o objetivo direto da solicitação — tirar o funil duplicado da tela.

**Independent Test**: Abrir o Dashboard no período corrente e confirmar ausência do card Pipeline; abas de receita e demais blocos ainda carregam e exibem valores.

**Acceptance Scenarios**:

1. **Given** o Dashboard aberto na seção Receita, **When** o usuário procura o card **Pipeline de Receita**, **Then** esse card **não** está presente (sem título, estágios do funil nem totais exclusivos daquele card)
2. **Given** o mesmo Dashboard, **When** o usuário observa a seção Receita, **Then** as abas **Por Caixa** e **Por Competência** continuam disponíveis e selecionáveis
3. **Given** papéis `admin` e `visualizador`, **When** ambos abrem o Dashboard, **Then** nenhum dos dois vê o card Pipeline
4. **Given** o usuário altera o período (mês/ano) ou o toggle Bruto/Líquido, **When** a seção Receita atualiza, **Then** não reaparece o card Pipeline

---

### User Story 2 - Por Competência e dependências continuam corretas (Priority: P1)

Como usuário autenticado, após a remoção do card Pipeline, continuo lendo **Por Competência** (Total Fechado, Já Recebido, A Receber, A Faturar), a barra de progresso de meta na aba correspondente e o **Resultado Competência** com os mesmos critérios de negócio já estabelecidos — a remoção é só da superfície do funil, não da capacidade de analisar competência.

**Why this priority**: Evita regressão financeira: o Pipeline alimentava visualmente o funil, mas os mesmos totais sustentam outras leituras do Dashboard.

**Independent Test**: Com Contas a Receber conhecidas no período, conferir totais em Por Competência, barra de meta (aba Competência) e Resultado Competência; comparar mentalmente com o comportamento anterior sem o card.

**Acceptance Scenarios**:

1. **Given** fechamentos no período em cada estágio, **When** o usuário está em **Por Competência**, **Then** Total Fechado = Já Recebido + A Receber + A Faturar na base do toggle
2. **Given** meta do período configurada e aba Por Competência ativa, **When** o usuário observa a barra de progresso, **Then** o numerador continua sendo o Total Fechado na base do toggle
3. **Given** despesas e receitas do período conhecidas, **When** o usuário lê **Resultado Competência**, **Then** o valor e o percentual seguem a regra vigente (receita de competência − despesas), sem depender do card Pipeline estar visível
4. **Given** falha ao carregar os totais de competência, **When** o usuário está em Por Competência, **Then** vê mensagem de erro clara nessa área — e **não** um card Pipeline de fallback

---

### User Story 3 - Experiência limpa e sem resíduos do funil (Priority: P2)

Como usuário autenticado, após a remoção, não encontro textos, rótulos ou mensagens de erro que ainda digam **Pipeline de Receita** no Dashboard; a interface fala apenas das leituras que permanecem (Caixa, Competência, etc.).

**Why this priority**: Evita confusão pós-remoção e sensação de feature “meio removida”.

**Independent Test**: Percorrer a seção Receita (incluindo estados de erro/carregamento) e buscar a expressão “Pipeline de Receita”.

**Acceptance Scenarios**:

1. **Given** carregamento normal da seção Receita, **When** o usuário lê títulos e subtítulos visíveis, **Then** não aparece o termo **Pipeline de Receita**
2. **Given** falha no carregamento dos totais usados por Por Competência, **When** a mensagem de erro é exibida, **Then** a mensagem **não** se refere ao “Pipeline de Receita” (usa linguagem alinhada à aba ou à seção Receita)

---

### Edge Cases

- Período sem fechamentos (totais zerados): abas e Resultado Competência mostram zeros / “—” conforme regra vigente; nenhum card Pipeline vazio aparece
- Filtro só-ano (sem mês): comportamento das abas e Resultado permanece; Pipeline continua ausente
- Usuário com sessão antiga / cache de tela: após atualizar a página, o card Pipeline não reaparece
- Visualizador em somente leitura: mesma ausência do card e mesmas métricas que o admin (sem ações extras nesta feature)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O Dashboard MUST deixar de exibir o card **Pipeline de Receita** (funil com Fechado no mês/período e estágios A Faturar, Faturado · Ag. Pagamento e Recebido naquele card)
- **FR-002**: O Dashboard MUST manter as abas **Por Caixa** e **Por Competência** na seção Receita, com as mesmas métricas e regras de negócio já vigentes
- **FR-003**: A barra de progresso de meta MUST continuar usando Recebido (Por Caixa) ou Total Fechado (Por Competência) conforme a aba ativa, sem depender do card Pipeline estar visível
- **FR-004**: O **Resultado Competência** MUST continuar calculável e exibível com a receita de competência do período, independentemente da remoção do card
- **FR-005**: Mensagens de erro e textos de interface do Dashboard MUST NOT apresentar o card ou o rótulo **Pipeline de Receita** como elemento da experiência do usuário
- **FR-006**: A remoção MUST aplicar-se a `admin` e `visualizador` igualmente
- **FR-007**: Demais blocos do Dashboard (toggle Bruto/Líquido, Configuração do Período, Por Caixa, Despesas & Resultado, Aging, Alerta de Fluxo) MUST permanecer fora do escopo de alteração funcional, salvo o necessário para deixar de renderizar o card Pipeline
- **FR-008**: A agregação de totais de competência (universo de fechamento no período) MUST permanecer disponível para as leituras que ainda dependem dela (Por Competência, meta na aba correspondente, Resultado Competência), mesmo sem o card do funil

### Key Entities

- **Card Pipeline de Receita**: Superfície do Dashboard que apresentava o funil de estágios de Conta a Receber fechada no período — **removida** desta feature
- **Aba Por Competência**: Leitura canônica remanescente do mesmo universo de fechamento (Total Fechado e estágios), que permanece
- **Totais de competência do período**: Agregação de valor/contagem por estágio de ciclo no período selecionado; continua existindo como base das leituras remanescentes, sem exigência de card de funil

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das aberturas do Dashboard (admin e visualizador), o card **Pipeline de Receita** não aparece na seção Receita
- **SC-002**: Usuário encontra a leitura de competência em menos de 10 segundos via aba **Por Competência**, sem precisar do card removido
- **SC-003**: Em verificação com período de amostra conhecido, totais de Por Competência, barra de meta (aba Competência) e Resultado Competência permanecem coerentes com as regras vigentes (sem regressão vs. comportamento anterior sem o card)
- **SC-004**: Busca visual na seção Receita (incluindo estados de erro) não encontra o rótulo **Pipeline de Receita**
- **SC-005**: Tempo percebido de carga do Dashboard não piora de forma perceptível para o usuário em uso normal (a remoção não introduz espera extra na seção Receita)

## Assumptions

- O pedido “remover pipeline de receita” refere-se à **remoção do card / superfície de funil** no Dashboard, não à eliminação da capacidade de analisar receita por competência
- As abas Por Caixa / Por Competência e o Resultado Competência são a leitura canônica remanescente; o Pipeline era redundante visualmente com Por Competência
- A agregação de totais usada hoje pelo Pipeline pode continuar existindo “por baixo” enquanto alimentar Por Competência, meta e Resultado — o usuário não precisa ver nem nomear isso como Pipeline
- Não há alteração de regras de status de Conta a Receber, Contas a Pagar, NFs, Aging, Alerta de Fluxo ou Configuração do Período
- Não há novo controle de permissão: ambos os papéis perdem a visão do card igualmente
- Fora de escopo: redesenhar as abas, unificar rótulos Caixa/Competência, remover endpoint ou dados de competência, ou alterar o briefing financeiro além da retirada do card
