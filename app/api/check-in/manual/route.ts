import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const manualCheckInSchema = z.object({
  guestId: z.string(),
  eventId: z.string(),
  zone: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only staff, organizers and super admin can manually check in
    if (session.user.role !== "STAFF" && session.user.role !== "ORGANIZER" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const data = manualCheckInSchema.parse(body);

    // Find guest event
    const guestEvent = await db.guestEvent.findUnique({
      where: {
        guestId_eventId: {
          guestId: data.guestId,
          eventId: data.eventId,
        },
      },
      include: {
        guest: true,
        event: true,
        qrCode: true,
      },
    });

    if (!guestEvent) {
      return NextResponse.json(
        { error: "Guest not assigned to this event" },
        { status: 404 }
      );
    }

    // Generate QR code if doesn't exist
    let qrCode = guestEvent.qrCode;
    if (!qrCode) {
      const { generateQRToken } = await import("@/lib/qr/generate");
      const { qrCode: newQrCode } = await generateQRToken(guestEvent.id);
      qrCode = newQrCode;
    }

    // Check reentry limits
    const checkInCount = await db.checkIn.count({
      where: {
        qrCodeId: qrCode.id,
        eventId: data.eventId,
      },
    });

    if (!guestEvent.event.allowReentry && checkInCount > 0) {
      return NextResponse.json(
        { error: "Reentry not allowed for this event", alreadyCheckedIn: true },
        { status: 409 }
      );
    }

    if (checkInCount >= guestEvent.event.maxReentries) {
      return NextResponse.json(
        { error: "Maximum reentries reached", alreadyCheckedIn: true },
        { status: 409 }
      );
    }

    // Create manual check-in
    const checkIn = await db.checkIn.create({
      data: {
        qrCodeId: qrCode.id,
        eventId: data.eventId,
        checkedInBy: session.user.id,
        zone: data.zone || "manual",
        notes: data.notes || "Manual check-in",
      },
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
    });

    return NextResponse.json({
      success: true,
      checkIn,
      guest: guestEvent.guest,
      event: guestEvent.event,
      reentry: checkInCount > 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error during manual check-in:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}