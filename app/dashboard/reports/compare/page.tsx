import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CompareReportsPage() {
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
        take: 10,
      });
    } catch (error) {
      console.error("Error fetching events:", error);
    }

    return (
      <div>
        <div className="mb-8">
          <Link href="/dashboard/reports" className="text-sm text-gray-600 hover:text-gray-900">
            ← Volver a Reportes
          </Link>
          <h1 className="mt-2 text-3xl font-bold">Comparar Eventos</h1>
          <p className="mt-2 text-gray-600">Compara métricas entre diferentes eventos</p>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No hay eventos para comparar</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.name}</CardTitle>
                  <CardDescription>
                    {new Date(event.date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Invitados</span>
                      <p className="text-2xl font-bold">{event._count.guestEvents}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Check-ins</span>
                      <p className="text-2xl font-bold">{event._count.checkIns}</p>
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
    console.error("Error in CompareReportsPage:", error);
    return (
      <div>
        <h1 className="text-3xl font-bold">Error</h1>
        <p className="mt-4 text-red-600">Error al cargar la página: {String(error)}</p>
      </div>
    );
  }
}
