# Quickstart: validação da feature 081

## Pré-requisitos

- `docker compose up -d` (PostgreSQL 5433, Redis 6380, API 8001) e `cd frontend && npm run dev` (porta 5193).
- Proposal em `http://proposal.localhost:5193`, logado com um usuário com acesso ao Proposal e perfil do consultor preenchido.
- Pelo menos uma proposta Executive Search e uma proposta simples criadas antes da migração (as de teste da 080 servem).

## 1. Migração

1. Subir a API e conferir no log que o boot terminou sem erro.
2. No banco: propostas simples com `moeda IS NULL`; propostas por modelo com `moeda = 'BRL'`; constraint `ck_propostas_moeda` presente.
3. Reiniciar a API: nada muda (idempotente).
4. Abrir o link de uma proposta Executive Search antiga (pendente): página idêntica à de antes, em português; aceitar funciona (o hash não mudou, [data-model.md](./data-model.md) §4).

## 2. Criação em dólar (US1)

1. **Nova proposta**: campo **Moeda** com Real pré-selecionado e o texto de apoio.
2. Escolher **Dólar**; marcar Valor fechado com taxa em valor: o alternador mostra `US$`, o resumo mostra `US$ 50.000`.
3. Preencher os dados de exemplo da 080 e gerar. Lista: "Executive Search / Dólar · inglês". Detalhe: "Executive Search · Dólar (inglês) · Posição 1".
4. API: `POST /api/proposal/propostas` com `"moeda": "EUR"` → `422 "Moeda inválida"`; sem `moeda` → criada com `BRL` ([contracts/api-proposal.md](./contracts/api-proposal.md)).

## 3. Página em inglês (US2)

Abrir o link da proposta em dólar em janela anônima, no computador e a 390 px:

1. Nenhum texto fixo em português; conferir cada linha de [contracts/textos-executive-search.md](./contracts/textos-executive-search.md).
2. Datas como "October 24, 2026"; taxas `15%`, `17.5%`, `US$ 50,000`; pagamento "40% upfront + 60% upon completion"; garantia "4 months".
3. `document.documentElement.lang` = `en`; título da aba em inglês.
4. **Talk to the consultant**: mensagem do WhatsApp em inglês. **Download PDF**: nome sugerido "Ocean Commercial Proposal - Arxen".
5. Comparar lado a lado com a mesma proposta em real: mesmas seções, ordem, cores, fontes, foto e logo.
6. Empresa com caracteres especiais (`D'Ave & <Cia>`): aparece literal.

## 4. Página em português sem regressão (SC-003)

Repetir a comparação de estilos computados da 080 (posição, tamanho e estilo de cada elemento a 1280 px e 390 px) entre o build anterior e o novo, para uma proposta em real: diferença zero.

## 5. Aceite em inglês (US3)

1. **Accept proposal** → janela em inglês; confirmar vazio → erros em inglês.
2. Com a janela aberta, editar a proposta no Proposal; confirmar o aceite → "This proposal has been updated. Please review the details and accept again." e a página recarrega.
3. Aceitar com dados válidos → "Acceptance recorded. Our team will send you the contract shortly."; após fechar, "Proposal accepted on October 5, 2026 at 10:24 AM by …".
4. Detalhe no Proposal: assinatura com evidências; o JSON canônico contém `"moeda":"USD"`.

## 6. Moeda fixa e cópia

1. **Editar** a proposta em dólar: Moeda desabilitada com o aviso; salvar outra alteração funciona.
2. API: `PUT` com `"moeda": "BRL"` → `422 "A moeda da proposta não pode ser alterada"`.
3. **Criar cópia**: moeda Dólar pré-selecionada; trocar para Real e gerar → nova proposta em português.

## 7. Indisponível

1. Cancelar a proposta em dólar e abrir o link: "This proposal is no longer available." com a moldura "Commercial proposal".
2. Proposta em real cancelada e proposta simples cancelada: mensagens em português, como hoje.
3. Link inexistente: "Proposta não encontrada" (português).

## 8. Build

`npm run type-check` (só os erros antigos de `Dashboard.tsx`) e `npm run build`; remover uma chave de `en-US.ts` deve fazer o type-check falhar (FR-024).

## 9. Produção

Depois do deploy, a migração roda no boot da API. Sem tabela nova, sem mudança de RLS. Repetir §1.4 e §3 em `https://proposal.oceantalentsolutions.com`.
