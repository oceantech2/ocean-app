# Tasks: Dashboard — Nomenclatura e Remoção de Card

**Input**: Design documents from `/specs/039-dashboard-nomenclatura/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (P1 US1 → P1 US2). Ambos tocam o mesmo arquivo — execução sequencial recomendada. `[P]` só quando aplicável.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US2 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Frontend: `frontend/src/pages/Dashboard.tsx`
- Contrato UI: `specs/039-dashboard-nomenclatura/contracts/ui-dashboard-nomenclatura.md`
- **Não alterar**: `frontend/src/services/api.ts` (manter `fechamentosPorTipo`), backend, página Impostos

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte; sem app novo, sem dependência nova

- [x] T001 Confirmar escopo em `frontend/src/pages/Dashboard.tsx` apenas: 7 rótulos + remoção do card Fechamentos; portas 5193/8001 inalteradas; não tocar Impostos, `api.ts` (método `fechamentosPorTipo` permanece) nem backend

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Mapa canônico de textos alinhado ao contrato — bloqueia US1/US2

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Conferir em [contracts/ui-dashboard-nomenclatura.md](./contracts/ui-dashboard-nomenclatura.md) e [research.md](./research.md) o mapa: Meta de Receita Anual/Mensal, Receita Bruta/Líquida/Pendente, Centro de Despesas (+ sufixos de período), DRL; proibições de textos antigos; layout DRL full-width após remoção do pie

**Checkpoint**: Mapa e proibições claros antes de editar `Dashboard.tsx`

---

## Phase 3: User Story 1 - Ver rótulos de receita e despesas atualizados (Priority: P1) 🎯 MVP

**Goal**: Todos os 7 rótulos do Dashboard usam a nomenclatura nova; textos antigos de título não aparecem

**Independent Test**: Abrir Dashboard e verificar cada título da tabela do contrato; busca visual sem “Faturamento” / “Custo por categoria” / “NFs com pagamento pendente” nos títulos afetados

### Implementation for User Story 1

- [x] T003 [US1] Em `frontend/src/pages/Dashboard.tsx`, atualizar literais e `rotuloMetaMensal`: `Meta de Faturamento Anual` → `Meta de Receita Anual`; `Meta de Faturamento` → `Meta de Receita Mensal` (preservar sufixo `— {mês}/{ano}` quando existir), inclusive no modo edição
- [x] T004 [US1] Em `frontend/src/pages/Dashboard.tsx`, nos três KPIs: títulos `Receita Bruta`, `Receita Líquida`, `Receita Pendente` (substituir Faturamento Bruto/Líquido e `NFs com pagamento pendente (R$)`); manter subtítulos auxiliares e fontes de valor (`faturamento_bruto_pago`, etc.)
- [x] T005 [US1] Em `frontend/src/pages/Dashboard.tsx`, atualizar `rotuloCustoMes` / `rotuloCustoAno` de `Custo por categoria` para `Centro de Despesas` (manter sufixos `— mês`, `— {mês}/{ano}`, `— {ano}`); título do gráfico de linha `Faturamento Líquido por Mês` → `DRL`

**Checkpoint**: SC-001 parcial (rótulos); FR-001 a FR-007; US1 testável mesmo com o pie ainda presente

---

## Phase 4: User Story 2 - Dashboard sem o card Fechamentos por Tipo (Priority: P1)

**Goal**: Card/pie “Fechamentos por Tipo” ausente; sem fetch/estado órfãos; DRL em largura total; filtros e demais indicadores intactos

**Independent Test**: Dashboard sem “Fechamentos por Tipo”; DRL full-width; trocar mês/ano atualiza o restante; Network sem chamada desnecessária de fechamentos na carga da página

### Implementation for User Story 2

- [x] T006 [US2] Em `frontend/src/pages/Dashboard.tsx`, remover o bloco JSX do pie “Fechamentos por Tipo” e colocar o gráfico **DRL** em container de largura total (sair do `grid lg:grid-cols-2` compartilhado), conforme [contracts/ui-dashboard-nomenclatura.md](./contracts/ui-dashboard-nomenclatura.md)
- [x] T007 [US2] Em `frontend/src/pages/Dashboard.tsx`, remover `useState` de `fechamentos`, a chamada `relatoriosService.fechamentosPorTipo(ano)` do carregamento/`Promise.all`, e imports Recharts (`PieChart`, `Pie`, `Cell`) se ficarem sem uso; **não** remover o método em `frontend/src/services/api.ts`

**Checkpoint**: SC-002; FR-008 a FR-010; layout sem coluna vazia

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e validação ponta a ponta

- [x] T008 Rodar `npm run lint` e `npm run type-check` em `frontend/`; executar o checklist de [quickstart.md](./quickstart.md) (rótulos, ausência do card, papéis admin/visualizador)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: imediato
- **Foundational (Phase 2)**: após Setup — **bloqueia** US1 e US2
- **User Story 1 (Phase 3)**: após Foundational — MVP
- **User Story 2 (Phase 4)**: após Foundational; preferir após US1 (mesmo arquivo `Dashboard.tsx`)
- **Polish (Phase 5)**: após US1 + US2

### User Story Dependencies

- **US1 (P1)**: independente funcionalmente (só rótulos)
- **US2 (P1)**: independente funcionalmente (só remoção/layout); conflito de merge se paralelo no mesmo arquivo

### Parallel Opportunities

- Poucas: quase tudo em `Dashboard.tsx`
- T001/T002 são sequenciais leves
- Não marcar US1 e US2 como `[P]` entre si (mesmo arquivo)

### Parallel Example

```text
# Não há modelos/arquivos distintos para paralelizar.
# Sequência recomendada: T001 → T002 → T003–T005 (US1) → T006–T007 (US2) → T008
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001–T002  
2. T003–T005 (rótulos)  
3. **STOP e VALIDAR** títulos no Dashboard  
4. Seguir com US2 (remoção do card)

### Incremental Delivery

1. Setup + Foundational  
2. US1 → demo de nomenclatura  
3. US2 → demo sem Fechamentos + DRL full-width  
4. Polish / quickstart

### Parallel Team Strategy

Um único arquivo — um implementador por vez; segundo revisor no quickstart.

---

## Notes

- Sem testes automatizados (não pedidos na spec)
- Não renomear chaves de API nem página Impostos
- Commit após US1 e após US2 se desejado
- Formato checklist: todas as tarefas usam `- [ ] T00N ...` com caminho de arquivo
