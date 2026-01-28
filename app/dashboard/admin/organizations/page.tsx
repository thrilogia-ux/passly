"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  Loader2, 
  Search, 
  Plus, 
  Pencil, 
  Trash2,
  X,
  Save,
  Users,
  Calendar,
  Coins,
  Gift
} from "lucide-react";
import Link from "next/link";

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showNewForm = searchParams.get("action") === "new";
  
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(showNewForm);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<any>(null);
  const [selectedOrgForTokens, setSelectedOrgForTokens] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tokenPlan: "FREE",
    tokenBalance: 10,
  });
  
  const [tokenFormData, setTokenFormData] = useState({
    amount: 100,
    reason: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (showNewForm) {
      setShowModal(true);
      setEditingOrg(null);
      setFormData({
        name: "",
        slug: "",
        tokenPlan: "FREE",
        tokenBalance: 10,
      });
    }
  }, [showNewForm]);

  const loadData = async () => {
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingOrg 
        ? `/api/admin/organizations/${editingOrg.id}`
        : "/api/admin/organizations";
      
      const method = editingOrg ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al guardar");
      }

      setShowModal(false);
      setEditingOrg(null);
      router.push("/dashboard/admin/organizations");
      loadData();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (org: any) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      slug: org.slug,
      tokenPlan: org.tokenPlan || "FREE",
      tokenBalance: org.tokenBalance,
    });
    setShowModal(true);
  };

  const handleDelete = async (org: any) => {
    if (!confirm(`¿Estás seguro de eliminar ${org.name}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/organizations/${org.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al eliminar");
      }

      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleAddTokens = async () => {
    if (!tokenFormData.reason) {
      alert("Por favor ingresá un motivo");
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/organizations/${selectedOrgForTokens.id}/tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tokenFormData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al cargar tokens");
      }

      alert(data.message);
      setShowTokenModal(false);
      setSelectedOrgForTokens(null);
      setTokenFormData({ amount: 100, reason: "" });
      loadData();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const openTokenModal = (org: any) => {
    setSelectedOrgForTokens(org);
    setTokenFormData({ amount: 100, reason: "" });
    setShowTokenModal(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const filteredOrgs = organizations.filter((org) => {
    return !search || 
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.slug.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff5040]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/admin" className="text-sm text-gray-600 hover:text-gray-900">
          ← Volver al Panel Admin
        </Link>
        <h1 className="mt-2 text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Building2 className="w-7 h-7 text-purple-500" />
          Gestión de Organizaciones
        </h1>
        <p className="text-gray-600">Administrar organizaciones y sus recursos</p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => { setEditingOrg(null); setFormData({ name: "", slug: "", tokenPlan: "FREE", tokenBalance: 10 }); setShowModal(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Organización
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de organizaciones */}
      <div className="grid gap-4">
        {filteredOrgs.map((org) => (
          <Card key={org.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{org.name}</h3>
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                      {org.slug}
                    </span>
                    {org.tokenPlan && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        {org.tokenPlan}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {org._count?.users || 0} usuarios
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {org._count?.events || 0} eventos
                    </span>
                    <span className="flex items-center gap-1 text-[#ff5040] font-medium">
                      <Coins className="w-4 h-4" />
                      {org.tokenBalance} tokens
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openTokenModal(org)}
                    className="text-[#ff5040] border-[#ff5040] hover:bg-[#ffe4dd]"
                  >
                    <Gift className="w-4 h-4 mr-1" />
                    Regalar Tokens
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(org)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(org)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredOrgs.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No se encontraron organizaciones
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal crear/editar organización */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingOrg ? "Editar Organización" : "Nueva Organización"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setShowModal(false); router.push("/dashboard/admin/organizations"); }}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({ 
                      ...formData, 
                      name,
                      slug: !editingOrg ? generateSlug(name) : formData.slug,
                    });
                  }}
                  placeholder="Nombre de la organización"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slug (URL)</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                  placeholder="mi-organizacion"
                />
                <p className="text-xs text-gray-500 mt-1">Solo letras minúsculas, números y guiones</p>
              </div>
              <div>
                <label className="text-sm font-medium">Plan</label>
                <select
                  value={formData.tokenPlan}
                  onChange={(e) => setFormData({ ...formData, tokenPlan: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-gray-300 px-3"
                >
                  <option value="FREE">Free</option>
                  <option value="STARTER">Starter</option>
                  <option value="PRO">Pro</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
              {!editingOrg && (
                <div>
                  <label className="text-sm font-medium">Tokens Iniciales</label>
                  <Input
                    type="number"
                    value={formData.tokenBalance}
                    onChange={(e) => setFormData({ ...formData, tokenBalance: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              )}
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal regalar tokens */}
      {showTokenModal && selectedOrgForTokens && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#ff5040]" />
                Regalar Tokens
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowTokenModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Organización</p>
                <p className="font-semibold">{selectedOrgForTokens.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Balance actual: <strong>{selectedOrgForTokens.tokenBalance} tokens</strong>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Cantidad de Tokens</label>
                <Input
                  type="number"
                  value={tokenFormData.amount}
                  onChange={(e) => setTokenFormData({ ...tokenFormData, amount: parseInt(e.target.value) || 0 })}
                  min="1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Motivo</label>
                <Input
                  value={tokenFormData.reason}
                  onChange={(e) => setTokenFormData({ ...tokenFormData, reason: e.target.value })}
                  placeholder="Ej: Promoción de lanzamiento, compensación..."
                />
              </div>
              <Button 
                onClick={handleAddTokens} 
                disabled={saving} 
                className="w-full bg-gradient-to-r from-[#ff5040] to-[#ff8a40]"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    Cargar {tokenFormData.amount} Tokens
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
