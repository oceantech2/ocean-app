# Implementation Plan: Escopo do Projeto e Título da Divisão na Proposta (Executive Search)

**Branch**: `082-proposta-escopo-projeto` (trabalho direto na `main`, como nas features 077 a 081) | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/082-proposta-escopo-projeto/spec.md`

## Summary

O modelo Executive Search passa para a **versão 2**, com duas mudanças em relação à v1:

1. A primeira seção e o primeiro link do menu exibem o nome da divisão ("Executive Search") em vez de "Serviço"/"Service".
2. Entra a seção opcional **Escopo do Projeto**, entre Metodologia e Investimento, com link próprio no menu.

O escopo é um texto formatado (parágrafos, listas numeradas e com marcadores em até dois níveis, negrito):

- **Formulário**: o consultor escreve num editor TipTap carregado sob demanda.
- **Armazenamento**: o texto é gravado como HTML canônico restrito na coluna nova `propostas.projeto_escopo`.
- **Servidor**: a função `normalizar_escopo` reconstrói o HTML por lista branca, achata níveis extras, remove vazios e limita o texto a 5.000 caracteres.
- **Exibição**: o componente `EscopoRico` converte o HTML em elementos React por lista branca, sem `innerHTML`.
- **Integridade**: o escopo entra no hash do conteúdo só quando existe e no histórico de edições.
- **Versões**: propostas assinadas na v1 continuam iguais. As pendentes migram para a v2 no boot, com o hash recalculado. O mesmo componente renderiza a v1 e a v2 a partir de uma tabela de recursos por versão.

## Technical Context

**Language/Version**: Python 3.10+ (backend), TypeScript 5 / React 18 (frontend)

**Primary Dependencies**: FastAPI, SQLAlchemy 2.0, Pydantic 2.5 e `html.parser` da biblioteca padrão; React 18, Vite 5, Tailwind 3. Dependências novas, só no frontend: `@tiptap/react`, `@tiptap/pm` e `@tiptap/starter-kit` (`^3`), justificadas em research R1.

**Storage**: PostgreSQL 16 (Supabase em produção): 1 coluna (`projeto_escopo TEXT`) e 1 constraint em `propostas`, via migração inline idempotente em `_migrar()` (`backend/app/main.py`), mais a migração das propostas pendentes da v1 para a v2 com o hash recalculado (R6).

**Testing**: Sem suíte automatizada no projeto. A validação segue o [quickstart.md](./quickstart.md) (API com `curl`/script e navegador), mais `npm run type-check` e `npm run build`. A função `normalizar_escopo` tem uma tabela de casos de entrada e saída no data-model §2.3, que serve de roteiro de verificação por script.

**Target Platform**: API no Render, frontend na Vercel (`proposal.oceantalentsolutions.com`), navegadores de computador e celular.

**Project Type**: Aplicação web (backend + frontend).

**Performance Goals**: A página pública não carrega o editor (TipTap fica num chunk preguiçoso do formulário). A normalização do escopo é linear no tamanho da entrada, limitada a 100.000 caracteres.

**Constraints**:
- A página em v1 de propostas assinadas continua idêntica (FR-019).
- Os hashes já gravados continuam válidos.
- A seção nova reproduz o CSS `.scope` do modelo novo.
- Portas fixas.
- Nenhum arquivo do ERP é alterado.

**Scale/Scope**: 1 coluna, 1 campo no formulário, 1 seção na página pública, 2 chaves novas de tradução por idioma e 1 versão nova do modelo, sem novo componente de página.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Situação |
|---|---|
| I. Idioma português | OK. Artefatos em pt-BR. O inglês aparece só no título da seção na página das propostas em dólar ("Project Scope"). |
| II. Domínio financeiro interno | OK. A feature fica no Proposal, sem tocar no ERP nem nos papéis. |
| III. Clareza antes de implementar | OK. Spec sem marcadores pendentes; as decisões por padrão (limite, níveis, tradução, migração das pendentes) estão nas Assumptions. |
| IV. Consistência com o produto | OK. Mesmo formulário, detalhe, histórico e cópia das 079 a 081; feedback por toast; a seção segue o modelo enviado pela Ocean. |
| V. Simplicidade | OK, com uma dependência justificada (TipTap, ver Complexity Tracking). O sanitizador do servidor usa a biblioteca padrão, o componente de página é reaproveitado entre as versões e a exibição não usa biblioteca. |

**Resultado**: aprovado. Reavaliado após o design (Phase 1): continua aprovado.

## Project Structure

### Documentation (this feature)

```text
specs/082-proposta-escopo-projeto/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-proposal.md     # POST/PUT/GET com projeto_escopo
│   ├── api-public.md       # projeto_escopo e modelo_versao 2 na página pública
│   └── ui-proposal.md      # campo no formulário, detalhe, histórico e seção na página
├── checklists/requirements.md
└── tasks.md                # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
backend/app/
├── main.py                        # _migrar(): bloco "Proposal (feature 082)": coluna, ck_propostas_escopo, pendentes v1 → v2 com hash recalculado
├── models/__init__.py             # Proposta.projeto_escopo + CK_PROPOSTAS_ESCOPO
├── schemas.py                     # PropostaCreate.projeto_escopo
├── services/escopo_projeto.py     # NOVO: normalizar_escopo() (lista branca, achatamento, contagem)
├── services/proposta_modelos.py   # MODELOS versao_atual = 2; validar_modelo() inclui projeto_escopo
└── services/propostas.py          # conteudo_canonico (+ escopo se não nulo), CAMPOS_MODELO, serializar_detalhe/publica

