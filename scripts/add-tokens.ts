import { db } from "../lib/db";

async function addTokens() {
  try {
    // Buscar la organización demo (o la primera organización disponible)
    const organization = await db.organization.findFirst({
      where: {
        slug: "demo-org",
      },
    });

    if (!organization) {
      console.error("❌ No se encontró la organización 'demo-org'");
      console.log("Organizaciones disponibles:");
      const orgs = await db.organization.findMany();
      orgs.forEach(org => {
        console.log(`  - ${org.name} (${org.slug}) - Tokens actuales: ${org.tokenBalance}`);
      });
      process.exit(1);
    }

    const tokensToAdd = 500;
    const currentBalance = organization.tokenBalance;

    // Actualizar balance
    const updated = await db.organization.update({
      where: { id: organization.id },
      data: {
        tokenBalance: {
          increment: tokensToAdd,
        },
      },
    });

    // Crear transacción de registro
    await db.tokenTransaction.create({
      data: {
        organizationId: organization.id,
        type: "BONUS",
        amount: tokensToAdd,
        description: `Tokens de prueba agregados manualmente`,
        metadata: JSON.stringify({
          source: "manual_add",
          addedBy: "script",
        }),
      },
    });

    console.log("✅ Tokens agregados exitosamente!");
    console.log(`   Organización: ${organization.name}`);
    console.log(`   Tokens anteriores: ${currentBalance}`);
    console.log(`   Tokens agregados: ${tokensToAdd}`);
    console.log(`   Nuevo balance: ${updated.tokenBalance}`);
  } catch (error) {
    console.error("❌ Error al agregar tokens:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

addTokens();
