# Feature Specification: Modelos Offshore Talent e Outsourcing e Fotos de Capa por Setor

**Feature Branch**: `097-proposta-modelos-offshore-outsourcing`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "no proposal teremos novos modelos, implemente eles utilizando o fluxo do speckit, criei uma pasta chamada externos depois de implementar caso ela nao seja util pode remover @externo — nela há toda instrução etc..."

**Baseline**: O Proposal gera propostas por modelo (divisão) desde a feature `080`. Hoje existem dois modelos disponíveis, **Executive Search** (versão 3) e **Development & Outplacement** (versão 1, feature `083`), que compartilham o mesmo layout de página e os mesmos campos (empresa, data, setor, consultor, idioma, moeda, escopo, projetos com investimentos, Garantias e condições e validade em dias). O imposto exibido nas Observações vem do imposto mensal da feature `092`. Os setores disponíveis são cinco (Petróleo & Gás, Energia, Infraestrutura, Mineração e Indústria & Serviços) e **todos usam a mesma foto de capa** (Infraestrutura), porque as fotos por setor ainda não tinham sido enviadas.

A Ocean enviou, na pasta `externo/`, as instruções ao desenvolvedor (`Instrucoes_Desenvolvedor_Proposta_Comercial 4.md`), os HTML de referência das divisões **Offshore Talent** (`Proposta_Comercial_Offshore_Talent.html`) e **Outsourcing** (`Proposta_Comercial_Outsourcing.html`) e as fotos de capa de cinco setores. Segundo as instruções, os dois modelos têm **os mesmos campos e a mesma estrutura do Executive Search**; mudam apenas:

1. **Offshore Talent**: logo da divisão, primeira seção "Offshore Talent" com texto em dois parágrafos e a seção **Áreas e cargos** (5 áreas numeradas, cada uma com 4 cargos e "Entre outros") no lugar de Metodologia.
2. **Outsourcing**: logo da divisão, primeira seção "Outsourcing" com texto em dois parágrafos e a seção **Benefícios** (5 itens numerados, cada um com 2 ou 3 tópicos) no lugar de Metodologia.

Além disso, as instruções pedem:

3. **Setor novo "Tecnologia"**, na 5ª posição, antes de Indústria & Serviços, valendo para todas as divisões.
4. **Foto de capa por setor**: toda proposta, de qualquer divisão, exibe a foto do setor do cliente. Vieram cinco fotos, mas com os nomes de arquivo trocados em relação ao conteúdo; pelo conteúdo, são as de Petróleo & Gás (plataforma, no arquivo `industria-servicos.jpg`), Energia (turbinas eólicas, em `infraestrutura.jpg`), Infraestrutura (aeroporto, em `mineracao.jpg`, idêntica à foto padrão atual), Mineração (mina a céu aberto, em `oil-gas.jpg`) e Tecnologia (data center, em `energia.jpg`). A de **Indústria & Serviços não veio**.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar propostas Offshore Talent e Outsourcing (Priority: P1)

Na **Nova proposta**, o consultor escolhe o modelo entre **Executive Search**, **Offshore Talent**, **Outsourcing** e **Development & Outplacement**. Escolhido Offshore Talent ou Outsourcing, preenche os mesmos campos dos outros modelos e confirma. A proposta é criada e o link é exibido, como hoje.

**Why this priority**: É o pedido central: disponibilizar as duas divisões novas para gerar propostas.

**Independent Test**: Criar uma proposta Offshore Talent e outra Outsourcing com os dados de exemplo dos HTML (Arxen, 24/10/2026, Infraestrutura, Projeto 1 com Retainer 15% e 40% de entrada, Sucesso 18% sem entrada e Valor fechado R$ 50.000 com 50% de entrada, Projeto 2 com Retainer 15% e 40% de entrada, Garantia "4 meses", validade de 30 dias) e conferir que as duas são criadas, que o link é exibido e que a lista e o detalhe mostram o modelo correto.

**Acceptance Scenarios**:

1. **Given** o consultor abre **Nova proposta**, **When** a tela carrega, **Then** a lista de modelos mostra, nesta ordem, **Executive Search**, **Offshore Talent**, **Outsourcing** e **Development & Outplacement**, com Executive Search pré-selecionado.
2. **Given** o consultor troca o modelo para Offshore Talent ou Outsourcing antes de confirmar, **When** o formulário é atualizado, **Then** os dados já digitados são mantidos e a seção de escopo se chama "Escopo".
3. **Given** uma proposta Offshore Talent ou Outsourcing criada, **When** o consultor abre a lista, o filtro de modelo ou o detalhe, **Then** vê o nome do modelo ("Offshore Talent" ou "Outsourcing") e consegue filtrar por ele.
4. **Given** uma proposta existente desses modelos, **When** o consultor a edita ou cria uma cópia, **Then** valem as mesmas regras dos outros modelos (modelo somente leitura na edição; cópia com o mesmo modelo).
5. **Given** uma proposta desses modelos aceita pelo cliente, **When** o e-mail de aceite é enviado, **Then** ele identifica o modelo pelo nome da divisão.

