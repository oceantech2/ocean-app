# Quickstart: validar a Plataforma de Propostas (Proposal)

Roteiro de validação ponta a ponta. Contratos em [contracts/](./contracts/) e modelo em [data-model.md](./data-model.md).

## Pré-requisitos

```bash
docker compose up -d                 # API 8001, PostgreSQL 5433, Redis 6380
docker logs ocean_backend -f         # confirmar que _migrar() rodou sem erro
cd frontend && npm run dev           # porta 5193
```

- ERP: `http://localhost:5193` · Proposal: `http://proposal.localhost:5193`
- `frontend/.env.local`: `VITE_API_URL=http://localhost:8001/api` (e, opcional, `VITE_PROPOSAL_PUBLIC_URL=http://proposal.localhost:5193`)
- Qualidade estática: `cd frontend && npm run lint && npm run type-check`

## 1. Migração e cadastro de acessos (US1, FR-001–FR-003)

1. Com o banco já existente, suba o backend e confira no banco: `usuarios_app` tem `acesso_erp = true` e `acesso_proposal = false` para todos os usuários que já existiam; as tabelas `propostas` e `propostas_assinaturas` existem.
2. ERP → Configurações → Usuários como `admin`: o modal mostra a seção "Ferramentas" com "Acesso ao ERP" e "Acesso ao Proposal", separada das permissões de página.
3. Crie `vendedor1` só com "Acesso ao Proposal" e `ambos1` com os dois acessos. A tabela mostra os badges corretos.
4. Mude permissões de página de `ambos1` e salve: `acesso_proposal` não muda (e vice-versa).
5. Tente desmarcar o próprio "Acesso ao ERP" do `admin` logado → erro "Não pode remover o próprio acesso ao ERP".

## 2. Login por ferramenta (US1)

| Usuário | ERP (`localhost:5193`) | Proposal (`proposal.localhost:5193`) |
|---|---|---|
| `vendedor1` | Recusado: "Usuário sem acesso ao ERP" | Entra |
| `ambos1` | Entra | Entra (sessão separada) |
| `visualizador` (só ERP) | Entra | Recusado: "Usuário sem acesso ao Proposal" |

- A tela de login do Proposal não tem menu, link nem texto do ERP.
- Com 2FA ativo para `ambos1`, o login do Proposal pede o código.
- Fallback de dev: `admin`/`123456` **não** entra no Proposal se o `admin` do banco estiver sem `acesso_proposal`.

## 3. Isolamento no servidor (FR-006, SC-001) — obrigatório

```bash
# token do Proposal
TOKEN=$(curl -s -X POST http://localhost:8001/api/proposal/auth/token \
  -d "username=vendedor1&password=<senha>" | python -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

for r in nfs/ colaboradores/ fornecedores/ contas/categorias bonus/ ferias/ dh/ relatorios/pipeline-receita \
         auditoria/ configuracoes/ configuracoes/paginas-visibilidade auth/me saldos/ impostos/de-contas \
         fluxo-movimentos/ contas-correntes/ patrimonio/ arquivos-nfs/ metas/ alertas/ historico/1 documentos/colaborador/1; do
  printf "%-36s " "$r"; curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer $TOKEN" "http://localhost:8001/api/$r"
done
```
**Esperado**: `403` em todas as linhas (nenhuma `200`). Repita com o token do ERP de `ambos1` contra `/api/proposal/propostas` → `403`.

Revogação: desmarque "Acesso ao Proposal" de `vendedor1` no ERP; a próxima chamada com o token antigo a `/api/proposal/propostas` → `403`.

## 4. Criar proposta (US2)

1. Proposal → Nova proposta. A validade vem preenchida com hoje + 30 dias.
2. Toggle desligado: cliente "ACME Ltda", CNPJ `11.222.333/0001-81`, valor `10000,00` → Total R$ 10.000,00, sem linha de imposto.
3. Toggle ligado, alíquota `14,53` → Imposto R$ 1.453,00 e Total R$ 11.453,00 antes de confirmar.
4. Erros bloqueiam a confirmação: CNPJ `11.222.333/0001-80`; valor `0`; toggle ligado sem alíquota; alíquota `100`; validade = hoje.
5. Confirme: o link aparece e "Copiar link" copia `http://proposal.localhost:5193/p/<codigo>` (32 caracteres aleatórios).
6. Na lista/detalhe não há como editar os valores; "Criar cópia" abre o formulário pré-preenchido.

