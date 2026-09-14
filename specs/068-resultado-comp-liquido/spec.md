# Feature Specification: Resultado Competência fixo em líquido

**Feature Branch**: `068-resultado-comp-liquido`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "resultado competencia ele manter o valor do \"liquido\" para bruto e liquido igual o campo de \"Impostos Recolhidos\""

**Baseline**: No Dashboard, o card **Resultado Competência** (bloco Despesas & Resultado, feature `059`) hoje acompanha o toggle Bruto/Líquido na receita de competência. O campo **Impostos Recolhidos** (aba Por Caixa, feature `058`) já permanece constante nas duas bases. Esta feature alinha o Resultado Competência a esse padrão: valor e percentual sempre na base **líquida**, independentemente do toggle, com subtítulo fixo **“base líquida”**. **Resultado Caixa** continua seguindo o toggle e **não** ganha esse subtítulo nesta entrega.

## Clarifications

### Session 2026-09-14

- Q: Resultado Caixa também fica fixo em líquido? → A: Não — só Resultado Competência fixo em líquido; Resultado Caixa continua seguindo o toggle
- Q: Indicação visual no card Resultado Competência? → A: Sempre exibir subtítulo/hint fixo “base líquida” (nas duas posições do toggle)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Resultado Competência estável no toggle (Priority: P1)

Como usuário autenticado (`admin` ou `visualizador`), ao alternar Bruto ↔ Líquido no Dashboard, o card **Resultado Competência** mantém o mesmo valor e o mesmo percentual que eu via em Líquido — no mesmo padrão de estabilidade do campo **Impostos Recolhidos**, que também não muda com o toggle — e exibe sempre o subtítulo **“base líquida”**.

**Why this priority**: Remove a leitura ambígua de “resultado de competência em bruto” e deixa explícito que o card está ancorado no líquido.

**Independent Test**: Com receita de competência bruta ≠ líquida e despesas pagas conhecidas, abrir o Dashboard em Líquido, anotar Resultado Competência e o subtítulo; trocar para Bruto e confirmar que valor, percentual e subtítulo “base líquida” permanecem; Impostos Recolhidos também permanece igual.

**Acceptance Scenarios**:

1. **Given** o Dashboard no período com Total Fechado líquido e bruto distintos e despesas pagas no período, **When** o toggle está em **Líquido**, **Then** Resultado Competência = `receita_comp_líquida − despesas_totais`, o percentual usa a receita líquida de competência e o card exibe o subtítulo **“base líquida”**
2. **Given** o mesmo período e os mesmos dados, **When** o usuário troca o toggle para **Bruto**, **Then** o valor e o percentual de **Resultado Competência** permanecem **numericamente iguais** aos observados em Líquido e o subtítulo **“base líquida”** continua visível
3. **Given** o toggle em Bruto, **When** o usuário compara Resultado Competência com Impostos Recolhidos quanto à reação ao toggle, **Then** ambos permanecem inalterados ao alternar Bruto ↔ Líquido
4. **Given** papéis `admin` e `visualizador`, **When** ambos abrem o mesmo período e alternam o toggle, **Then** veem o mesmo Resultado Competência estável com o mesmo subtítulo (somente leitura)

---

### User Story 2 - Resultado Caixa e demais métricas intactas (Priority: P1)

Como usuário autenticado, ao mudar o toggle, **Resultado Caixa**, as abas de receita (exceto Impostos Recolhidos) e as demais métricas que já respondem ao toggle continuam mudando normalmente; só o Resultado Competência passa a ficar fixo na base líquida (com subtítulo “base líquida”). O card Caixa **não** recebe esse subtítulo nesta feature.

**Why this priority**: Isola a correção ao card de competência e evita regressão no restante do Dashboard.

**Independent Test**: Alternar Bruto ↔ Líquido e verificar que Resultado Caixa muda com a base e sem subtítulo “base líquida”; Resultado Competência não muda e mantém o subtítulo; despesas Fixas/Variáveis/Pendentes seguem indiferentes ao toggle.

**Acceptance Scenarios**:

