# Feature Specification: Dashboard — Alíquota, Lucro %, DRE Anual e Imposto por Competência

**Feature Branch**: `047-dashboard-metricas-dre`

**Created**: 2026-09-06

**Status**: Draft

**Input**: User description: "Dashboard • Impostos: Alíquota deve ser calculada sobre Receita Bruta • Lucro: % deve ser calculada sobre Receita Líquida • DRE: Quadro deve mostrar todos os meses do ano por padrão • imposto deve mostrar o imposto referente ao mes vigente (lembrando que em imposto nao muda, em janeiro paga o imposto de dezembro, mas na dashboard em janeiro deve mostrar o imposto de janeiro e nao o que é pago em janeiro)"

**Baseline**: Complementa e corrige regras de `040-dashboard-secoes-cards` (card Impostos e % do Lucro), `003-dashboard-dre-chart` (eixo mensal do DRE) e o comportamento de competência do card Impostos no Dashboard. Não altera a estrutura de seções nem outros KPIs fora do escopo desta correção.

## Clarifications

### Session 2026-09-06

- Q: Qual a origem operacional do valor em R$ de Impostos por competência do mês M? → A: Soma do imposto das **NFs do mês M** (emissão/atividade do mês)
- Q: O segmento Impostos do gráfico DRE deve seguir a mesma regra de competência do card? → A: **Sim** — no DRE, Impostos por mês = soma do imposto das NFs daquele mês (igual ao card)
- Q: Quais NFs entram na soma do imposto de competência? → A: Mesma base da Receita Bruta: apenas NFs **pagas** do mês/recorte

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ler Impostos do mês por competência, com alíquota sobre Receita Bruta (Priority: P1)

Como usuário autenticado (admin ou visualizador), ao consultar o Dashboard com um mês selecionado, o card **Impostos** mostra o imposto **referente à competência daquele mês**, obtido pela **soma do imposto das NFs pagas do mês** (mesma base da Receita Bruta), e não o valor que é **pago** naquele mês via Contas a Pagar (que tipicamente corresponde ao imposto do mês anterior). A **alíquota** exibida é a relação percentual entre esse imposto de competência e a **Receita Bruta** do mesmo recorte.

**Why this priority**: Confundir pagamento com competência distorce a leitura gerencial do mês; a alíquota só faz sentido sobre a base de receita bruta do mesmo período.

**Independent Test**: Em janeiro (ou mês M), somar o imposto das NFs **pagas** do mês M e comparar com o card; confirmar que difere do total de Contas a Pagar de Impostos com vencimento em M quando houver defasagem; a alíquota deve ser Impostos(NFs pagas de M) ÷ Receita Bruta(M).

**Acceptance Scenarios**:

1. **Given** o filtro do Dashboard no mês M (ex.: janeiro) e ano A, **When** o usuário visualiza o card Impostos, **Then** o valor em R$ é a **soma do imposto das NFs pagas do mês M**, e **não** o total de Contas a Pagar (categoria Impostos) pago/vencido em M
2. **Given** Receita Bruta do recorte > 0 e imposto das NFs pagas do recorte conhecido, **When** o usuário lê a alíquota no card Impostos, **Then** a alíquota exibida é **Impostos (NFs pagas do recorte) ÷ Receita Bruta** do mesmo recorte, em percentual legível
3. **Given** o usuário alterna do mês M para o mês M+1, **When** os cards atualizam, **Then** o Impostos de M+1 reflete a soma do imposto das NFs pagas de M+1 (e não o valor pago em M+1 via contas a pagar)
4. **Given** existem NFs pendentes (não pagas) no mês M com imposto preenchido, **When** o usuário lê o card Impostos de M, **Then** o imposto dessas NFs pendentes **não** entra no total nem na alíquota
5. **Given** papéis `admin` e `visualizador`, **When** ambos consultam o mesmo recorte, **Then** veem o mesmo valor de Impostos e a mesma alíquota

