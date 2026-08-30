# Contrato REST: Contas a Pagar — Exportação alinhada à listagem

**Feature**: `046-contas-pagar-listagem-colunas` | **Date**: 2026-08-29  
**Base**: `GET /api/contas/exportar-xlsx` (existente)

Demais endpoints (`GET /api/contas`, CRUD, categorias) **inalterados**. Filtro Mês/Ano da tela é **client-side**; só a exportação Excel replica filtros no servidor para paridade FR-011.

## GET /api/contas/exportar-xlsx

### Query parameters

| Param | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `categoria` | string | não | Igual `GET /api/contas` |
| `subcategoria` | string | não | Só com RH |
| `pago` | boolean | não | Igual listagem |
| `mes` | int 1–12 | não | Mês de vencimento; omitir se visão **Todos** |
| `ano` | int | não | Ano de vencimento; omitir se visão **Todos** |

**Regras**:
- Se `mes` **e** `ano` presentes → filtrar vencimento na competência.
- Se ambos omitidos → todas as competências (equivalente a **Todos** na UI).
- Mesmos filtros de categoria/subcategoria/pago da listagem.

### Response

- `200`: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Corpo: planilha com colunas alinhadas à tabela (ordem lógica):

  Descrição, Categoria, Mês/Ano, Fornecedor, Valor, Vencimento, Pagamento, Conta, Tipo, Status

- **Categoria**: rótulo legível (oficial/cadastrada; RH com subcategoria).
- **Mês/Ano**: `Agosto/2026` ou vazio/`—` sem vencimento.
- **Tipo**: Fixo / Variável.
- **Conta**: rótulo caixa (já existente).

### Erros

- `401`: não autenticado
- `422`: `subcategoria` sem categoria RH (mesma regra da listagem)

## Frontend (`contasService.exportarXlsx`)

Ao exportar, enviar params derivados do estado atual:

```typescript
exportarXlsx({
  categoria: contasCategoria || undefined,
  subcategoria: contasSubcategoria || undefined,
  pago: contasPago === '' ? undefined : contasPago === 'true',
  mes: contasMesTodos ? undefined : contasMes,
  ano: contasMesTodos ? undefined : contasAno,
});
```

**Nota**: Filtros puramente locais (descrição, intervalo de datas, alertas) **não** vão para o XLSX server-side. Se estiverem ativos, o Excel pode incluir **mais** linhas que a tela — documentado em quickstart como limitação conhecida **ou** implementação futura de export 100% client-side. **Decisão de implementação preferida**: aplicar no backend apenas o que a API já suporta; filtros locais restantes filtram no client antes de decidir entre (a) aviso ao usuário ou (b) export CSV para recorte exato. Plano recomenda **CSV/PDF = recorte exato**; **Excel = filtros API + Mês/Ano** (paridade parcial aceitável se descrição/datas locais vazios — cenário usual).

## Sem alteração

- `GET /api/contas/` — sem params `mes`/`ano`
- Schema `ContaPagarResponse` — sem campos novos
