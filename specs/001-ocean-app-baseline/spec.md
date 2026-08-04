# Feature Specification: Ocean App — Baseline do Produto

**Feature Branch**: `001-ocean-app-baseline`

**Created**: 2026-07-26

**Status**: Baseline

**Input**: User description: "faça uma leitura completa do projeto e gere apenas o primeiro arquivo de spec para servir como base para os demais"

## Contexto

Este documento descreve o **estado atual** do Ocean App como especificação-base. Specs futuras de features devem referenciar este baseline e descrever apenas o que muda, inclui ou exclui em relação a ele.

**Ocean App** é o sistema interno de gestão financeira e operacional da **Auto Fernando**, apresentado na interface como **Ocean Talent Solutions**. Atende o negócio de recrutamento e colocação de talentos: faturamento de clientes (NFs retainer/sucesso), custos por centro, posição de caixa, bônus por etapa do deal, RH leve de colaboradores e relatórios gerenciais.

**Propósito deste baseline:** documentação descritiva do produto como está hoje (inventário de capacidades), não um projeto de redesign nem uma fila de decisões de produto.

## Clarifications

### Session 2026-07-26

- Q: Qual o objetivo desta especificação/clarificação? → A: Apenas documentação as-is para ver como está o projeto (sem decisões de mudança).
- Q: Quem ativa/desativa 2FA neste baseline? → A: Somente admin, na própria conta, via Segurança (comportamento atual da UI).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Autenticar e acessar o sistema (Priority: P1)

Um usuário autorizado entra no sistema com usuário e senha. Se tiver autenticação em dois fatores ativada, informa o código. Após o login, vê apenas os menus permitidos ao seu papel e permissões.

**Why this priority**: Sem acesso seguro e controlado, nenhum outro fluxo do produto é utilizável.

**Independent Test**: Login com admin e com visualizador; verificar menus visíveis e bloqueio de usuários inativos ou credenciais inválidas.

**Acceptance Scenarios**:

1. **Given** um usuário ativo com senha correta, **When** ele autentica, **Then** acessa a área autenticada do sistema.
2. **Given** um usuário com 2FA ativo, **When** informa senha sem o código, **Then** o sistema exige o código de 6 dígitos antes de liberar o acesso.
3. **Given** um usuário inativo ou credenciais inválidas, **When** tenta autenticar, **Then** o acesso é negado com mensagem clara.
4. **Given** um visualizador com permissões parciais de menu, **When** acessa o sistema, **Then** vê apenas os módulos concedidos.

---

### User Story 2 - Registrar e acompanhar faturamento (NFs) (Priority: P1)

O administrador registra notas fiscais de colocações (sucesso ou retainer abertura/fechamento), atribui lead/condução/placement, acompanha vencimento e pagamento, arquiva ou cancela quando necessário, e importa/exporta em massa.

**Why this priority**: NFs são a fonte principal de receita e alimentam dashboard, fluxo de caixa, impostos, bônus e relatórios.

**Independent Test**: Criar NF, marcar como paga, filtrar por mês/ano/status, arquivar e exportar; conferir totais do resumo.

**Acceptance Scenarios**:

1. **Given** um administrador autenticado, **When** cria uma NF com cliente, valores, datas e tipo, **Then** a NF aparece na lista com status derivado (pendente, paga, vencida ou cancelada).
2. **Given** uma NF pendente, **When** o admin registra a data de pagamento, **Then** o status passa a paga e o valor entra no faturamento líquido do período.
3. **Given** NFs existentes, **When** o usuário filtra por mês/ano de emissão e status, **Then** vê apenas os registros correspondentes, excluindo arquivadas por padrão.
4. **Given** um visualizador com acesso a NFs, **When** abre o módulo, **Then** pode consultar e exportar, mas não criar, editar, excluir ou importar.

---

### User Story 3 - Controlar contas a pagar e centros de custo (Priority: P1)

O administrador registra despesas (salário, bônus, impostos, administrativo, retirada de lucro, reembolsos, evento), marca pagamentos, anexa comprovantes e acompanha atrasos.

**Why this priority**: Controle de saídas e centros de custo é essencial para caixa, retiradas, impostos e alertas.

**Independent Test**: Criar conta, marcar como paga, filtrar por centro e status, anexar comprovante.

**Acceptance Scenarios**:

