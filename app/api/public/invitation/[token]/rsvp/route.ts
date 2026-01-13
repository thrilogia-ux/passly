import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { InvitationStatus } from "@prisma/client";
import { z } from "zod";

const rsvpSchema = z.object({
  response: z.enum(["YES", "NO", "MAYBE"]),
  dietaryRestrictions: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
  additionalGuests: z.number().int().min(0).max(20).optional(),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  
  try {
    const invitation = await db.invitation.findUnique({
      where: { confirmationToken: token },
      include: {
        guestEvent: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitación no encontrada o inválida" }, { status: 404 });
    }

    const body = await request.json();
    const data = rsvpSchema.parse(body);

    // Actualizar invitación
    const updated = await db.invitation.update({
      where: { id: invitation.id },
      data: {
        rsvpResponse: data.response,
        dietaryRestrictions: data.dietaryRestrictions || null,
        accessibilityNeeds: data.accessibilityNeeds || null,
        additionalGuests: data.additionalGuests || 0,
        notes: data.notes || null,
        status: data.response === "YES" ? InvitationStatus.CONFIRMED : 
               data.response === "NO" ? InvitationStatus.REJECTED : 
               InvitationStatus.SENT,
        confirmedAt: data.response === "YES" ? new Date() : null,
        rejectedAt: data.response === "NO" ? new Date() : null,
      },
    });

    // Actualizar customFields en GuestEvent con la información
    const currentCustomFields = (invitation.guestEvent.customFields as any) || {};
    await db.guestEvent.update({
      where: { id: invitation.guestEventId },
      data: {
        customFields: {
          ...currentCustomFields,
          dietaryRestrictions: data.dietaryRestrictions,
          accessibilityNeeds: data.accessibilityNeeds,
          additionalGuests: data.additionalGuests,
          notes: data.notes,
          rsvpResponse: data.response,
          rsvpUpdatedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({ success: true, invitation: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Error de validación", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating RSVP:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
