# Quickstart: validar donut de Custo na Dashboard

**Feature**: `004-dashboard-custo-donut` | **Date**: 2026-07-26  
Modelo: [data-model.md](./data-model.md) · Contratos: [contracts/rest-custo-por-categoria.md](./contracts/rest-custo-por-categoria.md), [contracts/ui-dashboard-custo-donut.md](./contracts/ui-dashboard-custo-donut.md)

## Pré-requisitos

- Stack no ar (baseline / Docker)
- Portas: API **8001**, frontend **5193**
- Contas: `admin` / `123456`
- Ideal: contas a pagar em ≥2 centros de custo no ano (incl. pelo menos um imposto, para ver fatia de impostos)

```bash
docker compose up -d
cd frontend && npm run dev
```

Abrir: http://localhost:5193

## Cenários de validação

### V1 — Posição e layout

1. Login → Dashboard no **ano corrente**.
2. **Esperado**: bloco donut **logo abaixo** do DRE; no desktop (~768px+) ocupa **metade** da largura (slot vazio ao lado); no mobile, largura total; título de custo/categoria; miolo com total R$.

### V2 — Composição e ordem

1. Com despesas em várias categorias, inspecionar fatias e legenda.
2. **Esperado**: fatias proporcionais; ordem maior → menor; labels iguais a Contas a Pagar; impostos aparecem se houver valor; % somam ~100%.

### V3 — Tooltip

1. Hover/toque em uma fatia.
2. **Esperado**: nome, valor em R$ e percentual coerentes com o total do centro.

### V4 — Ano anterior vs corrente

1. Ano corrente → só meses até o mês atual entram no total.
2. Ano anterior → jan–dez.
3. **Esperado**: totais mudam de forma coerente ao trocar o ano.

### V5 — Coerência com Contas a Pagar (amostra)

1. Escolher o ano/mês_ate em uso.
2. Somar manualmente (ou filtrar em Contas) por centro com vencimento no período; comparar com fatias e `total`.
3. Opcional API:

```bash
# Com token JWT — exemplo YTD julho/2026
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8001/api/relatorios/custo-por-categoria?ano=2026&mes_ate=7"
```

### V6 — Vazio / erro isolado

1. Ano sem contas a pagar ou ano futuro.
2. **Esperado**: mensagem no bloco donut; sem total enganoso; DRE e saldos utilizáveis.
3. (Opcional) Forçar falha do endpoint → erro só no bloco donut.

## Checagens rápidas

```bash
cd frontend && npm run type-check && npm run lint
```
