# Feature Specification: DRE — Linha Impostos (Contas Imposto / DAS)

**Feature Branch**: `075-dre-linha-impostos`

**Created**: 2026-09-16

**Status**: Draft

**Input**: User description: "Nova linha entre Receita Bruta e Despesas: Impostos = SUM de Contas a Pagar Where categoria = \"Impoosto / DAS\" do período"

**Baseline**: No gráfico **DRE** do Dashboard (Demonstrativo de Resultado), a composição mensal já exibe **Receita bruta**, **Despesa**, **Impostos** e **Lucro**. Após a feature `074-contas-tipo-imposto-das`, impostos e DAS passam a ser classificados pelo **Tipo Imposto / DAS** nas Contas a Pagar (não mais pela categoria Impostos). Esta feature (1) reposiciona a leitura de **Impostos** **entre** Receita Bruta e Despesas e (2) redefine o valor de Impostos do DRE como a **soma das Contas a Pagar com Tipo Imposto / DAS do período (mês)**. Complementa `003`, `047` (fonte do segmento Impostos no DRE) e `074`. Fora desta feature: card Impostos da seção Receita (NFs), página Impostos, cards Fixas/Variáveis/Pendentes e Resultado.

## Clarifications

### Session 2026-09-16

- Q: Qual data define se uma Conta a Pagar Tipo Imposto / DAS entra no mês de Impostos do DRE? → A: **Data de vencimento** no mês (pagas e pendentes com vencimento em M)
- Q: O card Impostos da seção Receita deve acompanhar esta feature? → A: **Manter** o card em imposto das NFs (DRE e card podem divergir)
- Q: Com card e DRE podendo divergir em “Impostos”, exibir aviso/hint das bases? → A: **Sem aviso** novo (divergência silenciosa)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ler Impostos entre Receita Bruta e Despesas no DRE (Priority: P1)

Como usuário autenticado (`admin` ou `visualizador`), no gráfico **DRE** do Dashboard vejo a linha/aspecto **Impostos** posicionada **entre** **Receita bruta** e **Despesa** na ordem de leitura da composição (legenda e empilhamento da barra de composição), de forma que a sequência canônica passe a ser: Receita bruta → Impostos → Despesa → Lucro.

**Why this priority**: O pedido central é a nova posição da linha Impostos na leitura do demonstrativo.

**Independent Test**: Abrir o Dashboard com DRE carregado; confirmar na legenda e na pilha de composição que Impostos aparece depois de Receita bruta e antes de Despesa; Lucro permanece após Despesa.

**Acceptance Scenarios**:

1. **Given** o gráfico DRE visível com todos os aspectos ativos, **When** o usuário observa a ordem canônica dos aspectos, **Then** a sequência é **Receita bruta**, **Impostos**, **Despesa**, **Lucro**
2. **Given** a barra de composição de um mês (pilha ao lado da Receita bruta), **When** o usuário lê os segmentos empilhados, **Then** **Impostos** aparece **antes** de **Despesa** (e Lucro, quando ≥ 0, permanece depois de Despesa)
3. **Given** a legenda interativa do DRE, **When** o usuário liga/desliga aspectos, **Then** Impostos continua podendo ser ocultado/reexibido independentemente, sem alterar a ordem relativa quando todos estão ativos
4. **Given** papéis `admin` e `visualizador`, **When** ambos abrem o mesmo ano, **Then** veem a mesma ordem e os mesmos valores (somente leitura)

---

### User Story 2 - Impostos do DRE = soma de Contas a Pagar Tipo Imposto / DAS do mês (Priority: P1)

Como usuário autenticado, o valor mensal de **Impostos** no DRE é a **soma dos valores** das Contas a Pagar cujo **Tipo** é **Imposto / DAS** e cuja **data de vencimento** cai naquele mês do ano exibido — pagas e pendentes. Contas Fixo ou Variável **não** entram nesse total, mesmo que a descrição mencione imposto.

**Why this priority**: Sem a fórmula correta, a nova linha permanece visualmente certa, mas financeiramente errada após a taxonomia da `074`.

**Independent Test**: Com Contas a Pagar conhecidas (Tipo Imposto / DAS com vencimento no mês M; Fixo/Variável no mesmo mês; Imposto / DAS em outro mês), conferir que Impostos(M) no DRE = soma só das Imposto / DAS com vencimento em M.

