# Feature Specification: Modelo por seção na nova proposta

**Feature Branch**: `104-proposta-modelo-por-secao`

**Created**: 2026-11-13

**Status**: Draft

**Input**: User description: "Na hora de criar a proposta, a cada seção poder escolher qual o modelo o consultor quer dentro do Proposal. Um seletor por seção."

## Contexto

A feature 098 criou os **modelos de proposta**: pontos de partida pré-preenchidos por divisão (idioma, moeda, setor, escopo, projetos com investimentos, shortlist, SLA, garantia e validade). Na tela "Nova proposta", um único seletor "Modelo", ao lado de "Divisão", preenche o formulário **inteiro** com o conteúdo de um modelo.

Na prática, o consultor muitas vezes quer combinar modelos: o escopo de um, os projetos e investimentos de outro, as garantias de um terceiro. Hoje isso obriga a aplicar um modelo e redigitar o resto à mão.

Esta feature mantém o seletor geral e acrescenta **um seletor de modelo em cada seção** do formulário da nova proposta cujo conteúdo pode vir de um modelo. Cada seletor preenche só a sua seção.

### O que já existe (primeira versão, antes desta spec)

Uma primeira versão foi implementada sem spec. Ela colocou seletores em Apresentação, Escopo, Projetos, Garantias e condições e Validade. Falhas encontradas nela, que esta spec corrige:

- A seção **Cliente** ficou sem seletor, embora o modelo guarde o setor (não cumpre "um seletor por seção").
- Depois de aplicar um modelo numa seção e editar o conteúdo, o seletor continua mostrando aquele modelo, e escolher o mesmo modelo de novo **não faz nada**. O consultor não consegue restaurar o conteúdo original do modelo.
- O seletor continua afirmando que a seção "veio do modelo X" mesmo depois de o consultor alterar o conteúdo.

## Clarifications

### Session 2026-11-13

- Q: Quais seções recebem seletor? → A: Toda seção cujo conteúdo um modelo guarda: Apresentação, Cliente (só o setor), Escopo, Projetos, Garantias e condições e Validade. A seção Consultor não recebe seletor, porque modelos não guardam dados do consultor (regra da feature 098); esses dados vêm do perfil.
- Q: Na seção Cliente, quais modelos aparecem no seletor? → A: Só os modelos da divisão que têm setor definido; modelos com setor "escolhido em cada proposta" não têm o que oferecer para essa seção.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Preencher uma seção com outro modelo (Priority: P1)

Na nova proposta, o consultor escolhe a divisão e, opcionalmente, um modelo geral. Em seguida, no cabeçalho de qualquer seção (por exemplo, Projetos), abre o seletor de modelo da seção e escolhe outro modelo da mesma divisão. Só aquela seção é substituída pelo conteúdo do modelo escolhido; as demais ficam como estavam.

**Why this priority**: É o pedido central: combinar partes de modelos diferentes sem redigitar.

**Independent Test**: Com dois modelos A e B da mesma divisão, conteúdos diferentes em todas as seções: aplicar A no seletor geral, depois escolher B no seletor de Projetos. Conferir que só os projetos mudaram para os de B; gerar a proposta e conferir que ela sai com escopo, garantias e validade de A e projetos de B.

**Acceptance Scenarios**:

1. **Given** uma divisão com modelos, **When** a tela é exibida, **Then** cada uma das seções Apresentação, Cliente, Escopo, Projetos, Garantias e condições e Validade mostra um seletor de modelo no cabeçalho; a seção Consultor não mostra.
2. **Given** o seletor de uma seção, **When** o consultor o abre, **Then** vê os modelos da divisão escolhida, em ordem alfabética (na seção Cliente, só os que têm setor).
3. **Given** o consultor escolhe um modelo no seletor de uma seção, **When** o conteúdo é aplicado, **Then** só os campos daquela seção mudam:
   - Apresentação: idioma e moeda (textos padrão de shortlist e SLA acompanham o idioma, como na troca manual de idioma).
   - Cliente: setor (empresa e data não mudam).
   - Escopo: texto do escopo.
   - Projetos: lista de projetos com investimentos.
   - Garantias e condições: shortlist, SLA e garantia.
   - Validade: dias de validade.
4. **Given** a seção já tem conteúdo digitado ou vindo de outro modelo (escopo preenchido, algum projeto preenchido, garantias diferentes do padrão do idioma ou setor já escolhido), **When** o consultor escolhe um modelo na seção, **Then** o sistema pede confirmação antes de substituir; se ele cancelar, nada muda.
5. **Given** a seção está vazia ou só com valores padrão, **When** o consultor escolhe um modelo, **Then** o conteúdo é aplicado sem confirmação. Apresentação e Validade nunca pedem confirmação (são escolhas simples de desfazer).
6. **Given** uma proposta montada com seções de modelos diferentes, **When** o consultor gera a proposta, **Then** ela é criada com exatamente o conteúdo exibido no formulário, com as mesmas validações de qualquer proposta.

---

### User Story 2 - Saber de onde veio cada seção e restaurar o modelo (Priority: P2)

O seletor de cada seção mostra de qual modelo veio o conteúdo atual. Se o consultor editar a seção, o seletor volta a "Usar modelo…", indicando que o conteúdo não é mais o do modelo; escolher o mesmo modelo de novo restaura o conteúdo original.

**Why this priority**: Evita que o consultor ache que uma seção está igual ao modelo quando não está, e permite desfazer edições de uma seção sem perder as outras.

**Independent Test**: Aplicar o modelo A no seletor geral; conferir que todos os seletores de seção mostram A. Editar a garantia; conferir que o seletor de Garantias passa a "Usar modelo…" e os demais continuam em A. Escolher A no seletor de Garantias, confirmar e conferir que a garantia volta à do modelo.

