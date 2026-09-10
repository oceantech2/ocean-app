# Feature Specification: Toggle Bruto/Líquido + Configuração do Período no Dashboard

**Feature Branch**: `057-dashboard-toggle-periodo`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "Etapa 2 do briefing técnico 'Lógica do Dashboard Financeiro' (https://claude.ai/code/artifact/7ec34fa0-d881-490a-9daa-931430208aee) — Seção 02 (Toggle Bruto / Líquido) + Seção 03 (Configuração do Período), tudo voltado ao Dashboard."

**Baseline**: Entrega no **Dashboard Financeiro**: (1) controle global **Bruto / Líquido** no header e (2) **Configuração do Período** (meta líquida + alíquota efetiva do mês) editável por `admin`. Complementa a etapa 1 (`056-status-conta-receber`: status derivado + Pipeline). Fora desta feature: cards Por Caixa / Por Competência, Despesas & Resultado, Aging e Alerta de Fluxo de Caixa (seções 05–09).

## Clarifications

### Session 2026-09-10

- Q: Relação com a meta mensal já existente no Dashboard? → A: **Substituir** — a edição da meta mensal no Dashboard passa a ser a Configuração do Período (meta líquida + alíquota juntas); uma única fonte de verdade.
- Q: Ao atualizar a alíquota nas Contas a Receber emitidas, o que mais muda? → A: Atualiza alíquota **e recalcula** valor líquido (e demais campos derivados de imposto/líquido já existentes no registro).
- Q: Confirmação antes de atualizar em massa as Contas a Receber? → A: **Com confirmação** quando a alíquota muda (mostra quantos registros serão afetados); mudança só de meta não exige esse passo.
- Q: Quais receitas do Dashboard o toggle afeta nesta feature? → A: **Pipeline + meta + todos os KPIs de receita já existentes** no Dashboard (despesas e impostos absolutos fora).
- Q: Meta e alíquota são obrigatórias juntas no save? → A: **Ambos obrigatórios** em todo save da Configuração do Período.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Alternar visão Bruto e Líquido no Dashboard (Priority: P1)

Como usuário autenticado (`admin` ou `visualizador`), no header direito do Dashboard vejo um controle **Bruto / Líquido**. Ao alternar, todos os valores monetários de **receita** do Dashboard (incluindo o Pipeline de Receita e a meta exibida) passam a mostrar a visão correspondente, de uma só vez. O padrão ao abrir é **Líquido** (visão do dono).

**Why this priority**: Sem o toggle, a leitura gerencial fica presa a uma única base; o briefing define o controle como eixo global do Dashboard.

**Independent Test**: Com Pipeline e meta conhecidos em bruto e líquido, alternar o toggle e conferir que receita e meta mudam juntos; despesas e impostos recolhidos (quando visíveis) não mudam.

**Acceptance Scenarios**:

1. **Given** o Dashboard aberto no período, **When** o usuário observa o header direito, **Then** vê o toggle Bruto / Líquido com **Líquido** como padrão
2. **Given** toggle em Líquido, **When** o usuário troca para Bruto, **Then** **Pipeline**, **meta exibida** e **todos os KPIs de receita já existentes** no Dashboard passam à base **bruta**
3. **Given** toggle em Bruto, **When** o usuário volta para Líquido, **Then** esses mesmos blocos de receita e a meta voltam à base **líquida**
4. **Given** papéis `admin` e `visualizador`, **When** ambos usam o toggle no mesmo período, **Then** as mesmas regras de conversão se aplicam (mesmos totais para a mesma visão)

---

### User Story 2 - Saber o que o toggle não altera (Priority: P1)

Como usuário autenticado, entendo que o toggle **não** altera despesas nem impostos recolhidos absolutos: despesas são valores reais pagos; impostos recolhidos (quando o card existir ou já houver métrica equivalente) permanecem no valor absoluto dos impostos, sem alternar bruto/líquido.

**Why this priority**: Evita leitura errada de caixa e de imposto como se fossem “versões” da receita.

