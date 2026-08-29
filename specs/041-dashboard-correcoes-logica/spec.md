# Feature Specification: Dashboard — Correções de Lógica, DRL e Ajustes Visuais

**Feature Branch**: `041-dashboard-correcoes-logica`

**Created**: 2026-08-27

**Status**: Draft

**Input**: User description: "Meta anual: inserir porcentagem na barra; Consertar a lógica de Despesa(s) (nenhum campo de Despesa contabiliza impostos); Consertar a lógica de Saldo Conta Corrente (Saldo atual + Faturamento Bruto - Impostos - Despesas); Trocar cores dentro de Saldo: Saldo Conta(s) Corrente(s) = verde, Saldo Conta(s) Investimento(s) = azul; Consertar a lógica de DRL: gráfico em linhas com a linha do tempo completa da receita líquida (mês a mês, de 2024 até o momento); Remover filtros de comparação no Head"

**Baseline**: Complementa `039-dashboard-nomenclatura` e `040-dashboard-secoes-cards`. Esta feature corrige cálculos e apresentação do Dashboard sem alterar a estrutura de seções/cards definida na 040.

## Clarifications

### Session 2026-08-27

- Q: Como aplicar a fórmula de Saldo Conta Corrente nos 3 slots quando Receita/Impostos/Despesas são totais do recorte? → A: Cada card exibe saldo recalculado **por conta**, com receitas e despesas **alocadas àquela conta** via movimentos no recorte — sem repetir totais globais nos três slots.
- Q: Despesas pendentes entram no cálculo do saldo por conta corrente? → A: **Não** — apenas despesas **pagas** (fixas + variáveis) alocadas à conta; pendentes ficam fora.
- Q: Como rotular o eixo temporal do DRL (jan/2024 até mês atual)? → A: Rótulo compacto **Mês/Ano** no eixo (ex.: Jan/24, Fev/24, Mar/24 …).
- Q: Como tratar meses sem receita líquida registrada no DRL? → A: **Omitir** do eixo — exibir apenas meses com lançamento, dentro do intervalo jan/2024 até o mês corrente.
- Q: Qual base compõe o realizado da Meta de Receita Anual para o percentual na barra? → A: **Receita Líquida** acumulada no ano (NFs pagas, após impostos).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ler metas e saldos com valores e percentuais corretos (Priority: P1)

Como usuário autenticado (admin ou visualizador), ao consultar o Dashboard, vejo a **Meta de Receita Anual** com o percentual de progresso exibido dentro da barra de progresso (no mesmo padrão visual da meta mensal), calculado sobre **Receita Líquida acumulada no ano**, e os cards de **Saldo** de contas correntes exibem o valor calculado pela fórmula de negócio — não apenas o saldo cadastrado isolado.

**Why this priority**: Metas e saldos são indicadores de decisão imediata; percentual ausente ou saldo incorreto distorce a leitura gerencial.

**Independent Test**: Conferir meta anual com meta cadastrada e realizado conhecido; comparar manualmente um card de conta corrente com o saldo esperado daquela conta (saldo registrado ajustado pelos movimentos alocados a ela no recorte).

**Acceptance Scenarios**:

1. **Given** existe meta anual cadastrada com Receita Líquida acumulada no ano > 0, **When** o usuário visualiza a barra de progresso da Meta de Receita Anual, **Then** o percentual atingido (Receita Líquida acumulada ÷ meta anual) aparece dentro da barra preenchida, com legibilidade equivalente à meta mensal (ex.: texto sobre a barra quando houver espaço suficiente)
2. **Given** filtro de mês/ano aplicado e movimentos da conta no recorte, **When** o usuário visualiza um card de conta corrente na seção Saldo, **Then** o valor exibido corresponde ao **saldo daquela conta** calculado como: Saldo atual registrado até o recorte **+ entradas alocadas à conta** (receita bruta da conta) **− impostos alocados à conta − despesas operacionais alocadas à conta** (fixas + variáveis pagas, sem impostos), **sem** aplicar totais globais de Receita/Impostos/Despesas do Dashboard aos três slots de forma idêntica
3. **Given** o card Conta Investimento na seção Saldo, **When** o usuário o visualiza, **Then** continua exibindo o saldo de investimento conforme cadastro/registro existente (sem aplicar a fórmula de conta corrente)

---

### User Story 2 - Confiar nos totais de Despesa sem impostos (Priority: P1)

Como usuário autenticado, ao ler a seção **Despesa** e o **Centro de Despesa**, tenho certeza de que nenhum valor classificado como imposto entra em Fixas, Variáveis, Pendentes nem nos gráficos de composição de despesas.

**Why this priority**: Misturar impostos com despesa operacional invalida análise de custo e lucro; o pedido reforça uma regra já esperada na 040.

**Independent Test**: Com lançamentos de categoria impostos no período, somar manualmente Fixas + Variáveis + Pendentes e comparar com total de contas a pagar excluindo impostos.

**Acceptance Scenarios**:

