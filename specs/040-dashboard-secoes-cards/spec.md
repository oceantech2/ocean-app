# Feature Specification: Dashboard — Seções, Títulos e Reordenação de Cards

**Feature Branch**: `040-dashboard-secoes-cards`

**Created**: 2026-08-27

**Status**: Draft

**Input**: User description: "Incluir título de cada seção, *adicionar e reordenar cards: Metas (linha 1): Meta de Receita Mensal + Meta de Receita Anual; Receita (linha 2): Receita Bruta + *Impostos (R$ + Alíquota) + Receita Líquida + Receita Pendente; Despesa (linha 3, à esquerda): Despesas Fixas + Despesas Variáveis + *Despesas Pendentes (R$); Resultado (linha 3, à direita): *Lucro (R$ + % sobre Receita Bruta); Saldo (linha 4): Conta Corrente 1 + Conta Corrente 2 + Conta Corrente 3 + Conta Investimento; Centro de Despesa (gráficos): Despesas [Mês] + Despesas [Ano] Remover impostos do cálculo; Demonstrativo de Resultado (gráficos): DRE [Ano] + DRL"

**Baseline**: Complementa a nomenclatura de `039-dashboard-nomenclatura`. Esta feature redefine a estrutura visual do Dashboard (seções com título, novos indicadores, ordem e agrupamento), sem alterar o escopo de outras páginas.

## Clarifications

### Session 2026-08-27

- Q: Qual a fórmula do valor em R$ do card Lucro? → A: Lucro = Receita Líquida − (Despesas Fixas + Despesas Variáveis)
- Q: Qual a origem do card Impostos (R$ + Alíquota)? → A: Mesma base do acompanhamento de impostos: valor das contas Impostos do período + alíquota efetiva já usada no produto
- Q: Qual a base dos cards Despesas Fixas e Despesas Variáveis vs Despesas Pendentes? → A: Fixas e Variáveis = apenas despesas pagas do tipo no recorte; Pendentes = não pagas (todos os tipos aplicáveis)
- Q: Como rotular os cards Conta Corrente 1–3? → A: Rótulo = nome da conta cadastrada em cada slot (1–3); se sem nome, fallback “Conta Corrente N”
- Q: A categoria Impostos entra nos cards da seção Despesa? → A: Excluir categoria Impostos de Fixas, Variáveis e Pendentes

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ler o Dashboard por seções tituladas e na ordem definida (Priority: P1)

Como usuário autenticado (admin ou visualizador), ao abrir o Dashboard, vejo o conteúdo organizado em seções com título explícito, na ordem: **Metas** → **Receita** → **Despesa** e **Resultado** (mesma linha) → **Saldo** → **Centro de Despesa** → **Demonstrativo de Resultado**. Cada seção contém apenas os cards/gráficos listados para ela, na ordem indicada.

**Why this priority**: É o pedido central — a leitura gerencial depende de hierarquia visual clara e da ordem de negócio (metas, receita, despesa/resultado, saldo, depois gráficos).

**Independent Test**: Abrir o Dashboard e percorrer de cima para baixo conferindo título de cada seção e a sequência dos blocos internos.

**Acceptance Scenarios**:

1. **Given** o usuário autenticado acessa o Dashboard, **When** visualiza a página, **Then** cada grupo de indicadores/gráficos possui um título de seção visível correspondente a Metas, Receita, Despesa, Resultado, Saldo, Centro de Despesa e Demonstrativo de Resultado
2. **Given** o Dashboard carregado em viewport larga, **When** o usuário observa o layout, **Then** a linha 1 exibe Metas; a linha 2, Receita; a linha 3, Despesa à esquerda e Resultado à direita; a linha 4, Saldo; em seguida Centro de Despesa; por fim Demonstrativo de Resultado
3. **Given** viewport estreita (mobile), **When** o usuário rola a página, **Then** as seções mantêm a mesma ordem lógica (Despesa antes de Resultado quando empilhadas) e os cards permanecem legíveis

---

### User Story 2 - Ver cards de Metas, Receita, Despesa, Resultado e Saldo conforme o mapa (Priority: P1)

