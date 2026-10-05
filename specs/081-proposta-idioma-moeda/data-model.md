# Data Model: Proposta em Português ou Inglês conforme a Moeda

## 1. `propostas` (alteração)

| Coluna | Tipo | Nulo | Regra |
|---|---|---|---|
| `moeda` | `VARCHAR(3)` | sim | `NULL` nas propostas simples; `'BRL'` ou `'USD'` nas propostas por modelo. Definida na criação e nunca alterada. |

**Constraint nova** `ck_propostas_moeda`:

```sql
(modelo = 'simples' AND moeda IS NULL)
OR (modelo <> 'simples' AND moeda IN ('BRL', 'USD'))
```

**Migração** (`_migrar()`, bloco "Proposal (feature 081)", idempotente):

1. `ALTER TABLE propostas ADD COLUMN IF NOT EXISTS moeda VARCHAR(3)`
2. `UPDATE propostas SET moeda = 'BRL' WHERE modelo <> 'simples' AND moeda IS NULL`
3. `ck_propostas_moeda` criada via `DO $$ ... IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_propostas_moeda' AND conrelid = 'propostas'::regclass) ... $$`

Sem tabela nova; o script de RLS do Supabase não muda.

**ORM** (`Proposta`): `moeda = Column(String(3), nullable=True)` e `CheckConstraint(CK_PROPOSTAS_MOEDA, name="ck_propostas_moeda")` em `__table_args__`.

## 2. Idioma (derivado)

| Moeda | Idioma da página do cliente | Prefixo de valor |
|---|---|---|
| `BRL` | `pt-BR` | `R$` |
| `USD` | `en-US` | `US$` |

Não é persistido. Propostas simples não têm idioma (página atual em português).

## 3. Regras de validação

| Situação | Regra | Resposta |
|---|---|---|
| `POST` por modelo sem `moeda` (ausente, `null` ou `""`) | assume `BRL` | — |
| `POST` com `moeda` fora de `BRL`/`USD` (após `strip().upper()`) | recusa | `422 "Moeda inválida"` |
| `PUT` de proposta por modelo com `moeda` preenchida e diferente da atual | recusa | `422 "A moeda da proposta não pode ser alterada"` |
| `PUT` com `moeda` vazia ou igual à atual | ignora | — |
| `PUT` de proposta simples | `moeda` ignorada | — |

As demais regras da 080 (taxa, entrada, garantia, datas, consultor) não mudam. A taxa em valor é interpretada na moeda da proposta; os limites numéricos são os mesmos.

## 4. Conteúdo canônico (hash)

Propostas por modelo: o JSON canônico da 080 recebe a chave `"moeda"` **somente se** `moeda != 'BRL'`. Ausência da chave significa `BRL`. Propostas simples: formato congelado, sem mudança. (research R4)

## 5. Histórico de edições

A moeda não é editável, então nunca aparece em `alteracoes`.

## 6. Dicionário de textos (frontend)

`TextosES` (em `executive-search/v1/i18n/tipos.ts`) agrupa os textos fixos do modelo. Os dois dicionários (`pt-BR`, `en-US`) MUST ter exatamente as mesmas chaves (garantido pelo tipo). Grupos:

| Grupo | Conteúdo |
|---|---|
| `pagina` | título da aba, `lang`, rótulo da navegação |
| `capa` | "Proposta/Comercial", "Preparada para", "Data", "Consultor", "Atualizada em {data}", alt da logo |
| `nav` | rótulos das 5 âncoras |
| `servico` | título e parágrafo |
| `metodologia` | título e os 6 passos (título + itens) |
| `investimento` | título, "Taxa", "Forma de pagamento", rótulos dos tipos, frases de pagamento, observações |
| `garantias` | título, Shortlist, SLA, Garantia (singular/plural), observações |
| `proximos` | título, parágrafo, "válida até {data}", "aceita em {data} às {hora} por {nome}", botões |
| `contato` | "Telefone", "E-mail", "LinkedIn", "Site" |
| `rodape` | "Ocean Talent Solutions · Proposta comercial · {data}" |
| `aceite` | título, texto, rótulos, declaração, botões, validações, sucesso, erro, versão atualizada |
| `pdf` | nome do arquivo |
| `whatsapp` | mensagem pronta |

O grupo `indisponivel` (título da moldura, mensagens de cancelada e expirada, "carregando") fica fora de `TextosES`, em `i18n/indisponivel.ts` (`textosIndisponivel(idioma)`, também tipado para os dois idiomas): a `PropostaPublica` usa esses textos antes de carregar o chunk do modelo, e importá-los junto dos dicionários puxaria tudo para o chunk principal do Proposal.

Os textos completos estão em [contracts/textos-executive-search.md](./contracts/textos-executive-search.md).
