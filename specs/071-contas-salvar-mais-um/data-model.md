# Data Model: Contas a Pagar e Receber — botão +1

**Feature**: `071-contas-salvar-mais-um` | **Date**: 2026-09-14  
**Spec**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

## Escopo de persistência

Esta feature **não** altera o esquema do banco nem contratos REST de create/update. As entidades abaixo já existem; o +1 apenas cria novos registros via os POSTs vigentes e mantém estado **de UI** na sessão da modal.

## Entidades existentes (inalteradas)

### Conta a pagar

Persistida por `POST /api/contas` (via `contasService.criar`). Campos relevantes ao formulário de criação: descrição, categoria, subcategoria, valor, data_vencimento, data_pagamento, fornecedor_id, caixa, tipo_despesa, anexo/comprovante (upload separado).

### Conta a receber (NF)

Persistida por `POST` de NFs (via `nfsService.criar`). Campos relevantes: numero, razao_social, posicao, valores, alíquota, datas, tipo, data_pagamento, caixa, comissões/bônus no payload, anexo (upload separado).

## Entidade de sessão (somente UI)

### Sessão da modal +1

Estado efêmero na página enquanto a modal de **criação** está aberta.

| Atributo | Tipo | Notas |
|----------|------|-------|
| modal aberta | boolean | permanece `true` após +1 bem-sucedido |
| modo | `criacao` | nunca transição para edição via +1 |
| form | shape local da página | após +1 = cópia dos valores enviados + resets |
| salvando | boolean | bloqueia Salvar e +1 |
| arquivo pendente | File \| null | sempre null após +1 |
| registros já criados na sessão | implícito (listagem) | Cancelar não desfaz POSTs anteriores |

## Regras de transformação pós-+1 (estado do form)

### Contas a Pagar

```text
form' = {
  ...valoresEnviadosNoCreate,
  data_pagamento: '',
}
arquivoNf' = null
editando' = null
```

Status efetivo do próximo registro: **pendente** (sem data de pagamento).

### Contas a Receber

```text
form' = {
  ...valoresEnviadosNoCreate,
  pagamento_estado: 'pendente',
  data_pagamento: '',
  numero: '',
  data_emissao: '',
}
arquivoNfForm' = null
comissoesLinhas' / bonusLinhas' = cópia do estado usado no create (sem ids persistidos)
criando' = true
editando' = null
```

## Validações

- Idênticas às do Salvar na criação (obrigatórios, valor, RH/subcategoria, NF exige emissão se houver número, comissões/bônus, etc.).
- +1 **não** introduz validação extra além de exigir modo criação.

## Transições

```text
[Modal criação preenchida]
        | Salvar OK → fecha modal, listagem atualiza
        | +1 OK → modal aberta, form reset seletivo, listagem atualiza
        | Salvar/+1 inválido ou erro API → modal aberta, form intacto
        | Cancelar → fecha; POSTs anteriores da sessão permanecem
[Modal edição]
        | apenas Cancelar / Salvar (sem +1)
```

## Fora do modelo desta feature

- Tabelas novas, colunas novas, endpoints novos.
- Seleção múltipla / ações em lote na listagem.
- Duplicar a partir da linha da tabela.
