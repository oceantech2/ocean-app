# Feature Specification: Despesas & Resultado no Dashboard

**Feature Branch**: `059-dashboard-despesas-resultado`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "Módulo 4 / Etapa 4 do briefing técnico 'Lógica do Dashboard Financeiro' (https://claude.ai/code/artifact/7ec34fa0-d881-490a-9daa-931430208aee) — Seção 07 (Card Despesas & Resultado), tudo voltado ao Dashboard."

**Baseline**: Entrega no **Dashboard Financeiro** o bloco **Despesas & Resultado** alinhado à Seção 07 do briefing: três métricas de despesa (Fixas, Variáveis, Pendentes) que **não** mudam com o toggle Bruto/Líquido, e **dois cards de Resultado lado a lado** (Competência e Caixa) que combinam receita (variável com o toggle) e despesas pagas do período (fixas). Complementa as etapas 1–3 (`056` status/Pipeline, `057` toggle + Configuração do Período, `058` abas Por Caixa / Por Competência). Fora desta feature: Aging (Seção 08) e Alerta de Fluxo de Caixa (Seção 09).

## Clarifications

### Session 2026-09-10

- Q: Centro de Despesa e Demonstrativo de Resultado nesta entrega? → A: **Manter como estão** — podem divergir temporariamente dos cards canônicos; alinhamento fica como follow-up.
- Q: Contas a Pagar de imposto nos cards de Despesa? → A: **Excluir** categoria imposto de Fixas / Variáveis / Pendentes.
- Q: Critério de “paga” para Fixas / Variáveis? → A: **Só data de pagamento** no período (ignorar flag pago).
- Q: Conta com pagamento em branco e vencimento no período? → A: **Entra em Pendentes** (vencimento no período + pagamento em branco; ignora flag pago).
- Q: Conteúdo visível nos cards de Resultado? → A: **Só valor do resultado + percentual**.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ler Despesas Fixas, Variáveis e Pendentes (Priority: P1)

Como usuário autenticado (`admin` ou `visualizador`), no Dashboard vejo as despesas do período selecionado em três métricas claras: **Despesas Fixas**, **Despesas Variáveis** e **Despesas Pendentes**, calculadas a partir de Contas a Pagar com as regras do briefing (tipo + datas), sem depender do toggle Bruto/Líquido.

**Why this priority**: É a base do Resultado; sem despesas corretas, os cards de Resultado ficam errados.

**Independent Test**: Com Contas a Pagar conhecidas (fixas/variáveis pagas no período, pendentes com vencimento no período, pagas fora do período), conferir os três totais e que alternar o toggle **não** altera nenhum deles.

**Acceptance Scenarios**:

1. **Given** Contas a Pagar com tipo Fixo e data de pagamento no período (independentemente do flag pago), **When** o usuário lê **Despesas Fixas**, **Then** vê a soma dos valores desses registros
2. **Given** Contas a Pagar com tipo Variável e data de pagamento no período (independentemente do flag pago), **When** o usuário lê **Despesas Variáveis**, **Then** vê a soma dos valores desses registros
3. **Given** Contas a Pagar com data de vencimento no período e data de pagamento em branco (independentemente do flag pago), **When** o usuário lê **Despesas Pendentes**, **Then** vê a soma desses registros
4. **Given** Conta a Pagar com pago=true, data de pagamento em branco e vencimento no período, **When** o usuário lê os três cards, **Then** o valor entra **somente** em Pendentes (não em Fixas/Variáveis)
5. **Given** Contas a Pagar com data de pagamento **fora** do período, **When** o usuário lê Fixas/Variáveis, **Then** esses registros **não** entram nos totais
6. **Given** Contas a Pagar com vencimento **fora** do período e pagamento em branco, **When** o usuário lê Pendentes, **Then** esses registros **não** entram
7. **Given** o Dashboard com despesas carregadas, **When** o usuário alterna Bruto ↔ Líquido, **Then** Fixas, Variáveis e Pendentes permanecem **iguais** (despesas são valores reais pagos / a pagar)
8. **Given** Contas a Pagar de categoria imposto no período (pagas ou pendentes), **When** o usuário lê Fixas, Variáveis e Pendentes, **Then** esses lançamentos **não** entram em nenhum dos três totais
9. **Given** papéis `admin` e `visualizador`, **When** ambos abrem o mesmo período, **Then** veem os mesmos totais de despesa (somente leitura nesta feature)

---

### User Story 2 - Ler Resultado Competência e Resultado Caixa (Priority: P1)

