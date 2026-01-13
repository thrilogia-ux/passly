import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const mercadopago = require("mercadopago");

// Configurar MercadoPago (usar variables de entorno)
if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
  mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
  });
}

const createPaymentSchema = z.object({
  amount: z.number().int().positive(),
  tokens: z.number().int().positive(),
  description: z.string().optional(),
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

    // Crear preferencia de pago en MercadoPago
    const preference = {
      items: [
        {
          title: `${data.tokens} Tokens PASSLY`,
          quantity: 1,
          unit_price: totalAmount,
          currency_id: "USD",
        },
      ],
      payer: {
        email: session.user.email || "",
        name: session.user.name || "",
      },
      back_urls: {
        success: `${process.env.NEXTAUTH_URL || "http://localhost:3002"}/dashboard/tokens?payment=success`,
        failure: `${process.env.NEXTAUTH_URL || "http://localhost:3002"}/dashboard/tokens?payment=failure`,
        pending: `${process.env.NEXTAUTH_URL || "http://localhost:3002"}/dashboard/tokens?payment=pending`,
      },
      auto_return: "approved",
      metadata: {
        organizationId: session.user.organizationId,
        tokens: data.tokens,
        userId: session.user.id,
      },
    };

    const response = await mercadopago.preferences.create(preference);

    return NextResponse.json({
      success: true,
      paymentUrl: response.body.init_point,
      preferenceId: response.body.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating MercadoPago payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Webhook para recibir notificaciones de MercadoPago
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get("payment_id");
    const status = searchParams.get("status");

    if (!paymentId || !status) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Obtener información del pago
    const payment = await mercadopago.payment.findById(paymentId);
    const metadata = payment.body.metadata;

    if (!metadata || !metadata.organizationId || !metadata.tokens) {
      return NextResponse.json({ error: "Invalid payment metadata" }, { status: 400 });
    }

    // Si el pago fue aprobado, agregar tokens
    if (status === "approved" || payment.body.status === "approved") {
      const organization = await db.organization.update({
        where: { id: metadata.organizationId },
        data: {
          tokenBalance: {
            increment: parseInt(metadata.tokens),
          },
        },
      });

      // Registrar transacción
      await db.tokenTransaction.create({
        data: {
          organizationId: metadata.organizationId,
          type: "PURCHASE",
          amount: parseInt(metadata.tokens),
          description: `Purchase via MercadoPago - ${metadata.tokens} tokens`,
          metadata: JSON.stringify({
            paymentId,
            paymentMethod: "mercadopago",
            status,
          }),
        },
      });

      return NextResponse.json({ success: true, message: "Tokens added" });
    }

    return NextResponse.json({ success: true, message: "Payment processed" });
  } catch (error) {
    console.error("Error processing MercadoPago webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
