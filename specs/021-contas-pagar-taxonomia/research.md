# Research: Contas a Pagar — Taxonomia de Categorias

**Feature**: `021-contas-pagar-taxonomia` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md)

## 1. Código `beneficios` em dois papéis

**Decision**: Manter o slug `beneficios`. No campo `categoria` significa a categoria nova; no campo `subcategoria` (com `categoria=recursos_humanos`) significa o **legado**. Nunca persistir `categoria=beneficios` com subcategoria preenchida.

**Rationale**: Evita migration e rename em massa. O par `(categoria, subcategoria)` já desambigua. CREATE/import só aceitam `categoria=beneficios` e `subcategoria=null`.

**Alternatives considered**:

- Slug `beneficios_cat` vs `beneficios` — rejeitado (rótulos e donut mais simples com um código).
- Migrar sub→categoria automaticamente — rejeitado no clarify (Q1 = B).

## 2. Sem migração de dados

**Decision**: Nenhum `UPDATE` em `contas_pagar` para promover RH / Benefícios. Nenhum `ALTER`. Não setar `categoria_pendente` nesse par.

**Rationale**: Clarify Q1/Q2. Histórico permanece operacional e visível como RH / Benefícios.

**Alternatives considered**: Job one-shot no startup (padrão 008) — rejeitado.

## 3. Validação CREATE vs PUT do par legado

**Decision**:

- `POST` / import: `validar_classificacao` **rejeita** `recursos_humanos` + `beneficios`.
- `PUT` **sem** mudança de classificação (payload igual ao persistido, inclusive o par legado): **aceitar**, sem exigir o catálogo novo.
- `PUT` que **altera** categoria/sub: validar só o catálogo oficial (8 categorias; RH com 4 subs). Troca para Benefícios de primeiro nível: `categoria=beneficios`, `subcategoria=null`.

**Rationale**: A UI de edição reenvia o formulário completo. Sem essa exceção, salvar só o valor em conta legado retornaria 422.

**Alternatives considered**:

- Frontend omitir categoria no PUT se inalterada — frágil (fácil reenviar o par e quebrar).
- Marcar legado como pendente para reusar o fluxo 008 — rejeitado no clarify (Q2 = A).

## 4. Catálogo e labels

**Decision**:

| Catálogo | Conteúdo |
|----------|----------|
| `CATEGORIAS` (ordem) | adm_financeiro, operacoes, marketing, comercial, recursos_humanos, **beneficios**, tecnologia, impostos |
| `SUBCATEGORIAS_RH` | salario, bonus, comissao, retirada_socios (**sem** beneficios) |
| Labels legado (exibição) | `recursos_humanos` + `beneficios` → "Recursos Humanos / Benefícios" via mapa de sub legado, **não** via `categoria_pendente` |

Import aliases de categoria incluem "benefícios" / "beneficios" / `beneficios` → categoria `beneficios`. Aliases de **sub** RH **não** incluem Benefícios (senão a importação aceitaria o par antigo).

`inferir_de_descricao`: termos de benefício (vr, vt, plano de saúde, etc.) → `(beneficios, None)`, não mais RH + sub.

**Rationale**: Uma fonte (`categorias_contas.py`) para API, import e labels do donut (`label_categoria`).

## 5. Filtros e agregação

**Decision**: Sem mudança de query em Impostos, Retiradas ou `custo-por-categoria`.

- `GET /api/contas?categoria=recursos_humanos` já inclui qualquer sub, logo o legado.
- `?categoria=recursos_humanos&subcategoria=salario` exclui o legado.
- `?categoria=beneficios` só linhas com `categoria=beneficios` (não o par RH).
- Donut: `GROUP BY categoria` — legado soma em `recursos_humanos`; contas novas/reclassificadas em `beneficios`. Dashboard: acrescentar label e cor de `beneficios`; fatia só aparece se valor > 0 (comportamento atual).

**Rationale**: Clarify e FR-008; simplicidade (constitution V).

## 6. Importação

**Decision**: Rejeitar linha com RH + Benefícios (código ou label). Aceitar Benefícios só como categoria. Não converter e não gravar legado. Exportação de legado pode ainda trazer o par antigo; reimportar falha até o arquivo usar a taxonomia nova (clarify Q3 = A).

**Rationale**: Um único caminho válido para dados novos.

## 7. UI Contas

**Decision**: `CATEGORIAS_OPCOES` com 8 itens na ordem da spec. `SUB_RH_OPCOES` com 4. Na edição de legado, o select de sub mostra o valor atual Benefícios **somente nessa conta** (não nas opções de novo lançamento). Trocar Categorias para Benefícios limpa a sub. Sem badge de pendência para esse par. Filtro de sub RH: só as 4 oficiais.

**Rationale**: Clarify Q2; FR-003/FR-007.
