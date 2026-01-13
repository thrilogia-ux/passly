import { db } from "../lib/db";

async function checkDb() {
  try {
    // Intentar crear una invitación de prueba para ver qué campos acepta
    const testInvitation = await db.invitation.findFirst({
      take: 1,
    });
    
    console.log("✅ Base de datos accesible");
    console.log("Ejemplo de invitación:", testInvitation ? "Existe" : "No hay invitaciones");
    
    // Verificar el schema directamente
    const schema = await db.$queryRaw`
      SELECT sql FROM sqlite_master 
      WHERE type='table' AND name='Invitation'
    `;
    
    console.log("\n📋 Schema de la tabla Invitation:");
    console.log(schema);
    
    // Verificar si confirmationToken existe
    const columns = await db.$queryRaw`
      PRAGMA table_info(Invitation)
    `;
    
    console.log("\n📋 Columnas de la tabla Invitation:");
    console.log(columns);
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await db.$disconnect();
  }
}

checkDb();
