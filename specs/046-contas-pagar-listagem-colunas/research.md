# Research: Contas a Pagar — Listagem em Tabela com Colunas Tipo, Categoria e Mês/Ano

**Feature**: `046-contas-pagar-listagem-colunas` | **Date**: 2026-08-29  
**Spec**: [spec.md](./spec.md)

## 1. Escopo backend vs frontend

**Decision**: Alteração **predominantemente frontend** (`Contas.tsx` + utils). **Sem** migration, **sem** novos campos em `ContaPagar`. Opcionalmente **ajuste leve** em `GET /contas/exportar-xlsx` para alinhar colunas e filtros ao recorte visível (FR-011).

**Rationale**: Tipo, Categoria e competência Mês/Ano já existem nos dados carregados (`tipo_despesa`, `categoria`/`subcategoria`, `data_vencimento`). A feature troca **apresentação** (tabela plana + filtro mensal no cliente) e remove agrupamento da feature `034`.

**Alternatives considered**:
- Endpoint de listagem com `mes`/`ano` — rejeitado (filtro mensal + demais recortes locais já funcionam sobre a lista; evita duplicar regras no servidor).
- Persistir filtro Mês/Ano no Zustand — rejeitado (spec: sessão da página; filtros de categoria/status já estão no store).

## 2. Substituir agrupamento por tabela plana

**Decision**: Remover de `Contas.tsx` o fluxo `gruposLista` / `gruposAbertos` / subgrupos por categoria dentro de mês. Renderizar **uma** `<table>` sobre `contasFiltradas` ordenadas. Eliminar UI e estado de agrupamento Por mês / Por categoria (FR-014).

**Rationale**: Spec substitui explicitamente o modelo da `034`. Mantém cards de totais no topo (já calculados sobre `contasFiltradas`).

**Alternatives considered**:
- Manter toggle Por mês como opção — rejeitado (FR-014).
- DataGrid compartilhado com Contas a Receber — rejeitado (constituição V; escopo fechado).

## 3. Filtro Mês/Ano (estado e UX)

**Decision**: Estado local em `Contas.tsx`:
- `contasMesTodos: boolean` (default `false`)
- `contasMes: number` (1–12, default mês civil corrente)
- `contasAno: number` (default ano corrente; opções **corrente ±5**)

Controles na barra de filtros: checkbox ou toggle **Todos** + `<select>` Mês + `<select>` Ano (padrão Dashboard). Com **Todos** ativo: seletores desabilitados; filtro mensal não aplicado; contas sem vencimento incluídas.

Aplicar filtro mensal **dentro** de `contasFiltradas` após filtros de API e locais existentes, usando `chaveMesVencimento` de `contasPagarAgrupamento.ts` comparada a `` `${ano}-${String(mes).padStart(2,'0')}` ``.

**Rationale**: Clarify B; reutiliza helper de chave `YYYY-MM` sem bug de fuso. Anos: clarify ±5. Meses futuros permitidos no ano corrente (clarify A), distinto do Dashboard.

**Alternatives considered**:
- Colocar `contasMes`/`contasAno` em `usePageFilters` — rejeitado para o par mês/ano (spec não persiste entre rotas); alertas tratados à parte (item 7).
- Dropdown único “Agosto/2026” — rejeitado (clarify B).

## 4. Alertas de vencimento × filtro mensal

**Decision**: Quando `contasAlertaVencimento` ∈ `{ hoje, 7dias, vencida }` (via dropdown de status ou link de notificação no `Layout`), forçar **`contasMesTodos = true`** ao detectar o alerta ( `useEffect` ), para que vencidas/alertas de **qualquer mês** apareçam. Ao limpar o alerta (status “Todos”, “Pendente” ou “Pago”), restaurar filtro mensal padrão (**mês + ano correntes**) se o usuário não tinha escolhido outro recorte na sessão.

**Rationale**: Links do menu de notificações (`setContasFilters(..., 'vencida')`) não definem mês; com padrão “mês corrente”, contas vencidas de meses anteriores sumiriam — regressão operacional. Interseção FR-008 continua valendo para categoria, descrição e intervalo de datas.

