import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { GuestType } from "@prisma/client";
import { z } from "zod";

const createGuestSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
  type: z.nativeEnum(GuestType).default(GuestType.VIP),
  tags: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get("eventId");
    const type = searchParams.get("type") as GuestType | null;
    const search = searchParams.get("search");

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const guests = await db.guest.findMany({
      where,
      include: {
        guestEvents: eventId
          ? {
              where: { eventId },
              include: { event: true },
            }
          : {
              include: { event: true },
            },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filter guests by event if eventId is provided
    let filteredGuests = guests;
    if (eventId) {
      filteredGuests = guests.filter((guest) =>
        guest.guestEvents.some((ge) => ge.eventId === eventId)
      );
    }

    return NextResponse.json(filteredGuests);
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
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createGuestSchema.parse(body);
    const eventId = body.eventId; // Opcional: para asignar directamente a un evento

    // Si el email ya existe, usar ese invitado (permitir reutilizar en múltiples eventos)
    const existingGuest = await db.guest.findUnique({
      where: { email: data.email },
    });

    let guest;
    let isNewGuest = false;

    if (existingGuest) {
      // Actualizar datos del invitado existente si es necesario
      guest = await db.guest.update({
        where: { id: existingGuest.id },
        data: {
          name: data.name, // Actualizar nombre si cambió
          phone: data.phone || existingGuest.phone,
          type: data.type,
          tags: data.tags || existingGuest.tags,
        },
      });
    } else {
      // Crear nuevo invitado
      guest = await db.guest.create({
        data,
      });
      isNewGuest = true;
    }

    // Si se proporcionó eventId, asignar al evento (solo si no está ya asignado)
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
          },
        });
      }
    }

    return NextResponse.json({ 
      ...guest, 
      isNewGuest,
      message: existingGuest 
        ? "Invitado existente actualizado y asignado al evento" 
        : "Invitado creado exitosamente"
    }, { status: isNewGuest ? 201 : 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating guest:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}