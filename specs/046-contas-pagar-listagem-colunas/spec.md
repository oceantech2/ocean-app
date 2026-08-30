# Feature Specification: Contas a Pagar — Listagem em Tabela com Colunas Tipo, Categoria e Mês/Ano

**Feature Branch**: `046-contas-pagar-listagem-colunas`

**Created**: 2026-08-29

**Status**: Draft

**Input**: User description: "em contas a pagar — Inserir coluna Tipo; Inserir coluna Categoria ao invés de agrupar por categoria; Inserir coluna Mês/Ano ao invés de agrupar por mês; Inserir filtro de Mês/Ano (mês corrente como visualização padrão, com opção de visualizar Todos os meses juntos)"

**Baseline**: Substitui o recorte por **agrupamento** (blocos por mês com subgrupos por categoria, conforme `034-contas-pagar-agrupar-mes`) por uma **tabela única e plana**, em que mês e categoria viram colunas visíveis. A coluna **Tipo** (Fixo/Variável) segue a regra de dados já definida em `045-contas-pagar-campos`. Filtros existentes (categoria, status, descrição, intervalo de vencimento) permanecem; esta entrega **adiciona** o filtro **Mês/Ano** e **remove** os modos de agrupamento Por mês / Por categoria.

## Clarifications

### Session 2026-08-29

- Q: Como o usuário escolhe o recorte Mês/Ano no filtro (controle único vs seletores separados)? → A: Dois seletores separados **Mês** + **Ano** (padrão Dashboard), com opção **Todos** que ignora o recorte mensal.
- Q: Meses futuros no filtro Mês/Ano (ano corrente)? → A: Permitir **jan–dez** em qualquer ano, **inclusive meses futuros** no ano corrente.
- Q: Ordenação padrão da tabela plana ao abrir/mudar filtros? → A: **Vencimento ascendente** (datas mais próximas primeiro).
- Q: Ordem fixa das colunas na tabela plana? → A: **Descrição → Categoria → Mês/Ano → Fornecedor → Valor → Vencimento → Pagamento → Conta → Tipo → Status → NF → Ações**.
- Q: Alcance do seletor de Ano no filtro Mês/Ano? → A: **Ano corrente ±5** (5 anos para trás e 5 para frente).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver todas as contas em uma tabela com colunas Tipo, Categoria e Mês/Ano (Priority: P1)

Na página **Contas a Pagar**, o usuário vê uma **única tabela plana** com todas as contas do recorte atual (após filtros), **sem blocos colapsáveis por mês nem subcabeçalhos por categoria**. Ao carregar ou ao alterar filtros (sem ordenação manual pelo usuário), as linhas aparecem por **vencimento ascendente** (datas mais próximas primeiro). Cada linha exibe, entre as demais colunas já existentes, as colunas **Tipo** (Fixo ou Variável), **Categoria** (nome legível da classificação, incluindo subcategoria de RH quando houver) e **Mês/Ano** (competência derivada da **data de vencimento**, ex.: “Agosto/2026”). Contas **sem data de vencimento** exibem traço (—) na coluna Mês/Ano.

**Why this priority**: É a mudança central pedida — substituir agrupamentos por colunas que permitam ler, ordenar e exportar o recorte inteiro de uma vez.

