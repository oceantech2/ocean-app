# Research: Contas a Receber — Novos nomes dos tipos

**Feature**: `017-contas-receber-tipos` | **Date**: 2026-08-12  
**Spec**: [spec.md](./spec.md)

## R-001 — Como gravar os três tipos oficiais

**Decision**: Estender o enum `TipoFechamento` com `PARCELAMENTO = "parcelamento"`. Valores oficiais: `retainer`, `sucesso`, `parcelamento`. Coluna `tipo_abertura_fechamento` **permanece** no schema, mas após a conversão é sempre `NULL` e deixa de ser classificação oficial.

**Rationale**: `nfs.tipo` e `dh.tipo_fechamento` já usam o mesmo enum nativo PostgreSQL. Acrescentar um valor é o menor passo. Dropar `tipo_abertura_fechamento` exigiria alterar Maggo stub, schemas e merges sem ganho de negócio nesta entrega.

**Alternatives considered**:
- Só rótulos na UI (sem gravar) — rejeitado na clarify (Q2).
- VARCHAR livre no lugar do enum — perde validação e foge do padrão do modelo.
- `DROP COLUMN tipo_abertura_fechamento` — mais risco; Maggo ainda envia o campo.

## R-002 — Ordem da conversão de dados (one-shot)

**Decision**: Em `_migrar()`:

1. `ALTER TYPE tipofechamento ADD VALUE IF NOT EXISTS 'parcelamento'` em **AUTOCOMMIT** (mesmo padrão de `statusnf` / `CANCELADA`).
2. Conversão em transação **somente se ainda houver** `tipo_abertura_fechamento IN ('abertura','fechamento')` **ou** (nenhuma linha `parcelamento` e ainda existirem `sucesso` no sentido antigo — ver gate abaixo).
3. Ordem dos UPDATEs (obrigatória):
   1. `tipo = 'sucesso'` (sem ser retainer+fechamento) → `parcelamento`
   2. `tipo = 'retainer' AND tipo_abertura_fechamento = 'fechamento'` → `sucesso`
   3. retainer + abertura (ou retainer sem subtipo) permanece `retainer`
   4. `tipo_abertura_fechamento = NULL` em `nfs` e `dh`

**Gate de idempotência**:

| Situação | Ação |
|----------|------|
| Existe `abertura` ou `fechamento` em nfs/dh | Rodar os 4 passos (sucesso antigo ainda é distinguível do novo) |
| Não existe subtipo **e** não existe nenhuma linha `parcelamento` | Tratar todo `sucesso` como antigo → `parcelamento` (base que nunca usou abertura/fechamento) |
| Já existe `parcelamento` e não há subtipo | Skip — já migrado |

**Rationale**: Se inverter 1 e 2, fechamento vira `sucesso` e no passo seguinte vira `parcelamento` (mistura os grupos). Se repetir o UPDATE de `sucesso` → `parcelamento` **depois** de anular o subtipo, o Sucesso novo (ex-fechamento) seria destruído.

**Alternatives considered**:
- Flag `tipos_v2` em tabela nova — overkill.
- Recriar tabelas — destrutivo.

## R-003 — Maggo na entrada

**Decision**: Stub **não muda** o payload (continua `tipo` + `tipo_abertura_fechamento` na semântica antiga). Função única `_parse_tipo_maggo` passa a devolver só o enum oficial e `tipo_ab=None`:

| Payload Maggo | Gravado |
|---------------|---------|
| `retainer` + `abertura` (ou subtipo ausente) | `retainer` |
| `retainer` + `fechamento` | `sucesso` |
| `sucesso` (qualquer outro) | `parcelamento` |
| tipo desconhecido | não cria/atualiza **esse** item; demais seguem; não inventar tipo |

Create/update **manual** aceitam apenas `retainer` \| `sucesso` \| `parcelamento` (sem subtipo).

**Rationale**: Clarify Q3. O stub é o contrato antigo; a Maggo real fica fora de escopo.

