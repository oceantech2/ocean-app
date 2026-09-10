# Quickstart: Despesas & Resultado no Dashboard

**Feature**: `059-dashboard-despesas-resultado`  
**Branch**: `059-dashboard-despesas-resultado`

Validação manual end-to-end. Detalhes: [data-model.md](./data-model.md), [contracts/calc-despesas-resultado.md](./contracts/calc-despesas-resultado.md), [contracts/ui-dashboard-despesas-resultado.md](./contracts/ui-dashboard-despesas-resultado.md).

## Pré-requisitos

- API `http://localhost:8001`, frontend `http://localhost:5193`
- Login `admin` / `123456` (e opcionalmente `visualizador`)
- Features 057 (toggle) e 058 (Por Caixa + Pipeline dual) disponíveis
- Fixture Contas a Pagar no mês:
  - 1 fixa com `data_pagamento` no mês
  - 1 variável com `data_pagamento` no mês
  - 1 pendente (`data_vencimento` no mês, sem `data_pagamento`) — idealmente com `pago=true` inconsistente
  - 1 paga com pagamento **fora** do mês (vencimento no mês) — não deve entrar em Fixas/Variáveis
  - 1 categoria imposto (paga ou pendente) — não deve entrar em nenhum dos três
  - 1 com tipo Fixo mas categoria que o legado tratava como variável
- Fixture receita: NFs com fechamento e com recebimento no mês (Pipeline / Por Caixa conhecidos)

```bash
docker compose up -d
cd frontend && npm run dev
```

## 1. Cards de Despesa (SC-001, SC-001a, SC-001b)

1. Abrir Dashboard no mês da fixture.
2. Conferir **Fixas** / **Variáveis** / **Pendentes** contra a planilha da fixture (tolerância R$ 0,01).
3. Tipo prevalece sobre categoria legada.
4. Imposto fora dos três totais.
5. Inconsistência `pago=true` sem pagamento + vencimento no mês → só **Pendentes**.

## 2. Toggle não mexe em Despesas (SC-002)

1. Anotar Fixas, Variáveis, Pendentes.
2. Alternar Bruto ↔ Líquido várias vezes.
3. Esperado: três totais **idênticos**.

## 3. Resultado Competência e Caixa (SC-003, SC-004, SC-007)

1. Confirmar dois cards lado a lado; **sem** card Lucro canônico.
2. Cada card: só valor + % (sem composição).
3. Competência ≈ Total Fechado (aba) − (Fixas + Variáveis).
4. Caixa ≈ Recebido (aba) − (Fixas + Variáveis).
5. % ≈ resultado ÷ receita × 100 (±0,1 pp) quando receita > 0.
6. Alternar toggle: Resultados mudam; despesas da conta permanecem.

## 4. Coerência com abas (SC-005)

1. Comparar receita implícita do Resultado Competência com Total Fechado da aba (± R$ 0,01).
2. Comparar receita implícita do Resultado Caixa com Recebido da aba (± R$ 0,01).
3. Pendentes > 0 não alteram `despesas_totais` do Resultado.

## 5. Período e só-ano (SC-006)

1. Mudar de mês — totais de Despesas & Resultado acompanham em poucos segundos.
2. Modo só-ano — agrega o ano; mesmas regras.

## 6. Papéis (SC-008)

1. Repetir totais com `visualizador` — iguais ao `admin`.

## 7. Divergência esperada (FR-019)

1. Centro de Despesa / Demonstrativo **podem** divergir dos cards canônicos — não falhar o aceite por isso nesta feature.

## Lint

```bash
cd frontend && npm run lint && npm run type-check
```
