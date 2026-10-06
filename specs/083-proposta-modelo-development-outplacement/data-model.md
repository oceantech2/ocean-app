# Data Model: Modelo Development & Outplacement, Vários Projetos e Idioma Independente da Moeda

## 1. Tabela `propostas` (existente) — colunas novas

| Coluna | Tipo | Nulo | Regra |
|---|---|---|---|
| `idioma` | `VARCHAR(5)` | sim | `pt-BR` ou `en-US` nas propostas por modelo; `NULL` nas simples. Fixo após a criação. |
| `projetos` | `JSONB` | sim | Formato novo: lista de 1 a 10 projetos (§2). `NULL` = formato antigo ou proposta simples. |
| `shortlist` | `VARCHAR(255)` | sim | Texto livre opcional; `NULL` quando vazio. Só no formato novo. |
| `sla` | `VARCHAR(255)` | sim | Texto livre opcional; `NULL` quando vazio. Só no formato novo. |
| `garantia_texto` | `VARCHAR(255)` | sim | Texto livre opcional; `NULL` quando vazio. Só no formato novo. |
| `validade_dias` | `SMALLINT` | sim | Formato novo: dias informados (API aceita 1 a 365; migradas podem ter 0 ou mais de 365). `validade = data_proposta + validade_dias` ao salvar. |

Colunas existentes usadas só pelo formato antigo (ES v1/v2): `projeto_nome`, `investimentos`, `garantia_meses` — ficam `NULL` no formato novo.

Colunas existentes sem mudança de significado: `modelo` (+ valor `outplacement-development`), `modelo_versao` (ES passa a 3; D&O começa em 1), `moeda` (só o símbolo), `validade`, `data_proposta`, `projeto_escopo`, consultor, setor, status, versão e hash.

### Constraints

`ck_propostas_campos_modelo` é removida e substituída por:

```text
ck_propostas_campos_modelo_v2:
  (modelo = 'simples' AND cnpj IS NOT NULL AND valor IS NOT NULL AND total IS NOT NULL)
  OR (modelo <> 'simples'
      AND modelo_versao IS NOT NULL AND data_proposta IS NOT NULL AND setor IS NOT NULL
      AND consultor_nome IS NOT NULL AND consultor_cargo IS NOT NULL
      AND consultor_telefone IS NOT NULL AND consultor_email IS NOT NULL
      AND (
        -- formato antigo (ES v1/v2)
        (projetos IS NULL AND projeto_nome IS NOT NULL AND garantia_meses > 0
         AND jsonb_typeof(investimentos) = 'array' AND jsonb_array_length(investimentos) BETWEEN 1 AND 3)
        OR
        -- formato novo
        (jsonb_typeof(projetos) = 'array' AND jsonb_array_length(projetos) BETWEEN 1 AND 10
         AND validade_dias >= 0)
      ))
```

Nova:

```text
ck_propostas_idioma:
  (modelo = 'simples' AND idioma IS NULL) OR (modelo <> 'simples' AND idioma IN ('pt-BR', 'en-US'))
```

Mantidas: `ck_propostas_data_validade`, `ck_propostas_moeda`, `ck_propostas_escopo` e as demais.

## 2. Projeto (item de `propostas.projetos`)

```json
{
  "nome": "Posição 1",
  "investimentos": [
    { "tipo": "retainer", "taxa_tipo": "percentual", "taxa": "15.00", "entrada": 40 },
    { "tipo": "sucesso", "taxa_tipo": "percentual", "taxa": "18.00", "entrada": null },
    { "tipo": "valor-fechado", "taxa_tipo": "valor", "taxa": "50000.00", "entrada": 50 }
  ]
}
```

Regras de validação (API):

| Regra | Mensagem (422) |
|---|---|
| 1 a 10 projetos | "Inclua de 1 a 10 projetos" |
| `nome` obrigatório (após `strip`) | "Informe o nome do projeto {n}" |
| `nome` até 255 caracteres | "Nome do projeto {n} muito longo" |
| 1 a 3 investimentos com tipos distintos por projeto | "Selecione de 1 a 3 modelos de investimento no projeto {n}" / "Tipo de investimento inválido ou repetido no projeto {n}" |
| Taxa e entrada | Regras atuais de `validar_investimentos` (spec 080), com o sufixo " no projeto {n}" |

