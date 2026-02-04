import { generateQRImage } from "@/lib/qr/generate";
import { imageToBase64 } from "./image-to-base64";
import { combineBackgroundWithQR } from "./combine-images";

/** Resultado con HTML y adjuntos para CID (Gmail/Outlook compatibles) */
export interface GenerateInvitationResult {
  html: string;
  attachments: Array<{ cid: string; content: string; filename: string; contentType?: string }>;
}

function dataUrlToBase64(dataUrl: string): string {
  const match = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
  return match ? match[1] : dataUrl;
}

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
): Promise<GenerateInvitationResult> {
  const { template, qrToken, data, confirmationToken } = options;

  // Generar imagen del QR
  const qrImage = await generateQRImage(qrToken);
  const qrSize = template.qrSize || 200;
  
  // URL pública para confirmación
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3002";
  const confirmUrl = confirmationToken 
    ? `${baseUrl}/invitation/${confirmationToken}/rsvp`
    : null;
  
  // Función helper para generar link de Google Maps
  const getGoogleMapsLink = (location: string) => {
    if (!location) return "";
    const encodedLocation = encodeURIComponent(location);
    return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  };
  
  // Botón de confirmación RSVP - UN SOLO BOTÓN
  const rsvpButtons = confirmUrl ? `
       <div style="margin: 30px 0; text-align: center; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
         <h3 style="margin-bottom: 15px; color: #303030; font-size: 18px;">Confirma tu asistencia</h3>
         <a href="${confirmUrl}?response=YES" 
            style="display: inline-block; padding: 14px 40px; background-color: #ff5040; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: background-color 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
           ✅ Confirmar Asistencia
         </a>
         <p style="margin-top: 15px; font-size: 12px; color: #666;">
           O haz clic <a href="${confirmUrl}" style="color: #ff5040; text-decoration: underline;">aquí</a> para más opciones
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
      // Si falla, usar imagen de fondo en base64 (evitar URLs externas: Gmail/spam bloquean)
      try {
        combinedImageUrl = await imageToBase64(template.backgroundImage);
      } catch (fallbackError: any) {
        console.error("Fallback imageToBase64 failed:", fallbackError);
        // Nunca usar URLs externas en emails: clientes bloquean imágenes remotas
        // Usar placeholder base64 1x1 transparente para no romper el layout
        combinedImageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
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
      
      // Reemplazar {{eventLocation}} con link de Google Maps si existe ubicación
         const mapsLink = data.eventLocation ? getGoogleMapsLink(data.eventLocation) : "";
      if (mapsLink) {
        html = html.replace(
          /{{eventLocation}}/g, 
          `<a href="${mapsLink}" target="_blank" style="color: #00b5ff; text-decoration: none; border-bottom: 1px solid #00b5ff;">${data.eventLocation}</a> <span style="font-size: 11px; color: #999;">(Ver en Google Maps)</span>`
        );
      } else {
        html = html.replace(/{{eventLocation}}/g, data.eventLocation || "");
      }
      
      html = html.replace(/{{confirmUrl}}/g, confirmUrl || "");
      invitationContent = html;
    } else {
      // Contenido por defecto si no hay htmlContent
      const mapsLink = data.eventLocation ? getGoogleMapsLink(data.eventLocation) : "";
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
                 ${mapsLink ? `
                   <p style="color: #666; font-size: 14px;">
                     <a href="${mapsLink}" target="_blank" style="color: #ff5040; text-decoration: none; border-bottom: 1px solid #ff5040;">
                       ${data.eventLocation}
                     </a>
                     <span style="font-size: 11px; color: #999; margin-left: 5px;">(Ver en Google Maps)</span>
                   </p>
                 ` : `
                   <p style="color: #666; font-size: 14px;">${data.eventLocation}</p>
                 `}
            ` : ""}
          </div>
        </div>
      `;
    }
    
    const attachment = {
      cid: "invitation-bg",
      content: dataUrlToBase64(combinedImageUrl),
      filename: "invitation.png",
      contentType: "image/png",
    };
    return {
      html: `
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
              <img src="cid:invitation-bg" alt="Invitation with QR Code" class="background-image" />
            </div>
            <div class="content-section">
              ${invitationContent}
              ${rsvpButtons}
            </div>
          </div>
        </body>
      </html>
    `,
      attachments: [attachment],
    };
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
    
    // Reemplazar {{eventLocation}} con link de Google Maps si existe ubicación
    const mapsLinkForTemplate = data.eventLocation ? getGoogleMapsLink(data.eventLocation) : "";
    if (mapsLinkForTemplate) {
      html = html.replace(
        /{{eventLocation}}/g, 
        `<a href="${mapsLinkForTemplate}" target="_blank" style="color: #00b5ff; text-decoration: none; border-bottom: 1px solid #00b5ff;">${data.eventLocation}</a> <span style="font-size: 11px; color: #999;">(Ver en Google Maps)</span>`
      );
    } else {
      html = html.replace(/{{eventLocation}}/g, data.eventLocation || "");
    }
    
    html = html.replace(/{{qrImage}}/g, `<img src="cid:qr-code" alt="QR Code" style="width: ${qrSize}px; height: ${qrSize}px; display: block; margin: 20px auto;" />`);
    html = html.replace(/{{rsvpButtons}}/g, rsvpButtons);
    html = html.replace(/{{confirmUrl}}/g, confirmUrl || "");
    
    return {
      html,
      attachments: [{
        cid: "qr-code",
        content: dataUrlToBase64(qrImage),
        filename: "qr-code.png",
        contentType: "image/png",
      }],
    };
  }

  // Template por defecto
  const mapsLink = data.eventLocation ? getGoogleMapsLink(data.eventLocation) : "";
  return {
    html: `
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
             ${data.eventLocation ? `
               <p>Ubicación: ${mapsLink ? `<a href="${mapsLink}" target="_blank" style="color: #ff5040; text-decoration: none;">${data.eventLocation}</a> <span style="font-size: 11px; color: #999;">(Ver en Google Maps)</span>` : data.eventLocation}</p>
             ` : ""}
        <div style="margin: 20px 0; text-align: center;">
          <img src="cid:qr-code" alt="QR Code" style="width: ${qrSize}px; height: ${qrSize}px;" />
          <p style="font-size: 12px; color: #666; margin-top: 10px;">Presenta este código QR en el evento</p>
        </div>
        ${rsvpButtons}
      </body>
    </html>
  `,
    attachments: [{
      cid: "qr-code",
      content: dataUrlToBase64(qrImage),
      filename: "qr-code.png",
      contentType: "image/png",
    }],
  };
}
