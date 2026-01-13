"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteTemplateButtonProps {
  templateId: string;
  templateName: string;
}

export function DeleteTemplateButton({
  templateId,
  templateName,
}: DeleteTemplateButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el template "${templateName}"?`)) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar el template");
      }

      router.push("/dashboard/templates");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al eliminar el template");
      console.error("Error deleting template:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        {loading ? "Eliminando..." : "Eliminar"}
      </Button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
