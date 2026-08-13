# Feature Specification: Contas a Receber — Subtítulo, Recebido e Caixa oculta

**Feature Branch**: `019-contas-receber-formulario`

**Created**: 2026-08-12

**Status**: Draft

**Input**: User description: "na tela de contas a receber - inserir subtítulo quando for lancamento manual também (e adicionar esse campo na modal) - no form de edição ta aparecendo lead condução e placement remover - remover tudo referente a caixa até na tabela, pode deixar salvo mas não apresentar ai e nos registros deixar fixo como corrente - o certinho esta como pagar tem que mudar para recebido e no modal permitir apenas data de pagamento o caixa sempre será corrente"

## Clarifications

### Session 2026-08-12

- Q: O que é o campo Subtítulo? → A: São os dados já existentes de **vaga** e **empresa**: **Vaga** é o **Título** e **Empresa** é o **Subtítulo**. Não é o campo Candidato nem um texto novo.
- Q: Como Título e Subtítulo aparecem na tabela? → A: Uma coluna só: **Título** em destaque e **Subtítulo** logo abaixo na mesma célula (somem as colunas separadas Vaga e Empresa).
- Q: Contas antigas com Caixa investimento? → A: Não converter em massa; investimento antigo permanece salvo (invisível nesta tela) e só vira **corrente** no próximo recebimento.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Título e subtítulo no lançamento manual (Priority: P1)

Administrador, ao criar ou editar uma conta a receber de **origem manual**, informa **Título** e **Subtítulo** no formulário (modal). Esses campos são os mesmos dados já usados no módulo:

| Rótulo na tela | Dado já existente |
|----------------|-------------------|
| **Título**     | Vaga (posição)    |
| **Subtítulo**  | Empresa (cliente / razão social) |

Em registro **Maggo**, título e subtítulo já vêm da fonte: aparecem no formulário em somente leitura, como os demais campos Maggo. O lançamento manual também passa a ter os dois no mesmo modal, com esses rótulos.

Na **listagem**, vaga e empresa deixam de ocupar colunas separadas. Há **uma coluna só**: o **Título** em destaque e o **Subtítulo** na linha de baixo, na mesma célula — inclusive nos lançamentos manuais.

**Why this priority**: Sem título e subtítulo no cadastro manual, o administrador não registra a conta com a mesma identificação que a Maggo já traz; os rótulos “Vaga” e “Empresa” não são os que o time usa nessa tela.

**Independent Test**: Abrir “Nova conta a receber”, preencher título e subtítulo (empresa obrigatória), salvar e reabrir a edição vendo os dois; na listagem, ver os dois na mesma célula; abrir um registro Maggo e ver título e subtítulo somente leitura.

**Acceptance Scenarios**:

1. **Given** um administrador no formulário **“Nova conta a receber”**, **When** o formulário abre, **Then** vê os campos **Título** (vaga) e **Subtítulo** (empresa), com os rótulos canônicos — não “Vaga” nem “Empresa” nesse formulário.
2. **Given** subtítulo (empresa) preenchido no cadastro manual, **When** o administrador salva e reabre a edição, **Then** título e subtítulo permanecem gravados e visíveis com esses rótulos.
3. **Given** um administrador editando um registro **manual**, **When** altera título e/ou subtítulo e salva, **Then** as alterações persistem.
4. **Given** um registro de origem **Maggo**, **When** o administrador abre a edição, **Then** vê **Título** e **Subtítulo** preenchidos pela fonte e **não** consegue alterá-los.
5. **Given** um registro Maggo **sem** título (vaga vazia), **When** é editado ou consultado, **Then** o título aparece vazio ou “—”, sem texto inventado; o subtítulo (empresa) continua o cliente da fonte.
6. **Given** cadastro manual **sem** subtítulo (empresa em branco), **When** o administrador tenta salvar, **Then** o sistema impede a gravação (empresa/subtítulo continua obrigatório).
7. **Given** um visualizador, **When** abre a edição/consulta, **Then** vê título e subtítulo (se houver) e não os altera.
8. **Given** a listagem com contas Maggo e manuais, **When** o usuário lê a tabela, **Then** há uma única coluna para identificação: **Título** em destaque e **Subtítulo** logo abaixo na mesma célula; **não** há colunas separadas **Vaga** e **Empresa**.
9. **Given** uma conta **sem** título (vaga vazia) e com subtítulo, **When** aparece na listagem, **Then** a célula mostra o subtítulo e o título vazio ou “—”, sem inventar vaga.

