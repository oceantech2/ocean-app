# Contrato UI: Dois fluxos no Fluxo de Caixa

**Feature**: `025-fluxo-caixa-contas` | **Date**: 2026-08-13  
**Spec**: [spec.md](../spec.md) · **API**: [rest-fluxo-movimentos-conta.md](./rest-fluxo-movimentos-conta.md)  
**Base 024**: coluna Origem, espelho CR/CP, papéis — permanecem.

## Superfície

| Item | Valor |
|------|-------|
| Página | `frontend/src/pages/FluxoCaixa.tsx` |
| Rota | `/fluxo-caixa` |
| Seletor | **Conta corrente** \| **Conta investimento** (visível; corrente = padrão) |

Título/subtítulo devem refletir o fluxo ativo (não “Saldo corrente e conta investimento” os dois ao mesmo tempo).

## Recorte exclusivo

Com o fluxo ativo, a tela mostra **somente**:

- 1 card de saldo (último daquela conta) + totais de entradas/saídas do período **daquele** fluxo
- gráfico com **uma** série
- tabela de registros de saldo daquela conta
- tabela de movimentos daquele fluxo
- CSV dos movimentos visíveis

Não exibir o segundo card, a segunda série nem linhas da outra conta.

## Inclusão (admin)

| Ação | Conta gravada |
|------|----------------|
| + Incluir receita / − Incluir despesa | fluxo ativo; **sem** select de conta |
| + Registrar saldo | fluxo ativo; **sem** select de conta |

Visualizador: troca o seletor e lê; sem escrita.

## Filtro de movimentos (cliente)

Depois da elegibilidade 024:

- CR: incluir se o fluxo da `caixa` (vazio ⇒ corrente) **igual** ao ativo
- CP: incluir **somente** se ativo = corrente
- Manual: `conta` igual ao ativo (a API já filtra; o mapa não reintroduz o outro)

## Vazio

Sem movimentos no fluxo ativo: não puxar a outra conta; totais zerados. Sem saldo na conta ativa: card/tabela vazios daquela conta.

## Importar CSV de saldos

Modal inalterado (colunas `conta`, `mes`, `ano`, `saldo`). Após importar, a tabela continua só a conta ativa.

## Fora deste contrato

- Abas duplicadas de página / rota nova
- Coluna Caixa na lista de movimentos
- Transferência especial
- Lembrar o último fluxo após F5 (volta para corrente)
