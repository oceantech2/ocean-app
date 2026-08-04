# Feature Specification: Contas a Pagar — Categorias e Exclusão em Massa

**Feature Branch**: `008-contas-pagar-categorias`

**Created**: 2026-07-26

**Status**: Draft

**Input**: User description: "Contas a Pagar — Lógica = input manual; Inabilitar botão “Deletar todas”; Ajustar “Centro de Custo” (renomear para “Categorias”) com lista: Adm/Financeiro, Operações, Marketing, Comercial, Recursos Humanos (subcategorias: Salário, Bônus, Comissão, Retirada Sócios, Benefícios), Tecnologia, Impostos"

## Clarifications

### Session 2026-07-26

- Q: Como tratar a migração dos valores antigos de classificação? → A: Migrar automaticamente os mapeáveis; não mapeáveis ficam pendentes de reclassificação manual
- Q: Consistência com Impostos, Retiradas e Dashboard após migração? → A: Ajuste mínimo nessas telas para continuarem corretos com os novos valores (sem redesign)
- Q: Filtro por subcategoria de RH? → A: Filtro por categoria superior e, em RH, também por subcategoria
- Q: Importação CSV/XLSX e categorias? → A: Import aceita só taxonomia nova; inválidas/antigas geram erro na linha
- Q: Contas pendentes de reclassificação — operações permitidas? → A: Operação normal permitida; pendência é aviso visual até reclassificar

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manter lançamento manual de Contas a Pagar (Priority: P1)

Administrador continua criando, editando e consultando contas a pagar por **entrada manual** na página Contas a Pagar. Não há mudança para fonte externa automática: o fluxo operacional permanece baseado em cadastro feito pelo usuário.

**Why this priority**: Define a lógica de negócio da página e diferencia Contas a Pagar de Contas a Receber (fonte externa).

**Independent Test**: Como admin, criar uma conta a pagar preenchendo os campos, salvar e vê-la na lista; editar e marcar como paga; visualizador apenas consulta.

**Acceptance Scenarios**:

1. **Given** um administrador na página Contas a Pagar, **When** cria uma nova conta com descrição, categoria, valor e vencimento, **Then** o registro é salvo e aparece na lista.
2. **Given** uma conta existente, **When** o administrador edita e salva, **Then** as alterações ficam persistidas e visíveis.
3. **Given** um visualizador, **When** abre a página, **Then** consegue consultar a lista, mas não criar, editar nem excluir contas.
4. **Given** a página Contas a Pagar, **When** o usuário observa a origem dos dados, **Then** os registros refletem lançamentos manuais (não há dependência de sincronização externa obrigatória para listar/criar).

---

### User Story 2 - Inabilitar exclusão em massa (“Deletar todas”) (Priority: P1)

Administrador deixa de poder excluir todas as contas a pagar de uma vez. O botão **“Deletar todas”** (e qualquer equivalente de exclusão em massa) fica **indisponível** na página. Exclusão individual, quando já existir no produto, permanece disponível conforme o padrão atual.

**Why this priority**: Reduz risco operacional de apagar o histórico de despesas de forma irreversível em um único clique.

**Independent Test**: Abrir Contas a Pagar como admin e confirmar que “Deletar todas” não está disponível; ainda é possível operar o restante do CRUD permitido.

**Acceptance Scenarios**:

1. **Given** um administrador na página Contas a Pagar, **When** observa as ações disponíveis, **Then** não encontra o botão “Deletar todas” (nem ação equivalente de exclusão em massa).
2. **Given** um administrador com contas na lista, **When** tenta excluir em massa por qualquer caminho da página, **Then** essa ação não está oferecida.
3. **Given** um visualizador, **When** abre a página, **Then** também não vê exclusão em massa (além de já não ter ações de escrita).

---

### User Story 3 - Classificar despesas por Categorias (Priority: P1)

O campo antes chamado **“Centro de Custo”** passa a se chamar **“Categorias”** em toda a experiência da página Contas a Pagar (formulários, filtros, listagem e rótulos). O administrador escolhe uma categoria da taxonomia oficial abaixo ao criar ou editar uma conta.

**Categorias de nível superior:**

| Categoria | Observação |
|-----------|------------|
| Adm/Financeiro | Sem subcategorias |
| Operações | Sem subcategorias |
| Marketing | Sem subcategorias |
| Comercial | Sem subcategorias |
| Recursos Humanos | Exige subcategoria |
| Tecnologia | Sem subcategorias |
| Impostos | Sem subcategorias |

