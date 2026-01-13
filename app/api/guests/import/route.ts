import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { GuestType } from "@prisma/client";
import { z } from "zod";

// Force Node.js runtime
export const runtime = "nodejs";

const importGuestSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
  type: z.nativeEnum(GuestType).default(GuestType.VIP),
  eventId: z.string().optional(),
  customFields: z.record(z.string(), z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { guests, eventId } = body;

    if (!Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json(
        { error: "Guests array is required" },
        { status: 400 }
      );
    }

    const results = {
      created: 0,
      updated: 0,
      errors: [] as any[],
    };

    for (const guestData of guests) {
      try {
        const data = importGuestSchema.parse(guestData);

        // Check if guest exists
        const existingGuest = await db.guest.findUnique({
          where: { email: data.email },
        });

        let guest;
        if (existingGuest) {
          // Update existing guest
          guest = await db.guest.update({
            where: { id: existingGuest.id },
            data: {
              name: data.name,
              phone: data.phone || existingGuest.phone,
              type: data.type,
            },
          });
          results.updated++;
        } else {
          // Create new guest
          guest = await db.guest.create({
            data: {
              email: data.email,
              name: data.name,
              phone: data.phone,
              type: data.type,
            },
          });
          results.created++;
        }

        // Assign to event if eventId provided
        if (eventId && guest) {
          const existingGuestEvent = await db.guestEvent.findUnique({
            where: {
              guestId_eventId: {
                guestId: guest.id,
                eventId: eventId,
              },
            },
          });

          if (!existingGuestEvent) {
            await db.guestEvent.create({
              data: {
                guestId: guest.id,
                eventId: eventId,
                customFields: data.customFields ? (data.customFields as any) : undefined,
              },
            });
          }
        }
      } catch (error: any) {
        results.errors.push({
          email: guestData.email || "unknown",
          error: error.message || "Unknown error",
        });
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error importing guests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}