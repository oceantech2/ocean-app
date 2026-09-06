# Feature Specification: Contas a Receber — Campos Maggo editáveis no Ocean

**Feature Branch**: `051-contas-receber-maggo-editavel`

**Created**: 2026-09-06

**Status**: Draft

**Input**: User description: "CONTAS A RECEBER — Se possível, deixar os campos que vêm da Maggo também editáveis (sem necessariamente mudar na Maggo)"

## Clarifications

### Session 2026-09-06

- Q: Como o administrador ajusta imposto e valor líquido em conta Maggo? → A: Só via bruto e/ou alíquota; imposto e líquido ficam calculados (somente leitura na tela)
- Q: Ao editar valores Maggo de conta já Recebida, o que ocorre com o Fluxo de Caixa? → A: Conta a Receber (listagem/totais) reflete o novo valor; lançamentos de caixa já feitos permanecem inalterados
- Q: Se a conta Maggo já tiver comissões vinculadas e o valor líquido mudar, o que ocorre com as comissões? → A: Comissões já existentes não são recalculadas nem alteradas automaticamente

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Corrigir no Ocean os dados que vieram da Maggo (Priority: P1)

O administrador abre uma conta a receber de origem **Maggo** e consegue alterar no Ocean os campos do grupo Maggo (vaga/projeto, empresa, candidato, tipo, valor bruto, alíquota e data de entrada/fechamento), da mesma forma prática em que já ajusta esses dados em contas manuais. **Imposto** e **valor líquido** são calculados a partir do bruto e da alíquota e aparecem somente leitura. A alteração **fica só no Ocean**: a Maggo **não** é atualizada. A origem do registro continua **Maggo**. O visualizador continua só consultando.

**Why this priority**: Valores ou classificação incorretos na fonte travam o trabalho do financeiro; poder corrigir localmente, sem depender da Maggo, é o pedido central desta feature.

**Independent Test**: Como admin, editar ao menos um campo Maggo (ex.: valor bruto ou empresa) em uma conta Maggo, salvar, recarregar e ver o valor novo; confirmar que a origem permanece Maggo. Como visualizador, confirmar que os campos não são alteráveis.

**Acceptance Scenarios**:

1. **Given** um administrador editando uma conta de origem **Maggo**, **When** vê os campos do grupo Maggo, **Then** consegue alterar vaga/projeto, empresa, candidato, tipo, valor bruto, alíquota e data ent. pgto / fechamento; imposto e valor líquido aparecem calculados e somente leitura.
2. **Given** o administrador altera um ou mais desses campos com dados válidos e salva, **When** recarrega a página, **Then** os valores novos persistem no Ocean.
3. **Given** essa alteração salva no Ocean, **When** alguém consulta a Maggo (ou o fluxo de entrada da Maggo), **Then** a Maggo **não** foi atualizada por essa edição.
4. **Given** uma conta Maggo **já Recebida** com lançamento de caixa existente, **When** o administrador altera valor bruto ou alíquota e salva, **Then** a listagem/totais de Contas a Receber mostram o novo valor e o lançamento de caixa permanece inalterado.
5. **Given** um administrador editando uma conta **manual**, **When** altera os mesmos campos do grupo Maggo, **Then** o comportamento de edição já existente permanece.
6. **Given** uma conta Maggo com comissões já existentes vinculadas, **When** o administrador altera bruto ou alíquota e salva, **Then** as comissões existentes permanecem com os mesmos valores e status (sem recálculo automático).
7. **Given** um visualizador, **When** tenta alterar qualquer campo Maggo, **Then** a ação não está disponível (somente leitura).
8. **Given** tentativa de salvar com campo obrigatório inválido (ex.: empresa vazia, tipo ausente, valor bruto ou líquido inválidos), **When** o administrador tenta gravar, **Then** o sistema impede e indica o que corrigir.

---

### User Story 2 - Reenvio da Maggo não desfaz a correção local (Priority: P1)

Depois que um fechamento Maggo já existe no Ocean, um novo envio da mesma conta pela Maggo **não** sobrescreve os campos Maggo no Ocean — tenham sido editados ou não. A Maggo continua podendo criar apenas **fechamentos novos** (ainda inexistentes no Ocean). Campos Ocean (NF, emissão, vencimento, pagamento, Caixa, colaboradores, arquivamento) continuam preservados como hoje.

**Why this priority**: Sem essa regra, editar no Ocean seria inútil: a próxima sincronização reverteria a correção.

**Independent Test**: Editar um campo Maggo (ou não editar), simular reenvio do mesmo fechamento com valores diferentes e confirmar que os campos Maggo no Ocean permanecem iguais; criar um fechamento Maggo novo e confirmar que entra normalmente.

**Acceptance Scenarios**:

