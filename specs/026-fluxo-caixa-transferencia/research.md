# Research: Fluxo de Caixa — Transferência entre Caixas

**Feature**: `026-fluxo-caixa-transferencia` | **Date**: 2026-08-13

## 1. Como persistir o par (dois lados, uma operação)

**Decision**: Reusar `fluxo_movimentos`. Cada transferência grava **duas** linhas na mesma transação SQL: origem `tipo=despesa` + destino `tipo=receita`, mesmo `valor` e `data_movimento`, `conta` distintas, **`par_id` UUID compartilhado**. Sem tabela `fluxo_transferencias`.

**Rationale**: A lista já consome manuais dessa tabela (025). Um UUID liga criação e desfazimento (FR-011/FR-015) sem JOIN novo. Default `par_id` nulo preserva receita/despesa legadas.

**Alternatives considered**: Tabela só de transferências (duplica listagem). Dois POST avulsos no cliente (quebra FR-011 se o segundo falhar). Campo JSON no único registro (não aparece nos dois fluxos exclusivos).

## 2. Contrato de escrita vs POST de receita/despesa

**Decision**: Novo **POST `/api/fluxo-transferencias`** (admin) cria o par. Novo **DELETE `/api/fluxo-transferencias/{par_id}`** apaga as duas linhas. A tela **não** chama mais POST `/fluxo-movimentos` nem POST/PUT/DELETE de saldos. GET `/fluxo-movimentos` permanece para listar (inclui pernas com `par_id`). DELETE `/fluxo-movimentos/{id}`: se a linha tiver `par_id`, **400** (obrigar desfazer o par); legado sem `par_id` continua apagável (manuais antigos).

**Rationale**: Impede transferência pela metade e impede “Incluir receita” disfarçado na UI. Manuais legados continuam consultáveis e, se o admin remover um avulso antigo, não quebra um par.

**Alternatives considered**: Só dois POST existentes (rejeitado). Soft-delete (o produto já usa DELETE físico em manuais).

## 3. Onde validar o teto (saldo visível da origem)

**Decision**: **Cliente**. A mesma função do card (`saldoVisivel`) é o teto do formulário. API valida: contas `corrente`|`investimento` distintas, valor &gt; 0, data válida, admin. **Não** reimplementar espelho CR/CP no backend nesta feature.

**Rationale**: 024/025 já montam movimentos no cliente. Duplicar NFs+contas+saldos no servidor seria endpoint unificado de caixa — recusado na 024. App interno; só admin chama o POST.

**Alternatives considered**: GET `/saldo-visivel` no servidor (correto, mas escopo extra). Teto só com `saldos`+manuais (erra o FR-020: ignora CR/CP).

## 4. Fórmula do saldo visível

**Decision**:

```text
último = saldo histórico da conta com maior (ano, mes, data_registro)
se não houver último: base = 0; movimentos = todos daquela conta (CR roteados, CP se corrente, manuais/transferências)
se houver último: base = último.saldo; movimentos = os da conta com data > data_registro
saldo visível = base + soma(valores sinalizados: entrada +, saída −)
```

Card e teto usam essa fórmula **independente** do filtro mês/ano da lista. A lista/totais/CSV continuam recortados pelo período + fluxo ativo.

**Rationale**: Clarify Q1+Q4. Snapshot mensal deixa de ser o número do card; vira ponto de partida. Filtro da lista não pode mascarar o teto.

**Alternatives considered**: Card = só o último da tabela (contradiz B). Card = só o mês filtrado (teto errado se o snapshot for de outro mês).

## 5. Texto de/para e coluna Origem

**Decision**: Servidor grava `descricao` canônica se o admin não mandar texto extra: origem `Transferência para Conta investimento`; destino `Transferência de Conta corrente` (rótulos da 025). Se houver observação, anexar após ` — `. Cliente: `origem_rotulo = 'Transferência'` quando `par_id` preenchido; senão `Manual`. Sem coluna extra.

**Rationale**: Clarify Q5 + FR-010/FR-021. Persistido, exportação CSV herda a descrição.

**Alternatives considered**: Só inferir de/para no cliente (some no CSV se a fórmula divergir). Coluna extra (fora do pedido).

## 6. Superfície da tela: o que some

**Decision**: Remover da UI (todos os papéis / admin): botões Incluir receita, Incluir despesa, Registrar saldo; **Importar CSV**; ações Editar/Deletar na tabela de saldos; modal de saldo e `ImportCSV` nesta página. Tabela de saldos e gráfico de snapshots **permanecem consulta**. Botão **Transferência** só admin. Desfazer: confirm, chama DELETE do `par_id` (não o `id` de um lado). Manuais legados: **Remover** continua (um id, sem par).

**Rationale**: Clarify Q3. CSV/edição brigariam com o card calculado. Constituição IV: confirm em exclusão.

**Alternatives considered**: Manter CSV (recusado). Esconder a tabela histórica (recusado; C = consulta).

## 7. Carga para calcular o teto da origem (outro fluxo)

**Decision**: Além do GET de manuais do fluxo ativo no período (lista), buscar manuais **por conta sem mês/ano** para as duas contas (ou ao abrir o modal: a origem escolhida). CR/CP continuam as listas já paginadas da 024. Saldos: listar a conta (ano amplo ou sem mês) para achar o último histórico — não só o ano do filtro.

**Rationale**: O teto não pode usar só o mês da tela. Evita GET único sem `conta` vazando mistura desnecessária se já filtramos por conta.

**Alternatives considered**: Recalcular só com o recorte do mês (insuficiente). Novo endpoint agregado (fora).