**Independent Test**: Alternar o toggle e confirmar que totais de despesas (e impostos recolhidos, se visíveis) permanecem iguais.

**Acceptance Scenarios**:

1. **Given** despesas (ou KPIs de despesa já existentes no Dashboard) com valores conhecidos, **When** o usuário alterna Bruto ↔ Líquido, **Then** esses valores **não** mudam
2. **Given** métrica de impostos recolhidos/absolutos visível no Dashboard, **When** o usuário alterna o toggle, **Then** o valor absoluto dos impostos **não** muda

---

### User Story 3 - Configurar meta líquida e alíquota do período no Dashboard (Priority: P1)

Como `admin`, no contexto do período selecionado no Dashboard, configuro a **meta mensal em valor líquido** e a **alíquota efetiva do período (%)** no **mesmo** fluxo de edição — este fluxo **substitui** a edição isolada de meta mensal que existia antes. Como `visualizador`, consulto esses dados, mas não os edito.

**Why this priority**: A Ocean é do Simples Nacional; a alíquota muda mês a mês e a meta precisa ser configurável por período.

**Independent Test**: Admin salva meta líquida e alíquota para o mês; visualizador vê os mesmos números e não consegue salvar alteração.

**Acceptance Scenarios**:

1. **Given** `admin` com o Dashboard no período M/AAAA, **When** informa meta líquida e alíquota do período e salva, **Then** a configuração fica associada a esse período (mês/ano) e passa a alimentar meta e conversões do Dashboard
2. **Given** o Dashboard após esta feature, **When** o `admin` procura a edição antiga só de meta mensal (sem alíquota), **Then** esse fluxo isolado **não** existe mais — só a Configuração do Período
3. **Given** configuração já salva para o período, **When** o `admin` reabre o Dashboard nesse período, **Then** vê meta e alíquota persistidas
4. **Given** `visualizador` no mesmo período, **When** consulta o Dashboard, **Then** vê meta/alíquota usadas na leitura, mas **não** consegue editar/salvar a configuração
5. **Given** período sem configuração ainda, **When** o usuário abre o Dashboard, **Then** o sistema indica de forma clara que falta configurar (sem inventar meta/alíquota)
6. **Given** `admin` tenta salvar com meta ou alíquota em branco, **When** confirma o save, **Then** a gravação é rejeitada com feedback claro — os dois campos são obrigatórios juntos

---

### User Story 4 - Ver a meta conforme o toggle (Priority: P1)

Como usuário autenticado, a **meta exibida** no Dashboard acompanha o toggle: em Líquido mostra a meta líquida configurada; em Bruto mostra a meta bruta calculada a partir da meta líquida e da alíquota do período.

**Why this priority**: A barra/comparativo de meta só faz sentido se estiver na mesma base da receita exibida.

**Independent Test**: Com meta líquida R$ 300.000 e alíquota 18,5%, em Bruto a meta exibida deve ser R$ 300.000 ÷ (1 − 0,185) = R$ 368.098,16 (arredondamento monetário consistente).

**Acceptance Scenarios**:

1. **Given** meta líquida e alíquota do período preenchidas e toggle = Líquido, **When** o usuário lê a meta, **Then** vê **meta_líquida**
2. **Given** os mesmos dados e toggle = Bruto, **When** o usuário lê a meta, **Then** vê **meta_bruta = meta_líquida ÷ (1 − alíquota_período/100)**
3. **Given** alíquota ausente ou inválida para conversão, **When** o usuário está em Bruto, **Then** o sistema não exibe meta bruta enganosa (bloqueia conversão com mensagem/estado claro ou mantém indisponível)

---

### User Story 5 - Pipeline e receitas do Dashboard respeitam o toggle (Priority: P1)

Como usuário autenticado, ao alternar Bruto/Líquido, os valores do **Pipeline de Receita**, da **meta exibida** e de **todos os KPIs de receita já existentes** no Dashboard usam a base correspondente, mantendo contagens e percentuais do funil coerentes com a mesma base.

**Why this priority**: A etapa 1 entregou o Pipeline em visão líquida por padrão; a etapa 2 fecha o compromisso do briefing de afetar “todos os valores monetários de receita”.

