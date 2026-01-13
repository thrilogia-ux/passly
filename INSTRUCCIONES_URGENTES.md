# INSTRUCCIONES URGENTES - Solucionar Error 500

## PASO 1: Detener Todo
```powershell
Stop-Process -Name node -Force
Remove-Item -Path .next -Recurse -Force
```

## PASO 2: Verificar .env
Abre tu archivo `.env` y asegúrate de que tenga estas líneas EXACTAS:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="6+b8IoMIHUYb9Cw5LGNNTlVwGGlebTEOiWcin78qPK0="
JWT_SECRET="jwt-secret-key"
```

## PASO 3: Iniciar Servidor
```powershell
npm run dev
```

**ESPERA 15-20 SEGUNDOS** hasta que veas:
```
✓ Ready in Xs
○ Local: http://localhost:3002
```

## PASO 4: Probar
1. Abre tu navegador
2. Ve a: `http://localhost:3002`
3. Debería redirigir a `/login`

## Si AÚN NO FUNCIONA:

### Opción A: Acceder directamente a login
Ve directamente a: `http://localhost:3002/login`

### Opción B: Verificar logs
Mira la terminal donde corre `npm run dev` y copia el error exacto que aparece.

### Opción C: Reinstalar dependencias
```powershell
Remove-Item -Path node_modules -Recurse -Force
Remove-Item -Path package-lock.json -Force
npm install
npm run dev
```

## ERRORES COMUNES:

1. **"Missing API key"**: Ignóralo, es solo para emails
2. **"Port 3002 already in use"**: 
   ```powershell
   netstat -ano | findstr :3002
   # Luego mata el proceso con:
   taskkill /PID [número] /F
   ```
3. **"Cannot find module"**: Ejecuta `npm install`
