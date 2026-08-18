# Research: Seleção de conta corrente

**Feature**: `036-selecao-conta-corrente` | **Date**: 2026-08-18  
**Spec**: [spec.md](./spec.md)

## 1. Contas a Receber vs NFs no código

**Decision**: Uma única superfície — `frontend/src/pages/NFs.tsx`, rota `/nfs`, menu “Contas a Receber”. `/contas-receber` já redireciona para `/nfs`.

**Rationale**: A spec cita as duas telas porque o campo foi ocultado na 019 e a 031 restringiu caixa no receber; no produto são o mesmo módulo. Duplicar página violaria simplicidade (constituição V).

**Alternatives considered**: Segunda página só de NFs — rejeitada (não existe). Tratar “NFs” como outra entidade — rejeitado (`nfs` é a tabela de contas a receber).

## 2. Persistência em Contas a Pagar

**Decision**: Coluna `contas_pagar.caixa VARCHAR(64)` nullable; mesmos códigos de `nfs.caixa` **exceto** que a API das origens recusa `investimento`.

**Rationale**: Espelho do fluxo hoje filtra pagar só quando o fluxo ativo é a padrão. Sem coluna, a escolha do usuário não sobrevive. VARCHAR alinha a NF e evita FK nesta versão (031 já adotou codigo string).

**Alternatives considered**: Tabela de vínculo movimento↔conta — excesso. Sempre gravar na padrão e exigir transferência — contradiz clarify B (campo no pagamento).

## 3. Validação: corrente vs investimento

**Decision**: Em `caixas.py`, função `exigir_conta_corrente` (codigo de corrente **ativa**, sem sentinela investimento). `exigir_caixa` permanece para transferência (correntes ativas ∪ investimento).

**Rationale**: Spec FR-002 vs FR-007. Reusar um único validador misturaria as regras.

**Alternatives considered**: Filtrar só no frontend — inseguro. Recusar investimento também na transferência — fora da spec.

## 4. Primeiro recebimento de NF

**Decision**: Se o body trouxer `caixa` de corrente ativa no POST ou no primeiro `data_pagamento` do PUT, gravar esse codigo. Se omitido, cair na **padrão**. Recusar `investimento` e corrente inativa com 400.

**Rationale**: A 031 ignora o body no receber. Esta feature reabre a escolha sem forçar investimento na origem.

**Alternatives considered**: Continuar ignorar body e só editar depois — contradiz US1. Exigir caixa sempre mesmo pendente — spec permite vazio até receber.

## 5. Transferência sem Inverter

**Decision**: Manter os dois `<select>` já existentes em `FluxoCaixa.tsx`; remover `inverterPar` e o botão. Ao abrir: `origem = fluxoAtivo`; `destino = investimento` se origem ≠ investimento, senão `destino = codigoPadrao`.

**Rationale**: A UI atual já tem listas (parcialmente à frente da 028). O botão Inverter sobra após clarify B. Par inicial = FR-011.

**Alternatives considered**: Recriar textos somente leitura + Inverter — rejeitado na clarify. Destino vazio — rejeitado (opção A do par inicial).

## 6. Espelho de Contas a Pagar no fluxo

**Decision**: `fluxoDePagar(caixa, padrao)` análogo a `fluxoDeReceber`, **sem** tratar investimento como opção nova. Pago sem caixa → padrão (legado). Pago com codigo → só aquele fluxo.

**Rationale**: SC-002 exige que pagar na conta B não apareça na padrão.

**Alternatives considered**: Manter filtro `fluxo === padrao` — quebraria a feature.

## 7. Rótulo do campo

**Decision**: Rótulo **Conta corrente** nas origens (listagem, formulário, export). Transferência permanece **Origem** / **Destino**.

**Rationale**: Pedido do usuário e spec (qualquer um dos dois rótulos vale; este é o canônico).

**Alternatives considered**: Manter “Caixa” — menos alinhado ao vocabulário atual de N contas.
