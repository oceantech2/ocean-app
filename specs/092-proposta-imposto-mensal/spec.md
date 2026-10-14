# Feature Specification: Imposto mensal nas propostas

**Feature Branch**: `092-proposta-imposto-mensal`

**Created**: 2026-10-14

**Status**: Draft

**Input**: User description: "preciso que tenha um campo no ERP que eles vão inserir o imposto do mês, e quando forem gerar a proposta o campo onde diz o imposto que hoje está o valor fixo de 19,55% ele deverá ser preenchido de acordo com o imposto do mês vigente, inclusive no mês atual colocar o valor de 18,75%"

## Contexto

Hoje as propostas dos modelos **Executive Search** e **Development & Outplacement** exibem, nas Observações da seção Investimento, o texto fixo "Impostos (até 19,55%) serão adicionados a todos os valores informados." (e o equivalente em inglês, "Taxes (up to 19.55%) will be added to all amounts stated."). O percentual real de impostos varia mês a mês, e o time financeiro precisa que a proposta reflita o imposto vigente no momento em que ela é gerada.

## Clarifications

### Session 2026-10-14

- Q: Onde o imposto do mês deve ser cadastrado no ERP? → A: Nova seção em Configurações, acessível só a administradores.
- Q: Qual mês define o imposto da proposta? → A: O mês em que a proposta é gerada (data atual, fuso de São Paulo).
- Q: Se o mês vigente não tiver imposto cadastrado, o que fazer? → A: Usar o último mês cadastrado anterior ao vigente; se não houver nenhum, usar 18,75%.
- Q: O consultor pode alterar o percentual ao gerar a proposta? → A: Não; ele só visualiza o valor que será aplicado.
- Q: Propostas já enviadas e ainda não assinadas (com 19,55%)? → A: Passam para o imposto vigente quando forem editadas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar o imposto do mês no ERP (Priority: P1)

O administrador do ERP acessa um campo dedicado e informa o percentual de imposto de um mês/ano (ex.: Outubro/2026 = 18,75%). Ele pode consultar os meses já cadastrados, corrigir um valor e cadastrar meses futuros com antecedência.

**Why this priority**: Sem o valor cadastrado não há o que levar para a proposta; é a base de toda a feature.

**Independent Test**: Entrar como admin, cadastrar o imposto de um mês, recarregar a tela e ver o valor salvo; editar o valor e ver a alteração refletida.

**Acceptance Scenarios**:

1. **Given** um admin na tela de cadastro do imposto mensal, **When** ele informa Outubro/2026 com 18,75% e salva, **Then** o valor fica registrado e aparece na lista de meses cadastrados.
2. **Given** Outubro/2026 já cadastrado com 18,75%, **When** o admin altera para 18,90% e salva, **Then** o mês passa a mostrar 18,90% (não é criado um segundo registro para o mesmo mês).
3. **Given** um admin, **When** ele tenta salvar um percentual vazio, zero, negativo ou maior ou igual a 100%, **Then** o sistema recusa com mensagem clara e nada é salvo.
4. **Given** um usuário com papel visualizador, **When** ele tenta cadastrar ou alterar o imposto mensal, **Then** a ação é negada.

---

### User Story 2 - Proposta nova usa o imposto do mês vigente (Priority: P1)

Ao gerar uma nova proposta (Executive Search ou Development & Outplacement), o consultor vê qual imposto será aplicado e a proposta enviada ao cliente passa a exibir o percentual do mês vigente no lugar do 19,55% fixo, nos dois idiomas.

**Why this priority**: É o objetivo final pedido pelo negócio — a proposta precisa refletir o imposto correto.

**Independent Test**: Com Outubro/2026 = 18,75% cadastrado, gerar uma proposta em outubro e abrir o link público: a observação mostra "Impostos (até 18,75%)…" (ou "Taxes (up to 18.75%)…" em inglês).

**Acceptance Scenarios**:

