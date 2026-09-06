# Research: Dashboard — Alíquota, Lucro %, DRE Anual e Imposto por Competência

**Feature**: `047-dashboard-metricas-dre`  
**Date**: 2026-09-06

## 1. Origem do Impostos do card: NFs pagas vs Contas a Pagar vs de-contas

**Decision**: Card Impostos = Σ `NF.valor_imposto` das NFs com `status=paga`, `excluida_em` nulo, `data_emissao` no recorte (mês concreto ou jan…mesAte). Alíquota = esse valor ÷ Receita Bruta do mesmo recorte. Não usar `impostosService.deContas` no Dashboard.

**Rationale**: Clarify Q1/Q3. Hoje `impostosDoRecorte` consome Contas a Pagar por vencimento (pagamento defasado) e o percentual da API usa faturamento líquido — ambos conflitam com FR-001/FR-002. NFs já entram no `Promise.all` do Dashboard; agregação client-side evita endpoint novo e preserva a tela Impostos.

**Alternatives considered**:
- Deslocar Contas a Pagar para M+1 — frágil se a conta futura ainda não existir no mês vigente.
- Alterar `GET /impostos/de-contas` — quebraria a página Impostos (“em imposto não muda”).
- Endpoint novo só para o card — overhead desnecessário com NFs já carregadas.

## 2. Impostos no DRE: alinhar ao card

**Decision**: Em `dre_mensal`, substituir Σ Contas a Pagar (categoria impostos, vencimento no mês) por Σ `NF.valor_imposto` (pagas, emissão no mês). Manter Despesa como está. Recalcular `lucro = receita_bruta − despesa − impostos` com o novo impostos.

**Rationale**: Clarify Q2 + SC-006 (card e DRE iguais no mês M). Receita bruta do DRE já usa a mesma base de NFs pagas/`data_emissao`.

**Alternatives considered**:
- Só card muda, DRE permanece por vencimento — rejeitado no clarify.
- Montar Impostos do DRE só no frontend — divergiria do contrato HTTP e do Lucro do DRE servido pela API.

## 3. Campo de imposto na NF nulo

**Decision**: Tratar `valor_imposto` nulo/ausente como `0` na soma. Não derivar `valor_bruto − valor_liquido` nesta feature (evita surpresa se líquido foi editado à parte).

**Rationale**: Coluna já existe e é preenchida no fluxo de NFs; null = sem imposto lançado. Simplicidade (Constitution V).

**Alternatives considered**: Fallback `bruto − líquido` — útil em dados legados, mas fora do pedido e pode divergir da alíquota gravada.

## 4. % do Lucro (card): denominador Receita Líquida

**Decision**: Em `lucroCard`, calcular `pct = valor / receitaLiquida` quando líquida > 0; senão `null` → UI "—". Atualizar texto do card de “sobre Receita Bruta” para “sobre Receita Líquida”. Assinatura pode manter `receitaBruta` só se ainda usada em outro lugar; preferir remover parâmetro morto.

**Rationale**: FR-004/FR-006; substitui regra da `040`.

**Alternatives considered**: Manter bruto no helper e só mudar a UI — risco de regressão silenciosa.

## 5. Eixo DRE: 12 meses por padrão

**Decision**: Remover (ou tornar no-op) o corte `cortarEixoDre` que faz `slice(0, MES_ATUAL)` no ano corrente. Sempre exibir os 12 pontos retornados pela API (já sempre 12). Ano futuro: manter estado vazio compreensível (como hoje se `ano > ANO_ATUAL` retorna `[]`, ou exibir 12 zeros — preferir manter comportamento de “sem dados” se já existir e estiver claro; se a API devolver zeros, exibir 12 meses zerados é aceitável e atende FR-007/008).

**Rationale**: FR-007/FR-008; API já devolve 12 meses; o truncamento é só no frontend.

**Alternatives considered**: Truncar no backend — rejeitado (quebra contrato “sempre 12” e o pedido de ano completo).

## 6. Alíquota e faturamento líquido legado

**Decision**: Denominador da alíquota do card = Receita Bruta do recorte já usada nos KPIs (resumo/faturamento), não o `faturamento` líquido de `de-contas`.

**Rationale**: FR-002 explícito; alinha numerador (imposto das NFs) ao denominador (bruto das mesmas NFs pagas).

**Alternatives considered**: Continuar usando líquido — contradiz a spec.

## 7. Escopo explícito fora

**Decision**: Não alterar página Impostos, `impostos/de-contas`, DRL, fórmulas de Despesa/Saldo/Metas, nem criar migration.

**Rationale**: Spec Assumptions + Constitution V.
