"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import Link from "next/link";

interface EventSelectorProps {
  events: Array<{
    id: string;
    name: string;
    date: Date | string;
  }>;
  selectedEventId?: string;
}

export function EventSelector({ events, selectedEventId }: EventSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleEventChange = (eventId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (eventId) {
      params.set("eventId", eventId);
    } else {
      params.delete("eventId");
    }
    // Detectar la ruta actual para mantener el contexto
    const currentPath = window.location.pathname;
    router.push(`${currentPath}?${params.toString()}`);
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <Card className="mb-6 border-2 border-[#ff5040]/20 bg-gradient-to-r from-[#fff1ec] to-[#ffe4dd]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#ff5040]" />
          Seleccionar Evento
        </CardTitle>
        <CardDescription>
          Selecciona un evento para filtrar el contenido
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 flex-wrap">
          <select
            value={selectedEventId || ""}
            onChange={(e) => handleEventChange(e.target.value)}
            className="flex h-10 flex-1 min-w-[250px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">-- Todos los eventos --</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.name} - {new Date(event.date).toLocaleDateString("es-AR")}
              </option>
            ))}
          </select>
          {selectedEventId && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("eventId");
                const currentPath = window.location.pathname;
                router.push(`${currentPath}?${params.toString()}`);
              }}
            >
              Limpiar Filtro
            </Button>
          )}
        </div>
        {selectedEvent && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-[#ff5040]/30">
            <p className="text-sm font-medium text-[#303030]">
              Evento seleccionado: <span className="text-[#ff5040]">
                {selectedEvent.name}
              </span>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Mostrando contenido de este evento.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
