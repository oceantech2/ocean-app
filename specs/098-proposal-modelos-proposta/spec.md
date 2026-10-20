# Feature Specification: Modelos de proposta no Proposal

**Feature Branch**: `098-proposal-modelos-proposta`

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: "Criar uma aba de modelos e lá poder filtrar por tipo (por exemplo outplacement, etc...) e depois na tela de nova proposta (o ideal seria na tela de nova proposta após selecionar Development & Outplacement aparecer um input na lateral para a pessoa poder selecionar qual modelo)"

## Contexto

Hoje, para aproveitar uma proposta parecida, o consultor abre uma proposta antiga e usa "Criar cópia". Isso depende de achar uma proposta boa na lista, traz dados do cliente antigo que precisam ser apagados e não há um conjunto "oficial" de pontos de partida por divisão (Executive Search, Offshore Talent, Outsourcing, Development & Outplacement).

Na tela de nova proposta, o campo que escolhe a divisão se chama hoje "Modelo (divisão)". Nesta feature, "modelo" passa a significar o **modelo de proposta** (ponto de partida pré-preenchido); a divisão continua sendo escolhida no mesmo campo.

## Clarifications

### Session 2026-10-20

- Q: O que um modelo guarda? → A: Uma proposta pré-preenchida inteira da divisão (escopo, projetos, investimentos, garantias), que vira o ponto de partida da nova proposta.
- Q: Quem pode criar, editar e excluir modelos? → A: Só administradores; os demais usuários do Proposal apenas consultam e usam.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Usar um modelo ao criar uma proposta (Priority: P1)

Na tela de nova proposta, depois de escolher a divisão (por exemplo, Development & Outplacement), aparece ao lado um seletor "Modelo" com os modelos daquela divisão. Ao escolher um, o formulário é preenchido com o conteúdo do modelo (idioma, moeda, setor, escopo, projetos e investimentos, shortlist, SLA, garantia e validade). O consultor só completa os dados do cliente e ajusta o que quiser antes de gerar a proposta.

**Why this priority**: É o ganho real de tempo — o consultor deixa de montar a proposta do zero ou de caçar uma proposta antiga para copiar.

**Independent Test**: Com pelo menos um modelo cadastrado para Development & Outplacement, abrir Nova proposta, escolher a divisão, selecionar o modelo e conferir que os campos foram preenchidos com o conteúdo do modelo; gerar a proposta e conferir que ela sai com esse conteúdo e com os dados do cliente digitados.

**Acceptance Scenarios**:

1. **Given** a tela de nova proposta com uma divisão que tem modelos, **When** o consultor abre o seletor "Modelo", **Then** vê só os modelos daquela divisão, em ordem alfabética, além da opção "Em branco".
2. **Given** um modelo selecionado, **When** o formulário é preenchido, **Then** idioma, moeda, setor, escopo, projetos com investimentos, shortlist, SLA, garantia e validade (em dias) vêm do modelo; empresa fica vazia, a data é a de hoje e os dados do consultor vêm do perfil de quem está criando.
3. **Given** o consultor já digitou algo no formulário, **When** escolhe outro modelo (ou "Em branco"), **Then** o sistema pede confirmação antes de substituir o conteúdo; se ele cancelar, nada muda.
4. **Given** a divisão escolhida não tem modelos, **When** a tela é exibida, **Then** o seletor "Modelo" não aparece (ou aparece desabilitado com o texto "Nenhum modelo para esta divisão").
5. **Given** o consultor troca a divisão depois de aplicar um modelo, **When** a nova divisão é escolhida, **Then** o modelo selecionado é desfeito e o seletor passa a listar os modelos da nova divisão.
6. **Given** uma proposta gerada a partir de um modelo, **When** o modelo é editado ou excluído depois, **Then** a proposta já gerada não muda.

---

### User Story 2 - Administrador cadastra e mantém modelos (Priority: P1)