**Acceptance Scenarios**:

1. **Given** Contas a Pagar com Tipo **Imposto / DAS** e data de vencimento no mês M do ano A, **When** o usuário lê Impostos do DRE em M, **Then** o valor é a **soma** desses lançamentos (pagos e pendentes)
2. **Given** Contas a Pagar com Tipo Fixo ou Variável e vencimento em M, **When** o usuário lê Impostos de M, **Then** esses valores **não** entram em Impostos (permanecem elegíveis a Despesa conforme regras já vigentes de exclusão de imposto)
3. **Given** Conta Tipo Imposto / DAS com vencimento no mês N ≠ M, **When** o usuário lê Impostos de M, **Then** essa conta **não** entra no total de M
4. **Given** Conta Tipo Imposto / DAS **sem** data de vencimento, **When** o DRE agrega o ano, **Then** essa conta **não** entra em nenhum mês (não inventar mês)
5. **Given** o mesmo conjunto de contas, **When** o usuário compara Impostos do DRE com a página Impostos no mesmo mês/ano (vencimento), **Then** o total mensal do DRE é coerente com o recorte de Tipo Imposto / DAS desse período
6. **Given** o segmento Impostos do DRE após esta feature, **When** o usuário compara com a regra anterior baseada em imposto de NFs pagas, **Then** o DRE **não** usa mais a soma de imposto das NFs como fonte de Impostos (a fonte canônica passa a ser Contas a Pagar Tipo Imposto / DAS)

---

### User Story 3 - Despesa e Lucro coerentes com a nova linha de Impostos (Priority: P1)

Como usuário autenticado, ao mudar a fonte e a posição de Impostos, a **Despesa** do DRE continua **sem** misturar Contas Tipo Imposto / DAS, e o **Lucro** do mês permanece o resultado derivado **Receita bruta − Despesa − Impostos**, usando o novo Impostos.

**Why this priority**: Evita dupla contagem (imposto em Despesa e em Impostos) e mantém a identidade contábil do DRE.

**Independent Test**: Com receita, despesas operacionais e Imposto / DAS conhecidos no mês, conferir Despesa sem Imposto / DAS, Impostos = soma Imposto / DAS, Lucro = receita − despesa − impostos; com Lucro negativo, sem segmento empilhado negativo.

**Acceptance Scenarios**:

1. **Given** Contas Tipo Imposto / DAS no mês M, **When** o usuário lê **Despesa** do DRE em M, **Then** essas contas **não** entram em Despesa
2. **Given** Receita bruta, Despesa e Impostos de M conhecidos, **When** o usuário lê Lucro de M, **Then** Lucro = Receita bruta − Despesa − Impostos (com o Impostos da US2)
3. **Given** Lucro ≥ 0 e aspectos ativos, **When** o usuário compara a pilha de composição com a barra de Receita bruta, **Then** a leitura de composição (Impostos + Despesa + Lucro) permanece comparável à receita, como já previsto no DRE
4. **Given** Lucro &lt; 0, **When** o usuário inspeciona a pilha, **Then** não há segmento verde negativo; Impostos e Despesa ativos aparecem; o prejuízo permanece legível no tooltip/rótulo

---

### User Story 4 - Período e demais blocos do Dashboard intactos (Priority: P2)

Como usuário autenticado, ao trocar o ano do Dashboard, o DRE recalcula Impostos mês a mês com a nova regra; o **card Impostos** da seção Receita (imposto de NFs / alíquota), as abas de receita, Despesas Fixas/Variáveis/Pendentes e Resultado **não** mudam de regra nesta entrega.

**Why this priority**: Isola o escopo à linha do DRE e evita regressão nas demais leituras já estabilizadas.

**Independent Test**: Alterar o ano; conferir recálculo do DRE; alternar toggle Bruto/Líquido e confirmar que card Impostos (NFs) e cards de Despesas/Resultado mantêm comportamento vigente.

**Acceptance Scenarios**:

