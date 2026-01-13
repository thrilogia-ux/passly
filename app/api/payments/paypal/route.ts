import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createPaymentSchema = z.object({
  amount: z.number().int().positive(),
  tokens: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createPaymentSchema.parse(body);

    // Calcular precio
    const costPerToken = 0.10;
    const totalAmount = data.tokens * costPerToken;

    // Crear orden de PayPal
    // Nota: Esto requiere el SDK de PayPal configurado
    // Por ahora retornamos una URL de redirección
    const paypalOrder = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: totalAmount.toFixed(2),
          },
          description: `${data.tokens} Tokens PASSLY`,
          custom_id: `${session.user.organizationId}_${data.tokens}`,
        },
      ],
      application_context: {
        return_url: `${process.env.NEXTAUTH_URL || "http://localhost:3002"}/dashboard/tokens?payment=success&provider=paypal`,
        cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3002"}/dashboard/tokens?payment=cancelled&provider=paypal`,
      },
    };

    // Aquí integrarías con el SDK de PayPal
    // Por ahora retornamos una estructura similar
    return NextResponse.json({
      success: true,
      orderId: `paypal_order_${Date.now()}`,
      paymentUrl: `#`, // Se reemplazará con la URL real de PayPal
      metadata: {
        organizationId: session.user.organizationId,
        tokens: data.tokens,
        amount: totalAmount,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating PayPal payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Webhook para recibir notificaciones de PayPal
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, metadata } = body;

    if (status === "COMPLETED" && metadata) {
      // Agregar tokens a la organización
      const organization = await db.organization.update({
        where: { id: metadata.organizationId },
        data: {
          tokenBalance: {
            increment: metadata.tokens,
          },
        },
      });

      // Registrar transacción
      await db.tokenTransaction.create({
        data: {
          organizationId: metadata.organizationId,
          type: "PURCHASE",
          amount: metadata.tokens,
          description: `Purchase via PayPal - ${metadata.tokens} tokens`,
          metadata: JSON.stringify({
            orderId,
            paymentMethod: "paypal",
            status,
          }),
        },
      });

      return NextResponse.json({ success: true, message: "Tokens added" });
    }

    return NextResponse.json({ success: true, message: "Payment processed" });
  } catch (error) {
    console.error("Error processing PayPal webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
