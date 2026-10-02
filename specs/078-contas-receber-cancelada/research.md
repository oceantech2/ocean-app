# Research: Status "Cancelada" em Contas a Receber

**Feature**: `078-contas-receber-cancelada` | **Data**: 2026-10-01 | **Spec**: [spec.md](./spec.md)

Levantamento feito no código atual (backend `backend/app`, frontend `frontend/src`). Cada item registra a decisão, o porquê e as alternativas descartadas.

## Achados que motivam o desenho

1. **Edição "descancela" a conta.** `atualizar_nf` (`backend/app/api/routes/nfs.py`, ~L672) recalcula `status` sempre que `data_pagamento` ou `data_vencimento` vêm no payload, e o formulário de `NFs.tsx` sempre envia os dois. Resultado: editar qualquer campo de uma conta cancelada a transforma em Pendente/Vencida/Recebida e ela volta aos cálculos.
2. **Não há como cancelar pela API.** `NFUpdate` (`backend/app/schemas.py`) não tem campo de status; o único caminho é a importação de planilha (`excel_io.parse_nfs_xlsx` → `_aplicar_campos_arquivo`).
3. **Comissões ignoram o cancelamento.** Nenhum total de comissão cruza com a situação da conta. A API de comissões (`serializar_bonus`/`BonusResponse`) nem expõe a situação da conta vinculada; todos os totais de `Bonus.tsx` são calculados no navegador.
4. **Importação sobrescreve o cliente.** Ao cancelar uma conta existente, `_aplicar_campos_arquivo` grava `razao_social = "Cancelada"`, perdendo o nome real.
5. **Importação cancela conta Recebida.** O cancelamento via planilha é aplicado mesmo com `data_pagamento` e `caixa` preenchidos.
6. **Alertas de vencimento incluem canceladas.** `services/email.py::coletar_alertas` filtra só `status != PAGA`, então canceladas entram nos alertas (endpoint `/alertas` e e-mail diário).
7. **Canceladas antigas — contagem**: banco local em 2026-10-01 tem **0** contas `CANCELADA` com `data_pagamento` (só 5 contas, todas Pendentes). Produção ainda precisa ser verificada (T026).
8. **Canceladas antigas já ficam fora do caixa.** `FluxoCaixa.tsx` carrega só `status='paga'` e `fluxoCaixaMovimentos.elegivelReceber` exclui `cancelada` explicitamente; o saldo do Dashboard (`dashboardSaldo.ts`) também. Logo, canceladas antigas com recebimento **já não aparecem** no Fluxo de Caixa hoje.

## Inventário de cálculos (situação atual)

| Local | O que calcula | Exclui canceladas hoje? | Ação |
|---|---|---|---|
| `relatorios.py` `pipeline_receita`, `receita_caixa`, `aging_recebiveis`, `proximo_recebimento` | Pipeline, Por Caixa (inclui imposto), aging, próximo recebimento | Sim (explícito) | Nenhuma |
| `relatorios.py` `faturamento_liquido_por_mes`, `faturamento_por_cliente`, `contratos_assinados`, `resumo_financeiro`, `dre_mensal` | Receita por mês/cliente, DRE | Sim (implícito: `status == PAGA/PENDENTE`) | Nenhuma — fica correto quando o achado 1 for corrigido |
| `relatorios.py` `fechamentos_por_tipo`, `propostas_enviadas`, `placement_por_consultor` | Contagens/somas por tipo, emissão, consultor | **Não** | Adicionar filtro de conta válida |
| `relatorios.py` `bonus_mensal` | Σ comissões por mês | **Não** (sem join com conta, sem soft delete) | Excluir comissões de conta cancelada ou excluída |
| `metas.py` `progresso_meta`, `_nfs_afetaveis` | Meta realizada; recálculo de alíquota | Sim (implícito / explícito) | Nenhuma |
| `impostos.py` `impostos_de_contas`, `faturamento_nfs_mes` | Faturamento do mês (página Impostos e alíquota do tooltip) | Sim (implícito) | Nenhuma |
| `nfs.py` `resumo_nfs` | Cards da listagem (recebido/pendente/vencido) | Sim (implícito) | Nenhuma |
| `services/email.py` `coletar_alertas` | Alertas "a vencer / vencida" | **Não** | Excluir canceladas |
| `FluxoCaixa.tsx`, `fluxoCaixaMovimentos.ts`, `dashboardSaldo.ts` | Entradas de caixa e saldos | Sim (explícito) | Nenhuma |
| `useNotificacoes.ts`, `Calendario.tsx` | Contador de vencidas, eventos | Sim | Nenhuma |
| `Bonus.tsx` (`porColaborador`, `graficoDados`, `totalAba`, `totalCol`, CSV) | Todos os totais de comissão/bônus | **Não** | Excluir comissões de conta cancelada |

