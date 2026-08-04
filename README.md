# Ocean App - Sistema de Gestão Financeira

App completo para gestão de NFs, colaboradores, bônus, férias e relatórios financeiros. Pronto para rodar em Mac, Windows e VPS gratuito.

## 📋 Estrutura do Projeto

```
ocean-app/
├── backend/              # FastAPI + Python
│   ├── app/
│   │   ├── api/routes/   # Endpoints (auth, colaboradores, nfs, etc)
│   │   ├── models/       # SQLAlchemy models
│   │   ├── main.py       # FastAPI app
│   │   ├── config.py     # Configurações
│   │   └── database.py   # Conexão BD
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/             # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Páginas (Dashboard, etc)
│   │   ├── services/     # API client
│   │   ├── store/        # Zustand state
│   │   ├── types/        # TypeScript types
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── docker-compose.yml    # PostgreSQL + Redis
```

## 🚀 Quick Start

### 1. Clonar/Preparar o Projeto
```bash
cd /home/claude/ocean-app

# Backend
cd backend
cp .env.example .env
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 2. Rodar Localmente com Docker (Recomendado)
```bash
# Na raiz do projeto
docker-compose up -d

# Backend roda em http://localhost:8000
# Frontend roda em http://localhost:5173
# Documentação API em http://localhost:8000/docs
```

### 3. Ou Rodar Sem Docker

**Backend:**
```bash
cd backend
# Criar arquivo .env com:
# DATABASE_URL=postgresql://user:password@localhost:5432/ocean_db
# SECRET_KEY=dev-secret-key

uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Abre em http://localhost:5173
```

## 🔑 Credenciais de Teste

- **Usuário:** qualquer nome
- **Senha:** `123456`

## 📝 Usar com Claude Code

### 1. Implementar Páginas Faltantes

Claude pode completar as páginas que estão como placeholder:
```
Pages para implementar:
- /nfs (Crud de NFs com filtros, status visual)
- /colaboradores (Gestão de colaboradores)
- /contas (Contas a pagar por centro de custo)
- /bonus (Cálculo e gestão de bônus)
- /ferias (Controle de férias por colaborador)
- /dh (Formulário + listagem com email automático)
- /relatorios (Gráficos avançados)
```

### 2. Adicionar Funcionalidades Backend

Exemplos de rotas/funcionalidades para completar:

**Email Service:**
- Enviar DH por email para financeiro e CEO
- Notificações de vencimento de NFs

**Exportação:**
- Gerar relatórios em PDF
- Export de dados para Excel

**Autenticação Real:**
- Sistema de usuários com roles (admin, financeiro, CEO, colaborador)
- Reset de senha

**Validações:**
- Validar CPF/CNPJ
- Calcular bônus automático baseado em percentuais

### 3. Instalar Localmente

**Copiar estrutura para seu PC:**
```bash
# Windows/Mac
cd C:\dev  # ou seu diretório preferido

# Clonar ou copiar os arquivos
git clone <seu-repo>  # ou copiar arquivos

cd ocean-app

# Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

## 📦 Deploy em VPS Gratuito (Railway.app)

### 1. Preparar Projeto para Deploy

```bash
# Backend - criar .env de produção
RAILWAY_ENVIRONMENT_ID=$(railway env)

# Frontend - build
npm run build
```

### 2. Deploy no Railway

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway up

# Deploy frontend (opcional, pode usar Vercel)
cd ../frontend
railway up
```

### 3. Configurar Banco de Dados

No Railway dashboard:
- Criar PostgreSQL plugin
- Copiar DATABASE_URL
- Adicionar às variáveis de ambiente

## 🛠️ Próximas Tarefas com Claude Code

```
Priority 1 (Essencial):
□ Implementar pages completas (/nfs, /colaboradores, etc)
□ CRUD operacional em todas as páginas
□ Validações de entrada
□ Tratamento de erros

Priority 2 (Melhorias):
□ Relatórios mais detalhados
□ Export PDF/Excel
□ Filtros avançados
□ Busca/paginação

Priority 3 (Produção):
□ Sistema de login real (banco de usuários)
□ Email service para notificações
□ Auditoria/logs
□ Cache com Redis
```

## 🔧 Variáveis de Ambiente

### Backend (.env)
```
DEBUG=True
DATABASE_URL=postgresql://user:pass@localhost:5432/ocean_db
SECRET_KEY=sua-chave-secreta
SMTP_SERVER=smtp.gmail.com
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000/api
```

## 📚 APIs Principais

Todas retornam JSON. Token JWT necessário (exceto `/auth/token`).

```
Auth:
POST   /api/auth/token              # Login
GET    /api/auth/me                 # Current user

Colaboradores:
GET    /api/colaboradores            # Listar
POST   /api/colaboradores            # Criar
GET    /api/colaboradores/{id}       # Obter
PUT    /api/colaboradores/{id}       # Atualizar
DELETE /api/colaboradores/{id}       # Deletar

NFs:
GET    /api/nfs                      # Listar com filtros
POST   /api/nfs                      # Criar
GET    /api/nfs/resumo/total        # Resumo

Relatórios:
GET    /api/relatorios/faturamento-liquido-mes
GET    /api/relatorios/fechamentos-por-tipo
GET    /api/relatorios/bonus-mensal
... (mais em /docs)
```

## 🎨 Design

- **UI:** Tailwind CSS
- **Gráficos:** Recharts
- **Notificações:** React Hot Toast
- **State Management:** Zustand

## ❓ Troubleshooting

**Erro de conexão ao banco:**
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps

# Ver logs
docker-compose logs postgres
```

**CORS error no frontend:**
```bash
# Backend já tem CORS configurado
# Verificar se está rodando em http://localhost:8000
```

**Token expirado:**
```
- Logout e faça login novamente
- Token padrão: 30 minutos
```

## 📞 Suporte

Abra uma issue ou contate via email.

---

**Pronto para produção!** Estrutura escalável, bem organizada e fácil de expandir com Claude Code.
