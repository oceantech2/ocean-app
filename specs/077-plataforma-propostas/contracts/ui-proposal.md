# Contrato de UI: Proposal e ajustes no ERP

## 1. Roteamento por domínio

| Host | HTML servido | App |
|---|---|---|
| `proposal.oceantalentsolutions.com` (prod) · `proposal.localhost:5193` (dev) | `proposal.html` | Proposal |
| Qualquer outro (`app.oceantalentsolutions.com`, `localhost:5193`, `*.vercel.app`) | `index.html` | ERP (inalterado) |

`frontend/vercel.json` (produção) e um plugin de dev no `vite.config.ts` aplicam a mesma regra: navegação sem extensão de arquivo → HTML do app correspondente.

## 2. Rotas do Proposal (`frontend/src/proposal/App.tsx`)

| Rota | Tela | Acesso |
|---|---|---|
| `/login` | Login do Proposal | Público |
| `/` | Lista de propostas | Autenticado (Proposal) |
| `/nova` | Formulário de nova proposta (aceita `?copiar={id}`) | Autenticado |
| `/propostas/:id` | Detalhe da proposta | Autenticado |
| `/p/:codigo` | Página pública da proposta (cliente) | **Público**, sem layout interno |
| `*` | Redireciona para `/` (ou `/login`) | — |

Rotas autenticadas usam `ProposalLayout`: cabeçalho com logo, nome "Proposal", usuário logado e "Sair". **Sem** menu, links ou textos do ERP (FR-007).

## 3. Telas

### 3.1 Login (`/login`)
- Logo (`/logo.png`) + título "Proposal"; campos usuário e senha; campo de código 2FA exibido quando a API responde `2FA_REQUIRED` (mesmo fluxo do `Login.tsx` do ERP).
- Erros via `react-hot-toast`, exibindo o `detail` da API (ex.: "Usuário sem acesso ao Proposal").
- Nenhum link para o ERP.

### 3.2 Lista (`/`)
- Botão "Nova proposta".
- Filtro de status: Todas · Aguardando assinatura · Visualizada · Assinada · Cancelada · Expirada.
- Colunas: Cliente · CNPJ · Total · Emissão · Validade · Status (badge) · [Criado por, só para `admin`] · Ações (Copiar link, Ver).
- Estados: carregando (spinner `animate-spin`), vazio ("Nenhuma proposta ainda"), erro (toast).

### 3.3 Nova proposta (`/nova`)
- Campos: Nome do cliente · CNPJ (máscara; aceita com ou sem pontuação) · Valor (R$) · Toggle "Incluir imposto" → campo Alíquota (%) · Validade (data, preenchida com hoje + 30 dias).
- Resumo ao vivo: Valor · Imposto (x%) · **Total** — as linhas de imposto só aparecem com o toggle ligado.
- Validação no cliente espelhando a API (CNPJ, valor > 0, alíquota entre 0 e 100, validade futura); erros por campo.
- Ao confirmar: mostra o link gerado com botão "Copiar link" (Clipboard API + toast "Link copiado") e ações "Ver proposta" / "Nova proposta".
- Com `?copiar={id}`: pré-preenche a partir da proposta de origem (sem validade; recalculada).

### 3.4 Detalhe (`/propostas/:id`)
- Todos os dados da proposta, status, datas (emissão, validade, 1ª visualização, cancelamento).
- Bloco "Assinatura" quando assinada: nome, e-mail, data e hora, IP, navegador, impressão digital (hash).
- Ações: Copiar link · Abrir página do cliente (nova aba) · Criar cópia (`/nova?copiar={id}`) · Cancelar (só `aguardando`/`visualizada`, com `window.confirm`).

### 3.5 Página pública (`/p/:codigo`)
- Layout próprio, responsivo (mobile-first, sem zoom — FR-023), com a identidade da Ocean (logo e cores `ocean-*` do Tailwind).
- Enquanto carrega: indicador de carregamento em tela cheia com a mensagem "Carregando proposta…" (cobre o servidor "acordando").
- **Pendente**: cliente, CNPJ, valor, [imposto e alíquota], total, emissão, validade, botão **Assinar** → formulário (nome completo, e-mail, checkbox "Li e aceito os termos desta proposta") → confirmar.
- **Assinada**: dados + selo "Assinada em {data} por {nome}"; sem botão.
- **Cancelada / Expirada**: só a mensagem devolvida pela API, sem valores.
- **Não encontrada**: mensagem genérica "Proposta não encontrada".
- Erro 409 na assinatura (expirou ou foi cancelada no meio): recarrega o estado e mostra a mensagem correspondente.

## 4. Ajustes no ERP (`frontend/src/pages/Configuracoes.tsx`)

- Modal de usuário: dois toggles novos, "Acesso ao ERP" e "Acesso ao Proposal", numa seção "Ferramentas", separada da lista de permissões de página.
- Tabela de usuários: coluna "Ferramentas" com badges "ERP" e/ou "Proposal".
- Toast de erro com o `detail` da API (ex.: tentativa de remover o próprio acesso ao ERP).
- `Login.tsx` do ERP: já exibe o `detail` da API; a mensagem "Usuário sem acesso ao ERP" aparece sem mudança de código.