Como usuário autenticado, ao lado das despesas vejo **dois cards de Resultado**: **Resultado Competência** (receita fechada no período − despesas pagas do período) e **Resultado Caixa** (receita recebida no período − despesas pagas do período), cada um com valor e percentual sobre a respectiva receita, na base ativa do toggle.

**Why this priority**: Responde às perguntas “quanto sobrou no fechamento” e “quanto sobrou no caixa” no mesmo período.

**Independent Test**: Com receita de competência, receita de caixa e despesas pagas conhecidas, conferir as duas fórmulas e que só a parte de receita muda com o toggle.

**Acceptance Scenarios**:

1. **Given** Contas a Receber com data de fechamento no período e despesas pagas no período, **When** o usuário lê **Resultado Competência**, **Then** o valor é `receita_comp (toggle) − despesas_totais_período`, onde `despesas_totais = Fixas + Variáveis` (pagas no período)
2. **Given** Contas a Receber com data de recebimento no período e as mesmas despesas, **When** o usuário lê **Resultado Caixa**, **Then** o valor é `receita_caixa (toggle) − despesas_totais_período`
3. **Given** receita de competência > 0, **When** o usuário lê o percentual do Resultado Competência, **Then** vê `resultado_comp ÷ receita_comp × 100` na mesma base do toggle
4. **Given** receita de caixa > 0, **When** o usuário lê o percentual do Resultado Caixa, **Then** vê `resultado_caixa ÷ receita_caixa × 100` na mesma base do toggle
5. **Given** toggle em Líquido, **When** o usuário troca para Bruto, **Then** as receitas (e portanto os resultados e percentuais) passam à base bruta; as despesas usadas na subtração **não** mudam
6. **Given** receita de competência (ou de caixa) igual a zero no período, **When** o usuário olha o percentual correspondente, **Then** o percentual **não** é inventado (fica omitido / indisponível), mantendo o valor do resultado
7. **Given** o bloco Resultado, **When** o usuário observa o layout, **Then** vê **dois cards lado a lado** (Competência e Caixa), cada um com valor e percentual, **sem** composição receita/despesas no card, e o card único legado de “Lucro” genérico **não** permanece como leitura canônica

---

### User Story 3 - Coerência com toggle, período e abas de receita (Priority: P1)

Como usuário autenticado, ao mudar o período do Dashboard ou o toggle Bruto/Líquido, Despesas & Resultado acompanham o mesmo período e a mesma base de receita usada nas abas Por Caixa / Por Competência e no Pipeline, sem misturar meses ou bases.

**Why this priority**: Evita leitura gerencial inconsistente entre seções do mesmo Dashboard.

**Independent Test**: Mudar mês/ano e toggle; conferir que despesas e resultados refletem o novo contexto e que `receita_comp` / `receita_caixa` batem com Total Fechado / Recebido das abas na mesma base.

**Acceptance Scenarios**:

1. **Given** Dashboard no mês M, **When** o usuário muda para o mês N, **Then** Despesas (três métricas) e os dois Resultados passam a refletir N
2. **Given** modo **só-ano** (mês omitido), **When** o usuário lê Despesas & Resultado, **Then** os totais agregam o **ano inteiro** com as mesmas regras (pagamento/vencimento/fechamento/recebimento no ano)
3. **Given** aba Por Competência com Total Fechado na base do toggle, **When** o usuário compara com a receita usada no Resultado Competência, **Then** os valores coincidem na mesma base
4. **Given** aba Por Caixa com Recebido na base do toggle, **When** o usuário compara com a receita usada no Resultado Caixa, **Then** os valores coincidem na mesma base
5. **Given** Despesas Pendentes > 0, **When** o usuário observa os cards de Resultado, **Then** Pendentes **não** entram em `despesas_totais` da fórmula (só Fixas + Variáveis pagas)

---

### User Story 4 - Substituir a leitura legada de Despesa / Lucro (Priority: P2)

Como usuário autenticado, a seção antiga de Despesa/Lucro do Dashboard passa a seguir as regras da Seção 07 (tipo de despesa + data de pagamento; dois resultados), em vez da classificação legada por categoria de custo e do lucro único sobre receita líquida.

**Why this priority**: Remove ambiguidade entre “números antigos” e “números do briefing”.

**Independent Test**: Com registros classificados diferentemente por categoria vs tipo, confirmar que os cards seguem **tipo** e **data de pagamento**, não a heurística antiga por categoria/vencimento.

**Acceptance Scenarios**:

