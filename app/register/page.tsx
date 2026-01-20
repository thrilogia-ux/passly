"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "CLIENT" as "CLIENT" | "ORGANIZER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validations
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          accountType: formData.accountType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al crear la cuenta");
        return;
      }

      // Redirect to login with success message
      router.push("/login?registered=true");
    } catch (err) {
      setError("Error al crear la cuenta. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff1ec] via-white to-[#ffe4dd] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/passly-logo.svg"
              alt="PASSLY"
              width={160}
              height={60}
              priority
            />
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Crea tu cuenta gratis
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ya tienes cuenta?{" "}
            <Link href="/login" className="text-[#ff5040] hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>

        <Card className="border-gray-200 shadow-xl">
          <CardHeader>
            <CardTitle>Registro</CardTitle>
            <CardDescription>
              10 invitaciones gratis incluidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  placeholder="Repite tu contraseña"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Cuenta
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: "CLIENT" })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.accountType === "CLIENT"
                        ? "border-[#ff5040] bg-[#ffe4dd]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Particular</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Eventos personales
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: "ORGANIZER" })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.accountType === "ORGANIZER"
                        ? "border-[#ff5040] bg-[#ffe4dd]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Agencia/Organizador</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Múltiples eventos
                    </div>
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear Cuenta Gratis"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-gray-500">
          Al registrarte, aceptas nuestros{" "}
          <Link href="#" className="text-[#ff5040] hover:underline">
            Términos de Servicio
          </Link>{" "}
          y{" "}
          <Link href="#" className="text-[#ff5040] hover:underline">
            Política de Privacidad
          </Link>
        </p>
      </div>
    </div>
  );
}
