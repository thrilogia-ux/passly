# 🚀 Setup Inmediato - PASSLY

## ⚠️ Requisito: PostgreSQL

PASSLY requiere PostgreSQL. Tienes 2 opciones:

### Opción 1: Docker (RECOMENDADO - 2 minutos)

1. **Instalar Docker Desktop** (si no lo tienes):
   - Descarga: https://www.docker.com/products/docker-desktop
   - Instala y reinicia tu PC

2. **Iniciar PostgreSQL en Docker**:
```powershell
docker run --name passly-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=passly -p 5432:5432 -d postgres
```

3. **El archivo .env ya está creado** con la configuración correcta

4. **Ejecutar migraciones**:
```powershell
npx prisma migrate dev --name init
```

5. **Ejecutar seed**:
```powershell
npm run db:seed
```

6. **Iniciar servidor**:
```powershell
npm run dev
```

**Listo!** Abre: http://localhost:3000

---

### Opción 2: PostgreSQL Local (10 minutos)

1. **Instalar PostgreSQL**:
   - Windows: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   - Descarga e instala PostgreSQL 15 o superior
   - **Importante**: Anota la contraseña que configuras durante la instalación

2. **Crear base de datos**:
   - Abre "pgAdmin" o "SQL Shell (psql)"
   - Ejecuta:
   ```sql
   CREATE DATABASE passly;
   ```

3. **Actualizar .env**:
   - Edita el archivo `.env`
   - Cambia `DATABASE_URL` con tu usuario y contraseña:
   ```
   DATABASE_URL="postgresql://TU_USUARIO:TU_PASSWORD@localhost:5432/passly?schema=public"
   ```
   - Por defecto el usuario suele ser `postgres`

4. **Ejecutar migraciones**:
```powershell
npx prisma migrate dev --name init
```

5. **Ejecutar seed**:
```powershell
npm run db:seed
```

6. **Iniciar servidor**:
```powershell
npm run dev
```

**Listo!** Abre: http://localhost:3000

---

## 🔑 Credenciales de Prueba

Una vez ejecutado el seed:

- **Super Admin**: `admin@passly.com` / `admin123`
- **Client**: `client@demo.com` / `client123`
- **Organizer**: `organizer@demo.com` / `organizer123`
- **Staff**: `staff@demo.com` / `staff123`

---

## ✅ Estado Actual

- ✅ Dependencias instaladas
- ✅ Prisma Client generado
- ✅ Archivo .env creado
- ⏳ Falta: PostgreSQL corriendo

**Una vez que tengas PostgreSQL corriendo, ejecuta:**
```powershell
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

¡Y listo! 🎉