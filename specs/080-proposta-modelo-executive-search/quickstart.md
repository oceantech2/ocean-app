# Quickstart: validar as propostas por modelo (Executive Search)

Roteiro de validação ponta a ponta. Contratos em [contracts/](./contracts/), modelo em [data-model.md](./data-model.md), decisões em [research.md](./research.md). Ambiente e logins como nos quickstarts da [077](../077-plataforma-propostas/quickstart.md) e da [079](../079-proposta-editar-antes-assinatura/quickstart.md).

## Pré-requisitos

```bash
docker compose up -d                 # API 8001, PostgreSQL 5433, Redis 6380
docker logs ocean_backend -f         # confirmar que _migrar() rodou sem erro
cd frontend && npm run dev           # porta 5193
```

- Proposal: `http://proposal.localhost:5193` (usuário com "Acesso ao Proposal", ex.: `ambos1`).
- Referência visual: `Proposta_Comercial_Executive_Search.html` aberto direto no navegador (sem `?campos`).
- Qualidade estática: `cd frontend && npm run lint && npm run type-check && npm run build`.
- Token para os testes com `curl`:

```bash
TOKEN=$(curl -s -X POST http://localhost:8001/api/proposal/auth/token \
  -d "username=ambos1&password=<senha>" | python -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
API=http://localhost:8001/api
```

Dados de exemplo (os mesmos do HTML de referência): Empresa **Arxen** · Data **24/10/2026** · Setor **Infraestrutura** · Consultor **Fábio Porto D'Ave**, **Managing Partner**, **+55 21 97554-0224**, **fabio@oceantalentsolutions.com** · Projeto **Posição 1** · Retainer **15%** com **40%** de entrada · Sucesso **18%** sem entrada · Valor fechado **R$ 50.000** com **50%** de entrada · Garantia **4** meses.

## 1. Migração e propostas antigas

1. Com propostas da 077/079 no banco, suba o backend: `propostas.modelo = 'simples'` em todas, colunas novas `NULL`; `proposal_perfis_consultor` existe e está vazia; `ck_propostas_campos_modelo` e `ck_propostas_data_validade` existem (`SELECT conname FROM pg_constraint WHERE conrelid = 'propostas'::regclass`).
2. Reinicie o backend → nada muda e não há erro no log.
3. Abra o link de uma proposta simples pendente → página atual, assina normalmente (SC-006). No detalhe dela, **Criar cópia** não aparece; **Editar** abre o formulário antigo (CNPJ, valor, imposto).

## 2. Perfil do consultor (US5)

1. Cabeçalho → **Meu perfil**. Salve só o nome → toast "Perfil salvo".
2. **Nova proposta** → nome do consultor preenchido, demais vazios e o aviso para completar o perfil.
3. Complete o perfil com os dados de exemplo. Telefone `123` → "Telefone inválido"; e-mail `x@` → "E-mail inválido".
4. Outro usuário do Proposal vê o próprio perfil (vazio), nunca o do primeiro.

## 3. Criar a proposta Executive Search (US1)

1. **Nova proposta**: o modelo **Executive Search** já vem selecionado (único disponível) e não há campos de CNPJ, valor nem imposto.
2. Data = hoje, validade = hoje + 30, consultor = perfil.
3. Preencha os dados de exemplo. No quadro Retainer, entrada 40 → "Após conclusão: 60%"; Sucesso sem entrada → "100% após conclusão". O resumo mostra os textos como o cliente verá.
4. Bloqueios (um de cada vez): nenhum investimento marcado; taxa `0`; taxa `100` em %; entrada `100`; garantia `0`; telefone com 9 dígitos; Data posterior à validade → "Data da proposta não pode ser posterior à validade".
5. Gere a proposta → tela "Proposta criada" com `Arxen · Posição 1 · válida até …` e o link.
6. Via `curl`, criação sem modelo é recusada:

```bash
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"cliente_nome":"X","cnpj":"11222333000181","valor":"1.00","imposto_ativo":false}' \
  $API/proposal/propostas/          # 422 "Modelo de proposta inválido"
```

## 4. Página do cliente idêntica ao modelo (US2, SC-002, SC-003)

