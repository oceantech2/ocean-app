# Quickstart: validar o baseline Ocean App

**Feature**: `001-ocean-app-baseline` | **Date**: 2026-07-26  
Guia para **subir e conferir** o produto as-is. Detalhes de modelo: [data-model.md](./data-model.md). Contratos: [contracts/rest-api.md](./contracts/rest-api.md).

## Pré-requisitos

- Docker Desktop (ou Engine) + Docker Compose
- Node.js 18+ (para frontend em modo dev)
- Portas livres: **8001**, **5433**, **6380**, **5193** (e **3000** se usar frontend do Compose)

## 1. Subir infraestrutura e API

Na raiz do repositório:

```bash
docker compose up -d
```

Conferir:

```bash
docker compose ps
curl -s http://localhost:8001/health
```

Esperado: containers `ocean_postgres`, `ocean_redis`, `ocean_backend` healthy/up; health da API OK.

Docs interativas: http://localhost:8001/docs

## 2. Frontend em desenvolvimento

```bash
cd frontend
# garantir VITE_API_URL=http://localhost:8001/api (ex.: .env.local)
npm install
npm run dev
```

Abrir: http://localhost:5193

Alternativa (build nginx do Compose): http://localhost:3000

## 3. Login de validação

| Usuário | Senha | Papel |
|---------|-------|-------|
| `admin` | `123456` | admin (tudo) |
| `visualizador` | `123456` | visualizador (menus conforme seed) |

Cenários mínimos (alinhados ao `spec.md`):

1. **Auth** — login admin → dashboard; logout; login visualizador → menus limitados.
2. **NFs** — listar/filtrar mês; admin cria ou edita NF; marcar paga; ver resumo.
3. **Contas** — criar conta com centro; marcar paga; (opcional) anexar comprovante.
4. **Dashboard** — ver KPIs/metas do ano com dados de NFs pagas.
5. **Bônus / Colaboradores / Férias** — smoke de listagem e um CRUD simples como admin.
6. **Auditoria** — após uma edição, registro aparece em `/auditoria` (admin).

## 4. Checagens rápidas de API

```bash
# Token (form-urlencoded)
curl -s -X POST http://localhost:8001/api/auth/token \
  -d "username=admin&password=123456"

# Com Bearer TOKEN:
curl -s http://localhost:8001/api/auth/me -H "Authorization: Bearer TOKEN"
curl -s "http://localhost:8001/api/nfs/?mes=7&ano=2026" -H "Authorization: Bearer TOKEN"
```

## 5. Encerrar

```bash
docker compose down
```

(Volumes Postgres/Redis/uploads persistem salvo `down -v`.)

## Resultado esperado deste baseline

- Spec + plan + data-model + contracts descrevem o sistema **como está**.
- Quickstart acima executa sem alterar código.
- Próximo passo só se for **mudar** o produto: nova feature com `/speckit-specify` ou `/speckit-tasks` se quiser checklist de trabalho sobre este inventário.

## Registro de execução (2026-07-26)

| Passo | Resultado |
|-------|-----------|
| Artefatos docs presentes | PASS |
| Alinhamento código ↔ contracts/data-model (auditoria estática) | PASS |
| `docker compose ps` / `GET :8001/health` | **FAIL / SKIP** — nenhum container up neste ambiente; reexecutar após `docker compose up -d` |
| Login smoke UI | **SKIP** — depende da API |

Para revalidar ao vivo:

```bash
docker compose up -d
curl -s http://localhost:8001/health
cd frontend && npm run dev
# login admin / 123456 em http://localhost:5193
```

