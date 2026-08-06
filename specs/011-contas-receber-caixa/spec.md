# Feature Specification: Contas a Receber — Identificação de Caixa

**Feature Branch**: `011-contas-receber-caixa`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "em contas a receber Adicionar campo de identificação de Caixa (corrente/investimento)"

## Clarifications

### Session 2026-08-06

- Q: Caixa deve ser obrigatória ao registrar pagamento? → A: Caixa torna-se obrigatória ao marcar a conta como recebida / informar data de pagamento
- Q: Persistência de Caixa após atualização da fonte externa? → A: Preservar Caixa no Ocean; reassocia pelo identificador quando o registro ainda existe na fonte
- Q: Rótulos de Caixa na interface de Contas a Receber? → A: “Corrente” / “Investimento” (rótulos curtos)
- Q: Como exibir Caixa quando não está definida? → A: Célula vazia ou traço (“—”) na listagem; no formulário, opção vazia / sem seleção
- Q: Contas já recebidas sem Caixa — o que fazer? → A: Manter como está na listagem; exigir Caixa apenas se o admin editar/salvar o registro

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Classificar conta a receber por Caixa (Priority: P1)

Administrador, na página **Contas a Receber**, informa se cada registro se destina à caixa **corrente** ou **investimento**. A escolha fica salva e permanece disponível após recarregar a página.

**Why this priority**: É o valor de negócio central do pedido; sem classificação, não há rastreio de destino de caixa alinhado ao Fluxo de Caixa.

**Independent Test**: Abrir uma conta a receber, escolher corrente ou investimento, salvar e confirmar que o valor permanece após recarregar.

**Acceptance Scenarios**:

1. **Given** um administrador editando uma conta a receber, **When** seleciona identificação de Caixa “corrente” ou “investimento” e salva, **Then** a escolha é persistida e fica disponível na próxima consulta.
2. **Given** uma conta já classificada, **When** o administrador altera de corrente para investimento (ou o inverso) e salva, **Then** a nova classificação prevalece.
3. **Given** um administrador e uma conta ainda **não recebida**, **When** remove a classificação (deixa sem valor definido) e salva, **Then** o registro fica sem identificação de Caixa, sem valor inventado.
4. **Given** um administrador marcando a conta como recebida ou informando data de pagamento **sem** Caixa definida, **When** tenta salvar, **Then** o sistema impede a gravação e exige escolher corrente ou investimento.
5. **Given** um registro **já recebido** sem Caixa (legado), **When** o usuário apenas consulta a listagem, **Then** o registro aparece normalmente com Caixa vazia ou “—”, sem bloqueio da página.
6. **Given** um administrador editando um registro **já recebido** sem Caixa, **When** tenta salvar sem escolher corrente ou investimento, **Then** o sistema impede a gravação e exige a classificação.
7. **Given** um visualizador, **When** tenta alterar a identificação de Caixa, **Then** a ação é bloqueada (somente leitura).

---

### User Story 2 - Ver identificação de Caixa na listagem (Priority: P1)

Qualquer usuário autenticado com acesso ao módulo vê, na lista de Contas a Receber, a identificação de Caixa de cada registro (corrente, investimento ou não definido), de forma legível e sem ambiguidade.

**Why this priority**: A classificação só gera valor operacional se for visível no dia a dia, sem abrir cada registro.

**Independent Test**: Abrir a listagem com registros em estados diferentes (corrente, investimento e sem classificação) e confirmar a exibição correta de cada um.

**Acceptance Scenarios**:

1. **Given** contas classificadas como corrente e como investimento, **When** o usuário abre a listagem, **Then** cada registro exibe o rótulo correspondente **“Corrente”** ou **“Investimento”** de forma distinguível.
2. **Given** uma conta ainda sem classificação de Caixa, **When** é exibida na lista, **Then** a célula de Caixa aparece vazia ou com traço (“—”), sem valor inventado.
3. **Given** um visualizador, **When** consulta a lista, **Then** vê a identificação de Caixa, mas não consegue alterá-la.

---

### User Story 3 - Exportar com identificação de Caixa (Priority: P2)

Quando o usuário exporta Contas a Receber (fluxo de exportação já existente no módulo), a identificação de Caixa entra no resultado exportado para cada registro, usando os mesmos significados (corrente, investimento ou não definido).

**Why this priority**: Completa o uso gerencial fora da tela, mas a classificação e a listagem já entregam o MVP.

