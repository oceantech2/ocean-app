# Feature Specification: Contas a Pagar — Confirmar lógica do input manual

**Feature Branch**: `020-contas-pagar-logica`

**Created**: 2026-08-12

**Status**: Draft

**Input**: User description: "em contas a pagar Input manual (confirmar lógica)"

## Clarifications

### Session 2026-08-12

- Q: Ao clicar em **Pagar** na listagem, o que acontece com a data de pagamento? → A: Um clique em **Pagar**: a conta fica paga com a **data de hoje**, sem pedir a data
- Q: No formulário (criar/editar), a data de pagamento pode ser qualquer dia ou há restrição em relação a hoje/vencimento? → A: Qualquer data preenchida é aceita (passado, hoje, futuro, antes ou depois do vencimento)
- Q: O sistema deve bloquear duas contas a pagar iguais (mesma descrição, valor e vencimento)? → A: Permitir contas iguais: não há checagem de duplicidade
- Q: Como o administrador desfaz um pagamento (conta paga → pendente)? → A: Só na **edição**: limpar a data de pagamento e salvar

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Lançar despesa por input manual (Priority: P1)

Administrador, na página **Contas a Pagar**, registra uma despesa **uma a uma** no formulário da própria página. Não há fonte externa alimentando essa tela: o caminho principal é o cadastro feito pelo usuário. Após salvar, a conta aparece na listagem com o valor e os demais dados informados.

**Lógica canônica do formulário “Nova conta a pagar” / “Editar conta a pagar”:**

| Campo | Obrigatório | Comportamento |
|-------|-------------|---------------|
| Descrição | Sim | Texto livre da despesa |
| Categorias | Sim | Taxonomia oficial já vigente (Adm/Financeiro, Operações, Marketing, Comercial, Recursos Humanos, Tecnologia, Impostos) |
| Subcategoria RH | Só se Categorias = Recursos Humanos | Salário, Bônus, Comissão, Retirada Sócios ou Benefícios |
| Valor | Sim | Montante **maior que zero**, digitado com máscara monetária brasileira (ex.: R$ 1.234,56) |
| Data de vencimento | Sim | Data em que a despesa vence |
| Data de pagamento | Não | Se preenchida, a conta **nasce/fica paga**; se vazia, **pendente**. Qualquer data preenchida é válida (passado, hoje, futuro, antes ou depois do vencimento). Não há seletor Pendente \| Pago |

**Why this priority**: O pedido é confirmar que Contas a Pagar opera por input manual unitário — é o que diferencia esta tela de Contas a Receber (fonte externa) e o que o time usa no dia a dia.

**Independent Test**: Como admin, abrir Contas a Pagar, acionar “Nova conta a pagar”, preencher descrição, categoria, valor e vencimento, salvar sem data de pagamento; conferir a conta pendente na lista. Repetir com data de pagamento e conferir status pago. Visualizador não vê a ação de criar.

**Acceptance Scenarios**:

1. **Given** um administrador na página Contas a Pagar, **When** aciona **“Nova conta a pagar”**, **Then** vê o formulário com descrição, Categorias (e subcategoria de RH quando aplicável), valor com máscara monetária brasileira, data de vencimento e data de pagamento opcional — sem seletor Pendente \| Pago.
2. **Given** o formulário com dados obrigatórios válidos e **sem** data de pagamento, **When** o administrador salva, **Then** o registro é persistido como **pendente** e aparece na listagem com o valor informado.
3. **Given** o formulário com dados obrigatórios válidos e **com** data de pagamento, **When** o administrador salva, **Then** o registro nasce **pago**, com a data de pagamento persistida.
4. **Given** valor em branco, zero, negativo ou inválido, **When** tenta salvar, **Then** a gravação é bloqueada e o sistema indica que o valor é inválido.
5. **Given** descrição, categoria ou vencimento em branco, ou Recursos Humanos sem subcategoria, **When** tenta salvar, **Then** a gravação é bloqueada e o sistema indica o que corrigir.
6. **Given** um visualizador na página, **When** procura a ação de inserção manual, **Then** ela não está disponível (somente leitura).

---

### User Story 2 - Status pago ou pendente segue a data de pagamento (Priority: P1)

O status da conta **não é escolhido à parte**: ele deriva da **data de pagamento**.

