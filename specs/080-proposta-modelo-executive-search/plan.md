# Implementation Plan: Modelos de Proposta por Divisão (Executive Search)

**Branch**: `080-proposta-modelo-executive-search` | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/080-proposta-modelo-executive-search/spec.md`

**Note**: Clarify 2026-10-05: perfil do consultor no próprio Proposal; propostas por modelo sem CNPJ, valor nem imposto (antigas ficam como estão); validade exibida em "Vamos avançar?"; **Criar cópia** oculta em propostas simples; Data editável (passado ou futuro), nunca posterior à validade.

**Dependência de código**: a feature 079 (edição antes da assinatura) está implementada na árvore de trabalho, mas ainda não commitada. Este plano parte dela (`versao`, `propostas_edicoes`, `PUT`, `PropostaForm`, `Editar.tsx`); commitar a 079 antes de começar a 080.

## Summary

O Proposal passa a criar propostas a partir de **modelos por divisão** da Ocean Talent Solutions. Nesta entrega existe só o modelo **Executive Search**, reproduzido do HTML de referência. O usuário escolhe o modelo, preenche empresa, data, setor, consultor (pré-preenchido pelo novo perfil), projeto, de 1 a 3 investimentos e garantia, e o link do cliente mostra uma página idêntica ao HTML de exemplo com os dados preenchidos. O botão "Aceitar proposta" usa a assinatura existente. Lista, detalhe, edição (079) e cópia passam a entender os campos do modelo; propostas antigas continuam funcionando.

Abordagem técnica:
1. **Página do cliente** como componente React por modelo e versão (`ExecutiveSearchV1`), com o CSS do modelo escopado em `.tpl-es`, carregado sob demanda na rota pública `/p/:codigo` (research R1, R2, R16).
2. **Dados**: colunas novas em `propostas` + `investimentos JSONB`; `cliente_nome` vira "Empresa"; `cnpj/valor/total` anuláveis com `CHECK` por modelo; `modelo` + `modelo_versao` congelam o texto aceito (R4, R5).
3. **Validação, hash e histórico por modelo**: `validar_modelo`, hash canônico por modelo (o das propostas simples não muda), diff com uma entrada por tipo de investimento (R6, R7, R8).
4. **Perfil do consultor**: tabela `proposal_perfis_consultor` + `GET/PUT /api/proposal/perfil`; a proposta copia os dados (R9).
5. **Imagens** extraídas do HTML para `frontend/public/propostas/` (R3).

## Technical Context

**Language/Version**: Python 3.11 (backend) · TypeScript 5.2 + React 18 (frontend)

**Primary Dependencies**: FastAPI 0.104, SQLAlchemy 2.0, Pydantic (já usados) · Vite 5, React Router 6, Axios, Tailwind 3, react-hot-toast (já usados). Nenhuma dependência nova; fontes Inter/Poppins via Google Fonts (já usadas pelo modelo de referência).

**Storage**: PostgreSQL 16 (Supabase em produção). `propostas` ganha 11 colunas e 2 `CHECK`; `cnpj`, `valor`, `total` passam a aceitar `NULL`; tabela nova `proposal_perfis_consultor`. Migração inline idempotente em `_migrar()` (padrão do projeto), constraints em blocos `DO $$`; RLS reaplicado com `backend/scripts/enable_rls_supabase.sql`.

**Testing**: Sem suíte automatizada no repositório. Validação pelo [quickstart.md](./quickstart.md) (interface, comparação lado a lado com o HTML de referência e `curl`) e `npm run lint`, `npm run type-check`, `npm run build` no `frontend/`.

**Target Platform**: Vercel (frontend, domínio do Proposal; imagens como arquivos estáticos com CDN) + Render (API) + Supabase (Postgres). Dev: API **8001**, PostgreSQL **5433**, Redis **6380**, frontend **5193** (inalteradas).

**Project Type**: Web application (backend FastAPI + app Proposal em `frontend/src/proposal/`).

**Performance Goals**: Criar proposta completa em < 3 min (SC-001); aceite em < 1 min no celular (SC-004); página do cliente com conteúdo visível em até ~3 s em 4G (R16): JSON público < 2 KB, imagens estáticas cacheadas (≈ 295 KB, hoje embutidas em base64), componente do modelo em chunk separado.

**Constraints**: Fidelidade visual ao HTML de referência (SC-003); nenhum marcador nem modo `?campos` na página (FR-014); dados digitados sempre como texto literal (FR-020); hash das propostas simples inalterado e propostas antigas funcionando (SC-006); texto do modelo aceito demonstrável (SC-005); isolamento do ERP mantido; sem segredos nos artefatos.

**Scale/Scope**: Uso interno (dezenas de usuários, centenas de propostas por mês). Backend: 2 endpoints novos (perfil), 4 com corpo/regra alterados (criar, editar, detalhe, lista) + `GET` público; 1 tabela alterada + 1 nova; 1 módulo novo (`proposta_modelos.py`). Frontend: 1 componente de modelo + CSS, 1 formulário novo, 1 tela nova (Perfil), 5 telas ajustadas, 2 imagens.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS: artefatos em pt-BR; inglês só em nomes técnicos, código, identificadores dos modelos e títulos de template |
| II. Domínio financeiro / papéis admin·visualizador | PASS: feature restrita ao Proposal (077), sem dados do ERP. Visibilidade/edição seguem a regra criador ou `admin`; o perfil é sempre do próprio usuário. Cadastro de usuários do ERP inalterado |
| III. Clareza antes de implementar | PASS: specify + clarify fecharam 5 decisões (perfil, campos antigos, validade, cópia, Data); nenhum NEEDS CLARIFICATION restante. Pontos externos em aberto (fotos por setor, outras divisões) têm alternativa provisória documentada |
| IV. Consistência com o produto existente | PASS: mesmas telas, toasts, spinner, `window.confirm`, migração inline, mensagens `detail` em pt-BR, fluxo de assinatura e edição da 077/079. A página do cliente segue o HTML de referência por requisito (FR-013) |
| V. Simplicidade e escopo fechado | PASS: sem tabela/endpoint de modelos, sem snapshot de HTML, sem foto por IA, sem PDF no servidor, sem múltiplos projetos. Itens com custo extra justificados em Complexity Tracking |
| Portas / segredos | PASS: portas inalteradas; nenhum segredo |

**Post-design re-check**: Sem violações. O desenho reaproveita a coluna `cliente_nome`, o formato de `propostas_edicoes` e o endpoint de assinatura sem mudança de contrato. A única mudança de infraestrutura é a adição de arquivos estáticos e do `<link>` de fontes no `proposal.html`; o plano B de entrada HTML separada (R1) só entra se a fidelidade falhar no quickstart, seção 4.

## Project Structure

### Documentation (this feature)

```text
specs/080-proposta-modelo-executive-search/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-proposal.md      # POST só por modelo; PUT por modelo; detalhe/lista com campos novos; perfil
│   ├── api-public.md        # GET público com campos do modelo; assinatura sem mudança de contrato
│   └── ui-proposal.md       # registro de modelos, Nova/ModeloForm, Editar, Detalhe, Lista, Perfil, ExecutiveSearchV1
├── checklists/
│   └── requirements.md
└── tasks.md                 # Phase 2 (/speckit-tasks; não criado aqui)
```

### Source Code (repository root)

```text
backend/app/
├── main.py                              # _migrar(): bloco "Proposal (feature 080)": colunas novas,
│                                        # DROP NOT NULL (cnpj/valor/total), CHECKs em DO $$,
│                                        # tabela proposal_perfis_consultor
├── models/__init__.py                   # Proposta (+11 colunas, nullable cnpj/valor/total);
│                                        # PerfilConsultor (novo)
├── schemas.py                           # PropostaCreate (+modelo e campos do modelo, InvestimentoIn);
│                                        # PerfilConsultorIn (novo)
├── services/
│   ├── proposta_modelos.py              # NOVO: MODELOS, SETORES, TIPOS_INVESTIMENTO; validar_modelo;
│   │                                    # digitos_telefone; normalização dos investimentos
│   └── propostas.py                     # conteudo_canonico por modelo; diff_campos por modelo
│                                        # (investimento.{tipo}); serializar_item/detalhe/publica
│                                        # com campos do modelo e modelo_nome
└── api/routes/
    ├── proposal_propostas.py            # POST exige modelo; PUT valida pelo modelo da proposta
    ├── proposal_perfil.py               # NOVO: GET/PUT /api/proposal/perfil (usuário do token)
    └── public_propostas.py              # sem mudança de regra (usa serializar_publica e hash novos)

