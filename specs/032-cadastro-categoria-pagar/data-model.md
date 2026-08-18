# Data Model: Contas a Pagar — Cadastro de Nova Categoria

**Feature**: `032-cadastro-categoria-pagar` | **Date**: 2026-08-17  
**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

## Visão geral

```text
[ Formulário Contas — select Categorias ]
        |  GET catálogo     POST nome (admin)
        v
[ categorias_pagar_cadastradas ] --codigo cat_{id}--> [ contas_pagar.categoria ]
        |                                              |
        +-- labels / import / validar ------------------+
        v
[ GET /relatorios/custo-por-categoria ]  (label da cadastrada)
[ Impostos / Retiradas ]                 (filtros oficiais inalterados)
```

Catálogo **oficial** permanece em `categorias_contas.py` (constantes). Esta feature **não** converte oficiais para tabela e **não** altera linhas existentes de `contas_pagar` no deploy.

## Entidades

### Categoria oficial (existente, não persistida nesta tabela)

Conjunto fechado e ordenado vigente no módulo de taxonomia (códigos + labels). RH continua exigindo subcategoria oficial. Sem CREATE/UPDATE/DELETE pelo usuário.

### Categoria cadastrada (nova)

Tabela `categorias_pagar_cadastradas`.

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|--------|
| `id` | int PK | sim | Serial |
| `codigo` | VARCHAR(64) unique | sim | Estável: `cat_{id}` após insert; gravado em `contas_pagar.categoria` |
| `nome` | VARCHAR(20) | sim | Texto após trim; preserva capitalização e acentos do admin |
| `criado_em` | datetime | sim | Default agora |
| `criado_por` | VARCHAR | não | Login do admin, se trivial no padrão de auditoria |

Índices:
- UNIQUE `codigo`
- UNIQUE em `LOWER(nome)` (unicidade case-insensitive)

Sem `ativo`, sem `subcategoria`, sem FK para contas (histórico permanece se um dia houver exclusão — fora desta entrega).

### Conta a Pagar (existente)

| Campo | Mudança nesta feature |
|-------|------------------------|
| `categoria` | Aceita códigos oficiais **ou** `cat_{id}` cadastrado. VARCHAR(64) já existente — sem ALTER de tamanho se `cat_{n}` couber |
| `subcategoria` | Continua só para RH oficial; **null** nas cadastradas |
| `categoria_pendente` | Inalterado; cadastro novo não marca pendência |

## Regras de validação (nome novo)

1. `nome` após trim: 1–20 caracteres.
2. Cada caractere ∈ letras (Unicode, com acento) ∪ dígitos ∪ espaço ∪ `-` ∪ `/`.
3. Recusar se `nome` casefold igual a: qualquer label oficial de primeiro nível; qualquer label de subcategoria oficial de RH; qualquer `nome` já cadastrado.
4. Recusar se `normalizar_codigo(nome)` ∈ códigos oficiais de categoria ou de subcategoria RH.
5. Categoria cadastrada **nunca** exige nem aceita subcategoria.

## Validação de classificação (conta)

| Operação | Regra |
|----------|--------|
| POST conta / import | `categoria` ∈ oficiais ∪ cadastradas. Se oficial RH → sub obrigatória como hoje. Se cadastrada → `subcategoria` null |
| PUT conta | Regras atuais de legado/pendência **mais** permitir código cadastrado |
| GET filtro `categoria=cat_N` | Só contas com esse código |

## Transições

```text
[catálogo só oficiais] --POST /categorias nome válido--> [cadastrada cat_{id}]
[form aberto] --201--> campo categoria = cat_{id} (selecionado)
[conta nova] --POST contas categoria=cat_{id}--> classificada; demais contas intactas
[cadastrada] --DELETE--> não existe nesta entrega
```

## Agregações

| Consumidor | Comportamento |
|------------|----------------|
| Custo por categoria | `GROUP BY categoria` vigente; `label` via catálogo (nome da cadastrada ou label oficial) |
| Impostos | `categoria = impostos` — cadastradas não entram |
| Retiradas | RH + `retirada_socios` — cadastradas não entram |
| Ordem no select/filtro | Oficiais (ordem do módulo) depois cadastradas `ORDER BY nome` (collation padrão do banco / locale) |