**Subcategorias de Recursos Humanos** (obrigatórias quando a categoria for RH):

- Salário
- Bônus
- Comissão
- Retirada Sócios
- Benefícios

**Why this priority**: É o ajuste de classificação pedido; impacta lançamento, filtro e leitura gerencial das despesas.

**Independent Test**: Criar/editar conta escolhendo cada categoria (e subcategoria de RH); filtrar por categoria superior e por subcategoria de RH; verificar rótulo “Categorias” no lugar de “Centro de Custo”.

**Acceptance Scenarios**:

1. **Given** um administrador abrindo o formulário de conta a pagar, **When** observa o campo de classificação, **Then** o rótulo exibido é **“Categorias”** (não “Centro de Custo”).
2. **Given** o formulário aberto, **When** o admin seleciona a categoria, **Then** as opções disponíveis são exatamente: Adm/Financeiro, Operações, Marketing, Comercial, Recursos Humanos, Tecnologia e Impostos.
3. **Given** o admin selecionou **Recursos Humanos**, **When** tenta salvar sem subcategoria, **Then** o sistema impede o salvamento e solicita uma das subcategorias: Salário, Bônus, Comissão, Retirada Sócios ou Benefícios.
4. **Given** o admin selecionou **Recursos Humanos** e uma subcategoria válida, **When** salva, **Then** a conta fica classificada com a combinação categoria + subcategoria e isso aparece na lista.
5. **Given** o admin selecionou uma categoria sem subcategorias (ex.: Marketing), **When** salva, **Then** a conta fica classificada só com essa categoria (sem exigir subcategoria).
6. **Given** a lista de contas, **When** o usuário aplica filtro por categoria de nível superior, **Then** vê apenas as contas daquela classificação; filtrar por Recursos Humanos (sem subcategoria) inclui todas as subcategorias de RH.
7. **Given** a lista de contas, **When** o usuário filtra por Recursos Humanos e uma subcategoria (ex.: Salário), **Then** vê apenas as contas dessa subcategoria.
8. **Given** um visualizador, **When** consulta a lista, **Then** vê as categorias (e subcategorias de RH) corretamente rotuladas, sem poder alterá-las.

---

### User Story 4 - Compatibilidade de registros já existentes (Priority: P2)

Contas a pagar já cadastradas com a classificação antiga (“centro de custo”) continuam visíveis e utilizáveis. Na atualização, valores com mapeamento definido são **migrados e persistidos** automaticamente na nova taxonomia; valores sem mapeamento ficam **pendentes de reclassificação**, com indicação clara, até o admin corrigir ao editar.

**Why this priority**: Evita perda de histórico e interrupção operacional após a mudança de nomenclatura/taxonomia.

**Independent Test**: Abrir a lista com dados legados; conferir exibição; editar uma conta legada e salvar com nova categoria.

**Acceptance Scenarios**:

1. **Given** contas existentes com classificação antiga, **When** a atualização da taxonomia é aplicada, **Then** nenhum registro some; valores mapeáveis são **convertidos e persistidos** na nova taxonomia.
2. **Given** uma conta legada com valor mapeável (ex.: antigo “Salário” → Recursos Humanos / Salário), **When** a lista é exibida após a migração, **Then** a classificação persistida já está na nova taxonomia (não apenas um rótulo visual sobre o valor antigo).
3. **Given** uma conta legada sem mapeamento inequívoco, **When** a migração roda, **Then** o valor antigo permanece, a conta é marcada como **pendente de reclassificação** (indicação clara na UI) e o admin consegue editar para uma categoria válida.
4. **Given** uma conta pendente de reclassificação, **When** o admin marca como paga ou edita outros campos (sem alterar a categoria), **Then** a operação é permitida e o aviso de pendência permanece até a reclassificação.
5. **Given** um administrador reclassificando uma conta pendente, **When** salva com categoria válida, **Then** a pendência é resolvida e a nova classificação prevalece nas consultas e filtros seguintes.

---

### User Story 5 - Manter Impostos, Retiradas e custo por categoria coerentes (Priority: P2)

Após a migração da taxonomia, as telas **Impostos**, **Retiradas** e a visão de **custo por categoria** continuam mostrando as despesas corretas, com ajuste mínimo de filtros/agregações aos novos valores — sem redesign de layout ou nomenclatura completa nesses módulos.

