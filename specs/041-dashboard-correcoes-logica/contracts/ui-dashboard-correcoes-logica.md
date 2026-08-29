# Contract: UI — Dashboard Correções de Lógica e DRL

**Feature**: `041-dashboard-correcoes-logica` | **Date**: 2026-08-27  
**Spec**: [spec.md](./spec.md) · **Data model**: [data-model.md](../data-model.md)  
**Baseline UI**: [040 ui-dashboard-secoes-cards](../../040-dashboard-secoes-cards/contracts/ui-dashboard-secoes-cards.md)

## Escopo

Contrato de correções sobre a Dashboard da feature 040. Sem endpoints REST novos. Consumidores: `Dashboard.tsx`, `dashboardDespesas.ts`, `dashboardSaldo.ts` (novo).

## Cabeçalho (Head)

| Elemento | MUST | MUST NOT |
|----------|------|----------|
| Título Dashboard | Presente | — |
| Filtro Mês | Presente; opção "Todos os meses" | — |
| Filtro Ano | Presente | — |
| Comparar / ano comparativo | — | Checkbox, select ou equivalente |

## Meta de Receita Anual

| Regra | Detalhe |
|-------|---------|
| Realizado exibido (esquerda) | Receita Líquida acumulada no ano filtrado (YTD ou ano completo) |
| Percentual na barra | `realizado / meta × 100`; texto branco dentro da barra quando largura ≥ limiar 18% (igual meta mensal) |
| Meta (direita) | `valor_meta` cadastrado |

## Saldo — cores (FR-009/FR-010)

| Card | Esquema Tailwind (referência) |
|------|-------------------------------|
| Contas correntes 1–3 | `green-50`, `border-green-200`, textos `green-600`/`green-700` (dark: `green-900/20`, etc.) |
| Conta Investimento | `blue-50`, `border-blue-200`, textos `blue-600`/`blue-700` (dark: `blue-900/20`, etc.) |

## Saldo — cálculo por conta corrente (FR-002)

Para cada slot com conta ativa:

```text
saldo_exibido =
  saldo_base(recorte)
  + Σ receita_bruta (NFs pagas, caixa=conta, recorte)
  − Σ impostos (bruto − líquido das mesmas NFs)
  − Σ despesas pagas operacionais (fixa|variável, ≠ impostos, caixa=conta, recorte)
```

| Regra | Detalhe |
|-------|---------|
| Por conta | Valores MUST diferir entre slots quando movimentos diferem |
| Pendentes | MUST NOT entrar |
| Investimento | Saldo cadastral; MUST NOT usar fórmula acima |
| Sem conta | "—" / "Sem conta" |

## Despesa — exclusão impostos (FR-004/FR-005)

MUST NOT incluir categoria `impostos` (e aliases case-insensitive) em:

- Card Despesas Fixas
- Card Despesas Variáveis
- Card Despesas Pendentes
- Donuts Despesas [Mês] e Despesas [Ano] (total e fatias)

## DRL (FR-006/FR-007/FR-008)

| Atributo | Regra |
|----------|-------|
| Tipo | `LineChart` — uma linha |
| Intervalo | Meses com `valor > 0`, de jan/2024 até mês corrente |
| Eixo X | `mesLabel` formato `Jan/24`, `Fev/24`, … |
| Série | Única — "Receita Líquida" |
| Comparação ano anterior | MUST NOT existir |
| Filtro ano Head | MUST NOT limitar pontos do DRL |

Meses sem lançamento: **omitidos** (sem ponto zero, sem tick no eixo).

## Mapa de fórmulas (normativo)

```text
meta_anual_pct     = Σ RL(ano, meses 1..limite) / meta_anual * 100
saldo_cc(conta)    = ver seção Saldo acima
drl_ponto          = faturamentoLiquidoMes(ano).dados[mes].valor  (se > 0)
impostos_nf        = valor_bruto - valor_liquido  (por NF alocada)
```

## Papéis

| Papel | Correções de cálculo/UI | Editar meta |
|-------|-------------------------|-------------|
| admin | Sim | Sim |
| visualizador | Sim | Não |

## Fora de escopo

- Novos endpoints ou migrations
- Outras páginas (Fluxo de Caixa, Relatórios)
- Alteração da estrutura de seções da 040