---

### User Story 2 - Cliente recebe a proposta no layout Offshore Talent ou Outsourcing (Priority: P1)

O cliente abre o link e vê uma página igual ao HTML de referência da divisão: capa com a foto do setor e a logo da divisão, menu, primeira seção com o nome e o texto da divisão, seção do meio da divisão (**Áreas e cargos** ou **Benefícios**), **Escopo** (quando houver), **Investimento** com um bloco por projeto, **Garantias e condições**, "Vamos avançar?" com a validade, Contato e rodapé. O aceite usa o fluxo atual do Proposal.

**Why this priority**: É o que o cliente efetivamente vê.

**Independent Test**: Abrir em janela anônima o link de cada proposta criada na US1 e comparar com o HTML de referência preenchido com os mesmos dados: textos fixos, seções, ordem, cores e disposição iguais; nenhum marcador entre colchetes; aceitar a proposta e conferir que ela passa a Assinada.

**Acceptance Scenarios**:

1. **Given** uma proposta Offshore Talent, **When** o cliente abre o link, **Then** o menu mostra, nesta ordem: "Offshore Talent", "Áreas e cargos", "Escopo" (só com escopo), "Investimento", "Garantias e condições" e "Contato".
2. **Given** uma proposta Outsourcing, **When** o cliente abre o link, **Then** o menu mostra, nesta ordem: "Outsourcing", "Benefícios", "Escopo" (só com escopo), "Investimento", "Garantias e condições" e "Contato".
3. **Given** a primeira seção, **When** exibida, **Then** mostra o título da divisão e os dois parágrafos de apresentação do HTML de referência, como parágrafos separados.
4. **Given** a seção **Áreas e cargos** do Offshore Talent, **When** exibida, **Then** mostra as 5 áreas numeradas de 01 a 05 (Marítimo & Náutica, Máquinas & Engenharia, Subsea & ROV, Drilling, HSEQ & Projects), cada uma com os 4 cargos do HTML e o último item "Entre outros".
5. **Given** a seção **Benefícios** do Outsourcing, **When** exibida, **Then** mostra os 5 itens numerados de 01 a 05 (Flexibilidade de estrutura, Transferência da operação trabalhista, Velocidade para contratar, Gestão de headcount, Custo fixo vira custo por demanda) com os tópicos do HTML.
6. **Given** a seção **Investimento** dos dois modelos, **When** exibida, **Then** as Observações são: "Remuneração anual inclui 13º salário, adicional de férias e bônus (se aplicável). No modelo Retainer, a parcela inicial será calculada com base na remuneração estimada e a parcela final será calculada com base na remuneração praticada, descontando-se a parcela inicial;", "Valor mínimo de R$ 15.000,00 por projeto;" e a frase de impostos com o imposto gravado na proposta.
7. **Given** a seção **Garantias e condições** dos dois modelos, **When** exibida, **Then** segue o Executive Search: linhas vazias não aparecem e a caixa de Observações fixa (reposição sem custo, não abordagem por 12 meses, reembolso por contratação em 12 meses) aparece sempre, mesmo com as três linhas vazias.
8. **Given** a capa, **When** exibida, **Then** mostra a logo da divisão ("Ocean | OFFSHORE TALENT" ou "Ocean | OUTSOURCING") na mesma posição dos outros modelos e com o tamanho do HTML de referência.
9. **Given** a proposta em inglês, **When** o cliente abre o link, **Then** todo o conteúdo fixo da divisão aparece em inglês.
10. **Given** aceite, WhatsApp do consultor, Baixar PDF, celular e impressão, **When** usados, **Then** funcionam exatamente como no Executive Search.

---

### User Story 3 - Foto de capa por setor e setor Tecnologia (Priority: P2)

Em todas as divisões, o consultor escolhe o setor do cliente, agora com a opção **Tecnologia**, e a capa da proposta mostra a foto daquele setor.

**Why this priority**: É regra das instruções para as quatro divisões, mas a proposta já funciona com a foto padrão.

**Independent Test**: Para cada um dos 4 modelos, criar uma proposta em cada um dos 6 setores (24 combinações) e conferir que a capa mostra a foto do setor escolhido e que o PDF mostra a mesma foto.

