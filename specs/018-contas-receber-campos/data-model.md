# Data Model: Contas a Receber — Campos Maggo e Ocean

**Feature**: `018-contas-receber-campos` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

## Visão geral

```text
[ Stub Maggo ] -- maggo_id --> merge
       │                         │
       │  grupo Maggo            ├─ insert: Ocean NULL, status pendente
       │  (sempre atualiza)      └─ update: só grupo Maggo; preserva Ocean
       ▼
[ nfs ]
       ▲
[ PUT admin ] -- Maggo: só Ocean (NF, emissão, vencimento, pagamento, Caixa, …)
              -- Manual: Maggo-equivalente + Ocean
[ POST admin ] -- origem=manual; obrigatórios: empresa, tipo, bruto, líquido
```

## Entidades

### Conta a Receber (`nfs`)

| Campo | Origem de dado | Create manual | Edit manual | Edit Maggo | Notas |
|-------|----------------|---------------|-------------|------------|-------|
| `id` | Ocean | gerado | — | — | PK |
| `maggo_id` | Maggo | NULL | — | imutável | unique se preenchido; chave de merge |
| `numero` | **Ocean** | opcional | sim | **sim** | NULL = sem NF; unique se preenchido |
| `razao_social` | Maggo / manual | **obrigatório** | sim | não | UI: Empresa |
| `posicao` | Maggo / manual | opcional | sim | não | UI: Vaga |
| `candidato` | Maggo / manual | opcional | sim | não | extra; não é coluna mínima FR-014 |
| `valor_bruto` | Maggo / manual | **obrigatório** | sim | não | |
| `valor_imposto` | Maggo / manual | opcional | sim | não | **novo**; NULL = ausente; 0 = zero |
| `valor_liquido` | Maggo / manual | **obrigatório** | sim | não | não recalcular |
| `data_ent_pgto` | Maggo / manual | opcional | sim | não | **novo**; ≠ `data_pagamento` |
| `tipo` | Maggo / manual | **obrigatório** | sim | não | UI: Método de pagamento; 017 |
| `data_emissao` | **Ocean** | opcional* | sim* | **sim*** | *obrigatória se `numero` preenchido |
| `data_vencimento` | **Ocean** | opcional | sim | **sim** | NULL → status não é vencida |
| `data_pagamento` | Ocean | se Recebido | sim | sim | |
| `caixa` | Ocean | se Recebido | sim | sim | |
| `status` | derivado | derivado | derivado | derivado | sem edição direta |
| `origem` | Ocean | `manual` | imutável | imutável | |
| colaboradores / `arquivada` | Ocean | default | sim | sim | inalterado |

\* Se `numero` informado → `data_emissao` obrigatória (clarify Q3).

### Identificador Maggo

| Estado | `maggo_id` | Merge |
|--------|------------|-------|
| Origem Maggo | string estável da fonte | upsert por este valor |
| Origem manual | `NULL` | não entra no merge Maggo |

### Status (derivado)

| Condição | Status |
|----------|--------|
| `data_pagamento` preenchida | `paga` |
| Sem pagamento **e** `data_vencimento` < hoje | `vencida` |
| Demais (incl. vencimento `NULL`) | `pendente` |

## Persistência

```sql
ALTER TABLE nfs ADD COLUMN IF NOT EXISTS maggo_id VARCHAR(80);
ALTER TABLE nfs ADD COLUMN IF NOT EXISTS valor_imposto FLOAT;
ALTER TABLE nfs ADD COLUMN IF NOT EXISTS data_ent_pgto DATE;
ALTER TABLE nfs ALTER COLUMN data_emissao DROP NOT NULL;
ALTER TABLE nfs ALTER COLUMN data_vencimento DROP NOT NULL;

-- unique só quando maggo_id existe (manuais todos NULL)
CREATE UNIQUE INDEX IF NOT EXISTS ix_nfs_maggo_id
  ON nfs (maggo_id) WHERE maggo_id IS NOT NULL;

-- backfill: id da fonte = número legado Maggo (NF Ocean permanece)
UPDATE nfs SET maggo_id = numero
  WHERE origem = 'maggo' AND maggo_id IS NULL AND numero IS NOT NULL;
```

Modelo: `data_emissao` / `data_vencimento` `nullable=True`; `maggo_id` unique via índice parcial (não `unique=True` na coluna — vários NULL).

## Regras de validação

1. **Create manual**: `razao_social`, `tipo`, `valor_bruto`, `valor_liquido` obrigatórios; resto opcional; `numero` + unique 013; se `numero` → `data_emissao` obrigatória; Recebido → Caixa + `data_pagamento`.
2. **PUT Maggo**: rejeitar grupo Maggo RO (422); aceitar Ocean (incluindo `numero` / datas da nota).
3. **PUT manual**: ambos os grupos; mesmas regras de NF+emissão e Caixa.
4. **Sync Maggo**: match `maggo_id`; ignora `numero`/`data_emissao`/`data_vencimento` do payload; atualiza grupo Maggo sempre; insert com Ocean NULL e `status=pendente`.
5. **Filtro listagem mês/ano**: `COALESCE(data_emissao, data_ent_pgto, criado_em::date)`.
6. **Visualizador**: sem POST/PUT.

## Transições

| Evento | Efeito |
|--------|--------|
| Sync Maggo novo `maggo_id` | insert; NF/emissão/vencimento NULL; pendente |
| Sync Maggo existente | update grupo Maggo; Ocean intacto; recalc status só se vencimento/pagamento Ocean mudaram (não mudam no sync) |
| Admin lança NF + emissão | grava Ocean; unique 013 |
| Admin lança só emissão | permitido (sem número) |
| Admin lança número sem emissão | 422 |
| Admin lança vencimento passado, sem pagamento | status → vencida |
| Admin marca Recebido | status → paga (com ou sem vencimento) |
| Maggo altera bruto após NF | bruto/imposto/líquido atualizam; NF permanece |

## Relacionamentos

- Conta `n`—`0..1` `maggo_id` (ausente se manual).
- Stub Maggo `1`—`0..1` linha Ocean via `maggo_id`.
- Unicidade de NF continua em `numero` (vários `NULL` OK).
