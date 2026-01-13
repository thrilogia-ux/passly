import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const purchaseTokensSchema = z.object({
  amount: z.number().int().positive(),
  paymentMethod: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.organizationId) {
      return NextResponse.json({ error: "No organization assigned" }, { status: 403 });
    }

    // Get organization balance
    const organization = await db.organization.findUnique({
      where: { id: session.user.organizationId },
      include: {
        tokenTransactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({
      balance: organization.tokenBalance,
      transactions: organization.tokenTransactions.map((tx) => ({
        ...tx,
        metadata: tx.metadata ? JSON.parse(tx.metadata) : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = purchaseTokensSchema.parse(body);

    // Calculate cost (ejemplo: $0.10 por token)
    const costPerToken = 0.10;
    const totalCost = data.amount * costPerToken;

    // Aquí integrarías con tu pasarela de pago (Stripe, etc.)
    // Por ahora simulamos la compra

    // Update organization balance
    const organization = await db.organization.update({
      where: { id: session.user.organizationId },
      data: {
        tokenBalance: {
          increment: data.amount,
        },
      },
    });

    // Create transaction record
    await db.tokenTransaction.create({
      data: {
        organizationId: session.user.organizationId,
        type: "PURCHASE",
        amount: data.amount,
        description: `Purchase of ${data.amount} tokens`,
        metadata: JSON.stringify({
          cost: totalCost,
          paymentMethod: data.paymentMethod,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      newBalance: organization.tokenBalance,
      message: `Successfully purchased ${data.amount} tokens`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error purchasing tokens:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
