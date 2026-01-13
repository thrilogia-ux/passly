# Solución para Error 500 en Página Raíz

## Problema
El error `GET http://localhost:3002/ 500 (Internal Server Error)` ocurre porque falta la variable `NEXTAUTH_SECRET` en el archivo `.env`.

## Solución

### 1. Agregar NEXTAUTH_SECRET al .env

Abre tu archivo `.env` y agrega estas líneas si no existen:

```env
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="tu-secret-aqui-genera-uno-aleatorio"
```

### 2. Generar un Secret Aleatorio

Ejecuta este comando para generar un secret seguro:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copia el resultado y úsalo como `NEXTAUTH_SECRET` en tu `.env`.

### 3. Ejemplo de .env completo

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth (REQUERIDO)
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="pega-aqui-el-secret-generado"

# JWT
JWT_SECRET="otro-secret-aleatorio-aqui"

# API Key
API_KEY="test-api-key"

# Email (Resend) - Opcional para testing
RESEND_API_KEY="re_tu_api_key_aqui"
EMAIL_FROM="PASSLY <onboarding@resend.dev>"
```

### 4. Reiniciar el servidor

Después de agregar las variables, **reinicia completamente el servidor**:

```bash
# Detén el servidor (Ctrl+C)
npm run dev
```

## Verificación

Después de reiniciar, la página raíz (`http://localhost:3002/`) debería:
- Redirigir a `/login` si no estás autenticado
- Redirigir a `/dashboard` si estás autenticado
- **NO** mostrar error 500

## Si el error persiste

1. Verifica que el archivo `.env` esté en la raíz del proyecto
2. Verifica que no haya espacios extra en las variables
3. Verifica que el servidor se haya reiniciado completamente
4. Revisa la consola del servidor para ver el error específico
