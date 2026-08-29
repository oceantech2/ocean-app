# Feature Specification: Dashboard — Nomenclatura e Remoção de Card

**Feature Branch**: `039-dashboard-nomenclatura`

**Created**: 2026-08-27

**Status**: Draft

**Input**: User description: "DASHBOARD - Remover o card Fechamentos por Tipo; renomear campos: Meta de Faturamento Anual → Meta de Receita Anual; Meta de Faturamento → Meta de Receita Mensal; Faturamento Bruto → Receita Bruta; Faturamento Líquido → Receita Líquida; NFs com pagamento pendente → Receita Pendente; Custo por categoria → Centro de Despesas; Faturamento Líquido por Mês → DRL"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver rótulos de receita e despesas atualizados (Priority: P1)

Como usuário autenticado (admin ou visualizador), ao abrir o Dashboard, vejo os indicadores e seções com a nova nomenclatura de receita e despesas, alinhada ao vocabulário financeiro interno da empresa.

**Why this priority**: A terminologia incorreta ou desatualizada gera confusão na leitura diária do painel; o valor imediato é clareza de negócio sem alterar cálculos.

**Independent Test**: Abrir o Dashboard e conferir, um a um, que cada rótulo listado na tabela de renomeação aparece com o novo texto e que os textos antigos não estão visíveis na tela.

**Acceptance Scenarios**:

1. **Given** o usuário está autenticado e acessa o Dashboard, **When** visualiza os cards e seções de indicadores, **Then** vê "Meta de Receita Anual" no lugar de "Meta de Faturamento Anual"
2. **Given** o usuário está no Dashboard, **When** visualiza a meta mensal, **Then** vê "Meta de Receita Mensal" no lugar de "Meta de Faturamento"
3. **Given** o usuário está no Dashboard, **When** visualiza os indicadores de receita, **Then** vê "Receita Bruta" e "Receita Líquida" no lugar de "Faturamento Bruto" e "Faturamento Líquido"
4. **Given** o usuário está no Dashboard, **When** visualiza o indicador de valores ainda não recebidos, **Then** vê "Receita Pendente" no lugar de "NFs com pagamento pendente"
5. **Given** o usuário está no Dashboard, **When** visualiza a seção de despesas por categoria, **Then** vê "Centro de Despesas" no lugar de "Custo por categoria"
6. **Given** o usuário está no Dashboard, **When** visualiza o gráfico/série mensal de receita líquida, **Then** vê o título "DRL" no lugar de "Faturamento Líquido por Mês"

---

### User Story 2 - Dashboard sem o card Fechamentos por Tipo (Priority: P1)

Como usuário autenticado, ao abrir o Dashboard, não vejo mais o card "Fechamentos por Tipo"; o restante do painel permanece utilizável com os mesmos filtros e demais indicadores.

**Why this priority**: Remover um elemento desnecessário reduz ruído visual e evita interpretação de um dado que a empresa não quer mais destacar no painel.

**Independent Test**: Abrir o Dashboard e verificar que nenhum elemento com o título ou conteúdo de "Fechamentos por Tipo" está presente, enquanto os demais cards e seções continuam visíveis e funcionais.

**Acceptance Scenarios**:

1. **Given** o usuário está autenticado e acessa o Dashboard, **When** percorre a área de cards e gráficos, **Then** o card "Fechamentos por Tipo" não é exibido
2. **Given** o card foi removido, **When** o usuário aplica filtros de mês/ano (se disponíveis), **Then** os demais indicadores atualizam normalmente, sem dependência do card removido

---

### Edge Cases

- Textos antigos não devem permanecer em tooltips, subtítulos, legendas ou títulos secundários do próprio Dashboard relacionados aos itens renomeados
- A remoção do card "Fechamentos por Tipo" não deve deixar espaço vazio quebrado nem layout desalinhado perceptível; os elementos restantes devem ocupar a área de forma coerente com o padrão atual do Dashboard
- Usuários `admin` e `visualizador` veem as mesmas alterações de rótulo e a mesma ausência do card (somente leitura para visualizador, sem diferença de nomenclatura)
- Alteração limitada ao Dashboard: outras páginas que ainda usem "Faturamento" ou termos antigos ficam fora do escopo desta feature, salvo se o mesmo componente compartilhado for o único meio de exibir o rótulo no Dashboard

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O Dashboard MUST exibir o rótulo "Meta de Receita Anual" no lugar de "Meta de Faturamento Anual"
- **FR-002**: O Dashboard MUST exibir o rótulo "Meta de Receita Mensal" no lugar de "Meta de Faturamento"
- **FR-003**: O Dashboard MUST exibir o rótulo "Receita Bruta" no lugar de "Faturamento Bruto"
- **FR-004**: O Dashboard MUST exibir o rótulo "Receita Líquida" no lugar de "Faturamento Líquido" (exceto onde o título da série/gráfico mensal for "DRL", conforme FR-007)
- **FR-005**: O Dashboard MUST exibir o rótulo "Receita Pendente" no lugar de "NFs com pagamento pendente"
- **FR-006**: O Dashboard MUST exibir o rótulo "Centro de Despesas" no lugar de "Custo por categoria"
- **FR-007**: O Dashboard MUST exibir o título "DRL" no lugar de "Faturamento Líquido por Mês"
- **FR-008**: O Dashboard MUST NOT exibir o card "Fechamentos por Tipo"
- **FR-009**: A remoção do card e a troca de rótulos MUST NOT alterar o significado ou o cálculo dos valores já exibidos nos indicadores restantes
- **FR-010**: Após as mudanças, o Dashboard MUST permanecer utilizável com os filtros e interações já existentes nos elementos que permanecem

### Key Entities

- **Indicador do Dashboard**: Bloco visual (card, título de seção ou gráfico) com rótulo e valor/série; nesta feature, apenas o texto do rótulo (ou a presença do bloco) muda
- **Card Fechamentos por Tipo**: Elemento do Dashboard que agrupa/exibe fechamentos por tipo e que deixa de fazer parte da interface

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em uma revisão visual do Dashboard, 100% dos sete rótulos listados na entrada do usuário aparecem com o novo texto e zero ocorrências dos textos antigos correspondentes na tela do Dashboard
- **SC-002**: Em uma revisão visual do Dashboard, o card "Fechamentos por Tipo" não aparece em nenhuma condição de filtro mês/ano habitualmente usada
- **SC-003**: Um usuário familiarizado com o painel identifica todos os indicadores renomeados em menos de 1 minuto sem precisar de treinamento adicional
- **SC-004**: Nenhuma regressão funcional perceptível: valores dos indicadores restantes continuam a refletir os mesmos dados de negócio de antes da mudança de nomenclatura (validação por comparação lado a lado com ambiente/conhecimento prévio)

## Assumptions

- Escopo restrito à página Dashboard; não há obrigação de renomear os mesmos termos em Contas a Receber, Relatórios legados ou outras telas nesta entrega
- Apenas rótulos e presença do card mudam; fórmulas, fontes de dados e regras de permissão permanecem as atuais
- "DRL" é o nome completo desejado do título do gráfico/série mensal (não um subtítulo adicional ao lado do nome antigo)
- "Meta de Faturamento" (sem "Anual") corresponde ao indicador de meta mensal e deve virar "Meta de Receita Mensal"
- Remover o card significa não exibi-lo na interface; não há requisito de migrar seus dados para outro bloco nesta feature
- Layout residual após remoção do card deve seguir o padrão visual já usado no Dashboard (sem redesenho amplo)
