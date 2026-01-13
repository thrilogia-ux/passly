import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { EventStatus } from "@prisma/client";
import { z } from "zod";

const updateEventSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  location: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED"]).optional(),
  organizerId: z.string().optional(),
  allowReentry: z.boolean().optional(),
  maxReentries: z.number().optional(),
  validFrom: z.string().datetime().optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await db.event.findUnique({
      where: { id },
      include: {
        organization: true,
        organizer: true,
        guestEvents: {
          include: {
            guest: true,
            invitation: {
              include: {
                template: true,
              },
            },
          },
        },
        _count: {
          select: {
            guestEvents: true,
            checkIns: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check permissions
    if (session.user.role !== "SUPER_ADMIN" && session.user.organizationId !== event.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await db.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check permissions
    if (session.user.role !== "SUPER_ADMIN" && session.user.organizationId !== event.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const data = updateEventSchema.parse(body);

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.location !== undefined) updateData.location = data.location;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.organizerId !== undefined) updateData.organizerId = data.organizerId;
    if (data.allowReentry !== undefined) updateData.allowReentry = data.allowReentry;
    if (data.maxReentries !== undefined) updateData.maxReentries = data.maxReentries;
    if (data.validFrom !== undefined) updateData.validFrom = data.validFrom ? new Date(data.validFrom) : null;
    if (data.validUntil !== undefined) updateData.validUntil = data.validUntil ? new Date(data.validUntil) : null;

    const updatedEvent = await db.event.update({
      where: { id },
      data: updateData,
      include: {
        organization: true,
        organizer: true,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues);
      return NextResponse.json(
        { 
          error: "Validation error", 
          details: error.issues,
          message: error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
        },
        { status: 400 }
      );
    }
    console.error("Error updating event:", error);
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await db.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check permissions
    if (session.user.role !== "SUPER_ADMIN" && session.user.organizationId !== event.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Eliminar relaciones manualmente antes de eliminar el evento
    // (SQLite puede tener problemas con cascade delete en todas las relaciones)
    await db.$transaction(async (tx) => {
      // 1. Eliminar check-ins primero (dependen de QRCode)
      await tx.checkIn.deleteMany({
        where: { eventId: id },
      });

      // 2. Eliminar QR codes (tienen relación directa con Event)
      await tx.qRCode.deleteMany({
        where: { eventId: id },
      });

      // 3. Eliminar invitaciones (tienen relación directa con Event y GuestEvent)
      await tx.invitation.deleteMany({
        where: { eventId: id },
      });

      // 4. Eliminar templates del evento (tienen relación directa con Event)
      await tx.invitationTemplate.deleteMany({
        where: { eventId: id },
      });

      // 5. Eliminar guestEvents (tienen cascade desde Event, pero lo hacemos manualmente para estar seguros)
      await tx.guestEvent.deleteMany({
        where: { eventId: id },
      });

      // 6. Finalmente, eliminar el evento
      await tx.event.delete({
        where: { id },
      });
    }, {
      timeout: 10000, // 10 segundos de timeout
    });

    return NextResponse.json({ message: "Event deleted" });
  } catch (error: any) {
    console.error("Error deleting event:", error);
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    });
    
    // Retornar mensaje de error más descriptivo
    const errorMessage = error?.message || "Internal server error";
    return NextResponse.json(
      { 
        error: "Error al eliminar evento",
        details: errorMessage,
        code: error?.code,
      },
      { status: 500 }
    );
  }
}