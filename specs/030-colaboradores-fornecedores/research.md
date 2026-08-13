# Research: Colaboradores e Fornecedores

**Feature**: `030-colaboradores-fornecedores` | **Date**: 2026-08-13

## 1. Uma tabela com tipo vs tabela `fornecedores`

**Decision**: Manter a tabela `colaboradores` e adicionar coluna `tipo` (`colaborador` | `fornecedor`). Não criar tabela nem router `/api/fornecedores`.

**Rationale**: Constituição V — menor solução. Soft delete, auditoria, documentos e o `permKey` `colaboradores` já existem. Duas visões na mesma tela mapeiam para o mesmo CRUD com query `tipo`. FKs de bônus/férias/NFs/patrimônio continuam apontando para a mesma PK.

**Alternatives considered**: Tabela `fornecedores` isolada (mais seguro contra vazamento, mas duplica CRUD, migração e permissão). STI em tabela `pessoas` com rename (quebra desnecessária).

**Mitigação de vazamento**: `GET /api/colaboradores` **default** `tipo=colaborador`. Telas de RH não passam `tipo`. A visão Fornecedores e o select de Contas a Pagar passam `tipo=fornecedor`. Escrita de bônus/férias/patrimônio recusa id cujo `tipo` não seja colaborador se o id for enviado (defesa; as UIs não listam).

## 2. Identificador fiscal (`cpf` atual vs `documento`)

**Decision**: Coluna canônica `documento` (somente dígitos, 11 CPF / 14 CNPJ). `tipo_documento` = `cpf` | `cnpj`. `razao_social` obrigatória na API só se `tipo_documento=cnpj`. A coluna `cpf` permanece preenchida com o documento formatado (ou dígitos) para não quebrar import/export xlsx e código que ainda lê `cpf`; deixa de ser UNIQUE.

**Rationale**: CNPJ não cabe no UNIQUE atual de CPF (`String(14)` formatado de CPF é 14; CNPJ formatado tem 18). Dígitos normalizados tornam unicidade e validação estáveis.

**Alternatives considered**: Reusar só `cpf` alargando para VARCHAR(18) (nome enganoso para CNPJ). Duas colunas `cpf` e `cnpj` mutuamente exclusivas (mais nulos e regras).

## 3. Unicidade (clarify: ativos do mesmo tipo)

**Decision**: Índice único parcial PostgreSQL:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS ux_colaboradores_tipo_documento_ativo
ON colaboradores (tipo, documento)
WHERE ativo IS TRUE;
```

Mesmo documento em tipos diferentes é permitido. Inativo não bloqueia reuso no mesmo tipo.

**Rationale**: FR-012. Unique global atual em `cpf` impede colaborador e fornecedor com o mesmo CPF.

**Alternatives considered**: Unique incluindo inativos (impede recadastro após desligamento). Unique só em `documento` (viola cadastros distintos).

## 4. Campos de RH nullable

**Decision**: `cargo`, `salario` e `data_nascimento` passam a aceitar NULL no banco. Pydantic exige esses campos quando `tipo=colaborador`. Fornecedor não os envia (ou envia null). Import xlsx continua exigindo os três e grava `tipo=colaborador`.

**Rationale**: Fornecedor não tem RH (FR-010). NOT NULL no banco bloquearia o insert.

**Alternatives considered**: Sentinelas (`cargo='-'`, `salario=0`, nascimento 1900-01-01`) — polui folha e filtros.

## 5. Tipo imutável

**Decision**: `tipo` só no POST. PUT/PATCH ignora ou responde 400 se `tipo` vier diferente do persistido. Sem endpoint de conversão.

**Rationale**: Clarify. Evita salário visível em fornecedor.

## 6. Vínculo em contas a pagar

**Decision**: `contas_pagar.fornecedor_id` INTEGER NULL, FK para `colaboradores.id`. Na criação/atualização: se informado, o alvo DEVE ter `tipo=fornecedor` e `ativo=true` (exceto manter vínculo já existente com fornecedor depois inativado — não obrigar limpar). Resposta inclui `fornecedor_id`, `fornecedor_nome`, `fornecedor_ativo`.

**Rationale**: FR-015/016, vínculo opcional. Calendário já lista contas; basta usar `fornecedor_nome` no título do evento.

**Alternatives considered**: Texto livre “fornecedor” (sem cadastro). Obrigar fornecedor em conta nova (rejeitado no clarify).

## 7. Validação CPF/CNPJ

**Decision**: Replicar no backend a lógica de dígitos verificadores (CPF já existe no frontend; CNPJ algoritmo padrão Receita). Recusar tamanho errado e sequência repetida. Frontend mascara e valida antes do POST (toast), backend é a fonte da verdade (400).

**Rationale**: SC-002/SC-003. Import xlsx já confia em CPF; não precisa aceitar CNPJ no xlsx nesta feature.

## 8. Navegação e permissão

**Decision**: Um item de menu `Colaboradores`. Duas visões (abas ou equivalente visual do produto) na mesma `Colaboradores.tsx`. Sem `permKey` novo: quem vê colaboradores vê fornecedores. Contas a pagar usa permissão `contas` para o select.

**Rationale**: Clarify opção A.

## 9. Soft delete de fornecedor

**Decision**: Reusar `DELETE /api/colaboradores/{id}` (ativo=false). UI de fornecedor: confirmação “Desativar …?” sem data de desligamento. Filtro de inativos igual ao de colaboradores.

**Rationale**: Constituição IV. FR-010 (sem fluxo de desligamento de RH).

## 10. GET por id e listagens mistas

**Decision**: `GET /{id}` devolve o registro mesmo se o tipo não for o default da lista (edição/vínculo). Não há `tipo=todos` na listagem da tela de cadastro — cada visão pede o seu tipo.

**Rationale**: Evita misturar listas (SC-005).
