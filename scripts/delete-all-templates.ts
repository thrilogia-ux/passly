import { db } from "../lib/db";

async function deleteAllTemplates() {
  try {
    console.log("🗑️  Eliminando todos los templates...");

    // Contar templates antes de eliminar
    const count = await db.invitationTemplate.count();
    console.log(`📊 Templates encontrados: ${count}`);

    if (count === 0) {
      console.log("✅ No hay templates para eliminar");
      return;
    }

    // Eliminar todos los templates
    // Nota: Esto solo funcionará si no tienen invitaciones asociadas
    // Si hay invitaciones, primero necesitamos eliminarlas o desasociarlas
    
    // Primero, intentar eliminar templates sin invitaciones
    const templatesWithoutInvitations = await db.invitationTemplate.findMany({
      where: {
        invitations: {
          none: {},
        },
      },
    });

    console.log(`📋 Templates sin invitaciones: ${templatesWithoutInvitations.length}`);

    // Eliminar templates sin invitaciones
    for (const template of templatesWithoutInvitations) {
      await db.invitationTemplate.delete({
        where: { id: template.id },
      });
      console.log(`✅ Eliminado: ${template.name}`);
    }

    // Para templates con invitaciones, necesitamos eliminarlos de forma forzada
    // Primero eliminamos las invitaciones asociadas
    const templatesWithInvitations = await db.invitationTemplate.findMany({
      include: {
        invitations: true,
      },
    });

    for (const template of templatesWithInvitations) {
      if (template.invitations.length > 0) {
        // Desasociar invitaciones del template
        await db.invitation.updateMany({
          where: { templateId: template.id },
          data: { templateId: null },
        });
        console.log(`🔗 Desasociadas ${template.invitations.length} invitaciones de: ${template.name}`);
        
        // Ahora eliminar el template
        await db.invitationTemplate.delete({
          where: { id: template.id },
        });
        console.log(`✅ Eliminado: ${template.name}`);
      }
    }

    const remaining = await db.invitationTemplate.count();
    console.log(`\n✅ Proceso completado. Templates restantes: ${remaining}`);
  } catch (error) {
    console.error("❌ Error eliminando templates:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

deleteAllTemplates()
  .then(() => {
    console.log("\n✅ Todos los templates han sido eliminados");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
