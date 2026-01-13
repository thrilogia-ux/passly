"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Mail, AlertCircle } from "lucide-react";

export function SendInvitationButton({ invitationId }: { invitationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!confirm("¿Estás seguro de enviar esta invitación? Se consumirá 1 token.")) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/invitations/${invitationId}/send`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        let errorMessage = data.error || "Error desconocido al enviar invitación";
        
        // Mensajes más descriptivos según el tipo de error
        if (res.status === 402) {
          errorMessage = `❌ Tokens insuficientes\n\n${errorMessage}\n\nNecesitas comprar más tokens en la sección de Tokens.`;
        } else if (res.status === 500) {
          // Si hay detalles del error de email, mostrarlos
          if (data.details) {
            errorMessage = `❌ Error al enviar email\n\n${errorMessage}\n\nDetalles: ${data.details}`;
          } else {
            errorMessage = `❌ Error del servidor\n\n${errorMessage}`;
          }
        } else if (res.status === 404) {
          errorMessage = `❌ Invitación no encontrada\n\n${errorMessage}`;
        }
        
        setError(errorMessage);
        console.error("Error enviando invitación:", data);
        return; // No redirigir si hay error
      }

      // Solo redirigir si fue exitoso
      alert("¡Invitación enviada exitosamente!");
      router.refresh();
    } catch (error: any) {
      const errorMessage = error.message || "Error al enviar la invitación. Revisa la consola del servidor para más detalles.";
      setError(`❌ Error de conexión\n\n${errorMessage}`);
      console.error("Error capturado:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        size="sm"
        onClick={handleSend}
        disabled={loading}
      >
        <Mail className="w-4 h-4 mr-1" />
        {loading ? "Enviando..." : "Enviar"}
      </Button>
      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 max-w-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="whitespace-pre-line">{error}</div>
          </div>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
