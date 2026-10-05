# Quickstart: validação da feature 082

## Pré-requisitos

- `docker compose up -d` (PostgreSQL 5433, Redis 6380, API 8001) e `cd frontend && npm install && npm run dev` (porta 5193).
- Proposal em `http://proposal.localhost:5193`, logado com um usuário com acesso ao Proposal e perfil do consultor preenchido.
- **Antes de subir o código novo**, ter no banco:
  - uma proposta Executive Search **assinada** (A);
  - uma proposta Executive Search **pendente** em real (B) e outra em dólar (C);
  - uma proposta simples (D).
  Anotar o `conteudo_hash` de A e da assinatura de A.
- Modelo de referência: `Proposta_Comercial_Executive_Search (1).html` (abrir com `?campos` para ver o exemplo do escopo).

## 1. Migração (FR-019, FR-020)

1. Subir a API e conferir no log que o boot terminou sem erro.
2. No banco:
   - coluna `projeto_escopo` existe e está `NULL` em todas as linhas;
   - constraint `ck_propostas_escopo` presente;
   - A continua com `modelo_versao = 1` e o mesmo `conteudo_hash`;
   - B e C passaram para `modelo_versao = 2`, com `versao` e `status` inalterados e `conteudo_hash` novo;
   - nenhum registro novo em `propostas_edicoes`.
3. Reiniciar a API: nada muda (idempotente).
4. Abrir o link de A: idêntica a antes ("Serviço", sem escopo, indicação de assinada).
5. Abrir o link de B: primeiro link e primeira seção "Executive Search"; sem link nem seção de escopo; **Aceitar proposta** funciona sem o aviso de versão desatualizada (testar numa cópia de B, se não quiser assinar B).

## 2. Campo no formulário (US1)

1. **Nova proposta**: na seção Projeto, depois de Nome do projeto, o campo "Escopo do Projeto (opcional)" com barra de comandos e contador "0 / 5.000".
2. Reproduzir o exemplo OceanPact CBO usando só a barra e o teclado: parágrafo, lista numerada de 3 itens, Tab no item 2 para a lista com marcadores com 2 itens iniciados em negrito (SC-001: menos de 3 minutos).
3. No 2º nível, "Aumentar recuo" fica desabilitado e Tab não cria 3º nível.
4. Colar um trecho do Word ou de um e-mail com cores, fonte, tabela e link: sobram só texto, parágrafos, listas e negrito.
5. Gerar a proposta. Detalhe: card "Escopo do Projeto" formatado. Resposta da API: `modelo_versao: 2` e o HTML canônico ([data-model.md](./data-model.md) §2), igual ao `data-example-html` do modelo.
6. Criar outra proposta sem escopo: criada sem erro; detalhe mostra "Não informado".
7. Colar 5.001 caracteres: contador em vermelho, envio bloqueado com a mensagem do limite.

## 3. Edição, histórico e cópia (US1)

1. **Editar** a proposta do §2.5: o editor abre com o escopo formatado. Alterar um item e salvar: histórico com "Escopo do Projeto", antes e depois em texto legível (com "1." e "•").
2. Editar de novo e apagar todo o escopo: histórico "… → —"; a página do cliente perde a seção e o link.
3. Editar sem mexer no escopo e salvar: sem item de escopo no histórico.
4. **Criar cópia** de uma proposta com escopo: o editor da nova proposta vem com o escopo.
5. Editar B incluindo um escopo: a seção aparece na página de B.

## 4. Página do cliente (US2 e US3)

Abrir em janela anônima, a 1280 px e a 390 px:

1. Proposta com escopo em real: menu "Executive Search · Metodologia · Escopo do Projeto · Investimento · Garantias e condições · Contato"; o link leva à seção; a seção fica entre Metodologia e Investimento.
2. Comparar lado a lado com o modelo novo preenchido com o exemplo (SC-002): numeração azul em negrito, marcadores azul-marinho, negrito no tom dos títulos, espaçamento entre itens, largura máxima de 760 px.
3. Proposta sem escopo: sem link e sem seção, sem espaço vazio entre Metodologia e Investimento (SC-003).
4. Proposta em dólar (C ou nova) com escopo: "Executive Search" no primeiro link e na primeira seção; "Project Scope" no link e no título da seção; texto do escopo exatamente como digitado.
5. Escopo com `<img src=x onerror=alert(1)>`, `"D'Ave" & <Cia>` digitados no editor: aparecem literais, nada executa.
6. Item com uma palavra muito longa (ex.: URL de 200 caracteres): quebra sem estourar a largura no celular.
7. **Baixar PDF**: a seção aparece na impressão com a mesma formatação.
8. Aceitar uma proposta com escopo e conferir no detalhe que o JSON canônico da assinatura contém `"projeto_escopo"` e `"modelo_versao":2` (SC-005).

## 5. Segurança da API (FR-009)

Com o token do Proposal, `POST /api/proposal/propostas` com os dados de exemplo da 080 e cada `projeto_escopo` da tabela de [data-model.md](./data-model.md) §2.3: a resposta traz exatamente a saída esperada (ou `422` no caso do limite). Ver também [contracts/api-proposal.md](./contracts/api-proposal.md).

## 6. Sem regressão

1. Proposta simples D: lista, detalhe, página e edição como antes; sem card de escopo.
2. Proposta assinada A: página idêntica à de antes do deploy (comparação de estilos computados da 080 a 1280 px e 390 px, diferença zero).
3. A página pública não baixa o código do editor: na aba Rede, abrir só `/p/{codigo}` e conferir que nenhum chunk do TipTap é carregado.

## 7. Build

`npm run type-check` (só os erros antigos de `Dashboard.tsx`) e `npm run build`. Remover `nav.escopo` de `en-US.ts` deve fazer o type-check falhar.

## 8. Produção

Depois do deploy, a migração roda no boot da API (coluna, constraint e pendentes v1 → v2). Sem tabela nova, sem mudança de RLS. Repetir §1.2, §1.4, §1.5 e §4.1 em `https://proposal.oceantalentsolutions.com`.