---

### User Story 2 - Interpretar o % de Lucro sobre Receita Líquida (Priority: P1)

Como usuário autenticado, no card **Lucro** da seção Resultado, o percentual exibido é a participação do lucro sobre a **Receita Líquida** do mesmo recorte (e não sobre a Receita Bruta).

**Why this priority**: A base do percentual define a margem interpretada; a regra de negócio pedida usa Receita Líquida.

**Independent Test**: Com Receita Líquida e Lucro (R$) conhecidos no recorte, conferir que % = Lucro ÷ Receita Líquida; o valor em R$ do Lucro permanece a fórmula já estabelecida.

**Acceptance Scenarios**:

1. **Given** Receita Líquida do recorte > 0 e Lucro (R$) calculado, **When** o usuário visualiza o card Lucro, **Then** o percentual exibido é **Lucro (R$) ÷ Receita Líquida** do mesmo recorte
2. **Given** o mesmo recorte, **When** o usuário compara com a Receita Bruta, **Then** o percentual do Lucro **não** usa Receita Bruta como denominador
3. **Given** Lucro negativo (prejuízo) e Receita Líquida > 0, **When** o usuário lê o card, **Then** o percentual é negativo e coerente com Lucro ÷ Receita Líquida

---

### User Story 3 - Ver DRE anual completo com Impostos por competência das NFs (Priority: P1)

Como usuário autenticado, no gráfico **DRE** do Demonstrativo de Resultado, o eixo temporal exibe **todos os meses do ano** selecionado por padrão (janeiro a dezembro), e o segmento **Impostos** de cada mês usa a **mesma competência do card** (soma do imposto das NFs **pagas** daquele mês), alinhado à Receita Bruta do mês — sem usar Contas a Pagar por vencimento.

**Why this priority**: A visão anual só é útil com o ano inteiro visível; card e DRE contraditórios no mesmo mês quebram a confiança na leitura.

**Independent Test**: Contar 12 meses no eixo; para um mês M com NFs pagas e Contas a Pagar defasadas, conferir que Impostos no DRE = soma do imposto das NFs pagas de M (igual ao card no mesmo mês).

**Acceptance Scenarios**:

1. **Given** o usuário acessa o Dashboard com um ano selecionado, **When** visualiza o gráfico DRE, **Then** o eixo exibe **os 12 meses** desse ano (jan–dez) por padrão
2. **Given** meses sem lançamentos (ou meses futuros no ano civil corrente), **When** o usuário observa o DRE, **Then** esses meses **permanecem** no eixo (com valor zero ou equivalente visual claro), e não são omitidos do quadro padrão
3. **Given** o usuário altera apenas o ano no filtro, **When** o DRE atualiza, **Then** o eixo continua mostrando os 12 meses do novo ano selecionado
4. **Given** o mês M com imposto das NFs pagas conhecido e Contas a Pagar de Impostos com vencimento em M diferente desse valor, **When** o usuário lê o segmento Impostos do DRE em M, **Then** o valor coincide com a soma do imposto das NFs pagas de M (e com o card Impostos no mesmo recorte), não com as contas vencidas em M

---

### Edge Cases

