# Data Model: Imposto mensal nas propostas

## ImpostoProposta (nova) — tabela `impostos_proposta`

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | SERIAL PK | — |
| `ano` | INTEGER NOT NULL | 2000 ≤ ano ≤ 2100 (validação na API) |
| `mes` | SMALLINT NOT NULL | 1 ≤ mes ≤ 12 (CHECK `ck_impostos_proposta_mes`) |
| `percentual` | NUMERIC(5,2) NOT NULL | 0 < x < 100, 2 casas, arredondamento half-up (CHECK `ck_impostos_proposta_percentual`) |
| `criado_em` | TIMESTAMP NOT NULL | default UTC now |
| `atualizado_em` | TIMESTAMP NULL | preenchido em alterações |
| `atualizado_por` | VARCHAR(100) NULL | usuário do último salvamento |

- Unicidade: `UNIQUE (ano, mes)` (`uq_impostos_proposta_ano_mes`) — salvar mês existente = upsert.
- RLS habilitado (Supabase); acesso só pelo backend.
- Seed: (2026, 10, 18.75) com `ON CONFLICT DO NOTHING`.
- Sem exclusão nesta feature.

## Proposta (existente) — coluna nova

| Campo | Tipo | Regras |
|-------|------|--------|
| `imposto_percentual` | NUMERIC(5,2) NULL | Gravado em toda criação/edição de proposta por modelo com o imposto vigente. `NULL` = proposta antiga não editada → exibe 19,55%. Sempre `NULL` na proposta simples. |

## Regras derivadas

- **Imposto vigente** (`imposto_vigente(db, hoje_sp)`):
  1. Registro de (ano, mês) = mês corrente → `origem: "mes"`.
  2. Senão, registro mais recente com (ano, mês) < mês corrente → `origem: "anterior"`.
  3. Senão → 18,75 com `origem: "padrao"`, `mes/ano` nulos.
- **Constantes**: `IMPOSTO_PADRAO = 18.75` (sem cadastro), `IMPOSTO_LEGADO = 19.55` (exibição de propostas antigas e "anterior" no histórico quando a coluna era nula).
- **Hash** (formato novo): chave `imposto_percentual` (string `"18.75"`) só quando a coluna não é nula.
- **Diff de edição**: campo `imposto_percentual`; anterior nulo vira `"19.55"` no registro de alteração.

## Transições

```text
Proposta antiga (NULL, exibe 19,55) ──editar──▶ imposto_percentual = vigente
Proposta nova ──criar──▶ imposto_percentual = vigente ──editar (mês X)──▶ vigente em X
Assinada / cancelada ──▶ imutável
```
