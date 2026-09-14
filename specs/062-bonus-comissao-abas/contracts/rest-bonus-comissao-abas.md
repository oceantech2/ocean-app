# Contrato REST: Bônus e Comissão com abas

**Feature**: `062-bonus-comissao-abas`  
**Auth**: JWT Bearer — escrita `admin`; leitura `admin` e `visualizador`

Prefixos: `/api/nfs` (sync na conta), `/api/bonus` (listagem e status)

Modelo: [data-model.md](../data-model.md)  
UI: [ui-bonus-comissao-abas.md](./ui-bonus-comissao-abas.md)

Complementa [rest-comissoes-conta-receber.md](../../045-comissoes-conta-receber/contracts/rest-comissoes-conta-receber.md) — **não** altera a semântica de `comissoes[]` além de restringir o sync a `tipo=comissao`.

---

## Tipos

### `BonusLinhaInput`

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|--------|
| id | int? | não | Omitido → criar; presente → atualizar se não liberada |
| colaborador_id | int | sim | Fornecedor ativo |
| mes | int | sim | 1–12 |
| ano | int | sim | |
| valor | float | sim | **> 0**; informado; **não** aceitar `percentual` nem `atividades` |

### `BonusResponse` (estendido)

Campos 045 +:

| Campo | Tipo | Notas |
|-------|------|--------|
| tipo | string | `comissao` \| `bonus` |
| percentual | float? | `null` se `tipo=bonus` |
| atividades | string[] | `[]` se `tipo=bonus` |

---

## Listagem

### GET `/api/bonus`

Query já existentes (`skip`, `limit`, `colaborador_id`, `mes`, `ano`, `nf_id`) +

| Param | Tipo | Default | Notas |
|-------|------|---------|-------|
| tipo | string | `comissao` | `comissao` \| `bonus`. Filtra a aba / o bloco do form |

**200**: lista `BonusResponse` só daquele tipo, ainda ocultando linhas cuja NF está excluída.

**400/422**: `tipo` inválido.

Callers da aba Comissão e do bloco Comissões: `tipo=comissao` (ou omitir).  
Aba Bônus e bloco Bônus: `tipo=bonus`.

---

## Conta a receber — sync de bônus

### POST `/api/nfs` e PUT `/api/nfs/{nf_id}`

Body existente + opcional:

```json
{
  "comissoes": [ { "colaborador_id": 5, "mes": 8, "ano": 2026, "atividades": ["lead"], "percentual": 10 } ],
  "bonus": [
    { "colaborador_id": 8, "mes": 8, "ano": 2026, "valor": 350.5 }
  ]
}
```

| Campo no body | Omitido / `null` | Array (mesmo vazio) |
|---------------|------------------|---------------------|
| `comissoes` | não altera comissões da NF | sync só `tipo=comissao` |
| `bonus` | não altera bônus da NF | sync só `tipo=bonus` |

**201/200**: NF persistida; linhas criadas/atualizadas na mesma transação.

**422**:
- linha de bônus sem fornecedor, mês/ano ou `valor > 0`
- fornecedor inativo
- `id` de bônus inexistente nesta NF ou `tipo≠bonus`
- tentativa de alterar/remover bônus **liberado**
- `percentual`/`atividades` enviados em `bonus[]` (rejeitar)

### Isolamento

`sincronizar(comissoes)` MUST NOT `DELETE`/`UPDATE` linhas `tipo=bonus`.  
`sincronizar_bonus(bonus)` MUST NOT tocar `tipo=comissao`.

---

## Status (reuso)

Inalterados; operam por `id` de qualquer tipo:

| Método | Path | Papel |
|--------|------|-------|
| POST | `/api/bonus/{id}/liberar` | admin |
| POST | `/api/bonus/{id}/pagar` | admin |
| POST | `/api/bonus/acoes/liberar` | admin |
| POST | `/api/bonus/acoes/pagar` | admin |

Regras 045/048: Liberar só se ainda não liberada; Pagar só se liberada e não paga; lote devolve `{ processados, ignorados }`.

GET/PUT avulso `/api/bonus` (criar comissão fora da NF) **não** é o caminho de bônus novos (spec: sem cadastro avulso na aba). Não é obrigatório bloquear nesta feature; a UI não oferece.

DELETE `/api/bonus/{id}`: UI não expõe; endurecer 405/404 permanece recomendação 048 (fora do núcleo desta feature).

---

## Erros

| HTTP | Quando |
|------|--------|
| 401 | sem JWT |
| 403 | visualizador tentando sync/liberar/pagar |
| 422 | validação de linha / estado / isolamento de tipo |
