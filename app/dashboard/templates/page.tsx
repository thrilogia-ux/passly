import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { DeleteTemplateButton } from "@/components/templates/delete-template-button";

export default async function TemplatesPage() {
  try {
    const session = await auth();
    if (!session?.user) {
      redirect("/login");
    }

    if (!session.user.organizationId) {
      return (
        <div>
          <h1 className="text-3xl font-bold">Templates de Invitación</h1>
          <p className="mt-4 text-gray-600">
            No tienes una organización asignada. Contacta al administrador.
          </p>
        </div>
      );
    }

    // Primero obtener templates sin include de event para evitar errores
    const templatesRaw = await db.invitationTemplate.findMany({
      where: {
        organizationId: session.user.organizationId,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            invitations: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Luego obtener eventos para cada template que tenga eventId (simplificado para evitar errores)
    const templates = templatesRaw.map((template) => {
      // Si tiene eventId, intentamos obtener el evento, pero si falla, continuamos sin él
      return {
        ...template,
        event: template.eventId ? { id: template.eventId, name: "Cargando..." } : null,
      };
    });

    return (
      <div className="w-full">
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Templates de Invitación</h1>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              Gestiona los diseños base para tus invitaciones
            </p>
          </div>
          <Link href="/dashboard/templates/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Template
            </Button>
          </Link>
        </div>

        {templates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No hay templates aún</p>
              <Link href="/dashboard/templates/new">
                <Button>Crear primer template</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{template.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {template.event ? (
                          <span>Evento: {template.event.name}</span>
                        ) : (
                          <span>Template Global</span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Preview de la imagen si existe */}
                    {template.backgroundImage ? (
                      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={template.backgroundImage}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          Con diseño
                        </div>
                      </div>
                    ) : template.htmlContent ? (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-400" />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Sin preview</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Versión {template.version}</span>
                      <span>{template._count.invitations} invitaciones</span>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/dashboard/templates/${template.id}/edit`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      </Link>
                      <Link href={`/dashboard/templates/${template.id}`} className="flex-1">
                        <Button variant="ghost" className="w-full" size="sm">
                          Ver
                        </Button>
                      </Link>
                      <DeleteTemplateButton
                        templateId={template.id}
                        templateName={template.name}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in TemplatesPage:", error);
    return (
      <div>
        <h1 className="text-3xl font-bold">Error</h1>
        <p className="mt-4 text-red-600">Error al cargar los templates: {String(error)}</p>
      </div>
    );
  }
}
