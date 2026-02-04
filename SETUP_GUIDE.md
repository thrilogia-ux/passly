# Guía de Setup Rápido - PASSLY

## Opción 1: Setup Automático (Recomendado)

Ejecuta el script de setup:

```powershell
# Windows PowerShell
.\scripts\setup.ps1
```

## Opción 2: Setup Manual

### Paso 1: Crear archivo .env

Crea un archivo `.env` en la raíz del proyecto con:

```env
# Base de Datos (IMPORTANTE: Cambia user, password, y nombre de BD)
DATABASE_URL="postgresql://user:password@localhost:5432/passly?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secret-aleatorio-aqui"

# JWT para QR
JWT_SECRET="genera-otro-secret-aleatorio-aqui"

# API Pública
API_KEY="test-api-key"

# Opcionales (para funcionalidades avanzadas)
RESEND_API_KEY=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Ubicación en eventos: usa OpenStreetMap por defecto (gratis, sin config).
# Opcional: si tenés API de Google Maps, habilita Places/Embed APIs y agrega:
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
```

**Para generar secrets aleatorios:**
```powershell
# En PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

O simplemente usa cualquier string largo y aleatorio.

### Paso 2: Configurar Base de Datos

**Si NO tienes PostgreSQL instalado:**

1. **Opción A - Docker (Recomendado)**:
```bash
docker run --name passly-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=passly -p 5432:5432 -d postgres
```

Luego en `.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/passly?schema=public"
```

2. **Opción B - Instalar PostgreSQL**:
- Windows: https://www.postgresql.org/download/windows/
- Mac: `brew install postgresql`
- Linux: `sudo apt-get install postgresql`

### Paso 3: Ejecutar Migraciones

```bash
# Crear las tablas en la base de datos
npx prisma migrate dev --name init

# Si ya existen migraciones, solo ejecuta:
npx prisma migrate dev
```

### Paso 4: Poblar con Datos de Prueba

```bash
npm run db:seed
```

Esto creará:
- Usuarios de prueba (admin, client, organizer, staff)
- Organización de demo
- Evento de ejemplo
- Invitados de prueba

**Credenciales creadas:**
- Super Admin: `admin@passly.com` / `admin123`
- Client: `client@demo.com` / `client123`
- Organizer: `organizer@demo.com` / `organizer123`
- Staff: `staff@demo.com` / `staff123`

### Paso 5: Iniciar Servidor

```bash
npm run dev
```

Abre tu navegador en: **http://localhost:3000**

## Verificación Rápida

### 1. Verificar que Prisma funciona:
```bash
npx prisma studio
```
Debería abrirse una interfaz web para ver la base de datos.

### 2. Probar Login:
1. Ir a `http://localhost:3000/login`
2. Usar: `admin@passly.com` / `admin123`
3. Deberías ver el dashboard

### 3. Probar API:
```bash
# Ver documentación de API
curl http://localhost:3000/api/public/v1/docs

# Listar eventos (requiere autenticación en dashboard primero)
curl -H "X-API-Key: test-api-key" http://localhost:3000/api/public/v1/events
```

## Troubleshooting

### Error: "Can't reach database server"
- Verifica que PostgreSQL esté corriendo
- Verifica la DATABASE_URL en .env
- Prueba conectarte con: `psql -U postgres -d passly`

### Error: "Prisma Client not generated"
```bash
npx prisma generate
```

### Error: "Authentication failed"
- Verifica usuario y password en DATABASE_URL
- Si usas Docker, el password por defecto es `postgres`

### Resetear Base de Datos (borrar todo y empezar de nuevo)
```bash
npm run db:reset
```

### Ver logs de Prisma
```bash
npx prisma migrate dev --create-only
# Luego revisa las migraciones generadas
```

## Próximos Pasos

Una vez que el servidor esté corriendo:

1. **Probar Login** → `/login`
2. **Crear Evento** → `/dashboard/events`
3. **Agregar Invitados** → `/dashboard/guests`
4. **Enviar Invitaciones** → `/dashboard/invitations`
5. **Hacer Check-in** → `/dashboard/check-in`
6. **Ver Reportes** → `/dashboard/reports`

Para más detalles, ver [QUICK_START.md](QUICK_START.md) y [TESTING.md](TESTING.md)