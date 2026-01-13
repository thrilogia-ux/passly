# PASSLY - Plataforma SaaS de Acreditación QR

Plataforma SaaS modular y escalable para gestión de eventos recurrentes con acreditación QR segura.

## Stack Tecnológico

- **Frontend/Backend**: Next.js 14 (App Router) + TypeScript
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Autenticación**: NextAuth.js v5
- **Email**: Resend API
- **QR Generation**: qrcode + qrcode.react
- **UI**: Tailwind CSS + componentes custom

## Estructura del Proyecto

```
passly/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Rutas de autenticación
│   ├── (dashboard)/         # Dashboard protegido
│   │   ├── events/          # Gestión de eventos
│   │   ├── guests/          # CRM de invitados
│   │   ├── invitations/     # Invitaciones
│   │   ├── check-in/        # App de check-in
│   │   └── reports/         # Reportes
│   └── api/                 # API Routes
├── prisma/
│   └── schema.prisma        # Schema de base de datos
├── lib/
│   ├── auth.ts              # Configuración de autenticación
│   ├── db.ts                # Cliente de Prisma
│   ├── qr/                  # Generación y validación QR
│   ├── email/               # Servicio de email
│   └── utils/               # Utilidades
├── components/
│   ├── ui/                  # Componentes UI base
│   └── auth/                # Componentes de autenticación
└── types/                   # Tipos TypeScript
```

## Setup

1. **Instalar dependencias**:
```bash
npm install
```

2. **Configurar variables de entorno**:
Crea un archivo `.env` con:
```
DATABASE_URL="postgresql://user:password@localhost:5432/passly"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
JWT_SECRET="your-jwt-secret-here"
RESEND_API_KEY="your-resend-api-key"
```

3. **Configurar base de datos**:
```bash
npx prisma migrate dev
npx prisma generate
```

4. **Ejecutar en desarrollo**:
```bash
npm run dev
```

## Funcionalidades Implementadas

### MVP (Fase 1) ✅

✅ **Sistema de Autenticación**
- NextAuth.js con roles (Super Admin, Cliente, Organizador, Staff)
- Middleware de autorización
- Protección de rutas

✅ **Gestión de Eventos**
- CRUD completo de eventos
- Asignación de organizadores
- Estados (Draft, Active, Completed)
- Configuración de QR (reingreso, horarios válidos)

✅ **CRM de Invitados**
- CRUD de invitados (transversal - puede estar en múltiples eventos)
- Importación CSV/Excel (API)
- Asignación a eventos
- Campos custom por evento
- Detección de duplicados
- Tags dinámicos

✅ **Sistema QR**
- Generación de tokens JWT cifrados
- QR único por invitado+evento
- Validación server-side
- Prevención de screenshots (expiración)
- Estados (Válido, Usado, Anulado)

✅ **Invitaciones**
- Creación de invitaciones
- Templates HTML
- Campos dinámicos
- Envío por email
- Estados (Pendiente, Enviado, Confirmado, Rechazado)

✅ **Check-in**
- Validación de QR en tiempo real
- Control de reingreso
- Logs de acceso
- Feedback visual

✅ **Dashboard y Reportes**
- Métricas básicas
- Estadísticas por evento
- Exportación (preparado)

### Fase 2 - Funcionalidades Avanzadas ✅

✅ **Invitado Transversal**
- Vista de historial completo por invitado
- Historial de eventos en los que ha participado
- Estadísticas por invitado (total eventos, check-ins, etc.)
- Tags dinámicos configurables

✅ **Check-in Avanzado**
- Soporte multi-zona (general, backstage, prensa, VIP, manual)
- Modo emergencia (check-in manual sin QR)
- Registro de zona por check-in
- API para obtener zonas de un evento

✅ **Reportes Comparativos**
- Comparativa entre múltiples eventos
- Métricas comparativas (asistencia, confirmación, no-shows)
- Distribución por tipo de invitado
- Timeline de check-ins por hora

✅ **Automatizaciones**
- Sistema de reminders automáticos
- Envío de recordatorios por email
- Configuración de días antes del evento
- Mensajes personalizados

### Fase 3 - Integraciones ✅

✅ **Google Calendar**
- Integración con Google Calendar API
- Sincronización de eventos
- OAuth2 authentication flow
- Inclusión de invitados como attendees

✅ **Webhooks**
- Sistema de webhooks para notificaciones
- Eventos configurables (event.created, guest.added, check_in.completed, etc.)
- Autenticación mediante secret
- Configuración por organización

✅ **API Pública REST**
- API RESTful para clientes enterprise
- Autenticación mediante API Key
- Endpoints: /events, /guests, /check-in
- Documentación disponible en /api/public/v1/docs
- Rate limiting (preparado)

✅ **Página de Integraciones**
- UI para gestionar integraciones
- Conexión con Google Calendar
- Configuración de webhooks
- Documentación de API

## Próximos Pasos (Futuro)

- WhatsApp API (envío de invitaciones)
- PWA completa para check-in con escáner de cámara
- Modo offline mejorado con sync
- Templates versionables por cliente
- Branding adaptable (white-label)
- SSO/SAML para enterprise
- Integraciones con CRM (HubSpot, Salesforce)

## Modelo de Negocio

- SaaS mensual (Starter, Pro, Enterprise)
- Add-ons (WhatsApp, Reportes custom, Integraciones)

## Licencia

Privado - Todos los derechos reservados