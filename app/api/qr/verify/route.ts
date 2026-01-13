import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyQRToken } from "@/lib/qr/generate";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const result = await verifyQRToken(token);

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      guest: result.guest,
      event: result.event,
      guestEvent: result.guestEvent,
      qrCode: result.qrCode,
    });
  } catch (error: any) {
    console.error("Error verifying QR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}