# Contrato UI: Comissões — ações da listagem

**Feature**: `048-comissoes-acoes-listagem`  
**Rota**: `/comissoes`  
**Página**: `frontend/src/pages/Bonus.tsx`  
REST: [rest-comissoes-acoes.md](./rest-comissoes-acoes.md)

---

## Listagem agrupada por fornecedor

Paginação: **20 grupos** por página. “Página atual” = grupos (e linhas) visíveis nesse slice.

### Colunas / indicadores

| Elemento | Escopo | Conteúdo |
|----------|--------|----------|
| ☐ | linha | Checkbox — só `admin` |
| ☐ (grupo) | grupo | Marca/desmarca todas as linhas **do grupo na página atual** |
| Liberado | **linha** | Valor BRL se `liberado`; senão “—” |
| Liberado | **grupo** | Soma automática das liberadas do fornecedor no recorte filtrado |
| Pago | **linha** | Badge **Pago** / **Pendente** |
| Ações | linha | conforme tabela abaixo |

Demais colunas (mês/ano, atividade, cliente, %, valor, etc.) permanecem como hoje.

### Ações por linha (`admin`)

| Estado | Ações |
|--------|-------|
| Não liberada | **Editar**, **Liberar** |
| Liberada, não paga | **Editar**, **Pagar** |
| Paga | **Editar** |
| Sem `nf_id` | **Editar** → toast “Sem Conta a receber associada”; Liberar/Pagar se elegíveis |

- **Editar**: `navigate('/nfs?edit=' + nf_id)` (deep-link já tratado em `NFs.tsx`).
- **Liberar** / **Pagar**: `window.confirm` → POST → toast → reload.
- **Deletar**: **ausente** (sem botão, sem handler).

### Visualizador

Vê colunas Liberado/Pago; **sem** checkboxes, barra de lote, Liberar, Pagar ou Editar com persistência.

---

## Seleção e ações em massa (`admin`)

Barra visível quando `selecionados.size > 0`:

| Botão | Elegibilidade |
|-------|----------------|
| Liberar em massa | `!liberado` na seleção |
| Pagar em massa | `liberado && !pago` na seleção |

Feedback toast: `processados` liberada(s)/paga(s), `ignorados` ignorada(s).

### Limpeza da seleção (FR-012a)

| Evento | Comportamento |
|--------|----------------|
| Mudança de **página** (`Pagination.onChange`) | `selecionados` → `Set` vazio |
| Mudança de **filtros** (fornecedor, ano, recorte, mês, trimestre) | já limpa hoje; manter |

Lote **nunca** inclui linhas de outras páginas, mesmo se IDs antigos existissem (após limpeza, impossível).

---

## Estados vazios / erro

- Sem resultados no filtro: estado vazio; totais/Liberado zerados; barra de lote oculta.
- Erro de API: toast com mensagem amigável; seleção pode permanecer até reload bem-sucedido do lote (após sucesso: limpar seleção, como hoje).