frontend/
├── package.json                   # + @tiptap/react, @tiptap/pm, @tiptap/starter-kit
└── src/proposal/
    ├── services/proposalApi.ts    # projeto_escopo em Proposta, PropostaModeloPayload e PropostaPublicaData
    ├── components/
    │   ├── EditorEscopo.tsx       # NOVO: editor TipTap com barra de comandos, limite de 2 níveis e contador
    │   └── ModeloForm.tsx         # campo Escopo do Projeto (lazy), validação do limite, cópia
    ├── modelos/
    │   ├── index.ts               # executive-search: versões 1 e 2 → mesmo módulo
    │   ├── escopo.ts              # NOVO: contarCaracteres(), escopoParaTexto(), LIMITE_ESCOPO
    │   ├── EscopoRico.tsx         # NOVO: HTML canônico → elementos React (lista branca)
    │   └── executive-search/v1/
    │       ├── versoes.ts         # NOVO: recursos por versão (tituloDivisao, escopo)
    │       ├── ExecutiveSearchV1.tsx  # título da divisão e seção/link de escopo conforme a versão
    │       ├── executive-search-v1.css # regras .scope do modelo novo (escopadas em .tpl-es)
    │       └── i18n/{tipos,pt-BR,en-US}.ts # nav.escopo, servico.tituloDivisao
    └── pages/Detalhe.tsx          # card Escopo do Projeto; rótulo e texto legível no histórico
```

**Structure Decision**: Mesma estrutura web das 080 e 081. A v2 reaproveita a pasta e o componente da v1 (research R5), com as diferenças concentradas em `versoes.ts`. O utilitário de escopo e o `EscopoRico` ficam em `modelos/` porque servem tanto à página do cliente quanto ao detalhe interno.

## Dependência de código

A feature parte da `main` com a 081 (commit `f606c3b`). Nenhuma pendência de outra feature.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Dependência nova no frontend (TipTap: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`) | O FR-003 exige formatação visual sem marcação, com listas aninhadas reais, e o FR-004 exige colagem limpa. | `contentEditable` + `execCommand` é obsoleto e inconsistente em listas aninhadas e na colagem; `textarea` com Markdown viola o FR-003 (research R1). O custo fica contido: o editor é carregado sob demanda e só no formulário. |