---

### User Story 2 - Marcar como recebido só com a data de pagamento (Priority: P1)

Na listagem, a ação rápida com o ícone de confirmação (o “certinho”) deixa de se chamar **Pagar**. O rótulo visível ao usuário (dica, nome acessível e título do modal) passa a ser **Recebido**. Ao acionar, o administrador informa **somente a data de pagamento**. Não escolhe Caixa: o sistema grava sempre **corrente**.

O mesmo vale no formulário de criação/edição quando o pagamento está **Recebido**: aparece a data de pagamento; **não** aparece seletor de Caixa.

**Why this priority**: A conta é a receber, não a pagar; exigir Caixa no ato do recebimento gera ruído e decisão que o negócio não quer mais nesta tela.

**Independent Test**: Em uma conta pendente, acionar Recebido, informar só a data, confirmar; recarregar e ver status recebido; confirmar ausência de campo Caixa no modal e no formulário.

**Acceptance Scenarios**:

1. **Given** uma conta pendente (não arquivada), **When** o administrador vê a ação rápida na listagem, **Then** o rótulo é **Recebido** (não **Pagar**).
2. **Given** o administrador aciona **Recebido**, **When** o modal abre, **Then** o único campo a preencher é **data de pagamento**; não há opção corrente/investimento nem qualquer rótulo de Caixa.
3. **Given** data de pagamento válida no modal Recebido, **When** confirma, **Then** a conta fica recebida, a data persiste e a Caixa gravada é **corrente** — sem o usuário ter escolhido.
4. **Given** o modal Recebido **sem** data de pagamento, **When** tenta confirmar, **Then** o sistema impede a gravação e pede a data.
5. **Given** um administrador criando ou editando com pagamento **Recebido**, **When** vê o formulário, **Then** informa a data de pagamento e **não** vê campo Caixa; ao salvar, a Caixa fica **corrente**.
6. **Given** conta já recebida, cancelada ou arquivada, **When** o administrador olha a ação Recebido, **Then** ela permanece indisponível (como a ação rápida já se comporta hoje para esses estados).
7. **Given** um visualizador, **When** consulta a listagem, **Then** não aciona Recebido.

---

### User Story 3 - Não ver Caixa em Contas a Receber (Priority: P1)

Qualquer usuário autenticado na página **Contas a Receber** deixa de ver identificação de Caixa: some a coluna da tabela, some o campo dos formulários (criação, edição e modal Recebido) e some da exportação gerada nessa página. O valor continua existindo nos registros (enriquecimento já gravado), mas **não é apresentado**. Em todo registro novo ou ao marcar como recebido, a Caixa fica **fixa como corrente**.

**Why this priority**: O pedido é retirar Caixa da operação diária nesta tela; deixar corrente fixo evita conta sem classificação nos demais usos do dado.

**Independent Test**: Abrir a listagem, criação, edição, modal Recebido e exportação da página; confirmar que Caixa não aparece; marcar uma conta como recebida e confirmar que o registro fica corrente sem o usuário ver essa escolha.

**Acceptance Scenarios**:

1. **Given** a listagem de Contas a Receber, **When** o usuário lê as colunas, **Then** **não** há coluna **Caixa** (nem rótulos Corrente/Investimento nessa tabela).
2. **Given** o formulário de criação ou edição, **When** o administrador preenche pagamento Pendente ou Recebido, **Then** **não** há campo Caixa.
3. **Given** a exportação a partir desta página, **When** o usuário exporta, **Then** o resultado **não** inclui coluna/campo de Caixa.
4. **Given** uma conta marcada como recebida (pelo modal ou pelo formulário), **When** o registro é gravado, **Then** a Caixa persistida é **corrente**.
5. **Given** uma conta antiga com Caixa **investimento** (ou vazia), **When** o usuário só consulta a listagem, **Then** a página carrega normalmente **sem** mostrar Caixa; não há migração visível nem bloqueio.
6. **Given** o administrador salva recebimento ou cria já recebida uma conta que antes tinha investimento ou Caixa vazia, **When** a gravação conclui, **Then** a Caixa passa a ser **corrente**.
7. **Given** uma conta já recebida com Caixa **investimento**, **When** o administrador edita só vencimento, NF ou título e salva, **Then** a Caixa permanece investimento (não é convertida).

