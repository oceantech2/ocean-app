# Feature Specification: Abas Por Caixa e Por Competência no Dashboard

**Feature Branch**: `058-dashboard-caixa-competencia`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "Etapa 3 (tarefa 3) do briefing técnico 'Lógica do Dashboard Financeiro' (https://claude.ai/code/artifact/7ec34fa0-d881-490a-9daa-931430208aee) — Seção 05 (Card Receita › Aba Por Caixa) + Seção 06 (Card Receita › Aba Por Competência), tudo voltado ao Dashboard."

**Baseline**: Entrega no **Dashboard Financeiro**, na seção de **Receita**, dois modos de leitura em abas: **Por Caixa** (quanto entrou no caixa no período) e **Por Competência** (quanto foi fechado no período e em que estágio está). Complementa as etapas 1 (`056`: status derivado + Pipeline) e 2 (`057`: toggle Bruto/Líquido + Configuração do Período). Fora desta feature: Despesas & Resultado (Seção 07), Aging (Seção 08) e Alerta de Fluxo de Caixa (Seção 09).

## Clarifications

### Session 2026-09-10

- Q: O que acontece com os KPIs de Receita já existentes (Receita / Receita Pendente)? → A: **Substituir** — as abas Por Caixa / Por Competência passam a ser a leitura canônica; os cards genéricos Receita e Receita Pendente saem; o Pipeline permanece.
- Q: Meta Mensal do topo vs barras das abas? → A: **Topo permanece** (config/meta); a **barra de progresso** segue a **aba ativa** (Recebido em Por Caixa; Total Fechado em Por Competência) — uma fórmula por vez.
- Q: Qual aba abre por padrão? → A: **Por Caixa** a cada abertura do Dashboard.
- Q: Comportamento no filtro só-ano (sem mês)? → A: Abas **agregam o ano inteiro** com as mesmas regras (período = ano).
- Q: Barra de meta no modo só-ano? → A: Modo ano → **meta anual** existente; modo mês → meta mensal da Configuração do Período + fórmula da aba ativa.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Alternar entre abas Por Caixa e Por Competência (Priority: P1)

Como usuário autenticado (`admin` ou `visualizador`), na seção Receita do Dashboard vejo um card com abas **Por Caixa** e **Por Competência** (**Por Caixa** padrão). Posso alternar entre elas sem sair do Dashboard e sem perder o período selecionado nem o estado do toggle Bruto/Líquido.

**Why this priority**: É o ponto de entrada da etapa 3; sem as abas, as métricas não têm superfície de leitura gerencial.

**Independent Test**: Abrir o Dashboard no período, trocar as duas abas e confirmar que o período e o toggle permanecem; cada aba mostra seu conjunto de métricas.

**Acceptance Scenarios**:

1. **Given** o Dashboard aberto na seção Receita, **When** o usuário observa o card de receita desta feature, **Then** vê as abas **Por Caixa** e **Por Competência**, com **Por Caixa** selecionada por padrão
2. **Given** a aba Por Caixa ativa, **When** o usuário seleciona Por Competência, **Then** passa a ver as métricas de competência do mesmo período e do mesmo toggle
3. **Given** a aba Por Competência ativa, **When** o usuário volta para Por Caixa, **Then** as métricas de caixa do mesmo período/toggle reaparecem
4. **Given** o usuário estava em Por Competência e **recarrega / reabre** o Dashboard, **When** a seção Receita carrega, **Then** a aba volta a **Por Caixa** (padrão a cada abertura; não persiste a última escolha)
5. **Given** papéis `admin` e `visualizador`, **When** ambos usam as abas no mesmo período, **Then** veem as mesmas métricas e regras (somente leitura para ambos nesta feature)
6. **Given** o Dashboard após esta feature, **When** o usuário procura os cards genéricos legados **Receita** e **Receita Pendente**, **Then** esses cards **não** existem mais — a leitura de receita (além do Pipeline) é só pelas abas

---

### User Story 2 - Ler a aba Por Caixa (Priority: P1)

