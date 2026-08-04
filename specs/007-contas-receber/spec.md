# Feature Specification: Página Contas a Receber

**Feature Branch**: `007-contas-receber`

**Created**: 2026-07-26

**Status**: Draft

**Input**: User description: "PÁGINA Contas a Receber — Lógica = API Ocean/Maggo (tempo real); Inativar/Remover botões “Deletar todas”, “Nova NF”; Inativar/Remover pasta de notas fiscais; Adicionar campo de identificação de Caixa (corrente / investimento); Ajustar campos editáveis"

## Clarifications

### Session 2026-07-26

- Q: Quais campos o admin ainda pode editar no Ocean (além de Caixa)? → A: Caixa + pagamento + colaboradores (lead/condução/placement) + arquivar
- Q: Importação Excel/CSV e exclusão individual na página? → A: Remover import e exclusão individual (arquivar permanece)
- Q: Integração Maggo já disponível nesta entrega? → A: Stub/mock agora; Maggo real em feature seguinte

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar Contas a Receber pela fonte simulada Maggo (Priority: P1)

Usuário autenticado com permissão do módulo abre a página **Contas a Receber** e vê a lista de valores a receber proveniente da **fonte simulada Maggo** (stub/mock), sem depender de cadastro manual local (“Nova NF”) como origem dos registros. A experiência prepara o caminho para a Maggo real em feature posterior.

**Why this priority**: Sem lista via fonte Maggo (mesmo simulada), a página permanece no fluxo antigo de NFs locais e não valida o novo modelo operacional.

**Independent Test**: Abrir Contas a Receber e confirmar que os registros vêm da fonte simulada Maggo; recarregar a página e obter a mesma visão sem criar NF localmente.

**Acceptance Scenarios**:

1. **Given** o usuário autenticado com acesso ao módulo, **When** abre Contas a Receber, **Then** vê a lista de contas a receber proveniente da fonte simulada Maggo (stub/mock).
2. **Given** a página carregada, **When** o usuário atualiza/recarrega a visão, **Then** a lista é obtida novamente da fonte simulada (sem exigir criação local).
3. **Given** falha da fonte simulada (indisponível ou erro), **When** o usuário tenta carregar a página, **Then** recebe feedback claro de erro e não vê dados inventados apresentados como sucesso.

---

### User Story 2 - Remover criação, exclusão em massa, importação e pasta de arquivos (Priority: P1)

Administrador deixa de criar, importar ou excluir contas a receber pela página e deixa de usar a pasta/gerenciador de arquivos de notas fiscais. Os botões **“Nova NF”**, **“Deletar Todas”**, fluxos de **importação** (Excel/CSV) e a pasta **“NFs”** não estão mais disponíveis; exclusão individual também não. **Arquivar** permanece como forma de ocultar registros localmente.

**Why this priority**: Remove ações incompatíveis com a lógica Maggo (fonte externa) e elimina o repositório local de arquivos de NF na página.

**Independent Test**: Como admin, abrir Contas a Receber e verificar ausência de “Nova NF”, “Deletar Todas”, importação, exclusão individual e pasta/gerenciador de arquivos de NFs; confirmar que arquivar continua disponível.

**Acceptance Scenarios**:

1. **Given** um administrador na página Contas a Receber, **When** observa as ações da página, **Then** não encontra o botão “Nova NF” (nem equivalente de criação local).
2. **Given** um administrador com registros na lista, **When** observa as ações da página, **Then** não encontra o botão “Deletar Todas” (nem equivalente de exclusão em massa) nem exclusão individual.
3. **Given** qualquer usuário na página, **When** procura importação Excel/CSV ou a pasta/gerenciador de arquivos de notas fiscais, **Then** essas funcionalidades não estão disponíveis na página Contas a Receber.
4. **Given** um administrador, **When** arquiva um registro, **Then** o registro deixa de aparecer na lista padrão e pode ser reexibido via desarquivar / filtro de arquivadas.
5. **Given** um visualizador, **When** abre a página, **Then** continua sem ações de escrita e também não vê as ações removidas acima.

---

### User Story 3 - Identificar Caixa (corrente / investimento) (Priority: P1)

Administrador classifica cada conta a receber quanto ao destino/origem de caixa: **corrente** ou **investimento**, de forma visível na lista e no fluxo de edição.