**Independent Test**: Comparar SUM do Pipeline em Líquido vs Bruto no mesmo período; contagens iguais; percentuais recalculados sobre Fechado na mesma base.

**Acceptance Scenarios**:

1. **Given** Pipeline com fechamentos no período, **When** o usuário está em Líquido, **Then** os SUM usam valor líquido; em Bruto, usam valor bruto
2. **Given** a troca de toggle, **When** o usuário observa contagens do Pipeline, **Then** as contagens **não** mudam (só a base monetária)
3. **Given** Fechado no mês > 0, **When** em qualquer visão do toggle, **Then** A Faturar + Faturado · Ag. Pagamento + Recebido continuam igualando Fechado no mês na **mesma** base

---

### User Story 6 - Ao salvar a alíquota do período, atualizar alíquotas das Contas a Receber emitidas no mês (Priority: P2)

Como `admin`, ao salvar uma nova **alíquota do período**, o sistema atualiza automaticamente a alíquota de imposto de todas as Contas a Receber cuja **data de emissão** está dentro desse período e **recalcula o valor líquido** (e demais campos derivados de imposto/líquido já existentes no registro) a partir do valor bruto e da nova alíquota, para manter consistência sem edição manual registro a registro. A ação é disparada pela configuração do Dashboard; não cria tela nova no módulo Contas a Receber.

**Why this priority**: Garante consistência Simples Nacional entre período e NFs já emitidas; é consequência direta da Seção 03.

**Independent Test**: Contas a Receber com emissão no período M e bruto/líquido conhecidos; admin altera alíquota de M; ao reconsultar, alíquota e valor líquido (derivados) refletem o novo cálculo; registros com emissão fora de M não mudam.

**Acceptance Scenarios**:

1. **Given** Contas a Receber com data de emissão no período M e `admin` altera a alíquota de M, **When** tenta salvar, **Then** vê confirmação explícita informando quantos registros serão afetados; só após confirmar a alíquota e o valor líquido (e derivados) são atualizados
2. **Given** `admin` altera **somente** a meta líquida (alíquota igual à já salva), **When** salva, **Then** a configuração é gravada **sem** o passo de confirmação de atualização em massa
3. **Given** Contas a Receber com emissão fora de M, **When** a alíquota de M é confirmada e salva, **Then** esses registros **não** são alterados
4. **Given** registros sem data de emissão (A Faturar), **When** a alíquota de M é salva, **Then** não recebem alíquota de imposto “confirmada” só por esse trigger (permanecem sem emissão; a alíquota do período serve para **estimativa** futura nos cards que a usarem)

---

### Edge Cases

