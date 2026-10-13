# Data Model: Recorrência de contas a pagar

Sem mudanças de banco.

## ContaPagarCreate (payload de criação)

| Campo | Tipo | Regra |
|---|---|---|
| … campos atuais … | | inalterados |
| repetir_meses | int \| null | opcional; 1 ≤ N ≤ 24; exige `data_vencimento` |

## Contas geradas

Para k = 1..N, uma `ContaPagar` com:

| Campo | Valor |
|---|---|
| descricao, categoria, subcategoria, valor, fornecedor_id, caixa, tipo_despesa | iguais à original |
| data_vencimento | original + k meses (dia preservado ou último dia do mês) |
| pago / data_pagamento | `false` / `null` |
| comprovante | nenhum |
| categoria_pendente | `false` |