Como usuário autenticado, vejo os cards de cada seção exatamente com os rótulos e conteúdos pedidos, incluindo os novos indicadores (Impostos, Despesas Pendentes e Lucro) e os saldos separados por conta corrente.

**Why this priority**: Sem os cards certos (e os novos), a reorganização não entrega o painel financeiro esperado.

**Independent Test**: Conferir card a card o rótulo e se o valor/exibição pedida está presente (R$, alíquota, percentual quando aplicável).

**Acceptance Scenarios**:

1. **Given** a seção Metas, **When** o usuário a visualiza, **Then** vê na ordem: "Meta de Receita Mensal" e "Meta de Receita Anual" (comportamento de edição/progresso das metas existentes permanece disponível conforme papel)
2. **Given** a seção Receita, **When** o usuário a visualiza, **Then** vê na ordem: Receita Bruta, Impostos (R$ e alíquota na mesma base do acompanhamento de impostos do produto), Receita Líquida e Receita Pendente
3. **Given** a seção Despesa, **When** o usuário a visualiza, **Then** vê na ordem: Despesas Fixas (apenas pagas), Despesas Variáveis (apenas pagas) e Despesas Pendentes (não pagas, em R$), todos sem incluir a categoria Impostos
4. **Given** a seção Resultado, **When** o usuário a visualiza, **Then** vê o card Lucro com valor em R$ igual a Receita Líquida − (Despesas Fixas + Despesas Variáveis) e percentual desse valor sobre a Receita Bruta do mesmo recorte
5. **Given** a seção Saldo, **When** o usuário a visualiza, **Then** vê quatro cards na ordem dos slots Conta Corrente 1–3 e Conta Investimento, cada corrente rotulada com o nome cadastrado da conta (ou “Conta Corrente N” se não houver nome), sem consolidar as correntes em um único card

---

### User Story 3 - Interpretar gráficos de Centro de Despesa e Demonstrativo de Resultado (Priority: P2)

Como usuário autenticado, na seção **Centro de Despesa** vejo os gráficos "Despesas [Mês]" e "Despesas [Ano]" sem incluir impostos no cálculo das fatias/totais; na seção **Demonstrativo de Resultado** vejo "DRE [Ano]" e "DRL".

**Why this priority**: Os gráficos fecham a leitura gerencial; a exclusão de impostos do centro de despesa evita misturar despesa operacional com carga tributária.

**Independent Test**: Comparar títulos dos gráficos e, no Centro de Despesa, confirmar que a categoria/valor de impostos não entra no total nem nas fatias exibidas.

**Acceptance Scenarios**:

1. **Given** a seção Centro de Despesa com mês selecionado, **When** o usuário visualiza os gráficos, **Then** vê "Despesas [Mês]" (mês/ano do filtro) e "Despesas [Ano]" lado a lado quando o layout permitir
2. **Given** filtro apenas por ano (sem mês concreto), **When** o usuário visualiza Centro de Despesa, **Then** o gráfico anual permanece disponível de forma coerente com o padrão atual de filtro do Dashboard
3. **Given** existem lançamentos classificados como impostos no período, **When** o usuário consulta Centro de Despesa, **Then** esses valores não entram no total nem na composição percentual das despesas exibidas
4. **Given** a seção Demonstrativo de Resultado, **When** o usuário a visualiza, **Then** vê o gráfico "DRE [Ano]" e o gráfico "DRL" nessa ordem

---

### Edge Cases

