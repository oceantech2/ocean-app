# Contrato REST: Categorias e Subcategorias RH (Contas a Pagar)

**Feature**: `049-categorias-ordem-lancamento`  
**Auth**: JWT Bearer — mutações `admin`; leitura `admin` e `visualizador`  
**Prefixo**: `/api/contas`

---

## Tipos

### `CatalogoCategoriasContas` (estendido)

```json
{
  "oficiais": [
    { "codigo": "recursos_humanos", "nome": "Recursos Humanos", "exige_subcategoria": true }
  ],
  "cadastradas": [
    { "id": 1, "codigo": "cat_1", "nome": "Eventos" }
  ],
  "subcategorias_rh": [
    { "id": 1, "codigo": "bonus", "nome": "Bônus & Comissão", "sistema": true },
    { "id": 10, "codigo": "sub_10", "nome": "Auxílio Home Office", "sistema": false }
  ]
}
```

| Campo | Notas |
|-------|--------|
| subcategorias_rh[].sistema | `true` = padrão; não excluível |
| subcategorias_rh[].nome para `bonus` | **Bônus & Comissão** (não “Comissões”) |
| comissao | permanece **Comissão** |

### Bodies

```json
{ "nome": "string ≤20" }
```

Usado em create/update de categoria cadastrada e subcategoria RH.

---

## Endpoints

### GET `/api/contas/categorias`

Já existe. Resposta: `CatalogoCategoriasContas` com `sistema` nas subcategorias RH e rótulo atualizado de `bonus`.

### POST `/api/contas/categorias`

Já existe. Cria cadastrada. Admin.

### PATCH `/api/contas/categorias/{id}`

Atualiza `nome` da cadastrada. Admin.  
**422** nome inválido/duplicado. **404** se não existir.

### DELETE `/api/contas/categorias/{id}`

Remove cadastrada. Admin.  
**409** ou **422** se houver contas vinculadas. **404** se não existir.

### POST `/api/contas/categorias/subcategorias-rh`

Cria subcategoria RH (`sistema=false`). Admin. Body `{ "nome" }`.  
**201** com `{ id, codigo, nome, sistema: false }`.

### PATCH `/api/contas/categorias/subcategorias-rh/{id}`

Atualiza `nome` (sistema ou custom). Admin.

### DELETE `/api/contas/categorias/subcategorias-rh/{id}`

Remove só se `sistema=false` e sem vínculos. Admin.  
**409/422** se sistema ou em uso.

---

## Erros (padrão)

| Situação | Status | detail (exemplo) |
|----------|--------|------------------|
| Nome duplicado / inválido | 422 | mensagem em pt-BR |
| Exclusão com vínculos | 409 ou 422 | “Há contas usando esta categoria/subcategoria” |
| Exclusão de sistema | 422 | “Subcategoria padrão não pode ser excluída” |
| Não admin | 403 | |

---

## Fora deste contrato

- Renomear/excluir categorias oficiais  
- Reclassificação em massa  
- Alterar rótulos legados de pendência  
- Endpoints de ordenação (ordenação é client-side sobre `criado_em` já nas listagens)
