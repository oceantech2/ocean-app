# Feature Specification: Blocos inteiros por página no PDF da proposta

**Feature Branch**: `087-proposta-pdf-quebra-pagina`

**Created**: 2026-10-08

**Status**: Draft

**Input**: User description: "no proposal o PDF pra baixar ta vindo meio quebrado. Será que tem como deixar as seções juntas, por exemplo criamos o bloco de especialista fiscal, ai esse bloco ele esta dividido entre as 2 telas, deveria ficar na mesma"

**Baseline**: Na página pública da proposta (modelos Executive Search e Development & Outplacement), o botão **Baixar PDF** gera o documento pela impressão do navegador. Hoje só as seções inteiras e alguns cartões pedem para não serem divididos. Quando a seção é maior que o espaço restante da página (ex.: **Investimento** com vários projetos, como "Especialista Fiscal"), o navegador divide a seção em qualquer ponto: o nome de um projeto fica numa página e seus cartões de investimento na seguinte, ou um cartão é cortado ao meio. Complementa `080`, `082` e `083`.

## Clarifications

### Session 2026-10-08

- Q: Quando um bloco não cabe no espaço que sobra na página, o que acontece? → A: O bloco inteiro vai para a **próxima página**; o espaço em branco no fim da página anterior é aceitável
- Q: E se um único bloco for maior que uma página inteira (ex.: Escopo longo)? → A: Ele pode ser dividido, mas só **entre** seus itens (parágrafos, itens de lista), nunca no meio de um item, e o título nunca fica sozinho no fim da página
- Q: Cada seção deve começar numa página nova? → A: **Não**; seções curtas continuam compartilhando a página, para o PDF não ficar com páginas quase vazias

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Projeto de investimento inteiro na mesma página (Priority: P1)

Como cliente (ou consultor) que baixa o PDF de uma proposta com um ou mais projetos na seção Investimento, quero que cada projeto (nome + todos os seus cartões de investimento) apareça inteiro na mesma página, para ler as condições de cada projeto sem virar a página no meio.

**Why this priority**: É o problema relatado (bloco "Especialista Fiscal" dividido entre duas páginas) e afeta diretamente a leitura dos valores da proposta.

**Independent Test**: Criar uma proposta Development & Outplacement com 3 projetos, cada um com 2 ou 3 tipos de investimento; baixar o PDF e conferir que nenhum projeto tem o nome numa página e cartões em outra, e nenhum cartão é cortado.

**Acceptance Scenarios**:

1. **Given** uma proposta com vários projetos na seção Investimento, **When** o usuário baixa o PDF, **Then** o nome de cada projeto e todos os seus cartões de investimento aparecem na mesma página
2. **Given** um projeto que não cabe no espaço restante da página, **When** o PDF é gerado, **Then** o projeto inteiro começa na página seguinte
3. **Given** qualquer cartão de investimento, **When** o PDF é gerado, **Then** o cartão (tipo, taxa, subtítulo da taxa e forma de pagamento) não é cortado entre páginas
4. **Given** o quadro de Observações do Investimento, **When** o PDF é gerado, **Then** o quadro aparece inteiro numa única página

---

### User Story 2 - Título de seção sempre junto do conteúdo (Priority: P1)

Como leitor do PDF, quero que o título de cada seção (ex.: Investimento, Garantias e condições) nunca fique sozinho no fim de uma página com o conteúdo começando na página seguinte.

**Why this priority**: Título órfão é a forma mais visível de "PDF quebrado" e acontece justamente quando a seção é grande.

**Independent Test**: Gerar PDFs de propostas com conteúdos de tamanhos diferentes (com e sem Escopo, 1 a 4 projetos) e conferir que todo título de seção e de projeto tem conteúdo logo abaixo na mesma página.

**Acceptance Scenarios**:

1. **Given** qualquer seção da proposta, **When** o PDF é gerado, **Then** o título da seção fica na mesma página que o primeiro bloco de conteúdo dela
2. **Given** um projeto na seção Investimento, **When** o PDF é gerado, **Then** o nome do projeto fica na mesma página que seus cartões

---

### User Story 3 - Demais blocos inteiros (Priority: P2)

Como leitor do PDF, quero que os demais blocos visuais da proposta (etapas da metodologia, cartões de serviço, linhas de Garantias e condições, quadros de observações, próximos passos e cartão de contato do consultor) não sejam cortados ao meio.

