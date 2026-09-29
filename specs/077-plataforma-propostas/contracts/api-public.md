# Contrato: API pública da proposta (sem login)

Base: `{VITE_API_URL}`. Nenhuma rota exige `Authorization`. Consumida pela página `https://proposal.oceantalentsolutions.com/p/{codigo}`.

Regras gerais:
- Nunca expõe `id`, `criado_por_*`, dados de outras propostas nem dados do ERP (FR-017).
- Código inexistente → **sempre** `404 {"detail": "Proposta não encontrada"}`, corpo idêntico para qualquer código inválido (FR-022).

---

## GET `/public/propostas/{codigo}`

Efeito colateral: na primeira chamada, grava `visualizada_em` e muda `aguardando` → `visualizada` (UPDATE condicional; idempotente).

**200 — status efetivo `aguardando` ou `visualizada`**
```json
{
  "status": "visualizada",
  "cliente_nome": "ACME Ltda",
  "cnpj": "11.222.333/0001-81",
  "valor": "10000.00",
  "imposto_ativo": true,
  "aliquota": "14.53",
  "valor_imposto": "1453.00",
  "total": "11453.00",
  "emitida_em": "2026-09-29T22:10:00Z",
  "validade": "2026-10-29",
  "pode_assinar": true
}
```
Sem imposto: `imposto_ativo: false`, `aliquota: null`, `valor_imposto: null` (a página não mostra nenhuma linha de imposto).

**200 — `assinada`**: mesmos campos, `pode_assinar: false` e
```json
"assinatura": { "nome": "Maria Souza", "assinada_em": "2026-09-30T13:05:40Z" }
```
(sem e-mail, IP ou navegador na resposta pública).

**200 — `cancelada`**
```json
{ "status": "cancelada", "pode_assinar": false, "mensagem": "Esta proposta não está mais disponível." }
```

**200 — `expirada`**
```json
{ "status": "expirada", "pode_assinar": false, "mensagem": "Esta proposta expirou. Entre em contato com a Ocean para receber uma nova." }
```
Em `cancelada` e `expirada`, **nenhum** valor, CNPJ ou nome é devolvido (FR-021, FR-030).

---

## POST `/public/propostas/{codigo}/assinar`

**Request (JSON)**
```json
{ "nome": "Maria Souza", "email": "maria@acme.com.br", "aceite": true }
```

Processamento (transação única):
1. Localiza a proposta pelo código (404 se não existir).
2. Recalcula o hash do conteúdo; se divergir de `conteudo_hash`, recusa (409).
3. `UPDATE ... SET status='assinada', assinada_em=now() WHERE id=:id AND status IN ('aguardando','visualizada') AND validade >= hoje_SP`.
4. Se `rowcount = 0`: recarrega e devolve 409 com o motivo.
5. Insere `propostas_assinaturas` (nome, e-mail em minúsculas, aceite, IP, user-agent, hash).

**200**: mesmo corpo do GET no estado `assinada`.

| Situação | Status | `detail` |
|---|---|---|
| Código inexistente | 404 | `Proposta não encontrada` |
| `nome` com menos de 3 caracteres | 422 | `Informe o nome completo` |
| E-mail inválido | 422 | `E-mail inválido` |
| `aceite` diferente de `true` | 422 | `É necessário aceitar os termos da proposta` |
| Já assinada | 409 | `Proposta já assinada` |
| Cancelada | 409 | `Proposta não está mais disponível` |
| Expirada (inclusive se a página foi aberta antes de vencer) | 409 | `Proposta expirada` |
| Hash divergente | 409 | `Proposta não está mais disponível` |

---

## Evidências gravadas (FR-019)

| Evidência | Origem |
|---|---|
| Nome, e-mail, aceite | Corpo da requisição |
| Data e hora | Servidor (`NOW()`) |
| IP | 1º endereço de `X-Forwarded-For`; fallback `request.client.host` |
| Navegador | Cabeçalho `User-Agent` (máx. 500 caracteres) |
| Impressão digital do conteúdo | SHA-256 do JSON canônico ([data-model.md](../data-model.md) §4) |