1. **Given** um admin, **When** cria uma conta com centro de custo, valor e vencimento, **Then** a conta fica disponível para consulta e calendário.
2. **Given** uma conta não paga vencida, **When** o sistema calcula alertas, **Then** ela aparece como atrasada.
3. **Given** uma conta paga, **When** o admin anexa comprovante, **Then** o comprovante pode ser baixado depois.

---

### User Story 4 - Visão gerencial no dashboard e metas (Priority: P1)

Gestão acompanha faturamento líquido mensal, comparação anual, mix retainer vs sucesso, metas mensais/anuais, retiradas de sócios e saldos de contas.

**Why this priority**: É o cockpit principal de decisão financeira.

**Independent Test**: Definir meta mensal e anual; conferir KPIs contra NFs pagas e retiradas do ano.

**Acceptance Scenarios**:

1. **Given** NFs pagas no ano, **When** o usuário abre o dashboard, **Then** vê receita líquida mensal e indicadores de pendências.
2. **Given** um admin, **When** define meta mensal ou anual, **Then** o progresso da meta é exibido no dashboard.
3. **Given** contas de retirada de lucro no ano, **When** o dashboard carrega, **Then** o total de retiradas do ano é refletido.

---

### User Story 5 - Posição de caixa (Priority: P2)

O usuário registra saldos de conta corrente e investimento, consulta entradas/saídas automáticas (NFs e contas pagas) e movimentos manuais, e exporta o período.

**Why this priority**: Complementa o controle financeiro após faturamento e contas.

**Independent Test**: Registrar saldo, adicionar movimento manual, filtrar mês/ano e validar totais.

**Acceptance Scenarios**:

1. **Given** NFs e contas pagas no período, **When** o usuário abre o fluxo de caixa, **Then** vê entradas e saídas geradas automaticamente pela data de pagamento.
2. **Given** um admin, **When** registra um movimento manual, **Then** ele aparece distinguível dos movimentos automáticos.

---

### User Story 6 - Calcular e registrar bônus por etapa (Priority: P2)

O administrador registra bônus de consultores nas etapas lead, condução e placement, opcionalmente vinculados a uma NF, com cálculo por percentual do valor líquido.

**Why this priority**: Remuneração variável ligada ao ciclo comercial é parte central do modelo Ocean Talent.

**Independent Test**: Criar bônus vinculado a NF com percentual; validar valor calculado e filtro por colaborador/ano.

**Acceptance Scenarios**:

1. **Given** uma NF com valor líquido conhecido, **When** o admin cria bônus com número da NF e percentual, **Then** o valor do bônus é calculado e cliente/posição podem ser preenchidos a partir da NF.
2. **Given** bônus no ano, **When** o usuário filtra por colaborador, **Then** vê apenas os registros daquele colaborador.

---

### User Story 7 - Administrar colaboradores, documentos, férias e patrimônio (Priority: P2)

RH/ops mantém cadastro de colaboradores (incluindo histórico de cargo/salário), documentos, períodos de férias com aprovação e ativos atribuídos.

**Why this priority**: Base de pessoas necessária para atribuição em NFs, bônus, férias e patrimônio.

**Independent Test**: Cadastrar colaborador, desligar (soft), anexar documento, criar férias e aprovar, atribuir patrimônio.

**Acceptance Scenarios**:

1. **Given** um admin, **When** cadastra colaborador com CPF único, **Then** o registro fica ativo e disponível para vínculo em outros módulos.
2. **Given** um colaborador ativo, **When** o admin o desliga, **Then** ele fica inativo com data de desligamento, sem exclusão permanente.
3. **Given** um período de férias, **When** o admin aprova, **Then** o período deixa de constar como pendência de aprovação.
4. **Given** um ativo da empresa, **When** o admin o atribui a um colaborador, **Then** o vínculo e o status (ativo, manutenção, descartado) ficam consultáveis.

---

### User Story 8 - Acompanhar DH, calendário, impostos, retiradas e relatórios (Priority: P3)

Operação registra DHs e marca envio a financeiro/CEO; consulta vencimentos no calendário; analisa impostos e retiradas derivados das contas; e gera relatórios analíticos do ano.

**Why this priority**: Consolida operação e análise; depende dos dados dos módulos P1/P2.

**Independent Test**: Criar DH e marcar enviado; abrir calendário no mês; conferir impostos/retiradas do ano; exportar um gráfico de relatórios.

**Acceptance Scenarios**:

