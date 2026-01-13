/**
 * Script de prueba para verificar el envío de emails con Resend
 * Uso: tsx scripts/test-email.ts <email-destino>
 */

import { Resend } from "resend";
import * as dotenv from "dotenv";
import * as path from "path";

// Cargar variables de entorno
dotenv.config({ path: path.join(process.cwd(), ".env") });

async function testEmail() {
  const destinationEmail = process.argv[2] || "thrilogia@gmail.com";
  
  console.log("🧪 Test de envío de email con Resend");
  console.log("=====================================");
  console.log("");
  
  // Verificar API Key
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("❌ RESEND_API_KEY no está configurada en .env");
    process.exit(1);
  }
  
  const cleanKey = apiKey.replace(/^["']|["']$/g, '').trim();
  console.log("✅ API Key encontrada:", cleanKey.substring(0, 10) + "...");
  console.log("");
  
  // Inicializar Resend
  const resend = new Resend(cleanKey);
  
  // Configurar email
  const fromEmail = process.env.EMAIL_FROM || "PASSLY <onboarding@resend.dev>";
  const subject = "Test de Email - PASSLY";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          color: #00b5ff;
        }
        .success {
          background: #cdfa55;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✅ Test de Email Exitoso</h1>
        <p>Este es un email de prueba desde PASSLY.</p>
        <div class="success">
          <strong>Si recibes este email, el sistema de envío está funcionando correctamente.</strong>
        </div>
        <p>Fecha: ${new Date().toLocaleString("es-AR")}</p>
        <p>Desde: ${fromEmail}</p>
        <p>Para: ${destinationEmail}</p>
      </div>
    </body>
    </html>
  `;
  
  console.log("📧 Configuración del email:");
  console.log("   Desde:", fromEmail);
  console.log("   Para:", destinationEmail);
  console.log("   Asunto:", subject);
  console.log("");
  
  try {
    console.log("📤 Enviando email...");
    const result = await resend.emails.send({
      from: fromEmail,
      to: destinationEmail,
      subject: subject,
      html: html,
    });
    
    console.log("");
    console.log("✅ Email enviado exitosamente!");
    console.log("   ID:", result.data?.id || "N/A");
    console.log("");
    console.log("📋 Respuesta completa de Resend:");
    console.log(JSON.stringify(result, null, 2));
    console.log("");
    console.log("💡 Verifica tu bandeja de entrada (y spam) en unos segundos.");
    
  } catch (error: any) {
    console.error("");
    console.error("❌ Error al enviar email:");
    console.error("   Mensaje:", error.message || "Error desconocido");
    console.error("");
    console.error("📋 Detalles completos del error:");
    console.error(JSON.stringify(error, null, 2));
    console.error("");
    
    // Errores comunes
    if (error.message?.includes("Invalid API key") || error.message?.includes("invalid_api_key")) {
      console.error("💡 Solución: Verifica que tu RESEND_API_KEY sea correcta");
    } else if (error.message?.includes("Invalid 'from'") || error.message?.includes("invalid_from")) {
      console.error("💡 Solución: El email 'from' debe estar verificado en Resend");
      console.error("   Usa 'onboarding@resend.dev' para testing o verifica tu dominio");
    } else if (error.message?.includes("rate limit")) {
      console.error("💡 Solución: Has alcanzado el límite de envíos. Espera unos minutos");
    } else if (error.message?.includes("domain")) {
      console.error("💡 Solución: Verifica tu dominio en Resend o usa 'onboarding@resend.dev'");
    }
    
    process.exit(1);
  }
}

testEmail().catch(console.error);
