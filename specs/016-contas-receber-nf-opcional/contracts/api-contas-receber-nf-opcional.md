# Contrato API: Contas a Receber — NF opcional

**Feature**: `016-contas-receber-nf-opcional` | **Date**: 2026-08-12  
**Spec**: [spec.md](../spec.md) · **Modelo**: [data-model.md](../data-model.md)

> Prefixo existente `/api/nfs`. Ajusta obrigatoriedade de `numero` em POST/PUT e na resposta. Sem endpoints novos.

## Normalização

Em create e update (quando `numero` enviado):

1. `trim` nas extremidades.
2. Resultado vazio → tratar como **ausente** (`null`). Não persistir `""`.
3. Se ausente: **não** aplicar 409 de duplicidade.
4. Se presente: política 013 (`NF_NUMERO_DUPLICADO`).

## Criação manual

```http
POST /api/nfs
Authorization: Bearer <token admin>
Content-Type: application/json
```

**Body — sem NF** (válido):

```json
{
  "numero": null,
  "razao_social": "Cliente Exemplo LTDA",
  "valor_bruto": 10000.0,
  "valor_liquido": 8500.0,
  "data_emissao": "2026-08-01",
  "data_vencimento": "2026-08-31",
  "tipo": "sucesso",
  "data_pagamento": null,
  "caixa": null
}
```

Omitir `numero` ou enviar `""` é equivalente a `null`.

**Body — com NF**: igual à 012 (`"numero": "NF-2026-001"`).

| Condição | Resposta |
|----------|----------|
| OK sem `numero` | **201** + `NFResponse` com `numero: null`, `origem: "manual"` |
| OK com `numero` livre | **201** + `numero` trimado |
| Demais obrigatórios ausentes | **422** (não citar NF como motivo) |
| Recebido sem `caixa` / `data_pagamento` | **422** (regra Caixa) |
| `numero` duplicado (não vazio) | **409** `NF_NUMERO_DUPLICADO` + atalho `nf_id` |
| Segundo POST sem `numero` | **201** (não é conflito) |
| Visualizador | **403** |

## Atualização

```http
PUT /api/nfs/{id}
Authorization: Bearer <token admin>
```

### Origem `manual`

Pode enviar `numero` para definir ou **limpar**:

```json
{
  "numero": null,
  "razao_social": "Cliente Exemplo LTDA",
  "valor_bruto": 10000.0,
  "valor_liquido": 8500.0,
  "data_emissao": "2026-08-01",
  "data_vencimento": "2026-08-31",
  "tipo": "sucesso"
}
```

| Body `numero` | Efeito |
|---------------|--------|
| omitido | não altera o número |
| `null` ou `""` | grava `NULL` |
| string não vazia | unique 013; grava trim |

### Origem `maggo`

`numero` no body → **422** (campo de negócio Maggo). Demais regras de enriquecimento inalteradas.

## Listagem / resposta

```http
GET /api/nfs
```

`NFResponse.numero` passa a ser `string | null`. Itens sem NF: `"numero": null`.

Merge Maggo: não usar `numero` vazio/`null` como chave; manuais com `numero` null não colidem.

## Endpoints inalterados nesta feature

| Método | Path | Nota |
|--------|------|------|
| DELETE | `/api/nfs/{id}` e `/todas` | continuam 403 |
| POST | `/api/nfs/importar-xlsx` | fora de escopo (FR-012) |
