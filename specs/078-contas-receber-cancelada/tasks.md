---

description: "Lista de tarefas da feature 078 — Status Cancelada em Contas a Receber"
---

# Tasks: Status "Cancelada" em Contas a Receber

**Input**: Documentos de desenho em `specs/078-contas-receber-cancelada/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/api.md](./contracts/api.md), [quickstart.md](./quickstart.md)

**Tests**: A spec não pede testes automatizados e o projeto não tem suíte (research D13). Não há tarefas de teste; a validação é feita pelo [quickstart.md](./quickstart.md) ao fim de cada história.

**Organization**: Tarefas agrupadas por história de usuário para implementação e validação independentes. Referências "Dn" apontam para as decisões em [research.md](./research.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: História de usuário da tarefa (US1, US2, US3, US4)
- Caminhos relativos à raiz do repositório (`backend/app/`, `frontend/src/`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar ambiente e dados existentes antes de mudar regras

- [X] T001 Subir o ambiente (`docker compose up -d`, `cd frontend && npm run dev`) e rodar no banco local a consulta de "Canceladas antigas com recebimento" de `specs/078-contas-receber-cancelada/quickstart.md`; registrar a contagem encontrada na seção "Achados" de `specs/078-contas-receber-cancelada/research.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Coluna nova, helpers de filtro e campos de contrato usados por todas as histórias

**⚠️ CRITICAL**: Nenhuma história começa antes desta fase

- [X] T002 Adicionar ao model `NF` a coluna `situacao_definida_ocean = Column(Boolean, nullable=False, default=False, server_default='false')` e a property somente leitura `revisar_cancelamento` (retorna `self.status == StatusNF.CANCELADA and self.data_pagamento is not None`) em `backend/app/models/__init__.py` (D4, D7)
- [X] T003 Adicionar em `_migrar()` de `backend/app/main.py`, no mesmo padrão de `excluida_em`/`aliquota_imposto`, o comando `ALTER TABLE nfs ADD COLUMN IF NOT EXISTS situacao_definida_ocean BOOLEAN NOT NULL DEFAULT FALSE` (D12)
- [X] T004 [P] Criar `backend/app/services/nf_validas.py` com `filtro_nf_valida()` → `and_(NF.status != StatusNF.CANCELADA, NF.excluida_em.is_(None))` e `filtro_bonus_valido()` → `or_(Bonus.nf_id.is_(None), and_(NF.status != StatusNF.CANCELADA, NF.excluida_em.is_(None)))` (este último exige `outerjoin(NF, Bonus.nf_id == NF.id)` na consulta chamadora; documentar isso na docstring) (D8)
- [X] T005 Em `backend/app/schemas.py`: adicionar `situacao: Optional[Literal["pendente", "recebida", "cancelada"]] = None` em `NFUpdate`; adicionar `revisar_cancelamento: bool = False` em `NFResponse` (lido do model via `from_attributes`); adicionar `nf_cancelada: bool = False` em `BonusResponse` (D1, D7, D9)
- [X] T006 [P] Em `frontend/src/types/index.ts`: adicionar `revisar_cancelamento?: boolean` ao tipo `NF`, `nf_cancelada?: boolean` ao tipo `Bonus`, o tipo `SituacaoNF = 'pendente' | 'recebida' | 'cancelada'` e o tipo `CancelamentoIgnorado = { linha?: number; numero?: string; nf_id: number; motivo: 'recebida_no_ocean' | 'reativada_no_ocean' }`; ajustar em `frontend/src/services/api.ts` a tipagem da resposta de `importarNfsXlsx` para incluir `cancelamentos_ignorados?: CancelamentoIgnorado[]` (contracts/api.md)

**Checkpoint**: Backend sobe sem erro (`docker logs ocean_backend`), coluna existe (`\d nfs`), frontend compila

---

## Phase 3: User Story 1 - Cancelar uma Conta a Receber pelo cadastro (Priority: P1) 🎯 MVP

**Goal**: `admin` escolhe Cancelada na edição, a conta fica Cancelada de forma estável (edições posteriores não desfazem), conta Recebida não pode ser cancelada (nem pela tela, nem pela API, nem pela planilha)

**Independent Test**: Cenários 2, 5, 6, 7, 10 e 12 de `quickstart.md`

### Implementation for User Story 1

