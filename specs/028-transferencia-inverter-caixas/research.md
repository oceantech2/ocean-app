# Research: Fluxo de Caixa — Inverter origem e destino da transferência

**Feature**: `028-transferencia-inverter-caixas` | **Date**: 2026-08-13

## 1. Onde implementar (cliente vs API)

**Decision**: **Somente frontend** (`FluxoCaixa.tsx`). Sem endpoint, schema ou validação nova no servidor.

**Rationale**: A ambiguidade era só a escolha do sentido com duas contas. O POST `/api/fluxo-transferencias` já recebe `origem` e `destino`. Trocar o par no estado antes do submit basta. Constituição V: menor solução.

**Alternatives considered**: Endpoint “inverter” (overhead inútil). Componente compartilhado novo (desnecessário para um modal).

## 2. Como apresentar o par (clarify)

**Decision**: Origem e destino em **texto somente leitura** com os rótulos já usados na tela (`Conta corrente` / `Conta investimento`). Um botão com o texto **Inverter** entre os dois (ou imediatamente após o par). Sem `<select>`. Clique nos textos **não** altera o sentido.

**Rationale**: Clarify 2026-08-13 opção A. Remove a combinação origem = destino que o segundo `<select>` ainda permite hoje. Atende SC-005 (rótulo explícito).

**Alternatives considered**: Ícone só no meio (rejeitado no clarify). Listas sincronizadas (ainda duas escolhas). Toque no nome para inverter (rejeitado: FR-011).

## 3. Como inverter no estado

**Decision**: `setTransfForm` com swap: `origem` ← antigo `destino`, `destino` ← antigo `origem` (equivalente a `destino: outraConta(origem)` após o swap). **Não** resetar `valor`, `data_movimento`, `observacao`.

**Rationale**: FR-004 e FR-006. `saldoDaOrigem(transfForm.origem)` já usa a origem atual; o subtítulo do modal atualiza sozinho (FR-007).

**Alternatives considered**: Recalcular só destino a partir da origem (igual ao `onChange` do primeiro select atual) — equivalente se origem virar a antiga destino. Recarregar o formulário inicial (apagaria valor/data — viola FR-006).

## 4. Sentido inicial ao abrir

**Decision**: Manter `abrirTransferencia`: `origem = fluxoAtivo`, `destino = outraConta(fluxoAtivo)`. Fechar o modal descarta o estado; reabrir aplica de novo esse padrão (sem memória da última inversão).

**Rationale**: FR-008 e edge case da spec. Já implementado.

**Alternatives considered**: Sempre corrente → investimento (ignora o fluxo ativo). Persistir última inversão em memória da página (fora da spec).

## 5. Relação com validação e POST da 026

**Decision**: `salvarTransferencia` permanece: recusa origem = destino (defesa; a UI não oferece mais esse estado), valor ≤ 0, valor &gt; saldo visível da origem atual; depois POST com o par visível. Sem mudança de payload.

**Rationale**: FR-009. Teto após **Inverter** usa a nova origem automaticamente.

**Alternatives considered**: Validar teto no ato de inverter (a spec manda só na confirmação). Mudar a API para um único campo `sentido` (retrabalho na 026).
