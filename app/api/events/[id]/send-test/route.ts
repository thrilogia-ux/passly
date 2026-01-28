import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateQRDataUrl } from "@/lib/qr/generate";
import { generateInvitationWithQR } from "@/lib/invitations/generate";
import { sendEmail } from "@/lib/email/send";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  
  try {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // El email del organizador es donde se enviará la prueba
    const organizerEmail = session.user.email;
    if (!organizerEmail) {
      return NextResponse.json(
        { error: "No se encontró el email del organizador" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { templateId } = body;

    // Obtener evento
    const event = await db.event.findUnique({
      where: { id: eventId },
      include: {
        guestEvents: {
          include: {
            guest: true,
          },
          take: 1, // Solo necesitamos uno para datos de ejemplo
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    // Verificar permisos
    if (session.user.role !== "SUPER_ADMIN" && session.user.organizationId !== event.organizationId) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    // Buscar template
    let template = null;
    if (templateId) {
      template = await db.invitationTemplate.findUnique({
        where: { id: templateId },
      });
    }
    
    if (!template) {
      // Buscar template del evento
      template = await db.invitationTemplate.findFirst({
        where: {
          eventId: eventId,
          isActive: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }
    
    if (!template) {
      // Buscar template global de la organización
      template = await db.invitationTemplate.findFirst({
        where: {
          organizationId: event.organizationId,
          eventId: null,
          isActive: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Datos de ejemplo para la invitación de prueba
    const sampleGuest = event.guestEvents[0]?.guest;
    const guestName = sampleGuest?.name || "Invitado de Ejemplo";
    
    const eventDate = new Date(event.date).toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Generar QR de prueba (no válido para check-in real)
    const testQrToken = `TEST-${Date.now()}`;
    const testConfirmationToken = `test-confirmation-${Date.now()}`;

    // Generar HTML de invitación
    let htmlContent = "";
    
    if (template) {
      htmlContent = await generateInvitationWithQR({
        template: {
          backgroundImage: template.backgroundImage,
          htmlContent: template.htmlContent,
          cssContent: template.cssContent,
          qrPosition: template.qrPosition
            ? JSON.parse(template.qrPosition as string)
            : null,
          qrSize: template.qrSize,
        },
        qrToken: testQrToken,
        confirmationToken: testConfirmationToken,
        data: {
          name: guestName,
          eventName: event.name,
          eventDate: eventDate,
          eventLocation: event.location || "",
        },
      });
    } else {
      // Template por defecto
      htmlContent = await generateInvitationWithQR({
        template: {},
        qrToken: testQrToken,
        confirmationToken: testConfirmationToken,
        data: {
          name: guestName,
          eventName: event.name,
          eventDate: eventDate,
          eventLocation: event.location || "",
        },
      });
    }

    // Agregar banner de prueba al inicio del email
    const testBanner = `
      <div style="background: linear-gradient(135deg, #ff5040, #ff8a40); color: white; padding: 15px 20px; text-align: center; font-family: Arial, sans-serif; margin-bottom: 20px;">
        <strong>🧪 ESTO ES UNA PRUEBA</strong>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">
          Esta invitación es solo de prueba. El QR no es válido para check-in.
        </p>
      </div>
    `;
    
    // Insertar el banner al inicio del body
    htmlContent = htmlContent.replace(
      /<body[^>]*>/i,
      `$&${testBanner}`
    );

    // Enviar email de prueba
    const emailResult = await sendEmail({
      to: organizerEmail,
      subject: `[PRUEBA] Invitación a ${event.name}`,
      html: htmlContent,
    });

    if (!emailResult.success) {
      console.error("❌ Error enviando email de prueba:", emailResult.error);
      return NextResponse.json(
        { 
          error: "Error al enviar el email de prueba",
          details: emailResult.error,
        },
        { status: 500 }
      );
    }

    console.log(`✅ Email de prueba enviado a ${organizerEmail} para evento ${event.name}`);

    return NextResponse.json({
      success: true,
      message: `Invitación de prueba enviada a ${organizerEmail}`,
      sentTo: organizerEmail,
      templateUsed: template?.name || "Template por defecto",
      guestNameUsed: guestName,
    });

  } catch (error: any) {
    console.error("❌ Error en send-test:", error);
    return NextResponse.json(
      { 
        error: error.message || "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
