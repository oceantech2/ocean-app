# Data Model: Dashboard — Gráfico DRE Empilhado

**Feature**: `003-dashboard-dre-chart` | **Date**: 2026-07-26  
**Spec**: [spec.md](./spec.md)

Sem novas tabelas. Agregação sobre entidades existentes.

## Entidades de origem (existentes)

### NF (`nfs`)

| Campo relevante | Uso no DRE |
|-----------------|------------|
| `valor_bruto` | Soma → Receita bruta |
| `status` | Apenas `paga` |
| `data_emissao` | Competência mês/ano |

### ContaPagar (`contas_pagar`)

| Campo relevante | Uso no DRE |
|-----------------|------------|
| `valor` | Soma → Despesa ou Impostos |
| `centro_custo` | Particiona Despesa vs Impostos (`impostos` → Impostos; demais → Despesa) |
| `data_vencimento` | Competência mês/ano; `NULL` → fora da agregação |
| `pago` | **Não filtra** (pagas + pendentes) |

### CentroCusto (enum)

| Valor | Papel no DRE |
|-------|----------------|
| `impostos` | Aspecto Impostos |
| `retirada_lucro`, `administrativo`, `salario`, `reembolsos`, `bonus`, `evento` (+ futuros ≠ impostos) | Aspecto Despesa |

## Entidades de visualização (DTO / resposta API)

### PontoMensalDRE

| Campo | Tipo | Regra |
|-------|------|--------|
| `mes` | int 1–12 | Mês civil |
| `receita_bruta` | number ≥ 0 | Σ NF pagas (`valor_bruto`) no mês |
| `despesa` | number ≥ 0 | Σ contas (centros ≠ impostos, **inclui** retirada de lucro) por vencimento |
| `impostos` | number ≥ 0 | Σ contas centro impostos por vencimento |
| `lucro` | number | `receita_bruta - despesa - impostos` (pode ser &lt; 0) |

### RespostaDreMensal

| Campo | Tipo | Regra |
|-------|------|--------|
| `ano` | int | Ano solicitado |
| `dados` | PontoMensalDRE[12] | Sempre 12 entradas; zeros quando sem lançamentos |

### SeleçãoLabelsDRE (estado UI, não persistido)

| Campo | Default |
|-------|---------|
| `receita_bruta` | true |
| `despesa` | true |
| `impostos` | true |
| `lucro` | true |

### Campos derivados só na UI (não obrigatórios na API)

| Campo | Regra |
|-------|--------|
| `lucro_empilhado` | `max(0, lucro)` — série verde empilhada |
| `mesLabel` | `Jan`…`Dez` |

## Validação / invariantes

- Para cada mês com `lucro >= 0`: `receita_bruta ≈ despesa + impostos + lucro` (igualdade aritmética da definição).
- Com `lucro < 0`: pilha visual = despesa + impostos (se ativos); tooltip mostra `lucro` real.
- Retirada de lucro entra em **Despesa** (não em Impostos nem como linha separada).
- Relação: um `RespostaDreMensal` → 12 `PontoMensalDRE`; UI pode filtrar o array para o eixo (FR-007).

## Estado / ciclo de vida

Não há CRUD de DRE. Ciclo: request autenticado → agregação → render → toggles de legenda em memória → descartados no unload.
