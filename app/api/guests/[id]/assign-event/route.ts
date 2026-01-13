import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const assignEventSchema = z.object({
  eventId: z.string(),
  customFields: z.record(z.string(), z.any()).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = assignEventSchema.parse(body);

    // Check if guest exists
    const guest = await db.guest.findUnique({
      where: { id },
    });

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    // Check if event exists
    const event = await db.event.findUnique({
      where: { id: data.eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if already assigned
    const existingGuestEvent = await db.guestEvent.findUnique({
      where: {
        guestId_eventId: {
          guestId: id,
          eventId: data.eventId,
        },
      },
    });

    if (existingGuestEvent) {
      return NextResponse.json(
        { error: "Guest already assigned to this event" },
        { status: 409 }
      );
    }

    const guestEvent = await db.guestEvent.create({
      data: {
        guestId: id,
        eventId: data.eventId,
        customFields: data.customFields || undefined,
      },
      include: {
        guest: true,
        event: true,
      },
    });

    return NextResponse.json(guestEvent, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error assigning guest to event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}