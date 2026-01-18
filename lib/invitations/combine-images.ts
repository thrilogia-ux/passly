import sharp from "sharp";
import fs from "fs";
import path from "path";

/**
 * Combine background image with QR code at specified position
 * Returns base64 data URL of the combined image
 */
export async function combineBackgroundWithQR(
  backgroundImagePath: string,
  qrDataUrl: string,
  position: { 
    zone?: string; // Nueva: zona predefinida (top-left, top-center, etc.)
    x?: number; 
    y?: number; 
    width?: number; 
    height?: number;
    // Opcional: dimensiones del preview para cálculo preciso
    previewWidth?: number;
    previewHeight?: number;
    // Porcentajes de la imagen (para templates antiguos)
    percentX?: number;
    percentY?: number;
    percentWidth?: number;
    percentHeight?: number;
    realImageWidth?: number;
    realImageHeight?: number;
  }
): Promise<string> {
  try {
    let backgroundBuffer: Buffer;
    
    // NUEVO: Si es una URL HTTP/HTTPS (Vercel Blob Storage o cualquier URL), descargarla
    if (backgroundImagePath.startsWith("http://") || backgroundImagePath.startsWith("https://")) {
      try {
        const response = await fetch(backgroundImagePath);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        backgroundBuffer = Buffer.from(arrayBuffer);
      } catch (error: any) {
        console.error("Error downloading image from URL:", error);
        throw new Error(`Failed to download image from URL: ${error.message}`);
      }
    } else {
      // Código existente para archivos locales
      let bgPath = backgroundImagePath;
      if (backgroundImagePath.startsWith("/")) {
        bgPath = path.join(process.cwd(), "public", backgroundImagePath);
      } else if (!path.isAbsolute(backgroundImagePath)) {
        bgPath = path.join(process.cwd(), "public", backgroundImagePath);
      }

      // Verificar que el archivo existe
      if (!fs.existsSync(bgPath)) {
        throw new Error(`Image file not found: ${bgPath}`);
      }

      // Leer imagen de fondo
      backgroundBuffer = fs.readFileSync(bgPath);
    }
    
    // Convertir QR data URL a buffer
    const qrBase64 = qrDataUrl.replace(/^data:image\/\w+;base64,/, "");
    const qrBuffer = Buffer.from(qrBase64, "base64");

    // Obtener dimensiones de la imagen de fondo REAL
    const bgMetadata = await sharp(backgroundBuffer).metadata();
    const bgRealWidth = bgMetadata.width || 800;
    const bgRealHeight = bgMetadata.height || 600;
    
    const qrWidth = position.width || 200;
    const qrHeight = position.height || 200;
    const margin = 20;

    let scaledX: number;
    let scaledY: number;
    let scaledWidth: number = qrWidth;
    let scaledHeight: number = qrHeight;

    // NUEVO: Si hay una zona predefinida, calcular posición automáticamente
    if (position.zone && position.zone !== "custom") {
      switch (position.zone) {
        case "top-left":
          scaledX = margin;
          scaledY = margin;
          break;
        case "top-center":
          scaledX = (bgRealWidth - qrWidth) / 2;
          scaledY = margin;
          break;
        case "top-right":
          scaledX = bgRealWidth - qrWidth - margin;
          scaledY = margin;
          break;
        case "center-left":
          scaledX = margin;
          scaledY = (bgRealHeight - qrHeight) / 2;
          break;
        case "center":
          scaledX = (bgRealWidth - qrWidth) / 2;
          scaledY = (bgRealHeight - qrHeight) / 2;
          break;
        case "center-right":
          scaledX = bgRealWidth - qrWidth - margin;
          scaledY = (bgRealHeight - qrHeight) / 2;
          break;
        case "bottom-left":
          scaledX = margin;
          scaledY = bgRealHeight - qrHeight - margin;
          break;
        case "bottom-center":
          scaledX = (bgRealWidth - qrWidth) / 2;
          scaledY = bgRealHeight - qrHeight - margin;
          break;
        case "bottom-right":
          scaledX = bgRealWidth - qrWidth - margin;
          scaledY = bgRealHeight - qrHeight - margin;
          break;
        default:
          scaledX = margin;
          scaledY = margin;
      }
      
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 QR Position Debug (USANDO ZONA):", {
          zone: position.zone,
          bgRealSize: { width: bgRealWidth, height: bgRealHeight },
          calculatedPosition: { x: scaledX, y: scaledY, width: scaledWidth, height: scaledHeight },
        });
      }
    } else if (position.percentX !== undefined && position.percentY !== undefined && 
               position.percentWidth !== undefined && position.percentHeight !== undefined) {
      // USAR PORCENTAJES DE LA IMAGEN REAL (para templates antiguos con porcentajes)
      scaledX = (position.percentX / 100) * bgRealWidth;
      scaledY = (position.percentY / 100) * bgRealHeight;
      scaledWidth = (position.percentWidth / 100) * bgRealWidth;
      scaledHeight = (position.percentHeight / 100) * bgRealHeight;
      
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 QR Position Debug (USANDO PORCENTAJES):", {
          percentages: {
            x: position.percentX.toFixed(2) + "%",
            y: position.percentY.toFixed(2) + "%",
            width: position.percentWidth.toFixed(2) + "%",
            height: position.percentHeight.toFixed(2) + "%"
          },
          calculatedPosition: { x: scaledX, y: scaledY, width: scaledWidth, height: scaledHeight },
        });
      }
    } else if (position.x !== undefined && position.y !== undefined) {
      // Fallback: usar coordenadas directas (para modo custom)
      scaledX = position.x;
      scaledY = position.y;
      
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 QR Position Debug (USANDO COORDENADAS DIRECTAS):", {
          originalPosition: { x: position.x, y: position.y },
          calculatedPosition: { x: scaledX, y: scaledY, width: scaledWidth, height: scaledHeight },
        });
      }
    } else {
      // Default: bottom-right
      scaledX = bgRealWidth - qrWidth - margin;
      scaledY = bgRealHeight - qrHeight - margin;
    }
    
    // Redondear después de todos los cálculos
    scaledX = Math.round(scaledX);
    scaledY = Math.round(scaledY);
    scaledWidth = Math.round(scaledWidth);
    scaledHeight = Math.round(scaledHeight);

    // Validar que el QR no se salga de los límites de la imagen
    const maxX = bgRealWidth - scaledWidth;
    const maxY = bgRealHeight - scaledHeight;
    const finalX = Math.max(0, Math.min(scaledX, maxX));
    const finalY = Math.max(0, Math.min(scaledY, maxY));
    
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 QR Position Debug (FINAL):", {
        finalPosition: { x: finalX, y: finalY, width: scaledWidth, height: scaledHeight },
        bgRealSize: { width: bgRealWidth, height: bgRealHeight },
        clamped: finalX !== scaledX || finalY !== scaledY ? "⚠️ Se ajustó a límites" : "✅ Sin ajuste",
      });
    }

    // Redimensionar QR al tamaño escalado
    const qrResized = await sharp(qrBuffer)
      .resize(scaledWidth, scaledHeight, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .toBuffer();

    // Combinar imágenes: fondo + QR en la posición escalada y validada
    const combined = await sharp(backgroundBuffer)
      .composite([
        {
          input: qrResized,
          left: finalX,
          top: finalY,
        },
      ])
      .png()
      .toBuffer();

    // Convertir a base64 data URL
    const base64 = combined.toString("base64");
    return `data:image/png;base64,${base64}`;
  } catch (error: any) {
    console.error("Error combining images:", error);
    throw new Error(`Failed to combine images: ${error.message}`);
  }
}
