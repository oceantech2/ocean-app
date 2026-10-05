# Contrato: API autenticada do Proposal (alterações)

Base: `{VITE_API_URL}/proposal/propostas`. Todas as rotas exigem `Authorization: Bearer <token do Proposal>` (`get_proposal_user`), como na 077 ([api-proposal.md](../../077-plataforma-propostas/contracts/api-proposal.md)). Proposta alheia sem papel `admin` → `404 "Proposta não encontrada"`.

---

## PUT `/proposal/propostas/{id}` (novo)

Edita uma proposta não assinada e não cancelada.

**Request (JSON)**: mesmo formato da criação, com todos os campos (o formulário vem pré-preenchido).
```json
{
  "cliente_nome": "ACME Ltda",
  "cnpj": "11.222.333/0001-81",
  "valor": "9000.00",
  "imposto_ativo": true,
  "aliquota": "14.53",
  "validade": "2026-11-15"
}
```
- `validade` ausente ou `null` → mantém a validade atual (que ainda precisa ser posterior a hoje).
- `imposto_ativo: false` → `aliquota` é ignorada e gravada como `null`.

**Processamento** (transação única, research R2):
1. `SELECT ... FOR UPDATE` da proposta; aplica a regra de visibilidade.
2. Status efetivo `assinada` → `409`; `cancelada` → `409`.
3. Valida e normaliza com as mesmas regras da criação (`validar_dados`, research R8).
4. Calcula o diff contra os valores atuais. Diff vazio → `200` com o detalhe atual, sem gravar nada.
5. Atualiza os campos, recalcula `valor_imposto`, `total` e `conteudo_hash`; `versao = versao + 1`, `atualizada_em = now()`, `status = 'aguardando'`, `versao_visualizada_em = NULL`.
6. Insere `propostas_edicoes` com `versao`, usuário e `alteracoes`.

**200**: corpo do detalhe (seção abaixo), já com a nova versão e o histórico. O campo `alterada` indica se houve mudança:
```json
{ "...detalhe...": "...", "alterada": true }
```
(`alterada` aparece só na resposta do `PUT`.)

| Situação | Status | `detail` |
|---|---|---|
| Proposta inexistente ou alheia | 404 | `Proposta não encontrada` |
| Assinada | 409 | `Proposta já assinada` |
| Cancelada | 409 | `Proposta cancelada não pode ser editada` |
| Nome vazio / muito longo | 422 | `Informe o nome do cliente` / `Nome do cliente muito longo` |
| CNPJ inválido | 422 | `CNPJ inválido` |
| Valor ≤ 0 / muito alto | 422 | `Valor deve ser maior que zero` / `Valor muito alto` |
| Imposto ligado com alíquota ausente ou fora de (0, 100) | 422 | `Alíquota deve ser maior que 0 e menor que 100` |
| Validade ≤ hoje (São Paulo) | 422 | `Validade deve ser posterior a hoje` |

Propostas **expiradas** podem ser editadas: com validade futura, voltam a `aguardando`.

---

## POST `/proposal/propostas/` (alteração)

Única mudança: a mensagem de validade inválida passa a ser `Validade deve ser posterior a hoje` (antes: `Validade deve ser posterior à data de emissão`). A regra não muda. A resposta passa a incluir os campos novos do detalhe (`versao: 1`, `atualizada_em: null`, `versao_visualizada_em: null`, `edicoes: []`).

---

## GET `/proposal/propostas/{id}` (alteração no corpo)

Campos novos no detalhe:

```json
{
  "id": 42,
  "codigo": "…",
  "status": "aguardando",
  "...campos da 077...": "...",
  "visualizada_em": "2026-09-30T12:00:00Z",
  "versao": 3,
  "atualizada_em": "2026-10-02T19:40:00Z",
  "versao_visualizada_em": null,
  "edicoes": [
    {
      "versao": 3,
      "editada_em": "2026-10-02T19:40:00Z",
      "editado_por_usuario": "admin",
      "alteracoes": [
        {"campo": "valor", "anterior": "10000.00", "novo": "9000.00"},
        {"campo": "valor_imposto", "anterior": "1453.00", "novo": "1307.70"},
        {"campo": "total", "anterior": "11453.00", "novo": "10307.70"}
      ]
    },
    {
      "versao": 2,
      "editada_em": "2026-10-01T14:02:00Z",
      "editado_por_usuario": "joao",
      "alteracoes": [{"campo": "cnpj", "anterior": "11222333000181", "novo": "11444777000161"}]
    }
  ]
}
```

- `visualizada_em`: primeira abertura do link pelo cliente (nunca zerada).
- `versao_visualizada_em`: abertura da versão atual; `null` = versão atual ainda não vista.
- `edicoes`: da mais recente para a mais antiga; `[]` se nunca editada. Valores em forma canônica (formatação na tela).

## GET `/proposal/propostas/` (sem alteração)

A listagem não muda de formato; o status reflete o reset para `aguardando` depois de uma edição.

## POST `/proposal/propostas/{id}/cancelar` (sem alteração)

Cancelar continua permitido só para `aguardando`/`visualizada` (expirada não), inclusive depois de edições.
