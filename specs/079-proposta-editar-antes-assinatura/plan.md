# Implementation Plan: Editar Proposta Antes da Assinatura

**Branch**: `079-proposta-editar-antes-assinatura` | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/079-proposta-editar-antes-assinatura/spec.md`

**Note**: Clarify 2026-10-02: edição volta o status para **Aguardando assinatura** (a 1ª visualização do link é preservada); propostas **Expiradas** são editáveis e reativadas com validade futura; histórico completo de edições (quem, quando, campo anterior → novo) no detalhe; página do cliente mostra "Atualizada em dd/mm/aaaa".

## Summary

Permitir editar, no Proposal, uma proposta ainda não assinada (status **Aguardando assinatura**, **Visualizada** ou **Expirada**), mantendo o mesmo link público. A edição usa o mesmo formulário e as mesmas validações da criação, volta o status para **Aguardando assinatura**, registra um histórico append-only das alterações e faz a página do cliente mostrar "Atualizada em". A assinatura passa a exigir que o cliente esteja vendo a versão vigente.

Abordagem técnica:
1. **Versão da proposta**: coluna `versao` incrementada a cada edição; o cliente envia a versão que está na tela ao assinar, e o `UPDATE` condicional da assinatura (077) ganha `AND versao = :versao` (research R1).
2. **Edição transacional**: `PUT /api/proposal/propostas/{id}` com `SELECT ... FOR UPDATE`, diff contra o estado atual, recálculo de valores e hash, reset de status e gravação do histórico no mesmo commit (R2, R3, R5).
3. **Visualização por versão**: `versao_visualizada_em` separa "o cliente viu a versão atual" da "1ª visualização do link"; o `GET` público ignora aberturas feitas com token do Proposal do criador/`admin` (R3, R4).
4. **Frontend**: formulário extraído para `PropostaForm`, nova página `Editar`, histórico no `Detalhe`, "Atualizada em" e envio da versão na página pública (R9).

## Technical Context

**Language/Version**: Python 3.11 (backend) · TypeScript 5.2 + React 18 (frontend)

**Primary Dependencies**: FastAPI 0.104, SQLAlchemy 2.0 (já usados) · Vite 5, React Router 6, Axios, Tailwind 3, react-hot-toast (já usados). Nenhuma dependência nova.

**Storage**: PostgreSQL 16 (Supabase em produção). `propostas` ganha `versao`, `atualizada_em`, `versao_visualizada_em`; tabela nova `propostas_edicoes` (`JSONB` para as alterações). Migração inline em `_migrar()` (padrão do projeto); RLS reaplicado com `backend/scripts/enable_rls_supabase.sql`.

**Testing**: Sem suíte automatizada no repositório. Validação pelo [quickstart.md](./quickstart.md) (interface + `curl`, incluindo as corridas edição × assinatura) e `npm run lint`, `npm run type-check`, `npm run build` no `frontend/`.

**Target Platform**: Vercel (frontend, domínio do Proposal) + Render (API) + Supabase (Postgres). Dev: API **8001**, PostgreSQL **5433**, Redis **6380**, frontend **5193** (inalteradas).

**Project Type**: Web application (backend FastAPI + app Proposal em `frontend/src/proposal/`).

**Performance Goals**: Corrigir e salvar uma proposta em menos de 1 min a partir do detalhe (SC-001). Lock de linha só durante a requisição de edição; leitura do histórico junto do detalhe (dezenas de itens no máximo).

**Constraints**: Assinatura só da versão vigente (SC-004); propostas assinadas/canceladas imutáveis inclusive por chamada direta (SC-003); formato do hash canônico inalterado (hashes antigos continuam válidos); isolamento do ERP mantido (histórico fora da auditoria do ERP); sem segredos nos artefatos.

**Scale/Scope**: Uso interno (dezenas de usuários, centenas de propostas por mês). 1 endpoint novo (`PUT`), 3 endpoints com corpo/regra alterados (detalhe, `GET` público, assinar), 1 tabela alterada + 1 nova, 1 tela nova + 1 componente extraído + 3 telas ajustadas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS: artefatos em pt-BR; inglês só em nomes técnicos, código e títulos de template |
| II. Domínio financeiro / papéis admin·visualizador | PASS: feature restrita ao Proposal (077). Mantém a regra existente: criador ou `admin` veem e agora editam; nenhum dado do ERP envolvido |
| III. Clareza antes de implementar | PASS: clarify fechou status pós-edição, expiradas, histórico e aviso ao cliente; nenhum NEEDS CLARIFICATION restante |
| IV. Consistência com o produto existente | PASS: mesmo formulário e mensagens da criação, toast + spinner, migração inline em `_migrar()`, UPDATE condicional já usado na assinatura. A mudança da regra de imutabilidade da 077 está documentada na spec (FR-016) |
| V. Simplicidade e escopo fechado | PASS: sem restaurar versões, sem notificação ao cliente, sem snapshots completos; versão inteira em vez de mecanismos mais pesados. Histórico em tabela própria justificado abaixo |
| Portas / segredos | PASS: portas inalteradas; nenhum segredo |

**Post-design re-check**: Sem violações. O ajuste no `GET` público para ignorar aberturas do próprio usuário (R4) corrige também uma lacuna existente do FR-024 da 077 e é exigido pelo edge case "Visualizações pelo usuário" da spec; a mudança da mensagem de validade (R8) vale para criação e edição, sem mudar a regra.

## Project Structure

### Documentation (this feature)

```text
specs/079-proposta-editar-antes-assinatura/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-proposal.md      # PUT de edição; detalhe com versão e histórico; mensagem de validade
│   ├── api-public.md        # GET com token opcional, versão e atualizada_em; assinar com versão
│   └── ui-proposal.md       # PropostaForm, tela Editar, Detalhe, PropostaPublica, proposalApi
├── checklists/
│   └── requirements.md
└── tasks.md                 # Phase 2 (/speckit-tasks; não criado aqui)
```

### Source Code (repository root)

```text
backend/app/
├── main.py                              # _migrar(): bloco "Proposal (feature 079)":
│                                        # colunas versao/atualizada_em/versao_visualizada_em,
│                                        # backfill idempotente, tabela propostas_edicoes
├── models/__init__.py                   # Proposta (+3 colunas, docstring sem "imutável",
│                                        # relationship edicoes); PropostaEdicao (nova)
├── schemas.py                           # PropostaAssinar (+versao: Optional[int]);
│                                        # PUT reutiliza PropostaCreate
├── services/propostas.py                # validar_dados (extraído de validar_criacao, msg de validade);
│                                        # diff_campos (forma canônica); serializar_detalhe
│                                        # (+versao, atualizada_em, versao_visualizada_em, edicoes);
│                                        # serializar_publica (+versao, atualizada_em)
└── api/routes/
    ├── proposal_auth.py                 # get_proposal_user_opcional (token opcional, nunca levanta erro)
    ├── proposal_propostas.py            # PUT /{id}: FOR UPDATE, 409 assinada/cancelada, diff,
    │                                    # reset de status, versao+1, histórico
    └── public_propostas.py              # GET: marca por versão e ignora criador/admin autenticado;
                                         # assinar: AND versao = :versao, 409 "proposta atualizada"