**Acceptance Scenarios**:

1. **Given** o campo Setor do formulário, **When** aberto, **Then** mostra, nesta ordem: Petróleo & Gás, Energia, Infraestrutura, Mineração, Tecnologia e Indústria & Serviços.
2. **Given** uma proposta de qualquer modelo com setor Petróleo & Gás, Energia, Infraestrutura, Mineração ou Tecnologia, **When** o cliente abre o link, **Then** a capa mostra a foto desse setor.
3. **Given** uma proposta com setor Indústria & Serviços, **When** o cliente abre o link, **Then** a capa mostra a foto padrão (Infraestrutura) até a foto de Indústria & Serviços ser disponibilizada.
4. **Given** a foto do setor não carrega, **When** a capa é exibida, **Then** mostra a foto padrão (Infraestrutura) em vez de ficar sem foto.
5. **Given** uma proposta com setor Tecnologia, **When** o consultor abre o detalhe ou o histórico de edições, **Then** o setor aparece como "Tecnologia".

---

### Edge Cases

- **Propostas já existentes** (Executive Search e Development & Outplacement, inclusive assinadas): passam a exibir a foto do seu setor na capa; textos, valores e campos não mudam.
- **Indústria & Serviços sem foto**: a capa usa a foto padrão; quando a foto chegar, basta disponibilizá-la sem mudar as propostas.
- **Logo da divisão indisponível**: a capa mantém o fundo e os textos legíveis, sem imagem quebrada aparente (regra atual).
- **Escopo vazio**: a seção "Escopo" e o link do menu não aparecem, como nos outros modelos.
- **Proposta em Dólar**: as Observações que citam o valor mínimo mantêm o valor em reais, apenas traduzidas conforme o idioma (regra da `083`).
- **Celular**: as 5 áreas/benefícios ficam empilhadas e legíveis sem zoom; no computador ficam em grade de 3 colunas (3 + 2), como no HTML.
- **Impressão**: cada área/benefício não é cortado entre páginas (regra da `087`).

## Requirements *(mandatory)*

### Functional Requirements

**Modelos novos**

- **FR-001**: A lista de modelos da **Nova proposta**, o filtro da lista e os nomes exibidos MUST incluir **Offshore Talent** (`offshore-talent`) e **Outsourcing** (`outsourcing`), na ordem Executive Search, Offshore Talent, Outsourcing, Development & Outplacement, com Executive Search pré-selecionado.
- **FR-002**: Os dois modelos MUST ter os mesmos campos, validações e regras de criação, edição, cópia, histórico, aceite, expiração e cancelamento dos modelos atuais no formato novo (vários projetos, Garantias e condições em texto livre, validade em dias, idioma e moeda independentes, imposto mensal).
- **FR-003**: A página do cliente de cada modelo MUST reproduzir o HTML de referência da divisão: mesmas seções e ordem, textos fixos, identidade visual, navegação, responsividade e versão para impressão, com os dados da proposta no lugar dos marcadores.
- **FR-004**: O conteúdo fixo do **Offshore Talent** MUST ser: título da primeira seção e do primeiro link "Offshore Talent"; os dois parágrafos de apresentação do HTML; seção **Áreas e cargos** com as 5 áreas numeradas e os seus cargos (último item "Entre outros"); título de escopo "Escopo"; logo da divisão.
- **FR-005**: O conteúdo fixo do **Outsourcing** MUST ser: título da primeira seção e do primeiro link "Outsourcing"; os dois parágrafos de apresentação do HTML; seção **Benefícios** com os 5 itens numerados e os seus tópicos; título de escopo "Escopo"; logo da divisão.
- **FR-006**: Nos dois modelos, as Observações de Investimento MUST ser as do HTML de referência (primeiro item único sobre remuneração anual e Retainer; "Valor mínimo de R$ 15.000,00 por projeto;"), seguidas da frase de impostos com o percentual gravado na proposta (feature `092`), e as Observações de Garantias e condições MUST ser as mesmas do Executive Search, com a seção sempre visível.
- **FR-007**: O conteúdo fixo das duas divisões MUST existir em português e em inglês (tradução inicial feita pela equipe de desenvolvimento, revisável pela Ocean). "Offshore Talent", "Outsourcing", "Subsea & ROV", "Drilling", "HSEQ & Projects" e nomes de cargos já em inglês no original (ex.: "Reliability Engineer", "OIM", "DPO") não são traduzidos.
- **FR-008**: A primeira seção MUST exibir cada parágrafo de apresentação da divisão como parágrafo separado; os modelos existentes, de um parágrafo só, continuam iguais.
- **FR-009**: A logo de cada divisão MUST aparecer na capa na mesma posição das outras divisões, com a largura do HTML de referência no computador e a mesma largura reduzida das outras divisões no celular.

