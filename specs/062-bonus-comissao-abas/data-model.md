# Data Model: Página Bônus e Comissão com abas

**Feature**: `062-bonus-comissao-abas` | **Date**: 2026-09-14

## Entidade: Remuneração (persistida como `bonus`)

A mesma tabela e classe `Bonus` passam a discriminar **Comissão** e **Bônus**.

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|--------|
| id | int | sim | PK |
| tipo | string | sim | `comissao` \| `bonus`; DEFAULT `comissao`; CHECK recomendado |
| colaborador_id | int | sim | FK `colaboradores` — UI **Fornecedor** (ativo) |
| nf_id | int? | não* | FK `nfs.id`; obrigatório em cadastros novos via conta |
| mes | int | sim | 1–12 |
| ano | int | sim | Ano civil |
| atividades | text (JSON)? | só comissão | Array JSON; **NULL** se `tipo=bonus` |
| etapa | string? | só comissão | Legado; **NULL** se `tipo=bonus` |
| percentual | float? | só comissão | > 0 se comissão; **NULL** se `tipo=bonus` |
| valor_bonus | float | sim | Comissão: calculado `(percentual/100)×líquido`. Bônus: **informado**; nunca recalcula pelo líquido |
| liberado | boolean | sim | default `false` |
| pago | boolean | sim | default `false`; só `true` se `liberado=true` |
| data_liberacao | date? | não | Ao liberar |
| data_pagamento | date? | não | Ao pagar (data corrente) |
| cliente / posicao / numero_nf | string? | não | Derivados da NF quando `nf_id` set |
| criado_em | datetime | sim | |

\* Legado de comissão pode ter `nf_id` nulo. Novos bônus nascem com `nf_id` da conta.

### Regras por `tipo`

| | `comissao` | `bonus` |
|--|------------|---------|
| Atividade / percentual | obrigatórios (como 045) | **proibidos** (NULL) |
| Valor | calculado no sync | informado; `> 0` |
| Recalc se líquido da NF muda | só linha não liberada se %/atividades mudarem (045) | **nunca** |
| Aba | Comissão | Bônus |
| Histórico atual | todas as linhas pré-feature | vazio até o primeiro cadastro |

### Índices

| Índice | Colunas | Motivo |
|--------|---------|--------|
| `ix_bonus_tipo` | `tipo` | Filtro de aba / GET |
| `ix_bonus_nf_id` | `nf_id` | já existe — sync |
| `ix_bonus_colaborador_ano_mes` | `colaborador_id, ano, mes` | filtros (já usados) |

## Entidade: Conta a receber (`nfs`) — extensão de contrato

Sem colunas novas. Payload create/update aceita, **além** de `comissoes[]`:

```json
"bonus": [
  {
    "id": null,
    "colaborador_id": 12,
    "mes": 8,
    "ano": 2026,
    "valor": 500.00
  }
]
```

Semântica de sync (espelha 045, isolada por tipo):

- `id` presente → atualizar linha **não liberada** do mesmo `nf_id` e `tipo=bonus`.
- `id` ausente → criar `tipo=bonus`.
- Linhas `tipo=bonus` existentes da NF **não** enviadas e **não liberadas** → removidas.
- Linhas **liberadas** omitidas → permanecem.
- `bonus: null` / campo omitido → **não** altera bônus da NF.
- `comissoes` **não** vê nem apaga `tipo=bonus` (e o inverso).

Campo JSON `valor` (não `valor_bonus`) no input de bônus para deixar claro que é informado. Persistência continua em `bonus.valor_bonus`.

## Máquina de estados (igual nos dois tipos)

```text
[cadastrada] liberado=false, pago=false
    │ Liberar (admin)
    ▼
[liberada]   liberado=true,  pago=false  — imutável no sync daquele tipo
    │ Pagar (admin)
    ▼
[paga]       liberado=true,  pago=true   — terminal (sem estorno nesta versão)
```

**Regras**:
- `Pagar` com `liberado=false` → 422 (individual) ou ignorado no lote.
- `Liberar` com `liberado=true` → ignorado no lote / 422 no individual.
- Cadastro em linha liberada/paga → 422 no sync do tipo correspondente.

## Visibilidade na listagem

| Condição | Aba Comissão | Aba Bônus |
|----------|--------------|-----------|
| `tipo=comissao`, NF ativa ou `nf_id` nulo | sim | não |
| `tipo=bonus`, NF ativa | não | sim |
| `nf_id` → NF excluída | **não** | **não** |

## Agrupamento UI (não persistido)

Igual nos dois tipos, no recorte da aba ativa:

| Campo derivado | Escopo | Cálculo |
|----------------|--------|---------|
| **Liberado** (grupo) | por fornecedor | Σ `valor_bonus` onde `liberado=true` |
| **Liberado** (linha) | por linha | valor se liberada; senão “—” |
| **Pago** (linha) | por linha | `pago ? 'Pago' : 'Pendente'` |
| Total cabeçalho / gráfico | recorte + aba | Σ `valor_bonus` das linhas da aba |

## Relacionamentos

```text
nfs 1 ── * bonus (nf_id)   [mistura tipos; sync filtra]
colaboradores 1 ── * bonus (colaborador_id)
```

## Migração inline (`main.py`)

Ordem:

1. `ALTER TABLE bonus ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) NOT NULL DEFAULT 'comissao'`
2. Constraint / check se o dialeto permitir: `tipo IN ('comissao','bonus')`
3. `ALTER TABLE bonus ALTER COLUMN percentual DROP NOT NULL`
4. `ALTER TABLE bonus ALTER COLUMN etapa DROP NOT NULL`
5. `CREATE INDEX IF NOT EXISTS ix_bonus_tipo ON bonus (tipo)`
6. Sem UPDATE de backfill (DEFAULT já classifica o histórico como comissão)

PostgreSQL 16: `ALTER COLUMN … DROP NOT NULL` é suficiente; `etapa` hoje `String(50) NOT NULL`.

## Auditoria

Entidade gravada permanece `"Bonus"` (classe SQLAlchemy).

| Ação | Detalhe |
|------|---------|
| criar/editar via NF sync (bônus) | NF #{id}, tipo bonus, fornecedor, valor informado |
| criar/editar via NF sync (comissão) | inalterado (045) |
| liberar / pagar / lote | inalterado; ids de qualquer tipo |

## Invariantes

- Nenhuma linha muda de `tipo` depois de criada.
- `tipo=bonus` ⇒ `percentual IS NULL` ∧ atividades/etapa vazios.
- `tipo=comissao` ⇒ `percentual IS NOT NULL` (novos cadastros).
- Valor de bônus **não** depende de `nfs.valor_liquido`.