**Why this priority**: Completa a correção para toda a proposta, mas os casos mais frequentes estão no Investimento (US1) e nos títulos (US2).

**Independent Test**: Gerar o PDF de uma proposta de cada modelo, nos dois idiomas, e conferir página a página que nenhum desses blocos aparece cortado.

**Acceptance Scenarios**:

1. **Given** a seção de metodologia (Executive Search) ou de serviços (Development & Outplacement), **When** o PDF é gerado, **Then** nenhuma etapa ou cartão de serviço é cortado
2. **Given** a seção Garantias e condições, **When** o PDF é gerado, **Then** nenhuma linha (rótulo + texto) é cortada e o quadro de observações aparece inteiro
3. **Given** o cartão de contato do consultor no fim da proposta, **When** o PDF é gerado, **Then** o cartão aparece inteiro numa página
4. **Given** a seção Escopo do Projeto com texto longo, maior que uma página, **When** o PDF é gerado, **Then** a divisão acontece entre parágrafos ou itens de lista, nunca no meio de um item

---

### Edge Cases

- Proposta com um único projeto e pouco conteúdo: o PDF continua com o mesmo número de páginas de antes (nada é empurrado sem necessidade)
- Bloco maior que uma página inteira (Escopo muito longo): divide entre itens, sem cortar um item no meio
- Propostas já assinadas, de versões antigas do modelo: o PDF também sai sem blocos cortados (a correção é só de paginação; textos e valores não mudam)
- Idioma inglês: mesmo comportamento do português
- Página da proposta na tela (fora do PDF): sem nenhuma mudança visual

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: No PDF da proposta, cada projeto da seção Investimento (nome + cartões de investimento) DEVE aparecer inteiro numa mesma página
- **FR-002**: Quando um bloco não couber no espaço restante da página, ele DEVE começar na página seguinte, em vez de ser dividido
- **FR-003**: Nenhum título de seção nem nome de projeto DEVE ficar como última linha de uma página, separado do conteúdo que o segue
- **FR-004**: Cartões de investimento, quadros de observações, linhas de Garantias e condições, etapas de metodologia, cartões de serviço, a seção Próximos passos e o cartão de contato NÃO DEVEM ser cortados entre páginas
- **FR-005**: Um bloco maior que uma página inteira PODE ser dividido, mas apenas entre seus itens (parágrafos, itens de lista, projetos), nunca no meio de um item
- **FR-006**: Seções NÃO DEVEM ser forçadas a começar numa página nova; seções curtas continuam compartilhando a página
- **FR-007**: A correção DEVE valer para os dois modelos (Executive Search e Development & Outplacement), todas as versões e os dois idiomas
- **FR-008**: A página da proposta exibida na tela, os textos, os valores e o nome do arquivo do PDF NÃO DEVEM mudar

### Key Entities

- **Bloco**: Unidade visual da proposta que deve ficar inteira numa página: projeto de investimento, cartão de investimento, quadro de observações, linha de garantia, etapa de metodologia, cartão de serviço, próximos passos, cartão de contato
- **Título**: Cabeçalho de seção ou nome de projeto; deve sempre acompanhar o primeiro bloco que o segue

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos PDFs testados (2 modelos × 2 idiomas × 1 a 4 projetos, com e sem Escopo), nenhum projeto de investimento aparece dividido entre páginas
- **SC-002**: Em 100% dos PDFs testados, nenhum título de seção ou nome de projeto aparece sozinho no fim de uma página
- **SC-003**: Em 100% dos PDFs testados, nenhum cartão, quadro de observações, linha de garantia ou cartão de contato aparece cortado
- **SC-004**: O PDF de uma proposta com 1 projeto e sem Escopo não ganha páginas extras em relação ao comportamento atual
- **SC-005**: A página da proposta na tela permanece visualmente idêntica à de antes da feature

## Assumptions

- "Telas" na descrição do usuário = páginas do PDF
- "Bloco de especialista fiscal" = um projeto da seção Investimento cujo nome foi cadastrado como "Especialista Fiscal"
- O PDF continua sendo gerado pela impressão do navegador ("Salvar como PDF"); a referência de teste é o Chrome/Edge em tamanho A4 com as margens padrão
- Espaço em branco no fim de uma página, quando o próximo bloco é empurrado, é aceitável
- Nenhuma mudança de dados, cadastro, permissão ou backend; ajuste apenas na paginação do PDF