**Setores e foto de capa (todas as divisões)**

- **FR-010**: A lista de setores MUST ter 6 opções, nesta ordem: Petróleo & Gás, Energia, Infraestrutura, Mineração, **Tecnologia** (`tecnologia`) e Indústria & Serviços. O setor continua obrigatório.
- **FR-011**: A capa da página do cliente MUST exibir a foto do setor da proposta, em qualquer divisão. Setores sem foto disponível (hoje, Indústria & Serviços) MUST exibir a foto padrão (Infraestrutura).
- **FR-012**: Se a foto do setor não carregar, a capa MUST exibir a foto padrão; a camada azul-marinho da capa continua igual em todos os setores, sem filtro extra nas fotos.

**Compatibilidade**

- **FR-013**: Os conteúdos fixos do Executive Search e do Development & Outplacement MUST continuar sem mudança.
- **FR-014**: Propostas existentes MUST continuar com os mesmos dados, versões e provas de aceite; a única mudança visível é a foto de capa do seu setor (FR-011).

### Key Entities

- **Modelo de proposta (divisão)** (existente): passa a ter quatro modelos disponíveis, com os novos **Offshore Talent** (`offshore-talent`) e **Outsourcing** (`outsourcing`), cada um na versão 1. O conteúdo fixo de cada divisão (logo, título, texto de apresentação, seção do meio, título do escopo, Observações) existe em português e inglês.
- **Setor** (existente): ganha a opção **Tecnologia**; cada setor passa a ter a sua foto de capa, com a de Infraestrutura como padrão.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em comparação lado a lado com o HTML de referência preenchido com os mesmos dados de exemplo, as páginas Offshore Talent e Outsourcing não apresentam diferença perceptível de textos, seções, ordem, cores ou disposição, no computador e no celular, além das adições já existentes nos outros modelos (frase de validade, "Atualizada em", indicação de assinada).
- **SC-002**: Um consultor cria uma proposta Offshore Talent ou Outsourcing no mesmo tempo que uma Executive Search (menos de 4 minutos com 2 projetos), sem campo novo para aprender.
- **SC-003**: Nas 24 combinações de modelo e setor, a capa mostra a foto do setor escolhido (ou a padrão, para Indústria & Serviços) em 100% dos casos, na tela e no PDF.
- **SC-004**: 100% das propostas existentes continuam com o mesmo conteúdo de texto e valores e com as provas de aceite válidas.

## Assumptions

- **Identificadores e versão**: `offshore-talent` e `outsourcing`, como no atributo `data-template` dos HTML; os dois começam na versão 1 e já nascem no formato novo da `083`.
- **Logos**: usam as logos brancas embutidas nos HTML de referência até a Ocean enviar os SVG oficiais (as instruções preveem a troca). O texto alternativo será "Ocean Talent Solutions — Offshore Talent" e "Ocean Talent Solutions — Outsourcing" (os HTML trazem "Executive Search" por engano).
- **Impostos**: os HTML trazem "Impostos (18,5%)" fixo, mas o Proposal já usa o imposto mensal gravado em cada proposta (feature `092`, "Impostos (até X%)"); os modelos novos seguem o Proposal.
- **Executive Search**: as instruções citam o primeiro item das Observações de Investimento como um item único; o Executive Search atual tem esse texto em dois itens. Como mudar o texto do Executive Search alteraria propostas já aceitas, ele fica fora do escopo; os modelos novos usam o texto único dos seus HTML.
- **Fotos por setor**: atribuídas pelo conteúdo da imagem, não pelo nome do arquivo (os nomes vieram trocados; a de Infraestrutura confirma, por ser idêntica à foto padrão já em uso). A foto de Indústria & Serviços não veio e usa a padrão até ser enviada.
- **Hospedagem das fotos**: as fotos ficam junto com os arquivos públicos do Proposal, como a foto padrão e as logos atuais.
- **Aceite**: os HTML trazem um aceite provisório por e-mail ou ERP; como nos outros modelos, vale o aceite do Proposal (nome completo, e-mail e declaração, com e-mail de aceite da `095`).
- **Escopo**: continua um único campo por proposta (ponto em aberto 3 das instruções, mantido como na `083`).
- **Pasta `externo/`**: depois de copiados os arquivos úteis (logos e fotos) para o Proposal, a pasta pode ser removida, conforme pedido do usuário.
