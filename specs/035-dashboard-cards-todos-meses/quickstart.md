# Quickstart: Dashboard — Cards com Todos os Meses

**Feature**: `035-dashboard-cards-todos-meses`  
**Modelo**: [data-model.md](./data-model.md) · **Contratos**: [rest](./contracts/rest-resumo-financeiro.md), [ui](./contracts/ui-dashboard-cards-todos-meses.md)

## Pré-requisitos

- Docker: API **8001**, Postgres **5433**
- Frontend: `cd frontend && npm run dev` → `http://localhost:5193`
- Login: `admin` / `123456` e `visualizador` / `123456`
- NFs **pagas** (e, se possível, **pendentes**) em **pelo menos dois meses** do mesmo ano, com `data_emissao` nesses meses

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

## Smoke API

Com JWT (`access_token` do login). Ajuste `ano`/`mes`/`mes_ate` aos dados locais.

```bash
# Mês isolado
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8001/api/relatorios/resumo-financeiro?ano=2026&mes=3"

# Recorte Todos os meses / YTD (mes_ate = mês civil corrente no ano atual)
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8001/api/relatorios/resumo-financeiro?ano=2026&mes_ate=8"
```

Esperado: se houver NFs fora de março no intervalo janeiro–`mes_ate`, `faturamento_bruto_pago` (e demais totais) **diferentes**. Chamada só com `?ano=` (sem `mes` e sem `mes_ate`) continua o ano calendário inteiro.

## Validação UI (checklist)

1. Abrir Dashboard → padrão = mês/ano atuais; KPIs com números do **mês**.
2. Selecionar **Todos os meses** → os três KPIs mostram consolidado do recorte (não “Selecione um mês”); texto de apoio `Jan–{mês}/{ano}`.
3. Com **Todos os meses**: card de **meta mensal ausente**; **meta anual** em **largura total**.
4. Voltar a um mês concreto → KPIs só daquele mês; dois cards de meta lado a lado (desktop).
5. Com valores conhecidos em dois meses, conferir que o consolidado em **Todos os meses** é a soma desses meses no recorte (não um mês só).
6. Trocar o **ano** com **Todos os meses** → KPIs e recorte atualizam; meta mensal continua oculta.
7. Recorte sem NFs → KPIs em zero; página utilizável; filtros ok.
8. Como `visualizador`: mesmos consolidados; sem editar meta.

## Qualidade rápida

```bash
cd frontend && npm run lint && npm run type-check
```

## Critério de pronto

Checklist UI completo; smoke mês isolado ≠ YTD/`mes_ate`; `npm run lint` e `npm run type-check` passam.