---

### User Story 4 - Edição sem Lead, Condução e Placement (Priority: P2)

No formulário de **edição** de Contas a Receber, o administrador deixa de ver e de alterar **Lead**, **Condução** e **Placement**. Vínculos já gravados **permanecem salvos** (não são apagados por esta feature). Outras telas que já mostrem esses papéis (por exemplo relatórios) **não** entram no escopo.

**Why this priority**: Remove ruído do formulário desta tela; não muda o restante do produto.

**Independent Test**: Abrir a edição de uma conta (manual e Maggo) e confirmar ausência dos três campos; confirmar que criação também não os exibe.

**Acceptance Scenarios**:

1. **Given** um administrador editando qualquer conta a receber, **When** o formulário abre, **Then** **não** vê os campos **Lead**, **Condução** nem **Placement**.
2. **Given** uma conta que já tinha colaboradores vinculados, **When** o administrador salva outras alterações (por exemplo vencimento ou título), **Then** os vínculos anteriores **não** são apagados só por não aparecerem no formulário.
3. **Given** o formulário **“Nova conta a receber”**, **When** abre, **Then** também **não** exibe Lead, Condução nem Placement (continuam fora da criação).
4. **Given** um visualizador na consulta do registro, **When** vê o formulário, **Then** igualmente **não** vê esses três campos nesta página.

---

### Edge Cases

