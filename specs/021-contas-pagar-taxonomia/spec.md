# Feature Specification: Contas a Pagar — Taxonomia de Categorias

**Feature Branch**: `021-contas-pagar-taxonomia`

**Created**: 2026-08-12

**Status**: Draft

**Input**: User description: "na tela de contas a pagar — Estruturar categorias: Adm/Financeiro, Operações, Marketing, Comercial; Criar categoria Recursos Humanos com subcategorias: Salário, Bônus, Comissão, Retirada Sócios; Adicionar categorias: Benefícios, Tecnologia, Impostos"

## Clarifications

### Session 2026-08-12

- Q: Como tratar as contas já gravadas como Recursos Humanos / Benefícios? → A: Não migrar: contas antigas ficam em RH / Benefícios até o admin editar e escolher Benefícios
- Q: Como listagem e edição apresentam essas contas legado? → A: Sem aviso extra: listagem e edição mostram RH / Benefícios; salvar outros campos mantém; para reclassificar, o admin troca para a categoria Benefícios (primeiro nível)
- Q: O que a importação faz com linha RH + Benefícios? → A: Rejeita a linha; só aceita Benefícios como categoria de primeiro nível

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Classificar despesa nas categorias estruturadas (Priority: P1)

Na página **Contas a Pagar**, o administrador escolhe a categoria da despesa em um conjunto fechado e ordenado. As quatro categorias de estrutura operacional vêm primeiro; em seguida Recursos Humanos (com subcategorias); depois Benefícios, Tecnologia e Impostos — todas no mesmo nível, sem subcategoria.

**Taxonomia oficial (ordem de exibição):**

| Categoria | Subcategorias |
|-----------|---------------|
| Adm/Financeiro | Nenhuma |
| Operações | Nenhuma |
| Marketing | Nenhuma |
| Comercial | Nenhuma |
| Recursos Humanos | Salário, Bônus, Comissão, Retirada Sócios (obrigatória uma delas) |
| Benefícios | Nenhuma |
| Tecnologia | Nenhuma |
| Impostos | Nenhuma |

**Why this priority**: Sem a taxonomia correta, o time classifica despesas no lugar errado (em especial Benefícios misturado com RH) e a leitura gerencial fica distorcida.

**Independent Test**: Abrir o formulário de criar/editar conta a pagar e conferir a lista completa e a ordem; salvar uma conta em cada categoria de primeiro nível (sem RH); confirmar na listagem.

**Acceptance Scenarios**:

1. **Given** um administrador no formulário de conta a pagar, **When** abre o campo Categorias, **Then** as opções são exatamente, nesta ordem: Adm/Financeiro, Operações, Marketing, Comercial, Recursos Humanos, Benefícios, Tecnologia, Impostos.
2. **Given** o administrador selecionou Adm/Financeiro, Operações, Marketing, Comercial, Benefícios, Tecnologia ou Impostos, **When** preenche os demais obrigatórios e salva, **Then** a conta fica classificada só com essa categoria (sem pedir subcategoria).
3. **Given** o formulário aberto, **When** o administrador observa Benefícios, Tecnologia e Impostos, **Then** cada uma aparece como categoria de primeiro nível, não como subcategoria de Recursos Humanos.
4. **Given** um visualizador na listagem, **When** consulta as contas, **Then** vê os rótulos da taxonomia oficial e não altera a classificação.

---

### User Story 2 - Classificar Recursos Humanos com subcategoria (Priority: P1)

Quando a categoria é **Recursos Humanos**, o administrador informa obrigatoriamente uma subcategoria: Salário, Bônus, Comissão ou Retirada Sócios. **Benefícios não é mais subcategoria de RH.**

**Why this priority**: Folha, bônus, comissão e retirada de sócios precisam ser distinguíveis entre si e separados de benefícios.

