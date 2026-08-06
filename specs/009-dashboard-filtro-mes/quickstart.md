# Quickstart: Dashboard — Filtro de Mês

**Feature**: `009-dashboard-filtro-mes`  
**Modelo**: [data-model.md](./data-model.md) · **Contratos**: [rest-custo-por-categoria.md](./contracts/rest-custo-por-categoria.md), [ui-dashboard-filtro-mes.md](./contracts/ui-dashboard-filtro-mes.md)

## Pré-requisitos

- Docker: API `8001`, Postgres `5433`
- Frontend: `cd frontend && npm run dev` → `http://localhost:5193`
- Login: `admin` / `123456` (e opcionalmente `visualizador` / `123456`)
- Dados de meta, saldo e contas a pagar em **pelo menos dois meses** do mesmo ano (para contrastar o filtro)

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

## Smoke API (mês isolado)

Com JWT (`access_token` do login):

```bash
# Março isolado
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8001/api/relatorios/custo-por-categoria?ano=2026&mes_de=3&mes_ate=3"

# YTD até março (legado / default mes_de=1)
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8001/api/relatorios/custo-por-categoria?ano=2026&mes_ate=3"
```

Esperado: totais **diferentes** se houver lançamentos em jan/fev; resposta inclui `mes_de` e `mes_ate`.

## Validação UI (checklist)

1. Abrir Dashboard → selects **Mês** e **Ano** no topo; padrão = mês/ano atuais.
2. Ano corrente → opções de mês só até o mês atual (sem futuros).
3. Trocar para ano passado → Jan–Dez disponíveis.
4. Com dezembro em ano passado, voltar ao ano corrente → mês ajusta para o máximo permitido (mês atual).
5. Trocar só o mês → meta mensal e donut de custo mudam; título da meta mostra o mês escolhido.
6. Saldos: com registro só em mês anterior ao selecionado, card mostra esse saldo e o rótulo do mês do registro.
7. Trocar só o mês → DRE e faturamento por mês **permanecem** a série do mesmo ano (sem colapsar para um ponto).
8. Meta anual continua ligada só ao ano.
9. Como `visualizador`, filtros de mês/ano funcionam; sem botões de editar meta.
10. Mês sem dados → estado vazio nos blocos afetados; página e filtros seguem usáveis.

## Qualidade rápida

```bash
cd frontend && npm run lint && npm run type-check
```

## Critério de pronto

Todos os itens do checklist UI passam e o smoke API confirma mês isolado ≠ YTD quando há dados intermediários.
