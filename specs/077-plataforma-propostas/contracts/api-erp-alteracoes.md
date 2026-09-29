# Contrato: alterações na API do ERP

Mudanças em endpoints existentes para suportar o acesso separado e o isolamento.

---

## 1. Claim `app` no token do ERP

`POST /api/auth/token` passa a emitir o JWT com `app: "erp"` (além de `sub` e `papel`). Resposta 200 inalterada.

Nova recusa:

| Situação | Status | `detail` |
|---|---|---|
| Usuário do banco com `acesso_erp = false` | 403 | `Usuário sem acesso ao ERP` |

A verificação de `acesso_erp` acontece **antes** da emissão do token e **depois** da validação de senha e do 2FA. O fallback `USUARIOS_DEV` continua como está hoje (fora do escopo; ver research R4).

---

## 2. Bloqueio de tokens do Proposal em todo o ERP

- `get_current_user`, `get_current_papel` e `require_admin` (`backend/app/api/routes/auth.py`) passam a exigir `app == "erp"`; tokens sem a claim são aceitos como ERP (sessões anteriores ao deploy).
- Todos os routers do ERP em `backend/app/main.py`, exceto `auth`, passam a ser montados com `dependencies=[Depends(require_erp)]`.

| Requisição | Resultado esperado |
|---|---|
| Qualquer rota `/api/*` do ERP com token `app = "proposal"` | 403 `Token não autorizado para o ERP` |
| `GET /api/auth/me` com token do Proposal | 403 |
| Rotas do ERP com token do ERP | Comportamento atual, sem mudança |

---

## 3. Cadastro de usuários — `/api/configuracoes`

Todos os endpoints continuam exigindo `require_admin`.

### `GET /api/configuracoes/` — resposta (`UsuarioAppResponse`)
Campos novos em cada item:
```json
{ "acesso_erp": true, "acesso_proposal": false }
```

### `POST /api/configuracoes/` — request (`UsuarioAppCreate`)
Campos novos, opcionais:
```json
{ "acesso_erp": true, "acesso_proposal": false }
```
Padrões quando omitidos: `acesso_erp = true`, `acesso_proposal = false`.

### `PUT /api/configuracoes/{uid}` — request (`UsuarioAppUpdate`)
Campos novos, opcionais: `acesso_erp`, `acesso_proposal`.

| Situação | Status | `detail` |
|---|---|---|
| Admin tenta definir `acesso_erp = false` para si mesmo | 400 | `Não pode remover o próprio acesso ao ERP` |

Alterar `permissoes` não altera `acesso_proposal`, e vice-versa (FR-001).

---

## 4. CORS

`backend/app/config.py`: incluir `http://proposal.localhost:5193` em `_DEFAULT_CORS` (dev). Produção: `https://proposal.oceantalentsolutions.com` na variável `CORS_ORIGINS` do Render.
