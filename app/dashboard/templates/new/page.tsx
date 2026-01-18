"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QRPositionEditorV2 } from "@/components/templates/qr-position-editor-v2";
import { TemplateGallery } from "@/components/templates/template-gallery";
import { InvitationPreview } from "@/components/templates/invitation-preview";
import { TemplatePreset, replaceTemplatePlaceholders } from "@/lib/templates/presets";
import { Upload, Image as ImageIcon, Code, Save, Sparkles, Palette } from "lucide-react";

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

type TemplateMode = "preset" | "custom" | null;

export default function NewTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [templateMode, setTemplateMode] = useState<TemplateMode>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>();
  
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
    // Cargar eventos disponibles
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data);
        }
      })
      .catch((err) => console.error("Error loading events:", err));
  }, []);

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

  const handlePresetSelect = (preset: TemplatePreset) => {
    setSelectedPresetId(preset.id);
    setFormData((prev) => ({
      ...prev,
      htmlContent: preset.htmlContent,
      cssContent: preset.cssContent,
      qrSize: preset.qrSize || 200,
      name: preset.name, // Pre-llenar nombre con el de la plantilla
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        eventId: formData.eventId || null,
        qrPosition: formData.backgroundImage ? formData.qrPosition : null,
      };

      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error creating template");
      }

      router.push("/dashboard/templates");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al crear el template");
    } finally {
      setLoading(false);
    }
  };

  // Si no se ha seleccionado el modo, mostrar selector
  if (templateMode === null) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Nuevo Template de Invitación</h1>
          <p className="mt-2 text-sm md:text-base text-gray-600">
            Elige cómo quieres crear tu template
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-amber-400"
            onClick={() => setTemplateMode("preset")}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Plantilla Prediseñada</CardTitle>
              </div>
              <CardDescription>
                Elige entre 10 plantillas profesionales listas para usar. Solo personaliza el nombre y los detalles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full mt-4">Elegir Plantilla</Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-amber-400"
            onClick={() => setTemplateMode("custom")}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Diseño Personalizado</CardTitle>
              </div>
              <CardDescription>
                Crea tu propio diseño desde cero: sube una imagen o escribe HTML/CSS personalizado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full mt-4">Crear Personalizado</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Si es modo preset, mostrar galería primero
  if (templateMode === "preset" && !selectedPresetId) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Elegir Plantilla Prediseñada</h1>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              Selecciona una plantilla para empezar
            </p>
          </div>
          <Button variant="outline" onClick={() => setTemplateMode(null)}>
            Volver
          </Button>
        </div>

        <TemplateGallery 
          onSelectTemplate={handlePresetSelect}
          selectedTemplateId={selectedPresetId}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6 md:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {templateMode === "preset" ? "Personalizar Plantilla" : "Nuevo Template Personalizado"}
          </h1>
          <p className="mt-2 text-sm md:text-base text-gray-600">
            {templateMode === "preset" 
              ? "Personaliza los detalles de tu plantilla seleccionada" 
              : "Crea un diseño base para tus invitaciones con QR embebido"}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            setTemplateMode(null);
            setSelectedPresetId(undefined);
            setFormData({
              name: "",
              eventId: "",
              backgroundImage: "",
              htmlContent: "",
              cssContent: "",
              qrPosition: null,
              qrSize: 200,
            });
          }}
        >
          Cambiar Modo
        </Button>
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
                  placeholder="Ej: Invitación VIP 2025"
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

          {/* Subir imagen de diseño */}
          <Card>
            <CardHeader>
              <CardTitle>Diseño Gráfico</CardTitle>
              <CardDescription>Sube una imagen de fondo para la invitación</CardDescription>
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
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData({ ...formData, backgroundImage: "" })}
                    >
                      Eliminar
                    </Button>
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

        {/* HTML/CSS personalizado y Preview */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                HTML/CSS Personalizado (Opcional)
              </CardTitle>
              <CardDescription>
                Si no subes una imagen, puedes usar HTML personalizado con placeholders: {"{{name}}"}, {"{{eventName}}"}, {"{{eventDate}}"}, {"{{eventLocation}}"}, {"{{qrImage}}"}
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
                  placeholder="<div>Hola {{name}}, estás invitado a {{eventName}}...</div>"
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
                  placeholder="body { font-family: Arial; }"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview de la invitación */}
          <InvitationPreview
            htmlContent={formData.htmlContent}
            cssContent={formData.cssContent}
            backgroundImage={formData.backgroundImage}
            qrSize={formData.qrSize}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading || !formData.name}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Guardando..." : "Guardar Template"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
