# Data model: Colaboradores e Fornecedores

**Feature**: `030-colaboradores-fornecedores` | **Date**: 2026-08-13

## Entidades

### Cadastro (`colaboradores`) — colaborador ou fornecedor

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| id | inteiro | sim | PK existente |
| tipo | `colaborador` \| `fornecedor` | sim | Default `colaborador`. Imutável após criar |
| tipo_documento | `cpf` \| `cnpj` | sim | Default `cpf` na migração |
| documento | string (só dígitos) | sim | 11 (CPF) ou 14 (CNPJ) |
| cpf | string | condicional | Espelho de exibição/compat.; deixa de ser UNIQUE; backfill a partir do CPF atual |
| razao_social | string | se CNPJ | Trim; vazio = inválido |
| nome | string | sim | Nome de exibição (pessoa ou nome fantasia) |
| telefone | string | não | Até 20 caracteres; vazio = null |
| email | string | não | Formato de e-mail se preenchido |
| cargo | string | se colaborador | NULL para fornecedor |
| salario | número | se colaborador | NULL para fornecedor |
| data_nascimento | data | se colaborador | NULL para fornecedor |
| endereco_completo, cep | texto | não | Podem existir no fornecedor (opcional; UI de fornecedor não precisa expor nesta feature) |
| data_admissao, data_desligamento | data | não | Só fluxo de colaborador |
| beneficio | texto | não | Só colaborador |
| observacao | texto | não | Ambos |
| ativo | boolean | sim | Soft delete |
| criado_em, atualizado_em | datetime | sim | Existentes |

Relacionamentos existentes (NFs, bônus, férias, histórico, patrimônio, documentos) **somente fazem sentido para `tipo=colaborador`**. A UI de fornecedor não oferece esses fluxos.

### Conta a pagar (`contas_pagar`)

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| fornecedor_id | inteiro FK → colaboradores.id | não | Deve referenciar `tipo=fornecedor` |

Campos atuais da conta permanecem.

## Unicidade

- Índice parcial: `(tipo, documento)` único enquanto `ativo = true`.
- Remover unique constraint de `colaboradores.cpf`.
- Documento comparado só com dígitos.

## Estados

```text
ativo=true  → listagem padrão da visão correspondente; pode ser vinculado a conta (se fornecedor)
ativo=false → só com filtro inativos; novo vínculo em conta recusado
tipo        → fixo na criação (sem transição)
```

Colaborador: desligar (DELETE + data_desligamento como hoje).  
Fornecedor: desativar (DELETE, sem desligamento).

## Validação

- CPF: 11 dígitos + dígitos verificadores (já usados no frontend).
- CNPJ: 14 dígitos + dígitos verificadores.
- E-mail: se presente, contém `@` e domínio (validação de formato).
- `tipo` no PUT diferente do persistido → 400.
- `fornecedor_id` apontando para colaborador ou inexistente → 400.
- `fornecedor_id` de fornecedor inativo em **novo** vínculo → 400; vínculo antigo permanece.

## Migração (inline `_migrar`)

1. `ADD COLUMN` tipo, tipo_documento, documento, razao_social, telefone, email (defaults).
2. `UPDATE` documento = dígitos de `cpf`; tipo_documento = `cpf`; tipo = `colaborador`.
3. `ALTER` cargo, salario, data_nascimento DROP NOT NULL.
4. Drop unique em `cpf` (nome típico `colaboradores_cpf_key` / índice `ix_...`).
5. Criar índice parcial `ux_colaboradores_tipo_documento_ativo`.
6. `contas_pagar.fornecedor_id` INTEGER NULL + FK.

Registros atuais viram colaboradores com CPF preservado; telefone e e-mail nulos (FR-011).

## Derivados na API de contas

Não persistir nome: na resposta, `fornecedor_nome` e `fornecedor_ativo` via join/lookup.
