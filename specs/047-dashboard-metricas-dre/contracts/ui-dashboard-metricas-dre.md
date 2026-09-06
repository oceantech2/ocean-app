# Contract: UI — Dashboard métricas Impostos, Lucro % e DRE

**Feature**: `047-dashboard-metricas-dre`  
**Página**: `frontend/src/pages/Dashboard.tsx`  
**Papéis**: `admin` e `visualizador` (somente leitura dos indicadores)

## Card Impostos (seção Receita)

| Elemento | Comportamento |
|----------|----------------|
| Valor R$ | Σ `valor_imposto` das NFs **pagas** do recorte (mês ou YTD/jan–mesAte) |
| Alíquota | `valor ÷ Receita Bruta do recorte × 100` se Receita Bruta > 0; senão "—" |
| Fonte | Agregação local das NFs já carregadas — **não** `impostos/de-contas` |
| Exclusões | NFs pendentes; Contas a Pagar de Impostos |

## Card Lucro (seção Resultado)

| Elemento | Comportamento |
|----------|----------------|
| Valor R$ | Receita Líquida − Fixas − Variáveis *(inalterado)* |
| Percentual | `valor ÷ Receita Líquida × 100` se Receita Líquida > 0; senão "—" |
| Rótulo de apoio | Texto **"sobre Receita Líquida"** (não mais "sobre Receita Bruta") |

## Gráfico DRE

| Elemento | Comportamento |
|----------|----------------|
| Eixo X | **12 meses** do ano selecionado por padrão (jan–dez), inclusive zeros / meses futuros no ano corrente |
| Impostos | Valor mensal da API (NFs pagas) — igual ao card no mesmo mês |
| Despesa / Receita | Conforme API; Despesa inalterada |
| Loading / erro / vazio | Padrão atual do bloco DRE (não derrubar a página) |

## Helpers

| Função | Contrato |
|--------|----------|
| `lucroCard(...)` | `pct` sobre Receita Líquida |
| `impostosDeNfsPagas(nfs, mes, ano, mesAte?)` (ou equivalente) | Retorna `{ valor, aliquota }` conforme data-model; substitui uso de `impostosDoRecorte` no Dashboard |

## Fora de escopo na UI

- Página Impostos / gráficos de comparação de impostos
- DRL, Metas, Saldo, Centro de Despesa (exceto se consumirem DRE indiretamente)
- Novos filtros
