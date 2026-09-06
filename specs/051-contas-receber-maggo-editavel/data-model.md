# Data Model: Contas a Receber — Campos Maggo editáveis

**Feature**: `051-contas-receber-maggo-editavel` | **Date**: 2026-09-06  
**Spec**: [spec.md](./spec.md)

## Escopo de modelo

**Sem migração nova.** Reutiliza `nfs` e `bonus` existentes.

## Entidade: Conta a Receber (`nfs`)

### Grupo Maggo (editável pelo admin no Ocean)

| Campo (coluna) | UI | Obrigatório na edição | Notas |
|----------------|-----|------------------------|-------|
| `posicao` | Projeto / vaga | não | |
| `razao_social` | Empresa | sim | |
| `candidato` | Candidato | não | |
| `tipo` | Tipo | sim | `retainer` \| `sucesso` \| `parcelamento` (rótulo Parcela) |
| `valor_bruto` | Valor bruto | sim | Dispara recálculo fiscal |
| `aliquota_imposto` | Alíquota (%) | não* | 0–100; *legado NULL até edição |
| `data_ent_pgto` | Data de fechamento | não | “Data ent. pgto” na linguagem Maggo |

### Derivados Maggo (somente leitura na UI; gravados pelo cálculo)

| Campo | Regra |
|-------|--------|
| `valor_imposto` | `round(bruto × (alíquota ou 0)/100, 2)` |
| `valor_liquido` | `round(bruto − imposto, 2)` |

Cliente **não** define imposto/líquido de forma autoritativa no PUT.

### Imutáveis nesta feature

| Campo | Regra |
|-------|--------|
| `origem` | `manual` \| `maggo` — não muda ao editar grupo Maggo |
| `maggo_id` | Identidade do fechamento Maggo — não muda; chave do merge |

### Grupo Ocean (inalterado nas regras)

`numero`, `data_emissao`, `data_vencimento`, `data_pagamento`, `status` (derivado), `caixa`, colaboradores/comissões no formulário, `arquivada`, `excluida_em`.

## Entidade: Comissão (`bonus`)

| Campo relevante | Comportamento nesta feature |
|-----------------|------------------------------|
| `nf_id` | Vínculo com a conta |
| `valor_bonus` | **Não** recalcular automaticamente quando só bruto/alíquota/líquido da NF mudam |
| `percentual`, `atividades` | Se o admin alterar explicitamente a linha de comissão, aí sim pode recalcular `valor_bonus` com o líquido **atual** |
| `liberado` / `pago` | Intocados por edição Maggo |

## Merge Maggo → Ocean

```text
maggo_id inédito (e não excluído) → INSERT com campos Maggo da fonte
maggo_id já existe (visível ou excluída) → NO-OP nos campos Maggo (não update, não ressuscitar)
origem=manual com mesmo maggo_id → colisão (comportamento vigente)
```

## Relação com caixa

Edição de valores Maggo **não** altera movimentos de Fluxo de Caixa. Não há FK obrigatória valor-NF→movimento nesta feature.

## Validação (resumo)

- Empresa, tipo, valor bruto obrigatórios; líquido resultante do cálculo deve ser válido (≥ 0 coerente com regras atuais).
- Alíquota fora de 0–100 → erro de validação.
- NF com número exige emissão (regra vigente).
- Visualizador: sem escrita.