Como usuário autenticado, na aba **Por Caixa** entendo **quanto entrou no caixa neste mês** e o que ainda está pendente **do período selecionado** (não o estoque global em aberto). Vejo: Recebido, Impostos Recolhidos, A Receber · NFs emitidas e A Faturar · sem NF; a barra de progresso de meta (bloco do topo) usa o Recebido enquanto esta aba estiver ativa.

**Why this priority**: Responde à pergunta operacional de caixa; decisão D2 do briefing confirma o filtro de pendentes só do período.

**Independent Test**: Com Contas a Receber conhecidas (recebidas no período, emitidas pendentes do período, sem NF do período, e pendentes de outros períodos), conferir totais e que pendentes de outros períodos **não** entram.

**Acceptance Scenarios**:

1. **Given** Contas a Receber com data de recebimento no período, **When** o usuário está em Por Caixa, **Then** o total **Recebido** soma esses registros na base do toggle (líquido ou bruto)
2. **Given** registros recebidos no período com alíquota de imposto por registro, **When** o usuário lê **Impostos Recolhidos**, **Then** vê o valor absoluto calculado registro a registro a partir do valor bruto e da alíquota de cada um — **sem** mudar ao alternar o toggle
3. **Given** registros com fechamento no período, NF emitida e ainda sem recebimento, **When** o usuário lê **A Receber · NFs emitidas**, **Then** vê a soma desses registros na base do toggle
4. **Given** registros com fechamento no período, sem NF emitida e sem recebimento, **When** o usuário lê **A Faturar · sem NF**, **Then** vê a soma desses registros na base do toggle
5. **Given** Contas a Receber pendentes (emitidas ou sem NF) cujo fechamento **não** está no período selecionado, **When** o usuário está em Por Caixa, **Then** esses registros **não** entram em A Receber nem em A Faturar (não é estoque global)
6. **Given** meta do período configurada e aba Por Caixa ativa, **When** o usuário observa a barra de progresso de meta (bloco do topo / progresso do período), **Then** o percentual é `Recebido (toggle) ÷ meta_exibida (toggle) × 100` e o rótulo indica o valor Recebido na base ativa (ex.: “R$ … recebido”)
7. **Given** a mesma configuração e aba Por Caixa ativa, **When** o usuário procura uma segunda barra de meta com fórmula diferente dentro da aba, **Then** não há barra duplicada conflitando — o progresso canônico é o que segue a aba ativa

---

### User Story 3 - Ler a aba Por Competência (Priority: P1)

Como usuário autenticado, na aba **Por Competência** entendo **quanto fechamos neste mês** e em que estágio está cada parte: Total Fechado, Já Recebido, A Receber · NFs emitidas e A Faturar · sem NF; a barra de progresso de meta usa o Total Fechado enquanto esta aba estiver ativa.

**Why this priority**: Complementa a visão de caixa com a visão de competência; alinha com o Pipeline (mesmo universo de fechamento), mas em formato de KPIs/aba.

**Independent Test**: Com fechamentos conhecidos no período em cada estágio, conferir Total Fechado = Já Recebido + A Receber + A Faturar na mesma base do toggle.

**Acceptance Scenarios**:

1. **Given** Contas a Receber com data de fechamento no período, **When** o usuário está em Por Competência, **Then** **Total Fechado (Competência)** soma o universo completo na base do toggle
2. **Given** o mesmo universo, **When** o usuário lê **Já Recebido**, **Then** vê o subconjunto com data de recebimento preenchida, na base do toggle
3. **Given** o mesmo universo, **When** o usuário lê **A Receber · NFs emitidas**, **Then** vê fechados com NF emitida e sem recebimento, na base do toggle
4. **Given** o mesmo universo, **When** o usuário lê **A Faturar · sem NF**, **Then** vê fechados sem NF emitida, na base do toggle
5. **Given** Total Fechado > 0 no período, **When** o usuário soma Já Recebido + A Receber + A Faturar, **Then** o resultado iguala o Total Fechado na **mesma** base do toggle
6. **Given** meta do período configurada e aba Por Competência ativa, **When** o usuário observa a barra de progresso de meta, **Then** o percentual é `Total Fechado (toggle) ÷ meta_exibida (toggle) × 100` e o rótulo indica o Total Fechado na base ativa (ex.: “R$ … fechado”)
7. **Given** Por Competência ativa, **When** o usuário troca para Por Caixa, **Then** a mesma barra de progresso passa a usar Recebido ÷ meta_exibida (e o rótulo de “recebido”), sem manter a fórmula de competência ao mesmo tempo