1. **Given** existem contas a pagar da categoria impostos (pagas ou pendentes) no recorte, **When** o usuário consulta Despesas Fixas, Despesas Variáveis e Despesas Pendentes, **Then** nenhum desses três cards inclui valores de impostos
2. **Given** existem impostos no período, **When** o usuário consulta os gráficos Despesas [Mês] e Despesas [Ano] no Centro de Despesa, **Then** impostos não aparecem como fatia, legenda ou parte do total exibido
3. **Given** impostos aparecem na seção Receita (card Impostos), **When** o usuário compara com a seção Despesa, **Then** os mesmos valores de impostos não se repetem em nenhum campo de despesa

---

### User Story 3 - Analisar DRL como série histórica contínua (Priority: P1)

Como usuário autenticado, na seção **Demonstrativo de Resultado**, vejo o gráfico **DRL** como linha única da Receita Líquida, com um ponto por mês **que possui lançamento**, de **2024** até o **mês corrente**, independentemente do ano selecionado no filtro principal — permitindo enxergar a evolução histórica.

**Why this priority**: O DRL deixa de ser um recorte anual comparativo e passa a ser a visão longitudinal pedida pelo negócio.

**Independent Test**: Abrir o Dashboard e verificar eixo com rótulos Mês/Ano apenas nos meses com dados (jan/2024 … mês atual), com valores de receita líquida coerentes com os lançamentos cadastrados.

**Acceptance Scenarios**:

1. **Given** o usuário acessa o Dashboard, **When** visualiza o gráfico DRL, **Then** vê um gráfico de linhas (não barras) com pontos apenas nos meses com receita líquida registrada, de jan/2024 até o mês corrente, com rótulos do eixo X no formato **Mês/Ano** compacto (ex.: Jan/24, Fev/24)
2. **Given** o filtro de ano no cabeçalho está em qualquer valor, **When** o usuário observa o DRL, **Then** a série histórica (meses com dados, 2024 até o momento) permanece visível e não fica limitada apenas ao ano filtrado
3. **Given** um mês no intervalo jan/2024–mês atual **sem** lançamento de receita líquida, **When** o usuário observa o DRL, **Then** esse mês **não aparece** no eixo nem como ponto zero
4. **Given** não há linha de comparação com outro ano, **When** o usuário lê a legenda do DRL, **Then** vê apenas a série de Receita Líquida (rótulo alinhado à nomenclatura da 039)

---

### User Story 4 - Cabeçalho simplificado e cores de Saldo padronizadas (Priority: P2)

Como usuário autenticado, o cabeçalho do Dashboard exibe apenas filtros de **Mês** e **Ano** (sem comparar anos), e na seção **Saldo** as contas correntes usam identidade visual **verde** e a conta investimento usa **azul**.

**Why this priority**: Remove ruído de comparação já substituída pelo DRL histórico; cores alinham leitura visual ao tipo de conta.

**Independent Test**: Inspecionar cabeçalho e cards de Saldo sem interagir com outros filtros.

**Acceptance Scenarios**:

1. **Given** o usuário abre o Dashboard, **When** observa o cabeçalho (Head), **Then** não há checkbox "Comparar", seletor de ano para comparação nem controles equivalentes de comparação entre anos
2. **Given** a seção Saldo renderizada, **When** o usuário visualiza os cards de contas correntes (slots 1–3), **Then** fundo, borda e tipografia seguem o esquema **verde** (análogo ao verde já usado no card investimento antes da troca)
3. **Given** a seção Saldo renderizada, **When** o usuário visualiza o card Conta Investimento, **Then** fundo, borda e tipografia seguem o esquema **azul** (análogo ao azul já usado nas correntes antes da troca)

---

### Edge Cases