**Alternatives considered**:
- Stub já enviar nomes novos — quebraria o teste de conversão na entrada.
- Recusar payload antigo — bloquearia o merge atual.

## R-004 — Relatórios e Dashboard (dois grupos → três)

**Decision**: `GET /api/relatorios/fechamentos-por-tipo` passa a retornar `{ retainer, sucesso, parcelamento, total }`. Relatórios: pizza e texto com três fatias. Dashboard já chama o endpoint e descarta a UI (`const [, setFechamentos]`); **passar a exibir** o mix de três grupos (US3 / FR-012).

**Rationale**: Hoje `retainer` agrega abertura+fechamento e `sucesso` é o grupo que vira Parcelamento. Manter duas fatias faria **Sucesso** significar coisas diferentes.

**Alternatives considered**:
- Só mudar Relatórios — falha o cenário do Dashboard na spec.
- Manter agregação antiga com rótulos novos — incorreto semanticamente.

## R-005 — DH e e-mails novos

**Decision**: `dh.tipo_fechamento` usa o mesmo enum. Formulário DH: três opções (Retainer / Sucesso / Parcelamento), sem abertura/fechamento. Assunto gerado no POST (e preview na UI): `DH :: {empresa} :: {posição} :: {Retainer|Sucesso|Parcelamento}`. Totais da página: três cards. E-mails já persistidos em `assunto` **não** são reescritos.

**Rationale**: Clarify Q4. O envio SMTP ainda está comentado; o assunto gravado **é** o conteúdo do e-mail. Reescrever linhas antigas violaria a spec.

**Alternatives considered**:
- Só mudar a UI e deixar o backend gerar “retainer (abertura)” — inconsistente.

## R-006 — Calendário

**Decision**: **Nenhuma alteração**. A página não exibe tipo de fechamento (eventos são NF vs conta a pagar, título = número + razão social).

**Rationale**: FR-011 aplica-se a “todo ponto visível que **hoje** mostre o tipo”. Inventar o tipo no calendário seria escopo extra (constituição V).

**Alternatives considered**:
- Incluir tipo no título do evento — fora do pedido operacional e da UI atual.

## R-007 — UI Contas a Receber

**Decision**: Select com `value` `retainer` \| `sucesso` \| `parcelamento` (acabar com `retainer|abertura`). Labels: Retainer, Sucesso, Parcelamento. Maggo: input readonly com o label oficial. Export CSV: mesmos nomes. Default do create: `retainer`.

**Rationale**: O `tipo_combined` com pipe existia só para o subtipo. Default `retainer` é o primeiro da nova taxonomia (o default antigo `sucesso` viraria Parcelamento e surpreenderia).

**Alternatives considered**:
- Default `parcelamento` (mapeamento do default atual) — tecnicamente fiel, pior UX.

## R-008 — PostgreSQL enum vs SQLAlchemy

**Decision**: `create_all` em banco novo já cria o enum com os três membros. Em banco existente, `ADD VALUE IF NOT EXISTS` em AUTOCOMMIT **antes** dos UPDATEs.

No projeto, `statusnf` foi estendido com o **nome** do membro (`'CANCELADA'`), não com o `.value` (`'cancelada'`). Na implementação, conferir `SELECT enumlabel FROM pg_enum JOIN pg_type ON ... WHERE typname = 'tipofechamento'` e usar o **mesmo estilo** já gravado (`RETAINER`/`SUCESSO` vs `retainer`/`sucesso`). O JSON da API continua expondo os `.value` em minúsculas (`retainer`, `sucesso`, `parcelamento`).

**Rationale**: Já documentado em `main.py` para `statusnf`. Errar o label quebra o UPDATE one-shot.

**Alternatives considered**:
- `native_enum=False` (VARCHAR) — migração maior, fora do mínimo.

## Resolução de NEEDS CLARIFICATION

Nenhum item do Technical Context ficou como NEEDS CLARIFICATION. Clarificações da spec (escopo de telas, persistência, Maggo, e-mails) aplicadas aqui.
