# Research: Plataforma de Propostas (Proposal)

**Feature**: `077-plataforma-propostas` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

Levantamento feito sobre o código atual (`backend/app/main.py`, `backend/app/api/routes/auth.py`, `backend/app/api/routes/configuracoes.py`, `frontend/src/App.tsx`, `frontend/src/services/api.ts`, `frontend/vite.config.ts`, `.env.deploy.example`).

---

## R1. Como servir duas ferramentas em dois domínios com um só repositório e um só deploy

**Decision**: Vite **multi-page**, com dois HTML de entrada no mesmo build (`index.html` para o ERP e `proposal.html` para o Proposal), cada um com seu próprio `main.tsx` e seu próprio conjunto de rotas. No Vercel, o mesmo projeto recebe os dois domínios, e um `frontend/vercel.json` reescreve as requisições pelo host: `proposal.oceantalentsolutions.com` → `/proposal.html`; qualquer outro host → `/index.html`.

**Rationale**:
- Cada ferramenta baixa só o próprio código: o bundle do Proposal não carrega páginas, menu nem serviços do ERP (reforça o FR-007).
- Continua sendo um repositório, um build, um deploy e um backend (decisão de infraestrutura já tomada).
- O Vercel serve arquivos estáticos antes de aplicar os `rewrites`, então os assets (`/assets/*`, `/logo.png`) não são afetados.
- Utilitários (moeda, CNPJ, estilos) e o Tailwind continuam compartilhados.

**Alternatives considered**:
- *Decidir pelo `window.location.hostname` dentro do `App.tsx` atual*: mais simples, mas o bundle do Proposal carregaria o código do ERP, e o roteamento das duas ferramentas ficaria misturado no mesmo arquivo.
- *Dois projetos Vercel apontando para o mesmo repositório*: funciona, mas duplica configuração de build e variáveis sem ganho real.
- *Página pública renderizada pelo backend (HTML no FastAPI)*: daria preview de link nas redes, mas duplicaria layout e estilos fora do React. Fica como evolução, se o HTML de referência exigir.

**Observação**: hoje não existe `vercel.json`; o catch-all para `/index.html` passa a ser explícito, e isso também garante o deep-link das rotas do ERP.

---

## R2. Desenvolvimento local com dois "domínios"

**Decision**: Usar `http://proposal.localhost:5193` para o Proposal e `http://localhost:5193` para o ERP, na mesma porta fixa **5193**. Um plugin mínimo no `vite.config.ts` (`configureServer`) reescreve requisições de navegação (sem extensão de arquivo) para `/proposal.html` quando o host começa com `proposal.`.

**Rationale**:
- Navegadores modernos resolvem `*.localhost` para `127.0.0.1` sem precisar editar o arquivo `hosts`.
- Espelha exatamente a regra de produção (reescrita por host), então o que funciona local funciona no Vercel.
- Não muda a porta nem o `strictPort` (restrição da constitution).

**Alternatives considered**: `/proposal.html` com `basename` no router (diverge de produção); segunda porta (viola as portas fixas).

**Impacto no backend**: incluir `http://proposal.localhost:5193` na lista padrão de CORS de desenvolvimento (`_DEFAULT_CORS` em `backend/app/config.py`).

---

## R3. Isolamento real: sessão do Proposal não pode acessar o ERP (FR-006, SC-001)

**Situação atual**: todas as rotas do ERP dependem de `get_current_user`, `get_current_papel` ou `require_admin`, que só validam a assinatura e a expiração do JWT. O campo `permissoes` só controla o menu no frontend. Um token válido qualquer lê qualquer rota do ERP.