**Independent Test**: Abrir Contas a Pagar com contas em pelo menos dois meses e duas categorias; confirmar que **não** há cabeçalhos de grupo por mês/categoria; cada linha mostra Tipo, Categoria e Mês/Ano corretos; contas sem vencimento mostram — em Mês/Ano.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado na página Contas a Pagar com contas em meses e categorias distintos, **When** observa a listagem, **Then** vê **uma tabela única** (sem agrupamento Por mês nem Por categoria) com colunas **Tipo**, **Categoria** e **Mês/Ano** visíveis em cada linha.
2. **Given** uma conta com Tipo **Fixo** ou **Variável** gravado, **When** aparece na listagem, **Then** a coluna **Tipo** exibe exatamente **Fixo** ou **Variável** (mesmos rótulos do formulário).
3. **Given** uma conta de **Recursos Humanos** com subcategoria (ex.: Salário), **When** aparece na listagem, **Then** a coluna **Categoria** exibe o formato legível **Recursos Humanos / Salário** (ou equivalente já usado na página para RH).
4. **Given** uma conta de categoria de primeiro nível sem subcategoria (ex.: Marketing), **When** aparece na listagem, **Then** a coluna **Categoria** exibe só o nome da categoria (ex.: Marketing).
5. **Given** uma conta **pendente de reclassificação**, **When** aparece na listagem, **Then** a coluna **Categoria** reflete o rótulo legado/pendência já vigente (incluindo indicador visual de reclassificar, se existir na linha) e **não** inventa categoria nova.
6. **Given** uma conta com data de vencimento em **15/08/2026**, **When** aparece na listagem, **Then** a coluna **Mês/Ano** exibe **Agosto/2026** (mês por extenso em português + ano).
7. **Given** uma conta **sem data de vencimento**, **When** aparece na listagem, **Then** a coluna **Mês/Ano** exibe **—** (traço).
8. **Given** um visualizador, **When** consulta a tabela, **Then** vê as mesmas colunas e valores; **não** ganha permissão de edição.
9. **Given** a listagem recém-carregada ou após mudança de filtro (sem clique em cabeçalho de ordenação), **When** o usuário observa as linhas, **Then** estão ordenadas por **vencimento ascendente** (data de vencimento mais próxima primeiro); contas sem vencimento aparecem após as datadas, conforme regra previsível da página.

---

### User Story 2 - Filtrar por Mês/Ano com padrão no mês corrente e opção Todos (Priority: P1)

O usuário restringe a listagem por **Mês/Ano** usando **dois seletores separados** — **Mês** e **Ano** — na área de filtros (mesmo padrão do Dashboard), além de uma opção **Todos** que desativa o recorte mensal. **Ao abrir a página**, os seletores iniciam no **mês civil corrente** e **ano civil corrente** (ex.: Agosto + 2026 em 29/08/2026), mostrando apenas contas cujo vencimento cai naquele mês/ano. O usuário pode escolher **Todos** para ver contas de **todos os meses** juntas na mesma tabela (respeitando os demais filtros). Também pode combinar outro mês e ano nos seletores.

**Why this priority**: Sem o filtro mensal com padrão no mês corrente, a tabela plana perderia o recorte operacional que hoje o agrupamento por mês oferece.

**Independent Test**: Com contas em agosto/2026 e julho/2026, abrir a página e confirmar só agosto; selecionar **Todos** e ver ambos os meses na coluna Mês/Ano; voltar a um mês específico e confirmar o recorte.

**Acceptance Scenarios**:

1. **Given** a primeira abertura da página Contas a Pagar na sessão, **When** a listagem carrega, **Then** os seletores **Mês** e **Ano** estão no mês e ano civis correntes (ex.: Agosto + 2026) e a tabela mostra **somente** contas com vencimento naquele mês/ano (contas sem vencimento **não** aparecem nesse recorte mensal).
2. **Given** o filtro em um mês/ano específico, **When** o usuário seleciona **Todos**, **Then** a listagem inclui contas de **todos os meses** (respeitando categoria, status, descrição e intervalo de vencimento, se preenchidos), os seletores **Mês** e **Ano** ficam desabilitados ou ignorados, e a coluna **Mês/Ano** distingue cada competência.
3. **Given** o filtro em **Todos**, **When** o usuário escolhe um mês e ano específicos nos seletores (ex.: Julho + 2026), **Then** a listagem restringe às contas daquele mês/ano de vencimento.
4. **Given** o usuário altera apenas o **Ano** mantendo o **Mês**, **When** a listagem atualiza, **Then** o recorte reflete a combinação mês/ano escolhida (ex.: Julho/2025).
5. **Given** contas pagas e pendentes no mesmo mês, **When** o filtro Mês/Ano aponta para esse mês, **Then** **ambas** aparecem (o filtro mensal **não** substitui o filtro de status).
6. **Given** o filtro Mês/Ano em um mês sem contas (após demais filtros), **When** o usuário observa a tabela, **Then** vê estado vazio claro (sem linhas fantasma).
7. **Given** um visualizador, **When** altera o filtro Mês/Ano ou escolhe **Todos**, **Then** obtém o mesmo recorte de leitura que o administrador.
8. **Given** o **Ano** selecionado é o ano civil corrente, **When** o usuário abre o seletor **Mês**, **Then** **todos** os meses (janeiro a dezembro) estão disponíveis, **inclusive meses futuros** em relação à data de hoje.
9. **Given** contas com vencimento em um mês futuro do ano corrente (ex.: setembro/2026 estando em agosto/2026), **When** o usuário seleciona esse mês e ano, **Then** essas contas aparecem na listagem.
10. **Given** o ano civil corrente é 2026, **When** o usuário abre o seletor **Ano**, **Then** estão disponíveis os anos **2021 a 2031** (corrente ±5); anos fora desse intervalo **não** aparecem.

