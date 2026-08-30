# Contrato REST: Comissões vinculadas à Conta a receber

**Feature**: `045-comissoes-conta-receber`  
**Auth**: JWT Bearer — escrita `admin`; leitura `admin` e `visualizador`

Prefixos: `/api/nfs` (sync na conta), `/api/bonus` (listagem e status)

---

## Tipos compartilhados

### `ComissaoLinhaInput`

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|--------|
| id | int? | não | Se omitido → criar; se presente → atualizar (só se não liberada) |
| colaborador_id | int | sim | Fornecedor ativo |
| mes | int | sim | 1–12 |
| ano | int | sim | |
| atividades | string[] | sim | ≥1; valores: `lead`, `venda`, `conducao`, `placement` |
| percentual | float | sim | > 0 |

`valor_bonus` **não** é aceito no input (calculado no servidor).

### `BonusResponse` (estendido)

Campos existentes +:

| Campo | Tipo | Notas |
|-------|------|--------|
| nf_id | int? | |
| atividades | string[] | Parse de JSON |
| liberado | bool | |
| pago | bool | |
| data_liberacao | date? | |
| data_pagamento | date? | |

Campos legados `cliente`, `posicao`, `numero_nf`, `etapa` permanecem na resposta (enriquecidos da NF quando `nf_id` set).

### `AcaoLoteResponse`

```json
{ "processados": 3, "ignorados": 2 }
```

---

## Conta a receber — sync de comissões

### POST `/api/nfs`

Body `NFCreate` existente + opcional:

```json
{
  "razao_social": "Cliente SA",
  "valor_bruto": 1000,
  "valor_liquido": 900,
  "tipo": "sucesso",
  "comissoes": [
    {
      "colaborador_id": 5,
      "mes": 8,
      "ano": 2026,
      "atividades": ["lead", "conducao"],
      "percentual": 10
    }
  ]
}
```

**201**: `NFResponse` (comissões criadas na mesma transação).

**422**: linha incompleta; fornecedor inativo; atividades vazias; percentual inválido.

### PUT `/api/nfs/{nf_id}`

Body `NFUpdate` + opcional `comissoes[]` (mesma semântica de sync).

- Linhas liberadas omitidas → preservadas.
- Linhas não liberadas ausentes do array → **removidas**.
- Mudança em `valor_liquido` → recalcula `valor_bonus` das linhas não liberadas.

**422**: tentativa de alterar/remover linha liberada via payload.

### GET `/api/nfs/{nf_id}` (opcional nesta feature)

Se implementado enriquecimento: incluir `comissoes: BonusResponse[]` para popular modal de edição. Alternativa aceita: `GET /api/bonus?nf_id={id}` (novo query param).

**Recomendado**: adicionar query `nf_id` em `GET /api/bonus` para carregar linhas da conta no modal.

---

## Comissões — listagem e status

### GET `/api/bonus`

Query existente (`skip`, `limit`, `colaborador_id`, `mes`, `ano`) +:

| Query | Tipo | Notas |
|-------|------|--------|
| nf_id | int? | Todas as linhas de uma conta (modal edição) |

**200**: lista `BonusResponse[]`.

**Filtro implícito**: excluir linhas cujo `nf_id` referencia NF com `excluida_em` preenchido.

### POST `/api/bonus/{bonus_id}/liberar`

**Auth**: admin.

**200**: `BonusResponse` com `liberado=true`, `data_liberacao` = hoje.

**422**: já liberada.

### POST `/api/bonus/{bonus_id}/pagar`

**Auth**: admin.

**200**: `BonusResponse` com `pago=true`, `data_pagamento` = hoje.

**422**: não liberada; já paga.

### POST `/api/bonus/acoes/liberar`

**Auth**: admin.

```json
{ "ids": [1, 2, 3] }
```

**200**: `AcaoLoteResponse` — processa só elegíveis (`liberado=false`).

### POST `/api/bonus/acoes/pagar`

**Auth**: admin.

```json
{ "ids": [4, 5] }
```

**200**: `AcaoLoteResponse` — processa só `liberado=true` e `pago=false`.

---

## Endpoints inalterados (escopo)

| Método | Rota | Notas |
|--------|------|--------|
| POST | `/api/bonus` | Import CSV legado; schema antigo ainda aceito |
| PUT | `/api/bonus/{id}` | Não usado pela UI principal pós-feature |
| DELETE | `/api/bonus/{id}` | Mantido; **removido da UI** |

---

## Códigos de erro visíveis (pt-BR)

| Situação | HTTP | detail (exemplo) |
|----------|------|------------------|
| Comissão não encontrada | 404 | Comissão não encontrada |
| Pagar sem liberar | 422 | Comissão deve estar liberada antes de pagar |
| Editar linha liberada | 422 | Comissão liberada não pode ser alterada |
| Fornecedor inválido | 422 | Fornecedor inativo ou inexistente |