**Decision**: Token por ferramenta, com uma claim `app` no JWT (`"erp"` ou `"proposal"`), e bloqueio no servidor em duas camadas:
1. **Dependências do ERP** (`get_current_user`, `get_current_papel`, `require_admin` em `auth.py`) passam a exigir `app == "erp"`. Tokens sem a claim são tratados como `"erp"`, para não derrubar as sessões abertas no deploy; eles expiram em até 8h.
2. **Router-level**: em `main.py`, todos os routers do ERP (exceto `auth`) passam a ser incluídos com `dependencies=[Depends(require_erp)]`. Isso protege também qualquer rota futura que esqueça a dependência.
3. **Dependências do Proposal** (`get_proposal_user`) exigem `app == "proposal"` estritamente e consultam o banco a cada requisição (`ativo` e `acesso_proposal`), o que dá revogação imediata no Proposal. O volume é baixo, então o custo é desprezível.

**Rationale**: a claim explícita é simples de testar (curl com o token errado → 403) e não depende de detalhes de validação de `aud` da biblioteca `python-jose`. As duas camadas no ERP cobrem tanto as rotas existentes quanto as futuras.

**Verificação feita**: nenhuma rota do ERP é pública hoje, exceto `POST /api/auth/token` (o script apontou as rotas de transferência, mas elas têm `require_admin`; foi falso positivo por causa dos decoradores empilhados). Portanto a dependência no nível do router não muda o comportamento de nenhuma tela do ERP.

**Alternatives considered**:
- *Checar `permissoes` por rota*: exigiria mapear cada endpoint para uma página; fora do escopo e mais frágil.
- *Chaves de assinatura diferentes por ferramenta*: isolamento forte, mas exige nova variável secreta no Render; a claim resolve com menos operação.
- *Consultar o banco a cada requisição do ERP*: daria revogação imediata também no ERP, mas adiciona uma query a todas as rotas; a spec aceita que a revogação valha no fim da sessão.

---

## R4. Login do Proposal

**Decision**: Endpoint próprio `POST /api/proposal/auth/token` (mesmo formato OAuth2 `x-www-form-urlencoded` do ERP):
- Só aceita usuários **do banco**, `ativo = true` e `acesso_proposal = true`. **Não** usa o fallback `USUARIOS_DEV` nem o `seed_usuarios_default` do login do ERP.
- Reaproveita a verificação de 2FA do ERP (extraída para um helper em `auth.py`), atendendo ao FR-008.
- Devolve um token com `app = "proposal"`, `sub`, `papel` e `uid`.
- Usuário sem `acesso_proposal` → 403 "Usuário sem acesso ao Proposal".

O login do ERP (`POST /api/auth/token`) passa a recusar com 403 "Usuário sem acesso ao ERP" quem tem `acesso_erp = false`.

**Rationale**: o fallback do ERP aceita `admin`/`123456` quando o usuário não está no banco (ou está inativo). Isso não pode existir numa ferramenta exposta a outro público.

**Risco pré-existente (fora do escopo, registrar)**: no ERP, o fallback `USUARIOS_DEV` e o `seed_usuarios_default` recriam `admin`/`123456` em produção caso o usuário não exista, e um usuário `admin` inativo ainda consegue logar pelo fallback. Recomenda-se uma feature separada para restringir isso ao modo `DEBUG`.

---

## R5. Sessões separadas no frontend

**Decision**: O Proposal usa uma instância própria de Axios (`frontend/src/proposal/services/proposalApi.ts`) com a chave `proposal_access_token` no `localStorage`, seu próprio interceptor de 401 (redireciona para `/login` do Proposal) e sua própria store (`useProposalAuthStore`).

**Rationale**: em produção os domínios já isolam o `localStorage`, mas em dev as duas ferramentas podem compartilhar origem (`localhost:5193` vs. `proposal.localhost:5193` são origens diferentes, mas `/proposal.html` direto em `localhost` não). Chaves diferentes evitam que um token sobrescreva o outro em qualquer cenário e deixam o isolamento explícito no código.

---

## R6. Link público impossível de adivinhar (FR-013, FR-022, SC-006)

**Decision**: `codigo = secrets.token_urlsafe(24)` (32 caracteres, ~192 bits de entropia), único no banco. URL pública: `https://proposal.oceantalentsolutions.com/p/{codigo}`. Qualquer código inexistente → 404 com corpo idêntico (`{"detail": "Proposta não encontrada"}`).

