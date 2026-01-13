import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const compareSchema = z.object({
  eventIds: z.array(z.string()).min(2),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = compareSchema.parse(body);

    const events = await db.event.findMany({
      where: {
        id: { in: data.eventIds },
      },
      include: {
        _count: {
          select: {
            guestEvents: true,
            checkIns: true,
            invitations: true,
          },
        },
        guestEvents: {
          include: {
            guest: true,
            invitation: true,
          },
        },
        checkIns: {
          include: {
            qrCode: {
              include: {
                guestEvent: {
                  include: {
                    guest: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Calculate metrics for each event
    const comparison = events.map((event) => {
      const confirmed = event.guestEvents.filter(
        (ge) => ge.invitation?.status === "CONFIRMED"
      ).length;

      const attendanceRate =
        event._count.guestEvents > 0
          ? (event._count.checkIns / event._count.guestEvents) * 100
          : 0;

      const confirmationRate =
        event._count.guestEvents > 0
          ? (confirmed / event._count.guestEvents) * 100
          : 0;

      // Group check-ins by hour
      const checkInsByHour: Record<number, number> = {};
      event.checkIns.forEach((checkIn) => {
        const hour = new Date(checkIn.checkedInAt).getHours();
        checkInsByHour[hour] = (checkInsByHour[hour] || 0) + 1;
      });

      // Group by guest type
      const byType: Record<string, number> = {};
      event.guestEvents.forEach((ge) => {
        const type = ge.guest.type;
        byType[type] = (byType[type] || 0) + 1;
      });

      return {
        eventId: event.id,
        eventName: event.name,
        eventDate: event.date,
        metrics: {
          totalInvited: event._count.guestEvents,
          confirmed,
          attended: event._count.checkIns,
          noShows: event._count.guestEvents - event._count.checkIns,
          attendanceRate: Number(attendanceRate.toFixed(2)),
          confirmationRate: Number(confirmationRate.toFixed(2)),
        },
        checkInsByHour,
        byType,
      };
    });

    return NextResponse.json({ comparison });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error comparing events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}