# Quickstart: Cadastro de categoria em Contas a Pagar

**Feature**: `032-cadastro-categoria-pagar`  
**Spec**: [spec.md](./spec.md) · **Contratos**: [contracts/](./contracts/)

Validação manual ponta a ponta. Sem suíte automatizada obrigatória nesta fase.

## Pré-requisitos

- Stack no ar: API **8001**, frontend **5193**, PostgreSQL **5433** (portas do projeto).
- Login `admin` e `visualizador` de desenvolvimento (não documentar senhas neste arquivo).
- Página Contas a Pagar operacional (CRUD manual já existente).

## 1. Catálogo e papéis

1. Como **admin**, abrir `/contas`, criar conta, abrir o select Categorias.
2. Conferir oficiais na ordem vigente, depois cadastradas A–Z, e por último **Nova categoria…**.
3. Fechar o formulário: a listagem **não** tem ação avulsa de cadastro.
4. Como **visualizador**, o select/filtro mostra categorias mas **não** “Nova categoria…”.
5. `GET /api/contas/categorias` com token visualizador → 200; `POST` → 403.

## 2. Cadastro feliz (SC-001, SC-004)

1. Admin, nova conta: escolher **Nova categoria…**, nome `Frota`, confirmar.
2. Toast de sucesso; campo Categorias = Frota (não vazio, não Adm/Financeiro).
3. Completar valor/vencimento, salvar; listagem mostra **Frota**.
4. Filtro Frota lista só essa conta.

## 3. Rejeições (SC-002)

Tentativas que devem falhar com mensagem clara (nada gravado):

| Nome | Motivo |
|------|--------|
| (vazio / espaços) | obrigatório |
| 21+ caracteres | limite 20 |
| `Frota!` ou emoji | charset |
| `Marketing` / `marketing` | oficial |
| `Salário` | sub RH |
| `Frota` de novo / ` frota ` | duplicata |

Cadastro válido curto: `Frota-2` ou `A/B` se único.

## 4. Ordem (SC-007)

Com pelo menos `Zebra` e `Frota` cadastradas: oficiais primeiro (bloco intacto), depois Frota, depois Zebra.

## 5. Custo por categoria (SC-005)

No período do vencimento da conta Frota, donut do Dashboard mostra fatia **Frota** (rótulo, não `cat_1`). Impostos/Retiradas inalterados (Frota não aparece lá só por existir).

## 6. Import e legado (SC-006)

- Importar linha com categoria `Frota` (nome) ou `cat_N` → aceita.
- Linha `CategoriaInexistente` → erro na linha.
- Contas anteriores à feature: mesma classificação; 0 reclassificadas no deploy.

## 7. Checagens de código

```bash
cd frontend && npm run lint && npm run type-check
```

Backend: subir container/API e repetir POST 201 + 422 acima se preferir curl em vez da UI.
