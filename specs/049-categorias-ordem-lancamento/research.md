# Research: 049-categorias-ordem-lancamento

**Date**: 2026-09-06  
**Spec**: [spec.md](./spec.md)

## R-001 — Rename Comissões → Bônus & Comissão

**Decision**: Alterar apenas o **rótulo** em `SUBCATEGORIAS_RH[SUB_BONUS]` de `"Comissões"` para `"Bônus & Comissão"`. Manter código `bonus`. Atualizar aliases de import (`comissões`, `bônus & comissão`, etc.). **Não** alterar `LABELS_LEGADO["bonus"]` (“Comissões (legado)”). Manter `SUB_COMISSAO` / rótulo **Comissão**.

**Rationale**: Contas já usam `subcategoria=bonus`; só o display muda. Spec confirmou coexistência com **Comissão**.

**Alternatives considered**:
- Migrar código `bonus` → outro: desnecessário e arriscado
- Unificar com `comissao`: rejeitado no clarify

## R-002 — CRUD de categorias cadastradas (1º nível)

**Decision**: Estender endpoints em `/api/contas/categorias`: `PATCH /{id}` e `DELETE /{id}` só para linhas de `categorias_pagar_cadastradas`. Oficiais em `CATEGORIAS` permanecem imutáveis. Antes de DELETE, contar `ContaPagar` com `categoria == codigo` e `categoria_pendente == false`; se &gt; 0 → 409/422 com mensagem clara. PATCH revalida nome (unicidade case-insensitive, máx. 20, charset atual). Admin only; auditoria como no POST.

**Rationale**: Spec C — só as criadas pelo admin. Já existe POST + tabela.

**Alternatives considered**: Soft delete — spec pede sumir do catálogo; hard delete sem vínculos é suficiente. Reclassificação em massa — fora de escopo.

## R-003 — Persistência e CRUD de subcategorias RH

**Decision**: Nova tabela `subcategorias_rh_cadastradas` (`id`, `codigo` unique, `nome`, `sistema` bool, `criado_em`, `criado_por`), criada via `CREATE TABLE IF NOT EXISTS` em `main.py` (padrão de categorias). Seed das cinco padrão (`salario`, `bonus`, `comissao`, `retirada_socios`, `beneficios`) com `sistema=true` e rótulos atualizados (bonus = Bônus & Comissão). `listar_catalogo` lê a tabela (fallback para dict se vazia).  
- POST: cria `sistema=false`, gera `codigo` estável (`sub_{id}` ou slug validado).  
- PATCH `/{id|codigo}`: permite alterar **nome** de qualquer linha (sistema ou não).  
- DELETE: só `sistema=false`; bloquear se houver contas com `subcategoria` igual; bloquear se `sistema=true`.  
Validação de classificação RH passa a aceitar códigos presentes na tabela (não só o dict estático). Dict `SUBCATEGORIAS_RH` permanece como seed/defaults e referência de códigos de fábrica.

**Rationale**: Spec exige editar qualquer nome e excluir só as do admin; constantes sozinhas não persistem edits.

**Alternatives considered**:
- Só overrides de rótulo + tabela só custom: mais duas fontes de verdade  
- Tela/modal dedicado: rejeitado no clarify (gestão no formulário)

## R-004 — UX no formulário de Contas a Pagar

**Decision**: Junto ao seletor de categoria: ações editar/excluir visíveis só para itens de `cadastradas` (e admin). Junto ao seletor de subcategoria RH (quando categoria = RH): adicionar (já implícito no pedido), editar qualquer, excluir só se `sistema === false`. Confirmação `window.confirm` / padrão do produto; toasts de erro/sucesso. Visualizador não vê ações de mutação.

**Rationale**: Clarify opção A; espelha o fluxo atual de “nova categoria”.

**Alternatives considered**: Tela de gestão — fora de escopo.

## R-005 — Ordenação por ordem de lançamento

**Decision**: Critério = campo `criado_em` (timestamp de inclusão).  
- **Contas a Pagar**: estender sort existente com campo `criado_em`; tipar e consumir `criado_em` já retornado pela API.  
- **Contas a Receber (NFs)**: idem no sort da tabela.  
- **Fluxo de Caixa**: incluir `criado_em` em `MovimentoFluxo` ao mapear NF / ContaPagar / movimento manual; coluna ou cabeçalho “Lançamento” ordenável; desempate por `id`.  
Não alterar filtros existentes; ordenação aplica-se ao conjunto filtrado.

**Rationale**: Clarify = ordenar, não filtrar. `criado_em` já existe nos modelos.

**Alternatives considered**: Ordenar por data de vencimento/pagamento — já existe; ordem de lançamento é inclusão. Filtro por intervalo de criação — fora de escopo.

## R-006 — Limite de tamanho do nome

**Decision**: Manter limite de **20 caracteres** (validação atual e coluna `nome`). O rótulo **Bônus & Comissão** tem 16 caracteres e cabe. Edições futuras respeitam o mesmo teto.

**Rationale**: Consistência com produto; evita migration de coluna nesta entrega.

**Alternatives considered**: Ampliar para 40 — só se o negócio passar a pedir nomes longos; não necessário agora.

## R-007 — Exposição de `criado_em` no frontend

**Decision**: Adicionar `criado_em?: string` em `ContaPagar`, `NF` (e origem dos manuais do fluxo) e em `MovimentoFluxo`. Garantir que listagens já serializam o campo (schemas backend já incluem em ContaPagar/NF/FluxoMovimento).

**Rationale**: Tipos atuais omitem o campo; sort no cliente precisa dele.

## Open questions for implementation (não bloqueiam plano)

- Detalhe visual exato dos botões editar/excluir no select (ícones vs. itens “Gerenciar…”) — seguir menor mudança alinhada ao UI existente de “nova categoria”.
- Se listagem de NFs/contas já envia `criado_em` em todos os endpoints usados pelo Fluxo — verificar na implementação e enriquecer se algum DTO omitir.
