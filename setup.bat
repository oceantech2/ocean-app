@echo off
chcp 65001 >nul
cls

echo.
echo ============================================
echo   Ocean App - Setup Windows
echo ============================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python não encontrado. Instale Python 3.11+
    echo https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check Node/npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js não encontrado. Instale Node.js LTS
    echo https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Python encontrado
echo [OK] Node.js encontrado
echo.

REM Backend Setup
echo ============================================
echo   Configurando Backend...
echo ============================================
cd backend

echo Criando ambiente virtual...
python -m venv venv
if errorlevel 1 (
    echo [ERRO] Falha ao criar venv
    pause
    exit /b 1
)

echo Ativando venv...
call venv\Scripts\activate.bat

echo Instalando dependências...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependências Python
    pause
    exit /b 1
)

echo Criando .env...
if not exist .env (
    copy .env.example .env
    echo [OK] .env criado - Edite conforme necessário
)

cd ..
echo.

REM Frontend Setup
echo ============================================
echo   Configurando Frontend...
echo ============================================
cd frontend

echo Instalando dependências npm...
npm install
if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependências Node
    pause
    exit /b 1
)

cd ..
echo.

echo ============================================
echo   ✓ Setup Completo!
echo ============================================
echo.
echo Para rodar a aplicação:
echo.
echo 1. Backend (Terminal 1):
echo    cd backend
echo    venv\Scripts\activate
echo    uvicorn app.main:app --reload
echo.
echo 2. Frontend (Terminal 2):
echo    cd frontend
echo    npm run dev
echo.
echo Acesse: http://localhost:5173
echo Senha: 123456
echo.
pause