1. **Given** uma conta Maggo já existente no Ocean (editada ou não), **When** a Maggo envia de novo o mesmo fechamento com valores diferentes nos campos Maggo, **Then** o Ocean **não** altera vaga/projeto, empresa, candidato, tipo, valor bruto, imposto, valor líquido nem data ent. pgto / fechamento.
2. **Given** o mesmo reenvio, **When** a conta já tem dados Ocean preenchidos (NF, emissão, vencimento, pagamento, Caixa, colaboradores, arquivamento), **Then** esses dados Ocean permanecem intactos.
3. **Given** a Maggo envia um fechamento **novo** (ainda não existente no Ocean), **When** a sincronização ocorre, **Then** o Ocean cria o registro com os campos Maggo da fonte.
4. **Given** o administrador editou campos Maggo no Ocean, **When** consulta a origem do registro, **Then** a origem continua **Maggo** (não vira Manual).

---

### User Story 3 - Campos Ocean continuam editáveis como hoje (Priority: P2)

Ao editar uma conta Maggo, o administrador continua podendo preencher e alterar os campos Ocean (NF, emissão, vencimento, pagamento, Caixa e demais regras já vigentes), sem regressão. Status permanece derivado; papéis admin / visualizador permanecem.

**Why this priority**: A feature amplia o que se pode editar no grupo Maggo; não pode quebrar o fluxo financeiro já estabelecido no Ocean.

**Independent Test**: Em uma conta Maggo, alterar um campo Ocean (ex.: vencimento ou NF) e um campo Maggo na mesma sessão (ou em sessões separadas); ambos persistem; status continua coerente com vencimento/pagamento.

**Acceptance Scenarios**:

1. **Given** um administrador editando uma conta Maggo, **When** altera campos Ocean já permitidos (NF, emissão, vencimento, pagamento, Caixa), **Then** as regras vigentes desses campos não mudam e os valores são gravados.
2. **Given** alteração de vencimento e/ou pagamento, **When** salva, **Then** o status continua derivado dessas datas (não é escolhido à mão).
3. **Given** um visualizador, **When** abre a conta, **Then** vê os dois grupos de campos, sem poder editar nenhum.

---

### Edge Cases

- Origem **Maggo** permanece Maggo após editar campos Maggo no Ocean.
- Maggo reenvia fechamento já existente: campos Maggo no Ocean **não** mudam; Maggo **não** cria segundo registro para o mesmo fechamento.
- Maggo envia fechamento novo: registro é criado normalmente com os dados da fonte.
- Conta Maggo excluída (regra já existente no produto): reenvio do mesmo fechamento **não** a ressuscita (comportamento já vigente; esta feature não altera exclusão).
- Imposto e valor líquido: sempre calculados a partir de valor bruto e alíquota; o admin edita bruto e/ou alíquota; imposto e líquido permanecem somente leitura e são gravados coerentes com o cálculo após salvar.
- Falha ao salvar: feedback claro; a listagem não mostra o valor novo como se tivesse gravado.
- Conta já recebida ou com NF: edição dos campos Maggo permanece permitida para o admin (não é bloqueada por status). Listagem e totais de Contas a Receber (e visões que leem esses valores) refletem o novo valor; lançamentos de caixa já feitos **não** são alterados, estornados nem recriados.
- Conta com comissões vinculadas: ao alterar bruto/alíquota (e líquido derivado), as comissões **já existentes** permanecem como estão — o sistema **não** as recalcula nem altera automaticamente.
- Papéis, NF opcional, Caixa se Recebido, colaboradores, unicidade de NF e arquivar **não** mudam nesta feature, salvo a editabilidade do grupo Maggo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Em registro de origem **Maggo**, o administrador MUST poder editar no Ocean os campos do grupo Maggo: **vaga/projeto**, **empresa**, **candidato**, **tipo**, **valor bruto**, **alíquota** e **data ent. pgto / data de fechamento**.
- **FR-002**: Edições dos campos Maggo MUST persistir somente no Ocean. O sistema MUST NOT enviar essas alterações para a Maggo.
- **FR-003**: Quando a Maggo enviar um fechamento que **já existe** no Ocean, o sistema MUST NOT atualizar os campos Maggo listados em FR-001 nem imposto/líquido derivados (tenham ou não sido editados localmente). MUST NOT apagar nem sobrescrever campos Ocean (NF, emissão, vencimento, pagamento, Caixa, colaboradores, arquivamento).
- **FR-004**: A Maggo MUST continuar podendo criar apenas **fechamentos novos** (ainda inexistentes no Ocean e não excluídos, conforme regras já vigentes de exclusão).
- **FR-005**: Usuários com papel **visualizador** MUST NOT editar campos Maggo nem campos Ocean.
- **FR-006**: A origem **Manual** / **Maggo** MUST permanecer visível e correta após editar campos Maggo; editar o grupo Maggo MUST NOT converter a origem para Manual.
- **FR-007**: Em contas manuais, o administrador MUST continuar podendo editar o mesmo conjunto de campos do grupo Maggo (sem regressão).
- **FR-008**: Campos Ocean e regras já vigentes (NF opcional, status derivado, Caixa se Recebido, colaboradores, arquivar, unicidade de NF) MUST permanecer, salvo a posse de edição dos campos Maggo em contas Maggo.
- **FR-009**: Na edição, o sistema MUST continuar exigindo, quando já exigidos hoje: empresa, tipo, valor bruto e valor líquido (e Caixa/data de pagamento se Recebido; emissão se houver número de NF). O valor líquido exigido MUST ser o resultado do cálculo a partir de bruto e alíquota.
- **FR-011**: Se o administrador alterar valores Maggo (bruto/alíquota e derivados) de uma conta **já Recebida**, o sistema MUST refletir o novo valor nas visões de Contas a Receber (listagem e totais). MUST NOT alterar, estornar nem recriar lançamentos de caixa já feitos.
- **FR-012**: Se a conta tiver comissões já existentes vinculadas, ao alterar valores Maggo o sistema MUST NOT recalcular nem alterar automaticamente essas comissões.

