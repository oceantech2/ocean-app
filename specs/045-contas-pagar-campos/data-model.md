# Data Model: Contas a Pagar — Fornecedor, cards e campos Conta/Tipo

**Feature**: `045-contas-pagar-campos` | **Date**: 2026-08-29  
**Spec**: [spec.md](./spec.md)

## Enums

| Campo | Valores persistidos | Rótulo UI |
|-------|---------------------|-----------|
| `tipo_despesa` | `fixo`, `variavel` | Fixo, Variável |
| `caixa` | codigo de `contas_correntes` ativa | Nome da conta (ex.: Conta Corrente 1) |

Investimento **não** é valor válido para `contas_pagar.caixa` (mesma regra da 036).

## Entidade: ContaPagar (`contas_pagar`)

### Colunas novas / alteradas

| Coluna | Tipo | Obrigatório | Default | Notas |
|--------|------|-------------|---------|-------|
| `tipo_despesa` | VARCHAR(10) | Sim | `variavel` | Nova; CHECK implícito na API |
| `caixa` | VARCHAR(64) | Sim* | migração → padrão | *Sempre gravado na API; antes era `null` se pendente |

Demais colunas existentes: `fornecedor_id` (FK opcional), `pago`, `data_pagamento`, etc.

### Regras de transição — `caixa`

| Evento | `caixa` |
|--------|---------|
| Criar (pendente ou paga) | Codigo de corrente **ativa**; omitido → `codigo_padrao(db)` |
| Editar pendente | Atualiza `caixa` se informado; não zera por estar pendente |
| Marcar pago (modal/lista) | Usa `caixa` já gravado como inicial; admin pode trocar |
| Desmarcar pagamento (limpar data) | Mantém `caixa` gravado (planejamento de caixa) |
| Importação XLSX | `codigo_padrao(db)` + `tipo_despesa=variavel` |
| Legado `caixa IS NULL` | Backfill único para corrente padrão |

### Regras — `tipo_despesa`

| Evento | Valor |
|--------|-------|
| Criar sem informar | `variavel` (UI pré-seleciona) |
| Criar/editar com valor inválido | 422 |
| Legado / import | `variavel` até admin editar |
| Dashboard Fixas/Variáveis | **Ignora** este campo (fora de escopo) |

### Regras — `fornecedor_id`

| Evento | Comportamento |
|--------|---------------|
| Opcional | `null` permitido |
| Ativo na lista | Só fornecedores `ativo=true`, `tipo=fornecedor` |
| Inativo vinculado | Exibir na edição com sufixo “(inativo)”; não listar para nova seleção |

## Entidades de tela (calculadas, não persistidas)

### Cards de totais

Derivados de `contasFiltradas` na UI:

```text
Pago     = Σ valor where pago
Vencido  = Σ valor where !pago AND vencimento < hoje
A pagar  = Σ valor where !pago AND vencimento >= hoje
Total    = Pago + A pagar + Vencido
```

## Relacionamentos

```text
Colaborador (fornecedor) ──< ContaPagar.fornecedor_id
ContaCorrente.codigo     ──< ContaPagar.caixa
```

## Validação (API)

- `tipo_despesa` ∉ {fixo, variavel} → 422
- `caixa` = investimento ou corrente inativa → 400
- Sem corrente ativa no sistema → 400 ao criar/atualizar conta
- `fornecedor_id` inexistente ou inativo (nova vinculação) → 400

## Migração (`main.py`)

1. `ALTER TABLE contas_pagar ADD COLUMN IF NOT EXISTS tipo_despesa VARCHAR(10) NOT NULL DEFAULT 'variavel'`
2. Backfill: `UPDATE contas_pagar SET caixa = :codigo_padrao WHERE caixa IS NULL` (executar após garantir ao menos uma corrente ativa)
