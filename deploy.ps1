# Script para deploy no Vercel
Write-Host "Iniciando deploy no Vercel..." -ForegroundColor Green

# Verificar se o Vercel CLI está instalado
$vercelInstalled = $null
try {
    $vercelInstalled = Get-Command npx -ErrorAction Stop
} catch {
    $vercelInstalled = $false
}

if (-not $vercelInstalled) {
    Write-Host "Instalando Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Fazer o deploy
Write-Host "Fazendo deploy no Vercel..." -ForegroundColor Green
vercel --prod

Write-Host "Deploy concluído! Verifique a URL acima." -ForegroundColor Green
