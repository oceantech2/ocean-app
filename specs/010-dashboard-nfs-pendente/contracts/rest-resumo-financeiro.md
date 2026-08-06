# Contract: REST — Resumo financeiro (campo bruto pendente)

**Feature**: `010-dashboard-nfs-pendente`  
**Endpoint**: `GET /api/relatorios/resumo-financeiro`  
**Auth**: JWT Bearer (inalterado)

## Query

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `ano` | int | Não | Se informado, filtra NFs por ano de `data_emissao` |

## Resposta (campos desta feature)

Além dos campos já existentes, a resposta MUST incluir:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `faturamento_bruto_pendente` | number | Soma de `valor_bruto` das NFs com `status = pendente` (mesmo conjunto de `quantidade_pendentes`) |

Campos já existentes usados pelo card:

| Campo | Tipo | Uso |
|-------|------|-----|
| `quantidade_pendentes` | int | Subtítulo `{n} NFs pendentes` |

Campos existentes **não** usados por este card (permanecem na API): `faturamento_liquido_pendente`, totais pagos, etc.

## Exemplos

### Com pendentes

```http
GET /api/relatorios/resumo-financeiro?ano=2026
Authorization: Bearer <token>
```

```json
{
  "faturamento_liquido_pago": 100000.0,
  "faturamento_bruto_pago": 120000.0,
  "faturamento_liquido_pendente": 8000.0,
  "faturamento_bruto_pendente": 10000.0,
  "quantidade_pagas": 40,
  "quantidade_pendentes": 3
}
```

### Sem pendentes

```json
{
  "faturamento_bruto_pendente": 0,
  "quantidade_pendentes": 0
}
```

*(Demais campos omitidos no exemplo.)*

## Erros

| Situação | Comportamento |
|----------|----------------|
| Sem JWT / token inválido | 401 (padrão atual) |
| `ano` omitido | Sem filtro de ano (comportamento atual do endpoint) |

## Compatibilidade

- Aditivo: clientes antigos ignoram o novo campo.
- Dashboard passa a depender de `faturamento_bruto_pendente` para o valor principal do card.
