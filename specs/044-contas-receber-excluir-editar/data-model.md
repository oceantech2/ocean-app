# Data model: Contas a Receber — exclusão, Tipo e Maggo editável

**Feature**: `044-contas-receber-excluir-editar` | **Date**: 2026-08-28

## Entidade — `nfs` (Conta a Receber)

Campos existentes inalterados na semântica, salvo o abaixo.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | inteiro | PK |
| maggo_id | string 80, index | Identidade da fonte; permanece após exclusão (tombstone) |
| origem | `manual` \| `maggo` | Imutável na edição; continua Maggo após editar campos Maggo |
| numero | string, unique, nullable | Continua ocupado após exclusão |
| razao_social | string | Grupo Maggo — editável no Ocean (admin) |
| posicao | string | Vaga/projeto — editável |
| candidato | string | Grupo Maggo na UI — editável |
| tipo | enum `tipofechamento` | `retainer` \| `sucesso` \| `parcelamento` (rótulo **Parcela**) |
| valor_bruto, valor_imposto, valor_liquido | número | Grupo Maggo — editável |
| data_ent_pgto | date | Data de fechamento — editável |
| numero, data_emissao, data_vencimento, data_pagamento, caixa, colaboradores, arquivada | (Ocean) | Inalterados |
| **excluida_em** | datetime, **nullable** | **Novo.** `NULL` = visível. Preenchido = excluída (some de todas as visões operacionais) |
| anexo_path / anexo_nome | | Podem permanecer; a linha some da UI. Opcional limpar arquivo no delete |

## Tipo de fechamento (enum existente)

| Valor gravado | Rótulo visível |
|---------------|----------------|
| `retainer` | Retainer |
| `sucesso` | Sucesso |
| `parcelamento` | **Parcela** (antes Parcelamento) |

Write aceita `parcelamento` ou alias `parcela`. Sem migração de valores.

## Relacionamentos

- Maggo stub → `maggo_id` (só **insert** se não existir linha com esse id, inclusive excluída).
- Fluxo de caixa: **sem** FK para `nfs`. Excluir NF **não** altera movimentos.
- Auditoria: evento `deletar` em entidade `NF`.

## Estados

```text
visível (excluida_em NULL)
  ├─ arquivada false → listagem padrão
  └─ arquivada true  → só com "mostrar arquivadas"

excluída (excluida_em preenchido)
  → invisível em listagem, arquivadas, totais, dashboard, relatórios, calendário
  → Maggo com o mesmo maggo_id não recria
  → GET por id → 404
  → sem restauração nesta entrega
```

## Validação

| Contexto | Regras |
|----------|---------|
| DELETE | Admin; conta Pendente ou Recebida, com ou sem NF; confirmação na UI |
| PUT Maggo | Admin pode enviar grupo Maggo; `origem` e `maggo_id` ignorados |
| Visualizador | Sem DELETE; PUT 403 (já vigente) |
| Merge Maggo | Existente (visível ou excluída) → não atualiza Maggo nem ressuscita; só cria id inédito |
| Número NF | Unicidade inclui linhas excluídas |

## Migração inline (`_migrar`)

1. `ALTER TABLE nfs ADD COLUMN IF NOT EXISTS excluida_em TIMESTAMP NULL`
2. Índice opcional: `(excluida_em)` ou parcial `WHERE excluida_em IS NULL` para listagens
3. Sem backfill (todas visíveis)
4. Sem alteração do enum `tipofechamento`
