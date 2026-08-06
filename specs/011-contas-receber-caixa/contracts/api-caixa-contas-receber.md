# Contrato API: Caixa em Contas a Receber

**Feature**: `011-contas-receber-caixa` | **Date**: 2026-08-06  
**Spec**: [spec.md](../spec.md) · **Modelo**: [data-model.md](../data-model.md)

> Prefixo existente `/api/nfs`. Esta feature **não** cria endpoints novos; reforça regras do `PUT` e do export.

## Atualização (allowlist + regra de Caixa)

```http
PUT /api/nfs/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

**Body permitido** (inalterado em superfície):

```json
{
  "caixa": "corrente",
  "data_pagamento": "2026-08-06",
  "colaborador_lead_id": 1,
  "colaborador_conducao_id": 2,
  "colaborador_placement_id": 3,
  "arquivada": false
}
```

### Valores de `caixa`

| Valor | Aceito |
|-------|--------|
| `"corrente"` | sim |
| `"investimento"` | sim |
| `null` | sim **somente** se o estado resultante tiver `data_pagamento` ausente/null |
| outro string | **422** |

### Regra de obrigatoriedade (estado resultante)

Após aplicar o payload ao registro atual:

| `data_pagamento` resultante | `caixa` resultante | Resposta |
|-----------------------------|--------------------|----------|
| null | null / corrente / investimento | **200** |
| date | corrente / investimento | **200** |
| date | null / omitido resultando em null | **422** |

Mensagem de erro (pt-BR), exemplo:  
`Caixa é obrigatória quando a conta está recebida. Informe corrente ou investimento.`

### Cenários cobertos

1. Marcar pagamento enviando `data_pagamento` + `caixa`.
2. Marcar pagamento só com `data_pagamento` e registro já com `caixa` preenchida → OK.
3. Marcar pagamento sem `caixa` e registro sem `caixa` → 422.
4. Editar legado já pago (`data_pagamento` set) enviando só colaboradores, sem `caixa` no body, e registro sem `caixa` → 422 (estado resultante ainda pago sem caixa).
5. Editar legado já pago enviando `caixa: "corrente"` → 200.
6. Conta não paga: `caixa: null` → 200.

**Autorização**: admin (visualizador → 403), padrão do produto.

## Listagem

```http
GET /api/nfs?...
```

- Inclui `caixa` no payload (já existente).
- **Não** filtra nem bloqueia registros com `caixa` null (mesmo se `data_pagamento` preenchida).
- Sync/merge Maggo: **preserva** `caixa` Ocean pelo `numero`.

## Export XLSX

```http
GET /api/nfs/exportar-xlsx?...
```

- MUST incluir coluna **Caixa** com valores legíveis alinhados à UI (`Corrente` / `Investimento` / vazio ou `—`).
- CSV no frontend já exporta Caixa; manter paridade de significado.

## Fora deste contrato

- Endpoints de Fluxo de Caixa / saldos.
- Filtro `?caixa=` na listagem.
- Migration ou backfill de `caixa`.
