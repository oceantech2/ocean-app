# Research: Contas a Pagar — Tipo Imposto / DAS

**Feature**: `074-contas-tipo-imposto-das` | **Date**: 2026-09-16

## 1. Valor persistido do terceiro Tipo

**Decision**: Persistir `tipo_despesa = 'imposto_das'`; rótulo UI/export **Imposto / DAS**. Ampliar coluna de `VARCHAR(10)` para `VARCHAR(20)` (e `String(20)` no modelo).

**Rationale**: Alinha ao padrão snake_case de `fixo`/`variavel`; `imposto_das` (11 chars) não cabe em VARCHAR(10). Rótulo com barra e espaços fica só na apresentação (`_rotulo_tipo_despesa` / `labelTipoDespesa`).

**Alternatives considered**:
- Código `imposto` → rejeitado (colide com legado de categoria `imposto`).
- Código `imposto / das` → rejeitado (espaços/barra no valor persistido).
- Manter VARCHAR(10) com abreviação `imp_das` → rejeitado (menos legível; ampliar é barato).

## 2. Migração de categoria Impostos → Tipo

**Decision**: No `_migrar` de `main.py` (após garantir coluna ampliada):

```sql
UPDATE contas_pagar
SET tipo_despesa = 'imposto_das',
    categoria = NULL,
    subcategoria = NULL,
    categoria_pendente = FALSE
WHERE lower(coalesce(categoria, '')) IN ('impostos', 'imposto');
```

Não preencher Adm/Financeiro. Contas sem essas categorias **não** mudam de Tipo.

**Rationale**: Clarify: limpar categoria; Tipo passa a ser a fonte da verdade para a página Impostos.

**Alternatives considered**:
- Reatribuir Adm/Financeiro → rejeitado (clarify).
- Pendência de reclassificação → rejeitado (clarify: categoria opcional nesse Tipo).

## 3. Validação categoria × Tipo

**Decision**:
- `tipo_despesa ∈ {fixo, variavel}` → categoria obrigatória (regras RH/subcategoria vigentes).
- `tipo_despesa = imposto_das` → categoria opcional; se vazia, `subcategoria` vazia; se RH, subcategoria obrigatória.
- Transição `imposto_das` → `fixo`/`variavel` com categoria vazia → 422.
- Valores de categoria `impostos`/`imposto` rejeitados em create/update/import.

**Rationale**: FR-006a; evita contas Fixo/Variável sem classificação operacional.

**Alternatives considered**:
- Categoria sempre obrigatória → rejeitado (clarify B).
- Ocultar campo categoria no UI para Imposto / DAS → rejeitado (opcional ≠ oculto; admin pode classificar se quiser).

## 4. Remoção de Impostos da taxonomia

**Decision**: Remover `CATEGORIA_IMPOSTOS` de `CATEGORIAS` (e opções de catálogo/filtro/UI). Manter constante só para migração/aliases de rejeição de import. Labels legado podem permanecer só para exibição histórica se ainda houver linha não migrada (não esperado após UPDATE).

**Rationale**: FR-004; categoria vira Tipo.

**Alternatives considered**:
- Manter Impostos na lista como “legado selecionável” → rejeitado (duplicidade).

## 5. Página Impostos (`/impostos/de-contas`)

**Decision**: Filtrar `ContaPagar.tipo_despesa == 'imposto_das'` (em vez de `categoria == impostos`). Incluir contas com `categoria` nula. Atualizar texto vazio em `Impostos.tsx` para orientar Tipo **Imposto / DAS**.

**Rationale**: FR-008; após migração, filtro por categoria zeraria a tela.

**Alternatives considered**:
- União categoria OR tipo → rejeitado (fonte única = Tipo; migração cobre histórico).

## 6. Custo por categoria / exclusão de despesas

**Decision**:
- Agregações que excluía `categoria == impostos` passam a excluir `tipo_despesa == imposto_das` (ex.: DRE despesa em `relatorios.py`, `totaisDespesa` / helpers em `dashboardDespesas.ts`).
- `filtrarCustoSemImpostos`: continuar removendo fatia cuja chave/rótulo seja impostos **e** garantir que contas `imposto_das` não entrem nas fatias (idealmente já no backend `custo-por-categoria`).
- **Não** criar fatia “Impostos” no donut a partir do Tipo.
- Cards Fixas vs Variáveis: mesma lógica de classificação por `tipo_despesa` fixo/variavel entre contas **não** excluídas; só muda o critério de exclusão (categoria → Tipo).

**Rationale**: Clarify A + FR-009 + FR-013 (ajuste mínimo, não redesign).

**Alternatives considered**:
- Fatia Impostos no donut por Tipo → rejeitado (clarify).
- Deixar Dashboard intocado → rejeitado (migração faria impostos contarem como variável).

## 7. Importação / exportação

**Decision**:
- Export: rótulo **Imposto / DAS** na coluna Tipo (CSV/XLSX/PDF alinhados à listagem).
- Import: rejeitar linha com categoria Impostos/imposto; aceitar Tipo `imposto_das` / rótulos equivalentes; categoria ausente permitida só com esse Tipo; Tipo ausente → `variavel` (padrão vigente).

**Rationale**: FR-010, FR-011.

**Alternatives considered**:
- Mapear categoria Impostos → Tipo na importação silenciosamente → rejeitado (spec: rejeitar linha).

## 8. Ordenação / sort na listagem Contas

**Decision**: Estender ordenação por `tipo_despesa` para três valores (ex.: fixo=0, variavel=1, imposto_das=2) em `Contas.tsx`.

**Rationale**: Evitar que Imposto / DAS colapse com Variável no sort atual (`fixo ? 0 : 1`).

**Alternatives considered**:
- Ordenar alfabeticamente pelo rótulo → aceitável, mas ordem fixa dos três Tipos é mais previsível.
