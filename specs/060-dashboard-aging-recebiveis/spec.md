# Feature Specification: Aging de Recebíveis no Dashboard

**Feature Branch**: `060-dashboard-aging-recebiveis`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "Módulo 5 do briefing técnico 'Lógica do Dashboard Financeiro' (https://claude.ai/code/artifact/7ec34fa0-d881-490a-9daa-931430208aee) — Seção 08 (Card Aging de Recebíveis), tudo voltado ao Dashboard."

**Baseline**: Entrega no **Dashboard Financeiro** o card **Aging de Recebíveis** alinhado à Seção 08 do briefing: estoque **total** de NFs em aberto (emitidas e ainda não recebidas), **independente** do mês/ano selecionado no Dashboard, distribuído em quatro buckets por atraso relativo a `data_vencimento_nf` (hoje). Valores e percentuais seguem o toggle Bruto/Líquido. Complementa as etapas 1–4 (`056` status/Pipeline, `057` toggle + Configuração do Período, `058` abas Por Caixa / Por Competência, `059` Despesas & Resultado). Fora desta feature: Alerta de Fluxo de Caixa (Seção 09).

## Clarifications

### Session 2026-09-10

- Q: Como tratar o estoque residual (sem vencimento ou a vencer além de 30 dias) na UI? → A: **Só no total em aberto** — sem linha/bucket extra; os quatro buckets somam ≤ 100%.
- Q: Rótulo “30–60 dias” vs condição de atraso 1–60? → A: **Manter condição 1–60** e **renomear** o rótulo para **1–60 dias** (condição do briefing prevalece sobre o rótulo original).
- Q: Mostrar quantidade (COUNT) de NFs por bucket? → A: **Não** — só valor + % + ação/cor.
- Q: Exibir Total em aberto no card? → A: **Sim** — valor visível no cabeçalho/resumo do card.
- Q: Aviso quando a soma dos % dos buckets for &lt; 100%? → A: **Não** — sem texto explicativo; residual permanece implícito.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver o estoque aberto em quatro buckets de aging (Priority: P1)

Como usuário autenticado (`admin` ou `visualizador`), no Dashboard vejo o card **Aging de Recebíveis** com o estoque total de Contas a Receber em aberto com NF emitida e ainda sem recebimento, classificado em quatro buckets: **A vencer · &lt;30d**, **1–60 dias**, **60–90 dias** e **+90 dias**, cada um com soma de valor, percentual sobre o total em aberto, cor e ação recomendada do briefing.

**Why this priority**: É a leitura de risco de cobrança/inadimplência; sem o card, o Dashboard não mostra o atraso do estoque aberto.

**Independent Test**: Com Contas a Receber abertas (NF emitida, sem recebimento) com vencimentos conhecidos relativos a hoje, conferir que cada registro cai no bucket certo e que a soma dos buckets + eventuais fora de bucket bate com o total em aberto.

**Acceptance Scenarios**:

1. **Given** Contas a Receber com data de emissão de NF preenchida e data de recebimento em branco, **When** o usuário abre o Aging, **Then** esses registros entram no **universo** do card (estoque em aberto)
2. **Given** Contas a Receber sem emissão de NF ou já recebidas, **When** o usuário lê o Aging, **Then** **não** entram no universo
3. **Given** vencimento entre hoje e hoje+30 dias (inclusive), **When** o usuário lê o card, **Then** o valor entra no bucket **A vencer · &lt;30d** (cor verde; ação: Monitorar)
4. **Given** `hoje − data_vencimento_nf` entre 1 e 60 dias (inclusive), **When** o usuário lê o card, **Then** o valor entra no bucket **1–60 dias** (cor âmbar; ação: Cobrar ativamente)
5. **Given** `hoje − data_vencimento_nf` entre 61 e 90 dias (inclusive), **When** o usuário lê o card, **Then** o valor entra no bucket **60–90 dias** (cor laranja; ação: Escalar)
6. **Given** `hoje − data_vencimento_nf` maior que 90 dias, **When** o usuário lê o card, **Then** o valor entra no bucket **+90 dias** (cor vermelha; ação: Inadimplência — acionar jurídico)
7. **Given** papéis `admin` e `visualizador`, **When** ambos abrem o Dashboard, **Then** veem os mesmos totais e percentuais do Aging (somente leitura nesta feature)

