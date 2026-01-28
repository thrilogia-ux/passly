"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Loader2, 
  Search, 
  UserPlus, 
  Pencil, 
  Trash2,
  X,
  Save,
  Building2
} from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showNewForm = searchParams.get("action") === "new";
  
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showModal, setShowModal] = useState(showNewForm);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CLIENT",
    organizationId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (showNewForm) {
      setShowModal(true);
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "CLIENT",
        organizationId: "",
      });
    }
  }, [showNewForm]);

  const loadData = async () => {
    try {
      const [usersRes, orgsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/organizations"),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data);
      }
      
      if (orgsRes.ok) {
        const data = await orgsRes.json();
        setOrganizations(data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingUser 
        ? `/api/admin/users/${editingUser.id}`
        : "/api/admin/users";
      
      const method = editingUser ? "PUT" : "POST";
      
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        organizationId: formData.organizationId || null,
      };
      
      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al guardar");
      }

      setShowModal(false);
      setEditingUser(null);
      router.push("/dashboard/admin/users");
      loadData();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email,
      password: "",
      role: user.role,
      organizationId: user.organizationId || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (user: any) => {
    if (!confirm(`¿Estás seguro de eliminar a ${user.name || user.email}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }

      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = !search || 
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const badges: Record<string, string> = {
      SUPER_ADMIN: "bg-red-100 text-red-800",
      ORGANIZER: "bg-purple-100 text-purple-800",
      CLIENT: "bg-blue-100 text-blue-800",
      STAFF: "bg-green-100 text-green-800",
    };
    const labels: Record<string, string> = {
      SUPER_ADMIN: "Super Admin",
      ORGANIZER: "Organizador",
      CLIENT: "Cliente",
      STAFF: "Staff",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[role] || "bg-gray-100"}`}>
        {labels[role] || role}
      </span>
    );
  };

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
          <Users className="w-7 h-7 text-blue-500" />
          Gestión de Usuarios
        </h1>
        <p className="text-gray-600">Administrar usuarios del sistema</p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="h-10 rounded-md border border-gray-300 px-3"
            >
              <option value="">Todos los roles</option>
              <option value="CLIENT">Cliente</option>
              <option value="ORGANIZER">Organizador</option>
              <option value="STAFF">Staff</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            <Button onClick={() => { setEditingUser(null); setFormData({ name: "", email: "", password: "", role: "CLIENT", organizationId: "" }); setShowModal(true); }}>
              <UserPlus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{user.name || "Sin nombre"}</p>
                    {getRoleBadge(user.role)}
                  </div>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  {user.organization && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Building2 className="w-3 h-3" />
                      {user.organization.name}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 mr-4">
                    {user._count?.organizedEvents || 0} eventos
                  </p>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  {user.role !== "SUPER_ADMIN" && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(user)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <p className="text-center text-gray-500 py-8">No se encontraron usuarios</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setShowModal(false); router.push("/dashboard/admin/users"); }}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Contraseña {editingUser && "(dejar vacío para no cambiar)"}
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-gray-300 px-3"
                >
                  <option value="CLIENT">Cliente</option>
                  <option value="ORGANIZER">Organizador</option>
                  <option value="STAFF">Staff</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Organización</label>
                <select
                  value={formData.organizationId}
                  onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-gray-300 px-3"
                >
                  <option value="">Sin organización</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
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
    </div>
  );
}
