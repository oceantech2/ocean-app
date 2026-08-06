# Contrato API: Contas a Receber — Inserção Manual

**Feature**: `012-contas-receber-manual` | **Date**: 2026-08-06  
**Spec**: [spec.md](../spec.md) · **Modelo**: [data-model.md](../data-model.md)

> Prefixo existente `/api/nfs`. Reabre `POST /`; ajusta merge Maggo e PUT por `origem`.

## Criação manual

```http
POST /api/nfs
Authorization: Bearer <token admin>
Content-Type: application/json
```

**Body**:

```json
{
  "numero": "NF-2026-001",
  "razao_social": "Cliente Exemplo LTDA",
  "valor_bruto": 10000.0,
  "valor_liquido": 8500.0,
  "data_emissao": "2026-08-01",
  "data_vencimento": "2026-08-31",
  "tipo": "sucesso",
  "tipo_abertura_fechamento": null,
  "data_pagamento": null,
  "caixa": null
}
```

**Recebido** (exemplo):

```json
{
  "numero": "NF-2026-002",
  "razao_social": "Cliente Exemplo LTDA",
  "valor_bruto": 10000.0,
  "valor_liquido": 8500.0,
  "data_emissao": "2026-08-01",
  "data_vencimento": "2026-08-31",
  "tipo": "retainer",
  "tipo_abertura_fechamento": "abertura",
  "data_pagamento": "2026-08-06",
  "caixa": "corrente"
}
```

| Condição | Resposta |
|----------|----------|
| OK | **201** + `NFResponse` com `origem: "manual"` |
| Campos obrigatórios ausentes / inválidos | **422** |
| Recebido sem `caixa` ou sem `data_pagamento` | **422** (msg Caixa/pagamento) |
| `numero` duplicado | **409** (política 013 se presente) ou **422** |
| Visualizador | **403** |

**Não** aceitar no create (ignorar se enviados): obrigar UI a não enviar posição/candidato/colaboradores nesta feature — se enviados, MAY aceitar sem exigir (preferência: omitir do schema create público desta feature).

## Listagem

```http
GET /api/nfs?skip=0&limit=100&...
Authorization: Bearer <token>
```

**Comportamento**:
1. Tentar sync Maggo.
2. Se Maggo OK: merge com regra de skip para `origem=manual`; header opcional `X-Ocean-Maggo-Ignorados: num1,num2`.
3. Se Maggo falhar: **não** falhar a listagem inteira — retornar registros em `nfs` e sinalizar indisponibilidade (header `X-Ocean-Maggo-Status: unavailable` ou equivalente + toast no cliente).
4. Cada item inclui `origem`: `"manual"` \| `"maggo"`.

## Atualização

```http
PUT /api/nfs/{id}
Authorization: Bearer <token admin>
```

### Se `origem == "manual"`

Body pode incluir campos de negócio + enriquecimento:

```json
{
  "numero": "NF-2026-001",
  "razao_social": "…",
  "valor_bruto": 1,
  "valor_liquido": 1,
  "data_emissao": "2026-08-01",
  "data_vencimento": "2026-08-31",
  "tipo": "sucesso",
  "data_pagamento": "2026-08-06",
  "caixa": "investimento",
  "colaborador_lead_id": 1,
  "arquivada": false
}
```

### Se `origem == "maggo"`

Allowlist de enriquecimento (inalterada em espírito à 007/011):

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

Campos de negócio Maggo no body → **422**.

Regra Caixa (011): estado resultante com `data_pagamento` exige `caixa` corrente|investimento.

**Não** permitir alterar `origem` via PUT.

## Endpoints que permanecem desabilitados nesta feature

| Método | Path | Resposta |
|--------|------|----------|
| DELETE | `/api/nfs/{id}` | **403** |
| DELETE | `/api/nfs/todas` | **403** |
| POST | `/api/nfs/importar-xlsx` | **403** nesta feature (FR-002); outra feature pode reabrir com política própria |

## Resposta (`NFResponse` — campos relevantes)

```json
{
  "id": 1,
  "numero": "NF-2026-001",
  "razao_social": "…",
  "valor_bruto": 10000,
  "valor_liquido": 8500,
  "data_emissao": "2026-08-01",
  "data_vencimento": "2026-08-31",
  "tipo": "sucesso",
  "status": "pendente",
  "data_pagamento": null,
  "caixa": null,
  "origem": "manual",
  "arquivada": false
}
```
