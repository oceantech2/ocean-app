# Research: Fornecedores — cadastro unificado

**Feature**: `043-fornecedores-cadastro` | **Date**: 2026-08-27

## R1 — Flag de elegibilidade em telas de equipe

**Decision**: Adicionar coluna booleana `elegivel_equipe` em `colaboradores`.

**Rationale**: Após unificação, todos os registros terão `tipo = 'fornecedor'`. A spec exige que apenas ex-colaboradores apareçam em férias, DH, bônus e patrimônio. Um discriminador persistido evita heurísticas frágeis (ex.: inferir por cargo preenchido).

**Migração**: `UPDATE colaboradores SET elegivel_equipe = true WHERE tipo = 'colaborador'`; demais registros `false`. Novos fornecedores criados pela UI recebem `elegivel_equipe = false`.

**Alternatives considered**:
- Manter `tipo = colaborador` internamente → rejeitado (contradiz FR-003 de unificar como fornecedor).
- Filtrar por presença de cargo/salário → rejeitado (falso positivo em legados incompletos; falso negativo se limpar RH).

## R2 — Nome do campo operacional Fixo/Spot

**Decision**: Coluna `tipo_fornecedor` (`fixo` | `spot`), exibida na UI como **Tipo**.

**Rationale**: A coluna `tipo` já significa cadastro colaborador/fornecedor (legado). Reutilizar `tipo` quebraria queries e validações existentes. `tipo_fornecedor` é explícito e mapeia ao vocabulário da spec.

**Migração**: `tipo_fornecedor = 'fixo'` para todos os registros existentes; NOT NULL após backfill.

**Alternatives considered**:
- Renomear `tipo` → `tipo_cadastro` e usar `tipo` para Fixo/Spot → rejeitado (diff grande, risco em FKs e auditoria).
- Enum único com valores mistos → rejeitado (ambiguidade).

## R3 — Dados de pessoa física do CNPJ

**Decision**: Quatro colunas dedicadas: `pf_nome`, `pf_cpf`, `pf_endereco`, `pf_data_nascimento`.

**Rationale**: O cadastro já usa `nome`, `endereco_completo` e `data_nascimento` para PF ou bloco RH legado. Campos prefixados `pf_` evitam colisão semântica com nome fantasia PJ e endereço de equipe.

**Validação**: Obrigatórios apenas quando `tipo_documento = cnpj` **no save** (create/update). CNPJ legado sem PF: listagem e Contas a Pagar liberados; PUT recusa até PF completa (clarify Q5).

**Unicidade**: Índice parcial único em `pf_cpf` entre ativos quando preenchido (análogo ao documento principal).

**Alternatives considered**:
- Tabela filha `representantes_legais` → rejeitado (YAGNI; 1 PF por PJ nesta feature).
- Reutilizar `data_nascimento` do registro → rejeitado (conflita com RH legado CPF).

## R4 — Unicidade de documento após unificação

**Decision**: Substituir índice `(tipo, documento)` por índice único parcial em `documento` WHERE `ativo = true`.

**Rationale**: Com um único `tipo` efetivo (`fornecedor`), duplicidade entre colaborador e fornecedor deixa de existir. Simplifica FR-012.

**Alternatives considered**:
- Manter índice composto → redundante após migração.

## R5 — Rota, menu e permissões

**Decision**:
- `paginasCatalogo`: `path = '/fornecedores'`, `label = 'Fornecedores'`, `desc` atualizada.
- Manter `key = 'colaboradores'` (permKey) para não invalidar permissões salas em `configuracoes` / JWT.
- `App.tsx`: rota `/fornecedores` via catálogo; redirect `/colaboradores` → `/fornecedores`.

**Rationale**: Atende FR-001/FR-001a e SC-006 com mínima ruptura em ACL persistida.

**Alternatives considered**:
- Renomear permKey para `fornecedores` → rejeitado nesta feature (migração de permissões fora de escopo).

## R6 — API de listagem

**Decision**:
- `GET /colaboradores` sem filtro de `tipo` retorna todos os fornecedores (equivalente a `tipo=fornecedor` após migração).
- Novo query param `elegivel_equipe: bool` para telas de RH.
- `tipo=colaborador` no query: aceito temporariamente como alias de `elegivel_equipe=true` (compat) ou removido com filtro explícito — **implementação**: `elegivel_equipe=true` documentado; chamadas RH migradas para esse param; deprecar `tipo=colaborador` na listagem.

**Rationale**: Contas a Pagar lista todos os ativos; RH lista só legados.

## R7 — Formulário e validação backend

**Decision**:
- `POST`: força `tipo=fornecedor`, `elegivel_equipe=false`; exige `tipo_fornecedor`; valida PF se CNPJ; **não** exige cargo/salário/data_nascimento RH.
- `PUT` com `elegivel_equipe=true`: valida bloco RH (cargo, salário, data_nascimento) como hoje para CPF legado; valida PF se CNPJ.
- `PUT` com `elegivel_equipe=false`: ignora/strip campos RH no body; valida PF se CNPJ.

**Rationale**: Espelha clarify sobre RH condicional e data de nascimento.

## R8 — Importação XLSX

**Decision**: Import continua na mesma rota; cria registros `tipo=fornecedor`, `tipo_fornecedor=fixo` (ou coluna **Tipo** na planilha se presente: Fixo/Spot). Define `elegivel_equipe=true` quando a linha trouxer cargo **e** salário **e** data_nascimento válidos (import de equipe); caso contrário `false`.

**Rationale**: Alinha FR-013 e permite import operacional sem abrir telas de equipe para fornecedores spot importados sem RH.

**Alternatives considered**:
- Import sempre `elegivel_equipe=false` → rejeitado (quebraria fluxo de planilha de equipe existente).

## R9 — Renomear componente de página

**Decision**: Renomear `Colaboradores.tsx` → `Fornecedores.tsx` e atualizar imports; manter endpoint REST `/api/colaboradores` (tabela e rota API inalteradas nesta feature).

**Rationale**: Consistência de código com nomenclatura de produto; menor risco que renomear tabela PostgreSQL.

**Alternatives considered**:
- Novo endpoint `/fornecedores` → rejeitado (duplicidade REST sem ganho).
