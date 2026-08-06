# Contrato API: Contas a Pagar — Input Manual de Valores

**Feature**: `014-contas-pagar-manual` | **Date**: 2026-08-06  
**Spec**: [spec.md](../spec.md) · **Data model**: [data-model.md](../data-model.md)

## Superfície

| Item | Valor |
|------|-------|
| Base | `/api/contas` |
| Auth | JWT Bearer; escrita admin; leitura visualizador |
| Escopo desta feature | Ajustes em `POST /` e `PUT /{id}` (+ validação de `valor`); GET/import/delete/comprovante inalterados no contrato de negócio |

## POST `/api/contas`

Cria conta a pagar unitária.

### Body (JSON)

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| `descricao` | string | sim | |
| `categoria` | string | sim | taxonomia 008 |
| `subcategoria` | string \| null | se RH | |
| `valor` | number | sim | **> 0** |
| `data_vencimento` | date (ISO) | sim* | *prática atual da página |
| `data_pagamento` | date \| null | não | se preenchida → conta nasce **paga** |

`pago` no body: opcional; se omitido, **derivado** de `data_pagamento`. Preferir não exigir `pago` do cliente.

### Respostas

| Código | Quando |
|--------|--------|
| 201 | Conta criada; `pago` coerente com `data_pagamento` |
| 401/403 | Não autenticado / sem permissão de escrita |
| 422 | Valor ≤ 0, categoria inválida, RH sem subcategoria, demais validações |

### Exemplos

```json
// Pendente
{
  "descricao": "Aluguel agosto",
  "categoria": "adm_financeiro",
  "subcategoria": null,
  "valor": 5000.0,
  "data_vencimento": "2026-08-10",
  "data_pagamento": null
}
```

```json
// Paga na criação
{
  "descricao": "Taxa cartório",
  "categoria": "adm_financeiro",
  "subcategoria": null,
  "valor": 150.5,
  "data_vencimento": "2026-08-06",
  "data_pagamento": "2026-08-06"
}
```

## PUT `/api/contas/{id}`

Atualiza campos de negócio.

### Body (parcial)

| Campo | Tipo | Notas |
|-------|------|-------|
| `descricao` | string? | |
| `categoria` / `subcategoria` | string? | regras 008 |
| `valor` | number? | se enviado, **> 0**; permitido mesmo se `pago=true` |
| `data_vencimento` | date? | |
| `data_pagamento` | date \| **null** | **null explícito** → `pago=false`; data → `pago=true` |
| `pago` | bool? | atalho listagem; se `pago=false`, limpar data (comportamento já existente) |

### Respostas

| Código | Quando |
|--------|--------|
| 200 | Atualizado; `pago` coerente com `data_pagamento` |
| 404 | Conta inexistente |
| 422 | Valor ≤ 0 ou classificação inválida |

### Exemplo — limpar pagamento

```json
{
  "data_pagamento": null
}
```

Esperado: `pago=false`, `data_pagamento=null`.

### Exemplo — corrigir valor de conta paga

```json
{
  "valor": 4999.99
}
```

Esperado: valor atualizado; `pago` permanece `true` se data de pagamento continuar preenchida.

## GET `/api/contas`

Inalterado: listagem com filtros categoria/subcategoria/pago; valores numéricos; UI formata BRL.

## Fora deste contrato

- Import CSV/XLSX (permanece como hoje).
- DELETE individual / comprovantes.
- Exclusão em massa (continua ausente).
