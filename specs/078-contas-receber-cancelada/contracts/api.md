# Contratos de API: Status "Cancelada" em Contas a Receber

**Feature**: `078-contas-receber-cancelada` | Base: `http://localhost:8001/api` | Auth: `Authorization: Bearer <token>`

Somente as diferenças em relação ao contrato atual. Campos não citados permanecem como estão.

## `PUT /nfs/{nf_id}` — editar Conta a Receber (`admin`)

### Request (campo novo)

```json
{
  "situacao": "cancelada"
}
```

| Campo | Tipo | Obrigatório | Valores |
|---|---|---|---|
| `situacao` | string | não | `pendente` \| `recebida` \| `cancelada` |

Regras (ver [data-model.md](../data-model.md#situação-no-formulário--status-persistido)):

- `cancelada` em conta `paga` → **409**
- `recebida` exige `data_pagamento` no mesmo payload ou já gravado → **422** se ausente
- Sem `situacao`, conta cancelada permanece cancelada mesmo que o payload traga `data_vencimento`
- Sem `situacao`, payload com `data_pagamento` não nulo em conta cancelada → **409**

### Erros novos

```json
{ "detail": { "code": "NF_CANCELAR_RECEBIDA", "message": "Volte a conta para Pendente e salve antes de cancelar." } }
```

```json
{ "detail": { "code": "NF_CANCELADA_PAGAMENTO", "message": "Conta cancelada: reative-a (Pendente ou Recebida) antes de registrar pagamento." } }
```

### Response (`NFResponse`, campo novo)

```json
{
  "id": 123,
  "status": "cancelada",
  "revisar_cancelamento": false
}
```

| Campo | Tipo | Regra |
|---|---|---|
| `revisar_cancelamento` | boolean | `true` quando `status = cancelada` e `data_pagamento` preenchida (cancelada antiga com recebimento) |

`revisar_cancelamento` também aparece em `GET /nfs` e `GET /nfs/{nf_id}`.

## `POST /nfs/importar-xlsx` — importação (`admin`)

### Response (campo novo)

```json
{
  "ok": 10,
  "atualizados": 3,
  "erros": [],
  "cancelamentos_ignorados": [
    { "linha": 7, "numero": "1234", "nf_id": 55, "motivo": "recebida_no_ocean" },
    { "linha": 9, "numero": "1301", "nf_id": 61, "motivo": "reativada_no_ocean" }
  ]
}
```

| `motivo` | Quando | Texto exibido |
|---|---|---|
| `recebida_no_ocean` | Linha cancelada na planilha; conta Recebida no Ocean | "Recebida no Ocean, cancelada na planilha" |
| `reativada_no_ocean` | Linha cancelada na planilha; conta reativada pelo `admin` no Ocean | "Reativada no Ocean, cancelada na planilha" |

Em ambos os casos a conta não é alterada. Lista vazia quando não há ocorrências. A resposta 422 `NF_IMPORT_ON_CONFLICT_REQUIRED` não muda.

## `GET /bonus` e `GET /bonus/{id}` — comissões

### Response (`BonusResponse`, campo novo)

```json
{ "id": 9, "nf_id": 55, "valor_bonus": 1500.0, "pago": true, "nf_cancelada": true }
```

| Campo | Tipo | Regra |
|---|---|---|
| `nf_cancelada` | boolean | `true` quando a conta vinculada está cancelada; `false` sem conta vinculada |

As comissões de conta cancelada **continuam listadas**; quem soma deve ignorá-las. `POST /bonus/{id}/liberar` e `/pagar` (e versões em lote) não mudam.

## Endpoints com mudança só de cálculo

Formato de resposta inalterado; passam a ignorar contas canceladas (e comissões de contas canceladas):

| Endpoint | Mudança |
|---|---|
| `GET /relatorios/bonus-mensal` | Exclui comissões de conta cancelada ou excluída |
| `GET /relatorios/fechamentos-por-tipo` | Exclui contas canceladas |
| `GET /relatorios/propostas-enviadas` | Exclui contas canceladas |
| `GET /relatorios/placement-por-consultor` | Exclui contas canceladas |
| `GET /alertas` (e e-mail diário) | Exclui contas canceladas dos alertas de vencimento |

Os caminhos exatos dos relatórios seguem as rotas já registradas em `backend/app/api/routes/relatorios.py`.