O administrador acessa a aba "Modelos" no Proposal, cria um modelo escolhendo a divisão e dando um nome (por exemplo, "Outplacement executivo — 3 meses"), preenche o conteúdo com o mesmo formulário da proposta (sem os dados do cliente) e salva. Ele também edita e exclui modelos existentes.

**Why this priority**: Sem modelos cadastrados, a User Story 1 não tem o que oferecer; as duas formam o MVP.

**Independent Test**: Como admin, criar um modelo para cada divisão, editar um deles e excluir outro; conferir que a lista e o seletor da nova proposta refletem as mudanças.

**Acceptance Scenarios**:

1. **Given** o administrador na aba Modelos, **When** clica em "Novo modelo", escolhe a divisão, informa o nome e o conteúdo e salva, **Then** o modelo aparece na lista e passa a ser oferecido na nova proposta daquela divisão.
2. **Given** um modelo existente, **When** o administrador o edita e salva, **Then** as próximas propostas criadas a partir dele usam o conteúdo novo.
3. **Given** um modelo existente, **When** o administrador clica em Excluir e confirma, **Then** o modelo some da lista e do seletor; as propostas já geradas a partir dele continuam intactas.
4. **Given** um nome de modelo já usado na mesma divisão, **When** o administrador tenta salvar outro modelo com o mesmo nome nessa divisão, **Then** o sistema recusa e informa que o nome já existe.
5. **Given** um usuário que não é administrador, **When** abre a aba Modelos, **Then** consegue ver e filtrar os modelos, mas não vê os botões de criar, editar e excluir; tentativas por outro meio são negadas.
6. **Given** a criação, edição ou exclusão de um modelo, **When** alguém consulta a Auditoria do ERP, **Then** encontra quem fez, quando, a divisão e o nome do modelo.

---

### User Story 3 - Consultar e filtrar modelos (Priority: P2)

Qualquer usuário do Proposal abre a aba Modelos e filtra por divisão (Executive Search, Offshore Talent, Outsourcing, Development & Outplacement) e por nome, para conhecer os pontos de partida disponíveis e ver o conteúdo de cada um.

**Why this priority**: Ajuda a escolher o modelo certo, mas a escolha também pode ser feita direto no seletor da nova proposta.

**Independent Test**: Com modelos de várias divisões, filtrar por cada divisão e por trecho do nome, conferindo que só os modelos correspondentes aparecem.

**Acceptance Scenarios**:

1. **Given** a aba Modelos, **When** o usuário escolhe uma divisão no filtro, **Then** só aparecem os modelos dessa divisão.
2. **Given** a aba Modelos, **When** o usuário digita parte do nome (sem diferenciar maiúsculas), **Then** só aparecem os modelos cujo nome contém o texto.
3. **Given** a lista de modelos, **When** o usuário abre um modelo, **Then** vê o conteúdo completo e um atalho "Usar este modelo" que abre a nova proposta já com a divisão e o modelo selecionados.
4. **Given** filtros sem resultado, **When** aplicados, **Then** a lista mostra "Nenhum modelo encontrado com esses filtros".

---

### Edge Cases