**Independent Test**: Classificar ao menos um registro, exportar e verificar que a coluna/campo de Caixa reflete a classificação salva.

**Acceptance Scenarios**:

1. **Given** registros com Caixa corrente, investimento e não definido, **When** o usuário exporta a listagem, **Then** o arquivo/resultado inclui a identificação de Caixa de cada registro de forma coerente com o que aparece na tela.
2. **Given** alteração recente de Caixa salva na tela, **When** o usuário exporta em seguida, **Then** o valor exportado corresponde ao valor atual persistido.

---

### Edge Cases

- Conta a receber **ainda não recebida** sem identificação de Caixa: listagem com célula vazia ou “—”; no formulário, opção vazia / sem seleção; administrador pode definir corrente ou investimento a qualquer momento.
- Conta marcada como recebida (ou com data de pagamento) sem Caixa: salvamento bloqueado até definir corrente ou investimento (aplica-se ao ato de registrar recebimento e a qualquer edição/salvamento posterior de registro já recebido).
- Registros já recebidos sem Caixa (legado): permanecem consultáveis na listagem com célula vazia ou “—”; não há migração automática nem bloqueio da listagem; a classificação só é exigida se o administrador editar e tentar salvar.
- Tentativa de gravar valor inválido (diferente de corrente, investimento ou vazio): sistema rejeita e mantém o estado anterior ou exige correção antes de salvar.
- Conta já recebida com Caixa definida: administrador não pode limpar a classificação deixando-a não definida enquanto o recebimento permanecer registrado (deve manter corrente ou investimento).
- Atualização da fonte externa (Maggo/stub): a identificação de Caixa já salva no Ocean permanece associada ao identificador do registro; se o registro ainda existir na fonte, a classificação é reexibida sem exigir reclassificação.
- Registro ausente na fonte entre duas consultas: enriquecimento Ocean (Caixa) permanece associado ao identificador; se o registro voltar a aparecer com o mesmo identificador, a classificação anterior é reaplicada.
- Visualizador: vê Caixa na lista e no detalhe/edição em modo somente leitura; nenhuma gravação.
- Registro arquivado (se o módulo tiver arquivamento): classificação de Caixa permanece associada; ao reexibir, o valor salvo continua válido.
- Falha ao salvar a classificação: usuário recebe feedback claro de erro; a lista não mostra sucesso falso.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir ao administrador informar e alterar a identificação de **Caixa** de cada conta a receber, com valores permitidos **corrente** ou **investimento**.
- **FR-002**: O sistema MUST permitir que a identificação de Caixa fique **não definida** (ausência de valor) enquanto a conta **não** estiver marcada como recebida / sem data de pagamento, sem forçar classificação automática nesse estado.
- **FR-003**: Ao marcar a conta como recebida ou informar data de pagamento, o sistema MUST exigir identificação de Caixa (**corrente** ou **investimento**); sem essa escolha, o salvamento MUST ser recusado com feedback claro. A mesma exigência MUST valer ao editar/salvar um registro **já recebido** sem Caixa.
- **FR-004**: O sistema MUST exibir a identificação de Caixa na listagem de Contas a Receber com os rótulos canônicos **“Corrente”** ou **“Investimento”**; quando não definida, MUST exibir célula vazia ou traço (“—”), sem texto “Não definido” obrigatório.
- **FR-005**: O sistema MUST exibir e permitir edição da identificação de Caixa no fluxo de edição/detalhe do registro, com opções **“Corrente”** e **“Investimento”** e opção vazia / sem seleção quando ainda permitido (admin edita; visualizador só consulta).
- **FR-006**: Usuários com papel **visualizador** MUST consultar a identificação de Caixa em somente leitura; apenas **admin** pode gravar alterações.
- **FR-007**: O sistema MUST rejeitar valores de Caixa diferentes de corrente, investimento ou não definido (este último só permitido quando a conta ainda não estiver recebida).
- **FR-008**: A identificação de Caixa MUST permanecer associada ao registro após recarregar a página e em consultas posteriores.
- **FR-009**: Após atualização/sincronização da fonte externa de Contas a Receber, o sistema MUST preservar a identificação de Caixa já gravada no Ocean e reassociá-la pelo identificador do registro enquanto este existir na fonte.
- **FR-010**: Se o módulo Contas a Receber oferecer exportação, o resultado exportado MUST incluir a identificação de Caixa de cada registro, alinhada ao valor persistido.
- **FR-011**: Rótulos exibidos de Caixa em Contas a Receber MUST ser **“Corrente”** e **“Investimento”** (curtos); o significado permanece alinhado ao domínio do Fluxo de Caixa (conta corrente / conta investimento), sem exigir os rótulos longos nessa página.
- **FR-012**: O sistema MUST NOT migrar automaticamente Caixa de registros já recebidos sem classificação; MUST NOT bloquear a listagem por existência de legados sem Caixa.

