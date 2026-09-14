# Feature Specification: Revalidar e completar features do dia (persistência)

**Feature Branch**: `070-revalidar-features-dia`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "Rodei várias tasks da IA no mesmo dia; suspeito que uma sobrescreveu a outra e que nada persistiu. Quero um roteiro Speckit para revalidar o que já está no working tree, completar o que nunca foi implementado (edição em massa de datas em Contas a Pagar) e só reimplementar o que falhar na verificação — sem recriar do zero features que já estão no código."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Confirmar o que já está no produto (Priority: P1)

O administrador percorre um roteiro curto de smoke e confirma, na interface, que as entregas do dia ainda estão presentes: menu **Bônus e Comissão** com abas; Contas a Pagar com subcategoria **Bônus**; Férias em linguagem de fornecedor; atalhos **Contratos Clientes** / **Contratos Internos**; ações de tabela só com ícone + tooltip; Dashboard sem card Pipeline de Receita; cabeçalho fixo na tabela de Contas a Pagar; Resultado Competência em base líquida.

**Why this priority**: Evita reimplementar o que já existe e reduz risco de nova sobrescrita.

**Independent Test**: Seguir a lista de smoke abaixo; marcar cada item como ok ou falha.

**Acceptance Scenarios**:

1. **Given** o app em execução com o working tree atual, **When** o admin abre o menu, **Then** vê **Bônus e Comissão** e, na página, abas **Bônus** e **Comissão**.
2. **Given** Contas a Pagar, **When** consulta subcategorias RH, **Then** vê **Bônus** (não “Comissões” / “Bônus & Comissão” como nome oficial atual).
3. **Given** Férias, **When** lê a UI, **Then** a linguagem principal é de **fornecedor** (não “colaborador” como rótulo principal).
4. **Given** Contratos, **When** lê os atalhos, **Then** vê **Contratos Clientes** e **Contratos Internos**.
5. **Given** uma listagem com ações de linha (ex.: NFs ou Contas), **When** olha os botões de ação, **Then** vê ícone com tooltip e sem texto ao lado na linha.
6. **Given** o Dashboard, **When** procura o card Pipeline de Receita, **Then** o card não existe; Caixa/Competência e Resultado Competência (base líquida) permanecem utilizáveis.
7. **Given** Contas a Pagar com muitas linhas, **When** rola a tabela, **Then** o cabeçalho permanece visível.

---

### User Story 2 - Completar a única feature sem código (Priority: P1)

O administrador passa a editar **data de vencimento** e/ou **data de pagamento** em massa em Contas a Pagar (seleção por linha e por grupo visível), conforme a especificação já existente `067-contas-pagar-datas-massa`.

**Why this priority**: É o único buraco claro de produto do dia: há spec, não há implementação.

**Independent Test**: Selecionar duas contas, aplicar datas em massa, confirmar listagem/cards e seleção limpa; visualizador sem acesso à ação.

**Acceptance Scenarios**:

1. **Given** um admin em Contas a Pagar, **When** seleciona contas e aciona **Editar datas em massa**, **Then** informa vencimento e/ou pagamento e, ao confirmar, todas as selecionadas refletem os campos preenchidos.
2. **Given** sucesso do lote, **When** a tela atualiza, **Then** a seleção é limpa e o feedback confirma a atualização.
3. **Given** um visualizador, **When** abre Contas a Pagar, **Then** não seleciona nem edita datas em massa.

---

### User Story 3 - Reimplementar só o que falhar no smoke (Priority: P2)

Se algum item da User Story 1 falhar, a equipe reimplementa **somente** aquela fatia, usando a spec original correspondente (`062`–`068`), em **uma feature por vez**, com commit intermediário — sem relançar todas as features em paralelo no mesmo working tree.

**Why this priority**: Recupera regressões reais sem repetir o padrão que causou sobrescrita.

**Independent Test**: Simular uma falha de smoke (ex.: menu sem “Bônus e Comissão”) e reaplicar só a fatia da spec `062-bonus-comissao-abas` até o smoke passar.

**Acceptance Scenarios**:

1. **Given** um item de smoke marcado como falha, **When** a correção é feita, **Then** apenas os arquivos daquela fatia são alterados de propósito e o smoke daquela fatia passa.
2. **Given** várias falhas, **When** forem corrigidas, **Then** são tratadas em sequência (uma fatia por vez), não em paralelo no mesmo tree.
3. **Given** smoke 100% ok e edição em massa entregue, **When** a verificação encerra, **Then** não se recriam specs duplicadas das features que já passaram.

---

### Edge Cases

- Diferença intencional restante (ex.: Dashboard ainda dizendo só “Comissões”) **não** conta como falha desta feature se a spec original da fatia pediu para não mudar — tratar em `069-consistencia-rotulos-bonus`.
- Working tree sujo / não commitado: o smoke valida o estado atual do disco; commit é recomendado antes de novas features, mas fora do escopo funcional desta spec.
- Specs `062` com três pastas concorrentes: em caso de reimplementação, usar a pasta cujo `spec.md` corresponde à falha observada (abas vs categorias vs férias).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST existir um roteiro de smoke cobrindo as sete áreas da User Story 1, com resultado binário ok/falha por item.
- **FR-002**: Contas a Pagar MUST oferecer edição em massa de datas conforme `067-contas-pagar-datas-massa` (esta feature considera esse comportamento como entrega obrigatória se ainda ausente).
- **FR-003**: Em falha de smoke, a correção MUST limitar-se à fatia correspondente; MUST NOT relançar implementação paralela de todas as features do dia.
- **FR-004**: MUST NOT exigir recriação de specs `062`–`068` quando o smoke da fatia correspondente estiver ok.
- **FR-005**: Alinhamento residual de rótulos Dashboard/Auditoria/legado fica fora desta feature (ver `069-consistencia-rotulos-bonus`).

### Key Entities

- **Fatia do dia**: cada entrega Speckit `062`–`068` tratada como unidade de smoke/correção.
- **Smoke ok/falha**: registro simples do resultado da verificação por fatia.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em até 15 minutos um admin conclui o smoke das sete áreas e obtém lista clara de ok/falha.
- **SC-002**: Se a edição em massa de datas estava ausente, após a entrega o admin atualiza datas de pelo menos 2 contas em uma única ação.
- **SC-003**: Nenhuma feature com smoke ok é reimplementada “por precaução”; correções só para falhas registradas.
- **SC-004**: Ao final, não há duas implementações concorrentes da mesma fatia rodando em paralelo no mesmo working tree.

## Assumptions

- A auditoria do working tree de 2026-09-14 indicou persistência de código para quase todas as features do dia, exceto `067` (só spec).
- As pastas `specs/062-*` … `068-*` permanecem a fonte de verdade para reimplementação pontual.
- Commit do working tree atual é fortemente recomendado antes de novas features, mas o ato de commit em si não é requisito de negócio desta spec.
- Portas e papéis do Ocean App permanecem os já estabelecidos (`admin` / `visualizador`).