**Independent Test**: Selecionar Recursos Humanos, tentar salvar sem subcategoria (deve bloquear); salvar com cada uma das quatro subcategorias; confirmar que Benefícios não aparece na lista de subcategorias.

**Acceptance Scenarios**:

1. **Given** o administrador selecionou **Recursos Humanos**, **When** tenta salvar sem subcategoria, **Then** o sistema impede o salvamento e pede uma das quatro: Salário, Bônus, Comissão ou Retirada Sócios.
2. **Given** Recursos Humanos e uma das quatro subcategorias válidas, **When** salva, **Then** a conta fica classificada com a combinação categoria + subcategoria e isso aparece na listagem.
3. **Given** um **novo** lançamento (ou edição de conta que não é legado RH / Benefícios) com Recursos Humanos, **When** o administrador lê as subcategorias, **Then** **não** encontra Benefícios nessa lista (as quatro oficiais apenas).
4. **Given** o administrador selecionou uma categoria que não é Recursos Humanos, **When** observa o formulário, **Then** o campo de subcategoria não é exigido (e não precisa ser preenchido).

---

### User Story 3 - Filtrar a lista pela taxonomia nova (Priority: P2)

Qualquer usuário autenticado filtra a listagem de Contas a Pagar pela categoria de primeiro nível. Em Recursos Humanos, também pode filtrar por uma das quatro subcategorias. Filtrar por Benefícios mostra só contas dessa categoria (não mistura com RH).

**Why this priority**: A classificação só gera valor se a consulta e o recorte gerencial usarem a mesma taxonomia.

**Independent Test**: Criar ao menos uma conta em Benefícios e uma em RH/Salário; filtrar por Benefícios e ver só a primeira; filtrar por RH (sem subcategoria) e ver contas de RH (quatro subcategorias oficiais e, se houver, legado RH / Benefícios); filtrar RH + Salário e ver só essa subcategoria.

**Acceptance Scenarios**:

1. **Given** a listagem com contas em várias categorias, **When** o usuário filtra por uma categoria de primeiro nível (ex.: Marketing ou Benefícios), **Then** vê apenas as contas dessa categoria (Benefícios de primeiro nível; **não** inclui o legado RH / Benefícios).
2. **Given** o filtro **Recursos Humanos** sem subcategoria, **When** aplicado, **Then** inclui Salário, Bônus, Comissão, Retirada Sócios e também contas **legado** RH / Benefícios ainda não reclassificadas; **não** inclui contas da categoria Benefícios (primeiro nível).
3. **Given** o filtro Recursos Humanos + subcategoria Salário, **When** aplicado, **Then** vê apenas as contas dessa subcategoria.
4. **Given** o filtro “todas as categorias”, **When** aplicado, **Then** a lista não restringe por categoria.

---

### User Story 4 - Preservar contas já classificadas como RH / Benefícios (Priority: P2)

Contas a pagar já gravadas com a combinação antiga **Recursos Humanos + Benefícios** **não** são convertidas automaticamente. Permanecem nessa classificação até o administrador **editar e gravar** a categoria **Benefícios** (primeiro nível). **Não** há aviso de pendência: na listagem e na edição o rótulo continua **Recursos Humanos / Benefícios**. Salvar valor, datas ou pagar **sem** mudar a categoria mantém o par legado. Para reclassificar, o admin troca o campo Categorias para **Benefícios** (primeiro nível) ou outra categoria oficial. Lançamentos **novos** em Benefícios já entram na fatia própria do custo por categoria.

**Why this priority**: O histórico não deve ser reescrito sem decisão do admin em cada conta; a taxonomia nova vale para o que for lançado ou reclassificado daqui para frente.

**Independent Test**: Com contas antigas RH/Benefícios, conferir rótulo RH / Benefícios **sem** aviso de pendência; abrir edição e ver o valor atual; salvar só o valor e confirmar que a classificação não muda; gravar categoria Benefícios e conferir que saiu de RH.

