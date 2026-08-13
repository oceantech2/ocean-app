# Contrato UI: Transferência no Fluxo de Caixa

**Feature**: `026-fluxo-caixa-transferencia` | **Date**: 2026-08-13  
**Spec**: [spec.md](../spec.md) · **API**: [rest-fluxo-transferencias.md](./rest-fluxo-transferencias.md)  
**Base**: visões 025 + coluna Origem 024.

## Superfície

| Item | Valor |
|------|-------|
| Página | `frontend/src/pages/FluxoCaixa.tsx` |
| Rota | `/fluxo-caixa` |
| Admin | botão **Transferência**; desfazer par na lista |
| Visualizador | sem Transferência, sem desfazer, sem gravar saldo |

## Ações removidas (todos os papéis)

Não exibir:

- Incluir receita
- Incluir despesa
- Registrar saldo
- Importar CSV (saldos)
- Editar / Deletar na tabela de saldos

Não abrir os modais correspondentes. Tabela de saldos e gráfico de snapshots: **consulta**.

## Ação nova

Botão **Transferência** (admin). Modal com origem, destino, data, valor, observação opcional. Origem inicia no fluxo ativo; destino na outra conta; ambos editáveis. Submit: se valor &gt; saldo visível da origem (ou ≤ 0, ou origem=destino), toast de erro e **não** chama API. Sucesso: toast, fecha modal, recarrega. Loading no botão salvar.

## Card de saldo

Rótulo permanece associado ao fluxo ativo. Valor = **saldo visível calculado** (não o último número cru da tabela, salvo quando a fórmula coincide). Sem histórico: mostrar `0` (ou `fmt(0)`), não necessariamente “—” se a fórmula for zero. Subtítulo pode indicar que é calculado (opcional; não obrigatório).

## Tabela Movimentos

Colunas 024/025, nesta ordem. Origem passa a admitir **Transferência**.

| Origem persistida | Origem na tela | Ação admin |
|-------------------|----------------|------------|
| CR / CP | iguais 024 | nenhuma |
| `par_id` nulo | Manual | Remover (id) + confirm |
| `par_id` preenchido | Transferência | **Desfazer** (par) + confirm; MUST NOT remover um lado |

Descrição da transferência já vem da API (de/para). Totais = movimentos visíveis do fluxo ativo no período.

## Exportar CSV

Inclui linhas Transferência visíveis: Data, Tipo, Origem **Transferência**, Descrição (de/para), Valor.

## Vazio e erro

| Situação | UX |
|----------|-----|
| POST 4xx | toast com detalhe; saldos/lista inalterados |
| Falha de rede | toast; não fingir que gravou |
| Visualizador | mesma lista; sem botões de escrita |

## Fora deste contrato

- Recriar receita/despesa/saldo/CSV nesta tela
- Coluna extra “caixa contraposto” além da descrição
- Memória do último fluxo após F5
