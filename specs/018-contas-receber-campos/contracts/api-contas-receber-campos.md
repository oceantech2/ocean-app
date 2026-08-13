# Contrato API: Contas a Receber — Campos Maggo e Ocean

**Feature**: `018-contas-receber-campos` | **Date**: 2026-08-12  
**Spec**: [spec.md](../spec.md) · **Modelo**: [data-model.md](../data-model.md)

> Prefixo existente `/api/nfs`. Sem endpoints novos. Ajusta merge Maggo, allowlist PUT, create e nulos.

## Stub Maggo (entrada)

Cada item:

```json
{
  "maggo_id": "MAGGO-006",
  "razao_social": "Cliente Novo Ltda",
  "posicao": "Analista",
  "candidato": null,
  "valor_bruto": 10000.0,
  "valor_imposto": 1500.0,
  "valor_liquido": 8500.0,
  "data_ent_pgto": "2026-08-20",
  "tipo": "retainer",
  "tipo_abertura_fechamento": "abertura"
}
```

| Campo no stub | Uso |
|---------------|-----|
| `maggo_id` | chave de merge (obrigatório) |
| `razao_social`, `posicao`, `candidato`, `valor_bruto`, `valor_imposto`, `valor_liquido`, `data_ent_pgto` | grupo Maggo |
| `tipo` / `tipo_abertura_fechamento` | convertidos para tipo oficial (017) |
| `numero`, `data_emissao`, `data_vencimento` | **ignorados** se presentes |

Item sem `maggo_id` ou com tipo desconhecido: pular (não inventar linha).

## Listagem

```http
GET /api/nfs
```

Filtro `mes`/`ano`: data de referência = `COALESCE(data_emissao, data_ent_pgto, criado_em::date)`.

`NFResponse` inclui:

```json
{
  "id": 1,
  "maggo_id": "MAGGO-006",
  "numero": null,
  "razao_social": "Cliente Novo Ltda",
  "posicao": "Analista",
  "valor_bruto": 10000.0,
  "valor_imposto": 1500.0,
  "valor_liquido": 8500.0,
  "data_ent_pgto": "2026-08-20",
  "data_emissao": null,
  "data_vencimento": null,
  "data_pagamento": null,
  "tipo": "retainer",
  "status": "pendente",
  "origem": "maggo",
  "caixa": null
}
```

`valor_imposto`, `data_ent_pgto`, `data_emissao`, `data_vencimento`, `numero`, `maggo_id` podem ser `null`.

## Criação manual

```http
POST /api/nfs
Authorization: Bearer <token admin>
```

**Mínimo válido:**

```json
{
  "razao_social": "Cliente Manual LTDA",
  "valor_bruto": 10000.0,
  "valor_liquido": 8500.0,
  "tipo": "sucesso"
}
```

| Condição | Resposta |
|----------|----------|
| OK mínimo | **201** — datas/NF/`valor_imposto`/`data_ent_pgto` null; `origem: "manual"`; `status: "pendente"` |
| `numero` sem `data_emissao` | **422** |
| `numero` + `data_emissao` livres | **201** |
| `numero` duplicado | **409** `NF_NUMERO_DUPLICADO` |
| Falta empresa / tipo / bruto / líquido | **422** |
| Recebido sem Caixa / data pagamento | **422** |
| Visualizador | **403** |

Campos opcionais no body: `numero`, `posicao`, `candidato`, `valor_imposto`, `data_ent_pgto`, `data_emissao`, `data_vencimento`, `data_pagamento`, `caixa`.

## Atualização

```http
PUT /api/nfs/{id}
```

### Origem `maggo` — permitidos (Ocean)

`numero`, `data_emissao`, `data_vencimento`, `data_pagamento`, `caixa`, `colaborador_*_id`, `arquivada`.

| Body | Efeito |
|------|--------|
| `numero` + `data_emissao` | grava NF Ocean; unique 013 |
| `numero` sem `data_emissao` (e registro sem emissão) | **422** |
| `data_vencimento` | grava; recalc status |
| grupo Maggo (`razao_social`, `posicao`, `valor_bruto`, `valor_imposto`, `valor_liquido`, `tipo`, `data_ent_pgto`, `candidato`) | **422** “Campos Maggo não podem ser alterados” |

### Origem `manual`

Ambos os grupos. Mesmas regras de NF+emissão e Caixa.

## Sync (efeito colateral do GET)

1. Match `nfs.maggo_id == item.maggo_id`.
2. Se linha `origem=manual` com o mesmo `maggo_id` (não esperado): ignorar e listar colisão (header já usado).
3. Update: só grupo Maggo; **não** escrever `numero` / `data_emissao` / `data_vencimento` / pagamento / Caixa / colaboradores / arquivada.
4. Insert: Ocean nulo; `status=pendente`; `origem=maggo`.

## Endpoints inalterados nesta feature

| Método | Path | Nota |
|--------|------|------|
| DELETE | `/api/nfs/{id}` e `/todas` | 403 |
| POST | `/api/nfs/importar-xlsx` | fora de escopo |
| GET | `/api/relatorios/*`, dashboard | filtro por `data_emissao` **inalterado** (sem emissão = fora do faturamento) |
