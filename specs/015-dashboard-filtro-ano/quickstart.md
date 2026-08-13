# Quickstart: Dashboard — Filtro de Ano Independente e Donut Anual

**Feature**: `015-dashboard-filtro-ano`  
**Modelo**: [data-model.md](./data-model.md) · **Contratos**: [rest](./contracts/rest-custo-por-categoria.md), [ui](./contracts/ui-dashboard-filtro-ano.md)

## Pré-requisitos

- Docker: API **8001**, Postgres **5433**
- Frontend: `cd frontend && npm run dev` → `http://localhost:5193`
- Login: `admin` / `123456` e `visualizador` / `123456`
- Contas a pagar em **pelo menos dois meses** do mesmo ano (para o donut mensal ≠ anual)

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

## Smoke API (dois recortes)

Com JWT (`access_token` do login). Ajuste `ano`/`mes` aos dados locais.

```bash
# Mês isolado (donut do mês)
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8001/api/relatorios/custo-por-categoria?ano=2026&mes_de=3&mes_ate=3"

# Ano / YTD (donut do ano — mes_ate = mês civil corrente no ano atual)
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8001/api/relatorios/custo-por-categoria?ano=2026&mes_de=1&mes_ate=8"
```

Esperado: se houver lançamentos fora de março, `total` (e fatias) **diferentes**. Sem mudança de contrato em relação à feature 009.

## Validação UI (checklist)

1. Abrir Dashboard → Mês e Ano no topo; padrão = mês/ano atuais; opção **Todos os meses** no select de mês.
2. Com mês selecionado (desktop): dois donuts lado a lado (mês à esquerda, ano à direita); títulos distinguem o período.
3. Trocar **só o mês** → donut do mês e meta mensal mudam; **total/fatias do donut do ano permanecem iguais**.
4. Trocar o **ano** → donut do ano muda; se o mês continuar válido, donut do mês passa a ser daquele mês no novo ano.
5. Selecionar **Todos os meses** → donut do mês some; donut do ano ocupa a **largura total**; meta mensal e KPIs de resumo visíveis com orientação para selecionar um mês; saldos = mais recente do ano; DRE/meta anual/faturamento seguem o ano.
6. Voltar a um mês concreto → dois donuts lado a lado de novo.
7. Ano corrente: meses futuros não aparecem; “Todos os meses” continua disponível após trocar o ano.
8. Rolar até o fim → **não** existe o bloco **Próximas Ações**.
9. Como `visualizador`: filtros e donuts iguais; sem editar meta.
10. Mês sem despesa e ano com despesa → donut do mês vazio, donut do ano com dados (página íntegra).

## Qualidade rápida

```bash
cd frontend && npm run lint && npm run type-check
```

## Critério de pronto

Checklist UI completo; smoke confirma mês isolado ≠ YTD; nenhum bloco “Próximas Ações”; `npm run lint` e `npm run type-check` passam.
