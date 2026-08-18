# Contrato REST: Catálogo de categorias (Contas a Pagar)

**Feature**: `032-cadastro-categoria-pagar`  
**Prefixo**: `/api/contas`  
**Auth**: Bearer JWT

## Listar catálogo

```http
GET /api/contas/categorias
Authorization: Bearer <token>
```

Papéis: `admin` e `visualizador`.

**200**

```json
{
  "oficiais": [
    { "codigo": "adm_financeiro", "nome": "Adm/Financeiro", "exige_subcategoria": false },
    { "codigo": "operacoes", "nome": "Operações", "exige_subcategoria": false },
    { "codigo": "marketing", "nome": "Marketing", "exige_subcategoria": false },
    { "codigo": "comercial", "nome": "Comercial", "exige_subcategoria": false },
    { "codigo": "recursos_humanos", "nome": "Recursos Humanos", "exige_subcategoria": true },
    { "codigo": "beneficios", "nome": "Benefícios", "exige_subcategoria": false },
    { "codigo": "tecnologia", "nome": "Tecnologia", "exige_subcategoria": false },
    { "codigo": "impostos", "nome": "Impostos", "exige_subcategoria": false }
  ],
  "cadastradas": [
    { "id": 1, "codigo": "cat_1", "nome": "Frota" }
  ],
  "subcategorias_rh": [
    { "codigo": "salario", "nome": "Salário" },
    { "codigo": "bonus", "nome": "Bônus" },
    { "codigo": "comissao", "nome": "Comissão" },
    { "codigo": "retirada_socios", "nome": "Retirada Sócios" }
  ]
}
```

Notas:
- `oficiais` na **ordem vigente** do módulo `categorias_contas` (se Benefícios ainda não estiver no código, a lista reflete o módulo real — não inventar no implement).
- `cadastradas` ordenadas por `nome` A–Z (case-insensitive).
- Sem opção “Nova categoria” neste payload (só UI).

## Cadastrar categoria

```http
POST /api/contas/categorias
Authorization: Bearer <token>
Content-Type: application/json
```

Papel: só `admin`. `visualizador` → **403**.

**Body**

```json
{ "nome": "Frota" }
```

**201**

```json
{
  "id": 1,
  "codigo": "cat_1",
  "nome": "Frota"
}
```

Registrar auditoria de criação.

### Erros

| HTTP | Quando | `detail` (pt-BR, exemplo) |
|------|--------|---------------------------|
| 401 | Sem token | padrão do app |
| 403 | Não admin | padrão require_admin |
| 422 | Nome vazio / só espaços | Nome é obrigatório |
| 422 | > 20 caracteres após trim | Nome deve ter no máximo 20 caracteres |
| 422 | Caractere inválido | Use apenas letras, números, espaços, hífen e barra |
| 422 | Duplicata (oficial, cadastrada ou sub RH, case-insensitive) | Já existe uma categoria com este nome |
| 422 | Código normalizado reservado | Este nome conflita com uma categoria ou subcategoria existente |

Não há DELETE, PATCH nem POST de subcategoria.

## Contas a pagar (existente, extensão)

`POST /api/contas` e `PUT /api/contas/{id}`: `categoria` pode ser código oficial **ou** `cat_{id}` vigente. Cadastrada + `subcategoria` preenchida → **422**. Código desconhecido → **422** (salvo fluxo atual de pendência/legado no PUT).

`GET /api/contas?categoria=cat_1`: filtra por esse código.

## Import

`POST /api/contas/importar-xlsx` (e CSV na UI): resolver cadastrada por `codigo` ou nome (trim, case-insensitive), **além** dos aliases oficiais. Categoria inexistente → erro da linha.

## Relatório

`GET /api/relatorios/custo-por-categoria`: campo `label` da fatia = nome da cadastrada quando `categoria` for `cat_{id}`.
