import fs from "fs";
import path from "path";

/**
 * Convert image file to base64 data URL
 * Supports both local files and URLs (with fetch)
 */
export async function imageToBase64(imagePath: string): Promise<string> {
  // Si es una URL absoluta que empieza con http:// o https://
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    try {
      const response = await fetch(imagePath);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get("content-type") || "image/png";
      return `data:${contentType};base64,${buffer.toString("base64")}`;
    } catch (error) {
      console.error("Error fetching image from URL:", error);
      throw new Error("Failed to fetch image from URL");
    }
  }

  // Si es una ruta relativa o absoluta local
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3002";
  let filePath = imagePath;

  // Si empieza con /, es relativa al public folder
  if (imagePath.startsWith("/")) {
    filePath = path.join(process.cwd(), "public", imagePath);
  } else if (!path.isAbsolute(imagePath)) {
    // Ruta relativa
    filePath = path.join(process.cwd(), "public", imagePath);
  }

  try {
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error("Image file not found:", filePath);
      throw new Error(`Image file not found: ${imagePath}`);
    }

    // Leer el archivo
    const imageBuffer = fs.readFileSync(filePath);
    
    // Determinar el tipo MIME basado en la extensión
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
    };
    const contentType = mimeTypes[ext] || "image/png";

    // Convertir a base64
    const base64 = imageBuffer.toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch (error: any) {
    console.error("Error converting image to base64:", error);
    throw new Error(`Failed to convert image to base64: ${error.message}`);
  }
}
