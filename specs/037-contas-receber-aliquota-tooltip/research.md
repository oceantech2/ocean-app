# Research: Contas a Receber — Alíquota do Mês no Tooltip de Imposto

**Feature**: `037-contas-receber-aliquota-tooltip` | **Date**: 2026-08-18  
**Spec**: [spec.md](./spec.md)

## 1. Superfície no código

**Decision**: Implementar só em `frontend/src/pages/NFs.tsx` (rota `/nfs`, menu “Contas a Receber”). `/contas-receber` já redireciona para `/nfs`.

**Rationale**: Mesma decisão da 033/036: Receber e NFs são uma tela. A spec fechou o tooltip na coluna Imposto dessa tabela.

**Alternatives considered**: Página Impostos — rejeitada na clarify (opção A). Duplicar tela — viola constituição V.

## 2. Fonte do percentual efetivo

**Decision**: Reusar `GET /api/impostos/de-contas?ano=` (`impostosService.deContas`). Campo `percentual_imposto` por mês. Disponível se e somente se `percentual_imposto > 0` (mesmo critério de `Impostos.tsx`: senão “—”).

**Rationale**: Clarify A — o mesmo “% Imposto” do acompanhamento mensal. O endpoint já faz impostos (contas a pagar, categoria Impostos, vencimento no mês) ÷ faturamento líquido de NFs pagas (emissão no mês).

**Alternatives considered**: Tabela `impostos.percentual_imposto` cadastrado — rejeitado na clarify. Calcular imposto da linha ÷ bruto — rejeitado. Novo campo em cada NF — duplicaria a fonte e inflaria o payload.

## 3. Onde calcular vs onde exibir

**Decision**: Cálculo permanece no backend existente. O frontend só **consulta e associa** por chave `ano-mes`. Não copiar a fórmula SQL para o cliente.

**Rationale**: Uma única fonte evita divergência com a página Impostos (SC-003 / FR-002).

**Alternatives considered**: Recalcular no browser com lista de pagar + NFs — duas fontes e mais requests. Incluir `percentual_imposto_mes` em `NFResponse` — muda contrato de listagem sem necessidade.

## 4. Competência do lançamento

**Decision**: Mês/ano = `data_emissao`; se vazia, `data_vencimento`; se ambas vazias, competência indeterminada → mensagem de indisponível (FR-004 / FR-006).

**Rationale**: Spec explícita; faturamento de `de-contas` já usa emissão das NFs pagas. O filtro da lista de NFs usa coalesce emissão / data_ent_pgto / criado_em — **não** reutilizar essa expressão no tooltip, senão o percentual poderia ser de outro mês que o da spec.

**Alternatives considered**: Usar `_expr_data_ref()` da listagem — mais consistente com o filtro, mas contradiz FR-004. Data de pagamento — não pedido.

## 5. Anos a carregar

**Decision**: Ao carregar a lista, buscar `de-contas` para cada **ano de competência distinto** presente nas NFs da página (emissão ou vencimento), em paralelo com `nfsService.listar`. Se a lista estiver vazia, buscar só `nfsAno` quando o filtro de ano existir (mapa vazio ainda assim).

**Rationale**: Filtro “sem NF” ou lista sem mês pode misturar anos. Um GET por ano (12 linhas) atende SC-002.

**Alternatives considered**: Só `nfsAno` — falha quando a competência da linha é outro ano. Buscar todos os anos do seletor — desnecessário.

## 6. Mecânica do tooltip (UX)

**Decision**: Na célula Imposto, um controle focável (`tabIndex={0}`) com `title` (hover nativo) e `aria-label` com o **mesmo texto**. Texto disponível: `Alíquota do mês (MMM/AAAA): X,XX%` (pt-BR, até 2 casas). Indisponível: `Alíquota do mês indisponível`. Célula continua mostrando o valor em reais ou “—”.

**Rationale**: A tabela já usa `title`. Teclado e leitor de tela exigem foco + `aria-label` (spec). Sem biblioteca nova (constituição V).

**Alternatives considered**: Tooltip customizado (portal/CSS) — mais código para o mesmo conteúdo. Só `title` — falha no teclado.

## 7. Falha ao carregar de-contas

**Decision**: Se `de-contas` falhar, tratar todos os percentuais como indisponíveis (mensagem explícita). Não toast obrigatório (a lista de NFs já pode ter carregado); opcional um toast discreto só se a lista de NFs também não cobrir o erro.

**Rationale**: FR-006 proíbe inventar percentual. Não bloquear a tabela de receber.

**Alternatives considered**: Esconder a coluna Imposto — fora de escopo. Retry agressivo — desnecessário nesta entrega.

## 8. Escopo negativo (não fazer)

**Decision**: Não alterar `Impostos.tsx`, Dashboard, Contas a Pagar, export CSV/Excel, nem o modal de edição do campo Imposto.

**Rationale**: FR-008 e constituição V.
