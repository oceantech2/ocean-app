# Contrato REST: Catálogo de categorias e rótulo Bônus (Contas a Pagar)

**Feature**: `062-pagar-categorias-bonus`  
**Auth**: JWT Bearer — mutações `admin`; leitura `admin` e `visualizador`  
**Prefixo**: `/api/contas`

Os endpoints de catálogo **já existem** (049). Esta entrega exige o contrato de **rótulo** e de **resolução na importação**.

---

## GET `/api/contas/categorias`

Resposta `CatalogoCategoriasContas`. Em `subcategorias_rh`, o item de código `bonus` (sistema) DEVE ter:

```json
{ "id": 1, "codigo": "bonus", "nome": "Bônus", "sistema": true }
```

salvo se o admin tiver editado o nome depois do seed. **Não** retornar `"Comissões"` nem `"Bônus & Comissão"` como nome de fábrica.

O item `comissao` permanece `{ "codigo": "comissao", "nome": "Comissão", "sistema": true }`.

---

## Mutações de catálogo (inalteradas em forma)

| Método | Caminho | Quem | Efeito |
|--------|---------|------|--------|
| POST | `/categorias` | admin | Cria cadastrada |
| PATCH | `/categorias/{id}` | admin | Renomeia cadastrada |
| DELETE | `/categorias/{id}` | admin | Remove cadastrada sem vínculos |
| POST | `/categorias/subcategorias-rh` | admin | Cria sub RH `sistema=false` |
| PATCH | `/categorias/subcategorias-rh/{id}` | admin | Renomeia qualquer sub RH |
| DELETE | `/categorias/subcategorias-rh/{id}` | admin | Remove só `sistema=false` sem vínculos |

Body de create/update: `{ "nome": "string ≤20" }`.

Erros: **422** nome inválido/duplicado; **409** ou **422** exclusão com vínculos; **422** exclusão de sistema; **403** não admin; **404** inexistente.

---

## POST `/api/contas/` e POST `/api/contas/importar-xlsx`

Campo `subcategoria` (quando categoria = Recursos Humanos) DEVE aceitar, para a **mesma** classificação `bonus`:

| Valor de entrada (exemplos) | Código gravado |
|-----------------------------|----------------|
| `bonus` | `bonus` |
| `Bônus` / `bônus` | `bonus` |
| `Comissões` / `comissões` / `comissoes` | `bonus` |
| `Bônus & Comissão` / equivalentes sem acento | `bonus` |
| `Comissão` / `comissao` | `comissao` (distinta) |

Após gravar, leituras da página (listagem/GET) exibem o **nome** do catálogo (**Bônus** para `bonus`).

---

## Fora deste contrato

- Renomear/excluir categorias oficiais de 1º nível
- Alterar rótulos legado de pendência
- Endpoints novos
- Alterar Dashboard / Impostos / Retiradas / página Comissões