- Quando não houver dados para um card (ex.: meta inexistente, saldo zerado, nenhuma despesa pendente), o card permanece visível com indicação clara de ausência ou zero, sem quebrar o layout da seção
- Se houver menos de três contas correntes ativas, os slots 1–3 exibem as contas existentes na ordem cadastral/operacional com o nome de cada uma e deixam explícito o slot vazio (ex.: "—" ou “Sem conta”) sem inventar saldos
- Se houver mais de três contas correntes ativas, exibem-se as três primeiras na ordem definida pelo produto, cada uma com seu nome cadastrado; as demais não aparecem nesta linha (escopo desta feature limitado a três slots)
- Lucro negativo (prejuízo): o card Lucro exibe valor negativo em R$ e percentual negativo sobre a Receita Bruta; se Receita Bruta for zero, o percentual não é calculado de forma enganosa (exibe "—" ou equivalente)
- Alíquota de Impostos com Receita Bruta zero: exibir valor de impostos quando houver e alíquota como "—" ou 0% de forma consistente e documentada na interface
- Usuários `admin` e `visualizador` veem a mesma estrutura e os mesmos indicadores; apenas ações de edição de meta (já existentes) permanecem restritas ao admin
- Filtros de mês/ano já existentes no Dashboard continuam aplicando o recorte aos indicadores e gráficos das seções afetadas pelo período
- Lançamentos da categoria Impostos não aparecem em Despesas Fixas, Despesas Variáveis nem Despesas Pendentes; permanecem apenas no card Impostos (e, quando aplicável, no DRE)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O Dashboard MUST organizar o conteúdo em seções com título visível: Metas, Receita, Despesa, Resultado, Saldo, Centro de Despesa e Demonstrativo de Resultado
- **FR-002**: A seção Metas MUST exibir os cards na ordem: Meta de Receita Mensal, depois Meta de Receita Anual
- **FR-003**: A seção Receita MUST exibir os cards na ordem: Receita Bruta, Impostos, Receita Líquida, Receita Pendente
- **FR-004**: O card Impostos MUST exibir o valor total em R$ e a alíquota efetiva do recorte usando a mesma base de negócio do acompanhamento de impostos já existente no produto (contas da categoria Impostos no período e alíquota efetiva correspondente)
- **FR-005**: A seção Despesa MUST exibir os cards na ordem: Despesas Fixas, Despesas Variáveis, Despesas Pendentes; Fixas e Variáveis MUST somar apenas despesas **pagas** do respectivo tipo no recorte e MUST NOT incluir a categoria Impostos
- **FR-006**: O card Despesas Pendentes MUST exibir o valor em R$ das despesas ainda **não pagas** no recorte (tipos aplicáveis de despesa operacional no domínio de contas a pagar), sem duplicar esses valores nos cards Fixas/Variáveis e MUST NOT incluir a categoria Impostos
- **FR-007**: A seção Resultado MUST exibir o card Lucro com valor em R$ calculado como Receita Líquida − (Despesas Fixas + Despesas Variáveis) e percentual desse valor sobre a Receita Bruta do mesmo recorte
- **FR-008**: Em viewport larga, Despesa e Resultado MUST compartilhar a mesma linha (Despesa à esquerda, Resultado à direita)
- **FR-009**: A seção Saldo MUST exibir quatro cards na ordem dos slots Conta Corrente 1, Conta Corrente 2, Conta Corrente 3 e Conta Investimento — sem consolidar as contas correntes em um único total; cada slot de corrente MUST usar como rótulo o nome cadastrado da conta, com fallback “Conta Corrente N” quando não houver nome
- **FR-010**: A seção Centro de Despesa MUST exibir os gráficos com títulos "Despesas [Mês]" e "Despesas [Ano]" (com o período do filtro refletido no título quando aplicável)
- **FR-011**: A categoria Impostos MUST NOT compor Despesas Fixas, Despesas Variáveis, Despesas Pendentes nem os totais/fatias do Centro de Despesa; permanece no card Impostos da seção Receita e nos gráficos que já a exibem por regra própria (ex.: DRE)
- **FR-012**: A seção Demonstrativo de Resultado MUST exibir, nessa ordem, o gráfico "DRE [Ano]" e o gráfico "DRL"
- **FR-013**: A ordem das seções na página MUST ser: Metas → Receita → Despesa/Resultado → Saldo → Centro de Despesa → Demonstrativo de Resultado
- **FR-014**: Cards e gráficos existentes que forem realocados MUST preservar o significado de negócio já estabelecido (salvo a exclusão explícita de impostos no Centro de Despesa e a inclusão dos novos cards)
- **FR-015**: A estrutura MUST ser a mesma para `admin` e `visualizador`, respeitando as restrições de edição já vigentes

### Key Entities