---

### User Story 2 - Aging independente do período do Dashboard (Priority: P1)

Como usuário autenticado, ao mudar o filtro de mês/ano do Dashboard, o Aging **não** se restringe ao período: continua mostrando o estoque total em aberto “até hoje”, enquanto as demais seções (Pipeline, abas de receita, Despesas & Resultado) continuam filtradas pelo período.

**Why this priority**: O briefing define o Aging como estoque global; misturar com o filtro de mês gera leitura errada de risco.

**Independent Test**: Ter abertos com fechamento/emissão em meses distintos; mudar o mês do Dashboard e confirmar que o Aging permanece o mesmo estoque total.

**Acceptance Scenarios**:

1. **Given** NFs em aberto com datas de fechamento/emissão em meses diferentes, **When** o usuário troca o mês (ou o ano) do Dashboard, **Then** os totais e buckets do Aging **permanecem** os do estoque total em aberto (não filtrados pelo período)
2. **Given** o modo só-ano no filtro do Dashboard, **When** o usuário lê o Aging, **Then** o comportamento é o mesmo: estoque total em aberto, sem filtrar pelo ano selecionado
3. **Given** Pipeline / Por Caixa / Por Competência no período M, **When** o usuário compara com o Aging, **Then** o Aging pode incluir NFs de outros períodos (é esperado e desejado)

---

### User Story 3 - Toggle Bruto/Líquido nos valores e percentuais (Priority: P1)

Como usuário autenticado, ao alternar Bruto ↔ Líquido, os valores absolutos e os percentuais de cada bucket do Aging passam à base correspondente, sem mudar a composição dos buckets (quem entra em qual faixa).

**Why this priority**: Mantém coerência com o restante do Dashboard (toggle global da etapa 2).

**Independent Test**: Alternar o toggle e conferir que só a base de valor muda; o universo e as atribuições de bucket permanecem.

**Acceptance Scenarios**:

1. **Given** Aging carregado em Líquido, **When** o usuário troca para Bruto, **Then** SUM(valor) de cada bucket e do total em aberto passam à base bruta
2. **Given** a mesma troca, **When** o usuário observa os percentuais, **Then** cada bucket mostra `SUM(valor do bucket) ÷ SUM(valor total em aberto) × 100` na nova base
3. **Given** a mesma troca, **When** o usuário observa quais registros estão em cada bucket, **Then** a classificação por vencimento **não** muda (só o valor)

---

### User Story 4 - Ler total, cor, ação e percentual por bucket (Priority: P2)

Como usuário autenticado, vejo o **Total em aberto** no cabeçalho do card e, em cada bucket, risco legível: rótulo, faixa, cor semântica, ação recomendada e percentual sobre esse total.

**Why this priority**: Orienta a cobrança sem exigir abrir a listagem de Contas a Receber e deixa explícito o denominador dos percentuais.

**Independent Test**: Com total em aberto > 0 e pelo menos um bucket preenchido, conferir total no cabeçalho, percentual e que a ação/cor do briefing estão visíveis.

**Acceptance Scenarios**:

1. **Given** estoque em aberto com valor > 0, **When** o usuário abre o Aging, **Then** vê o **Total em aberto** no cabeçalho/resumo do card na base do toggle
2. **Given** total em aberto > 0 e um bucket com valor > 0, **When** o usuário lê o percentual desse bucket, **Then** vê `SUM(bucket) ÷ SUM(total aberto) × 100` na base do toggle (denominador = total exibido)
3. **Given** total em aberto = 0, **When** o usuário abre o Aging, **Then** vê estado vazio/zerado legível (total zero; sem percentuais inventados)
4. **Given** o card Aging, **When** o usuário observa os quatro buckets, **Then** identifica as ações: Monitorar / Cobrar ativamente / Escalar / Inadimplência — acionar jurídico
5. **Given** o toggle em Líquido, **When** o usuário troca para Bruto, **Then** o Total em aberto do cabeçalho também muda de base

