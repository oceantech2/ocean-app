# Feature Specification: Correção do cálculo de férias

**Feature Branch**: `023-ferias-calculo`

**Created**: 2026-08-12

**Status**: Draft

**Input**: User description: "Revisar e ajustar lógica de cálculo de férias pois esta calculando errado"

## Clarifications

### Session 2026-08-12

- Q: Períodos ainda não aprovados entram no saldo? → A: Sim — pendentes e aprovados consomem o saldo; o aviso de pendência lista quem tem período não aprovado, mesmo com saldo 0.
- Q: E se apagarem o período que guarda os 30 dias de direito? → A: Transferir o direito anual para uma parcela restante; se for o último período do colaborador/ano, o registro do ano deixa de existir.
- Q: Intervalo de datas inválido pode ser salvo? → A: Não — impedir salvar enquanto as duas datas estiverem preenchidas e o fim for anterior ao início.
- Q: O que a coluna Direito mostra em cada linha? → A: Resumo por colaborador/ano (direito, total tirado, saldo); cada linha mostra só a parcela (datas, dias tirados, status).
- Q: Períodos com datas sobrepostas no mesmo ano? → A: Avisar sobreposição; permitir salvar; o saldo permanece a soma dos dias informados em cada parcela.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Saldo anual correto na lista (Priority: P1)

O usuário autenticado com acesso a Férias abre a página, filtra por colaborador e/ou ano e vê um **resumo por colaborador/ano** com direito anual, total de dias tirados e saldo (direito único menos todos os tirados, pendentes e aprovados). As linhas da lista mostram só cada parcela (datas, dias daquele período, status), sem repetir direito nem saldo como se fossem da linha.

**Why this priority**: O saldo errado é o problema central; decisões de aprovação e planejamento de RH dependem dele.

**Independent Test**: Cadastrar um colaborador com direito de 30 dias e duas parcelas (ex.: 10 e 8 dias tirados) e conferir no resumo direito 30, total tirado 18 e saldo 12; as duas linhas mostram 10 e 8 dias, sem saldo 20/−8 nem 52.

**Acceptance Scenarios**:

1. **Given** um colaborador com um único período no ano (direito 30, 10 dias tirados), **When** o usuário vê a página, **Then** o resumo daquele colaborador/ano mostra saldo 20.
2. **Given** um colaborador com duas parcelas no mesmo ano (direito anual 30; 10 e 8 dias tirados), **When** o usuário vê a página, **Then** o resumo mostra saldo 12 (não 20 e −8, nem 52, nem 42) e as linhas não exibem direito/saldo como valores da parcela.
3. **Given** dois colaboradores no mesmo ano, **When** o usuário vê a página, **Then** o saldo de um não influencia o saldo do outro.
4. **Given** o mesmo colaborador em anos diferentes, **When** o usuário vê a página, **Then** o saldo de um ano não mistura dias de outro ano.
5. **Given** um colaborador com direito 30 e um período pendente de 30 dias (ainda não aprovado), **When** o usuário vê a página, **Then** o resumo mostra saldo 0 (os dias pendentes já consomem o saldo) e o aviso de pendência ainda aparece para esse colaborador.

---

### User Story 2 - Dias tirados coerentes com as datas (Priority: P1)

Ao registrar ou editar um período, o usuário informa data de início e data de fim. O sistema preenche dias tirados com a quantidade de **dias corridos inclusivos** (início e fim contam). O usuário pode ajustar o número manualmente se precisar.

**Why this priority**: Datas e dias tirados são a base do saldo; um dia a mais ou a menos distorce o controle.

**Independent Test**: Informar início 01/03 e fim 10/03 e conferir 10 dias tirados; informar o mesmo dia nas duas datas e conferir 1 dia.

**Acceptance Scenarios**:

