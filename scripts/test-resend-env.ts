// Script para verificar que RESEND_API_KEY se está cargando
console.log("🔍 Verificando variables de entorno...");
console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? `✅ Configurada (${process.env.RESEND_API_KEY.substring(0, 10)}...)` : "❌ NO CONFIGURADA");
console.log("EMAIL_FROM:", process.env.EMAIL_FROM || "❌ NO CONFIGURADA");
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "❌ NO CONFIGURADA");
