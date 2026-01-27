import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MercadoPagoConfig, Payment } from "mercadopago";

// Configurar cliente MercadoPago v2
const getClient = () => {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN no está configurado");
  }
  return new MercadoPagoConfig({ accessToken });
};

// Webhook de MercadoPago (notificaciones IPN)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("📥 MercadoPago webhook received:", JSON.stringify(body, null, 2));

    // MercadoPago envía diferentes tipos de notificaciones
    const { type, data, action } = body;

    // Solo procesamos notificaciones de pago
    if (type !== "payment" && action !== "payment.created" && action !== "payment.updated") {
      console.log("⏭️ Ignoring non-payment notification:", type, action);
      return NextResponse.json({ received: true });
    }

    const paymentId = data?.id;
    if (!paymentId) {
      console.error("❌ No payment ID in webhook");
      return NextResponse.json({ error: "No payment ID" }, { status: 400 });
    }

    // Verificar que MercadoPago esté configurado
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error("❌ MERCADOPAGO_ACCESS_TOKEN no está configurado");
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    // Obtener información del pago desde MercadoPago
    const client = getClient();
    const payment = new Payment(client);

    const paymentInfo = await payment.get({ id: paymentId });
    console.log("📋 Payment info from webhook:", {
      id: paymentInfo.id,
      status: paymentInfo.status,
      metadata: paymentInfo.metadata,
    });

    const metadata = paymentInfo.metadata;

    if (!metadata || !metadata.organizationId || !metadata.tokens) {
      console.error("❌ Invalid payment metadata:", metadata);
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
    }

    // Si el pago fue aprobado, agregar tokens
    if (paymentInfo.status === "approved") {
      const tokensToAdd = parseInt(metadata.tokens, 10);
      const organizationId = metadata.organizationId;

      // Verificar si ya procesamos este pago (evitar duplicados)
      const existingTransaction = await db.tokenTransaction.findFirst({
        where: {
          metadata: {
            contains: paymentId.toString(),
          },
        },
      });

      if (existingTransaction) {
        console.log("⚠️ Payment already processed via webhook:", paymentId);
        return NextResponse.json({ received: true, already_processed: true });
      }

      // Agregar tokens a la organización
      await db.organization.update({
        where: { id: organizationId },
        data: {
          tokenBalance: {
            increment: tokensToAdd,
          },
        },
      });

      // Registrar transacción
      await db.tokenTransaction.create({
        data: {
          organizationId: organizationId,
          type: "PURCHASE",
          amount: tokensToAdd,
          description: `Compra via MercadoPago (webhook) - ${tokensToAdd} tokens`,
          metadata: JSON.stringify({
            paymentId: paymentId.toString(),
            paymentMethod: "mercadopago",
            status: paymentInfo.status,
            source: "webhook",
          }),
        },
      });

      console.log(`✅ Webhook: Added ${tokensToAdd} tokens to organization ${organizationId}`);
    }

    return NextResponse.json({ received: true, status: paymentInfo.status });
  } catch (error: any) {
    console.error("❌ Error processing MercadoPago webhook:", error);
    // Siempre devolver 200 para que MercadoPago no reintente
    return NextResponse.json({ received: true, error: error.message });
  }
}

// MercadoPago también puede hacer GET para verificar el endpoint
export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "mercadopago-webhook" });
}
