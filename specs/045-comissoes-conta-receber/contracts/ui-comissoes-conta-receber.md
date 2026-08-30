# Contrato UI: Comissões vinculadas à Conta a receber

**Feature**: `045-comissoes-conta-receber`  
REST: [rest-comissoes-conta-receber.md](./rest-comissoes-conta-receber.md)  
Modelo: [data-model.md](../data-model.md)

---

## 1. Contas a Receber (`/nfs`) — modal criar/editar

### Bloco Comissões

Posição: após campos financeiros principais, antes dos botões Salvar/Cancelar.

| Elemento | Comportamento |
|----------|---------------|
| Título | **Comissões** |
| Adicionar linha | Botão `+ Adicionar comissão` |
| Linha vazia | Permitido gravar conta sem linhas |
| Fornecedor | `<select>` — fornecedores ativos (`colaboradoresService.listar`) |
| Mês / Ano | Dois selects/inputs; default mês/ano corrente |
| Atividade | Checkboxes: Lead, Venda, Condução, Placement (≥1 obrigatório) |
| Percentual (%) | Input numérico |
| Valor da comissão (R$) | **Read-only**; preview `(pct/100)×valor_liquido` do form |
| Remover linha | Só se linha **não liberada**; liberadas aparecem disabled com badge **Liberada** / **Paga** |

### Validação antes de salvar (cliente)

- Linha parcialmente preenchida → toast erro indicando linha N.
- `valor_liquido` alterado → recalcular preview de todas linhas não liberadas.

### Deep-link Editar (vindo de Comissões)

URL: `/nfs?edit={nfId}`

- Ao montar, se `edit` presente e admin: abrir modal edição dessa NF + carregar comissões (`GET /api/bonus?nf_id=`).
- Após fechar modal: limpar query (`replace` sem `edit`).

---

## 2. Página Comissões (`/comissoes`)

### Listagem agrupada por Fornecedor

| Coluna | Escopo | Conteúdo |
|--------|--------|----------|
| ☐ | linha | Checkbox (admin only) |
| Mês/Ano | linha | |
| Atividade | linha | Badges múltiplos (não “Etapa”) |
| Cliente / Posição | linha | Da NF vinculada ou legado |
| NF Ref. | linha | Número da conta |
| Percentual | linha | |
| Valor | linha | `valor_bonus` formatado BRL |
| Liberado | **grupo** | Soma automática liberada do fornecedor no recorte (FR-011) |
| Pago | linha | **Pago** / **Pendente** |
| Ações | linha | ver abaixo |

### Ações por linha (admin)

| Estado | Ações visíveis |
|--------|----------------|
| Não liberada | **Editar**, **Liberar** |
| Liberada, não paga | **Editar**, **Pagar** |
| Paga | **Editar** (abre conta; linha read-only no bloco) |
| Sem `nf_id` | **Editar** → toast “Sem Conta a receber associada”; **Liberar**/**Pagar** normais |

**Editar**: `navigate('/nfs?edit=' + nf_id)`.

**Liberar** / **Pagar**: `window.confirm` → POST individual → toast + reload.

**Deletar**: **ausente** (FR-008).

### Barra de ações em massa (admin)

Visível quando ≥1 checkbox marcado:

| Botão | Elegibilidade na seleção |
|-------|--------------------------|
| Liberar em massa | linhas com `!liberado` |
| Pagar em massa | linhas com `liberado && !pago` |

Confirmação única → POST lote → toast `"X liberadas, Y ignoradas"` (ou equivalente pagar).

Checkbox no cabeçalho do grupo: marca/desmarca linhas visíveis do fornecedor.

### Filtros (mantidos da 044)

- Fornecedor (renomear label de “Colaborador” / equipe)
- Ano, recorte mês/trimestre/ano inteiro
- Todos aplicam a listagem, total, Liberado, export CSV

### Visualizador

Sem checkbox, sem barra de lote, sem Liberar/Pagar/Editar com persistência. Vê colunas Liberado e Pago.

---

## 3. Componente reutilizável

**`ComissoesLinhasForm`**

Props sugeridas:

```typescript
{
  valorLiquido: number;
  linhas: ComissaoLinhaForm[];
  onChange: (linhas: ComissaoLinhaForm[]) => void;
  fornecedores: Colaborador[];
  readOnly?: boolean; // visualizador
}
```

Usado em `NFs.tsx` (criar/editar). Não usado em `Bonus.tsx` (edição só via conta).

---

## 4. Tipos frontend (`types/index.ts`)

Estender `Bonus`:

```typescript
nf_id?: number | null;
atividades?: string[];
liberado?: boolean;
pago?: boolean;
data_liberacao?: string | null;
data_pagamento?: string | null;
```

`ComissaoLinhaForm`: campos do input + `id?`, `liberado?`, `pago?` para UI disabled state.

---

## 5. Serviços (`api.ts`)

```typescript
bonusService.liberar(id)
bonusService.pagar(id)
bonusService.liberarLote(ids: number[])
bonusService.pagarLote(ids: number[])
bonusService.listar(..., nf_id?: number)

nfsService.criar({ ...nf, comissoes?: ComissaoLinhaInput[] })
nfsService.atualizar(id, { ...nf, comissoes?: ComissaoLinhaInput[] })
```

---

## 6. Fora de escopo UI

- Import CSV em Comissões: mantém colunas legadas (`etapa`); não exige `atividades`/`nf_id` nesta feature.
- Modal de data ao Pagar: **não** (data automática).
- Estornar Liberar/Pagar: **não**.