---

### Edge Cases

- Conta a Receber com NF emitida, sem recebimento, mas **sem** `data_vencimento_nf`: entra no universo de “em aberto”, porém **não** é classificada em nenhum dos quatro buckets (não há como medir atraso); o valor permanece no total em aberto e reduz a soma dos percentuais dos buckets a menos de 100%; **sem** aviso/texto explicativo no card
- Conta com vencimento **depois** de hoje+30 dias: mesma lógica — no estoque total, fora dos quatro buckets nomeados; **sem** aviso dedicado
- Conta com vencimento = hoje: entra em **A vencer · &lt;30d**
- Conta vencida há exatamente 60 dias: entra em **1–60 dias**; há exatamente 61: entra em **60–90 dias**
- Conta vencida há 1–29 dias: entra em **1–60 dias** (não fica residual)
- Conta cancelada/excluída: permanece fora do Aging (mesmo critério de exclusão já usado no Pipeline / Dashboard)
- Alternância de toggle com total aberto = 0: continua zerado nas duas bases
- Fuso/“hoje”: a data de referência do aging é a **data civil de hoje** do ambiente operacional do produto (mesmo padrão de datas civis do Dashboard)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O Dashboard MUST exibir o card **Aging de Recebíveis** com o **Total em aberto** visível no cabeçalho/resumo do card (soma do universo na base do toggle)
- **FR-002**: O universo do Aging MUST ser Contas a Receber com data de emissão de NF preenchida **e** data de recebimento em branco
- **FR-003**: O Aging MUST medir atraso a partir de `data_vencimento_nf` em relação à data de hoje
- **FR-004**: O Aging MUST **não** filtrar pelo período (mês/ano) selecionado no Dashboard — estoque total em aberto
- **FR-005**: O sistema MUST classificar o estoque nos buckets: **A vencer · &lt;30d** (`data_vencimento_nf` entre hoje e hoje+30, inclusive); **1–60 dias** (`hoje − vencimento` entre 1 e 60); **60–90 dias** (entre 61 e 90); **+90 dias** (`hoje − vencimento` > 90). O rótulo canônico do 2º bucket é **1–60 dias** (não “30–60 dias” do briefing original)
- **FR-006**: Cada bucket MUST exibir soma de valor na base do toggle Bruto/Líquido, percentual sobre o total em aberto na mesma base, cor e ação recomendada do briefing; MUST NOT exigir contagem (COUNT) de NFs por bucket nesta entrega
- **FR-007**: O percentual de cada bucket MUST ser `SUM(valor do bucket) ÷ SUM(valor total em aberto) × 100` quando o total em aberto for > 0; caso contrário, percentuais MUST ficar indisponíveis (não inventados)
- **FR-008**: Ao alternar o toggle, o Total em aberto do cabeçalho, os valores dos buckets e os percentuais MUST atualizar de base; a composição dos buckets MUST permanecer a mesma
- **FR-009**: Contas sem `data_vencimento_nf` (ou com vencimento além de hoje+30 sem caber em outro bucket) MUST permanecer no total em aberto e MUST NOT ser forçadas a um bucket incorreto; o card MUST NOT exibir linha/bucket residual (“Outros” / “Sem vencimento” / “A vencer &gt;30d”) nem aviso/texto explicando soma de percentuais &lt; 100% — o residual fica implícito
- **FR-010**: Cancelados/excluídos MUST permanecer fora do Aging, alinhados à exclusão já usada nas leituras de receita do Dashboard
- **FR-011**: `admin` e `visualizador` MUST ver os mesmos números; esta feature não introduz edição no Aging
- **FR-012**: Esta feature MUST NOT implementar o Alerta de Fluxo de Caixa (Seção 09), ainda que o alerta futuro consuma o bucket 60–90 (“Aging em atenção”)
- **FR-013**: O card Aging MUST ser distinguível das seções de receita por período (Pipeline / Por Caixa / Por Competência), deixando claro que é estoque global
- **FR-014**: O card Aging MUST NOT exibir contagem de NFs por bucket nem como métrica obrigatória do total (somente valor monetário e percentuais)

