"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteGuestButtonProps {
  guestId: string;
  guestName: string;
}

export function DeleteGuestButton({ guestId, guestName }: DeleteGuestButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al invitado "${guestName}"?\n\nEsta acción eliminará:\n- Todas sus asignaciones a eventos\n- Todas sus invitaciones\n- Todos sus códigos QR\n- Todos sus check-ins\n\nEsta acción NO se puede deshacer.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/guests/${guestId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar invitado");
      }

      // Redirigir a la lista de invitados y refrescar
      router.refresh();
      // Pequeño delay para asegurar que el refresh funcione
      setTimeout(() => {
        router.push("/dashboard/guests");
      }, 100);
    } catch (error: any) {
      alert(`Error al eliminar invitado: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
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