**Acceptance Scenarios**:

1. **Given** contas existentes classificadas como Recursos Humanos / Benefícios, **When** a nova taxonomia entra em vigor, **Then** a classificação persistida **não** muda: continuam com o rótulo **Recursos Humanos / Benefícios** na listagem, **sem** aviso de pendência de reclassificação.
2. **Given** o administrador abre a edição de uma dessas contas, **When** observa Categorias e subcategoria, **Then** vê o valor atual RH / Benefícios (opção legado só nessa conta); **não** há banner de pendência.
3. **Given** o administrador altera só o valor (ou paga) e salva, **When** a categoria não foi trocada, **Then** a conta permanece RH / Benefícios.
4. **Given** o administrador troca Categorias para **Benefícios** (primeiro nível) e salva, **When** a gravação conclui, **Then** a conta fica Benefícios, sem subcategoria, e deixa de aparecer no filtro RH.
5. **Given** essas contas legado ainda não reclassificadas, **When** o usuário filtra por Recursos Humanos ou consulta custo por categoria, **Then** elas entram em RH — **não** na categoria Benefícios.
6. **Given** contas Recursos Humanos / Salário, Bônus, Comissão ou Retirada Sócios, **When** a taxonomia é atualizada, **Then** permanecem em RH com a mesma subcategoria.
7. **Given** contas já em Adm/Financeiro, Operações, Marketing, Comercial, Tecnologia ou Impostos, **When** a taxonomia é atualizada, **Then** a classificação permanece a mesma.
8. **Given** contas novas (ou já reclassificadas) na categoria Benefícios, **When** o usuário consulta custo por categoria, **Then** essas contas aparecem na fatia Benefícios e não somam em Recursos Humanos.
9. **Given** a tela Retiradas, **When** o usuário consulta, **Then** continua vendo apenas contas Recursos Humanos / Retirada Sócios (nem o legado RH / Benefícios nem a categoria Benefícios entram nessa tela).
10. **Given** a tela Impostos, **When** o usuário consulta, **Then** continua vendo contas da categoria Impostos.

---

### Edge Cases