1. **Given** um DH criado, **When** o admin marca enviado ao financeiro ou CEO, **Then** o flag correspondente fica registrado (checklist operacional).
2. **Given** NFs e contas com vencimento no mês, **When** o usuário abre o calendário, **Then** os eventos aparecem nos dias corretos.
3. **Given** contas de impostos e NFs pagas no ano, **When** o usuário abre impostos, **Then** vê faturamento, valor e percentual mensal derivados desses dados.
4. **Given** dados do ano, **When** o usuário abre relatórios, **Then** consegue analisar faturamento, fechamentos, bônus, top clientes e atribuições por etapa.

---

### User Story 9 - Governança: usuários, auditoria e segurança (Priority: P3)

Admin gerencia usuários e permissões de menu, consulta log de alterações e configura 2FA da própria conta (menu Segurança restrito a admin; visualizador não configura 2FA neste baseline).

**Why this priority**: Controle de acesso e rastreabilidade; necessário em ambiente financeiro interno.

**Independent Test**: Criar visualizador com menus específicos; alterar uma NF e ver na auditoria; ativar 2FA.

**Acceptance Scenarios**:

1. **Given** um admin, **When** cria um visualizador com menus selecionados, **Then** esse usuário só enxerga esses módulos.
2. **Given** uma alteração em entidade auditada, **When** o admin abre auditoria, **Then** o evento aparece com usuário, ação e entidade.
3. **Given** um usuário autenticado na área de segurança, **When** conclui a ativação do 2FA, **Then** logins seguintes exigem o código.

---

### Edge Cases

- Credenciais inválidas, usuário inativo ou 2FA ausente/incorreto bloqueiam o acesso sem vazar detalhes desnecessários.
- NF sem data de pagamento e com vencimento passado é tratada como vencida.
- Lista padrão de NFs omite arquivadas; exclusão em massa exige confirmação explícita digitada.
- CPF duplicado no cadastro de colaborador é rejeitado.
- Exclusão permanente de colaborador remove dados relacionados e exige confirmação forte.
- Visualizador não vê controles de criação/edição/exclusão/importação nos módulos.
- Importações CSV/XLSX com linhas inválidas devem falhar de forma compreensível sem corromper o restante quando o fluxo assim permitir.
- Alertas in-app cobrem NFs vencidas, contas atrasadas e férias não aprovadas.
- Envio real de e-mail de DH ao financeiro/CEO **não** faz parte do comportamento atual (apenas marcação manual).
- Relatórios de propostas enviadas e contratos assinados existem como capacidade futura/parcial e **não** fazem parte do baseline de UI.

## Requirements *(mandatory)*

### Functional Requirements

#### Acesso e papéis

- **FR-001**: O sistema MUST autenticar usuários ativos por usuário e senha.
- **FR-002**: O sistema MUST oferecer autenticação em dois fatores opcional; neste baseline, apenas o admin ativa/desativa 2FA na própria conta via Segurança.
- **FR-003**: O sistema MUST distinguir papéis `admin` (acesso total de escrita e menus administrativos) e `visualizador` (consulta conforme permissões de menu).
- **FR-004**: O sistema MUST permitir que o admin conceda ao visualizador acesso granular aos menus: dashboard, calendário, NFs, contas, fluxo de caixa, impostos, retiradas, bônus, DH, colaboradores, férias e relatórios.
- **FR-005**: Menus de Auditoria, Segurança e Configurações MUST ser restritos a administradores.

#### NFs (faturamento)

- **FR-006**: O sistema MUST permitir CRUD de NFs com número único, cliente, posição, candidato, valores bruto/líquido, datas de emissão/vencimento/pagamento, tipo (sucesso ou retainer abertura/fechamento), status e vínculo opcional a consultores de lead, condução e placement.
- **FR-007**: O status da NF MUST ser derivado/consistente: paga (com pagamento), cancelada, vencida (vencida sem pagamento) ou pendente.
- **FR-008**: O sistema MUST permitir arquivar/desarquivar NFs e ocultar arquivadas na listagem padrão.
- **FR-009**: O sistema MUST filtrar NFs por mês/ano de emissão, status e busca de cliente, com resumo de totais do período.
- **FR-010**: O sistema MUST permitir importação e exportação em massa de NFs (incluindo exclusão em massa com confirmação explícita para admin).

#### Contas a pagar

