import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGoogleAuthUrl } from "@/lib/integrations/google-calendar";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const authUrl = getGoogleAuthUrl({
      clientId,
      clientSecret,
      redirectUri,
    });

    return NextResponse.json({ authUrl });
  } catch (error: any) {
    console.error("Error generating Google auth URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}