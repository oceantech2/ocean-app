# Data Model: DRE — Linha Impostos (Contas Imposto / DAS)

**Feature**: `075-dre-linha-impostos`  
**Date**: 2026-09-16

Nenhuma tabela nova. A feature só redefine a agregação lógica do aspecto Impostos do DRE.

## Entidades persistidas (leitura)

### ContaPagar (`contas_pagar`)

| Campo | Uso nesta feature |
|-------|-------------------|
| `valor` | Soma em Impostos (e em Despesa se não for imposto) |
| `tipo_despesa` | `"imposto_das"` → Impostos; `"fixo"` / `"variavel"` → elegível a Despesa |
| `data_vencimento` | Aloca o mês/ano no DRE; `NULL` → fora de Impostos e Despesa |
| `data_pagamento` / `pago` | **Não** usados para alocar Impostos do DRE |
| `categoria` | Irrelevante para Impostos (Tipo prevalece) |

### NF (`nfs`)

| Campo | Uso nesta feature |
|-------|-------------------|
| `valor_bruto`, `status`, `excluida_em`, `data_emissao` | Receita bruta do DRE (inalterado) |
| `valor_imposto` | **Não** alimenta mais Impostos do DRE; continua no **card** Impostos |

## Entidade derivada: Série mensal DRE

Agregado por `(ano, mes)` retornado por `dre-mensal` (12 meses):

| Campo | Regra |
|-------|--------|
| `receita_bruta` | Σ NFs pagas, emissão no mês (inalterado) |
| `impostos` | Σ Contas `tipo_despesa=imposto_das` com vencimento no mês |
| `despesa` | Σ Contas `tipo_despesa != imposto_das` com vencimento no mês |
| `lucro` | `receita_bruta − despesa − impostos` (pode ser negativo) |

### Validação / invariantes

1. Conta com `tipo_despesa=imposto_das` **nunca** entra em `despesa` e `impostos` do mesmo mês simultaneamente.
2. Conta `imposto_das` sem `data_vencimento` não entra em nenhum mês.
3. `dados.length === 12` e `mes` ∈ 1..12.
4. Card Impostos (Dashboard) **não** é entidade do DRE; permanece derivado de NFs.

## Relacionamentos (conceituais)

```text
ContaPagar (imposto_das, vencimento M)
    └──► Impostos[M] do DRE

ContaPagar (!imposto_das, vencimento M)
    └──► Despesa[M] do DRE

NF (paga, emissão M)
    └──► Receita bruta[M] do DRE
    └──► Card Impostos (fora desta feature)

Lucro[M] = f(Receita bruta[M], Despesa[M], Impostos[M])
```

## Transições de estado

Não há. Somente leitura agregada.
