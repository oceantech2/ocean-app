# Quickstart: Página Bônus e Comissão com abas

**Feature**: `062-bonus-comissao-abas`  
**Spec**: [spec.md](./spec.md) · **Contratos**: [contracts/](./contracts/) · **Modelo**: [data-model.md](./data-model.md)

Validação manual ponta a ponta. Sem código de implementação neste arquivo.

## Pré-requisitos

- Infra: `docker compose up -d` (API **8001**, Postgres **5433**, Redis **6380**)
- Frontend: `cd frontend && npm run dev` (**5193**, `VITE_API_URL=http://localhost:8001/api`)
- Usuários: `admin` / `123456` e `visualizador` / `123456`

## 1. Nomenclatura e abas

1. Login `admin`. Menu: item **Bônus e Comissão** (não só Comissões).
2. Abrir a sessão: título **Bônus e Comissão**; abas **Bônus** e **Comissão**; aba **Comissão** selecionada.
3. Configurações → catálogo de páginas: mesmo rótulo.
4. Alternar para **Bônus** e voltar: filtros de ano/recorte permanecem; seleção (se houver) some.

**Esperado**: SC-001, SC-002. Dashboard e Contas a Pagar legado **não** precisam mudar o texto “Comissões”.

## 2. Cadastro paralelo na Conta a receber

1. Contas a Receber → nova conta com valor líquido conhecido (ex.: R$ 1.000,00).
2. Bloco **Comissões**: 1 linha (fornecedor A, atividade, 10%) → valor calculado R$ 100,00.
3. Bloco **Bônus**: 1 linha (fornecedor B, mês/ano, valor **R$ 250,00** informado). Confirmar que **não** há % nem Atividade nesse bloco.
4. Gravar. Abrir **Bônus e Comissão**:
   - Aba **Comissão**: só a linha de A (R$ 100,00).
   - Aba **Bônus**: só a linha de B (R$ 250,00), sem colunas Atividade/Percentual.
5. Editar a mesma conta: alterar o líquido; conferir que o **bônus permanece R$ 250,00**.
6. Incluir segundo bônus não liberado; gravar; conferir na aba Bônus.

**Esperado**: SC-008, SC-009, SC-010. Conta sem nenhum dos blocos ainda grava.

## 3. Ações da listagem (as duas abas)

Para cada aba, com linhas visíveis:

1. Não há **Deletar**.
2. **Editar** em linha com conta → modal/fluxo da Conta a receber (`/nfs?edit=`).
3. **Liberar** (admin, confirmar) → coluna Liberado da linha e soma do grupo.
4. **Pagar** só após Liberar; coluna Pago = Pago.
5. Visualizador: vê colunas; não libera, não paga, não seleciona.

**Esperado**: SC-003, SC-004, SC-006, SC-007.

## 4. Lote na aba ativa

1. Admin, aba Bônus (ou Comissão), mesma página: marcar ≥ 5 linhas não liberadas (criar contas extras se preciso).
2. **Liberar em massa** → feedback processados/ignorados.
3. Marcar liberadas não pagas → **Pagar em massa**.
4. Trocar de aba ou de página: seleção vazia; lote não pega a outra aba.

**Esperado**: SC-005.

## 5. Isolamento de sync (regressão crítica)

1. Conta com 1 comissão e 1 bônus, ambos não liberados.
2. Editar a conta, **não** mexer no bloco Bônus, alterar só comissão, salvar.
3. Aba Bônus ainda mostra o bônus; aba Comissão reflete a alteração.

**Esperado**: gravar um bloco não apaga o outro.

## 6. Checagens de ferramenta

```bash
cd frontend && npm run lint && npm run type-check
```

Smoke: `GET http://localhost:8001/api/bonus?tipo=bonus` e `?tipo=comissao` autenticado — conjuntos disjuntos.
