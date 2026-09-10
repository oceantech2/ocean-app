# Data Model: Aging de Recebíveis

**Feature**: `060-dashboard-aging-recebiveis` | **Date**: 2026-09-10

Sem novas tabelas ou migrations. Modelo físico = `nfs` (Conta a Receber).

## Entidade física: NF (Conta a Receber)

| Campo (código) | Papel no Aging |
|----------------|----------------|
| `data_emissao` | Universo: MUST NOT NULL |
| `data_pagamento` | Universo: MUST NULL (em aberto) |
| `data_vencimento` | `data_vencimento_nf` do briefing — atraso vs hoje |
| `valor_bruto` / `valor_liquido` | Somas dual-base |
| `excluida_em` | MUST NULL |
| `status` | MUST ≠ `cancelada` |
| `arquivada` | Incluída se restante do universo ok |

## Universo (estoque em aberto)

```text
excluida_em IS NULL
AND status != cancelada
AND data_emissao IS NOT NULL
AND data_pagamento IS NULL
```

## Classificação de bucket (hoje = data civil do servidor)

Seja `V = data_vencimento`. Se `V` é NULL → **residual** (só no total).

| Bucket (chave) | Rótulo UI | Condição |
|----------------|-----------|----------|
| `a_vencer_lt_30` | A vencer · &lt;30d | `V ≥ hoje` AND `V ≤ hoje + 30` |
| `d1_60` | 1–60 dias | `hoje − V` ∈ [1, 60] |
| `d60_90` | 60–90 dias | `hoje − V` ∈ [61, 90] |
| `d_mais_90` | +90 dias | `hoje − V` &gt; 90 |
| *(residual)* | — | `V` NULL OU `V > hoje + 30` |

Invariante: cada NF do universo está em **no máximo um** bucket nomeado; residual não tem chave de bucket.

## Totais derivados (leitura)

| Conceito | Definição |
|----------|-----------|
| `total_aberto` | SUM(valor) de todo o universo (inclui residual) |
| Valor do bucket | SUM(valor) das NFs classificadas na faixa |
| Percentual do bucket | `valor_bucket / total_aberto × 100` se `total_aberto > 0`; senão `null` |
| Residual implícito | `total_aberto − Σ(buckets)`; não modelado como entidade |

## Metadados de apresentação (não persistidos)

| Bucket | Cor | Ação recomendada |
|--------|-----|------------------|
| A vencer · &lt;30d | Verde | Monitorar |
| 1–60 dias | Âmbar | Cobrar ativamente |
| 60–90 dias | Laranja | Escalar |
| +90 dias | Vermelho | Inadimplência — acionar jurídico |

## Relacionamentos

- **Toggle Bruto/Líquido** (estado de UI 057): seleciona qual par `valor_*` / `percentual_*` exibir; não altera classificação.
- **Filtro mês/ano do Dashboard**: **não** relaciona com o Aging (estoque global).
- **Alerta 09 (futuro)**: consumirá `d60_90` como “Aging em atenção” — fora deste modelo de entrega.

## Validação

- Sem CREATE/UPDATE de Aging — só agregação.
- Cadastro de `data_vencimento` permanece no fluxo existente de Contas a Receber / NFs (fora de escopo alterar obrigatoriedade nesta feature).