- **FR-011**: O sistema MUST permitir CRUD de contas a pagar com descrição, centro de custo, valor, vencimento, pagamento e flag pago.
- **FR-012**: Centros de custo MUST incluir pelo menos: salário, bônus, impostos, administrativo, retirada de lucro, reembolsos e evento.
- **FR-013**: O sistema MUST permitir anexar, baixar e remover comprovantes de pagamento.
- **FR-014**: Contas não pagas com vencimento passado MUST ser identificáveis como atrasadas para alertas e calendário.

#### Fluxo de caixa, impostos e retiradas

- **FR-015**: O sistema MUST permitir registrar e consultar saldos mensais de conta corrente e investimento.
- **FR-016**: O fluxo de caixa MUST refletir entradas de NFs pagas e saídas de contas pagas pela data de pagamento, além de movimentos manuais de receita/despesa.
- **FR-017**: A visão de impostos MUST apresentar faturamento, valor e percentual mensal derivados de NFs pagas e contas do centro impostos.
- **FR-018**: A visão de retiradas MUST apresentar contas do centro retirada de lucro do ano, com totais pagos e pendentes.

#### Bônus e DH

- **FR-019**: O sistema MUST permitir CRUD de bônus por colaborador, mês/ano, etapa (lead, condução, placement), percentual e valor, com vínculo opcional a número de NF.
- **FR-020**: Ao vincular bônus a NF com percentual, o sistema MUST calcular o valor com base no valor líquido da NF.
- **FR-021**: O sistema MUST permitir CRUD de DH com empresa, posição, tipo, responsável pelo preenchimento, assunto padronizado e flags de enviado ao financeiro e ao CEO.
- **FR-022**: O sistema MUST permitir marcar DH como enviado ao financeiro e/ou CEO (checklist operacional; envio automático de e-mail está fora deste baseline).

#### Colaboradores, férias e patrimônio

- **FR-023**: O sistema MUST permitir CRUD de colaboradores com dados cadastrais, CPF único, cargo, salário, datas, benefício, observação e status ativo.
- **FR-024**: O sistema MUST permitir desligamento lógico (inativar) e exclusão permanente com confirmação explícita.
- **FR-025**: O sistema MUST manter histórico de períodos de cargo/salário e um repositório de documentos por colaborador.
- **FR-026**: O sistema MUST permitir períodos de férias por colaborador/ano com dias de direito/tirados, datas e aprovação, calculando saldo.
- **FR-027**: O sistema MUST permitir CRUD de patrimônio (descrição, tipo, identificação, valor/data de aquisição, status e colaborador opcional).

#### Dashboard, calendário e relatórios

- **FR-028**: O dashboard MUST apresentar faturamento líquido mensal do ano (NFs pagas), comparação com outro ano, mix retainer vs sucesso, KPIs de pago/pendente, metas financeiras e saldos recentes.
- **FR-029**: O admin MUST poder definir metas financeiras mensais e anuais.
- **FR-030**: O calendário MUST agregar vencimentos de NFs e contas do mês, com exportação/impressão.
- **FR-031**: Relatórios MUST oferecer análises anuais de faturamento, fechamentos, bônus, top clientes, impostos e desempenho por etapa/consultor, com exportação dos dados exibidos.

#### Governança e alertas

- **FR-032**: O admin MUST poder criar, editar, desativar e excluir usuários do aplicativo, incluindo papel e permissões de menu.
- **FR-033**: O sistema MUST registrar em auditoria criações, edições e exclusões relevantes, consultáveis e limpáveis apenas por admin.
- **FR-034**: O sistema MUST exibir alertas in-app de NFs vencidas, contas atrasadas e férias não aprovadas.
- **FR-035**: Módulos operacionais MUST oferecer exportação (planilha e/ou impressão) adequada ao contexto da tela.

### Key Entities

