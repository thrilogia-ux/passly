import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>;
}) {
  try {
    const params = await searchParams;
    const session = await auth();

    if (!session?.user) {
      redirect("/login");
    }

    let stats: any = {
      totalEvents: 0,
      totalGuests: 0,
      totalCheckIns: 0,
    };

    try {
      const where: any = {};
      if (session.user.role !== "SUPER_ADMIN" && session.user.organizationId) {
        where.organizationId = session.user.organizationId;
      }

      if (params.eventId) {
        where.id = params.eventId;
      }

      const events = await db.event.findMany({
        where,
        include: {
          _count: {
            select: {
              guestEvents: true,
              checkIns: true,
            },
          },
        },
      });

      stats.totalEvents = events.length;
      stats.totalGuests = events.reduce((sum, e) => sum + e._count.guestEvents, 0);
      stats.totalCheckIns = events.reduce((sum, e) => sum + e._count.checkIns, 0);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Reportes</h1>
          <p className="mt-2 text-gray-600">Métricas y estadísticas del sistema</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalEvents}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Invitados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalGuests}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalCheckIns}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/reports/compare">
                <Button variant="outline">Comparar Eventos</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in ReportsPage:", error);
    return (
      <div>
        <h1 className="text-3xl font-bold">Error</h1>
        <p className="mt-4 text-red-600">Error al cargar la página: {String(error)}</p>
      </div>
    );
  }
}
