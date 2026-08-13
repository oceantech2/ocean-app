# Data Model: Fluxo de Caixa — Transferência entre Caixas

**Feature**: `026-fluxo-caixa-transferencia` | **Date**: 2026-08-13  
**Spec**: [spec.md](./spec.md)

## Enums

| Nome | Valores | Rótulos UI |
|------|---------|------------|
| Fluxo / conta | `corrente` \| `investimento` | Conta corrente \| Conta investimento |
| Tipo persistido | `receita` \| `despesa` | Entrada \| Saída na lista |
| Origem na lista | `contas_receber` \| `contas_pagar` \| `manual` \| **`transferencia`** | Contas a Receber \| Contas a Pagar \| Manual \| **Transferência** |

## Entidades persistidas

### Lançamento em `fluxo_movimentos`

Campos atuais inalterados: `id`, `tipo`, `descricao`, `valor`, `data_movimento`, `mes`, `ano`, `conta`, `criado_em`.

| Campo | Uso nesta feature |
|-------|-------------------|
| **`par_id`** | **Novo.** UUID, nullable. `NULL` = manual legado. Preenchido = perna de transferência; as duas pernas compartilham o mesmo valor. |

**Perna origem**: `tipo=despesa`, `conta=origem`, `par_id=P`.  
**Perna destino**: `tipo=receita`, `conta=destino`, `par_id=P`.  
Mesmo `valor`, mesma `data_movimento` (e portanto mesmo `mes`/`ano`).

**Validação (criação do par)**: origem ≠ destino; ambas em `{corrente, investimento}`; valor &gt; 0; data ISO válida. Descrição: ver contratos (texto de/para automático).

**Legado**: linhas existentes `par_id` nulo; origem na UI continua **Manual**.

### Saldo (`saldos`)

Inalterado. Nesta tela: **somente leitura**. Serve de **base** do saldo visível (último registro da conta). MUST NOT criar/editar/excluir/importar pela UI do Fluxo de Caixa.

### Conta a Receber / Conta a Pagar

Inalterados. Continuam o espelho 024/025 (roteamento por `caixa` / CP só corrente).

## Entidades de tela

### Transferência (formulário)

| Campo | Regra |
|-------|--------|
| origem | `corrente` \| `investimento`; default = fluxo ativo |
| destino | a outra conta; usuário pode inverter |
| data | obrigatória |
| valor | número &gt; 0 e ≤ saldo visível da **origem** |
| observacao | opcional; anexada à descrição canônica |

### Saldo visível

```text
base = último saldos da conta (maior ano, mes, data_registro).saldo
     ou 0 se não houver
delta = soma dos movimentos da conta com data > data_registro
        (ou todos, se não houver histórico)
        CR/CP/manuais/transferências, sinalizados
saldo visível = base + delta
```

Usado no **card** do fluxo ativo e como **teto** da origem no modal (mesmo que o fluxo ativo seja o destino). Independente do filtro mês/ano da lista.

### Movimento do fluxo (lista)

Igual 025, mais: se `par_id` então `origem=transferencia`, `origem_rotulo=Transferência`, `manual` efetivo para ação = desfazer par (não remover um id). Totais do período: só o lado visível naquele fluxo.

## Transições

```text
abrir tela                    → fluxoAtivo = corrente (025)
Transferência (admin)         → valida teto no cliente → POST par → recarrega
desfazer transferência        → confirm → DELETE par_id → some nos dois fluxos
remover manual legado         → DELETE id (sem par_id)
valor > saldo origem          → recusa; nada grava
falha no POST                 → nenhum lado visível (transação)
visualizador                  → sem Transferência / desfazer / gravar saldo
```

## Invariantes

- Não existe perna de transferência sem irmã com o mesmo `par_id`.
- Uma transferência não aparece inteira (entrada+saída) nos totais do mesmo fluxo.
- Tabela histórica de saldos não é atualizada pela transferência.