1. **Given** receita de caixa bruta ≠ líquida no período, **When** o usuário alterna Bruto ↔ Líquido, **Then** **Resultado Caixa** (valor e percentual) atualiza conforme a base ativa do toggle
2. **Given** o mesmo alternar, **When** o usuário lê Despesas Fixas, Variáveis e Pendentes, **Then** os três totais permanecem iguais (comportamento já existente)
3. **Given** o toggle em Bruto, **When** o usuário compara a receita usada no Resultado Competência com o Total Fechado exibido na aba Por Competência, **Then** o Resultado Competência continua baseado no **líquido** (Total Fechado líquido), mesmo que a aba mostre o bruto
4. **Given** os dois cards de Resultado lado a lado, **When** o usuário observa os rótulos, **Then** apenas **Resultado Competência** exibe o subtítulo **“base líquida”**; Resultado Caixa não o exibe

---

### User Story 3 - Coerência de período e casos sem receita (Priority: P2)

Como usuário autenticado, ao mudar mês/ano (ou modo só-ano), o Resultado Competência recalcula para o novo período sempre na base líquida (com subtítulo “base líquida”); se a receita líquida de competência for zero, o percentual permanece indisponível sem inventar número.

**Why this priority**: Mantém as regras de período e percentual já aceitas em `059`, só travando a base e tornando a base explícita no card.

**Independent Test**: Mudar período com dados conhecidos; conferir recálculo em líquido, subtítulo presente e percentual omitido quando receita líquida de competência = 0.

**Acceptance Scenarios**:

1. **Given** Dashboard no mês M com Resultado Competência conhecido, **When** o usuário muda para o mês N, **Then** o card passa a refletir N na base líquida (independente do toggle) e mantém o subtítulo **“base líquida”**
2. **Given** modo só-ano, **When** o usuário lê Resultado Competência, **Then** a agregação é do ano inteiro na base líquida com o mesmo subtítulo
3. **Given** receita líquida de competência = 0 no período, **When** o usuário lê o percentual do Resultado Competência, **Then** o percentual fica omitido/indisponível, o valor do resultado (receita líquida − despesas) continua exibido e o subtítulo **“base líquida”** permanece

---

### Edge Cases

- Período sem Contas a Receber fechadas: receita líquida de competência = 0; Resultado Competência = `0 − despesas_totais` (pode ser negativo); percentual indisponível; subtítulo “base líquida” permanece
- Período sem despesas pagas: Resultado Competência = receita líquida de competência; percentual 100% se receita líquida > 0; subtítulo permanece
- Bruto e líquido de competência iguais no período: card permanece igual ao alternar (comportamento trivial); subtítulo permanece
- Resultado negativo: valor e percentual negativos continuam legíveis, sem mascarar prejuízo
- Impostos Recolhidos continua absoluto e independente desta fórmula; esta feature não altera o cálculo de Impostos Recolhidos, apenas usa o mesmo critério de “não seguir o toggle”
- Resultado Caixa não exibe “base líquida” mesmo quando o toggle está em Líquido

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O card **Resultado Competência** MUST calcular `receita_comp_líquida − despesas_totais`, onde `receita_comp_líquida` é a receita de competência do período na base **líquida** (equivalente ao Total Fechado líquido) e `despesas_totais = Fixas + Variáveis` pagas no período
- **FR-002**: O percentual do Resultado Competência MUST ser `resultado_comp ÷ receita_comp_líquida × 100` quando `receita_comp_líquida > 0`; caso contrário, MUST permanecer indisponível
- **FR-003**: Ao alternar o toggle Bruto ↔ Líquido, o valor e o percentual de **Resultado Competência** MUST permanecer **inalterados** (mesmo padrão de estabilidade do campo **Impostos Recolhidos**)
- **FR-004**: **Resultado Caixa** MUST continuar usando a receita de caixa na base **ativa do toggle** (sem mudança de regra nesta feature)
- **FR-005**: Despesas usadas na fórmula MUST permanecer indiferentes ao toggle (regra já vigente)
- **FR-006**: A estabilidade do Resultado Competência MUST valer no modo mês e no modo só-ano
- **FR-007**: `admin` e `visualizador` MUST ver o mesmo Resultado Competência; esta feature não introduz edição
- **FR-008**: Esta feature MUST NOT alterar o cálculo ou a exibição de **Impostos Recolhidos**, das abas de receita, do Pipeline (se ainda existir), do Aging, do Alerta de Fluxo ou dos cards de Despesas Fixas/Variáveis/Pendentes além do necessário para o Resultado Competência
- **FR-009**: O card **Resultado Competência** MUST exibir sempre o subtítulo canônico **“base líquida”**, em ambas as posições do toggle e em todos os períodos (mês ou só-ano)
- **FR-010**: O card **Resultado Caixa** MUST NOT receber o subtítulo “base líquida” nesta feature