Não há totais por coluna na listagem de `NFs.tsx` (só os cards de `resumo_nfs`). O contador "N registro(s)" e a exportação CSV/XLSX listam canceladas, o que a spec permite (não são cálculos financeiros).

## Decisões

### D1 — Representação do cancelamento

- **Decisão**: Reaproveitar o valor existente `StatusNF.CANCELADA` como status persistido. O `PUT /nfs/{id}` ganha um campo de escrita `situacao` (`pendente` | `recebida` | `cancelada`), opcional.
- **Rationale**: Todas as consultas que já excluem canceladas continuam funcionando sem mudança; o rótulo, a cor e o filtro já existem na interface.
- **Alternativas**: Booleano `cancelada` separado do status (duplicaria a regra em ~20 consultas); status derivado só de datas (impossível: cancelar não é uma data).

### D2 — Cancelamento sobrevive a edições

- **Decisão**: Em `atualizar_nf`, se a conta está `CANCELADA` e o payload não traz `situacao` de reativação (`pendente`/`recebida`), o status **não** é recalculado, mesmo que venham datas. Se o payload tentar registrar `data_pagamento` numa conta cancelada sem reativá-la, a API responde 409 (`NF_CANCELADA_PAGAMENTO`).
- **Rationale**: Corrige o achado 1, pré-requisito de FR-005/FR-006. Sem isso, qualquer edição desfaz o cancelamento em silêncio.
- **Alternativas**: Frontend parar de enviar datas (frágil; outras chamadas, como o modal de pagamento, continuariam quebrando).

### D3 — Bloqueio de cancelamento de conta Recebida (FR-015)

- **Decisão**: `situacao = cancelada` numa conta com `status = PAGA` → 409 `NF_CANCELAR_RECEBIDA`, com mensagem "Volte a conta para Pendente e salve antes de cancelar." Na interface, a opção Cancelada fica desabilitada quando a conta está Recebida, com a mesma explicação. Cancelar uma conta Pendente/Vencida grava `CANCELADA` e mantém os demais campos (inclusive `caixa`); como não há `data_pagamento`, não existe entrada de caixa.
- **Rationale**: Garante a invariante "conta cancelada a partir desta feature nunca tem recebimento" (SC-007) também contra chamadas diretas à API.
- **Alternativas**: Permitir pendente + cancelada no mesmo salvamento (contraria a resposta P1 = B da spec, que exige salvar como Pendente antes).

### D4 — Decisão do Ocean prevalece sobre a planilha (FR-014, reversão de canceladas pela planilha)

- **Decisão**: Nova coluna `nfs.situacao_definida_ocean BOOLEAN NOT NULL DEFAULT FALSE`. Vira `TRUE` sempre que o `admin` muda o estado de cancelamento pelo Ocean (cancelar ou reativar). Na importação com atualização:
  - `situacao_definida_ocean = TRUE` e conta cancelada, linha ativa na planilha → atualiza campos de negócio, **mantém** `CANCELADA`.
  - `situacao_definida_ocean = TRUE` e conta ativa, linha cancelada na planilha → **não** cancela nem altera a conta; registra em `cancelamentos_ignorados` com motivo `reativada_no_ocean`.
  - `situacao_definida_ocean = FALSE` → comportamento atual (planilha manda), salvo D5.
- **Rationale**: Uma única marca cobre os dois sentidos da precedência pedidos na clarificação. Coluna booleana simples, sem impacto em consultas existentes.
- **Alternativas**: Guardar `cancelamento_origem` (`ocean`/`planilha`) — não cobre a reativação; tabela de histórico de situação — complexidade desnecessária (constitution V).

### D5 — Planilha não cancela conta Recebida (FR-016)

- **Decisão**: Na importação, linha cancelada + conta com `status = PAGA` → conta inalterada e item em `cancelamentos_ignorados` com motivo `recebida_no_ocean`. A resposta da importação ganha a lista `cancelamentos_ignorados: [{linha, numero, nf_id, motivo}]`, exibida num painel de resultado após a importação (hoje erros só aparecem como contagem em toast).
- **Rationale**: Cumpre FR-016 e torna o conflito visível ao usuário.
- **Alternativas**: Reutilizar `erros` (misturaria conflito de negócio com falha técnica e continuaria invisível na interface).

### D6 — Não sobrescrever o nome do cliente ao cancelar via planilha

- **Decisão**: `_aplicar_campos_arquivo` deixa de gravar `razao_social = "Cancelada"` em contas existentes; mantém o nome atual. Contas **novas** criadas já canceladas continuam com "Cancelada" (a planilha não traz outro nome).
- **Rationale**: FR-012 exige preservar os dados do lançamento; sem isso, toda reativação futura exigiria redigitar o cliente. Contas já afetadas no passado não são corrigidas automaticamente (edge case da spec).
- **Alternativas**: Manter o comportamento (perda de dados contínua).

