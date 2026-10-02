# Implementation Plan: Status "Cancelada" em Contas a Receber

**Branch**: `078-contas-receber-cancelada` | **Date**: 2026-10-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/078-contas-receber-cancelada/spec.md`

## Summary

Permitir que o `admin` cancele (e reative) uma Conta a Receber pelo formulário de edição e garantir que uma conta cancelada não entre em nenhum cálculo de receita, imposto ou comissão — incluindo todas as comissões vinculadas, pagas ou não, que continuam visíveis na tela de Comissões com aviso.

Abordagem técnica (detalhes em [research.md](./research.md)):

- Reaproveitar o status persistido `cancelada` e adicionar o campo de escrita `situacao` no `PUT /nfs/{id}` (D1).
- Corrigir a edição que hoje "descancela" a conta ao recalcular o status por datas (D2) e bloquear cancelamento de conta Recebida (D3).
- Nova coluna `nfs.situacao_definida_ocean` para que a decisão do Ocean prevaleça sobre a planilha nos dois sentidos (D4); importação deixa de cancelar contas Recebidas e passa a reportar `cancelamentos_ignorados` (D5); deixa de sobrescrever o nome do cliente (D6).
- Canceladas antigas com recebimento: detecção derivada `revisar_cancelamento`, sem migração de dados (D7).
- Helper único de "conta válida" aplicado às 5 consultas que hoje somam canceladas (D8); `nf_cancelada` exposto nas comissões e excluído de todos os totais de `Bonus.tsx` (D9).

## Technical Context

**Language/Version**: Python 3.11 (backend); TypeScript 5.2 + React 18 (frontend)

**Primary Dependencies**: FastAPI 0.104, SQLAlchemy 2.0, Pydantic 2.5; Vite 5, Tailwind CSS, Zustand, Axios, react-hot-toast, Recharts

**Storage**: PostgreSQL 16 (porta 5433); migração via `ALTER TABLE ... IF NOT EXISTS` em `_migrar()` de `backend/app/main.py` (sem Alembic)

**Testing**: Sem suíte automatizada no projeto; validação manual pelo [quickstart.md](./quickstart.md) + consultas SQL de conferência (D13)

**Target Platform**: Aplicação web interna (Docker Compose: API 8001, frontend 5193)

**Project Type**: Web application (backend + frontend)

**Performance Goals**: Padrão do produto; filtros adicionais são condições simples em colunas já indexadas (`nfs.status`, `nfs.excluida_em`) e não devem alterar perceptivelmente o tempo das telas

**Constraints**: Portas fixas (8001/5433/6380/5193); `AuditLog.acao` limitado a 20 caracteres; enum `statusnf` gravado pelo **nome** (`'CANCELADA'`) em SQL bruto

**Scale/Scope**: Centenas a poucos milhares de contas e comissões; 1 coluna nova; ~6 arquivos de backend e ~4 de frontend

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|---|---|---|
| I. Idioma Português | Todos os artefatos (spec, plan, research, data-model, contracts, quickstart) em pt-BR; termos técnicos em inglês só onde necessário | ✅ |
| II. Domínio Financeiro Interno | Atua em Contas a Receber e Comissões; papéis `admin` (edita) e `visualizador` (só leitura) preservados — rota `PUT /nfs` já exige `require_admin` | ✅ |
| III. Clareza Antes de Implementar | Spec com 6 clarificações registradas; nenhum `NEEDS CLARIFICATION` restante no contexto técnico | ✅ |
| IV. Consistência com o Produto | Modal de edição existente, `window.confirm` para ação destrutiva, `react-hot-toast`, badge/cor de "Cancelada" já existentes; nada é apagado (cancelar ≠ excluir) | ✅ |
| V. Simplicidade e Escopo Fechado | 1 coluna booleana; reaproveita status existente; só as 5 consultas que hoje erram são alteradas; sem infraestrutura de testes nova; Contas a Pagar fora do escopo | ✅ |

**Re-check pós-design (Fase 1)**: ✅ sem violações. Uma correção pontual foi incorporada (D6, não sobrescrever o nome do cliente na importação) por ser exigida por FR-012 (preservar dados), não por antecipação de escopo. A spec foi ajustada em FR-017 para refletir o comportamento real do Fluxo de Caixa (D7).

## Project Structure

### Documentation (this feature)

```text
specs/078-contas-receber-cancelada/
├── spec.md
├── plan.md              # Este arquivo
├── research.md          # Fase 0 — inventário e decisões D1–D13
├── data-model.md        # Fase 1 — campos, transições, validações
├── quickstart.md        # Fase 1 — roteiro de validação
├── contracts/
│   └── api.md           # Fase 1 — mudanças de contrato HTTP
├── checklists/
│   └── requirements.md
└── tasks.md             # Fase 2 (/speckit-tasks — ainda não criado)
```

### Source Code (repository root)

```text
backend/app/
├── main.py                         # _migrar(): coluna situacao_definida_ocean (D12)
├── models/__init__.py              # NF.situacao_definida_ocean
├── schemas.py                      # NFUpdate.situacao; NFResponse.revisar_cancelamento; BonusResponse.nf_cancelada
├── services/
│   ├── nf_validas.py               # NOVO: filtro_nf_valida(), filtro_bonus_valido() (D8)
│   ├── comissoes_sync.py           # serializar_bonus → nf_cancelada (D9)
│   └── email.py                    # coletar_alertas exclui canceladas
└── api/routes/
    ├── nfs.py                      # atualizar_nf (D2, D3, D4); _aplicar_campos_arquivo e importar_nfs_xlsx (D4, D5, D6)
    └── relatorios.py               # fechamentos_por_tipo, propostas_enviadas, placement_por_consultor, bonus_mensal

