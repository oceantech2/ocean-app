# Ocean App — Rebuild e restart de todos os servicos
# Uso: ./update.ps1
# Uso so backend: ./update.ps1 -Servico backend
# Uso so frontend: ./update.ps1 -Servico frontend

param(
    [string]$Servico = "all"
)

Write-Host "`n=== Ocean App Update ===" -ForegroundColor Cyan

if ($Servico -eq "backend" -or $Servico -eq "all") {
    Write-Host "`n[1/2] Rebuilding backend..." -ForegroundColor Yellow
    docker compose up -d --build backend
    if ($LASTEXITCODE -ne 0) { Write-Host "ERRO no backend!" -ForegroundColor Red; exit 1 }
    Write-Host "Backend OK" -ForegroundColor Green
}

if ($Servico -eq "frontend" -or $Servico -eq "all") {
    Write-Host "`n[2/2] Rebuilding frontend..." -ForegroundColor Yellow
    docker compose up -d --build frontend
    if ($LASTEXITCODE -ne 0) { Write-Host "ERRO no frontend!" -ForegroundColor Red; exit 1 }
    Write-Host "Frontend OK" -ForegroundColor Green
}

Write-Host "`n=== Status dos containers ===" -ForegroundColor Cyan
docker ps --filter name=ocean --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"

Write-Host "`nApp disponivel em: http://localhost:3000" -ForegroundColor Cyan
