import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SendInvitationButton } from "@/components/invitations/send-invitation-button";
import { EventSelector } from "@/components/guests/event-selector";
import { InvitationStatus } from "@prisma/client";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

export default async function InvitationsPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string; status?: string }>;
}) {
  try {
    const params = await searchParams;
    const session = await auth();

    if (!session?.user) {
      redirect("/login");
    }

    let invitations: any[] = [];
    
    try {
      const where: any = {};
      if (params.eventId) {
        where.eventId = params.eventId;
      }
      if (params.status) {
        where.status = params.status as InvitationStatus;
      }

      invitations = await db.invitation.findMany({
        where,
        include: {
          guestEvent: {
            include: {
              guest: true,
              event: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
      });
    } catch (error) {
      console.error("Error fetching invitations:", error);
      invitations = [];
    }

    const getStatusLabel = (status: InvitationStatus) => {
      switch (status) {
        case "PENDING":
          return "Pendiente";
        case "SENT":
          return "Enviada";
        case "CONFIRMED":
          return "Confirmada";
        case "REJECTED":
          return "Rechazada";
        default:
          return status;
      }
    };

    const getStatusColor = (status: InvitationStatus) => {
      switch (status) {
        case "PENDING":
          return "bg-gray-100 text-gray-800";
        case "SENT":
          return "bg-blue-100 text-blue-800";
        case "CONFIRMED":
          return "bg-green-100 text-green-800";
        case "REJECTED":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    // Obtener eventos para el selector
    let events: any[] = [];
    try {
      events = await db.event.findMany({
        where: session.user.role === "SUPER_ADMIN" 
          ? {} 
          : { organizationId: session.user.organizationId || "" },
        orderBy: { date: "desc" },
        take: 50,
      });
    } catch (error) {
      console.error("Error fetching events:", error);
    }

    return (
      <div className="w-full">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Invitaciones</h1>
          <p className="mt-2 text-sm md:text-base text-gray-600">
            Gestiona las invitaciones enviadas por evento
          </p>
        </div>

        {/* Selector de Evento - Prominente */}
        <EventSelector events={events} selectedEventId={params.eventId} />

        {!params.eventId ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Selecciona un evento</h3>
              <p className="text-gray-600 mb-4">
                Para ver las invitaciones, primero selecciona un evento del selector arriba
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/dashboard/events">
                  <Button variant="outline">Ver Eventos</Button>
                </Link>
                <Link href="/dashboard/events/new">
                  <Button>Crear Nuevo Evento</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : invitations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">No hay invitaciones para este evento</p>
              <Link href={`/dashboard/events/${params.eventId}`}>
                <Button variant="outline">Ver Evento</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <Card key={invitation.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold">
                          {invitation.guestEvent.guest.name}
                        </h3>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(invitation.status)}`}>
                          {getStatusLabel(invitation.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {invitation.guestEvent.guest.email}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Evento: {invitation.guestEvent.event.name}
                      </p>
                      {invitation.rsvpResponse && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            invitation.rsvpResponse === "YES" 
                              ? "bg-green-100 text-green-800"
                              : invitation.rsvpResponse === "NO"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            RSVP: {invitation.rsvpResponse === "YES" ? "Confirmado" : invitation.rsvpResponse === "NO" ? "Rechazado" : "Tal vez"}
                          </span>
                          {invitation.additionalGuests > 0 && (
                            <span className="text-xs text-gray-600">
                              +{invitation.additionalGuests} acompañante{invitation.additionalGuests > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      )}
                      {invitation.dietaryRestrictions && (
                        <p className="mt-1 text-xs text-gray-500">
                          🍽️ {invitation.dietaryRestrictions}
                        </p>
                      )}
                      {invitation.accessibilityNeeds && (
                        <p className="mt-1 text-xs text-gray-500">
                          ♿ {invitation.accessibilityNeeds}
                        </p>
                      )}
                      {invitation.sentAt && (
                        <p className="mt-1 text-sm text-gray-500">
                          Enviada: {format(new Date(invitation.sentAt), "PPP 'a las' p")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {invitation.status === "PENDING" && (
                        <SendInvitationButton invitationId={invitation.id} />
                      )}
                      <Link href={`/dashboard/invitations/${invitation.id}`}>
                        <Button variant="outline" size="sm">Ver</Button>
                      </Link>
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
    console.error("Error in InvitationsPage:", error);
    return (
      <div>
        <h1 className="text-3xl font-bold">Error</h1>
        <p className="mt-4 text-red-600">Error al cargar la página: {String(error)}</p>
      </div>
    );
  }
}
