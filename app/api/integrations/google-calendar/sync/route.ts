import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCalendarEvent } from "@/lib/integrations/google-calendar";
import { z } from "zod";

const syncSchema = z.object({
  eventId: z.string(),
  refreshToken: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = syncSchema.parse(body);

    const event = await db.event.findUnique({
      where: { id: data.eventId },
      include: {
        organization: true,
        guestEvents: {
          include: {
            guest: true,
          },
          take: 100, // Limit attendees
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${request.nextUrl.origin}/api/integrations/google-calendar/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "Google Calendar not configured" },
        { status: 500 }
      );
    }

    // Prepare attendees
    const attendees = event.guestEvents
      .filter((ge) => ge.guest.email)
      .map((ge) => ({ email: ge.guest.email }));

    const result = await createCalendarEvent(
      {
        clientId,
        clientSecret,
        redirectUri,
        refreshToken: data.refreshToken,
      },
      {
        summary: event.name,
        description: event.description || undefined,
        start: {
          dateTime: event.date.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(
            event.date.getTime() + 2 * 60 * 60 * 1000
          ).toISOString(), // Default 2 hours
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        location: event.location || undefined,
        attendees,
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to sync event" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      calendarEventId: result.eventId,
      event: result.event,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error syncing to Google Calendar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}