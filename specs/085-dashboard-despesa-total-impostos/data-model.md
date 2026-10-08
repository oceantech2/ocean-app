# Data Model: Cards Total de Despesas e Impostos Pagos

**Feature**: `085-dashboard-despesa-total-impostos` | **Date**: 2026-10-08

Nenhuma entidade persistida nova. Apenas indicadores derivados no Dashboard.

## Indicador: Total de Despesas

| Campo | Tipo | Origem |
|-------|------|--------|
| valor | número (R$) | `despesasTotais.fixas + despesasTotais.variaveis` (regras da feature 059) |

- Recorte: o mesmo de Fixas/Variáveis (mês selecionado; modo só-ano = ano civil completo).
- Não inclui Despesas Pendentes nem Contas Tipo Imposto / DAS.

## Indicador: Impostos Pagos

| Campo | Tipo | Origem |
|-------|------|--------|
| valor | número (R$) ou `null` (falha de carga) | `impostos_recolhidos` de `GET /relatorios/receita-caixa` |
| rotulo | texto | Mês/janela de origem |

### Regra de período

| Filtro do Dashboard | Período de origem | Composição |
|---------------------|-------------------|------------|
| Mês M/A (M > 1) | M−1/A | `receitaCaixa(A, M−1)` |
| Janeiro/A | Dezembro/A−1 | `receitaCaixa(A−1, 12)` |
| Só-ano A | Dez/A−1 .. Nov/A | `receitaCaixa(A−1, 12) + receitaCaixa(A) − receitaCaixa(A, 12)` |

### Validações

- Não varia com o toggle Bruto/Líquido.
- Não entra em Total de Despesas nem em Resultado Competência/Caixa.
- Falha em qualquer consulta da composição → `null` (card exibe "—").

## Helpers puros (`frontend/src/utils/dashboardDespesas.ts`)

- `mesAnterior(ano, mes) → { ano, mes }` — Janeiro → Dezembro do ano anterior.
- `rotuloImpostosPagos(ano, mes, mesesNome) → string` — texto auxiliar do card.