---

### User Story 3 - Combinar filtro Mês/Ano com demais recortes e totais da página (Priority: P1)

O filtro **Mês/Ano** funciona **junto** com os filtros já existentes (categoria, subcategoria de RH, status/alertas, busca por descrição, intervalo de vencimento). Os **quatro cards** de totais (**Total**, **Pago**, **A pagar**, **Vencido**) refletem **exatamente** o conjunto visível após **todos** os filtros, incluindo Mês/Ano.

**Why this priority**: Tabela plana + filtro mensal só entrega valor se os totais e filtros legados continuarem coerentes.

**Independent Test**: Filtrar RH + pendente + Agosto/2026; conferir que só entram linhas que satisfazem os três recortes e que os quatro cards batem com a soma das linhas visíveis.

**Acceptance Scenarios**:

1. **Given** filtro de categoria **Marketing** e Mês/Ano **Agosto/2026**, **When** a listagem é exibida, **Then** cada linha é Marketing **e** vence em agosto/2026.
2. **Given** filtro de status **Pendente** e Mês/Ano específico, **When** a listagem é exibida, **Then** não aparecem contas pagas daquele mês.
3. **Given** intervalo de vencimento (de/até) preenchido, **When** o usuário também escolhe um Mês/Ano específico, **Then** a listagem considera **ambos** (interseção); contas fora do intervalo ou de outro mês não aparecem.
4. **Given** qualquer combinação de filtros ativos, **When** o usuário lê os cards Total, Pago, A pagar e Vencido, **Then** os valores correspondem à soma das linhas visíveis na tabela (regra de parcelas mutuamente exclusivas já vigente: Total = Pago + A pagar + Vencido).
5. **Given** filtro Mês/Ano em **Todos** e filtro de categoria ativo, **When** a listagem é exibida, **Then** aparecem contas da categoria em **vários meses**, distinguíveis pela coluna Mês/Ano.

---

### User Story 4 - Ordenar e exportar com as novas colunas (Priority: P2)

O usuário **ordena** a tabela pelas colunas **Categoria**, **Mês/Ano** e **Tipo** (além das colunas já ordenáveis). Ao **exportar** (CSV, Excel e PDF), os arquivos incluem **Tipo**, **Categoria** e **Mês/Ano** com os mesmos valores exibidos na tela, no recorte filtrado no momento da exportação.

**Why this priority**: Colunas novas precisam ser úteis fora da tela (planilha, impressão) e comparáveis por ordenação.

**Independent Test**: Ordenar por Mês/Ano decrescente e por Categoria A–Z; exportar com filtro ativo e confirmar colunas nos três formatos.

**Acceptance Scenarios**:

1. **Given** a tabela com várias linhas, **When** o usuário clica no cabeçalho **Mês/Ano**, **Then** as linhas reordenam cronologicamente (asc/desc), com contas sem vencimento agrupadas de forma previsível no final em ordem ascendente.
2. **Given** a tabela com várias linhas, **When** o usuário ordena por **Categoria** ou **Tipo**, **Then** a ordem alfabética/lógica (Fixo antes de Variável ou conforme padrão já usado na página) é aplicada às linhas visíveis.
3. **Given** contas visíveis na listagem, **When** o usuário exporta para **CSV** ou **Excel**, **Then** o arquivo contém colunas **Tipo**, **Categoria** e **Mês/Ano** alinhadas aos valores da tela.
4. **Given** as mesmas contas visíveis, **When** o usuário exporta para **PDF**, **Then** o documento inclui **Tipo**, **Categoria** e **Mês/Ano** de forma legível.
5. **Given** exportação com filtro Mês/Ano em um mês específico, **When** o arquivo é gerado, **Then** só entram contas daquele recorte (mesma regra da tela).

