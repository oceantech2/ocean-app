# Quickstart: Comissões — ações da listagem (048)

Validação manual end-to-end alinhada à [spec.md](./spec.md) e aos contratos em [contracts/](./contracts/).

## Pré-requisitos

- Docker: API **8001**, PostgreSQL **5433**, frontend **5193**
- Login: `admin` / `123456` e `visualizador` / `123456`
- Dados: ao menos 2 comissões no mesmo fornecedor (uma liberável); idealmente 1 com `nf_id` e 1 legado sem vínculo; listagem com **mais de 20 grupos** se for testar paginação

```bash
docker compose up -d
cd frontend && npm run dev
```

## Cenários

### 1. Sem Deletar + Editar → Conta a receber

1. Abrir `/comissoes` como admin.
2. Confirmar ausência de botão Deletar/Excluir em todas as linhas.
3. Em linha **com** Conta a receber: **Editar** → abre `/nfs?edit={id}` com modal da conta.
4. Em linha **sem** vínculo: **Editar** → toast de ausência; não abre modal isolado de comissão.

### 2. Liberar + coluna Liberado (linha e grupo)

1. Em linha não liberada: **Liberar** → confirmar.
2. Coluna **Liberado** da linha mostra o valor; soma **Liberado** do grupo aumenta pelo mesmo valor.
3. Liberar de novo na mesma linha: ação ausente ou recusada.

### 3. Pagar + coluna Pago

1. Em linha liberada e não paga: **Pagar** → confirmar → badge **Pago**.
2. Em linha não liberada: **Pagar** ausente.
3. Em linha paga: **Pagar** ausente.

### 4. Seleção e lote (página atual)

1. Marcar ≥2 linhas não liberadas na página atual → **Liberar em massa** → toast com processados/ignorados.
2. Marcar liberadas não pagas → **Pagar em massa**.
3. Com linhas marcadas, **mudar de página** → seleção limpa; barra de lote some.
4. Remarcar, **mudar filtro** (mês/ano) → seleção limpa.

### 5. Visualizador

1. Login visualizador em `/comissoes`.
2. Vê Liberado/Pago; sem checkboxes, Liberar, Pagar, lote ou Deletar.

### 6. Hardening API (se task de DELETE aplicada)

```bash
# Com token admin — deve falhar (405/403/404 conforme implementação)
curl -s -o /dev / -w "%{http_code}" -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8001/api/bonus/1
```

Esperado: **não** 204 de exclusão bem-sucedida.

## Checagens estáticas

```bash
cd frontend && npm run lint && npm run type-check
```

## Critério de pronto

- Cenários 1–5 passam.
- Cenário 6 passa se a remoção de DELETE estiver no escopo das tasks.
- SC-001…SC-005 da spec cobertos pelos cenários acima.
