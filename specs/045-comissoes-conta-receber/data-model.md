# Data Model: Comissões vinculadas à Conta a receber

**Feature**: `045-comissoes-conta-receber` | **Date**: 2026-08-29

## Entidade: Comissão (persistida como `bonus`)

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|--------|
| id | int | sim | PK |
| colaborador_id | int | sim | FK `colaboradores` — UI **Fornecedor** (ativo) |
| nf_id | int? | não* | FK `nfs.id`; obrigatório em novos cadastos via conta |
| mes | int | sim | 1–12 |
| ano | int | sim | Ano civil |
| atividades | text (JSON) | sim† | Array JSON: `lead`, `venda`, `conducao`, `placement` (≥1) |
| etapa | string | legado | Mantida; novos registros podem espelhar 1ª atividade ou ficar vazia |
| percentual | float | sim | > 0 |
| valor_bonus | float | sim | Calculado: `(percentual/100) × nfs.valor_liquido`; congelado se `liberado` |
| liberado | boolean | sim | default `false` |
| pago | boolean | sim | default `false`; só `true` se `liberado=true` |
| data_liberacao | date? | não | Preenchida ao liberar |
| data_pagamento | date? | não | Preenchida ao pagar (data corrente) |
| cliente | string? | legado | Derivável de `nfs.razao_social` quando `nf_id` set |
| posicao | string? | legado | Derivável de `nfs.posicao` |
| numero_nf | string? | legado | Derivável de `nfs.numero` |
| criado_em | datetime | sim | |

\* Registros legados podem ter `nf_id` nulo.  
† Legado: backfill `[etapa]` na migração.

### Índices sugeridos

| Índice | Colunas | Motivo |
|--------|---------|--------|
| `ix_bonus_nf_id` | `nf_id` | Sync e join listagem |
| `ix_bonus_colaborador_ano_mes` | `colaborador_id, ano, mes` | Filtros existentes |

## Entidade: Conta a receber (`nfs`) — extensão de contrato

Sem colunas novas na tabela. Payload de create/update aceita:

```json
"comissoes": [
  {
    "id": null,
    "colaborador_id": 12,
    "mes": 8,
    "ano": 2026,
    "atividades": ["lead", "venda"],
    "percentual": 10
  }
]
```

- `id` presente → atualizar linha **não liberada** existente.
- `id` ausente → criar linha.
- Linhas existentes da NF **não** enviadas e **não liberadas** → removidas no sync.
- Linhas **liberadas** omitidas do payload → permanecem inalteradas.

## Máquina de estados (Comissão)

```text
[cadastrada] liberado=false, pago=false
    │ Liberar (admin)
    ▼
[liberada]   liberado=true,  pago=false  — imutável no sync (exceto novas linhas na mesma NF)
    │ Pagar (admin)
    ▼
[paga]       liberado=true,  pago=true   — terminal (sem estorno nesta versão)
```

**Regras**:
- `Pagar` com `liberado=false` → 422.
- `Liberar` com `liberado=true` → 422 ou ignorado no lote.
- Alterar campos de cadastro em linha liberada/paga → 422 no sync.

## Cálculo de valor

```
valor_bonus = round((percentual / 100) * valor_liquido_nf, 2)
```

- Recalculado no sync quando NF `valor_liquido` muda **se** `liberado=false`.
- `valor_liquido <= 0` → `valor_bonus = 0` (percentual ainda válido).

## Visibilidade na listagem

| Condição | Aparece em Comissões |
|----------|----------------------|
| `nf_id` nulo (legado) | sim |
| `nf_id` → NF ativa (`excluida_em IS NULL`) | sim |
| `nf_id` → NF excluída | **não** |

## Agrupamento UI (não persistido)

| Campo derivado | Escopo | Cálculo |
|----------------|--------|---------|
| **Liberado** (grupo) | por fornecedor no recorte | Σ `valor_bonus` onde `liberado=true` |
| **Pago** (linha) | por comissão | `pago ? 'Pago' : 'Pendente'` |
| Total cabeçalho | recorte filtrado | Σ `valor_bonus` todas linhas visíveis |

Recorte mês/trimestre continua no cliente (feature 044).

## Relacionamentos

```text
nfs 1 ── * bonus (nf_id)
colaboradores 1 ── * bonus (colaborador_id)
```

## Migração inline (`main.py`)

Ordem:

1. `ADD COLUMN nf_id INTEGER REFERENCES nfs(id)`
2. `ADD COLUMN atividades TEXT`
3. `ADD COLUMN liberado BOOLEAN NOT NULL DEFAULT false`
4. `ADD COLUMN pago BOOLEAN NOT NULL DEFAULT false`
5. `ADD COLUMN data_liberacao DATE`
6. `ADD COLUMN data_pagamento DATE`
7. Backfill `atividades` a partir de `etapa` onde aplicável
8. `CREATE INDEX IF NOT EXISTS ix_bonus_nf_id ON bonus (nf_id)`

## Auditoria

| Ação | Entidade | Detalhe |
|------|----------|---------|
| criar/editar (via NF sync) | Bonus | NF #{nf_id}, fornecedor, valor |
| liberar / pagar | Bonus | transição de estado + valor |
| lote liberar/pagar | Bonus | contagem processados |

Entidade gravada permanece `"Bonus"` (inalterado).