---

### Edge Cases

- **Sem vencimento + filtro mensal específico**: conta sem data de vencimento **não** aparece quando Mês/Ano ≠ **Todos**; aparece quando **Todos** está selecionado, com **—** na coluna Mês/Ano.
- **Mês corrente sem contas**: filtro permanece no mês corrente; tabela vazia com mensagem clara; cards zerados coerentemente.
- **Conta paga com vencimento em mês M**: entra no filtro Mês/Ano = M; coluna Status continua **Pago**; cards refletem Pago, não Vencido.
- **Conta pendente vencida em mês passado**: com filtro no mês corrente, **não** aparece; com **Todos** ou filtro no mês do vencimento, aparece com Mês/Ano da data de vencimento.
- **Vencimento hoje**: entra no Mês/Ano do mês corrente; card **A pagar** (não Vencido), conforme regra vigente.
- **Meses futuros no filtro**: no ano corrente, o seletor **Mês** MUST listar janeiro a dezembro (inclusive meses posteriores à data de hoje); contas com vencimento futuro MUST aparecer ao selecionar o mês/ano correspondente.
- **Alcance do Ano**: o seletor **Ano** MUST oferecer **ano corrente ±5** (5 anos para trás e 5 para frente); ao mudar o ano civil de referência (virada de ano), o intervalo MUST recalcular em torno do novo corrente.
- **Filtro Mês/Ano + intervalo de vencimento conflitante** (ex.: Mês/Ano = Agosto/2026 e intervalo só julho): resultado vazio; sem erro confuso.
- **Categoria legado / pendente de reclassificação**: coluna Categoria mantém rótulo legível; filtro por categoria nomeada **não** inclui pendências (regra já vigente).
- **Remoção do agrupamento**: não há toggle Por mês / Por categoria; não há cabeçalhos colapsáveis de mês nem subtotais por grupo de mês/categoria na listagem (cards no topo permanecem).
- **Visualizador**: mesma tabela, filtros e exportação de leitura; sem criar/editar/excluir.
- **Ordenação + paginação**: se a listagem usar limite de registros, ordenação e filtro Mês/Ano aplicam-se ao conjunto carregado conforme regra já vigente da página.
- **Ordenação padrão**: ao abrir a página ou mudar filtros sem ordenação manual, a tabela MUST iniciar em **vencimento ascendente**; contas sem vencimento ficam após as datadas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A listagem de Contas a Pagar MUST ser apresentada como **tabela plana única**, **sem** agrupamento por mês nem por categoria (sem blocos colapsáveis nem subcabeçalhos de grupo por categoria dentro de mês).
- **FR-001a**: As colunas MUST aparecer nesta ordem da esquerda para a direita: **Descrição**, **Categoria**, **Mês/Ano**, **Fornecedor**, **Valor**, **Vencimento**, **Pagamento**, **Conta**, **Tipo**, **Status**, **Nota fiscal**, **Ações**.
- **FR-002**: A tabela MUST incluir a coluna **Tipo** em cada linha, exibindo **Fixo** ou **Variável** conforme o Tipo da conta a pagar gravado.
- **FR-003**: A tabela MUST incluir a coluna **Categoria** em cada linha, exibindo o nome legível da classificação (categoria de primeiro nível; para Recursos Humanos, **Categoria / Subcategoria**; para pendência de reclassificação, o rótulo legado/pendência já vigente).
- **FR-004**: A tabela MUST incluir a coluna **Mês/Ano** em cada linha, derivada da **data de vencimento** (mês por extenso em português + `/` + ano, ex.: **Agosto/2026**); contas sem vencimento MUST exibir **—**.
- **FR-005**: MUST existir filtro **Mês/Ano** na área de filtros com **dois seletores separados** (**Mês** e **Ano**, padrão Dashboard), opção **Todos** que ignora o recorte mensal, e rótulos consistentes com a coluna Mês/Ano (mês por extenso + ano).
- **FR-006**: Ao abrir a página Contas a Pagar, os seletores **Mês** e **Ano** MUST iniciar no **mês civil corrente** e **ano civil corrente**, exibindo somente contas com vencimento naquele mês/ano (contas sem vencimento excluídas desse recorte).
- **FR-007**: Com **Todos** selecionado no filtro Mês/Ano, a listagem MUST incluir contas de todos os meses (respeitando os demais filtros); contas sem vencimento MUST ser incluídas nesse modo; os seletores **Mês** e **Ano** MUST ficar desabilitados ou sem efeito enquanto **Todos** estiver ativo.
- **FR-007a**: O seletor **Mês** MUST permitir **janeiro a dezembro** em qualquer **Ano** selecionado, **inclusive meses futuros** no ano civil corrente (diferente da regra do Dashboard, adequada a vencimentos futuros de contas a pagar).
- **FR-007b**: O seletor **Ano** MUST listar **ano civil corrente ±5** (5 anos para trás e 5 para frente em relação à data de hoje).
- **FR-008**: O filtro Mês/Ano MUST combinar-se com os filtros existentes (categoria, subcategoria RH, status/alertas, descrição, intervalo de vencimento) por **interseção**.
- **FR-009**: Os cards **Total**, **Pago**, **A pagar** e **Vencido** MUST refletir o conjunto de linhas visíveis após **todos** os filtros, incluindo Mês/Ano, mantendo a regra de parcelas mutuamente exclusivas já vigente.
- **FR-010**: O usuário MUST poder **ordenar** a tabela pelas colunas **Tipo**, **Categoria** e **Mês/Ano**, além das colunas já ordenáveis.
- **FR-010a**: Ao carregar a listagem ou ao alterar filtros (sem ordenação escolhida pelo usuário na sessão), a tabela MUST exibir linhas em **vencimento ascendente** (data de vencimento mais próxima primeiro).
- **FR-011**: Exportações **CSV**, **Excel** e **PDF** da página MUST incluir as colunas **Tipo**, **Categoria** e **Mês/Ano** com os mesmos valores da listagem visível no momento da exportação, na mesma ordem lógica da tabela (Descrição, Categoria, Mês/Ano, Fornecedor, Valor, Vencimento, Pagamento, Conta, Tipo, Status, Nota fiscal; demais campos auxiliares conforme regra já vigente).
- **FR-012**: Papéis `admin` e `visualizador` MUST ver a mesma estrutura de tabela e filtros; o visualizador permanece somente leitura.
- **FR-013**: Esta feature MUST NOT alterar cadastro de contas, taxonomia de categorias, formulário de criação/edição (salvo refletir dados já gravados nas novas colunas), fluxo de caixa, Contas a Receber nem Dashboard.
- **FR-014**: O seletor de agrupamento **Por mês** / **Por categoria** (feature `034`) MUST ser **removido** ou substituído pelo novo modelo de tabela + filtro Mês/Ano; totais por cabeçalho de grupo mensal ou por subgrupo de categoria MUST NOT ser exibidos na listagem.