frontend/src/proposal/
├── App.tsx                              # rota /propostas/:id/editar
├── services/proposalApi.ts              # tipos novos; editarProposta; token opcional no GET público;
│                                        # assinarPublica com versao
├── components/PropostaForm.tsx          # NOVO: formulário + resumo + validação (extraído de Nova.tsx)
└── pages/
    ├── Nova.tsx                         # passa a usar PropostaForm (sem mudar comportamento)
    ├── Editar.tsx                       # NOVO: carrega, bloqueia assinada/cancelada, PUT, toasts
    ├── Detalhe.tsx                      # ação Editar; 1ª visualização / versão atual / última edição;
    │                                    # seção Histórico de edições
    └── PropostaPublica.tsx              # "Atualizada em"; envia versao; 409 recarrega mantendo nome/e-mail
```

**Structure Decision**: Mantém a estrutura da 077. Toda a mudança fica no domínio do Proposal: backend em `services/propostas.py` e nos três routers do Proposal, frontend em `frontend/src/proposal/`. Nenhum arquivo do ERP (`pages/`, `services/api.ts`, `audit.py`) é alterado.

### Ordem sugerida de implementação

1. **Dados**: migração + modelos (`versao`, `atualizada_em`, `versao_visualizada_em`, `PropostaEdicao`) e serialização dos campos novos. Validar a seção 1 do quickstart.
2. **Integridade da assinatura** (US2, P1): `versao` no `GET` público e na assinatura, `UPDATE` com versão, página pública enviando a versão. Assinaturas de propostas nunca editadas devem continuar funcionando antes de existir edição.
3. **Edição no backend** (US1/US2): `validar_dados`, diff, `PUT` com lock, 409, reset de status e histórico.
4. **Edição no frontend** (US1): `PropostaForm`, `Nova.tsx` refatorada, `Editar.tsx`, ação e histórico no `Detalhe.tsx`.
5. **Visualização por versão** (US1, edge case): regra nova do `GET` público + token opcional; "Atualizada em" na página pública.
6. **Expiradas** (US3): conferir a reativação (sai naturalmente do passo 3) e a seção 7 do quickstart.
7. **Deploy**: rodar `enable_rls_supabase.sql` no Supabase depois do primeiro boot com a migração.

## Complexity Tracking

| Decisão | Por que é necessária | Alternativa mais simples rejeitada porque |
|---|---|---|
| Tabela própria `propostas_edicoes` (em vez da auditoria do ERP) | O histórico com campo anterior → novo é requisito (FR-011) e precisa ficar só no Proposal | Gravar em `services/audit.py` exporia dados do Proposal na página de Auditoria do ERP e quebraria o isolamento entre as ferramentas |
| `SELECT ... FOR UPDATE` na edição | Garante diff correto no histórico e recusa a edição se o cliente assinar no meio (FR-014) | Só `UPDATE` condicional resolve a corrida com a assinatura, mas deixaria o "valor anterior" do histórico desatualizado em edições simultâneas |
