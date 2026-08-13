# Research: Contas a Receber — NF opcional

**Feature**: `016-contas-receber-nf-opcional` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md)

## R-001 — Como persistir “sem NF” sem quebrar unicidade

**Decision**: Gravar ausência de número como `NULL`. Manter o unique existente em `nfs.numero`. Nunca persistir `''`.

**Rationale**: No PostgreSQL, `UNIQUE` trata cada `NULL` como distinto — várias contas sem NF são permitidas. String vazia `''` ocuparia **uma** linha no unique e bloquearia a segunda conta sem número (quebra FR-007).

**Alternatives considered**:
- Índice único parcial `WHERE numero IS NOT NULL` — desnecessário se só `NULL` representa ausência.
- Sentinel (`"SEM-NF"`, UUID) — inventa número (quebra FR-008) e colide com Maggo/unicidade.
- Remover unique — reabre duplicidade da 013.

## R-002 — Normalização de entrada

**Decision**: `trim`; se o resultado for vazio, tratar como ausente (`None`/`null`). Espaços-only = sem NF.

**Rationale**: Spec (edge case) e 013 já usam trim. Unificar no helper `nf_duplicidade` evita 422 no create e unique em `''`.

**Alternatives considered**:
- Rejeitar espaços-only com 422 — pior UX; o pedido é “não obrigatória”.
- Trim só no frontend — backend continuaria recusando.

## R-003 — Ajuste de `garantir_numero_livre`

**Decision**: Se número ausente após trim, **retornar `None`** e **não** lançar 422. Checagem 409 só quando há número.

**Rationale**: Hoje a função lança 422 `"Número da conta a receber é obrigatório"` — é o bloqueio principal no POST. PUT que limpa NF também precisa desse caminho.

**Alternatives considered**:
- Função nova só para create — duplicaria lógica; PUT tem o mesmo caso (apagar NF).

## R-004 — Schema Pydantic e tipo TS

**Decision**: `numero: Optional[str] = None` em `NFBase`/`NFCreate`/`NFResponse`; validator `""` → `None`. Frontend: `numero: string | null`; payload `form.numero.trim() || null`.

**Rationale**: `NFBase.numero: str` obriga o campo no create e na resposta. Sem isso, POST sem `numero` cai em 422 do Pydantic antes da rota.

**Alternatives considered**:
- Campo required com default `""` — volta ao problema do unique em vazio.

## R-005 — Edição: enviar `null` para limpar NF

**Decision**: No PUT de origem **manual**, sempre enviar `numero` (`string` ou `null`). Backend: se `numero` veio no body e normalizou vazio → `NULL`. Maggo: não enviar `numero`.

**Rationale**: Hoje o client só manda `numero` se `numeroTrim && numeroTrim !== editando.numero`. Apagar o campo **não persiste**. US2 exige poder remover NF.

**Alternatives considered**:
- Flag `limpar_numero` — API extra sem ganho.

## R-006 — Migração inline

**Decision**: Em `_migrar()` (`main.py`): `ALTER TABLE nfs ALTER COLUMN numero DROP NOT NULL`. Modelo SQLAlchemy: `nullable=True`, `unique=True`.

**Rationale**: Padrão do projeto (sem Alembic). Unique permanece; só cai o `NOT NULL`.

**Alternatives considered**:
- Recriar tabela — destrutivo e fora do padrão.

## R-007 — Merge Maggo e importação

**Decision**: Merge Maggo continua por `numero` **não vazio**. Contas manuais com `numero IS NULL` não entram na colisão por número. Importação XLSX **fora desta feature** (FR-012); se uma linha de import vier sem número, permanece o comportamento atual (não reabrir import).

**Rationale**: Spec: manuais sem NF não colidem com Maggo. Stub Maggo sempre traz número.

**Alternatives considered**:
- Match Maggo por razão social — fora de escopo e ambíguo.

## R-008 — UI

**Decision**: Rótulo `NF` (sem `*`). Validação client: não exigir `numero`. Listagem e modal de pagamento: `nf.numero || '—'`. Toast de create: não citar NF como obrigatória.

**Rationale**: FR-004 e FR-008. `—` é o padrão já usado em campos vazios do produto.

**Alternatives considered**:
- Placeholder “sem nota” no input — opcional; `—` na lista basta.

## Resolução de NEEDS CLARIFICATION

Nenhum item do Technical Context ficou como NEEDS CLARIFICATION. Premissas da spec (012/013, papéis, Caixa) reutilizadas.
