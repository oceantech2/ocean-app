# Research: Notícias painel + MCP + site (106)

## R1 — Espelhar o padrão das vagas (102)

**Decision**: Reutilizar o par `proposal_noticias` / `public_noticias`, serviço de domínio, slug `<slug>-<id>`, permissões autor/admin e auditoria iguais às vagas.

**Rationale**: Já validado em produção no Consultant Panel e no site; o time conhece o fluxo; MCP da 103 já envolve as funções das rotas.

**Alternatives considered**: CMS externo (fora do escopo); editar só no código (não atende painel/MCP).

## R2 — Conteúdo bilíngue

**Decision**: Colunas `titulo_pt`, `titulo_en`, `resumo_pt`, `resumo_en`, `conteudo_pt`, `conteudo_en` — todas obrigatórias. A API pública devolve os pares; o site escolhe pelo idioma da página.

**Rationale**: Clarificação Q1-B; a página Notícias já tinha títulos pt/en nos placeholders.

**Alternatives considered**: Um idioma só (como vagas) — rejeitado pelo usuário; JSONB `{pt,en}` — possível, mas colunas explícitas batem com o padrão SQLAlchemy atual e simplificam validação Pydantic.

## R3 — Agendamento por data civil

**Decision**: Elegibilidade pública = `status == 'publicada'` AND `data_publicacao <= date.today()` no fuso `America/Sao_Paulo` (comparação só da data, sem horário).

**Rationale**: Clarificação Q2-A; evita depender de job/cron — a filtragem ocorre a cada request.

**Alternatives considered**: Campo `publicado_em` com timestamp UTC — mais complexo para o formulário; cron que “libera” — desnecessário.

## R4 — Status e ações

**Decision**: Status `publicada` | `nao_publicada`. Endpoints `POST …/publicar` e `POST …/despublicar` (espelho de encerrar/reabrir). Criação pode gravar já como publicada ou não publicada conforme o payload/ação do formulário.

**Rationale**: Alinha UX do painel às vagas; despublicar remove do site imediatamente mesmo com data passada.

**Alternatives considered**: Só booleano `publicado` — equivalente, mas string com CHECK é o padrão do projeto.

## R5 — MCP sem destruição

**Decision**: Ferramentas `listar_noticias`, `ver_noticia`, `criar_noticia`, `editar_noticia` apenas. Publicar/despublicar/excluir só no painel.

**Rationale**: Clarificação Q3-A; igual à política de não excluir vagas via Claude.

**Alternatives considered**: Incluir despublicar no MCP — rejeitado.

## R6 — Slug

**Decision**: `slug_titulo(titulo_pt)` (mesma função das vagas); URL `/noticias/<slug>-<id>` e `/en/news/<slug>-<id>`. Troca de idioma no site mantém o id.

**Rationale**: Reuso imediato; id no final garante unicidade mesmo se o título mudar.

## R7 — Assinatura de e-mail e placeholders

**Decision**: Assinatura permanece toast-only (fora de escopo). Remover os 3 `POSTS` fixos de `Noticias.tsx`.

**Rationale**: Spec FR-015 / US4.