1. **Given** Outubro/2026 cadastrado com 18,75% e a data atual em outubro/2026, **When** o consultor gera uma proposta em português, **Then** a página do cliente e o PDF exibem "Impostos (até 18,75%) serão adicionados a todos os valores informados."
2. **Given** o mesmo cenário, **When** a proposta é gerada em inglês, **Then** a página exibe "Taxes (up to 18.75%) will be added to all amounts stated."
3. **Given** o formulário de nova proposta aberto, **When** o consultor revisa o resumo antes de gerar, **Then** ele vê o percentual de imposto que será aplicado e o mês de referência (ex.: "Imposto: 18,75% — Out/2026").
4. **Given** uma proposta gerada em outubro com 18,75%, **When** o admin cadastra novembro com 19,10% e o cliente abre a proposta em novembro sem que ela tenha sido editada, **Then** a proposta continua exibindo 18,75% (o percentual fica fixado no momento em que foi salva).

---

### User Story 3 - Propostas pendentes atualizam o imposto ao serem editadas; as demais não mudam (Priority: P2)

Propostas pendentes (aguardando assinatura ou visualizadas), quando editadas, passam a usar o imposto do mês vigente na data da edição — inclusive as emitidas antes desta feature com 19,55%. Propostas que não forem editadas continuam exibindo exatamente o que o cliente recebeu, e as assinadas nunca mudam, preservando a integridade do conteúdo aceito.

**Why this priority**: Mantém as propostas em negociação alinhadas ao imposto atual sem alterar silenciosamente documentos já enviados ou aceitos; não bloqueia o uso da feature nova.

**Independent Test**: Editar uma proposta pendente emitida antes da feature e ver o texto passar de 19,55% para o imposto vigente; abrir uma proposta assinada antiga e confirmar que continua com 19,55% e com a integridade válida.

**Acceptance Scenarios**:

1. **Given** uma proposta assinada antes da feature, **When** ela é aberta depois da implantação, **Then** exibe 19,55% e sua verificação de integridade continua válida.
2. **Given** uma proposta pendente emitida antes da feature e não editada, **When** ela é aberta, **Then** continua exibindo 19,55%.
3. **Given** uma proposta pendente com 19,55% e Outubro/2026 = 18,75%, **When** o consultor a edita em outubro/2026 e salva, **Then** a proposta passa a exibir 18,75% e o histórico de edições registra a mudança do imposto de 19,55% para 18,75%.
4. **Given** o formulário de edição de uma proposta pendente cujo imposto difere do vigente, **When** o consultor abre a edição, **Then** ele é avisado de que, ao salvar, o imposto será atualizado do valor atual para o vigente.

---

### Edge Cases

