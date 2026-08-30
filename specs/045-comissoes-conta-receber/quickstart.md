# Quickstart: Comissões vinculadas à Conta a receber

**Feature**: `045-comissoes-conta-receber`  
Contratos: [ui-comissoes-conta-receber.md](./contracts/ui-comissoes-conta-receber.md), [rest-comissoes-conta-receber.md](./contracts/rest-comissoes-conta-receber.md)  
Modelo: [data-model.md](./data-model.md)

## Pré-requisitos

- API `http://localhost:8001`, frontend `http://localhost:5193`
- PostgreSQL porta **5433**
- Login `admin` / `123456` e `visualizador` / `123456`
- Pelo menos **2 fornecedores ativos** no cadastro
- Feature **044-comissoes-pagina** já aplicada (rota `/comissoes`, nomenclatura)

## Subir ambiente

```bash
docker compose up -d
cd frontend && npm run dev
```

Reiniciar backend após deploy para rodar migração inline (`bonus.*`).

---

## Validação ponta a ponta

### 1. Cadastro de comissões na Conta a receber

1. Como **admin**, abrir **Contas a Receber** (`/nfs`) → **Nova conta a receber**.
2. Preencher subtítulo/empresa, **valor líquido** = `1000`, demais campos obrigatórios.
3. No bloco **Comissões**, adicionar **2 linhas**:
   - Fornecedor A, mês/ano corrente, Atividade **Lead**, percentual **10** → valor preview **R$ 100,00**.
   - Fornecedor B, Atividade **Venda** + **Condução**, percentual **5** → **R$ 50,00**.
4. Salvar → toast sucesso.
5. Abrir **Comissões** (`/comissoes`) → ambas linhas visíveis, agrupadas por fornecedor, badges de atividade corretos.

### 2. Cálculo automático e edição na conta

1. Editar a conta criada → alterar **valor líquido** para `2000`.
2. Conferir que linhas **não liberadas** mostram valor recalculado (10% → R$ 200; 5% → R$ 100).
3. Salvar → Comissões reflete novos valores.

### 3. Editar pela página Comissões

1. Em `/comissoes`, acionar **Editar** em linha com conta vinculada.
2. Deve abrir `/nfs?edit={id}` com modal da conta e bloco de comissões.
3. Incluir terceira linha (não liberada), salvar, voltar a Comissões → 3 linhas.

### 4. Liberar, coluna Liberado e Pagar

1. **Liberar** uma linha do Fornecedor A → confirmar.
2. Coluna **Liberado** do grupo A mostra soma só das liberadas no recorte.
3. Linha liberada: **Pagar** disponível; **Liberar** some.
4. Tentar **Pagar** linha ainda não liberada → indisponível ou erro claro.
5. **Pagar** linha liberada → coluna **Pago** = Pago.

### 5. Ações em massa

1. Selecionar 3 linhas não liberadas (checkbox) → **Liberar em massa** → confirmar.
2. Toast informa processados/ignorados.
3. Selecionar mix (liberada + paga + pendente) → **Pagar em massa** → só elegíveis pagas.

### 6. Sem Deletar; legado sem conta

1. Confirmar **ausência** do botão **Deletar** (admin e visualizador).
2. Se existir registro legado sem `nf_id`: **Editar** mostra toast de ausência de conta; **Liberar**/**Pagar** ainda funcionam se aplicável.

### 7. Visualizador

1. Login `visualizador` → `/comissoes`.
2. Vê Liberado/Pago; **sem** checkbox, lote, Liberar, Pagar, Editar persistente.

### 8. Exclusão da conta

1. Como admin, excluir a Conta a receber vinculada.
2. Comissões dessa conta **somem** da listagem.

---

## Smoke API (opcional)

```bash
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=admin&password=123456' | jq -r .access_token)

# Criar conta com comissão
curl -s -X POST http://localhost:8001/api/nfs \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "razao_social":"Teste QA",
    "valor_bruto":1000,
    "valor_liquido":900,
    "tipo":"sucesso",
    "comissoes":[{"colaborador_id":1,"mes":8,"ano":2026,"atividades":["lead"],"percentual":10}]
  }' | jq .

# Liberar em lote
curl -s -X POST http://localhost:8001/api/bonus/acoes/liberar \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"ids":[1,2]}' | jq .
```

Ajuste `colaborador_id` e `ids` conforme ambiente.

---

## Verificação técnica

```bash
cd frontend && npm run lint && npm run type-check
```

---

## Critérios de aceite (spec)

| ID | Verificação rápida |
|----|-------------------|
| SC-001 | Criar conta + 2 comissões < 3 min sem ir a Comissões antes |
| SC-002 | Valor = percentual × líquido / 100, sem digitar valor |
| SC-003 | Zero Deletar; Editar abre conta |
| SC-004 | Liberado = soma correta por fornecedor |
| SC-005 | Lote 5+ linhas na primeira tentativa |
| SC-006 | Visualizador read-only completo |
