# Research: Filtros e exclusão de propostas no Proposal

## R1. Filtros no servidor

- **Decisão**: Aplicar os filtros na consulta de `listar_propostas`, antes do `count()` e da paginação.
- **Rationale**: A lista é paginada (50 por página); filtrar no navegador mostraria só a página aberta (FR-006).

## R2. Texto literal em `ILIKE`

- **Decisão**: Usar o helper `_contem(valor)`, que escapa `\`, `%` e `_` e devolve `%valor%`, com `ILIKE ... ESCAPE '\'`.
- **Alternativas consideradas**: busca sem acentos com `unaccent` (descartada: exige extensão, e os nomes de empresas raramente variam em acento).

## R3. Projeto no formato novo (`projetos` JSONB) e antigo (`projeto_nome`)

- **Decisão**: `projeto_nome ILIKE :q OR EXISTS (SELECT 1 FROM jsonb_array_elements(propostas.projetos) p WHERE p->>'nome' ILIKE :q ESCAPE '\')`, com o `EXISTS` montado via `text()` e bindparam.
- **Alternativas consideradas**: `CAST(projetos AS TEXT) ILIKE` (descartada: casaria com chaves e valores dos investimentos, como "retainer").

## R4. Data exibida

- **Decisão**: Usar `COALESCE(data_proposta, DATE(timezone('America/Sao_Paulo', timezone('UTC', emitida_em))))`, com limites inclusivos.
- **Rationale**: `emitida_em` é UTC sem fuso, e a coluna Data mostra `data_proposta` ou `emitida_em` convertida para São Paulo (`formatarData`). O filtro precisa usar a mesma data que o usuário vê (FR-004).

## R5. "Criado por"

- **Decisão**: Filtrar por igualdade em `criado_por_usuario` (texto gravado, sobrevive à exclusão do usuário). `GET /autores` devolve `DISTINCT criado_por_usuario ORDER BY 1`. Para quem não é admin, o parâmetro é ignorado, porque a consulta já fica restrita a `criado_por_id = user.id`.

## R6. Exclusão

- **Decisão**: `DELETE /{id}` com `user["papel"] == "admin"` (senão **403**). Usa `_obter_visivel` (**404** se não existir), registra a auditoria antes do delete (`registrar_auditoria(db, user["usuario"], "excluir", "Proposta", id, "{codigo} — {cliente} ({status_efetivo})")`), faz `db.delete(p)` e devolve **204**.
- **Rationale**: Os relacionamentos usam `passive_deletes=True` e as FKs são `CASCADE`, então assinatura e edições saem junto (FR-010). A auditoria do ERP é a trilha já usada para exclusões (FR-012).
- **Alternativas consideradas**: exclusão lógica (descartada pelo usuário).

## R7. UI

- **Decisão**: A barra de filtros fica acima da tabela da Lista. Os campos de texto aplicam o filtro com debounce de 300 ms, e qualquer mudança volta para a página 1. O select de modelos tem os modelos de `MODELOS` mais "Proposta simples". "Criado por" só aparece para admin, com as opções de `listarAutores()`. A exclusão aparece como botão vermelho na coluna Ações (admin) e no Detalhe. A confirmação vem de um helper compartilhado em `propostaCalculo.ts` e usa um texto reforçado quando o status é `assinada`.
