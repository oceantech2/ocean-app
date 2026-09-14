# Feature Specification: Contas a Pagar e Receber — botão +1 (salvar e continuar)

**Feature Branch**: `071-contas-salvar-mais-um`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "Botão para selecionar +1 Contas a Pagar / Contas a Receber e realizar uma ação em massa (por exemplo: pagar/receber) — basicamente no final em vez de só Salvar/Cancelar deve ter +1 que salva o registro e deixa a modal aberta pré-preenchida com os dados antigos para a pessoa poder apenas editar os campos desejados e já salvar novamente"

## Clarifications

### Session 2026-09-14

- Q: Escopo — só +1 na modal ou também lote na listagem (pagar/receber em massa)? → A: Somente **+1** na modal (salvar e continuar pré-preenchido) em Contas a Pagar e Contas a Receber; sem seleção múltipla nem pagar/receber em massa.
- Q: Após +1, o próximo formulário nasce pago/recebido? → A: Copiar campos de negócio, mas **resetar** para pendente (limpar data de pagamento / estado recebido); o admin pode marcar liquidação de novo se quiser.
- Q: O botão +1 aparece também na edição? → A: **+1** só na criação (“Nova conta…”); na edição permanecem apenas Cancelar e Salvar.
- Q: Após +1, o vínculo com NF é copiado? → A: **Não** — limpar o vínculo com NF após cada **+1**; o admin religa se precisar.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar várias contas semelhantes sem reabrir a modal (Priority: P1)

O administrador, ao criar uma conta a pagar ou uma conta a receber, preenche o formulário na modal e usa o botão **+1** em vez de (ou além de) **Salvar**. O sistema grava o registro com sucesso, mantém a modal aberta em modo de **nova** conta e repete os dados de negócio do formulário que acabou de salvar — **exceto** liquidação (próximo formulário sempre **pendente**) e **vínculo com NF** (sempre limpo) — para que o usuário altere só o que for diferente e grave de novo — com **Salvar** (fecha) ou **+1** (continua a cadeia).

**Why this priority**: É o valor central do pedido — acelerar cadastros repetitivos (várias despesas/receitas parecidas) sem fechar e reabrir a modal nem redigitar tudo.

**Independent Test**: Abrir “Nova conta a pagar” (e o equivalente em Contas a Receber), preencher dados válidos inclusive como paga/recebida e com NF vinculada, acionar **+1**, confirmar sucesso, modal aberta com campos copiados, pendente e sem NF; alterar um campo, salvar; conferir dois registros na listagem.

**Acceptance Scenarios**:

1. **Given** um administrador na modal de **nova** conta a pagar (ou a receber) com dados válidos, **When** aciona **+1**, **Then** o registro é persistido, a listagem/cards refletem o novo item, a modal permanece aberta em modo de criação e os campos de negócio (exceto liquidação e vínculo NF) ficam preenchidos com os valores recém-salvos.
2. **Given** a conta recém-salva estava paga ou recebida, **When** o **+1** conclui com sucesso, **Then** o formulário seguinte nasce **pendente** (data de pagamento / estado recebido limpos), mantendo os demais campos copiados (exceto NF).
3. **Given** a conta recém-salva tinha NF vinculada, **When** o **+1** conclui com sucesso, **Then** o formulário seguinte **não** traz vínculo com NF (campo limpo).
4. **Given** a modal ainda aberta após um **+1** bem-sucedido, **When** o administrador altera apenas um ou mais campos e aciona **Salvar**, **Then** um segundo registro é criado com os valores ajustados e a modal fecha (comportamento habitual de Salvar na criação).
5. **Given** a modal ainda aberta após um **+1**, **When** o administrador altera campos e aciona **+1** de novo, **Then** mais um registro é criado e a modal continua aberta, novamente pré-preenchida com os dados do último salvamento, pendente e sem NF.
6. **Given** a modal de criação aberta, **When** o administrador vê as ações finais, **Then** encontra **Cancelar**, **Salvar** e **+1** (rótulo claro de “salvar e continuar / mais um”).
7. **Given** um visualizador, **When** abre Contas a Pagar ou Contas a Receber, **Then** não consegue criar contas nem usar **+1** (somente leitura).
8. **Given** um administrador na modal de **editar** conta, **When** olha as ações finais, **Then** vê **Cancelar** e **Salvar**, e **não** vê **+1**.

