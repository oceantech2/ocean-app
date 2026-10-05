# Contrato: API pública do Proposal (alterações da 080)

Base: `{VITE_API_URL}/public/propostas`. Sem login. Regras de visualização, token opcional e assinatura com `versao` seguem a 079 ([api-public.md](../../079-proposta-editar-antes-assinatura/contracts/api-public.md)).

---

## GET `/public/propostas/{codigo}` (corpo alterado)

### Proposta por modelo, `aguardando` / `visualizada` / `assinada`

```json
{
  "status": "visualizada",
  "pode_assinar": true,
  "modelo": "executive-search",
  "modelo_versao": 1,
  "cliente_nome": "Arxen",
  "data_proposta": "2026-10-24",
  "setor": "infraestrutura",
  "consultor": {
    "nome": "Fábio Porto D'Ave",
    "cargo": "Managing Partner",
    "telefone": "+55 21 97554-0224",
    "telefone_digitos": "5521975540224",
    "email": "fabio@oceantalentsolutions.com"
  },
  "projeto_nome": "Posição 1",
  "garantia_meses": 4,
  "investimentos": [
    { "tipo": "retainer", "taxa_tipo": "percentual", "taxa": "15.00", "entrada": 40 },
    { "tipo": "sucesso", "taxa_tipo": "percentual", "taxa": "18.00", "entrada": null },
    { "tipo": "valor-fechado", "taxa_tipo": "valor", "taxa": "50000.00", "entrada": 50 }
  ],
  "validade": "2026-11-04",
  "versao": 2,
  "atualizada_em": "2026-10-06T14:10:00Z",
  "assinatura": null
}
```
- `telefone_digitos`: dígitos com `55` prefixado quando o telefone tiver 10 ou 11 dígitos (R10); usado em `tel:` e `wa.me`.
- `assinatura` (só quando `assinada`): `{ "nome": "...", "assinada_em": "..." }`.
- **Não** expõe: `id`, `codigo`, `emitida_em`, usuário criador, `conteudo_hash`, CNPJ/valor (inexistentes no modelo), histórico de edições.

### Proposta `simples`

Corpo atual da 079, acrescido de `"modelo": "simples"`.

### `cancelada` / `expirada` / inexistente

Sem mudança: `{status, pode_assinar: false, mensagem}` para cancelada/expirada e `404 "Proposta não encontrada"` para inexistente, sem dados da proposta, qualquer que seja o modelo.

---

## POST `/public/propostas/{codigo}/assinar` (sem alteração de contrato)

Mesmo corpo da 079 (`nome`, `email`, `aceite`, `versao`) e mesmas respostas (`200` com o corpo público; `409` "Esta proposta foi atualizada…", "Proposta já assinada", "Proposta não está mais disponível", "Proposta expirada"; `422` de validação). O hash verificado e gravado passa a ser o canônico por modelo (R7).