- [X] T007 [US1] Em `atualizar_nf` de `backend/app/api/routes/nfs.py`: ler `situacao` de `nf_update` (removê-lo de `dados_atualizacao` antes do `setattr`); guardar `status_antes = db_nf.status`; se `situacao == "cancelada"` e `status_antes == StatusNF.PAGA` → `HTTPException(409, detail={"code": "NF_CANCELAR_RECEBIDA", "message": "Volte a conta para Pendente e salve antes de cancelar."})`; se `situacao == "cancelada"` e conta não cancelada → `db_nf.status = StatusNF.CANCELADA` e `db_nf.situacao_definida_ocean = True`; se já cancelada → no-op de status (D1, D3)
- [X] T008 [US1] No mesmo `atualizar_nf` em `backend/app/api/routes/nfs.py`: trocar o recálculo incondicional (`if "data_pagamento" in ... or "data_vencimento" in ...: db_nf.status = _calcular_status_nf(...)`) para **não** recalcular quando a conta está/ficou `CANCELADA` e `situacao` não é `pendente`/`recebida`; se a conta está cancelada, sem `situacao` de reativação, e o payload traz `data_pagamento` não nulo **diferente** do gravado → `HTTPException(409, detail={"code": "NF_CANCELADA_PAGAMENTO", "message": "Conta cancelada: reative-a (Pendente ou Recebida) antes de registrar pagamento."})` (reenvio do mesmo valor em canceladas antigas não deve falhar) (D2)
- [X] T009 [US1] No mesmo `atualizar_nf` em `backend/app/api/routes/nfs.py`: quando o status mudar por causa de `situacao`, registrar a auditoria com descrição `f"NF {numero} — Situação: {rótulo antes} → {rótulo depois}"` usando rótulos Pendente/Vencida/Recebida/Cancelada (ação `"editar"`, limite de 20 caracteres de `AuditLog.acao`) (D11)
- [X] T010 [US1] Em `frontend/src/pages/NFs.tsx`: ampliar `pagamento_estado` para `'pendente' | 'recebido' | 'cancelada'`; ao abrir edição de conta com `status === 'cancelada'`, iniciar com `'cancelada'`; no seletor "Pagamento" do modo **edição** (não na criação), adicionar `<option value="cancelada">Cancelada</option>`, desabilitada quando `editando.status === 'paga'`, com texto auxiliar abaixo do seletor "Para cancelar, volte a conta para Pendente e salve." quando Recebida; manter o seletor desabilitado para quem não é `admin` (mesma regra `oceanEditavel`/papel já usada no formulário) (D10, FR-001, FR-002, FR-015)
- [X] T011 [US1] Em `salvar` (ramo de edição) de `frontend/src/pages/NFs.tsx`: enviar `situacao` (`'pendente' | 'recebida' | 'cancelada'`, mapeando `recebido` → `recebida`); quando `cancelada`, não enviar `data_pagamento` nem `caixa`; exibir via `toast.error(mensagemErro(...))` a `message` dos erros 409 `NF_CANCELAR_RECEBIDA` e `NF_CANCELADA_PAGAMENTO` (contracts/api.md)
- [X] T012 [US1] Em `_aplicar_campos_arquivo` e `importar_nfs_xlsx` de `backend/app/api/routes/nfs.py`: fazer `_aplicar_campos_arquivo` retornar um motivo opcional; linha cancelada + conta com `status == StatusNF.PAGA` → não alterar nada e retornar `"recebida_no_ocean"`; linha cancelada em conta existente **não** sobrescreve mais `razao_social`; no loop de `importar_nfs_xlsx`, acumular `cancelamentos_ignorados.append({"linha", "numero", "nf_id", "motivo"})`, registrar auditoria `"editar"` com descrição "Import ignorou cancelamento: Recebida no Ocean" e devolver `cancelamentos_ignorados` (lista vazia quando não houver) na resposta (D5, D6, FR-016)
- [X] T013 [US1] Em `concluirImportNfs` de `frontend/src/pages/NFs.tsx`: quando `cancelamentos_ignorados` não estiver vazio, abrir um modal de resultado (padrão visual dos modais da página) listando linha, número da NF e o texto do motivo — `recebida_no_ocean` → "Recebida no Ocean, cancelada na planilha", `reativada_no_ocean` → "Reativada no Ocean, cancelada na planilha" — com botão "Fechar" (FR-016)

**Checkpoint**: Cancelar/bloquear funciona ponta a ponta; editar uma cancelada mantém Cancelada; planilha não cancela Recebida

---

## Phase 4: User Story 2 - Lançamento cancelado não entra em nenhum cálculo (Priority: P1)