**Why this priority**: É o novo dado de negócio explícito no pedido; alimenta o alinhamento com Fluxo de Caixa (corrente vs investimento).

**Independent Test**: Editar uma conta a receber, escolher corrente ou investimento, salvar e ver o valor refletido na lista.

**Acceptance Scenarios**:

1. **Given** um administrador editando uma conta a receber, **When** seleciona identificação de Caixa “corrente” ou “investimento”, **Then** a escolha é persistida e exibida na lista.
2. **Given** uma conta já classificada, **When** o admin altera de corrente para investimento (ou o inverso), **Then** a nova classificação prevalece após salvar.
3. **Given** um visualizador, **When** consulta a lista, **Then** vê a identificação de Caixa, mas não consegue alterá-la.
4. **Given** uma conta ainda sem classificação de Caixa, **When** é exibida na lista, **Then** o usuário identifica claramente a ausência (ex.: vazio ou “não definido”), sem valor inventado.

---

### User Story 4 - Editar apenas campos permitidos (Priority: P2)

Administrador ajusta apenas: identificação de **Caixa**, **pagamento** (data / marcar como recebido), **colaboradores** (lead, condução, placement) e **arquivar**. Demais campos provenientes da fonte Maggo (simulada nesta entrega) permanecem somente leitura.

**Why this priority**: Evita divergência com a fonte Maggo e fecha o escopo de “ajustar campos editáveis”.

**Independent Test**: Abrir edição de um registro e confirmar que só Caixa, pagamento, colaboradores e arquivar aceitam alteração; demais campos bloqueados; salvar com sucesso.

**Acceptance Scenarios**:

1. **Given** um administrador na edição de uma conta a receber, **When** tenta alterar um campo somente leitura (origem Maggo — ex.: número, valores, cliente), **Then** o sistema impede a alteração desse campo.
2. **Given** um administrador na edição, **When** altera Caixa, pagamento, colaboradores e/ou arquivamento e salva, **Then** a alteração é aplicada e refletida na lista.
3. **Given** um visualizador, **When** tenta editar qualquer campo, **Then** a ação é bloqueada (somente leitura).

---

### Edge Cases

- Fonte simulada Maggo indisponível ou em erro: feedback de erro; lista não é apresentada como vazia “de sucesso”.
- Conta a receber sem identificação de Caixa: exibição explícita de não definido; admin pode definir corrente ou investimento.
- Registro ausente na fonte entre duas consultas: próxima atualização reflete o estado novo; enriquecimento Ocean (Caixa, etc.) permanece associado ao identificador quando o registro ainda existe.
- Tentativa de acessar URL/atalho antigo de “Nova NF”, importação, exclusão ou pasta de arquivos: ação inexistente ou redirecionamento seguro sem criar/excluir dados.
- Papel visualizador: vê lista, Caixa e demais campos visíveis; nenhuma escrita.
- Registro arquivado: oculto na lista padrão; acessível via filtro/opção de arquivadas; desarquivar restaura a visibilidade.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST apresentar a página **Contas a Receber** como o módulo de consulta/gestão de valores a receber (substitui a experiência operacional da página de NFs para esse fim).
- **FR-002**: O sistema MUST obter e exibir os dados de contas a receber a partir de uma **fonte simulada Maggo** (stub/mock) que represente o contrato esperado da Maggo; a integração Maggo real fica **fora do escopo** desta feature.
- **FR-003**: O sistema MUST NOT oferecer na página Contas a Receber o botão ou fluxo **“Nova NF”** (criação local de nota fiscal).
- **FR-004**: O sistema MUST NOT oferecer na página Contas a Receber o botão ou fluxo **“Deletar Todas”** (exclusão em massa) nem exclusão individual de registros.
- **FR-005**: O sistema MUST NOT oferecer na página Contas a Receber a pasta/gerenciador de arquivos de notas fiscais.
- **FR-006**: O sistema MUST permitir ao administrador informar e alterar a identificação de **Caixa** de cada conta a receber, com valores **corrente** ou **investimento**.
- **FR-007**: O sistema MUST exibir a identificação de Caixa (corrente / investimento / não definido) de forma legível na listagem.
- **FR-008**: O sistema MUST permitir ao administrador editar somente: identificação de **Caixa** (corrente/investimento), **pagamento** (data de pagamento / marcar como recebido), **colaboradores** (lead, condução, placement) e **arquivar**/desarquivar. Demais campos de origem Maggo (ex.: número, valores, cliente/razão social, datas de emissão/vencimento, tipo) MUST ser somente leitura.
- **FR-009**: Usuários com papel **visualizador** MUST consultar Contas a Receber e Caixa em somente leitura; admin mantém as escritas permitidas.
- **FR-010**: Em falha da fonte simulada Maggo, o sistema MUST informar o usuário com mensagem clara e NÃO apresentar dados inventados como sucesso.
- **FR-011**: A navegação/rótulos do módulo MUST refletir **Contas a Receber** (não “NFs” / “Nova NF” / pasta “NFs”) nos pontos da página e do menu afetados por esta feature.
- **FR-012**: Exportação, filtros por período/status e visualização de arquivadas MUST permanecer disponíveis, desde que não reintroduzam criação, importação, exclusão ou pasta de arquivos.
- **FR-013**: O sistema MUST NOT oferecer importação Excel/CSV (nem equivalente em massa) na página Contas a Receber.
- **FR-014**: A página MUST consumir a fonte simulada de forma que a substituição futura pela Maggo real não reabra os fluxos removidos (criar, importar, excluir em massa/individual, pasta de NFs).