- Data preenchida → conta **paga**
- Data vazia (criação ou limpeza na edição) → conta **pendente**
- Na listagem, conta pendente com vencimento anterior a hoje aparece como **Vencida** (aviso visual; continua pendente para pagamento)

Na listagem, o administrador pode **Pagar** uma conta pendente: a conta fica paga com a **data de hoje**. Na edição, pode informar outra data ou **limpar** a data para devolver a conta ao status pendente. Valor e demais campos editáveis podem ser corrigidos **mesmo com a conta já paga**.

**Why this priority**: É a regra de negócio que o time precisa confirmar; status inconsistente com a data gera retrabalho e leitura errada do caixa.

**Independent Test**: Criar sem data → pendente; criar com data → paga; na lista, Pagar uma pendente e ver “pago em” hoje; na edição, limpar a data e ver pendente de novo; alterar o valor de uma conta paga e confirmar que permanece paga.

**Acceptance Scenarios**:

1. **Given** uma conta **sem** data de pagamento, **When** o usuário consulta a listagem, **Then** o status é **Pendente** (ou **Vencida**, se o vencimento já passou).
2. **Given** uma conta **com** data de pagamento, **When** o usuário consulta a listagem, **Then** o status é **Pago** e a data aparece como pagamento.
3. **Given** uma conta pendente, **When** o administrador aciona **Pagar** na listagem, **Then** a conta fica paga com a data de pagamento igual ao **dia corrente**, sem pedir outra data.
4. **Given** um administrador editando uma conta paga, **When** altera só o valor e salva, **Then** o novo valor persiste e o status continua pago.
5. **Given** um administrador editando uma conta paga, **When** limpa a data de pagamento e salva, **Then** a conta volta a **pendente**.
6. **Given** um visualizador, **When** consulta a listagem, **Then** vê status e valores e **não** aciona Pagar nem edita.
7. **Given** uma conta paga, **When** o administrador observa as ações da listagem, **Then** não há **Desfazer pagamento** (nem equivalente); para voltar a pendente, abre a edição, limpa a data e salva.

---

### User Story 3 - Ver, filtrar e conviver com importação (Priority: P2)

Qualquer usuário autenticado vê as contas manuais na mesma listagem, com valor em moeda brasileira, agrupadas por Categorias. Filtros, exportação, comprovantes e exclusão **individual** seguem o produto atual. **Importação** CSV/Excel permanece como caminho complementar em lote; **não** substitui o input unitário. **Não** há exclusão em massa (“Deletar todas”). Não há coluna de origem externa: todas as contas desta tela são lançamentos locais.

**Why this priority**: Confirma o perímetro da lógica (manual + importação, sem fonte Maggo) sem misturar com o fluxo de Contas a Receber.

**Independent Test**: Criar uma conta, recarregar, filtrar por categoria e status, exportar; como admin, confirmar que importação CSV/Excel existe e que “Deletar todas” não existe.

**Acceptance Scenarios**:

1. **Given** ao menos uma conta criada no formulário, **When** o usuário abre ou recarrega a listagem, **Then** a conta permanece visível com descrição, valor, vencimento e status corretos.
2. **Given** filtros já existentes (Categorias, subcategoria de RH, status, descrição, período de vencimento), **When** aplicados, **Then** contas criadas no formulário entram nas mesmas regras que as demais (inclusive importadas).
3. **Given** um administrador na página, **When** observa as ações de entrada, **Then** vê **Nova conta a pagar** e também importação CSV/Excel; **não** vê “Deletar todas”.
4. **Given** a listagem, **When** o usuário lê as colunas, **Then** **não** há coluna Origem (Manual/Maggo) — essa distinção não se aplica a Contas a Pagar.

---

### Edge Cases