---

### User Story 4 - Toggle e meta do período nas duas abas (Priority: P1)

Como usuário autenticado, ao alternar **Bruto / Líquido**, as métricas de receita das duas abas (exceto Impostos Recolhidos) e a **barra de progresso** (que segue a aba ativa) usam a mesma base e a mesma **meta exibida** da Configuração do Período (etapa 2).

**Why this priority**: Garante coerência com o eixo global do Dashboard já entregue na etapa 2.

**Independent Test**: Alternar o toggle e conferir que Recebido / Total Fechado / pendentes mudam de base; Impostos Recolhidos permanecem iguais; a barra de progresso recalcula com a mesma meta_exibida.

**Acceptance Scenarios**:

1. **Given** aba Por Caixa com valores conhecidos em líquido e bruto, **When** o usuário alterna o toggle, **Then** Recebido, A Receber e A Faturar mudam de base; Impostos Recolhidos **não** mudam
2. **Given** aba Por Competência, **When** o usuário alterna o toggle, **Then** Total Fechado, Já Recebido, A Receber e A Faturar mudam de base juntos
3. **Given** meta líquida e alíquota do período configuradas e Dashboard no **mês**, **When** o toggle está em Líquido ou Bruto, **Then** a barra de progresso (que segue a aba ativa) usa a **mesma** meta_exibida mensal da regra da etapa 2
4. **Given** período mensal sem Configuração do Período, **When** o usuário olha a barra de progresso de meta, **Then** não vê meta inventada; estado de “falta configurar” permanece claro (como na etapa 2)
5. **Given** Dashboard no modo **só-ano**, **When** o usuário olha a barra de progresso, **Then** ela usa a **meta anual** já existente no produto (não soma metas mensais nem usa meta do mês corrente), comparando com o total da aba ativa no ano (Recebido anual ou Total Fechado anual, conforme a aba)

---

### User Story 5 - Coerência com o Pipeline e o período do Dashboard (Priority: P2)

Como usuário autenticado, ao comparar Por Competência com o **Pipeline de Receita** no mesmo período e toggle, reconheço o mesmo universo de fechamento (totais e estágios alinhados). Ao mudar mês/ano do Dashboard, as duas abas e o Pipeline atualizam juntos.

**Why this priority**: Evita leitura contraditória entre cards da mesma seção Receita.

**Independent Test**: No mesmo período/toggle, Total Fechado da aba Competência = Fechado do Pipeline; A Faturar / A Receber / Já Recebido alinhados aos estágios correspondentes; trocar o mês e conferir refresh.

**Acceptance Scenarios**:

1. **Given** período com fechamentos, **When** o usuário compara Por Competência e Pipeline na mesma base do toggle, **Then** Total Fechado da aba iguala Fechado do Pipeline e os estágios correspondem (A Faturar; Faturado/A Receber; Recebido/Já Recebido)
2. **Given** Dashboard no mês M, **When** o usuário muda para o mês N, **Then** Por Caixa, Por Competência e Pipeline passam a refletir N (sem misturar períodos)
3. **Given** Dashboard no modo **só-ano** (mês omitido), **When** o usuário lê as abas, **Then** os totais agregam o **ano inteiro** com as mesmas regras (recebimento/fechamento no ano), alinhados ao Pipeline do mesmo filtro
4. **Given** registros cancelados ou excluídos conforme regras já vigentes das etapas anteriores, **When** o usuário lê as abas, **Then** esses registros **não** entram nos totais

