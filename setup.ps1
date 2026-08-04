# Ocean App - Setup PowerShell (Windows)
# Execute: powershell -ExecutionPolicy Bypass -File setup.ps1

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Ocean App - Setup Windows" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
try {
    python --version | Out-Null
    Write-Host "[OK] Python encontrado" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Python não encontrado" -ForegroundColor Red
    Write-Host "Instale em: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Check Node.js
try {
    npm --version | Out-Null
    Write-Host "[OK] Node.js encontrado" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Node.js não encontrado" -ForegroundColor Red
    Write-Host "Instale em: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Configurando Backend..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Set-Location backend

Write-Host "Criando ambiente virtual..." -ForegroundColor Yellow
python -m venv venv
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Falha ao criar venv" -ForegroundColor Red
    exit 1
}

Write-Host "Ativando venv..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

Write-Host "Instalando dependências..." -ForegroundColor Yellow
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Falha ao instalar dependências Python" -ForegroundColor Red
    exit 1
}

Write-Host "Criando .env..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "[OK] .env criado - Edite conforme necessário" -ForegroundColor Green
}

Set-Location ..
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Configurando Frontend..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Set-Location frontend

Write-Host "Instalando dependências npm..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Falha ao instalar dependências Node" -ForegroundColor Red
    exit 1
}

Set-Location ..
Write-Host ""

Write-Host "============================================" -ForegroundColor Green
Write-Host "  ✓ Setup Completo!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para rodar a aplicação:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Backend (Terminal 1):" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "   uvicorn app.main:app --reload" -ForegroundColor White
Write-Host ""
Write-Host "2. Frontend (Terminal 2):" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Acesse: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Senha: 123456" -ForegroundColor Cyan
Write-Host ""
