"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Building2, 
  Calendar, 
  Coins, 
  Loader2,
  UserPlus,
  Gift,
  Settings,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizations: 0,
    totalEvents: 0,
    totalTokens: 0,
  });

  useEffect(() => {
    checkAuthAndLoadStats();
  }, []);

  const checkAuthAndLoadStats = async () => {
    try {
      // Verificar que es SUPER_ADMIN
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      
      if (session?.user?.role !== "SUPER_ADMIN") {
        router.push("/dashboard");
        return;
      }
      
      setAuthorized(true);

      // Cargar estadísticas
      const [usersRes, orgsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/organizations"),
      ]);

      if (usersRes.ok && orgsRes.ok) {
        const users = await usersRes.json();
        const orgs = await orgsRes.json();

        setStats({
          totalUsers: users.length,
          totalOrganizations: orgs.length,
          totalEvents: orgs.reduce((sum: number, org: any) => sum + (org._count?.events || 0), 0),
          totalTokens: orgs.reduce((sum: number, org: any) => sum + (org.tokenBalance || 0), 0),
        });
      }
    } catch (error) {
      console.error("Error loading admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff5040]" />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-8 h-8 text-[#ff5040]" />
          <h1 className="text-2xl md:text-3xl font-bold">Panel de Administración</h1>
        </div>
        <p className="text-gray-600">Gestión general de usuarios, organizaciones y tokens</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Usuarios</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="w-10 h-10 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Organizaciones</p>
                <p className="text-3xl font-bold">{stats.totalOrganizations}</p>
              </div>
              <Building2 className="w-10 h-10 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Eventos</p>
                <p className="text-3xl font-bold">{stats.totalEvents}</p>
              </div>
              <Calendar className="w-10 h-10 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#ff5040] to-[#ff8a40] text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Tokens Totales</p>
                <p className="text-3xl font-bold">{stats.totalTokens.toLocaleString()}</p>
              </div>
              <Coins className="w-10 h-10 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Gestión de Usuarios
            </CardTitle>
            <CardDescription>
              Crear, editar y gestionar usuarios del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/admin/users" className="block">
              <Button className="w-full" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Ver Todos los Usuarios
              </Button>
            </Link>
            <Link href="/dashboard/admin/users?action=new" className="block">
              <Button className="w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                Crear Usuario
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-500" />
              Gestión de Organizaciones
            </CardTitle>
            <CardDescription>
              Administrar organizaciones y sus recursos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/admin/organizations" className="block">
              <Button className="w-full" variant="outline">
                <Building2 className="w-4 h-4 mr-2" />
                Ver Todas las Organizaciones
              </Button>
            </Link>
            <Link href="/dashboard/admin/organizations?action=new" className="block">
              <Button className="w-full">
                <Building2 className="w-4 h-4 mr-2" />
                Crear Organización
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#ff5040]" />
              Tokens de Cortesía
            </CardTitle>
            <CardDescription>
              Regalar tokens a organizaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admin/tokens" className="block">
              <Button className="w-full bg-gradient-to-r from-[#ff5040] to-[#ff8a40] text-white">
                <Coins className="w-4 h-4 mr-2" />
                Cargar Tokens
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              Configuración
            </CardTitle>
            <CardDescription>
              Ajustes generales del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/settings/integrations" className="block">
              <Button className="w-full" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Integraciones
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
