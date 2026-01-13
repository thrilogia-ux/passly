# Solución: Emails no llegan con Resend

## Problema Identificado

El sistema está enviando emails correctamente según Resend (devuelve ID), pero los emails **no llegan al destinatario** (ni siquiera a spam).

## Diagnóstico

Al ejecutar el script de prueba, se observa:
- ✅ Resend acepta el envío y devuelve un ID
- ⚠️ Headers muestran: `x-resend-daily-quota: "0"` y `x-resend-monthly-quota: "0"`
- ⚠️ Esto indica que Resend puede estar en **modo sandbox** o la cuenta tiene restricciones

## Posibles Causas

1. **Cuenta en modo Sandbox/Testing**: Resend tiene un modo sandbox donde los emails no se envían realmente
2. **Dominio no verificado**: Si usas un dominio personalizado, debe estar verificado
3. **Plan gratuito con limitaciones**: El plan gratuito puede tener restricciones
4. **Email "from" no verificado**: El email desde el que envías debe estar verificado

## Soluciones

### 1. Verificar Estado de la Cuenta Resend

1. Ve a https://resend.com/dashboard
2. Revisa el estado de tu cuenta
3. Verifica si estás en modo "Sandbox" o "Production"

### 2. Verificar Dominio

Si estás usando un dominio personalizado:
1. Ve a https://resend.com/domains
2. Verifica que tu dominio esté verificado
3. Si no está verificado, agrega los registros DNS requeridos

### 3. Usar Email de Testing

Para testing, usa el email pre-configurado de Resend:
```
EMAIL_FROM="PASSLY <onboarding@resend.dev>"
```

Este email funciona sin verificación para testing.

### 4. Verificar API Key

Asegúrate de que tu API Key sea válida:
1. Ve a https://resend.com/api-keys
2. Verifica que la key esté activa
3. Regenera la key si es necesario

### 5. Revisar Logs de Resend

1. Ve a https://resend.com/emails
2. Revisa los logs de envío
3. Verifica si hay errores o bounces

## Configuración Recomendada

### Para Desarrollo/Testing

```env
RESEND_API_KEY="tu-api-key"
EMAIL_FROM="PASSLY <onboarding@resend.dev>"
```

### Para Producción

```env
RESEND_API_KEY="tu-api-key"
EMAIL_FROM="PASSLY <noreply@tudominio.com>"
```

**Importante**: El dominio `tudominio.com` debe estar verificado en Resend.

## Verificación

Ejecuta el script de prueba:
```bash
npx tsx scripts/test-email.ts tu-email@ejemplo.com
```

Si el script muestra:
- ✅ ID de envío: El email fue aceptado por Resend
- ⚠️ Cuotas en 0: Puede estar en modo sandbox
- ❌ Error: Revisa el mensaje de error

## Próximos Pasos

1. Verifica tu cuenta de Resend en el dashboard
2. Si estás en sandbox, actualiza a producción
3. Verifica tu dominio si usas uno personalizado
4. Revisa los logs de envío en Resend
5. Prueba con el email de testing primero

## Notas Adicionales

- Los emails pueden tardar unos segundos en llegar
- Revisa la carpeta de spam
- Algunos proveedores (Gmail, Outlook) pueden filtrar emails de dominios no verificados
- Resend tiene límites de rate según el plan
