# Contrato: API pública da proposta (alterações)

Base: `{VITE_API_URL}/public/propostas`. Complementa [api-public.md](../../077-plataforma-propostas/contracts/api-public.md) da 077; regras gerais (sem `id`, sem criador, 404 genérico) continuam valendo.

---

## GET `/public/propostas/{codigo}`

**Cabeçalho opcional**: `Authorization: Bearer <token do Proposal>`. Não é obrigatório e nunca causa erro: token ausente, inválido, expirado ou de usuário que não pode ver a proposta é simplesmente ignorado.

**Efeito colateral (alterado)**: registra visualização somente quando:
- o status efetivo é `aguardando`, **e**
- a versão atual ainda não foi vista (`versao_visualizada_em IS NULL`), **e**
- a requisição **não** traz um token válido do Proposal de um usuário que pode ver a proposta (criador ou `admin`).

Nesse caso: `status = 'visualizada'`, `versao_visualizada_em = now()`, `visualizada_em = COALESCE(visualizada_em, now())` (UPDATE condicional, idempotente).

**200 — `aguardando` / `visualizada` / `assinada`**: campos da 077 mais:
```json
{
  "versao": 3,
  "atualizada_em": "2026-10-02T19:40:00Z"
}
```
- `atualizada_em`: `null` se a proposta nunca foi editada. A página mostra "Atualizada em dd/mm/aaaa" (São Paulo) só quando não for `null`.
- Não há histórico, autor da edição nem lista de campos alterados na resposta pública.

**200 — `cancelada` / `expirada`**: sem mudança (só `status`, `pode_assinar`, `mensagem`).

---

## POST `/public/propostas/{codigo}/assinar`

**Request (JSON) — alterado**
```json
{ "nome": "Maria Souza", "email": "maria@acme.com.br", "aceite": true, "versao": 3 }
```
`versao` é a recebida no último `GET`. Ausente ou `null` é tratada como divergente.

**Processamento (alterado no passo 3)**:
3. `UPDATE ... SET status='assinada', assinada_em=now() WHERE id=:id AND status IN ('aguardando','visualizada') AND validade >= hoje_SP AND versao = :versao`.
4. Se `rowcount = 0`, recarrega e devolve `409` com o motivo; a versão divergente tem prioridade de mensagem apenas quando a proposta ainda está pendente.

| Situação | Status | `detail` |
|---|---|---|
| `versao` diferente da atual (proposta editada depois que a página foi aberta) ou ausente | 409 | `Esta proposta foi atualizada. Revise os dados e assine novamente.` |
| Demais situações | — | Iguais à 077 (`Proposta já assinada`, `Proposta não está mais disponível`, `Proposta expirada`, 422 de validação) |

O hash gravado na evidência é o da versão vigente no momento do aceite (research R7).
