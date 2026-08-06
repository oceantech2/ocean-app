# Research: Dashboard — Card NFs com Pagamento Pendente (R$)

**Feature**: `010-dashboard-nfs-pendente` | **Date**: 2026-08-06  
**Spec**: [spec.md](./spec.md)

## 1. Fonte de dados: estender `resumo-financeiro`

**Decision**: Adicionar `faturamento_bruto_pendente` em `GET /api/relatorios/resumo-financeiro`, calculado como `sum(nf.valor_bruto for nf in nfs_pendentes)` no mesmo filtro de ano / `StatusNF.PENDENTE` já usado para `quantidade_pendentes`.

**Rationale**: A Dashboard já chama `relatoriosService.resumoFinanceiro(ano)`. O endpoint já devolve `quantidade_pendentes` e `faturamento_liquido_pendente`, mas **não** o bruto pendente exigido por FR-006. Evita segundo request a `/nfs/resumo/total` (escopo Maggo stub diferente do resumo geral).

**Alternatives considered**:
- Usar `nfsService.resumo` (`total_bruto_pendente`) — rejeitado: filtro stub Maggo ≠ conjunto do card atual de quantidade.
- Calcular bruto no client a partir da lista de NFs — rejeitado: carga extra e inconsistência com o resumo.
- Exibir `faturamento_liquido_pendente` já existente — rejeitado pela spec (valor bruto).

## 2. Nome do campo na API

**Decision**: `faturamento_bruto_pendente` (paralelo a `faturamento_bruto_pago` e `faturamento_liquido_pendente`).

**Rationale**: Consistência de nomenclatura no mesmo payload; previsível para o frontend.

**Alternatives considered**: `total_bruto_pendente` (estilo `/nfs/resumo/total`) — funcional, mas quebra o padrão `faturamento_*` deste endpoint.

## 3. UI: substituir o 3º KPI (não criar 4º card)

**Decision**: No grid `md:grid-cols-3`, trocar o card “NFs Pendentes” por “NFs com pagamento pendente (R$)”; valor principal `fmt(resumo.faturamento_bruto_pendente)`; subtítulo `` `${resumo.quantidade_pendentes} NFs pendentes` ``; manter cor laranja do KPI atual.

**Rationale**: Clarificações B + A; FR-001/003/010; alinhado ao subtítulo do card Líquido (`{n} NFs pagas`).

**Alternatives considered**: Quatro cards; quantidade em destaque — rejeitados no clarify.

## 4. Contexto temporal

**Decision**: Manter o mesmo parâmetro `ano` já passado a `resumoFinanceiro` pela Dashboard; não introduzir filtro de mês neste card nesta feature (segue o card de quantidade atual).

**Rationale**: Assumption da spec; escopo fechado. Se `009-dashboard-filtro-mes` alterar o resumo no futuro, este card herda a mesma fonte.

**Alternatives considered**: Filtrar pendentes só pelo mês selecionado — fora do baseline do card atual; risco de divergir quantidade vs. valor se só um lado mudasse.

## 5. Relatórios e insights

**Decision**: Não alterar `Relatorios.tsx`. Texto de insight da Dashboard que cita quantidade pode ficar como está (não faz parte do card KPI).

**Rationale**: FR-009.

**Alternatives considered**: Espelhar o valor em Relatórios — escopo extra.

## 6. Tipagem / estado inicial

**Decision**: Incluir `faturamento_bruto_pendente: 0` no estado inicial de `resumo` em `Dashboard.tsx`; usar `|| 0` / default ao renderizar se o backend antigo ainda não tiver o campo (defesa durante deploy).

**Rationale**: Evita `undefined` no `fmt` e regressão visual.

## Research resolution

Nenhum item `NEEDS CLARIFICATION` permanece no Technical Context do [plan.md](./plan.md).
