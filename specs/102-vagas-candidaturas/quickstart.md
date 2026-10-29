# Quickstart: validar vagas e candidaturas (102)

## Pré-requisitos

- `docker compose up -d` (API em 8001, PostgreSQL em 5433)
- `cd frontend && npm run dev` (5193)
- Usuário com acesso ao painel (`acesso_proposal`) — um admin e um não-admin
- Opcional: `SHEETS_WEBHOOK_URL` e `SHEETS_WEBHOOK_SECRET` no `.env` do backend apontando para uma cópia de teste da planilha

Endereços locais: painel `http://consultantpanel.localhost:5193`, site `http://site.localhost:5193`.

## Verificações estáticas

```bash
cd backend && python -m compileall -q app
cd frontend && npx tsc --noEmit && npx vite build
cd frontend && npm run site:css   # após mudar classes em src/site
```

## Roteiro

1. **Migração (US5)**: subir a API e abrir o painel → menu **Vagas** lista CFO, VP de Engenharia, Diretor Comercial, Head de RH e Gerente de Operações, abertas. Reiniciar a API: nenhuma vaga duplicada. Excluir uma delas e reiniciar: ela não volta.
2. **Cadastro (US1)**: "Nova vaga" sem título/requisitos → erros nos campos. Sem cliente e sem código da planilha → erro no cliente. Preencher e salvar → aparece na lista do painel e em `site.localhost:5193/vagas` ao recarregar.
3. **Permissões (US1)**: com o usuário não-admin, abrir a vaga criada pelo admin → sem editar/encerrar/excluir; a API recusa `PUT` com 403.
4. **Página da vaga (US2)**: clicar na vaga no site → página com descrição, responsabilidades, pré-requisitos e diferenciais em lista. Copiar o endereço e abrir em aba anônima → mesma página. `/en/jobs/...` → interface em inglês. Conferir no DevTools (Network) que a resposta pública não traz `cliente` nem `codigo_planilha`.
5. **Candidatura (US3)**: enviar vazio → todos os obrigatórios destacados; pretensão máxima < mínima → erro; currículo `.png` ou > 5 MB → erro; consentimento desmarcado → erro. Enviar completo → confirmação e formulário limpo.
6. **Planilha (US3/US4)**: com a planilha configurada, a linha aparece em até 1 min com todos os campos e `linkCv`; no painel, status "Enviada". Sem configuração (ou URL inválida) → status "Pendente" com erro; configurar e clicar "Reenviar à planilha" → "Enviada" e nenhuma linha duplicada na planilha.
7. **Currículo (US4)**: no detalhe da vaga, "Currículo" abre o arquivo. Abrir o `linkCv` numa aba anônima → login do painel → após entrar, o currículo abre.
8. **Encerrar (US1/US2)**: encerrar a vaga → some da lista do site; o endereço direto mostra "vaga não disponível"; tentar enviar candidatura com a página aberta antes → mensagem de vaga indisponível. Reabrir → volta ao site.
9. **Excluir (US1)**: vaga com candidaturas → recusa com orientação de encerrar; sem candidaturas → `window.confirm` e remoção.
10. **Auditoria**: ERP → Auditoria mostra criar/editar/encerrar/reabrir/excluir da entidade `Vaga`.

## Publicação

- Render (API): `SHEETS_WEBHOOK_URL`, `SHEETS_WEBHOOK_SECRET`; `CORS_ORIGINS` passa a incluir `https://oceantalentsolutions.com,https://www.oceantalentsolutions.com,https://landing.oceantalentsolutions.com`; `CONSULTANT_PANEL_URL=https://consultantpanel.oceantalentsolutions.com` (para o `linkCv`).
- Supabase Storage já configurado (mesmo bucket dos anexos).
