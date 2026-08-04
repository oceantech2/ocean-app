# Research: Ocean App — Baseline as-is

**Feature**: `001-ocean-app-baseline` | **Date**: 2026-07-26

Objetivo: registrar decisões técnicas **já tomadas no código**, para specs futuras não reinventarem o contexto.

---

## 1. Arquitetura geral

**Decision**: Monólito web em dois processos — API FastAPI + SPA React, PostgreSQL como store principal, arquivos em disco.

**Rationale**: Já implementado e operacional; cobre CRUD financeiro/ops, relatórios e auth internos.

**Alternatives considered**: BFF separado, multi-serviço, object storage — fora do baseline (não existem no repo).

---

## 2. Autenticação e autorização

**Decision**: OAuth2 password flow (`POST /api/auth/token`) + JWT Bearer; papéis `admin` | `visualizador`; permissões de menu em JSON; 2FA TOTP opcional (`UsuarioAuth` + pyotp). UI de Segurança restringe setup 2FA a admin (própria conta).

**Rationale**: Padrão FastAPI OAuth2; atende uso interno com poucos usuários.

**Alternatives considered**: SSO corporativo, RBAC fino por endpoint — não presentes; endurecimento uniforme de `require_admin` em todas as escritas é lacuna conhecida (fora do baseline de mudança).

---

## 3. Persistência e schema

**Decision**: SQLAlchemy 2 + `Base.metadata.create_all` no startup, com `_migrar()` para ALTERs ad-hoc. Alembic está em `requirements.txt` mas **não há** `alembic.ini`/versions em uso.

**Rationale**: Evolução rápida do schema em projeto interno.

**Alternatives considered**: Migrações Alembic formais — recomendável em feature futura de hardening, não neste inventário.

---

## 4. Redis / Celery

**Decision**: Redis sobe no Compose (`6380`); Celery/redis em requirements — **código da app não importa Redis/Celery**.

**Rationale**: Infra preparada / legado; alertas usam loop asyncio + SMTP se `ALERT_EMAILS` configurado.

**Alternatives considered**: Remover Redis do Compose vs. passar a usá-lo — decisão futura, não do baseline documental.

---

## 5. Frontend e estado

**Decision**: Vite + React 18 + TS + Tailwind; Axios com interceptor JWT; Zustand (`useAuthStore`, filtros, UI, notificações); Recharts nos dashboards/relatórios; rotas lazy com `<Protected>`.

**Rationale**: Stack alinhada a SPA interna com gráficos e CRUD em modais.

**Alternatives considered**: Next.js, TanStack Query — não adotados.

---

## 6. Arquivos e importações

**Decision**: Três áreas de filesystem — `UPLOAD_DIR` (docs colaborador + comprovante por conta), `NFS_DIR` (`./NFs`), `COMPROVANTES_DIR` (`./Comprovantes`). Import/export XLSX via pandas/openpyxl em rotas específicas.

**Rationale**: Simples para volume interno; mounts no Compose.

**Alternatives considered**: S3/MinIO — não implementado.

---

## 7. Portas e ambiente local

**Decision**: Host ports fixas — API **8001**, Postgres **5433**, Redis **6380**, Vite **5193** (`strictPort`); frontend Compose em **3000**. `VITE_API_URL=http://localhost:8001/api`.

**Rationale**: Evitar conflito com outros projetos na máquina (ex.: 8000, 5173).

**Alternatives considered**: Portas padrão de framework — rejeitadas por política do projeto (`CLAUDE.md`).

---

## 8. Lacunas conhecidas (não resolvidas aqui)

| Lacuna | Nota |
|--------|------|
| E-mail real de DH | TODO em `backend/app/api/routes/dh.py`; UI só marca enviado |
| Alertas e-mail na UI | API `/api/alertas` + `alertasService` existem; **nenhuma página** consome o service |
| Relatórios propostas/contratos | Endpoints em `relatorios.py`; **ausentes** em `Relatorios.tsx` |
| Permissão menu Patrimônio | `Layout.tsx` usa `permKey: 'patrimonio'`; **ausente** de `MENUS` em `Configuracoes.tsx` |
| Testes automatizados | Dependências presentes; suíte vazia |
| `require_admin` inconsistente | Presente em patrimonio writes, configuracoes, parte de nfs/contas/colaboradores/historico/fluxo/auditoria; **CRUD simples de NF/conta/bônus/férias/DH** tipicamente só `get_current_user` |
| Redis/Celery | No Compose/requirements; **não usados** no código `backend/app` |
| Alembic | Em requirements; schema via `create_all` + `_migrar()` |

Estas itens ficam para specs futuras; o baseline apenas as registra.

---

## 9. Verificação as-is (`/speckit-implement` — 2026-07-26)

Auditoria código ↔ docs (tarefas T001–T050). Ambiente: Docker Compose **parado**; `GET /health` em `:8001` **indisponível** nesta sessão.

| Área | Resultado |
|------|-----------|
| Artefatos Speckit | OK — spec, plan, research, data-model, contracts, quickstart, tasks |
| Portas | OK — Compose 8001/5433/6380/3000; Vite 5193; CORS 5193/3000 |
| Routers `main.py` vs contrato | OK — 20 prefixes alinhados |
| Rotas SPA `App.tsx` vs contrato | OK — 16 páginas + login |
| Serviços `api.ts` | OK — cobre domínio; `alertasService` sem UI |
| Modelos vs data-model | OK — 16 entidades + enums conferidos |
| US1 Auth | OK — token/me/2FA; Segurança admin-only; seeds admin/visualizador |
| US2 NFs | OK — router + página presentes (CRUD/resumo/xlsx) |
| US3 Contas | OK — centros, comprovante, alertas API |
| US4 Dashboard/metas | OK — `metas.py` + `Dashboard.tsx` |
| US5 Fluxo | OK — saldos + fluxo-movimentos + `FluxoCaixa.tsx` |
| US6 Bônus | OK — router + página |
| US7 Colab/Férias/Patrimônio | OK — rotas/páginas; **lacuna permissão patrimônio confirmada** |
| US8 DH/Cal/Imp/Ret/Rel | OK — DH TODO e-mail; propostas/contratos só API |
| US9 Governança | OK — configuracoes/auditoria admin; Segurança admin UI |
| Ignore files | `.gitignore` reforçado; **`.dockerignore` criado** |
| Quickstart live | **SKIP/FAIL infra** — containers não estavam up |

**Conclusão**: Baseline documental válido como mapa do produto. Nenhuma divergência estrutural crítica docs↔código além das lacunas já previstas no spec.