### Key Entities

- **Conta a Pagar**: Despesa com descrição, valor, datas (vencimento e pagamento), status, **Tipo** (Fixo/Variável), **Categoria** (e subcategoria RH quando aplicável), **Conta** (caixa), Fornecedor e demais atributos já existentes.
- **Competência Mês/Ano**: Recorte mensal derivado da **data de vencimento** (não da data de pagamento nem da criação); usado na coluna e no filtro homônimos.
- **Filtro Mês/Ano**: Par de seletores **Mês** + **Ano** (padrão Dashboard) com opção **Todos**; recorte temporal da listagem por competência de vencimento.
- **Totais da página**: Quatro indicadores — Total, Pago, A pagar, Vencido — calculados sobre o conjunto visível após filtros.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em **100%** das aberturas da página sem preferência prévia, o filtro Mês/Ano inicia no mês/ano civis correntes e a tabela mostra apenas contas daquele mês de vencimento (ou estado vazio claro se não houver).
- **SC-002**: Em **100%** dos casos de teste com contas em ≥2 meses, ao selecionar **Todos**, o usuário vê todas as competências na coluna Mês/Ano **sem** precisar expandir grupos colapsáveis.
- **SC-003**: Em **100%** das linhas inspecionadas, **Tipo**, **Categoria** e **Mês/Ano** coincidem com os dados gravados (vencimento para Mês/Ano; taxonomia oficial para Categoria).
- **SC-004**: Em **100%** das combinações testadas de filtro Mês/Ano + categoria + status, nenhuma linha visível viola os filtros ativos e os quatro cards batem com a soma das linhas (Total = Pago + A pagar + Vencido).
- **SC-005**: Usuário identifica despesas de um mês-alvo na **primeira tentativa** em ≤ **10 segundos** usando filtro Mês/Ano padrão ou **Todos** + coluna Mês/Ano (≥ **90%** em teste moderado com 5 participantes do time financeiro).
- **SC-006**: Em **100%** das exportações CSV, Excel e PDF geradas, as colunas **Tipo**, **Categoria** e **Mês/Ano** estão presentes e iguais à tela no momento da exportação.