- **Mês vigente sem imposto cadastrado**: a proposta usa o imposto do mês cadastrado mais recente anterior ao mês vigente; o formulário avisa o consultor de qual mês veio o valor.
- **Nenhum imposto cadastrado em nenhum mês anterior**: a proposta usa 18,75% (padrão) e o formulário avisa que o imposto do mês não foi cadastrado.
- **Edição de proposta pendente**: salvar a edição aplica o imposto vigente na data da edição; se for igual ao já fixado e nada mais mudar, não há nova versão.
- **Edição em que só o imposto muda**: se o consultor salva sem alterar nenhum outro campo, mas o imposto vigente difere do fixado, a edição é registrada (nova versão) com a alteração do imposto.
- **Copiar/duplicar uma proposta existente**: a nova proposta é uma geração nova e usa o imposto do mês vigente, não o da proposta de origem.
- **Virada de mês**: a referência é o mês corrente no fuso de São Paulo no instante da geração.
- **Casas decimais**: o percentual tem até 2 casas decimais e é exibido sem zeros desnecessários (18,75% / 18.75%; 19% em vez de 19,00%).
- **Alteração retroativa**: alterar o imposto de um mês já usado não altera propostas já salvas com o valor anterior (até que sejam editadas).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O ERP MUST oferecer um cadastro de "Imposto do mês" com mês, ano e percentual, acessível somente a administradores.
- **FR-002**: O cadastro MUST aceitar percentuais maiores que 0 e menores que 100, com até 2 casas decimais, e recusar valores fora disso com mensagem clara.
- **FR-003**: O sistema MUST manter no máximo um percentual por mês/ano; salvar um mês já existente atualiza o valor.
- **FR-004**: O cadastro MUST listar os meses já cadastrados, do mais recente para o mais antigo, permitindo editar o valor de cada um.
- **FR-005**: Toda criação ou alteração do imposto do mês MUST ficar registrada na Auditoria, com usuário, mês/ano e percentual.
- **FR-006**: Ao gerar uma nova proposta dos modelos Executive Search ou Development & Outplacement, o sistema MUST determinar o imposto do mês vigente (mês corrente no fuso de São Paulo) e fixá-lo na proposta.
- **FR-007**: Se o mês vigente não tiver imposto cadastrado, o sistema MUST usar o mês cadastrado mais recente anterior ao vigente; se não houver nenhum, MUST usar 18,75%.
- **FR-008**: A página da proposta (link do cliente e PDF) MUST exibir o percentual fixado na proposta no texto de impostos das Observações de Investimento, em português e em inglês, no lugar do 19,55% fixo.
- **FR-009**: Os formulários de nova proposta e de edição MUST exibir, somente leitura, o percentual que será aplicado e o mês de referência, avisando quando o valor vier de um mês anterior ou do padrão; o consultor não pode alterar o percentual.
- **FR-010**: Salvar a edição de uma proposta pendente MUST aplicar o imposto vigente na data da edição (mesma regra de FR-006 e FR-007), inclusive em propostas emitidas antes desta feature.
- **FR-011**: Quando a edição alterar o imposto, o histórico de edições MUST registrar o valor anterior e o novo; o formulário de edição MUST avisar antes de salvar que o imposto será atualizado.
- **FR-012**: Propostas emitidas antes desta feature e não editadas MUST continuar exibindo 19,55%; propostas assinadas nunca mudam e sua verificação de integridade MUST continuar válida.
- **FR-013**: O percentual fixado em propostas novas ou editadas MUST fazer parte do conteúdo protegido pela verificação de integridade da assinatura.
- **FR-014**: A implantação MUST deixar Outubro/2026 cadastrado com 18,75%.

### Key Entities

- **Imposto do mês**: percentual de imposto vigente para propostas em um mês/ano. Atributos: mês, ano, percentual (0 < x < 100, 2 casas), data de criação e de última alteração. Único por mês/ano.
- **Proposta (existente)**: passa a guardar o percentual de imposto aplicado no último salvamento (criação ou edição); ausente nas propostas antigas não editadas, que exibem 19,55%.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um administrador cadastra ou altera o imposto de um mês em menos de 1 minuto, sem ajuda técnica.
- **SC-002**: 100% das propostas novas ou editadas exibem o percentual do mês vigente cadastrado (ou o de fallback documentado), em ambos os idiomas.
- **SC-003**: 0 propostas antigas não editadas têm o percentual exibido alterado e 0 assinaturas perdem a validação de integridade.
- **SC-004**: Mudar o imposto do mês deixa de exigir alteração no sistema por parte da equipe técnica (hoje exige mudança de texto fixo).
- **SC-005**: Logo após a implantação, uma proposta gerada em outubro/2026 exibe 18,75%.

## Assumptions

- "ERP" é o Ocean App principal (não a plataforma Proposal); o campo fica na área administrativa (Configurações), pois só administradores definem o imposto.
- "Mês vigente" é o mês corrente na data em que a proposta é salva (criação ou edição), no fuso de São Paulo — não a "data da proposta" informada no formulário.
- O consultor não edita o percentual na proposta; ele apenas vê o valor que será aplicado.
- O padrão de 18,75% (sem nenhum mês cadastrado) é diferente do 19,55% exibido nas propostas antigas não editadas.
- O texto mantém a forma "Impostos (até X%)…" / "Taxes (up to X%)…", trocando só o número.
- O cadastro é independente da alíquota usada na Configuração do Período do Dashboard (metas e NFs); as duas podem ter valores diferentes.
- A proposta simples (feature 077) não é mais gerada e fica fora do escopo.
- O valor histórico de 19,55% permanece apenas como valor exibido nas propostas antigas não editadas.