1. **Given** uma Conta a Pagar paga no período com tipo Fixo mas categoria antes tratada como variável, **When** o usuário lê Despesas Fixas, **Then** o valor entra em **Fixas** (tipo prevalece)
2. **Given** uma Conta a Pagar com vencimento no período mas pagamento em outro período, **When** o usuário lê Fixas/Variáveis, **Then** **não** entra como paga no período atual (filtro canônico = data de pagamento)
3. **Given** o Dashboard após esta feature, **When** o usuário procura o card único “Lucro” como única leitura de resultado da seção, **Then** encontra em seu lugar os cards **Resultado Competência** e **Resultado Caixa**

---

### Edge Cases

- Período sem nenhuma Conta a Pagar: Fixas = Variáveis = Pendentes = 0; Resultados = receita − 0
- Período com receita e sem despesas pagas: Resultado = receita do modo; percentual = 100% se receita > 0
- Período só com pendentes (sem pagamentos): despesas_totais = 0; Pendentes > 0; Resultados = receita − 0
- Conta a Pagar sem data de vencimento: não entra em Pendentes; sem data de pagamento: não entra em Fixas/Variáveis
- Conta com data de pagamento em branco e vencimento no período: entra em **Pendentes** mesmo se flag pago = true; não entra em Fixas/Variáveis
- Conta marcada como paga sem data de pagamento e **sem** vencimento no período: fica de fora dos três cards
- Categorias de imposto: Contas a Pagar de imposto **não** entram em Fixas, Variáveis nem Pendentes
- Resultado negativo: valor e percentual negativos (ou valor negativo com percentual negativo) são exibidos de forma legível, sem mascarar prejuízo
- Modo só-ano: mesmas regras com período = ano civil selecionado

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O Dashboard MUST exibir o bloco **Despesas & Resultado** no período selecionado (mês ou ano)
- **FR-002**: O sistema MUST calcular **Despesas Fixas** como a soma de Contas a Pagar com tipo Fixo e data de pagamento no período (o flag pago NÃO é critério)
- **FR-003**: O sistema MUST calcular **Despesas Variáveis** como a soma de Contas a Pagar com tipo Variável e data de pagamento no período (o flag pago NÃO é critério)
- **FR-004**: O sistema MUST calcular **Despesas Pendentes** como a soma de Contas a Pagar com data de vencimento no período e data de pagamento em branco (o flag pago NÃO é critério; inclui inconsistências pago=true sem data de pagamento)
- **FR-005**: Fixas, Variáveis e Pendentes MUST **não** alterar ao alternar o toggle Bruto/Líquido
- **FR-006**: O sistema MUST exibir **Resultado Competência** e **Resultado Caixa** como dois cards lado a lado, cada um mostrando **somente** o valor do resultado e o percentual (sem linhas de composição receita/despesas no card)
- **FR-007**: Resultado Competência MUST usar `receita_comp − despesas_totais`, onde `receita_comp` é a soma das Contas a Receber com data de fechamento no período na base do toggle, e `despesas_totais = Fixas + Variáveis`
- **FR-008**: Resultado Caixa MUST usar `receita_caixa − despesas_totais`, onde `receita_caixa` é a soma das Contas a Receber com data de recebimento no período na base do toggle
- **FR-009**: O percentual de cada Resultado MUST ser `resultado ÷ receita_correspondente × 100` na mesma base do toggle, quando a receita correspondente for > 0; caso contrário, o percentual MUST ficar indisponível (não inventado)
- **FR-010**: Ao alternar o toggle, as receitas (e Resultados/percentuais) MUST atualizar; as despesas da fórmula MUST permanecer iguais
- **FR-011**: Despesas Pendentes MUST NOT entrar em `despesas_totais` das fórmulas de Resultado
- **FR-012**: A classificação Fixo/Variável MUST usar o tipo de despesa da Conta a Pagar (não a heurística legada por categoria de centro de custo)
- **FR-013**: O filtro temporal de despesas pagas MUST usar somente data de pagamento (sem exigir flag pago); o de pendentes MUST usar data de vencimento com data de pagamento em branco
- **FR-014**: No modo só-ano, Despesas & Resultado MUST agregar o ano inteiro com as mesmas regras
- **FR-015**: `receita_comp` e `receita_caixa` MUST ser coerentes com Total Fechado (Por Competência) e Recebido (Por Caixa) na mesma base do toggle e no mesmo período
- **FR-016**: O card único legado de Lucro como leitura canônica do resultado da seção MUST ser substituído pelos dois cards de Resultado
- **FR-017**: `admin` e `visualizador` MUST ver os mesmos números; esta feature não introduz edição nesses cards
- **FR-018**: Esta feature MUST NOT implementar Aging (08) nem Alerta de Fluxo de Caixa (09)
- **FR-019**: Centro de Despesa e Demonstrativo de Resultado MUST permanecer **inalterados** nesta entrega (podem divergir dos cards canônicos de Despesas & Resultado); alinhamento às regras da Seção 07 fica fora do escopo e é follow-up explícito
- **FR-020**: Contas a Pagar cuja categoria for de imposto MUST ser excluídas de Despesas Fixas, Variáveis e Pendentes (impostos continuam na leitura de receita/impostos, não no bloco operacional de despesa)

