# Quick Start Guide - PASSLY

## Setup Rápido (5 minutos)

### 1. Configurar Base de Datos

```bash
# Crear archivo .env (o editar el existente)
DATABASE_URL="postgresql://user:password@localhost:5432/passly?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"
JWT_SECRET="another-random-secret-here"
RESEND_API_KEY=""  # Opcional
GOOGLE_CLIENT_ID=""  # Opcional
GOOGLE_CLIENT_SECRET=""  # Opcional
API_KEY="test-api-key"  # Para API pública
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Base de Datos

```bash
# Crear base de datos y ejecutar migraciones
npx prisma migrate dev --name init

# Generar Prisma Client
npx prisma generate

# Poblar con datos de prueba
npm run db:seed
```

### 4. Iniciar Servidor

```bash
npm run dev
```

### 5. Acceder a la Aplicación

Abrir `http://localhost:3000` en el navegador.

**Credenciales de prueba (creadas por seed)**:
- **Super Admin**: `admin@passly.com` / `admin123`
- **Client**: `client@demo.com` / `client123`
- **Organizer**: `organizer@demo.com` / `organizer123`
- **Staff**: `staff@demo.com` / `staff123`

## Primeros Pasos

### 1. Login
- Ir a `http://localhost:3000/login`
- Usar cualquier credencial de arriba

### 2. Crear un Evento
- Ir a `/dashboard/events`
- Click en "Nuevo Evento"
- Completar formulario
- Guardar

### 3. Agregar Invitados
- Ir a `/dashboard/guests`
- Click en "Nuevo Invitado"
- O usar la API de importación para CSV

### 4. Asignar Invitados a Evento
- Ir al detalle del evento
- Click en "Gestionar Invitados"
- Asignar invitados

### 5. Enviar Invitaciones
- Ir a `/dashboard/invitations`
- Ver invitaciones pendientes
- Click en "Enviar" para cada una

### 6. Check-in
- Ir a `/dashboard/check-in`
- Usar token QR o modo manual
- Verificar que funciona

### 7. Ver Reportes
- Ir a `/dashboard/reports`
- Ver métricas y estadísticas

## Testing Rápido

### Verificar API

```bash
# Listar eventos (requiere API key en .env)
curl -X GET "http://localhost:3000/api/public/v1/events" \
  -H "X-API-Key: test-api-key"

# Ver documentación de API
curl "http://localhost:3000/api/public/v1/docs"
```

### Verificar Base de Datos

```bash
# Abrir Prisma Studio
npx prisma studio
```

## Troubleshooting

### Error: "Prisma Client not generated"
```bash
npx prisma generate
```

### Error: "Database connection failed"
- Verificar DATABASE_URL en .env
- Verificar que PostgreSQL está corriendo
- Verificar credenciales

### Error: "NextAuth secret missing"
- Agregar NEXTAUTH_SECRET en .env
- Generar un secret aleatorio: `openssl rand -base64 32`

### Resetear Base de Datos
```bash
npm run db:reset
```

## Estructura de Rutas

### Dashboard
- `/dashboard` - Home
- `/dashboard/events` - Gestión de eventos
- `/dashboard/guests` - CRM de invitados
- `/dashboard/invitations` - Invitaciones
- `/dashboard/check-in` - Check-in
- `/dashboard/reports` - Reportes
- `/dashboard/settings/integrations` - Integraciones

### API Pública
- `/api/public/v1/events` - Eventos
- `/api/public/v1/guests` - Invitados
- `/api/public/v1/check-in` - Check-in
- `/api/public/v1/docs` - Documentación

### API Interna
- `/api/events` - CRUD eventos
- `/api/guests` - CRUD invitados
- `/api/invitations` - Invitaciones
- `/api/qr` - Sistema QR
- `/api/check-in` - Check-in
- `/api/integrations` - Integraciones

## Próximos Pasos

1. Leer [TESTING.md](TESTING.md) para guía completa de testing
2. Leer [README.md](README.md) para detalles de funcionalidades
3. Revisar [CHANGELOG.md](CHANGELOG.md) para ver qué hay implementado

## Notas

- El proyecto está completamente funcional para desarrollo
- Algunas funcionalidades requieren servicios externos (Resend, Google)
- Para producción, configurar variables de entorno apropiadamente
- Revisar seguridad y rate limiting antes de producción