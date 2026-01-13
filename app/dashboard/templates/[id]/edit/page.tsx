"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QRPositionEditorV2 } from "@/components/templates/qr-position-editor-v2";
import { Upload, Image as ImageIcon, Code, Save, Loader2 } from "lucide-react";

type QRPosition = 
  | "top-left" 
  | "top-center" 
  | "top-right"
  | "center-left" 
  | "center" 
  | "center-right"
  | "bottom-left" 
  | "bottom-center" 
  | "bottom-right"
  | "custom";

export default function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    eventId: "",
    backgroundImage: "",
    htmlContent: "",
    cssContent: "",
    qrPosition: null as { 
      zone?: QRPosition;
      x?: number; 
      y?: number; 
      width?: number; 
      height?: number;
    } | null,
    qrSize: 200,
  });

  useEffect(() => {
    // Resolver params
    params.then((p) => {
      setTemplateId(p.id);
    });
  }, [params]);

  useEffect(() => {
    if (!templateId) return;

    // Cargar template
    fetch(`/api/templates/${templateId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setFormData({
          name: data.name || "",
          eventId: data.eventId || "",
          backgroundImage: data.backgroundImage || "",
          htmlContent: data.htmlContent || "",
          cssContent: data.cssContent || "",
          qrPosition: data.qrPosition || null,
          qrSize: data.qrSize || 200,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError("Error al cargar el template");
        console.error(err);
        setLoading(false);
      });

    // Cargar eventos
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data);
        }
      })
      .catch((err) => console.error("Error loading events:", err));
  }, [templateId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/templates/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error uploading file");
      }

      const data = await res.json();
      console.log("File uploaded successfully:", data);
      setFormData((prev) => ({ ...prev, backgroundImage: data.url }));
      setError(""); // Clear any previous errors on success
    } catch (err: any) {
      console.error("Error uploading file:", err);
      setError(err.message || "Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        ...formData,
        eventId: formData.eventId || null,
        qrPosition: formData.backgroundImage ? formData.qrPosition : null,
      };

      const res = await fetch(`/api/templates/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error updating template");
      }

      router.push("/dashboard/templates");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al actualizar el template");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Editar Template</h1>
        <p className="mt-2 text-sm md:text-base text-gray-600">
          Modifica el diseño base para tus invitaciones
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Card className="border-red-500 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Datos del template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nombre del Template *
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="eventId" className="text-sm font-medium">
                  Asignar a Evento (opcional)
                </label>
                <select
                  id="eventId"
                  value={formData.eventId}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Template Global (todos los eventos)</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="qrSize" className="text-sm font-medium">
                  Tamaño del QR (px)
                </label>
                <Input
                  id="qrSize"
                  type="number"
                  value={formData.qrSize}
                  onChange={(e) => setFormData({ ...formData, qrSize: Number(e.target.value) })}
                  min="50"
                  max="500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Diseño gráfico */}
          <Card>
            <CardHeader>
              <CardTitle>Diseño Gráfico</CardTitle>
              <CardDescription>Imagen de fondo para la invitación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.backgroundImage ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={formData.backgroundImage}
                      alt="Template preview"
                      className="w-full h-auto rounded-lg border"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <label htmlFor="file-replace" className="cursor-pointer">
                        <Button type="button" variant="outline" size="sm" disabled={uploading}>
                          <Upload className="w-4 h-4 mr-1" />
                          Reemplazar
                        </Button>
                        <input
                          id="file-replace"
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setFormData({ ...formData, backgroundImage: "" })}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                  
                  {/* Editor de posición del QR */}
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium mb-2">Posición del QR</h3>
                    <QRPositionEditorV2
                      backgroundImage={formData.backgroundImage}
                      onPositionChange={(pos) => setFormData({ 
                        ...formData, 
                        qrPosition: formData.qrPosition 
                          ? { ...formData.qrPosition, ...pos } 
                          : pos 
                      })}
                      initialPosition={formData.qrPosition || undefined}
                      qrSize={formData.qrSize}
                    />
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      disabled={uploading}
                      onClick={() => {
                        const input = document.getElementById("file-upload") as HTMLInputElement;
                        if (input) {
                          input.click();
                        }
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? "Subiendo..." : "Subir Imagen"}
                    </Button>
                    {error && !formData.backgroundImage && (
                      <p className="text-xs text-red-600 mt-2">{error}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      JPG, PNG o WebP (máx. 5MB)
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* HTML/CSS personalizado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              HTML/CSS Personalizado (Opcional)
            </CardTitle>
            <CardDescription>
              Usa placeholders: {"{{name}}"}, {"{{eventName}}"}, {"{{eventDate}}"}, {"{{eventLocation}}"}, {"{{qrImage}}"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="htmlContent" className="text-sm font-medium">
                HTML Content
              </label>
              <textarea
                id="htmlContent"
                value={formData.htmlContent}
                onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                className="flex min-h-[200px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-mono"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="cssContent" className="text-sm font-medium">
                CSS Personalizado
              </label>
              <textarea
                id="cssContent"
                value={formData.cssContent}
                onChange={(e) => setFormData({ ...formData, cssContent: e.target.value })}
                className="flex min-h-[150px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-mono"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving || !formData.name}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