1. **Given** o formulário aberto, **When** o usuário informa início 01/03/2026 e fim 10/03/2026, **Then** dias tirados passam a 10 (dez dias corridos, incluindo início e fim).
2. **Given** o formulário aberto, **When** o usuário informa a mesma data em início e fim, **Then** dias tirados passam a 1.
3. **Given** data fim anterior à data início, **When** o usuário preenche as datas, **Then** o sistema não atribui dias tirados positivos a partir dessas datas, deixa claro que o intervalo é inválido e **não permite salvar** até as datas serem corrigidas ou uma delas ser limpa.
4. **Given** dias tirados preenchidos pelas datas, **When** o usuário altera o número manualmente, **Then** o valor informado prevalece até as datas serem alteradas de novo.

---

### User Story 3 - Fracionamento sem duplicar o direito (Priority: P2)

O admin registra o primeiro período do colaborador no ano com o direito anual (padrão 30, editável). Nos períodos seguintes do mesmo colaborador/ano (fracionamento), o direito anual **não é somado de novo**; o saldo disponível no formulário é o que ainda resta daquele ano.

**Why this priority**: Fracionar é o fluxo CLT já comunicado na tela; duplicar 30 dias a cada parcela é a causa mais comum de saldo inflado.

**Independent Test**: Criar o primeiro período (30 de direito, 14 tirados) e um segundo (sem novo direito, 10 tirados) e conferir saldo 6 e aviso de disponível coerente no segundo cadastro.

**Acceptance Scenarios**:

1. **Given** nenhum período do colaborador naquele ano, **When** o admin abre novo período, **Then** o direito padrão é 30 e o saldo disponível para tirar é 30 (não zero).
2. **Given** já existe período daquele colaborador/ano, **When** o admin abre novo período, **Then** o direito anual não é acrescido de mais 30 e o saldo disponível é direito anual menos dias já tirados nos outros períodos.
3. **Given** saldo disponível 16, **When** o admin escolhe datas que somam 20 dias, **Then** o sistema alerta que o período excede o saldo, sem impedir o salvamento se o admin confirmar o valor (o alerta é informativo; o saldo no resumo refletirá o excesso como negativo).
4. **Given** um período já salvo de 01/03 a 10/03, **When** o admin cadastra outro do mesmo colaborador/ano de 08/03 a 15/03, **Then** o sistema avisa a sobreposição, permite salvar e o saldo soma os dias das duas parcelas.
5. **Given** visualizador, **When** acessa Férias, **Then** continua somente leitura; o cálculo corrigido aparece no resumo, mas não há criação/edição.

---

### User Story 4 - Editar ou excluir período sem distorcer o saldo (Priority: P2)

Ao editar qualquer parcela (inclusive a que guarda o direito anual) ou ao excluir um período, o saldo do colaborador/ano é recalculado com as mesmas regras: um direito anual e a soma dos dias tirados restantes.

**Why this priority**: Hoje o saldo do formulário quebra ao editar o registro-base; correção incompleta se só a lista estiver certa.

**Independent Test**: Editar o período que contém o direito de 30, alterar só as datas/dias tirados, e conferir que o disponível continua baseado em 30 menos os outros períodos.

**Acceptance Scenarios**:

1. **Given** o período que concentra o direito anual (30) e outra parcela de 10 dias, **When** o admin edita o período de 30, **Then** o saldo disponível no formulário considera 30 menos os 10 da outra parcela (não zera o direito).
2. **Given** duas parcelas (direito 30 na primeira; 10 e 8 dias tirados), **When** o admin exclui a parcela que não concentra o direito, **Then** o saldo anual passa a 20 (30 − 10 da que restou).
3. **Given** duas parcelas (direito 30 só na primeira; 10 e 8 dias tirados), **When** o admin exclui a parcela que concentrava o direito, **Then** o direito 30 permanece no ano (transferido para a parcela restante) e o saldo passa a 22 (30 − 8).
4. **Given** um único período no ano, **When** o admin o exclui, **Then** aquele colaborador/ano deixa de ter saldo exibido (não há mais registro).

