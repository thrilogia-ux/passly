import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function IntegrationsPage() {
  try {
    const session = await auth();

    if (!session?.user) {
      redirect("/login");
    }

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Integraciones</h1>
          <p className="mt-2 text-gray-600">Gestiona las integraciones con servicios externos</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Google Calendar</CardTitle>
              <CardDescription>Sincroniza eventos con Google Calendar</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">Conectar Google Calendar</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Pública</CardTitle>
              <CardDescription>Accede a la documentación de la API</CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/api/public/v1/docs" target="_blank" rel="noopener noreferrer">
                <Button variant="outline">Ver Documentación</Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in IntegrationsPage:", error);
    return (
      <div>
        <h1 className="text-3xl font-bold">Error</h1>
        <p className="mt-4 text-red-600">Error al cargar la página: {String(error)}</p>
      </div>
    );
  }
}
