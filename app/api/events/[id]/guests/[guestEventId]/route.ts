import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; guestEventId: string }> }
) {
  const { id: eventId, guestEventId } = await params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar que el GuestEvent pertenece al evento
    const guestEvent = await db.guestEvent.findUnique({
      where: { id: guestEventId },
      include: { event: true },
    });

    if (!guestEvent) {
      return NextResponse.json({ error: "Guest event not found" }, { status: 404 });
    }

    if (guestEvent.eventId !== eventId) {
      return NextResponse.json(
        { error: "Guest event does not belong to this event" },
        { status: 403 }
      );
    }

    // Verificar permisos (solo el organizador o admin de la organización)
    if (session.user.role !== "SUPER_ADMIN") {
      if (guestEvent.event.organizationId !== session.user.organizationId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Eliminar GuestEvent (esto también eliminará la invitación asociada por cascade)
    await db.guestEvent.delete({
      where: { id: guestEventId },
    });

    return NextResponse.json({ message: "Guest removed from event" });
  } catch (error) {
    console.error("Error removing guest from event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
