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
    <div className="space-y-6 md:space-y-8 pb-6 md:pb-8">
      {/* Header con bienvenida - Mejorado para mobile */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-2">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#303030] tracking-tight mb-2">
            Hola, {session.user.name || session.user.email?.split("@")[0]} 👋
          </h1>
          <p className="text-base sm:text-lg text-gray-500 font-light">
            {activeEvents.length > 0 
              ? `${activeEvents.length} ${activeEvents.length === 1 ? 'evento activo' : 'eventos activos'}`
              : "No hay eventos activos"}
          </p>
        </div>
        <div className="flex items-center gap-3 px-3 sm:px-4 py-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100/50 shrink-0">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
          <span className="text-xs sm:text-sm font-medium text-amber-700">PASSLY</span>
        </div>
      </div>

      {/* Widgets de Acceso Rápido - Mejorado para mobile */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {/* Widget Check-in - Mejorado y más prominente */}
        {(session.user.role === "SUPER_ADMIN" || session.user.role === "STAFF" || session.user.role === "ORGANIZER") && (
          <Link href="/dashboard/check-in">
            <Card className="h-full cursor-pointer hover:shadow-2xl hover:shadow-orange-100/50 transition-all duration-300 border-2 border-orange-200/50 bg-gradient-to-br from-[#ff5040] via-orange-500 to-orange-400 group overflow-hidden shadow-lg">
              <CardContent className="p-4 sm:p-6 md:p-7 flex flex-col items-center justify-center text-center min-h-[160px] sm:min-h-[180px] md:min-h-[200px]">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 bg-white/30 backdrop-blur-sm rounded-2xl sm:rounded-3xl flex items-center justify-center mb-3 sm:mb-4 md:mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 p-3 sm:p-4">
                  <Camera className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-1 sm:mb-2 tracking-tight">
                  Check-in
                </h3>
                <p className="text-xs sm:text-sm text-white/90 font-light">Escanear QR</p>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Widget Eventos */}
        <Link href="/dashboard/events">
          <Card className="h-full cursor-pointer hover:shadow-2xl hover:shadow-purple-100/50 transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 group overflow-hidden">
            <CardContent className="p-4 sm:p-6 md:p-7 flex flex-col items-center justify-center text-center min-h-[160px] sm:min-h-[180px] md:min-h-[200px]">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-3 sm:mb-4 md:mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 p-3 sm:p-4">
                <Calendar className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[#303030] mb-1 sm:mb-2 tracking-tight">
                Eventos
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 font-light">
                {activeEvents.length} activos
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Widget Invitados */}
        <Link href="/dashboard/guests">
          <Card className="h-full cursor-pointer hover:shadow-2xl hover:shadow-green-100/50 transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 group overflow-hidden">
            <CardContent className="p-4 sm:p-6 md:p-7 flex flex-col items-center justify-center text-center min-h-[160px] sm:min-h-[180px] md:min-h-[200px]">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-3 sm:mb-4 md:mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 p-3 sm:p-4">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[#303030] mb-1 sm:mb-2 tracking-tight">
                Invitados
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 font-light">
                {totalGuests} total
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Widget Reportes */}
        <Link href="/dashboard/reports">
          <Card className="h-full cursor-pointer hover:shadow-2xl hover:shadow-amber-100/50 transition-all duration-300 border-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 group overflow-hidden">
            <CardContent className="p-4 sm:p-6 md:p-7 flex flex-col items-center justify-center text-center min-h-[160px] sm:min-h-[180px] md:min-h-[200px]">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-3 sm:mb-4 md:mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 p-3 sm:p-4">
                <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[#303030] mb-1 sm:mb-2 tracking-tight">
                Reportes
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 font-light">
                Estadísticas
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Estadísticas Globales - Mejorado para mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        <Card className="border-0 bg-gradient-to-br from-[#fff1ec] to-[#ffe4dd] hover:shadow-xl hover:shadow-orange-100/30 transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-orange-600/70 tracking-wide mb-1">
                  Total Invitados
                </p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-orange-900 mt-1 tracking-tight">
                  {totalGuests}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-orange-200/50 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-xl hover:shadow-green-100/30 transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-emerald-600/70 tracking-wide mb-1">
                  Confirmados
                </p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-emerald-900 mt-1 tracking-tight">
                  {totalConfirmed}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-emerald-200/50 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-xl hover:shadow-amber-100/30 transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-amber-600/70 tracking-wide mb-1">
                  Pendientes
                </p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-amber-900 mt-1 tracking-tight">
                  {totalPendingInvitations}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-amber-200/50 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl hover:shadow-purple-100/30 transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-purple-600/70 tracking-wide mb-1">
                  Check-ins
                </p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-purple-900 mt-1 tracking-tight">
                  {totalCheckIns}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-purple-200/50 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
                <QrCode className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eventos Activos - Mejorado para mobile */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#303030] tracking-tight">
            Eventos Activos
          </h2>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            <Link href="/dashboard/events/new" className="flex-1 sm:flex-none">
              <Button size="sm" className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white border-0 rounded-2xl px-4 sm:px-5 py-2 sm:py-2.5 shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Nuevo Evento</span>
                <span className="sm:hidden">Nuevo</span>
              </Button>
            </Link>
            <Link href="/dashboard/events" className="flex-1 sm:flex-none">
              <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-2xl px-4 sm:px-5 py-2 sm:py-2.5 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 text-xs sm:text-sm">
                <span>Ver Todos</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
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
                <Button className="bg-gradient-to-r from-[#ff5040] to-[#ff8a40]">
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
                      <div className="bg-[#ffe4dd]/80 rounded-2xl p-4 border-0 backdrop-blur-sm">
                        <p className="text-xs text-orange-600/70 font-medium mb-1.5">Invitados</p>
                        <p className="text-2xl font-semibold text-orange-900 tracking-tight">{eventGuests}</p>
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
