---

description: "Lista de tarefas da feature 079 — editar proposta antes da assinatura"
---

# Tasks: Editar Proposta Antes da Assinatura

**Input**: Design documents from `/specs/079-proposta-editar-antes-assinatura/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec, então não há fase TDD. A validação é feita pelo [quickstart.md](./quickstart.md) (interface + `curl`) e por `npm run lint`, `npm run type-check` e `npm run build` no `frontend/`.

**Organization**: Dados e serialização compartilhados (Foundational) → US1 editar proposta pendente mantendo o link (MVP) → US2 travas e integridade da assinatura → US3 reativar proposta expirada → Polish/deploy.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/` (`main.py`, `models/__init__.py`, `schemas.py`, `services/propostas.py`, `api/routes/`)
- Frontend Proposal: `frontend/src/proposal/` (não importa nada de `frontend/src/pages/`, `components/Layout.tsx`, `store/` nem `services/api.ts` do ERP)
- Contratos: `specs/079-proposta-editar-antes-assinatura/contracts/`
- **Não alterar**: portas (8001/5433/6380/5193); formato do conteúdo canônico do hash (`conteudo_canonico` em `services/propostas.py`, research R7); arquivos do ERP (`frontend/src/pages/`, `services/api.ts`, `backend/app/services/audit.py`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Nenhuma tarefa. A feature não adiciona dependências, arquivos de configuração nem pontos de entrada; reaproveita toda a infraestrutura do Proposal criada na feature 077.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Colunas novas, tabela de histórico, validação compartilhada e serialização dos campos novos, de que todas as histórias dependem.

**⚠️ CRITICAL**: Nenhuma história começa antes desta fase.

- [X] T001 [P] Em `backend/app/main.py`, dentro de `_migrar()`, adicionar o bloco "Proposal (feature 079)" logo após o bloco da feature 077, no mesmo padrão `with engine.connect() as conn: try/commit/except rollback`: `ALTER TABLE propostas ADD COLUMN IF NOT EXISTS versao INTEGER NOT NULL DEFAULT 1`, `... atualizada_em TIMESTAMP`, `... versao_visualizada_em TIMESTAMP`; backfill idempotente `UPDATE propostas SET versao_visualizada_em = visualizada_em WHERE versao_visualizada_em IS NULL AND visualizada_em IS NOT NULL AND versao = 1 AND atualizada_em IS NULL`; `CREATE TABLE IF NOT EXISTS propostas_edicoes (id SERIAL PRIMARY KEY, proposta_id INTEGER NOT NULL REFERENCES propostas(id) ON DELETE CASCADE, versao INTEGER NOT NULL, editada_em TIMESTAMP NOT NULL DEFAULT NOW(), editado_por_id INTEGER REFERENCES usuarios_app(id) ON DELETE SET NULL, editado_por_usuario VARCHAR(255) NOT NULL, alteracoes JSONB NOT NULL, CONSTRAINT uq_propostas_edicoes_versao UNIQUE (proposta_id, versao), CONSTRAINT ck_propostas_edicoes_alteracoes CHECK (jsonb_typeof(alteracoes) = 'array' AND jsonb_array_length(alteracoes) > 0))` ([data-model.md](./data-model.md) §4)
- [X] T002 [P] Em `backend/app/models/__init__.py`: em `Proposta`, trocar a docstring ("editável até a assinatura; status e datas de acompanhamento mudam") e adicionar `versao = Column(Integer, nullable=False, default=1, server_default=text("1"))`, `atualizada_em = Column(DateTime, nullable=True)`, `versao_visualizada_em = Column(DateTime, nullable=True)` e `edicoes = relationship("PropostaEdicao", back_populates="proposta", order_by="desc(PropostaEdicao.versao)", passive_deletes=True)`; criar a classe `PropostaEdicao` (`__tablename__ = "propostas_edicoes"`, colunas e `UniqueConstraint("proposta_id", "versao", name="uq_propostas_edicoes_versao")` de [data-model.md](./data-model.md) §2, `alteracoes = Column(JSONB, nullable=False)` com `from sqlalchemy.dialects.postgresql import JSONB`, `proposta = relationship("Proposta", back_populates="edicoes")`)
- [X] T003 [P] Em `backend/app/schemas.py`, adicionar `versao: Optional[int] = None` a `PropostaAssinar` (o `PUT` reutiliza `PropostaCreate`, sem schema novo)
- [X] T004 Em `backend/app/services/propostas.py`, extrair de `validar_criacao` a função `validar_dados(payload, validade_padrao: date) -> dict` (mesmas regras e retorno; `validade = payload.validade or validade_padrao`), trocar a mensagem de validade para `"Validade deve ser posterior a hoje"` e manter `validar_criacao(payload)` como `return validar_dados(payload, validade_padrao())` (research R8)
- [X] T005 Em `backend/app/services/propostas.py`, estender `serializar_detalhe(p)` com `versao`, `atualizada_em` (`_iso`), `versao_visualizada_em` (`_iso`) e `edicoes` (lista de `{versao, editada_em, editado_por_usuario, alteracoes}`, da maior para a menor versão, `[]` se não houver) e `serializar_publica(p)` com `versao` e `atualizada_em` apenas nos estados `aguardando`/`visualizada`/`assinada` (cancelada/expirada continuam só com `status`, `pode_assinar`, `mensagem`) ([contracts/api-proposal.md](./contracts/api-proposal.md), [contracts/api-public.md](./contracts/api-public.md))
- [X] T006 Em `backend/app/api/routes/proposal_propostas.py`, incluir `joinedload(Proposta.edicoes)` em `_obter_visivel` e, em `criar_proposta`, passar `versao=1` explicitamente ao construir `Proposta` (a resposta já sai com `versao`, `atualizada_em: null`, `versao_visualizada_em: null`, `edicoes: []`)
- [X] T007 [P] Em `frontend/src/proposal/services/proposalApi.ts`, adicionar os tipos `AlteracaoCampo { campo: string; anterior: string | boolean | null; novo: string | boolean | null }` e `PropostaEdicao { versao: number; editada_em: string; editado_por_usuario: string; alteracoes: AlteracaoCampo[] }`; em `Proposta`, os campos `versao: number`, `atualizada_em: string | null`, `versao_visualizada_em: string | null`, `edicoes: PropostaEdicao[]`; em `PropostaPublicaData`, `versao?: number` e `atualizada_em?: string | null`
- [X] T008 [P] Em `frontend/src/proposal/pages/Nova.tsx`, trocar a mensagem local de validade para `'Validade deve ser posterior a hoje'` (igual ao backend após T004)

**Checkpoint**: Backend sobe sem erro, a migração roda duas vezes sem efeito colateral (quickstart §1), criar/listar/detalhar/assinar propostas continua funcionando como na 077.

---

## Phase 3: User Story 1 - Corrigir uma proposta pendente sem trocar o link (Priority: P1) 🎯 MVP

**Goal**: O usuário edita uma proposta **Aguardando assinatura** ou **Visualizada** no mesmo formulário da criação; o mesmo link mostra os dados novos com "Atualizada em"; o status volta para **Aguardando assinatura**; o histórico registra cada edição.

**Independent Test**: Quickstart §2 e §3: criar proposta, abrir o link em janela anônima, editar valor e CNPJ, recarregar a página do cliente (mesmo link, dados novos, "Atualizada em") e conferir status, visualizações e histórico no detalhe.

### Backend

- [X] T009 [US1] Em `backend/app/services/propostas.py`, criar `CAMPOS_EDITAVEIS = ("cliente_nome", "cnpj", "valor", "imposto_ativo", "aliquota", "valor_imposto", "total", "validade")` e `diff_campos(p: Proposta, dados: dict) -> list[dict]`, que compara os valores atuais com os normalizados por `validar_dados` na forma canônica (decimais via `_dec_str`, datas `isoformat()`, booleanos, CNPJ sem máscara, `aliquota` `None` sem imposto) e devolve `[{"campo", "anterior", "novo"}]` só dos campos alterados, na ordem de `CAMPOS_EDITAVEIS` ([data-model.md](./data-model.md) §2)
- [X] T010 [US1] Em `backend/app/api/routes/proposal_propostas.py`, criar `PUT /{proposta_id}` (`payload: PropostaCreate`, `get_proposal_user`): carregar com `.with_for_update()` + regra `pode_ver` (404 `MSG_NAO_ENCONTRADA`); se `status_efetivo` for `assinada` → 409 `"Proposta já assinada"`, `cancelada` → 409 `"Proposta cancelada não pode ser editada"`; `dados = validar_dados(payload, p.validade)`; `alteracoes = diff_campos(p, dados)`; se vazio → `db.rollback()` e devolver `{**serializar_detalhe(p), "alterada": False}`; senão aplicar `dados` em `p`, `p.versao += 1`, `p.atualizada_em = agora`, `p.status = "aguardando"`, `p.versao_visualizada_em = None`, `p.conteudo_hash = calcular_hash(p)`, `db.add(PropostaEdicao(proposta_id=p.id, versao=p.versao, editada_em=agora, editado_por_id=user["id"], editado_por_usuario=user["usuario"], alteracoes=alteracoes))`, `commit` e devolver `{**serializar_detalhe(_obter_visivel(...)), "alterada": True}` (research R2, R3, R5; [contracts/api-proposal.md](./contracts/api-proposal.md))
- [X] T011 [P] [US1] Em `backend/app/api/routes/proposal_auth.py`, criar `oauth2_proposal_opcional = OAuth2PasswordBearer(tokenUrl="/api/proposal/auth/token", auto_error=False)` e `get_proposal_user_opcional(token, db) -> Optional[dict]`, que reaproveita a lógica de `get_proposal_user` mas devolve `None` (sem levantar erro) para token ausente, inválido, expirado, de outro app ou de usuário sem acesso (research R4)
- [X] T012 [US1] Em `backend/app/api/routes/public_propostas.py`, alterar `consultar_proposta`: receber `user = Depends(get_proposal_user_opcional)`; se `user` e `pode_ver(p, user)` → não registrar visualização; caso contrário, se `status_efetivo(p) == "aguardando"` e `p.versao_visualizada_em is None`, `UPDATE ... WHERE id = :id AND status = 'aguardando' AND versao_visualizada_em IS NULL` com `status = 'visualizada'`, `versao_visualizada_em = agora`, `visualizada_em = func.coalesce(Proposta.visualizada_em, agora)` ([contracts/api-public.md](./contracts/api-public.md))

### Frontend

- [X] T013 [P] [US1] Em `frontend/src/proposal/services/proposalApi.ts`, criar `editarProposta(id, payload: PropostaPayload): Promise<Proposta & { alterada: boolean }>` (`PUT /proposal/propostas/{id}`) e fazer `consultarPublica` enviar `Authorization: Bearer <localStorage[TOKEN_KEY]>` quando houver token, usando `publicHttp` (sem o interceptor que redireciona para `/login`)
- [X] T014 [US1] Criar `frontend/src/proposal/components/PropostaForm.tsx` extraindo de `pages/Nova.tsx` o tipo `Form`, `decimalParaBR`, `Erro`, `validar`, os cálculos em centavos e o JSX do formulário + resumo lateral; props: `inicial: Form`, `rotuloSalvar`, `rotuloSalvando`, `salvando`, `onSubmit(payload: PropostaPayload)`, `acaoSecundaria: ReactNode` e `aviso?: ReactNode` (exibido acima do formulário); exportar `formDeProposta(p: Proposta, validade?: string): Form` para pré-preencher (contrato [ui-proposal.md](./contracts/ui-proposal.md))
- [X] T015 [US1] Refatorar `frontend/src/proposal/pages/Nova.tsx` para usar `PropostaForm` (botão "Gerar proposta"/"Gerando...", ação secundária "Voltar para a lista", "Criar cópia" via `formDeProposta(p, validadePadrao())`), mantendo a tela "Proposta criada" e o comportamento atual (depende de T014)
- [X] T016 [US1] Criar `frontend/src/proposal/pages/Editar.tsx`: carrega `obterProposta(id)` com spinner; 404 → "Proposta não encontrada" + link para a lista; status `assinada`/`cancelada` → "Esta proposta não pode mais ser editada" + link para o detalhe; senão título "Editar proposta", aviso "O cliente verá as alterações no mesmo link. Se ele já tiver visualizado, a proposta volta para Aguardando assinatura.", `PropostaForm` com `formDeProposta(p, p.validade)`, botão "Salvar alterações"/"Salvando...", ação secundária "Cancelar" (link para `/propostas/:id`); no envio: `alterada` → toast "Proposta atualizada", senão toast "Nenhuma alteração para salvar", e navega para o detalhe; `409` → toast com `mensagemErro` e navega para o detalhe; `422` → toast e mantém o formulário (depende de T013, T014)
- [X] T017 [US1] Em `frontend/src/proposal/App.tsx`, adicionar `<Route path="/propostas/:id/editar" element={<ProtectedRoute><Editar /></ProtectedRoute>} />`
- [X] T018 [US1] Em `frontend/src/proposal/pages/Detalhe.tsx`: link **Editar** (`/propostas/:id/editar`, mesmo estilo `botao`) visível para `aguardando`, `visualizada` e `expirada`; renomear o campo para "1ª visualização do link"; campo "Visualização da versão atual" quando `versao > 1` (`versao_visualizada_em` ou "Ainda não visualizada"); campo "Última edição" quando `atualizada_em` existir (data/hora + `edicoes[0].editado_por_usuario`); seção "Histórico de edições" (entre os dados e a assinatura, só com `edicoes.length > 0`), um bloco por edição "dd/mm/aaaa hh:mm · usuário" com linhas "Rótulo: anterior → novo" formatadas pela tabela de [ui-proposal.md](./contracts/ui-proposal.md) (Cliente, CNPJ com `formatarCNPJ`, Valor/Valor do imposto/Total com `formatarMoeda`, Imposto Sim/Não, Alíquota com `formatarAliquota` ou "—", Validade com `formatarData`)
- [X] T019 [P] [US1] Em `frontend/src/proposal/pages/PropostaPublica.tsx`, exibir "Atualizada em {formatarData(dados.atualizada_em)}" abaixo da data de emissão quando `dados.atualizada_em` existir

### Validação

- [X] T020 [US1] Validar as seções 1, 2 e 3 do [quickstart.md](./quickstart.md) (migração idempotente; edição com mesmo link, recálculo, bloqueios de validação, cancelar sem salvar, status volta para Aguardando, visualização da versão atual, histórico, edição sem mudança; "Abrir página do cliente" não marca visualização)

**Checkpoint**: MVP entregue — propostas pendentes podem ser corrigidas sem reenviar o link.

---

## Phase 4: User Story 2 - Impedir edição depois da assinatura e garantir o que foi assinado (Priority: P1)

**Goal**: Propostas assinadas ou canceladas não mudam por nenhum caminho, e uma assinatura só é aceita se o cliente estiver vendo a versão vigente.

**Independent Test**: Quickstart §4, §5 e §6: tentar editar assinada/cancelada (interface e `curl` → 409), assinar a partir de uma página aberta antes da edição (→ "proposta atualizada", recarrega e assina a versão nova) e a corrida edição × assinatura (→ edição recusada).

- [X] T021 [US2] Em `backend/app/api/routes/public_propostas.py`, alterar `assinar_proposta`: após a checagem de status pendente, se `payload.versao != p.versao` → 409 `"Esta proposta foi atualizada. Revise os dados e assine novamente."`; incluir `Proposta.versao == payload.versao` no filtro do `UPDATE` condicional; se `rowcount == 0`, recarregar e, se a proposta ainda estiver pendente com versão diferente, devolver a mesma mensagem de versão, senão `_recusar` como hoje ([contracts/api-public.md](./contracts/api-public.md), research R1)
- [X] T022 [P] [US2] Em `frontend/src/proposal/services/proposalApi.ts`, incluir `versao: number | undefined` no payload de `assinarPublica`
- [X] T023 [US2] Em `frontend/src/proposal/pages/PropostaPublica.tsx`, enviar `versao: dados.versao` em `assinarPublica` e garantir que, no `409`, o recarregamento mantém `nome` e `email` preenchidos (não limpar esses estados) para o cliente revisar e assinar de novo (depende de T022)
- [X] T024 [US2] Validar as seções 4, 5 e 6 do [quickstart.md](./quickstart.md) (409 em assinada/cancelada por `curl`, 404 em proposta alheia, assinatura com versão antiga ou sem versão → 409, corrida edição × assinatura, impressão digital da assinatura igual aos dados da versão assinada)

**Checkpoint**: SC-003 e SC-004 atendidos; as duas histórias P1 completas.

---

## Phase 5: User Story 3 - Reativar uma proposta expirada ajustando a validade (Priority: P2)

**Goal**: Uma proposta **Expirada** (nunca assinada nem cancelada) pode ser editada; com validade futura, volta a **Aguardando assinatura** no mesmo link.

**Independent Test**: Quickstart §7: forçar a expiração no banco de dev, tentar salvar com a validade vencida (bloqueado) e salvar com validade futura (link volta a aceitar assinatura).

- [X] T025 [US3] Em `frontend/src/proposal/pages/Editar.tsx`, quando `proposta.status === 'expirada'`, exibir no `aviso` do `PropostaForm` a mensagem adicional "Esta proposta está expirada. Defina uma nova validade para que o cliente possa assinar." e manter a validade atual (vencida) no campo, para o usuário ajustar
- [X] T026 [US3] Conferir em `backend/app/api/routes/proposal_propostas.py` que o `PUT` aceita status efetivo `expirada` (só `assinada`/`cancelada` são recusadas) e que a validade vencida mantida é recusada com `"Validade deve ser posterior a hoje"`; validar a seção 7 do [quickstart.md](./quickstart.md)

**Checkpoint**: Todas as histórias funcionando de forma independente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade estática, regressão da 077, isolamento e deploy.

- [X] T027 [P] Rodar `npm run lint`, `npm run type-check` e `npm run build` em `frontend/` e corrigir o que aparecer nos arquivos de `frontend/src/proposal/`
- [X] T028 [P] Confirmar com `git diff --stat` que nenhum arquivo do ERP foi alterado (`frontend/src/pages/`, `frontend/src/services/api.ts`, `frontend/src/components/Layout.tsx`, `backend/app/services/audit.py`) e que `frontend/src/proposal/` continua sem imports do ERP
- [X] T029 Validar a seção 8 do [quickstart.md](./quickstart.md) (regressão: criar, criar cópia, cancelar, filtros, visão `admin`, assinatura de proposta nunca editada, página pública de cancelada/expirada sem "Atualizada em")
- [ ] T030 Deploy: após o primeiro boot do backend com a migração em produção (Render), rodar `backend/scripts/enable_rls_supabase.sql` no SQL Editor do Supabase para habilitar RLS em `propostas_edicoes`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem tarefas.
- **Foundational (Phase 2)**: bloqueia todas as histórias. T001 e T002 antes de T005/T006; T004 antes de T010 (US1).
- **US1 (Phase 3)**: depende da Phase 2.
- **US2 (Phase 4)**: depende da Phase 2. A trava de assinatura (T021–T023) é independente da edição; só a validação T024 precisa do `PUT` de US1 (T010) e da tela `Editar` (T016) para reproduzir os cenários.
- **US3 (Phase 5)**: depende de US1 (T010, T016).
- **Polish (Phase 6)**: depende das histórias desejadas.

### User Story Dependencies

- **US1 (P1)**: após Foundational; não depende de outras histórias.
- **US2 (P1)**: após Foundational; implementação independente, validação ponta a ponta usa a edição de US1.
- **US3 (P2)**: estende a tela `Editar` e o `PUT` de US1.

### Within Each User Story

- Serviço (`services/propostas.py`) antes do router; router antes da validação.
- `PropostaForm` (T014) antes de `Nova.tsx` (T015) e `Editar.tsx` (T016).
- `proposalApi.ts` antes das páginas que usam as funções novas.

### Parallel Opportunities

- Phase 2: T001, T002, T003, T007 e T008 em paralelo (arquivos distintos); T004 → T005 → T006 em sequência.
- US1: T011 (auth), T013 (API do frontend) e T019 (página pública) em paralelo com T009/T010; T014 em paralelo com o backend.
- US2: T021 (backend) e T022 (API do frontend) em paralelo.
- Polish: T027 e T028 em paralelo.

---

## Parallel Example: User Story 1

```bash
# Backend e frontend da US1 em frentes separadas:
Task: "T009/T010 diff_campos + PUT /{proposta_id} em backend/app/services/propostas.py e backend/app/api/routes/proposal_propostas.py"
Task: "T011 get_proposal_user_opcional em backend/app/api/routes/proposal_auth.py"
Task: "T013 editarProposta + token opcional em frontend/src/proposal/services/proposalApi.ts"
Task: "T014 PropostaForm em frontend/src/proposal/components/PropostaForm.tsx"
Task: "T019 'Atualizada em' em frontend/src/proposal/pages/PropostaPublica.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "T021 assinatura com versão em backend/app/api/routes/public_propostas.py"
Task: "T022 versao em assinarPublica em frontend/src/proposal/services/proposalApi.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 2: Foundational (migração, modelos, validação compartilhada, serialização).
2. Phase 3: US1 completa.
3. **PARAR e VALIDAR**: quickstart §1–§3.
4. Recomendado entregar junto com US2 (também P1): sem a trava de versão, um cliente com a página aberta antes da edição ainda conseguiria assinar a versão antiga.

### Incremental Delivery

1. Foundational → base pronta (nada visível muda para o usuário).
2. US1 + US2 → edição segura em produção (as duas P1).
3. US3 → reativação de expiradas.
4. Polish → lint/build, regressão, RLS.

---

## Notes

- [P] = arquivos diferentes, sem dependência incompleta.
- `public_propostas.py` é alterado em T012 (US1) e T021 (US2): não rodar os dois em paralelo.
- `proposalApi.ts` é alterado em T007, T013 e T022, e `PropostaPublica.tsx` em T019 e T023: fazer em sequência.
- Commit após cada tarefa ou grupo lógico; parar em cada checkpoint para validar a história.
