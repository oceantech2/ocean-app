# Contrato UI: Múltiplas contas correntes

**Feature**: `031-multiplas-contas-correntes`  
**Páginas**: `FluxoCaixa.tsx`, `NFs.tsx` (Contas a Receber), `Dashboard.tsx`  
**REST**: [rest-contas-correntes.md](./rest-contas-correntes.md)

## Fluxo de Caixa (`/fluxo-caixa`)

| Item | Comportamento |
|------|----------------|
| Seletor | Uma opção por corrente **ativa** (rótulo = `nome`) + **Conta investimento** |
| Abertura | Codigo da corrente `padrao` (não hardcoded `corrente` se a padrão tiver sido trocada) |
| Recorte | Card, gráfico, lista, totais, exportação e tabela de saldos **só** do codigo ativo |
| Gerenciar contas | Ação visível ao admin; visualizador vê lista somente leitura ou a ação desabilitada para escrita |
| Transferência | Origem/destino = qualquer par distinto entre correntes ativas e investimento; rótulos = nomes |

Modal Gerenciar contas:

- Lista nome, banco, agência/número se houver, indicador de padrão, ativo
- Criar/editar: nome + banco obrigatórios; agência e número opcionais
- Tornar padrão; desativar com `confirm`; toast de sucesso/erro
- Sem segundo item de menu

CP no mapa de movimentos: incluir **somente** se o fluxo ativo é a corrente padrão.

CR/NF: incluir se `fluxoDeReceber(caixa)` igual ao ativo; `null` ou codigo desconhecido ⇒ padrão.

## Contas a Receber / NFs

- Marcar recebido: **sem** seletor de caixa; API grava a padrão
- NF já recebida (admin): campo Caixa para reclassificar (correntes ativas + investimento)
- Visualizador: consulta o caixa; não edita
- Contas a Pagar: sem campo de caixa

## Dashboard

- **Um** card Conta corrente = soma dos saldos visíveis das correntes ativas (mesmo recorte mês/ano já usado)
- **Um** card Conta investimento (inalterado na quantidade)
- Sem um card por corrente; detalhe só no Fluxo de Caixa

## Fora

- Menu “contas bancárias”
- Exigir agência/número
- Card por conta na dashboard