### D7 — Canceladas antigas com recebimento (FR-017)

- **Decisão**: Nenhuma migração de dados. Detecção derivada: `status = CANCELADA AND data_pagamento IS NOT NULL` → campo calculado `revisar_cancelamento: true` na resposta da conta. A listagem mostra o aviso "Cancelada com recebimento — revisar". O aviso some quando o `admin` escolhe Recebida (volta aos cálculos e ao caixa) ou Pendente (limpa o recebimento) e depois cancela de novo.
- **Rationale**: A partir de D3/D5, nenhuma conta nova chega a esse estado; a condição identifica exatamente os casos antigos sem coluna extra.
- **Ajuste na spec**: o achado 7 mostra que essas contas **já não aparecem** no Fluxo de Caixa nem no saldo. "Não alterar automaticamente" significa manter esse comportamento; a spec foi corrigida (FR-017, edge case, introdução da história 2 e SC-007) para não exigir que voltem ao caixa, o que mudaria saldos na implantação.
- **Alternativas**: Coluna `requer_revisao` preenchida por migração (redundante com a condição derivada).

### D8 — Filtro único de "conta válida" no backend

- **Decisão**: Criar `backend/app/services/nf_validas.py` com `filtro_nf_valida()` (`status != CANCELADA` e `excluida_em IS NULL`) e `filtro_bonus_valido()` (comissão sem conta vinculada **ou** conta vinculada válida, via `outerjoin`). Aplicar onde hoje não há exclusão: `fechamentos_por_tipo`, `propostas_enviadas`, `placement_por_consultor`, `bonus_mensal`, `coletar_alertas`. Consultas que já excluem (explícita ou implicitamente) não são reescritas.
- **Rationale**: Menor mudança que cobre FR-006/FR-009; o helper evita divergência futura (FR-009 consistência entre telas).
- **Alternativas**: Reescrever todas as consultas com o helper (maior risco de regressão sem ganho funcional).

### D9 — Comissões de conta cancelada (FR-007, FR-007a)

- **Decisão**: `serializar_bonus` e `BonusResponse` passam a expor `nf_cancelada: bool` (já há `joinedload(Bonus.nf)`). Em `Bonus.tsx`, linhas com `nf_cancelada` ficam esmaecidas com badge "Conta cancelada" e são excluídas de **todos** os totais (por colaborador, gráfico, total da aba, total da coluna, liberado). O CSV mantém as linhas e ganha a coluna "Conta cancelada" (Sim/Não). Liberar e pagar continuam permitidos (não alteram cálculos). Valores das comissões não são alterados ao cancelar/reativar (FR-012).
- **Rationale**: Atende a resposta P2 = A (todas saem, pagas ou não) e a clarificação de manter visíveis com aviso.
- **Alternativas**: Filtrar no backend (esconderia as linhas, contrariando FR-007a).

### D10 — Formulário e confirmação

- **Decisão**: Em `NFs.tsx`, o seletor de edição passa de Pendente/Recebida para Pendente/Recebida/Cancelada (`pagamento_estado` ganha `cancelada`). Criação não oferece Cancelada. Ao salvar com Cancelada, `window.confirm` com o texto "Cancelar esta conta? Receita, imposto e todas as comissões vinculadas deixarão de ser considerados nos cálculos." Payload de edição passa a enviar `situacao`. `visualizador` continua sem edição (rota `PUT` já exige `require_admin`).
- **Rationale**: Segue o padrão do produto (modal + `window.confirm` + `react-hot-toast`).

### D11 — Auditoria

- **Decisão**: Mudanças de situação registram `registrar_auditoria(..., "editar", "NF", id, "Situação: Pendente → Cancelada")` (e o inverso). Itens de `cancelamentos_ignorados` registram uma linha de auditoria por conta na importação.
- **Rationale**: `AuditLog.acao` é `String(20)`; reaproveitar "editar" evita novo valor de ação.

### D12 — Migração de schema

- **Decisão**: `ALTER TABLE nfs ADD COLUMN IF NOT EXISTS situacao_definida_ocean BOOLEAN NOT NULL DEFAULT FALSE` em `_migrar()` de `backend/app/main.py`, no mesmo padrão das colunas recentes (`excluida_em`, `aliquota_imposto`). Coluna também declarada no model `NF`.
- **Rationale**: O projeto não usa Alembic; `ADD COLUMN ... DEFAULT` constante é instantâneo no PostgreSQL 16.

### D13 — Estratégia de validação

- **Decisão**: O projeto não tem suíte de testes automatizados (sem pytest/vitest). A validação segue o [quickstart.md](./quickstart.md): cenários manuais na interface + consultas SQL de conferência dos totais antes/depois.
- **Rationale**: Criar infraestrutura de testes está fora do escopo (constitution V).
- **Alternativas**: Introduzir pytest só para esta feature (escopo extra não pedido).