**Goal**: Receita, imposto e todas as comissões (pagas ou não) de contas canceladas ficam fora de todos os totais; comissões continuam visíveis com aviso

**Independent Test**: Cenários 3, 4 e 11 de `quickstart.md` + consultas SQL de conferência

### Implementation for User Story 2

- [X] T014 [P] [US2] Em `backend/app/api/routes/relatorios.py`: aplicar `filtro_nf_valida()` em `fechamentos_por_tipo`, `propostas_enviadas` e `placement_por_consultor`; em `bonus_mensal`, adicionar `outerjoin(NF, Bonus.nf_id == NF.id)` + `filtro_bonus_valido()` (D8)
- [X] T015 [P] [US2] Em `coletar_alertas` de `backend/app/services/email.py`: acrescentar `NF.status != StatusNF.CANCELADA` ao filtro dos alertas de vencimento (FR-013)
- [X] T016 [P] [US2] Em `serializar_bonus` de `backend/app/services/comissoes_sync.py`: incluir `"nf_cancelada": bool(b.nf is not None and b.nf.status == StatusNF.CANCELADA)` (D9, contracts/api.md)
- [X] T017 [US2] Em `frontend/src/pages/Bonus.tsx`: criar o predicado `conta = (b: Bonus) => !b.nf_cancelada` e aplicá-lo em todos os totais (`porColaborador`/`liberadoTotal`, `graficoDados`, `totalAba`, `totalCol` e célula de liberado); nas linhas com `nf_cancelada`, aplicar `opacity-60` e o badge vermelho "Conta cancelada" (mesmas classes de `statusColor('cancelada')` de `NFs.tsx`); no CSV, manter as linhas e adicionar a coluna "Conta cancelada" (Sim/Não) (FR-007, FR-007a)

**Checkpoint**: Com uma conta cancelada no mês, todos os totais caem exatamente no valor dela e de suas comissões

---

## Phase 5: User Story 3 - Reverter um cancelamento feito por engano (Priority: P2)

**Goal**: `admin` reativa qualquer cancelada (manual, da planilha ou antiga com recebimento); a decisão do Ocean prevalece nas próximas importações

**Independent Test**: Cenários 8, 9, 13, 14, 16 e 17 de `quickstart.md`

### Implementation for User Story 3

- [X] T018 [US3] Em `atualizar_nf` de `backend/app/api/routes/nfs.py`: com conta `CANCELADA` e `situacao == "recebida"`, exigir `data_pagamento` (payload ou gravado) senão `HTTPException(422, detail="Informe a data de pagamento para marcar como recebido.")`, e definir `status = PAGA` com a regra de `caixa` já existente; com `situacao == "pendente"`, limpar `data_pagamento` e recalcular por `_calcular_status_nf`; em ambos, `situacao_definida_ocean = True` e auditoria conforme T009 (FR-010, FR-011)
- [X] T019 [US3] Em `_aplicar_campos_arquivo` de `backend/app/api/routes/nfs.py`: se `db_nf.situacao_definida_ocean` — conta cancelada + linha ativa → atualizar campos de negócio mantendo `CANCELADA` (não chamar `_calcular_status_nf`); conta ativa + linha cancelada → não alterar nada e retornar `"reativada_no_ocean"` (entra em `cancelamentos_ignorados` via T012) (D4, FR-014)
- [X] T020 [US3] Em `frontend/src/pages/NFs.tsx`: quando `nf.revisar_cancelamento`, mostrar na linha da listagem o aviso âmbar "Cancelada com recebimento — revisar" ao lado do badge Cancelada e, no modal de edição, um aviso explicando as duas saídas (voltar para Recebida, ou voltar para Pendente e cancelar de novo); ao escolher Recebida nessas contas, pré-preencher a data de pagamento gravada (D7, FR-017)
- [X] T021 [US3] Em `frontend/src/pages/NFs.tsx`: garantir que, partindo de `'cancelada'`, escolher Pendente limpa a data e escolher Recebida exibe o campo obrigatório de data de pagamento (regra `MSG_DATA_PAGAMENTO` existente) e o seletor de caixa; após salvar a reativação, `toast.success('Conta reativada')` e recarregar a listagem (FR-010, FR-011)

**Checkpoint**: Reativar devolve totais e comissões aos valores originais; reimportação respeita o Ocean

---

## Phase 6: User Story 4 - Confirmação antes de cancelar (Priority: P3)

**Goal**: Cancelamento só é gravado após confirmação explícita

