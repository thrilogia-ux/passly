import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail, renderInvitationTemplate } from "@/lib/email/send";
import { InvitationStatus } from "@prisma/client";
import { z } from "zod";

const reminderSchema = z.object({
  eventId: z.string(),
  daysBefore: z.number().min(1).max(30).default(1),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = reminderSchema.parse(body);

    const event = await db.event.findUnique({
      where: { id: data.eventId },
      include: {
        guestEvents: {
          include: {
            guest: true,
            invitation: true,
            qrCode: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Calculate target date for reminders
    const targetDate = new Date(event.date);
    targetDate.setDate(targetDate.getDate() - data.daysBefore);
    const now = new Date();

    // Only send to confirmed or sent invitations
    const eligibleInvitations = event.guestEvents.filter(
      (ge) =>
        ge.invitation &&
        (ge.invitation.status === InvitationStatus.CONFIRMED ||
          ge.invitation.status === InvitationStatus.SENT)
    );

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const guestEvent of eligibleInvitations) {
      if (!guestEvent.invitation || !guestEvent.qrCode) continue;

      try {
        const reminderMessage =
          data.message ||
          `Recordatorio: El evento "${event.name}" es en ${data.daysBefore} día(s).`;

        const emailResult = await sendEmail({
          to: guestEvent.guest.email,
          subject: `Recordatorio: ${event.name}`,
          html: `
            <h1>Recordatorio de Evento</h1>
            <p>Hola ${guestEvent.guest.name},</p>
            <p>${reminderMessage}</p>
            <p><strong>Evento:</strong> ${event.name}</p>
            <p><strong>Fecha:</strong> ${new Date(event.date).toLocaleDateString("es-AR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
            ${event.location ? `<p><strong>Ubicación:</strong> ${event.location}</p>` : ""}
            <p>Tu código QR sigue siendo válido.</p>
          `,
        });

        if (emailResult.success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push({
            email: guestEvent.guest.email,
            error: emailResult.error,
          });
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          email: guestEvent.guest.email,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      totalEligible: eligibleInvitations.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error sending reminders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}