---

### Edge Cases

- Período sem nenhum recebimento: Recebido = 0; barra Por Caixa em 0% (se houver meta); Impostos Recolhidos = 0
- Período sem nenhum fechamento: Total Fechado = 0; Já Recebido / A Receber / A Faturar = 0; barra Por Competência sem percentual enganoso (0% ou estado “sem base”, sem divisão inválida)
- Meta ausente: métricas de receita continuam; a barra de progresso não inventa percentual sobre meta fictícia
- Impostos Recolhidos: registro recebido sem alíquota de imposto no cadastro contribui 0 (ou equivalente explícito) naquele registro — não inventar alíquota só para o card
- “A Faturar” em Por Caixa/Competência: registros sem NF; estimativa de imposto futuro (alíquota do período) **não** é exigida como card nesta feature — só os valores de receita na base do toggle
- Pendentes de outros períodos: visíveis no Aging futuro (Seção 08), **não** nas métricas pendentes de Por Caixa
- Toggle não altera Impostos Recolhidos nem despesas (despesas fora desta feature)
- `visualizador` e `admin` têm a mesma leitura nas abas; não há edição nestas abas
- Bloco de Configuração/Meta do topo permanece; ao trocar de aba, a barra de progresso recalcula na fórmula da aba ativa (sem barra duplicada)
- Aba padrão a cada abertura do Dashboard: **Por Caixa** (troca manual não é lembrada entre aberturas)
- Modo só-ano: abas agregam o ano inteiro (mesmas regras; período = ano); barra de meta usa **meta anual** (não soma metas mensais)
- Arredondamento monetário e de percentual consistente com o restante do Dashboard (máximo R$ 0,01 / 0,1 p.p. de tolerância em testes)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O Dashboard MUST exibir, na seção Receita, um card com abas **Por Caixa** e **Por Competência**
- **FR-001a**: As abas MUST **substituir** os cards genéricos legados de **Receita** e **Receita Pendente**; MUST NOT manter esses cards em paralelo às abas
- **FR-001b**: O card **Pipeline de Receita** MUST permanecer no Dashboard (não é removido por esta feature)
- **FR-001c**: Ao abrir o Dashboard, a aba ativa MUST ser **Por Caixa** por padrão; MUST NOT persistir a última aba entre aberturas nesta feature
- **FR-002**: A troca de aba MUST preservar o período selecionado no Dashboard e o estado do toggle Bruto/Líquido
- **FR-003**: Usuários `admin` e `visualizador` MUST poder consultar as duas abas; esta feature MUST NOT exigir edição nessas abas
- **FR-004**: Aba **Por Caixa** MUST usar como filtro base registros com **data de recebimento** no período selecionado para a métrica **Recebido**
- **FR-005**: Em Por Caixa, **Impostos Recolhidos** MUST ser a soma, registro a registro, de (valor bruto × alíquota de imposto do registro) para recebimentos no período, e MUST NOT variar com o toggle
- **FR-006**: Em Por Caixa, **A Receber · NFs emitidas** MUST incluir apenas registros com fechamento no período, NF emitida e sem recebimento
- **FR-007**: Em Por Caixa, **A Faturar · sem NF** MUST incluir apenas registros com fechamento no período, sem NF emitida e sem recebimento
- **FR-008**: Em Por Caixa, métricas pendentes (A Receber / A Faturar) MUST NOT incluir estoque global em aberto fora do período de fechamento (decisão D2 do briefing)
- **FR-009**: Com a aba **Por Caixa** ativa e Dashboard no **mês**, a barra de progresso de meta MUST calcular `Recebido (toggle) ÷ meta_exibida_mensal (toggle) × 100` quando a meta mensal estiver disponível, com rótulo baseado no Recebido
- **FR-009a**: O bloco de Configuração / Meta do período no topo MUST **permanecer**; MUST NOT haver segunda barra de meta com fórmula diferente coexistindo ao mesmo tempo
- **FR-009b**: A barra de progresso canônica MUST **seguir a aba ativa** (Por Caixa → Recebido; Por Competência → Total Fechado)
- **FR-009c**: No modo **só-ano**, a barra de progresso MUST usar a **meta anual** já existente no produto ÷ total da aba ativa no ano (Recebido ou Total Fechado, conforme a aba); MUST NOT somar metas mensais nem usar a meta do mês corrente como denominador do ano
- **FR-010**: Aba **Por Competência** MUST usar como filtro base registros com **data de fechamento** no período selecionado
- **FR-011**: Em Por Competência, MUST exibir **Total Fechado**, **Já Recebido**, **A Receber · NFs emitidas** e **A Faturar · sem NF** conforme as condições do briefing (fechamento no período + datas de emissão/recebimento)
- **FR-012**: Em Por Competência, Já Recebido + A Receber + A Faturar MUST igualar Total Fechado na mesma base do toggle
- **FR-013**: Com a aba **Por Competência** ativa e Dashboard no **mês**, a barra de progresso de meta MUST calcular `Total Fechado (toggle) ÷ meta_exibida_mensal (toggle) × 100` quando a meta mensal estiver disponível, com rótulo baseado no Total Fechado
- **FR-014**: Valores monetários de receita das abas (exceto Impostos Recolhidos) MUST respeitar o toggle Bruto/Líquido da etapa 2
- **FR-015**: No modo mês, a barra de progresso MUST usar a **mesma** meta_exibida mensal da Configuração do Período (etapa 2)
- **FR-016**: Período mensal sem configuração de meta MUST NOT inventar meta nem percentual de meta enganoso na barra de progresso; no modo ano, ausência de meta anual segue o comportamento já vigente do produto para meta anual
- **FR-017**: No mesmo período e toggle, Total Fechado da aba Por Competência MUST coincidir com Fechado do Pipeline, e os estágios MUST ser coerentes entre os dois cards
- **FR-018**: Ao mudar mês/ano do Dashboard, as abas MUST atualizar os totais para o novo período
- **FR-018a**: Quando o Dashboard estiver no modo **só-ano** (mês omitido), as abas MUST agregar o **ano inteiro** com as mesmas regras de filtro (recebimento no ano para Caixa/Recebido; fechamento no ano para Competência e pendentes de Caixa)
- **FR-019**: Registros cancelados/excluídos (regras já vigentes) MUST NOT entrar nos totais das abas
- **FR-020**: Esta feature MUST NOT implementar Despesas & Resultado (07), Aging (08) nem Alerta de Fluxo de Caixa (09)