- Título (vaga) vazio no manual: gravação permitida (campo opcional, como a vaga já era); na listagem a célula mostra subtítulo e título vazio ou “—”.
- Listagem: não existem mais colunas distintas Vaga e Empresa; os dois textos compartilham uma célula (título em destaque, subtítulo abaixo).
- Título só com espaços: trata-se como vazio, sem gravar texto inventado.
- Subtítulo (empresa) vazio no manual: gravação **bloqueada** — continua obrigatório.
- Registro Maggo: título e subtítulo somente leitura; atualização da fonte pode alterar vaga/empresa Maggo sem apagar campos Ocean (NF, emissão, vencimento, pagamento).
- Campo **Candidato**, se ainda existir no registro, **não** é o subtítulo e **não** muda de significado nesta feature.
- Modal Recebido sem data: bloqueio com feedback claro; conta permanece pendente.
- Conta já recebida: ação Recebido indisponível; para mudar a data, usa-se a edição (pagamento Recebido + data), ainda sem campo Caixa.
- Conta arquivada ou cancelada: ação Recebido continua bloqueada.
- Pagamento Pendente na criação/edição: data de pagamento não se aplica; Caixa não aparece; o registro pode ficar sem Caixa até ser recebido, quando então fica corrente.
- Registro legado recebido sem Caixa ou com investimento: listagem não mostra Caixa; o valor antigo **permanece** até um **novo recebimento** (conta pendente marcada como Recebido, ou criação já recebida). Editar só vencimento, NF ou título **não** converte investimento para corrente.
- Visualizador: consulta listagem e dados permitidos; não cria, não edita, não marca Recebido.
- Falha ao salvar recebimento, título ou subtítulo: feedback claro; a listagem não mostra sucesso falso.
- Papéis admin/visualizador, arquivar, origem Manual/Maggo, NF opcional e tipos Retainer/Sucesso/Parcelamento **não** mudam de regra, salvo o que esta spec altera (rótulos título/subtítulo, ocultar Caixa, ocultar colaboradores na edição, rótulo Recebido).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Na página **Contas a Receber**, o sistema MUST exibir no formulário de **criação** e de **edição** o campo **Título** (dado de vaga/posição) e o campo **Subtítulo** (dado de empresa/cliente). Em origem **manual**, o administrador MUST poder informar e alterar os dois. Em origem **Maggo**, os dois MUST ser somente leitura.
- **FR-002**: Os rótulos canônicos desses campos nesta página MUST ser **Título** e **Subtítulo**. MUST NOT usar **Vaga** nem **Empresa** como rótulo desses campos no formulário. MUST NOT tratar o campo Candidato como subtítulo. **Subtítulo** (empresa) MUST permanecer **obrigatório** no cadastro manual. **Título** (vaga) MUST permanecer **opcional**.
- **FR-012**: Na listagem, o sistema MUST exibir **Título** e **Subtítulo** na **mesma célula** de uma única coluna (título em destaque, subtítulo na linha de baixo). MUST NOT manter colunas separadas **Vaga** e **Empresa**. A regra MUST valer para origem Maggo e manual.
- **FR-003**: A ação rápida da listagem que marca a conta como recebida MUST usar o rótulo **Recebido** (dica, nome acessível e título do modal). MUST NOT usar **Pagar** nessa ação.
- **FR-004**: O modal dessa ação MUST permitir informar **somente a data de pagamento**. MUST NOT exibir campo nem escolha de Caixa. Sem data, o salvamento MUST ser recusado.
- **FR-005**: Ao confirmar o recebimento (modal ou formulário com pagamento **Recebido**), o sistema MUST gravar a data informada e MUST gravar Caixa como **corrente**, sem escolha do usuário.
- **FR-006**: O sistema MUST NOT apresentar Caixa na listagem (sem coluna), nos formulários de criação e edição, no modal Recebido, nem na exportação gerada a partir desta página. O dado MAY permanecer armazenado.
- **FR-007**: O sistema MUST NOT permitir ao usuário escolher **investimento** (nem limpar Caixa) pela página Contas a Receber. MUST NOT converter em massa Caixa já gravada. Novos recebimentos (pendente → recebido) e criações já recebidas MUST gravar Caixa **corrente**. Conta já recebida com investimento MUST permanecer investimento até um novo recebimento; salvar outros campos MUST NOT alterar a Caixa.
- **FR-008**: O formulário de **edição** (e o de criação) MUST NOT exibir **Lead**, **Condução** nem **Placement**. O sistema MUST NOT apagar vínculos de colaboradores já gravados só porque esses campos saíram do formulário.
- **FR-009**: Usuários **visualizador** MUST NOT criar, editar nem marcar Recebido; MUST consultar a listagem sem ver Caixa nem os três campos de colaborador nesta página.
- **FR-010**: Regras já vigentes de status derivado, NF opcional, origem Manual/Maggo, arquivar, unicidade de NF e tipos **Retainer** / **Sucesso** / **Parcelamento** MUST permanecer, salvo o disposto nesta spec sobre título/subtítulo, Caixa e colaboradores na edição.
- **FR-011**: Contas já recebidas, canceladas ou arquivadas MUST continuar sem a ação Recebido disponível na listagem.

### Key Entities

