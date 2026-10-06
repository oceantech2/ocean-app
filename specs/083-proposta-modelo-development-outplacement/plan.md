# Implementation Plan: Modelo Development & Outplacement, Vários Projetos e Idioma Independente da Moeda

**Branch**: `083-proposta-modelo-development-outplacement` (trabalho direto na `main`, como nas features 077 a 082) | **Date**: 2026-10-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/083-proposta-modelo-development-outplacement/spec.md`

## Summary

A feature entrega três blocos que se apoiam no mesmo "formato novo" de proposta por modelo:

1. **Modelo Development & Outplacement** (`outplacement-development`, versão 1): página do cliente reproduzindo o HTML de referência, com conteúdo fixo próprio (primeira seção, Principais serviços com 3 cartões, título "Escopo", Observações de Investimento, logo) em português e inglês.
2. **Formato novo para os dois modelos** (Executive Search passa à **versão 3**): vários projetos (cada um com 1 a 3 investimentos), subtítulo "sobre a remuneração anual" em taxas percentuais, Shortlist/SLA/Garantia em texto livre opcional e validade em dias.
3. **Idioma independente da moeda**: coluna nova `idioma` (`pt-BR`/`en-US`); a moeda passa a definir só o símbolo.

Abordagem técnica:

- **Banco**: colunas novas em `propostas` (`idioma`, `projetos JSONB`, `shortlist`, `sla`, `garantia_texto`, `validade_dias`). As colunas antigas (`projeto_nome`, `investimentos`, `garantia_meses`) ficam só para as propostas no formato antigo (assinadas/canceladas nas versões 1 e 2 do Executive Search). Constraint de campos substituída por uma versão que aceita os dois formatos.
- **Migração no boot**: preenche `idioma` a partir da moeda e converte as propostas Executive Search pendentes (v1/v2) para a v3, recalculando o hash. Assinadas e canceladas não mudam.
- **Hash**: o conteúdo canônico do formato antigo fica congelado (hashes gravados continuam válidos); o formato novo tem canônico próprio com idioma, projetos, Garantias e condições e validade.
- **Frontend**: o componente da página do Executive Search vira um **layout compartilhado** (`PaginaModelo`) parametrizado pelo conteúdo da divisão; cada divisão fornece só os seus textos fixos e a seção do meio (Metodologia ou Principais serviços). O formulário passa a ter lista de projetos, idioma, Garantias e condições e validade em dias, e o seletor de modelo deixa de reiniciar o formulário.

## Technical Context

**Language/Version**: Python 3.10+ (backend), TypeScript 5 / React 18 (frontend)

**Primary Dependencies**: FastAPI, SQLAlchemy 2.0, Pydantic 2.5; React 18, Vite 5, Tailwind 3, TipTap (já presente desde a 082). Nenhuma dependência nova.

**Storage**: PostgreSQL 16 (Supabase em produção): 6 colunas novas, 1 constraint substituída (`ck_propostas_campos_modelo` → `ck_propostas_campos_modelo_v2`) e 1 constraint nova (`ck_propostas_idioma`) em `propostas`, via migração inline idempotente em `_migrar()` (`backend/app/main.py`), mais a conversão das pendentes do Executive Search para a v3 (research R4).

**Testing**: Sem suíte automatizada no projeto. Validação pelo [quickstart.md](./quickstart.md) (script Python contra a API e navegador), mais `npm run type-check` e `npm run build`.

**Target Platform**: API no Render, frontend na Vercel (`proposal.oceantalentsolutions.com`), navegadores de computador e celular.

**Project Type**: Aplicação web (backend + frontend).

**Performance Goals**: A página pública continua sem o editor TipTap; cada divisão é um chunk preguiçoso pequeno sobre o layout compartilhado.

**Constraints**:
- Propostas assinadas nas versões 1 e 2 continuam idênticas (FR-034) e os hashes já gravados continuam válidos.
- A página Development & Outplacement reproduz o CSS do HTML de referência (mesmo design system do Executive Search, mais `.svcs`/`.svc` e `.rate-sub`).
- Portas fixas; nenhum arquivo do ERP é alterado.

**Scale/Scope**: 6 colunas, 1 modelo novo, 1 versão nova do Executive Search, 1 layout compartilhado, formulário com lista de projetos, ~10 chaves novas de tradução por idioma.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Situação |
|---|---|
| I. Idioma português | OK. Artefatos em pt-BR. O inglês aparece só nos textos da página do cliente em inglês e nos nomes de serviço. |
| II. Domínio financeiro interno | OK. A feature fica no Proposal, sem tocar no ERP nem nos papéis. |
| III. Clareza antes de implementar | OK. Spec sem marcadores pendentes; 3 decisões no specify e 3 no clarify registradas em Clarifications. |
| IV. Consistência com o produto | OK. Mesmo fluxo de criação, edição (079), cópia, histórico, aceite e toasts; a página segue o HTML enviado pela Ocean. |
| V. Simplicidade | OK. Nenhuma dependência nova. A extração do layout compartilhado evita duplicar ~380 linhas de página e o CSS entre divisões (justificado em Complexity Tracking). |

**Resultado**: aprovado. Reavaliado após o design (Phase 1): continua aprovado.

## Project Structure

### Documentation (this feature)

```text
specs/083-proposta-modelo-development-outplacement/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-proposal.md     # POST/PUT/GET com idioma, projetos, Garantias e condições e validade_dias
│   ├── api-public.md       # página pública: idioma, projetos, garantias, modelo outplacement-development
│   └── ui-proposal.md      # formulário, lista, detalhe, histórico e páginas das duas divisões
├── checklists/requirements.md
└── tasks.md                # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
backend/app/
├── main.py                        # _migrar(): bloco "Proposal (feature 083)": colunas, idioma, constraints; pendentes ES → v3
├── models/__init__.py             # colunas novas, CK_PROPOSTAS_CAMPOS_MODELO (v2), CK_PROPOSTAS_IDIOMA
├── schemas.py                     # ProjetoIn; PropostaCreate: idioma, projetos, shortlist, sla, garantia, validade_dias
├── services/proposta_modelos.py   # MODELOS (+ outplacement-development, ES v3), IDIOMAS, validar_projetos, validar_modelo (formato novo),
│                                  # textos padrão de Shortlist/SLA, converter_para_formato_novo()
├── services/propostas.py          # conteudo_canonico (formato novo), diff por projeto, serializar_item/detalhe/publica
└── api/routes/proposal_propostas.py # criar: idioma; editar: idioma fixo