- **Usuário do aplicativo**: Credencial de acesso, papel (admin/visualizador), permissões de menu, ativo/inativo; pode ter 2FA.
- **Colaborador**: Pessoa da equipe (consultor/staff); base para NFs, bônus, férias, histórico, documentos e patrimônio.
- **Histórico do colaborador**: Períodos de cargo e salário.
- **Documento do colaborador**: Arquivo associado ao colaborador.
- **NF**: Fatura de colocação; motor de receita e atribuição comercial (lead/condução/placement).
- **Conta a pagar**: Despesa por centro de custo; base de saídas, impostos e retiradas.
- **Bônus**: Remuneração variável por etapa e período, tipicamente ligada a NF.
- **Férias**: Período de gozo/direito por colaborador e ano, com aprovação.
- **DH**: Registro operacional de documento de deal/horas com checklist de envio.
- **Saldo**: Posição mensal de conta corrente ou investimento.
- **Movimento de fluxo**: Entrada/saída manual no caixa.
- **Meta financeira**: Meta mensal ou anual de faturamento.
- **Patrimônio**: Ativo da empresa, opcionalmente atribuído a colaborador.
- **Registro de auditoria**: Histórico de alterações em entidades sensíveis.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um administrador consegue autenticar, criar uma NF, registrar uma conta a pagar e ver o impacto no dashboard ou fluxo de caixa no mesmo período de trabalho (menos de 10 minutos em cenário típico).
- **SC-002**: 100% dos módulos listados no baseline são acessíveis conforme papel/permissões; visualizador sem a permissão de um menu não o vê na navegação.
- **SC-003**: Em consulta de NFs de um mês com dados carregados, o usuário obtém lista + resumo de totais em menos de 3 segundos em uso normal interno.
- **SC-004**: Status de NF (paga/pendente/vencida/cancelada) e atraso de contas são interpretáveis corretamente em pelo menos 95% dos casos de teste de borda definidos.
- **SC-005**: Alertas in-app refletem NFs vencidas, contas atrasadas e férias não aprovadas após atualização dos dados, sem necessidade de recarregar a página manualmente além do ciclo normal de atualização da interface.
- **SC-006**: Exportação CSV/planilha dos principais módulos (NFs, contas, bônus, colaboradores, relatórios) produz arquivo utilizável contendo os registros filtrados visíveis na tela.
- **SC-007**: Um novo visualizador configurado com subconjunto de menus consegue completar leitura e exportação nos módulos concedidos e não consegue executar ações de escrita pela interface.
- **SC-008**: Esta especificação é suficiente como glossário e mapa de capacidades para que specs futuras descrevam apenas deltas (novo, alterado, removido) sem redefinir o produto inteiro.

## Assumptions

- Este documento descreve o **produto como está hoje** (as-is), não um redesign. Foi criado para documentar o estado do projeto; lacunas conhecidas ficam fora do baseline ou explícitas nas bordas.
- Público-alvo: equipe interna financeira/operacional da Auto Fernando / Ocean Talent Solutions; não há self-service externo de clientes ou candidatos.
- Um único contexto organizacional (sem multi-empresa / multi-tenant).
- Papel visualizador é “somente leitura” na interface; reforço uniforme de escrita no servidor pode ser tratado em specs futuras de endurecimento.
- “Exportar PDF” no baseline significa impressão/visualização para impressão, não necessariamente arquivo PDF gerado pelo servidor.
- Envio automático de e-mail de DH e tela de disparo manual de alertas por e-mail estão **fora** deste baseline (existem intenções/parciais no produto).
- Visões de Impostos e Retiradas no baseline são lentes sobre Contas a Pagar (+ faturamento de NFs), não cadastros primários separados na interface.
- Patrimônio faz parte do produto; a concessão explícita desse menu a visualizadores via Configurações pode ser incompleta e deve ser tratada em spec futura se necessário.
- Specs futuras devem usar este arquivo como referência de domínio, atores, entidades e limites de escopo.

## Escopo e limites *(baseline)*

### Incluído

Login e 2FA; papéis e permissões de menu; Dashboard e metas; Calendário; NFs; Contas a pagar; Fluxo de caixa; Impostos (visão derivada); Retiradas (visão derivada); Bônus; DH (checklist); Colaboradores (histórico e documentos); Férias; Patrimônio; Relatórios principais; Auditoria; Segurança (2FA); Configurações de usuários; importação/exportação nos módulos que já suportam; alertas in-app.

### Explicitamente fora deste baseline (para specs futuras)

- Envio automático de e-mail de DH ao financeiro/CEO
- UI de disparo/gestão de alertas por e-mail
- Relatórios de propostas enviadas e contratos assinados na interface
- CRM de clientes, ATS/pipeline de candidatos, motor de folha de pagamento, integração bancária em tempo real, multi-empresa
- Correção de lacunas de permissão (ex.: patrimônio para visualizador) e endurecimento uniforme de autorização no servidor
