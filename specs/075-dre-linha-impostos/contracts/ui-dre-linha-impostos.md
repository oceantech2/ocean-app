# Contract: UI — DRE linha Impostos entre Receita e Despesa

**Feature**: `075-dre-linha-impostos`  
**Página**: `frontend/src/pages/Dashboard.tsx` (bloco Demonstrativo / gráfico DRE)  
**Papéis**: `admin` e `visualizador` (somente leitura)

## Ordem canônica dos aspectos

| Ordem | Aspecto | Cor vigente | stackId |
|-------|---------|-------------|---------|
| 1 | Receita bruta | azul | `receita` (barra isolada) |
| 2 | Impostos | cinza | `composicao` (**antes** de Despesa) |
| 3 | Despesa | vermelho | `composicao` |
| 4 | Lucro | verde | `composicao` (último; omitido se lucro &lt; 0 na pilha) |

- Legenda interativa: ligar/desligar cada aspecto permanece (comportamento atual).
- **MUST NOT** adicionar subtítulo/hint sobre base Contas vs NFs.

## Dados exibidos

| Campo | Origem |
|-------|--------|
| Valores mensais | `relatoriosService.dreMensal(ano)` — semântica 075 |
| % nos LabelList | Continua `valor ÷ receita_bruta` quando bruta &gt; 0 (padrão atual) |
| Lucro negativo | Tooltip/rótulo; sem segmento empilhado negativo (padrão atual) |

## Card Impostos (seção Receita) — regressão

| Elemento | Comportamento |
|----------|----------------|
| Valor / alíquota | **Inalterado** — NFs pagas (`impostosDeNfsPagas` ou equivalente) |
| Hint de divergência | **Ausente** |

## Fora de escopo na UI

- Página Impostos, DRL, Metas, Saldo, Centro de Despesa, Fixas/Variáveis/Pendentes, Resultado
- Novos filtros ou persistência de legendas
- Aviso de bases distintas card × DRE
