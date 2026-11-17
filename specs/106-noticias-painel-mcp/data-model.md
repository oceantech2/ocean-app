# Data Model: Notícias (106)

## Notícia (`noticias`)

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | inteiro, PK | usado no endereço público (`<slug>-<id>`) |
| `titulo_pt` | texto ≤ 200 | obrigatório |
| `titulo_en` | texto ≤ 200 | obrigatório |
| `resumo_pt` | texto ≤ 500 | obrigatório |
| `resumo_en` | texto ≤ 500 | obrigatório |
| `conteudo_pt` | texto ≤ 20000 | obrigatório; parágrafos / linhas |
| `conteudo_en` | texto ≤ 20000 | obrigatório |
| `segmento` | texto ≤ 30 | `oil-gas`, `offshore`, `energia`, `infraestrutura`, `mineracao`, `industria`, `tecnologia` |
| `data_publicacao` | date | obrigatória; data civil (sem horário) |
| `status` | texto | `publicada` ou `nao_publicada` (CHECK) |
| `criado_por_id` | FK `usuarios_app.id`, `ON DELETE SET NULL` | autor |
| `criado_por_usuario` | texto ≤ 255 | login do autor |
| `criado_em` | timestamp | UTC |
| `atualizado_por_usuario` | texto ≤ 255 | última edição |
| `atualizado_em` | timestamp | UTC |

Índice: `(status, data_publicacao)`.

**Transições**: `nao_publicada` ⇄ `publicada` (autor ou admin via publicar/despublicar). Exclusão com confirmação, sem restrição de dependências (não há entidade filha).

**Permissão de alterar**: `usuario.papel == "admin"` ou `noticia.criado_por_id == usuario.id`.

**Elegibilidade pública**: `status == 'publicada'` e `data_publicacao <= hoje` (America/Sao_Paulo, data civil).

**Slug**: derivado de `titulo_pt` (NFKD → ascii → kebab, máx. 60), não persistido — calculado na serialização como nas vagas.

## Rótulos de segmento (UI)

| Valor | pt | en |
|-------|----|----|
| `oil-gas` | Petróleo & Gás | Oil & Gas |
| `offshore` | Offshore | Offshore |
| `energia` | Energia | Energy |
| `infraestrutura` | Infraestrutura | Infrastructure |
| `mineracao` | Mineração | Mining |
| `industria` | Indústria | Industry |
| `tecnologia` | Tecnologia | Technology |

## Auditoria

Entidade `Noticia`. Ações: `criar`, `editar`, `publicar`, `despublicar`, `excluir`. Via MCP: prefixo `· via Claude` (ContextVar existente).