- Receita Bruta = 0 no recorte: card Impostos ainda pode exibir R$ de competência quando houver; alíquota exibe "—" (ou equivalente não enganoso), não um percentual inventado
- Receita Líquida = 0 no recorte: card Lucro exibe R$ conforme fórmula; percentual exibe "—" (ou equivalente), não divisão por zero
- Virada de ano (dezembro → janeiro): em janeiro, Impostos do card = soma do imposto das NFs **pagas** de janeiro; o pagamento típico de janeiro via Contas a Pagar (referente a dezembro) **não** substitui o valor do card de janeiro
- Mês M com NFs pagas mas sem Conta a Pagar de Impostos ainda criada para o pagamento futuro: o card ainda exibe o imposto das NFs pagas de M
- NFs pendentes no mês: excluídas da soma de Impostos (card e DRE) e da Receita Bruta usada na alíquota
- Visão **Todos os meses** (recorte anual): Impostos e alíquota usam a soma do imposto das NFs **pagas** do recorte anual ÷ Receita Bruta consolidada do mesmo recorte; % de Lucro usa Receita Líquida consolidada
- Ano civil corrente no DRE: meses futuros do ano ainda aparecem no eixo (padrão “ano completo”), tipicamente com zero
- Ano sem nenhum dado no DRE: bloco permanece com 12 meses visíveis e estado vazio/zero compreensível; demais seções da página seguem utilizáveis
- No DRE, Despesa e demais aspectos não tratados nesta feature mantêm suas bases atuais; apenas Impostos migra para competência das NFs pagas
- Usuários `admin` e `visualizador` veem as mesmas métricas; sem edição dedicada nesta feature

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O card **Impostos** MUST exibir o valor em R$ igual à **soma do imposto das NFs pagas do recorte** (mês concreto ou consolidado anual, conforme filtro — mesma base de status da Receita Bruta; competência pela emissão/atividade) — MUST NOT usar como valor principal o total de Contas a Pagar da categoria Impostos com vencimento/pagamento no calendário do recorte; MUST NOT incluir imposto de NFs pendentes
- **FR-002**: A **alíquota** do card Impostos MUST ser calculada como **soma do imposto das NFs pagas do recorte ÷ Receita Bruta do mesmo recorte**, expressa em percentual
- **FR-003**: Quando a Receita Bruta do recorte for zero, a alíquota MUST NOT ser apresentada como um percentual enganoso (exibir "—" ou equivalente documentado na interface)
- **FR-004**: O percentual do card **Lucro** MUST ser calculado como **Lucro (R$) ÷ Receita Líquida do mesmo recorte**; MUST NOT usar Receita Bruta como denominador desse percentual
- **FR-005**: O valor em R$ do Lucro MUST permanecer **Receita Líquida − (Despesas Fixas + Despesas Variáveis)** no mesmo recorte (regra já estabelecida; esta feature altera apenas a base do %)
- **FR-006**: Quando a Receita Líquida do recorte for zero, o % do Lucro MUST NOT ser apresentado de forma enganosa (exibir "—" ou equivalente)
- **FR-007**: O gráfico **DRE** MUST, por padrão, exibir **todos os 12 meses** do ano selecionado no eixo temporal (janeiro a dezembro)
- **FR-008**: No DRE padrão, meses sem movimento ou meses futuros do ano corrente MUST permanecer no eixo (com zero ou representação equivalente clara), em vez de serem omitidos
- **FR-009**: No DRE, o valor de **Impostos** de cada mês MUST ser a **soma do imposto das NFs pagas daquele mês** (mesma regra e mesma base de status do card Impostos) — MUST NOT usar Contas a Pagar da categoria Impostos por data de vencimento/pagamento para esse segmento
- **FR-010**: As correções MUST aplicar-se ao mesmo recorte temporal (mês/ano ou visão anual) já usado pelos demais KPIs do Dashboard, sem exigir novo filtro exclusivo desta feature
- **FR-011**: Valores monetários MUST permanecer formatados em Real (BRL) conforme o padrão atual do Dashboard

### Key Entities

