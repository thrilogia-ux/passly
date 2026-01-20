import { NextRequest, NextResponse } from "next/server";
import { generateQRImage } from "@/lib/qr/generate";
import { combineBackgroundWithQR } from "@/lib/invitations/combine-images";
import { imageToBase64 } from "@/lib/invitations/image-to-base64";

// Force Node.js runtime for QR code generation
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { htmlContent, cssContent, backgroundImage, qrSize = 200, qrPosition } = body;

    // Generar QR de ejemplo
    const exampleQRToken = "preview-token-example-" + Date.now();
    const qrImage = await generateQRImage(exampleQRToken);

    // Función helper para generar link de Google Maps
    const getGoogleMapsLink = (location: string) => {
      if (!location) return "";
      const encodedLocation = encodeURIComponent(location);
      return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    };

    // Datos de ejemplo para el preview
    const exampleData = {
      name: "Juan Pérez",
      eventName: "Evento de Ejemplo",
      eventDate: new Date().toLocaleDateString("es-AR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      eventLocation: "Salón Principal, Calle Falsa 123",
    };

    // Si hay HTML/CSS, reemplazar placeholders
    let previewHTML = "";
    if (htmlContent) {
      let html = htmlContent;
      
      // Reemplazar placeholders
      html = html.replace(/\{\{name\}\}/g, exampleData.name);
      html = html.replace(/\{\{eventName\}\}/g, exampleData.eventName);
      html = html.replace(/\{\{eventDate\}\}/g, exampleData.eventDate);
      html = html.replace(/\{\{eventLocation\}\}/g, exampleData.eventLocation);
      
      // Reemplazar {{qrImage}} con el QR generado
      html = html.replace(
        /\{\{qrImage\}\}/g,
        `<img src="${qrImage}" alt="QR Code" style="width: ${qrSize}px; height: ${qrSize}px; display: block; margin: 20px auto;" />`
      );
      
      // Reemplazar {{rsvpButtons}} con botón de confirmación (un solo botón)
      const rsvpButtons = `
        <div style="margin: 30px 0; text-align: center; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <h3 style="margin-bottom: 15px; color: #303030; font-size: 18px;">Confirma tu asistencia</h3>
          <a href="#" 
             style="display: inline-block; padding: 14px 40px; background-color: #ff5040; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            ✅ Confirmar Asistencia
          </a>
          <p style="margin-top: 15px; font-size: 12px; color: #666;">
            O haz clic <a href="#" style="color: #ff5040; text-decoration: underline;">aquí</a> para más opciones
          </p>
        </div>
      `;
      html = html.replace(/\{\{rsvpButtons\}\}/g, rsvpButtons);
      
      // Envolver en estructura HTML completa
      previewHTML = `
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
              ${cssContent || ""}
            </style>
          </head>
          <body>
            ${html}
          </body>
        </html>
      `;
    } else if (backgroundImage) {
      // Si hay imagen de fondo, combinar con QR en la posición especificada
      let combinedImageUrl: string;
      
      // Si hay qrPosition, usar esa posición
      let finalQrPosition;
      if (qrPosition && qrPosition.x !== undefined && qrPosition.y !== undefined) {
        finalQrPosition = {
          x: qrPosition.x,
          y: qrPosition.y,
          width: qrPosition.width || qrSize,
          height: qrPosition.height || qrSize,
        };
      } else {
        // Por defecto: centrado horizontalmente, 80% verticalmente (como el editor simple)
        // Usar valores que indiquen "calcular automáticamente" - combineBackgroundWithQR
        // calculará basándose en las dimensiones reales de la imagen
        finalQrPosition = {
          x: -1, // Valor especial: indica que debe calcularse como centrado
          y: -1, // Valor especial: indica que debe calcularse (80% vertical)
          width: qrSize,
          height: qrSize,
        };
      }
      
      try {
        // Intentar combinar imagen con QR usando la misma función que se usa en producción
        combinedImageUrl = await combineBackgroundWithQR(
          backgroundImage,
          qrImage,
          finalQrPosition
        );
      } catch (error: any) {
        console.error("❌ Error combining images in preview:", error);
        console.error("❌ Error details:", {
          message: error.message,
          stack: error.stack,
          backgroundImage,
          qrPosition: finalQrPosition,
        });
        
        // NO hacer fallback silencioso - el QR debe aparecer siempre
        // Si falla la combinación, lanzar el error para que el usuario sepa
        throw new Error(`Error al combinar imagen con QR: ${error.message}`);
      }
      
      previewHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                background-color: #f5f5f5;
              }
              .preview-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
              }
              .combined-image {
                width: 100%;
                height: auto;
                display: block;
              }
            </style>
          </head>
          <body>
            <div class="preview-container">
              <img src="${combinedImageUrl}" alt="Template preview with QR" class="combined-image" />
            </div>
          </body>
        </html>
      `;
    } else {
      // Preview por defecto
      previewHTML = `
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
                line-height: 1.6;
                background: #f5f5f5;
              }
            </style>
          </head>
          <body>
            <div style="background: white; padding: 40px; border-radius: 8px;">
              <h1 style="color: #303030;">Invitación a ${exampleData.eventName}</h1>
              <p>Hola ${exampleData.name},</p>
              <p>Estás invitado al evento: <strong>${exampleData.eventName}</strong></p>
              <p>Fecha: ${exampleData.eventDate}</p>
              <p>Ubicación: ${(() => {
                const mapsLink = getGoogleMapsLink(exampleData.eventLocation);
                return mapsLink 
                  ? `<a href="${mapsLink}" target="_blank" style="color: #ff5040; text-decoration: none;">${exampleData.eventLocation}</a> <span style="font-size: 11px; color: #999;">(Ver en Google Maps)</span>`
                  : exampleData.eventLocation;
              })()}</p>
              <div style="margin: 20px 0; text-align: center;">
                <img src="${qrImage}" alt="QR Code" style="width: ${qrSize}px; height: ${qrSize}px;" />
              </div>
            </div>
          </body>
        </html>
      `;
    }

    return NextResponse.json({ previewHTML });
  } catch (error: any) {
    console.error("Error generating preview:", error);
    return NextResponse.json(
      { error: error.message || "Error generating preview" },
      { status: 500 }
    );
  }
}