- Salvar sem categoria: bloqueado com feedback claro.
- Recursos Humanos sem subcategoria: bloqueado até escolher uma das quatro.
- Benefícios, Tecnologia ou Impostos com subcategoria preenchida: o sistema não exige nem persiste subcategoria nessas categorias.
- Tentativa de **criar** ou **importar** Benefícios como subcategoria de RH: rejeitada.
- Conta **legado** RH / Benefícios: **sem** aviso de pendência; listagem e edição mostram RH / Benefícios; pagar ou editar demais campos sem alterar a categoria **não** converte a conta.
- Edição de legado: o valor atual RH / Benefícios permanece visível; para ir à taxonomia nova, o admin troca Categorias para Benefícios (primeiro nível) ou outra oficial — não escolhe Benefícios de novo como subcategoria de RH.
- Novo lançamento com RH: Benefícios **não** está na lista de subcategorias.
- Filtro RH sem subcategoria: inclui as quatro subcategorias oficiais e o legado RH / Benefícios; **não** inclui a categoria Benefícios (primeiro nível).
- Filtro da categoria Benefícios: só contas já gravadas como Benefícios de primeiro nível.
- Importação com “Benefícios” como categoria de primeiro nível: aceita; linha com RH + Benefícios é rejeitada com erro claro na linha (não converte e não grava legado).
- Exportação de contas legado pode ainda trazer RH / Benefícios no arquivo; **reimportar** essas linhas falha até o arquivo usar a taxonomia nova.
- Importação com categoria ou subcategoria fora da taxonomia oficial: linha rejeitada.
- Contas pendentes de reclassificação por **outros** valores legado (anteriores a esta feature): continuam operáveis; o admin escolhe uma categoria da taxonomia nova ao reclassificar.
- Visualizador: consulta e filtra; não cria nem altera classificação.
- Ordem das opções no formulário e no filtro deve ser a da tabela oficial (US1).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Na página Contas a Pagar, o sistema DEVE oferecer exatamente estas categorias de primeiro nível, nesta ordem: Adm/Financeiro, Operações, Marketing, Comercial, Recursos Humanos, Benefícios, Tecnologia, Impostos.
- **FR-002**: Quando a categoria for Recursos Humanos, o sistema DEVE exigir uma subcategoria entre: Salário, Bônus, Comissão, Retirada Sócios.
- **FR-003**: Benefícios, Tecnologia e Impostos DEVEM ser categorias de primeiro nível. Em **novo lançamento**, Benefícios NÃO DEVE aparecer como subcategoria de Recursos Humanos. Na **edição de conta legado** RH / Benefícios, o valor atual DEVE permanecer visível; Benefícios NÃO DEVE ser oferecido como subcategoria nova de RH.
- **FR-004**: Categorias que não são Recursos Humanos NÃO DEVEM exigir subcategoria para salvar.
- **FR-005**: O sistema DEVE persistir a categoria (e a subcategoria de RH, quando aplicável) em cada conta a pagar e exibi-la na listagem.
- **FR-006**: O usuário DEVE poder filtrar a listagem por categoria de primeiro nível. O filtro Recursos Humanos sem subcategoria DEVE incluir as quatro subcategorias oficiais de RH e as contas **legado** RH / Benefícios ainda não reclassificadas, e DEVE excluir a categoria Benefícios (primeiro nível). O usuário DEVE poder filtrar por uma subcategoria oficial específica de RH.
- **FR-007**: Contas já gravadas como Recursos Humanos / Benefícios NÃO DEVEM ser convertidas automaticamente nem marcadas como pendentes de reclassificação. DEVEM aparecer na listagem e na edição com o rótulo Recursos Humanos / Benefícios. Pagar ou alterar demais campos sem mudar a categoria NÃO DEVE reclassificar. A reclassificação ocorre somente quando o administrador grava a categoria Benefícios (primeiro nível) ou outra da taxonomia oficial. Demais classificações válidas DEVEM ser preservadas.
- **FR-008**: A visão de custo por categoria DEVE tratar a categoria **Benefícios** (primeiro nível) como fatia própria. Contas legado RH / Benefícios DEVEM continuar somando em Recursos Humanos até serem reclassificadas. Impostos e Retiradas DEVEM continuar filtrando pelos recortes já vigentes (categoria Impostos e RH / Retirada Sócios); o legado RH / Benefícios NÃO entra em Retiradas.
- **FR-009**: A importação de contas a pagar DEVE aceitar somente a taxonomia oficial desta spec. Linha com categoria/subcategoria ausente, antiga ou inválida — **incluindo RH + Benefícios** — DEVE ser rejeitada com erro identificável na linha. A importação NÃO DEVE gravar o par legado nem converter a linha em Benefícios de primeiro nível.
- **FR-010**: Papel `admin` DEVE poder criar e editar a classificação; papel `visualizador` DEVE ter somente leitura.
- **FR-011**: Subcategorias existem somente sob Recursos Humanos. O conjunto de categorias é fechado: o usuário NÃO DEVE criar categorias ou subcategorias avulsas nesta feature.

### Key Entities

