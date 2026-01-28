import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GuestType } from "@prisma/client";
import { format } from "date-fns";
import { DeleteGuestButton } from "@/components/guests/delete-guest-button";

export default async function GuestDetailPage({
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

    const guest = await db.guest.findUnique({
      where: { id },
      include: {
        guestEvents: {
          include: {
            event: true,
            invitation: true,
            qrCode: {
              include: {
                checkIns: true,
              },
            },
          },
        },
        _count: {
          select: {
            guestEvents: true,
          },
        },
      },
    });

    if (!guest) {
      return (
        <div>
          <h1 className="text-3xl font-bold">Invitado no encontrado</h1>
          <Link href="/dashboard/guests">
            <Button className="mt-4">Volver a Invitados</Button>
          </Link>
        </div>
      );
    }

    const getTypeLabel = (type: GuestType) => {
      switch (type) {
        case "PRESS":
          return "Prensa";
        case "INFLUENCER":
          return "Influencer";
        case "VIP":
          return "VIP";
        case "STAFF":
          return "Staff";
        case "PROVIDER":
          return "Proveedor";
        default:
          return type;
      }
    };

    const getInvitationStatusLabel = (status: string) => {
      switch (status) {
        case "PENDING":
          return { label: "Pendiente", color: "bg-gray-100 text-gray-800" };
        case "SENT":
          return { label: "Enviada", color: "bg-blue-100 text-blue-800" };
        case "CONFIRMED":
          return { label: "Confirmada", color: "bg-green-100 text-green-800" };
        case "REJECTED":
          return { label: "Rechazada", color: "bg-red-100 text-red-800" };
        default:
          return { label: status, color: "bg-gray-100 text-gray-800" };
      }
    };

    const getRsvpLabel = (rsvp: string | null) => {
      switch (rsvp) {
        case "YES":
          return { label: "Confirmado", color: "bg-green-100 text-green-800", icon: "✓" };
        case "NO":
          return { label: "No asistirá", color: "bg-red-100 text-red-800", icon: "✗" };
        case "MAYBE":
          return { label: "Tal vez", color: "bg-yellow-100 text-yellow-800", icon: "?" };
        default:
          return null;
      }
    };

    return (
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/dashboard/guests" className="text-sm text-gray-600 hover:text-gray-900">
              ← Volver a Invitados
            </Link>
            <h1 className="mt-2 text-3xl font-bold">{guest.name}</h1>
            <p className="mt-2 text-gray-600">{guest.email}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/guests/${guest.id}/edit`}>
              <Button variant="outline">Editar</Button>
            </Link>
            <DeleteGuestButton guestId={guest.id} guestName={guest.name} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información del Invitado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Email</span>
                <p className="mt-1">{guest.email}</p>
              </div>
              {guest.phone && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Teléfono</span>
                  <p className="mt-1">{guest.phone}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-500">Tipo</span>
                <p className="mt-1">{getTypeLabel(guest.type)}</p>
              </div>
              {guest.tags && guest.tags.trim() && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Tags</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {guest.tags.split(',').map((tag: string, idx: number) => (
                      <span key={idx} className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
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
                <span className="text-sm font-medium text-gray-500">Total Eventos</span>
                <p className="mt-1 text-2xl font-bold">{guest._count.guestEvents}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {guest.guestEvents.length > 0 && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {guest.guestEvents.map((guestEvent: any) => {
                    const invitation = guestEvent.invitation;
                    const invitationStatus = invitation ? getInvitationStatusLabel(invitation.status) : null;
                    const rsvpInfo = invitation ? getRsvpLabel(invitation.rsvpResponse) : null;
                    
                    return (
                      <div key={guestEvent.id} className="border-b border-gray-200 pb-6 last:border-0">
                        {/* Header del evento */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Link
                              href={`/dashboard/events/${guestEvent.event.id}`}
                              className="text-lg font-semibold hover:underline text-[#303030]"
                            >
                              {guestEvent.event.name}
                            </Link>
                            <p className="text-sm text-gray-600">
                              {format(new Date(guestEvent.event.date), "PPP 'a las' p")}
                            </p>
                          </div>
                          <Link href={`/dashboard/events/${guestEvent.event.id}`}>
                            <Button variant="outline" size="sm">Ver Evento</Button>
                          </Link>
                        </div>

                        {/* Estado de invitación y RSVP */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {invitationStatus && (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${invitationStatus.color}`}>
                              📧 {invitationStatus.label}
                            </span>
                          )}
                          {rsvpInfo && (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${rsvpInfo.color}`}>
                              {rsvpInfo.icon} RSVP: {rsvpInfo.label}
                            </span>
                          )}
                          {invitation?.additionalGuests > 0 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              👥 +{invitation.additionalGuests} acompañante{invitation.additionalGuests > 1 ? "s" : ""}
                            </span>
                          )}
                          {guestEvent.qrCode && (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              guestEvent.qrCode.status === "USED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}>
                              🎫 QR: {guestEvent.qrCode.status === "USED" ? "Usado" : guestEvent.qrCode.status === "ACTIVE" ? "Activo" : guestEvent.qrCode.status}
                              {guestEvent.qrCode.checkIns?.length > 0 && ` (${guestEvent.qrCode.checkIns.length} check-in)`}
                            </span>
                          )}
                        </div>

                        {/* Información adicional de la invitación */}
                        {invitation && (invitation.dietaryRestrictions || invitation.accessibilityNeeds || invitation.notes) && (
                          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                            {invitation.dietaryRestrictions && (
                              <div className="flex items-start gap-2">
                                <span className="text-sm">🍽️</span>
                                <div>
                                  <span className="text-xs font-medium text-gray-500">Restricciones alimentarias:</span>
                                  <p className="text-sm text-gray-700">{invitation.dietaryRestrictions}</p>
                                </div>
                              </div>
                            )}
                            {invitation.accessibilityNeeds && (
                              <div className="flex items-start gap-2">
                                <span className="text-sm">♿</span>
                                <div>
                                  <span className="text-xs font-medium text-gray-500">Necesidades de accesibilidad:</span>
                                  <p className="text-sm text-gray-700">{invitation.accessibilityNeeds}</p>
                                </div>
                              </div>
                            )}
                            {invitation.notes && (
                              <div className="flex items-start gap-2">
                                <span className="text-sm">📝</span>
                                <div>
                                  <span className="text-xs font-medium text-gray-500">Notas:</span>
                                  <p className="text-sm text-gray-700">{invitation.notes}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Fecha de envío */}
                        {invitation?.sentAt && (
                          <p className="mt-2 text-xs text-gray-500">
                            📤 Enviada el {format(new Date(invitation.sentAt), "PPP 'a las' p")}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in GuestDetailPage:", error);
    return (
      <div>
        <h1 className="text-3xl font-bold">Error</h1>
        <p className="mt-4 text-red-600">Error al cargar la página: {String(error)}</p>
      </div>
    );
  }
}
