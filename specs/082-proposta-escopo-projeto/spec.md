# Feature Specification: Escopo do Projeto e Título da Divisão na Proposta (Executive Search)

**Feature Branch**: `082-proposta-escopo-projeto`

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "siga o fluxo do speckit para fazer essa correção nova @Proposta_Comercial_Executive_Search (1).html"

**Baseline**: As features `080-proposta-modelo-executive-search` e `081-proposta-idioma-moeda` (já na `main`) geram a página do cliente no layout do modelo Executive Search, em português (Real) ou inglês (Dólar). A Ocean enviou uma nova versão do modelo (`Proposta_Comercial_Executive_Search (1).html`) e das instruções ao desenvolvedor (`Instrucoes_Desenvolvedor_Proposta_Comercial 2.md`). Comparadas com as versões usadas na 080, há exatamente duas mudanças:

1. **Título da primeira seção**: a seção que hoje se chama "Serviço" (e o link "Serviço" do menu) passa a exibir o **nome do serviço da divisão**, ou seja, "Executive Search" neste modelo. O título muda junto com o modelo (divisão).
2. **Nova seção opcional "Escopo do Projeto"**: fica logo abaixo de Metodologia, com link próprio no menu. O consultor escreve em texto livre, com parágrafos, lista numerada, lista com marcadores (inclusive dentro de um item da lista numerada) e negrito. Se o campo ficar vazio, a seção e o link do menu não aparecem.

Todo o restante do modelo (textos, cores, demais seções, campos e regras) continua igual.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultor descreve o escopo do projeto na proposta (Priority: P1)

Ao criar ou editar uma proposta Executive Search, o consultor encontra o campo opcional **Escopo do Projeto**, logo após o Nome do projeto. Nele, escreve um texto livre e pode formatá-lo com parágrafos, lista numerada, lista com marcadores (inclusive uma lista com marcadores dentro de um item numerado) e negrito, sem precisar conhecer nenhuma linguagem de marcação. O campo pode ficar vazio.

**Why this priority**: É o pedido novo do modelo e o único campo acrescentado ao formulário. Sem ele, não há como o cliente ver o escopo.

**Independent Test**: Criar uma proposta Executive Search preenchendo o Escopo do Projeto com o exemplo do modelo (projeto OceanPact CBO: um parágrafo de abertura, uma lista numerada de 3 itens e, dentro do item 2, uma lista com marcadores de 2 itens que começam com um trecho em negrito) e conferir que a proposta é criada e que o detalhe mostra o escopo com a mesma formatação.

**Acceptance Scenarios**:

1. **Given** o formulário de uma proposta Executive Search, **When** exibido, **Then** há o campo **Escopo do Projeto** após o Nome do projeto, identificado como opcional.
2. **Given** o campo Escopo do Projeto, **When** o consultor escreve, **Then** pode criar parágrafos, lista numerada, lista com marcadores, lista com marcadores dentro de um item da lista numerada e trechos em negrito, por meio de comandos visíveis no próprio campo, vendo a formatação enquanto escreve.
3. **Given** o campo Escopo do Projeto vazio, **When** o consultor confirma a proposta, **Then** a proposta é criada normalmente, sem erro.
4. **Given** o consultor cola no campo um texto copiado de outro documento (ex.: Word, e-mail), **When** o texto é colado, **Then** são mantidos apenas parágrafos, listas e negrito; qualquer outra formatação (cores, fontes, tamanhos, tabelas, imagens, links) é descartada e o texto permanece.
5. **Given** uma proposta Executive Search pendente com escopo, **When** o consultor aciona **Editar**, **Then** o campo vem preenchido com o escopo atual e a formatação, e pode ser alterado ou apagado, seguindo as regras de edição antes da assinatura (spec 079).
6. **Given** uma edição que altera, inclui ou apaga o escopo, **When** salva, **Then** o histórico de edições registra a mudança do Escopo do Projeto com o valor anterior e o novo valor.
7. **Given** uma proposta Executive Search, **When** o consultor aciona **Criar cópia**, **Then** o escopo é copiado com a formatação.
8. **Given** o detalhe de uma proposta, **When** exibido, **Then** mostra o Escopo do Projeto formatado, ou indica que não foi informado.
9. **Given** o consultor ultrapassa o tamanho máximo do escopo, **When** tenta confirmar, **Then** o sistema bloqueia e indica o limite no campo.

