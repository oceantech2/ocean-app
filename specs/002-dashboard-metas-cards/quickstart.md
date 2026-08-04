# Quickstart: validar cards de metas na Dashboard

**Feature**: `002-dashboard-metas-cards` | **Date**: 2026-07-26  
Modelo: [data-model.md](./data-model.md) · Contratos: [contracts/dashboard-metas-ui.md](./contracts/dashboard-metas-ui.md)

## Pré-requisitos

- Stack do projeto no ar (ver baseline [../001-ocean-app-baseline/quickstart.md](../001-ocean-app-baseline/quickstart.md))
- Portas: API **8001**, frontend **5193**
- Contas: `admin` / `123456` e `visualizador` / `123456`

```bash
docker compose up -d
cd frontend && npm run dev
```

Abrir: http://localhost:5193

## Cenários de validação

### V1 — Ordem e layout desktop (≥768px)

1. Login como `admin`.
2. Abrir Dashboard; garantir janela larga (≥768px de largura).
3. **Esperado**: na faixa superior de metas, card **Anual** à esquerda e **Faturamento do mês** à direita; mesma altura; ~50/50; títulos no padrão oficial.
4. **Esperado**: KPIs (bruto/líquido/pendentes) continuam abaixo, inalterados em conteúdo.

### V2 — Layout mobile (&lt;768px)

1. DevTools → viewport &lt;768px (ou janela estreita).
2. **Esperado**: cards empilhados — Anual em cima, Mensal embaixo; sem scroll horizontal; valores legíveis.

### V3 — Edição inline (admin)

1. Em cada card, Definir/Editar meta → informar valor → Salvar.
2. **Esperado**: formulário inline no card; toast de sucesso; progresso atualizado; o outro card permanece utilizável.
3. Abrir edição nos dois ao mesmo tempo (opcional): ambos independentes; faixa com altura alinhada.

### V4 — Somente leitura (visualizador)

1. Login como `visualizador`.
2. **Esperado**: vê meta/realizado/progresso; **sem** botões Definir/Editar.

### V5 — Sem meta

1. Como admin, garantir um período sem meta (ou valor que a UI trate como ausência).
2. **Esperado**: card permanece; indica ausência; sem barra de progresso falsa; admin pode Definir.

### V6 — Regressão de números (SC-005)

1. Anotar valores de meta/realizado/% **antes** do deploy da mudança (ou comparar com API).
2. Após a mudança de layout, mesmos valores para o mesmo ano/mês.
3. Opcional: `GET http://localhost:8001/api/metas/progresso?mes=0&ano=YYYY` e `mes=M` com o token JWT — bater com a UI (salvo realizado anual se a UI usar soma da série client-side, como hoje).

## Checagens rápidas de código

```bash
cd frontend && npm run type-check && npm run lint
```

Não há migration nem restart de backend exigido para esta feature.