frontend/
├── public/propostas/outplacement-development/logo-divisao.png   # NOVO: logo extraída do HTML de referência
└── src/proposal/
    ├── services/proposalApi.ts    # ModeloId, Projeto, idioma, garantias, validade_dias em Proposta, payload e página pública
    ├── components/ModeloForm.tsx  # idioma + moeda, lista de projetos, Garantias e condições, validade em dias, modelo controlado
    ├── pages/{Nova,Editar,Lista,Detalhe,PropostaPublica}.tsx
    └── modelos/
        ├── index.ts               # registro: ES v1–v3, outplacement-development v1
        ├── idioma.ts              # IDIOMAS_FORM, rótulos idioma · moeda, idiomaDaProposta()
        ├── formatoProposta.ts     # NOVO: projetosDaProposta(), garantias padrão, conversão do formato antigo para o form
        ├── pagina/                # NOVO: layout compartilhado
        │   ├── PaginaModelo.tsx   # ex-ExecutiveSearchV1, parametrizado por divisão e recursos da versão
        │   ├── pagina-modelo.css  # ex-executive-search-v1.css (+ .svcs/.svc, .rate-sub, logo larga)
        │   └── i18n/{tipos,pt-BR,en-US,index,indisponivel}.ts  # textos comuns às divisões
        ├── executive-search/v1/
        │   ├── ExecutiveSearchV1.tsx  # passa a montar PaginaModelo com o conteúdo ES
        │   ├── versoes.ts             # v3: formatoNovo
        │   └── conteudo/{pt-BR,en-US}.ts  # só o conteúdo fixo da divisão
        └── outplacement-development/v1/
            ├── OutplacementDevelopmentV1.tsx  # NOVO
            └── conteudo/{pt-BR,en-US}.ts      # NOVO
```

**Structure Decision**: Mesma estrutura web das 080 a 082. A página vira um layout compartilhado com "conteúdo da divisão" injetado (research R5), porque as duas divisões têm o mesmo design system, as mesmas seções de dados e o mesmo aceite; só mudam textos fixos, a seção do meio e detalhes de exibição. As versões de cada modelo continuam descritas por uma tabela de recursos.

## Dependência de código

A feature parte da `main` com a 082 (commit `2297c9b`). Nenhuma pendência de outra feature.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Refatoração da página do Executive Search em layout compartilhado | A divisão nova repete 90% da página (capa, menu, investimento, garantias, aceite, contato, impressão, i18n). | Copiar `ExecutiveSearchV1.tsx` e o CSS para a divisão nova duplicaria ~600 linhas e obrigaria a corrigir cada ajuste futuro (aceite, idioma, impressão) em dois lugares; com 4 divisões previstas, a duplicação cresceria para quatro cópias. |
| Dois formatos de dados convivendo na tabela `propostas` | Propostas assinadas precisam continuar exatamente como aceitas (FR-034) e com o hash válido. | Converter também as assinadas mudaria o conteúdo canônico e invalidaria a prova do aceite. |
