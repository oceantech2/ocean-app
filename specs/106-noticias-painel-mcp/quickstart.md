# Quickstart: validar notícias (106)

## Pré-requisitos

- `docker compose up -d` (API 8001, PostgreSQL 5433)
- `cd frontend && npm run dev` (5193)
- Usuário com `acesso_proposal` (um admin e um não-admin)
- Claude conectado no painel (para o roteiro MCP)

Endereços locais: painel `http://consultantpanel.localhost:5193`, site `http://site.localhost:5193` (ou `landing.localhost:5193` conforme vite).

## Verificações estáticas

```bash
cd backend && python -m compileall -q app
cd frontend && npx tsc --noEmit && npx vite build
cd frontend && npm run site:css   # se mudar classes em src/site
```

## Roteiro

1. **Lista vazia (US4)**: abrir `site…/noticias` → sem os 3 cards placeholder; mensagem de vazio.
2. **Cadastro (US1)**: painel → Notícias → Nova. Sem título EN → erro. Preencher PT+EN, segmento, data de hoje, salvar como publicada → aparece na lista do painel e no site ao recarregar.
3. **Agendamento (US1/US2)**: criar publicada com data amanhã → não aparece no site; detalhe direto → indisponível. (Opcional: ajustar data para hoje no painel → volta a aparecer.)
4. **Página (US2)**: clicar no card / Ler mais → página com conteúdo no idioma da página. `/en/news/<slug>-id` → textos EN. Trocar idioma no cabeçalho mantém a mesma notícia.
5. **Permissões (US1)**: não-admin abre notícia do admin → sem editar/despublicar/excluir; `PUT` → 403.
6. **Despublicar / excluir (US1)**: despublicar → some do site; excluir com confirm → some do painel; URL antiga → indisponível.
7. **MCP (US3)**: no Claude, criar notícia elegível → aparece no painel e no site; editar título EN → site EN atualiza; tentar excluir via ferramenta → não existe; não-autor editar → recusa.
8. **Auditoria**: ERP → Auditoria mostra criar/editar/publicar/despublicar/excluir de `Noticia` (com “via Claude” quando aplicável).
