// Modo de desarrollo: guarda emails en archivos en lugar de enviarlos
import * as fs from "fs";
import * as path from "path";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmailDev(options: SendEmailOptions) {
  try {
    // Crear directorio para emails de desarrollo
    const emailsDir = path.join(process.cwd(), "emails-dev");
    if (!fs.existsSync(emailsDir)) {
      fs.mkdirSync(emailsDir, { recursive: true });
    }

    // Generar nombre de archivo único
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `email-${timestamp}-${options.to.replace(/[@.]/g, "-")}.html`;
    const filepath = path.join(emailsDir, filename);

    // Crear contenido del email
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${options.subject}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    .email-container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { border-bottom: 2px solid #00b5ff; padding-bottom: 10px; margin-bottom: 20px; }
    .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
    .content { line-height: 1.6; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h2>📧 Email de Desarrollo (No Enviado)</h2>
    </div>
    <div class="meta">
      <p><strong>Para:</strong> ${options.to}</p>
      <p><strong>De:</strong> ${options.from || "PASSLY <noreply@passly.dev>"}</p>
      <p><strong>Asunto:</strong> ${options.subject}</p>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString("es-AR")}</p>
      <p><strong>Archivo:</strong> ${filename}</p>
    </div>
    <div class="content">
      ${options.html}
    </div>
  </div>
</body>
</html>
    `;

    // Guardar archivo
    fs.writeFileSync(filepath, emailContent, "utf-8");

    console.log("📧 [MODO DESARROLLO] Email guardado en:", filepath);
    console.log("📧 Para:", options.to);
    console.log("📧 Asunto:", options.subject);
    console.log("📧 Abre el archivo en tu navegador para ver el email");

    return {
      success: true,
      id: `dev-${timestamp}`,
      filepath: filepath,
      message: `Email guardado en: ${filepath}`,
    };
  } catch (error: any) {
    console.error("❌ Error guardando email de desarrollo:", error);
    return {
      success: false,
      error: error.message || "Error guardando email",
    };
  }
}
