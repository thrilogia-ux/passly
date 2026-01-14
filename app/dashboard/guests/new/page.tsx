"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GuestType } from "@prisma/client";
import Link from "next/link";

function NewGuestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get("eventId");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "VIP" as GuestType,
    tags: "",
    eventId: eventIdParam || "",
  });

  useEffect(() => {
    // Cargar eventos
    fetch("/api/events")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvents(data);
        }
      })
      .catch(err => console.error("Error loading events:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Crear invitado
      const response = await fetch("/api/guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          type: formData.type,
          tags: formData.tags,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        // Si el error es que el email ya existe, pero tenemos eventId, intentar asignar directamente
        if (data.error?.includes("already exists") && data.guestId && formData.eventId) {
          // El invitado ya existe, solo asignarlo al evento
          try {
            const assignResponse = await fetch(`/api/guests/${data.guestId}/assign-event`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                eventId: formData.eventId,
              }),
            });

            if (assignResponse.ok) {
              // Asignación exitosa, redirigir
              if (formData.eventId) {
                router.push(`/dashboard/events/${formData.eventId}/guests`);
              } else {
                router.push("/dashboard/guests");
              }
              router.refresh();
              return;
            }
          } catch (assignError) {
            // Si la asignación falla, mostrar el error original
          }
        }
        throw new Error(data.error || "Error creating guest");
      }

      const guest = await response.json();

      // Si se seleccionó un evento y el invitado no fue asignado automáticamente, asignarlo
      if (formData.eventId && guest.id) {
        // Verificar si ya fue asignado (el API ahora lo hace automáticamente)
        // Pero por si acaso, intentar asignar
        try {
          await fetch(`/api/guests/${guest.id}/assign-event`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventId: formData.eventId,
            }),
          });
        } catch (assignError) {
          // No es crítico si falla, el invitado ya fue creado
          console.warn("Error assigning to event (puede que ya esté asignado):", assignError);
        }
      }

      // Redirigir según si hay evento
      if (formData.eventId) {
        router.push(`/dashboard/events/${formData.eventId}/guests`);
      } else {
        router.push("/dashboard/guests");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error creating guest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Nuevo Invitado</h1>
        <p className="mt-2 text-gray-600">Crea un nuevo invitado</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información del Invitado</CardTitle>
          <CardDescription>
            Completa los datos del invitado{formData.eventId ? " para el evento seleccionado" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

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
                <option value="">Sin asignar a evento</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.name} - {new Date(event.date).toLocaleDateString("es-AR")}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                Si seleccionas un evento, el invitado se asignará automáticamente
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre *
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="Ej: juan.perez@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Teléfono
              </label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ej: +5491123456789"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Tipo
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as GuestType })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="VIP">VIP</option>
                <option value="PRESS">Prensa</option>
                <option value="INFLUENCER">Influencer</option>
                <option value="STAFF">Staff</option>
                <option value="PROVIDER">Proveedor</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium">
                Tags (separados por coma)
              </label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Ej: tech,prensa,vip"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Invitado"}
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
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewGuestPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl p-8">Cargando formulario...</div>}>
      <NewGuestContent />
    </Suspense>
  );
}
