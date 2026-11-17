# Contrato: ferramentas MCP de notícias (106)

Complementa `specs/103-mcp-claude-desktop/contracts/mcp-ferramentas.md`.

| Ferramenta | Leitura | Entrada principal | Comportamento |
|------------|---------|-------------------|---------------|
| `listar_noticias` | sim | `status?`, `segmento?`, `busca?` | chama `proposal_noticias.listar` |
| `ver_noticia` | sim | `id` | chama `obter` |
| `criar_noticia` | não | campos de `NoticiaIn` | chama `criar`; auditoria via Claude |
| `editar_noticia` | não | `id` + campos parciais/completos | mescla com atual e chama `editar`; 403 se não autor/admin |

**Não oferecidas**: `publicar_noticia`, `despublicar_noticia`, `excluir_noticia` (painel apenas).

Respostas: JSON resumido amigável ao modelo (id, títulos, segmento, status, data, link do painel quando fizer sentido), no mesmo estilo das ferramentas de vagas.
