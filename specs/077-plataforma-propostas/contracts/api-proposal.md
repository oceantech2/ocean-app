# Contrato: API autenticada do Proposal

Base: `{VITE_API_URL}` (ex.: `https://ocean-app-backend.onrender.com/api`). Todas as rotas abaixo, exceto o login, exigem `Authorization: Bearer <token do Proposal>` (claim `app = "proposal"`).

Erros de autenticação comuns a todas as rotas protegidas:

| Situação | Status | `detail` |
|---|---|---|
| Sem token, token inválido ou expirado | 401 | `Não foi possível validar as credenciais` |
| Token do ERP (`app` ≠ `proposal`) | 403 | `Token não autorizado para o Proposal` |
| Usuário inativo ou sem `acesso_proposal` (checado no banco a cada requisição) | 403 | `Usuário sem acesso ao Proposal` |

---

## POST `/proposal/auth/token`

Login do Proposal. `Content-Type: application/x-www-form-urlencoded` (OAuth2), igual ao ERP.

**Request (form)**: `username`, `password`, `totp_code` (opcional; exigido quando o 2FA está ativo).

**200**
```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "usuario": "joao",
  "papel": "visualizador"
}
```
Claims do JWT: `sub` (login), `uid` (id), `papel`, `app: "proposal"`, `exp` (`ACCESS_TOKEN_EXPIRE_MINUTES`).

| Situação | Status | `detail` |
|---|---|---|
| Usuário inexistente, inativo ou senha errada | 401 | `Usuário ou senha incorretos` |
| 2FA ativo e `totp_code` ausente | 401 | `2FA_REQUIRED` |
| Código 2FA errado | 401 | `Código 2FA inválido` |
| Usuário sem `acesso_proposal` | 403 | `Usuário sem acesso ao Proposal` |

Regras: só usuários do banco (**sem** fallback `USUARIOS_DEV`, **sem** seed de usuários padrão).

---

## GET `/proposal/auth/me`

**200**: `{ "usuario": "joao", "papel": "visualizador" }`

---

## GET `/proposal/propostas`

Lista as propostas visíveis ao usuário (`admin`: todas; demais: só as próprias), ordenadas por `emitida_em` desc.

**Query**: `status` (opcional): `aguardando` · `visualizada` · `assinada` · `cancelada` · `expirada` (filtra pelo status **efetivo**). `page` (padrão 1) e `page_size` (padrão 50, máx. 200).

**200**
```json
{
  "items": [
    {
      "id": 12,
      "codigo": "q3v…",
      "cliente_nome": "ACME Ltda",
      "cnpj": "11.222.333/0001-81",
      "total": "11453.00",
      "emitida_em": "2026-09-29T22:10:00Z",
      "validade": "2026-10-29",
      "status": "visualizada",
      "criado_por_usuario": "joao"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 50
}
```
Valores monetários trafegam como **string decimal** com 2 casas. A API devolve só o `codigo`; o frontend monta o link como `{VITE_PROPOSAL_PUBLIC_URL || window.location.origin}/p/{codigo}` (research R15).

---

## POST `/proposal/propostas`

Cria a proposta e gera o link.

**Request (JSON)**
```json
{
  "cliente_nome": "ACME Ltda",
  "cnpj": "11.222.333/0001-81",
  "valor": "10000.00",
  "imposto_ativo": true,
  "aliquota": "14.53",
  "validade": "2026-10-29"
}
```
- `validade` é opcional: se ausente, o padrão é hoje (São Paulo) + 30 dias.
- `aliquota` é ignorada/proibida quando `imposto_ativo = false`.

**201**: objeto completo da proposta (mesmo formato do detalhe abaixo).

| Situação | Status | `detail` |
|---|---|---|
| `cliente_nome` vazio | 422 | `Informe o nome do cliente` |
| CNPJ inválido | 422 | `CNPJ inválido` |
| `valor` ≤ 0 | 422 | `Valor deve ser maior que zero` |
| `imposto_ativo` sem alíquota ou alíquota fora de (0, 100) | 422 | `Alíquota deve ser maior que 0 e menor que 100` |
| `validade` ≤ hoje (São Paulo) | 422 | `Validade deve ser posterior à data de emissão` |

---

## GET `/proposal/propostas/{id}`

**200**
```json
{
  "id": 12,
  "codigo": "q3v…",
  "cliente_nome": "ACME Ltda",
  "cnpj": "11.222.333/0001-81",
  "valor": "10000.00",
  "imposto_ativo": true,
  "aliquota": "14.53",
  "valor_imposto": "1453.00",
  "total": "11453.00",
  "emitida_em": "2026-09-29T22:10:00Z",
  "validade": "2026-10-29",
  "status": "assinada",
  "visualizada_em": "2026-09-30T13:02:11Z",
  "cancelada_em": null,
  "criado_por_usuario": "joao",
  "assinatura": {
    "nome": "Maria Souza",
    "email": "maria@acme.com.br",
    "assinada_em": "2026-09-30T13:05:40Z",
    "ip": "200.100.50.25",
    "user_agent": "Mozilla/5.0 …",
    "conteudo_hash": "9f2c…"
  }
}
```
`assinatura` é `null` quando não assinada. **Não** marca visualização.

| Situação | Status |
|---|---|
| Inexistente ou de outro usuário (sem ser `admin`) | 404 `Proposta não encontrada` |

---

## POST `/proposal/propostas/{id}/cancelar`

Cancela uma proposta com status efetivo `aguardando` ou `visualizada`. A confirmação é feita no frontend (`window.confirm`).

**200**: objeto da proposta com `status: "cancelada"` e `cancelada_em` preenchido.

| Situação | Status | `detail` |
|---|---|---|
| Inexistente ou de outro usuário (sem ser `admin`) | 404 | `Proposta não encontrada` |
| Status efetivo `assinada`, `cancelada` ou `expirada` | 409 | `Proposta não pode ser cancelada` |

---

## Duplicar ("criar a partir de uma cópia")

Sem endpoint próprio: o frontend abre o formulário de nova proposta preenchido com `cliente_nome`, `cnpj`, `valor`, `imposto_ativo` e `aliquota` da proposta de origem, com validade padrão recalculada. A criação usa `POST /proposal/propostas`.