frontend/
├── proposal.html                        # preconnect + link das fontes Inter/Poppins
├── public/propostas/
│   ├── executive-search/logo-divisao.png   # extraída do HTML de referência
│   └── setores/infraestrutura.jpg          # extraída; demais setores quando o zip chegar
└── src/proposal/
    ├── App.tsx                          # rota /perfil
    ├── components/
    │   ├── ProposalLayout.tsx           # link "Meu perfil"
    │   └── ModeloForm.tsx               # NOVO: formulário do modelo + resumo + validação
    ├── modelos/
    │   ├── index.ts                     # NOVO: registro de modelos e versões (lazy)
    │   ├── setores.ts                   # NOVO: setores + foto
    │   ├── investimentos.ts             # NOVO: tipos e rótulos
    │   ├── formatacao.ts                # NOVO: taxa, pagamento, garantia, telefone
    │   └── executive-search/v1/
    │       ├── ExecutiveSearchV1.tsx    # NOVO: página do cliente (HTML de referência em JSX)
    │       └── executive-search-v1.css  # NOVO: CSS do modelo escopado em .tpl-es
    ├── services/proposalApi.ts          # tipos do modelo e do perfil; obterPerfil/salvarPerfil
    └── pages/
        ├── Nova.tsx                     # seletor de modelo + ModeloForm; cópia só de modelo
        ├── Editar.tsx                   # ModeloForm ou PropostaForm conforme o modelo
        ├── Detalhe.tsx                  # seções do modelo; Criar cópia oculta em simples; rótulos do histórico
        ├── Lista.tsx                    # Empresa, Modelo, Projeto, Data, Validade, Status
        ├── Perfil.tsx                   # NOVO: perfil do consultor
        └── PropostaPublica.tsx          # despacha para o componente do modelo ou página legada
