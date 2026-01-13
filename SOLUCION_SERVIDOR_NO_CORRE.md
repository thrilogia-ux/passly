# 🔧 Solución: Servidor No Está Corriendo

## Problema
`ERR_CONNECTION_REFUSED` significa que el servidor no está corriendo en el puerto 3002.

## Solución Rápida

### 1. Verificar si hay procesos Node corriendo
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue
```

Si hay procesos, puedes detenerlos:
```powershell
Stop-Process -Name node -Force
```

### 2. Iniciar el servidor
```powershell
npm run dev
```

### 3. Esperar
Espera **15-20 segundos** hasta ver en la terminal:
```
✓ Ready in Xs
○ Local: http://localhost:3002
```

### 4. Probar
Abre en tu navegador: **http://localhost:3002**

## Si el Servidor No Inicia

### Verificar errores en la terminal
Mira la terminal donde ejecutaste `npm run dev` y busca errores.

### Errores comunes:

#### "Port 3002 already in use"
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :3002

# Matar el proceso (reemplaza PID con el número que aparece)
taskkill /PID [número] /F
```

#### "Cannot find module"
```powershell
npm install
```

#### "Database connection failed"
Verifica que tu `.env` tenga:
```env
DATABASE_URL="file:./dev.db"
```

### Reiniciar desde cero
```powershell
# 1. Detener todo
Stop-Process -Name node -Force

# 2. Limpiar cache
Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue

# 3. Reinstalar dependencias (si es necesario)
npm install

# 4. Iniciar servidor
npm run dev
```

## Verificación

Después de iniciar, deberías poder acceder a:
- **http://localhost:3002** - Página principal (redirige a login)
- **http://localhost:3002/login** - Página de login

## Estado Actual

El servidor debería estar iniciando ahora. Espera 20 segundos y prueba acceder a **http://localhost:3002**

Si aún no funciona, revisa la terminal donde corre `npm run dev` para ver el error específico.
