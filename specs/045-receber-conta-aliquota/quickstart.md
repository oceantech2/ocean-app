# Quickstart: Contas a Receber — Conta, Alíquota e cards líquidos

**Feature**: `045-receber-conta-aliquota`  
Contratos: [rest-receber-conta-aliquota.md](./contracts/rest-receber-conta-aliquota.md), [ui-receber-conta-aliquota.md](./contracts/ui-receber-conta-aliquota.md)  
Modelo: [data-model.md](./data-model.md)

## Pré-requisitos

- API em `http://localhost:8001`, frontend em `http://localhost:5193`
- PostgreSQL na porta **5433**
- Pelo menos **duas** contas correntes ativas (Fluxo de Caixa → Gerenciar contas)
- Login **admin** (`admin` / `123456` em dev)

## Subir

```bash
docker compose up -d
cd frontend && npm run dev
```

Aguardar migração (`aliquota_imposto` em `nfs`) no boot do backend.

## Validação ponta a ponta

### 1. Campo Conta na criação

1. Abrir **Contas a Receber** (`/nfs`) → **+ Nova conta a receber**.
2. Confirmar campo **Conta** visível com pagamento **Pendente**.
3. Valor inicial = primeira corrente ativa (slot 1 / “Conta Corrente 1” se for o nome).
4. Escolher a **segunda** corrente, preencher empresa, bruto, alíquota, tipo; salvar **Pendente**.
5. Reabrir edição → Conta continua a segunda corrente.

### 2. Cálculo automático (Alíquota)

1. Nova conta: bruto **10.000**, alíquota **6**.
2. Impostos = **600,00** e Líquido = **9.400,00** (somente conferência).
3. Tentar digitar Impostos ou Líquido → campos não alteram.
4. Mudar alíquota para **0** → Impostos 0, Líquido = bruto.
5. Salvar e recarregar → mesmos valores.

### 3. Edição com recálculo

1. Editar conta criada; alterar alíquota para **6,5%**.
2. Impostos = **650**, Líquido = **9.350**; salvar.
3. Editar só vencimento (sem mexer bruto/alíquota) → imposto/líquido inalterados.

### 4. Recebida com Conta escolhida

1. Criar conta **Recebida** com Conta = segunda corrente.
2. Fluxo de Caixa → entrada só nessa conta.

### 5. Cards líquidos

1. Ter ao menos uma conta **pendente** e uma **vencida** com bruto ≠ líquido.
2. Cards exibem **Líquido Pendente** e **Líquido Vencido**.
3. Soma manual dos **valores líquidos** bate com os cards (não usar bruto).

### 6. Visualizador

1. Login `visualizador` / `123456`.
2. Vê cards com novos rótulos; não cria nem edita.

### 7. Qualidade

```bash
cd frontend && npm run lint && npm run type-check
```

## Falhas esperadas

| Ação | Resultado |
|------|-----------|
| Alíquota −1 ou 101 | Toast/400; não salva |
| Conta = investimento (API) | 400 |
| Bruto vazio | Bloqueio; não salva |
| Registro legado sem alíquota | Listagem/cards OK; alíquota vazia na edição até informada |

## Referência rápida API

```bash
# Resumo — conferir totais líquidos
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8001/api/nfs/resumo?ano=2026" | jq '.total_liquido_pendente, .total_liquido_vencido'
```
