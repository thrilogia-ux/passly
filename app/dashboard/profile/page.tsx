import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Shield } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Mi Perfil</h1>
        <p className="mt-2 text-sm md:text-base text-gray-600">
          Gestiona tu información personal
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Tu información de cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              Nombre
            </label>
            <Input
              value={session.user.name || ""}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">El nombre no se puede editar desde aquí</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <Input
              value={session.user.email || ""}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">El email no se puede editar desde aquí</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Rol
            </label>
            <Input
              value={session.user.role || ""}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">El rol es asignado por el administrador</p>
          </div>

          <div className="pt-4 border-t">
            <Link href="/dashboard">
              <Button variant="outline">Volver al Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
