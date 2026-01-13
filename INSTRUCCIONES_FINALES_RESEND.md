# 🚨 INSTRUCCIONES FINALES - Configurar RESEND_API_KEY

## El Problema

El servidor NO está detectando tu `RESEND_API_KEY` aunque la hayas agregado al `.env`.

## Solución Definitiva

### Paso 1: Verificar tu archivo .env

Abre el archivo `.env` y asegúrate de que tenga esta línea **EXACTA**:

```env
RESEND_API_KEY="re_tu_api_key_completa_aqui"
```

**IMPORTANTE:**
- ✅ Debe tener comillas: `RESEND_API_KEY="re_..."`
- ✅ NO debe estar vacío: `RESEND_API_KEY=""` ❌
- ✅ NO debe tener espacios: `RESEND_API_KEY = "re_..."` ❌
- ✅ Debe ser una línea completa sin saltos de línea

### Paso 2: Obtener tu API Key (si no la tienes)

1. Ve a: **https://resend.com**
2. Inicia sesión
3. Ve a **API Keys**
4. Click en **"Create API Key"**
5. Copia la key completa (empieza con `re_`)

### Paso 3: Agregar al .env

Ejemplo de cómo debe verse tu `.env`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="passly-dev-secret-2025-random-string"
JWT_SECRET="passly-jwt-secret-2025-random-string"
API_KEY="test-api-key"
RESEND_API_KEY="re_abc123xyz456def789ghi012jkl345mno678pqr901stu234vwx567"
EMAIL_FROM="PASSLY <onboarding@resend.dev>"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
NODE_ENV="development"
```

### Paso 4: REINICIAR COMPLETAMENTE EL SERVIDOR

**CRÍTICO**: Debes hacer esto:

1. **Detén el servidor completamente**:
   - Presiona `Ctrl+C` en la terminal
   - Espera 3 segundos
   - Verifica que no haya procesos Node corriendo:
     ```powershell
     Get-Process -Name node -ErrorAction SilentlyContinue
     ```
   - Si hay procesos, mátalos:
     ```powershell
     Stop-Process -Name node -Force
     ```

2. **Limpia el cache de Next.js**:
   ```powershell
   Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue
   ```

3. **Inicia el servidor de nuevo**:
   ```powershell
   npm run dev
   ```

4. **Espera 15-20 segundos** hasta ver:
   ```
   ✓ Ready in Xs
   ○ Local: http://localhost:3002
   ```

### Paso 5: Verificar que funciona

Ejecuta este comando para verificar:
```powershell
npx tsx scripts/test-resend-env.ts
```

Deberías ver:
```
RESEND_API_KEY: ✅ Configurada (re_abc123...)
```

Si ves `❌ NO CONFIGURADA`, significa que:
- La key no está en el .env, O
- El .env tiene la key vacía, O
- No reiniciaste el servidor

### Paso 6: Probar envío de email

Intenta enviar una invitación. Deberías ver en la consola del servidor:
```
📧 Intentando enviar email a: usuario@ejemplo.com
✅ Email enviado exitosamente. ID: abc123...
```

## ⚠️ Si AÚN No Funciona

### Opción A: Verificar manualmente

1. Abre el archivo `.env` en un editor de texto
2. Busca `RESEND_API_KEY`
3. Verifica que tenga un valor real (no vacío)
4. Guarda el archivo
5. Reinicia el servidor

### Opción B: Crear .env desde cero

Si el problema persiste, crea un nuevo `.env`:

```powershell
# Backup del actual
Copy-Item .env .env.backup

# Crear nuevo .env
@"
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="passly-dev-secret-2025-random-string"
JWT_SECRET="passly-jwt-secret-2025-random-string"
API_KEY="test-api-key"
RESEND_API_KEY="re_tu_api_key_aqui"
EMAIL_FROM="PASSLY <onboarding@resend.dev>"
"@ | Out-File -FilePath .env -Encoding utf8
```

Luego agrega tu API key real y reinicia.

### Opción C: Usar variable de entorno del sistema

Si nada funciona, puedes establecer la variable directamente:

```powershell
$env:RESEND_API_KEY = "re_tu_api_key_aqui"
npm run dev
```

## ✅ Checklist Final

- [ ] Tengo una cuenta en Resend
- [ ] Obtuve mi API Key (empieza con `re_`)
- [ ] Agregué `RESEND_API_KEY="re_..."` al archivo `.env`
- [ ] La key NO está vacía
- [ ] Guardé el archivo `.env`
- [ ] Detuve completamente el servidor (Ctrl+C)
- [ ] Limpié el cache (.next)
- [ ] Reinicié el servidor (`npm run dev`)
- [ ] Esperé 15-20 segundos
- [ ] Verifiqué con `npx tsx scripts/test-resend-env.ts`
- [ ] Probé enviar un email

Si completaste todos los pasos y aún no funciona, comparte el resultado de:
```powershell
npx tsx scripts/test-resend-env.ts
```