- **Seção do Dashboard**: Agrupamento nomeado de cards ou gráficos com título visível e posição na hierarquia da página
- **Card indicador**: Bloco com rótulo e valor(es) (R$, alíquota e/ou percentual) para um conceito financeiro do período filtrado
- **Impostos (card)**: Total tributário do recorte e alíquota efetiva, ambos na mesma base do acompanhamento de impostos já usado no produto
- **Despesas Pendentes**: Soma das despesas operacionais do recorte ainda não pagas (sem categoria Impostos); distinta dos cards Fixas/Variáveis, que só somam despesas pagas do respectivo tipo (também sem Impostos)
- **Lucro (card)**: Resultado do período em R$ (Receita Líquida − Despesas Fixas − Despesas Variáveis) e sua participação percentual sobre a Receita Bruta
- **Saldo por conta**: Valor disponível/registrado de cada conta corrente (slots 1–3, rotulados pelo nome cadastrado) e da conta investimento
- **Centro de Despesa**: Visão gráfica da composição de despesas (mês e ano) sem impostos
- **Demonstrativo de Resultado**: Conjunto dos gráficos DRE do ano e DRL

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em revisão visual, 100% das sete seções listadas exibem título visível e contêm apenas os cards/gráficos previstos para cada uma, na ordem especificada
- **SC-002**: Em menos de 1 minuto, um usuário familiarizado com o painel localiza Metas, Receita, Despesa, Resultado, Saldo e os dois blocos de gráficos sem treinamento adicional
- **SC-003**: Os três novos cards (Impostos, Despesas Pendentes, Lucro) estão presentes e exibem os atributos pedidos (R$ + alíquota; R$; R$ + % sobre Receita Bruta) em 100% das visualizações com dados de exemplo válidos
- **SC-004**: Em cenário com impostos classificados no período, o total do Centro de Despesa é inferior ao total que incluiria impostos na mesma base — ou seja, a exclusão é verificável por comparação
- **SC-005**: A linha de Saldo mostra até três contas correntes distintas mais a Conta Investimento; o antigo card único consolidado de “Saldo Conta Corrente” não aparece mais

## Assumptions

- Escopo limitado à página Dashboard; outras telas não precisam espelhar esta estrutura nesta entrega
- A nomenclatura de receita/metas já alinhada em `039-dashboard-nomenclatura` é o ponto de partida dos rótulos desta feature
- Ordem em Metas segue o pedido do usuário: Mensal antes de Anual (diferente do arranjo histórico anual→mensal)
- "Conta Corrente 1/2/3" são slots posicionais para até três contas correntes ativas; o rótulo visível é o nome cadastrado da conta, com fallback “Conta Corrente N” (confirmado na sessão de esclarecimento)
- Lucro (R$) do card Resultado = Receita Líquida − (Despesas Fixas + Despesas Variáveis) no mesmo recorte (confirmado na sessão de esclarecimento); o % é sempre sobre Receita Bruta
- Alíquota e valor de Impostos no card seguem a mesma base do acompanhamento de impostos já existente no produto (confirmado na sessão de esclarecimento), não a diferença Receita Bruta − Receita Líquida nem necessariamente a série isolada do DRE
- Despesas Pendentes = contas a pagar do recorte com status ainda não pago (tipos operacionais aplicáveis, **exceto** categoria Impostos); Despesas Fixas e Variáveis = apenas as **pagas** do respectivo tipo, também **exceto** Impostos (confirmado na sessão de esclarecimento) — sem contagem dupla entre os cards nem com o card Impostos
- Despesas Fixas e Despesas Variáveis reutilizam a classificação já existente no domínio de contas a pagar
- A categoria Impostos é excluída de Fixas, Variáveis, Pendentes e do Centro de Despesa; permanece no card Impostos e no DRE quando aplicável (confirmado na sessão de esclarecimento)
- "Remover impostos do cálculo" no Centro de Despesa alinha-se à mesma exclusão da seção Despesa; o card Impostos e o DRE continuam podendo exibir impostos onde já fizer sentido
- Títulos "Despesas [Mês]" / "Despesas [Ano]" / "DRE [Ano]" incorporam o período do filtro de forma legível (ex.: mês/ano ou ano), mantendo a identidade pedida
- Não há redesenho amplo de identidade visual além do necessário para títulos de seção, novos cards e o layout em linhas descrito
