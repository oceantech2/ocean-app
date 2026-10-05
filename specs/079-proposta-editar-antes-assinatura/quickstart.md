# Quickstart: validar a edição de proposta antes da assinatura

Roteiro de validação ponta a ponta. Contratos em [contracts/](./contracts/) e modelo em [data-model.md](./data-model.md). Ambiente e logins como no [quickstart da 077](../077-plataforma-propostas/quickstart.md).

## Pré-requisitos

```bash
docker compose up -d                 # API 8001, PostgreSQL 5433, Redis 6380
docker logs ocean_backend -f         # confirmar que _migrar() rodou sem erro
cd frontend && npm run dev           # porta 5193
```

- Proposal: `http://proposal.localhost:5193` (usuário com "Acesso ao Proposal", ex.: `ambos1`).
- Qualidade estática: `cd frontend && npm run lint && npm run type-check && npm run build`.
- Token para os testes com `curl`:

```bash
TOKEN=$(curl -s -X POST http://localhost:8001/api/proposal/auth/token \
  -d "username=ambos1&password=<senha>" | python -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
API=http://localhost:8001/api
```

## 1. Migração

1. Com propostas da 077 já existentes, suba o backend e confira no banco: `propostas` tem `versao = 1`, `atualizada_em = NULL`, e `versao_visualizada_em = visualizada_em` nas propostas já visualizadas; a tabela `propostas_edicoes` existe e está vazia.
2. Reinicie o backend (roda `_migrar()` de novo) e confira que nada mudou.

## 2. Editar uma proposta pendente sem trocar o link (US1)

1. Crie uma proposta "ACME Ltda", CNPJ `11.222.333/0001-81`, valor `10000,00`, imposto `14,53%`. Copie o link.
2. Abra o link em janela anônima → status **Visualizada** no detalhe; "1ª visualização do link" preenchida.
3. No detalhe, clique em **Editar**: o formulário vem com os valores atuais e o aviso sobre o mesmo link.
4. Mude o valor para `9000,00`: o resumo mostra Imposto R$ 1.307,70 e Total R$ 10.307,70 antes de salvar.
5. Teste os bloqueios (mesmas mensagens da criação): CNPJ `11.222.333/0001-80`, valor `0`, alíquota `100`, validade = hoje → "Validade deve ser posterior a hoje".
6. Clique em **Cancelar** → volta ao detalhe sem mudanças.
7. Edite de novo e salve → toast "Proposta atualizada"; o detalhe mostra os novos valores, status **Aguardando assinatura**, "Visualização da versão atual: Ainda não visualizada", "Última edição" com data e usuário, e o **Histórico de edições** com Valor, Valor do imposto e Total (anterior → novo).
8. Recarregue a janela anônima → mesmo link, dados novos, "Atualizada em dd/mm/aaaa" abaixo da emissão, botão **Assinar** disponível.
9. No detalhe, o status passa a **Visualizada** e "Visualização da versão atual" ganha data e hora; "1ª visualização do link" continua com a data original.
10. Edite e salve sem mudar nada → toast "Nenhuma alteração para salvar"; o histórico não ganha item novo e o status não muda.

## 3. "Abrir página do cliente" não conta como visualização (edge case)

1. Edite uma proposta (status volta para **Aguardando assinatura**).
2. No detalhe, clique em "Abrir página do cliente" (mesma sessão do Proposal) → a página abre normalmente.
3. Volte ao detalhe → continua **Aguardando assinatura**.
4. Via `curl`, com e sem token:

```bash
curl -s -H "Authorization: Bearer $TOKEN" $API/public/propostas/<codigo> > /dev/null   # não marca
curl -s -H "Authorization: Bearer token-invalido" $API/public/propostas/<codigo>        # 200, ignora o token e marca
```

## 4. Bloqueios depois da assinatura e do cancelamento (US2)

1. Assine uma proposta pela página pública. No detalhe, **Editar** não aparece; `/propostas/<id>/editar` mostra "Esta proposta não pode mais ser editada".
2. Tentativa direta:

```bash
curl -s -X PUT -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"cliente_nome":"X","cnpj":"11222333000181","valor":"1.00","imposto_ativo":false,"aliquota":null,"validade":"2030-01-01"}' \
  -w "\n%{http_code}\n" $API/proposal/propostas/<id-assinada>
```
**Esperado**: `409 {"detail":"Proposta já assinada"}`. Repita com uma proposta cancelada → `409 "Proposta cancelada não pode ser editada"`.
3. Com um usuário não `admin`, tente editar a proposta de outro usuário → `404`.

## 5. Cliente com a versão antiga na tela (US2, FR-013)

1. Abra o link de uma proposta pendente em janela anônima e clique em **Assinar** (formulário aberto, sem confirmar).
2. No Proposal, edite o valor e salve.
3. Na janela anônima, preencha nome, e-mail, aceite e confirme → toast "Esta proposta foi atualizada. Revise os dados e assine novamente."; a página recarrega com o valor novo; nome e e-mail continuam preenchidos.
4. Clique em **Assinar** de novo e confirme → assinada. No detalhe, a impressão digital da assinatura corresponde aos dados novos (o histórico mostra a versão anterior).
5. Via `curl`, assinatura sem `versao` ou com versão antiga → `409` com a mesma mensagem.

## 6. Corrida edição × assinatura (FR-014)

1. Abra a tela de edição de uma proposta pendente e altere um campo, sem salvar.
2. Em janela anônima, assine a proposta.
3. Salve a edição → toast "Proposta já assinada" e volta para o detalhe; os dados assinados permanecem intactos e o histórico não ganha item.

## 7. Reativar proposta expirada (US3)

1. Crie uma proposta e force a expiração no banco de dev: `UPDATE propostas SET validade = CURRENT_DATE - 1 WHERE id = <id>;`
2. O detalhe mostra **Expirada** e a ação **Editar**; o link mostra a mensagem de expiração.
3. Edite mantendo a validade vencida → bloqueado com "Validade deve ser posterior a hoje".
4. Defina a validade para daqui a 10 dias e salve → status **Aguardando assinatura**; o link volta a mostrar os valores, "Atualizada em" e o botão **Assinar**.

## 8. Regressão da 077

- Criar proposta, "Criar cópia", cancelar, filtros da lista e visão `admin` continuam funcionando.
- Assinar uma proposta nunca editada continua funcionando (a página envia `versao: 1`).
- A página pública de propostas canceladas ou expiradas continua sem valores e sem "Atualizada em".
