# Contract: UI — Dashboard Filtro de Ano e Donuts

**Feature**: `015-dashboard-filtro-ano`  
**Página**: `frontend/src/pages/Dashboard.tsx`  
**Papéis**: `admin` e `visualizador` alteram mês/ano; edição de metas só `admin`.

## Controles de período (header)

| Controle | Comportamento |
|----------|----------------|
| Select **Mês** | Primeira opção: **Todos os meses** (`value=""` → `mes = null`). Demais = `mesesPermitidos(ano)` com `MESES_NOME`. |
| Select **Ano** | Igual ao atual. Se `mes === null`, permanece `null`. Se mês concreto inválido no novo ano, clamp para `maxMesPermitido`. |
| Comparar / ano comparar | Independente do mês; inalterado. |

**Padrão na abertura**: `mes = mêsCivilCorrente`, `ano = anoCivilCorrente` (não abrir em “Todos os meses”).

## Mapeamento bloco × período

| Bloco | `mes` concreto | `mes === null` |
|-------|----------------|----------------|
| Meta anual | Ano | Ano |
| Meta mensal | Mês+ano; título `Meta de Faturamento — {mês}/{ano}` | Card visível; orientação “Selecione um mês…”; sem editar |
| KPIs resumo (bruto / líquido / NFs) | `resumoFinanceiro(ano, mes)` | Cards visíveis; mesmo estado vazio/orientação |
| Saldos | Mais recente `≤ mes` no ano | Mais recente do ano |
| DRE / faturamento por mês | Só ano | Só ano |
| Donut do mês | Visível; `mes_de=mes_ate=mes`; título com mês/ano | **Não renderizado** |
| Donut do ano | Visível; YTD/ano completo; título com ano | Visível em **largura total** |
| Próximas Ações | **Ausente** | **Ausente** |

## Layout dos donuts

| Condição | Layout |
|----------|--------|
| Viewport ≥ ~768px e mês concreto | Grid 2 colunas: mês \| ano (abaixo do DRE) |
| Viewport &lt; ~768px e mês concreto | Empilhados, mês acima, ano abaixo, largura total cada |
| Sem mês (qualquer viewport) | Só o donut do ano, largura total da área de conteúdo |

Estados por donut (independentes): loading da página; sucesso com total &gt; 0 (fatias + miolo BRL + legenda %); total 0 / sem dados (mensagem do **período daquele** donut); erro só naquele bloco.

Padrão visual: mesmo `Pie`/`innerRadius`, ordem por valor desc, tooltip nome+R$+%, cores por categoria já usadas.

## Acessibilidade mínima

- Labels visíveis “Mês:” / “Ano:”.
- Opção “Todos os meses” e meses em português.
- Títulos dos donuts distinguem **mês** vs **ano**.
- Sem mês, não deixar coluna vazia focável ao lado do donut.

## Fora de escopo UI

- Persistência na URL ou `localStorage`.
- Filtro de mês/ano em outras páginas.
- Série comparativa nos donuts.
- Substituto para Próximas Ações.
