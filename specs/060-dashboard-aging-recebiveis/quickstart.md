# Quickstart: Aging de Recebíveis no Dashboard

**Feature**: `060-dashboard-aging-recebiveis`  
**Branch**: `060-dashboard-aging-recebiveis`

Validação manual end-to-end. Detalhes: [data-model.md](./data-model.md), [contracts/rest-aging-recebiveis.md](./contracts/rest-aging-recebiveis.md), [contracts/ui-dashboard-aging.md](./contracts/ui-dashboard-aging.md).

## Pré-requisitos

- API em `http://localhost:8001`, frontend em `http://localhost:5193`
- Login `admin` / `123456` (e opcionalmente `visualizador` / `123456`)
- Toggle Bruto/Líquido (057) disponível no Dashboard
- Fixture de Contas a Receber (`nfs`) **em aberto** (`data_emissao` preenchida, `data_pagamento` vazia), com vencimentos relativos a **hoje**:
  - 1× a vencer em ≤ 30 dias
  - 1× vencida há 1–60 dias
  - 1× vencida há 61–90 dias
  - 1× vencida há &gt; 90 dias
  - 1× sem `data_vencimento` **ou** a vencer &gt; 30 dias (residual)
  - 1× já recebida (não deve entrar)
  - 1× sem emissão (não deve entrar)

```bash
docker compose up -d
cd frontend && npm run dev
```

## 1. Smoke API

Com JWT:

```bash
# GET /api/relatorios/aging-recebiveis
```

Esperado: 200; `referencia` = hoje; `total_aberto` e quatro buckets dual-base; soma dos valores dos buckets ≤ total; residual implícito se fixture residual &gt; 0.

## 2. Card no Dashboard (SC-006, SC-008, SC-009)

1. Abrir Dashboard.
2. Localizar card **Aging de Recebíveis** com **Total em aberto** no cabeçalho.
3. Quatro buckets na ordem: A vencer · &lt;30d, **1–60 dias**, 60–90 dias, +90 dias — com cor e ação.
4. Sem COUNT; sem linha “Outros”; sem aviso de % incompleto.
5. Total ≈ soma do universo (tolerância R$ 0,01).

## 3. Classificação dos buckets (SC-001, SC-005)

1. Conferir cada NF da fixture no bucket esperado (ou só no total, se residual).
2. NF recebida / sem emissão **fora** do total.
3. Vencida há 1–29 dias → **1–60 dias** (não residual).

## 4. Independência do período (SC-002)

1. Anotar Total e buckets.
2. Trocar mês (e/ou modo só-ano).
3. Aging permanece igual (mesmo estoque global); Pipeline/abas de receita mudam com o período.

## 5. Toggle Bruto/Líquido (SC-003, SC-004)

1. Alternar Bruto ↔ Líquido.
2. Valores e % do Total e dos buckets mudam de base; composição dos buckets igual.
3. % ≈ `bucket ÷ total × 100` (± 0,1 pp).

## 6. Papéis (SC-007)

1. Comparar `admin` e `visualizador` no mesmo momento — mesmos totais.
2. Nenhum controle de edição no card.

## 7. Qualidade de código

```bash
cd frontend && npm run lint && npm run type-check
```

## Critérios de pronto

- [x] Smoke API OK _(código + classificação unitária OK; smoke HTTP pendente se API estiver off)_
- [x] Card com Total + 4 buckets (rótulo **1–60 dias**)
- [x] Independente do mês/ano
- [x] Toggle só muda base
- [x] Residual implícito; sem COUNT/aviso
- [x] Lint + type-check OK _(type-check: sem erros novos do Aging; lint: config ESLint ausente no frontend — pré-existente)_
