import { db } from "../lib/db";
import { generateConfirmationToken } from "../lib/invitations/tokens";
import { InvitationStatus } from "@prisma/client";

async function testInvitationCreate() {
  try {
    console.log("🧪 Probando creación de invitación con confirmationToken...");
    
    // Buscar un guestEvent existente
    const guestEvent = await db.guestEvent.findFirst({
      include: {
        guest: true,
        event: true,
      },
    });
    
    if (!guestEvent) {
      console.log("❌ No hay guestEvents en la base de datos");
      console.log("💡 Crea un evento y asigna invitados primero");
      return;
    }
    
    console.log(`✅ GuestEvent encontrado: ${guestEvent.id}`);
    console.log(`   Invitado: ${guestEvent.guest.name}`);
    console.log(`   Evento: ${guestEvent.event.name}`);
    
    // Verificar si ya tiene invitación
    const existing = await db.invitation.findUnique({
      where: { guestEventId: guestEvent.id },
    });
    
    if (existing) {
      console.log(`⚠️  Ya existe una invitación para este guestEvent: ${existing.id}`);
      console.log(`   confirmationToken: ${existing.confirmationToken || "NULL"}`);
      
      // Intentar actualizar con confirmationToken
      if (!existing.confirmationToken) {
        console.log("🔄 Intentando actualizar con confirmationToken...");
        const updated = await db.invitation.update({
          where: { id: existing.id },
          data: {
            confirmationToken: generateConfirmationToken(),
          },
        });
        console.log(`✅ Actualizado! confirmationToken: ${updated.confirmationToken}`);
      }
      return;
    }
    
    // Intentar crear una nueva invitación
    console.log("🔄 Intentando crear nueva invitación...");
    const token = generateConfirmationToken();
    console.log(`   Token generado: ${token.substring(0, 20)}...`);
    
    const invitation = await db.invitation.create({
      data: {
        guestEventId: guestEvent.id,
        eventId: guestEvent.eventId,
        status: InvitationStatus.PENDING,
        confirmationToken: token,
      },
    });
    
    console.log("✅ ¡Invitación creada exitosamente!");
    console.log(`   ID: ${invitation.id}`);
    console.log(`   confirmationToken: ${invitation.confirmationToken}`);
    
    // Limpiar - eliminar la invitación de prueba
    await db.invitation.delete({
      where: { id: invitation.id },
    });
    console.log("🧹 Invitación de prueba eliminada");
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error("❌ Stack:", error.stack);
    console.error("❌ Code:", error.code);
    console.error("❌ Meta:", error.meta);
  } finally {
    await db.$disconnect();
  }
}

testInvitationCreate();
