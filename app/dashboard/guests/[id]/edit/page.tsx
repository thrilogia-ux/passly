"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GuestType } from "@prisma/client";

export default function EditGuestPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [guestId, setGuestId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "VIP" as GuestType,
    tags: "",
  });

  useEffect(() => {
    async function loadGuest() {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setGuestId(id);

        const response = await fetch(`/api/guests/${id}`);
        if (!response.ok) {
          throw new Error("Error loading guest");
        }

        const guest = await response.json();
        setFormData({
          name: guest.name || "",
          email: guest.email || "",
          phone: guest.phone || "",
          type: guest.type || "VIP",
          tags: guest.tags || "",
        });
      } catch (err: any) {
        setError(err.message || "Error loading guest");
      } finally {
        setLoading(false);
      }
    }
    loadGuest();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch(`/api/guests/${guestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error updating guest");
      }

      router.push(`/dashboard/guests/${guestId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error updating guest");
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
        <h1 className="text-3xl font-bold">Editar Invitado</h1>
        <p className="mt-2 text-gray-600">Modifica los datos del invitado</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información del Invitado</CardTitle>
          <CardDescription>Modifica los datos del invitado</CardDescription>
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
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
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