- Alíquota 0%: meta bruta = meta líquida; conversão válida
- Alíquota ≥ 100% ou negativa: inválida — não calcular meta bruta; impedir save com feedback claro
- Período **sem** Configuração do Período salva: toggle Líquido pode mostrar receita; meta e conversão Bruto ficam indisponíveis/claras até o `admin` salvar meta **e** alíquota juntas
- Save parcial (só meta ou só alíquota): **não permitido** — ambos obrigatórios em todo save
- Toggle não altera despesas nem impostos absolutos recolhidos
- `visualizador`: usa o toggle e lê meta/alíquota; não edita Configuração do Período
- Preferência do toggle: padrão Líquido a cada nova sessão de uso do Dashboard (não precisa ser preferência global permanente do sistema)
- Atualização em massa: apenas registros com **data de emissão** no período; atualiza alíquota **e** recalcula líquido/derivados; cancelados/excluídos seguem as regras de exclusão já vigentes (não reativar nem “consertar” excluídos)
- Confirmação obrigatória no Dashboard **apenas** quando a alíquota do período muda em relação ao valor já salvo; alteração só de meta líquida salva direto
- Se o `admin` cancelar a confirmação, nada é persistido (nem configuração nem registros)
- Estimativa de impostos para “A Faturar” (sem NF): quando um card futuro precisar, usa `alíquota_período`; nesta feature, garantir que a alíquota do período fique disponível no Dashboard para esse uso — sem exigir o card Por Caixa ainda
- Meta **anual** já existente no produto permanece inalterada nesta feature
- A edição isolada de **meta mensal** anterior no Dashboard é **substituída** pela Configuração do Período (meta líquida + alíquota); não há duas UIs de meta mensal

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O Dashboard MUST exibir no header direito um controle global **Bruto / Líquido**
- **FR-002**: O padrão do toggle MUST ser **Líquido**
- **FR-003**: Ao alternar o toggle, MUST atualizar simultaneamente o **Pipeline de Receita**, a **meta exibida** e **todos os KPIs de receita já existentes** no Dashboard
- **FR-003a**: MUST NOT deixar KPI de receita existente exibindo base diferente da selecionada no toggle (sem visão mista Bruto/Líquido na mesma tela)
- **FR-004**: Em visão Líquida, valores de receita MUST usar a base líquida; em visão Bruta, a base bruta
- **FR-005**: A meta exibida MUST seguir o toggle: Líquido → meta líquida do período; Bruto → meta bruta derivada
- **FR-006**: Meta bruta MUST ser calculada como `meta_líquida ÷ (1 − alíquota_período/100)` quando a alíquota permitir conversão válida
- **FR-007**: Despesas (valores efetivamente pagos / KPIs de despesa do Dashboard) MUST NOT mudar com o toggle
- **FR-008**: Impostos recolhidos em valor absoluto (quando exibidos) MUST NOT mudar com o toggle
- **FR-009**: MUST existir **Configuração do Período** por mês/ano, com: período (chave), meta líquida e alíquota do período (%) — **ambos** meta e alíquota obrigatórios em todo save
- **FR-009a**: A Configuração do Período MUST **substituir** a edição isolada de meta mensal anteriormente disponível no Dashboard; MUST NOT manter dois fluxos concorrentes de meta mensal
- **FR-009b**: Save com meta ou alíquota ausente/ inválida MUST ser rejeitado com feedback claro ao `admin`
- **FR-010**: Usuários `admin` MUST poder criar/editar a Configuração do Período a partir do **Dashboard** (contexto do período selecionado)
- **FR-011**: Usuários `visualizador` MUST poder consultar os efeitos da configuração no Dashboard e MUST NOT poder salvar alterações de meta/alíquota do período
- **FR-012**: Ao salvar nova alíquota do período, o sistema MUST atualizar a alíquota de imposto de todas as Contas a Receber com **data de emissão** dentro desse período
- **FR-012a**: Nesses mesmos registros, MUST **recalcular** o valor líquido e demais campos derivados de imposto/líquido já existentes no registro, a partir do valor bruto e da nova alíquota
- **FR-012b**: Quando a alíquota informada **difere** da já salva, o Dashboard MUST pedir **confirmação explícita** ao `admin`, informando a quantidade de registros que serão afetados, antes de persistir configuração e atualização em massa
- **FR-012c**: Quando apenas a meta líquida muda (alíquota inalterada), MUST permitir salvar **sem** essa confirmação de massa
- **FR-012d**: Se o `admin` cancelar a confirmação, MUST NOT persistir a nova configuração nem alterar Contas a Receber
- **FR-013**: Contas a Receber sem data de emissão MUST NOT receber alíquota de imposto confirmada apenas pelo save da configuração; a alíquota do período fica disponível para estimativa
- **FR-014**: Contagens do Pipeline MUST permanecer iguais ao alternar o toggle; apenas a base monetária e os percentuais sobre Fechado (na mesma base) mudam
- **FR-015**: A identidade do Pipeline (A Faturar + Faturado + Recebido = Fechado) MUST valer em ambas as visões do toggle
- **FR-016**: Esta feature MUST NOT implementar os cards das seções 05–09; apenas prepara toggle + configuração usados por eles depois
- **FR-017**: Alíquota inválida (< 0 ou ≥ 100) MUST ser rejeitada na edição com feedback claro ao `admin`
- **FR-018**: Período sem Configuração do Período salva MUST NÃO inventar meta/alíquota; o Dashboard indica ausência e bloqueia meta/conversão Bruto até configuração completa (meta + alíquota)