Os investimentos de cada projeto são gravados na ordem Retainer, Sucesso, Valor fechado (como hoje). Projetos diferentes podem repetir tipos e nomes.

## 3. Garantias e condições

| Campo | Padrão no formulário (pt-BR) | Padrão (en-US) | Validação |
|---|---|---|---|
| `shortlist` | "3 a 5 candidatos" | "3 to 5 candidates" | opcional, até 255; vazio → `NULL` |
| `sla` | "5 a 10 dias úteis" | "5 to 10 business days" | opcional, até 255; vazio → `NULL` |
| `garantia` (coluna `garantia_texto`) | vazio | vazio | opcional, até 255; vazio → `NULL` |

Mensagem de texto longo: "{Shortlist|SLA|Garantia} muito longo(a)" (422).

## 4. Validade

- Entrada: `validade_dias` inteiro de 1 a 365 (obrigatório no formato novo). Mensagem: "Validade deve ser de 1 a 365 dias".
- `validade = data_proposta + validade_dias`. Se `validade <= hoje (São Paulo)`: "A validade calculada já passou. Ajuste a data ou os dias."
- A regra antiga "Data da proposta não pode ser posterior à validade" fica automaticamente satisfeita.

## 5. Conteúdo canônico (hash)

- **Formato antigo** (`projetos IS NULL`): exatamente o canônico atual (080 a 082), sem `idioma` — hashes gravados continuam válidos.
- **Formato novo**:

```json
{
  "codigo": "...", "emitida_em": "...", "modelo": "outplacement-development", "modelo_versao": 1,
  "idioma": "pt-BR", "moeda": "BRL",
  "cliente_nome": "...", "data_proposta": "2026-10-24", "setor": "infraestrutura",
  "consultor": { "nome": "...", "cargo": "...", "telefone": "...", "email": "..." },
  "projeto_escopo": "<p>…</p>" | null,
  "projetos": [ { "nome": "...", "investimentos": [ … ] } ],
  "shortlist": "..." | null, "sla": "..." | null, "garantia": "..." | null,
  "validade_dias": 30, "validade": "2026-11-23"
}
```

Serializado com `sort_keys`, separadores compactos e `ensure_ascii=False`, como hoje.

## 6. Histórico (`propostas_edicoes.alteracoes`)

Campos simples do formato novo: `cliente_nome`, `data_proposta`, `setor`, `consultor_nome`, `consultor_cargo`, `consultor_telefone`, `consultor_email`, `projeto_escopo`, `shortlist`, `sla`, `garantia_texto`, `validade_dias`, `validade`.

Projetos por posição (research R9):

```json
{ "campo": "projeto.2", "anterior": { "nome": "Posição 2", "investimentos": [ … ] }, "novo": null }
```

## 7. Migração (boot, idempotente)

1. `ALTER TABLE propostas ADD COLUMN IF NOT EXISTS` para as 6 colunas.
2. `UPDATE ... SET idioma = CASE WHEN moeda = 'USD' THEN 'en-US' ELSE 'pt-BR' END WHERE modelo <> 'simples' AND idioma IS NULL`.
3. Adiciona `ck_propostas_campos_modelo_v2` se não existir; remove `ck_propostas_campos_modelo` se existir; adiciona `ck_propostas_idioma` se não existir.
4. ORM: pendentes `executive-search` com `projetos IS NULL` → formato novo na versão atual (3), conforme research R4, com o hash recalculado.

## 8. Modelos (registro)

| Id | Nome | Versão atual | Disponível |
|---|---|---|---|
| `executive-search` | Executive Search | 3 | sim |
| `outplacement-development` | Development & Outplacement | 1 | sim |

Recursos por versão (frontend):

| Modelo/versão | Título da divisão | Escopo | Formato novo (projetos, garantias editáveis, subtítulo da taxa) |
|---|---|---|---|
| ES v1 | não | não | não |
| ES v2 | sim | sim | não |
| ES v3 | sim | sim | sim |
| D&O v1 | sim | sim | sim |
