import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { EventStatus, InvitationStatus } from "@prisma/client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  QrCode, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  Mail,
  ArrowRight,
  Sparkles,
  Send,
  Camera
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Initialize default values
  let activeEvents: any[] = [];
  let totalGuests = 0;
  let totalCheckIns = 0;
  let totalConfirmed = 0;
  let totalRejected = 0;
  let totalPending = 0;
  let totalSent = 0;
  let totalPendingInvitations = 0;

  try {
    // Obtener solo eventos ACTIVOS
    const whereClause: any = {
      status: EventStatus.ACTIVE,
    };

    if (session.user.role !== "SUPER_ADMIN" && session.user.organizationId) {
      whereClause.organizationId = session.user.organizationId;
    }

    activeEvents = await db.event.findMany({
      where: whereClause,
      include: {
        guestEvents: {
          include: {
            guest: true,
            invitation: true,
          },
        },
        _count: {
          select: {
            guestEvents: true,
            checkIns: true,
          },
        },
      },
      orderBy: {
        date: "asc", // Próximos eventos primero
      },
      take: 6, // Los 6 próximos
    });

    // Calcular estadísticas globales
    totalGuests = activeEvents.reduce((sum, e) => sum + e._count.guestEvents, 0);
    totalCheckIns = activeEvents.reduce((sum, e) => sum + e._count.checkIns, 0);
    
    // Estadísticas de invitaciones
    activeEvents.forEach(event => {
      event.guestEvents.forEach((ge: any) => {
        if (ge.invitation) {
          if (ge.invitation.status === InvitationStatus.CONFIRMED) totalConfirmed++;
          else if (ge.invitation.status === InvitationStatus.REJECTED) totalRejected++;
          else if (ge.invitation.status === InvitationStatus.PENDING) totalPending++;
          else if (ge.invitation.status === InvitationStatus.SENT) totalSent++;
        } else {
          totalPending++;
        }
      });
    });

    totalPendingInvitations = totalPending + totalSent;
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    // Continue with empty data if database query fails
    // This allows the page to render even if there's a DB connection issue
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header con bienvenida - Estilo Apple */}
      <div className="flex items-start justify-between pb-2">
        <div>
          <h1 className="text-4xl font-semibold text-[#303030] tracking-tight mb-2">
            Hola, {session.user.name || session.user.email?.split("@")[0]} 👋
          </h1>
          <p className="text-lg text-gray-500 font-light">
            {activeEvents.length > 0 
              ? `${activeEvents.length} ${activeEvents.length === 1 ? 'evento activo' : 'eventos activos'}`
              : "No hay eventos activos"}
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100/50">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium text-amber-700">PASSLY</span>
        </div>
      </div>

      {/* Botón de acceso rápido al escáner QR - Solo para Admin y Staff */}
      {(session.user.role === "SUPER_ADMIN" || session.user.role === "STAFF" || session.user.role === "ORGANIZER") && (
        <div className="mb-8">
          <Link href="/dashboard/check-in">
            <Card className="border-0 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-300 cursor-pointer group overflow-hidden">
              <CardContent className="p-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 bg-white/25 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Camera className="w-10 h-10 text-white drop-shadow-lg" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-semibold text-white mb-2 tracking-tight">Escanear QR Rápido</h2>
                      <p className="text-white/90 text-base font-light">Acceso directo a la cámara para check-in</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-white bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl group-hover:bg-white/30 transition-all">
                    <span className="text-base font-medium">Abrir Cámara</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      {/* Widgets de Acceso Rápido - Estilo Apple */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Widget Check-in - Solo visible para Admin y Staff */}
        {(session.user.role === "SUPER_ADMIN" || session.user.role === "STAFF" || session.user.role === "ORGANIZER") && (
          <Link href="/dashboard/check-in">
            <Card className="h-full cursor-pointer hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 group overflow-hidden">
              <CardContent className="p-7 flex flex-col items-center justify-center text-center min-h-[200px]">
                <div className="w-18 h-18 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-3xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 p-4">
                  <QrCode className="w-9 h-9 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#303030] mb-2 tracking-tight">Check-in</h3>
                <p className="text-sm text-gray-500 font-light">Escanear QR</p>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Widget Eventos */}
        <Link href="/dashboard/events">
          <Card className="h-full cursor-pointer hover:shadow-2xl hover:shadow-purple-100/50 transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 group overflow-hidden">
            <CardContent className="p-7 flex flex-col items-center justify-center text-center min-h-[200px]">
              <div className="w-18 h-18 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 p-4">
                <Calendar className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#303030] mb-2 tracking-tight">Eventos</h3>
              <p className="text-sm text-gray-500 font-light">{activeEvents.length} activos</p>
            </CardContent>
          </Card>
        </Link>

        {/* Widget Invitados */}
        <Link href="/dashboard/guests">
          <Card className="h-full cursor-pointer hover:shadow-2xl hover:shadow-green-100/50 transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 group overflow-hidden">
            <CardContent className="p-7 flex flex-col items-center justify-center text-center min-h-[200px]">
              <div className="w-18 h-18 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 p-4">
                <Users className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#303030] mb-2 tracking-tight">Invitados</h3>
              <p className="text-sm text-gray-500 font-light">{totalGuests} total</p>
            </CardContent>
          </Card>
        </Link>

        {/* Widget Reportes */}
        <Link href="/dashboard/reports">
          <Card className="h-full cursor-pointer hover:shadow-2xl hover:shadow-amber-100/50 transition-all duration-300 border-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 group overflow-hidden">
            <CardContent className="p-7 flex flex-col items-center justify-center text-center min-h-[200px]">
              <div className="w-18 h-18 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 p-4">
                <TrendingUp className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#303030] mb-2 tracking-tight">Reportes</h3>
              <p className="text-sm text-gray-500 font-light">Estadísticas</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Estadísticas Globales - Cards estilo Apple */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-sky-50 hover:shadow-xl hover:shadow-blue-100/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600/70 tracking-wide mb-1">Total Invitados</p>
                <p className="text-4xl font-semibold text-blue-900 mt-1 tracking-tight">{totalGuests}</p>
              </div>
              <div className="w-14 h-14 bg-blue-200/50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-xl hover:shadow-green-100/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600/70 tracking-wide mb-1">Confirmados</p>
                <p className="text-4xl font-semibold text-emerald-900 mt-1 tracking-tight">{totalConfirmed}</p>
              </div>
              <div className="w-14 h-14 bg-emerald-200/50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-xl hover:shadow-amber-100/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-600/70 tracking-wide mb-1">Pendientes</p>
                <p className="text-4xl font-semibold text-amber-900 mt-1 tracking-tight">{totalPendingInvitations}</p>
              </div>
              <div className="w-14 h-14 bg-amber-200/50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl hover:shadow-purple-100/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600/70 tracking-wide mb-1">Check-ins</p>
                <p className="text-4xl font-semibold text-purple-900 mt-1 tracking-tight">{totalCheckIns}</p>
              </div>
              <div className="w-14 h-14 bg-purple-200/50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <QrCode className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eventos Activos - Cards detallados */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold text-[#303030] tracking-tight">Eventos Activos</h2>
          <div className="flex gap-3">
            <Link href="/dashboard/events/new">
              <Button size="sm" className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white border-0 rounded-2xl px-5 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300">
                <Calendar className="w-4 h-4 mr-2" />
                Nuevo Evento
              </Button>
            </Link>
            <Link href="/dashboard/events">
              <Button variant="outline" size="sm" className="rounded-2xl px-5 py-2.5 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300">
                Ver Todos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {activeEvents.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium mb-2">No hay eventos activos</p>
              <p className="text-gray-400 text-sm mb-4">Crea tu primer evento para comenzar</p>
              <Link href="/dashboard/events/new">
                <Button className="bg-gradient-to-r from-[#00b5ff] to-[#0099cc]">
                  <Calendar className="w-4 h-4 mr-2" />
                  Crear Primer Evento
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeEvents.map((event) => {
              // Calcular estadísticas por evento
              const eventGuests = event.guestEvents.length;
              const eventConfirmed = event.guestEvents.filter(
                (ge: any) => ge.invitation?.status === InvitationStatus.CONFIRMED
              ).length;
              const eventRejected = event.guestEvents.filter(
                (ge: any) => ge.invitation?.status === InvitationStatus.REJECTED
              ).length;
              const eventPending = event.guestEvents.filter(
                (ge: any) => !ge.invitation || ge.invitation.status === InvitationStatus.PENDING
              ).length;
              const eventSent = event.guestEvents.filter(
                (ge: any) => ge.invitation?.status === InvitationStatus.SENT
              ).length;
              const eventCheckIns = event._count.checkIns;
              const attendanceRate = eventGuests > 0 
                ? Math.round((eventConfirmed / eventGuests) * 100) 
                : 0;

              return (
                <Card key={event.id} className="hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 border-0 bg-white group overflow-hidden">
                  <CardHeader className="pb-4">
                    <Link href={`/dashboard/events/${event.id}`} className="block">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-2xl font-semibold mb-2 text-[#303030] group-hover:text-amber-600 transition-colors tracking-tight">
                            {event.name}
                          </CardTitle>
                          <CardDescription className="text-base text-gray-500 font-light">
                            {format(new Date(event.date), "PPP 'a las' p", { locale: es })}
                          </CardDescription>
                          {event.location && (
                            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5 font-light">
                              <span>📍</span>
                              <span className="truncate">{event.location}</span>
                            </p>
                          )}
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0 ml-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          <Calendar className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {/* Estadísticas del evento en grid */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-blue-50/80 rounded-2xl p-4 border-0 backdrop-blur-sm">
                        <p className="text-xs text-blue-600/70 font-medium mb-1.5">Invitados</p>
                        <p className="text-2xl font-semibold text-blue-900 tracking-tight">{eventGuests}</p>
                      </div>
                      <div className="bg-emerald-50/80 rounded-2xl p-4 border-0 backdrop-blur-sm">
                        <p className="text-xs text-emerald-600/70 font-medium mb-1.5">Confirmados</p>
                        <p className="text-2xl font-semibold text-emerald-900 tracking-tight">{eventConfirmed}</p>
                      </div>
                      <div className="bg-amber-50/80 rounded-2xl p-4 border-0 backdrop-blur-sm">
                        <p className="text-xs text-amber-600/70 font-medium mb-1.5">Pendientes</p>
                        <p className="text-2xl font-semibold text-amber-900 tracking-tight">{eventPending + eventSent}</p>
                      </div>
                      <div className="bg-purple-50/80 rounded-2xl p-4 border-0 backdrop-blur-sm">
                        <p className="text-xs text-purple-600/70 font-medium mb-1.5">Check-ins</p>
                        <p className="text-2xl font-semibold text-purple-900 tracking-tight">{eventCheckIns}</p>
                      </div>
                    </div>

                    {/* Barra de progreso visual */}
                    <div className="space-y-2.5 mb-5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-medium">Tasa de Confirmación</span>
                        <span className="font-semibold text-[#303030]">{attendanceRate}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-400 to-teal-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${attendanceRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Acciones rápidas */}
                    <div className="flex gap-3">
                      <Link 
                        href={`/dashboard/events/${event.id}/guests`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full rounded-2xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300">
                          <Users className="w-4 h-4 mr-1.5" />
                          Invitados
                        </Button>
                      </Link>
                      <Link 
                        href={`/dashboard/check-in?eventId=${event.id}`}
                        className="flex-1"
                      >
                        <Button size="sm" className="w-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                          <QrCode className="w-4 h-4 mr-1.5" />
                          Check-in
                        </Button>
                      </Link>
                      <Link 
                        href={`/dashboard/events/${event.id}/send-invitations`}
                      >
                        <Button size="sm" variant="outline" className="px-4 rounded-2xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300">
                          <Send className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
