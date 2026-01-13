# ⚡ Configurar Resend AHORA - 2 Opciones

## Opción 1: Script Automático (RECOMENDADO)

Ejecuta este comando en PowerShell:

```powershell
.\scripts\setup-resend.ps1
```

El script te pedirá tu API Key y configurará todo automáticamente.

## Opción 2: Manual (Rápido)

### Paso 1: Obtener API Key
1. Ve a: **https://resend.com**
2. Inicia sesión o crea cuenta
3. **API Keys** → **Create API Key**
4. Copia la key (empieza con `re_`)

### Paso 2: Editar .env
Abre `.env` y cambia:
```env
RESEND_API_KEY=""
```

Por:
```env
RESEND_API_KEY="re_tu_key_aqui"
```

### Paso 3: Reiniciar
Ya está preparado. Solo ejecuta:
```powershell
npm run dev
```

## ✅ Listo

Después de agregar la key y reiniciar, los emails funcionarán.
