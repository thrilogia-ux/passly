# Guía de Testing - PASSLY

## Pre-requisitos

1. **Base de Datos configurada**:
```bash
# Configurar DATABASE_URL en .env
# Ejecutar migraciones
npx prisma migrate dev
npx prisma generate
```

2. **Variables de entorno necesarias**:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
JWT_SECRET="your-jwt-secret"
RESEND_API_KEY="your-resend-key"  # Opcional para testing de emails
GOOGLE_CLIENT_ID="..."  # Para integración Google Calendar
GOOGLE_CLIENT_SECRET="..."
API_KEY="test-api-key"  # Para API pública
```

3. **Crear usuario inicial**:
```bash
# Ejecutar script de seed o crear manualmente
npx prisma studio  # Crear usuario manualmente
```

## Checklist de Testing

### 1. Autenticación ✅

- [ ] Login con email/password
- [ ] Logout funciona correctamente
- [ ] Protección de rutas (sin auth → redirect a /login)
- [ ] Roles y permisos funcionan
- [ ] Session persiste correctamente

**Cómo probar**:
1. Ir a `http://localhost:3000/login`
2. Intentar acceder a `/dashboard` sin login → debe redirigir
3. Hacer login → debe redirigir a `/dashboard`
4. Verificar que el usuario se muestra en la navbar

### 2. Eventos ✅

- [ ] Crear nuevo evento
- [ ] Listar eventos
- [ ] Ver detalle de evento
- [ ] Editar evento
- [ ] Cambiar estado de evento (Draft/Active/Completed)
- [ ] Configurar reingreso y límites
- [ ] Filtrado por organización (para SUPER_ADMIN)

**Cómo probar**:
1. Ir a `/dashboard/events`
2. Crear evento con datos válidos
3. Verificar que aparece en la lista
4. Editar y cambiar estado
5. Verificar configuración de reingreso

### 3. Invitados (CRM) ✅

- [ ] Crear invitado
- [ ] Listar invitados
- [ ] Ver detalle de invitado (historial transversal)
- [ ] Editar invitado
- [ ] Agregar tags
- [ ] Asignar invitado a evento
- [ ] Búsqueda por nombre/email
- [ ] Filtrado por tipo
- [ ] Detección de duplicados

**Cómo probar**:
1. Ir a `/dashboard/guests`
2. Crear invitado con email único
3. Intentar crear duplicado → debe mostrar error
4. Agregar tags al invitado
5. Ver detalle → verificar historial transversal
6. Asignar a evento

### 4. Sistema QR ✅

- [ ] Generar QR para invitado+evento
- [ ] QR único por combinación
- [ ] Token JWT válido y verifiable
- [ ] Expiración de QR (24h por defecto)
- [ ] Estados: VALID, USED, INVALIDATED

**Cómo probar**:
1. Asignar invitado a evento
2. Generar QR desde API: `POST /api/qr/generate/{guestEventId}`
3. Verificar que token es JWT válido
4. Verificar QR con: `POST /api/qr/verify`
5. Comprobar expiración después de 24h

### 5. Invitaciones ✅

- [ ] Crear invitación
- [ ] Enviar invitación por email
- [ ] Template con campos dinámicos
- [ ] Inclusión de QR en email
- [ ] Estados: PENDING, SENT, CONFIRMED, REJECTED
- [ ] Listar invitaciones por evento

**Cómo probar**:
1. Crear invitación para guestEvent
2. Enviar: `POST /api/invitations/{id}/send`
3. Verificar email recibido (requiere RESEND_API_KEY)
4. Verificar que QR está incluido
5. Verificar cambio de estado a SENT

### 6. Check-in ✅

- [ ] Check-in con QR válido
- [ ] Verificación en tiempo real
- [ ] Control de reingreso
- [ ] Límite de reingresos
- [ ] Check-in manual (modo emergencia)
- [ ] Registro de zona
- [ ] Feedback visual (OK/error)
- [ ] Logs de check-ins

**Cómo probar**:
1. Generar QR válido
2. Hacer check-in: `POST /api/check-in` con token
3. Verificar éxito y creación de registro
4. Intentar re-check-in (si reentry permitido)
5. Probar check-in manual desde UI
6. Verificar zonas registradas

### 7. Reportes ✅

- [ ] Métricas básicas (total invitados, eventos, check-ins)
- [ ] Estadísticas por evento
- [ ] Comparación entre eventos
- [ ] Distribución por tipo de invitado
- [ ] Timeline de check-ins
- [ ] Exportación (preparado)

