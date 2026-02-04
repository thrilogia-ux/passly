import nodemailer from "nodemailer";

export interface EmailAttachment {
  cid: string;
  content: string;
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

export async function sendEmailSMTP(options: SendEmailOptions) {
  console.log("\n" + "=".repeat(60));
  console.log("📧 [SMTP] INICIANDO ENVÍO CON GMAIL");
  console.log("=".repeat(60));
  console.log("📧 [SMTP] Host:", process.env.SMTP_HOST);
  console.log("📧 [SMTP] Port:", process.env.SMTP_PORT);
  console.log("📧 [SMTP] User:", process.env.SMTP_USER);
  console.log("📧 [SMTP] Para:", options.to);
  console.log("📧 [SMTP] Asunto:", options.subject);
  console.log("📧 [SMTP] HTML size:", (options.html.length / 1024).toFixed(2), "KB");

  // Validar configuración
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    throw new Error("SMTP_USER y SMTP_PASSWORD deben estar configurados en .env");
  }

  // Configurar transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true para puerto 465, false para otros
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Verificar conexión
  try {
    await transporter.verify();
    console.log("✅ [SMTP] Conexión verificada correctamente");
  } catch (error: any) {
    console.error("❌ [SMTP] Error verificando conexión:", error.message);
    throw new Error(`Error de conexión SMTP: ${error.message}`);
  }

  const fromEmail = options.from || process.env.EMAIL_FROM || process.env.SMTP_USER || "PASSLY <passlysend@gmail.com>";
  const replyTo = options.replyTo || process.env.EMAIL_REPLY_TO || undefined;

  const attachments = options.attachments?.map((a) => ({
    filename: a.filename,
    content: Buffer.from(a.content, "base64"),
    cid: a.cid,
  }));

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      ...(replyTo && { replyTo }),
      ...(attachments?.length && { attachments }),
    });

    console.log("✅ [SMTP] Email enviado exitosamente!");
    console.log("📧 [SMTP] Message ID:", info.messageId);
    console.log("📧 [SMTP] Response:", info.response);
    console.log("=".repeat(60));

    return {
      success: true,
      id: info.messageId,
      response: info,
    };
  } catch (error: any) {
    console.error("❌ [SMTP] Error enviando email:", error.message);
    console.error("❌ [SMTP] Detalles:", error);
    console.log("=".repeat(60));
    
    return {
      success: false,
      error: error.message || "Error desconocido",
      details: error,
    };
  }
}
