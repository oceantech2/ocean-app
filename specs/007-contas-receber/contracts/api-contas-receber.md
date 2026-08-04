# Contrato API: Contas a Receber (stub Maggo + enriquecimento)

**Feature**: `007-contas-receber` | **Date**: 2026-07-26  
**Spec**: [spec.md](./spec.md) · **Modelo**: [data-model.md](../data-model.md)

> Prefixo existente `/api/nfs` mantido nesta entrega. Semanticamente = Contas a Receber.

## Listagem (fonte simulada Maggo)

```http
GET /api/nfs?skip=0&limit=500&mes=&ano=&status_filtro=&incluir_arquivadas=false
Authorization: Bearer <token>
```

**Comportamento**:
1. Obtém registros do **stub Maggo**.
2. Faz merge/upsert com `nfs` por `numero`.
3. Aplica filtros (mês/ano/status/arquivadas) sobre a visão mesclada.
4. Resposta: array de Conta a Receber ([data-model](../data-model.md)), incluindo `caixa`.

**Erros**:
| Código | Quando |
|--------|--------|
| 502/503 | Stub Maggo falhou (`MAGGO_STUB_FAIL` ou erro interno do stub) |
| 401 | Sem autenticação |

**Não**: retornar `[]` com HTTP 200 quando o stub falhou.

## Atualização (allowlist)

```http
PUT /api/nfs/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

**Body permitido** (qualquer subconjunto):

```json
{
  "caixa": "corrente",
  "data_pagamento": "2026-07-15",
  "colaborador_lead_id": 1,
  "colaborador_conducao_id": 2,
  "colaborador_placement_id": 3,
  "arquivada": false
}
```

- `caixa`: `"corrente"` \| `"investimento"` \| `null`
- Arquivar: `{ "arquivada": true }` (fluxo já usado)

**Rejeitar** (422): `numero`, `razao_social`, `valor_*`, `data_emissao`, `data_vencimento`, `tipo`, `tipo_abertura_fechamento`, `status` direto (exceto efeitos derivados do pagamento), outros campos Maggo.

**Autorização**: admin apenas (visualizador → 403), padrão do produto.

## Endpoints removidos da superfície de negócio

| Método | Path | Resposta nesta feature |
|--------|------|------------------------|
| POST | `/api/nfs` | **403** — criação local desabilitada |
| DELETE | `/api/nfs/{id}` | **403** — exclusão individual desabilitada |
| DELETE | `/api/nfs/todas` | **403** — exclusão em massa desabilitada |
| POST | `/api/nfs/importar-xlsx` | **403** — importação desabilitada |

## Endpoints mantidos

| Método | Path | Notas |
|--------|------|-------|
| GET | `/api/nfs/resumo/total` | Totais a partir da visão mesclada / `nfs` pós-merge |
| GET | `/api/nfs/exportar-xlsx` | Exportação permitida (FR-012) |
| GET | `/api/nfs/{id}` | Detalhe mesclado |

## Stub Maggo (interno)

- Módulo: `backend/app/services/maggo_stub.py`
- Função: `listar_contas_receber() -> list[dict]`
- Flag de falha: `MAGGO_STUB_FAIL=true` (dev) → exceção → 502/503
- Substituição futura: trocar implementação do serviço; manter contrato HTTP acima (FR-014)

## Pasta de arquivos

- Rotas `/api/arquivos-nfs` **não** precisam ser removidas nesta feature.
- **Contrato de produto**: página Contas a Receber **não** expõe UI para elas.
