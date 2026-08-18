# Contract: UI — Dashboard Cards com Todos os Meses

**Feature**: `035-dashboard-cards-todos-meses`  
**Página**: `frontend/src/pages/Dashboard.tsx`  
**Papéis**: `admin` e `visualizador` veem os mesmos consolidados; edição de meta só `admin`; meta mensal só com mês concreto.

## Controles de período

Inalterados (015): select **Mês** com **Todos os meses** (`mes = null`); **Ano**; Comparar independente.

## Cards de indicador (KPI)

Ordem: Bruto | Líquido | NFs com pagamento pendente (R$).

| Estado | Dados | Texto de período | Mensagem “Selecione um mês” |
|--------|-------|------------------|-----------------------------|
| `mes` concreto | `resumoFinanceiro(ano, mes)` | sem sufixo extra (como hoje) | ausente |
| `mes === null` e ano ≤ corrente | `resumoFinanceiro(ano, undefined, mesAteAno)` | apoio `Jan–{mêsAte}/{ano}` | **ausente** |
| `mes === null` e ano futuro | zeros | mesmo apoio de recorte vazio ou zeros | **ausente** |

Subtítulos atuais permanecem (`Valor total`; `{n} NFs pagas`; `{n} NFs pendentes`). Valores `0` são válidos (não substituir por orientação de mês).

## Metas (topo)

| Condição | Layout |
|----------|--------|
| Viewport ≥ ~768px e mês concreto | Grid 2 colunas: meta anual \| meta mensal |
| Viewport &lt; ~768px e mês concreto | Empilhadas, anual acima, mensal abaixo |
| Sem mês (qualquer viewport) | **Só** meta anual, largura total; meta mensal **não** no DOM |

Trocar de **Todos os meses** para um mês concreto restaura o par lado a lado. Admin edita meta anual nessa visão; não há botão de meta mensal.

## Acessibilidade mínima

- Labels “Mês:” / “Ano:” inalterados.
- Texto de apoio dos KPIs em português, distinguindo recorte anual de mês isolado.
- Sem coluna vazia focável ao lado da meta anual.

## Fora de escopo UI

- Donuts, DRE, faturamento por mês, saldos, fechamentos por tipo.
- Persistência na URL ou `localStorage`.
- Outras páginas.
