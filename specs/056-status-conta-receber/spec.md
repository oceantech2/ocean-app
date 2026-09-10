# Feature Specification: Status Derivado + Pipeline de Receita no Dashboard

**Feature Branch**: `056-status-conta-receber`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "Etapa 1 do briefing técnico 'Lógica do Dashboard Financeiro' (https://claude.ai/code/artifact/7ec34fa0-d881-490a-9daa-931430208aee) — Seção 01 (status derivado de Conta a Receber) + entrega no Dashboard com card Pipeline de Receita (Seção 04)."

**Baseline**: Entrega no **Dashboard Financeiro**: (1) regra canônica de status de ciclo de Conta a Receber (Seção 01) e (2) card **Pipeline de Receita** (Seção 04) como primeiro consumidor visível. Não altera listagem/cadastro do módulo Contas a Receber. Fora desta feature: toggle bruto/líquido, configuração de período, demais cards (Por Caixa/Competência, Despesas, Aging, alerta) — seções 02–03 e 05–09.

## Clarifications

### Session 2026-09-10

- Q: Onde o status derivado (A Faturar / Faturado · Ag. Pagamento / Recebido) deve aparecer nesta feature? → A: No **Dashboard** — toda a feature é sobre o Dashboard; não é entrega da listagem/detalhe do módulo Contas a Receber.
- Q: O que entra no Dashboard nesta feature (etapa 1)? → A: Regra de status + **card Pipeline de Receita** (Seção 04 do briefing).
- Q: Registros cancelados/arquivados entram no Pipeline? → A: **Excluir** cancelados e excluídos; arquivados seguem o comportamento já vigente do produto no Dashboard.
- Q: Quais datas do cadastro alimentam o Pipeline? → A: Fechamento = **data de fechamento**; emissão = **data de emissão**; recebimento = **data de pagamento/recebimento**.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver no Pipeline o estágio "A Faturar" (Priority: P1)

Como usuário autenticado (`admin` ou `visualizador`), no card **Pipeline de Receita** do Dashboard, vejo quanto do fechado no período ainda está **A Faturar** (sem NF): valor, contagem e percentual sobre o total fechado.

**Why this priority**: É o primeiro estágio do ciclo; sem ele o pipeline não mostra o funil completo.

**Independent Test**: Com Contas a Receber fechadas no período sem emissão de NF e sem recebimento, conferir soma, contagem e % no estágio A Faturar.

**Acceptance Scenarios**:

1. **Given** Contas a Receber com data de fechamento no período, emissão de NF vazia e recebimento vazio, **When** o usuário abre o Dashboard no período, **Then** esses registros entram em **A Faturar** (badge **sem NF**) com SUM(valor), COUNT e % sobre Fechado no mês
2. **Given** papéis `admin` e `visualizador`, **When** ambos consultam o mesmo período, **Then** veem os mesmos números do Pipeline

---

### User Story 2 - Ver no Pipeline o estágio "Faturado · Ag. Pagamento" (Priority: P1)

Como usuário autenticado, no Pipeline vejo o estágio **Faturado · Ag. Pagamento** (NF emitida) para fechamentos do período com NF emitida e sem recebimento.

**Why this priority**: Separa faturado de recebido na leitura gerencial do mês.

**Independent Test**: Registros com fechamento no período, emissão preenchida e recebimento vazio aparecem só neste estágio intermediário.

**Acceptance Scenarios**:

1. **Given** Contas a Receber com fechamento no período, emissão de NF preenchida e recebimento vazio, **When** o usuário consulta o Pipeline, **Then** entram em **Faturado · Ag. Pagamento** (badge **NF emitida**) com valor, contagem e % sobre Fechado no mês
2. **Given** o mesmo conjunto, **When** comparado aos outros estágios, **Then** **não** entram em A Faturar nem Recebido

---

### User Story 3 - Ver no Pipeline o estágio "Recebido" (Priority: P1)

Como usuário autenticado, no Pipeline vejo **Recebido** (pago) para fechamentos do período que já têm data de recebimento.

**Why this priority**: Fecha o funil do que foi fechado no mês e já virou caixa.

**Independent Test**: Registros com fechamento no período e recebimento preenchido classificados como Recebido.

**Acceptance Scenarios**:

