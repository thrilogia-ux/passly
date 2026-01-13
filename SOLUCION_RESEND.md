# 🔧 Solución: RESEND_API_KEY no se está cargando

## Problema Detectado

Tu archivo `.env` tiene `RESEND_API_KEY=""` (vacío). Necesitas agregar tu API Key real.

## Solución Paso a Paso

### 1. Obtener API Key de Resend

1. Ve a: **https://resend.com**
2. Inicia sesión o crea una cuenta
3. Ve a **API Keys** en el menú
4. Click en **"Create API Key"**
5. Dale un nombre: "PASSLY"
6. **Copia la API Key completa** (empieza con `re_`)

### 2. Editar el archivo .env

**IMPORTANTE**: Abre el archivo `.env` en la raíz del proyecto y busca esta línea:

```env
RESEND_API_KEY=""
```

**Reemplázala por** (pega tu API Key real):

```env
RESEND_API_KEY="re_tu_api_key_completa_aqui"
```

**Ejemplo real:**
```env
RESEND_API_KEY="re_abc123xyz456def789ghi012jkl345mno678pqr901stu234vwx567"
```

### 3. Verificar que quedó bien

Tu archivo `.env` debería verse así:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="tu-secret-aqui"
JWT_SECRET="tu-jwt-secret"
RESEND_API_KEY="re_tu_api_key_completa"
EMAIL_FROM="PASSLY <onboarding@resend.dev"
```

### 4. REINICIAR EL SERVIDOR (CRÍTICO)

**DEBES reiniciar el servidor** para que cargue las nuevas variables:

1. **Detén el servidor**: Presiona `Ctrl+C` en la terminal donde corre `npm run dev`
2. **Espera 2 segundos**
3. **Inicia de nuevo**:
   ```powershell
   npm run dev
   ```
4. **Espera 15-20 segundos** hasta que veas `✓ Ready`

### 5. Probar

Intenta enviar una invitación nuevamente. Deberías ver:
```
✅ Email enviado exitosamente. ID: abc123...
```

## ⚠️ Errores Comunes

### "Sigue diciendo que no está configurada"
- **Solución**: Asegúrate de haber **reiniciado el servidor** después de agregar la key
- Verifica que no haya espacios extra: `RESEND_API_KEY="re_..."` (no `RESEND_API_KEY = "re_..."`)

### "API Key inválida"
- Verifica que copiaste la key completa (debe empezar con `re_`)
- No debe tener espacios al inicio o final
- Debe estar entre comillas: `RESEND_API_KEY="re_..."`

### "No encuentro el archivo .env"
- El archivo `.env` debe estar en la **raíz del proyecto** (mismo nivel que `package.json`)
- Si no existe, créalo con el contenido mínimo:
  ```env
  DATABASE_URL="file:./dev.db"
  NEXTAUTH_URL="http://localhost:3002"
  NEXTAUTH_SECRET="tu-secret"
  RESEND_API_KEY="re_tu_key"
  EMAIL_FROM="PASSLY <onboarding@resend.dev>"
  ```

## ✅ Verificación Rápida

Ejecuta esto para verificar:
```powershell
npx tsx scripts/test-resend-env.ts
```

Deberías ver:
```
RESEND_API_KEY: ✅ Configurada (re_abc123...)
```

Si ves `❌ NO CONFIGURADA`, significa que:
1. No agregaste la key al .env, O
2. No reiniciaste el servidor
