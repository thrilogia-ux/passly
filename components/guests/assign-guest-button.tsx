"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function AssignGuestButton({ guestId, eventId }: { guestId: string; eventId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/guests/${guestId}/assign-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error assigning guest");
      }

      router.refresh();
    } catch (error: any) {
      alert(error.message || "Error al asignar invitado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={handleAssign}
      disabled={loading}
    >
      {loading ? "Agregando..." : "Agregar"}
    </Button>
  );
}
