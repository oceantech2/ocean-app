# Ocean App — Instruções para Claude

## Sobre o projeto

Sistema de gestão financeira interno da **Auto Fernando**, chamado **Ocean App**.
Gerencia NFs, colaboradores, contas a pagar, bônus, férias, DH e relatórios financeiros.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| Gráficos | Recharts |
| Estado | Zustand (`useAuthStore`, `useFilterStore`) |
| HTTP | Axios com interceptor JWT |
| Backend | FastAPI + Python + SQLAlchemy |
| Banco | PostgreSQL 16 + Redis 7 |
| Container | Docker Compose |

## Portas — não alterar (conflito com outros projetos)

| Serviço | Porta host |
|---|---|
| Backend API | **8001** |
| PostgreSQL | **5433** |
| Redis | **6380** |
| Frontend dev | **5193** |

> `frontend/.env.local`: `VITE_API_URL=http://localhost:8001/api`  
> Porta 8000 → `certidoes_backend` | Porta 5173 → `dental-care`  
> Fixado em `vite.config.ts` (`strictPort: true`) e no CORS em `backend/app/config.py`.

## Comandos úteis

```bash
docker compose up -d          # subir infra
docker logs ocean_backend -f  # logs backend
cd frontend && npm run dev    # frontend dev (porta 5193)
```

## Estrutura do frontend

```
frontend/src/
├── components/   Layout.tsx, Login.tsx, ImportCSV.tsx, DocumentosModal.tsx
├── pages/        Dashboard.tsx (padrão), NFs, Colaboradores, Contas, Bonus,
│                 Ferias, DH, Relatorios, Calendario, Auditoria, Seguranca
├── services/     api.ts  — todos os serviços
├── store/        index.ts — Zustand
├── types/        index.ts
└── App.tsx       rotas com <Protected>
```

## Padrão de páginas — seguir Dashboard.tsx

1. Envolver com `<Layout>`
2. Dados via `useEffect` + serviço de `services/api.ts`
3. `react-hot-toast` para feedback
4. Loading com spinner (`animate-spin`)
5. Modal para CRUD; deletar com `window.confirm`

## Autenticação

- JWT em `localStorage` como `access_token`
- Interceptor Axios injeta `Authorization: Bearer <token>`
- Login: `application/x-www-form-urlencoded` (OAuth2), não JSON
- Usuário: `useAuthStore().usuario`
- Papéis: `admin` (acesso total) | `visualizador` (somente leitura)

## Serviços em `api.ts`

- `authService` — login, logout, me
- `colaboradoresService` — CRUD + soft delete (`ativo=false`)
- `nfsService` — CRUD + `resumo(mes, ano)`
- `contasService`, `bonusService`, `feriasService` — CRUD
- `dhService` — CRUD + `marcarEnviado(id, 'financeiro'|'ceo')`
- `relatoriosService` — múltiplos endpoints

## Credenciais de desenvolvimento

- `admin` / `123456` | `visualizador` / `123456`
- BD: `postgresql://ocean:ocean_dev_pass@localhost:5433/ocean_db`
