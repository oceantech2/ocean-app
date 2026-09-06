# Data Model: 049-categorias-ordem-lancamento

**Date**: 2026-09-06  
**Spec**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

## Entidades

### Categoria oficial (padrão de fábrica)

| Atributo | Descrição |
|----------|-----------|
| codigo | Identificador estável (`adm_financeiro`, `recursos_humanos`, …) |
| nome | Rótulo fixo nesta entrega (imutável) |
| exige_subcategoria | `true` só para `recursos_humanos` |

**Origem**: constantes `CATEGORIAS` (código). Não há CRUD.

### CategoriaPagarCadastrada (existente — estendida em comportamento)

| Campo | Tipo | Regras |
|-------|------|--------|
| id | int PK | |
| codigo | string unique | `cat_{id}` após create |
| nome | string(20) | obrigatório; unique case-insensitive vs oficiais, RH e outras cadastradas |
| criado_em | datetime | |
| criado_por | string? | usuário admin |

**Operações**: create (já existe), **update nome**, **delete** se zero contas com `ContaPagar.categoria = codigo` (e não pendente).

### SubcategoriaRhCadastrada (nova)

| Campo | Tipo | Regras |
|-------|------|--------|
| id | int PK | |
| codigo | string unique | fábrica: `salario`, `bonus`, `comissao`, `retirada_socios`, `beneficios`; custom: gerado (`sub_{id}` ou slug validado) |
| nome | string(20) | rótulo exibido; unique case-insensitive no catálogo RH + categorias |
| sistema | bool | `true` = padrão de fábrica (não excluível); `false` = criada pelo admin |
| criado_em | datetime | |
| criado_por | string? | null nas seed; preenchido nas custom |

**Seed inicial**:

| codigo | nome | sistema |
|--------|------|---------|
| salario | Salário | true |
| bonus | Bônus & Comissão | true |
| comissao | Comissão | true |
| retirada_socios | Retirada Sócios | true |
| beneficios | Benefícios | true |

**Operações**:
- create → `sistema=false`
- update nome → qualquer linha
- delete → só `sistema=false` e zero `ContaPagar` com `categoria=recursos_humanos` e `subcategoria=codigo`

### Conta a Pagar / Conta a Receber (NF) / FluxoMovimento

Sem novos campos. Usam `criado_em` existente como **ordem de lançamento**.

Relacionamentos lógicos:
- ContaPagar.categoria → codigo oficial **ou** cadastrada  
- ContaPagar.subcategoria → codigo em SubcategoriaRhCadastrada quando categoria = RH  

### Catálogo agregado (leitura)

```text
{
  oficiais: [{ codigo, nome, exige_subcategoria }],
  cadastradas: [{ id, codigo, nome }],
  subcategorias_rh: [{ id?, codigo, nome, sistema }]
}
```

`sistema` (ou equivalente `gerenciavel = !sistema` para exclusão) deve ir ao frontend para ocultar delete em padrão.

## Regras de validação

1. Nome não vazio; trim; máx. 20; charset letras/números/espaço/hífen/barra (e `&` se necessário para o rótulo seed — permitir `&` na validação de nome se ainda não permitido).
2. Unicidade case-insensitive entre oficiais, cadastradas e subcategorias RH.
3. RH exige subcategoria cujo codigo exista no catálogo RH.
4. Exclusão com vínculos → erro de negócio, sem apagar contas.
5. Exclusão de `sistema=true` → erro.
6. Visualizador: só GET catálogo / listagens.

## Nota sobre `&` no charset

Hoje `_char_nome_ok` aceita alnum, espaço, hífen e barra. O seed **Bônus & Comissão** contém `&`. **Decision de implementação**: incluir `&` nos caracteres permitidos (ou seed via bypass só na migração inicial + permitir `&` em updates). Preferir permitir `&` na validação para permitir edições futuras do mesmo rótulo.

## Transições de estado

```text
[Categoria/Sub custom] --create--> ativa no catálogo
ativa --rename--> ativa (mesmo codigo)
ativa (sem vínculos) --delete--> removida
ativa (com vínculos) --delete--> rejeitada
[Sub sistema] --rename--> ativa
[Sub sistema] --delete--> rejeitada
```