**Rationale**: entropia muito acima do necessário para inviabilizar força bruta; não deriva de ID, data ou CNPJ.

**Alternatives considered**: UUID4 (122 bits, também serviria, mas URL mais longa e com hífens); hash do ID (previsível se o segredo vazar).

---

## R7. Status, validade e expiração sem job agendado (FR-029, FR-030)

**Decision**: Status **persistido**: `aguardando`, `visualizada`, `assinada`, `cancelada`. O status **Expirada** é **derivado** na leitura: se o status persistido é `aguardando` ou `visualizada` e o momento atual é posterior a `validade 23:59:59 America/Sao_Paulo`, o status efetivo é `expirada`. Toda regra (listar, filtrar, assinar, cancelar) usa o status efetivo, calculado num único helper em `services/propostas.py`.

- O filtro "Expirada" na lista é aplicado em SQL comparando `validade < data de hoje em São Paulo`.
- Para usar `zoneinfo` na imagem `python:3.11-slim`, adicionar o pacote `tzdata` em `requirements.txt`.

**Rationale**: sem cron nem worker (o Render não garante execução agendada no plano atual), e a expiração vale no segundo exato, inclusive quando a página foi aberta antes (edge case da spec).

**Alternatives considered**: job diário que grava `expirada` (atrasa até 24h e adiciona infraestrutura); Celery beat (já está nas dependências, mas não roda no deploy atual).

---

## R8. Assinatura única, concorrência e evidências (FR-019, FR-020, SC-007)

**Decision**:
- A assinatura roda numa transação: `UPDATE propostas SET status='assinada', assinada_em=now() WHERE id=:id AND status IN ('aguardando','visualizada') AND validade >= :hoje_sp`. Se `rowcount = 0`, a requisição é recusada (409, com o motivo: já assinada, cancelada ou expirada). Em seguida, insere `propostas_assinaturas` com `proposta_id` **único** (segunda barreira).
- **Impressão digital do conteúdo**: SHA-256 do JSON canônico (chaves ordenadas, valores decimais como string) com `codigo`, `cliente_nome`, `cnpj`, `valor`, `imposto_ativo`, `aliquota`, `valor_imposto`, `total`, `emitida_em` e `validade`. É calculada **na criação** e guardada em `propostas.conteudo_hash`; na assinatura, o hash é recalculado e copiado para `propostas_assinaturas.conteudo_hash`. Se divergir do salvo, a assinatura é recusada (proteção contra alteração indevida).
- **IP de origem**: primeiro endereço do cabeçalho `X-Forwarded-For` (o Render fica na frente do app); fallback em `request.client.host`.
- **Navegador**: cabeçalho `User-Agent`, truncado em 500 caracteres.

**Rationale**: o `UPDATE` condicional resolve a corrida entre duas abas sem lock explícito; a constraint única garante no máximo uma assinatura mesmo sob falha.

---

## R9. Registro da primeira visualização (FR-024)

**Decision**: `GET /api/public/propostas/{codigo}` grava `visualizada_em` e muda `aguardando` → `visualizada` apenas se `visualizada_em IS NULL` (via `UPDATE` condicional). O detalhe dentro do Proposal usa o endpoint autenticado, que nunca marca visualização.

**Rationale**: como a página pública é SPA, os robôs de preview de link (WhatsApp, e-mail) só baixam o HTML estático e não chamam a API, então não geram visualização falsa.

---

## R10. Cálculo monetário sem divergência entre tela e página do cliente (SC-004)

**Decision**:
- Banco: `NUMERIC(14,2)` para valores e `NUMERIC(5,2)` para alíquota (0 < alíquota < 100).
- Backend (autoritativo): `Decimal`, `valor_imposto = (valor × alíquota / 100).quantize(0.01, ROUND_HALF_UP)`, `total = valor + valor_imposto`.
- Frontend (prévia no formulário): mesma regra em **centavos inteiros** (`valorCentavos × aliquotaCentesimos`, arredondamento half-up), em `frontend/src/proposal/utils/propostaCalculo.ts`. Depois de criada, a tela mostra sempre os valores devolvidos pelo backend.

