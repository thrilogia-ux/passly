"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Save, Loader2 } from "lucide-react";

function NewInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const guestEventId = searchParams.get("guestEventId");
  const eventId = searchParams.get("eventId");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [guestEvent, setGuestEvent] = useState<any>(null);

  const [formData, setFormData] = useState({
    templateId: "",
    emailSubject: "",
    emailBody: "",
  });

  useEffect(() => {
    if (guestEventId && eventId) {
      // Load event data which includes guestEvents
      fetch(`/api/events/${eventId}`)
        .then((res) => res.json())
        .then((eventData) => {
          // Find guest event in the event's guestEvents
          const gev = eventData.guestEvents?.find((ge: any) => ge.id === guestEventId);
          if (gev) {
            setGuestEvent({ 
              guest: gev.guest, 
              event: eventData 
            });
          }
        })
        .catch((err) => {
          console.error("Error loading guest event:", err);
        });
    }

    // Load templates for this event
    const templateUrl = eventId 
      ? `/api/templates?eventId=${eventId}`
      : "/api/templates";
    
    fetch(templateUrl)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTemplates(data);
          // Auto-select first template if available
          if (data.length > 0 && !formData.templateId) {
            setFormData((prev) => ({ ...prev, templateId: data[0].id }));
          }
        }
      })
      .catch((err) => console.error("Error loading templates:", err));
  }, [guestEventId, eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEventId) {
      setError("guestEventId es requerido");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload = {
        guestEventId,
        templateId: formData.templateId || undefined,
        emailSubject: formData.emailSubject || undefined,
        emailBody: formData.emailBody || undefined,
      };

      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error creating invitation");
      }

      const data = await res.json();
      router.push(`/dashboard/invitations?eventId=${eventId || ""}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al crear la invitación");
    } finally {
      setLoading(false);
    }
  };

  if (!guestEventId) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Error</h1>
        <p className="mt-4 text-gray-600">No se especificó un invitado para crear la invitación</p>
        <Link href="/dashboard/invitations">
          <Button className="mt-4">Volver a Invitaciones</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Nueva Invitación</h1>
        <p className="mt-2 text-sm md:text-base text-gray-600">
          Crea una invitación personalizada para el invitado
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

        {guestEvent && (
          <Card>
            <CardHeader>
              <CardTitle>Información del Invitado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{guestEvent.guest?.name}</p>
                <p className="text-sm text-gray-600">{guestEvent.guest?.email}</p>
                <p className="text-sm text-gray-600">Evento: {guestEvent.event?.name}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Configuración de la Invitación</CardTitle>
            <CardDescription>Selecciona un template y personaliza el contenido</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="templateId" className="text-sm font-medium">
                Template de Invitación
              </label>
              <select
                id="templateId"
                value={formData.templateId}
                onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Sin template (usar por defecto)</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} {template.eventId ? `(Evento específico)` : `(Global)`}
                  </option>
                ))}
              </select>
              {templates.length === 0 && (
                <p className="text-xs text-gray-500">
                  No hay templates disponibles. Crea uno en{" "}
                  <Link href="/dashboard/templates" className="text-[#ff5040] hover:underline">
                    Templates
                  </Link>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="emailSubject" className="text-sm font-medium">
                Asunto del Email (opcional)
              </label>
              <Input
                id="emailSubject"
                value={formData.emailSubject}
                onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
                placeholder="Ej: Invitación a [Nombre del Evento]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="emailBody" className="text-sm font-medium">
                Cuerpo del Email Personalizado (opcional)
              </label>
              <textarea
                id="emailBody"
                value={formData.emailBody}
                onChange={(e) => setFormData({ ...formData, emailBody: e.target.value })}
                className="flex min-h-[150px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Usa placeholders: {{name}}, {{eventName}}, {{eventDate}}, {{eventLocation}}, {{qrImage}}"
              />
              <p className="text-xs text-gray-500">
                Si no especificas un template, puedes usar HTML personalizado aquí
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading || !guestEventId}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Creando..." : "Crear Invitación"}
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

export default function NewInvitationPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-4xl mx-auto p-8">Cargando formulario...</div>}>
      <NewInvitationContent />
    </Suspense>
  );
}