### Key Entities

- **Conta a Receber**: Registro de valor a receber (origem Maggo — simulada nesta entrega), com identificação, cliente/razão social, valores, datas, status de recebimento e metadados de negócio já conhecidos no domínio (tipo retainer/sucesso, etc., quando fornecidos pela fonte).
- **Identificação de Caixa**: Atributo de enriquecimento no Ocean — **corrente** ou **investimento** — associado a uma Conta a Receber.
- **Enriquecimento Ocean (editável)**: Caixa, pagamento, colaboradores (lead/condução/placement) e flag de arquivamento — persistidos no Ocean e associados ao identificador da conta na fonte Maggo.
- **Fonte simulada Maggo**: Substituta temporária da Maggo real; fornece a lista de contas a receber no formato esperado até a feature de integração real.
- **Usuário**: Admin (escrita permitida nos campos editáveis) ou visualizador (somente leitura), conforme papéis do produto.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das sessões de teste com a fonte simulada disponível, a lista de Contas a Receber carrega sem exigir criação local prévia via “Nova NF”.
- **SC-002**: Em inspeção da página (admin e visualizador), os controles “Nova NF”, “Deletar Todas”, importação Excel/CSV, exclusão individual e pasta/gerenciador de arquivos de NFs estão ausentes em 100% dos casos.
- **SC-003**: Administrador classifica ou altera Caixa (corrente ↔ investimento) de um registro em menos de 1 minuto, e a escolha permanece visível após recarregar a página.
- **SC-004**: Em pelo menos 95% das tentativas de edição, campos somente leitura (origem Maggo) não são alteráveis; apenas campos editáveis permitidos aceitam gravação.
- **SC-005**: Diante de indisponibilidade da fonte simulada, 100% das tentativas de carga exibem erro compreensível ao usuário (sem lista falsa de sucesso vazia).
- **SC-006**: Usuários encontram o módulo pelo rótulo **Contas a Receber** no menu/navegação afetada, sem depender do rótulo legado “NFs” para a tarefa principal.

## Assumptions

- A página Contas a Receber é a evolução da página atual de NFs (mesmo módulo de permissão, renomeado e ajustado), não um segundo módulo paralelo de faturamento.
- Nesta entrega, “fonte Maggo” = **stub/mock**; a Maggo real (contrato, acesso e tempo real de produção) é **feature seguinte**, fora do escopo.
- A fonte simulada deve espelhar o formato de dados esperado da Maggo o suficiente para listagem e enriquecimento Ocean (Caixa, pagamento, colaboradores, arquivar).
- Valores de Caixa alinhados ao domínio já usado em Fluxo de Caixa: **corrente** e **investimento**.
- Remoção dos botões, importação, exclusão individual e da pasta é total na UI da página (não apenas desabilitados visualmente).
- Arquivar/desarquivar permanece como único mecanismo de ocultação local de registros.
- Papéis admin / visualizador seguem o produto existente.

## Out of Scope

- Integração Maggo real (autenticação, contrato de produção, sincronização tempo real com o sistema Maggo).
- Recriação de fluxos de “Nova NF”, importação, exclusão em massa/individual ou pasta de arquivos de NF.