1. **Given** Contas a Receber com fechamento no período e data de recebimento preenchida, **When** o usuário consulta o Pipeline, **Then** entram em **Recebido** (badge **pago**) com valor, contagem e % sobre Fechado no mês
2. **Given** registro com emissão e recebimento preenchidos e fechamento no período, **When** o usuário consulta o Pipeline, **Then** a classificação é **Recebido** (não Faturado · Ag. Pagamento)

---

### User Story 4 - Ver total "Fechado no mês" e consistência do funil (Priority: P1)

Como usuário autenticado, no topo/base do Pipeline vejo **Fechado no mês** (todos com data de fechamento no período) como 100% da base, e a soma de A Faturar + Faturado · Ag. Pagamento + Recebido iguala esse total.

**Why this priority**: Sem a base e a identidade do funil, os percentuais não são confiáveis.

**Independent Test**: Somar os três estágios e comparar com Fechado no mês (valor e contagem) no mesmo período.

**Acceptance Scenarios**:

1. **Given** um período com N Contas a Receber cuja data de fechamento está no período, **When** o usuário lê **Fechado no mês**, **Then** vê SUM(valor) e COUNT(*) desses N registros (100% da base)
2. **Given** o mesmo período, **When** soma A Faturar + Faturado · Ag. Pagamento + Recebido, **Then** valor e contagem igualam Fechado no mês
3. **Given** período sem fechamentos, **When** o usuário abre o Pipeline, **Then** Fechado no mês e os três estágios exibem zero (ou equivalente claro), sem erro

---

### User Story 5 - Pipeline reflete mudança de datas sem campo de status (Priority: P2)

Como `admin`, após alterar emissão de NF ou recebimento no cadastro, ao atualizar o Dashboard o Pipeline move o registro de estágio sem campo de status editável.

**Why this priority**: Garante que o funil acompanhe a operação.

**Independent Test**: Alterar datas, atualizar Dashboard e observar transição entre estágios do Pipeline.

**Acceptance Scenarios**:

1. **Given** registro em A Faturar no Pipeline, **When** o admin informa emissão de NF (sem recebimento) e atualiza o Dashboard, **Then** o registro passa a Faturado · Ag. Pagamento
2. **Given** registro em Faturado · Ag. Pagamento, **When** o admin informa recebimento e atualiza o Dashboard, **Then** o registro passa a Recebido
3. **Given** o Dashboard, **When** o usuário busca campo editável de status de ciclo, **Then** esse campo **não** existe

---

### Edge Cases

- Data de recebimento preenchida e emissão de NF vazia: estágio **Recebido** (recebimento prevalece)
- Datas futuras: classificação só por presença/ausência das datas; sem estágio "agendado"
- Soft delete / excluídos: **fora** do universo do Pipeline
- Cancelados: **fora** do universo do Pipeline (não entram em Fechado no mês nem nos três estágios)
- Arquivados: seguem o **comportamento já vigente** do produto no Dashboard (esta feature não cria regra nova de arquivamento)
- `visualizador`: mesma leitura do Pipeline que o `admin`
- Status legado do cadastro (paga/pendente/vencida): **não** define o estágio do Pipeline; o Pipeline usa só o status derivado desta spec (cancelada já está excluída do universo)
- Percentuais: cada estágio = valor do estágio ÷ Fechado no mês; se Fechado no mês = 0, exibir "—" ou 0% de forma não enganosa (sem divisão por zero)
- Contagens auxiliares do mockup ("vagas", "NFs", "NFs pagas") podem acompanhar os estágios; os rótulos canônicos de estágio permanecem os desta spec

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O Dashboard MUST derivar o status de ciclo de cada Conta a Receber exclusivamente a partir das datas de emissão de NF e de recebimento, sem persistir campo de status de ciclo
- **FR-002**: MUST classificar como **A Faturar** (badge **sem NF**) quando emissão de NF e recebimento estão vazios
- **FR-003**: MUST classificar como **Faturado · Ag. Pagamento** (badge **NF emitida**) quando emissão de NF está preenchida e recebimento está vazio
- **FR-004**: MUST classificar como **Recebido** (badge **pago**) quando recebimento está preenchido
- **FR-005**: Quando recebimento está preenchido, MUST priorizar **Recebido** mesmo sem emissão de NF
- **FR-006**: O Dashboard MUST exibir o card **Pipeline de Receita** com os estágios: Fechado no mês, A Faturar, Faturado · Ag. Pagamento e Recebido
- **FR-007**: O filtro base do Pipeline MUST ser Contas a Receber com **data de fechamento** (campo de fechamento do cadastro) dentro do período selecionado no Dashboard
- **FR-007a**: A classificação de ciclo MUST usar **data de emissão** (emissão de NF) e **data de pagamento/recebimento** (recebimento), conforme FR-002 a FR-005
- **FR-008**: Para cada estágio do Pipeline, o Dashboard MUST exibir valor agregado (SUM), contagem (COUNT) e percentual sobre Fechado no mês
- **FR-009**: A Faturar, Faturado · Ag. Pagamento e Recebido MUST ser subconjuntos disjuntos do universo Fechado no mês; a soma dos três MUST igualar Fechado no mês (valor e contagem)
- **FR-010**: O universo do Pipeline MUST **excluir** registros **cancelados** e **excluídos**
- **FR-011**: Registros **arquivados** MUST seguir o comportamento já vigente do produto no Dashboard (sem regra nova de arquivamento nesta feature)
- **FR-012**: Usuários `admin` e `visualizador` MUST ver os mesmos números do Pipeline no mesmo período
- **FR-013**: O Dashboard MUST NOT oferecer edição de status de ciclo; agrupamentos usam as condições de datas desta spec
- **FR-014**: Após alteração das datas operacionais, o Pipeline MUST refletir o novo estágio na próxima carga/atualização do Dashboard
- **FR-015**: Esta feature MUST NOT exigir alteração da listagem/detalhe do módulo Contas a Receber para o novo ciclo; a entrega visível é o **Dashboard** (Pipeline)