1. **Given** Dashboard no ano A com Impostos do DRE conhecidos, **When** o usuário muda para o ano B, **Then** cada mês de B reflete a soma de Contas Tipo Imposto / DAS com vencimento naquele mês de B
2. **Given** o card Impostos da seção Receita e o segmento Impostos do DRE no mesmo mês, **When** as fontes diferem (NFs vs Contas Imposto / DAS), **Then** os valores **podem** divergir; esta feature **não** obriga o card a seguir a soma de Contas a Pagar (**confirmado**: card permanece em NFs) e **não** exibe aviso/hint novo sobre as bases
3. **Given** toggle Bruto ↔ Líquido, **When** o usuário observa o DRE, **Then** Impostos do DRE (soma de Contas Imposto / DAS) **não** muda com o toggle
4. **Given** cards Despesas Fixas, Variáveis, Pendentes e Resultado, **When** esta feature entra em vigor, **Then** suas regras vigentes permanecem inalteradas

---

### Edge Cases

- Mês sem Contas Tipo Imposto / DAS: Impostos = 0; Despesa e Lucro seguem normalmente
- Só contas Imposto / DAS no mês (sem despesa operacional): Despesa = 0; Impostos = soma; Lucro = Receita bruta − Impostos
- Conta Imposto / DAS com categoria operacional preenchida (opcional na `074`): entra em Impostos do DRE pelo **Tipo**, independentemente da categoria
- Conta legada ainda referida como “categoria Impostos”: após `074`, o critério canônico é o **Tipo Imposto / DAS** (o pedido original “categoria Imposto / DAS” interpreta-se como esse Tipo)
- Ano civil corrente vs anterior: eixo e meses seguem as regras já vigentes do DRE (`003` / `047`); só muda fonte e ordem de Impostos
- Conta Imposto / DAS excluída/cancelada conforme regra já usada em Contas a Pagar: não entra no DRE
- Visualização com Impostos desmarcado na legenda: Despesa e Lucro ativos reempilham-se sem o segmento de Impostos; a fórmula do Lucro exibido no tooltip continua usando Impostos do mês mesmo se o segmento estiver oculto (ou, se o produto já omitir do tooltip aspectos ocultos, manter o padrão visual existente — o valor calculado de Lucro no dado mensal permanece receita − despesa − impostos)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: No gráfico DRE do Dashboard, a ordem canônica de leitura dos aspectos MUST ser: **Receita bruta**, **Impostos**, **Despesa**, **Lucro**
- **FR-002**: Na barra de composição mensal (pilha ao lado da Receita bruta), o segmento **Impostos** MUST aparecer **antes** do segmento **Despesa** quando ambos estiverem ativos
- **FR-003**: O valor mensal de **Impostos** no DRE MUST ser a soma dos valores das Contas a Pagar com **Tipo Imposto / DAS** cuja **data de vencimento** pertence àquele mês do ano exibido (critério exclusivo de alocação ao mês; a data de pagamento MUST NOT definir o mês do DRE). Contas pagas e pendentes com vencimento no mês entram igualmente.
- **FR-004**: Contas a Pagar com Tipo **Fixo** ou **Variável** MUST NOT entrar no total de Impostos do DRE
- **FR-005**: Contas Tipo Imposto / DAS **sem** data de vencimento MUST NOT entrar em nenhum mês do DRE
- **FR-006**: Contas Tipo Imposto / DAS MUST NOT entrar no aspecto **Despesa** do DRE (sem dupla contagem)
- **FR-007**: O **Lucro** mensal do DRE MUST permanecer `Receita bruta − Despesa − Impostos`, usando o Impostos definido em FR-003
- **FR-008**: Com Lucro &lt; 0, o DRE MUST NOT empilhar segmento negativo de Lucro; Impostos e Despesa ativos permanecem na pilha e o prejuízo permanece legível no tooltip/rótulo (comportamento já vigente)
- **FR-009**: O segmento Impostos do DRE MUST NOT usar mais a soma do imposto das NFs pagas como fonte canônica (substitui a regra de Impostos do DRE introduzida em `047` para este gráfico)
- **FR-010**: A legenda interativa MUST continuar permitindo ligar/desligar Impostos independentemente dos demais aspectos
- **FR-011**: `admin` e `visualizador` MUST ver os mesmos valores e a mesma ordem; esta feature não introduz edição
- **FR-012**: Esta feature MUST NOT alterar a regra do **card Impostos** da seção Receita (permanece imposto das NFs / alíquota), das abas Por Caixa / Por Competência, dos cards Despesas Fixas/Variáveis/Pendentes, do Resultado, do Centro de Despesas, do DRL nem da página Impostos além do necessário para o DRE. Divergência numérica entre card Impostos e segmento Impostos do DRE no mesmo mês é **esperada e aceita**.
- **FR-013**: Esta feature MUST NOT remover o card Impostos da seção Receita
- **FR-014**: Esta feature MUST NOT adicionar aviso, subtítulo ou hint novo explicando a divergência de bases entre o card Impostos (NFs) e o segmento Impostos do DRE (Contas Imposto / DAS).

