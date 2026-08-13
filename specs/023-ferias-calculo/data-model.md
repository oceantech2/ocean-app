# Data Model: Correção do cálculo de férias

**Feature**: `023-ferias-calculo` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md)

Sem novas tabelas ou migrations. Direito e saldo são **visões derivadas** de `Ferias` agrupadas por `(colaborador_id, ano)`.

## Entidades persistidas

### Ferias (`ferias`) — inalterada

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | int | PK |
| `colaborador_id` | int | FK colaborador, obrigatório |
| `ano` | int | Ano aquisitivo informado pelo usuário |
| `dias_direito` | int | ≥ 0. No primeiro período do grupo costuma ser 30; nas demais parcelas, 0 |
| `dias_tirados` | int | ≥ 0; default 0 |
| `data_inicio` | date \| null | Opcional |
| `data_fim` | date \| null | Opcional; se ambas preenchidas, `data_fim ≥ data_inicio` |
| `aprovado` | bool | Default false |
| `criado_em` | datetime | Auditoria |

**Invariantes de persistência**:
1. Se `data_inicio` e `data_fim` não nulos ⇒ `data_fim ≥ data_inicio` (senão 422).
2. Sobreposição de intervalos **não** é invariante de banco (permitida).
3. Não há unicidade `(colaborador_id, ano)` — fracionamento = N linhas.

## Entidades derivadas (só leitura / client)

### ResumoFeriasAno

Chave: `(colaborador_id, ano)`.

| Campo | Derivação |
|-------|-----------|
| `direito_anual` | `max(dias_direito)` do grupo |
| `total_tirado` | `sum(dias_tirados)` do grupo (pendentes **e** aprovados) |
| `saldo_anual` | `direito_anual − total_tirado` (pode ser negativo) |
| `tem_pendencia` | existe parcela com `aprovado === false` |

### Saldo disponível no formulário

Seja `outros` = parcelas do mesmo colaborador/ano **exceto** a que está sendo editada (vazio na criação).

| Situação | `direito` usado | `disponivel` |
|----------|-----------------|--------------|
| Criação, `outros` vazio | `dias_direito` do form (padrão 30) | `direito − 0` |
| Criação, já há parcelas | `max(outros.dias_direito)` (form de direito desabilitado / 0) | `direito − sum(outros.dias_tirados)` |
| Edição | `max(max(outros.dias_direito), dias_direito do form)` | `direito − sum(outros.dias_tirados)` |

Os `dias_tirados` do form **não** entram em `disponivel` (a parcela em edição pode reatribuir esses dias).

## Funções de domínio

### `dias_corridos(inicio, fim)`

- Sem uma das datas → não calcula (0 / nulo).
- `fim < inicio` → inválido (não retorna positivo).
- Caso contrário → número de dias civis inclusivos.

### `intervalos_sobrepoem(a, b)`

Ambos com início e fim: `inicio_a ≤ fim_b` **e** `inicio_b ≤ fim_a`.

### `destino_transferencia(excluido, restantes)`

- `restantes` vazio → nenhum destino (delete simples).
- Se `excluido.dias_direito > max(restantes.dias_direito)` → parcela de menor `id` em `restantes`.
- Senão → nenhum destino.

## Estados de aprovação

```text
Pendente (aprovado=false) ──aprovar──► Aprovado
Aprovado ──rejeitar──► Pendente
Qualquer ──excluir──► (sumido; possível transferência de direito)
```

Pendentes **consomem** `total_tirado`.

## Ciclo de vida do direito anual

1. Primeiro INSERT do grupo: `dias_direito = 30` (ou valor do admin).
2. INSERT seguinte: `dias_direito = 0`; direito do grupo permanece o max.
3. UPDATE do registro com o max: admin pode alterar o direito; novo max recalcula o resumo.
4. DELETE do detentor do max estrito: UPDATE da parcela de menor `id` restante com esse valor, depois DELETE.
5. DELETE do último registro: grupo desaparece.

## Relacionamentos

```text
Colaborador 1 ──* Ferias (parcela)
                 └── agrupa por ano ──► ResumoFeriasAno
```
