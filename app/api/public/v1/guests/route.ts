import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function validateApiKey(request: NextRequest): { valid: boolean; organizationId?: string } {
  const apiKey = request.headers.get("X-API-Key");
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return { valid: false };
  }

  return { valid: true };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = validateApiKey(request);
    
    if (!authResult.valid) {
      return NextResponse.json(
        { error: "Invalid or missing API key" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get("eventId");
    const limit = parseInt(searchParams.get("limit") || "100");

    const where: any = {};
    if (eventId) {
      // Filter guests by event
    }

    const guests = await db.guest.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        type: true,
        createdAt: true,
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ guests });
  } catch (error) {
    console.error("Error fetching guests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
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
    const { email, name, phone, type, eventId } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    // Check for existing guest
    let guest = await db.guest.findUnique({
      where: { email },
    });

    if (!guest) {
      guest = await db.guest.create({
        data: {
          email,
          name,
          phone,
          type: type || "VIP",
        },
      });
    }

    // Assign to event if eventId provided
    if (eventId && guest) {
      await db.guestEvent.upsert({
        where: {
          guestId_eventId: {
            guestId: guest.id,
            eventId,
          },
        },
        create: {
          guestId: guest.id,
          eventId,
        },
        update: {},
      });
    }

    return NextResponse.json({ guest }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating guest:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}