## 5. Página pública e assinatura (US3)

1. Abra o link numa **janela anônima**: dados corretos, sem login e sem nenhuma referência ao ERP. Com as DevTools em modo celular (ex.: 375 px), tudo é legível sem zoom.
2. Os valores exibidos são idênticos aos do formulário (SC-004).
3. Assinar com nome "Maria Souza", e-mail `maria@acme.com.br`, aceite marcado → confirmação. Recarregue: "Assinada em … por Maria Souza", sem botão.
4. Validações: nome com 2 letras; e-mail inválido; aceite desmarcado → bloqueado.
5. Abra `/p/codigo-inventado` e `/p/<codigo com 1 caractere trocado>` → mesma mensagem "Proposta não encontrada".
6. **Concorrência**: abra o link de outra proposta em duas abas e assine nas duas → só a primeira vale; a segunda vê "Proposta já assinada".

## 6. Acompanhamento, cancelamento e expiração (US4)

1. Proposta nova → status **Aguardando assinatura**. Abra o detalhe no Proposal → continua **Aguardando** (o detalhe não conta como visualização).
2. Abra o link público → a lista passa a **Visualizada**, com data e hora no detalhe.
3. Detalhe da proposta assinada: nome, e-mail, data e hora, IP, navegador e hash.
4. Cancele uma proposta pendente (com confirmação) → **Cancelada**; o link mostra só "Esta proposta não está mais disponível.", sem valores. Proposta assinada não tem o botão cancelar.
5. **Expiração** (simular no banco de dev):
   ```sql
   UPDATE propostas SET validade = CURRENT_DATE - 1 WHERE codigo = '<codigo>';
   ```
   Lista → **Expirada**; link → mensagem de expiração, sem valores; `POST /api/public/propostas/<codigo>/assinar` → `409 Proposta expirada`; o filtro "Expirada" encontra a proposta.
6. Página aberta antes de expirar: abra o link, rode o `UPDATE` acima e clique em Assinar → mensagem de expirada; nenhuma assinatura gravada.

## 7. Visibilidade (FR-026)

1. Crie propostas com `vendedor1` e com `ambos1` (não admin).
2. `vendedor1` vê só as suas; `GET /api/proposal/propostas/{id de ambos1}` com o token de `vendedor1` → `404`.
3. Um `admin` com acesso ao Proposal vê todas, com a coluna "Criado por".
4. Exclua `vendedor1` no ERP: a exclusão funciona, o link público das propostas dele continua abrindo, e o `admin` ainda as vê com "Criado por: vendedor1".

## 8. Regressão do ERP

- Navegue por Dashboard, NFs, Contas, Fornecedores, Fluxo de Caixa e Configurações com `admin` e `visualizador`: tudo funciona como antes.
- Sessões do ERP abertas antes do deploy (token sem a claim `app`) continuam funcionando até expirar.
- `npm run build` gera `dist/index.html` e `dist/proposal.html`.

## 9. Produção (checklist de deploy)

- [ ] Vercel: domínio `proposal.oceantalentsolutions.com` adicionado ao projeto; CNAME criado no DNS
- [ ] `frontend/vercel.json` publicado; `https://proposal.oceantalentsolutions.com/p/x` serve a página do Proposal; `https://app.oceantalentsolutions.com/dashboard` continua servindo o ERP (deep-link)
- [ ] Vercel: `VITE_PROPOSAL_PUBLIC_URL=https://proposal.oceantalentsolutions.com`
- [ ] Render: `CORS_ORIGINS` inclui `https://proposal.oceantalentsolutions.com`
- [ ] Supabase: `backend/scripts/enable_rls_supabase.sql` executado de novo após a criação das tabelas; `propostas` e `propostas_assinaturas` com RLS ativo
- [ ] Repetir a seção 3 (isolamento) contra a URL de produção
