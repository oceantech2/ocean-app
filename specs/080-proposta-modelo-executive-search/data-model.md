# Data Model: Modelos de Proposta por Divisão (Executive Search)

**Feature**: `080-proposta-modelo-executive-search` | **Data**: 2026-10-05

Parte do modelo das features 077 e 079 (`propostas`, `propostas_assinaturas`, `propostas_edicoes`). Decisões em [research.md](./research.md) (R4, R5, R7, R8, R9).

---

## 1. `propostas` (alterada)

### Colunas novas

| Coluna | Tipo | Nulo | Padrão | Uso |
|---|---|---|---|---|
| `modelo` | `VARCHAR(40)` | não | `'simples'` | `simples` (propostas antigas) ou id do modelo (`executive-search`) |
| `modelo_versao` | `INTEGER` | sim | — | Versão do texto fixo do modelo (R4). `NULL` em `simples` |
| `data_proposta` | `DATE` | sim | — | Data exibida na capa e no rodapé |
| `setor` | `VARCHAR(40)` | sim | — | `oil-gas` · `energia` · `infraestrutura` · `mineracao` · `industria-servicos` |
| `consultor_nome` | `VARCHAR(255)` | sim | — | Copiado do perfil, ajustável |
| `consultor_cargo` | `VARCHAR(255)` | sim | — | idem |
| `consultor_telefone` | `VARCHAR(30)` | sim | — | Como digitado (R10) |
| `consultor_email` | `VARCHAR(255)` | sim | — | idem |
| `projeto_nome` | `VARCHAR(255)` | sim | — | Título da seção Investimento |
| `garantia_meses` | `SMALLINT` | sim | — | Inteiro > 0 |
| `investimentos` | `JSONB` | sim | — | Array de 1 a 3 itens (formato abaixo) |

### Colunas existentes com mudança

| Coluna | Mudança |
|---|---|
| `cliente_nome` | Sem mudança de tipo. Passa a significar **Empresa** nas propostas por modelo (mesma coluna; R5) |
| `cnpj`, `valor`, `total` | `DROP NOT NULL`. Continuam obrigatórios em `simples` via `CHECK` |
| `imposto_ativo`, `aliquota`, `valor_imposto` | Sem mudança. Em propostas por modelo: `false`, `NULL`, `0` (as constraints existentes já aceitam) |

### Constraints novas (idempotentes, bloco `DO $$`)

```sql
-- Campos obrigatórios por modelo
CONSTRAINT ck_propostas_campos_modelo CHECK (
  (modelo = 'simples' AND cnpj IS NOT NULL AND valor IS NOT NULL AND total IS NOT NULL)
  OR
  (modelo <> 'simples'
   AND modelo_versao IS NOT NULL AND data_proposta IS NOT NULL AND setor IS NOT NULL
   AND consultor_nome IS NOT NULL AND consultor_cargo IS NOT NULL
   AND consultor_telefone IS NOT NULL AND consultor_email IS NOT NULL
   AND projeto_nome IS NOT NULL AND garantia_meses > 0
   AND jsonb_typeof(investimentos) = 'array'
   AND jsonb_array_length(investimentos) BETWEEN 1 AND 3)
)
-- Data da proposta não posterior à validade (FR-005)
CONSTRAINT ck_propostas_data_validade CHECK (data_proposta IS NULL OR data_proposta <= validade)
```

As regras finas (tipos distintos, faixas de taxa e entrada, setor válido, formato de telefone/e-mail) ficam no serviço (`validar_modelo`), como as demais validações do Proposal; o banco garante a forma mínima.

`ck_propostas_valor_positivo` (`valor > 0`) e `ck_propostas_aliquota` continuam válidas: `NULL > 0` não reprova um `CHECK`, e `imposto_ativo = false` com `aliquota NULL` já é aceito.

### Item de `investimentos` (JSONB)

```json
{ "tipo": "retainer", "taxa_tipo": "percentual", "taxa": "15.00", "entrada": 40 }
```

| Campo | Tipo | Regra |
|---|---|---|
| `tipo` | string | `retainer` · `sucesso` · `valor-fechado`; único dentro da proposta |
| `taxa_tipo` | string | `percentual` · `valor` |
| `taxa` | string decimal, 2 casas | `percentual`: 0 < taxa < 100. `valor`: 0 < taxa < 1.000.000.000.000 |
| `entrada` | inteiro ou `null` | 1 a 99; `0` ou vazio é normalizado para `null` (sem entrada) |

- Percentual após conclusão **não é gravado**: é `100 − entrada` (ou 100).
- O array é gravado ordenado: Retainer, Sucesso, Valor fechado (FR-016).

### Regras de validação (serviço `validar_modelo`)

