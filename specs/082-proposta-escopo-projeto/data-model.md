# Data Model: Escopo do Projeto e Título da Divisão (082)

Só as diferenças em relação a [081/data-model.md](../081-proposta-idioma-moeda/data-model.md) e [080/data-model.md](../080-proposta-modelo-executive-search/data-model.md).

## 1. Tabela `propostas`

| Coluna | Tipo | Nulo | Regra |
|---|---|---|---|
| `projeto_escopo` | `TEXT` | sim | HTML canônico (§2), gravado só depois de `normalizar_escopo`. `NULL` = sem escopo. Sempre `NULL` nas propostas simples. |
| `modelo_versao` (existente) | `INTEGER` | — | Passa a ser `2` em toda proposta Executive Search criada ou editada a partir desta feature. As assinadas na v1 continuam `1`. |

Constraint nova:

```sql
CONSTRAINT ck_propostas_escopo CHECK (projeto_escopo IS NULL OR modelo <> 'simples')
```

Migração em `_migrar()`, bloco "Proposal (feature 082)", idempotente:

1. `ALTER TABLE propostas ADD COLUMN IF NOT EXISTS projeto_escopo TEXT`.
2. Criar `ck_propostas_escopo` se não existir (mesmo padrão `DO $$ … pg_constraint … $$` da 080).
3. Pendentes v1 → v2 (research R6): com `SessionLocal`, selecionar com `FOR UPDATE` as propostas `modelo <> 'simples' AND modelo_versao = 1 AND status IN ('aguardando','visualizada')`. Em cada uma: `modelo_versao = 2` e `conteudo_hash = calcular_hash(p)`. Sem alterar `versao`, `atualizada_em` nem `status`, e sem registro em `propostas_edicoes`. Fazer commit no fim; em caso de erro, rollback e registrar no log, sem impedir o boot.

## 2. Escopo do Projeto: HTML canônico

### 2.1 Gramática

```text
escopo   := bloco+
bloco    := "<p>" inline "</p>" | lista1
lista1   := "<ol>" item1+ "</ol>" | "<ul>" item1+ "</ul>"
item1    := "<li>" inline lista2? "</li>"      (inline pode ser vazio só se houver lista2)
lista2   := "<ol>" item2+ "</ol>" | "<ul>" item2+ "</ul>"
item2    := "<li>" inline "</li>"
inline   := ( texto | "<strong>" texto "</strong>" | "<br>" )*
texto    := caracteres com & < > escapados (html.escape, quote=False)
```

- Sem atributos em nenhuma tag, sem espaços entre tags e sem `<strong>` aninhado nem vazio.
- `texto` sem sequências de espaços e sem espaço no início ou no fim de cada bloco ou item.

### 2.2 Regras de `normalizar_escopo(entrada) -> Optional[str]`

| # | Regra | Origem |
|---|---|---|
| 1 | `None`, `""` ou só espaços → `None`. | FR-006 |
| 2 | Entrada com mais de 100.000 caracteres → `422 "Escopo do projeto deve ter no máximo 5.000 caracteres"`. | FR-005 |
| 3 | Tags permitidas: `p`, `ol`, `ul`, `li`, `strong`, `br`; `b` → `strong`. Outras tags são removidas e o texto delas é mantido; `script`, `style`, `template`, `iframe`, `object`, `noscript`, `textarea` são removidas com o conteúdo. Atributos são sempre descartados. | FR-002, FR-004, FR-009 |
| 4 | `<p>` dentro de `<li>` é desembrulhado; vários parágrafos no mesmo item viram linhas separadas por `<br>`. | R3.2 |
| 5 | Texto ou `<strong>` no topo, fora de bloco → envolvido em `<p>`. `<li>` fora de lista → tratado como parágrafo. | R3.3 |
| 6 | Itens a partir do 3º nível sobem para a lista do 2º nível, logo depois do item pai, na ordem. | Edge case "Listas em mais de dois níveis" |
| 7 | Espaços em sequência (inclusive quebras de linha do código-fonte) viram um espaço; as bordas dos blocos são aparadas. | R3.5 |
| 8 | Blocos, itens, listas e `<strong>` sem texto são removidos; `<br>` no início ou no fim de um bloco é removido. Se nada sobrar → `None`. | FR-006 |
| 9 | Caracteres de texto (soma dos trechos de texto normalizados, sem marcação; `<br>` conta 0) > 5.000 → `422 "Escopo do projeto deve ter no máximo 5.000 caracteres"`. | FR-005, R8 |

