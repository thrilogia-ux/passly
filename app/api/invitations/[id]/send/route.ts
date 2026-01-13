import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { generateQRToken } from "@/lib/qr/generate";
import { generateInvitationWithQR } from "@/lib/invitations/generate";
import { useTokens } from "@/lib/tokens/use";
import { InvitationStatus } from "@prisma/client";

// Force Node.js runtime to ensure Prisma client works correctly
export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check and use tokens (1 token per invitation)
    try {
      await useTokens(
        session.user.organizationId,
        1,
        `Send invitation ${id}`,
        { invitationId: id }
      );
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Insufficient tokens" },
        { status: 402 } // Payment Required
      );
    }

    let invitation = await db.invitation.findUnique({
      where: { id },
      include: {
        guestEvent: {
          include: {
            guest: true,
            event: true,
            qrCode: true,
          },
        },
        template: true,
      },
    });
    
    // Si no tiene confirmationToken, generarlo
    if (invitation && !invitation.confirmationToken) {
      const { generateConfirmationToken } = await import("@/lib/invitations/tokens");
      invitation = await db.invitation.update({
        where: { id },
        data: {
          confirmationToken: generateConfirmationToken(),
        },
        include: {
          guestEvent: {
            include: {
              guest: true,
              event: true,
              qrCode: true,
            },
          },
          template: true,
        },
      });
    }

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Generate QR token if not exists
    let qrToken = "";
    if (!invitation.guestEvent.qrCode) {
      const result = await generateQRToken(invitation.guestEventId);
      qrToken = result.token;
    } else {
      qrToken = invitation.guestEvent.qrCode.token;
    }

    // Generate invitation with QR embedded
    let htmlContent = "";
    if (invitation.template) {
      htmlContent = await generateInvitationWithQR({
        template: {
          backgroundImage: invitation.template.backgroundImage,
          htmlContent: invitation.template.htmlContent,
          cssContent: invitation.template.cssContent,
          qrPosition: invitation.template.qrPosition
            ? JSON.parse(invitation.template.qrPosition)
            : null,
          qrSize: invitation.template.qrSize,
        },
        qrToken: qrToken,
        confirmationToken: invitation.confirmationToken,
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
    } else if (invitation.emailBody) {
      // Si hay emailBody personalizado, usar template por defecto pero con el body
      htmlContent = await generateInvitationWithQR({
        template: {},
        qrToken: qrToken,
        confirmationToken: invitation.confirmationToken,
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
      // Reemplazar contenido con el emailBody personalizado
      htmlContent = invitation.emailBody.replace(/{{qrImage}}/g, htmlContent);
      htmlContent = htmlContent.replace(/{{rsvpButtons}}/g, htmlContent.includes("{{rsvpButtons}}") ? "" : "");
    } else {
      // Default template
      htmlContent = await generateInvitationWithQR({
        template: {},
        qrToken: qrToken,
        confirmationToken: invitation.confirmationToken,
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

        // Send email
        const emailResult = await sendEmail({
          to: invitation.guestEvent.guest.email,
          subject: invitation.emailSubject || `Invitación a ${invitation.guestEvent.event.name}`,
          html: htmlContent,
        });

        if (!emailResult.success) {
          console.error("❌ Error detallado del email:", {
            to: invitation.guestEvent.guest.email,
            error: emailResult.error,
            details: emailResult.details,
          });
          
          return NextResponse.json(
            { 
              error: `Error al enviar email: ${emailResult.error || "Error desconocido"}`,
              details: emailResult.details || emailResult.error,
              emailError: emailResult.error,
            },
            { status: 500 }
          );
        }

        // Advertir si hay warnings (modo sandbox, etc.)
        if (emailResult.warning) {
          console.warn("⚠️  Advertencia de envío:", emailResult.warning);
        }

    // Update invitation status
    const updatedInvitation = await db.invitation.update({
      where: { id },
      data: {
        status: InvitationStatus.SENT,
        sentAt: new Date(),
      },
    });

    return NextResponse.json(updatedInvitation);
  } catch (error: any) {
    console.error("❌ Error completo enviando invitación:", error);
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