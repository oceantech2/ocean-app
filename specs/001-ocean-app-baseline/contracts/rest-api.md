# Contract: REST API Ocean App (as-is)

**Base URL (dev)**: `http://localhost:8001`  
**API prefix**: `/api`  
**Auth**: `Authorization: Bearer <access_token>` após `POST /api/auth/token`  
**OpenAPI interativo**: `http://localhost:8001/docs` (gerado pelo FastAPI)

Fonte dos routers: `backend/app/api/routes/`.

## Saúde

| Método | Path | Auth | Notas |
|--------|------|------|-------|
| GET | `/` | não | |
| GET | `/health` | não | |

## Auth — `/api/auth`

| Método | Path | Auth | Notas |
|--------|------|------|-------|
| POST | `/token` | não | form `username`/`password` (+ `totp_code` se 2FA); OAuth2 password |
| GET | `/me` | sim | usuário atual + papel/permissões |
| GET | `/2fa/status` | sim | |
| POST | `/2fa/setup` | sim | inicia TOTP |
| POST | `/2fa/ativar` | sim | confirma código |
| POST | `/2fa/desativar` | sim | |

## Domínio financeiro / ops

| Prefixo | Operações principais |
|---------|----------------------|
| `/api/nfs` | CRUD, resumo, delete-all, import/export xlsx |
| `/api/contas` | CRUD, delete-all, import/export, comprovante upload/get/delete |
| `/api/bonus` | CRUD |
| `/api/ferias` | CRUD |
| `/api/dh` | CRUD + `PUT /{id}/marcar-enviado` |
| `/api/colaboradores` | CRUD, soft delete, delete permanente, import/export xlsx |
| `/api/historico/{colaborador_id}` | list/create; delete por `historico_id` |
| `/api/documentos` | list/upload/download/delete por colaborador |
| `/api/patrimonio` | CRUD |
| `/api/saldos` | CRUD |
| `/api/fluxo-movimentos` | list/create/delete |
| `/api/metas` | get, progresso, put |
| `/api/impostos` | `de-contas`, `faturamento-nfs`, CRUD entidade |
| `/api/relatorios` | faturamento-liquido-mes, fechamentos-por-tipo, faturamento-por-cliente, bonus-mensal, propostas-enviadas, contratos-assinados, placement-por-consultor, resumo-financeiro |
| `/api/alertas` | list + `POST /enviar` |
| `/api/auditoria` | list + `DELETE /` (limpar) |
| `/api/configuracoes` | CRUD usuários app |
| `/api/arquivos-nfs` | list/upload/download/delete (filesystem) |
| `/api/arquivos-comprovantes` | list/upload/download/delete (filesystem) |

## Contratos de UI (rotas SPA)

Base: `frontend/src/App.tsx` — todas autenticadas exceto `/login`.

| Rota | Módulo |
|------|--------|
| `/login` | Login |
| `/dashboard` | Dashboard |
| `/calendario` | Calendário |
| `/nfs` | NFs |
| `/contas` | Contas a pagar |
| `/fluxo-caixa` | Fluxo de caixa |
| `/impostos` | Impostos |
| `/retiradas` | Retiradas |
| `/bonus` | Bônus |
| `/dh` | DH |
| `/colaboradores` | Colaboradores |
| `/ferias` | Férias |
| `/patrimonio` | Patrimônio |
| `/relatorios` | Relatórios |
| `/auditoria` | Auditoria (admin) |
| `/seguranca` | Segurança / 2FA (admin UI) |
| `/configuracoes` | Usuários (admin) |

Cliente HTTP: `frontend/src/services/api.ts` (espelha estes prefixes).

## Notas de contrato

- Login **não** é JSON: `application/x-www-form-urlencoded`.
- Várias mutações exigem apenas usuário autenticado (não necessariamente `require_admin`); a UI esconde escrita para `visualizador`.
- Endpoints `propostas-enviadas` / `contratos-assinados` existem na API sem superfície equivalente no baseline de UI (ver `spec.md`).
