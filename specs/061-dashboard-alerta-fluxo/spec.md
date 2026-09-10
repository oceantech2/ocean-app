# Feature Specification: Alerta de Fluxo de Caixa no Dashboard

**Feature Branch**: `061-dashboard-alerta-fluxo`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "Módulo 6 do briefing técnico 'Lógica do Dashboard Financeiro' (https://claude.ai/code/artifact/7ec34fa0-d881-490a-9daa-931430208aee) — Seção 09 (Alerta de Fluxo de Caixa), tudo voltado ao Dashboard."

**Baseline**: Entrega no **Dashboard Financeiro** o **Alerta de Fluxo de Caixa** alinhado à Seção 09 do briefing: banner âmbar no topo do Dashboard, exibido **automaticamente** quando o percentual de receita **não recebida** do período supera um **limiar configurável** (padrão sugerido: **60%**). O alerta mostra três dados: **% não recebida**, **próximo recebimento** e **Aging em atenção**. Complementa as etapas 1–5 (`056` status/Pipeline, `057` toggle + Configuração do Período, `058` abas Por Caixa / Por Competência, `059` Despesas & Resultado, `060` Aging de Recebíveis). Esta é a última seção do briefing de cards (Seção 09).

## Clarifications

### Session 2026-09-10

- Q: Próximo recebimento — vencidos entram? → A: **Só vencimentos ≥ hoje**; se nenhuma NF elegível, indicar sem próximo/sem previsão (atrasos ficam no Aging).
- Q: Onde o `admin` edita o limiar? → A: **No Dashboard** (controle só `admin`, separado da Configuração do Período mensal).
- Q: Se Já Recebido > Total Fechado? → A: **Forçar % = 0** e **ocultar** o banner (sem % negativo nem aviso de inconsistência).
- Q: O banner pode ser dispensado (dismiss)? → A: **Não dismissível** — some só quando % ≤ limiar (ou período/toggle mudam o resultado).
- Q: Edição do limiar com banner oculto? → A: Controle **sempre disponível** para `admin` no Dashboard (banner visível ou não).
- Q: Falha ao carregar Aging ou totais de receita? → A: Com **% disponível** e acima do limiar, **exibir** o banner; campos falhos mostram **“indisponível”** — **não** forçar zero.
- Q: Limiar — só inteiros ou decimais? → A: **Só inteiros** (1–100).
- Q: Comparar % ao limiar — bruto ou arredondado? → A: Comparar o **% calculado** (precisão completa) ao limiar inteiro; arredondamento só na **exibição**.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver o banner quando a inadimplência relativa supera o limiar (Priority: P1)

Como usuário autenticado (`admin` ou `visualizador`), ao abrir o Dashboard no período selecionado, vejo automaticamente um **banner âmbar** no topo quando `% não recebida` **supera** o limiar configurado. Se o percentual estiver no limiar ou abaixo, o banner **não** aparece.

**Why this priority**: É o gatilho de atenção do módulo; sem a regra de exibição, o restante do alerta não entrega valor.

**Independent Test**: Com Total Fechado e Já Recebido conhecidos no período, ajustar o cenário para % acima e abaixo do limiar e conferir presença/ausência do banner.

**Acceptance Scenarios**:

1. **Given** período com Total Fechado > 0 e `(Total Fechado − Já Recebido) ÷ Total Fechado × 100` **maior** que o limiar vigente, **When** o usuário abre o Dashboard nesse período, **Then** o banner âmbar de Alerta de Fluxo de Caixa aparece no topo
2. **Given** o mesmo período com percentual **igual ou menor** que o limiar, **When** o usuário lê o Dashboard, **Then** o banner **não** é exibido
3. **Given** o banner visível no mês M, **When** o usuário troca para um mês N cujo percentual fica abaixo do limiar, **Then** o banner desaparece (e vice-versa quando N supera)
4. **Given** papéis `admin` e `visualizador`, **When** ambos abrem o mesmo período com % acima do limiar, **Then** ambos veem o mesmo banner e os mesmos três dados (somente leitura no alerta)
5. **Given** banner visível, **When** o usuário procura fechar/dispensar o banner, **Then** **não** há ação de dismiss — o banner permanece enquanto `% > limiar`
6. **Given** % calculável e acima do limiar, mas Aging (ou próximo recebimento) indisponível por falha de carga, **When** o usuário vê o topo, **Then** o banner **aparece** e o(s) campo(s) falho(s) mostram **“indisponível”** (não R$ 0)
7. **Given** Total Fechado / Já Recebido indisponíveis (não dá para calcular %), **When** o usuário abre o Dashboard, **Then** o banner **não** aparece por percentual
8. **Given** % calculado = 60,04 e limiar = 60, com UI exibindo ~60,0%, **When** o sistema decide exibir o banner, **Then** o banner **aparece** (comparação usa 60,04 > 60, não o arredondamento visual)

