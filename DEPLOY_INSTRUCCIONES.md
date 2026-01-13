# 📋 Instrucciones Post-Deploy - Migraciones

## ⚠️ Importante: Ejecutar Migraciones después del Deploy

Después de que Vercel haga el deploy exitosamente, necesitas ejecutar las migraciones de Prisma manualmente.

## Opción 1: Ejecutar desde tu computadora local

```bash
# 1. Asegúrate de tener la DATABASE_URL configurada
# 2. Ejecuta las migraciones
DATABASE_URL="tu_connection_string_de_supabase" npx prisma migrate deploy
```

**O crea un archivo `.env.local` temporalmente:**

```env
DATABASE_URL=postgresql://postgres:[TU_PASSWORD]@db.yuuzxjlzddhtrdmefdmg.supabase.co:5432/postgres
```

Luego ejecuta:
```bash
npx prisma migrate deploy
```

## Opción 2: Desde Supabase SQL Editor

1. Ve a tu proyecto en Supabase
2. Ve a **SQL Editor**
3. Copia el contenido de cada archivo en `prisma/migrations/[nombre]/migration.sql`
4. Ejecuta cada uno en orden

## Opción 3: Usar Prisma Studio

```bash
DATABASE_URL="tu_connection_string" npx prisma studio
```

Y ejecuta las migraciones desde ahí.

## 📝 Nota

Las migraciones solo necesitas ejecutarlas **una vez** después del primer deploy. Los siguientes deploys no necesitan migraciones a menos que agregues nuevas.
