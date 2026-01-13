"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface RemoveGuestButtonProps {
  eventId: string;
  guestEventId: string;
  guestName: string;
}

export function RemoveGuestButton({ eventId, guestEventId, guestName }: RemoveGuestButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${guestName} de este evento?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/guests/${guestEventId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar invitado");
      }

      router.refresh();
    } catch (error: any) {
      alert(error.message || "Error al eliminar invitado. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRemove}
      disabled={loading}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </Button>
  );
}