**Independent Test**: Cenário 1 de `quickstart.md`

### Implementation for User Story 4

- [X] T022 [US4] Em `salvar` de `frontend/src/pages/NFs.tsx`: se a situação escolhida é `'cancelada'` e `editando.status !== 'cancelada'`, chamar `window.confirm('Cancelar esta conta? Receita, imposto e todas as comissões vinculadas deixarão de ser considerados nos cálculos.')`; se recusado, abortar sem requisição e manter o modal aberto; se confirmado e salvo, `toast.success('Conta cancelada')` (FR-003)

**Checkpoint**: Todas as histórias funcionais

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e validação final

- [X] T023 [P] Rodar `npm run build` e `npm run lint` em `frontend/` e corrigir erros de tipo/lint introduzidos em `frontend/src/pages/NFs.tsx`, `frontend/src/pages/Bonus.tsx` e `frontend/src/types/index.ts`
- [X] T024 [P] Reiniciar o backend (`docker compose restart backend`) e confirmar em `docker logs ocean_backend` que `_migrar()` e as rotas de `backend/app/api/routes/nfs.py`, `relatorios.py` e `bonus.py` carregam sem erro
- [X] T025 Executar o roteiro completo de `specs/078-contas-receber-cancelada/quickstart.md` (cenários 1–17 + consultas SQL de conferência) e anotar divergências como novas tarefas neste arquivo
- [ ] T026 Antes de implantar, rodar em produção a consulta de canceladas antigas de `specs/078-contas-receber-cancelada/quickstart.md` e registrar a quantidade em `specs/078-contas-receber-cancelada/research.md` (D7)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup — **bloqueia todas as histórias**
- **US1 (Phase 3)** e **US2 (Phase 4)**: dependem só da Fase 2; podem correr em paralelo
- **US3 (Phase 5)**: depende de US1 (T007–T008 e T012 tocam as mesmas funções de `nfs.py`; T019 usa o retorno de motivo criado em T012)
- **US4 (Phase 6)**: depende de US1 (T010–T011, mesmo fluxo de `salvar`)
- **Polish (Phase 7)**: depois das histórias desejadas

### Within Each User Story

- Backend antes do frontend que consome o contrato (T007–T009 → T010–T011; T012 → T013; T016 → T017)
- Tarefas no mesmo arquivo são sequenciais: `nfs.py` (T007 → T008 → T009 → T012 → T018 → T019) e `NFs.tsx` (T010 → T011 → T013 → T020 → T021 → T022)

### Parallel Opportunities

- Fase 2: T004 e T006 em paralelo com T002/T003/T005
- US2 inteira (T014, T015, T016 em paralelo; depois T017) pode correr ao lado de US1
- Polish: T023 e T024 em paralelo

---

## Parallel Example: User Story 2

```bash
# Backend de US2, três arquivos independentes:
Task: "T014 Aplicar filtro_nf_valida/filtro_bonus_valido em backend/app/api/routes/relatorios.py"
Task: "T015 Excluir canceladas de coletar_alertas em backend/app/services/email.py"
Task: "T016 Expor nf_cancelada em serializar_bonus em backend/app/services/comissoes_sync.py"

# Em seguida (depende de T016):
Task: "T017 Excluir nf_cancelada dos totais e mostrar badge em frontend/src/pages/Bonus.tsx"
```

## Parallel Example: Foundational

```bash
Task: "T004 Criar backend/app/services/nf_validas.py"
Task: "T006 Tipos em frontend/src/types/index.ts e frontend/src/services/api.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

As duas histórias P1 juntas formam o MVP: cancelar sem os cálculos excluírem a conta não entrega valor, e vice-versa.

1. Fase 1 → Fase 2
2. Fase 3 (US1) e Fase 4 (US2)
3. **PARAR E VALIDAR**: cenários 2–7, 10–12 do quickstart
4. Implantar/demonstrar

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 + US2 → MVP (cancelar e excluir dos cálculos)
3. US3 → reversão, precedência sobre a planilha, revisão de canceladas antigas
4. US4 → confirmação
5. Polish → build, lint, roteiro completo, checagem de produção

---

## Notes

- [P] = arquivos diferentes, sem dependências pendentes
- Enum `statusnf` é gravado pelo **nome** em SQL bruto (`'CANCELADA'`)
- Não criar valores novos em `AuditLog.acao` (limite 20 caracteres); usar `"editar"`
- Contas a Pagar está fora do escopo
- Commitar ao fim de cada tarefa ou grupo lógico
