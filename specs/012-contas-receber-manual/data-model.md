# Data Model: Contas a Receber — Inserção Manual

**Feature**: `012-contas-receber-manual` | **Date**: 2026-08-06  
**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

## Visão geral

```text
[ Stub Maggo ] --sync--> merge por numero
                              │
                              ├─ se origem=manual → IGNORAR item Maggo (colisao)
                              └─ senão → upsert Maggo + preservar enriquecimento
[ POST admin ] --------------→ nfs (origem=manual)
[ PUT ] ----------------------→ allowlist conforme origem
                              ↓
                         UI Contas a Receber (+ coluna Origem)
```

## Entidades

### Conta a Receber (`nfs`)

| Campo | Tipo | Create manual | Edit manual | Edit Maggo | Notas |
|-------|------|---------------|-------------|------------|-------|
| `id` | int | gerado | — | — | PK |
| `numero` | string (único) | obrigatório | sim | não* | *número via política 013 se habilitada |
| `razao_social` | string | obrigatório | sim | não | |
| `valor_bruto` / `valor_liquido` | number | obrigatório | sim | não | |
| `data_emissao` | date | obrigatório | sim | não | emissão da nota |
| `data_vencimento` | date | obrigatório | sim | não | |
| `tipo` | retainer \| sucesso | obrigatório | sim | não | |
| `tipo_abertura_fechamento` | string? | opcional | sim | não | se retainer |
| `data_pagamento` | date? | se Recebido | sim | sim (enrich) | null se Pendente |
| `caixa` | corrente \| investimento \| null | se Recebido | sim | sim | obrigatória se Recebido |
| `status` | paga \| pendente \| vencida \| … | derivado | derivado | derivado | via `_calcular_status_nf` |
| `origem` | `manual` \| `maggo` | **manual** | imutável | imutável | nova coluna |
| `posicao` / `candidato` | string? | **não no create** | sim (edit) | não | |
| `colaborador_*_id` | int? | **não no create** | sim | sim | |
| `arquivada` | bool | false | sim | sim | |

### Origem do registro

| Valor | Rótulo UI | Significado |
|-------|-----------|-------------|
| `manual` | **Manual** | Criado pelo admin no Ocean |
| `maggo` | **Maggo** | Proveniente da fonte Maggo/stub (inclui legados backfill) |

### Pagamento (estado de UI)

| UI | Persistência |
|----|--------------|
| **Pendente** | `data_pagamento = null`; `caixa` opcional/null |
| **Recebido** | `data_pagamento` obrigatória; `caixa` ∈ {corrente, investimento} |

## Persistência

```sql
ALTER TABLE nfs ADD COLUMN IF NOT EXISTS origem VARCHAR(20);
-- backfill legados
UPDATE nfs SET origem = 'maggo' WHERE origem IS NULL;
-- aplicação: NOT NULL + CHECK implícito (manual|maggo)
```

Índice único existente em `numero` permanece (duplicidade bloqueada).

## Regras de validação

1. **Create**: campos FR-003; se Recebido → Caixa + data_pagamento; `numero` livre (trim); `origem=manual`.
2. **Colisão Maggo**: item stub com `numero` de registro `origem=manual` → ignorar; não sobrescrever.
3. **PUT Maggo**: só enriquecimento (caixa, data_pagamento, colaboradores, arquivada [+ numero se 013]).
4. **PUT Manual**: campos de negócio do create + enriquecimento; mesmas regras de Caixa se Recebido.
5. **Visualizador**: sem POST/PUT.
6. **Origem**: não alterável via API de update.

## Transições

| Evento | Efeito |
|--------|--------|
| Create Pendente | status pendente/vencida; origem manual |
| Create Recebido | status paga; caixa + data_pagamento |
| Edit → Recebido | exige caixa + data_pagamento |
| Edit → Pendente | limpa data_pagamento; caixa pode null |
| Arquivar | `arquivada=true` (lista padrão oculta) |
| Sync Maggo vs manual | skip; aviso opcional |

## Relacionamentos

- Conta a Receber `1`—`1` Origem (atributo).
- Conta a Receber `n`—`0..1` Caixa (atributo).
- Stub Maggo `1`—`0..1` linha Ocean via `numero`, **exceto** quando Ocean já é `manual`.
