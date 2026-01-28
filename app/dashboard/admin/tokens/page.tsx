"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Gift, 
  Loader2, 
  Coins,
  Building2,
  CheckCircle,
  History
} from "lucide-react";
import Link from "next/link";

export default function AdminTokensPage() {
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    organizationId: "",
    amount: 100,
    reason: "",
  });

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const res = await fetch("/api/admin/organizations");
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data);
      }
    } catch (error) {
      console.error("Error loading organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.organizationId) {
      alert("Por favor seleccioná una organización");
      return;
    }
    if (!formData.reason) {
      alert("Por favor ingresá un motivo");
      return;
    }
    if (formData.amount < 1) {
      alert("La cantidad debe ser al menos 1");
      return;
    }

    setSaving(true);
    setSuccess(null);
    
    try {
      const res = await fetch(`/api/admin/organizations/${formData.organizationId}/tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: formData.amount,
          reason: formData.reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al cargar tokens");
      }

      setSuccess(data.message);
      setFormData({ ...formData, amount: 100, reason: "" });
      loadOrganizations(); // Recargar para actualizar balances
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedOrg = organizations.find(org => org.id === formData.organizationId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff5040]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/admin" className="text-sm text-gray-600 hover:text-gray-900">
          ← Volver al Panel Admin
        </Link>
        <h1 className="mt-2 text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Gift className="w-7 h-7 text-[#ff5040]" />
          Tokens de Cortesía
        </h1>
        <p className="text-gray-600">Regalar tokens a organizaciones</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#ff5040]" />
              Cargar Tokens
            </CardTitle>
            <CardDescription>
              Seleccioná una organización y la cantidad de tokens a regalar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Organización</label>
              <select
                value={formData.organizationId}
                onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-300 px-3 mt-1"
              >
                <option value="">-- Seleccionar organización --</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.tokenBalance} tokens)
                  </option>
                ))}
              </select>
            </div>

            {selectedOrg && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">{selectedOrg.name}</span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Balance actual: <strong>{selectedOrg.tokenBalance} tokens</strong></p>
                  <p>Usuarios: {selectedOrg._count?.users || 0}</p>
                  <p>Eventos: {selectedOrg._count?.events || 0}</p>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Cantidad de Tokens</label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                min="1"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Motivo</label>
              <Input
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Ej: Promoción de lanzamiento, compensación, bonificación..."
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Este motivo quedará registrado en el historial de transacciones
              </p>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                {success}
              </div>
            )}

            <Button 
              onClick={handleSubmit} 
              disabled={saving || !formData.organizationId} 
              className="w-full bg-gradient-to-r from-[#ff5040] to-[#ff8a40]"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Regalar {formData.amount} Tokens
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Lista rápida de organizaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-500" />
              Organizaciones
            </CardTitle>
            <CardDescription>
              Balance de tokens por organización
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.organizationId === org.id 
                      ? "bg-purple-50 border-purple-300" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setFormData({ ...formData, organizationId: org.id })}
                >
                  <div>
                    <p className="font-medium">{org.name}</p>
                    <p className="text-xs text-gray-500">
                      {org._count?.users || 0} usuarios · {org._count?.events || 0} eventos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#ff5040]">{org.tokenBalance}</p>
                    <p className="text-xs text-gray-500">tokens</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accesos rápidos */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Más opciones</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Link href="/dashboard/admin/organizations">
            <Button variant="outline">
              <Building2 className="w-4 h-4 mr-2" />
              Gestionar Organizaciones
            </Button>
          </Link>
          <Link href="/dashboard/admin/users">
            <Button variant="outline">
              <History className="w-4 h-4 mr-2" />
              Ver Usuarios
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
