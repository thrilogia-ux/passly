import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { EventStatus, InvitationStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Solo eventos activos
    const activeEvents = await db.event.findMany({
      where: {
        status: EventStatus.ACTIVE,
        ...(session.user.role !== "SUPER_ADMIN" && session.user.organizationId
          ? { organizationId: session.user.organizationId }
          : {}),
      },
      include: {
        guestEvents: {
          include: {
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
        date: "asc",
      },
    });

    // Calcular estadísticas
    const stats = {
      totalEvents: activeEvents.length,
      totalGuests: activeEvents.reduce((sum, e) => sum + e._count.guestEvents, 0),
      totalCheckIns: activeEvents.reduce((sum, e) => sum + e._count.checkIns, 0),
      totalConfirmed: 0,
      totalRejected: 0,
      totalPending: 0,
      totalSent: 0,
      events: activeEvents.map(event => {
        const confirmed = event.guestEvents.filter(
          ge => ge.invitation?.status === InvitationStatus.CONFIRMED
        ).length;
        const rejected = event.guestEvents.filter(
          ge => ge.invitation?.status === InvitationStatus.REJECTED
        ).length;
        const pending = event.guestEvents.filter(
          ge => !ge.invitation || ge.invitation.status === InvitationStatus.PENDING
        ).length;
        const sent = event.guestEvents.filter(
          ge => ge.invitation?.status === InvitationStatus.SENT
        ).length;

        return {
          id: event.id,
          name: event.name,
          date: event.date,
          location: event.location,
          stats: {
            total: event.guestEvents.length,
            confirmed,
            rejected,
            pending,
            sent,
            checkIns: event._count.checkIns,
          },
        };
      }),
    };

    // Calcular totales globales
    stats.events.forEach(event => {
      stats.totalConfirmed += event.stats.confirmed;
      stats.totalRejected += event.stats.rejected;
      stats.totalPending += event.stats.pending;
      stats.totalSent += event.stats.sent;
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
