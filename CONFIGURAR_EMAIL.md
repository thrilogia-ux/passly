# 📧 Configuración de Email con Resend

## Pasos para configurar el envío de emails

### 1. Crear cuenta en Resend
1. Ve a https://resend.com
2. Crea una cuenta gratuita (3,000 emails/mes gratis)
3. Verifica tu email

### 2. Obtener API Key
1. En el dashboard de Resend, ve a **API Keys**
2. Click en **Create API Key**
3. Dale un nombre (ej: "PASSLY Development")
4. Copia la API Key (empieza con `re_`)

### 3. Configurar variables de entorno
Agrega estas líneas a tu archivo `.env`:

```env
RESEND_API_KEY=re_tu_api_key_aqui
EMAIL_FROM=PASSLY <onboarding@resend.dev>
```

**Nota:** `onboarding@resend.dev` es un email de prueba que Resend proporciona. Para producción, deberás verificar tu propio dominio.

### 4. Reiniciar el servidor
Después de agregar las variables, reinicia el servidor:

```bash
# Detener el servidor (Ctrl+C)
npm run dev
```

## Verificar que funciona

Al enviar una invitación, deberías ver en la consola del servidor:

```
📧 Intentando enviar email a: usuario@ejemplo.com
📧 Desde: PASSLY <onboarding@resend.dev>
📧 Asunto: Invitación a Evento XYZ
✅ Email enviado exitosamente. ID: abc123...
```

## Errores comunes y soluciones

### ❌ "RESEND_API_KEY no está configurada"
**Solución:** Agrega `RESEND_API_KEY` a tu archivo `.env` y reinicia el servidor.

### ❌ "API Key de Resend inválida"
**Solución:** 
- Verifica que copiaste la API Key completa
- Asegúrate de que no hay espacios extra
- Genera una nueva API Key si es necesario

### ❌ "Email 'from' inválido"
**Solución:** 
- Para testing, usa: `PASSLY <onboarding@resend.dev>`
- Para producción, verifica tu dominio en Resend y usa tu email verificado

### ❌ "Límite de envíos alcanzado"
**Solución:** 
- El plan gratuito permite 3,000 emails/mes
- Espera hasta el próximo mes o actualiza tu plan

## Verificar dominio (Opcional - para producción)

1. En Resend, ve a **Domains**
2. Click en **Add Domain**
3. Ingresa tu dominio (ej: `passly.com`)
4. Agrega los registros DNS que Resend te proporciona
5. Espera a que se verifique (puede tardar hasta 24 horas)
6. Una vez verificado, actualiza `EMAIL_FROM` en `.env`:
   ```env
   EMAIL_FROM=PASSLY <noreply@tudominio.com>
   ```

## Alternativas gratuitas

Si Resend no funciona para ti, puedes usar:

- **Brevo (Sendinblue)**: 300 emails/día gratis
- **Mailgun**: 5,000 emails/mes gratis (primeros 3 meses)
- **Mailtrap**: Solo para testing (no envía emails reales)

Para cambiar a otro servicio, contacta al desarrollador para adaptar el código.
