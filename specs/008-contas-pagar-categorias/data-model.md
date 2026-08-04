# Data Model: Contas a Pagar — Categorias

**Feature**: `008-contas-pagar-categorias` | **Date**: 2026-07-26  
**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

## Visão geral

```text
[ Admin UI Contas ] --CRUD/import--> [ contas_pagar ]
         |                               |
         | filtros categoria/sub         | migração one-shot
         v                               v
   [ Impostos / Retiradas /          centro_custo (legado)
     custo-por-categoria ]           → categoria + subcategoria
                                       + categoria_pendente
```

## Entidades

### Conta a Pagar

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| `id` | int | sim | PK |
| `descricao` | string | sim | |
| `categoria` | string | sim | Código taxonomia **ou** código legado se pendente |
| `subcategoria` | string? | condicional | Obrigatória se `categoria=recursos_humanos` e `categoria_pendente=false` |
| `categoria_pendente` | bool | sim | Default `false` |
| `valor` | number | sim | |
| `data_vencimento` | date? | não | |
| `data_pagamento` | date? | não | |
| `pago` | bool | sim | |
| `comprovante_path` / `comprovante_nome` | string? | não | Inalterado |
| `criado_em` / `atualizado_em` | datetime | sim | Inalterado |

**Removido**: `centro_custo` (enum legado), após migração.

### Categoria (catálogo fechado)

| Código | Label | Exige subcategoria |
|--------|-------|--------------------|
| `adm_financeiro` | Adm/Financeiro | não |
| `operacoes` | Operações | não |
| `marketing` | Marketing | não |
| `comercial` | Comercial | não |
| `recursos_humanos` | Recursos Humanos | **sim** (se não pendente) |
| `tecnologia` | Tecnologia | não |
| `impostos` | Impostos | não |

### Subcategoria RH (catálogo fechado)

| Código | Label |
|--------|-------|
| `salario` | Salário |
| `bonus` | Bônus |
| `comissao` | Comissão |
| `retirada_socios` | Retirada Sócios |
| `beneficios` | Benefícios |

## Regras de validação

1. Create / update com `categoria_pendente=false`: `categoria` ∈ catálogo; se RH → `subcategoria` ∈ catálogo RH; senão `subcategoria` deve ser `null`/ausente.
2. Update parcial (ex.: só `pago` / `data_pagamento`): não exige reclassificação se já pendente.
3. Reclassificação: setar categoria(+sub) válidos e `categoria_pendente=false`.
4. Import: mesmas regras do create; rejeitar linha se inválido/legado.
5. Contas pendentes: `categoria` pode estar fora do catálogo novo; UI mostra label legado + aviso.

## Mapeamento de migração

Ver tabela em [research.md](./research.md) §2. Após migração, 100% das linhas mapeáveis têm `categoria_pendente=false` e códigos novos.

## Transições de estado (classificação)

```text
[legado mapeável] --migrate--> [classificada]
[legado não mapeável] --migrate--> [pendente]
[pendente] --admin reclassifica--> [classificada]
[classificada] --admin edita categoria--> [classificada]
```

Pendência **não** bloqueia: `pago`, datas, descrição, comprovante.

## Agregações dependentes

| Consumidor | Critério |
|------------|----------|
| Impostos | `categoria = impostos` AND `categoria_pendente = false` |
| Retiradas | `categoria = recursos_humanos` AND `subcategoria = retirada_socios` AND não pendente |
| Custo por categoria | `GROUP BY categoria` onde não pendente; pendentes em bucket `pendente` (opcional) ou excluídos do total oficial |
| DRE (impostos vs despesa) | impostos = acima; demais = `categoria != impostos` (inclui pendentes como despesa até reclassificar) |