- **Receita Bruta (recorte)**: Total de receita bruta do período filtrado (NFs pagas); base do denominador da alíquota de Impostos
- **Receita Líquida (recorte)**: Total de receita líquida do período filtrado; base do denominador do % de Lucro
- **Impostos (competência)**: Soma do imposto das NFs **pagas** cuja emissão/atividade pertence ao recorte; distinto do calendário de pagamento/liquidação via Contas a Pagar; exclui NFs pendentes
- **Alíquota efetiva (card)**: Soma do imposto das NFs pagas do recorte ÷ Receita Bruta do mesmo recorte
- **Lucro (card)**: Resultado em R$ do recorte e sua participação percentual sobre a Receita Líquida
- **DRE (ano)**: Série mensal do demonstrativo no ano selecionado; eixo padrão com os 12 meses civis; segmento Impostos alinhado à competência das NFs pagas (igual ao card)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos cenários de teste com mês concreto e pagamento defasado (Contas a Pagar de Impostos em M ≠ imposto das NFs pagas de M), o card Impostos de M coincide com a soma do imposto das NFs pagas de M e diverge do valor das contas vencidas/pagas em M quando esses valores forem diferentes
- **SC-002**: Em 100% dos cenários com Receita Bruta > 0, a alíquota do card Impostos confere com (soma do imposto das NFs pagas do recorte) ÷ Receita Bruta (±0,1 ponto percentual ou arredondamento já usado na interface)
- **SC-003**: Em 100% dos cenários com Receita Líquida > 0, o % do Lucro confere com Lucro ÷ Receita Líquida e **não** com Lucro ÷ Receita Bruta (quando as duas bases diferirem)
- **SC-004**: Em até 5 segundos após o carregamento normal do Dashboard, o usuário identifica no DRE os **12 meses** do ano selecionado no eixo, sem ação extra para “revelar” meses omitidos
- **SC-005**: Em checklist de regressão dos cards Impostos e Lucro, nenhum dos dois indicadores apresenta denominador incorreto (alíquota ≠ Receita Bruta; % Lucro ≠ Receita Líquida) em amostra de pelo menos 3 recortes distintos (mês isolado, outro mês, visão anual)
- **SC-006**: Em 100% dos meses de teste com dados, o Impostos do DRE no mês M coincide com o card Impostos do mesmo mês M (ambos = soma do imposto das NFs pagas de M), quando o filtro de mês concreto estiver em M

## Assumptions

- A **competência** do imposto no Dashboard é a do mês da atividade/receita que gera o tributo, materializada como **soma do imposto das NFs pagas do mês** (mesma base de status da Receita Bruta); o atraso típico de um mês no pagamento via Contas a Pagar (ex.: em janeiro paga-se o de dezembro) é conhecido do negócio e **não** deve ditar o valor do card do mês corrente
- A origem operacional do valor de competência são as **NFs pagas do recorte** (imposto já associado a cada NF); NFs pendentes ficam de fora; não se usa Contas a Pagar de Impostos nem cadastro manual novo de “linha de imposto” para o card **nem para o segmento Impostos do DRE** nesta feature
- O critério de “mês da NF” segue o mesmo já usado para Receita Bruta no Dashboard/DRE (emissão no mês/ano do recorte), sem inventar outra data de competência
- A alíquota pedida é exatamente sobre **Receita Bruta** do mesmo recorte do card (não sobre Receita Líquida nem sobre outro consolidado)
- Esta feature **substitui** a regra anterior da `040` em que o % do Lucro era sobre Receita Bruta; a partir desta spec, o denominador oficial do % é **Receita Líquida**
- O valor em R$ do Lucro e a exclusão de impostos das Despesas **não** mudam nesta feature
- “Todos os meses do ano por padrão” no DRE significa eixo **jan–dez do ano filtrado**, inclusive zeros; não se aplica ao gráfico DRL (que permanece com suas regras próprias de série histórica)
- O Lucro empilhado do DRE (se derivado de receita − despesa − impostos) passa a usar o novo Impostos por NFs pagas; a fórmula do **card** Lucro (Receita Líquida − Despesas Fixas − Variáveis) permanece a da `040`/`041`
- Filtros de Mês/Ano do cabeçalho e papéis `admin` / `visualizador` permanecem como hoje
- Escopo fora desta feature: alterar fórmulas de Despesa (exceto impacto indireto do novo Impostos no Lucro do DRE), Saldo, Metas, DRL, exportação do DRE ou telas fora do Dashboard