1. Abra o link em janela anônima, lado a lado com o HTML de referência (computador e, no DevTools, 390 px de largura).
2. Confira: capa com foto, "Proposta Comercial", Arxen / 24/10/2026 / Fábio Porto D'Ave e a logo Executive Search; navegação; Serviço e Metodologia com os 6 passos; Investimento com título "Posição 1" e 3 quadros (Retainer 15% · 40% de entrada + 60% após conclusão; Sucesso 18% · 100% após conclusão; Valor fechado R$ 50.000 · 50% de entrada + 50% após conclusão) e Observações; Garantias com Shortlist, SLA, "4 meses" e Observações; "Vamos avançar?" com "Esta proposta é válida até …"; Contato; rodapé com a data.
3. Diferenças aceitas: só a frase de validade (e, quando houver, "Atualizada em" e a indicação de assinada). Listas das Observações com marcadores, fontes Poppins/Inter, cores e espaçamentos iguais.
4. Busque `[` na página (Ctrl+F) → nenhum marcador. `?campos` na URL e Shift+C não destacam nada.
5. **Falar com o consultor** → `https://wa.me/5521975540224?text=Olá, gostaria de falar sobre a proposta comercial da Ocean Talent Solutions para a Arxen.`; telefone abre `tel:+5521975540224`; e-mail abre `mailto:`; LinkedIn e site são os da Ocean.
6. **Baixar PDF** → impressão com nome sugerido "Proposta Comercial Ocean - Arxen", sem navegação nem botões.
7. Crie uma proposta com 1 só investimento (Sucesso, `R$ 50.000,50`) e garantia 1 → um quadro "R$ 50.000,50" e "1 mês".
8. Caracteres especiais: Empresa `A&B <Teste> "Ltda"` → aparece literal, sem quebrar a página.
9. Setor Energia → capa com a foto provisória (Infraestrutura) até as fotos por setor chegarem. Renomeie temporariamente o arquivo da foto → a capa fica azul-marinho, texto legível.

## 5. Aceite pelo botão do modelo (US3)

1. Na janela anônima, **Aceitar proposta** → diálogo do modelo com Nome completo, E-mail e a declaração.
2. Confirme sem preencher → erros nos campos. Preencha e confirme → "Aceite registrado. Nossa equipe enviará o contrato em breve."
3. Recarregue → layout completo, "Proposta aceita em … por …" no lugar do botão; **Falar com o consultor** e **Baixar PDF** continuam.
4. No Proposal, detalhe com status **Assinada** e evidências (nome, e-mail, IP, navegador, hash).
5. Versão desatualizada: abra o link de outra proposta, edite-a no Proposal e tente aceitar a versão antiga → mensagem "Esta proposta foi atualizada…" e a página recarrega com os dados novos.
6. Cancelada e expirada → mesmas mensagens de hoje, sem dados.

## 6. Lista, detalhe, edição e cópia (US4)

1. Lista: colunas Empresa, Modelo, Projeto, Data, Validade, Status (sem CNPJ e Total); propostas antigas como "Proposta simples", projeto "—".
2. Detalhe da proposta Executive Search: seções Cliente, Consultor, Projeto e Investimento formatadas.
3. **Editar**: troque a taxa do Retainer para 16%, desmarque Valor fechado e mude a validade → salvar → histórico com "Investimento Retainer: 15% · 40%… → 16% · 40%…", "Investimento Valor fechado: … → —" e "Validade". A página do cliente mostra "Atualizada em" sob a Data e a nova frase de validade.
4. Tentativa de trocar o modelo via `curl` (`"modelo":"simples"` no PUT) → `422 "O modelo da proposta não pode ser alterado"`.
5. **Criar cópia** → formulário com todos os campos, Data = hoje e validade padrão.
6. Altere o perfil e reabra a proposta antiga → dados do consultor da proposta não mudam (FR-032).
7. **Abrir página do cliente** a partir do detalhe → não muda o status para Visualizada (regra da 079).

## 7. Deploy

1. Após o primeiro boot com a migração em produção, rodar `backend/scripts/enable_rls_supabase.sql` no Supabase e conferir RLS habilitado em `proposal_perfis_consultor`.
2. Conferir na Vercel que `/propostas/setores/infraestrutura.jpg` e `/propostas/executive-search/logo-divisao.png` respondem `200` no domínio do Proposal (o rewrite por host só se aplica a caminhos sem arquivo físico).