### Key Entities

- **Conta a Receber**: Registro de valor a receber no módulo Contas a Receber, identificado de forma estável perante a fonte externa, ao qual se associa a identificação de Caixa.
- **Identificação de Caixa**: Atributo de enriquecimento no Ocean — **corrente**, **investimento** ou **não definido** — associado ao identificador da Conta a Receber e preservado independentemente da atualização dos demais campos vindos da fonte. Na interface, os valores definidos usam os rótulos **“Corrente”** e **“Investimento”**; ausência de valor aparece como vazio ou “—” na listagem e como opção vazia no formulário.
- **Usuário**: Admin (pode classificar/alterar Caixa) ou visualizador (somente leitura), conforme papéis do produto.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrador classifica ou altera Caixa (corrente ↔ investimento, ou define a partir de não definido) de um registro em menos de 1 minuto, e a escolha permanece visível após recarregar a página.
- **SC-002**: Em 100% dos registros exibidos na listagem de teste, a identificação de Caixa aparece como **“Corrente”**, **“Investimento”** ou célula vazia/traço (“—”), sem valor inventado.
- **SC-003**: Em 100% das tentativas com papel visualizador, a alteração de Caixa é bloqueada; a consulta permanece disponível.
- **SC-004**: Em 100% das tentativas de gravar valor inválido de Caixa, o sistema impede a persistência e informa o usuário.
- **SC-005**: Em 100% das tentativas de marcar como recebida / informar pagamento sem Caixa definida, o sistema bloqueia o salvamento e exige corrente ou investimento.
- **SC-006**: Após atualização da fonte externa que mantém o mesmo identificador, em 100% dos casos de teste a identificação de Caixa previamente salva permanece associada e visível sem reclassificação manual.
- **SC-007**: Quando há exportação no módulo, em pelo menos 95% das exportações de teste a coluna/campo de Caixa corresponde ao valor exibido na listagem no momento da exportação.
- **SC-008**: Em 100% dos casos de teste com registro já recebido sem Caixa, a listagem permanece consultável sem migração automática; em 100% das tentativas de editar/salvar sem Caixa, o salvamento é bloqueado.

## Assumptions

- O escopo desta feature é **somente** a identificação de Caixa em Contas a Receber; não inclui redesign da página nem novos fluxos de criação/exclusão.
- Valores de Caixa alinhados ao domínio do Fluxo de Caixa: **corrente** e **investimento**, exibidos em Contas a Receber com rótulos curtos **“Corrente”** e **“Investimento”**.
- Campo opcional apenas enquanto a conta não estiver recebida; torna-se obrigatório no ato de registrar o recebimento/pagamento e em qualquer salvamento de registro já recebido.
- Registros já recebidos sem Caixa (legado) não são migrados automaticamente nem bloqueiam a listagem; a exigência aplica-se na próxima edição/salvamento.
- Papéis admin / visualizador seguem o produto existente.
- Filtro dedicado por Caixa na listagem **não** faz parte desta entrega (pode ser feature posterior).
- Integração automática entre classificação de Contas a Receber e lançamentos do Fluxo de Caixa **não** faz parte desta entrega (apenas alinhamento de vocabulário e significado).
- Se a exportação já existir no módulo, ela deve passar a incluir Caixa; não se exige criar um novo fluxo de exportação só para este campo.
- A identificação de Caixa é enriquecimento local do Ocean (não vem da fonte externa) e deve sobreviver a sincronizações enquanto o identificador do registro for o mesmo.
- Na experiência do usuário, “não definido” = ausência de seleção (listagem: vazio ou “—”; formulário: opção vazia), não um terceiro rótulo textual obrigatório.

## Out of Scope

- Criar ou alterar saldos/lançamentos no Fluxo de Caixa a partir da classificação de Contas a Receber.
- Filtro por Caixa na listagem.
- Alteração de campos de Contas a Receber além da identificação de Caixa.
- Contas a Pagar ou outros módulos fora de Contas a Receber.
- Migração em massa ou bloqueio da listagem por registros legados já recebidos sem Caixa.
