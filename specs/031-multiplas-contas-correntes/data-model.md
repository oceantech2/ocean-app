# Data Model: Múltiplas contas correntes

**Feature**: `031-multiplas-contas-correntes` | **Date**: 2026-08-17  
**Spec**: [spec.md](./spec.md)

## Enums / códigos

| Código persistido | Significado | Origem |
|-------------------|-------------|--------|
| `corrente` | Conta corrente padrão seed (legado) | linha em `contas_correntes` |
| `cc_{id}` | Conta corrente cadastrada depois | linha em `contas_correntes` |
| `investimento` | Conta investimento (única) | **não** está em `contas_correntes` |

`FluxoConta` no cliente passa a ser `string` (codigo), não mais só `'corrente' \| 'investimento'`.

## Entidades persistidas

### ContaCorrente (`contas_correntes`) — nova

| Campo | Tipo | Regras |
|-------|------|--------|
| id | int PK | serial |
| codigo | string(64) unique | seed `corrente`; demais `cc_{id}` |
| nome | string(80) | obrigatório; único entre **ativas** (case-insensitive); ≠ rótulo do investimento |
| banco | string(80) | obrigatório |
| agencia | string(20) nullable | opcional |
| numero | string(32) nullable | opcional |
| padrao | bool | exatamente uma ativa com `true` |
| ativo | bool | default true; soft delete |
| criado_em | datetime | |

**Seed (migração)**: uma linha `codigo=corrente`, `nome=Conta corrente`, `banco=A definir`, `padrao=true`, `ativo=true`.

**Transições**

```text
criar (admin)           → ativo=true, padrao=false, codigo=cc_{id}
marcar padrão           → esta padrao=true; demais ativas padrao=false
desativar               → recusa se for a última ativa ou se padrao=true
reativar                → ativo=true; nome não pode colidir com outra ativa
```

### NF (`nfs.caixa`)

VARCHAR alargado (64). Valores: `null` (não recebida), `investimento`, ou `codigo` de conta corrente.

| Evento | Caixa |
|--------|--------|
| criar/receber (1º `data_pagamento`) | codigo da padrão (ignora body) |
| editar caixa já recebida | codigo ativa ou `investimento` |
| limpar pagamento | `null` |

### FluxoMovimento (`fluxo_movimentos.conta`)

VARCHAR alargado. Transferência: origem e destino ∈ {codigos de correntes **ativas**} ∪ {`investimento`}, distintos. Descrição de/para usa o **nome** da corrente ou “Conta investimento”.

### Saldo (`saldos.conta`)

VARCHAR já 50; aceita os mesmos códigos. Histórico `corrente` permanece na conta seed. Tabela continua **somente leitura** no Fluxo de Caixa.

### ContaPagar

Sem campo de caixa. Espelho no fluxo **somente** se o fluxo ativo = codigo da conta corrente padrão.

## Entidades de tela

### Gerenciar contas (modal no Fluxo de Caixa)

Lista correntes (ativas e, se a UI mostrar histórico, inativas só para consulta). Form criar/editar: nome, banco (obrigatórios), agência, número (opcionais), ação tornar padrão, desativar com confirm.

### Seletor de fluxo

Opções = contas correntes **ativas** (rótulo = nome) + Conta investimento. Abertura = codigo da padrão.

### Reclassificar (NFs)

Campo caixa visível **depois** de recebida: lista correntes ativas + investimento. Não aparece no ato de marcar recebido.

### Saldo visível (por codigo)

Igual 026, parametrizado pelo codigo:

```text
base = último saldos daquele codigo (ou 0)
delta = movimentos daquele codigo com data > data_registro
saldo visível = base + delta
```

Dashboard corrente = soma dos saldos visíveis das correntes **ativas**.

## Relacionamentos

```text
ContaCorrente 1 ──< NF.caixa (por codigo, se não investimento)
ContaCorrente 1 ──< FluxoMovimento.conta
ContaCorrente 1 ──< Saldo.conta
investimento (sentinela) ──< os mesmos campos quando valor = 'investimento'
```

## Validação

- Nome vazio / banco vazio → 400
- Nome duplicado entre ativas → 400
- Nome igual a “Conta investimento” (trim, case-insensitive) → 400
- Desativar padrão ou última ativa → 400
- Transferência origem=destino ou codigo inativo → 400
- Reclassificar NF não recebida ou para corrente inativa → 400