### 2.3 Casos de verificação

| Entrada | Saída |
|---|---|
| `""` / `"   "` / `"<p> </p><ul><li></li></ul>"` | `None` |
| Exemplo do modelo (`data-example-html` do HTML novo) | Idêntico ao exemplo (já está no formato canônico) |
| `<ol><li><p>Item</p><ul><li><p><strong>A:</strong> x</p></li></ul></li></ol>` (saída do TipTap) | `<ol><li>Item<ul><li><strong>A:</strong> x</li></ul></li></ol>` |
| `<p style="color:red" onclick="x()">Oi <b>já</b></p>` | `<p>Oi <strong>já</strong></p>` |
| `<p>a<script>alert(1)</script>b</p>` | `<p>ab</p>` |
| `<p>&lt;img src=x&gt; "D'Ave" &amp; Cia</p>` | `<p>&lt;img src=x&gt; "D'Ave" &amp; Cia</p>` (texto literal) |
| `<h1>Título</h1><table><tr><td>c</td></tr></table>` | `<p>Título</p><p>c</p>` |
| `<ul><li>1<ul><li>2<ul><li>3</li></ul></li></ul></li></ul>` | `<ul><li>1<ul><li>2</li><li>3</li></ul></li></ul>` |
| `Texto solto` | `<p>Texto solto</p>` |
| 5.001 caracteres de texto | `422` |

> O texto é escapado com `html.escape(texto, quote=False)`: só `&`, `<` e `>` viram entidades; aspas e apóstrofos ficam literais, como o editor gera (não há atributos na saída).

## 3. Conteúdo canônico (hash) — `conteudo_canonico`

Para propostas por modelo, a chave nova entra só quando houver escopo:

```python
if p.projeto_escopo:
    dados["projeto_escopo"] = p.projeto_escopo
```

- Hashes gravados antes da feature continuam válidos: sem escopo não há chave nova, e as assinadas na v1 mantêm `modelo_versao: 1`.
- `modelo_versao: 2` passa a ser a prova de que a página aceita tinha o título "Executive Search" e a seção opcional (FR-018, FR-019).

## 4. Histórico de edições

- `CAMPOS_MODELO` ganha `projeto_escopo`; `_canonico` devolve a string como está.
- O item do histórico fica `{"campo": "projeto_escopo", "anterior": "<p>…</p>" | null, "novo": "<p>…</p>" | null}`.
- O detalhe exibe o rótulo "Escopo do Projeto" e os valores convertidos em texto legível (`escopoParaTexto`, ver [ui-proposal.md](./contracts/ui-proposal.md)).

## 5. Versões do modelo Executive Search

| Versão | Primeira seção / 1º link do menu | Seção Escopo do Projeto | Quem usa |
|---|---|---|---|
| 1 | "Serviço" / "Service" | nunca | Propostas assinadas, canceladas ou já existentes que não migraram (só não pendentes) |
| 2 | "Executive Search" (pt e en) | se `projeto_escopo` não for nulo | Propostas novas, editadas e pendentes migradas |

- Backend: `MODELOS["executive-search"]["versao_atual"] = 2`.
- Frontend: `MODELOS['executive-search'].versoes = {1: <mesmo módulo>, 2: <mesmo módulo>}`.
- `versoes.ts`: `RECURSOS = {1: {tituloDivisao: false, escopo: false}, 2: {tituloDivisao: true, escopo: true}}`.

## 6. Tipos no frontend (`proposalApi.ts`)

- `Proposta.projeto_escopo: string | null`
- `PropostaModeloPayload.projeto_escopo: string | null`
- `PropostaPublicaData.projeto_escopo?: string | null`
- `FormModelo.projeto_escopo: string` (HTML do editor; `''` quando vazio)
