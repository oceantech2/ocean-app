# Contract: REST — Próximo Recebimento

**Feature**: `061-dashboard-alerta-fluxo`  
**Endpoint**: `GET /api/relatorios/proximo-recebimento`  
**Auth**: JWT Bearer (`admin`, `visualizador`)

Agregação para o campo **próximo recebimento** do Alerta: menor `data_vencimento` ≥ hoje entre NFs em aberto. Estoque global (sem `ano`/`mes`).

## Request

Sem query params. **Não** filtrar por período do Dashboard.

## Response 200 — encontrado

```json
{
  "referencia": "2026-09-10",
  "encontrado": true,
  "data_vencimento": "2026-09-15",
  "valor_liquido": 12000.0,
  "valor_bruto": 14723.93,
  "nf_id": 42
}
```

## Response 200 — sem previsão

```json
{
  "referencia": "2026-09-10",
  "encontrado": false,
  "data_vencimento": null,
  "valor_liquido": null,
  "valor_bruto": null,
  "nf_id": null
}
```

| Campo | Descrição |
|-------|-----------|
| `referencia` | Data civil `hoje` usada no filtro (`YYYY-MM-DD`) |
| `encontrado` | `true` se há NF elegível; `false` = sem próximo/sem previsão (não é erro) |
| `data_vencimento` | MIN entre elegíveis |
| `valor_*` | Dual-base da NF escolhida |
| `nf_id` | Identificador estável da NF escolhida (desempate / debug) |

## Universo e desempate

Ver [data-model.md](../data-model.md): aberto + vencimento ≥ hoje; empate → maior `valor_liquido`, depois maior `valor_bruto`, depois menor `id` (ambos valores expostos; UI só escolhe a base do toggle para exibir).

## Erros

| Código | Quando |
|--------|--------|
| 401 | Sem JWT |
| 500 | Falha interna — o Dashboard trata como campo **indisponível** (não como “sem previsão”) |

## Fora deste contrato

- Cálculo do % não recebida
- Bucket Aging / limiar
- Filtrar por mês/ano