---

### User Story 2 - Ler % não recebida, próximo recebimento e Aging em atenção (Priority: P1)

Como usuário autenticado, com o banner visível, leio de forma clara: (1) o **% não recebida** do período; (2) o **próximo recebimento** (menor vencimento **≥ hoje** entre NFs em aberto + valor dessa NF, ou sem previsão); (3) o **Aging em atenção** (soma do bucket **60–90 dias** do Aging).

**Why this priority**: São os três dados canônicos da Seção 09; o banner sem conteúdo útil não orienta ação.

**Independent Test**: Fixture com fechamentos/recebimentos no período, NFs em aberto com vencimentos e valores no bucket 60–90; conferir os três números contra o cálculo manual.

**Acceptance Scenarios**:

1. **Given** Contas a Receber com `data_fechamento` no período, **When** o alerta calcula **% não recebida**, **Then** usa `(Total Fechado − Já Recebido) ÷ Total Fechado × 100`, com **Total Fechado** e **Já Recebido** ambos no universo filtrado por `data_fechamento` no período (mesma base da aba Por Competência / Pipeline)
2. **Given** NFs em aberto (emitidas e sem recebimento) com `data_vencimento_nf` **≥ hoje**, **When** o alerta mostra **próximo recebimento**, **Then** exibe a **menor** dessas datas **e** o valor da NF correspondente (na base do toggle)
3. **Given** NFs em aberto só com vencimento **no passado** (ou sem vencimento), **When** o alerta avalia próximo recebimento, **Then** indica **sem próximo / sem previsão** (não usa data passada); o atraso permanece visível via Aging / Aging em atenção
4. **Given** o Aging de Recebíveis disponível, **When** o alerta mostra **Aging em atenção**, **Then** o valor iguala o SUM do bucket **60–90 dias** do Aging (estoque global, mesma base do toggle)
5. **Given** empate de vencimento entre duas ou mais NFs elegíveis (≥ hoje) na mesma data mínima, **When** o alerta escolhe o valor do próximo recebimento, **Then** usa regra estável (maior valor na base ativa; se empatar, menor identificador) e a data exibida permanece a data mínima

---

### User Story 3 - Toggle Bruto/Líquido nos valores do alerta (Priority: P1)

Como usuário autenticado, ao alternar Bruto ↔ Líquido, o **% não recebida**, o **valor do próximo recebimento** e o **Aging em atenção** recalculam na base correspondente, sem mudar a lógica de quem entra no cálculo (só a base monetária).

**Why this priority**: Mantém coerência com o restante do Dashboard (toggle global da etapa 2).

**Independent Test**: Alternar o toggle com banner visível e conferir que percentuais e valores mudam de base; a decisão de exibir/ocultar o banner usa o % na base ativa.

**Acceptance Scenarios**:

1. **Given** banner visível em Líquido, **When** o usuário troca para Bruto, **Then** Total Fechado / Já Recebido do % , valor do próximo recebimento e Aging em atenção passam à base bruta
2. **Given** a troca de base faz o % cruzar o limiar (passar a não superar, ou passar a superar), **When** o usuário observa o topo, **Then** o banner some ou aparece conforme o % **na base ativa**
3. **Given** a mesma troca, **When** o usuário observa quais NFs entram no próximo recebimento / Aging em atenção, **Then** o universo de elegíveis **não** muda — só os valores

---

### User Story 4 - Configurar o limiar de exibição (Priority: P2)

Como `admin`, consigo definir o **limiar percentual** que dispara o banner **no próprio Dashboard** (controle separado da Configuração do Período). O `visualizador` não edita o limiar; apenas lê o alerta quando disparado.

**Why this priority**: O briefing exige limiar configurável; sem isso o produto fica engessado no 60%.

**Independent Test**: Admin altera o limiar no Dashboard; com o mesmo período, o banner passa a aparecer/desaparecer conforme o novo corte.

**Acceptance Scenarios**:

