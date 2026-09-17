# Contract REST: Contas a Pagar — Tipo Imposto / DAS

**Feature**: `074-contas-tipo-imposto-das` | **Date**: 2026-09-16

## Autenticação

Todos os endpoints: `Authorization: Bearer <JWT>`. Escrita: papel `admin`. Leitura: `admin` ou `visualizador`.

## `tipo_despesa`

| Valor API | Rótulo |
|-----------|--------|
| `fixo` | Fixo |
| `variavel` | Variável |
| `imposto_das` | Imposto / DAS |

## POST `/api/contas` / PUT `/api/contas/{id}`

### Request (trechos relevantes)

```json
{
  "tipo_despesa": "imposto_das",
  "categoria": null,
  "subcategoria": null
}
```

ou com categoria operacional opcional:

```json
{
  "tipo_despesa": "imposto_das",
  "categoria": "adm_financeiro"
}
```

### Regras

| Condição | Resposta |
|----------|----------|
| `tipo_despesa` inválido | 422 — Tipo deve ser Fixo, Variável ou Imposto / DAS |
| `fixo`/`variavel` sem categoria | 422 |
| `categoria` ∈ {impostos, imposto} | 422 |
| `imposto_das` sem categoria | 200/201 OK |
| `imposto_das` + RH sem sub | 422 |

### Response

Inclui `tipo_despesa` e, em exportações, rótulo derivado. Demais campos inalterados.

## GET `/api/impostos/de-contas?ano={ano}`

### Comportamento

Soma mensal de `contas_pagar.valor` onde `tipo_despesa = 'imposto_das'` e vencimento no mês/ano (mesma regra de data já usada; não filtrar por categoria Impostos).

### Response (inalterada na forma)

```json
[
  {
    "mes": 1,
    "ano": 2026,
    "faturamento": 0,
    "valor_imposto": 0,
    "percentual_imposto": 0
  }
]
```

## GET `/api/relatorios/custo-por-categoria` (e DRE que exclui impostos de Contas)

- Contas com `tipo_despesa = imposto_das` **não** entram nas fatias de categoria.
- **Não** devolver fatia `impostos` derivada do Tipo.

## Importação Contas a Pagar

| Linha | Resultado |
|-------|-----------|
| Categoria Impostos / imposto | Rejeitada (erro na linha) |
| Tipo Imposto / DAS ou `imposto_das`, categoria vazia | Aceita |
| Tipo Imposto / DAS + categoria oficial válida | Aceita |
| Tipo ausente | `variavel` (padrão vigente) |

## Exportação XLSX / CSV / PDF

Coluna **Tipo** com rótulos Fixo | Variável | Imposto / DAS alinhados à listagem.
