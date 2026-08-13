# Research: Fluxo de Caixa — Conta Corrente e Conta Investimento

**Feature**: `025-fluxo-caixa-contas` | **Date**: 2026-08-13

## 1. Como persistir o fluxo do lançamento manual

**Decision**: Coluna `conta` em `fluxo_movimentos`: `corrente` \| `investimento`, `NOT NULL`, default **`corrente`**. Migration runtime `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` em `backend/app/main.py` (padrão do projeto). GET aceita `conta`; POST grava `conta` enviado pelo cliente (fluxo ativo). Linhas antigas sem valor efetivo = corrente.

**Rationale**: Hoje o manual não tem conta; sem persistir, investimento e corrente misturam de novo. Default corrente alinha FR-002/FR-006 e o legado operacional.

**Alternatives considered**: Inferir conta só no cliente (quebra ao recarregar). Duas tabelas (overkill). Obrigar backfill manual (atrito).

## 2. Onde filtrar o fluxo (cliente vs API)

**Decision**: **Manuais e saldos**: filtrar na API (`GET /fluxo-movimentos?conta=` e `GET /saldos?conta=` — saldos já têm o query param). **Automáticos**: filtrar no cliente em `mapearMovimentos` (CR pela `caixa`; CP só se fluxo = corrente), depois de carregar paginado como na 024.

**Rationale**: Automáticos não são linhas de caixa; a 024 já monta no cliente. Saldos já suportam `conta`. Manuais precisam do filtro no servidor para não vazar investimento na lista de corrente (e o inverso).

**Alternatives considered**: Filtrar manuais só no cliente após GET sem `conta` — funciona, mas a API passaria a outra conta sem necessidade. Endpoint único `/fluxo-caixa` — recusado na 024.

## 3. Regra de roteamento dos automáticos

**Decision**:

| Origem | Fluxo |
|--------|--------|
| Contas a Receber com `caixa === 'investimento'` | Conta investimento |
| Contas a Receber com `caixa === 'corrente'` | Conta corrente |
| Contas a Receber com `caixa` null/ausente | Conta corrente |
| Contas a Pagar (qualquer) | Só Conta corrente; **nunca** investimento |

**Rationale**: Clarify: pagar sem campo Caixa; CR sem Caixa não some do caixa.

**Alternatives considered**: Caixa em Contas a Pagar (fora de escopo). Esconder CR sem Caixa (recusado na spec).

## 4. Estado do seletor de fluxo na UI

**Decision**: Estado local (`useState`) na página: `'corrente' \| 'investimento'`, inicial **`corrente`**. Não persistir em `localStorage`. Trocar fluxo **não** zera mês/ano. Recarregar dados ao mudar fluxo (saldos e manuais com `conta`; automáticos podem reusar o cache da sessão **se** já carregados no mesmo período — aceitável recarregar tudo como o `useEffect` atual `[ano, mes]`, incluindo `fluxo` nas deps).

**Rationale**: Spec: sem memória entre sessões; simplicidade.

**Alternatives considered**: Query string `?conta=` (útil para deep link, fora do pedido). Zustand (desnecessário para um seletor de página).

## 5. Formulários sem seletor

**Decision**: Modal de receita/despesa **sem** campo conta; `criar` envia `conta: fluxoAtivo`. Modal de saldo **sem** `<select>` de conta; payload `conta: fluxoAtivo`. Import CSV de saldos **permanece** com coluna `conta` no arquivo (já existe); a tabela na visão atual só lista a conta ativa.

**Rationale**: Clarify Q4 + FR-011. CSV legado não é o formulário da tela.

**Alternatives considered**: Seletor no modal (recusado). Forçar CSV a ignorar coluna e usar só fluxo ativo (quebra importações existentes com as duas contas).

## 6. Cards, tabela e gráfico

**Decision**: Um card de saldo (último da conta ativa). Tabela de saldos só `conta === fluxoAtivo`. Gráfico: uma série (nome **Conta corrente** ou **Conta investimento**). Totais de entradas/saídas já vêm da lista recortada.

**Rationale**: Clarify: recorte completo. Evita o segundo card “vazar” investimento na visão corrente.

**Alternatives considered**: Quatro cards (layout atual) — recusado. Duas linhas no gráfico — recusado.

## 7. Dependência da 024

**Decision**: Manter coluna Origem, espelho por `data_pagamento`, sem omitir automático, paginação 1000. Esta feature **só** recorta por fluxo.

**Rationale**: Constitution V; 024 já define o espelho.

**Alternatives considered**: Reabrir omissão ou importar lote — fora.