---

### Edge Cases

- Vários registros do mesmo colaborador/ano com direito 30 em cada um (dados já gravados): o direito anual usado no saldo é **um único valor** — o maior entre esses registros — e não a soma, para não inflar o saldo legado.
- Direito anual menor que 30 (proporcional ou acordo interno): o valor informado no primeiro período (ou o maior registrado) prevalece; o padrão 30 vale só na criação do primeiro período.
- Período sem datas, só com dias tirados: o saldo usa o número informado; não exige datas e o salvamento não é bloqueado por FR-008.
- Intervalo invertido (fim antes do início): salvamento bloqueado até correção.
- Saldo negativo (dias tirados acima do direito, pendentes ou aprovados): exibir o valor negativo de forma visível, sem ocultar o excesso.
- Período pendente que consome todo o direito: saldo 0 e aviso de pendência simultâneos.
- Filtro de ano na página: o resumo e o saldo usam apenas os períodos daquele colaborador naquele ano; não misturar anos.
- Importação em lote: as mesmas regras de direito único e soma de tirados se aplicam após a importação; não é objetivo desta feature redesenhar o importador, apenas o cálculo de saldo e de dias a partir das datas no fluxo da tela.
- Exclusão do período que concentrava o direito anual, restando outras parcelas: o direito não zera; é transferido para uma das parcelas restantes.
- Datas sobrepostas no mesmo colaborador/ano: aviso informativo; salvamento permitido; saldo = soma dos dias de cada parcela (não “une” os intervalos no calendário).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST calcular o **direito anual** de férias de um colaborador em um ano como um único número: o maior valor de dias de direito entre os períodos daquele colaborador naquele ano (não a soma dos direitos das parcelas).
- **FR-002**: O sistema MUST calcular o **saldo anual** como direito anual menos a soma dos dias tirados de todos os períodos daquele colaborador naquele ano, **incluindo períodos pendentes de aprovação** (não só os aprovados).
- **FR-003**: A página de férias MUST exibir um resumo por colaborador/ano com direito anual, total de dias tirados e saldo anual. As linhas de parcela MUST mostrar o período (datas, dias tirados daquela parcela, status e ações) e MUST NÃO apresentar direito nem saldo como se fossem valores da linha.
- **FR-004**: Ao criar o primeiro período do colaborador no ano, o sistema MUST sugerir 30 dias de direito e considerar 30 como saldo disponível para tirar (salvo o usuário alterar o direito).
- **FR-005**: Ao criar um período adicional (fracionamento) no mesmo colaborador/ano, o sistema MUST NÃO somar novo direito anual e MUST mostrar saldo disponível = saldo anual restante (sem contar o período que está sendo criado).
- **FR-006**: Ao editar um período, o saldo disponível no formulário MUST usar o direito anual do colaborador/ano (incluindo o direito do próprio registro, se for o maior) menos os dias tirados dos **outros** períodos, permitindo reatribuir os dias da parcela em edição.
- **FR-007**: Quando início e fim forem informados e o fim for igual ou posterior ao início, o sistema MUST preencher dias tirados com a contagem de dias corridos inclusiva (fim − início + 1, em calendário).
- **FR-008**: Quando início e fim estiverem preenchidos e o fim for anterior ao início, o sistema MUST NÃO preencher dias tirados com valor positivo derivado dessas datas, MUST deixar claro que o intervalo é inválido e MUST impedir o salvamento até o intervalo ser corrigido ou uma das datas ser removida. Períodos só com dias tirados (sem as duas datas) continuam salváveis.
- **FR-009**: O sistema MUST permitir que o usuário altere dias tirados manualmente após o preenchimento pelas datas.
- **FR-010**: Se os dias tirados (calculados ou manuais) ultrapassarem o saldo disponível do formulário, o sistema MUST avisar o excesso; o salvamento permanece permitido e o saldo no resumo poderá ficar negativo.
- **FR-011**: Aprovação, rejeição, filtros, papéis (admin altera; visualizador só consulta) e o restante do CRUD de férias MUST permanecer como hoje, salvo o critério do aviso de pendência definido em FR-012.
- **FR-012**: O aviso de pendência MUST listar cada colaborador/ano que possua ao menos um período **não aprovado**, mesmo quando o saldo anual for 0; MUST NÃO exigir saldo > 0 para exibir o aviso e MUST NÃO duplicar o mesmo colaborador/ano.
- **FR-013**: Ao excluir um período que concentrava o direito anual (era o único, ou o de maior direito) e ainda existirem outros períodos do mesmo colaborador/ano, o sistema MUST transferir esse direito anual para uma das parcelas restantes, de modo que o direito do ano não vire 0. Se o período excluído for o último daquele colaborador/ano, o direito desaparece junto com o registro.
- **FR-014**: Se o período em edição ou criação tiver início e fim preenchidos e esse intervalo se sobrepor a outro período do mesmo colaborador/ano que também tenha as duas datas, o sistema MUST avisar a sobreposição e MUST permitir salvar. O saldo anual MUST continuar sendo a soma dos dias tirados informados em cada parcela (não mesclar intervalos).