**Acceptance Scenarios**:

1. **Given** o formulário preenchido pelo seletor geral com o modelo A, **When** a tela é exibida, **Then** os seletores de todas as seções mostram A.
2. **Given** uma seção com conteúdo de um modelo, **When** o consultor altera qualquer campo dessa seção, **Then** o seletor da seção passa a mostrar "Usar modelo…"; os seletores das outras seções não mudam.
3. **Given** uma seção editada depois de vir do modelo A, **When** o consultor escolhe A de novo no seletor da seção e confirma, **Then** o conteúdo da seção volta ao do modelo A e o seletor volta a mostrar A.
4. **Given** o consultor desfaz a própria edição deixando a seção igual à do modelo, **When** a tela é atualizada, **Then** o seletor volta a mostrar o modelo.

---

### Edge Cases

- **Divisão sem modelos**: nenhum seletor de seção aparece (o seletor geral continua com "Nenhum modelo para esta divisão").
- **Troca de divisão depois de aplicar modelos**: o conteúdo já aplicado permanece (como hoje no seletor geral); os seletores de seção passam a listar os modelos da nova divisão e mostram "Usar modelo…".
- **Modelo sem setor** (setor "escolhido em cada proposta"): não aparece no seletor da seção Cliente; nos demais seletores aparece normalmente. O seletor geral continua deixando o setor vazio nesse caso.
- **Modelo com setor que não existe mais**: não aparece no seletor da seção Cliente.
- **Modelo sem escopo**: aplicar na seção Escopo deixa o escopo vazio (a seção não aparece na proposta do cliente, como hoje).
- **Idiomas diferentes entre seções**: se as garantias vierem de um modelo em inglês e a apresentação estiver em português, os textos ficam como no modelo; o consultor decide.
- **Seletor geral depois de combinar seções**: escolher um modelo no seletor geral continua substituindo o formulário inteiro (com a confirmação já existente) e faz todos os seletores de seção mostrarem esse modelo.
- **Criar cópia de proposta**: os seletores de seção começam em "Usar modelo…"; escolher um modelo numa seção segue as mesmas regras de confirmação.
- **Editar proposta existente e cadastro de modelo**: não têm seletores de seção.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Na nova proposta, as seções Apresentação, Cliente, Escopo, Projetos, Garantias e condições e Validade MUST ter, cada uma, um seletor de modelo no cabeçalho, visível sempre que a divisão escolhida tiver ao menos um modelo elegível para a seção.
- **FR-002**: A seção Consultor MUST NOT ter seletor de modelo.
- **FR-003**: Cada seletor de seção MUST listar os modelos da divisão escolhida em ordem alfabética; o da seção Cliente MUST listar só modelos com setor válido.
- **FR-004**: Escolher um modelo no seletor de uma seção MUST substituir apenas os campos daquela seção, conforme a lista do cenário 3 da User Story 1, sem alterar nenhuma outra seção.
- **FR-005**: Substituir uma seção que já tem conteúdo (Cliente com setor escolhido, Escopo preenchido, algum projeto preenchido, Garantias diferentes do padrão do idioma) MUST pedir confirmação; cancelar MUST manter tudo como estava. Apresentação e Validade MUST ser substituídas sem confirmação.
- **FR-006**: O seletor de uma seção MUST mostrar o modelo de origem enquanto o conteúdo da seção for igual ao do modelo aplicado, e MUST mostrar "Usar modelo…" quando o conteúdo divergir (edição manual) ou quando nenhum modelo foi aplicado.
- **FR-007**: Escolher no seletor da seção o mesmo modelo que a preencheu, depois de o conteúdo ter sido editado, MUST restaurar o conteúdo do modelo (seguindo FR-005).
- **FR-008**: Ao aplicar um modelo pelo seletor geral, todos os seletores de seção MUST mostrar esse modelo.
- **FR-009**: Trocar a divisão MUST fazer os seletores de seção listarem os modelos da nova divisão, sem alterar o conteúdo já aplicado.
- **FR-010**: A proposta gerada MUST conter exatamente o conteúdo exibido no formulário e passar pelas mesmas validações de qualquer proposta; a proposta MUST NOT guardar de quais modelos vieram as seções.
- **FR-011**: Os seletores de seção MUST existir apenas na criação de proposta; as telas de editar proposta e de cadastro de modelo MUST NOT exibi-los.

### Key Entities

- **Modelo de proposta (existente, feature 098)**: fonte do conteúdo de cada seção; não muda.
- **Origem da seção (novo, só na tela)**: para cada seção, o modelo aplicado por último e o conteúdo que ele trouxe, usado para mostrar a origem e detectar edição. Não é gravado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um consultor monta uma proposta com seções de dois modelos diferentes, informando só a empresa, em menos de 1 minuto e sem redigitar conteúdo de modelo.
- **SC-002**: Em 100% das aplicações de modelo numa seção, nenhum campo de outra seção muda.
- **SC-003**: 100% das propostas montadas só com conteúdo de modelos (mais a empresa) são aceitas na primeira tentativa, sem erro de validação.
- **SC-004**: Em 100% dos casos em que a seção foi editada, o seletor deixa de indicar o modelo de origem.

## Assumptions

- O seletor geral "Modelo" continua existindo e funcionando como na feature 098; os seletores de seção complementam, não substituem.
- Os seletores de seção usam a mesma lista de modelos já carregada para o seletor geral; não há consulta nova.
- Não há mudança de dados gravados nem de regras do servidor: a proposta continua sendo enviada e validada como hoje.
- O conector do Claude (feature 103) não ganha "modelo por seção" nesta feature.
- Propostas simples (formato antigo) não têm modelos e não são afetadas.