---

### User Story 2 - Feedback e cancelamento claros (Priority: P2)

O administrador recebe confirmação de sucesso a cada gravação via **+1**, sem a modal sumir. Se a validação falhar, nada é gravado e a modal permanece com os dados digitados para correção. **Cancelar** fecha a modal sem gravar a tentativa atual (registros já salvos em **+1** anteriores permanecem).

**Why this priority**: Evita dúvida se o item foi ou não gravado quando a tela não fecha.

**Independent Test**: Forçar erro de validação com **+1** e conferir que nada novo foi criado; cancelar após um **+1** bem-sucedido e conferir que o registro anterior permanece na listagem.

**Acceptance Scenarios**:

1. **Given** dados inválidos na modal de criação, **When** o administrador aciona **+1** ou **Salvar**, **Then** o sistema impede a gravação, informa o que corrigir e mantém a modal aberta com os dados informados.
2. **Given** um ou mais registros já gravados via **+1** na mesma sessão da modal, **When** o administrador aciona **Cancelar**, **Then** a modal fecha e os registros já persistidos continuam na listagem.
3. **Given** um **+1** bem-sucedido, **When** a gravação termina, **Then** o administrador recebe feedback explícito de sucesso (além de ver a listagem atualizada atrás/ao lado da modal, quando aplicável).

---

### Edge Cases

- Falha de rede ou erro do servidor no **+1**: nenhum registro novo é considerado salvo; a modal permanece aberta com os dados digitados; o usuário pode tentar de novo.
- Campos de identidade (identificador interno do registro) e anexos/arquivos da conta **não** são reaproveitados: após **+1**, o formulário de nova conta não carrega o anexo da conta anterior (o usuário anexa de novo se precisar).
- Após **+1**, liquidação **não** é copiada: Contas a Pagar ficam sem data de pagamento (pendente); Contas a Receber ficam sem estado recebido / equivalentes de liquidação (pendente), mesmo que o registro acabado de salvar estivesse liquidado.
- Após **+1**, vínculo com NF **não** é copiado (campo limpo), mesmo que o registro acabado de salvar tivesse NF.
- Demais regras de obrigatoriedade, categorias, Caixa etc. aplicam-se igualmente a **Salvar** e a **+1** no momento da gravação.
- Duplo clique rápido em **+1**: o sistema não deve criar registros duplicados indesejados pela mesma ação (bloquear ou ignorar enquanto a gravação estiver em andamento).
- Modal de edição: **+1** ausente; fluxo de edição inalterado (Cancelar / Salvar).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Nas modais de **criação** de **Contas a Pagar** e **Contas a Receber**, o sistema MUST exibir, além de **Cancelar** e **Salvar**, a ação **+1** (salvar e continuar com formulário pré-preenchido).
- **FR-002**: Ao acionar **+1** com dados válidos na criação, o sistema MUST persistir um novo registro com os mesmos critérios de validação de **Salvar**, MUST manter a modal aberta em modo de criação e MUST pré-preencher os campos de negócio com os valores recém-salvos, **exceto** liquidação (FR-010) e vínculo com NF (FR-011).
- **FR-003**: **Salvar** na criação MUST continuar fechando a modal após sucesso; **+1** MUST NOT fechar a modal após sucesso.
- **FR-004**: Nas modais de **edição**, o sistema MUST NOT exibir **+1**; permanecem apenas **Cancelar** e **Salvar**.
- **FR-005**: Após **+1**, o formulário de nova conta MUST NOT reutilizar anexos/arquivos da conta anterior; MUST NOT exibir/carregar o identificador da conta já salva como se fosse edição.
- **FR-006**: Visualizadores MUST NOT ter acesso a criar, editar, **Salvar** ou **+1**.
- **FR-007**: Durante gravação (Salvar ou +1), a ação MUST ficar indisponível para novo disparo até concluir sucesso ou falha.
- **FR-008**: Feedback de sucesso e de erro MUST ser apresentado de forma clara em ambos os botões de gravação; em erro, a modal permanece com os dados informados.
- **FR-009**: Esta feature MUST NOT introduzir seleção múltipla na listagem nem ações em lote do tipo “marcar várias e pagar/receber em massa”; o ganho de produtividade em série é exclusivamente via **+1** na modal de criação.
- **FR-010**: Após cada **+1** bem-sucedido, o formulário pré-preenchido MUST nascer **pendente**: Contas a Pagar MUST ter data de pagamento limpa; Contas a Receber MUST ter estado/campos de “recebido” limpos conforme o formulário vigente. O administrador MAY marcar liquidação novamente antes do próximo Salvar/+1.
- **FR-011**: Após cada **+1** bem-sucedido, o formulário pré-preenchido MUST ter o vínculo com NF limpo (sem NF selecionada). O administrador MAY vincular uma NF novamente antes do próximo Salvar/+1.

