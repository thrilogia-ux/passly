import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

async function checkSuperAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return null;
  }
  return session;
}

// POST - Cargar tokens de cortesía a una organización
const addTokensSchema = z.object({
  amount: z.number().int().min(1),
  reason: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id: organizationId } = await params;

  try {
    const body = await request.json();
    const data = addTokensSchema.parse(body);

    // Verificar que la organización existe
    const organization = await db.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 });
    }

    // Agregar tokens
    const updatedOrg = await db.organization.update({
      where: { id: organizationId },
      data: {
        tokenBalance: {
          increment: data.amount,
        },
      },
    });

    // Registrar transacción
    await db.tokenTransaction.create({
      data: {
        organizationId: organizationId,
        type: "BONUS",
        amount: data.amount,
        description: `Tokens de cortesía: ${data.reason}`,
        metadata: JSON.stringify({
          addedBy: session.user.id,
          addedByEmail: session.user.email,
          reason: data.reason,
        }),
      },
    });

    console.log(`✅ Admin ${session.user.email} added ${data.amount} tokens to org ${organization.name}`);

    return NextResponse.json({
      success: true,
      message: `Se agregaron ${data.amount} tokens a ${organization.name}`,
      newBalance: updatedOrg.tokenBalance,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error adding tokens:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
