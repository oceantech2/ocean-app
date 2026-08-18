# Research: Contas a Pagar — Agrupar por Mês e Filtrar por Categorias

**Feature**: `034-contas-pagar-agrupar-mes` | **Date**: 2026-08-18  
**Spec**: [spec.md](./spec.md)

## 1. Onde agrupar (cliente vs API)

**Decision**: Agrupar e somar no frontend a partir de `contasFiltradas` (já após filtro de categoria/subcategoria na API e recortes locais de descrição, datas e alertas). Sem novo endpoint e sem parâmetro de agrupamento em `GET /api/contas`.

**Rationale**: FR-013 fecha cadastro, taxonomia e outras páginas. A lista já vem completa o suficiente para a tela atual (sem paginação). Constituição V: menor solução.

**Alternatives considered**:
- Agregação no backend — rejeitado (contrato novo, totais duplicados, fora do escopo).
- Agrupar antes dos filtros locais — rejeitado (FR-009 exige todos os filtros).

## 2. Persistência do modo e do colapso

**Decision**: `useState` na página. Padrão `mes` ao montar. Não colocar `modoAgrupamento` em `usePageFilters` (Zustand). Ao voltar de Por categoria para Por mês, reaplicar o estado inicial de aberto/fechado (só o mês mais recente datado aberto).

**Rationale**: Spec: vale na sessão da página; não lembrar após sair. Filtros no store já persistem entre rotas; misturar agrupamento lá faria a tela “lembrar” o modo depois de sair, contra a spec.

**Alternatives considered**:
- Query string (`?agrupar=mes`) — rejeitado (não pedido; ruído de URL).
- `localStorage` — rejeitado (spec não exige preferência permanente).

## 3. Chave e ordem dos grupos mensais

**Decision**: Chave `YYYY-MM` extraída de `data_vencimento` (string `YYYY-MM-DD`) **sem** `new Date('YYYY-MM-DD')` (UTC desloca o dia em America/Sao_Paulo). Contas sem vencimento: chave sentinela `sem-vencimento`. Ordem: chaves `YYYY-MM` decrescente; sentinela por último.

Rótulo: `toLocaleString('pt-BR', { month: 'long', year: 'numeric' })` com `Date(ano, mesIndice, 1)` local, depois capitalizar a primeira letra (“Agosto 2026”). Sentinela: **“Sem vencimento”**.

**Rationale**: FR-002, FR-003, FR-005; edge case de fuso.

**Alternatives considered**:
- `date-fns` + locale `ptBR` — possível (já há `date-fns` no `package.json`), mas `Intl` nativo evita import de locale ainda não usado no app.
- Agrupar por data de pagamento — rejeitado (spec / assumptions).

## 4. Colapso só no modo mês

**Decision**: Cabeçalho do grupo (já existente: fundo cinza, título + Total) vira controle de abrir/fechar **somente** se `modo === 'mes'`. Estado: conjunto de chaves abertas. Inicial: se houver ao menos um grupo datado, abrir só o primeiro da lista ordenada; se só existir `sem-vencimento`, abrir esse. Clique no cabeçalho alterna aquele grupo (não fecha os outros automaticamente). No modo `categoria`, todos os blocos renderizam a tabela como hoje (sem botão de colapso).

**Rationale**: FR-014 e clarify Q3/Q4. Cabeçalho já mostra o total (SC-002 com grupo fechado).

**Alternatives considered**:
- `<details>` nativo — rejeitado como único mecanismo se o estilo do card atual for mais fácil de manter com `button` + condicional da tabela; aceitável se o visual permanecer o mesmo.
- Accordion (só um aberto) — rejeitado (cenário 4: abrir mês anterior sem fechar o mais recente).

## 5. Filtro por categorias (incl. RH)

**Decision**: Não redesenhar o filtro. Manter o `<select>` Categorias (oficiais + cadastradas + Todas) e o de Subcategoria RH quando `recursos_humanos`. A API já exclui `categoria_pendente` do filtro nomeado (`contas.py`). O modo mês consome a mesma `contasFiltradas`.

**Rationale**: FR-006–FR-008 e User Story 2; o pedido do usuário é garantir o recorte (ex.: RH) junto do agrupamento novo, não um segundo filtro.

**Alternatives considered**:
- Multiselect de categorias — rejeitado (não está na spec).
- Filtro só no cliente sem query na API — rejeitado (já funciona no servidor; manter).

## 6. Ordenação das linhas dentro do grupo

**Decision**: Reusar `ordenar(items)` já existente na página (clique nas colunas). A ordem **dos grupos** no modo mês é independente (mês desc); no modo categoria permanece a ordem atual das chaves.

**Rationale**: Clarify adiou isso ao plano; menor mudança.

**Alternatives considered**: Forçar vencimento crescente dentro do mês — rejeitado nesta entrega (surpresa vs. sort atual).

## 7. Troca de filtros vs. grupos abertos

**Decision**: Trocar categoria/status/datas **não** reseta o modo (FR-010). Se as chaves visíveis mudarem, remover chaves abertas que sumiram; se nenhuma chave aberta restar entre as visíveis, abrir o mês mais recente datado (ou o único grupo).

**Rationale**: Evita tela só com grupos fechados após um filtro que elimina o mês que estava aberto.

**Alternatives considered**: Sempre resetar colapso a cada tecla na busca — rejeitado (incômodo). Reset só ao mudar o modo para mês — insuficiente se o filtro esvaziar o mês aberto.
