# Data Model: Página Contas a Receber

**Feature**: `007-contas-receber` | **Date**: 2026-07-26  
**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

## Visão geral

```text
[ Stub Maggo ] --listar--> merge por numero --> [ nfs (Ocean) ] --enriquecimento--> UI Contas a Receber
                                              ↑
                                    PUT allowlist (caixa, pagamento,
                                    colaboradores, arquivada)
```

## Entidades

### Conta a Receber (visão mesclada)

Projeção retornada à UI / contratos. Campos Maggo vêm do stub; enriquecimento do Ocean.

| Campo | Origem | Editável Ocean | Tipo / valores | Notas |
|-------|--------|----------------|----------------|-------|
| `id` | Ocean | não | int | PK local após merge/upsert |
| `numero` | Maggo | não | string (único) | Chave de merge com stub |
| `razao_social` | Maggo | não | string | |
| `posicao` | Maggo | não | string? | |
| `candidato` | Maggo | não | string? | |
| `valor_bruto` | Maggo | não | number | |
| `valor_liquido` | Maggo | não | number | |
| `data_emissao` | Maggo | não | date | |
| `data_vencimento` | Maggo | não | date | |
| `tipo` | Maggo | não | `retainer` \| `sucesso` | |
| `tipo_abertura_fechamento` | Maggo | não | `abertura` \| `fechamento` \| null | |
| `status` | Ocean (derivado) | indireto | `paga` \| `pendente` \| `vencida` \| `cancelada` | Atualizado ao registrar pagamento (fluxo existente) |
| `data_pagamento` | Ocean | **sim** | date? | |
| `colaborador_lead_id` | Ocean | **sim** | int? | |
| `colaborador_conducao_id` | Ocean | **sim** | int? | |
| `colaborador_placement_id` | Ocean | **sim** | int? | |
| `arquivada` | Ocean | **sim** | boolean | Default false; ocultar na lista padrão |
| `caixa` | Ocean | **sim** | `corrente` \| `investimento` \| null | NULL = não definido |

### Stub Maggo (registro de origem)

| Campo | Obrigatório | Notas |
|-------|-------------|-------|
| `numero` | sim | Estável entre chamadas do stub |
| `razao_social` | sim | |
| `valor_bruto`, `valor_liquido` | sim | |
| `data_emissao`, `data_vencimento` | sim | |
| `tipo`, `tipo_abertura_fechamento` | sim / opcional | Mesmos enums do domínio NF |
| `posicao`, `candidato` | não | |

O stub **não** envia `caixa`, colaboradores, `arquivada` nem `data_pagamento`.

### Identificação de Caixa

| Valor | Significado |
|-------|-------------|
| `corrente` | Conta corrente (alinhado a Fluxo de Caixa) |
| `investimento` | Conta investimento |
| `null` | Não definido — UI deve indicar ausência |

## Persistência (PostgreSQL)

Tabela existente `nfs`:

- **Nova coluna**: `caixa VARCHAR(20) NULL` — constraint de aplicação: só `corrente`, `investimento` ou NULL.
- Migration runtime: `ALTER TABLE nfs ADD COLUMN IF NOT EXISTS caixa VARCHAR(20)` em `main.py` (padrão do projeto).
- Demais colunas inalteradas.

## Regras de validação

1. Merge: para cada item do stub, `UPSERT` lógico por `numero` — se não existir linha Ocean, criar com campos Maggo; se existir, **atualizar campos Maggo** a partir do stub e **preservar** enriquecimento Ocean.
2. PUT: rejeitar payload com campos fora da allowlist.
3. `caixa` inválido (outro string) → 422.
4. Visualizador: sem PUT/ações de escrita (já existente).
5. Arquivadas: excluídas da lista padrão; incluídas se `incluir_arquivadas=true`.

## Transições de estado (status)

Inalteradas em relação ao domínio atual de NF:

| Evento | Efeito |
|--------|--------|
| Registrar `data_pagamento` | `status` → `paga` (conforme regra já usada) |
| Remover pagamento / pendente vencido | `pendente` / `vencida` conforme datas |
| Arquivar | `arquivada = true` (não é status; filtro de lista) |

Criação/cancelamento local via “Nova NF” **não** faz parte desta feature.

## Relacionamentos

- Conta a Receber `n`—`0..1` Identificação de Caixa (atributo).
- Conta a Receber `n`—`0..1` cada colaborador (lead / condução / placement) — FKs existentes.
- Stub Maggo `1`—`0..1` linha Ocean (via `numero`).
