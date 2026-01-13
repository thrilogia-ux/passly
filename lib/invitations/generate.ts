import { generateQRImage } from "@/lib/qr/generate";
import { imageToBase64 } from "./image-to-base64";
import { combineBackgroundWithQR } from "./combine-images";

export interface GenerateInvitationOptions {
  template: {
    backgroundImage?: string | null;
    htmlContent?: string | null;
    cssContent?: string | null;
    qrPosition?: {
      zone?: string;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      previewWidth?: number;
      previewHeight?: number;
      percentX?: number;
      percentY?: number;
      percentWidth?: number;
      percentHeight?: number;
      realImageWidth?: number;
      realImageHeight?: number;
    } | null;
    qrSize?: number | null;
  };
  qrToken: string;
  confirmationToken?: string | null;
  data: {
    name: string;
    eventName: string;
    eventDate: string;
    eventLocation?: string;
  };
}

export async function generateInvitationWithQR(
  options: GenerateInvitationOptions
): Promise<string> {
  const { template, qrToken, data, confirmationToken } = options;

  // Generar imagen del QR
  const qrImage = await generateQRImage(qrToken);
  const qrSize = template.qrSize || 200;
  
  // URL pública para confirmación
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3002";
  const confirmUrl = confirmationToken 
    ? `${baseUrl}/invitation/${confirmationToken}/rsvp`
    : null;
  
  // Botones de confirmación RSVP
  const rsvpButtons = confirmUrl ? `
    <div style="margin: 30px 0; text-align: center; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <h3 style="margin-bottom: 15px; color: #303030; font-size: 18px;">Confirma tu asistencia</h3>
      <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-bottom: 15px;">
        <a href="${confirmUrl}?response=YES" 
           style="display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; transition: background-color 0.3s;">
          ✅ Confirmar Asistencia
        </a>
        <a href="${confirmUrl}?response=NO" 
           style="display: inline-block; padding: 12px 30px; background-color: #f44336; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; transition: background-color 0.3s;">
          ❌ No puedo asistir
        </a>
      </div>
      <p style="margin-top: 15px; font-size: 12px; color: #666;">
        O haz clic <a href="${confirmUrl}" style="color: #00b5ff; text-decoration: underline;">aquí</a> para más opciones y detalles
      </p>
    </div>
  ` : "";

  // Si hay imagen de fondo, combinar con QR en la posición especificada
  if (template.backgroundImage) {
    const qrPosition = template.qrPosition || { x: 100, y: 100, width: qrSize, height: qrSize };
    const qrWidth = qrPosition.width || qrSize;
    const qrHeight = qrPosition.height || qrSize;
    
    // Combinar imagen de fondo con QR en la posición correcta
    let combinedImageUrl: string;
    try {
      combinedImageUrl = await combineBackgroundWithQR(
        template.backgroundImage,
        qrImage,
        {
          x: qrPosition.x || 100,
          y: qrPosition.y || 100,
          width: qrWidth,
          height: qrHeight,
        }
      );
    } catch (error: any) {
      console.error("Error combining images:", error);
      // Si falla, usar imagen de fondo sola y QR separado como fallback
      try {
        const backgroundImageUrl = await imageToBase64(template.backgroundImage);
        combinedImageUrl = backgroundImageUrl;
      } catch (fallbackError: any) {
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3002";
        combinedImageUrl = template.backgroundImage.startsWith("/") 
          ? `${baseUrl}${template.backgroundImage}`
          : template.backgroundImage;
      }
    }
    
    // Si hay htmlContent, combinarlo con la imagen de fondo
    let invitationContent = "";
    if (template.htmlContent) {
      // Reemplazar placeholders en el HTML content
      let html = template.htmlContent;
      html = html.replace(/{{name}}/g, data.name);
      html = html.replace(/{{eventName}}/g, data.eventName);
      html = html.replace(/{{eventDate}}/g, data.eventDate);
      html = html.replace(/{{eventLocation}}/g, data.eventLocation || "");
      html = html.replace(/{{confirmUrl}}/g, confirmUrl || "");
      invitationContent = html;
    } else {
      // Contenido por defecto si no hay htmlContent
      invitationContent = `
        <div style="padding: 40px 20px; text-align: center; background: rgba(255, 255, 255, 0.95); margin: 20px; border-radius: 8px;">
          <h1 style="color: #303030; margin-bottom: 10px; font-size: 28px;">${data.eventName}</h1>
          <p style="color: #666; font-size: 16px; margin-bottom: 5px;">Hola ${data.name},</p>
          <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Estás invitado a este evento especial</p>
          <div style="margin: 20px 0;">
            <p style="color: #303030; font-weight: bold; margin-bottom: 5px;">📅 Fecha:</p>
            <p style="color: #666; font-size: 14px;">${data.eventDate}</p>
            ${data.eventLocation ? `
              <p style="color: #303030; font-weight: bold; margin-top: 15px; margin-bottom: 5px;">📍 Ubicación:</p>
              <p style="color: #666; font-size: 14px;">${data.eventLocation}</p>
            ` : ""}
          </div>
        </div>
      `;
    }
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .email-wrapper {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            .invitation-container {
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
            }
            .background-image {
              width: 100%;
              height: auto;
              display: block;
            }
            .content-section {
              padding: 20px;
              background: white;
            }
            ${template.cssContent || ""}
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="invitation-container">
              <img src="${combinedImageUrl}" alt="Invitation with QR Code" class="background-image" />
            </div>
            <div class="content-section">
              ${invitationContent}
              ${rsvpButtons}
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Si hay HTML content (sin backgroundImage), usar template con placeholders
  if (template.htmlContent && !template.backgroundImage) {
    let html = template.htmlContent;
    
    // Asegurar que tenga estructura HTML completa
    const hasDoctype = html.includes("<!DOCTYPE") || html.includes("<html");
    const hasHead = html.includes("<head>");
    const hasBody = html.includes("<body>");
    
    // Si no tiene estructura completa, envolverlo
    if (!hasDoctype || !hasHead || !hasBody) {
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${template.cssContent ? `<style>${template.cssContent}</style>` : ""}
          </head>
          <body>
            ${html}
          </body>
        </html>
      `;
    } else if (template.cssContent && !html.includes(template.cssContent)) {
      // Si tiene estructura pero no tiene el CSS, agregarlo
      html = html.replace("</head>", `<style>${template.cssContent}</style></head>`);
    }
    
    // Reemplazar placeholders
    html = html.replace(/{{name}}/g, data.name);
    html = html.replace(/{{eventName}}/g, data.eventName);
    html = html.replace(/{{eventDate}}/g, data.eventDate);
    html = html.replace(/{{eventLocation}}/g, data.eventLocation || "");
    html = html.replace(/{{qrImage}}/g, `<img src="${qrImage}" alt="QR Code" style="width: ${qrSize}px; height: ${qrSize}px; display: block; margin: 20px auto;" />`);
    html = html.replace(/{{rsvpButtons}}/g, rsvpButtons);
    html = html.replace(/{{confirmUrl}}/g, confirmUrl || "");
    
    return html;
  }

  // Template por defecto
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <h1 style="color: #303030;">Invitación a ${data.eventName}</h1>
        <p>Hola ${data.name},</p>
        <p>Estás invitado al evento: <strong>${data.eventName}</strong></p>
        <p>Fecha: ${data.eventDate}</p>
        ${data.eventLocation ? `<p>Ubicación: ${data.eventLocation}</p>` : ""}
        <div style="margin: 20px 0; text-align: center;">
          <img src="${qrImage}" alt="QR Code" style="width: ${qrSize}px; height: ${qrSize}px;" />
          <p style="font-size: 12px; color: #666; margin-top: 10px;">Presenta este código QR en el evento</p>
        </div>
        ${rsvpButtons}
      </body>
    </html>
  `;
}
