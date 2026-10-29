# Research: Vagas e candidaturas (102)

Fontes analisadas: site (`frontend/src/site/`, `site-prerender.ts`, `vercel.json`, `scripts/site-css`), painel (`frontend/src/proposal/`), backend (`proposal_modelos.py`, `public_propostas.py`, `anexo_nf.py`, `email_aceite.py`, `main.py`, `config.py`) e o exemplo de integração da planilha enviado pelo usuário.

## 1. Como o site obtém as vagas

- **Decision**: O site busca `GET /api/public/vagas` no navegador a cada carregamento da página Vagas (e `GET /api/public/vagas/{id}` na página da vaga). As páginas pré-renderizadas mostram o estado "carregando".
- **Rationale**: SC-001 (vaga visível em < 1 min) sem nova publicação. O site já monta com `createRoot` (não hidrata), então trocar o HTML pré-renderizado pelo conteúdo buscado não gera conflito.
- **Alternatives considered**: (a) gerar as vagas no build e redeploy a cada vaga — exige publicação manual; (b) cache no servidor — desnecessário para o volume.

## 2. Endereço da página da vaga

- **Decision**: `/vagas/<slug-do-titulo>-<id>` (pt) e `/en/jobs/<slug-do-titulo>-<id>` (en). A busca usa só o `id` final; se o slug estiver diferente (título editado), a página troca o endereço para o atual sem recarregar.
- **Rationale**: Endereço legível e compartilhável (FR-008) que sobrevive a edição do título. Na Vercel, `/vagas/...` não casa com as regras exatas das páginas pré-renderizadas e cai no `/(.*)` → `site.html` (SPA), sem mudar o `vercel.json`. No dev, o plugin `hostsDev` já serve `site.html` para qualquer caminho em `site.localhost`.
- **Alternatives considered**: código aleatório (ilegível); slug único gravado (exige tratar colisão e histórico de slugs).

## 3. SEO da página da vaga

- **Decision**: Aplica as tags da página "vagas" e troca o `<title>` para "<Título da vaga> | Ocean Talent Solutions". Sem pré-renderização nem entrada no sitemap.
- **Rationale**: Escopo fechado (princípio V); o pedido é a página, não indexação.

## 4. Envio à planilha

- **Decision**: Serviço `planilha_candidaturas` faz `POST` JSON ao `SHEETS_WEBHOOK_URL` com `secret` no corpo e `follow_redirects=True` (o Apps Script responde 302 para o resultado). Disparo por `BackgroundTasks` após o commit, abrindo sessão própria (mesmo padrão de `enviar_emails_aceite`). Resposta `ok: true` grava `planilha_enviada_em`, `planilha_id_candidatura`, `planilha_id_pessoa`; qualquer outra coisa grava `planilha_erro` e incrementa `planilha_tentativas`. Reenvio manual no painel processa as pendentes da vaga de forma síncrona.
- **Rationale**: O candidato não espera a planilha (FR-017); `externalId` = id da candidatura garante que reenvios não dupliquem (contrato da planilha). Sem fila/worker (princípio V).
- **Alternatives considered**: Celery (já no requirements, mas sem worker rodando no Render); reenvio automático periódico — adiado; o reenvio manual cobre a falha eventual.
- **Sem configuração** (`SHEETS_WEBHOOK_URL` vazio): não tenta enviar; candidatura fica pendente com erro "Integração com a planilha não configurada".

## 5. Link do currículo na planilha

- **Decision**: `linkCv` = `{CONSULTANT_PANEL_URL}/candidaturas/{id}/curriculo`. Essa rota do painel é protegida: sem sessão vai ao login e, após entrar, volta para ela; com sessão, baixa o arquivo pela API autenticada e o abre.
- **Rationale**: FR-016/SC-006 — link permanente, sem URL assinada que expira e sem arquivo público.
- **Alternatives considered**: URL assinada do Storage (expira; quem tivesse o link veria o arquivo); bucket público (viola SC-006).

## 6. Armazenamento do currículo

- **Decision**: Reaproveitar `services/anexo_nf.py`: `validar` recebe extensões, limite e mensagens opcionais (padrões de NF preservados), `gravar` aceita a extensão já validada pelo chamador, e `.doc`/`.docx` entram em `MEDIA_TYPE`. Currículo: prefixo `curriculos`, extensões `{.pdf,.doc,.docx}` e 5 MB.
- **Rationale**: Mesmo Storage, mesmas mensagens e mesma recusa em produção sem Storage (edge case "armazenamento indisponível").
- **Ordem**: grava a candidatura (flush para obter id), grava o arquivo, atualiza o caminho, commit; se o arquivo falhar, rollback e o candidato vê o erro.

## 7. Proteção contra robôs

- **Decision**: Campo isca oculto (`site`) no formulário; se vier preenchido a API responde 201 sem gravar. Limites de tamanho em todos os campos; arquivo validado por extensão e tamanho.
- **Rationale**: FR-019 com a menor solução; sem captcha de terceiros.

## 8. Migração das 5 vagas

- **Decision**: Em `_migrar`, se não existir a chave `seed_vagas_102` em `configuracao_app`, insere as 5 vagas (texto em pt, autor "sistema", status aberta) e grava a chave na mesma transação.
- **Rationale**: Cria uma única vez e nunca recria/sobrescreve (US5 cenário 3), mesmo se excluídas.

## 9. CORS

- **Decision**: Acrescentar `http://site.localhost:5193` aos padrões de dev. Em produção, `CORS_ORIGINS` (variável do Render) precisa incluir `https://oceantalentsolutions.com`, `https://www.oceantalentsolutions.com` e `https://landing.oceantalentsolutions.com` — passo de publicação no quickstart.
- **Rationale**: O site chama a API de outra origem (hoje não chamava nenhuma).

## 10. Formato dos textos longos

- **Decision**: Descrição em parágrafos (quebra de linha dupla); responsabilidades, pré-requisitos e diferenciais com um item por linha, exibidos como lista no site (marcadores `-`/`•` no início da linha são removidos).
- **Rationale**: Edição simples em `textarea` no painel, sem editor rico; exibição legível (edge case "textos longos").

## 11. Pretensões salariais

- **Decision**: Campos numéricos em reais aceitando formatos pt e en ("15.000,50", "15,000.50", "R$ 15.000"): o último separador só é decimal quando seguido de 1 ou 2 dígitos; os demais separam milhares. Mesma regra no navegador e na API (`Decimal`, > 0, ≤ 10.000.000, máxima ≥ mínima). Enviados à planilha como número.
- **Achado na validação**: a primeira versão tratava toda vírgula como decimal, e "30,000" digitado na versão em inglês virava R$ 30,00; corrigido com a regra acima.