**Why this priority**: A migração persistente quebraria essas telas se elas ainda filtrassem pelos valores antigos.

**Independent Test**: Conferir que contas migradas para Impostos / RH–Retirada Sócios / demais categorias aparecem nos lugares esperados em Impostos, Retiradas e custo por categoria.

**Acceptance Scenarios**:

1. **Given** contas migradas para a categoria Impostos, **When** o usuário abre a tela Impostos, **Then** essas contas aparecem (não “somem” por filtro antigo).
2. **Given** contas migradas para Recursos Humanos / Retirada Sócios, **When** o usuário abre Retiradas, **Then** essas contas aparecem corretamente.
3. **Given** o conjunto de contas migradas, **When** consulta custo por categoria, **Then** os totais refletem a taxonomia nova sem perda silenciosa dos valores migrados.

---

### Edge Cases

- Tentativa de salvar conta sem categoria selecionada: o sistema impede e informa o usuário.
- Seleção de Recursos Humanos sem subcategoria: salvamento bloqueado até escolher subcategoria.
- Filtro “todas as categorias”: lista completa sem restrição por categoria.
- Filtro RH sem subcategoria: inclui Salário, Bônus, Comissão, Retirada Sócios e Benefícios.
- Filtro RH com subcategoria: restringe apenas à subcategoria escolhida.
- Contas legadas sem mapeamento: permanecem listáveis, marcadas como pendentes de reclassificação (aviso visual), e editáveis; operações normais (incl. marcar como paga) NÃO são bloqueadas pela pendência.
- Contas mapeáveis: após a migração automática, o valor antigo deixa de existir no registro (substituído pelo valor novo persistido).
- Visualizador: nunca acessa exclusão em massa nem alteração de categorias.
- Importação com categoria antiga ou inválida: a linha é rejeitada com erro claro; não há conversão silenciosa de aliases legados na importação.
- Labels em outros pontos da mesma página (coluna da tabela, filtro, modal): todos usam “Categorias”, não “Centro de Custo”.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O módulo Contas a Pagar DEVE continuar operando com **lançamento manual** (criação e edição pelo usuário autorizado) como lógica principal de entrada de dados.
- **FR-002**: A página Contas a Pagar NÃO DEVE oferecer o botão “Deletar todas” nem qualquer ação equivalente de exclusão em massa.
- **FR-003**: Em Contas a Pagar, o campo/rótulo de classificação DEVE chamar-se **“Categorias”** (substituindo “Centro de Custo” na interface dessa página).
- **FR-004**: O sistema DEVE oferecer exatamente estas categorias de nível superior: Adm/Financeiro, Operações, Marketing, Comercial, Recursos Humanos, Tecnologia, Impostos.
- **FR-005**: Quando a categoria for Recursos Humanos, o sistema DEVE exigir uma subcategoria entre: Salário, Bônus, Comissão, Retirada Sócios, Benefícios.
- **FR-006**: Categorias sem subcategorias NÃO DEVEM exigir subcategoria para salvar.
- **FR-007**: O sistema DEVE persistir a categoria (e subcategoria de RH, quando aplicável) em cada conta a pagar e exibi-la na listagem.
- **FR-008**: O usuário DEVE poder filtrar a lista de contas a pagar por categoria de nível superior. O filtro Recursos Humanos sem subcategoria DEVE incluir todas as subcategorias de RH. O usuário DEVE também poder filtrar por uma subcategoria específica de RH (ex.: somente Salário).
- **FR-009**: Contas existentes com classificação antiga DEVEM permanecer acessíveis após a mudança. Valores com mapeamento definido nas Assumptions DEVEM ser **migrados e persistidos** automaticamente na nova taxonomia. Valores sem mapeamento DEVEM permanecer com o valor antigo, ser marcados como **pendentes de reclassificação** (aviso visual) e permitir reclassificação manual pelo admin. A pendência NÃO DEVE bloquear operações normais (marcar como paga, editar demais campos).
- **FR-010**: Papel `admin` DEVE poder criar/editar/excluir individualmente (quando a exclusão individual já existir); papel `visualizador` DEVE ter somente leitura.
- **FR-011**: Escopo principal desta feature É a página Contas a Pagar (rótulos, opções de categoria, exclusão em massa, migração). Telas que dependem dos mesmos dados de classificação — **Impostos**, **Retiradas** e **custo por categoria** (Dashboard/relatório) — DEVEM receber **ajuste mínimo** para continuar filtrando/agregando corretamente com a taxonomia nova. Redesign completo de nomenclatura (“Categorias”) no restante do sistema fica fora do escopo.
- **FR-012**: A importação de contas a pagar (CSV/XLSX), se disponível na página, DEVE aceitar somente categorias e subcategorias da taxonomia oficial desta spec. Linhas com categoria/subcategoria ausente, antiga ou inválida DEVEM ser rejeitadas com mensagem de erro clara referente à linha.