### Key Entities

- **Resultado Competência**: Leitura derivada do Dashboard; sempre ancorada na receita líquida de competência do período; exibe subtítulo fixo “base líquida”
- **Toggle Bruto/Líquido**: Continua afetando Resultado Caixa e métricas de receita que já respondem ao toggle; **não** afeta Resultado Competência nem Impostos Recolhidos
- **Impostos Recolhidos**: Referência de comportamento (valor estável no toggle); não é insumo da fórmula do Resultado Competência
- **Despesas totais do período**: Fixas + Variáveis com pagamento no período; inalteradas por esta feature

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em fixture com Total Fechado bruto ≠ líquido e despesas conhecidas, em 100% das alternâncias Bruto ↔ Líquido no mesmo período, valor e percentual de Resultado Competência permanecem numericamente iguais (tolerância R$ 0,01 / 0,1 p.p.)
- **SC-002**: No mesmo fixture, Resultado Competência difere em no máximo R$ 0,01 de `Total Fechado líquido − (Fixas + Variáveis)` e o percentual, quando aplicável, difere em no máximo 0,1 p.p. de `resultado ÷ Total Fechado líquido × 100`
- **SC-003**: Em 100% das alternâncias do mesmo fixture, Resultado Caixa continua mudando quando bruto ≠ líquido (regressão zero no card Caixa)
- **SC-004**: Em checklist visual lado a lado, Resultado Competência e Impostos Recolhidos são ambos estáveis ao toggle; o usuário não vê o Resultado Competência “pular” ao mudar a base
- **SC-005**: Após mudança de mês/ano, Resultado Competência reflete o novo período na base líquida em até 5 segundos de percepção do usuário
- **SC-006**: `admin` e `visualizador` obtêm o mesmo Resultado Competência em 100% das comparações no mesmo período
- **SC-007**: Em 100% das visualizações do card Resultado Competência (toggle Bruto ou Líquido, mês ou só-ano), o subtítulo **“base líquida”** está visível; em 100% das visualizações do Resultado Caixa no mesmo bloco, esse subtítulo **não** aparece

## Assumptions

- Escopo limitado ao card **Resultado Competência** no bloco Despesas & Resultado do Dashboard (cálculo + subtítulo “base líquida”)
- “Manter o valor do líquido para bruto e líquido” significa: usar sempre a base líquida, não congelar um snapshot ao clicar no toggle
- O padrão de referência de estabilidade numérica é o de **Impostos Recolhidos** (não reage ao toggle), não uma cópia do valor numérico desse campo
- **Resultado Caixa** permanece ligado ao toggle (confirmado na sessão de clarificação 2026-09-14; o pedido citou apenas competência)
- Texto canônico do subtítulo = **“base líquida”** (confirmado na clarificação); sem redesign amplo do card além desse hint
- Fórmulas de despesa e definição de período de `059` permanecem válidas
- Papéis `admin` / `visualizador` inalterados
- Não há mudança de cadastro de Contas a Pagar / Contas a Receber

## Out of Scope

- Alterar cálculo ou rótulo de Impostos Recolhidos
- Alterar regras de cálculo de Resultado Caixa, Despesas Fixas/Variáveis/Pendentes
- Redesign amplo do layout dos cards de Resultado (além do subtítulo “base líquida” no Competência)
- Subtítulo “base líquida” (ou equivalente) no Resultado Caixa
- Aging, Alerta de Fluxo, Pipeline, Centro de Despesa, Demonstrativo de Resultado
- Novos papéis ou permissões
- Persistência adicional de preferência de toggle
