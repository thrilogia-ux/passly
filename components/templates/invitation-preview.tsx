"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Loader2 } from "lucide-react";

interface InvitationPreviewProps {
  htmlContent?: string;
  cssContent?: string;
  backgroundImage?: string;
  qrSize?: number;
}

export function InvitationPreview({
  htmlContent,
  cssContent,
  backgroundImage,
  qrSize = 200,
}: InvitationPreviewProps) {
  const [previewHTML, setPreviewHTML] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Debounce para no hacer request en cada cambio
    const timeoutId = setTimeout(async () => {
      // Solo generar preview si hay contenido
      if (!htmlContent && !backgroundImage) {
        setPreviewHTML("");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/templates/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            htmlContent: htmlContent || null,
            cssContent: cssContent || null,
            backgroundImage: backgroundImage || null,
            qrSize,
          }),
        });

        if (!response.ok) {
          throw new Error("Error generando preview");
        }

        const data = await response.json();
        setPreviewHTML(data.previewHTML);
      } catch (err: any) {
        setError(err.message || "Error al generar preview");
        setPreviewHTML("");
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [htmlContent, cssContent, backgroundImage, qrSize]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Preview de la Invitación
        </CardTitle>
        <CardDescription>
          Vista previa de cómo verá la invitación el invitado
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-600">Generando preview...</span>
          </div>
        ) : error ? (
          <div className="py-10 text-center text-red-600">
            <p>{error}</p>
          </div>
        ) : previewHTML ? (
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <div className="bg-white p-4 border-b border-gray-200">
              <p className="text-xs text-gray-500 font-medium">
                Vista previa del email (datos de ejemplo)
              </p>
            </div>
            <div className="overflow-auto max-h-[600px] bg-white">
              <iframe
                srcDoc={previewHTML}
                className="w-full h-full min-h-[500px] border-0"
                title="Invitation Preview"
                style={{ minHeight: "500px" }}
              />
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400">
            <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              Agrega HTML/CSS o una imagen de fondo para ver el preview
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}