import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyQRToken } from "@/lib/qr/generate";

function validateApiKey(request: NextRequest): { valid: boolean } {
  const apiKey = request.headers.get("X-API-Key");
  return { valid: apiKey === process.env.API_KEY };
}

export async function POST(request: NextRequest) {
  try {
    const authResult = validateApiKey(request);
    
    if (!authResult.valid) {
      return NextResponse.json(
        { error: "Invalid or missing API key" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { token, zone } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Verify QR token
    const verification = await verifyQRToken(token);

    if (!verification.valid) {
      return NextResponse.json(
        { valid: false, error: verification.error },
        { status: 400 }
      );
    }

    const { qrCode, guest, event } = verification;

    // Check if already checked in
    if (!qrCode) {
      return NextResponse.json(
        { error: "QR code not found" },
        { status: 404 }
      );
    }

    const existingCheckIn = await db.checkIn.findFirst({
      where: {
        qrCodeId: qrCode.id,
        eventId: event.id,
      },
      orderBy: {
        checkedInAt: "desc",
      },
    });

    if (existingCheckIn && !event.allowReentry) {
      return NextResponse.json(
        { error: "Reentry not allowed", alreadyCheckedIn: true },
        { status: 409 }
      );
    }

    // Create check-in
    const checkIn = await db.checkIn.create({
      data: {
        qrCodeId: qrCode.id,
        eventId: event.id,
        zone: zone || "general",
      },
    });

    return NextResponse.json({
      success: true,
      checkIn,
      guest: {
        id: guest.id,
        name: guest.name,
        email: guest.email,
      },
      event: {
        id: event.id,
        name: event.name,
      },
      reentry: !!existingCheckIn,
    });
  } catch (error: any) {
    console.error("Error during check-in:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}