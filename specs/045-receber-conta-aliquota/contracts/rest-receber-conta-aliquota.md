# Contrato REST: Conta, Alíquota e cards líquidos

**Feature**: `045-receber-conta-aliquota` | **Date**: 2026-08-29  
**Base**: `/api/nfs` (`backend/app/api/routes/nfs.py`)  
**Spec**: [spec.md](../spec.md)

## Alterações de schema

### NF (request/response)

Campos adicionados em `NFCreate`, `NFUpdate`, `NFResponse`:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `aliquota_imposto` | `float \| null` | Percentual 0–100 |

Comportamento em `valor_imposto` / `valor_liquido`:

- Se `valor_bruto` presente no body, o servidor **recalcula** imposto e líquido a partir de `aliquota_imposto` (NULL/omitido = 0%).
- Valores enviados pelo cliente para imposto/líquido são **ignorados** quando bruto (e opcionalmente alíquota) estão no payload de escrita.

### NF — `caixa`

| Método | Antes | Depois |
|--------|-------|--------|
| `POST /` pendente | `caixa = null` | `caixa = exigir_conta_corrente(body.caixa) \|\| codigo_slot1 \|\| codigo_padrao` |
| `POST /` recebida | `caixa` obrigatório implícito (padrão se omitido) | inalterado |
| `PUT /{id}` pendente | `caixa` limpo se sem pagamento | `caixa` persistido/atualizado; não zerar |
| `PUT /{id}` recebida | validação corrente ativa | inalterado |

## Endpoints

### `POST /api/nfs`

**Body** (campos novos/alterados):

```json
{
  "razao_social": "Cliente SA",
  "valor_bruto": 10000,
  "aliquota_imposto": 6,
  "valor_liquido": 9400,
  "tipo": "retainer",
  "caixa": "cc_2",
  "data_pagamento": null
}
```

**Resposta 201**: `valor_imposto: 600`, `valor_liquido: 9400`, `aliquota_imposto: 6`, `caixa: "cc_2"` (mesmo pendente).

**Erros**:

| Status | Condição |
|--------|----------|
| 400 | `aliquota_imposto` &lt; 0 ou &gt; 100 |
| 400 | `caixa` investimento ou corrente inativa |
| 400 | demais validações existentes (empresa, bruto, NF+emissão) |

### `PUT /api/nfs/{id}`

**Body** parcial com recálculo:

```json
{
  "valor_bruto": 10000,
  "aliquota_imposto": 6.5
}
```

Servidor persiste `valor_imposto: 650`, `valor_liquido: 9350`.

Alterar só `data_vencimento` **sem** bruto/alíquota → imposto/líquido/alíquota **inalterados**.

### `GET /api/nfs/resumo`

**Sem alteração de contrato.** Cliente MUST passar a usar:

- `total_liquido_pendente` → card **Líquido Pendente**
- `total_liquido_vencido` → card **Líquido Vencido**

Query params existentes (`mes`, `ano`, etc.) permanecem.

## Autorização

- `POST`, `PUT`: `require_admin`
- `GET` listagem/resumo: `get_current_user` (admin e visualizador)

## Fora de escopo deste contrato

- Alterar Maggo stub/sync
- Dashboard `Receita Pendente`
- Alíquota mensal (`/api/impostos`)
