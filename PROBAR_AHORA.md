# 🚀 Cómo Probar PASSLY - Paso a Paso

## ✅ Estado Actual
- ✅ Dependencias instaladas
- ✅ Prisma Client generado
- ⏳ Falta: Configurar base de datos y ejecutar migraciones

## 📋 Pasos para Probar

### Paso 1: Configurar Base de Datos

**Opción A - Docker (Más Fácil, Recomendado):**

1. Abre una terminal y ejecuta:
```powershell
docker run --name passly-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=passly -p 5432:5432 -d postgres
```

2. Crea archivo `.env` en la raíz del proyecto:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/passly?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="mi-secret-aleatorio-12345-cambiar"
JWT_SECRET="mi-jwt-secret-67890-cambiar"
API_KEY="test-api-key"
```

**Opción B - PostgreSQL Local:**

1. Instala PostgreSQL si no lo tienes
2. Crea base de datos:
```sql
CREATE DATABASE passly;
```

3. Crea archivo `.env` con tus credenciales:
```env
DATABASE_URL="postgresql://TU_USUARIO:TU_PASSWORD@localhost:5432/passly?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secret-aleatorio"
JWT_SECRET="genera-otro-secret-aleatorio"
API_KEY="test-api-key"
```

### Paso 2: Ejecutar Migraciones

```powershell
npx prisma migrate dev --name init
```

Esto creará todas las tablas en la base de datos.

### Paso 3: Poblar con Datos de Prueba

```powershell
npm run db:seed
```

Esto creará usuarios de prueba, organización, evento e invitados.

### Paso 4: Iniciar Servidor

```powershell
npm run dev
```

Abre tu navegador en: **http://localhost:3000**

## 🔑 Credenciales de Prueba

Después del seed, puedes usar:

- **Super Admin**: `admin@passly.com` / `admin123`
- **Client**: `client@demo.com` / `client123`
- **Organizer**: `organizer@demo.com` / `organizer123`
- **Staff**: `staff@demo.com` / `staff123`

## 🎯 Qué Probar Primero

1. **Login**:
   - Ir a `http://localhost:3000/login`
   - Usar: `admin@passly.com` / `admin123`
   - Deberías ver el dashboard

2. **Ver Eventos**:
   - Click en "Eventos" en el menú
   - Deberías ver "Demo Event 2025" (creado por seed)

3. **Ver Invitados**:
   - Click en "Invitados"
   - Deberías ver 3 invitados de prueba

4. **Check-in**:
   - Click en "Check-in"
   - Probar con modo manual o QR

5. **Reportes**:
   - Click en "Reportes"
   - Ver métricas y estadísticas

## 🔧 Comandos Útiles

```powershell
# Ver la base de datos en el navegador
npx prisma studio

# Resetear base de datos (borrar todo y empezar de nuevo)
npm run db:reset

# Ver documentación de API
# Abrir: http://localhost:3000/api/public/v1/docs
```

## ❌ Problemas Comunes

**Error: "Can't reach database server"**
- Verifica que PostgreSQL esté corriendo
- Si usas Docker: `docker ps` (debe mostrar passly-postgres)
- Verifica DATABASE_URL en .env

**Error: "Prisma Client not generated"**
```powershell
npx prisma generate
```

**Error: "Authentication failed"**
- Verifica usuario y password en DATABASE_URL
- Si usas Docker, usa: `postgres:postgres`

**Resetear todo:**
```powershell
# Detener y borrar contenedor Docker
docker stop passly-postgres
docker rm passly-postgres

# Volver a crear
docker run --name passly-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=passly -p 5432:5432 -d postgres

# Ejecutar migraciones y seed
npx prisma migrate dev --name init
npm run db:seed
```

## 📚 Más Información

- **Setup detallado**: Ver `SETUP_GUIDE.md`
- **Testing completo**: Ver `TESTING.md`
- **Guía rápida**: Ver `QUICK_START.md`