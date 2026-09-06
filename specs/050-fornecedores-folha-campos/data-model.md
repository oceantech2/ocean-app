# Data Model: Fornecedores — campos opcionais de PF, período, salário e total da folha

**Feature**: `050-fornecedores-folha-campos` | **Date**: 2026-09-06

> Sem alteração de schema. Regras abaixo referem-se à tabela existente `colaboradores` (semântica de fornecedor).

## Entidade: Fornecedor (`colaboradores`)

| Campo (DB) | UI / negócio | Tipo | Obrigatório | Notas |
|------------|--------------|------|-------------|-------|
| `salario` | Salário | float nullable | Não | ≥ 0 se informado; entra no Total da folha se ativo + Fixo |
| `data_admissao` | **Data de início** | date nullable | Não | Período de vínculo |
| `data_desligamento` | **Data de término** | date nullable | Não | Se ambas preenchidas: ≥ `data_admissao` |
| `tipo_fornecedor` | Tipo | `fixo` \| `spot` | Sim | Discriminador do card |
| `ativo` | Status | bool | — | Só `true` entra no Total da folha |
| `elegivel_equipe` | Legado | bool | — | Cargo/benefício/histórico só se `true` |
| `pf_nome` | PF Nome | string | Sim se CNPJ | — |
| `pf_endereco` | PF Endereço | string | Sim se CNPJ | — |
| `pf_cpf` | PF CPF | string nullable | Não | Validar + unicidade se preenchido |
| `pf_data_nascimento` | PF Data Nascimento | date nullable | Não | ≤ hoje se preenchida |

Campos de RH **não** ampliados por esta feature (só legado): `cargo`, `beneficio`, `data_nascimento` (equipe), histórico de cargo, documentos RH.

## Regras de validação

1. **CNPJ**: `pf_nome` e `pf_endereco` obrigatórios; `pf_cpf` / `pf_data_nascimento` opcionais.
2. **CPF PF informado**: dígitos válidos; único entre fornecedores ativos com mesmo `pf_cpf`.
3. **Salário**: opcional; se presente, não negativo (inclui zero).
4. **Datas**: isoladas ok; par completo exige término ≥ início.
5. **Legado CPF**: pode continuar exigindo `cargo` e `data_nascimento` de equipe; **não** exige `salario`.

## Total da folha (derivado, não persistido)

```text
total_folha = Σ salario
  WHERE ativo = true
    AND tipo_fornecedor = 'fixo'
    AND salario IS NOT NULL   -- ausente = 0 / não soma
```

Não é coluna nem tabela; valor calculado na UI (ou futuro endpoint — fora desta feature).

## Transições relevantes

| Evento | Efeito no Total da folha |
|--------|--------------------------|
| Criar Fixo ativo com salário | Soma aumenta |
| Alterar salário de Fixo ativo | Soma recalcula |
| Fixo → Spot | Sai da soma |
| Spot → Fixo (com salário) | Entra na soma |
| Desativar Fixo | Sai da soma |
| Reativar Fixo | Entra na soma |

## Relacionamentos

Inalterados: histórico de cargo, férias/bônus (só `elegivel_equipe`), contas a pagar (qualquer ativo).