### Key Entities

- **Conta a Pagar**: Despesa lançada manualmente; atributos relevantes incluem descrição, valor, datas de vencimento/pagamento, status pago/não pago e **categoria** (com subcategoria quando RH).
- **Categoria**: Classificação gerencial da despesa; conjunto fechado listado em FR-004.
- **Subcategoria de RH**: Refinamento obrigatório apenas sob Recursos Humanos; conjunto fechado listado em FR-005.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das sessões de admin na página Contas a Pagar, o botão “Deletar todas” (ou equivalente) não está disponível.
- **SC-002**: Em 100% dos fluxos de criar/editar conta a pagar, o rótulo de classificação exibido é “Categorias” e as opções batem com a taxonomia oficial desta spec.
- **SC-003**: 100% das tentativas de salvar com Recursos Humanos sem subcategoria são bloqueadas com feedback claro ao usuário.
- **SC-004**: Um administrador consegue criar uma conta a pagar classificada corretamente (incluindo um caso de RH com subcategoria) em menos de 2 minutos no fluxo padrão.
- **SC-005**: 100% das contas existentes antes da mudança continuam listáveis após a atualização; 100% dos valores com mapeamento definido são persistidos na nova taxonomia; 100% dos sem mapeamento ficam identificáveis como pendentes de reclassificação.
- **SC-006**: Visualizadores conseguem consultar categorias na lista, mas 0% das ações de escrita (criar, editar, excluir) estão disponíveis para esse papel.
- **SC-007**: Após a migração, Impostos, Retiradas e a visão de custo por categoria continuam refletindo os registros corretos da taxonomia nova (0% de “sumiço” de despesas migradas nessas telas por filtro desatualizado).
- **SC-008**: Em testes de importação, 100% das linhas com categoria/subcategoria inválida ou antiga são rejeitadas com erro identificável; linhas válidas na taxonomia nova são aceitas.

## Assumptions

- “Inabilitar” o botão “Deletar todas” significa **torná-lo indisponível na interface** (ocultar/remover), não apenas desabilitá-lo visualmente de forma clicável.
- A lógica “input manual” significa manter o CRUD manual atual de Contas a Pagar; não introduz sincronização automática com sistema externo nesta feature.
- **Tecnologia** e **Impostos** são categorias de nível superior (não são subcategorias de Recursos Humanos).
- Subcategorias existem **somente** sob Recursos Humanos.
- Exclusão individual de conta a pagar, se já existir no produto, permanece; apenas a exclusão em massa é retirada.
- Importação CSV/XLSX e demais ações já existentes na página (exceto “Deletar todas” e a taxonomia/rótulo) permanecem disponíveis. A importação DEVE aceitar **somente** a taxonomia nova (categoria e, se RH, subcategoria); valores antigos ou inválidos DEVEM falhar na linha com erro claro (sem mapear alias legado na importação).
- Migração de classificação: **automática e persistente** para valores mapeáveis; **não mapeáveis** ficam pendentes de reclassificação manual (aviso visual, sem default forçado e sem bloqueio de pagar/editar outros campos).
- Mapeamento de valores antigos para a nova taxonomia (quando inequívoco):
  - Administrativo → Adm/Financeiro
  - Salário → Recursos Humanos / Salário
  - Bônus → Recursos Humanos / Bônus
  - Retirada de Lucro → Recursos Humanos / Retirada Sócios
  - Impostos / Imposto → Impostos
  - Reembolsos, Evento e demais valores sem correspondência clara → pendentes de reclassificação manual (indicação na UI)
- Relatórios e telas auxiliares (Impostos, Retiradas, custo por categoria): **ajuste mínimo** nesta feature para lerem/filtrarem a taxonomia nova; redesign completo de nomenclatura nesses módulos está fora do escopo.
- Papéis e autenticação existentes (`admin` / `visualizador`) são reutilizados.