| Campo | Regra | Mensagem `422` |
|---|---|---|
| `modelo` (criação) | presente no registro e disponível | `Modelo de proposta inválido` |
| `modelo` (edição) | igual ao da proposta, ou ausente | `O modelo da proposta não pode ser alterado` |
| `cliente_nome` (Empresa) | 1 a 255 caracteres após `trim` | `Informe a empresa` / `Nome da empresa muito longo` |
| `data_proposta` | data válida; padrão hoje (São Paulo) | `Informe a data da proposta` |
| `data_proposta` × `validade` | `data_proposta ≤ validade` | `Data da proposta não pode ser posterior à validade` |
| `setor` | uma das 5 chaves | `Selecione o setor` |
| `consultor_nome`, `consultor_cargo` | 1 a 255 após `trim` | `Informe o nome do consultor` / `Informe o cargo do consultor` |
| `consultor_telefone` | 10 a 13 dígitos (ignorando máscara) | `Telefone do consultor inválido` |
| `consultor_email` | `validar_email` | `E-mail do consultor inválido` |
| `projeto_nome` | 1 a 255 após `trim` | `Informe o nome do projeto` |
| `garantia_meses` | inteiro de 1 a 120 | `Garantia deve ser um número de meses maior que zero` |
| `investimentos` | 1 a 3 itens, tipos distintos e válidos | `Selecione de 1 a 3 modelos de investimento` / `Tipo de investimento inválido ou repetido` |
| item `taxa` | conforme `taxa_tipo` | `Taxa do {Tipo} deve ser maior que 0 e menor que 100%` / `Taxa do {Tipo} deve ser maior que zero` |
| item `entrada` | vazio, 0 ou inteiro 1–99 | `Entrada do {Tipo} deve estar entre 0 e 99%` |
| `validade` | posterior a hoje (regra da 079) | `Validade deve ser posterior a hoje` |

### Hash canônico (R7)

- `modelo = 'simples'`: formato atual, inalterado.
- Por modelo: JSON ordenado com `codigo`, `emitida_em`, `modelo`, `modelo_versao`, `cliente_nome`, `data_proposta`, `setor`, `consultor` (`nome`, `cargo`, `telefone`, `email`), `projeto_nome`, `garantia_meses`, `investimentos` (ordenados) e `validade`.

### Ciclo de vida

Sem mudança em relação à 079: `aguardando → visualizada → assinada`, `cancelada`, `expirada` (derivado). Criação e edição de propostas por modelo gravam `modelo_versao = versao_atual` do registro (R4). `modelo` nunca muda depois da criação.

---

## 2. `proposal_perfis_consultor` (nova)

| Coluna | Tipo | Nulo | Observação |
|---|---|---|---|
| `usuario_id` | `INTEGER` PK | não | `REFERENCES usuarios_app(id) ON DELETE CASCADE` |
| `nome` | `VARCHAR(255)` | sim | |
| `cargo` | `VARCHAR(255)` | sim | |
| `telefone` | `VARCHAR(30)` | sim | Mesmas regras do telefone da proposta, quando preenchido |
| `email` | `VARCHAR(255)` | sim | Mesmas regras do e-mail da proposta, quando preenchido |
| `atualizado_em` | `TIMESTAMP` | não | `DEFAULT NOW()`, UTC |

- Um perfil por usuário (a PK é o próprio `usuario_id`; não precisa de índice extra para a FK).
- Campos vazios são gravados como `NULL` (perfil incompleto é válido; US5, cenário 3).
- Acesso só pelo usuário do token do Proposal (FR-031). RLS: a tabela entra no `backend/scripts/enable_rls_supabase.sql`, que habilita RLS em todas as tabelas do schema, sem políticas (acesso só pelo backend).

---

## 3. `propostas_edicoes` (sem mudança de schema)

O formato de `alteracoes` (array de `{campo, anterior, novo}`) se mantém. Nas propostas por modelo, os campos possíveis são (R8):

| `campo` | `anterior` / `novo` |
|---|---|
| `cliente_nome` (exibido "Empresa"), `data_proposta`, `setor`, `consultor_nome`, `consultor_cargo`, `consultor_telefone`, `consultor_email`, `projeto_nome`, `validade` | string canônica |
| `garantia_meses` | inteiro |
| `investimento.retainer`, `investimento.sucesso`, `investimento.valor-fechado` | `{taxa_tipo, taxa, entrada}` ou `null` (inclusão: `anterior = null`; remoção: `novo = null`) |

---

## 4. Entidades sem tabela (registros em código)

| Registro | Onde | Conteúdo |
|---|---|---|
| Modelos | `backend/app/services/proposta_modelos.py` e `frontend/src/proposal/modelos/index.ts` | `executive-search`: nome "Executive Search", `disponivel: true`, `versao_atual: 1` (front: componentes por versão) |
| Setores | `backend/app/services/proposta_modelos.py` e `frontend/src/proposal/modelos/setores.ts` | 5 chaves + rótulos; no front, URL da foto (todas → `infraestrutura.jpg` até chegarem as fotos) |
| Tipos de investimento | idem | `retainer` "Retainer", `sucesso` "Sucesso", `valor-fechado` "Valor fechado", nessa ordem |

---

## 5. Migração (`_migrar()`, bloco "Proposal (feature 080)")

Ordem, toda idempotente e numa transação, depois do bloco da 079:
1. `ALTER TABLE propostas ADD COLUMN IF NOT EXISTS ...` para as 11 colunas novas (`modelo` com `DEFAULT 'simples'`, que preenche as linhas existentes).
2. `ALTER TABLE propostas ALTER COLUMN cnpj DROP NOT NULL` (idem `valor`, `total`); repetir é inofensivo.
3. `DO $$ ... IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '...') THEN ALTER TABLE ... ADD CONSTRAINT ... $$` para `ck_propostas_campos_modelo` e `ck_propostas_data_validade`.
4. `CREATE TABLE IF NOT EXISTS proposal_perfis_consultor (...)`.
5. Modelos SQLAlchemy atualizados em `backend/app/models/__init__.py` (`Proposta` + `PerfilConsultor`).
6. Pós-deploy em produção: rodar `backend/scripts/enable_rls_supabase.sql` no Supabase.
