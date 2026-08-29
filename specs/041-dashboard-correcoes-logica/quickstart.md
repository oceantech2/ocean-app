# Quickstart: Dashboard — Correções de Lógica, DRL e Ajustes Visuais

**Feature**: `041-dashboard-correcoes-logica` | **Date**: 2026-08-27  
**Spec**: [spec.md](./spec.md) · **UI**: [contracts/ui-dashboard-correcoes-logica.md](./contracts/ui-dashboard-correcoes-logica.md)

## Pré-requisitos

- API `http://localhost:8001`, frontend `http://localhost:5193`
- Login `admin` / `123456`
- Dados: meta anual cadastrada; NFs pagas 2024+ em contas distintas; contas a pagar (incl. impostos); ≥2 contas correntes ativas

```bash
docker compose up -d
cd frontend && npm run dev
```

## 1. Cabeçalho sem comparação

1. Abrir Dashboard.
2. **Esperado**: filtros Mês e Ano visíveis; **sem** checkbox "Comparar" nem select de ano comparativo.

## 2. Meta de Receita Anual — percentual na barra

1. Garantir meta anual cadastrada para o ano corrente com realizado > ~18% da meta.
2. **Esperado**: barra preenchida com **percentual em texto branco** dentro da barra (como meta mensal).
3. Valor à esquerda = soma Receita Líquida YTD (conferir com card Receita Líquida no recorte anual).

## 3. Despesas sem impostos

| Cenário | Esperado |
|---------|----------|
| Conta `impostos` paga no mês | Card Impostos (Receita) tem valor; **Fixas/Variáveis/Pendentes** e donuts **não** incluem |
| Zerar/remover impostos do período | Totais de Despesa inalterados exceto se havia vazamento |

## 4. Saldo — cores e cálculo por conta

1. Seção Saldo: cards CC em **verde**; Investimento em **azul**.
2. Com 2+ CC com NFs/desembolsos distintos: **valores diferentes** entre slots (não repetir o mesmo total global).
3. Despesa pendente alocada a uma CC: **não** reduz saldo exibido.
4. Slot vazio: "—" / "Sem conta".

**Conferência manual (slot com conta)**:

```text
saldo ≈ saldo_registrado
       + Σ NF.valor_bruto (conta, pagas, recorte)
       − Σ (NF.bruto − NF.líquido) (mesmas NFs)
       − Σ contas pagas operacionais (conta, recorte, ≠ impostos)
```

## 5. DRL histórico

1. Com NFs pagas em meses distintos desde 2024, abrir Demonstrativo de Resultado.
2. **Esperado**:
   - Gráfico de **linha única** "Receita Líquida"
   - Eixo X: `Jan/24`, `Fev/24`, … (apenas meses **com** valor > 0)
   - **Sem** linha tracejada de ano comparativo
3. Alterar filtro Ano no Head para ano passado.
4. **Esperado**: DRL **mantém** série 2024→hoje (não restringe ao ano filtrado).

## 6. Regressão filtros mês/ano

1. Selecionar mês concreto → KPIs Receita/Despesa/Lucro atualizam.
2. "Todos os meses" → YTD coerente; meta mensal oculta se regra 035 vigente.

## Checagens técnicas

```bash
cd frontend && npm run lint && npm run type-check
```

## Critérios de aceite rápidos

- [ ] SC-001: % na barra meta anual (≥18% preenchimento)
- [ ] SC-002: saldos CC distintos quando movimentos diferem
- [ ] SC-003: zero impostos em Despesa/donuts
- [ ] SC-004: DRL jan/24→hoje, meses vazios omitidos
- [ ] SC-005: Head sem comparar
- [ ] SC-006: verde CC / azul investimento
