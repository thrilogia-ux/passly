import { Resend } from "resend";
import { sendEmailDev } from "./send-dev";

// Agregar import de SMTP (lazy load)
let sendEmailSMTP: any;
try {
  const smtpModule = require("./send-smtp");
  sendEmailSMTP = smtpModule.sendEmailSMTP;
} catch (e) {
  // SMTP no disponible (no crítico)
}

// Lazy initialization to avoid build-time errors
function getResend() {
  const resendApiKey = process.env.RESEND_API_KEY || 
                       process.env.NEXT_PUBLIC_RESEND_API_KEY;
  
  if (!resendApiKey) {
    return null;
  }
  
  // Limpiar la key (remover comillas si las tiene)
  const cleanKey = resendApiKey.replace(/^["']|["']$/g, '').trim();
  
  // Validar que tenga contenido real
  if (!cleanKey || cleanKey === "" || cleanKey.length < 10) {
    return null;
  }
  
  return new Resend(cleanKey);
}

/** Adjunto para imágenes inline (CID) - compatible con Gmail/Outlook */
export interface EmailAttachment {
  cid: string;
  content: string; // base64 sin prefijo data:image/...
  filename: string;
  contentType?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export async function sendEmail(options: SendEmailOptions) {
  // 🔍 DEBUG: Mostrar información al inicio
  console.log("\n" + "=".repeat(60));
  console.log("📧 [EMAIL] INICIANDO ENVÍO");
  console.log("=".repeat(60));
  console.log("📧 [EMAIL] Destino:", options.to);
  console.log("📧 [EMAIL] Asunto:", options.subject);
  console.log("📧 [EMAIL] HTML size:", (options.html.length / 1024).toFixed(2), "KB");
  
  // Validar email de destino
  if (!options.to || !options.to.includes("@")) {
    const error = "Email de destino inválido";
    console.error("❌ [EMAIL] Error de validación:", error, options.to);
    return { success: false, error };
  }

  // Prioridad 1: Resend (principal - mejor deliverability, dominio propio)
  const resendApiKey = process.env.RESEND_API_KEY || 
                       process.env.NEXT_PUBLIC_RESEND_API_KEY;
  const cleanKey = resendApiKey ? resendApiKey.replace(/^["']|["']$/g, '').trim() : "";
  
  const useSmtpFirst = process.env.EMAIL_USE_SMTP_FIRST === "true" || process.env.EMAIL_USE_SMTP_FIRST === "1";
  console.log("🔍 [EMAIL] RESEND_API_KEY existe:", !!resendApiKey);
  console.log("🔍 [EMAIL] EMAIL_USE_SMTP_FIRST:", useSmtpFirst);
  console.log("🔍 [EMAIL] EMAIL_FROM:", process.env.EMAIL_FROM || "No configurado (usará default)");
  
  // Si EMAIL_USE_SMTP_FIRST=true: usar Gmail primero (Resend sin dominio verificado puede no entregar)
  if (useSmtpFirst && sendEmailSMTP && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    console.log("📧 [EMAIL] Usando Gmail SMTP primero...");
    try {
      const result = await sendEmailSMTP(options);
      if (result.success) return result;
      console.warn("⚠️  [EMAIL] SMTP falló, intentando Resend...");
    } catch (e: any) {
      console.warn("⚠️  [EMAIL] SMTP falló:", e?.message, "- intentando Resend...");
    }
  }
  
  // Si no hay API key válida, intentar SMTP como alternativa
  if (!cleanKey || cleanKey === "" || cleanKey.length < 10) {
    if (sendEmailSMTP && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      console.log("📧 [EMAIL] RESEND no configurado, usando Gmail SMTP...");
      try {
        const result = await sendEmailSMTP(options);
        if (result.success) return result;
      } catch (e: any) {
        console.warn("⚠️  [EMAIL] SMTP falló:", e?.message);
      }
    }
    const isProduction = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
    if (isProduction) {
      return {
        success: false,
        error: "RESEND_API_KEY no está configurada. Configura RESEND_API_KEY en las variables de entorno de Vercel.",
      };
    }
    console.warn("⚠️  [EMAIL] Usando MODO DESARROLLO (emails se guardan en: emails-dev/)");
    return await sendEmailDev(options);
  }

  // Intentar usar Resend
  const resend = getResend();
  
  if (!resend) {
    const isProduction = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
    
    if (isProduction) {
      // En producción, no intentar guardar archivos
      console.error("❌ [EMAIL] No se pudo inicializar Resend en producción");
      return {
        success: false,
        error: "No se pudo inicializar Resend. Verifica tu RESEND_API_KEY en las variables de entorno de Vercel.",
      };
    }
    
    // Solo en desarrollo local, usar modo desarrollo
    console.warn("⚠️  No se pudo inicializar Resend. Usando MODO DESARROLLO");
    return await sendEmailDev(options);
  }

  try {
    // Resend requiere un formato específico para "from"
    // Debe ser: "Nombre <email@dominio.com>" o solo "email@dominio.com"
    const fromEmail = options.from || process.env.EMAIL_FROM || "PASSLY <onboarding@resend.dev>";
    
    console.log("📧 [RESEND] ========================================");
    console.log("📧 [RESEND] Intentando enviar email");
    console.log("📧 [RESEND] Desde:", fromEmail);
    console.log("📧 [RESEND] Para:", options.to);
    console.log("📧 [RESEND] Asunto:", options.subject);
    console.log("📧 [RESEND] HTML length:", options.html.length, "caracteres");
    
    const replyTo = options.replyTo || process.env.EMAIL_REPLY_TO || undefined;
    const result = await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      ...(replyTo && { replyTo }),
      ...(options.attachments?.length && {
        attachments: options.attachments.map((a) => ({
          filename: a.filename,
          content: a.content,
          contentId: a.cid,
          ...(a.contentType && { content_type: a.contentType }),
        })),
      }),
    });

    console.log("📧 [RESEND] ========================================");
    console.log("✅ [RESEND] Email enviado exitosamente!");
    console.log("📧 [RESEND] ID:", result.data?.id || "N/A");
    
    // Verificar headers importantes
    const headers = (result as any).headers || {};
    const dailyQuota = headers["x-resend-daily-quota"];
    const monthlyQuota = headers["x-resend-monthly-quota"];
    
    if (dailyQuota === "0" || monthlyQuota === "0") {
      console.warn("⚠️  [RESEND] ADVERTENCIA: Las cuotas están en 0");
      console.warn("⚠️  [RESEND] Esto puede indicar que Resend está en modo sandbox");
      console.warn("⚠️  [RESEND] Los emails pueden no llegar realmente");
      console.warn("⚠️  [RESEND] Verifica tu cuenta de Resend y dominio");
    }
    
    console.log("📧 [RESEND] Daily Quota:", dailyQuota || "N/A");
    console.log("📧 [RESEND] Monthly Quota:", monthlyQuota || "N/A");
    console.log("📧 [RESEND] Respuesta completa:", JSON.stringify(result, null, 2));
    console.log("📧 [RESEND] ========================================");
    
    // Verificar que realmente se envió
    if (!result.data?.id) {
      console.warn("⚠️  [RESEND] Advertencia: No se recibió ID de Resend, pero no hubo error");
    }
    
    // Si las cuotas están en 0, advertir al usuario
    const warning = (dailyQuota === "0" || monthlyQuota === "0") 
      ? "Advertencia: Resend puede estar en modo sandbox. Verifica tu cuenta y dominio."
      : undefined;
    
    return { 
      success: true, 
      id: result.data?.id || undefined,
      response: result,
      warning: warning
    };
  } catch (error: any) {
    console.error("📧 [RESEND] ========================================");
    console.error("❌ [RESEND] Error enviando email con Resend");
    console.error("❌ [RESEND] Mensaje:", error.message || "Error desconocido");
    console.error("❌ [RESEND] Tipo:", error.name || "Unknown");
    console.error("❌ [RESEND] Stack:", error.stack);
    console.error("❌ [RESEND] Error completo:", JSON.stringify(error, null, 2));
    console.error("📧 [RESEND] ========================================");
    
    // Mejorar el manejo de errores de Resend
    let errorMessage = "Error desconocido al enviar email";
    
    if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error.response?.data) {
      errorMessage = JSON.stringify(error.response.data);
    }
    
    // Errores comunes de Resend
    if (errorMessage.includes("Invalid API key") || errorMessage.includes("invalid_api_key") || errorMessage.includes("401")) {
      errorMessage = "API Key de Resend inválida o expirada. Verifica tu RESEND_API_KEY en .env";
    } else if (errorMessage.includes("Invalid 'from'") || errorMessage.includes("invalid_from") || errorMessage.includes("from")) {
      errorMessage = "Email 'from' inválido. Debe ser un email verificado en Resend. Usa 'onboarding@resend.dev' para testing";
    } else if (errorMessage.includes("rate limit") || errorMessage.includes("rate_limit") || errorMessage.includes("429")) {
      errorMessage = "Límite de envíos alcanzado. Espera unos minutos o actualiza tu plan en Resend";
    } else if (errorMessage.includes("domain") || errorMessage.includes("Domain") || errorMessage.includes("verification")) {
      errorMessage = "Dominio no verificado. Usa 'onboarding@resend.dev' para testing o verifica tu dominio en Resend";
    } else if (errorMessage.includes("blocked") || errorMessage.includes("bounce")) {
      errorMessage = "El email de destino está bloqueado o ha rebotado. Verifica la dirección de email";
    }
    
    console.error("❌ [RESEND] Error procesado:", errorMessage);
    
    // Fallback: intentar SMTP (Gmail) si está configurado
    if (sendEmailSMTP && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      console.warn("⚠️  [EMAIL] Intentando fallback con Gmail SMTP...");
      try {
        const result = await sendEmailSMTP(options);
        if (result.success) return result;
      } catch (smtpError: any) {
        console.error("❌ [EMAIL] SMTP fallback también falló:", smtpError?.message);
      }
    }
    
    return { 
      success: false, 
      error: errorMessage,
      details: {
        message: error.message,
        name: error.name,
        stack: error.stack,
        response: error.response?.data || error.response,
        fullError: error
      }
    };
  }
}

export function renderInvitationTemplate(
  template: string,
  data: {
    name: string;
    eventName: string;
    eventDate: string;
    eventLocation?: string;
    qrImage?: string;
    confirmationLink?: string;
  }
): string {
  let html = template;
  html = html.replace(/{{name}}/g, data.name);
  html = html.replace(/{{eventName}}/g, data.eventName);
  html = html.replace(/{{eventDate}}/g, data.eventDate);
  html = html.replace(/{{eventLocation}}/g, data.eventLocation || "");
  html = html.replace(/{{qrImage}}/g, data.qrImage || "");
  html = html.replace(/{{confirmationLink}}/g, data.confirmationLink || "");
  return html;
}