frontend/src/
├── types/index.ts                  # NF.revisar_cancelamento; Bonus.nf_cancelada; resposta de importação
├── services/api.ts                 # tipagem do payload situacao / resposta de importação
└── pages/
    ├── NFs.tsx                     # seletor Pendente/Recebida/Cancelada, confirmação, bloqueio de Recebida,
    │                               # aviso "Cancelada com recebimento — revisar", painel de cancelamentos ignorados
    └── Bonus.tsx                   # badge "Conta cancelada", esmaecido, exclusão de todos os totais, coluna no CSV
```

**Structure Decision**: Aplicação web existente (`backend/` FastAPI + `frontend/` React). Nenhum diretório novo além de `backend/app/services/nf_validas.py`.

## Sequência de implementação sugerida

1. **Fundação (backend)**: coluna + model + helper `nf_validas.py` + campos novos nos schemas.
2. **US1/US3/US4 — cancelar, reativar, confirmar**: regras de `atualizar_nf` (D2, D3, D4) → formulário de `NFs.tsx` (D10).
3. **US2 — cálculos**: consultas de `relatorios.py` e `email.py` (D8) → `nf_cancelada` nas comissões e totais de `Bonus.tsx` (D9).
4. **Importação**: D4/D5/D6 no backend → painel de `cancelamentos_ignorados` em `NFs.tsx`.
5. **Canceladas antigas**: `revisar_cancelamento` na resposta → aviso na listagem (D7).
6. **Validação**: roteiro completo do [quickstart.md](./quickstart.md), incluindo a consulta de canceladas antigas em produção antes da implantação.

## Riscos

| Risco | Mitigação |
|---|---|
| Outra chamada de edição (ex.: modal de pagamento) reativar conta cancelada | Regra no backend (D2) independe do frontend: sem `situacao`, cancelada permanece cancelada; pagamento em cancelada → 409 |
| Totais de comissão divergirem entre telas | Toda soma de comissão no frontend passa a usar o mesmo predicado `!nf_cancelada`; backend usa `filtro_bonus_valido` |
| Canceladas antigas em produção com nome "Cancelada" após reativação | Documentado como edge case; correção pela edição normal |
| Mudança de comportamento da importação surpreender o usuário | Painel de `cancelamentos_ignorados` explica cada caso |

## Complexity Tracking

Sem violações da constitution a justificar.
