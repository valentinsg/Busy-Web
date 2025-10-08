# Script PowerShell para ejecutar migración de popovers
# Requiere Supabase CLI instalado: npm install -g supabase

Write-Host "🔄 Ejecutando migración de popovers..." -ForegroundColor Cyan

# Verificar si Supabase CLI está instalado
if (!(Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Supabase CLI no está instalado" -ForegroundColor Red
    Write-Host "Instala con: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Ejecutar migración
$sqlFile = Join-Path $PSScriptRoot "EJECUTAR_ESTE_SQL.sql"

if (!(Test-Path $sqlFile)) {
    Write-Host "❌ Error: No se encuentra el archivo SQL" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Ejecutando: $sqlFile" -ForegroundColor Yellow

# Ejecutar SQL en Supabase
supabase db execute --file $sqlFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migración ejecutada exitosamente" -ForegroundColor Green
    Write-Host "🔄 Recarga tu aplicación para ver los cambios" -ForegroundColor Cyan
} else {
    Write-Host "❌ Error al ejecutar la migración" -ForegroundColor Red
    Write-Host "Ejecuta manualmente en Supabase Dashboard > SQL Editor" -ForegroundColor Yellow
}
