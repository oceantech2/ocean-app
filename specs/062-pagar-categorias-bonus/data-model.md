# Data Model: 062-pagar-categorias-bonus

**Date**: 2026-09-14  
**Spec**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

Sem novas tabelas. Entidades já persistidas (049); muda o **rótulo de fábrica** de `bonus` e as regras de resolução na importação.

## Entidades

### Categoria oficial (padrão de fábrica)

| Atributo | Descrição |
|----------|-----------|
| codigo | Identificador estável (`adm_financeiro`, `recursos_humanos`, …) |
| nome | Rótulo fixo nesta entrega (imutável) |
| exige_subcategoria | `true` só para `recursos_humanos` |

**Operações**: nenhuma (sem editar/excluir).

### CategoriaPagarCadastrada (existente)

| Campo | Tipo | Regras |
|-------|------|--------|
| id | int PK | |
| codigo | string unique | `cat_{id}` após create |
| nome | string(20) | obrigatório; unique case-insensitive vs oficiais, RH e outras cadastradas |
| criado_em | datetime | |
| criado_por | string? | usuário admin |

**Operações**: create, update nome, delete se zero `ContaPagar` com `categoria = codigo` e não pendente.

### SubcategoriaRhCadastrada (existente)

| Campo | Tipo | Regras |
|-------|------|--------|
| id | int PK | |
| codigo | string unique | fábrica: `salario`, `bonus`, `comissao`, `retirada_socios`, `beneficios`; custom: gerado |
| nome | string(20) | rótulo exibido; unique case-insensitive no catálogo RH + categorias |
| sistema | bool | `true` = padrão (não excluível); `false` = criada pelo admin |
| criado_em | datetime | |
| criado_por | string? | null nas seed; preenchido nas custom |

**Seed / rótulo de fábrica desta entrega**:

| codigo | nome | sistema |
|--------|------|---------|
| salario | Salário | true |
| bonus | **Bônus** | true |
| comissao | Comissão | true |
| retirada_socios | Retirada Sócios | true |
| beneficios | Benefícios | true |

Atualização idempotente: `bonus` + `sistema=true` + nome ∈ {`Comissões`, `Bônus & Comissão`} → `Bônus`. Outros nomes (editados pelo admin) permanecem.

**Operações**:
- create → `sistema=false`
- update nome → qualquer linha
- delete → só `sistema=false` e zero contas RH com `subcategoria=codigo`

### Conta a Pagar

Sem novos campos. `subcategoria=bonus` continua válido; só o rótulo visível na página muda.

Pendência de reclassificação: `categoria_pendente` + rótulo legado **Comissões (legado)** inalterado.

### Catálogo agregado (leitura)

```text
{
  oficiais: [{ codigo, nome, exige_subcategoria }],
  cadastradas: [{ id, codigo, nome }],
  subcategorias_rh: [{ id, codigo, nome, sistema }]
}
```

Item `bonus` DEVE ter `nome: "Bônus"` após seed (salvo override de admin).

## Regras de validação

1. Nome não vazio; trim; máx. 20; charset letras/números/espaço/hífen/barra/`&`.
2. Unicidade case-insensitive entre oficiais, cadastradas e subcategorias RH.
3. RH exige subcategoria cujo **código** exista no catálogo RH. Na importação, nomes **Bônus**, **Comissões** e **Bônus & Comissão** resolvem para `bonus`; **Comissão** (singular) resolve para `comissao`.
4. Exclusão com vínculos → erro de negócio, sem apagar contas.
5. Exclusão de `sistema=true` → erro.
6. Visualizador: só GET catálogo / listagens.

## Transições de estado

```text
[Categoria/Sub custom] --create--> ativa no catálogo
ativa --rename--> ativa (mesmo codigo)
ativa (sem vínculos) --delete--> removida
ativa (com vínculos) --delete--> rejeitada
[Sub sistema] --rename--> ativa
[Sub sistema] --delete--> rejeitada
[Sub bonus fábrica] --seed--> nome Bônus (se ainda Comissões ou Bônus & Comissão)
```

## Formulario aberto (estado de UI, não persistido)

```text
excluir categoria selecionada (ok) --> categoria = adm_financeiro, subcategoria vazia
excluir sub RH selecionada (ok)    --> subcategoria vazia, categoria = recursos_humanos
```