### Key Entities

- **Colaborador**: Pessoa da equipe à qual os períodos de férias se vinculam.
- **Período de férias (parcela)**: Um intervalo ou quantidade de dias tirados em um ano aquisitivo, com direito informado, dias tirados, datas opcionais e status de aprovação.
- **Direito anual**: Quantidade de dias a que o colaborador tem direito naquele ano; um valor por colaborador/ano, não por parcela.
- **Saldo anual**: Dias ainda não tirados (pode ser negativo se houver excesso).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos casos de teste com 1, 2 ou 3 parcelas no mesmo ano, o saldo anual conferido manualmente (direito único − soma dos tirados) coincide com o valor do resumo por colaborador/ano.
- **SC-002**: Em um conjunto de intervalos de datas (mesmo dia; 10 dias corridos; fim antes do início), 100% dos preenchimentos de dias tirados seguem a regra inclusiva; intervalo invertido não gera gravação.
- **SC-003**: Ao editar o período que concentra o direito anual, o usuário vê saldo disponível coerente com o direito anual em menos de 10 segundos, sem precisar recalcular no papel.
- **SC-004**: Nenhum colaborador/ano com parcelas de fracionamento (direito só no primeiro registro) apresenta no resumo um saldo igual à soma dos direitos das parcelas.
- **SC-005**: Usuários de RH conferem direito, total tirado e saldo de um colaborador no ano filtrado em uma única leitura do resumo, sem somar colunas das linhas de parcela.

## Assumptions

- A regra de negócio desejada é o modelo já comunicado na tela: 30 dias por período aquisitivo/ano, com fracionamento em até três partes; **não** se exige nesta feature validar automaticamente o mínimo de 5 dias nem a parcela de pelo menos 14 dias (permanecem orientação, não bloqueio).
- Dias de férias são **corridos** (calendário civil), não apenas dias úteis, alinhado à prática CLT de contagem de férias.
- “Ano” na tela continua sendo o ano aquisitivo informado pelo usuário, não um cálculo automático a partir da data de admissão.
- Não há recálculo proporcional automático por tempo de casa, faltas ou desligamento; o direito informado (padrão 30) é a fonte da verdade.
- Dados já gravados com direito repetido em várias parcelas são tratados pelo critério do maior valor, sem migração obrigatória nesta feature.
- Exportação CSV/PDF e importação continuam existindo; o arquivo de parcelas não deve apresentar direito/saldo como se fossem da linha. Totais anuais, se exportados, seguem o mesmo cálculo do resumo.
- Papéis e permissões atuais de Férias não mudam.
