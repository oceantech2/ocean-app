# Research: 062-pagar-categorias-bonus

**Date**: 2026-09-14  
**Spec**: [spec.md](./spec.md)

## R-001 — Rename Comissões / Bônus & Comissão → Bônus

**Decision**: Alterar só o **rótulo** da subcategoria de código `bonus`. Constante `SUBCATEGORIAS_RH[SUB_BONUS]` passa de `"Bônus & Comissão"` para `"Bônus"`. Contas continuam com `subcategoria=bonus`. **Não** alterar `LABELS_LEGADO["bonus"]` (“Comissões (legado)”). **Não** alterar `SUB_COMISSAO` / rótulo **Comissão**. **Não** alterar Dashboard, Impostos, Retiradas nem a página Comissões.

No seed `seed_subcategorias_rh`: se a linha `sistema=true` e `codigo=bonus` tiver nome **Comissões** ou **Bônus & Comissão**, atualizar para **Bônus**. Se o admin já tiver editado para outro nome, **não** sobrescrever.

A página Contas a Pagar lê o catálogo (`GET /api/contas/categorias`); listagem, filtro e exportação usam `nome` do catálogo (já via `nomeCategoriaCatalogo` em `Contas.tsx`).

**Rationale**: Clarify Q1 — alcance só na página Contas a Pagar. Código estável evita migração de contas.

**Alternatives considered**:
- Migrar código `bonus` → outro: desnecessário e arriscado
- Unificar com `comissao`: rejeitado (spec)
- Atualizar Dashboard nesta entrega: fora de escopo (clarify Q1)

## R-002 — CRUD de categorias cadastradas (já implementado)

**Decision**: Manter endpoints atuais `PATCH` / `DELETE /api/contas/categorias/{id}` só para `categorias_pagar_cadastradas`. Oficiais imutáveis. DELETE com contas vinculadas → erro de negócio. UI já mostra Editar/Excluir só para `cadastradas`. **Gap a conferir**: após DELETE bem-sucedido, o formulário já volta para `adm_financeiro` (`Contas.tsx`) — alinhar ao clarify Q4; não reimplementar se o comportamento já bater.

**Rationale**: Clarify Q2; 049 já entregou a fatia.

**Alternatives considered**: Soft delete — spec pede sumir do catálogo. Tela dedicada — fora de escopo.

## R-003 — CRUD de subcategorias RH (já implementado)

**Decision**: Manter `POST/PATCH/DELETE /api/contas/categorias/subcategorias-rh`. PATCH de nome em qualquer linha; DELETE só `sistema=false` sem vínculos. UI: adicionar; editar qualquer; excluir só se `sistema === false`. **Gap a conferir**: após DELETE da sub selecionada, o campo já fica `''` — alinhar ao Q4.

**Rationale**: Clarify Q3; 049 já entregou a fatia.

**Alternatives considered**: Reescrever persistência — rejeitado (simplicidade).

## R-004 — Reset do formulário após exclusão

**Decision**: Sem mudança de contrato REST. Comportamento de UI:
- Categoria cadastrada excluída (selecionada): `categoria` → `adm_financeiro`, `subcategoria` → `''`; modal permanece aberto.
- Subcategoria RH custom excluída (selecionada): `subcategoria` → `''`; `recursos_humanos` permanece; salvar continua exigindo sub.

Se o código atual já faz isso, a tarefa é só validar no quickstart.

**Rationale**: Clarify Q4.

**Alternatives considered**: Fechar o formulário — rejeitado no clarify. Campos vazios sem default de categoria — rejeitado.

## R-005 — Importação: aliases da mesma subcategoria

**Decision**: Ampliar `_IMPORT_SUB_ALIASES` com **bônus** / **bonus** (nome) além dos já existentes (`comissões`, `comissoes`, `bônus & comissão`, etc.). `resolver_import_subcategoria` já consulta nome no banco.

`validar_classificacao` (RH): se o valor normalizado não for um código válido, tentar `resolver_import_subcategoria` antes de recusar. Isso cobre:
- `POST /api/contas/` usado pelo CSV da página
- `POST /api/contas/importar-xlsx`

No CSV de `Contas.tsx`, resolver a subcategoria contra o catálogo (código ou nome, case-insensitive) **e** os aliases da spec, enviando o **código** (`bonus`) na API.

Após gravar, a listagem mostra **Bônus** (rótulo do catálogo), não o texto da planilha.

**Rationale**: Clarify Q5. Hoje o CSV manda o texto em minúsculas (`bônus`, `comissões`), que **não** bate com o código `bonus` e falha na validação.

**Alternatives considered**:
- Aceitar só o código `bonus` na importação — quebra planilhas (rejeitado)
- Só corrigir o frontend — o XLSX ainda passaria o nome cru para `validar_classificacao`

## R-006 — Charset do nome e mensagem de erro

**Decision**: Manter charset atual (letras, números, espaço, hífen, barra e `&`) — **Bônus** cabe em 20 caracteres sem `&`. Atualizar a mensagem de `validar_classificacao` que ainda cita “bônus & comissão” para citar **bônus**.

**Rationale**: Não reverter 049; o `&` continua válido para nomes custom.

**Alternatives considered**: Remover `&` do charset — quebraria nomes já gravados com `&`.

## Open questions for implementation (não bloqueiam plano)

- Ordem das subcategorias no seletor após o rename (hoje: sistema primeiro, depois alfabética pelo nome) — manter.
- Se `seed_subcategorias_rh` já roda no startup (`main.py`) — confirmar na implementação; se não, garantir uma chamada para ambientes já seedados com o rótulo antigo.
