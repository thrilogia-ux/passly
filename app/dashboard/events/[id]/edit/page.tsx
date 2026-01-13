"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EventStatus } from "@prisma/client";

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [eventId, setEventId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    status: "DRAFT" as EventStatus,
  });

  useEffect(() => {
    async function loadEvent() {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setEventId(id);

        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) {
          throw new Error("Error loading event");
        }

        const event = await response.json();
        setFormData({
          name: event.name || "",
          description: event.description || "",
          date: event.date ? new Date(event.date).toISOString().slice(0, 16) : "",
          location: event.location || "",
          status: event.status || "DRAFT",
        });
      } catch (err: any) {
        setError(err.message || "Error loading event");
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      // Convertir fecha de datetime-local a ISO string
      const dataToSend = {
        ...formData,
        date: formData.date ? new Date(formData.date).toISOString() : undefined,
      };

      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMessage = data.message || data.error || "Error updating event";
        const detailsMessage = data.details 
          ? (Array.isArray(data.details) 
              ? data.details.map((d: any) => `${d.path?.join('.') || ''}: ${d.message || ''}`).join(', ')
              : typeof data.details === 'string' 
                ? data.details 
                : JSON.stringify(data.details))
          : '';
        throw new Error(errorMessage + (detailsMessage ? ` (${detailsMessage})` : ''));
      }

      router.push(`/dashboard/events/${eventId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error updating event");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Editar Evento</h1>
        <p className="mt-2 text-gray-600">Modifica los datos del evento</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información del Evento</CardTitle>
          <CardDescription>Modifica los datos del evento</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre *
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descripción
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">
                Fecha y Hora *
              </label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Ubicación
              </label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Estado
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as EventStatus })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="DRAFT">Borrador</option>
                <option value="ACTIVE">Activo</option>
                <option value="COMPLETED">Completado</option>
              </select>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
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
        </CardContent>
      </Card>
    </div>
  );
}
