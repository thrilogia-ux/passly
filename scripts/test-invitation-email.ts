/**
 * Script que simula el envío real de una invitación desde la aplicación
 * Uso: npx tsx scripts/test-invitation-email.ts <email-destino>
 */

import { sendEmail } from "../lib/email/send";
import { generateInvitationWithQR } from "../lib/invitations/generate";
import { generateQRImage } from "../lib/qr/generate";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

async function testInvitationEmail() {
  const destinationEmail = process.argv[2] || "thrilogia@gmail.com";
  
  console.log("\n" + "=".repeat(60));
  console.log("🧪 TEST: Envío de Invitación (Simulación Real)");
  console.log("=".repeat(60));
  console.log("");
  
  // Simular datos de invitación
  const qrToken = "test-token-" + Date.now();
  const confirmationToken = "test-confirmation-" + Date.now();
  
  console.log("📋 Generando HTML de invitación...");
  
  // Generar QR
  const qrImage = await generateQRImage(qrToken);
  console.log("✅ QR generado, tamaño:", (qrImage.length / 1024).toFixed(2), "KB");
  
  // Generar HTML completo (como lo hace la app, con adjuntos CID)
  const invitationResult = await generateInvitationWithQR({
    template: {},
    qrToken: qrToken,
    confirmationToken: confirmationToken,
    data: {
      name: "Invitado de Prueba",
      eventName: "Evento de Prueba",
      eventDate: new Date().toLocaleDateString("es-AR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      eventLocation: "Ubicación de Prueba",
    },
  });
  
  console.log("✅ HTML generado, tamaño total:", (invitationResult.html.length / 1024).toFixed(2), "KB");
  console.log("✅ Adjuntos CID:", invitationResult.attachments.length);
  console.log("");
  
  // Enviar usando la misma función que la app
  console.log("📤 Enviando email usando sendEmail()...");
  console.log("");
  
  const result = await sendEmail({
    to: destinationEmail,
    subject: "Invitación de Prueba - PASSLY",
    html: invitationResult.html,
    attachments: invitationResult.attachments,
  });
  
  console.log("");
  console.log("=".repeat(60));
  
  if (result.success) {
    console.log("✅ ÉXITO: Email enviado correctamente");
    console.log("📧 ID:", result.id || "N/A");
    if (result.warning) {
      console.log("⚠️  Advertencia:", result.warning);
    }
  } else {
    console.log("❌ ERROR: No se pudo enviar el email");
    console.log("📧 Error:", result.error);
    if (result.details) {
      console.log("📧 Detalles:", JSON.stringify(result.details, null, 2));
    }
  }
  
  console.log("=".repeat(60));
  console.log("");
}

testInvitationEmail().catch(console.error);
