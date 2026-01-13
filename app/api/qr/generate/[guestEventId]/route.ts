import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateQRToken, generateQRImage } from "@/lib/qr/generate";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ guestEventId: string }> }
) {
  const { guestEventId } = await params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token, qrCode, expiresAt } = await generateQRToken(guestEventId);
    const qrImage = await generateQRImage(token);

    return NextResponse.json({
      token,
      qrCodeId: qrCode.id,
      qrImage,
      expiresAt,
    });
  } catch (error: any) {
    console.error("Error generating QR:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}