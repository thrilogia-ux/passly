"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteEventButtonProps {
  eventId: string;
  eventName: string;
}

export function DeleteEventButton({ eventId, eventName }: DeleteEventButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el evento "${eventName}"?\n\nEsta acción eliminará:\n- Todos los invitados asignados\n- Todas las invitaciones\n- Todos los códigos QR\n- Todos los check-ins\n\nEsta acción NO se puede deshacer.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar evento");
      }

      // Redirigir a la lista de eventos
      router.push("/dashboard/events");
      router.refresh();
    } catch (error: any) {
      alert(`Error al eliminar evento: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Eliminando...
        </>
      ) : (
        <>
          <Trash2 className="w-4 h-4 mr-2" />
          Eliminar Evento
        </>
      )}
    </Button>
  );
}
