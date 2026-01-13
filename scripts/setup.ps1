# Script de Setup para PASSLY
Write-Host "=== PASSLY - Setup de Testing ===" -ForegroundColor Cyan
Write-Host ""

# Verificar si .env existe
if (Test-Path .env) {
    Write-Host "✅ Archivo .env encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️  Archivo .env no existe" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Necesitas crear un archivo .env con las siguientes variables:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "DATABASE_URL=`"postgresql://user:password@localhost:5432/passly?schema=public`""
    Write-Host "NEXTAUTH_URL=`"http://localhost:3000`""
    Write-Host "NEXTAUTH_SECRET=`"genera-un-secret-aleatorio`""
    Write-Host "JWT_SECRET=`"genera-otro-secret-aleatorio`""
    Write-Host "API_KEY=`"test-api-key`""
    Write-Host ""
    Write-Host "Presiona Enter cuando hayas creado el archivo .env..."
    Read-Host
}

# Verificar Prisma Client
Write-Host "Generando Prisma Client..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma Client generado" -ForegroundColor Green
} else {
    Write-Host "❌ Error generando Prisma Client" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "¿Quieres ejecutar las migraciones ahora? (S/N)" -ForegroundColor Yellow
$runMigrations = Read-Host

if ($runMigrations -eq "S" -or $runMigrations -eq "s") {
    Write-Host "Ejecutando migraciones..." -ForegroundColor Cyan
    npx prisma migrate dev --name init
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migraciones ejecutadas" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "¿Quieres ejecutar el seed (crear datos de prueba)? (S/N)" -ForegroundColor Yellow
        $runSeed = Read-Host
        
        if ($runSeed -eq "S" -or $runSeed -eq "s") {
            Write-Host "Ejecutando seed..." -ForegroundColor Cyan
            npm run db:seed
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Seed ejecutado" -ForegroundColor Green
                Write-Host ""
                Write-Host "Credenciales de prueba creadas:" -ForegroundColor Cyan
                Write-Host "  Super Admin: admin@passly.com / admin123"
                Write-Host "  Client: client@demo.com / client123"
                Write-Host "  Organizer: organizer@demo.com / organizer123"
                Write-Host "  Staff: staff@demo.com / staff123"
            }
        }
    }
}

Write-Host ""
Write-Host "✅ Setup completado!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar el servidor:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Luego accede a: http://localhost:3000" -ForegroundColor Cyan