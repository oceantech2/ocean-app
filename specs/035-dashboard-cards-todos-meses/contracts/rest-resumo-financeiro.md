# Contract: REST — Resumo financeiro (recorte `mes_ate`)

**Feature**: `035-dashboard-cards-todos-meses`  
**Endpoint**: `GET /api/relatorios/resumo-financeiro`  
**Auth**: JWT Bearer (inalterado)

## Query

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `ano` | int | Não | Se informado, filtra NFs pelo ano de `data_emissao` |
| `mes` | int 1–12 | Não | Se informado, filtra o **mês exato** de `data_emissao`. Tem precedência sobre `mes_ate`. |
| `mes_ate` | int 1–12 | Não | Só se `mes` **omitido**: inclui meses `1` até `mes_ate` (inclusive). Se omitido junto com `mes`, não filtra mês (compatível com clientes antigos). |

## Resposta

Inalterada (mesmos campos da feature 010). A Dashboard usa no mínimo:

| Campo | Tipo |
|-------|------|
| `faturamento_liquido_pago` | number |
| `faturamento_bruto_pago` | number |
| `faturamento_bruto_pendente` | number |
| `quantidade_pagas` | int |
| `quantidade_pendentes` | int |

## Exemplos

### Mês isolado (inalterado)

```http
GET /api/relatorios/resumo-financeiro?ano=2026&mes=3
Authorization: Bearer <token>
```

### Todos os meses / YTD (esta feature)

```http
GET /api/relatorios/resumo-financeiro?ano=2026&mes_ate=8
Authorization: Bearer <token>
```

Esperado: totais de emissão de janeiro a agosto de 2026; **diferentes** de `mes=3` se houver NFs fora de março no intervalo.

### Ano anterior completo

```http
GET /api/relatorios/resumo-financeiro?ano=2025&mes_ate=12
```

## Erros

| Situação | Comportamento |
|----------|----------------|
| Sem JWT / token inválido | 401 |
| `mes` ou `mes_ate` fora de 1–12 | 422 |
| `ano` omitido | Sem filtro de ano (comportamento atual) |

## Compatibilidade

- Aditivo: `mes_ate` ignorado por clientes que não o enviam.
- Chamadas existentes `?ano=&mes=` permanecem mês isolado.
- Chamadas `?ano=` sem `mes` e sem `mes_ate` continuam ano calendário inteiro.