---

### User Story 2 - Cliente vê a seção "Escopo do Projeto" quando há escopo (Priority: P1)

O cliente abre o link e, quando a proposta tem escopo, vê a seção **Escopo do Projeto** logo abaixo de Metodologia, com o texto formatado exatamente como o consultor escreveu, no estilo do modelo, e um link **Escopo do Projeto** no menu, entre Metodologia e Investimento. Sem escopo, a seção e o link não aparecem e a página fica como hoje.

**Why this priority**: É o que o cliente efetivamente vê do novo campo; sem esta parte, o campo não tem efeito.

**Independent Test**: Abrir em janela anônima a proposta criada no teste da US1 e comparar com o modelo novo preenchido com o exemplo OceanPact CBO: seção na mesma posição, mesmo estilo de listas, numeração e negrito; link no menu leva à seção. Abrir em seguida uma proposta sem escopo e conferir que nem a seção nem o link aparecem.

**Acceptance Scenarios**:

1. **Given** uma proposta com escopo, **When** o cliente abre o link, **Then** vê a seção "Escopo do Projeto" entre Metodologia e Investimento, com parágrafos, listas numeradas, listas com marcadores (inclusive aninhadas) e negrito no estilo do modelo.
2. **Given** uma proposta com escopo, **When** o cliente olha o menu, **Then** vê o link "Escopo do Projeto" entre "Metodologia" e "Investimento", e ao acioná-lo a página rola até a seção.
3. **Given** uma proposta sem escopo (vazio ou só com espaços e linhas em branco), **When** o cliente abre o link, **Then** a seção e o link do menu não aparecem, e as demais seções seguem sem espaço vazio no lugar.
4. **Given** uma proposta em dólar (inglês) com escopo, **When** o cliente abre o link, **Then** o título da seção e o link do menu aparecem como "Project Scope", e o texto do escopo aparece exatamente como o consultor escreveu, sem tradução.
5. **Given** uma proposta com escopo, **When** o cliente aciona **Baixar PDF**, **Then** a seção Escopo do Projeto aparece na impressão com a mesma formatação.
6. **Given** uma proposta com escopo, **When** aberta no celular, **Then** o texto e as listas são legíveis sem zoom e não ultrapassam a largura da tela.
7. **Given** um escopo com caracteres especiais (aspas, apóstrofo, `<`, `&`), **When** exibido, **Then** aparecem exatamente como digitados, sem quebrar a página nem executar conteúdo.

---

### User Story 3 - Primeira seção com o nome do serviço da divisão (Priority: P2)

Na página do cliente, a primeira seção e o primeiro link do menu deixam de se chamar "Serviço" e passam a exibir o nome do serviço da divisão: "Executive Search" no modelo atual. Quando houver outras divisões, cada uma exibirá o próprio nome.

**Why this priority**: É uma correção de texto pequena e visível, alinhada ao modelo novo, mas não muda dados nem fluxo.

**Independent Test**: Abrir o link de uma proposta Executive Search em real e outra em dólar e conferir que o primeiro link do menu e o título da primeira seção mostram "Executive Search" nas duas.

**Acceptance Scenarios**:

1. **Given** uma proposta Executive Search pendente em real, **When** o cliente abre o link, **Then** o primeiro link do menu e o título da primeira seção mostram "Executive Search" em vez de "Serviço".
2. **Given** uma proposta Executive Search pendente em dólar, **When** o cliente abre o link, **Then** o primeiro link do menu e o título da primeira seção mostram "Executive Search" em vez de "Service".
3. **Given** o primeiro link do menu, **When** acionado, **Then** continua levando à primeira seção, como hoje.

---

### Edge Cases

