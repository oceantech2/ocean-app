# Feature Specification: Filtros e exclusão de propostas no Proposal

**Feature Branch**: `094-proposal-filtros-exclusao`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "em proposal inserir filtro de todos campos menos validade (e para o admin poder filtrar por quem adicionou proposta); botão para admin poder excluir proposal"

## Contexto

A lista de propostas do Proposal mostra as colunas Empresa, Modelo (com idioma/moeda), Projeto, Data, Validade, Status e — só para o administrador — Criado por. Hoje o único filtro é o de Status. Também não é possível excluir uma proposta: só cancelar as pendentes.

## Clarifications

### Session 2026-10-15

- Q: Quais propostas o admin pode excluir? → A: Qualquer uma, inclusive as assinadas, de forma definitiva, depois de confirmar.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Filtrar a lista de propostas (Priority: P1)

O consultor filtra a lista por Empresa, Modelo, Projeto, Data (período) e Status, combinando quantos filtros quiser. O administrador também filtra por quem criou a proposta. Os filtros valem para todas as páginas da lista, não só para a página aberta.

**Why this priority**: Com o volume de propostas crescendo, achar uma proposta específica só pelo status ficou lento.

**Independent Test**: Com propostas de empresas, modelos e datas diferentes, aplicar cada filtro sozinho e depois combinados, conferindo que só as propostas correspondentes aparecem e que o total/paginação acompanha.

**Acceptance Scenarios**:

1. **Given** a lista de propostas, **When** o usuário digita parte do nome da empresa (sem diferenciar maiúsculas), **Then** só aparecem as propostas cuja empresa contém o texto.
2. **Given** a lista, **When** o usuário escolhe um modelo, **Then** só aparecem as propostas desse modelo.
3. **Given** uma proposta com vários projetos, **When** o usuário busca pelo nome de qualquer um dos projetos, **Then** a proposta aparece.
4. **Given** a lista, **When** o usuário informa um período de datas (de/até, podendo informar só um dos lados), **Then** só aparecem propostas com Data dentro do período, considerando a mesma data exibida na coluna Data.
5. **Given** filtros combinados (ex.: empresa + status), **When** aplicados, **Then** aparecem só as propostas que atendem a todos.
6. **Given** o administrador, **When** escolhe um usuário em "Criado por", **Then** só aparecem as propostas criadas por esse usuário; a lista de opções mostra todos os usuários que já criaram propostas.
7. **Given** um consultor (não admin), **When** abre a lista, **Then** não vê o filtro "Criado por" e continua vendo só as próprias propostas.
8. **Given** filtros aplicados, **When** o usuário clica em "Limpar filtros", **Then** todos os filtros voltam ao padrão e a lista completa reaparece.
9. **Given** filtros sem resultado, **When** aplicados, **Then** a lista mostra "Nenhuma proposta encontrada com esses filtros".

---

### User Story 2 - Administrador exclui uma proposta (Priority: P2)

O administrador exclui definitivamente uma proposta, em qualquer status, pela lista ou pela página de detalhe, depois de confirmar. A exclusão de proposta assinada exige uma confirmação que deixa claro que o aceite do cliente também será apagado.

**Why this priority**: Remove propostas de teste, duplicadas ou criadas por engano, que hoje poluem a lista e os indicadores.

**Independent Test**: Como admin, excluir uma proposta pendente e uma assinada; elas somem da lista, o link do cliente passa a mostrar "proposta não encontrada" e a Auditoria registra as exclusões.

**Acceptance Scenarios**:

1. **Given** o administrador na lista ou no detalhe de uma proposta, **When** clica em Excluir e confirma, **Then** a proposta some da lista e o usuário recebe a confirmação "Proposta excluída".
2. **Given** o administrador, **When** clica em Excluir e cancela a confirmação, **Then** nada muda.
3. **Given** uma proposta assinada, **When** o administrador clica em Excluir, **Then** a confirmação avisa que a proposta já foi assinada e que o registro do aceite também será apagado definitivamente.
4. **Given** uma proposta excluída, **When** alguém abre o link do cliente, **Then** vê a mensagem de proposta não encontrada.
5. **Given** um consultor (não admin), **When** vê a lista ou o detalhe, **Then** não há botão Excluir; e, se tentar excluir por outro meio, a ação é negada.
6. **Given** uma exclusão feita, **When** alguém consulta a Auditoria do ERP, **Then** encontra quem excluiu, quando, o código, a empresa e o status da proposta.

