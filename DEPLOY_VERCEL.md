# 🚀 Guía de Deploy en Vercel - PASSLY

## ✅ Cambios Realizados

- ✅ Cambiado SQLite → PostgreSQL en `prisma/schema.prisma`
- ✅ Creado `vercel.json` con configuración optimizada
- ✅ Actualizado `package.json` con scripts para Vercel
- ✅ `.gitignore` verificado y actualizado

## 📋 Pasos para Deploy

### Paso 1: Crear Base de Datos PostgreSQL

#### Opción A: Supabase (Recomendado - Gratis)

1. Ve a https://supabase.com
2. Crea cuenta (gratis)
3. Click en "New Project"
4. Completa:
   - **Name**: `passly-production` (o el que prefieras)
   - **Database Password**: Genera una contraseña segura (GUÁRDALA)
   - **Region**: Elige la más cercana
5. Espera 2-3 minutos a que se cree el proyecto
6. Ve a **Settings** → **Database**
7. Busca **Connection string** → **URI**
8. Copia la URL completa (formato: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`)

#### Opción B: Neon (Alternativa - Gratis)

1. Ve a https://neon.tech
2. Crea cuenta (gratis)
3. Crea nuevo proyecto
4. Copia la Connection String

---

### Paso 2: Preparar Repositorio Git

#### Si ya tienes Git configurado:

```bash
# Verificar estado
git status

# Agregar cambios
git add .

# Commit
git commit -m "Prepare for Vercel deployment - PostgreSQL migration"

# Push (si ya tienes remote)
git push origin main
```

#### Si NO tienes Git configurado:

```bash
# Inicializar Git
git init

# Agregar todo
git add .

# Primer commit
git commit -m "Initial commit - PASSLY ready for Vercel"

# Crear repositorio en GitHub primero (ver Paso 3)
# Luego conecta:
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

---

### Paso 3: Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. **Repository name**: `passly-app` (o el que prefieras)
3. **Description**: "PASSLY - Plataforma SaaS de Acreditación QR"
4. **Visibility**: Private (recomendado) o Public
5. **NO marques** "Initialize with README"
6. Click en **Create repository**
7. Copia la URL del repositorio (ej: `https://github.com/tu-usuario/passly-app.git`)

---

### Paso 4: Conectar con GitHub (si no lo hiciste)

```bash
# Si ya tienes el repositorio creado en GitHub
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

---

### Paso 5: Crear Cuenta en Vercel

1. Ve a https://vercel.com
2. Click en **Sign Up**
3. Elige **Continue with GitHub**
4. Autoriza acceso a tus repositorios
5. Selecciona los repositorios que quieres conectar (o todos)

---

### Paso 6: Importar Proyecto en Vercel

1. En el dashboard de Vercel, click en **Add New...** → **Project**
2. Busca tu repositorio `passly-app` (o el nombre que usaste)
3. Click en **Import**

---

### Paso 7: Configurar Proyecto en Vercel

#### Configuración del Proyecto:

- **Framework Preset**: Next.js (auto-detectado) ✅
- **Root Directory**: `./` (raíz)
- **Build Command**: `prisma generate && prisma migrate deploy && next build` (ya configurado en vercel.json)
- **Output Directory**: `.next` (auto)
- **Install Command**: `npm install` (auto)

**NO cambies nada**, ya está configurado en `vercel.json`.

---

### Paso 8: Configurar Variables de Entorno

En la pantalla de configuración, ve a **Environment Variables** y agrega:

#### Variables OBLIGATORIAS:

```env
# Base de Datos PostgreSQL (Supabase: usar CONNECTION POOLER para evitar MaxClients)
# Pooler (Transaction): puerto 6543, host pooler.supabase.com - usar para DATABASE_URL
DATABASE_URL=postgresql://post.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true

# Conexión directa para migrations (Supabase: puerto 5432)
DIRECT_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# NextAuth
NEXTAUTH_URL=https://tu-proyecto.vercel.app
NEXTAUTH_SECRET=genera-un-secret-aleatorio-aqui

# JWT
JWT_SECRET=otro-secret-aleatorio-diferente
```

#### Variables OPCIONALES (pero recomendadas):

```env
# Email (Resend)
RESEND_API_KEY=re_tu_api_key_de_resend
EMAIL_FROM=PASSLY <noreply@tu-dominio.com>

# Google Calendar (si usas la integración)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# Ubicación en eventos: usa OpenStreetMap por defecto (gratis). Google Maps es opcional.
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key

# API Pública
API_KEY=tu_api_key_para_api_publica
```

#### Generar Secrets Aleatorios:

En tu terminal local:

```bash
# Para NEXTAUTH_SECRET
openssl rand -base64 32

# Para JWT_SECRET (genera otro diferente)
openssl rand -base64 32
```

**IMPORTANTE:**
- Aplica las variables a **Production**, **Preview** y **Development**
- NO incluyas espacios ni comillas en los valores
- Guarda los secrets en un lugar seguro

---

### Paso 9: Deploy

1. Click en **Deploy**
2. Espera 2-5 minutos mientras Vercel:
   - Instala dependencias
   - Genera Prisma Client
   - Ejecuta migraciones
   - Hace build de Next.js
3. Revisa los logs si hay errores

---

### Paso 10: Ejecutar Migraciones (Primera Vez)

Después del primer deploy, necesitas ejecutar las migraciones en la base de datos:

#### Opción A: Desde tu máquina local

```bash
# Conecta tu DATABASE_URL de producción
DATABASE_URL="tu_connection_string_de_supabase" npx prisma migrate deploy
```

#### Opción B: Desde Supabase Dashboard

1. Ve a Supabase → SQL Editor
2. Ejecuta las migraciones manualmente (copia desde `prisma/migrations`)

#### Opción C: Crear migración inicial

```bash
# Localmente, con DATABASE_URL apuntando a producción
DATABASE_URL="tu_connection_string" npx prisma migrate dev --name init
```

---

### Paso 11: Verificar Funcionamiento

1. Abre la URL de Vercel (ej: `https://passly-app.vercel.app`)
2. Prueba hacer login
3. Crea un evento de prueba
4. Verifica que todo funciona

---

## 🔄 CI/CD Automático

Una vez configurado, cada vez que hagas:

```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

Vercel automáticamente:
1. ✅ Detecta el push
2. ✅ Inicia build automático
3. ✅ Ejecuta `prisma generate && prisma migrate deploy && next build`
4. ✅ Deploy a producción (2-5 minutos)
5. ✅ Te notifica cuando termina

---

## 📊 Monitoreo

### Ver Logs:

1. Vercel Dashboard → Tu Proyecto → **Deployments**
2. Click en el deployment más reciente
3. Ver **Build Logs** y **Function Logs**

### Alertas:

1. Vercel → Settings → **Notifications**
2. Configura email/Slack para errores de build

---

## 🐛 Solución de Problemas

### Error: "Prisma Client not generated"
**Solución**: Ya está configurado en `vercel.json` y `package.json`. Verifica que el build command incluya `prisma generate`.

### Error: "Database connection failed"
**Solución**: 
- Verifica `DATABASE_URL` en Vercel
- Asegúrate de que la URL incluye la contraseña correcta
- Verifica que Supabase permite conexiones externas

### Error: "NEXTAUTH_SECRET missing"
**Solución**: Agrega la variable en Vercel → Settings → Environment Variables

### Error: "MaxClientsInSessionMode: max clients reached"
**Solución**: Usa el Connection Pooler de Supabase (puerto 6543) en lugar de la conexión directa (5432):
1. Supabase → Settings → Database → Connection string
2. Elige **Transaction** (pooler)
3. Copia la URL y agrega `?pgbouncer=true` al final
4. Usa esa URL como `DATABASE_URL` en Vercel
5. Agrega `DIRECT_DATABASE_URL` con la conexión **directa** (puerto 5432) para migrations

### Error: "Migration failed"
**Solución**: 
- Ejecuta migraciones manualmente primero (Paso 10)
- Verifica que `DATABASE_URL` y `DIRECT_DATABASE_URL` están configuradas
- Para proveedores sin pooler, usa `DIRECT_DATABASE_URL` igual que `DATABASE_URL`

### Build muy lento
**Solución**: Normal en el primer build. Los siguientes serán más rápidos gracias al cache.

---

## ✅ Checklist Final

Antes de hacer push:

- [ ] `prisma/schema.prisma` usa `postgresql` ✅
- [ ] `vercel.json` creado ✅
- [ ] `package.json` actualizado con scripts ✅
- [ ] `.gitignore` configurado ✅
- [ ] Repositorio en GitHub creado
- [ ] Variables de entorno configuradas en Vercel
- [ ] `DATABASE_URL` (pooler) y `DIRECT_DATABASE_URL` (directa) para Supabase
- [ ] `NEXTAUTH_URL` con URL de Vercel
- [ ] Secrets generados y configurados

Después del primer deploy:

- [ ] Migraciones ejecutadas en producción
- [ ] Login funciona
- [ ] Base de datos conectada
- [ ] Auto-deploy funciona (haz un cambio pequeño y verifica)

---

## 🎉 ¡Listo!

Tu aplicación ahora se actualiza automáticamente cada vez que haces push a `main`.

**URL de producción**: `https://tu-proyecto.vercel.app`

---

## 📝 Notas Adicionales

- **Primer deploy**: Puede tardar 5-10 minutos (instala dependencias, genera Prisma, etc.)
- **Deploys siguientes**: 2-5 minutos (usa cache)
- **Preview deployments**: Cada PR o branch crea un preview automático
- **Rollback**: Puedes volver a cualquier deployment anterior desde el dashboard

---

¿Necesitas ayuda? Revisa los logs en Vercel o contacta soporte.