```

**Structure Decision**: Mantém a estrutura da 077/079. Toda a mudança fica no domínio do Proposal: backend em `services/` e routers do Proposal (um router novo para o perfil, registrado em `main.py` no bloco do Proposal), frontend em `frontend/src/proposal/` e `frontend/public/propostas/`. Nenhum arquivo do ERP (`src/pages/`, `services/api.ts`, `audit.py`, cadastro de usuários) é alterado. `PropostaForm` (079) permanece para editar propostas simples.

### Ordem sugerida de implementação

1. **Base**: commitar a 079. Migração + modelos (`Proposta` e `PerfilConsultor`) + `proposta_modelos.py`. Validar a seção 1 do quickstart (propostas antigas intactas).
2. **Backend do modelo** (US1): `PropostaCreate` estendido, `validar_modelo`, `POST` só por modelo, hash e serialização por modelo, `PUT` por modelo com diff de investimentos.
3. **Perfil** (US5): router `proposal_perfil.py`, `Perfil.tsx`, link no layout.
4. **Formulário** (US1): registro de modelos/setores/investimentos, `formatacao.ts`, `ModeloForm`, `Nova.tsx`.
5. **Página do cliente** (US2): extrair imagens, `ExecutiveSearchV1` + CSS escopado, fontes, despacho em `PropostaPublica.tsx`. Validar lado a lado (quickstart, seção 4); se o preflight do Tailwind impedir a fidelidade, aplicar o plano B do R1.
6. **Aceite** (US3): diálogo do modelo ligado a `assinarPublica`, estado assinado, 409 de versão.
7. **Lista, detalhe, edição, cópia** (US4): `Lista.tsx`, `Detalhe.tsx`, `Editar.tsx`, `Nova.tsx?copiar`.
8. **Deploy**: rodar `enable_rls_supabase.sql` no Supabase depois do primeiro boot; conferir os arquivos estáticos no domínio do Proposal.

## Complexity Tracking

| Decisão | Por que é necessária | Alternativa mais simples rejeitada porque |
|---|---|---|
| `modelo_versao` + componente por versão | FR-025/SC-005: proposta assinada continua mostrando o texto aceito mesmo que o modelo mude | Um componente único faria propostas assinadas exibirem o texto novo; snapshot do HTML por proposta é pesado e o HTML é gerado no navegador |
| CSS do modelo escopado com restaurações do preflight | FR-013/SC-003 pedem fidelidade ao HTML de referência dentro de um app com Tailwind | Usar o CSS sem escopo vazaria para as telas internas do Proposal; entrada HTML separada muda roteamento e deploy (fica como plano B) |
| `CHECK` por modelo e colunas anuláveis em `propostas` | Uma tabela para dois formatos de proposta (simples e por modelo) mantendo status, assinatura, edição e histórico únicos | Tabela separada duplicaria todo o fluxo de status/assinatura/edição; remover as colunas antigas quebraria as propostas existentes (FR-030) |
