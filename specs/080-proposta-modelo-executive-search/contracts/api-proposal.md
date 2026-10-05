# Contrato: API autenticada do Proposal (alterações da 080)

Base: `{VITE_API_URL}/proposal`. Todas as rotas exigem `Authorization: Bearer <token do Proposal>` (`get_proposal_user`), como nas features 077 e 079. Proposta alheia sem papel `admin` → `404 "Proposta não encontrada"`. Erros de validação: `422` com `detail` string em pt-BR (tabela completa em [data-model.md](../data-model.md#regras-de-validação-serviço-validar_modelo)).

---

## POST `/proposal/propostas/` (alterado)

Cria **somente** propostas por modelo (FR-012).

**Request (JSON)**:
```json
{
  "modelo": "executive-search",
  "cliente_nome": "Arxen",
  "data_proposta": "2026-10-24",
  "setor": "infraestrutura",
  "consultor_nome": "Fábio Porto D'Ave",
  "consultor_cargo": "Managing Partner",
  "consultor_telefone": "+55 21 97554-0224",
  "consultor_email": "fabio@oceantalentsolutions.com",
  "projeto_nome": "Posição 1",
  "garantia_meses": 4,
  "investimentos": [
    { "tipo": "retainer", "taxa_tipo": "percentual", "taxa": "15", "entrada": 40 },
    { "tipo": "sucesso", "taxa_tipo": "percentual", "taxa": "18", "entrada": null },
    { "tipo": "valor-fechado", "taxa_tipo": "valor", "taxa": "50000", "entrada": 50 }
  ],
  "validade": "2026-11-04"
}
```
- `data_proposta` ausente → hoje (São Paulo). `validade` ausente → hoje + 30 dias.
- `investimentos` pode vir em qualquer ordem; é gravado na ordem Retainer, Sucesso, Valor fechado.
- `entrada` `0`/`null`/ausente → sem entrada.
- Campos da 077 (`cnpj`, `valor`, `imposto_ativo`, `aliquota`) são **ignorados** nesta rota.
- Grava `modelo_versao = versao_atual` do registro; `imposto_ativo = false`, `valor_imposto = 0`, `cnpj/valor/total = NULL`.

**201**: corpo do detalhe (abaixo).

| Situação | Status | `detail` |
|---|---|---|
| `modelo` ausente, `simples` ou indisponível | 422 | `Modelo de proposta inválido` |
| Demais campos inválidos | 422 | ver data-model |

---

## PUT `/proposal/propostas/{id}` (alterado)

Mantém o fluxo da 079 (lock, `409` assinada/cancelada, diff, `versao + 1`, status `aguardando`, histórico). A validação depende do `modelo` **da proposta**:

| `modelo` da proposta | Corpo esperado | Validação |
|---|---|---|
| `simples` | formato da 079 (`cliente_nome`, `cnpj`, `valor`, `imposto_ativo`, `aliquota`, `validade`) | `validar_dados` (inalterado) |
| `executive-search` (e futuros) | formato do POST acima | `validar_modelo`; `modelo_versao` atualizado para a versão vigente |

- `modelo` no corpo diferente do da proposta → `422 "O modelo da proposta não pode ser alterado"`.
- `data_proposta` ausente na edição → mantém a atual.
- Diff (R8): escalares + uma entrada por tipo de investimento (`investimento.retainer` etc.).

---

## GET `/proposal/propostas/{id}` (corpo alterado)

Campos novos, sempre presentes (nulos em `simples`):
```json
{
  "id": 51,
  "codigo": "…",
  "modelo": "executive-search",
  "modelo_nome": "Executive Search",
  "modelo_versao": 1,
  "cliente_nome": "Arxen",
  "data_proposta": "2026-10-24",
  "setor": "infraestrutura",
  "consultor_nome": "Fábio Porto D'Ave",
  "consultor_cargo": "Managing Partner",
  "consultor_telefone": "+55 21 97554-0224",
  "consultor_email": "fabio@oceantalentsolutions.com",
  "projeto_nome": "Posição 1",
  "garantia_meses": 4,
  "investimentos": [
    { "tipo": "retainer", "taxa_tipo": "percentual", "taxa": "15.00", "entrada": 40 }
  ],
  "cnpj": null,
  "valor": null,
  "total": null,
  "...demais campos da 077/079 (status, validade, versao, edicoes, assinatura...)": "..."
}
```
- Propostas `simples`: `modelo: "simples"`, `modelo_nome: "Proposta simples"`, campos do modelo `null`; CNPJ/valor/imposto como hoje.

## GET `/proposal/propostas/` (item alterado)

Item da lista ganha `modelo`, `modelo_nome`, `projeto_nome`, `data_proposta` (em `simples`: `null` → a tela usa a data de emissão e "—"). `cnpj` e `total` continuam no item (nulos nas propostas por modelo); a tela deixa de exibi-los (FR-026). Filtros e paginação inalterados.

## POST `/proposal/propostas/{id}/cancelar` (sem alteração)

---

## GET `/proposal/perfil` (novo)

Perfil do consultor do usuário do token.

**200**:
```json
{ "nome": "Fábio Porto D'Ave", "cargo": "Managing Partner", "telefone": "+55 21 97554-0224", "email": "fabio@oceantalentsolutions.com", "atualizado_em": "2026-10-05T13:00:00Z" }
```
Sem perfil gravado → `200` com todos os campos `null`.

## PUT `/proposal/perfil` (novo)

**Request**: `{ "nome": "...", "cargo": "...", "telefone": "...", "email": "..." }`. Campos vazios ou `null` → gravados como `NULL`. Upsert por `usuario_id` do token (nunca recebe id).

**200**: mesmo corpo do `GET`.

| Situação | Status | `detail` |
|---|---|---|
| Nome ou cargo com mais de 255 caracteres | 422 | `Nome muito longo` / `Cargo muito longo` |
| Telefone preenchido com menos de 10 ou mais de 13 dígitos | 422 | `Telefone inválido` |
| E-mail preenchido inválido | 422 | `E-mail inválido` |

---

## Registro de modelos (backend)

`app/services/proposta_modelos.py`:
```python
MODELOS = {
    "executive-search": {"nome": "Executive Search", "versao_atual": 1, "disponivel": True},
}
SETORES = ("oil-gas", "energia", "infraestrutura", "mineracao", "industria-servicos")
TIPOS_INVESTIMENTO = ("retainer", "sucesso", "valor-fechado")  # ordem de exibição
```
Deve ficar em sincronia com o registro do frontend ([ui-proposal.md](./ui-proposal.md)).