- **Conta a Receber**: Receita a receber (manual ou Maggo), com grupo Maggo/equivalente e grupo Ocean (NF, emissão, vencimento, pagamento).
- **Título**: Identificação principal da conta; mesmo dado hoje chamado **vaga** (posição). Opcional no lançamento manual.
- **Subtítulo**: Identificação complementar da conta; mesmo dado hoje chamado **empresa** (cliente / razão social). Obrigatório no lançamento manual. **Não** é o campo Candidato.
- **Recebido**: Ação e estado de quitação da conta a receber; exige data de pagamento; não exige escolha de Caixa na interface.
- **Identificação de Caixa**: Continua associada ao registro internamente (**corrente** ou valor legado), mas **não é apresentada** em Contas a Receber; gravações novas de recebimento usam **corrente**.
- **Colaboradores (lead, condução, placement)**: Vínculos opcionais já existentes; deixam de ser exibidos ou editados nesta página; valores já salvos permanecem.
- **Usuário**: Admin (cria, edita, marca Recebido) ou visualizador (somente leitura).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrador informa título e subtítulo no cadastro manual e os reencontra na edição em 100% dos testes com dados válidos, em menos de 2 minutos na primeira tentativa.
- **SC-002**: Em 100% das inspeções do formulário (criação manual e edição Maggo/manual), os rótulos desses dois campos são **Título** e **Subtítulo**; em Maggo não são editáveis; subtítulo em branco no manual bloqueia o salvamento. Em 100% das inspeções da listagem, título e subtítulo estão na mesma célula e não há colunas Vaga e Empresa.
- **SC-003**: Em 100% das inspeções da listagem, a ação rápida diz **Recebido** (não **Pagar**); o modal correspondente pede só a data de pagamento.
- **SC-004**: Em 100% dos recebimentos de teste (modal ou formulário), a conta fica recebida com a data informada e Caixa **corrente**, sem o usuário ter visto ou escolhido Caixa.
- **SC-005**: Em 100% das inspeções de listagem, criação, edição, modal Recebido e exportação desta página, Caixa não aparece.
- **SC-006**: Em 100% das inspeções do formulário de edição (e criação), Lead, Condução e Placement não aparecem; em 100% dos testes de salvamento de outros campos, vínculos de colaboradores já existentes permanecem.
- **SC-007**: Visualizador não marca Recebido nem edita título/subtítulo em 100% das tentativas.
- **SC-008**: Em pelo menos 95% das tentativas de confirmar Recebido sem data, o usuário entende o bloqueio sem suporte técnico.

## Assumptions

- **Título** = vaga (posição) e **Subtítulo** = empresa (cliente). Não se criam campos novos; só mudam os rótulos na tela de Contas a Receber e o subtítulo entra no modal de lançamento manual (empresa já era obrigatória).
- **Candidato** não é o subtítulo e não muda de regra nesta feature.
- Obrigatoriedade permanece: subtítulo/empresa obrigatório; título/vaga opcional.
- Na listagem, uma coluna única agrupa título (destaque) e subtítulo (abaixo). Exportação desta página MAY continuar com dois campos (Título e Subtítulo) em colunas distintas no arquivo, pois não é a tabela da tela.
- Caixa **não é apagada** do registro; apenas deixa de ser apresentada nesta página. Recebimento novo (pendente → recebido) e criação já recebida **sempre** gravam **corrente**.
- Contas antigas com investimento ou sem Caixa **não** são migradas em massa. Investimento legado permanece até o **próximo recebimento**; edição de outros campos não força corrente.
- Lead, condução e placement saem **somente** da interface de Contas a Receber. Relatórios e outras telas que já usem esses vínculos **permanecem** como estão. Esta feature **não** desfaz vínculos já salvos.
- O vocabulário da ação é de **recebimento** (Recebido, data de pagamento), não de pagamento a fornecedor (Pagar).
- Papéis admin / visualizador, arquivar, origem e regras de NF/status das specs anteriores continuam válidos.
- Fluxo de Caixa como tela própria **não** é redesenhado nesta feature; o efeito prático é que novos recebimentos de Contas a Receber ficam classificados como corrente.

## Out of Scope

- Criar um campo de texto novo paralelo a vaga/empresa (ou reaproveitar Candidato como subtítulo).
- Apagar ou migrar em massa Caixa investimento já gravada, além da regra de gravar corrente no próximo recebimento.
- Reexibir ou tornar obrigatória a escolha corrente/investimento em Contas a Receber.
- Remover Lead, Condução e Placement de Relatórios, DH, Bônus ou outras telas.
- Apagar vínculos de colaboradores já existentes.
- Reintroduzir importação em lote, exclusão em massa/individual ou pasta de arquivos de NFs.
- Alterar nomes oficiais dos tipos (Retainer / Sucesso / Parcelamento) ou a posse Maggo vs Ocean dos demais campos.
- Redesign da página Fluxo de Caixa.
- Manter colunas separadas Vaga e Empresa na tabela de Contas a Receber (foram unificadas numa célula).
- Renomear Vaga/Empresa em Dashboard, Relatórios, DH ou Calendário (escopo só Contas a Receber).
