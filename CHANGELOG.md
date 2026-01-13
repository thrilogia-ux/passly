# Changelog - PASSLY

## Fase 3 - Integraciones (Completado)

### ✨ Nuevas Funcionalidades

#### Integración Google Calendar
- Conexión OAuth2 con Google Calendar
- Sincronización automática de eventos
- Inclusión de invitados como attendees
- API para sincronizar eventos existentes

#### Sistema de Webhooks
- Configuración de webhooks por organización
- Eventos configurables (event.created, guest.added, check_in.completed, etc.)
- Autenticación mediante secret
- Envío asíncrono de notificaciones

#### API Pública REST
- API RESTful completa para clientes enterprise
- Autenticación mediante API Key (header X-API-Key)
- Endpoints:
  - GET /api/public/v1/events - Listar eventos
  - GET/POST /api/public/v1/guests - Listar y crear invitados
  - POST /api/public/v1/check-in - Realizar check-in
  - GET /api/public/v1/docs - Documentación de API
- Rate limiting preparado

#### Página de Integraciones
- UI centralizada para gestionar integraciones
- Conexión con Google Calendar
- Configuración de webhooks (UI preparada)
- Acceso a documentación de API

### 🔧 Mejoras

- Estructura modular para integraciones futuras
- Sistema de autenticación para API pública
- Manejo de errores mejorado en integraciones

## Fase 2 - Funcionalidades Avanzadas (Completado)

### ✨ Nuevas Funcionalidades

#### Invitado Transversal
- Vista de detalle de invitado con historial completo
- Historial de todos los eventos en los que ha participado
- Estadísticas por invitado (total eventos, check-ins, confirmaciones)
- Tags dinámicos configurables por invitado
- Página de edición de invitados con gestión de tags

#### Check-in Avanzado
- Soporte multi-zona (general, backstage, prensa, VIP, manual)
- Modo emergencia para check-in manual sin QR
- API para obtener zonas de un evento
- Registro de zona en cada check-in
- Mejora en la UI del check-in con selector de zona

#### Reportes Comparativos
- Nueva página para comparar múltiples eventos
- Comparativa de métricas (asistencia, confirmación, no-shows)
- Distribución por tipo de invitado
- Timeline de check-ins por hora
- Tabla comparativa visual

#### Automatizaciones
- Sistema de reminders automáticos
- API para enviar recordatorios por email
- Configuración de días antes del evento
- Mensajes personalizados en reminders
- Envío masivo a invitados confirmados

### 🔧 Mejoras

- Mejorada la página de check-in con modo manual
- Agregado selector de zona en check-in
- Mejorada la visualización del historial de invitados
- Agregada página de comparación de eventos en reportes

## Fase 1 - MVP (Completado)

### ✨ Funcionalidades Core

- Sistema de autenticación completo con NextAuth.js
- Gestión completa de eventos (CRUD)
- CRM de invitados con importación
- Sistema QR seguro con JWT
- Invitaciones con templates
- Check-in básico
- Dashboard con métricas

---

**Nota**: Este changelog se actualiza con cada fase completada.