# Feature Specification: Recorrência de contas a pagar nos próximos meses

**Feature Branch**: `090-contas-pagar-recorrencia`

**Created**: 2026-10-13

**Status**: Draft

**Input**: User description: "em contas a pagar permitir colocar recorrencia de conta para proximos meses"

**Baseline**: Despesas que se repetem todo mês (aluguel, assinaturas, salários, contabilidade) são cadastradas uma a uma em **Contas a Pagar**. O `admin` usa o botão "+1" para manter o formulário preenchido, mas ainda precisa trocar a data de vencimento e salvar mês a mês, o que é lento e sujeito a esquecimento.

## Clarifications

### Session 2026-10-13

- Q: Como deve funcionar a recorrência? → A: Ao criar, opção **"Repetir nos próximos N meses"** (até 24): cria **cópias independentes**, com o mesmo dia de vencimento, todas pendentes. Sem vínculo de série e sem geração automática contínua.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar uma conta recorrente (Priority: P1)

Como `admin`, ao cadastrar uma nova conta a pagar, marco **"Repetir nos próximos meses"**, informo a quantidade de meses, e ao salvar o sistema cria a conta original e uma cópia para cada mês seguinte, com o mesmo dia de vencimento.

**Why this priority**: É o pedido; elimina o cadastro manual mês a mês das despesas fixas.

**Independent Test**: Cadastrar "Aluguel", R$ 5.000, vencimento 10/11/2026, repetir por 3 meses; a lista passa a ter 4 contas "Aluguel" com vencimentos 10/11/2026, 10/12/2026, 10/01/2027 e 10/02/2027, todas pendentes.

**Acceptance Scenarios**:

1. **Given** o formulário de **nova** conta a pagar, **When** o `admin` o observa, **Then** existe a opção "Repetir nos próximos meses" desmarcada por padrão
2. **Given** a opção marcada, **When** o `admin` informa N meses (1 a 24), **Then** o formulário mostra um resumo: "Serão criadas mais N contas, com vencimentos de MM/AAAA a MM/AAAA"
3. **Given** a opção marcada com N meses, **When** o `admin` salva, **Then** são criadas 1 + N contas com os mesmos dados (descrição, fornecedor, categoria, subcategoria, tipo, conta, valor) e vencimentos nos meses seguintes, no mesmo dia
4. **Given** um vencimento no dia 31 (ou 29/30), **When** um mês seguinte não tem esse dia, **Then** a cópia vence no último dia daquele mês (ex.: 31/01 → 28/02 ou 29/02)
5. **Given** a conta original com data de pagamento preenchida, **When** as cópias são criadas, **Then** as cópias ficam **pendentes** (sem data de pagamento)
6. **Given** um arquivo de nota fiscal anexado no cadastro, **When** as cópias são criadas, **Then** o arquivo fica só na conta original
7. **Given** o salvamento concluído, **When** o resultado é exibido, **Then** aparece a mensagem "Conta criada + N recorrência(s)" e a lista recarrega
8. **Given** quantidade inválida (vazia, 0, negativa, acima de 24 ou não inteira), **When** o `admin` salva, **Then** aparece mensagem de erro e nada é criado
9. **Given** qualquer falha ao criar uma das cópias, **When** o salvamento termina, **Then** nenhuma conta é criada (tudo ou nada) e aparece mensagem de erro

---

### User Story 2 - Editar ou excluir uma recorrência isoladamente (Priority: P2)

Como `admin`, edito ou excluo uma das contas geradas sem afetar as demais, porque cada mês pode ter valor ou data diferente.

**Why this priority**: Decorre da escolha de cópias independentes; garante que ajustes pontuais não se propaguem.

**Independent Test**: Alterar o valor da cópia de dezembro para R$ 5.200 e excluir a de fevereiro; as demais continuam com R$ 5.000 e intactas.

**Acceptance Scenarios**:

1. **Given** uma conta criada por recorrência, **When** o `admin` a edita, **Then** apenas ela muda
2. **Given** uma conta criada por recorrência, **When** o `admin` a exclui, **Then** apenas ela é excluída
3. **Given** o formulário de **edição**, **When** o `admin` o observa, **Then** a opção de recorrência não aparece

### Edge Cases

- Botão "+1" (salvar e cadastrar mais um): após salvar, a opção de recorrência volta a ficar desmarcada, para evitar duplicar séries sem querer
- Recorrência que cruza o ano (ex.: novembro + 3 meses) segue normalmente para o ano seguinte
- O `visualizador` não cadastra contas (regra existente) e, portanto, não vê a opção
- Importação por CSV/Excel não ganha recorrência (fora do escopo)
- Cada conta criada gera seu próprio registro de auditoria

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O formulário de nova conta a pagar DEVE oferecer a opção "Repetir nos próximos meses", desmarcada por padrão; o formulário de edição NÃO DEVE oferecê-la
- **FR-002**: Com a opção marcada, o `admin` DEVE informar a quantidade de meses, inteira, de 1 a 24
- **FR-003**: O formulário DEVE mostrar um resumo com a quantidade de contas adicionais e o intervalo de meses dos vencimentos
- **FR-004**: Ao salvar, o sistema DEVE criar a conta original e N cópias com os mesmos descrição, fornecedor, categoria, subcategoria, tipo, conta corrente e valor
- **FR-005**: O vencimento da cópia k (1..N) DEVE ser o mesmo dia do vencimento original, k meses depois; se o mês não tiver esse dia, o último dia do mês
- **FR-006**: As cópias DEVEM ser criadas pendentes, sem data de pagamento e sem nota fiscal anexada
- **FR-007**: A criação DEVE ser atômica: ou todas as contas são criadas, ou nenhuma
- **FR-008**: Cada conta criada DEVE gerar registro de auditoria
- **FR-009**: As contas criadas DEVEM ser independentes: editar ou excluir uma não afeta as outras
- **FR-010**: Após salvar, DEVE aparecer mensagem com a quantidade de recorrências criadas
- **FR-011**: Só o `admin` pode criar contas com recorrência (regra de criação existente)

### Key Entities

- **Conta a pagar**: descrição, fornecedor, categoria/subcategoria, tipo (Fixo, Variável, Imposto / DAS), conta corrente, valor, vencimento, pagamento, nota fiscal
- **Recorrência (parâmetro de cadastro)**: quantidade de meses adicionais (1–24); não é armazenada — só define quantas cópias criar

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O `admin` cadastra uma despesa mensal para os próximos 12 meses em menos de 1 minuto, com um único salvamento
- **SC-002**: Em 100% dos cadastros com recorrência, a quantidade de contas criadas é 1 + N e os vencimentos seguem a regra do mesmo dia (ou último dia do mês)
- **SC-003**: Em 100% das falhas, nenhuma conta parcial fica cadastrada
- **SC-004**: Despesas fixas do mês seguinte já aparecem em Contas a Pagar sem cadastro adicional

## Assumptions

- O limite de 24 meses cobre os casos de despesas fixas e evita criação acidental em massa
- As cópias mantêm a mesma descrição (sem sufixo "1/12"), pois o mês já aparece na coluna Mês/Ano
- Sem vínculo de série: não há "editar/excluir esta e as próximas" (decisão do clarify)
- A conta original segue as regras atuais (pode ser criada já paga e com nota fiscal)
