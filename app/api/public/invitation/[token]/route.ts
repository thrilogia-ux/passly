import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  
  try {
    const invitation = await db.invitation.findUnique({
      where: { confirmationToken: token },
      include: {
        guestEvent: {
          include: {
            guest: true,
            event: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitación no encontrada o inválida" }, { status: 404 });
    }

    // Retornar solo datos necesarios (sin información sensible)
    return NextResponse.json({
      id: invitation.id,
      rsvpResponse: invitation.rsvpResponse,
      dietaryRestrictions: invitation.dietaryRestrictions,
      accessibilityNeeds: invitation.accessibilityNeeds,
      additionalGuests: invitation.additionalGuests,
      notes: invitation.notes,
      guestEvent: {
        guest: {
          name: invitation.guestEvent.guest.name,
        },
        event: {
          name: invitation.guestEvent.event.name,
          date: invitation.guestEvent.event.date,
          location: invitation.guestEvent.event.location,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
