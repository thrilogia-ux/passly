/**
 * Script de prueba para verificar el envío de emails con Gmail SMTP
 * Uso: npx tsx scripts/test-smtp-email.ts <email-destino>
 */

import { sendEmailSMTP } from "../lib/email/send-smtp";
import * as dotenv from "dotenv";
import * as path from "path";

// Cargar variables de entorno
dotenv.config({ path: path.join(process.cwd(), ".env") });

async function testSMTPEmail() {
  const destinationEmail = process.argv[2] || "thrilogia@gmail.com";
  
  console.log("\n" + "=".repeat(60));
  console.log("🧪 TEST: Envío de Email con Gmail SMTP");
  console.log("=".repeat(60));
  console.log("");
  
  // Verificar configuración
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error("❌ SMTP_USER y SMTP_PASSWORD deben estar configurados en .env");
    process.exit(1);
  }
  
  console.log("✅ Configuración encontrada:");
  console.log("   SMTP_HOST:", process.env.SMTP_HOST || "smtp.gmail.com");
  console.log("   SMTP_PORT:", process.env.SMTP_PORT || "587");
  console.log("   SMTP_USER:", process.env.SMTP_USER);
  console.log("");
  
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
        <h1>✅ Test de Email Exitoso con Gmail SMTP</h1>
        <p>Este es un email de prueba desde PASSLY usando Gmail SMTP.</p>
        <div class="success">
          <strong>Si recibes este email, el sistema de envío con Gmail está funcionando correctamente.</strong>
        </div>
        <p>Fecha: ${new Date().toLocaleString("es-AR")}</p>
        <p>Desde: ${process.env.SMTP_USER}</p>
        <p>Para: ${destinationEmail}</p>
      </div>
    </body>
    </html>
  `;
  
  try {
    const result = await sendEmailSMTP({
      to: destinationEmail,
      subject: "Test de Email - PASSLY (Gmail SMTP)",
      html: html,
    });
    
    if (result.success) {
      console.log("");
      console.log("=".repeat(60));
      console.log("✅ ÉXITO: Email enviado correctamente con Gmail SMTP");
      console.log("📧 Message ID:", result.id || "N/A");
      console.log("=".repeat(60));
      console.log("");
      console.log("💡 Verifica tu bandeja de entrada (y spam) en unos segundos.");
    } else {
      console.error("");
      console.error("❌ ERROR: No se pudo enviar el email");
      console.error("📧 Error:", result.error);
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error("");
    console.error("❌ Error al enviar email:");
    console.error("   Mensaje:", error.message || "Error desconocido");
    console.error("");
    console.error("📋 Detalles completos del error:");
    console.error(JSON.stringify(error, null, 2));
    console.error("");
    
    process.exit(1);
  }
}

testSMTPEmail().catch(console.error);