### Key Entities

- **Impostos (aspecto DRE)**: Linha/segmento do Demonstrativo de Resultado; valor mensal = soma de Contas a Pagar Tipo Imposto / DAS com vencimento no mês
- **Conta a Pagar Tipo Imposto / DAS**: Lançamento fiscal classificado pelo Tipo (feature `074`); alimenta Impostos do DRE e a página Impostos
- **Despesa (aspecto DRE)**: Soma das despesas do mês **excluindo** Contas Tipo Imposto / DAS
- **Lucro (aspecto DRE)**: Resultado derivado Receita bruta − Despesa − Impostos

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das visualizações do DRE com todos os aspectos ativos, a ordem observada é Receita bruta → Impostos → Despesa → Lucro
- **SC-002**: Em 100% dos meses de teste com Contas Tipo Imposto / DAS conhecidas, Impostos do DRE coincide com a soma manual dessas contas por data de vencimento no mês (± R$ 0,01 de arredondamento)
- **SC-003**: Em 100% dos casos de teste, nenhuma Conta Tipo Imposto / DAS aparece simultaneamente em Despesa e em Impostos do mesmo mês
- **SC-004**: Em 100% dos meses com Lucro ≥ 0 e dados coerentes, Lucro exibido = Receita bruta − Despesa − Impostos (nova fonte)
- **SC-005**: Usuário de negócio identifica a linha Impostos entre Receita bruta e Despesa e interpreta o valor como impostos/DAS a pagar do mês em menos de 1 minuto, sem suporte técnico
- **SC-006**: Em 100% das sessões de regressão desta entrega, card Impostos (NFs), cards de Despesas/Resultado e página Impostos mantêm o comportamento vigente fora do DRE

## Assumptions

- O pedido “categoria = Imposto / DAS” (com typo “Impoosto”) refere-se ao **Tipo Imposto / DAS** das Contas a Pagar definido em `074` (a categoria Impostos foi removida)
- Escopo visual e de cálculo: **gráfico DRE do Dashboard**; “nova linha entre Receita Bruta e Despesas” = ordem e valor do aspecto Impostos nesse demonstrativo
- Critério de período do mês: **data de vencimento** (confirmado na sessão de esclarecimento 2026-09-16); data de pagamento não aloca o mês no DRE
- Inclui contas **pagas e pendentes** com vencimento no mês (não exige flag pago nem data de pagamento)
- Substitui apenas a fonte de **Impostos do DRE** que em `047` vinha das NFs; o **card Impostos** da seção Receita permanece na regra de NFs (confirmado na sessão de esclarecimento 2026-09-16); divergência entre card e DRE é aceita **sem** hint/aviso novo na UI
- Receita bruta do DRE permanece na regra já vigente (não muda nesta feature)
- Despesa do DRE permanece excluindo impostos; passa a excluir explicitamente pelo Tipo Imposto / DAS quando essa for a fonte da verdade
- Depende da classificação Tipo Imposto / DAS (`074`) já disponível nos dados de Contas a Pagar
- Papéis `admin` e `visualizador` reutilizados; somente leitura no DRE

## Out of Scope

- Alterar o card Impostos da seção Receita (imposto de NFs / alíquota)
- Alterar cards Despesas Fixas, Variáveis, Pendentes ou Resultado Competência/Caixa
- Redesign da página Impostos ou novos filtros de Contas a Pagar
- Mudar a regra de Receita bruta, DRL, Aging, Alerta de Fluxo ou Centro de Despesas
- Introduzir cadastro manual de linhas de DRE
- Persistir preferência de legendas do DRE entre sessões
- Adicionar aviso/hint de bases distintas entre card Impostos e Impostos do DRE
- Alinhar ou remover o card Impostos da seção Receita
