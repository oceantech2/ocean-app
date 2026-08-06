# Quickstart: Dashboard — Card NFs com Pagamento Pendente (R$)

**Feature**: `010-dashboard-nfs-pendente`  
**Modelo**: [data-model.md](./data-model.md) · **Contratos**: [rest-resumo-financeiro.md](./contracts/rest-resumo-financeiro.md), [ui-dashboard-nfs-pendente.md](./contracts/ui-dashboard-nfs-pendente.md)

## Pré-requisitos

- Docker: API `8001`, Postgres `5433`
- Frontend: `cd frontend && npm run dev` → `http://localhost:5193`
- Login: `admin` / `123456` (e opcionalmente `visualizador` / `123456`)
- Ideal: pelo menos uma NF com status **pendente** e `valor_bruto` conhecido no ano filtrado; e um cenário sem pendentes (outro ano ou após quitar)

## Setup

```bash
docker compose up -d
cd frontend && npm run dev
```

## Smoke API

Com JWT (`access_token` do login):

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8001/api/relatorios/resumo-financeiro?ano=2026"
```

Esperado: JSON inclui `faturamento_bruto_pendente` (number) e `quantidade_pendentes` (int); se houver N pendentes, o bruto deve ser a soma dos `valor_bruto` dessas NFs.

## Validação UI (checklist)

1. Abrir Dashboard → 3º KPI com título **NFs com pagamento pendente (R$)**.
2. Valor principal formatado em R$ (= bruto pendente da API).
3. Subtítulo no formato `{n} NFs pendentes`.
4. Não existe card separado só com a quantidade como destaque.
5. Faixa continua com 3 cards: Bruto / Líquido / Pendente (R$).
6. Ano sem NFs pendentes → `R$ 0,00` e `0 NFs pendentes`.
7. Como `visualizador`, o card aparece igual (sem controles de edição).
8. Conferir coerência com Contas a Receber / NFs (mesmo conjunto pendente / bruto).

## Qualidade rápida

```bash
cd frontend && npm run lint && npm run type-check
```

## Critério de pronto

Checklist UI passa e o smoke API retorna `faturamento_bruto_pendente` alinhado à quantidade pendente.
