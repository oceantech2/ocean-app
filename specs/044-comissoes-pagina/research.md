# Research: Página Comissões — nomenclatura, criação e filtro de período

**Feature**: `044-comissoes-pagina` | **Date**: 2026-08-28

## R1 — Rota visível vs chave de permissão

**Decision**: `paginasCatalogo` muda `path` para `/comissoes`, `label` para **Comissões** e `desc` para vocabulário de comissões. A `key` permanece `bonus` (permKey, visibilidade global, `PAGE_COMPONENTS` em `App.tsx`).

**Rationale**: Igual à feature 043 (Fornecedores manteve `key = colaboradores`). Permissões e `paginas_visibilidade` já persistidas com a chave `bonus` continuam válidas. O usuário vê Comissões; o ACL interno não exige migração.

**Alternatives considered**:
- Renomear `key` para `comissoes` → rejeitado (migração de JSON em usuários/config fora de escopo).
- Manter `path = /bonus` → rejeitado (clarify: endereço novo sem redirect).

## R2 — Endereço antigo `/bonus` inexistente

**Decision**: Remover `/bonus` do catálogo (e portanto das rotas geradas em `App.tsx`). **Não** cadastrar `<Navigate>` de `/bonus` para `/comissoes`, Dashboard ou qualquer outra tela. Não adicionar `path="*"` só por esta feature.

**Rationale**: Clarify Q4–Q5: o endereço antigo não abre Comissões nem outra tela. Sem rota correspondente, o React Router não monta `Layout` nem página — o usuário não vê tela do produto.

**Alternatives considered**:
- Redirect `/bonus` → `/comissoes` → rejeitado (clarify B).
- Redirect `/bonus` → `/dashboard` → rejeitado (seria outra tela do produto).
- Página “não encontrado” com atalho → rejeitado (clarify A; fora de escopo).

## R3 — Recorte mês/trimestre no cliente

**Decision**: Continuar buscando a listagem por **ano** (+ pessoa da equipe, se houver), como hoje. Aplicar recorte **mês** ou **trimestre** na listagem, totais e exportação **no cliente**. O gráfico usa o conjunto do **ano inteiro**.

Mapeamento de trimestre civil no ano selecionado:

| Trimestre | Meses |
|-----------|--------|
| 1º | 1–3 |
| 2º | 4–6 |
| 3º | 7–9 |
| 4º | 10–12 |

Estado (Zustand `usePageFilters`): tipo de recorte `ano` | `mes` | `trimestre` (padrão `ano`); valor de mês 1–12; valor de trimestre 1–4. Mês e trimestre são mutuamente exclusivos (só o tipo ativo vale).

**Rationale**: `GET /api/bonus` já filtra `mes` e `ano`, mas não trimestre. Filtrar no cliente evita endpoint novo, atende FR-012 (gráfico anual) e FR-007 (um recorte por vez) e reutiliza o fetch anual já feito (até 500 itens).

**Alternatives considered**:
- Novo query `trimestre` no backend → rejeitado (YAGNI; spec não exige persistência do filtro no servidor).
- Três fetches distintos (mês vs trimestre vs ano) → rejeitado (o gráfico precisa do ano inteiro de qualquer forma).

## R4 — Sem migração de dados nem rename de API

**Decision**: Tabela `bonus`, colunas (`valor_bonus`, etc.), prefixo REST `/api/bonus` e entidade de auditoria gravada como `"Bonus"` **permanecem**. Só mudam textos visíveis e, onde o usuário vê o nome da entidade (filtro de Auditoria), o **rótulo** (ex.: Comissão) mapeado para o valor interno `Bonus`.

**Rationale**: Spec: identificadores internos não visíveis não precisam mudar. Menor risco; sem ALTER TABLE.

**Alternatives considered**:
- Renomear tabela/rota para `comissoes` → rejeitado (migração, clientes, auditoria histórica).

## R5 — Remoção só do botão de criação avulsa

**Decision**: Tirar o botão e o fluxo `abrirCriar` / modal de “novo”. Manter importação CSV (`bonusService.criar` em lote), edição, exclusão, exportação CSV/PDF. O modal abre **somente** com registro existente (`editando`).

**Rationale**: FR-004 e FR-005. Importar continua sendo o caminho de criação em massa.

**Alternatives considered**:
- Remover também import e POST → rejeitado (spec mantém importação).
- Esconder o botão mas deixar atalho no teclado → rejeitado (FR-004: sem equivalente).

## R6 — Nomenclatura em todo o produto vs subcategoria já chamada Comissão

**Decision**: Todo rótulo visível **Bônus**/**bônus**/**Bonus** (quando for o texto da UI) vira **Comissões**/**Comissão**. Na taxonomia de Contas a Pagar:

- Subcategoria interna `bonus` (hoje “Bônus” e “Bônus (legado)”) → **Comissões** / **Comissões (legado)**.
- Subcategoria interna `comissao` (já **Comissão**) **não muda**.

Dashboard: chaves `BONUS` / `bonus` passam a exibir **Comissões**.

**Rationale**: Já existe “Comissão” em RH. Usar **Comissões** (plural) no antigo Bônus evita dois itens com o mesmo nome. Qualificadores “(legado)” permanecem.

**Alternatives considered**:
- Fundir `bonus` e `comissao` numa só subcategoria → rejeitado (escopo; dados distintos).
- Renomear só a página e deixar Dashboard/Contas → rejeitado (clarify Q1).

## R7 — Mensagens de API visíveis

**Decision**: Atualizar textos de `HTTPException` e tags OpenAPI em `bonus.py` / `main.py` que o usuário possa ver (toasts via `mensagemErro`, docs) para comissão/comissões. Corpo JSON e nomes de campo inalterados.

**Rationale**: FR-014 inclui qualquer texto visível. Diff pequeno, sem contrato de payload.

**Alternatives considered**:
- Deixar 404 “Bônus não encontrado” → rejeitado se o toast mostrar a mensagem da API.
