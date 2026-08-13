# Data Model: Fluxo de Caixa — Conta Corrente e Conta Investimento

**Feature**: `025-fluxo-caixa-contas` | **Date**: 2026-08-13  
**Spec**: [spec.md](./spec.md)

## Enum de fluxo

Valores canônicos (persistidos e na UI): `corrente` | `investimento`.  
Rótulos: **Conta corrente** | **Conta investimento**.

## Entidades persistidas

### Lançamento manual (`fluxo_movimentos`)

| Campo | Uso |
|-------|-----|
| `id` | PK; `movId` na tela para Remover |
| `tipo` | `receita` \| `despesa` |
| `descricao`, `valor`, `data_movimento`, `mes`, `ano` | Inalterados |
| **`conta`** | **Novo.** `corrente` \| `investimento`. Default `corrente`. Define o fluxo. |

**Validação**: `conta` obrigatória na criação; rejeitar outro valor (400). Sem UPDATE de `conta` nesta feature.

**Legado**: linhas existentes ⇒ `corrente`.

### Saldo (`saldos`)

Inalterado. Já tem `conta`. Na tela: listar/criar/editar só com a conta do fluxo ativo. Registro de outra conta permanece no banco e só aparece ao trocar o fluxo.

### Conta a Receber (`nfs`)

Inalterado. `caixa` (`corrente` \| `investimento` \| null) **roteia** a entrada automática. Não se edita Caixa no Fluxo de Caixa.

### Conta a Pagar (`contas_pagar`)

Inalterado. **Sem** `caixa`. Saída automática só no fluxo `corrente`.

## Entidade de tela: visão de fluxo

| Campo | Regra |
|-------|--------|
| `fluxoAtivo` | `corrente` (abertura) ou `investimento` |
| Movimentos visíveis | Automáticos roteados + manuais com `conta === fluxoAtivo`, no período |
| Saldos visíveis | `saldos.conta === fluxoAtivo` no período |
| Totais / CSV | Só movimentos visíveis |

## Roteamento automático → fluxo

```text
CR recebida, caixa investimento  → fluxo investimento
CR recebida, caixa corrente      → fluxo corrente
CR recebida, caixa vazio         → fluxo corrente
CP paga                          → fluxo corrente (nunca investimento)
manual                           → fluxo = conta persistida (= fluxo ativo na criação)
```

Elegibilidade 024 permanece: recebido/pago, data de pagamento no período, valor > 0, CR não arquivada.

## Transições

```text
abrir tela                         → fluxoAtivo = corrente
alternar seletor                   → fluxoAtivo muda; mês/ano iguais; recarrega recorte
incluir receita/despesa            → POST conta = fluxoAtivo
registrar saldo                    → POST/PUT conta = fluxoAtivo
remover manual                     → DELETE; some só daquele fluxo
reclassificar manual               → inexistente
```
