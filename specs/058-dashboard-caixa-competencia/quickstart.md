# Quickstart: Abas Por Caixa e Por Competência

**Feature**: `058-dashboard-caixa-competencia`  
**Branch**: `058-dashboard-caixa-competencia`

Validação manual end-to-end. Detalhes: [data-model.md](./data-model.md), [contracts/rest-receita-caixa.md](./contracts/rest-receita-caixa.md), [contracts/ui-dashboard-receita-abas.md](./contracts/ui-dashboard-receita-abas.md).

## Pré-requisitos

- API em `http://localhost:8001`, frontend em `http://localhost:5193`
- Login `admin` / `123456` (e opcionalmente `visualizador` / `123456`)
- Features 056 (Pipeline) e 057 (toggle + Configuração do Período) disponíveis no Dashboard
- Fixture com NFs no período: recebidas (`data_pagamento`), emitidas pendentes, sem NF (fechamento no mês), e pelo menos 1 pendente com fechamento **fora** do mês

```bash
docker compose up -d
cd frontend && npm run dev
```

## 1. Smoke API Por Caixa

Com JWT:

```bash
# GET /api/relatorios/receita-caixa?ano=AAAA&mes=M
# GET /api/relatorios/pipeline-receita?ano=AAAA&mes=M
```

Esperado: 200; Caixa com `recebido` / `a_receber` / `a_faturar` dual-base + `impostos_recolhidos`; Pipeline dual-base.

## 2. Abas e remoção dos cards legados (SC-009, SC-010)

1. Abrir Dashboard no mês da fixture.
2. Seção Receita: abas **Por Caixa** (ativa) e **Por Competência**; **sem** cards Receita / Receita Pendente.
3. Pipeline visível.
4. Trocar para Por Competência e voltar — período e toggle intactos.
5. Recarregar a página — aba volta a **Por Caixa**.

## 3. Por Caixa — filtros e impostos (SC-001, SC-002, SC-004)

1. Conferir **Recebido** = soma das NFs com pagamento no mês (base do toggle).
2. **Impostos Recolhidos** = soma dos impostos das mesmas NFs; alternar Bruto/Líquido — impostos **iguais**.
3. A Receber / A Faturar só com fechamento no mês; pendente de outro mês **não** aparece.
4. Alternar toggle — Recebido e pendentes mudam de base; impostos não.

## 4. Por Competência ↔ Pipeline (SC-003, SC-006)

1. Na aba Por Competência, Total Fechado = Fechado do Pipeline (mesma base).
2. Já Recebido + A Receber + A Faturar = Total Fechado.
3. Estágios alinhados aos blocos do Pipeline.

## 5. Barra de meta segue a aba (SC-005)

1. Com Configuração do Período salva, aba Caixa: % ≈ Recebido ÷ meta_exibida.
2. Trocar para Competência: mesma barra, % ≈ Total Fechado ÷ meta_exibida; rótulo “fechado”.
3. Sem meta mensal: métricas ok; barra sem % inventado.

## 6. Modo só-ano (SC-005b, SC-011)

1. Filtro ano sem mês: abas agregam o ano; alinhadas ao Pipeline anual.
2. Barra usa **meta anual** ÷ total da aba ativa no ano (não soma metas mensais).

## 7. Papéis (SC-008)

1. `visualizador`: mesmas abas/totais; sem edição nas abas.
2. `admin`: idêntica leitura das abas.

## 8. Lint / types

```bash
cd frontend && npm run lint && npm run type-check
```

## Critério de aceite rápido

| Check | OK |
|-------|----|
| Cards Receita/Pendente removidos; abas + Pipeline presentes | |
| Padrão Por Caixa; toggle não mexe impostos | |
| Pendentes Caixa só do período; Competência = Pipeline | |
| Barra: Caixa→Recebido; Competência→Fechado; ano→meta anual | |
| Lint + type-check verdes | |
