# Data Model: Despesas & Resultado no Dashboard

**Feature**: `059-dashboard-despesas-resultado` | **Date**: 2026-09-10

Sem migration. Reuso de `ContaPagar` e das visões de receita já derivadas em 056–058.

## Entidades persistidas (reuso)

### ContaPagar (`contas_pagar`)

| Campo | Uso nesta feature |
|-------|-------------------|
| `tipo_despesa` | `'fixo'` \| `'variavel'` — classifica Fixas vs Variáveis |
| `data_pagamento` | Filtro de Fixas/Variáveis (no período); ausência → candidata a Pendentes |
| `data_vencimento` | Filtro de Pendentes (no período) |
| `valor` | Soma absoluta (sem bruto/líquido) |
| `categoria` | Excluir imposto via regra `categoriaEhImpostos` |
| `pago` | **Ignorado** para os três cards canônicos |

### NF / Conta a Receber (reuso indireto)

Receita **não** é re-agregada aqui: usa-se `pipeline.fechado` e `receitaCaixa.recebido` (dual-base).

## Visões derivadas (não persistidas)

### Totais de Despesa (período)

| Métrica | Regra | Toggle |
|---------|-------|--------|
| Fixas | tipo fixo ∧ `data_pagamento` no período ∧ ¬imposto | Não |
| Variáveis | tipo variável ∧ `data_pagamento` no período ∧ ¬imposto | Não |
| Pendentes | `data_vencimento` no período ∧ `data_pagamento` vazio ∧ ¬imposto | Não |
| `despesas_totais` | Fixas + Variáveis | Não |

Período: `mes`+`ano` ou só `ano` (meses 1–12).

### Resultado

| Card | Receita | Fórmula | Toggle |
|------|---------|---------|--------|
| Resultado Competência | `pipeline.fechado` (visão ativa) | receita − despesas_totais | Afeta só receita |
| Resultado Caixa | `receitaCaixa.recebido` (visão ativa) | receita − despesas_totais | Afeta só receita |

Percentual: `resultado / receita * 100` se receita > 0; senão indisponível.

## Estado de UI (sessão)

| Estado | Origem |
|--------|--------|
| `despesasTotais` | `totaisDespesa(contasPagarLista, recorte)` |
| `visaoReceita` | 057 — afeta só Resultado (via receita) |
| `pipeline` / `receitaCaixa` | 056–058 — fontes de receita |

Sem novo estado persistido.

## Validação / exclusões

- Categoria imposto → fora de Fixas, Variáveis e Pendentes
- Sem `data_pagamento` → fora de Fixas/Variáveis
- Sem `data_vencimento` ou fora do período → fora de Pendentes
- `pago=true` sem pagamento + vencimento no período → **só** Pendentes
- `pago=false` com `data_pagamento` no período → entra em Fixas/Variáveis pelo tipo
- Receita zero → resultado = −despesas_totais (ou 0−despesas); % omitido

## Relacionamentos

```text
Dashboard (mes/ano, visaoReceita)
  ├── contasService.listar → totaisDespesa → Fixas / Variáveis / Pendentes
  ├── GET pipeline-receita → receita_comp → Resultado Competência
  ├── GET receita-caixa    → receita_caixa → Resultado Caixa
  ├── Centro de Despesa    → INALTERADO (pode divergir)
  └── Demonstrativo        → INALTERADO (pode divergir)
```
