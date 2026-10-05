# Implementation Plan: Proposta em Português ou Inglês conforme a Moeda (Executive Search)

**Branch**: `081-proposta-idioma-moeda` | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/081-proposta-idioma-moeda/spec.md`

## Summary

A proposta Executive Search ganha a coluna `moeda` (`BRL` ou `USD`), escolhida na criação e fixa depois. A moeda define o idioma da página do cliente: `BRL` → `pt-BR` (página atual, sem mudança), `USD` → `en-US`. Os textos fixos do `ExecutiveSearchV1` saem do JSX para um **dicionário tipado por idioma** (`i18n/pt-BR.ts` e `i18n/en-US.ts`), com o TypeScript garantindo que os dois idiomas tenham as mesmas chaves. A formatação de datas, números e moeda passa a receber o idioma (`Intl`). O backend valida e devolve a moeda, inclui a moeda no conteúdo canônico só quando não for `BRL` (para não invalidar hashes já gravados) e devolve a moeda também nas respostas de proposta cancelada ou expirada, para a mensagem sair no idioma certo. A interface interna continua em português, mostrando a moeda no formulário (somente leitura na edição), na lista e no detalhe.

## Technical Context

**Language/Version**: Python 3.10+ (backend), TypeScript 5 / React 18 (frontend)

**Primary Dependencies**: FastAPI, SQLAlchemy 2.0, Pydantic 2.5; React 18, Vite 5, Tailwind 3, `Intl` nativo do navegador. Nenhuma dependência nova (research R1).

**Storage**: PostgreSQL 16 (Supabase em produção): 1 coluna nova em `propostas` e 1 constraint, via migração inline idempotente em `_migrar()` (`backend/app/main.py`).

**Testing**: Sem suíte automatizada no projeto. Validação por [quickstart.md](./quickstart.md) (API com `curl`/script e navegador), `npm run type-check` e `npm run build`.

**Target Platform**: API no Render, frontend na Vercel (`proposal.oceantalentsolutions.com`), navegadores de computador e celular.

**Project Type**: Aplicação web (backend + frontend).

**Performance Goals**: Iguais à 080. O dicionário de inglês vai no mesmo chunk preguiçoso do `ExecutiveSearchV1` (alguns KB), sem afetar o ERP nem a página das propostas simples.

**Constraints**: Página em português idêntica à atual (SC-003); hashes já gravados (propostas pendentes e assinadas da 080) continuam válidos; portas fixas; nenhum arquivo do ERP alterado.

**Scale/Scope**: 1 coluna, 2 idiomas, cerca de 70 textos fixos por idioma, 1 modelo (Executive Search v1).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Situação |
|---|---|
| I. Idioma português | OK. Artefatos em pt-BR. O inglês aparece só no conteúdo exibido ao cliente das propostas em dólar, que é o objetivo da feature, e no contrato de textos para revisão. |
| II. Domínio financeiro interno | OK. A feature fica no Proposal, sem tocar no ERP nem em papéis. |
| III. Clareza antes de implementar | OK. Spec sem pendências; as 3 decisões (origem da tradução, formato de data, moeda fixa) foram respondidas. |
| IV. Consistência com o produto | OK. Mesmo formulário, lista e detalhe da 080; feedback por toast; mesma página do cliente. |
| V. Simplicidade | OK. Dicionário tipado próprio em vez de biblioteca de i18n (R1); idioma derivado da moeda, sem coluna extra (R2); sem conversão de valores. |

**Resultado**: aprovado, sem violações. Reavaliado após o design (Phase 1): continua aprovado.

## Project Structure

### Documentation (this feature)

```text
specs/081-proposta-idioma-moeda/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-proposal.md
│   ├── api-public.md
│   ├── ui-proposal.md
│   └── textos-executive-search.md   # textos PT ↔ EN para revisão da Ocean
├── checklists/requirements.md
└── tasks.md                          # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
backend/app/
├── main.py                      # _migrar(): bloco "Proposal (feature 081)": coluna moeda, backfill BRL, ck_propostas_moeda
├── models/__init__.py           # Proposta.moeda + CK_PROPOSTAS_MOEDA
├── schemas.py                   # PropostaCreate.moeda
├── services/proposta_modelos.py # MOEDAS, MOEDA_PADRAO, validar_moeda()
├── services/propostas.py        # conteudo_canonico (moeda se ≠ BRL), serializar_item/publica (+ moeda, inclusive cancelada/expirada)
└── api/routes/proposal_propostas.py  # POST grava moeda; PUT recusa troca de moeda

frontend/src/proposal/
├── services/proposalApi.ts      # Moeda, Idioma; moeda em payloads e respostas
├── modelos/
│   ├── formatacao.ts            # formatarTaxa/Pagamento/Garantia/Data com idioma e moeda
│   ├── idioma.ts                # idiomaDaMoeda(), rótulos de moeda para a interface interna
│   └── executive-search/v1/
│       ├── i18n/
│       │   ├── tipos.ts         # type TextosES (forma única dos dicionários)
│       │   ├── pt-BR.ts         # textos atuais, literais
│       │   ├── en-US.ts         # tradução
│       │   └── index.ts         # textosES(idioma)
│       └── ExecutiveSearchV1.tsx  # lê textos do dicionário; lang do documento
├── components/ModeloForm.tsx    # campo Moeda (fixo na edição); R$/US$ no alternador e no resumo
├── pages/Nova.tsx               # moeda padrão BRL; cópia herda a moeda
├── pages/Editar.tsx             # moeda somente leitura
├── pages/Lista.tsx              # moeda/idioma na coluna Modelo
├── pages/Detalhe.tsx            # moeda/idioma no cabeçalho; taxas na moeda
└── pages/PropostaPublica.tsx    # mensagens de cancelada/expirada e fallback no idioma da moeda
```

**Structure Decision**: Mesma estrutura web da 080. Os dicionários ficam dentro de `executive-search/v1/` porque os textos fazem parte da versão do modelo: uma futura v2 terá os próprios textos, e propostas assinadas na v1 continuam com os textos da v1.

## Dependência de código

A feature parte da `main` com a 080 (commit `e728b95`). Nenhuma pendência de outra feature.

## Complexity Tracking

Sem violações a justificar.
