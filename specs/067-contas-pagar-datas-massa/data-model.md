# Data Model: Contas a Pagar — Edição em massa de datas

**Feature**: `067-contas-pagar-datas-massa`  
**Date**: 2026-09-14

Sem alteração de schema físico. Esta feature só define a operação de lote sobre entidades já existentes.

## Entidades persistidas (existentes)

### Conta a Pagar (`ContaPagar`)

Campos relevantes ao lote:

| Campo | Uso no lote |
|-------|-------------|
| `id` | Identificador na seleção e no body `ids` |
| `data_vencimento` | Atualizado se o lote informar vencimento |
| `data_pagamento` | Atualizado se o lote informar pagamento (nunca limpo pelo lote) |
| `pago` | `True` se pagamento for aplicado; inalterado se só vencimento |
| `caixa` | Resolvido para padrão se vazio ao marcar paga; senão conta pode ser ignorada |

Demais campos (valor, categoria, fornecedor, tipo etc.) **não** entram no lote.

## Entidades de sessão (só UI)

### Seleção em massa

- Conjunto de `id` de contas marcadas na listagem filtrada atual.
- Invalidada (limpa) ao mudar filtros, mês/ano, busca ou após lote **bem-sucedido**.
- Inclui ids obtidos por: checkbox de linha, checkbox de grupo Mês/Ano, (opcional) marcar todas as linhas visíveis.

### Grupo Mês/Ano (visível)

- Chave: `chaveMesVencimento(data_vencimento)` (`YYYY-MM` ou `sem-vencimento`).
- Contém as contas **visíveis** com a mesma chave no recorte filtrado.
- Cabeçalho de grupo com checkbox marca/desmarca todos os ids do grupo.

## Operação: Lote de datas

Não é tabela. Payload lógico:

| Campo | Obrigatório | Semântica |
|-------|-------------|-----------|
| `ids` | sim (≥1) | Contas a atualizar |
| `data_vencimento` | não | Se data válida → aplica a todas processadas; se omitido/null → não altera |
| `data_pagamento` | não | Se data válida → aplica e `pago=True`; se omitido/null → não altera |

**Invariantes**:
- Pelo menos um de `data_vencimento` / `data_pagamento` deve ser data válida (senão 422).
- Sem validação cruzada pagamento ≥ vencimento.
- Ids inexistentes → `ignorados++` (não falha o lote inteiro).
- Conta que não puder ficar paga (caixa inválido após resolver) → `ignorados++`.

**Resultado**:

| Campo | Significado |
|-------|-------------|
| `processados` | Contas efetivamente atualizadas |
| `ignorados` | Ids sem conta ou que falharam a regra de negócio do lote |

## Transições de estado (pago)

```text
pendente + lote com data_pagamento  →  paga (pago=True, data_pagamento=nova)
paga     + lote com data_pagamento  →  paga (data_pagamento substituída)
*        + lote só data_vencimento  →  status pago inalterado; só vencimento muda
*        + lote sem limpeza         →  impossível voltar a pendente por este fluxo
```

## Validação

| Regra | Onde |
|-------|------|
| `ids` não vazio | API |
| ≥1 data válida no body | API (+ UI) |
| Datas de calendário válidas | API schema date + input date |
| Sem limpeza via null | API do lote (null = ignore) |
| Escrita só admin | `require_admin` |