- **Propostas já assinadas antes desta feature**: continuam exibindo exatamente o conteúdo que o cliente aceitou (título "Serviço"/"Service" e sem seção de escopo), conforme a regra da spec 080 (FR-025).
- **Propostas pendentes criadas antes desta feature**: passam a exibir o título "Executive Search" na primeira seção; como não têm escopo, a seção Escopo do Projeto não aparece. O consultor pode editá-las para incluir o escopo.
- **Propostas simples** (formato da 077): não têm escopo nem a nova seção; continuam como hoje.
- **Escopo só com espaços, linhas em branco ou listas vazias**: tratado como vazio; a seção e o link do menu não aparecem.
- **Escopo muito longo**: limite de 5.000 caracteres de texto (sem contar a formatação); a seção cresce sem sobrepor outras seções, no computador, no celular e na impressão.
- **Item de lista muito longo ou palavra sem espaços** (ex.: um endereço extenso): quebra linha sem ultrapassar a largura da página.
- **Formatação não suportada** colada ou digitada (títulos, cores, links, tabelas, imagens, sublinhado, itálico): é descartada, preservando o texto.
- **Listas em mais de dois níveis**: apenas dois níveis são suportados (lista numerada com lista com marcadores dentro, ou lista com marcadores simples); níveis mais profundos são achatados para o segundo nível, preservando o texto.
- **Edição que apaga o escopo de uma proposta pendente**: a seção e o link desaparecem da página do cliente na próxima abertura.

## Requirements *(mandatory)*

### Functional Requirements

**Campo Escopo do Projeto**

- **FR-001**: O formulário de proposta Executive Search MUST ter o campo opcional **Escopo do Projeto**, posicionado após o Nome do projeto.
- **FR-002**: O campo MUST aceitar texto livre com estas formatações, e somente estas: parágrafos, lista numerada, lista com marcadores, lista com marcadores dentro de um item da lista numerada e negrito.
- **FR-003**: O consultor MUST conseguir aplicar as formatações do FR-002 por comandos visíveis no próprio campo, vendo o resultado enquanto escreve, sem digitar marcação.
- **FR-004**: Ao colar conteúdo de outra fonte, o campo MUST manter o texto e apenas as formatações do FR-002, descartando qualquer outra.
- **FR-005**: O escopo MUST ter no máximo 5.000 caracteres de texto (sem contar a formatação); acima disso, o sistema MUST bloquear a confirmação e indicar o limite no campo.
- **FR-006**: Um escopo sem texto visível (vazio, só espaços, linhas em branco ou listas vazias) MUST ser tratado como vazio.
- **FR-007**: O escopo MUST seguir as regras já existentes da proposta: é salvo na criação, pode ser alterado ou apagado na edição antes da assinatura (spec 079), é copiado com a formatação em **Criar cópia** e é exibido formatado no detalhe da proposta.
- **FR-008**: O histórico de edições MUST registrar alterações do Escopo do Projeto (inclusão, alteração e remoção) com o valor anterior e o novo valor, em forma legível ao usuário.
- **FR-009**: O servidor MUST aceitar e guardar apenas as formatações do FR-002, descartando qualquer outra marcação recebida, mesmo que enviada fora do formulário.

**Página do cliente — Escopo do Projeto**

- **FR-010**: Quando a proposta tiver escopo, a página do cliente MUST exibir a seção "Escopo do Projeto" entre Metodologia e Investimento, com o estilo do modelo novo (numeração e marcadores nas cores do modelo, negrito no tom dos títulos, espaçamento entre itens e largura de leitura do modelo).
- **FR-011**: Quando a proposta tiver escopo, o menu MUST exibir o link "Escopo do Projeto" entre "Metodologia" e "Investimento", levando à seção.
- **FR-012**: Quando a proposta não tiver escopo (FR-006), a seção e o link do menu MUST NÃO aparecer, sem deixar espaço vazio no layout.
- **FR-013**: Na página em inglês (moeda Dólar), o título da seção e o link do menu MUST aparecer como "Project Scope"; o texto do escopo MUST aparecer exatamente como digitado, sem tradução.
- **FR-014**: O escopo MUST ser exibido somente com as formatações do FR-002 e todo o texto MUST aparecer de forma literal, sem interpretar marcação ou scripts além dessas formatações.
- **FR-015**: A seção Escopo do Projeto MUST aparecer na versão para impressão (PDF) e MUST ser legível no celular, como as demais seções.

