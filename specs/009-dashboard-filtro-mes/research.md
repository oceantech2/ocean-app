# Research: Dashboard — Filtro de Mês

**Feature**: `009-dashboard-filtro-mes` | **Date**: 2026-08-06  
**Spec**: [spec.md](./spec.md)

## 1. Onde guardar mês/ano

**Decision**: Estado local em `Dashboard.tsx` (`useState` para `mes` e `ano`), padrão mês/ano civis correntes. Não sincronizar com `useFilterStore` nesta feature.

**Rationale**: A Dashboard já usa `ano` local; a spec não exige persistência entre páginas/sessões. Evita efeitos colaterais em outras telas que usam ou poderiam usar o store global.

**Alternatives considered**:
- `useFilterStore` (`mesAtual`/`anoAtual`) — reutiliza store existente, mas acopla navegação e pode divergir do `anoComparar` local; fora do mínimo.
- Query string (`?mes=&ano=`) — útil para deep-link; fora do escopo.

## 2. Custo por categoria: YTD vs mês isolado

**Decision**: Estender `GET /api/relatorios/custo-por-categoria` com parâmetro opcional `mes_de` (default `1`, ge=1, le=12). Filtro: `mes_de <= month(data_vencimento) <= mes_ate`. Dashboard envia `mes_de = mes_ate = mês selecionado`. Resposta continua incluindo `mes_ate` e passa a incluir `mes_de`.

**Rationale**: O endpoint atual agrega `month <= mes_ate` (YTD). A clarificação exige **mês isolado**. Intervalo `[mes_de, mes_ate]` preserva compatibilidade (omitir `mes_de` ⇒ YTD desde janeiro) e atende o novo caso sem endpoint novo.

**Alternatives considered**:
- Novo endpoint `/custo-por-categoria-mes` — duplicação desnecessária.
- Filtrar fatias só no frontend a partir de YTD — incorreto (não dá para “desacumular” por categoria).
- Quebrar `mes_ate` para significar mês exato — regressão para qualquer consumidor YTD / smoke da feature 004.

## 3. Saldos: fallback até o mês

**Decision**: Continuar listando saldos do ano via `saldosService.listar`; no client, para cada conta (`corrente` / `investimento`), escolher o registro com maior `mes` tal que `mes <= mêsSelecionado` e `ano === anoSelecionado`. Se nenhum, estado vazio. Exibir no card o `mês/ano` do registro escolhido (já há padrão de rótulo).

**Rationale**: Alinha à clarificação B; não exige mudança de API. Fallback nunca usa mês posterior ao filtro.

**Alternatives considered**:
- Endpoint `saldo-ate-mes` — overkill para dois cards.
- Só mês exato — rejeitado na clarificação.

## 4. Meta mensal e séries anuais

**Decision**: `metasService.progresso(mes, ano)` e `definir(mes, ano, …)` usam o `mes` do filtro (não mais `MES_ATUAL` hardcoded). Meta anual permanece `progresso(0, ano)`. DRE, faturamento líquido por mês e “Comparar ano” dependem só de `ano` / `anoComparar` (recarga ao mudar mês é aceitável; dados anuais idênticos para o mesmo ano).

**Rationale**: FR-005, FR-007, FR-008 e clarificação Q1.

**Alternatives considered**:
- Destacar mês no gráfico DRE — rejeitado na clarificação.
- Separar `useEffect` mensal vs anual — micro-otimização; pode ficar para depois se houver lentidão.

## 5. Meses selecionáveis e clamp ao trocar ano

**Decision**: Função auxiliar `mesesPermitidos(ano)` / `maxMesPermitido(ano)`:
- `ano < ANO_ATUAL` → 1..12
- `ano === ANO_ATUAL` → 1..MES_ATUAL
- `ano > ANO_ATUAL` → lista vazia ou não carregar indicadores (comportamento vazio já existente para custo/DRE)

Ao `setAno`, se `mes > maxMesPermitido(novoAno)`, setar `mes = maxMesPermitido(novoAno)` (se max ≥ 1).

**Rationale**: FR-011, FR-012 e clarificações Q4/Q5.

**Alternatives considered**:
- Permitir futuros com vazio — rejeitado.
- Resetar sempre para mês corrente ao mudar ano — rejeitado (clarificação Q5 = A).

## 6. UX do seletor

**Decision**: `<select>` de mês ao lado do de ano, mesmo estilo Tailwind dos filtros atuais; label “Mês:”; opções com `MESES_NOME` já usado na página. Ordem visual sugerida: Comparar → Ano comparar → **Mês** → **Ano** (ou Mês imediatamente antes de Ano). Ambos papéis podem alterar.

**Rationale**: Consistência com produto (FR-001, FR-002, FR-009); sem componente novo.

**Alternatives considered**:
- Input type=month — menos alinhado ao select de ano atual.
- Botões prev/next — fora do pedido.