**Alternatives considered**:
- Ignorar filtro mensal só no cliente quando alerta ativo, sem mudar UI — rejeitado (confuso; usuário veria mês corrente selecionado mas lista multi-mês).
- Estender `setContasFilters` no store com mes/ano — rejeitado (escopo store mínimo).

## 5. Colunas derivadas (Categoria, Mês/Ano, Tipo)

**Decision**:
- **Categoria**: reutilizar `categoriaLabel(c)` / `nomeCategoriaCatalogo` já em `Contas.tsx`.
- **Mês/Ano**: novo helper `rotuloMesAnoColuna(dataVencimento?)` em `contasPagarAgrupamento.ts` (ou `utils/contasPagarColunas.ts`) → `"Agosto/2026"` (mês por extenso + `/` + ano); sem vencimento → `—`. Diferente de `rotuloGrupoMes` (`"Agosto 2026"` com espaço) usado no agrupamento removido.
- **Tipo**: reutilizar `labelTipoDespesa(c.tipo_despesa)`.

Ordem fixa das colunas (clarify A): Descrição → Categoria → Mês/Ano → Fornecedor → Valor → Vencimento → Pagamento → Conta → Tipo → Status → Nota fiscal → Ações.

**Rationale**: Clarify ordem; formato Mês/Ano com barra conforme spec FR-004.

## 6. Ordenação

**Decision**:
- Padrão: `sortField = 'data_vencimento'`, `sortDir = 'asc'` ao montar a página e **sempre que** mudar qualquer filtro (incl. Mês/Ano/Todos), resetando ordenação manual (FR-010a).
- Novos campos ordenáveis: `categoria` (rótulo legível), `mes_ano` (chave `YYYY-MM` ou sentinela no fim), `tipo_despesa`.
- Contas sem vencimento: após todas as datadas ao ordenar por vencimento ou Mês/Ano asc.

**Rationale**: Clarify ordenação padrão; comportamento previsível ao trocar recorte.

**Alternatives considered**:
- Manter sort do usuário ao trocar filtro — rejeitado (clarify exige reset).

## 7. Exportação (CSV, Excel, PDF)

**Decision**:
- **CSV** (`exportarCSV`): gerar a partir de `contasFiltradas` **ordenadas**, colunas na ordem FR-001a; incluir Categoria, Mês/Ano, Tipo (FR-011).
- **PDF** (`window.print()`): tabela visível com mesmas colunas; revisar `@media print` se necessário para não cortar colunas novas.
- **Excel**: estender `GET /contas/exportar-xlsx` para aceitar os **mesmos query params** de listagem (`categoria`, `subcategoria`, `pago`) + `mes`/`ano` opcionais (omitir quando **Todos**); incluir no arquivo colunas **Categoria**, **Mês/Ano**, **Tipo** alinhadas à tela. Frontend passa estado atual dos filtros ao clicar exportar.

**Rationale**: FR-011 exige paridade com listagem visível; CSV já é client-side; Excel server-side hoje ignora filtros de categoria/status — wiring + colunas no `excel_io` fecha o gap sem biblioteca xlsx no frontend.

**Alternatives considered**:
- Excel só com mes/ano (como hoje) — rejeitado (viola FR-011 com categoria/status ativos).
- Export Excel 100% client-side — rejeitado (sem dependência xlsx no frontend; template existente no backend).

## 8. Código legado da feature 034

**Decision**: Manter `contasPagarAgrupamento.ts` com funções ainda úteis (`chaveMesVencimento`, `CHAVE_SEM_VENCIMENTO`); remover ou deixar de importar `agruparPorMes`, `chaveMesInicialAberta`, `rotuloGrupoMes` se não houver outros usos. Atualizar/remover testes Vitest do agrupamento se existirem.

**Rationale**: Evitar duplicação de parse de data; limpar código morto do agrupamento.

## 9. Utilitário de anos permitidos

**Decision**: Helper `anosPermitidosContasPagar(anoCorrente: number): number[]` → `[corrente-5 … corrente+5]`. Lista de meses: sempre `[1..12]` (meses futuros permitidos).

**Rationale**: FR-007a/FR-007b; centraliza regra ±5.
