import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { EventStatus } from "@prisma/client";
import { Mail, Trash2 } from "lucide-react";
import { DeleteEventButton } from "@/components/events/delete-event-button";

export default async function EventDetailPage({
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

    const event = await db.event.findUnique({
      where: { id },
      include: {
        organization: true,
        organizer: true,
        _count: {
          select: {
            guestEvents: true,
            checkIns: true,
          },
        },
      },
    });

    if (!event) {
      return (
        <div>
          <h1 className="text-3xl font-bold">Evento no encontrado</h1>
          <Link href="/dashboard/events">
            <Button className="mt-4">Volver a Eventos</Button>
          </Link>
        </div>
      );
    }

    // Check permissions: SUPER_ADMIN, same org, or organizer of this event (when user has no org)
    const canAccess =
      session.user.role === "SUPER_ADMIN" ||
      event.organizationId === session.user.organizationId ||
      event.organizerId === session.user.id;
    if (!canAccess) {
      redirect("/dashboard/events");
    }

    const getStatusLabel = (status: EventStatus) => {
      switch (status) {
        case "DRAFT":
          return "Borrador";
        case "ACTIVE":
          return "Activo";
        case "COMPLETED":
          return "Completado";
        default:
          return status;
      }
    };

    return (
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/dashboard/events" className="text-sm text-gray-600 hover:text-gray-900">
              ← Volver a Eventos
            </Link>
            <h1 className="mt-2 text-3xl font-bold">{event.name}</h1>
            <p className="mt-2 text-gray-600">{event.description || "Sin descripción"}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/events/${event.id}/edit`}>
              <Button variant="outline">Editar</Button>
            </Link>
            <DeleteEventButton eventId={event.id} eventName={event.name} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información del Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Estado</span>
                <p className="mt-1">{getStatusLabel(event.status)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Fecha y Hora</span>
                <p className="mt-1">{format(new Date(event.date), "PPP 'a las' p")}</p>
              </div>
              {event.location && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Ubicación</span>
                  <p className="mt-1">{event.location}</p>
                </div>
              )}
              {event.organizer && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Organizador</span>
                  <p className="mt-1">{event.organizer.name || event.organizer.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Invitados</span>
                <p className="mt-1 text-2xl font-bold">{event._count.guestEvents}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Check-ins</span>
                <p className="mt-1 text-2xl font-bold">{event._count.checkIns}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Link href={`/dashboard/events/${event.id}/guests`}>
                  <Button>Gestionar Invitados</Button>
                </Link>
                <Link href={`/dashboard/events/${event.id}/send-invitations`}>
                  <Button className="bg-gradient-to-r from-[#ff5040] to-[#ff8a40] text-white hover:from-[#e04334] hover:to-[#ff7240]">
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Invitaciones
                  </Button>
                </Link>
                <Link href={`/dashboard/invitations?eventId=${event.id}`}>
                  <Button variant="outline">Ver Invitaciones</Button>
                </Link>
                <Link href={`/dashboard/check-in?eventId=${event.id}`}>
                  <Button variant="outline">Check-in</Button>
                </Link>
                <Link href={`/dashboard/reports?eventId=${event.id}`}>
                  <Button variant="outline">Ver Reportes</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in EventDetailPage:", error);
    return (
      <div>
        <h1 className="text-3xl font-bold">Error</h1>
        <p className="mt-4 text-red-600">Error al cargar la página: {String(error)}</p>
      </div>
    );
  }
}
