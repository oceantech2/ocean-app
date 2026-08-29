# Data Model: Dashboard — Seções, Títulos e Reordenação de Cards

**Feature**: `040-dashboard-secoes-cards` | **Date**: 2026-08-27  
**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

## Visão geral

```text
[ Filtro mês/ano Dashboard ]
        │
        ├─► resumo-financeiro ──► Receita Bruta / Líquida / Pendente
        ├─► impostos/de-contas ──► Card Impostos (R$ + alíquota)
        ├─► contas (listar) ──► Fixas / Variáveis / Pendentes ──► Lucro
        ├─► metas ──► Meta Mensal / Anual
        ├─► contas-correntes + saldos + movimentos ──► Saldo CC1–3 + Investimento
        ├─► custo-por-categoria ──► Centro de Despesa (sem impostos)
        └─► dre-mensal + faturamento-liquido-mes ──► DRE + DRL
```

Schema físico **inalterado**. Entidades abaixo são **visões de apresentação** agregadas no client.

## Entidades de apresentação

### Seção do Dashboard

| Atributo | Descrição |
|----------|-----------|
| `titulo` | Metas, Receita, Despesa, Resultado, Saldo, Centro de Despesa, Demonstrativo de Resultado |
| `ordem` | 1…6 (Despesa e Resultado compartilham a linha 3) |
| `filhos` | Cards ou gráficos da seção |

### Card indicador

| Atributo | Tipo | Notas |
|----------|------|-------|
| `rotulo` | string | Texto visível |
| `valor_principal` | number \| null | R$; `null` → "—" |
| `valor_secundario` | number \| string \| null | Alíquota %, % Lucro, subtítulo |
| `recorte` | período | Herdado do filtro Dashboard |

### Natureza da despesa (mapa canônico)

Não persistido. Função `natureza(categoria) → fixa | variavel | excluida`.

| Código categoria | Natureza |
|------------------|----------|
| `adm_financeiro`, `recursos_humanos`, `beneficios`, `tecnologia` | fixa |
| `operacoes`, `marketing`, `comercial` | variavel |
| `impostos` | excluida |
| demais (catálogo dinâmico) | variavel (default) |

### Totais de Despesa (derivados)

| Campo | Regra |
|-------|--------|
| `despesas_fixas` | Σ valor contas: pago ∧ natureza=fixa ∧ ≠ impostos ∧ vencimento ∈ recorte |
| `despesas_variaveis` | Σ valor contas: pago ∧ natureza=variavel ∧ ≠ impostos ∧ vencimento ∈ recorte |
| `despesas_pendentes` | Σ valor contas: ¬pago ∧ ≠ impostos ∧ vencimento ∈ recorte |

### Lucro (derivado)

| Campo | Regra |
|-------|--------|
| `lucro_rs` | `receita_liquida - despesas_fixas - despesas_variaveis` |
| `lucro_pct` | `lucro_rs / receita_bruta * 100` se `receita_bruta > 0`; senão indisponível |

### Impostos (card)

| Campo | Origem |
|-------|--------|
| `valor_imposto` | `GET /impostos/de-contas` (mês ou Σ YTD) |
| `percentual_imposto` | mesmo endpoint (mês) ou Σ imposto / Σ faturamento (YTD) |
| `aliquota_exibivel` | percentual se base > 0; senão "—" |

### Saldo por slot

| Slot | Fonte |
|------|--------|
| CC 1–3 | Até 3 primeiras de `GET /contas-correntes?ativas=true` + `saldoVisivel` |
| Investimento | Saldo histórico `conta === investimento` (como hoje) |

| Campo | Notas |
|-------|--------|
| `rotulo` | `nome` da CC ou `Conta Corrente {n}` |
| `saldo` | number \| null |
| `vazio` | true se slot sem conta |

### Centro de Despesa (pós-filtro)

Mesmo shape de `custo-por-categoria`, **após** remover `impostos` e recalcular `total` e `percentual`.

## Regras de validação (apresentação)

1. Cards da seção Despesa **nunca** incluem categoria `impostos`.
2. Fixas/Variáveis só somam `pago === true`.
3. Pendentes só somam não pagas.
4. Lucro % e alíquota não inventam denominador zero.
5. Máximo 3 slots de conta corrente; slots extras omitidos.

## Transições

N/A — sem estados persistidos novos. Filtro mês/ano apenas redefine o recorte das agregações.