### Key Entities

- **Conta a Receber**: Registro de valor a receber, de origem Manual ou Maggo.
- **Campos Maggo**: Vaga/projeto, empresa, candidato, tipo, valor bruto, alíquota e data ent. pgto / fechamento (editáveis). Imposto e valor líquido são derivados (somente leitura). Passam a ser ajustáveis no Ocean também em origem Maggo. A Maggo não recebe essas edições e, em conta já existente, também não as sobrescreve.
- **Campos Ocean**: NF, emissão, vencimento, pagamento, status (derivado), Caixa, colaboradores, arquivamento — permanecem com as regras já vigentes.
- **Usuário**: Admin (edita) ou visualizador (somente leitura).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrador altera um campo Maggo (ex.: valor bruto ou empresa) de uma conta Maggo e, após recarregar, vê o valor novo em menos de 1 minuto na primeira tentativa com dados válidos.
- **SC-002**: Em 100% dos testes, a edição de campo Maggo no Ocean não altera o correspondente na Maggo.
- **SC-003**: Em 100% dos testes em que a Maggo reenvia um fechamento já existente, **todos** os campos Maggo no Ocean permanecem iguais (inclusive os nunca editados).
- **SC-004**: Em 100% das tentativas, visualizador não consegue alterar campos Maggo.
- **SC-005**: Em 100% dos testes de edição Maggo bem-sucedida, a origem do registro continua exibida como Maggo.
- **SC-007**: Em 100% dos testes de edição de valor Maggo em conta já Recebida, a listagem/totais de Contas a Receber mostram o novo valor e os lançamentos de caixa existentes permanecem iguais (mesmo valor, data e conta).
- **SC-008**: Em 100% dos testes em que a conta editada já tinha comissões vinculadas, após salvar o novo valor Maggo as comissões existentes permanecem com os mesmos valores e status de antes da edição.

## Assumptions

- “Sem necessariamente mudar na Maggo” significa: **nunca** escrever de volta na Maggo. A correção é só no Ocean.
- Depois que o fechamento já existe no Ocean, a Maggo **não** atualiza mais os campos Maggo. Só entra conta **nova**. Isso vale mesmo se o usuário nunca tiver editado o registro.
- O escopo desta feature é **somente** a editabilidade dos campos Maggo no Ocean e a regra de não sobrescrita no reenvio. Não inclui exclusão, renomeação de Tipo, novos tipos nem mudanças em Contas a Pagar.
- Edição de valores Maggo em conta Recebida atualiza Contas a Receber; caixa já lançado permanece (mesmo padrão da exclusão: caixa não é reaberto automaticamente).
- Comissões já existentes vinculadas à conta **não** são recalculadas nem alteradas automaticamente quando o valor Maggo muda.
- Imposto e líquido não são digitáveis: o admin edita bruto e/ou alíquota; imposto e líquido são calculados, exibidos somente leitura e gravados de forma coerente.
- Papéis admin / visualizador, NF opcional, Caixa se Recebido e status derivado permanecem.
- Relação com entregas anteriores de Contas a Receber (ex.: divisão Maggo/Ocean e edição parcial): esta feature **fecha** o pedido de tornar o grupo Maggo editável no Ocean, sem sync de volta à fonte.

## Out of Scope

- Digitação livre de imposto ou valor líquido (permanecem calculados e somente leitura).
- Ajustar, estornar ou recriar lançamentos de caixa ao editar valores Maggo de conta Recebida.
- Recalcular ou alterar automaticamente comissões já existentes ao editar valores Maggo.
- Enviar alterações do Ocean para a Maggo (escrita na fonte externa).
- Atualizar campos Maggo de contas já existentes a partir de reenvios da fonte.
- Exclusão de linha, exclusão em massa, importação em lote ou pasta de arquivos de NFs.
- Alterar rótulos ou opções de Tipo (Retainer / Parcela / Sucesso).
- Tornar o status um campo escolhido à mão.
- Mudar regras de Contas a Pagar, Fluxo de Caixa, comissões ou Dashboard além do reflexo natural dos valores corrigidos na conta a receber.
- Restaurar contas excluídas ou alterar o comportamento de exclusão já vigente.
