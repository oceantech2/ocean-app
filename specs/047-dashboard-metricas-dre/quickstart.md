# Quickstart: validar Dashboard — métricas Impostos, Lucro % e DRE

**Feature**: `047-dashboard-metricas-dre`  
**Pré-requisitos**: stack local (API **8001**, frontend **5193**), login `admin` / `123456` (ou visualizador).

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

Abrir `http://localhost:5193`, autenticar, ir ao **Dashboard**.

## Cenário A — Impostos por NFs pagas (não por pagamento)

1. Escolher um mês M em que existam NFs **pagas** com `valor_imposto` conhecido e Contas a Pagar de Impostos com vencimento em M **diferente** desse total (pagamento defasado).
2. **Esperado (card Impostos)**: R$ = soma do imposto das NFs pagas de M; alíquota ≈ esse valor ÷ Receita Bruta de M.
3. **Esperado**: valor **≠** total das Contas Impostos vencidas em M (quando diferirem).
4. NFs **pendentes** no mês com imposto: **não** entram no card.

## Cenário B — % Lucro sobre Receita Líquida

1. No mesmo recorte, anotar Receita Líquida, Despesas Fixas e Variáveis, Lucro R$.
2. **Esperado**: % = Lucro ÷ Receita Líquida; rótulo **"sobre Receita Líquida"**.
3. Conferir que o % **não** é Lucro ÷ Receita Bruta (quando bruto ≠ líquido).

## Cenário C — DRE 12 meses + Impostos alinhados

1. No ano corrente, rolar até o DRE.
2. **Esperado**: eixo com **12** meses (jan–dez), inclusive meses futuros/zerados.
3. Para o mês M do cenário A: segmento Impostos do DRE = card Impostos (mesmo valor).
4. Trocar o ano no filtro: eixo continua com 12 meses do novo ano.

## Cenário D — Regressão página Impostos

1. Abrir a página **Impostos** (se visível).
2. **Esperado**: comportamento anterior intacto (`de-contas` / cadastro mensal sem mudança pedida nesta feature).

## Smoke API (opcional)

```bash
# Com JWT válido
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8001/api/relatorios/dre-mensal?ano=2026"
```

Conferir `dados.length === 12` e que `impostos` de um mês bate com a soma manual de `valor_imposto` das NFs pagas daquele mês.

## Checks estáticos

```bash
cd frontend && npm run lint && npm run type-check
```