### Key Entities

- **Conta a Receber (em aberto no Aging)**: Registro com NF emitida e sem recebimento; usa `data_vencimento_nf` para o atraso e valor bruto/líquido conforme o toggle
- **Bucket de Aging**: Faixa de risco (A vencer &lt;30d / 1–60 / 60–90 / +90) com soma, percentual, cor e ação recomendada
- **Estoque total em aberto**: Soma de todas as Contas a Receber do universo do card, independente do período do Dashboard
- **Toggle Bruto/Líquido**: Define a base de valor dos totais e percentuais do Aging

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em fixture com vencimentos controlados relativos a hoje, 100% dos registros com vencimento preenchido caem no bucket cuja condição do briefing os descreve (tolerância de classificação = zero erros)
- **SC-002**: Em 100% das trocas de mês/ano do Dashboard, os totais do Aging permanecem os do estoque total em aberto (não variam com o período)
- **SC-003**: Em 100% das alternâncias Bruto ↔ Líquido, a atribuição registro→bucket permanece idêntica e apenas a base monetária muda
- **SC-004**: Com total em aberto > 0, cada percentual exibido difere em no máximo 0,1 ponto percentual de `SUM(bucket) ÷ SUM(total) × 100`
- **SC-005**: Em fixture mista (com e sem vencimento; a vencer &gt;30d), o total em aberto inclui todos os elegíveis e nenhum registro sem condição válida é forçado a um bucket errado
- **SC-006**: Em checklist visual, o Total em aberto no cabeçalho, os quatro buckets, cores e ações recomendadas estão presentes e distinguíveis; o card não se apresenta como filtrado pelo mês selecionado
- **SC-009**: Em 100% dos cenários com estoque > 0, o Total em aberto exibido difere em no máximo R$ 0,01 da soma do universo do Aging na base do toggle
- **SC-007**: `visualizador` e `admin` obtêm os mesmos totais em 100% das comparações no mesmo momento
- **SC-008**: Usuário identifica o risco do estoque aberto (qual faixa concentra valor) em até 10 segundos de leitura do card em cenário de demonstração com dados preenchidos

## Assumptions

- Escopo = Seção 08 do briefing; entrega 100% no **Dashboard**
- Campo `data_vencimento_nf` já existe no modelo de Conta a Receber (decisão D1 do briefing); sem prazo padrão — cada NF deve ter vencimento próprio no cadastro
- Universo canônico: emissão de NF preenchida **e** recebimento em branco (alinha a “NFs em aberto”)
- Classificação usa as **condições** numéricas do briefing; o 2º bucket é rotulado **1–60 dias** para bater com a condição (clarify 2026-09-10; substitui o rótulo “30–60 dias” do briefing)
- NFs a vencer além de 30 dias e registros sem vencimento entram no total em aberto, mas ficam fora dos quatro buckets nomeados; **sem** linha residual dedicada nem aviso textual na UI (clarify 2026-09-10)
- O Aging **não** cria drill-down obrigatório para a listagem de Contas a Receber nesta entrega (somente leitura agregada)
- Contagem de NFs (COUNT) por bucket ou no total **não** faz parte desta entrega (clarify 2026-09-10)
- Total em aberto é métrica visível no cabeçalho do card (clarify 2026-09-10)
- Papéis `admin` / `visualizador` inalterados
- Alerta de Fluxo de Caixa (09) consumirá depois o bucket 60–90 como “Aging em atenção”; não faz parte desta feature

## Out of Scope

- Alerta de Fluxo de Caixa e limiar configurável (Seção 09)
- Edição/CRUD de Contas a Receber ou preenchimento em massa de `data_vencimento_nf`
- Filtrar o Aging pelo período do Dashboard
- Drill-down obrigatório por bucket para a listagem
- Contagem (COUNT) de NFs por bucket ou no total como métrica do card
- Aviso/texto explicativo quando a soma dos percentuais dos buckets for &lt; 100%
- Novos papéis de usuário
- Alteração das regras de Pipeline, abas Por Caixa/Competência ou Despesas & Resultado