1. **Given** limiar ainda não personalizado, **When** o sistema avalia o alerta, **Then** usa **60%** como padrão
2. **Given** um `admin` autenticado no Dashboard, **When** ele salva um novo limiar válido (**inteiro** de 1 a 100) pelo controle do Dashboard, **Then** o Dashboard passa a usar esse limiar imediatamente nas próximas avaliações do banner
3. **Given** um `admin` tenta salvar limiar decimal (ex.: 60,5) ou não inteiro, **When** confirma a edição, **Then** o save é rejeitado com feedback claro e o limiar anterior permanece
4. **Given** um `visualizador` no Dashboard, **When** ele usa a página, **Then** **não** encontra controle de edição do limiar
5. **Given** limiar alterado de 60% para 40% e período com % = 50%, **When** o usuário reabre/atualiza o Dashboard, **Then** o banner passa a aparecer (antes não aparecia com limiar 60%)
6. **Given** a UI de Configuração do Período (meta + alíquota), **When** o `admin` a abre, **Then** o limiar **não** aparece como campo dessa configuração (fluxo separado)
7. **Given** período com `% ≤ limiar` (banner oculto), **When** o `admin` abre o Dashboard, **Then** o controle de edição do limiar **permanece disponível** (não depende do banner estar visível)

---

### Edge Cases

- Total Fechado do período = 0: o % não recebida fica **indisponível** (sem divisão por zero); o banner **não** dispara por %; próximo recebimento e Aging em atenção podem existir, mas **não** bastam sozinhos para exibir o banner nesta entrega
- Já Recebido = Total Fechado (tudo recebido): % = 0; banner oculto
- Já Recebido > Total Fechado (inconsistência de dados): forçar **% = 0** e **ocultar** o banner (sem percentual negativo e sem banner de inconsistência)
- Nenhuma NF em aberto com `data_vencimento_nf` ≥ hoje: “próximo recebimento” fica **sem próximo / sem previsão** (não usa vencimento passado nem inventa data)
- Bucket 60–90 vazio: Aging em atenção = 0 (ainda assim o banner pode aparecer se o % superar o limiar)
- Dashboard em modo **só-ano**: % usa Total Fechado / Já Recebido **do ano** (mesmo critério de fechamento no período ampliado); limiar e regra de “supera” inalterados
- Empate de `data_vencimento_nf` mínima (≥ hoje): regra estável documentada (sem oscilar entre reloads)
- Tentativa de dismiss do banner: sem efeito / controle inexistente; banner permanece se `% > limiar`
- Falha ao obter Aging ou universo de próximo recebimento, com % ainda disponível e `% > limiar`: banner **visível**; campo afetado = **“indisponível”** (MUST NOT exibir 0 como se fosse valor real)
- Falha ao obter Total Fechado / Já Recebido (ou % indisponível): banner **oculto** — sem disparo por percentual
- % calculado ligeiramente acima do limiar inteiro, mas exibição arredondada “parece” igual ao limiar: banner **visível** (decisão usa precisão completa)
- Limiar inválido na edição (vazio, ≤ 0, > 100, **não inteiro** / decimal): save rejeitado com feedback claro; limiar anterior permanece
- Fuso/“hoje” para aging/próximo vencimento: data civil de hoje do ambiente operacional (mesmo padrão do Aging)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O Dashboard MUST exibir um **banner âmbar** de Alerta de Fluxo de Caixa no **topo** quando `% não recebida` **supera** o limiar configurado (`% > limiar`); MUST NOT exibir quando `% ≤ limiar`
- **FR-001a**: O banner MUST NOT ser dismissível pelo usuário; MUST permanecer visível enquanto a condição `% > limiar` for verdadeira na base ativa e período selecionados, e MUST desaparecer automaticamente quando a condição deixar de valer
- **FR-001b**: A comparação `% > limiar` MUST usar o **percentual calculado** (precisão completa), **não** o valor arredondado só para exibição; arredondamento visual (ex.: 0,1 pp) MUST NOT alterar a decisão de mostrar/ocultar o banner
- **FR-002**: O **% não recebida** MUST ser `(Total Fechado − Já Recebido) ÷ Total Fechado × 100` quando Total Fechado > 0, com **ambos** Total Fechado e Já Recebido filtrados por `data_fechamento` no período selecionado (alinhado à aba Por Competência / Pipeline — **não** ao Recebido da aba Por Caixa)
- **FR-003**: Com Total Fechado = 0, o sistema MUST NOT calcular % por divisão; MUST NOT disparar o banner por percentual
- **FR-003a**: Se Já Recebido > Total Fechado (com Total Fechado > 0), o sistema MUST tratar **% não recebida = 0** e MUST NOT exibir o banner; MUST NOT exibir percentual negativo nem banner de inconsistência
- **FR-004**: O alerta MUST exibir **próximo recebimento** = `MIN(data_vencimento_nf)` entre Contas a Receber em aberto (NF emitida e sem recebimento) com vencimento preenchido **e** `data_vencimento_nf` **≥ hoje**, **mais** o valor dessa NF na base do toggle; o universo é o **estoque global** em aberto (não filtrado pelo mês do Dashboard), alinhado ao Aging
- **FR-004a**: Se não houver NF elegível com vencimento ≥ hoje, o alerta MUST indicar **sem próximo / sem previsão** e MUST NOT exibir data passada como próximo recebimento (atrasos ficam no Aging / Aging em atenção)
- **FR-005**: O alerta MUST exibir **Aging em atenção** = SUM(valor) do bucket **60–90 dias** do Aging de Recebíveis, na base do toggle
- **FR-006**: Valores monetários e o % do alerta MUST seguir o toggle global Bruto/Líquido; a composição do universo (quem entra) MUST permanecer a mesma ao alternar
- **FR-007**: A decisão de mostrar/ocultar o banner MUST usar o % calculado na **base ativa** do toggle
- **FR-008**: MUST existir limiar configurável com **padrão 60%**; o valor MUST ser um **inteiro** de **1 a 100** (inclusive); apenas `admin` MUST poder alterá-lo **no Dashboard**, em controle **separado** da Configuração do Período; `visualizador` MUST apenas ler o alerta
- **FR-008a**: A edição do limiar MUST NOT residir na página Configurações (usuários/permissões) nem como campo da Configuração do Período nesta entrega
- **FR-008b**: O controle de edição do limiar MUST permanecer **sempre disponível** para `admin` no Dashboard, independentemente de o banner estar visível ou oculto
- **FR-008c**: Valores decimais ou não inteiros MUST ser rejeitados na edição do limiar (mesmo se estiverem entre 1 e 100)
- **FR-009**: O limiar MUST ser um **parâmetro global** do sistema (não um campo por mês da Configuração do Período), salvo decisão futura documentada em contrário
- **FR-010**: `admin` e `visualizador` MUST ver os mesmos números do alerta no mesmo momento; esta feature não introduz edição nos três dados do banner
- **FR-011**: Cancelados/excluídos MUST permanecer fora dos cálculos, alinhados às leituras de receita / Aging já usadas no Dashboard
- **FR-012**: Esta feature MUST reutilizar as definições já estabelecidas de Total Fechado / Já Recebido (`058`) e do bucket 60–90 (`060`); MUST NOT redefinir regras conflitantes
- **FR-013**: Em empate de vencimento mínimo **entre elegíveis (≥ hoje)**, o sistema MUST preferir a NF de **maior valor** na base ativa; se ainda empatar, a de **menor identificador** estável
- **FR-014**: Se o **% não recebida** estiver disponível e `% > limiar`, o banner MUST ser exibido mesmo que **Aging em atenção** e/ou **próximo recebimento** falhem ao carregar; nesses campos o sistema MUST mostrar **“indisponível”** e MUST NOT substituir por zero
- **FR-015**: Se o **% não recebida** estiver indisponível (ex.: falha ao obter Total Fechado / Já Recebido), o sistema MUST NOT exibir o banner por percentual