### Key Entities

- **Conta a Pagar**: Lançamento de despesa com descrição, fornecedor, categorias, tipo (Fixo/Variável), conta, valor, data de vencimento, data de pagamento e nota fiscal/anexo; base das métricas de despesa
- **Conta a Receber**: Fonte da receita de competência (data de fechamento) e de caixa (data de recebimento), na base bruto/líquido do toggle
- **Período do Dashboard**: Mês+ano ou só-ano que delimita todos os filtros desta seção
- **Toggle Bruto/Líquido**: Afeta apenas a parte de receita (e portanto Resultado); despesas permanecem fixas
- **Resultado Competência / Resultado Caixa**: Leituras derivadas (receita do modo − despesas pagas do período)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001b**: Em fixture com flag pago inconsistente (pago=true sem data de pagamento, ou pago=false com data de pagamento no período), Fixas/Variáveis seguem **somente** a data de pagamento em 100% dos casos; Pendentes incluem 100% dos casos com vencimento no período e pagamento em branco (mesmo com pago=true)
- **SC-002**: Em 100% das alternâncias Bruto ↔ Líquido no mesmo período, as três métricas de despesa permanecem numericamente iguais
- **SC-003**: Em fixture com receitas e despesas conhecidas, Resultado Competência e Resultado Caixa diferem em no máximo R$ 0,01 das fórmulas do briefing na base ativa
- **SC-004**: Em 100% dos testes com receita > 0, o percentual exibido difere em no máximo 0,1 ponto percentual do cálculo `resultado ÷ receita × 100`
- **SC-005**: Em auditoria cruzada no mesmo período/toggle, `|receita_comp − Total Fechado| ≤ R$ 0,01` e `|receita_caixa − Recebido| ≤ R$ 0,01`
- **SC-006**: Após mudar o mês (ou o ano), 100% das métricas de Despesas & Resultado refletem o novo período em até 5 segundos de percepção do usuário (sem misturar períodos)
- **SC-007**: Em checklist visual, o card único legado de Lucro não é mais a leitura canônica; os dois cards Competência e Caixa estão presentes e distinguíveis
- **SC-008**: `visualizador` e `admin` obtêm os mesmos totais em 100% das comparações no mesmo período

## Assumptions

- Escopo = Seção 07 do briefing; entrega 100% no **Dashboard**
- Contas a Pagar já possuem tipo Fixo/Variável (`tipo_despesa`) e data de pagamento — nenhum campo novo de cadastro é exigido (decisão D5 do briefing)
- Critério canônico de despesa “paga” = presença de data de pagamento no período; o flag `pago` é irrelevante para Fixas/Variáveis
- `despesas_totais_período` = apenas Fixas + Variáveis com pagamento no período; Pendentes são informativos
- Receita de competência/caixa reutiliza o mesmo universo e bases das abas da etapa 3 (`058`) e do toggle (`057`)
- Lançamentos de categoria imposto são excluídos de Fixas/Variáveis/Pendentes (impostos têm leitura própria na receita)
- Centro de Despesa e Demonstrativo de Resultado permanecem como estão (podem divergir); alinhamento com a Seção 07 é follow-up, não desta feature
- Papéis `admin` / `visualizador` inalterados
- Cards de Resultado exibem apenas valor + percentual; composição da conta fica implícita nos cards/abas vizinhos

## Out of Scope

- Aging de Recebíveis (Seção 08)
- Alerta de Fluxo de Caixa e limiar configurável (Seção 09)
- Novos campos no cadastro de Contas a Pagar
- CRUD de Contas a Pagar / Contas a Receber além do consumo para agregação
- Qualquer alteração, alinhamento ou redesign do Centro de Despesa e do Demonstrativo de Resultado (permanecem como estão nesta entrega)
- Novos papéis de usuário
- Persistência de preferências de layout dos cards de Resultado
