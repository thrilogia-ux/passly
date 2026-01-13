# ⚡ Configurar Resend en 2 Minutos

## Paso 1: Obtener API Key de Resend

1. **Ve a**: https://resend.com
2. **Crea una cuenta** (gratis, 3,000 emails/mes)
3. **Verifica tu email** (revisa tu bandeja de entrada)
4. **En el Dashboard**, ve a **API Keys**
5. **Click en "Create API Key"**
6. **Dale un nombre**: "PASSLY Development"
7. **Copia la API Key** (empieza con `re_`)

## Paso 2: Agregar al .env

Abre tu archivo `.env` y agrega estas líneas:

```env
RESEND_API_KEY=re_tu_api_key_aqui_pega_la_key_que_copiaste
EMAIL_FROM=PASSLY <onboarding@resend.dev>
```

**Ejemplo:**
```env
RESEND_API_KEY=re_abc123xyz456...
EMAIL_FROM=PASSLY <onboarding@resend.dev>
```

## Paso 3: Reiniciar el Servidor

**IMPORTANTE**: Debes reiniciar el servidor para que cargue las nuevas variables.

1. **Detén el servidor**: Presiona `Ctrl+C` en la terminal donde corre `npm run dev`
2. **Inicia de nuevo**: 
   ```powershell
   npm run dev
   ```

## Paso 4: Probar

1. Intenta enviar una invitación nuevamente
2. Deberías ver en la consola del servidor:
   ```
   📧 Intentando enviar email a: usuario@ejemplo.com
   ✅ Email enviado exitosamente. ID: abc123...
   ```

## ✅ Listo!

Ahora los emails deberían enviarse correctamente.

## ⚠️ Notas Importantes

- **`onboarding@resend.dev`** es un email de prueba que Resend proporciona
- Para producción, necesitarás verificar tu propio dominio en Resend
- El plan gratuito permite **3,000 emails/mes**
- La API Key es secreta, **nunca la compartas** ni la subas a GitHub

## ❌ Si Aún No Funciona

1. **Verifica que copiaste la API Key completa** (sin espacios)
2. **Asegúrate de reiniciar el servidor** después de agregar la key
3. **Revisa la consola del servidor** para ver el error específico
4. **Verifica que el .env esté en la raíz del proyecto**