**Página do cliente — Título da primeira seção**

- **FR-016**: O título da primeira seção e o primeiro link do menu MUST exibir o nome do serviço da divisão do modelo: "Executive Search" para o modelo atual, em português e em inglês.
- **FR-017**: O nome do serviço exibido MUST fazer parte do conteúdo fixo de cada divisão, de modo que divisões futuras exibam o próprio nome sem mudar o formulário.

**Integridade e compatibilidade**

- **FR-018**: A impressão digital do conteúdo aceito MUST incluir o Escopo do Projeto, de forma que seja possível demonstrar exatamente o escopo aceito pelo cliente.
- **FR-019**: Propostas assinadas antes desta feature MUST continuar exibindo o conteúdo do modelo vigente na assinatura (título "Serviço"/"Service" e sem seção de escopo).
- **FR-020**: Propostas Executive Search pendentes criadas antes desta feature MUST passar a usar o modelo novo, sem escopo, até que o consultor as edite. Propostas simples MUST continuar sem mudança.

### Key Entities

- **Proposta** (existente): as propostas Executive Search passam a ter o **Escopo do Projeto**, texto formatado opcional (parágrafos, listas numeradas, listas com marcadores e negrito), com até 5.000 caracteres de texto. Faz parte do conteúdo aceito pelo cliente e do histórico de edições.
- **Modelo de proposta (divisão)** (existente): passa a ter, no conteúdo fixo, o **nome do serviço da divisão** exibido no título da primeira seção e no menu ("Executive Search" no modelo atual). O conteúdo fixo ganha também o título da seção opcional "Escopo do Projeto" em cada idioma.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O consultor reproduz o exemplo de escopo do modelo (OceanPact CBO, com lista numerada, lista com marcadores aninhada e negrito) em menos de 3 minutos, sem digitar marcação.
- **SC-002**: Em comparação lado a lado com o modelo novo preenchido com o mesmo exemplo, a seção Escopo do Projeto não apresenta diferença perceptível de posição, textos, numeração, marcadores, negrito ou espaçamento, no computador e no celular.
- **SC-003**: Em 100% das propostas sem escopo, nem a seção nem o link do menu aparecem.
- **SC-004**: Em 100% das propostas Executive Search pendentes, o primeiro link do menu e o título da primeira seção mostram "Executive Search", em português e em inglês.
- **SC-005**: Em 100% das propostas aceitas com escopo, é possível demonstrar exatamente o escopo aceito.
- **SC-006**: 100% das propostas assinadas antes desta feature continuam abrindo exatamente como foram aceitas.

## Assumptions

- **Origem das mudanças**: as únicas diferenças entre o modelo usado na 080 e o modelo novo são o título da primeira seção ("Serviço" → nome da divisão) e a seção opcional Escopo do Projeto, com seu estilo e seu link no menu. Nenhum outro texto, cor ou seção muda.
- **Tradução**: "Project Scope" é a tradução inicial do título da seção, feita pela equipe de desenvolvimento, como as demais da 081; a Ocean pode ajustá-la no conjunto de traduções. "Executive Search" é nome de serviço e não é traduzido.
- **Escopo não traduzido**: o texto do escopo é dado do consultor; numa proposta em dólar, o consultor o escreve diretamente em inglês.
- **Limite de tamanho**: 5.000 caracteres de texto bastam para escopos como o do exemplo (cerca de 600 caracteres) com folga; o limite evita propostas desproporcionais.
- **Níveis de lista**: dois níveis atendem ao modelo (lista com marcadores dentro de um item numerado); mais níveis ficam fora do escopo.
- **Posição no formulário**: o campo fica junto do Nome do projeto, porque ambos descrevem o projeto da proposta.
- **Pré-visualização**: continua pela ação existente **Abrir página do cliente**; não há pré-visualização antes de confirmar.
- **Lista de propostas**: não exibe o escopo; ele aparece no formulário, no detalhe e na página do cliente.
- **Permissões, status, validade, moeda, aceite e envio do link**: seguem as specs 077, 079, 080 e 081 sem mudança.