### Key Entities

- **Conta a Receber**: Lançamento de receita; atributos relevantes: **data de fechamento** (universo do Pipeline / Fechado no mês), **data de emissão** (emissão de NF), **data de pagamento/recebimento** (recebimento), valor monetário usado no SUM. Status de ciclo **não** é atributo persistido
- **Status derivado de ciclo**: A Faturar | Faturado · Ag. Pagamento | Recebido (badges: sem NF | NF emitida | pago)
- **Pipeline de Receita**: Card do Dashboard que agrega Contas a Receber fechadas no período por estágio de ciclo, com total Fechado no mês como base 100%

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em amostra de ≥20 Contas a Receber com combinações conhecidas de datas, 100% das classificações no Pipeline batem com as regras desta spec
- **SC-002**: Em qualquer período de teste com fechamentos, | (A Faturar + Faturado + Recebido) − Fechado no mês | = 0 em valor e em contagem
- **SC-003**: Usuário identifica os quatro blocos do Pipeline (Fechado + 3 estágios) e seus percentuais em menos de 10 segundos
- **SC-004**: Após editar datas que mudam o estágio e atualizar o Dashboard, 100% das visualizações do Pipeline refletem a nova classificação
- **SC-005**: `admin` e `visualizador` obtêm os mesmos totais do Pipeline no mesmo período em 100% das verificações paralelas
- **SC-006**: Período sem fechamentos exibe Pipeline zerado (ou equivalente claro) sem falha de tela
- **SC-007**: Em cenário de teste com cancelados/excluídos no período, 100% deles ficam de fora do Fechado no mês e dos três estágios

## Assumptions

- Escopo = Seção 01 (regra) + Seção 04 (Pipeline) do briefing; demais seções ficam para features posteriores
- Campos do cadastro usados pelo Pipeline: **data de fechamento**, **data de emissão**, **data de pagamento/recebimento** e valor; mapeamento técnico fino fica no plano
- Sem toggle bruto/líquido nesta feature: o Pipeline usa a **visão líquida** (padrão do briefing) para SUM(valor), até a Seção 02 ser entregue
- Prioridade recebimento ⇒ Recebido; A Faturar = sem emissão e sem recebimento
- Visual do Pipeline alinhado ao mockup (rótulos/badges/cores), sem fidelidade pixel-perfect
- Papéis existentes inalterados
- Features futuras de Dashboard MUST reutilizar esta definição de ciclo

## Out of Scope

- Alterar listagem/formulário/coluna de status do módulo Contas a Receber / NFs
- Toggle Bruto / Líquido (Seção 02)
- Entidade Configuração do Período, meta e alíquota de período (Seção 03)
- Cards Receita Por Caixa / Por Competência, Despesas & Resultado, Aging e Alerta de Fluxo de Caixa (Seções 05–09)
- Alteração do modelo de Contas a Pagar
- Novos papéis além de `admin` e `visualizador`
