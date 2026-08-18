# Contrato REST: Contas correntes e caixas

**Feature**: `031-multiplas-contas-correntes`  
**Auth**: JWT. GET autenticado; POST/PUT `require_admin`.

Base: `http://localhost:8001/api`

## Recurso `ContaCorrente`

```json
{
  "id": 1,
  "codigo": "corrente",
  "nome": "Conta corrente",
  "banco": "A definir",
  "agencia": null,
  "numero": null,
  "padrao": true,
  "ativo": true
}
```

## `GET /contas-correntes`

Query opcional `ativas=true` (default: listar ativas; admin pode pedir todas).

Ordem: padrão primeiro, depois nome.

## `POST /contas-correntes`

Body: `nome`, `banco` obrigatórios; `agencia`, `numero` opcionais. `padrao` ignorado no create (sempre false).

201 + entidade com `codigo` preenchido (`cc_{id}`).

400 se nome/banco vazios, nome duplicado entre ativas, ou nome reservado do investimento.

## `PUT /contas-correntes/{id}`

Body parcial: `nome`, `banco`, `agencia`, `numero`, `padrao`, `ativo`.

- `padrao: true` → esta vira a única padrão entre ativas.
- `ativo: false` → 400 se for a última ativa ou se `padrao` ainda for true.
- `codigo` imutável.

## Roteamento existente (ajustes)

### `POST /nfs` e primeiro pagamento no `PUT /nfs/{id}`

Gravar `caixa` = codigo da corrente padrão. **Não** aceitar escolha de caixa nesse momento.

### `PUT /nfs/{id}` com NF já recebida

Aceitar `caixa` ∈ códigos de correntes **ativas** ∪ `{ "investimento" }`. 400 caso contrário.

Hoje o PUT descarta `caixa` — este contrato **substitui** esse comportamento para NF recebida.

### `GET /fluxo-movimentos?conta=`

`conta` deixa de ser só `corrente|investimento`; passa a ser um codigo válido ou `investimento`.

### `POST /fluxo-transferencias`

`origem` e `destino`: mesmos códigos; devem ser distintos; correntes citadas devem estar **ativas** (investimento sempre “ativo”).

## Fora

- DELETE físico de conta corrente
- CRUD de conta investimento
- Caixa em Contas a Pagar