- Salvar sem descrição, categoria, valor ou vencimento: gravação bloqueada com feedback claro.
- Valor zero, negativo ou inválido na máscara: gravação bloqueada.
- Recursos Humanos sem subcategoria: gravação bloqueada.
- Data de pagamento na criação: nasce paga; sem data: nasce pendente.
- Data de pagamento no passado, hoje, no futuro, antes ou depois do vencimento: gravação permitida (nenhuma dessas combinações é erro).
- Conta já paga: valor e demais campos editáveis podem ser alterados sem reabrir o pagamento; status permanece pago enquanto a data estiver preenchida.
- Limpar a data de pagamento na edição: volta a pendente. Não há ação na listagem para desfazer o pagamento.
- Ação **Pagar** na listagem: usa a data de hoje; não abre formulário extra de data.
- Pendente com vencimento no passado: rótulo **Vencida** na listagem; ainda pode ser paga ou editada.
- Conta pendente de reclassificação (legado): operações normais (pagar, editar outros campos) continuam permitidas; o aviso permanece até o admin escolher uma categoria válida.
- Falha ao salvar: feedback claro; a lista não mostra sucesso falso.
- Visualizador: consulta apenas; sem criar, editar, pagar, excluir ou importar.
- Importação CSV/Excel permanece; linhas inválidas seguem a regra já vigente da taxonomia (rejeitar categoria antiga/inválida).
- Exclusão em massa permanece indisponível; exclusão individual permanece para o admin.
- Duas ou mais contas com a mesma descrição, valor e vencimento: gravação permitida; não há aviso nem bloqueio por duplicidade.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O módulo Contas a Pagar MUST operar com **input manual unitário** como caminho principal de cadastro: o administrador MUST poder criar uma conta pela página, sem depender de fonte externa nem de importação em lote.
- **FR-002**: A ação de criação MUST usar o rótulo **“Nova conta a pagar”** (botão e título do formulário alinhados).
- **FR-003**: O formulário de criação e de edição MUST incluir: descrição, Categorias, subcategoria quando Recursos Humanos, valor, data de vencimento e data de pagamento opcional.
- **FR-004**: O campo valor MUST usar máscara monetária brasileira na digitação e MUST ser numérico **maior que zero**; valores ausentes, zero, negativos ou inválidos MUST ser rejeitados com mensagem clara.
- **FR-005**: O sistema MUST impedir salvamento com obrigatórios ausentes (descrição, categoria, valor, vencimento; subcategoria RH quando aplicável) e MUST informar o que corrigir.
- **FR-006**: O status pago/pendente MUST ser **derivado da data de pagamento**: preenchida → **paga**; vazia → **pendente**. MUST NOT haver seletor explícito Pendente \| Pago no formulário. Quando a data de pagamento estiver preenchida, o sistema MUST aceitá-la **sem restringir** em relação a hoje ou ao vencimento (passado, hoje, futuro, anterior ou posterior ao vencimento).
- **FR-007**: Na listagem, o administrador MUST poder **Pagar** uma conta pendente; essa ação MUST marcar a conta como paga com a **data corrente** (hoje) em um único clique. MUST NOT pedir a data de pagamento nesse passo (sem modal/formulário extra de data).
- **FR-008**: Na edição, o administrador MUST poder alterar o valor e os demais campos permitidos **mesmo com a conta paga**, e MUST poder **limpar a data de pagamento** para devolver a conta ao status pendente. A listagem MUST NOT oferecer ação **Desfazer pagamento** (nem equivalente); o único caminho para voltar a pendente é a edição.
- **FR-009**: Usuários **visualizador** MUST NOT criar, editar, pagar, excluir nem importar; apenas consultar.
- **FR-010**: A listagem MUST exibir o valor em formato monetário brasileiro e o status **Pago**, **Pendente** ou **Vencida** (pendente com vencimento no passado).
- **FR-011**: Contas criadas no formulário MUST participar dos filtros, exportação, agrupamento por Categorias e demais regras já existentes do módulo.
- **FR-012**: Importação CSV/Excel MUST permanecer disponível como caminho complementar; MUST NOT substituir o input manual. O sistema MUST NOT reintroduzir exclusão em massa (“Deletar todas”).
- **FR-013**: A taxonomia de Categorias (e subcategorias de RH) MUST permanecer a já definida no produto; esta feature NÃO altera a lista oficial.
- **FR-014**: Contas a Pagar MUST NOT exibir origem externa (coluna Origem Manual/Maggo) nem exigir identificação de Caixa; todos os registros desta tela são lançamentos locais.
- **FR-015**: O sistema MUST permitir mais de uma conta a pagar com a mesma descrição, o mesmo valor e o mesmo vencimento (e demais combinações repetidas). MUST NOT recusar o salvamento por duplicidade de conteúdo.

### Key Entities

