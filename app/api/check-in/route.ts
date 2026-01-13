import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifyQRToken } from "@/lib/qr/generate";
import { QRStatus } from "@prisma/client";
import { z } from "zod";

const checkInSchema = z.object({
  token: z.string(),
  zone: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only staff and organizers can check in
    if (session.user.role !== "STAFF" && session.user.role !== "ORGANIZER" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const data = checkInSchema.parse(body);

    // Verify QR token
    const verification = await verifyQRToken(data.token);

    if (!verification.valid) {
      return NextResponse.json(
        { valid: false, error: verification.error },
        { status: 400 }
      );
    }

    const { qrCode, guest, event, guestEvent } = verification;

    if (!qrCode || !event || !guest) {
      return NextResponse.json(
        { error: "Invalid QR code data" },
        { status: 400 }
      );
    }

    // Check if already checked in
    const existingCheckIn = await db.checkIn.findFirst({
      where: {
        qrCodeId: qrCode.id,
        eventId: event.id,
      },
      orderBy: {
        checkedInAt: "desc",
      },
    });

    // Check reentry limits
    if (existingCheckIn && !event.allowReentry) {
      return NextResponse.json(
        { error: "Reentry not allowed for this event", alreadyCheckedIn: true },
        { status: 409 }
      );
    }

    const checkInCount = await db.checkIn.count({
      where: {
        qrCodeId: qrCode.id,
        eventId: event.id,
      },
    });

    if (existingCheckIn && checkInCount >= event.maxReentries) {
      return NextResponse.json(
        { error: "Maximum reentries reached", alreadyCheckedIn: true },
        { status: 409 }
      );
    }

    // Create check-in record
    const checkIn = await db.checkIn.create({
      data: {
        qrCodeId: qrCode.id,
        eventId: event.id,
        checkedInBy: session.user.id,
        zone: data.zone || "general",
        notes: data.notes || null,
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

    // Update QR code status if first check-in
    if (!existingCheckIn) {
      await db.qRCode.update({
        where: { id: qrCode.id },
        data: { status: QRStatus.USED },
      });
    }

    return NextResponse.json({
      success: true,
      checkIn,
      guest,
      event,
      reentry: !!existingCheckIn,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error during check-in:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}