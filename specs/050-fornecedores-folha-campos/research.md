# Research: Fornecedores — campos opcionais de PF, período, salário e total da folha

**Feature**: `050-fornecedores-folha-campos` | **Date**: 2026-09-06

## R1 — Validação parcial da pessoa física do CNPJ

**Decision**: Em create/update com `tipo_documento=cnpj`, exigir apenas `pf_nome` e `pf_endereco` (não vazios). `pf_cpf` e `pf_data_nascimento` opcionais; se preenchidos, validar CPF (dígitos + unicidade entre ativos) e data ≤ hoje.

**Rationale**: Spec + clarify Q2. Remove bloqueio operacional sem abrir cadastro PJ sem responsável mínimo.

**Alternatives considered**:
- Toda seção PF opcional → rejeitado (clarify A: Nome/Endereço obrigatórios).
- Manter PF completa obrigatória → rejeitado (pedido explícito).

## R2 — Salário e datas para todos os fornecedores

**Decision**: Persistir e aceitar `salario`, `data_admissao` (UI: Data de início) e `data_desligamento` (UI: Data de término) em **qualquer** fornecedor, inclusive `elegivel_equipe=false`. Campos opcionais; salário ≥ 0 quando informado; se ambas as datas existem, término ≥ início.

**Rationale**: Clarify Q1. Novos Fixo precisam de salário para o Total da folha. Prevalece sobre a regra 043 de “strip RH em não-legados”, **somente** para esses três campos.

**Impacto no código atual**: Em `colaboradores.py`, o update/create que anula `salario` / datas para não-legados deve passar a **permitir** esses campos. Demais RH (cargo, benefício, `data_nascimento` de equipe, histórico) continuam restritos a legado (FR-013).

**Legado (`elegivel_equipe`)**: cargo e `data_nascimento` (CPF) podem permanecer obrigatórios como hoje; **salário deixa de ser obrigatório** também no legado (alinhado a “opcional para todos”).

**Alternatives considered**:
- Só Tipo Fixo → rejeitado (clarify A).
- Só legado → rejeitado (impede folha de novos Fixo).

## R3 — Rótulos Data de início / Data de término

**Decision**: UI usa rótulos **Data de início** e **Data de término**; binding nos campos existentes `data_admissao` e `data_desligamento`. Sem novas colunas.

**Rationale**: Clarify Q3. Evita migração e duplicidade de dados.

**Alternatives considered**:
- Manter “Admissão/Desligamento” → rejeitado (vocabulário da spec).
- Colunas novas `data_inicio`/`data_termino` → rejeitado (YAGNI).

## R4 — Card Total da folha no cliente

**Decision**: Calcular no `Fornecedores.tsx` a partir da lista já carregada:  
`sum(salario)` onde `ativo === true` e `tipo_fornecedor === 'fixo'` (tratar `null`/`undefined` como 0). Filtros de busca/cargo da tabela **não** reduzem a base do card — usar a coleção completa de ativos carregada (ou, se a API pagina, carregar ativos suficientes / recalcular sobre o conjunto completo usado para o card).

**Rationale**: Spec FR-008–010; padrão antigo da visão Colaboradores (030). Sem endpoint novo reduz escopo.

**Nota de paginação**: Se `GET /colaboradores` vier paginado e incompleto, o card ficaria subestimado. **Decisão**: garantir que a página carregue todos os registros necessários ao card (ex.: listar ativos sem limit restritivo, como já costuma fazer a tela, ou somar sobre `fornecedores` state completo antes do filtro de busca). Preferir estado `listaCompleta` vs `filtrados`.

**Alternatives considered**:
- `GET /colaboradores/resumo-folha` → rejeitado nesta feature (YAGNI; volume interno baixo).
- Somar só linhas filtradas → rejeitado (spec: total global de ativos Fixo).

## R5 — Sem migração de schema

**Decision**: Nenhuma `ALTER TABLE`. Colunas e índices de `pf_cpf` / documento já existem (043).

**Rationale**: Apenas mudança de regras de validação e UI.

## R6 — Importação CSV/Excel

**Decision**: Sem mudança obrigatória de colunas; se salário/datas vierem na origem, gravar; ausência não falha. PF do CNPJ na importação, se existir, segue a mesma validação parcial (Nome/Endereço se CNPJ). Fora do caminho crítico se o import atual for só CPF.

**Rationale**: Edge case da spec; não bloquear o MVP do formulário + card.
