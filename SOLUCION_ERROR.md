# Solución: ERR_CONNECTION_REFUSED

## Problema
El servidor no está corriendo o hay un error al iniciarlo.

## Soluciones

### 1. Iniciar el servidor manualmente

```powershell
npm run dev
```

Deja la terminal abierta. Deberías ver algo como:
```
▲ Next.js 16.1.1
- Local:        http://localhost:3002
```

### 2. Verificar errores

Si hay errores al iniciar, los verás en la terminal. Errores comunes:

**Error de Prisma:**
```powershell
npx prisma generate
```

**Error de base de datos:**
- Verifica que `dev.db` exista
- Si no existe: `npx prisma migrate dev --name init`

**Error de compilación:**
- Revisa los errores de TypeScript en la terminal

### 3. Verificar puerto

```powershell
netstat -ano | findstr :3002
```

Si está ocupado, cambia el puerto en `package.json`:
```json
"dev": "next dev -p 3003"
```

### 4. Reiniciar todo

```powershell
# Detener procesos Node
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Regenerar Prisma Client
npx prisma generate

# Iniciar servidor
npm run dev
```

## Estado Actual

- ✅ Puerto configurado: 3002
- ✅ Base de datos: SQLite (dev.db)
- ✅ .env configurado
- ⏳ Servidor: Necesita iniciarse manualmente

**Ejecuta: `npm run dev` en una terminal y deja la ventana abierta.**