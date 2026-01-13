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
                <div className="space-y-4">
                  {guest.guestEvents.map((guestEvent: any) => (
                    <div key={guestEvent.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <Link
                            href={`/dashboard/events/${guestEvent.event.id}`}
                            className="text-lg font-semibold hover:underline"
                          >
                            {guestEvent.event.name}
                          </Link>
                          <p className="text-sm text-gray-600">
                            {format(new Date(guestEvent.event.date), "PPP 'a las' p")}
                          </p>
                          {guestEvent.qrCode && (
                            <p className="mt-1 text-xs text-gray-500">
                              QR: {guestEvent.qrCode.status}
                              {guestEvent.qrCode.checkIns && guestEvent.qrCode.checkIns.length > 0 && (
                                <span className="ml-2">
                                  - {guestEvent.qrCode.checkIns.length} check-in(s)
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                        <Link href={`/dashboard/events/${guestEvent.event.id}`}>
                          <Button variant="outline" size="sm">Ver Evento</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
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