### Key Entities

- **Aba Por Caixa**: Visão de receita do Dashboard filtrada por entrada de caixa no período (recebimento), com pendências limitadas ao fechamento do mesmo período
- **Aba Por Competência**: Visão de receita do Dashboard filtrada por fechamento no período, decomposta em já recebido / a receber / a faturar
- **Meta exibida**: No modo mês, valor da Configuração do Período conforme o toggle (etapa 2); no modo só-ano, a **meta anual** já existente no produto; base da barra de progresso junto com a métrica da aba ativa
- **Conta a Receber**: Já existente; datas de fechamento, emissão de NF, recebimento, vencimento; valores bruto/líquido; alíquota de imposto por registro (para Impostos Recolhidos)
- **Toggle Bruto/Líquido**: Controle global já existente (etapa 2) que define a base monetária das métricas de receita das abas

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em fixture com totais conhecidos, 100% das métricas de Por Caixa e Por Competência batem com o esperado (tolerância ≤ R$ 0,01 por total)
- **SC-002**: Em Por Caixa, 0 registros pendentes com fechamento fora do período aparecem em A Receber ou A Faturar
- **SC-003**: Em Por Competência com Total Fechado > 0, |Já Recebido + A Receber + A Faturar − Total Fechado| = 0 na base ativa do toggle
- **SC-004**: Alternar Bruto ↔ Líquido atualiza as métricas de receita das abas (exceto Impostos Recolhidos) na mesma ação; Impostos Recolhidos permanecem iguais em 100% dos testes
- **SC-005**: Com meta mensal configurada, mês selecionado e Por Caixa ativa, percentual da barra difere em no máximo 0,1 p.p. de `Recebido ÷ meta_exibida_mensal × 100`; com Por Competência ativa, de `Total Fechado ÷ meta_exibida_mensal × 100`
- **SC-005a**: Em 100% dos testes, não há duas barras de meta com fórmulas diferentes visíveis ao mesmo tempo
- **SC-005b**: No modo só-ano com meta anual conhecida, percentual da barra difere em no máximo 0,1 p.p. de `total_aba_ativa_ano ÷ meta_anual × 100` (total = Recebido ou Total Fechado conforme a aba)
- **SC-006**: No mesmo período/toggle, |Total Fechado (Competência) − Fechado (Pipeline)| = 0 e estágios correspondentes alinhados em 100% dos casos de teste (incluindo modo só-ano)
- **SC-011**: Em fixture anual conhecida, totais das abas no modo só-ano batem com a soma dos meses do ano (tolerância ≤ R$ 0,01)
- **SC-007**: Usuário autentica e identifica as duas abas e seus totais principais em menos de 1 minuto sem treinamento adicional
- **SC-008**: `visualizador` e `admin` obtêm os mesmos totais nas abas; não há ação de edição nestas abas
- **SC-009**: Após a entrega, 0 ocorrências dos cards genéricos legados Receita / Receita Pendente permanecem na seção Receita; Pipeline continua visível
- **SC-010**: Em 100% das aberturas do Dashboard testadas, a aba inicial é Por Caixa

