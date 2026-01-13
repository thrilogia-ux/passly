import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    // Get all unique zones for check-ins in this event
    const checkIns = await db.checkIn.findMany({
      where: { eventId },
      select: { zone: true },
      distinct: ["zone"],
    });

    const zones = checkIns
      .map((ci) => ci.zone)
      .filter((zone): zone is string => zone !== null);

    return NextResponse.json({ zones });
  } catch (error) {
    console.error("Error fetching zones:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}