- Meta anual com percentual muito baixo ou barra estreita: exibir percentual de forma legível (mesmo critério de limiar da meta mensal ou equivalente), sem sobrepor valores monetários laterais
- Saldo Conta Corrente com componentes negativos (ex.: despesas altas): exibir valor negativo formatado em moeda, sem ocultar o resultado
- Conta corrente com despesas pendentes alocadas: pendentes **não** reduzem o saldo exibido; apenas despesas pagas entram no ajuste
- Conta corrente sem saldo cadastrado mas com movimentação no recorte: aplicar fórmula tratando Saldo atual como zero quando não houver registro
- Slot de conta corrente vazio (sem conta): manter indicação "Sem conta" / "—", sem inventar cálculo
- DRL: meses sem receita líquida registrada no intervalo jan/2024–mês atual **são omitidos** do eixo (não aparecem como zero nem como lacuna explícita)
- Remoção dos filtros de comparação não deve quebrar carregamento dos demais indicadores que dependem de mês/ano
- Usuários `admin` e `visualizador` veem as mesmas correções de cálculo, cores e DRL; edição de metas permanece restrita ao admin

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A barra de progresso da **Meta de Receita Anual** MUST exibir o percentual de realização dentro da barra preenchida, calculado como **Receita Líquida acumulada no ano ÷ valor da meta anual**, seguindo o mesmo padrão de legibilidade da Meta de Receita Mensal
- **FR-002**: Cada card de **conta corrente** na seção Saldo MUST exibir saldo **por conta**, calculado como: Saldo atual registrado da conta até o recorte + receita bruta alocada à conta − impostos alocados à conta − despesas operacionais **pagas** alocadas à conta (fixas + variáveis, excluindo categoria impostos e **excluindo despesas pendentes**), com alocação via movimentos da conta no recorte — MUST NOT repetir o mesmo ajuste global de Receita/Impostos/Despesas do Dashboard nos três slots
- **FR-003**: O card **Conta Investimento** MUST continuar exibindo saldo de investimento do registro cadastral, sem aplicar a fórmula de FR-002
- **FR-004**: Os cards **Despesas Fixas**, **Despesas Variáveis** e **Despesas Pendentes** MUST NOT incluir lançamentos da categoria impostos
- **FR-005**: Os gráficos **Despesas [Mês]** e **Despesas [Ano]** no Centro de Despesa MUST NOT incluir impostos no total nem nas fatias
- **FR-006**: O gráfico **DRL** MUST ser um gráfico de linhas exibindo Receita Líquida por mês **com lançamento**, de jan/2024 até o mês corrente, como série única; meses sem dados MUST ser **omitidos** do eixo (não exibir como R$ 0); rótulos do eixo X no formato **Mês/Ano** compacto (ex.: Jan/24, Fev/24)
- **FR-007**: O DRL MUST NOT depender do ano selecionado no filtro principal para delimitar o intervalo exibido (intervalo fixo 2024 → mês atual)
- **FR-008**: O cabeçalho do Dashboard MUST NOT exibir controles de comparação entre anos (checkbox "Comparar", seletor de ano comparativo ou equivalentes)
- **FR-009**: Os cards de contas correntes na seção Saldo MUST usar esquema de cores **verde** (fundo, borda e textos de destaque)
- **FR-010**: O card Conta Investimento na seção Saldo MUST usar esquema de cores **azul** (fundo, borda e textos de destaque)
- **FR-011**: As correções de cálculo MUST usar o mesmo recorte temporal (mês/ano ou YTD) já aplicado aos demais KPIs do Dashboard quando o filtro estiver ativo, exceto o DRL (FR-006/FR-007)
- **FR-012**: Valores monetários MUST permanecer formatados em Real (BRL) conforme padrão atual do Dashboard

### Key Entities

- **Meta de Receita Anual**: Meta cadastrada para o ano (mês=0); realizado = Receita Líquida acumulada no ano; exibe valor realizado, meta e percentual na barra
- **Saldo Conta Corrente (calculado)**: Indicador **por conta**; saldo registrado ajustado pelos movimentos alocados àquela conta no recorte (entradas de receita bruta − impostos − despesas operacionais pagas, sem categoria impostos)
- **Despesa operacional**: Contas a pagar classificadas como fixas ou variáveis, pagas ou pendentes conforme o card, sempre excluindo categoria impostos
- **Série DRL**: Sequência de meses **com receita líquida registrada**, de jan/2024 até o mês corrente; meses sem dados omitidos; eixo X com rótulos Mês/Ano compactos (ex.: Jan/24)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste com meta anual cadastrada, 100% das visualizações com barra preenchida ≥ limiar de legibilidade exibem percentual dentro da barra, calculado sobre Receita Líquida acumulada no ano (mesmo critério da meta mensal)
- **SC-002**: Em amostra de 5 recortes mês/ano com dados conhecidos, o valor de cada Saldo Conta Corrente coincide com a fórmula por conta definida em FR-002 em 100% dos slots com conta ativa, e slots distintos exibem valores distintos quando os movimentos alocados diferem
- **SC-003**: Em recorte com lançamentos de impostos, soma de Fixas + Variáveis + Pendentes e totais do Centro de Despesa permanecem inalterados ao remover/zerar apenas os lançamentos de impostos (zero vazamento de impostos)
- **SC-004**: O DRL exibe apenas meses com lançamento no intervalo jan/2024–mês corrente, com rótulos Mês/Ano (ex.: Jan/24); meses sem dados não aparecem no eixo; usuário identifica tendência em menos de 30 segundos sem alternar filtro de ano
- **SC-005**: Revisão do cabeçalho confirma zero controles de comparação entre anos; filtros Mês e Ano permanecem funcionais
- **SC-006**: Inspeção visual da seção Saldo: 100% dos cards correntes em verde e investimento em azul, sem inversão residual

## Assumptions

- Cada card de Saldo Conta Corrente usa **alocação por conta** via movimentos (NFs, contas pagas, lançamentos manuais), não totais globais dos cards de Receita/Despesa repetidos em cada slot
- "Despesas" alocadas à conta = despesas operacionais **pagas** (fixas + variáveis) daquela conta, excluindo categoria impostos; **Despesas Pendentes não entram** no cálculo de saldo por conta
- "Saldo atual" = último saldo registrado da conta corrente até o mês limite do recorte (mesma base de saldo visível já usada no produto)
- Realizado da Meta de Receita Anual = **Receita Líquida** acumulada no ano (NFs pagas, após impostos), alinhada ao card Receita Líquida e à série DRL
- A remoção da comparação no cabeçalho implica remover também a linha tracejada de ano anterior no DRL
- Escopo limitado ao Dashboard; outras páginas não são alteradas
