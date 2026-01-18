import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { useTokens, checkTokens } from "@/lib/tokens/use";
import { generateConfirmationToken } from "@/lib/invitations/tokens";
import { InvitationStatus } from "@prisma/client";

// Force Node.js runtime to ensure Prisma client works correctly
export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  try {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { templateId, guestEventIds } = body;

    // Obtener evento con guestEvents
    const event = await db.event.findUnique({
      where: { id: eventId },
      include: {
        guestEvents: {
          include: {
            invitation: true,
            guest: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Verificar permisos
    if (session.user.role !== "SUPER_ADMIN" && session.user.organizationId !== event.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Si se especificaron guestEventIds, filtrar solo esos
    let guestsToProcess = event.guestEvents;
    if (guestEventIds && Array.isArray(guestEventIds) && guestEventIds.length > 0) {
      guestsToProcess = event.guestEvents.filter((ge: any) => guestEventIds.includes(ge.id));
    }

    // Separar invitados sin invitación y con invitación pendiente
    const guestsWithoutInvitation = guestsToProcess.filter((ge: any) => !ge.invitation);
    const guestsWithPendingInvitation = guestsToProcess.filter(
      (ge: any) => ge.invitation && ge.invitation.status === InvitationStatus.PENDING
    );

    const totalToProcess = guestsWithoutInvitation.length + guestsWithPendingInvitation.length;

    if (totalToProcess === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        failed: 0,
        message: "No hay invitaciones para enviar",
      });
    }

    // SOLO verificar tokens suficientes (sin descontar todavía)
    try {
      await checkTokens(session.user.organizationId, totalToProcess);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "No tenés los tokens suficientes para enviar las invitaciones. Recargá y volvé a intentar." },
        { status: 402 }
      );
    }

    // Buscar template si no se especificó
    let finalTemplateId = templateId;
    if (!finalTemplateId) {
      const eventTemplate = await db.invitationTemplate.findFirst({
        where: {
          eventId: eventId,
          isActive: true,
        },
        orderBy: { createdAt: "desc" },
      });
      if (eventTemplate) {
        finalTemplateId = eventTemplate.id;
      } else {
        const globalTemplate = await db.invitationTemplate.findFirst({
          where: {
            organizationId: event.organizationId,
            eventId: null,
            isActive: true,
          },
          orderBy: { createdAt: "desc" },
        });
        if (globalTemplate) {
          finalTemplateId = globalTemplate.id;
        }
      }
    }

    const results = { sent: 0, failed: 0, errors: [] as any[] };

    // Crear invitaciones para los que no tienen
    for (const guestEvent of guestsWithoutInvitation) {
      try {
        await db.invitation.create({
          data: {
            guestEventId: guestEvent.id,
            eventId: eventId,
            templateId: finalTemplateId || null,
            status: InvitationStatus.PENDING,
            confirmationToken: generateConfirmationToken(),
          },
        });
      } catch (error: any) {
        results.failed++;
        results.errors.push({ 
          guestId: guestEvent.guestId, 
          guestName: guestEvent.guest.name,
          error: error.message || "Error creating invitation" 
        });
      }
    }

    // Obtener todas las invitaciones pendientes del evento (creadas y existentes)
    // Si se especificaron guestEventIds, filtrar solo esas
    const whereClause: any = {
      eventId: eventId,
      status: InvitationStatus.PENDING,
    };
    
    if (guestEventIds && Array.isArray(guestEventIds) && guestEventIds.length > 0) {
      whereClause.guestEventId = { in: guestEventIds };
    }
    
    const allPendingInvitations = await db.invitation.findMany({
      where: whereClause,
      include: {
        guestEvent: {
          include: {
            guest: true,
            event: true,
          },
        },
        template: true,
      },
    });

    // Enviar todas las invitaciones pendientes
    for (const invitation of allPendingInvitations) {
      try {
        // Importar funciones necesarias
        const { generateQRToken } = await import("@/lib/qr/generate");
        const { generateInvitationWithQR } = await import("@/lib/invitations/generate");
        const { sendEmail } = await import("@/lib/email/send");

        // Obtener guestEvent con qrCode
        const guestEventWithQR = await db.guestEvent.findUnique({
          where: { id: invitation.guestEventId },
          include: {
            qrCode: true,
          },
        });

        // Generar QR token si no existe
        let qrToken = "";
        if (!guestEventWithQR?.qrCode) {
          const result = await generateQRToken(invitation.guestEventId);
          qrToken = result.token;
        } else {
          qrToken = guestEventWithQR.qrCode.token;
        }

        // Asegurar que tenga confirmationToken
        let confirmationToken = invitation.confirmationToken;
        if (!confirmationToken) {
          confirmationToken = generateConfirmationToken();
          await db.invitation.update({
            where: { id: invitation.id },
            data: { confirmationToken },
          });
        }

        // Generar HTML de invitación
        let htmlContent = "";
        if (invitation.template) {
          htmlContent = await generateInvitationWithQR({
            template: {
              backgroundImage: invitation.template.backgroundImage,
              htmlContent: invitation.template.htmlContent,
              cssContent: invitation.template.cssContent,
              qrPosition: invitation.template.qrPosition
                ? JSON.parse(invitation.template.qrPosition as string)
                : null,
              qrSize: invitation.template.qrSize,
            },
            qrToken: qrToken,
            confirmationToken: confirmationToken,
            data: {
              name: invitation.guestEvent.guest.name,
              eventName: invitation.guestEvent.event.name,
              eventDate: new Date(invitation.guestEvent.event.date).toLocaleDateString("es-AR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
              eventLocation: invitation.guestEvent.event.location || "",
            },
          });
        } else {
          // Default template
          htmlContent = await generateInvitationWithQR({
            template: {},
            qrToken: qrToken,
            confirmationToken: confirmationToken,
            data: {
              name: invitation.guestEvent.guest.name,
              eventName: invitation.guestEvent.event.name,
              eventDate: new Date(invitation.guestEvent.event.date).toLocaleDateString("es-AR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
              eventLocation: invitation.guestEvent.event.location || "",
            },
          });
        }

        // Enviar email
        const emailResult = await sendEmail({
          to: invitation.guestEvent.guest.email,
          subject: invitation.emailSubject || `Invitación a ${invitation.guestEvent.event.name}`,
          html: htmlContent,
        });

        if (!emailResult.success) {
          const errorMessage = emailResult.error || "Failed to send email";
          console.error("❌ Error enviando email a:", invitation.guestEvent.guest.email, errorMessage);
          // NO descontar tokens si falla el envío
          throw new Error(`Error al enviar email a ${invitation.guestEvent.guest.email}: ${errorMessage}`);
        }

        // ✅ SOLO AHORA, después de envío exitoso, descontar 1 token
        await useTokens(
          session.user.organizationId,
          1,
          `Send invitation ${invitation.id} for event ${eventId}`,
          { invitationId: invitation.id, eventId }
        );

        // Actualizar estado de invitación
        await db.invitation.update({
          where: { id: invitation.id },
          data: {
            status: InvitationStatus.SENT,
            sentAt: new Date(),
          },
        });

        results.sent++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          invitationId: invitation.id,
          guestId: invitation.guestEvent?.guestId,
          guestName: invitation.guestEvent?.guest?.name || "Unknown",
          error: error.message || "Error sending invitation",
        });
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: `Enviadas: ${results.sent}, Fallidas: ${results.failed}`,
    });
  } catch (error: any) {
    console.error("❌ Error completo en bulk send invitations:", error);
    console.error("❌ Stack trace:", error.stack);
    console.error("❌ Error details:", {
      message: error.message,
      name: error.name,
      code: error.code,
    });
    
    return NextResponse.json(
      { 
        error: error.message || "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
