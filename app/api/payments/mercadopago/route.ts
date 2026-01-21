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
    const costPerToken = 0.1;
    const totalAmount = data.tokens * costPerToken;

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3002";

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
        success: `${baseUrl}/dashboard/tokens?payment=success`,
        failure: `${baseUrl}/dashboard/tokens?payment=failure`,
        pending: `${baseUrl}/dashboard/tokens?payment=pending`,
      },
      auto_return: "approved",
      notification_url: `${baseUrl}/api/payments/mercadopago`,
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

// Webhook / callback de MercadoPago
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get("payment_id") || searchParams.get("id");
    const statusParam = searchParams.get("status");

    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment_id" }, { status: 400 });
    }

    // Obtener información del pago
    const payment = await mercadopago.payment.findById(paymentId);
    const metadata = payment.body.metadata;

    if (!metadata || !metadata.organizationId || !metadata.tokens) {
      return NextResponse.json({ error: "Invalid payment metadata" }, { status: 400 });
    }

    const status = statusParam || payment.body.status;

    // Si el pago fue aprobado, agregar tokens
    if (status === "approved") {
      const tokensToAdd = parseInt(metadata.tokens, 10);

      await db.organization.update({
        where: { id: metadata.organizationId },
        data: {
          tokenBalance: {
            increment: tokensToAdd,
          },
        },
      });

      // Registrar transacción
      await db.tokenTransaction.create({
        data: {
          organizationId: metadata.organizationId,
          type: "PURCHASE",
          amount: tokensToAdd,
          description: `Purchase via MercadoPago - ${tokensToAdd} tokens`,
          metadata: JSON.stringify({
            paymentId,
            paymentMethod: "mercadopago",
            status,
          }),
        },
      });

      return NextResponse.json({ success: true, message: "Tokens added" });
    }

    return NextResponse.json({
      success: true,
      message: `Payment processed with status: ${status}`,
    });
  } catch (error) {
    console.error("Error processing MercadoPago webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