---

### Edge Cases

- **Exclusão da proposta aberta no detalhe**: após excluir, o usuário volta para a lista.
- **Proposta já excluída por outro admin**: a tentativa de excluir de novo informa que a proposta não foi encontrada e a lista é recarregada.
- **Filtro de texto com caracteres especiais** (`%`, `_`): tratados como texto literal, não como curingas.
- **Período invertido** (data inicial maior que a final): a lista fica vazia com a mensagem de nenhum resultado; não há erro.
- **Propostas antigas sem "data da proposta"**: o filtro de período usa a data de emissão, a mesma exibida na coluna Data.
- **Mudança de filtro estando na página 3**: a lista volta para a página 1.
- **Filtro "Criado por" com usuário excluído**: as propostas dele continuam filtráveis pelo login gravado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A lista de propostas MUST oferecer filtros por Empresa (texto), Modelo (seleção), Projeto (texto), Data (período de/até) e Status (seleção, já existente). Validade não tem filtro.
- **FR-002**: Filtros de texto MUST buscar por trecho, sem diferenciar maiúsculas/minúsculas, tratando qualquer caractere como literal.
- **FR-003**: O filtro de Projeto MUST encontrar a proposta pelo nome de qualquer um de seus projetos.
- **FR-004**: O filtro de Data MUST considerar a data exibida na coluna Data (data da proposta ou, na falta dela, a data de emissão no fuso de São Paulo) e aceitar só "de", só "até" ou ambos, com limites inclusivos.
- **FR-005**: Para o administrador, a lista MUST oferecer o filtro "Criado por" com todos os usuários que já criaram propostas; para os demais, o filtro não aparece e eles continuam vendo só as próprias propostas.
- **FR-006**: Os filtros MUST ser combináveis (todos ao mesmo tempo), aplicados ao conjunto completo antes da paginação, e qualquer mudança MUST voltar a lista para a página 1.
- **FR-007**: A lista MUST ter "Limpar filtros" e uma mensagem própria quando os filtros não retornarem resultados.
- **FR-008**: O administrador MUST poder excluir definitivamente qualquer proposta, em qualquer status, pela lista e pela página de detalhe, após confirmação.
- **FR-009**: A confirmação de exclusão de proposta assinada MUST avisar que a proposta foi assinada e que o registro do aceite também será apagado.
- **FR-010**: A exclusão MUST remover junto o histórico de edições e o registro de aceite da proposta; o link público passa a responder "proposta não encontrada".
- **FR-011**: Somente administradores MUST conseguir excluir; tentativas de outros usuários MUST ser negadas.
- **FR-012**: Cada exclusão MUST ser registrada na Auditoria do ERP com usuário, data/hora, código, empresa e status da proposta no momento da exclusão.

### Key Entities

- **Proposta (existente)**: empresa, modelo, projetos (um ou vários nomes), data da proposta/emissão, status, criado por. Passa a poder ser excluída definitivamente por admin.
- **Histórico de edições e Aceite (existentes)**: dependentes da proposta; removidos com ela.
- **Registro de auditoria (existente)**: guarda a evidência da exclusão.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário encontra uma proposta específica por empresa ou projeto em menos de 10 segundos, independentemente do número de páginas.
- **SC-002**: 100% das combinações de filtros retornam somente propostas que atendem a todos os critérios, com total e paginação coerentes.
- **SC-003**: Um administrador exclui uma proposta em até 3 cliques (Excluir → confirmar), e 100% das exclusões ficam registradas na Auditoria.
- **SC-004**: 0 exclusões realizadas por usuários não administradores.

## Assumptions

- "Todos os campos" são as colunas exibidas na lista; Idioma/moeda (texto auxiliar da coluna Modelo) não ganha filtro próprio.
- Os filtros não ficam salvos entre sessões; recarregar a página limpa os filtros.
- A exclusão é física (sem lixeira); a evidência fica só na Auditoria do ERP.
- Os modelos disponíveis no filtro incluem as propostas simples antigas ("Proposta simples").