**Rationale**: evita erros de ponto flutuante (o restante do projeto usa `FLOAT`, mas para valores que o cliente assina a precisão exata é requisito).

---

## R11. Validação de CNPJ

**Decision**: Backend reaproveita `validar_cnpj`, `normalizar_cnpj` e `formatar_cnpj` de `backend/app/services/documento.py` (já suportam CNPJ alfanumérico). No frontend, as funções `validarCNPJ`/`formatarCNPJ` hoje locais em `Fornecedores.tsx` passam para `frontend/src/utils/documento.ts` e são importadas pelas duas telas, sem mudança de comportamento em Fornecedores.

---

## R12. Campo de acesso no cadastro de usuários (FR-001, FR-002, FR-003)

**Decision**: Duas colunas novas em `usuarios_app`: `acesso_erp BOOLEAN NOT NULL DEFAULT TRUE` e `acesso_proposal BOOLEAN NOT NULL DEFAULT FALSE`, criadas pela migração inline existente em `_migrar()` (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`), que é o padrão do projeto. Os defaults garantem que os usuários atuais mantêm o ERP e começam sem o Proposal.

- `configuracoes.py` e os schemas `UsuarioAppCreate`/`UsuarioAppUpdate`/`UsuarioAppResponse` ganham os dois campos (endpoints já protegidos por `require_admin`).
- Guarda: o admin não pode remover o próprio `acesso_erp` (evita se trancar fora do ERP), no mesmo espírito da regra "não pode remover o próprio usuário".
- O campo é **independente** do JSON `permissoes` (FR-001).

---

## R13. Exclusão de usuário com propostas

**Situação atual**: `DELETE /api/configuracoes/{uid}` faz exclusão física (`db.delete(u)`).

**Decision**: `propostas.criado_por_id` é FK para `usuarios_app.id` com `ON DELETE SET NULL`, e `propostas.criado_por_usuario` guarda o login como snapshot para exibição. Assim, excluir um usuário não é bloqueado pela FK, e as propostas e links continuam válidos (edge case da spec).

---

## R14. Segurança do banco no Supabase

**Decision**: As tabelas novas (`propostas`, `propostas_assinaturas`) são criadas no schema `public`. Depois do deploy, **rodar novamente** `backend/scripts/enable_rls_supabase.sql`, que habilita RLS em toda tabela ainda sem RLS e revoga os grants de `anon`/`authenticated`. O backend conecta como dono e não é afetado.

**Rationale**: sem isso, as propostas (com CNPJ, valores e dados do signatário) ficariam legíveis pela API pública do Supabase.

---

## R15. Configuração de deploy

**Decision**:
- **Vercel**: adicionar o domínio `proposal.oceantalentsolutions.com` ao mesmo projeto (CNAME no DNS). A mesma `VITE_API_URL`.
- **Render**: incluir `https://proposal.oceantalentsolutions.com` em `CORS_ORIGINS`. `ALLOWED_HOSTS` não muda (é o host do backend).
- **Variável nova no frontend**: `VITE_PROPOSAL_PUBLIC_URL` (ex.: `https://proposal.oceantalentsolutions.com`), usada para montar o link copiado. Se ausente, usa `window.location.origin`.
- Atualizar `.env.deploy.example` com essas entradas (sem segredos).

---

## R16. Testes

**Decision**: O repositório não tem suíte automatizada (sem `tests/` nem `conftest.py`, embora `pytest` e `httpx` estejam nas dependências). Seguindo o padrão das features anteriores, a validação é pelo [quickstart.md](./quickstart.md), com `npm run lint` e `npm run type-check`. Para o isolamento (SC-001), o quickstart inclui verificações com `curl` usando token do Proposal contra rotas do ERP, que devem responder 403.
