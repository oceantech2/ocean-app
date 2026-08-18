# Research: Dashboard — Cards com Todos os Meses

**Feature**: `035-dashboard-cards-todos-meses` | **Date**: 2026-08-18  
**Spec**: [spec.md](./spec.md)

## 1. Fonte dos KPIs na visão anual

**Decision**: Chamar `GET /api/relatorios/resumo-financeiro` também quando `mes === null`, com `ano` e **sem** `mes`, e com `mes_ate = mesAteAno(ano)` (helper já usado no donut anual). Ano futuro (`mesAteAno === null`): não chamar; manter zeros no estado.

**Rationale**: O endpoint já agrega bruto pago, líquido pago, bruto pendente e quantidades por `data_emissao`. Hoje a Dashboard só chama com mês concreto e zera o estado em **Todos os meses**. Reusar o mesmo DTO evita somar no client a partir da lista de NFs (já limitada a 1000 e só pagas).

**Alternatives considered**:
- Somar no client a partir de `nfsService.listar` — paginação e filtro `paga` incompletos para pendentes.
- Doze requests mês a mês — pior latência, viola simplicidade.
- Só `ano` sem `mes_ate` — incluiria meses futuros do ano corrente se existisse NF com emissão futura (FR-003).

## 2. Recorte YTD no backend (`mes_ate`)

**Decision**: Estender `resumo_financeiro` com query opcional `mes_ate` (1–12). Regras:

| `mes` | `mes_ate` | Filtro de mês |
|-------|-----------|----------------|
| informado (1–12) | ignorado | mês **exato** de `data_emissao` (comportamento atual) |
| omitido | informado | `1 ≤ mês(data_emissao) ≤ mes_ate` |
| omitido | omitido | sem filtro de mês (compatível com clientes antigos, ex. feature 010) |

**Rationale**: Aditivo, alinha o recorte ao donut anual (`mes_de=1` + `mes_ate` YTD/12) sem endpoint novo.

**Alternatives considered**:
- Par `mes_de`/`mes_ate` como em custo — desnecessário (sempre janeiro).
- Inferir YTD só porque `ano === ano civil` — mudaria o significado de `GET ?ano=` sem `mes` para outros consumidores.

## 3. Meta mensal oculta + meta anual em largura total

**Decision**: Se `mes === null`, **não renderizar** o card de meta mensal (nem estado vazio). A fileira de metas deixa de ser `md:grid-cols-2` e o card anual ocupa `w-full`. Se `mes` concreto, restaurar o grid 2 colunas (anual | mensal). Continuar **não** chamando `metasService.progresso(mes)` sem mês (`mes=0` é meta anual).

**Rationale**: Clarify Q1 e Q2. Mesmo padrão visual do donut do ano sem mês.

**Alternatives considered**:
- Repetir meta anual no card mensal — rejeitado no clarify.
- Deixar metade vazia — rejeitado no clarify.
- Somar metas mensais — rejeitado (complexidade e cadastro paralelo).

## 4. Rótulos dos cards de indicador

**Decision**: Com mês concreto, manter títulos atuais (sem sufixo de mês, como hoje). Com **Todos os meses**, acrescentar texto de apoio sob o título, em português: recorte `Jan–{mêsAte}/{ano}` (ex.: `Jan–Ago/2026` no ano corrente em agosto; `Jan–Dez/2025` em ano anterior). Valores `0` quando não houver dados — **não** voltar a `MSG_SELECIONE_MES`.

**Rationale**: FR-007 sem poluir o título principal; `MESES_NOME` já existe.

**Alternatives considered**:
- Só “Todos os meses” no título — menos preciso no YTD.
- Mudar o título principal — quebra o hábito visual dos três cards.

## 5. O que não muda

**Decision**: Donut do mês continua ausente em **Todos os meses**; DRE, faturamento por mês, fechamentos por tipo, saldos e meta anual (cálculo) inalterados. Outras páginas fora de escopo.

**Rationale**: FR-010 e constitution V.

**Alternatives considered**: Reabrir donut mensal com consolidado — fora da spec.
