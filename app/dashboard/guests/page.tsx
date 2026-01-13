import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GuestType } from "@prisma/client";
import { Upload, UserPlus, Calendar, CheckCircle2 } from "lucide-react";
import { EventSelector } from "@/components/guests/event-selector";
import { DeleteGuestButton } from "@/components/guests/delete-guest-button";

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string; eventId?: string }>;
}) {
  try {
    const params = await searchParams;
    const session = await auth();

    if (!session?.user) {
      redirect("/login");
    }

    let guests: any[] = [];
    let filteredGuests: any[] = [];
    
    try {
      const where: any = {};

      if (params.search) {
        where.OR = [
          { name: { contains: params.search } },
          { email: { contains: params.search } },
        ];
      }

      if (params.type) {
        where.type = params.type as GuestType;
      }

      guests = await db.guest.findMany({
        where,
        include: {
          guestEvents: {
            include: {
              event: true,
              qrCode: {
                include: {
                  checkIns: {
                    where: params.eventId ? { eventId: params.eventId } : undefined,
                    orderBy: { checkedInAt: "desc" },
                    take: 1,
                  },
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
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
      });

      filteredGuests = guests;
      if (params.eventId) {
        filteredGuests = guests.filter((guest) =>
          guest.guestEvents.some((ge: any) => ge.eventId === params.eventId)
        );
      }
    } catch (error) {
      console.error("Error fetching guests:", error);
      guests = [];
      filteredGuests = [];
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
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Invitados</h1>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              Gestiona tu base de invitados por evento
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {params.eventId && (
              <Link href={`/dashboard/guests/import?eventId=${params.eventId}`}>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Importar desde Excel
                </Button>
              </Link>
            )}
            <Link href={params.eventId ? `/dashboard/guests/new?eventId=${params.eventId}` : "/dashboard/guests/new"}>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Nuevo Invitado
              </Button>
            </Link>
          </div>
        </div>

        {/* Selector de Evento - Prominente */}
        <EventSelector events={events} selectedEventId={params.eventId} />

        {/* Búsqueda y filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form method="get" className="flex gap-4 flex-wrap">
              {params.eventId && (
                <input type="hidden" name="eventId" value={params.eventId} />
              )}
              <Input
                name="search"
                placeholder="Buscar por nombre o email..."
                defaultValue={params.search || ""}
                className="flex-1 min-w-[200px]"
              />
              <select
                name="type"
                defaultValue={params.type || ""}
                className="flex h-10 w-40 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Todos los tipos</option>
                <option value="PRESS">Prensa</option>
                <option value="INFLUENCER">Influencer</option>
                <option value="VIP">VIP</option>
                <option value="STAFF">Staff</option>
                <option value="PROVIDER">Proveedor</option>
              </select>
              <Button type="submit">Buscar</Button>
            </form>
          </CardContent>
        </Card>

        {!params.eventId ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Selecciona un evento</h3>
              <p className="text-gray-600 mb-4">
                Para gestionar invitados, primero selecciona un evento del selector arriba
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
        ) : filteredGuests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">No hay invitados en este evento</p>
              <div className="flex gap-4 justify-center">
                <Link href={`/dashboard/guests/import?eventId=${params.eventId}`}>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Importar desde Excel
                  </Button>
                </Link>
                <Link href={`/dashboard/guests/new?eventId=${params.eventId}`}>
                  <Button>Agregar Invitado</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Teléfono</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tipo</th>
                  {params.eventId && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Check-in</th>
                  )}
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Eventos</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest) => {
                  // Encontrar el guestEvent para el evento seleccionado
                  const guestEvent = params.eventId 
                    ? guest.guestEvents.find((ge: any) => ge.eventId === params.eventId)
                    : null;
                  
                  // Verificar si tiene check-in
                  const hasCheckIn = guestEvent?.qrCode?.checkIns?.length > 0;
                  
                  return (
                    <tr key={guest.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{guest.name}</td>
                      <td className="px-4 py-3 text-sm">{guest.email}</td>
                      <td className="px-4 py-3 text-sm">{guest.phone || "-"}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                          {getTypeLabel(guest.type)}
                        </span>
                      </td>
                      {params.eventId && (
                        <td className="px-4 py-3 text-sm">
                          {hasCheckIn ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="text-xs">Check-in</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Pendiente</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm">{guest._count.guestEvents}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <Link href={`/dashboard/guests/${guest.id}`}>
                            <Button variant="ghost" size="sm">Ver</Button>
                          </Link>
                          <Link href={`/dashboard/guests/${guest.id}/edit`}>
                            <Button variant="ghost" size="sm">Editar</Button>
                          </Link>
                          <DeleteGuestButton 
                            guestId={guest.id} 
                            guestName={guest.name}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in GuestsPage:", error);
    return (
      <div>
        <h1 className="text-3xl font-bold">Error</h1>
        <p className="mt-4 text-red-600">Error al cargar la página: {String(error)}</p>
      </div>
    );
  }
}
