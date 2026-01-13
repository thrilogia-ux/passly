import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Image as ImageIcon, FileText, Calendar } from "lucide-react";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      redirect("/login");
    }

    const template = await db.invitationTemplate.findUnique({
      where: { id },
      include: {
        event: true,
        organization: true,
        _count: {
          select: {
            invitations: true,
          },
        },
      },
    });

    if (!template) {
      return (
        <div>
          <h1 className="text-3xl font-bold">Template no encontrado</h1>
          <p className="mt-4 text-gray-600">El template que buscas no existe.</p>
          <Link href="/dashboard/templates">
            <Button className="mt-4">Volver a Templates</Button>
          </Link>
        </div>
      );
    }

    // Verificar permisos
    if (
      session.user.role !== "SUPER_ADMIN" &&
      session.user.organizationId !== template.organizationId
    ) {
      return (
        <div>
          <h1 className="text-3xl font-bold">Acceso denegado</h1>
          <p className="mt-4 text-gray-600">No tienes permiso para ver este template.</p>
          <Link href="/dashboard/templates">
            <Button className="mt-4">Volver a Templates</Button>
          </Link>
        </div>
      );
    }

    const qrPosition = template.qrPosition
      ? JSON.parse(template.qrPosition)
      : null;

    return (
      <div className="w-full">
        <div className="mb-6 md:mb-8">
          <Link
            href="/dashboard/templates"
            className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Templates
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{template.name}</h1>
              <p className="mt-2 text-sm md:text-base text-gray-600">
                {template.event ? (
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Template para: {template.event.name}
                  </span>
                ) : (
                  <span>Template Global de la Organización</span>
                )}
              </p>
            </div>
            <Link href={`/dashboard/templates/${template.id}/edit`}>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Preview del Template */}
          <Card>
            <CardHeader>
              <CardTitle>Preview del Template</CardTitle>
              <CardDescription>Vista previa del diseño de la invitación</CardDescription>
            </CardHeader>
            <CardContent>
              {template.backgroundImage ? (
                <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={template.backgroundImage}
                    alt={template.name}
                    className="w-full h-auto max-h-[600px] object-contain"
                  />
                  {qrPosition && (
                    <div
                      className="absolute border-2 border-blue-500 bg-blue-500/20"
                      style={{
                        left: `${qrPosition.x}px`,
                        top: `${qrPosition.y}px`,
                        width: `${qrPosition.width || 200}px`,
                        height: `${qrPosition.height || 200}px`,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-xs text-blue-600 bg-white/80 px-2 py-1 rounded">
                          QR Code
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded text-sm flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Con diseño gráfico
                  </div>
                </div>
              ) : template.htmlContent ? (
                <div className="w-full bg-gray-100 rounded-lg p-8 border-2 border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">Template HTML</span>
                  </div>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: template.htmlContent.substring(0, 500) + "...",
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                  <span className="text-gray-400">Sin preview disponible</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información del Template */}
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
              <CardDescription>Detalles del template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre</label>
                <p className="mt-1 text-gray-900">{template.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Tipo</label>
                <p className="mt-1 text-gray-900">
                  {template.event ? "Template de Evento" : "Template Global"}
                </p>
              </div>

              {template.event && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Evento Asignado</label>
                  <p className="mt-1 text-gray-900">{template.event.name}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Versión</label>
                <p className="mt-1 text-gray-900">{template.version}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Estado</label>
                <p className="mt-1">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      template.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {template.isActive ? "Activo" : "Inactivo"}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Invitaciones Usadas</label>
                <p className="mt-1 text-gray-900">{template._count.invitations}</p>
              </div>

              {qrPosition && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Posición del QR</label>
                  <div className="mt-1 text-sm text-gray-600 space-y-1">
                    <p>X: {qrPosition.x}px</p>
                    <p>Y: {qrPosition.y}px</p>
                    <p>
                      Tamaño: {qrPosition.width || 200} × {qrPosition.height || 200}px
                    </p>
                  </div>
                </div>
              )}

              {template.qrSize && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Tamaño del QR</label>
                  <p className="mt-1 text-gray-900">{template.qrSize}px</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Creado</label>
                <p className="mt-1 text-gray-900">
                  {new Date(template.createdAt).toLocaleDateString("es-AR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Última actualización</label>
                <p className="mt-1 text-gray-900">
                  {new Date(template.updatedAt).toLocaleDateString("es-AR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in TemplateDetailPage:", error);
    return (
      <div>
        <h1 className="text-3xl font-bold">Error</h1>
        <p className="mt-4 text-red-600">Error al cargar el template: {String(error)}</p>
        <Link href="/dashboard/templates">
          <Button className="mt-4">Volver a Templates</Button>
        </Link>
      </div>
    );
  }
}
