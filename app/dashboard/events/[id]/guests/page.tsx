import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InvitationStatus } from "@prisma/client";
import { UserPlus, Mail, Upload, Trash2, Edit, CheckCircle, XCircle, Clock, Send } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { RemoveGuestButton } from "@/components/guests/remove-guest-button";
import { SendInvitationButton } from "@/components/invitations/send-invitation-button";

export default async function EventGuestsPage({
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
        guestEvents: {
          include: {
            guest: true,
            invitation: true,
            qrCode: true,
          },
          orderBy: {
            createdAt: "desc",
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

    const getStatusBadge = (status: InvitationStatus | null) => {
      if (!status) {
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            Sin Invitación
          </span>
        );
      }

      const badges = {
        PENDING: "bg-yellow-100 text-yellow-800",
        SENT: "bg-blue-100 text-blue-800",
        CONFIRMED: "bg-green-100 text-green-800",
        REJECTED: "bg-red-100 text-red-800",
      };

      const labels = {
        PENDING: "Pendiente",
        SENT: "Enviada",
        CONFIRMED: "Confirmada",
        REJECTED: "Rechazada",
      };

      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badges[status] || badges.PENDING}`}>
          {labels[status] || status}
        </span>
      );
    };

    // Estadísticas
    const stats = {
      total: event.guestEvents.length,
      pending: event.guestEvents.filter(ge => !ge.invitation || ge.invitation.status === InvitationStatus.PENDING).length,
      sent: event.guestEvents.filter(ge => ge.invitation?.status === InvitationStatus.SENT).length,
      confirmed: event.guestEvents.filter(ge => ge.invitation?.status === InvitationStatus.CONFIRMED).length,
      rejected: event.guestEvents.filter(ge => ge.invitation?.status === InvitationStatus.REJECTED).length,
    };

    return (
      <div className="w-full">
        <div className="mb-6 md:mb-8">
          <Link href={`/dashboard/events/${event.id}`} className="text-sm text-gray-600 hover:text-gray-900">
            ← Volver al Evento
          </Link>
          <h1 className="mt-2 text-2xl md:text-3xl font-bold">Invitados del Evento</h1>
          <p className="mt-2 text-sm md:text-base text-gray-600">{event.name}</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#ff5040]">{stats.total}</p>
                <p className="text-xs text-gray-600 mt-1">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-gray-600 mt-1">Pendientes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
                <p className="text-xs text-gray-600 mt-1">Enviadas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                <p className="text-xs text-gray-600 mt-1">Confirmadas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                <p className="text-xs text-gray-600 mt-1">Rechazadas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones rápidas */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Gestiona los invitados de este evento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Link href={`/dashboard/guests/import?eventId=${event.id}`}>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Importar desde Excel
                </Button>
              </Link>
              <Link href={`/dashboard/guests/new?eventId=${event.id}`}>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Crear Nuevo Invitado
                </Button>
              </Link>
              <Link href={`/dashboard/events/${event.id}/send-invitations`}>
                <Button className="bg-gradient-to-r from-[#ff5040] to-[#ff8a40]">
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Invitaciones
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Lista de invitados */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Invitados ({event.guestEvents.length})</CardTitle>
            <CardDescription>
              Todos los invitados asignados a este evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {event.guestEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No hay invitados asignados a este evento</p>
                <div className="flex gap-4 justify-center">
                  <Link href={`/dashboard/guests/import?eventId=${event.id}`}>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Importar desde Excel
                    </Button>
                  </Link>
                  <Link href={`/dashboard/guests/new?eventId=${event.id}`}>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Agregar Invitado
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {event.guestEvents.map((guestEvent) => (
                  <div
                    key={guestEvent.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium text-[#303030]">{guestEvent.guest.name}</p>
                        {getStatusBadge(guestEvent.invitation?.status || null)}
                      </div>
                      <p className="text-sm text-gray-600">{guestEvent.guest.email}</p>
                      {guestEvent.guest.phone && (
                        <p className="text-xs text-gray-500">{guestEvent.guest.phone}</p>
                      )}
                      
                      {/* Información de invitación */}
                      {guestEvent.invitation && (
                        <div className="mt-2 space-y-1">
                          {guestEvent.invitation.sentAt && (
                            <p className="text-xs text-gray-500">
                              Enviada: {format(new Date(guestEvent.invitation.sentAt), "PPP 'a las' p", { locale: es })}
                            </p>
                          )}
                          {guestEvent.invitation.rsvpResponse === "YES" && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              <span>Confirmó asistencia</span>
                              {guestEvent.invitation.additionalGuests > 0 && (
                                <span>(+{guestEvent.invitation.additionalGuests} acompañantes)</span>
                              )}
                            </div>
                          )}
                          {guestEvent.invitation.rsvpResponse === "NO" && (
                            <div className="flex items-center gap-1 text-xs text-red-600">
                              <XCircle className="w-3 h-3" />
                              <span>No asistirá</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Link href={`/dashboard/guests/${guestEvent.guest.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </Link>
                      <Link href={`/dashboard/guests/${guestEvent.guest.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      {guestEvent.invitation && guestEvent.invitation.status === InvitationStatus.PENDING && (
                        <SendInvitationButton invitationId={guestEvent.invitation.id} />
                      )}
                      <RemoveGuestButton eventId={event.id} guestEventId={guestEvent.id} guestName={guestEvent.guest.name} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Error in EventGuestsPage:", error);
    return (
      <div>
        <h1 className="text-3xl font-bold">Error</h1>
        <p className="mt-4 text-red-600">Error al cargar la página: {String(error)}</p>
      </div>
    );
  }
}
