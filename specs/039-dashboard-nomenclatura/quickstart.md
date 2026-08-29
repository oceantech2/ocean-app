# Quickstart: Dashboard — Nomenclatura e Remoção de Card

**Feature**: `039-dashboard-nomenclatura` | **Date**: 2026-08-27  
**Contrato**: [contracts/ui-dashboard-nomenclatura.md](./contracts/ui-dashboard-nomenclatura.md)

## Pré-requisitos

- Infra: `docker compose up -d` (API **8001**, Postgres **5433**, Redis **6380**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Login: `admin` / `123456` (e opcionalmente `visualizador` / `123456`)

## Validação visual (caminho feliz)

1. Abrir `http://localhost:5193` e autenticar.
2. Ir ao **Dashboard**.
3. Conferir títulos:
   - Meta de **Receita** Anual (e Mensal, se mês concreto selecionado)
   - KPIs: **Receita Bruta**, **Receita Líquida**, **Receita Pendente**
   - Donut(s): **Centro de Despesas** …
   - Gráfico de linha: **DRL** (largura total; sem pie ao lado)
4. Confirmar ausência de **Fechamentos por Tipo**.
5. Trocar mês/ano: rótulos novos permanecem; card removido continua ausente; valores dos demais blocos atualizam.

## Checagens negativas (regressão de texto)

Na tela do Dashboard, **não** devem aparecer (busca visual / Inspect):

- Meta de Faturamento / Meta de Faturamento Anual  
- Faturamento Bruto / Faturamento Líquido / Faturamento Líquido por Mês  
- NFs com pagamento pendente  
- Custo por categoria  
- Fechamentos por Tipo  

## Papéis

| Papel | Esperado |
|-------|----------|
| admin | Mesmos rótulos; editar meta ainda funciona com títulos novos |
| visualizador | Mesmos rótulos; sem edição; sem card de fechamentos |

## Smoke técnico (opcional)

```bash
cd frontend && npm run lint && npm run type-check
```

## Critério de pronto

- SC-001 / SC-002 da [spec.md](./spec.md) satisfeitos na revisão visual.
- Sem erros de TypeScript por imports Recharts órfãos após remoção do pie.