## Assumptions

- Escopo = Seção 05 + Seção 06 do briefing; entrega 100% no **Dashboard**
- Conta a Receber / NF e mapeamento de datas (fechamento, emissão, recebimento) seguem as decisões já fechadas nas etapas 1 e 2
- Toggle Bruto/Líquido e Configuração do Período (meta + alíquota) já existem ou são entregues pela etapa 2 antes ou em conjunto desta feature
- Pipeline da etapa 1 permanece no Dashboard; esta feature adiciona as abas sem remover o Pipeline
- Decisão D2 do briefing aplica-se: pendentes de Por Caixa = só período selecionado (por data de fechamento)
- Impostos Recolhidos usam alíquota **do registro** (não a alíquota do período) × valor bruto, apenas para recebidos no período
- Os cards genéricos legados **Receita** e **Receita Pendente** são **removidos** e substituídos pelas abas; o Pipeline permanece
- O bloco de Configuração/Meta do período no topo permanece; a barra de progresso segue a aba ativa (não há duas barras com fórmulas diferentes ao mesmo tempo)
- Aba padrão = Por Caixa a cada abertura (sem persistência da última escolha nesta feature)
- Modo só-ano do Dashboard: abas agregam o ano inteiro, coerentes com o Pipeline no mesmo filtro; barra de progresso usa meta anual existente
- Papéis `admin` e `visualizador` inalterados além da consulta
- Esta feature não redefine a meta anual; apenas a consome no modo só-ano

## Out of Scope

- Card Despesas & Resultado e fórmulas de Resultado Caixa/Competência (Seção 07)
- Aging de Recebíveis e buckets por vencimento (Seção 08)
- Alerta de Fluxo de Caixa e limiar configurável (Seção 09)
- Estoque global de pendentes na aba Por Caixa (explicitamente rejeitado pela D2)
- Edição de Contas a Receber / Contas a Pagar a partir destas abas
- Novos papéis de usuário
- Alterar regras do Pipeline ou da Configuração do Período além do consumo coerente nas abas
- Manter os cards genéricos legados Receita / Receita Pendente em paralelo às abas
- Somar metas mensais para inventar meta anual
- Redesenhar ou substituir o cadastro da meta anual