### Key Entities

- **Alerta de Fluxo de Caixa**: Banner condicional no topo do Dashboard com % não recebida, próximo recebimento e Aging em atenção
- **Limiar de exibição**: Percentual global **inteiro** de 1 a 100 (padrão 60) acima do qual o banner aparece; editável por `admin` no Dashboard (fluxo separado da Configuração do Período)
- **% não recebida**: Indicador do período = parcela do Total Fechado ainda não recebida (fechamento no período)
- **Próximo recebimento**: Menor vencimento **≥ hoje** entre NFs em aberto + valor da NF escolhida; ausente se só houver vencidos/sem vencimento
- **Aging em atenção**: Soma monetária do bucket 60–90 dias do Aging
- **Toggle Bruto/Líquido**: Define a base dos valores e do % do alerta

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em fixture com Totais Fechado/Já Recebido conhecidos e limiar 60%, o banner aparece em 100% dos casos com % > 60 e em 0% dos casos com % ≤ 60
- **SC-002**: Em 100% dos casos com Total Fechado > 0, o % exibido difere em no máximo 0,1 ponto percentual de `(Total Fechado − Já Recebido) ÷ Total Fechado × 100` na base do toggle
- **SC-003**: Em fixture com NFs em aberto e vencimentos controlados (≥ hoje e no passado), a data do próximo recebimento é exatamente a mínima entre vencimentos **≥ hoje** em 100% dos casos; com só vencidos, 100% dos casos mostram sem próximo/sem previsão
- **SC-004**: Em 100% das comparações no mesmo momento/toggle, |Aging em atenção − SUM(bucket 60–90 do Aging)| ≤ R$ 0,01
- **SC-005**: Em 100% das alternâncias Bruto ↔ Líquido, o universo de elegíveis permanece idêntico e apenas a base monetária/% muda
- **SC-006**: Após `admin` alterar o limiar, em até a próxima atualização do Dashboard o banner reflete o novo corte em 100% dos cenários de teste
- **SC-007**: `visualizador` e `admin` obtêm os mesmos três dados do alerta em 100% das comparações no mesmo momento
- **SC-008**: Usuário identifica se há risco de caixa no período (banner presente + % + próximo vencimento) em até 10 segundos em cenário de demonstração com dados preenchidos
- **SC-009**: Com Total Fechado = 0, em 100% dos casos o banner **não** dispara por divisão inválida
- **SC-010**: Com Já Recebido > Total Fechado e Total Fechado > 0, em 100% dos casos o % tratado é 0 e o banner permanece oculto
- **SC-011**: Com % disponível e `% > limiar` e Aging (ou próximo) falho, em 100% dos casos o banner aparece e o campo falho exibe “indisponível” (não R$ 0)
- **SC-012**: Com % indisponível, em 100% dos casos o banner permanece oculto
- **SC-013**: Em 100% das tentativas de salvar limiar não inteiro ou fora de 1–100, o save é rejeitado e o limiar vigente não muda
- **SC-014**: Em fixture com % calculado > limiar e exibição arredondada ≤ limiar (ou visualmente “igual”), o banner aparece em 100% dos casos (comparação pela precisão completa)

