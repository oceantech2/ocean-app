# Data model: Fornecedores — cadastro unificado

**Feature**: `043-fornecedores-cadastro` | **Date**: 2026-08-27

## Entidade principal — `colaboradores` (cadastro unificado de fornecedores)

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| id | inteiro | sim | PK existente |
| tipo | string | sim | Sempre **`fornecedor`** após migração. Valor `colaborador` legado migrado |
| elegivel_equipe | boolean | sim | `true` = ex-colaborador (férias, bônus, DH, patrimônio). Default `false` em novos |
| tipo_fornecedor | `fixo` \| `spot` | sim | Classificação operacional (UI: **Tipo**). Default `fixo` na migração |
| tipo_documento | `cpf` \| `cnpj` | sim | Inalterado |
| documento | string (dígitos) | sim | CPF 11 ou CNPJ 14 |
| cpf | string | não | Espelho formatado para exibição |
| razao_social | string | se CNPJ | Trim; vazio inválido |
| nome | string | sim | Nome fantasia / exibição |
| telefone | string | não | |
| email | string | não | Validar formato se preenchido |
| pf_nome | string | se CNPJ (save) | Responsável PF do PJ |
| pf_cpf | string (11 dígitos) | se CNPJ (save) | Validar CPF; único entre ativos |
| pf_endereco | text | se CNPJ (save) | Texto livre |
| pf_data_nascimento | date | se CNPJ (save) | Não futura |
| cargo | string | se elegivel_equipe + save RH | Visível só legado na UI |
| salario | número | se elegivel_equipe + save RH | |
| data_nascimento | date | se elegivel_equipe + CPF + save RH | Não exibida em novos CPF |
| endereco_completo, cep | texto | não | Legado / opcional |
| data_admissao, data_desligamento | data | não | Só legado com RH |
| beneficio | texto | não | Só legado |
| observacao | texto | não | |
| ativo | boolean | sim | Soft delete |
| criado_em, atualizado_em | datetime | sim | |

### Relacionamentos (inalterados)

- `contas_pagar.fornecedor_id` → qualquer registro ativo `tipo=fornecedor`
- NFs, bônus, férias, patrimônio, histórico → FK por `colaborador_id`; listagens de seleção filtram `elegivel_equipe = true`

## Índices e unicidade

| Índice | Definição |
|--------|-----------|
| `ux_colaboradores_documento_ativo` | UNIQUE `(documento)` WHERE `ativo = true` (substitui índice por `tipo, documento`) |
| `ux_colaboradores_pf_cpf_ativo` | UNIQUE `(pf_cpf)` WHERE `ativo = true AND pf_cpf IS NOT NULL` |
| `ix_colaboradores_elegivel_equipe` | `(elegivel_equipe)` WHERE `ativo = true` (apoio a listagens RH) |

## Estados e transições

```text
tipo              → sempre 'fornecedor' (pós-migração); imutável conceito de cadastro unificado
elegivel_equipe   → imutável após criar (legado vem da migração; novos = false)
tipo_fornecedor   → editável (fixo ↔ spot)
tipo_documento    → editável cfp ↔ cnpj com regras de PF/RH
ativo             → soft delete; inativo não entra em novos vínculos de conta
```

## Regras de validação (resumo)

| Contexto | Regras |
|----------|--------|
| Novo fornecedor | `tipo_fornecedor` obrigatório; CNPJ → razão + PF completa; CPF → sem data nascimento; sem RH |
| Legado (`elegivel_equipe`) CPF | RH obrigatório no save (cargo, salário, data_nascimento) |
| Legado CNPJ | PF obrigatória no save; RH opcional conforme dados existentes |
| CNPJ legado PF incompleta | GET/listagem OK; PUT exige PF; Contas a Pagar vínculo OK |
| Duplicidade | `documento` e `pf_cpf` entre ativos |

## Migração inline (`backend/app/main.py` → `_migrar`)

Ordem sugerida:

1. `ADD COLUMN elegivel_equipe BOOLEAN NOT NULL DEFAULT false`
2. `ADD COLUMN tipo_fornecedor VARCHAR(10)`
3. `ADD COLUMN pf_nome VARCHAR(255)`, `pf_cpf VARCHAR(11)`, `pf_endereco TEXT`, `pf_data_nascimento DATE`
4. `UPDATE elegivel_equipe = true WHERE tipo = 'colaborador'`
5. `UPDATE tipo = 'fornecedor' WHERE tipo = 'colaborador'`
6. `UPDATE tipo_fornecedor = 'fixo' WHERE tipo_fornecedor IS NULL`
7. `ALTER tipo_fornecedor SET NOT NULL` (após backfill)
8. Dropar índice único parcial antigo `(tipo, documento)`; criar `ux_colaboradores_documento_ativo`
9. Criar `ux_colaboradores_pf_cpf_ativo`

Registros CNPJ existentes ficam com PF nula até primeira edição (comportamento aceito pela spec).

## Impacto em consumidores

| Consumidor | Filtro após mudança |
|------------|---------------------|
| Página Fornecedores | Todos (`ativo` conforme UI) |
| Contas a Pagar | `tipo=fornecedor` + `ativo` (todos) |
| Férias, Bônus, Patrimônio | `elegivel_equipe=true` + `ativo` |
| NFs (lead/condução/placement) | Manter listagem atual de colaboradores → migrar para `elegivel_equipe=true` |