- **Conta a Pagar**: Despesa da página Contas a Pagar; inclui categoria e, se Recursos Humanos, subcategoria.
- **Categoria**: Classificação gerencial de primeiro nível; conjunto fechado e ordenado em FR-001.
- **Subcategoria de RH**: Refinamento obrigatório só sob Recursos Humanos em lançamentos novos; conjunto fechado em FR-002 (sem Benefícios).
- **Classificação legado RH / Benefícios**: par antigo ainda persistido; visível sem aviso de pendência até reclassificação manual.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos fluxos de criar/editar conta a pagar, as opções de Categorias coincidem com a taxonomia oficial desta spec, na ordem definida.
- **SC-002**: 100% das tentativas de salvar Recursos Humanos sem subcategoria são bloqueadas com feedback claro.
- **SC-003**: Em 100% dos **novos** lançamentos, Benefícios aparece como categoria de primeiro nível e não como opção nova de subcategoria de RH.
- **SC-004**: Um administrador classifica uma conta nova em Benefícios e outra em Recursos Humanos / Salário em menos de 2 minutos no fluxo padrão, sem suporte técnico.
- **SC-005**: 100% das contas já gravadas como Recursos Humanos / Benefícios permanecem com essa classificação após a atualização (0% convertidas automaticamente; 0% com aviso de pendência); 100% das que o admin grava como Benefícios de primeiro nível saem de RH e entram em Benefícios.
- **SC-009**: Em 100% das edições de legado em que só outros campos são salvos, a classificação RH / Benefícios permanece.
- **SC-006**: Na visão de custo por categoria, contas legado RH / Benefícios permanecem na fatia Recursos Humanos até a reclassificação; 100% das contas gravadas como categoria Benefícios (novas ou reclassificadas) entram na fatia Benefícios e 0% dessas somam em RH.
- **SC-007**: Em testes de importação, 100% das linhas com RH + Benefícios ou categoria inválida são rejeitadas com erro identificável (0% gravadas como legado e 0% convertidas em silêncio); linhas válidas na taxonomia nova são aceitas.
- **SC-008**: Visualizadores consultam categorias e filtros em 100% das sessões, com 0% de ações de escrita disponíveis para esse papel.

## Assumptions

- Esta feature **atualiza a taxonomia já vigente** de Contas a Pagar; não altera o fluxo de lançamento manual, status pago/pendente, exclusão individual nem a ausência de exclusão em massa.
- A mudança principal em relação à taxonomia anterior é **promover Benefícios a categoria de primeiro nível** e **retirá-la das subcategorias de RH**. Tecnologia e Impostos já existiam como categorias de primeiro nível e permanecem.
- Subcategorias existem **somente** sob Recursos Humanos.
- O conjunto é **fechado**: não há cadastro livre de categorias pelo usuário nesta entrega.
- **Não há migração automática** de RH / Benefícios → Benefícios. O histórico permanece visível como RH / Benefícios, **sem** aviso de pendência, até o admin gravar a categoria Benefícios (primeiro nível) ou outra da taxonomia oficial.
- Contas ainda pendentes de reclassificação por motivos anteriores (valores sem mapeamento) continuam com o fluxo já vigente até o admin escolher uma categoria da taxonomia nova.
- Importação aceita **somente** a taxonomia nova. Linha com RH + Benefícios é **rejeitada** (não grava legado e não converte para a categoria Benefícios). Contas já persistidas não são alteradas pela importação.
- Ajuste mínimo em custo por categoria, Impostos e Retiradas para lerem a taxonomia nova; redesign dessas telas está fora do escopo.
- Papéis `admin` e `visualizador` são reutilizados.
- Rótulo do campo permanece **Categorias** (já vigente).

## Out of Scope

- Permitir que o usuário crie, renomeie ou exclua categorias/subcategorias.
- Subcategorias para Adm/Financeiro, Operações, Marketing, Comercial, Benefícios, Tecnologia ou Impostos.
- Alterar a lógica de input manual, datas, status pago/pendente ou comprovantes.
- Reintroduzir exclusão em massa.
- Conversão em massa (automática ou por lote) de RH / Benefícios para a categoria Benefícios.
- Redesign do Dashboard, Impostos ou Retiradas além do necessário para a categoria Benefícios (primeiro nível) aparecer como fatia própria e os recortes atuais continuarem corretos.
- Aplicar esta taxonomia a Contas a Receber ou a outros módulos que não usem as categorias de Contas a Pagar.
