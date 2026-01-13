import { db } from "@/lib/db";

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
    throw new Error("Organization not found");
  }

  if (org.tokenBalance < amount) {
    throw new Error(`Insufficient tokens. Required: ${amount}, Available: ${org.tokenBalance}`);
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
