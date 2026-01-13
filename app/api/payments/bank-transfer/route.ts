import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createTransferSchema = z.object({
  tokens: z.number().int().positive(),
  bankName: z.string(),
  transactionNumber: z.string(),
  amount: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createTransferSchema.parse(body);

    // Calcular precio esperado
    const costPerToken = 0.10;
    const expectedAmount = data.tokens * costPerToken;

    // Crear solicitud de transferencia (pendiente de aprobación)
    const transferRequest = await db.tokenTransaction.create({
      data: {
        organizationId: session.user.organizationId,
        type: "PURCHASE",
        amount: 0, // Se actualizará cuando se apruebe
        description: `Bank transfer request - ${data.tokens} tokens`,
        metadata: JSON.stringify({
          status: "PENDING",
          tokens: data.tokens,
          bankName: data.bankName,
          transactionNumber: data.transactionNumber,
          amount: data.amount,
          expectedAmount,
          userId: session.user.id,
          createdAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Transfer request created. Waiting for approval.",
      requestId: transferRequest.id,
      instructions: {
        bankAccount: process.env.BANK_ACCOUNT || "PASSLY - Account #123456789",
        amount: expectedAmount,
        reference: transferRequest.id,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating bank transfer request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Endpoint para aprobar transferencias (solo para admins)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { requestId, approved } = body;

    // Aprobar solicitud
    const transaction = await db.tokenTransaction.findUnique({
      where: { id: requestId },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (!approved) {
      // Rechazar solicitud
      await db.tokenTransaction.update({
        where: { id: requestId },
        data: {
          metadata: JSON.stringify({
            ...JSON.parse(transaction.metadata || "{}"),
            status: "REJECTED",
          }),
        },
      });

      return NextResponse.json({ success: true, message: "Request rejected" });
    }

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const metadata = JSON.parse(transaction.metadata || "{}");
    const tokens = metadata.tokens;

    // Actualizar balance
    const organization = await db.organization.update({
      where: { id: transaction.organizationId },
      data: {
        tokenBalance: {
          increment: tokens,
        },
      },
    });

    // Actualizar transacción
    await db.tokenTransaction.update({
      where: { id: requestId },
      data: {
        amount: tokens,
        metadata: JSON.stringify({
          ...metadata,
          status: "APPROVED",
          approvedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Transfer approved. Tokens added.",
    });
  } catch (error) {
    console.error("Error approving bank transfer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