**Cómo probar**:
1. Ir a `/dashboard/reports`
2. Verificar métricas globales
3. Ver estadísticas por evento
4. Comparar eventos: `/dashboard/reports/compare`
5. Verificar distribución por tipo

### 8. Automatizaciones ✅

- [ ] Envío de reminders
- [ ] Configuración de días antes
- [ ] Mensajes personalizados
- [ ] Envío masivo

**Cómo probar**:
1. Crear evento con invitados confirmados
2. Enviar reminder: `POST /api/automations/reminders`
3. Verificar emails enviados
4. Probar con diferentes días antes

### 9. Integraciones ✅

#### Google Calendar
- [ ] Obtener URL de autenticación
- [ ] Sincronizar evento a Google Calendar
- [ ] Incluir invitados como attendees

**Cómo probar**:
1. Ir a `/dashboard/settings/integrations`
2. Conectar Google Calendar
3. Sincronizar evento: `POST /api/integrations/google-calendar/sync`
4. Verificar en Google Calendar

#### API Pública
- [ ] Autenticación con API Key
- [ ] Listar eventos
- [ ] Crear invitado
- [ ] Realizar check-in
- [ ] Documentación accesible

**Cómo probar**:
```bash
# Listar eventos
curl -X GET "http://localhost:3000/api/public/v1/events" \
  -H "X-API-Key: test-api-key"

# Crear invitado
curl -X POST "http://localhost:3000/api/public/v1/guests" \
  -H "X-API-Key: test-api-key" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","eventId":"event_id"}'

# Check-in
curl -X POST "http://localhost:3000/api/public/v1/check-in" \
  -H "X-API-Key: test-api-key" \
  -H "Content-Type: application/json" \
  -d '{"token":"qr_token_here"}'

# Ver documentación
curl "http://localhost:3000/api/public/v1/docs"
```

#### Webhooks
- [ ] Crear webhook
- [ ] Configurar eventos
- [ ] Recibir notificaciones (simulado)

**Cómo probar**:
1. Crear webhook: `POST /api/integrations/webhooks`
2. Configurar eventos
3. Trigger eventos (crear evento, invitado, check-in)
4. Verificar que webhook se envía

### 10. Seguridad ✅

- [ ] Protección de rutas
- [ ] Validación de permisos por rol
- [ ] Sanitización de inputs
- [ ] Rate limiting (preparado)
- [ ] JWT tokens seguros
- [ ] HTTPS (en producción)

**Cómo probar**:
1. Intentar acceder sin autenticación
2. Intentar acceder con rol incorrecto
3. Intentar SQL injection en inputs
4. Verificar que tokens QR son JWT seguros

## Casos de Uso End-to-End

### Caso 1: Evento Completo

1. Crear organización
2. Crear usuario con rol CLIENT
3. Crear evento
4. Importar invitados (CSV)
5. Asignar invitados a evento
6. Generar invitaciones
7. Enviar invitaciones
8. Hacer check-in de invitados
9. Ver reportes

### Caso 2: Invitado Transversal

1. Crear invitado
2. Asignar a múltiples eventos
3. Ver historial completo
4. Ver estadísticas por invitado
5. Agregar tags
6. Ver comportamiento cross-eventos

### Caso 3: Integración Completa

1. Conectar Google Calendar
2. Sincronizar eventos
3. Configurar webhooks
4. Usar API pública para crear invitados
5. Verificar sincronización

## Errores Comunes

1. **Error de Prisma**: Ejecutar `npx prisma generate`
2. **Error de autenticación**: Verificar NEXTAUTH_SECRET
3. **Error de email**: Verificar RESEND_API_KEY
4. **Error de base de datos**: Verificar DATABASE_URL
5. **CORS errors**: Verificar configuración de Next.js

## Performance Testing

- [ ] Carga de 1000+ invitados
- [ ] Check-in simultáneo (10+ requests)
- [ ] Generación masiva de QRs
- [ ] Reportes con muchos eventos

## Testing Manual vs Automatizado

**Actual**: Testing manual
**Futuro**: 
- Unit tests con Jest
- Integration tests con Playwright
- E2E tests automatizados

## Notas

- Algunas funcionalidades requieren servicios externos (Resend, Google)
- Para testing sin servicios externos, usar mocks
- La base de datos puede resetearse con `npx prisma migrate reset`