- **Conta a Pagar**: Despesa lançada no Ocean (formulário ou importação); atributos relevantes: descrição, valor, data de vencimento, data de pagamento, status pago/pendente/vencida, categoria e subcategoria de RH quando aplicável. Não há regra de unicidade de conteúdo: contas iguais podem coexistir.
- **Valor**: Montante da despesa; obrigatório, maior que zero; digitado com máscara monetária brasileira e exibido em moeda brasileira.
- **Data de pagamento**: Indicador de quitação; presença define status pago; ausência define pendente.
- **Categoria**: Classificação gerencial já vigente (incluindo subcategorias de RH).
- **Usuário**: Admin (escrita) ou visualizador (somente leitura).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrador conclui o cadastro manual de uma conta a pagar válida em menos de 2 minutos, sem usar importação.
- **SC-002**: Em 100% dos testes com dados válidos, a conta aparece na listagem imediatamente após salvar, com o valor correto, e permanece após recarregar.
- **SC-003**: Em 100% das criações **sem** data de pagamento, o status resultante é pendente; em 100% **com** data, o status resultante é pago — inclusive quando a data é futura ou anterior ao vencimento.
- **SC-004**: Em 100% das ações **Pagar** na listagem, a conta fica paga com a data de pagamento igual ao dia corrente.
- **SC-005**: Em 100% das edições em que a data de pagamento é limpa, a conta volta a pendente. Em 100% das inspeções da listagem de contas pagas, não há ação Desfazer pagamento.
- **SC-006**: Em 100% das tentativas com valor inválido (vazio, zero, negativo ou inválido na máscara), o salvamento é bloqueado e o usuário entende o motivo sem suporte técnico.
- **SC-007**: Visualizador não consegue criar, editar, pagar nem excluir em 100% das tentativas.
- **SC-008**: Em 100% das inspeções da página, a ação de criação exibe **“Nova conta a pagar”**, a importação CSV/Excel permanece visível para o admin, e “Deletar todas” permanece ausente.
- **SC-009**: Em 100% das inspeções da listagem, não há coluna Origem (Manual/Maggo) nem campo de Caixa.
- **SC-010**: Em 100% das tentativas de criar uma segunda conta com a mesma descrição, valor e vencimento de outra já existente, o salvamento é aceito (sem bloqueio por duplicidade).

## Assumptions

- Esta feature **confirma e formaliza** a lógica já vigente de Contas a Pagar (lançamento local + input unitário de valores), em contraste com Contas a Receber (fonte Maggo + cadastro manual coexistindo).
- Não há fonte externa (tipo Maggo) para Contas a Pagar; origem é sempre local (formulário ou importação).
- Importação CSV/Excel **permanece** (diferente de Contas a Receber, onde a importação em lote ficou fora).
- Status **não** usa seletor Pendente \| Pago: só a data de pagamento. Qualquer data preenchida é válida (sem trava de futuro nem de relação com o vencimento).
- Ação rápida **Pagar** na listagem grava a **data de hoje**, sem modal extra de data (diferente do fluxo **Recebido** em Contas a Receber, que pede a data).
- Corrigir valor de conta já paga é permitido, sem reabrir o pagamento.
- Limpar a data na edição devolve a conta a pendente. Não há ação **Desfazer pagamento** na listagem.
- Taxonomia de Categorias permanece a da feature de categorias já entregue.
- Exclusão em massa permanece indisponível; exclusão individual, comprovantes e exportação ficam como estão.
- Papéis admin / visualizador seguem o produto existente.
- Contas pendentes de reclassificação (legado) continuam operáveis até o admin escolher categoria válida.
- Caixa (corrente/investimento) **não se aplica** a Contas a Pagar.
- Duplicidade de conteúdo (mesma descrição, valor e vencimento) **é permitida**; não há aviso nem bloqueio.

## Out of Scope

- Introduzir fonte externa de despesas ou coluna Origem.
- Remover ou redesenhar a importação CSV/Excel.
- Reintroduzir exclusão em massa (“Deletar todas”).
- Alterar a taxonomia de Categorias / subcategorias de RH.
- Seletor explícito Pendente \| Pago no formulário.
- Pagamento parcial / múltiplos valores por conta.
- Identificação de Caixa nesta tela.
- Trocar o rótulo **Pagar** da listagem por **Recebido** (isso vale só para Contas a Receber).
- Redesign completo da página além do necessário para manter a lógica confirmada.
- Fluxo de comprovantes, salvo manter compatibilidade com contas criadas no formulário.
