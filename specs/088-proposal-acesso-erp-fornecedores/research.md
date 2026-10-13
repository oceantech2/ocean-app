# Research: Acesso ao Proposal pelo ERP e liberação para fornecedores

## R1 — Entrada automática entre domínios

- **Decision**: o ERP chama `POST /api/auth/proposal-sso` (token do ERP) e recebe um código aleatório (32 bytes, `secrets.token_urlsafe`) válido por 120 s e de uso único. O front abre `{PROPOSAL}/entrar#c=<código>`; a página `Entrar` limpa o fragmento da barra de endereço e chama `POST /api/proposal/auth/sso`, que consome o código e devolve um token `app=proposal` igual ao do login normal.
- **Rationale**: `localStorage` é por origem, então a sessão do ERP não é visível no domínio do Proposal. O fragmento (`#`) não é enviado ao servidor (Vercel) nem no `Referer`, atendendo ao FR-006. Uso único + validade curta limitam o risco de um link copiado.
- **Alternatives considered**: (a) passar o próprio JWT do ERP na URL — exporia uma sessão de 8 h com acesso ao ERP; (b) cookie compartilhado em `.oceantalentsolutions.com` — exigiria trocar todo o modelo de autenticação (Bearer em `localStorage`) e não funciona em `proposal.localhost`; (c) JWT assinado de curta duração sem tabela — não garante uso único.

## R2 — Abertura da nova aba sem bloqueio de pop-up

- **Decision**: no clique, abrir a aba de forma síncrona (`window.open('', '_blank')`), depois de obter o código definir `aba.location.href`; zerar `aba.opener`. Se a chamada falhar, fechar a aba e mostrar toast.
- **Rationale**: navegadores só liberam `window.open` dentro do gesto do usuário; abrir depois do `await` é bloqueado.

## R3 — Armazenamento dos tokens (convite e entrada automática)

- **Decision**: tabela única `tokens_acesso` (`tipo` = `convite` | `sso`), guardando apenas `sha256(token)`. Consumo com `UPDATE … SET usado_em = now() WHERE token_hash = :h AND tipo = :t AND usado_em IS NULL AND invalidado_em IS NULL AND expira_em > now() RETURNING usuario_id`.
- **Rationale**: o `UPDATE` atômico resolve o caso "convite aberto em dois lugares" sem lock explícito; o hash evita que um vazamento do banco permita usar tokens pendentes.
- **Alternatives considered**: Redis com TTL — existe no compose local, mas não em produção (Render usa `redis://localhost`).

## R4 — Vínculo usuário × fornecedor e senha pendente

- **Decision**: `usuarios_app.fornecedor_id` (FK `colaboradores.id`, `ON DELETE SET NULL`, índice único parcial) e `usuarios_app.senha_pendente BOOLEAN NOT NULL DEFAULT FALSE`. O usuário criado pela liberação recebe `senha_hash` de uma senha aleatória descartada e `senha_pendente = true`; os dois logins recusam `senha_pendente` com a mesma mensagem de credenciais inválidas.
- **Rationale**: `senha_hash` é `NOT NULL`; a flag permite derivar o status **Convite pendente/expirado** × **Ativo** e garante o FR-016 mesmo que alguém adivinhe a senha descartada (impossível na prática).
- **Status derivado**: sem usuário vinculado ou `acesso_proposal = false` → `sem_acesso`; `acesso_proposal` e `senha_pendente` → `convite_pendente` se houver convite válido, senão `convite_expirado`; `acesso_proposal` e senha definida → `ativo`.

## R5 — Endereço do Proposal no front do ERP

- **Decision**: `VITE_PROPOSAL_PUBLIC_URL` (já usada pelos links públicos). Sem a variável: host `app.*` → `proposal.*`; `localhost`/`127.0.0.1` → `http://proposal.localhost:<porta>`; caso contrário a própria origem.
- **Rationale**: reaproveita a configuração existente do deploy (`.env.deploy.example`).

## R6 — Revogação ao desativar fornecedor

- **Decision**: `DELETE /fornecedores/{id}` (desativar), `PUT /fornecedores/{id}` com `ativo=false` e `DELETE /fornecedores/{id}/permanente` chamam `revogar_acesso_fornecedor` antes do commit. Reativar não religa.
- **Rationale**: são os três caminhos que tiram o fornecedor de "ativo" no código atual.

## R7 — Login por e-mail sem diferenciar maiúsculas

- **Decision**: no login do Proposal (manual), se o usuário digitado contém `@`, normalizar com `strip().lower()` antes da busca. Logins criados pela liberação já são gravados em minúsculas.
- **Rationale**: atende ao caso de borda sem alterar logins existentes do ERP (que diferenciam maiúsculas hoje).

## R8 — Visibilidade do item no menu para sessões já abertas

- **Decision**: `acesso_proposal` passa a vir em `/api/auth/token` e `/api/auth/me` e é salvo no `useAuthStore` (persistido em `localStorage`). O `Layout` chama `/auth/me` uma vez por carregamento da aplicação para atualizar o valor (sessões antigas e revogações).
- **Rationale**: hoje o front não chama `/me` no carregamento; sem isso, sessões abertas antes do deploy nunca veriam o item.

## R9 — Pré-preenchimento do perfil de consultor

- **Decision**: ao criar o usuário pela liberação, criar `proposal_perfis_consultor` com nome, cargo, telefone e e-mail do fornecedor quando ainda não houver perfil; telefone inválido para o validador do perfil é descartado (fica vazio) em vez de bloquear a liberação.
- **Rationale**: o perfil já pré-preenche o consultor das novas propostas (`080`); falha de formato de telefone não deve impedir o acesso.
