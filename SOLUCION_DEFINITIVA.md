# SOLUCIÓN DEFINITIVA - Error 500

## PROBLEMA IDENTIFICADO
Las variables de entorno NO se están cargando correctamente en Next.js.

## SOLUCIÓN APLICADA

1. **Actualizado `next.config.ts`** para incluir variables de entorno explícitamente
2. **Configurado fallbacks** para desarrollo

## PASOS PARA TI:

### 1. Detener todo
```powershell
Stop-Process -Name node -Force
```

### 2. Verificar .env
Tu archivo `.env` DEBE tener:
```env
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="6+b8IoMIHUYb9Cw5LGNNTlVwGGlebTEOiWcin78qPK0="
DATABASE_URL="file:./dev.db"
```

### 3. Iniciar con variables explícitas
```powershell
$env:NEXTAUTH_SECRET = "6+b8IoMIHUYb9Cw5LGNNTlVwGGlebTEOiWcin78qPK0="
$env:NEXTAUTH_URL = "http://localhost:3002"
npm run dev
```

### 4. Esperar 15-20 segundos
Hasta ver: `✓ Ready in Xs`

### 5. Probar
Abre: `http://localhost:3002`

## SI AÚN FALLA:

**Opción 1**: Accede directamente a `/login`:
```
http://localhost:3002/login
```

**Opción 2**: Revisa la terminal donde corre `npm run dev` y copia el error exacto.

**Opción 3**: Ejecuta esto para ver qué está pasando:
```powershell
npm run build
```
