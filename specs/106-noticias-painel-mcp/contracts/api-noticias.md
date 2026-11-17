# Contrato: API de notícias (106)

Base: `VITE_API_URL` (dev `http://localhost:8001/api`). Mensagens de erro em `detail` (pt-BR).

## Painel — `/api/proposal/noticias` (token do Proposal obrigatório)

| Método | Caminho | Quem | Resposta |
|--------|---------|------|----------|
| GET | `/proposal/noticias/?status=&segmento=&busca=` | todos | `{ items: NoticiaPainel[], total }`, mais recentes por `data_publicacao` / `criado_em` |
| GET | `/proposal/noticias/{id}` | todos | `NoticiaPainel` |
| POST | `/proposal/noticias/` | todos | 201 `NoticiaPainel` |
| PUT | `/proposal/noticias/{id}` | autor/admin | `NoticiaPainel` |
| POST | `/proposal/noticias/{id}/publicar` | autor/admin | `NoticiaPainel` (`status=publicada`) |
| POST | `/proposal/noticias/{id}/despublicar` | autor/admin | `NoticiaPainel` (`status=nao_publicada`) |
| DELETE | `/proposal/noticias/{id}` | autor/admin | 204 |

Erros: 403 "Ação permitida apenas ao autor da notícia ou administradores"; 404 "Notícia não encontrada"; 422 validação.

**Entrada (`NoticiaIn`)**: `titulo_pt, titulo_en, resumo_pt, resumo_en, conteudo_pt, conteudo_en, segmento, data_publicacao` (ISO date `YYYY-MM-DD`), `status?` (`publicada` \| `nao_publicada`, default `nao_publicada` na criação se omitido).

**`NoticiaPainel`**: entrada + `id, slug, status, criado_por_usuario, criado_em, atualizado_por_usuario, atualizado_em, pode_editar`.

Auditoria (entidade `Noticia`): `criar`, `editar`, `publicar`, `despublicar`, `excluir`.

## Público — `/api/public/noticias` (sem login)

| Método | Caminho | Resposta |
|--------|---------|----------|
| GET | `/public/noticias/?segmento=` | `NoticiaPublica[]` só elegíveis, mais recentes primeiro |
| GET | `/public/noticias/{id}` | `NoticiaPublica`; 404 "Notícia não disponível" se não elegível/inexistente |

**`NoticiaPublica`**: `id, slug, titulo_pt, titulo_en, resumo_pt, resumo_en, conteudo_pt, conteudo_en, segmento, data_publicacao`. Sem autor, status interno ou campos de auditoria.
