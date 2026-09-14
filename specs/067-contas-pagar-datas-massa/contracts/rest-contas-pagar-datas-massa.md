# Contrato REST: Contas a Pagar — Edição em massa de datas

**Feature**: `067-contas-pagar-datas-massa`  
**Auth**: JWT Bearer — escrita `admin` apenas  
**Prefixo**: `/api/contas`

Modelo: [data-model.md](../data-model.md)  
UI: [ui-contas-pagar-datas-massa.md](./ui-contas-pagar-datas-massa.md)

Não altera `GET/POST/PUT/DELETE /api/contas` além de coexistir com eles. Exclusão em massa permanece descontinuada.

---

## Tipos

### `ContasDatasLoteRequest`

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|--------|
| ids | int[] | sim | ≥1 id |
| data_vencimento | date \| null | não | Omitido/`null` = não alterar; data = aplicar a todas processadas |
| data_pagamento | date \| null | não | Omitido/`null` = não alterar; data = aplicar + `pago=true` |

**422** se nenhuma data válida for enviada (ambos omitidos/null).

### `ContasDatasLoteResponse`

| Campo | Tipo | Notas |
|-------|------|--------|
| processados | int | Contas atualizadas |
| ignorados | int | Id inexistente ou regra de negócio (ex.: caixa inválido ao marcar paga) |

---

## Endpoint

### POST `/api/contas/acoes/editar-datas`

**Auth**: `require_admin`

**Body** (exemplo — só vencimento):

```json
{
  "ids": [10, 11, 12],
  "data_vencimento": "2026-10-15"
}
```

**Body** (exemplo — ambos):

```json
{
  "ids": [10, 11],
  "data_vencimento": "2026-10-15",
  "data_pagamento": "2026-09-14"
}
```

**200**:

```json
{ "processados": 2, "ignorados": 0 }
```

**Comportamento**:
1. Para cada `id` em `ids` (ordem do array):
   - Sem registro → `ignorados++`
   - Se `data_vencimento` é date → atribuir
   - Se `data_pagamento` é date → atribuir, `pago=True`; se `caixa` vazio, resolver padrão; se ainda inválido → reverter alterações dessa conta no loop e `ignorados++` (ou não aplicar e contar ignorado)
   - Caso contrário sucesso → `processados++` + auditoria `editar` em `ContaPagar`
2. `commit` único ao final (ou commit com contagens coerentes; falha dura → 5xx sem sucesso parcial silencioso)
3. **Não** limpar datas; **não** validar pagamento ≥ vencimento

**401/403**: não autenticado / não admin  
**422**: body inválido (ids vazio, nenhuma data, date malformada)

---

## Endpoints inalterados (referência)

| Método | Path | Nota |
|--------|------|------|
| PUT | `/api/contas/{id}` | Edição individual; null em `data_pagamento` ainda pode limpar (fora do lote) |
| POST | `/api/contas/acoes/excluir` (ou equivalente) | Continua descontinuado / erro de negócio |