### Key Entities

- **Configuração do Período**: Registro por mês/ano com meta líquida mensal e alíquota efetiva do período (%); editável por `admin` no Dashboard
- **Toggle Bruto/Líquido**: Controle de visão do Dashboard que escolhe a base monetária de receita e da meta exibida
- **Meta exibida**: Valor mostrado ao usuário — igual à meta líquida ou à meta bruta derivada, conforme o toggle
- **Conta a Receber**: Já existente; campos relevantes para esta feature: valor bruto, valor líquido, alíquota de imposto, data de emissão (para o trigger de atualização em massa)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste com meta líquida e alíquota conhecidas, a meta bruta exibida difere em no máximo R$ 0,01 do valor da fórmula do briefing
- **SC-002**: Alternar o toggle atualiza Pipeline, meta e todos os KPIs de receita existentes na mesma ação; o usuário identifica a mudança de base em menos de 5 segundos
- **SC-002a**: Em auditoria visual do Dashboard no mesmo período, 0 KPIs de receita existentes permanecem na base oposta à do toggle
- **SC-003**: Em 100% das verificações, despesas (e impostos absolutos, se visíveis) permanecem iguais após alternar o toggle
- **SC-004**: Após `admin` confirmar e salvar alíquota do período, 100% das Contas a Receber com emissão naquele período refletem a nova alíquota **e** valor líquido coerente com bruto × nova alíquota; 0% das de outros períodos são alteradas indevidamente
- **SC-004a**: Em 100% dos testes em que o `admin` cancela a confirmação de mudança de alíquota, configuração e registros permanecem iguais ao estado anterior
- **SC-005**: `visualizador` consegue usar o toggle e ler os números, e falha/blocked em 100% das tentativas de salvar configuração do período
- **SC-006**: Pipeline mantém |soma dos três estágios − Fechado| = 0 em valor na base ativa do toggle e contagens idênticas entre Bruto e Líquido
- **SC-007**: Período sem Configuração do Período não mostra meta bruta inventada; indicação clara em 100% dos casos de teste
- **SC-008**: Tentativas de save com meta ou alíquota faltando são rejeitadas em 100% dos testes, sem persistir configuração parcial

## Assumptions

- Escopo = Seção 02 + Seção 03 do briefing; entrega 100% orientada ao **Dashboard** (UI de toggle e configuração no Dashboard)
- O trigger de atualização de alíquota nas Contas a Receber é efeito de negócio da configuração do período; não inclui redesenho da listagem/formulário de Contas a Receber
- Campos de valor bruto/líquido e alíquota de imposto já existem (ou equivalentes) no domínio de Contas a Receber / NFs; mapeamento fino fica no plano
- Preferência do toggle inicia em Líquido a cada uso (sessão); persistência longa entre dispositivos não é exigida nesta feature
- Cards futuros (Por Caixa, Competência, Aging, Alerta) reutilizarão este toggle e esta Configuração do Período
- Pipeline da feature `056` passa a respeitar o toggle nesta feature
- Meta **anual** já existente no produto permanece; a meta **mensal** passa a ser governada exclusivamente pela Configuração do Período (substitui o fluxo antigo de meta mensal no Dashboard)
- Papéis `admin` e `visualizador` inalterados além da permissão de edição da configuração

## Out of Scope

- Cards Receita Por Caixa / Por Competência (Seções 05–06)
- Card Despesas & Resultado completo conforme Seção 07 (além de garantir que despesas existentes não mudem com o toggle)
- Aging de Recebíveis (Seção 08)
- Alerta de Fluxo de Caixa e limiar configurável (Seção 09)
- Alterar listagem/formulário do módulo Contas a Receber além do efeito automático da alíquota
- Novos papéis de usuário
- Redefinição ou redesign da meta **anual**
- Manter o fluxo antigo de edição isolada de meta mensal em paralelo à Configuração do Período