## Assumptions

- **Mês/Ano** na coluna e no filtro usa sempre a **data de vencimento**, alinhado ao agrupamento por mês da feature `034`.
- Formato exibido: **{Mês por extenso}/{Ano}** (ex.: Agosto/2026), em português brasileiro.
- A coluna **Tipo** reutiliza o campo **Fixo/Variável** da conta a pagar (feature `045-contas-pagar-campos`); esta entrega garante presença na **tabela plana**, não redefine o formulário.
- A coluna **Categoria** reutiliza os rótulos já usados na página (`nomeCategoriaCatalogo` / taxonomia da feature `021`); RH exibe **Categoria / Subcategoria**.
- O filtro de **Categorias** (dropdown) **permanece** como filtro independente; o que deixa de existir é o **agrupamento visual** por categoria.
- Padrão ao abrir: **mês corrente** + **ano corrente** nos seletores separados, não **Todos** — o usuário escolhe **Todos** explicitamente para visão multi-mês.
- Controle do filtro Mês/Ano: **dois seletores Mês + Ano** (padrão Dashboard) + opção **Todos** — confirmado na sessão de esclarecimento de 2026-08-29.
- Meses futuros: no ano corrente, **todos** os meses (jan–dez) são selecionáveis, **inclusive posteriores à data de hoje** — confirmado na sessão de 2026-08-29 (distinto da regra do Dashboard).
- Seletor **Ano**: intervalo **corrente ±5** — confirmado na sessão de 2026-08-29.
- Ordenação padrão da tabela plana: **vencimento ascendente** — confirmado na sessão de 2026-08-29.
- Contas **sem vencimento** ficam fora do recorte de um mês específico, mas visíveis em **Todos**.
- Cards, regras de status (Pago / A pagar / Vencido), importação, comprovantes, ação de pagar e demais colunas existentes **permanecem**; ordem fixa confirmada na sessão de 2026-08-29: Descrição → Categoria → Mês/Ano → Fornecedor → Valor → Vencimento → Pagamento → Conta → Tipo → Status → Nota fiscal → Ações.
- Preferência de filtro Mês/Ano vale na **sessão da página**; não é obrigatório persistir após sair da tela nesta entrega.
- Papéis `admin` / `visualizador` seguem o produto existente.

## Out of Scope

- Novo agrupamento (por Tipo, por Fornecedor, por Conta ou mês+categoria em dois níveis).
- Alterar origem do Mês/Ano para data de pagamento ou data de criação.
- Gráficos, subtotais por grupo na listagem ou totais por cabeçalho de mês/categoria dentro da tabela.
- Persistir preferência de filtro Mês/Ano entre sessões ou entre usuários.
- Redesign completo da página além da passagem de agrupamento para tabela plana, filtro Mês/Ano e colunas novas.
- Mudanças no Dashboard, Fluxo de Caixa ou Contas a Receber.
- Alterar regras do campo Tipo no formulário (Fixo/Variável) — cobertas por `045-contas-pagar-campos`.