- **Modelo com conteúdo que deixou de ser válido** (ex.: setor que não existe mais na divisão): ao aplicar, o campo inválido fica vazio e o consultor precisa preenchê-lo antes de gerar a proposta.
- **Modelo excluído enquanto outro usuário está com a nova proposta aberta**: o conteúdo já aplicado no formulário permanece; a proposta pode ser gerada normalmente.
- **Nova proposta via "Criar cópia"**: continua funcionando como hoje; o seletor de modelo começa em "Em branco" e escolher um modelo pede a mesma confirmação de substituição.
- **Modelo sem projetos preenchidos**: não é permitido salvar; o modelo exige o mesmo mínimo de conteúdo de uma proposta (pelo menos um projeto com um investimento), exceto os dados do cliente.
- **Imposto mensal**: o modelo não guarda imposto; a proposta gerada usa o imposto vigente no momento da geração, como hoje.
- **Divisão desativada/indisponível**: modelos de divisões que não aparecem na nova proposta também não aparecem no seletor.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O Proposal MUST ter uma aba "Modelos" acessível a todos os usuários do Proposal, ao lado da lista de propostas.
- **FR-002**: Um modelo MUST ter divisão, nome (único dentro da divisão) e o conteúdo de uma proposta da divisão: idioma, moeda, setor, escopo, projetos com investimentos (taxa, tipo de taxa e entrada), shortlist, SLA, garantia e validade em dias. Modelos MUST NOT guardar empresa, data da proposta nem dados do consultor.
- **FR-003**: Somente administradores MUST conseguir criar, editar e excluir modelos; tentativas de outros usuários MUST ser negadas.
- **FR-004**: O conteúdo do modelo MUST passar pelas mesmas validações da proposta da divisão (exceto empresa e data), para que uma proposta gerada a partir dele sem alterações seja válida assim que a empresa for informada.
- **FR-005**: A aba Modelos MUST permitir filtrar por divisão e por trecho do nome (sem diferenciar maiúsculas, caracteres tratados como literais), e mostrar mensagem própria quando não houver resultado.
- **FR-006**: Na nova proposta, depois de escolhida a divisão, MUST aparecer ao lado um seletor "Modelo" com "Em branco" e os modelos daquela divisão em ordem alfabética.
- **FR-007**: Ao aplicar um modelo, o formulário MUST receber o conteúdo do modelo, com empresa vazia, data de hoje e dados do consultor vindos do perfil de quem cria.
- **FR-008**: Trocar de modelo (inclusive para "Em branco") com o formulário já editado MUST pedir confirmação antes de substituir o conteúdo.
- **FR-009**: Trocar a divisão MUST desfazer a seleção de modelo e recarregar a lista do seletor para a nova divisão.
- **FR-010**: Propostas geradas a partir de um modelo MUST ser independentes dele: editar ou excluir o modelo não altera propostas existentes.
- **FR-011**: A exclusão de modelo MUST exigir confirmação e ser definitiva.
- **FR-012**: Criação, edição e exclusão de modelos MUST ser registradas na Auditoria do ERP com usuário, data/hora, divisão e nome do modelo.
- **FR-013**: A tela de um modelo MUST oferecer "Usar este modelo", que abre a nova proposta com a divisão e o modelo já selecionados.

### Key Entities

- **Modelo de proposta (novo)**: ponto de partida reutilizável de uma divisão; tem nome, divisão, conteúdo da proposta (sem dados do cliente e do consultor), quem criou/alterou por último e quando.
- **Proposta (existente)**: passa a poder nascer do conteúdo de um modelo; não guarda vínculo obrigatório com ele.
- **Registro de auditoria (existente)**: guarda a evidência de criação, edição e exclusão de modelos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um consultor gera uma proposta a partir de um modelo, informando só a empresa, em menos de 1 minuto.
- **SC-002**: 100% das propostas geradas a partir de um modelo sem alterações (além da empresa) são aceitas na primeira tentativa, sem erro de validação.
- **SC-003**: Editar ou excluir um modelo altera 0 propostas já geradas.
- **SC-004**: 0 criações, edições ou exclusões de modelo feitas por usuários não administradores; 100% delas registradas na Auditoria.

## Assumptions

- O seletor "Modelo" aparece para qualquer divisão que tenha modelos, não só Development & Outplacement (citado como exemplo).
- Para evitar confusão com "modelo de proposta", o campo de divisão na nova proposta passa a se chamar "Divisão"; o filtro "Modelo" da lista de propostas também passa a se chamar "Divisão".
- O formulário de modelo reutiliza o formulário da proposta, ocultando empresa, data e dados do consultor.
- Não há limite de quantidade de modelos por divisão; a lista da aba Modelos segue o padrão de 100 itens por página.
- A proposta não precisa registrar de qual modelo nasceu.
- Propostas simples (formato antigo com CNPJ e valor) não têm modelos.
