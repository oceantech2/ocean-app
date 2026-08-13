# Data Model: Contas a Pagar — Taxonomia de Categorias

**Feature**: `021-contas-pagar-taxonomia` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

## Visão geral

```text
[ UI Contas / import ] --CRUD--> [ contas_pagar ]
         |                            |
         | filtros                    | categoria + subcategoria
         v                            v  (sem migration nesta feature)
   [ custo-por-categoria ]     legado: RH + beneficios (inalterado)
   [ Impostos / Retiradas ]    novo: categoria=beneficios, sub=null
```

Schema físico **inalterado**. Mudança é de catálogo e regras de validação.

## Entidades

### Conta a Pagar (existente)

| Campo | Tipo | Obrigatório | Notas nesta feature |
|-------|------|-------------|---------------------|
| `categoria` | string | sim | Código do catálogo **ou** valor pendente 008 **ou** `recursos_humanos` no par legado |
| `subcategoria` | string? | condicional | Oficial: só se RH ∈ 4 subs. Legado: `beneficios` com RH. Demais categorias: `null` |
| `categoria_pendente` | bool | sim | **Não** usar para o par RH / Benefícios desta feature |

Demais campos (valor, datas, pago, comprovante) inalterados.

### Categoria (catálogo oficial, ordem de exibição)

| Código | Label | Exige subcategoria |
|--------|-------|--------------------|
| `adm_financeiro` | Adm/Financeiro | não |
| `operacoes` | Operações | não |
| `marketing` | Marketing | não |
| `comercial` | Comercial | não |
| `recursos_humanos` | Recursos Humanos | **sim** (salvo par legado) |
| `beneficios` | Benefícios | não |
| `tecnologia` | Tecnologia | não |
| `impostos` | Impostos | não |

### Subcategoria RH oficial

| Código | Label |
|--------|-------|
| `salario` | Salário |
| `bonus` | Bônus |
| `comissao` | Comissão |
| `retirada_socios` | Retirada Sócios |

### Classificação legado (não é opção nova)

| categoria | subcategoria | Label | `categoria_pendente` |
|-----------|--------------|-------|----------------------|
| `recursos_humanos` | `beneficios` | Recursos Humanos / Benefícios | `false` |

## Regras de validação

1. **Create / import**: `categoria` ∈ catálogo oficial (8). Se RH → `subcategoria` ∈ 4 oficiais. Se não RH → `subcategoria` ausente/`null`. **Rejeitar** RH + `beneficios`.
2. **Update sem mudança de classificação**: se o par enviado é idêntico ao persistido, aceitar (inclui legado).
3. **Update com mudança de classificação**: mesmas regras do create; gravar `subcategoria=null` ao ir para Benefícios (ou outra não-RH).
4. Pendências 008 (outros valores): fluxo vigente inalterado.

## Transições (classificação)

```text
[legado RH+beneficios] --PUT outros campos--> [legado RH+beneficios]
[legado RH+beneficios] --PUT categoria=beneficios, sub=null--> [Benefícios]
[legado RH+beneficios] --PUT outra categoria oficial--> [classificada oficial]
[qualquer] --POST RH+beneficios--> 422
[qualquer] --import RH+beneficios--> erro na linha
```

## Agregações

| Consumidor | Critério (inalterado, salvo catálogo) |
|------------|----------------------------------------|
| Impostos | `categoria = impostos` e não pendente |
| Retiradas | `categoria = recursos_humanos` e `subcategoria = retirada_socios` (legado Benefícios **não** entra) |
| Custo por categoria | `GROUP BY categoria`; legado permanece em `recursos_humanos`; novas/reclassificadas em `beneficios` |
