# Contrato UI: Rótulos dos Atalhos de Contratos

**Feature**: `063-contratos-clientes-internos`  
**Modelo**: [data-model.md](../data-model.md) · **Research**: [research.md](../research.md)

## Página `/contratos`

**Acesso**: inalterado (autenticado + regras vigentes de visibilidade/permissão).

**Inalterado nesta entrega**:
- Título da página: **Contratos**
- Item de menu / catálogo: **Contratos** (`key: contratos`, `path: /contratos`)
- Texto de apoio existente (instrução para abrir a pasta no Google Drive)
- Quantidade de atalhos: exatamente **dois**
- Comportamento: `<a href>` com `target="_blank"` e `rel="noopener noreferrer"`
- Layout (lista/stack, dark mode, “Abrir →”)

**Atalhos (única mudança visível)**:

| # | Posição | Rótulo exibido | `href` (inalterado) |
|---|---------|----------------|---------------------|
| 1 | Cima | Contratos Clientes | `https://drive.google.com/drive/u/2/folders/1pJGZNasVVx2pGdk0-mu6GA0L4x59gj9H` |
| 2 | Baixo | Contratos Internos | `https://drive.google.com/drive/u/2/folders/1t8HPQgoqgyG1wWy7CjJbDoEJoayi_PJ-` |

**Proibido nesta entrega**:
- Exibir **Contratos ativos** ou **Contratos arquivados** na página
- Alterar URLs, ordem, título, menu, permissões ou visibilidade
- CRUD, upload, iframe do Drive, diferença de conteúdo por papel

## API REST

Nenhum endpoint alterado ou criado.

## Mapeamento de requisitos

| FR | Contrato |
|----|----------|
| FR-001 | Linha 1 da tabela de atalhos |
| FR-002 | Linha 2 da tabela de atalhos |
| FR-003 | Proibido exibir rótulos antigos |
| FR-004 | Ordem cima → baixo |
| FR-005 | `href` inalterados |
| FR-006 | Título, menu, catálogo, permissões, quantidade |