### Key Entities

- **Conta a pagar**: registro de despesa já existente no produto; criado normalmente; após **+1** na criação, serve de modelo de valores para o próximo cadastro.
- **Conta a receber**: registro de receita já existente no produto; mesmo comportamento de cópia de campos de negócio via **+1** na criação.
- **Sessão da modal +1**: sequência de uma ou mais criações com a mesma modal aberta; cada **+1** bem-sucedido acrescenta um registro persistido.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um administrador consegue cadastrar pelo menos **3** contas a pagar (ou a receber) semelhantes em uma única abertura da modal de criação, usando **+1** entre elas, em menos de **2 minutos**, alterando só os campos que diferem.
- **SC-002**: Em **100%** dos testes de **+1** com dados válidos, a modal permanece aberta e os campos de negócio reaparecem preenchidos com os valores do último salvamento (exceto identidade, anexos, liquidação — sempre pendente — e vínculo NF — sempre limpo).
- **SC-003**: Em **100%** dos testes, **Salvar** após criação bem-sucedida fecha a modal; **+1** bem-sucedido não fecha.
- **SC-004**: Em validação falha ou erro de gravação, **0** registros novos indesejados são criados e o usuário consegue corrigir sem reabrir a modal.
- **SC-005**: Visualizador não consegue acionar **+1** em nenhuma das duas páginas.
- **SC-006**: Em **100%** das aberturas da modal de edição, **+1** não está disponível.

## Assumptions

- Confirmado: o pedido de “ação em massa” restringe-se ao **cadastro sequencial rápido** via **+1** na modal de **criação**; **não** há seleção múltipla nem pagar/receber em lote na listagem (FR-009 / Out of Scope).
- Confirmado: **+1** não aparece na edição.
- Confirmado: vínculo com NF é limpo após cada **+1**.
- O rótulo canônico da ação é **+1**; pode haver texto de apoio (tooltip ou aria-label) do tipo “Salvar e cadastrar mais um”.
- Campos de negócio copiados incluem os mesmos editáveis da criação manual de cada página (descrição/título, valores, vencimento, categorias, Caixa quando aplicável etc.), **exceto** liquidação (sempre pendente), vínculo NF (sempre limpo) e anexos/identidade.
- Anexos não são copiados automaticamente (segurança e evitar vínculo incorreto ao arquivo).
- Caixa e demais campos condicionais a “recebido/pago” seguem as regras já vigentes do formulário vazio/pendente após o reset.
- Papéis e permissões seguem o padrão do Ocean App (`admin` grava; `visualizador` só lê).
- Comportamento de listagem, filtros, cards e regras de domínio existentes permanece; esta feature só adiciona o atalho na modal de criação.
- Escopo limitado a **Contas a Pagar** e **Contas a Receber**; outras entidades (NFs, bônus, férias etc.) ficam de fora.

## Out of Scope

- Seleção em lote na listagem e ações em massa (pagar várias, receber várias, excluir várias, editar datas em lote — esta última já coberta por outra spec).
- Botão **+1** na modal de **edição** (apenas criação).
- Botão **+1** em outras páginas além de Contas a Pagar e Contas a Receber.
- Duplicar conta por ação na linha da tabela (fora da modal), salvo se já existir e for independente desta spec.
- Templates salvos nomeados ou favoritos de formulário.
