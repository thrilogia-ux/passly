import { db } from "@/lib/db";

// Función para solo verificar tokens sin descontarlos
export async function checkTokens(
  organizationId: string,
  amount: number
) {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
  });

  if (!org) {
    throw new Error("Organización no encontrada");
  }

  if (org.tokenBalance < amount) {
    throw new Error(`No tenés los tokens suficientes para enviar las invitaciones. Requeridos: ${amount}, Disponibles: ${org.tokenBalance}. Recargá y volvé a intentar.`);
  }

  return {
    hasEnough: true,
    currentBalance: org.tokenBalance,
  };
}

export async function useTokens(
  organizationId: string,
  amount: number,
  description: string,
  metadata?: any
) {
  // Check balance
  const org = await db.organization.findUnique({
    where: { id: organizationId },
  });

  if (!org) {
    throw new Error("Organización no encontrada");
  }

  if (org.tokenBalance < amount) {
    throw new Error(`No tenés los tokens suficientes para enviar las invitaciones. Requeridos: ${amount}, Disponibles: ${org.tokenBalance}. Recargá y volvé a intentar.`);
  }

  // Deduct tokens
  const updated = await db.organization.update({
    where: { id: organizationId },
    data: {
      tokenBalance: {
        decrement: amount,
      },
    },
  });

  // Record transaction
  await db.tokenTransaction.create({
    data: {
      organizationId,
      type: "USAGE",
      amount: -amount,
      description,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });

  return {
    success: true,
    newBalance: updated.tokenBalance,
  };
}