## Assumptions

- Escopo = Seção 09 do briefing; entrega 100% no **Dashboard**
- “Recebido” na fórmula do briefing é o **Já Recebido** da competência (mesmo universo de fechamento no período), **não** o Recebido da aba Por Caixa
- Limiar é **global** (um valor para o sistema), padrão 60%; editável **no Dashboard** por `admin`, separado da Configuração do Período; a menção do briefing a “Configuração do Período **ou** parâmetros globais” é resolvida em favor de **parâmetro global** com UI no Dashboard
- Edição do limiar **não** fica em Configurações (usuários) nesta entrega (clarify 2026-09-10)
- Próximo recebimento e Aging em atenção usam estoque **global** em aberto (como o Aging); só o % é filtrado pelo período do Dashboard
- “Supera” o limiar significa **estritamente maior** (`>`), usando o % **calculado** (não o arredondado da UI)
- Depende logicamente de `057` (toggle), `058` (Total Fechado / Já Recebido) e `060` (bucket 60–90)
- Papéis `admin` / `visualizador` inalterados
- Empate de vencimento (≥ hoje): preferir a NF de **maior valor** na base ativa; se ainda empatar, a de menor identificador estável
- Próximo recebimento **não** usa vencimentos passados (clarify 2026-09-10); atraso permanece no Aging
- Inconsistência Já Recebido > Total Fechado: % forçado a 0 e banner oculto (clarify 2026-09-10)
- Banner **não** é dismissível (clarify 2026-09-10)
- Edição do limiar sempre disponível para `admin` no Dashboard, com ou sem banner (clarify 2026-09-10)
- Falha parcial: banner depende só do % disponível > limiar; campos falhos = “indisponível”, sem zero falso (clarify 2026-09-10)
- Limiar válido = **inteiro** de 1 a 100; padrão 60 (clarify 2026-09-10)
- Comparação banner: **% calculado** (precisão completa) vs limiar inteiro; arredondamento só na UI (clarify 2026-09-10)

## Out of Scope

- Banner dismissível / “não mostrar de novo”
- Novos cards além do banner de alerta da Seção 09
- Alterar regras de Pipeline, Por Caixa / Por Competência, Despesas & Resultado ou Aging além do **consumo** dos totais/buckets já definidos
- Limiar por mês dentro da Configuração do Período (meta + alíquota)
- Edição do limiar na página Configurações (usuários/permissões)
- Drill-down obrigatório do banner para listagens
- Notificações push/e-mail fora do Dashboard
- Novos papéis de usuário
- Recálculo ou redefinição do Aging (permanece em `060`)
