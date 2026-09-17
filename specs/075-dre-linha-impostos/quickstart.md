# Quickstart: DRE — Linha Impostos (Contas Imposto / DAS)

**Feature**: `075-dre-linha-impostos`  
**Date**: 2026-09-16

Validação manual end-to-end após implementar [plan.md](./plan.md). Contratos: [rest-dre-mensal-impostos-das.md](./contracts/rest-dre-mensal-impostos-das.md), [ui-dre-linha-impostos.md](./contracts/ui-dre-linha-impostos.md). Modelo: [data-model.md](./data-model.md).

## Pré-requisitos

- Infra: `docker compose up -d` (API **8001**, Postgres **5433**, Redis **6380**)
- Frontend: `cd frontend && npm run dev` (porta **5193**)
- Login: `admin` / `123456` (ou `visualizador` para leitura)
- Contas a Pagar com Tipo **Imposto / DAS** (`074`) já disponíveis no ambiente

## Setup de dados de teste (sugestão)

No ano A, mês M (ex.: 2026-09):

1. Conta Tipo **Imposto / DAS**, valor **1000**, vencimento em M  
2. Conta Tipo **Imposto / DAS**, valor **500**, vencimento em M+1  
3. Conta Tipo **Variável**, valor **2000**, vencimento em M  
4. (Opcional) NFs pagas em M com `valor_imposto` ≠ 1000 — para ver divergência card × DRE

## Validação API

```bash
# Substituir TOKEN pelo Bearer do login
curl -s -H "Authorization: Bearer TOKEN" \
  "http://localhost:8001/api/relatorios/dre-mensal?ano=2026"
```

**Esperado** no mês M: `impostos ≈ 1000` (não 1500); despesa **não** inclui os 1000; `lucro = receita_bruta − despesa − impostos`.

Comparar com:

```bash
curl -s -H "Authorization: Bearer TOKEN" \
  "http://localhost:8001/api/impostos/de-contas?ano=2026"
```

**Esperado**: `valor_imposto` do mês M = `impostos` do DRE (± 0,01).

## Validação UI

1. Abrir Dashboard → Demonstrativo de Resultado (DRE) no ano A  
2. Com todos os aspectos ativos: ordem **Receita bruta → Impostos → Despesa → Lucro** (legenda e pilha)  
3. Tooltip do mês M: Impostos ≈ 1000  
4. Alternar legenda Impostos off/on — Despesa/Lucro reempilham; sem erro  
5. Card Impostos (seção Receita): valor continua baseado em NFs (pode ≠ 1000); **sem** novo hint  
6. Trocar ano e conferir recálculo  
7. Como `visualizador`: mesmos números, sem edição

## Regressão rápida

- [ ] Fixas / Variáveis / Pendentes / Resultado inalterados ao alternar toggle Bruto/Líquido  
- [ ] Página Impostos ainda lista Tipo Imposto / DAS  
- [ ] `npm run lint` e `npm run type-check` no `frontend/`

## Critérios de aceite (mapa)

| Spec | Como verificar |
|------|----------------|
| SC-001 | Ordem visual no DRE |
| SC-002 | Soma manual Contas Imposto / DAS × tooltip/API |
| SC-003 | Conta DAS não aparece em Despesa |
| SC-004 | Lucro = R − D − I |
| SC-006 | Card NFs + demais cards intactos |
