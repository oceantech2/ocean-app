# Contrato REST: Seleção de conta corrente

**Feature**: `036-selecao-conta-corrente`  
**Auth**: JWT. GET autenticado; POST/PUT de escrita `require_admin`.

Base: `http://localhost:8001/api`

`GET /contas-correntes` permanece o catálogo (031). Esta feature **não** altera o CRUD de contas.

## `POST /nfs` e `PUT /nfs/{id}`

`caixa` (string, opcional se ainda sem `data_pagamento`; obrigatório efetivo quando há pagamento):

- Valor permitido: codigo de conta corrente **ativa**.
- **Não** aceitar `investimento`.
- Primeiro recebimento (`data_pagamento` preenchido pela primeira vez):
  - se `caixa` válido → gravar esse codigo;
  - se omitido → gravar a corrente **padrão**.
- NF já recebida: `caixa` de corrente ativa substitui o anterior (movimento único no fluxo).
- Limpar `data_pagamento` → `caixa = null`.

400: `caixa inválido` (investimento, inativa, vazia quando o pagamento exige conta).

Resposta: incluir `caixa` (ja existente em `NFResponse`).

## `POST /contas` e `PUT /contas/{id}`

Incluir `caixa` no body e na resposta.

| Estado | `caixa` |
|--------|---------|
| `pago=false` | `null` ou omitido |
| `pago=true` ou `data_pagamento` informado | codigo de corrente **ativa** obrigatório |

400 se pago sem corrente válida ou se `caixa=investimento`.

Ao desmarcar pago: `caixa = null`.

Lista `GET /contas` devolve `caixa` para a coluna e a exportação.

## `POST /fluxo-transferencias`

Sem mudança de payload (`origem`, `destino`, `valor`, `data_movimento`, `observacao`).

Continua aceitando correntes ativas **e** `investimento`. Recusa origem = destino, inativa, valor inválido, valor acima do saldo visível.

A UI deixa de ter Inverter; o contrato REST não precisa de campo extra.

## Fora

- Novo endpoint de catálogo
- Aceitar investimento em NF ou Contas a Pagar
- DELETE de conta corrente
