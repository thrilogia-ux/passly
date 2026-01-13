# Script para configurar Resend API Key
Write-Host "`n📧 Configuración de Resend API Key`n" -ForegroundColor Cyan

# Verificar si ya existe
$envContent = Get-Content .env -ErrorAction SilentlyContinue
$hasResend = $envContent | Select-String "RESEND_API_KEY"

if ($hasResend) {
    Write-Host "✅ RESEND_API_KEY ya existe en .env" -ForegroundColor Green
    $currentValue = ($hasResend -split "=")[1] -replace '"', ''
    if ($currentValue -and $currentValue.Trim() -ne "") {
        Write-Host "   Valor actual: $($currentValue.Substring(0, [Math]::Min(15, $currentValue.Length)))..." -ForegroundColor Yellow
        Write-Host "`n⚠️  Ya tienes una API key configurada.`n" -ForegroundColor Yellow
    } else {
        Write-Host "   ⚠️  Pero está vacía" -ForegroundColor Red
    }
} else {
    Write-Host "❌ RESEND_API_KEY no encontrada en .env" -ForegroundColor Red
}

Write-Host "`n📝 Para obtener tu API Key:`n" -ForegroundColor Cyan
Write-Host "1. Ve a: https://resend.com" -ForegroundColor White
Write-Host "2. Inicia sesión o crea una cuenta" -ForegroundColor White
Write-Host "3. Ve a API Keys → Create API Key" -ForegroundColor White
Write-Host "4. Copia la key (empieza con 're_')`n" -ForegroundColor White

$apiKey = Read-Host "Pega tu API Key aquí (o presiona Enter para cancelar)"

if ($apiKey -and $apiKey.Trim() -ne "") {
    # Validar formato
    if (-not $apiKey.StartsWith("re_")) {
        Write-Host "`n⚠️  Advertencia: La API key debería empezar con 're_'" -ForegroundColor Yellow
        $continue = Read-Host "¿Continuar de todas formas? (s/n)"
        if ($continue -ne "s") {
            Write-Host "Cancelado." -ForegroundColor Red
            exit
        }
    }
    
    # Actualizar .env
    $envContent = Get-Content .env -ErrorAction SilentlyContinue
    $newContent = @()
    $updated = $false
    
    foreach ($line in $envContent) {
        if ($line -match "^RESEND_API_KEY=") {
            $newContent += "RESEND_API_KEY=`"$apiKey`""
            $updated = $true
        } else {
            $newContent += $line
        }
    }
    
    if (-not $updated) {
        # Agregar al final si no existe
        $newContent += "RESEND_API_KEY=`"$apiKey`""
    }
    
    $newContent | Out-File -FilePath .env -Encoding utf8
    Write-Host "`n✅ API Key agregada al .env" -ForegroundColor Green
    
    Write-Host "`n🔄 Reiniciando servidor...`n" -ForegroundColor Cyan
    
    # Detener procesos Node
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    
    # Limpiar cache
    Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Cache limpiado" -ForegroundColor Green
    
    Write-Host "`n▶️  Iniciando servidor...`n" -ForegroundColor Cyan
    Write-Host "Espera 15-20 segundos hasta ver '✓ Ready'`n" -ForegroundColor Yellow
    
    # Iniciar servidor
    npm run dev
} else {
    Write-Host "`n❌ No se proporcionó API Key. Cancelado." -ForegroundColor Red
    Write-Host "`nPuedes agregarla manualmente editando el archivo .env`n" -ForegroundColor Yellow
}
