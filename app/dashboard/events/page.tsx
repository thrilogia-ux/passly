import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { EventStatus } from "@prisma/client";

export default async function EventsPage() {
  try {
    const session = await auth();

    if (!session?.user) {
      redirect("/login");
    }

    let events: any[] = [];
    try {
      const where: any = {};
      if (session.user.role !== "SUPER_ADMIN" && session.user.organizationId) {
        where.organizationId = session.user.organizationId;
      }

      events = await db.event.findMany({
        where,
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
        orderBy: {
          date: "desc",
        },
      });
    } catch (error) {
      console.error("Error fetching events:", error);
      events = [];
    }

    const getStatusColor = (status: EventStatus) => {
      switch (status) {
        case "DRAFT":
          return "bg-gray-100 text-gray-800";
        case "ACTIVE":
          return "bg-green-100 text-green-800";
        case "COMPLETED":
          return "bg-blue-100 text-blue-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

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
      <div className="w-full">
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Eventos</h1>
            <p className="mt-2 text-sm md:text-base text-gray-600">Gestiona tus eventos recurrentes</p>
          </div>
          <Link href="/dashboard/events/new">
            <Button className="w-full sm:w-auto">Nuevo Evento</Button>
          </Link>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No hay eventos aún</p>
              <Link href="/dashboard/events/new">
                <Button className="mt-4">Crear primer evento</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow w-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{event.name}</CardTitle>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(event.status)}`}>
                      {getStatusLabel(event.status)}
                    </span>
                  </div>
                  <CardDescription>
                    {event.description || "Sin descripción"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Fecha:</span>{" "}
                      {format(new Date(event.date), "PPP 'a las' p")}
                    </div>
                    {event.location && (
                      <div>
                        <span className="font-medium">Ubicación:</span> {event.location}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Invitados:</span> {event._count.guestEvents}
                    </div>
                    <div>
                      <span className="font-medium">Check-ins:</span> {event._count.checkIns}
                    </div>
                    {event.organizer && (
                      <div>
                        <span className="font-medium">Organizador:</span> {event.organizer.name || event.organizer.email}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/dashboard/events/${event.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">Ver</Button>
                    </Link>
                    <Link href={`/dashboard/events/${event.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full">Editar</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in EventsPage:", error);
    return (
      <div>
        <h1 className="text-3xl font-bold">Error</h1>
        <p className="mt-4 text-red-600">Error al cargar la página: {String(error)}</p>
      </div>
    );
  }
}
