# Quickstart: Dashboard — Seções, Títulos e Reordenação de Cards

**Feature**: `040-dashboard-secoes-cards` | **Date**: 2026-08-27  
**Spec**: [spec.md](./spec.md) · **UI**: [contracts/ui-dashboard-secoes-cards.md](./contracts/ui-dashboard-secoes-cards.md)

## Pré-requisitos

- API em `http://localhost:8001`, frontend em `http://localhost:5193`
- Login `admin` / `123456` (e opcionalmente `visualizador` / `123456`)
- Dados de exemplo: NFs, contas a pagar (fixas/variáveis/impostos, pagas e não pagas), contas correntes ativas, saldo investimento

```bash
docker compose up -d
cd frontend && npm run dev
```

## Validação visual (ordem e títulos)

1. Abrir Dashboard autenticado.
2. Confirmar títulos de seção na ordem: Metas → Receita → Despesa / Resultado → Saldo → Centro de Despesa → Demonstrativo de Resultado.
3. Metas: **Mensal** à esquerda (ou acima), **Anual** em seguida.
4. Receita: Bruta → Impostos (R$ + %) → Líquida → Pendente.
5. Despesa: Fixas → Variáveis → Pendentes; Resultado: Lucro (R$ + %).
6. Saldo: até 3 CC com **nome** + Conta Investimento; **sem** card consolidado único.
7. Centro de Despesa: títulos “Despesas — …” sem fatia Impostos.
8. Demonstrativo: DRE — {ano} acima do DRL.

## Validação de regras de negócio

| Cenário | Esperado |
|---------|----------|
| Conta `impostos` paga no mês | Entra no card Impostos; **não** em Fixas/Variáveis/Pendentes nem no donut |
| Conta fixa (ex. `adm_financeiro`) não paga | Só em Despesas Pendentes |
| Conta variável paga | Em Despesas Variáveis; Lucro = RL − Fixas − Variáveis |
| Receita Bruta > 0 | Lucro % ≈ Lucro ÷ Bruta × 100 |
| Receita Bruta = 0 | Lucro % = "—" (ou equivalente) |
| 1 CC ativa | Slot 1 com nome/saldo; slots 2–3 vazios explícitos; Investimento |
| 4+ CC ativas | Só as 3 primeiras da API; 4ª ausente |
| Visualizador | Mesma estrutura; sem editar meta |

## Filtro mês / ano

1. Selecionar mês concreto → KPIs e donut mensal no recorte; Impostos do mês via `de-contas`.
2. “Todos os meses” → recorte anual/YTD coerente com 035; meta mensal oculta se aplicável; Impostos agregados YTD.

## Checagens técnicas

```bash
cd frontend && npm run lint && npm run type-check
```

Opcional (rede): no DevTools, confirmar `GET /api/impostos/de-contas?ano=…` no carregamento do Dashboard.

## Critério de pronto

- [ ] SC-001 a SC-005 da spec observáveis na UI
- [ ] Contrato UI respeitado (ordem, exclusões, rótulos CC)
- [ ] Lint e type-check OK
