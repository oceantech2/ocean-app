# Contract: UI — Dashboard Seções e Cards

**Feature**: `040-dashboard-secoes-cards` | **Date**: 2026-08-27  
**Spec**: [spec.md](./spec.md) · **Data model**: [data-model.md](../data-model.md)

## Escopo

Contrato de apresentação da página Dashboard. Sem endpoints REST novos. Consumidores: `frontend/src/pages/Dashboard.tsx` (+ helpers opcionais).

## Ordem das seções

1. **Metas**
2. **Receita**
3. **Despesa** (esquerda) + **Resultado** (direita) — mesma linha em viewport ≥ ~768px
4. **Saldo**
5. **Centro de Despesa**
6. **Demonstrativo de Resultado**

Cada seção MUST ter título visível igual ao nome acima (exceto Despesa/Resultado, cada uma com o próprio título).

## Mapa de cards / gráficos

### Metas

| Ordem | Rótulo | Notas |
|-------|--------|-------|
| 1 | Meta de Receita Mensal | Oculta em “Todos os meses” se regra 035 vigente |
| 2 | Meta de Receita Anual | Edição admin inalterada |

### Receita

| Ordem | Rótulo | Conteúdo |
|-------|--------|----------|
| 1 | Receita Bruta | `resumo.faturamento_bruto_pago` |
| 2 | Impostos | R$ + alíquota (`impostos/de-contas`) |
| 3 | Receita Líquida | `resumo.faturamento_liquido_pago` |
| 4 | Receita Pendente | `resumo.faturamento_bruto_pendente` |

### Despesa

| Ordem | Rótulo | Conteúdo |
|-------|--------|----------|
| 1 | Despesas Fixas | Σ pagas natureza fixa (sem impostos) |
| 2 | Despesas Variáveis | Σ pagas natureza variável (sem impostos) |
| 3 | Despesas Pendentes | Σ não pagas (sem impostos) |

### Resultado

| Ordem | Rótulo | Conteúdo |
|-------|--------|----------|
| 1 | Lucro | R$ = RL − Fixas − Variáveis; % sobre Receita Bruta |

### Saldo

| Ordem | Rótulo | Conteúdo |
|-------|--------|----------|
| 1–3 | Nome da CC ou `Conta Corrente N` | `saldoVisivel` por conta (máx. 3) |
| 4 | Conta Investimento | Saldo investimento vigente |

MUST NOT exibir card único “Saldo Conta Corrente” consolidado.

### Centro de Despesa

| Ordem | Título | Fonte |
|-------|--------|-------|
| 1 | Despesas — {mês}/{ano} | donut mês; omitir se filtro sem mês concreto |
| 2 | Despesas — {ano} | donut ano / YTD |

Fatias: resposta `custo-por-categoria` **sem** `impostos`; percentuais recalculados.

### Demonstrativo de Resultado

| Ordem | Título | Fonte |
|-------|--------|-------|
| 1 | DRE — {ano} | `dreMensal` (comportamento de séries inalterado) |
| 2 | DRL | `faturamentoLiquidoMes` |

## Mapa natureza (normativo nesta feature)

```text
fixa:     adm_financeiro, recursos_humanos, beneficios, tecnologia
variavel: operacoes, marketing, comercial
excluida: impostos
default:  variavel (qualquer outra categoria ≠ impostos)
```

## Estados vazios

| Situação | UI |
|----------|-----|
| Sem valor / sem conta no slot | Card visível com "—" ou “Sem conta” / zero conforme padrão do painel |
| Receita Bruta = 0 | Lucro % e alíquota → "—" (não forçar 0% enganoso se base inexistente) |
| Sem fatias no donut | Mensagem vazia já usada no Centro de Despesas |

## Papéis

| Papel | Diferença |
|-------|-----------|
| `admin` | Pode editar metas (fluxo existente) |
| `visualizador` | Mesma estrutura; sem controles de edição de meta |

## Fora deste contrato

- Renomear outras páginas
- Migration / campo `natureza` em ContaPagar
- Alterar fórmulas do DRE backend
- Exibir mais de 3 contas correntes na linha Saldo
